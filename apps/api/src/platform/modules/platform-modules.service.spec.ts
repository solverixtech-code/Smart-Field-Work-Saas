import { Test, TestingModule } from '@nestjs/testing';
import { PlatformModulesService } from './platform-modules.service';
import { PlatformCatalogSyncService } from './platform-catalog-sync.service';
import { PrismaService } from '../../persistence/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PlatformModuleCategory, PlatformModuleStatus, ModuleFeatureStatus } from '@prisma/client';

describe('PlatformModulesService', () => {
  let service: PlatformModulesService;
  let catalogSyncServiceMock: any;
  let prismaMock: any;

  const mockModule = {
    id: 'mod_1',
    code: 'core_crm',
    name: 'Core CRM & Lead Management',
    description: 'Lead capture and pipeline',
    category: PlatformModuleCategory.CORE,
    status: PlatformModuleStatus.ACTIVE,
    requiredBySystem: true,
    displayOrder: 1,
    internalNotes: 'Initial deployment',
    createdAt: new Date(),
    updatedAt: new Date(),
    features: [
      {
        id: 'feat_1',
        code: 'lead_management',
        implementationKey: 'core_crm.lead_management',
        name: 'Lead Management',
        description: 'Lead workflows',
        status: ModuleFeatureStatus.ACTIVE,
        supportsWeb: true,
        supportsMobile: true,
        supportsApi: true,
        supportsOffline: false,
        displayOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    dependencies: [],
    dependents: [],
  };

  beforeEach(async () => {
    prismaMock = {
      platformModule: {
        findMany: jest.fn().mockResolvedValue([mockModule]),
        findFirst: jest.fn().mockResolvedValue(mockModule),
        findUnique: jest.fn().mockResolvedValue(mockModule),
        count: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...mockModule, ...data })),
      },
      moduleFeature: {
        findMany: jest.fn().mockResolvedValue([mockModule.features[0]]),
        findFirst: jest.fn().mockResolvedValue(mockModule.features[0]),
        count: jest.fn().mockResolvedValue(1),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ ...mockModule.features[0], ...data })),
      },
      auditLog: {
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'audit_1' }),
      },
    };

    catalogSyncServiceMock = {
      getCatalogHealth: jest.fn().mockResolvedValue({
        status: 'HEALTHY',
        registryHash: 'hash123',
        expectedModules: 8,
        databaseModules: 8,
        matchedModules: 8,
        expectedFeatures: 35,
        databaseFeatures: 35,
        matchedFeatures: 35,
        dependencyLinksExpected: 4,
        dependencyLinksDatabase: 4,
        missingModules: [],
        staleModules: [],
        missingFeatures: [],
        staleFeatures: [],
        mismatchedRecords: [],
      }),
      syncCatalog: jest.fn().mockResolvedValue({ status: 'HEALTHY', registryHash: 'hash123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformModulesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: PlatformCatalogSyncService, useValue: catalogSyncServiceMock },
      ],
    }).compile();

    service = module.get<PlatformModulesService>(PlatformModulesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated formatted modules', async () => {
      const result = await service.findAll({});
      expect(result.data.length).toBe(1);
      expect(result.data[0].code).toBe('core_crm');
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return module by ID or code', async () => {
      const res = await service.findOne('core_crm');
      expect(res.code).toBe('core_crm');
    });

    it('should throw NotFoundException if module is missing', async () => {
      prismaMock.platformModule.findFirst.mockResolvedValueOnce(null);
      await expect(service.findOne('unknown_mod')).rejects.toThrow(NotFoundException);
    });
  });

  describe('summary', () => {
    it('should query active modules count and return catalog health summary', async () => {
      prismaMock.platformModule.count.mockResolvedValueOnce(8);
      const res = await service.summary();

      expect(res.activeModules).toBe(8);
      expect(res.catalogHealth.status).toBe('HEALTHY');
      expect(catalogSyncServiceMock.getCatalogHealth).toHaveBeenCalled();
    });
  });

  describe('update module metadata', () => {
    it('should update status and internalNotes for a module', async () => {
      const updated = await service.update('mod_1', {
        status: PlatformModuleStatus.BETA,
        internalNotes: 'Updated for beta testing',
      });

      expect(prismaMock.platformModule.update).toHaveBeenCalledWith({
        where: { id: 'mod_1' },
        data: {
          status: PlatformModuleStatus.BETA,
          internalNotes: 'Updated for beta testing',
        },
      });
      expect(updated).toBeDefined();
    });

    it('should reject updating archived modules', async () => {
      prismaMock.platformModule.findUnique.mockResolvedValueOnce({
        ...mockModule,
        status: PlatformModuleStatus.ARCHIVED,
      });

      await expect(
        service.update('mod_1', { internalNotes: 'New note' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('archive and restore module', () => {
    it('should block archiving system-required module', async () => {
      await expect(service.archive('mod_1')).rejects.toThrow(BadRequestException);
    });

    it('should archive non-system required module', async () => {
      prismaMock.platformModule.findUnique.mockResolvedValueOnce({
        ...mockModule,
        requiredBySystem: false,
      });

      await service.archive('mod_1');
      expect(prismaMock.platformModule.update).toHaveBeenCalledWith({
        where: { id: 'mod_1' },
        data: { status: PlatformModuleStatus.ARCHIVED },
      });
    });

    it('should restore an archived module back to ACTIVE state', async () => {
      await service.restore('mod_1');
      expect(prismaMock.platformModule.update).toHaveBeenCalledWith({
        where: { id: 'mod_1' },
        data: { status: PlatformModuleStatus.ACTIVE },
      });
    });
  });

  describe('feature management', () => {
    it('should query features with implementation maturity decorated', async () => {
      const res = await service.findFeatures({ moduleCode: 'core_crm' });
      expect(res.data.length).toBe(1);
      expect(res.data[0].code).toBe('lead_management');
      expect(res.data[0].maturity).toBeDefined();
    });

    it('should deprecate a feature status to DEPRECATED', async () => {
      const res = await service.deprecateFeature('feat_1');
      expect(prismaMock.moduleFeature.update).toHaveBeenCalledWith({
        where: { id: 'feat_1' },
        data: { status: ModuleFeatureStatus.DEPRECATED },
      });
      expect(res.status).toBe(ModuleFeatureStatus.DEPRECATED);
    });
  });
});
