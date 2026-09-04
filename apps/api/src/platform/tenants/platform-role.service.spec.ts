import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PlatformRoleService } from './platform-role.service';
import { PrismaService } from '../../persistence/prisma.service';
import { PlatformAssignmentStatus, Role } from '@prisma/client';

describe('PlatformRoleService (Phase 0.2 Foundation)', () => {
  let service: PlatformRoleService;
  let prisma: PrismaService;

  function verifyTestDatabaseSafety() {
    const dbUrl = process.env.DATABASE_URL || '';
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv !== 'test' && !dbUrl.includes('test') && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1')) {
      throw new Error(
        `[SAFETY SHIELD] Refusing to run destructive cleanup tests against potential production/staging database.`,
      );
    }
  }

  beforeEach(async () => {
    verifyTestDatabaseSafety();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PlatformRoleService, PrismaService],
    }).compile();

    service = module.get<PlatformRoleService>(PlatformRoleService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.platformUserRoleAssignment.deleteMany();
    await prisma.platformRole.deleteMany();
  });

  afterEach(async () => {
    await prisma.platformUserRoleAssignment.deleteMany();
    await prisma.platformRole.deleteMany();
  });

  it('should reject assigning an inactive PlatformRole', async () => {
    const user = await prisma.user.create({
      data: {
        employeeCode: `EMP-${Date.now()}`,
        fullName: 'Test Assignee',
        email: `assignee-${Date.now()}@example.com`,
        passwordHash: 'hash',
        role: Role.ADMIN,
      },
    });

    await prisma.platformRole.create({
      data: {
        code: 'inactive_role',
        name: 'Inactive Role',
        isActive: false,
      },
    });

    await expect(
      service.assignPlatformRole({
        userId: user.id,
        roleCode: 'inactive_role',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should reject validUntil <= validFrom', async () => {
    const user = await prisma.user.create({
      data: {
        employeeCode: `EMP-${Date.now()}`,
        fullName: 'Test Assignee 2',
        email: `assignee2-${Date.now()}@example.com`,
        passwordHash: 'hash',
        role: Role.ADMIN,
      },
    });

    await prisma.platformRole.create({
      data: {
        code: 'active_role',
        name: 'Active Role',
        isActive: true,
      },
    });

    const now = new Date();
    const past = new Date(now.getTime() - 10000);

    await expect(
      service.assignPlatformRole({
        userId: user.id,
        roleCode: 'active_role',
        validFrom: now,
        validUntil: past,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should filter out expired or future platform roles in getUserPlatformRoles', async () => {
    const user = await prisma.user.create({
      data: {
        employeeCode: `EMP-${Date.now()}`,
        fullName: 'Test Assignee 3',
        email: `assignee3-${Date.now()}@example.com`,
        passwordHash: 'hash',
        role: Role.ADMIN,
      },
    });

    const activeRole = await prisma.platformRole.create({
      data: { code: 'active_role_3', name: 'Active Role 3', isActive: true },
    });

    const expiredRole = await prisma.platformRole.create({
      data: { code: 'expired_role_3', name: 'Expired Role 3', isActive: true },
    });

    const now = new Date();
    const past = new Date(now.getTime() - 100000);
    const wayPast = new Date(now.getTime() - 200000);
    const future = new Date(now.getTime() + 100000);
    const farFuture = new Date(now.getTime() + 200000);

    // Active assignment
    await prisma.platformUserRoleAssignment.create({
      data: {
        userId: user.id,
        platformRoleId: activeRole.id,
        status: PlatformAssignmentStatus.ACTIVE,
        validFrom: past,
        validUntil: future,
      },
    });

    // Expired assignment
    await prisma.platformUserRoleAssignment.create({
      data: {
        userId: user.id,
        platformRoleId: expiredRole.id,
        status: PlatformAssignmentStatus.ACTIVE,
        validFrom: wayPast,
        validUntil: past,
      },
    });

    const userRoles = await service.getUserPlatformRoles(user.id);
    expect(userRoles.length).toBe(1);
    expect(userRoles[0].platformRole.code).toBe('active_role_3');
  });
});
