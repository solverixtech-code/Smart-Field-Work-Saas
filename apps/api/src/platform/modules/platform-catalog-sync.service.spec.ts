import { Test, TestingModule } from '@nestjs/testing';
import { PlatformCatalogSyncService } from './platform-catalog-sync.service';
import { PrismaService } from '../../persistence/prisma.service';
import { MODULE_REGISTRY, FEATURE_REGISTRY } from './feature-registry';
import { PlatformModuleStatus, ModuleFeatureStatus } from '@prisma/client';

describe('PlatformCatalogSyncService', () => {
  let service: PlatformCatalogSyncService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      platformModule: {
        findMany: jest.fn().mockResolvedValue(
          MODULE_REGISTRY.map((m, idx) => ({
            id: `uuid_mod_${idx}`,
            code: m.code,
            name: m.name,
            description: m.description,
            category: m.category,
            status: m.status,
            requiredBySystem: m.requiredBySystem,
            displayOrder: m.displayOrder,
            internalNotes: 'Admin custom note',
            dependencies: (m.dependencyCodes || []).map((depCode) => ({
              dependsOnModule: { code: depCode },
            })),
          })),
        ),
        upsert: jest.fn().mockImplementation(({ where, create, update }) => {
          return Promise.resolve({
            id: `uuid_${where.code}`,
            code: where.code,
            ...(create || update),
          });
        }),
      },
      moduleFeature: {
        findMany: jest.fn().mockResolvedValue(
          FEATURE_REGISTRY.map((f, idx) => ({
            id: `uuid_feat_${idx}`,
            moduleId: `uuid_mod_0`,
            code: f.code,
            implementationKey: f.implementationKey,
            name: f.name,
            description: f.description,
            status: f.status,
            supportsWeb: f.supportsWeb,
            supportsMobile: f.supportsMobile,
            supportsApi: f.supportsApi,
            supportsOffline: f.supportsOffline,
            displayOrder: f.displayOrder,
            internalNotes: 'Admin feature note',
          })),
        ),
        upsert: jest.fn().mockImplementation(({ where, create, update }) => {
          return Promise.resolve({
            id: `uuid_${where.implementationKey}`,
            ...(create || update),
          });
        }),
      },
      moduleDependency: {
        findMany: jest.fn().mockResolvedValue([]),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        create: jest.fn().mockResolvedValue({ id: 'uuid_dep' }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'uuid_audit' }),
      },
      $transaction: jest.fn().mockImplementation((cb) => cb(prismaMock)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformCatalogSyncService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PlatformCatalogSyncService>(PlatformCatalogSyncService);
  });

  describe('validateRegistry', () => {
    it('should validate canonical MODULE_REGISTRY and FEATURE_REGISTRY without throwing errors', () => {
      expect(() => service.validateRegistry()).not.toThrow();
    });

    it('should verify exactly 8 canonical modules and 35 registered features', () => {
      expect(MODULE_REGISTRY.length).toBe(8);
      expect(FEATURE_REGISTRY.length).toBe(35);
    });

    it('should verify all module codes are unique and valid snake_case', () => {
      const codes = MODULE_REGISTRY.map((m) => m.code);
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(codes.length);
      codes.forEach((code) => {
        expect(code).toMatch(/^[a-z0-9_]+$/);
      });
    });

    it('should verify all feature implementation keys are globally unique', () => {
      const keys = FEATURE_REGISTRY.map((f) => f.implementationKey);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe('calculateRegistryHash', () => {
    it('should return a deterministic 64-character SHA-256 hash', () => {
      const hash1 = service.calculateRegistryHash();
      const hash2 = service.calculateRegistryHash();
      expect(hash1).toBeDefined();
      expect(hash1.length).toBe(64);
      expect(hash1).toBe(hash2);
    });
  });

  describe('getCatalogHealth & Drift Detection', () => {
    it('should return HEALTHY catalog status when DB projections match code registry', async () => {
      const health = await service.getCatalogHealth();
      expect(health.status).toBe('HEALTHY');
      expect(health.expectedModules).toBe(8);
      expect(health.expectedFeatures).toBe(35);
      expect(health.missingModules.length).toBe(0);
      expect(health.missingFeatures.length).toBe(0);
    });

    it('should flag UNSYNCED when DB projection is missing registry modules or features', async () => {
      prismaMock.platformModule.findMany.mockResolvedValueOnce([]);
      prismaMock.moduleFeature.findMany.mockResolvedValueOnce([]);

      const health = await service.getCatalogHealth();
      expect(health.status).toBe('UNSYNCED');
      expect(health.missingModules.length).toBe(8);
      expect(health.missingFeatures.length).toBe(35);
    });

    it('should flag DRIFTED and identify stale Modules in database', async () => {
      const dbWithStale = [
        ...MODULE_REGISTRY.map((m, idx) => ({
          id: `uuid_mod_${idx}`,
          code: m.code,
          name: m.name,
          description: m.description,
          category: m.category,
          status: m.status,
          requiredBySystem: m.requiredBySystem,
          displayOrder: m.displayOrder,
          dependencies: (m.dependencyCodes || []).map((depCode) => ({
            dependsOnModule: { code: depCode },
          })),
        })),
        {
          id: 'uuid_stale',
          code: 'old_legacy_module',
          name: 'Legacy Module',
          description: 'Obsolete',
          category: 'CORE',
          status: PlatformModuleStatus.ACTIVE,
          requiredBySystem: false,
          displayOrder: 99,
          dependencies: [],
        },
      ];
      prismaMock.platformModule.findMany.mockResolvedValueOnce(dbWithStale);

      const health = await service.getCatalogHealth();
      expect(health.status).toBe('DRIFTED');
      expect(health.staleModules).toContain('old_legacy_module');
    });

    it('should flag DRIFTED and identify stale Features in database', async () => {
      const dbFeaturesWithStale = [
        ...FEATURE_REGISTRY.map((f, idx) => ({
          id: `uuid_feat_${idx}`,
          moduleId: `uuid_mod_0`,
          code: f.code,
          implementationKey: f.implementationKey,
          name: f.name,
          description: f.description,
          status: f.status,
          supportsWeb: f.supportsWeb,
          supportsMobile: f.supportsMobile,
          supportsApi: f.supportsApi,
          supportsOffline: f.supportsOffline,
          displayOrder: f.displayOrder,
        })),
        {
          id: 'uuid_stale_feat',
          moduleId: 'uuid_mod_0',
          code: 'obsolete_feat',
          implementationKey: 'core_crm.obsolete_feat',
          name: 'Obsolete Feature',
          description: 'Deleted feature',
          status: ModuleFeatureStatus.DEPRECATED,
          supportsWeb: true,
          supportsMobile: true,
          supportsApi: true,
          supportsOffline: false,
          displayOrder: 99,
        },
      ];
      prismaMock.moduleFeature.findMany.mockResolvedValueOnce(dbFeaturesWithStale);

      const health = await service.getCatalogHealth();
      expect(health.status).toBe('DRIFTED');
      expect(health.staleFeatures).toContain('core_crm.obsolete_feat');
    });

    it('should flag DRIFTED on field mismatch between registry and database', async () => {
      const dbWithFieldDrift = MODULE_REGISTRY.map((m, idx) => {
        if (m.code === 'core_crm') {
          return {
            id: `uuid_mod_${idx}`,
            code: m.code,
            name: 'Wrong Name in DB', // Drifted field
            description: m.description,
            category: m.category,
            status: m.status,
            requiredBySystem: m.requiredBySystem,
            displayOrder: m.displayOrder,
            dependencies: [],
          };
        }
        return {
          id: `uuid_mod_${idx}`,
          code: m.code,
          name: m.name,
          description: m.description,
          category: m.category,
          status: m.status,
          requiredBySystem: m.requiredBySystem,
          displayOrder: m.displayOrder,
          dependencies: (m.dependencyCodes || []).map((depCode) => ({
            dependsOnModule: { code: depCode },
          })),
        };
      });
      prismaMock.platformModule.findMany.mockResolvedValueOnce(dbWithFieldDrift);

      const health = await service.getCatalogHealth();
      expect(health.status).toBe('DRIFTED');
      const drift = health.mismatchedRecords.find((r) => r.code === 'core_crm' && r.field === 'name');
      expect(drift).toBeDefined();
      expect(drift?.expected).toBe('Core CRM & Lead Management');
      expect(drift?.actual).toBe('Wrong Name in DB');
    });

    it('should flag DRIFTED on dependency edge set drift', async () => {
      const dbWithDepDrift = MODULE_REGISTRY.map((m, idx) => {
        if (m.code === 'field_visits') {
          return {
            id: `uuid_mod_${idx}`,
            code: m.code,
            name: m.name,
            description: m.description,
            category: m.category,
            status: m.status,
            requiredBySystem: m.requiredBySystem,
            displayOrder: m.displayOrder,
            dependencies: [], // Missing required dependency on core_crm
          };
        }
        return {
          id: `uuid_mod_${idx}`,
          code: m.code,
          name: m.name,
          description: m.description,
          category: m.category,
          status: m.status,
          requiredBySystem: m.requiredBySystem,
          displayOrder: m.displayOrder,
          dependencies: (m.dependencyCodes || []).map((depCode) => ({
            dependsOnModule: { code: depCode },
          })),
        };
      });
      prismaMock.platformModule.findMany.mockResolvedValueOnce(dbWithDepDrift);

      const health = await service.getCatalogHealth();
      expect(health.status).toBe('DRIFTED');
      const depDrift = health.mismatchedRecords.find(
        (r) => r.entity === 'DEPENDENCY' && r.code === 'field_visits',
      );
      expect(depDrift).toBeDefined();
      expect(depDrift?.expected).toEqual(['core_crm']);
      expect(depDrift?.actual).toEqual([]);
    });
  });

  describe('syncCatalog idempotency & metadata preservation', () => {
    it('should execute transactional sync idempotently and preserve admin-owned status/notes', async () => {
      const health1 = await service.syncCatalog();
      expect(health1.status).toBe('HEALTHY');
      expect(prismaMock.$transaction).toHaveBeenCalled();

      // Verify upsert update payloads do NOT attempt to overwrite status or internalNotes
      const moduleUpsertCalls = prismaMock.platformModule.upsert.mock.calls;
      expect(moduleUpsertCalls.length).toBeGreaterThan(0);
      const updateData = moduleUpsertCalls[0][0].update;
      expect(updateData.status).toBeUndefined();
      expect(updateData.internalNotes).toBeUndefined();
    });
  });
});
