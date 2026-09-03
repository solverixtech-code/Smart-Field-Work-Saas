import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { ModuleQueryDto } from './dto/module-query.dto';
import { CreatePlatformModuleDto } from './dto/create-platform-module.dto';
import { UpdatePlatformModuleDto } from './dto/update-platform-module.dto';
import { CreateModuleFeatureDto } from './dto/create-module-feature.dto';
import { UpdateModuleFeatureDto } from './dto/update-module-feature.dto';
import { UpdateModuleDependenciesDto } from './dto/update-module-dependencies.dto';
import { PlatformModuleStatus, ModuleFeatureStatus, Prisma } from '@prisma/client';

@Injectable()
export class PlatformModulesService {
  private readonly logger = new Logger(PlatformModulesService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── Query / Search ─────────────────────────────────────────────────────────

  async findAll(query: ModuleQueryDto) {
    const {
      search,
      category,
      status,
      type,
      page = 1,
      limit = 50,
      sortBy = 'displayOrder',
      sortDirection = 'asc',
    } = query;

    const where: Prisma.PlatformModuleWhereInput = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { code: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    } else {
      // By default hide archived modules unless explicitly queried
      where.status = { not: PlatformModuleStatus.ARCHIVED };
    }

    if (type === 'addon') {
      where.isAddon = true;
    } else if (type === 'standard') {
      where.isAddon = false;
    }

    const total = await this.prisma.platformModule.count({ where });
    const skip = (page - 1) * limit;

    const orderBy: Prisma.PlatformModuleOrderByWithRelationInput = {
      [sortBy]: sortDirection,
    };

    const modules = await this.prisma.platformModule.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        features: {
          orderBy: { displayOrder: 'asc' },
        },
        dependencies: {
          include: {
            dependsOnModule: {
              select: { id: true, code: true, name: true, status: true },
            },
          },
        },
        dependents: {
          include: {
            module: {
              select: { id: true, code: true, name: true, status: true },
            },
          },
        },
      },
    });

    const items = modules.map((m) => this.formatModuleResponse(m));

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(idOrCode: string) {
    const module = await this.prisma.platformModule.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode }],
      },
      include: {
        features: {
          orderBy: { displayOrder: 'asc' },
        },
        dependencies: {
          include: {
            dependsOnModule: {
              select: { id: true, code: true, name: true, status: true },
            },
          },
        },
        dependents: {
          include: {
            module: {
              select: { id: true, code: true, name: true, status: true },
            },
          },
        },
      },
    });

    if (!module) {
      throw new NotFoundException(`Platform module '${idOrCode}' not found`);
    }

    return this.formatModuleResponse(module);
  }

  // ─── Module CRUD ────────────────────────────────────────────────────────────

  async create(dto: CreatePlatformModuleDto, actorUserId?: string, meta?: { ip?: string; userAgent?: string }) {
    // 1. Check unique code
    const existing = await this.prisma.platformModule.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Module with code '${dto.code}' already exists`);
    }

    // 2. Validate dependencies if specified
    const dependencyCodes = dto.dependencyCodes || [];
    if (dependencyCodes.includes(dto.code)) {
      throw new BadRequestException('A module cannot depend on itself');
    }

    let parentModules: { id: string; code: string }[] = [];
    if (dependencyCodes.length > 0) {
      parentModules = await this.prisma.platformModule.findMany({
        where: {
          code: { in: dependencyCodes },
          status: { not: PlatformModuleStatus.ARCHIVED },
        },
        select: { id: true, code: true },
      });

      if (parentModules.length !== dependencyCodes.length) {
        const foundCodes = parentModules.map((p) => p.code);
        const missing = dependencyCodes.filter((c) => !foundCodes.includes(c));
        throw new BadRequestException(`Invalid or archived dependency module codes: ${missing.join(', ')}`);
      }
    }

    // 3. Create module inside transaction
    const created = await this.prisma.$transaction(async (tx) => {
      const mod = await tx.platformModule.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
          category: dto.category,
          status: dto.status || PlatformModuleStatus.ACTIVE,
          isAddon: dto.isAddon ?? false,
          monthlyPrice: dto.monthlyPrice ?? 0,
          requiredBySystem: dto.requiredBySystem ?? false,
          displayOrder: dto.displayOrder ?? 0,
        },
      });

      if (parentModules.length > 0) {
        await tx.moduleDependency.createMany({
          data: parentModules.map((pm) => ({
            moduleId: mod.id,
            dependsOnModuleId: pm.id,
          })),
        });
      }

      return mod;
    });

    const fullModule = await this.findOne(created.id);

    await this.recordAudit({
      action: 'MODULE_CREATED',
      actorUserId,
      entityType: 'MODULE',
      entityId: created.id,
      afterJson: fullModule,
      ...meta,
    });

    return fullModule;
  }

  async update(id: string, dto: UpdatePlatformModuleDto, actorUserId?: string, meta?: { ip?: string; userAgent?: string }) {
    const existing = await this.prisma.platformModule.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Platform module with ID '${id}' not found`);
    }

    if (existing.status === PlatformModuleStatus.ARCHIVED) {
      throw new BadRequestException('Archived modules cannot be updated. Please restore first.');
    }

    // If dependencyCodes were passed in update, validate them
    if (dto.dependencyCodes) {
      await this.validateAndApplyDependencies(id, existing.code, dto.dependencyCodes);
    }

    const updated = await this.prisma.platformModule.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.isAddon !== undefined && { isAddon: dto.isAddon }),
        ...(dto.monthlyPrice !== undefined && { monthlyPrice: dto.monthlyPrice }),
        ...(dto.requiredBySystem !== undefined && { requiredBySystem: dto.requiredBySystem }),
        ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      },
    });

    const fullModule = await this.findOne(updated.id);

    await this.recordAudit({
      action: 'MODULE_UPDATED',
      actorUserId,
      entityType: 'MODULE',
      entityId: id,
      beforeJson: existing,
      afterJson: fullModule,
      ...meta,
    });

    return fullModule;
  }

  async archive(id: string, actorUserId?: string, meta?: { ip?: string; userAgent?: string }) {
    const existing = await this.prisma.platformModule.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Platform module with ID '${id}' not found`);
    }

    if (existing.requiredBySystem) {
      throw new BadRequestException(`System-required module '${existing.name}' (${existing.code}) cannot be archived.`);
    }

    const updated = await this.prisma.platformModule.update({
      where: { id },
      data: { status: PlatformModuleStatus.ARCHIVED },
    });

    const fullModule = await this.findOne(updated.id);

    await this.recordAudit({
      action: 'MODULE_ARCHIVED',
      actorUserId,
      entityType: 'MODULE',
      entityId: id,
      beforeJson: existing,
      afterJson: fullModule,
      ...meta,
    });

    return fullModule;
  }

  async restore(id: string, actorUserId?: string, meta?: { ip?: string; userAgent?: string }) {
    const existing = await this.prisma.platformModule.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Platform module with ID '${id}' not found`);
    }

    const updated = await this.prisma.platformModule.update({
      where: { id },
      data: { status: PlatformModuleStatus.ACTIVE },
    });

    const fullModule = await this.findOne(updated.id);

    await this.recordAudit({
      action: 'MODULE_RESTORED',
      actorUserId,
      entityType: 'MODULE',
      entityId: id,
      beforeJson: existing,
      afterJson: fullModule,
      ...meta,
    });

    return fullModule;
  }

  // ─── Feature Management ─────────────────────────────────────────────────────

  async createFeature(moduleId: string, dto: CreateModuleFeatureDto, actorUserId?: string, meta?: { ip?: string; userAgent?: string }) {
    const module = await this.prisma.platformModule.findUnique({ where: { id: moduleId } });
    if (!module) {
      throw new NotFoundException(`Platform module with ID '${moduleId}' not found`);
    }

    const existingFeat = await this.prisma.moduleFeature.findUnique({
      where: {
        moduleId_code: { moduleId, code: dto.code },
      },
    });

    if (existingFeat) {
      throw new ConflictException(`Feature code '${dto.code}' already exists in module '${module.code}'`);
    }

    const created = await this.prisma.moduleFeature.create({
      data: {
        moduleId,
        code: dto.code,
        name: dto.name,
        description: dto.description,
        status: dto.status || ModuleFeatureStatus.ACTIVE,
        platformSupport: dto.platformSupport ?? true,
        displayOrder: dto.displayOrder ?? 0,
      },
    });

    await this.recordAudit({
      action: 'MODULE_FEATURE_CREATED',
      actorUserId,
      entityType: 'MODULE_FEATURE',
      entityId: created.id,
      afterJson: created,
      ...meta,
    });

    return created;
  }

  async updateFeature(moduleId: string, featureId: string, dto: UpdateModuleFeatureDto, actorUserId?: string, meta?: { ip?: string; userAgent?: string }) {
    const feature = await this.prisma.moduleFeature.findFirst({
      where: { id: featureId, moduleId },
    });

    if (!feature) {
      throw new NotFoundException(`Feature '${featureId}' not found in module '${moduleId}'`);
    }

    const updated = await this.prisma.moduleFeature.update({
      where: { id: featureId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.platformSupport !== undefined && { platformSupport: dto.platformSupport }),
        ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      },
    });

    await this.recordAudit({
      action: 'MODULE_FEATURE_UPDATED',
      actorUserId,
      entityType: 'MODULE_FEATURE',
      entityId: featureId,
      beforeJson: feature,
      afterJson: updated,
      ...meta,
    });

    return updated;
  }

  async deleteFeature(moduleId: string, featureId: string, actorUserId?: string, meta?: { ip?: string; userAgent?: string }) {
    const feature = await this.prisma.moduleFeature.findFirst({
      where: { id: featureId, moduleId },
    });

    if (!feature) {
      throw new NotFoundException(`Feature '${featureId}' not found in module '${moduleId}'`);
    }

    // Per Requirement #3: Soft deprecate feature status instead of physical delete
    const deprecated = await this.prisma.moduleFeature.update({
      where: { id: featureId },
      data: { status: ModuleFeatureStatus.DEPRECATED },
    });

    await this.recordAudit({
      action: 'MODULE_FEATURE_DELETED',
      actorUserId,
      entityType: 'MODULE_FEATURE',
      entityId: featureId,
      beforeJson: feature,
      afterJson: deprecated,
      ...meta,
    });

    return deprecated;
  }

  // ─── Dependencies ───────────────────────────────────────────────────────────

  async updateDependencies(moduleId: string, dto: UpdateModuleDependenciesDto, actorUserId?: string, meta?: { ip?: string; userAgent?: string }) {
    const module = await this.prisma.platformModule.findUnique({ where: { id: moduleId } });
    if (!module) {
      throw new NotFoundException(`Platform module with ID '${moduleId}' not found`);
    }

    await this.validateAndApplyDependencies(moduleId, module.code, dto.dependencyCodes);

    const updated = await this.findOne(moduleId);

    await this.recordAudit({
      action: 'MODULE_DEPENDENCIES_UPDATED',
      actorUserId,
      entityType: 'MODULE',
      entityId: moduleId,
      afterJson: updated,
      ...meta,
    });

    return updated;
  }

  // ─── Private Helpers & Graph Cycle Prevention ───────────────────────────────

  private async validateAndApplyDependencies(targetModuleId: string, targetModuleCode: string, dependencyCodes: string[]) {
    // 1. Remove duplicates
    const uniqueDepCodes = Array.from(new Set(dependencyCodes));

    // 2. Prevent self-dependency
    if (uniqueDepCodes.includes(targetModuleCode)) {
      throw new BadRequestException(`Module '${targetModuleCode}' cannot depend on itself.`);
    }

    if (uniqueDepCodes.length === 0) {
      await this.prisma.moduleDependency.deleteMany({ where: { moduleId: targetModuleId } });
      return;
    }

    // 3. Look up target parent modules
    const parentModules = await this.prisma.platformModule.findMany({
      where: {
        code: { in: uniqueDepCodes },
        status: { not: PlatformModuleStatus.ARCHIVED },
      },
    });

    if (parentModules.length !== uniqueDepCodes.length) {
      const foundCodes = parentModules.map((p) => p.code);
      const missing = uniqueDepCodes.filter((c) => !foundCodes.includes(c));
      throw new BadRequestException(`Invalid or archived dependency module codes: ${missing.join(', ')}`);
    }

    // 4. Cycle Detection Algorithm (DFS Traversal)
    // Check if adding targetModuleId -> parentModuleId creates a cycle:
    // If any parentModule directly or indirectly depends on targetModuleId, it's a cycle!
    const allDependencies = await this.prisma.moduleDependency.findMany({
      include: {
        module: { select: { id: true, code: true } },
        dependsOnModule: { select: { id: true, code: true } },
      },
    });

    // Build adjacency list: node -> array of nodes it depends on
    const adjMap = new Map<string, string[]>();
    for (const dep of allDependencies) {
      if (dep.moduleId === targetModuleId) continue; // Skip existing target deps as we are replacing them
      const list = adjMap.get(dep.moduleId) || [];
      list.push(dep.dependsOnModuleId);
      adjMap.set(dep.moduleId, list);
    }

    // Add proposed edges
    adjMap.set(targetModuleId, parentModules.map((p) => p.id));

    // For each proposed parent, check if targetModuleId is reachable from parent
    for (const parent of parentModules) {
      const visited = new Set<string>();
      const queue = [parent.id];

      while (queue.length > 0) {
        const curr = queue.shift()!;
        if (curr === targetModuleId) {
          throw new UnprocessableEntityException(
            `Circular dependency detected! Module '${targetModuleCode}' cannot depend on '${parent.code}' because '${parent.code}' already depends on '${targetModuleCode}'.`
          );
        }
        if (!visited.has(curr)) {
          visited.add(curr);
          const neighbors = adjMap.get(curr) || [];
          queue.push(...neighbors);
        }
      }
    }

    // 5. Update database dependencies
    await this.prisma.$transaction([
      this.prisma.moduleDependency.deleteMany({ where: { moduleId: targetModuleId } }),
      this.prisma.moduleDependency.createMany({
        data: parentModules.map((p) => ({
          moduleId: targetModuleId,
          dependsOnModuleId: p.id,
        })),
      }),
    ]);
  }

  private formatModuleResponse(m: any) {
    const dependencyCodes = (m.dependencies || []).map((d: any) => d.dependsOnModule.code);
    const dependentCodes = (m.dependents || []).map((d: any) => d.module.code);

    return {
      id: m.id,
      code: m.code,
      name: m.name,
      description: m.description,
      category: m.category,
      status: m.status,
      isAddon: m.isAddon,
      monthlyPrice: m.monthlyPrice,
      requiredBySystem: m.requiredBySystem,
      displayOrder: m.displayOrder,
      features: (m.features || []).map((f: any) => ({
        id: f.id,
        code: f.code,
        name: f.name,
        description: f.description,
        status: f.status,
        platformSupport: f.platformSupport,
        displayOrder: f.displayOrder,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
      dependencyCodes,
      dependentCodes,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  private async recordAudit(input: {
    action: string;
    actorUserId?: string | null;
    entityType: string;
    entityId: string;
    beforeJson?: any;
    afterJson?: any;
    ip?: string | null;
    userAgent?: string | null;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorUserId: input.actorUserId ?? null,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          beforeJson: input.beforeJson ?? null,
          afterJson: input.afterJson ?? null,
          ip: input.ip ?? null,
          userAgent: input.userAgent ?? null,
        },
      });
    } catch (e) {
      this.logger.warn(`Failed to record audit log ${input.action}: ${e instanceof Error ? e.message : e}`);
    }
  }
}
