import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { PlatformCatalogSyncService } from './platform-catalog-sync.service';
import { FEATURE_REGISTRY, FeatureImplementationMaturity } from './feature-registry';
import { ModuleQueryDto } from './dto/module-query.dto';
import { UpdatePlatformModuleDto } from './dto/update-platform-module.dto';
import { UpdateModuleFeatureDto } from './dto/update-module-feature.dto';
import { PlatformModuleStatus, ModuleFeatureStatus, Prisma } from '@prisma/client';

@Injectable()
export class PlatformModulesService {
  private readonly logger = new Logger(PlatformModulesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogSyncService: PlatformCatalogSyncService,
  ) {}

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
    const health = await this.catalogSyncService.getCatalogHealth();
    return {
      totalModules: health.databaseModules,
      activeModules: health.matchedModules,
      registeredFeatures: health.databaseFeatures,
      dependencyLinks: health.dependencyLinksDatabase,
      catalogHealth: health,
      registryHash: health.registryHash,
      expectedModules: health.expectedModules,
      expectedFeatures: health.expectedFeatures,
      driftCount: health.mismatchedRecords.length + health.staleModules.length + health.staleFeatures.length,
    };
  }

  async syncCatalog(actorUserId?: string) {
    return this.catalogSyncService.syncCatalog(actorUserId);
  }

  async dependencyGraph() {
    return this.prisma.platformModule.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        dependencies: {
          select: {
            dependsOnModule: { select: { id: true, code: true, name: true, status: true } },
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async history(moduleId: string) {
    await this.findOne(moduleId);
    return this.prisma.auditLog.findMany({
      where: {
        OR: [
          { entityType: 'MODULE', entityId: moduleId },
          { entityType: 'MODULE_FEATURE', afterJson: { path: ['moduleId'], equals: moduleId } },
        ],
      },
      include: { actorUser: { select: { id: true, fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── Module Metadata Update ──────────────────────────────────────────────────

  async update(id: string, dto: UpdatePlatformModuleDto, actorUserId?: string, meta?: { ip?: string; userAgent?: string }) {
    const existing = await this.prisma.platformModule.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException(`Platform module with ID '${id}' not found`);
    }

    if (existing.status === PlatformModuleStatus.ARCHIVED) {
      throw new BadRequestException('Archived modules cannot be updated. Please restore first.');
    }

    if (dto.status === PlatformModuleStatus.ARCHIVED) {
      throw new BadRequestException('Archive modules through the explicit archive action.');
    }

    const updated = await this.prisma.platformModule.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.status !== undefined && { status: dto.status }),
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
      this.prisma.moduleFeature.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ module: { displayOrder: 'asc' } }, { displayOrder: 'asc' }],
        include: { module: { select: { id: true, code: true, name: true } } },
      }),
    ]);

    const featureMaturityMap = new Map<string, FeatureImplementationMaturity>(
      FEATURE_REGISTRY.map((f) => [f.implementationKey, f.maturity]),
    );

    const items = data.map((feature) => ({
      ...feature,
      maturity: featureMaturityMap.get(feature.implementationKey) || FeatureImplementationMaturity.DECLARED,
      registryMismatch: false,
    }));

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

  async findFeature(featureId: string) {
    const feature = await this.prisma.moduleFeature.findFirst({
      where: { OR: [{ id: featureId }, { implementationKey: featureId }] },
      include: { module: { select: { id: true, code: true, name: true } } },
    });
    if (!feature) throw new NotFoundException(`Feature '${featureId}' not found`);

    const regFeat = FEATURE_REGISTRY.find((f) => f.implementationKey === feature.implementationKey);

    return {
      ...feature,
      maturity: regFeat?.maturity || FeatureImplementationMaturity.DECLARED,
      registryMismatch: false,
    };
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

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private formatModuleResponse(m: any) {
    const dependencyCodes = (m.dependencies || []).map((d: any) => d.dependsOnModule.code);
    const dependentCodes = (m.dependents || []).map((d: any) => d.module.code);

    const featureMaturityMap = new Map<string, FeatureImplementationMaturity>(
      FEATURE_REGISTRY.map((f) => [f.implementationKey, f.maturity]),
    );

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
        maturity: featureMaturityMap.get(f.implementationKey) || FeatureImplementationMaturity.DECLARED,
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
