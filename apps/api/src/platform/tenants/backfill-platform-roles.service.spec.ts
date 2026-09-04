import { Test, TestingModule } from '@nestjs/testing';
import { BackfillPlatformRolesService } from './backfill-platform-roles.service';
import { PlatformRoleService } from './platform-role.service';
import { PrismaService } from '../../persistence/prisma.service';
import { seedPlatformRoles } from '../../../prisma/seeds/platform-roles';
import { Role, PlatformAssignmentStatus } from '@prisma/client';

import { verifyTestDatabaseSafety } from '../../test-utils/test-db-safety';

describe('BackfillPlatformRolesService (Phase 0.2 Foundation)', () => {
  let backfillService: BackfillPlatformRolesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    verifyTestDatabaseSafety();
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackfillPlatformRolesService, PlatformRoleService, PrismaService],
    }).compile();

    backfillService = module.get<BackfillPlatformRolesService>(BackfillPlatformRolesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Seed platform roles
    await seedPlatformRoles(prisma);
  });

  afterEach(async () => {
    await prisma.platformUserRoleAssignment.deleteMany({
      where: {
        user: {
          email: {
            in: ['plat.admin.bf@example.com', 'plat.ops.bf@example.com', 'tenant.user.bf@example.com'],
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['plat.admin.bf@example.com', 'plat.ops.bf@example.com', 'tenant.user.bf@example.com'],
        },
      },
    });
  });

  it('should idempotently backfill PlatformUserRoleAssignment for explicit platform users', async () => {
    const usersBefore = await prisma.user.count();

    // User 1: Explicit PLATFORM_SUPER_ADMIN
    const platAdmin = await prisma.user.create({
      data: {
        employeeCode: 'P-BF-1',
        fullName: 'Platform Admin BF',
        email: 'plat.admin.bf@example.com',
        passwordHash: 'pw',
        role: Role.PLATFORM_SUPER_ADMIN,
      },
    });

    // User 2: Explicit PLATFORM_OPERATIONS_ADMIN
    const platOps = await prisma.user.create({
      data: {
        employeeCode: 'P-BF-2',
        fullName: 'Platform Ops BF',
        email: 'plat.ops.bf@example.com',
        passwordHash: 'pw',
        role: Role.PLATFORM_OPERATIONS_ADMIN,
      },
    });

    // User 3: Legacy single-workspace user (SALES_MANAGER) - should be DEFERRED
    const tenantUser = await prisma.user.create({
      data: {
        employeeCode: 'U-BF-3',
        fullName: 'Tenant User BF',
        email: 'tenant.user.bf@example.com',
        passwordHash: 'pw',
        role: Role.SALES_MANAGER,
      },
    });

    // First run
    const report1 = await backfillService.backfillPlatformRoles();
    expect(report1.usersScanned).toBe(usersBefore + 3);
    expect(report1.explicitPlatformUsers).toBeGreaterThanOrEqual(2);
    expect(report1.platformAssignmentsCreated).toBeGreaterThanOrEqual(2);

    // Assert assignments exist for test users in DB
    const assignments1 = await prisma.platformUserRoleAssignment.findMany({
      where: {
        userId: { in: [platAdmin.id, platOps.id] },
        status: PlatformAssignmentStatus.ACTIVE,
      },
    });
    expect(assignments1.length).toBe(2);

    // Second run (Idempotent check)
    const report2 = await backfillService.backfillPlatformRoles();
    expect(report2.platformAssignmentsCreated).toBe(0);
  });
});
