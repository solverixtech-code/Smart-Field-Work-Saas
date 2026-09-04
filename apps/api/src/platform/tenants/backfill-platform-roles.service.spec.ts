import { Test, TestingModule } from '@nestjs/testing';
import { BackfillPlatformRolesService } from './backfill-platform-roles.service';
import { PlatformRoleService } from './platform-role.service';
import { PrismaService } from '../../persistence/prisma.service';
import { seedPlatformRoles } from '../../../prisma/seeds/platform-roles';
import { Role, PlatformAssignmentStatus } from '@prisma/client';

describe('BackfillPlatformRolesService (Phase 0.2 Foundation)', () => {
  let backfillService: BackfillPlatformRolesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BackfillPlatformRolesService, PlatformRoleService, PrismaService],
    }).compile();

    backfillService = module.get<BackfillPlatformRolesService>(BackfillPlatformRolesService);
    prisma = module.get<PrismaService>(PrismaService);

    // Seed platform roles
    await seedPlatformRoles(prisma);
  });

  afterEach(async () => {
    await prisma.platformUserRoleAssignment.deleteMany();
    await prisma.platformRole.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should idempotently backfill PlatformUserRoleAssignment for explicit platform users', async () => {
    // User 1: Explicit PLATFORM_SUPER_ADMIN
    const platAdmin = await prisma.user.create({
      data: {
        employeeCode: 'P-1',
        fullName: 'Platform Admin',
        email: 'plat.admin@example.com',
        passwordHash: 'pw',
        role: Role.PLATFORM_SUPER_ADMIN,
      },
    });

    // User 2: Explicit PLATFORM_OPERATIONS_ADMIN
    const platOps = await prisma.user.create({
      data: {
        employeeCode: 'P-2',
        fullName: 'Platform Ops',
        email: 'plat.ops@example.com',
        passwordHash: 'pw',
        role: Role.PLATFORM_OPERATIONS_ADMIN,
      },
    });

    // User 3: Legacy single-workspace user (SALES_MANAGER) - should be DEFERRED
    const tenantUser = await prisma.user.create({
      data: {
        employeeCode: 'U-3',
        fullName: 'Tenant User',
        email: 'tenant.user@example.com',
        passwordHash: 'pw',
        role: Role.SALES_MANAGER,
      },
    });

    // First run
    const report1 = await backfillService.backfillPlatformRoles();
    expect(report1.usersScanned).toBe(3);
    expect(report1.explicitPlatformUsers).toBe(2);
    expect(report1.platformAssignmentsCreated).toBe(2);
    expect(report1.legacyTenantUsersDeferred).toBe(1);

    // Assert assignments exist in DB
    const assignments1 = await prisma.platformUserRoleAssignment.findMany({
      where: { status: PlatformAssignmentStatus.ACTIVE },
      include: { platformRole: true },
    });
    expect(assignments1.length).toBe(2);

    // Second run (Idempotent check)
    const report2 = await backfillService.backfillPlatformRoles();
    expect(report2.platformAssignmentsCreated).toBe(0);
    expect(report2.existingAssignmentsPreserved).toBe(2);
  });
});
