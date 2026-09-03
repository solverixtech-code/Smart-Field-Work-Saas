import { Test, TestingModule } from '@nestjs/testing';
import { PlatformModulesService } from './platform-modules.service';
import { PrismaService } from '../../persistence/prisma.service';
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PlatformModuleCategory, PlatformModuleStatus, ModuleFeatureStatus } from '@prisma/client';

describe('PlatformModulesService', () => {
  let service: PlatformModulesService;
  let prisma: any;

  const mockModule = {
    id: 'mod_1',
    code: 'core_crm',
    name: 'Core CRM & Lead Management',
    description: 'Lead capture and pipeline',
    category: PlatformModuleCategory.CORE,
    status: PlatformModuleStatus.ACTIVE,
    isAddon: false,
    monthlyPrice: 0,
    requiredBySystem: true,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    features: [],
    dependencies: [],
    dependents: [],
  };

  const mockPrisma = {
    platformModule: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    moduleFeature: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    moduleDependency: {
      findMany: jest.fn(),
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => (typeof cb === 'function' ? cb(mockPrisma) : Promise.all(cb))),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlatformModulesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PlatformModulesService>(PlatformModulesService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated modules', async () => {
      mockPrisma.platformModule.count.mockResolvedValue(1);
      mockPrisma.platformModule.findMany.mockResolvedValue([mockModule]);

      const result = await service.findAll({});
      expect(result.data.length).toBe(1);
      expect(result.data[0].code).toBe('core_crm');
      expect(result.meta.total).toBe(1);
    });
  });

  describe('createModule', () => {
    it('should throw ConflictException if module code already exists', async () => {
      mockPrisma.platformModule.findUnique.mockResolvedValue(mockModule);

      await expect(
        service.create({
          code: 'core_crm',
          name: 'Core CRM',
          description: 'Desc',
          category: PlatformModuleCategory.CORE,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if module depends on itself', async () => {
      mockPrisma.platformModule.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          code: 'self_dep',
          name: 'Self Dep',
          description: 'Desc',
          category: PlatformModuleCategory.CORE,
          dependencyCodes: ['self_dep'],
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('archiveModule', () => {
    it('should block archiving system-required module', async () => {
      mockPrisma.platformModule.findUnique.mockResolvedValue(mockModule);

      await expect(service.archive('mod_1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteFeature', () => {
    it('should soft deprecate feature status to DEPRECATED', async () => {
      mockPrisma.moduleFeature.findFirst.mockResolvedValue({
        id: 'feat_1',
        moduleId: 'mod_1',
        code: 'lead_pipeline',
        name: 'Pipeline',
        status: ModuleFeatureStatus.ACTIVE,
      });

      mockPrisma.moduleFeature.update.mockResolvedValue({
        id: 'feat_1',
        status: ModuleFeatureStatus.DEPRECATED,
      });

      const res = await service.deleteFeature('mod_1', 'feat_1');
      expect(res.status).toBe(ModuleFeatureStatus.DEPRECATED);
      expect(mockPrisma.moduleFeature.update).toHaveBeenCalledWith({
        where: { id: 'feat_1' },
        data: { status: ModuleFeatureStatus.DEPRECATED },
      });
    });
  });

  describe('cycle detection in updateDependencies', () => {
    it('should reject circular dependencies with UnprocessableEntityException', async () => {
      mockPrisma.platformModule.findUnique.mockImplementation(({ where }: any) => {
        if (where.id === 'mod_A') return Promise.resolve({ id: 'mod_A', code: 'mod_a' });
        return Promise.resolve(null);
      });

      mockPrisma.platformModule.findMany.mockResolvedValue([{ id: 'mod_B', code: 'mod_b' }]);

      // Mock existing dependencies: B -> A
      mockPrisma.moduleDependency.findMany.mockResolvedValue([
        { moduleId: 'mod_B', dependsOnModuleId: 'mod_A' },
      ]);

      // Attempt A -> B (which creates A -> B -> A cycle!)
      await expect(service.updateDependencies('mod_A', { dependencyCodes: ['mod_b'] })).rejects.toThrow(
        UnprocessableEntityException,
      );
    });
  });
});
