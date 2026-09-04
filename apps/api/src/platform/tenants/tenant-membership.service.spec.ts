import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { TenantMembershipService } from './tenant-membership.service';
import { TenantService } from './tenant.service';
import { TenantRoleService } from './tenant-role.service';
import { MembershipSelectionService } from './membership-selection.service';
import { PrismaService } from '../../persistence/prisma.service';
import { seedTenantRoleTemplates } from '../../../prisma/seeds/tenant-role-templates';
import { TenantMembershipStatus, TenantStatus, DataScope, Role } from '@prisma/client';

import { verifyTestDatabaseSafety } from '../../test-utils/test-db-safety';

describe('TenantMembershipService & Membership Selection (Phase 0.2 Foundation)', () => {
  let membershipService: TenantMembershipService;
  let tenantService: TenantService;
  let tenantRoleService: TenantRoleService;
  let selectionService: MembershipSelectionService;
  let prisma: PrismaService;

  const getUniqueCode = (prefix: string) => `${prefix.toLowerCase().replace(/_/g, '-')}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  beforeEach(async () => {
    verifyTestDatabaseSafety();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantMembershipService,
        TenantService,
        TenantRoleService,
        MembershipSelectionService,
        PrismaService,
      ],
    }).compile();

    membershipService = module.get<TenantMembershipService>(TenantMembershipService);
    tenantService = module.get<TenantService>(TenantService);
    tenantRoleService = module.get<TenantRoleService>(TenantRoleService);
    selectionService = module.get<MembershipSelectionService>(MembershipSelectionService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clean test data and seed role templates
    await prisma.tenantMembership.deleteMany();
    await prisma.tenantRolePermission.deleteMany();
    await prisma.tenantRole.deleteMany();
    await prisma.tenantAddress.deleteMany();
    await prisma.tenantSettings.deleteMany();
    await prisma.tenantBranding.deleteMany();
    await prisma.tenant.deleteMany();

    await seedTenantRoleTemplates(prisma);
  });

  afterEach(async () => {
    await prisma.tenantMembership.deleteMany();
    await prisma.tenantRolePermission.deleteMany();
    await prisma.tenantRole.deleteMany();
    await prisma.tenantRoleTemplate.deleteMany();
    await prisma.tenantAddress.deleteMany();
    await prisma.tenantSettings.deleteMany();
    await prisma.tenantBranding.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.platformUserRoleAssignment.deleteMany();
  });

  // ─── MANDATORY TEST 1: ONE USER TWO TENANTS ──────────────────────────────────
  it('MANDATORY TEST 1: One User can belong to Tenant A and Tenant B simultaneously without leakage', async () => {
    const empCode = getUniqueCode('GLOB1');
    const user = await prisma.user.create({
      data: {
        employeeCode: empCode,
        fullName: 'Rajesh Sharma',
        email: `${empCode}@example.com`,
        passwordHash: 'hashed_pw',
        role: Role.SALES_MANAGER,
      },
    });

    const tenantA = await tenantService.createTenantFoundation({
      slug: getUniqueCode('pharma'),
      displayName: 'Pharma Corp',
      status: TenantStatus.ACTIVE,
    });

    const tenantB = await tenantService.createTenantFoundation({
      slug: getUniqueCode('solar'),
      displayName: 'Solar Inc',
      status: TenantStatus.ACTIVE,
    });

    const rolesA = await tenantRoleService.getRolesByTenantId(tenantA.id);
    const rolesB = await tenantRoleService.getRolesByTenantId(tenantB.id);

    const salesManagerRoleA = rolesA.find((r) => r.code === 'sales_manager');
    const fieldExecRoleB = rolesB.find((r) => r.code === 'field_executive');

    const memA = await membershipService.createMembership({
      tenantId: tenantA.id,
      userId: user.id,
      tenantRoleId: salesManagerRoleA?.id,
      employeeCode: 'PH-204',
      designation: 'Regional Sales Manager',
      dataScope: DataScope.ALL,
    });

    const memB = await membershipService.createMembership({
      tenantId: tenantB.id,
      userId: user.id,
      tenantRoleId: fieldExecRoleB?.id,
      employeeCode: 'SOL-813',
      designation: 'Senior Solar Executive',
      dataScope: DataScope.ASSIGNED_TEAM,
    });

    expect(memA.tenantId).toBe(tenantA.id);
    expect(memA.userId).toBe(user.id);
    expect(memA.employeeCode).toBe('PH-204');
    expect(memA.designation).toBe('Regional Sales Manager');
    expect(memA.tenantRole?.code).toBe('sales_manager');

    expect(memB.tenantId).toBe(tenantB.id);
    expect(memB.userId).toBe(user.id);
    expect(memB.employeeCode).toBe('SOL-813');
    expect(memB.designation).toBe('Senior Solar Executive');
    expect(memB.tenantRole?.code).toBe('field_executive');

    await membershipService.updateMembershipStatus(memB.id, TenantMembershipStatus.SUSPENDED);

    const reloadedA = (await membershipService.getMembershipsByUserId(user.id)).find((m) => m.id === memA.id);
    const reloadedB = (await membershipService.getMembershipsByUserId(user.id)).find((m) => m.id === memB.id);

    expect(reloadedA?.status).toBe(TenantMembershipStatus.ACTIVE);
    expect(reloadedB?.status).toBe(TenantMembershipStatus.SUSPENDED);
    expect(reloadedA?.employeeCode).toBe('PH-204');
  });

  // ─── MANDATORY TEST 2: SAME EMPLOYEE CODE DIFFERENT TENANTS ────────────────
  it('MANDATORY TEST 2: Same employee code can exist in Tenant A and Tenant B for different memberships', async () => {
    const empCode1 = getUniqueCode('GLOB2A');
    const empCode2 = getUniqueCode('GLOB2B');

    const user1 = await prisma.user.create({
      data: {
        employeeCode: empCode1,
        fullName: 'User One',
        email: `${empCode1}@example.com`,
        passwordHash: 'hash',
        role: Role.ADMIN,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        employeeCode: empCode2,
        fullName: 'User Two',
        email: `${empCode2}@example.com`,
        passwordHash: 'hash',
        role: Role.ADMIN,
      },
    });

    const tenantA = await tenantService.createTenantFoundation({ slug: getUniqueCode('alpha'), displayName: 'Alpha' });
    const tenantB = await tenantService.createTenantFoundation({ slug: getUniqueCode('beta'), displayName: 'Beta' });

    const mem1 = await membershipService.createMembership({
      tenantId: tenantA.id,
      userId: user1.id,
      employeeCode: 'EMP-001',
    });

    const mem2 = await membershipService.createMembership({
      tenantId: tenantB.id,
      userId: user2.id,
      employeeCode: 'EMP-001',
    });

    expect(mem1.employeeCode).toBe('EMP-001');
    expect(mem2.employeeCode).toBe('EMP-001');
    expect(mem1.tenantId).not.toBe(mem2.tenantId);

    await expect(
      membershipService.createMembership({
        tenantId: tenantA.id,
        userId: user2.id,
        employeeCode: 'EMP-001',
      }),
    ).rejects.toThrow(ConflictException);
  });

  // ─── MANDATORY TEST 3: CROSS-TENANT MANAGER ASSIGNMENT REJECTED ────────────
  it('MANDATORY TEST 3: Cross-tenant manager assignment is rejected with BadRequestException', async () => {
    const empCode1 = getUniqueCode('MGR3');
    const empCode2 = getUniqueCode('SUB3');

    const user1 = await prisma.user.create({
      data: { employeeCode: empCode1, fullName: 'Mgr User', email: `${empCode1}@example.com`, passwordHash: 'pw', role: Role.ADMIN },
    });
    const user2 = await prisma.user.create({
      data: { employeeCode: empCode2, fullName: 'Sub User', email: `${empCode2}@example.com`, passwordHash: 'pw', role: Role.ADMIN },
    });

    const tenantA = await tenantService.createTenantFoundation({ slug: getUniqueCode('t-a3'), displayName: 'Tenant A' });
    const tenantB = await tenantService.createTenantFoundation({ slug: getUniqueCode('t-b3'), displayName: 'Tenant B' });

    const mgrMemB = await membershipService.createMembership({
      tenantId: tenantB.id,
      userId: user1.id,
    });

    await expect(
      membershipService.createMembership({
        tenantId: tenantA.id,
        userId: user2.id,
        managerMembershipId: mgrMemB.id,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // ─── MANDATORY TEST 4: CROSS-TENANT ROLE ASSIGNMENT REJECTED ───────────────
  it('MANDATORY TEST 4: Cross-tenant role assignment is rejected with BadRequestException', async () => {
    const empCode = getUniqueCode('USER4');
    const user = await prisma.user.create({
      data: { employeeCode: empCode, fullName: 'Test User', email: `${empCode}@example.com`, passwordHash: 'pw', role: Role.ADMIN },
    });

    const tenantA = await tenantService.createTenantFoundation({ slug: getUniqueCode('t-a4'), displayName: 'Tenant A2' });
    const tenantB = await tenantService.createTenantFoundation({ slug: getUniqueCode('t-b4'), displayName: 'Tenant B2' });

    const rolesB = await tenantRoleService.getRolesByTenantId(tenantB.id);
    expect(rolesB.length).toBeGreaterThan(0);
    const roleB = rolesB[0];

    await expect(
      membershipService.createMembership({
        tenantId: tenantA.id,
        userId: user.id,
        tenantRoleId: roleB.id,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  // ─── MANDATORY TEST 5: MEMBERSHIP SELECTION RULES ──────────────────────────
  it('MANDATORY TEST 5: Membership Selection rules evaluate 0, 1, and >1 active memberships correctly', async () => {
    const empCode = getUniqueCode('USER5');
    const user = await prisma.user.create({
      data: { employeeCode: empCode, fullName: 'Selector User', email: `${empCode}@example.com`, passwordHash: 'pw', role: Role.ADMIN },
    });

    const sel0 = await selectionService.evaluateMembershipSelection(user.id);
    expect(sel0.activeMembershipCount).toBe(0);
    expect(sel0.selectionRequired).toBe(false);
    expect(sel0.autoSelectableMembershipId).toBeNull();

    const tenantA = await tenantService.createTenantFoundation({ slug: getUniqueCode('t-sel-a5'), displayName: 'Sel A', status: TenantStatus.ACTIVE });
    const memA = await membershipService.createMembership({
      tenantId: tenantA.id,
      userId: user.id,
      status: TenantMembershipStatus.ACTIVE,
    });

    const sel1 = await selectionService.evaluateMembershipSelection(user.id);
    expect(sel1.activeMembershipCount).toBe(1);
    expect(sel1.selectionRequired).toBe(false);
    expect(sel1.autoSelectableMembershipId).toBe(memA.id);

    const tenantB = await tenantService.createTenantFoundation({ slug: getUniqueCode('t-sel-b5'), displayName: 'Sel B', status: TenantStatus.ACTIVE });
    await membershipService.createMembership({
      tenantId: tenantB.id,
      userId: user.id,
      status: TenantMembershipStatus.ACTIVE,
      isPrimary: true,
    });

    const sel2 = await selectionService.evaluateMembershipSelection(user.id);
    expect(sel2.activeMembershipCount).toBe(2);
    expect(sel2.selectionRequired).toBe(true);
    expect(sel2.autoSelectableMembershipId).toBeNull();
  });

  // ─── MANDATORY TEST 6: USER STATUS VS MEMBERSHIP STATUS ─────────────────────
  it('MANDATORY TEST 6: Suspended membership in Tenant A revokes Tenant A access while Tenant B remains accessible', async () => {
    const empCode = getUniqueCode('USER6');
    const user = await prisma.user.create({
      data: {
        employeeCode: empCode,
        fullName: 'Dual User',
        email: `${empCode}@example.com`,
        passwordHash: 'pw',
        role: Role.ADMIN,
        status: 'ACTIVE',
      },
    });

    const tenantA = await tenantService.createTenantFoundation({ slug: getUniqueCode('t-sus-a6'), displayName: 'Sus A', status: TenantStatus.ACTIVE });
    const tenantB = await tenantService.createTenantFoundation({ slug: getUniqueCode('t-sus-b6'), displayName: 'Sus B', status: TenantStatus.ACTIVE });

    await membershipService.createMembership({
      tenantId: tenantA.id,
      userId: user.id,
      status: TenantMembershipStatus.SUSPENDED,
    });

    const memB = await membershipService.createMembership({
      tenantId: tenantB.id,
      userId: user.id,
      status: TenantMembershipStatus.ACTIVE,
    });

    const sel = await selectionService.evaluateMembershipSelection(user.id);
    expect(sel.activeMembershipCount).toBe(1);
    expect(sel.selectionRequired).toBe(false);
    expect(sel.autoSelectableMembershipId).toBe(memB.id);
    expect(sel.activeMemberships[0].tenantId).toBe(tenantB.id);
  });
});
