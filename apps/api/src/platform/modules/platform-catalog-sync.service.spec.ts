import { Test, TestingModule } from '@nestjs/testing';
import { PlatformCatalogSyncService } from './platform-catalog-sync.service';
import { PrismaService } from '../../persistence/prisma.service';
import { MODULE_REGISTRY, FEATURE_REGISTRY } from './feature-registry';

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
          })),
        ),
        upsert: jest.fn().mockImplementation(({ where, create }) =>
          Promise.resolve({ id: `uuid_${where.code}`, ...create }),
        ),
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
          })),
        ),
        upsert: jest.fn().mockImplementation(({ where, create }) =>
          Promise.resolve({ id: `uuid_${where.implementationKey}`, ...create }),
        ),
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

  describe('getCatalogHealth', () => {
    it('should return HEALTHY catalog status when DB projections match code registry', async () => {
      const health = await service.getCatalogHealth();
      expect(health.status).toBe('HEALTHY');
      expect(health.expectedModules).toBe(8);
      expect(health.expectedFeatures).toBe(35);
      expect(health.missingModules.length).toBe(0);
      expect(health.missingFeatures.length).toBe(0);
    });

    it('should flag UNSYNCED when DB projection is missing registry modules', async () => {
      prismaMock.platformModule.findMany.mockResolvedValueOnce([]);
      prismaMock.moduleFeature.findMany.mockResolvedValueOnce([]);

      const health = await service.getCatalogHealth();
      expect(health.status).toBe('UNSYNCED');
      expect(health.missingModules.length).toBe(8);
    });
  });

  describe('syncCatalog', () => {
    it('should execute transactional sync idempotently', async () => {
      const health1 = await service.syncCatalog();
      expect(health1.status).toBe('HEALTHY');
      expect(prismaMock.$transaction).toHaveBeenCalled();

      const health2 = await service.syncCatalog();
      expect(health2.status).toBe('HEALTHY');
    });
  });
});
