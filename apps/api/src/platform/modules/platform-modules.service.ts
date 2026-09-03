import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnprocessableEntityException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { ModuleQueryDto } from './dto/module-query.dto';
import { CreatePlatformModuleDto } from './dto/create-platform-module.dto';
import { UpdatePlatformModuleDto } from './dto/update-platform-module.dto';
import { UpdateModuleFeatureDto } from './dto/update-module-feature.dto';
import { UpdateModuleDependenciesDto } from './dto/update-module-dependencies.dto';
import { PlatformModuleStatus, ModuleFeatureStatus, Prisma, Role } from '@prisma/client';

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

    const total = await this.prisma.platformModule.count({ where });
    const skip = (page - 1) * limit;

    const allowedSortFields = new Set(['name', 'code', 'category', 'status', 'displayOrder', 'updatedAt', 'createdAt']);
    const orderBy: Prisma.PlatformModuleOrderByWithRelationInput = {
      [allowedSortFields.has(sortBy) ? sortBy : 'displayOrder']: sortDirection,
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

  async summary() {
    const [totalModules, activeModules, registeredFeatures, dependencyLinks] = await Promise.all([
      this.prisma.platformModule.count(),
      this.prisma.platformModule.count({ where: { status: PlatformModuleStatus.ACTIVE } }),
      this.prisma.moduleFeature.count(),
      this.prisma.moduleDependency.count(),
    ]);
    return { totalModules, activeModules, registeredFeatures, dependencyLinks };
  }

  async dependencyGraph() {
    return this.prisma.platformModule.findMany({
      select: { id: true, code: true, name: true, status: true, dependencies: { select: { dependsOnModule: { select: { id: true, code: true, name: true, status: true } } } } },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async history(moduleId: string) {
    await this.findOne(moduleId);
    return this.prisma.auditLog.findMany({
      where: { OR: [{ entityType: 'MODULE', entityId: moduleId }, { entityType: 'MODULE_FEATURE', afterJson: { path: ['moduleId'], equals: moduleId } }] },
      include: { actorUser: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Module CRUD ────────────────────────────────────────────────────────────

  async create(dto: CreatePlatformModuleDto, actorUserId?: string, meta?: { ip?: string; userAgent?: string }, actorRole?: Role) {
    this.assertSystemRequiredAccess(dto.requiredBySystem, actorRole);
    // 1. Check unique code
    const existing = await this.prisma.platformModule.findUnique({
      where: { code: dto.code },
    });

    if (existing) {
      throw new ConflictException(`Module with code '${dto.code}' already exists`);
    }

    // 2. Validate dependencies if specified
    const dependencyCodes = dto.dependencyCodes || [];
    if (new Set(dependencyCodes).size !== dependencyCodes.length) {
      throw new BadRequestException('Duplicate dependency codes are not allowed');
    }
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
          requiredBySystem: dto.requiredBySystem ?? false,
          displayOrder: dto.displayOrder ?? 0,
          internalNotes: dto.internalNotes,
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

  async update(id: string, dto: UpdatePlatformModuleDto, actorUserId?: string, meta?: { ip?: string; userAgent?: string }, actorRole?: Role) {
    const existing = await this.prisma.platformModule.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Platform module with ID '${id}' not found`);
    }

    if (existing.status === PlatformModuleStatus.ARCHIVED) {
      throw new BadRequestException('Archived modules cannot be updated. Please restore first.');
    }

    // If dependencyCodes were passed in update, validate them
    this.assertSystemRequiredAccess(dto.requiredBySystem, actorRole);
    if (dto.status === PlatformModuleStatus.ARCHIVED) {
      throw new BadRequestException('Archive modules through the explicit archive action.');
    }
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
        ...(dto.requiredBySystem !== undefined && { requiredBySystem: dto.requiredBySystem }),
        ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
        ...(dto.internalNotes !== undefined && { internalNotes: dto.internalNotes }),
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

    const activeDependents = await this.prisma.moduleDependency.count({
      where: { dependsOnModuleId: id, module: { status: { not: PlatformModuleStatus.ARCHIVED } } },
    });
    if (activeDependents > 0) {
      throw new ConflictException(`Module '${existing.name}' has active dependent modules and cannot be archived.`);
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

  async findFeatures(query: { search?: string; moduleCode?: string; moduleId?: string; status?: ModuleFeatureStatus; platform?: 'web' | 'mobile' | 'api' | 'offline'; page?: number; limit?: number }) {
    const { search, moduleCode, moduleId, status, platform, page = 1, limit = 50 } = query;
    const where: Prisma.ModuleFeatureWhereInput = {
      ...(status ? { status } : {}),
      ...(moduleId ? { moduleId } : {}),
      ...(moduleCode ? { module: { code: moduleCode } } : {}),
      ...(search?.trim() ? { OR: [{ name: { contains: search.trim(), mode: 'insensitive' } }, { code: { contains: search.trim(), mode: 'insensitive' } }, { implementationKey: { contains: search.trim(), mode: 'insensitive' } }, { description: { contains: search.trim(), mode: 'insensitive' } }] } : {}),
      ...(platform === 'web' ? { supportsWeb: true } : {}),
      ...(platform === 'mobile' ? { supportsMobile: true } : {}),
      ...(platform === 'api' ? { supportsApi: true } : {}),
      ...(platform === 'offline' ? { supportsOffline: true } : {}),
    };
    const [total, data] = await Promise.all([
      this.prisma.moduleFeature.count({ where }),
      this.prisma.moduleFeature.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: [{ module: { displayOrder: 'asc' } }, { displayOrder: 'asc' }], include: { module: { select: { id: true, code: true, name: true } } } }),
    ]);
    return { data: data.map((feature) => ({ ...feature, registryMismatch: false })), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findFeature(featureId: string) {
    const feature = await this.prisma.moduleFeature.findUnique({ where: { id: featureId }, include: { module: { select: { id: true, code: true, name: true } } } });
    if (!feature) throw new NotFoundException(`Feature '${featureId}' not found`);
    return { ...feature, registryMismatch: false };
  }

  async updateFeature(featureId: string, dto: UpdateModuleFeatureDto, actorUserId?: string, meta?: { ip?: string; userAgent?: string }) {
    const feature = await this.prisma.moduleFeature.findFirst({
      where: { id: featureId },
    });

    if (!feature) {
      throw new NotFoundException(`Feature '${featureId}' not found`);
    }

    const updated = await this.prisma.moduleFeature.update({
      where: { id: featureId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
        ...(dto.internalNotes !== undefined && { internalNotes: dto.internalNotes }),
      },
    });

    await this.recordAudit({
      action: dto.status === ModuleFeatureStatus.DEPRECATED ? 'FEATURE_DEPRECATED' : 'FEATURE_METADATA_UPDATED',
      actorUserId,
      entityType: 'MODULE_FEATURE',
      entityId: featureId,
      beforeJson: feature,
      afterJson: updated,
      ...meta,
    });

    return updated;
  }

  async deprecateFeature(featureId: string, actorUserId?: string, meta?: { ip?: string; userAgent?: string }) {
    const feature = await this.prisma.moduleFeature.findFirst({
      where: { id: featureId },
    });

    if (!feature) {
      throw new NotFoundException(`Feature '${featureId}' not found`);
    }

    // Per Requirement #3: Soft deprecate feature status instead of physical delete
    const deprecated = await this.prisma.moduleFeature.update({
      where: { id: featureId },
      data: { status: ModuleFeatureStatus.DEPRECATED },
    });

    await this.recordAudit({
      action: 'FEATURE_DEPRECATED',
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
    if (new Set(dependencyCodes).size !== dependencyCodes.length) {
      throw new BadRequestException('Duplicate dependency codes are not allowed.');
    }
    const uniqueDepCodes = dependencyCodes;

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
      requiredBySystem: m.requiredBySystem,
      displayOrder: m.displayOrder,
      internalNotes: m.internalNotes,
      features: (m.features || []).map((f: any) => ({
        id: f.id,
        code: f.code,
        name: f.name,
        description: f.description,
        status: f.status,
        implementationKey: f.implementationKey,
        supportsWeb: f.supportsWeb,
        supportsMobile: f.supportsMobile,
        supportsApi: f.supportsApi,
        supportsOffline: f.supportsOffline,
        displayOrder: f.displayOrder,
        internalNotes: f.internalNotes,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
      dependencyCodes,
      dependentCodes,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  private assertSystemRequiredAccess(requiredBySystem: boolean | undefined, actorRole: Role | undefined) {
    if (requiredBySystem !== undefined && actorRole !== Role.PLATFORM_SUPER_ADMIN && actorRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only Platform Super Admin can change the system-required module flag.');
    }
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
