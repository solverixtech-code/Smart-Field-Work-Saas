import { auditEvents } from "../../audit/audit-event-writer";
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../persistence/prisma.service';
import {
  MODULE_REGISTRY,
  FEATURE_REGISTRY,
  RegisteredModule,
  RegisteredFeature,
  FeatureImplementationMaturity,
} from './feature-registry';
import { PlatformModuleStatus, ModuleFeatureStatus } from '@prisma/client';

export interface CatalogMismatchedRecord {
  entity: 'MODULE' | 'FEATURE' | 'DEPENDENCY';
  code: string;
  field: string;
  expected: any;
  actual: any;
}

export interface CatalogHealthReport {
  status: 'HEALTHY' | 'DRIFTED' | 'UNSYNCED' | 'INVALID_REGISTRY';
  registryHash: string;
  expectedModules: number;
  databaseModules: number;
  matchedModules: number;
  expectedFeatures: number;
  databaseFeatures: number;
  matchedFeatures: number;
  dependencyLinksExpected: number;
  dependencyLinksDatabase: number;
  missingModules: string[];
  staleModules: string[];
  missingFeatures: string[];
  staleFeatures: string[];
  mismatchedRecords: CatalogMismatchedRecord[];
}

@Injectable()
export class PlatformCatalogSyncService {
  private readonly logger = new Logger(PlatformCatalogSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─── 1. Registry Validation ──────────────────────────────────────────────────

  validateRegistry(): void {
    const moduleCodes = new Set<string>();

    // Validate Modules
    for (const mod of MODULE_REGISTRY) {
      if (!mod.code || !/^[a-z0-9_]+$/.test(mod.code)) {
        throw new BadRequestException(
          `Module code '${mod.code}' must be valid snake_case (lowercase letters, numbers, underscores).`,
        );
      }
      if (moduleCodes.has(mod.code)) {
        throw new BadRequestException(`Duplicate module code found in MODULE_REGISTRY: '${mod.code}'.`);
      }
      moduleCodes.add(mod.code);
    }

    // Validate Module Dependencies (acyclicity, self-dependency, missing targets)
    const graph = new Map<string, string[]>();
    for (const mod of MODULE_REGISTRY) {
      const deps = mod.dependencyCodes || [];
      for (const depCode of deps) {
        if (depCode === mod.code) {
          throw new BadRequestException(`Module '${mod.code}' cannot depend on itself.`);
        }
        if (!moduleCodes.has(depCode)) {
          throw new BadRequestException(
            `Module '${mod.code}' depends on unknown module code '${depCode}'.`,
          );
        }
      }
      graph.set(mod.code, [...deps]);
    }

    // Cycle detection using DFS
    const visited = new Map<string, 'VISITING' | 'VISITED'>();
    const dfs = (node: string, path: string[]) => {
      visited.set(node, 'VISITING');
      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        const state = visited.get(neighbor);
        if (state === 'VISITING') {
          throw new BadRequestException(
            `Cyclic module dependency detected: ${[...path, neighbor].join(' -> ')}`,
          );
        }
        if (!state) {
          dfs(neighbor, [...path, neighbor]);
        }
      }
      visited.set(node, 'VISITED');
    };

    for (const code of moduleCodes) {
      if (!visited.has(code)) {
        dfs(code, [code]);
      }
    }

    // Validate Features
    const implKeys = new Set<string>();
    const modFeatureCodes = new Set<string>();

    for (const feat of FEATURE_REGISTRY) {
      if (!moduleCodes.has(feat.moduleCode)) {
        throw new BadRequestException(
          `Feature '${feat.implementationKey}' references unknown parent moduleCode '${feat.moduleCode}'.`,
        );
      }
      if (implKeys.has(feat.implementationKey)) {
        throw new BadRequestException(
          `Duplicate feature implementationKey found: '${feat.implementationKey}'.`,
        );
      }
      implKeys.add(feat.implementationKey);

      const modCodePair = `${feat.moduleCode}:${feat.code}`;
      if (modFeatureCodes.has(modCodePair)) {
        throw new BadRequestException(
          `Duplicate feature code '${feat.code}' within module '${feat.moduleCode}'.`,
        );
      }
      modFeatureCodes.add(modCodePair);

      if (!Object.values(FeatureImplementationMaturity).includes(feat.maturity)) {
        throw new BadRequestException(
          `Feature '${feat.implementationKey}' has invalid maturity value '${feat.maturity}'.`,
        );
      }
    }
  }

  // ─── 2. Registry Hash Calculation ──────────────────────────────────────────

  calculateRegistryHash(): string {
    const sortedModules = [...MODULE_REGISTRY]
      .sort((a, b) => a.code.localeCompare(b.code))
      .map((m) => ({
        code: m.code,
        name: m.name,
        description: m.description,
        category: m.category,
        requiredBySystem: m.requiredBySystem,
        displayOrder: m.displayOrder,
        dependencyCodes: m.dependencyCodes ? [...m.dependencyCodes].sort() : [],
      }));

    const sortedFeatures = [...FEATURE_REGISTRY]
      .sort((a, b) => a.implementationKey.localeCompare(b.implementationKey))
      .map((f) => ({
        moduleCode: f.moduleCode,
        code: f.code,
        implementationKey: f.implementationKey,
        name: f.name,
        description: f.description,
        supportsWeb: f.supportsWeb,
        supportsMobile: f.supportsMobile,
        supportsApi: f.supportsApi,
        supportsOffline: f.supportsOffline,
        displayOrder: f.displayOrder,
        maturity: f.maturity,
      }));

    const payload = JSON.stringify({ modules: sortedModules, features: sortedFeatures });
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  // ─── 3. Catalog Health Comparison ──────────────────────────────────────────

  async getCatalogHealth(): Promise<CatalogHealthReport> {
    try {
      this.validateRegistry();
    } catch (err: any) {
      return {
        status: 'INVALID_REGISTRY',
        registryHash: '',
        expectedModules: MODULE_REGISTRY.length,
        databaseModules: 0,
        matchedModules: 0,
        expectedFeatures: FEATURE_REGISTRY.length,
        databaseFeatures: 0,
        matchedFeatures: 0,
        dependencyLinksExpected: MODULE_REGISTRY.reduce((acc, m) => acc + (m.dependencyCodes?.length || 0), 0),
        dependencyLinksDatabase: 0,
        missingModules: MODULE_REGISTRY.map((m) => m.code),
        staleModules: [],
        missingFeatures: FEATURE_REGISTRY.map((f) => f.implementationKey),
        staleFeatures: [],
        mismatchedRecords: [
          {
            entity: 'MODULE',
            code: 'registry',
            field: 'validation',
            expected: 'valid',
            actual: err.message,
          },
        ],
      };
    }

    const registryHash = this.calculateRegistryHash();

    const [dbModules, dbFeatures, dbDependencies] = await Promise.all([
      this.prisma.platformModule.findMany({
        include: { features: true, dependencies: { include: { dependsOnModule: true } } },
      }),
      this.prisma.moduleFeature.findMany({ include: { module: true } }),
      this.prisma.moduleDependency.findMany({
        include: { module: true, dependsOnModule: true },
      }),
    ]);

    const regModuleMap = new Map<string, RegisteredModule>(MODULE_REGISTRY.map((m) => [m.code, m]));
    const dbModuleMap = new Map<string, any>(dbModules.map((m) => [m.code, m]));

    const regFeatureMap = new Map<string, RegisteredFeature>(
      FEATURE_REGISTRY.map((f) => [f.implementationKey, f]),
    );
    const dbFeatureMap = new Map<string, any>(dbFeatures.map((f) => [f.implementationKey, f]));

    const missingModules: string[] = [];
    const staleModules: string[] = [];
    const missingFeatures: string[] = [];
    const staleFeatures: string[] = [];
    const mismatchedRecords: CatalogMismatchedRecord[] = [];

    // Check Module presence, field drift, and dependency edge set drift
    let matchedModules = 0;
    for (const regMod of MODULE_REGISTRY) {
      const dbMod = dbModuleMap.get(regMod.code);
      if (!dbMod) {
        missingModules.push(regMod.code);
      } else {
        matchedModules++;
        if (dbMod.name !== regMod.name) {
          mismatchedRecords.push({
            entity: 'MODULE',
            code: regMod.code,
            field: 'name',
            expected: regMod.name,
            actual: dbMod.name,
          });
        }
        if (dbMod.description !== regMod.description) {
          mismatchedRecords.push({
            entity: 'MODULE',
            code: regMod.code,
            field: 'description',
            expected: regMod.description,
            actual: dbMod.description,
          });
        }
        if (dbMod.category !== regMod.category) {
          mismatchedRecords.push({
            entity: 'MODULE',
            code: regMod.code,
            field: 'category',
            expected: regMod.category,
            actual: dbMod.category,
          });
        }
        if (dbMod.requiredBySystem !== regMod.requiredBySystem) {
          mismatchedRecords.push({
            entity: 'MODULE',
            code: regMod.code,
            field: 'requiredBySystem',
            expected: regMod.requiredBySystem,
            actual: dbMod.requiredBySystem,
          });
        }
        if (dbMod.displayOrder !== regMod.displayOrder) {
          mismatchedRecords.push({
            entity: 'MODULE',
            code: regMod.code,
            field: 'displayOrder',
            expected: regMod.displayOrder,
            actual: dbMod.displayOrder,
          });
        }

        // Compare actual dependency edge sets
        const expectedDeps = (regMod.dependencyCodes || []).slice().sort();
        const actualDeps = (dbMod.dependencies || [])
          .map((d: any) => d.dependsOnModule.code)
          .sort();

        if (JSON.stringify(expectedDeps) !== JSON.stringify(actualDeps)) {
          mismatchedRecords.push({
            entity: 'DEPENDENCY',
            code: regMod.code,
            field: 'dependencyCodes',
            expected: expectedDeps,
            actual: actualDeps,
          });
        }
      }
    }

    for (const dbMod of dbModules) {
      if (!regModuleMap.has(dbMod.code)) {
        staleModules.push(dbMod.code);
      }
    }

    // Check Feature presence and code-owned field drift
    let matchedFeatures = 0;
    for (const regFeat of FEATURE_REGISTRY) {
      const dbFeat = dbFeatureMap.get(regFeat.implementationKey);
      if (!dbFeat) {
        missingFeatures.push(regFeat.implementationKey);
      } else {
        matchedFeatures++;
        if (dbFeat.code !== regFeat.code) {
          mismatchedRecords.push({
            entity: 'FEATURE',
            code: regFeat.implementationKey,
            field: 'code',
            expected: regFeat.code,
            actual: dbFeat.code,
          });
        }
        if (dbFeat.name !== regFeat.name) {
          mismatchedRecords.push({
            entity: 'FEATURE',
            code: regFeat.implementationKey,
            field: 'name',
            expected: regFeat.name,
            actual: dbFeat.name,
          });
        }
        if (dbFeat.description !== regFeat.description) {
          mismatchedRecords.push({
            entity: 'FEATURE',
            code: regFeat.implementationKey,
            field: 'description',
            expected: regFeat.description,
            actual: dbFeat.description,
          });
        }
        if (dbFeat.supportsWeb !== regFeat.supportsWeb) {
          mismatchedRecords.push({
            entity: 'FEATURE',
            code: regFeat.implementationKey,
            field: 'supportsWeb',
            expected: regFeat.supportsWeb,
            actual: dbFeat.supportsWeb,
          });
        }
        if (dbFeat.supportsMobile !== regFeat.supportsMobile) {
          mismatchedRecords.push({
            entity: 'FEATURE',
            code: regFeat.implementationKey,
            field: 'supportsMobile',
            expected: regFeat.supportsMobile,
            actual: dbFeat.supportsMobile,
          });
        }
        if (dbFeat.supportsApi !== regFeat.supportsApi) {
          mismatchedRecords.push({
            entity: 'FEATURE',
            code: regFeat.implementationKey,
            field: 'supportsApi',
            expected: regFeat.supportsApi,
            actual: dbFeat.supportsApi,
          });
        }
        if (dbFeat.supportsOffline !== regFeat.supportsOffline) {
          mismatchedRecords.push({
            entity: 'FEATURE',
            code: regFeat.implementationKey,
            field: 'supportsOffline',
            expected: regFeat.supportsOffline,
            actual: dbFeat.supportsOffline,
          });
        }
        if (dbFeat.displayOrder !== regFeat.displayOrder) {
          mismatchedRecords.push({
            entity: 'FEATURE',
            code: regFeat.implementationKey,
            field: 'displayOrder',
            expected: regFeat.displayOrder,
            actual: dbFeat.displayOrder,
          });
        }
        if (dbFeat.module?.code && dbFeat.module.code !== regFeat.moduleCode) {
          mismatchedRecords.push({
            entity: 'FEATURE',
            code: regFeat.implementationKey,
            field: 'moduleCode',
            expected: regFeat.moduleCode,
            actual: dbFeat.module.code,
          });
        }
      }
    }

    for (const dbFeat of dbFeatures) {
      if (!regFeatureMap.has(dbFeat.implementationKey)) {
        staleFeatures.push(dbFeat.implementationKey);
      }
    }

    const dependencyLinksExpected = MODULE_REGISTRY.reduce(
      (acc, m) => acc + (m.dependencyCodes?.length || 0),
      0,
    );
    const dependencyLinksDatabase = dbDependencies.length;

    let status: 'HEALTHY' | 'DRIFTED' | 'UNSYNCED' = 'HEALTHY';
    if (missingModules.length > 0 || missingFeatures.length > 0) {
      status = 'UNSYNCED';
    } else if (mismatchedRecords.length > 0 || staleModules.length > 0 || staleFeatures.length > 0) {
      status = 'DRIFTED';
    }

    return {
      status,
      registryHash,
      expectedModules: MODULE_REGISTRY.length,
      databaseModules: dbModules.length,
      matchedModules,
      expectedFeatures: FEATURE_REGISTRY.length,
      databaseFeatures: dbFeatures.length,
      matchedFeatures,
      dependencyLinksExpected,
      dependencyLinksDatabase,
      missingModules,
      staleModules,
      missingFeatures,
      staleFeatures,
      mismatchedRecords,
    };
  }

  // ─── 4. Idempotent Transactional Sync ───────────────────────────────────────

  async syncCatalog(actorUserId?: string): Promise<CatalogHealthReport> {
    this.validateRegistry();
    const registryHash = this.calculateRegistryHash();
    this.logger.log(`Starting catalog synchronization (Hash: ${registryHash.slice(0, 8)})...`);

    await this.prisma.$transaction(async (tx) => {
      const codeToIdMap = new Map<string, string>();

      // 1. Sync Modules (upsert by code, preserve DB ID & operational status/internalNotes)
      for (const regMod of MODULE_REGISTRY) {
        const mod = await tx.platformModule.upsert({
          where: { code: regMod.code },
          update: {
            name: regMod.name,
            description: regMod.description,
            category: regMod.category,
            requiredBySystem: regMod.requiredBySystem,
            displayOrder: regMod.displayOrder,
          },
          create: {
            code: regMod.code,
            name: regMod.name,
            description: regMod.description,
            category: regMod.category,
            status: regMod.status || PlatformModuleStatus.ACTIVE,
            requiredBySystem: regMod.requiredBySystem,
            displayOrder: regMod.displayOrder,
          },
        });
        codeToIdMap.set(mod.code, mod.id);
      }

      // 2. Sync Features (upsert by implementationKey)
      for (const regFeat of FEATURE_REGISTRY) {
        const moduleId = codeToIdMap.get(regFeat.moduleCode);
        if (!moduleId) {
          throw new BadRequestException(`Parent module '${regFeat.moduleCode}' not found for feature '${regFeat.implementationKey}'`);
        }

        await tx.moduleFeature.upsert({
          where: { implementationKey: regFeat.implementationKey },
          update: {
            moduleId,
            code: regFeat.code,
            name: regFeat.name,
            description: regFeat.description,
            supportsWeb: regFeat.supportsWeb,
            supportsMobile: regFeat.supportsMobile,
            supportsApi: regFeat.supportsApi,
            supportsOffline: regFeat.supportsOffline,
            displayOrder: regFeat.displayOrder,
          },
          create: {
            moduleId,
            code: regFeat.code,
            implementationKey: regFeat.implementationKey,
            name: regFeat.name,
            description: regFeat.description,
            status: regFeat.status || ModuleFeatureStatus.ACTIVE,
            supportsWeb: regFeat.supportsWeb,
            supportsMobile: regFeat.supportsMobile,
            supportsApi: regFeat.supportsApi,
            supportsOffline: regFeat.supportsOffline,
            displayOrder: regFeat.displayOrder,
          },
        });
      }

      // 3. Sync Dependencies (reconcile registry-owned dependency codes)
      for (const regMod of MODULE_REGISTRY) {
        const childId = codeToIdMap.get(regMod.code);
        if (!childId) continue;

        const desiredParentCodes = regMod.dependencyCodes || [];
        const desiredParentIds = desiredParentCodes
          .map((c) => codeToIdMap.get(c))
          .filter((id): id is string => Boolean(id));

        // Get existing dependencies for this module in DB
        const existingDeps = await tx.moduleDependency.findMany({
          where: { moduleId: childId },
          select: { id: true, dependsOnModuleId: true },
        });
        const existingParentIds = new Set(existingDeps.map((d) => d.dependsOnModuleId));

        // Remove stale edges
        const staleDepIds = existingDeps
          .filter((d) => !desiredParentIds.includes(d.dependsOnModuleId))
          .map((d) => d.id);

        if (staleDepIds.length > 0) {
          await tx.moduleDependency.deleteMany({
            where: { id: { in: staleDepIds } },
          });
        }

        // Add missing edges
        for (const parentId of desiredParentIds) {
          if (!existingParentIds.has(parentId)) {
            await tx.moduleDependency.create({
              data: {
                moduleId: childId,
                dependsOnModuleId: parentId,
              },
            });
          }
        }
      }
    });

    // Record Audit Event
    try {
      await auditEvents.write(this.prisma, {
          scope: 'PLATFORM',
          action: 'PLATFORM_CATALOG_SYNCHRONIZED',
          actorUserId: actorUserId ?? null,
          entityType: 'CATALOG',
          entityId: registryHash.slice(0, 16),
          afterJson: {
            registryHash,
            expectedModules: MODULE_REGISTRY.length,
            expectedFeatures: FEATURE_REGISTRY.length,
            syncedAt: new Date().toISOString(),
          },
      });
    } catch (e) {
      this.logger.warn('Catalog audit write failed');
    }

    const health = await this.getCatalogHealth();
    this.logger.log(`Catalog sync completed successfully. Status: ${health.status}`);
    return health;
  }
}
