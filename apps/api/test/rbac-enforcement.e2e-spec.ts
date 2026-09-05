import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/persistence/prisma.service';
import { TenantMembershipStatus, TenantStatus, Role, PlatformAssignmentStatus } from '@prisma/client';
import { verifyTestDatabaseSafety } from '../src/test-utils/test-db-safety';
import { PERMISSION_REGISTRY, DEFAULT_PLATFORM_ROLE_GRANTS, DEFAULT_TENANT_ROLE_GRANTS } from '../src/common/security/permission-registry';
import { RolePermissionService } from '../src/common/security/role-permission.service';

describe('Phase 0.4 — Scoped RBAC Enforcement Adversarial E2E Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let rolePermissionService: RolePermissionService;
  let jwtSecret: string;

  // Test Fixture Entities
  let tenantA: any;
  let tenantB: any;
  let platformAuditorUser: any;
  let platformSuperAdminUser: any;
  let tenantAdminUser: any;
  let fieldExecUser: any;
  let legacySuperAdminUser: any;
  let legacyAdminUser: any;
  let visibloDomainUser: any;
  let expiredPlatformUser: any;
  let multiTenantUser: any;

  let membershipAdmin: any;
  let membershipExec: any;
  let membershipMultiA: any;
  let membershipMultiB: any;

  let sessionAuditor: any;
  let sessionSuperAdmin: any;
  let sessionTenantAdmin: any;
  let sessionFieldExec: any;
  let sessionLegacySuperAdmin: any;
  let sessionLegacyAdmin: any;
  let sessionVisibloDomain: any;
  let sessionExpiredPlatform: any;
  let sessionMultiA: any;
  let sessionMultiB: any;

  // Tokens
  let tokenPlatformAuditor: string;
  let tokenPlatformSuperAdmin: string;
  let tokenTenantAdmin: string;
  let tokenFieldExec: string;
  let tokenLegacySuperAdmin: string;
  let tokenLegacyAdmin: string;
  let tokenVisibloDomain: string;
  let tokenExpiredPlatform: string;
  let tokenMultiA: string;
  let tokenMultiB: string;

  const timestamp = Date.now();

  beforeAll(async () => {
    verifyTestDatabaseSafety();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);
    configService = app.get<ConfigService>(ConfigService);
    rolePermissionService = app.get<RolePermissionService>(RolePermissionService);
    jwtSecret = configService.getOrThrow<string>('JWT_ACCESS_SECRET');

    // 1. Seed developer permissions in test database
    for (const def of PERMISSION_REGISTRY) {
      const existing = await prisma.permission.findFirst({
        where: {
          OR: [{ code: def.code }, { moduleKey: def.moduleKey, action: def.action }],
        },
      });
      if (existing) {
        await prisma.permission.update({
          where: { id: existing.id },
          data: {
            code: def.code,
            scope: def.scope,
            domain: def.domain,
            resource: def.resource,
            moduleKey: def.moduleKey,
            action: def.action,
            description: def.description,
            isActive: true,
          },
        });
      } else {
        await prisma.permission.create({
          data: {
            code: def.code,
            scope: def.scope,
            domain: def.domain,
            resource: def.resource,
            moduleKey: def.moduleKey,
            action: def.action,
            description: def.description,
            isActive: true,
          },
        });
      }
    }

    const allDbPerms = await prisma.permission.findMany();
    const permMap = new Map(allDbPerms.map((p) => [p.code, p]));

    // 2. Seed Platform Roles
    for (const [code, grantCodes] of Object.entries(DEFAULT_PLATFORM_ROLE_GRANTS)) {
      const pRole = await prisma.platformRole.upsert({
        where: { code },
        update: { isActive: true },
        create: { code, name: code, isSystem: true, isActive: true, permissionsVersion: 1 },
      });

      for (const pCode of grantCodes) {
        const perm = permMap.get(pCode);
        if (!perm) continue;
        await prisma.platformRolePermission.upsert({
          where: {
            platformRoleId_permissionId: { platformRoleId: pRole.id, permissionId: perm.id },
          },
          update: {},
          create: { platformRoleId: pRole.id, permissionId: perm.id },
        });
      }
    }

    // 3. Create Tenant A & Tenant B with Built-in Tenant Roles
    tenantA = await prisma.tenant.create({
      data: {
        slug: `rbac-tenant-a-${timestamp}`,
        displayName: 'RBAC Tenant A',
        status: TenantStatus.ACTIVE,
      },
    });

    tenantB = await prisma.tenant.create({
      data: {
        slug: `rbac-tenant-b-${timestamp}`,
        displayName: 'RBAC Tenant B',
        status: TenantStatus.ACTIVE,
      },
    });

    for (const tenant of [tenantA, tenantB]) {
      for (const [code, grantCodes] of Object.entries(DEFAULT_TENANT_ROLE_GRANTS)) {
        const tRole = await prisma.tenantRole.create({
          data: {
            tenantId: tenant.id,
            code,
            name: code,
            isSystem: true,
            isActive: true,
            permissionsVersion: 1,
          },
        });

        for (const pCode of grantCodes) {
          const perm = permMap.get(pCode);
          if (!perm) continue;
          await prisma.tenantRolePermission.create({
            data: {
              tenantRoleId: tRole.id,
              permissionId: perm.id,
            },
          });
        }
      }
    }

    const tenantAdminRoleA = await prisma.tenantRole.findUnique({
      where: { tenantId_code: { tenantId: tenantA.id, code: 'tenant_admin' } },
    });
    const salesManagerRoleA = await prisma.tenantRole.findUnique({
      where: { tenantId_code: { tenantId: tenantA.id, code: 'sales_manager' } },
    });
    const fieldExecRoleA = await prisma.tenantRole.findUnique({
      where: { tenantId_code: { tenantId: tenantA.id, code: 'field_executive' } },
    });
    const fieldExecRoleB = await prisma.tenantRole.findUnique({
      where: { tenantId_code: { tenantId: tenantB.id, code: 'field_executive' } },
    });
    const platformAuditorRole = await prisma.platformRole.findUnique({
      where: { code: 'PLATFORM_AUDITOR' },
    });
    const platformSuperRole = await prisma.platformRole.findUnique({
      where: { code: 'PLATFORM_SUPER_ADMIN' },
    });

    // 4. Create Test Users
    platformAuditorUser = await prisma.user.create({
      data: {
        employeeCode: `EMP-AUD-${timestamp}`,
        fullName: 'Platform Auditor User',
        email: `auditor-${timestamp}@smartfieldwork.com`,
        passwordHash: 'dummy',
        role: Role.PLATFORM_AUDITOR,
        status: 'ACTIVE',
      },
    });

    platformSuperAdminUser = await prisma.user.create({
      data: {
        employeeCode: `EMP-PSA-${timestamp}`,
        fullName: 'Platform Super Admin User',
        email: `psa-${timestamp}@smartfieldwork.com`,
        passwordHash: 'dummy',
        role: Role.PLATFORM_SUPER_ADMIN,
        status: 'ACTIVE',
      },
    });

    tenantAdminUser = await prisma.user.create({
      data: {
        employeeCode: `EMP-TADM-${timestamp}`,
        fullName: 'Tenant Admin User',
        email: `tenantadmin-${timestamp}@example.com`,
        passwordHash: 'dummy',
        role: Role.ADMIN,
        status: 'ACTIVE',
      },
    });

    fieldExecUser = await prisma.user.create({
      data: {
        employeeCode: `EMP-EXEC-${timestamp}`,
        fullName: 'Field Executive User',
        email: `fieldexec-${timestamp}@example.com`,
        passwordHash: 'dummy',
        role: Role.SUPER_ADMIN, // Intentionally legacy SUPER_ADMIN to verify no bypass
        status: 'ACTIVE',
      },
    });

    legacySuperAdminUser = await prisma.user.create({
      data: {
        employeeCode: `EMP-LEG-${timestamp}`,
        fullName: 'Legacy Super Admin User',
        email: `legacysuper-${timestamp}@example.com`,
        passwordHash: 'dummy',
        role: Role.SUPER_ADMIN,
        status: 'ACTIVE',
      },
    });

    legacyAdminUser = await prisma.user.create({
      data: {
        employeeCode: `EMP-LEGADM-${timestamp}`,
        fullName: 'Legacy Admin User',
        email: `legacyadmin-${timestamp}@example.com`,
        passwordHash: 'dummy',
        role: Role.ADMIN,
        status: 'ACTIVE',
      },
    });

    visibloDomainUser = await prisma.user.create({
      data: {
        employeeCode: `EMP-DOM-${timestamp}`,
        fullName: 'Visiblo Domain User',
        email: `employee-${timestamp}@smartfieldwork.com`,
        passwordHash: 'dummy',
        role: Role.SUPPORT,
        status: 'ACTIVE',
      },
    });

    expiredPlatformUser = await prisma.user.create({
      data: {
        employeeCode: `EMP-[#EXP]-${timestamp}`,
        fullName: 'Expired Platform User',
        email: `expired-${timestamp}@smartfieldwork.com`,
        passwordHash: 'dummy',
        role: Role.PLATFORM_OPERATIONS_ADMIN,
        status: 'ACTIVE',
      },
    });

    multiTenantUser = await prisma.user.create({
      data: {
        employeeCode: `EMP-MULTI-${timestamp}`,
        fullName: 'Multi Tenant User',
        email: `multitenant-${timestamp}@example.com`,
        passwordHash: 'dummy',
        role: Role.SALES_MANAGER,
        status: 'ACTIVE',
      },
    });

    // 5. Create Platform User Role Assignments
    await prisma.platformUserRoleAssignment.create({
      data: {
        userId: platformAuditorUser.id,
        platformRoleId: platformAuditorRole!.id,
        status: PlatformAssignmentStatus.ACTIVE,
      },
    });

    await prisma.platformUserRoleAssignment.create({
      data: {
        userId: platformSuperAdminUser.id,
        platformRoleId: platformSuperRole!.id,
        status: PlatformAssignmentStatus.ACTIVE,
      },
    });

    // Expired assignment
    await prisma.platformUserRoleAssignment.create({
      data: {
        userId: expiredPlatformUser.id,
        platformRoleId: platformAuditorRole!.id,
        status: PlatformAssignmentStatus.ACTIVE,
        validUntil: new Date(Date.now() - 3600000), // 1 hour ago
      },
    });

    // 6. Create Tenant Memberships
    membershipAdmin = await prisma.tenantMembership.create({
      data: {
        tenantId: tenantA.id,
        userId: tenantAdminUser.id,
        tenantRoleId: tenantAdminRoleA!.id,
        status: TenantMembershipStatus.ACTIVE,
      },
    });

    membershipExec = await prisma.tenantMembership.create({
      data: {
        tenantId: tenantA.id,
        userId: fieldExecUser.id,
        tenantRoleId: fieldExecRoleA!.id,
        status: TenantMembershipStatus.ACTIVE,
      },
    });

    membershipMultiA = await prisma.tenantMembership.create({
      data: {
        tenantId: tenantA.id,
        userId: multiTenantUser.id,
        tenantRoleId: salesManagerRoleA!.id,
        status: TenantMembershipStatus.ACTIVE,
      },
    });

    membershipMultiB = await prisma.tenantMembership.create({
      data: {
        tenantId: tenantB.id,
        userId: multiTenantUser.id,
        tenantRoleId: fieldExecRoleB!.id,
        status: TenantMembershipStatus.ACTIVE,
      },
    });

    // 7. Create User Sessions
    sessionAuditor = await prisma.userSession.create({
      data: { userId: platformAuditorUser.id, refreshTokenHash: 'dummy', status: 'ACTIVE', contextVersion: 1 },
    });
    sessionSuperAdmin = await prisma.userSession.create({
      data: { userId: platformSuperAdminUser.id, refreshTokenHash: 'dummy', status: 'ACTIVE', contextVersion: 1 },
    });
    sessionTenantAdmin = await prisma.userSession.create({
      data: { userId: tenantAdminUser.id, refreshTokenHash: 'dummy', selectedMembershipId: membershipAdmin.id, status: 'ACTIVE', contextVersion: 1 },
    });
    sessionFieldExec = await prisma.userSession.create({
      data: { userId: fieldExecUser.id, refreshTokenHash: 'dummy', selectedMembershipId: membershipExec.id, status: 'ACTIVE', contextVersion: 1 },
    });
    sessionLegacySuperAdmin = await prisma.userSession.create({
      data: { userId: legacySuperAdminUser.id, refreshTokenHash: 'dummy', status: 'ACTIVE', contextVersion: 1 },
    });
    sessionLegacyAdmin = await prisma.userSession.create({
      data: { userId: legacyAdminUser.id, refreshTokenHash: 'dummy', status: 'ACTIVE', contextVersion: 1 },
    });
    sessionVisibloDomain = await prisma.userSession.create({
      data: { userId: visibloDomainUser.id, refreshTokenHash: 'dummy', status: 'ACTIVE', contextVersion: 1 },
    });
    sessionExpiredPlatform = await prisma.userSession.create({
      data: { userId: expiredPlatformUser.id, refreshTokenHash: 'dummy', status: 'ACTIVE', contextVersion: 1 },
    });
    sessionMultiA = await prisma.userSession.create({
      data: { userId: multiTenantUser.id, refreshTokenHash: 'dummy', selectedMembershipId: membershipMultiA.id, status: 'ACTIVE', contextVersion: 1 },
    });
    sessionMultiB = await prisma.userSession.create({
      data: { userId: multiTenantUser.id, refreshTokenHash: 'dummy', selectedMembershipId: membershipMultiB.id, status: 'ACTIVE', contextVersion: 1 },
    });

    // 8. Sign Access Tokens
    tokenPlatformAuditor = jwtService.sign({ sub: platformAuditorUser.id, sid: sessionAuditor.id, ctxv: 1 }, { secret: jwtSecret });
    tokenPlatformSuperAdmin = jwtService.sign({ sub: platformSuperAdminUser.id, sid: sessionSuperAdmin.id, ctxv: 1 }, { secret: jwtSecret });
    tokenTenantAdmin = jwtService.sign({ sub: tenantAdminUser.id, sid: sessionTenantAdmin.id, mid: membershipAdmin.id, ctxv: 1 }, { secret: jwtSecret });
    tokenFieldExec = jwtService.sign({ sub: fieldExecUser.id, sid: sessionFieldExec.id, mid: membershipExec.id, ctxv: 1 }, { secret: jwtSecret });
    tokenLegacySuperAdmin = jwtService.sign({ sub: legacySuperAdminUser.id, sid: sessionLegacySuperAdmin.id, ctxv: 1 }, { secret: jwtSecret });
    tokenLegacyAdmin = jwtService.sign({ sub: legacyAdminUser.id, sid: sessionLegacyAdmin.id, ctxv: 1 }, { secret: jwtSecret });
    tokenVisibloDomain = jwtService.sign({ sub: visibloDomainUser.id, sid: sessionVisibloDomain.id, ctxv: 1 }, { secret: jwtSecret });
    tokenExpiredPlatform = jwtService.sign({ sub: expiredPlatformUser.id, sid: sessionExpiredPlatform.id, ctxv: 1 }, { secret: jwtSecret });
    tokenMultiA = jwtService.sign({ sub: multiTenantUser.id, sid: sessionMultiA.id, mid: membershipMultiA.id, ctxv: 1 }, { secret: jwtSecret });
    tokenMultiB = jwtService.sign({ sub: multiTenantUser.id, sid: sessionMultiB.id, mid: membershipMultiB.id, ctxv: 1 }, { secret: jwtSecret });
  });

  afterAll(async () => {
    const tenantIds = [tenantA?.id, tenantB?.id].filter(Boolean);
    if (tenantIds.length > 0) {
      await prisma.punchLog.deleteMany({ where: { tenantId: { in: tenantIds } } });
      await prisma.attendance.deleteMany({ where: { tenantId: { in: tenantIds } } });
      await prisma.tenantMembership.deleteMany({ where: { tenantId: { in: tenantIds } } });
      await prisma.tenantRolePermission.deleteMany({ where: { tenantRole: { tenantId: { in: tenantIds } } } });
      await prisma.tenantRole.deleteMany({ where: { tenantId: { in: tenantIds } } });
      await prisma.tenant.deleteMany({ where: { id: { in: tenantIds } } });
    }
    const userIds = [
      platformAuditorUser?.id,
      platformSuperAdminUser?.id,
      tenantAdminUser?.id,
      fieldExecUser?.id,
      legacySuperAdminUser?.id,
      legacyAdminUser?.id,
      visibloDomainUser?.id,
      expiredPlatformUser?.id,
      multiTenantUser?.id,
    ].filter(Boolean);

    if (userIds.length > 0) {
      await prisma.platformUserRoleAssignment.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.userSession.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await app.close();
  });

  // ─── TEST SUITE SCENARIOS ──────────────────────────────────────────────────

  describe('1. Server Authorization Bootstrap (GET /auth/authorization)', () => {
    it('returns server-issued platform and tenant permissions accurately', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/authorization')
        .set('Authorization', `Bearer ${tokenTenantAdmin}`)
        .expect(200);

      expect(res.body.schemaVersion).toBe(1);
      expect(res.body.user.id).toBe(tenantAdminUser.id);
      expect(res.body.tenant.id).toBe(tenantA.id);
      expect(res.body.tenant.membershipId).toBe(membershipAdmin.id);
      expect(res.body.tenant.roleCode).toBe('tenant_admin');
      expect(res.body.tenant.permissions).toContain('workforce.shifts.create');
      expect(res.body.tenant.permissions).toContain('attendance.monitoring.view');
      expect(res.body.tenant.permissions).toContain('payroll.salary_structure.manage');
    });

    it('returns null tenant payload for platform-only user', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/authorization')
        .set('Authorization', `Bearer ${tokenPlatformAuditor}`)
        .expect(200);

      expect(res.body.tenant).toBeNull();
      expect(res.body.platform.roleCodes).toContain('PLATFORM_AUDITOR');
      expect(res.body.platform.permissions).toContain('platform.tenants.view');
      expect(res.body.platform.permissions).not.toContain('platform.modules.update');
    });
  });

  describe('2. Platform Endpoint Permission Enforcement', () => {
    it('allows PLATFORM_AUDITOR to view platform tenants', async () => {
      await request(app.getHttpServer())
        .get('/platform/tenants')
        .set('Authorization', `Bearer ${tokenPlatformAuditor}`)
        .expect(200);
    });

    it('rejects PLATFORM_AUDITOR from mutating platform modules (missing platform.modules.update)', async () => {
      const res = await request(app.getHttpServer())
        .patch('/platform/modules/mod_test_123')
        .set('Authorization', `Bearer ${tokenPlatformAuditor}`)
        .send({ name: 'Hacked Module' })
        .expect(403);

      expect(res.body.message).toContain('You do not have permission');
    });

    it('allows PLATFORM_SUPER_ADMIN to mutate platform modules', async () => {
      // Expect 404 because mod_test_123 doesn't exist, but NOT 403 Forbidden!
      await request(app.getHttpServer())
        .patch('/platform/modules/mod_test_123')
        .set('Authorization', `Bearer ${tokenPlatformSuperAdmin}`)
        .send({ internalNotes: 'Updated Module Notes' })
        .expect(404);
    });
  });

  describe('3. Tenant Endpoint Permission Enforcement', () => {
    it('allows Tenant Admin to view shifts', async () => {
      await request(app.getHttpServer())
        .get('/shifts')
        .set('Authorization', `Bearer ${tokenTenantAdmin}`)
        .expect(200);
    });

    it('rejects Field Executive from creating a shift (missing workforce.shifts.create)', async () => {
      const res = await request(app.getHttpServer())
        .post('/shifts')
        .set('Authorization', `Bearer ${tokenFieldExec}`)
        .send({
          name: 'Morning Shift',
          code: 'MS-01',
          startTime: '09:00',
          endTime: '18:00',
        })
        .expect(403);

      expect(res.body.message).toContain('You do not have permission');
    });

    it('rejects Field Executive from viewing attendance admin monitoring (missing attendance.monitoring.view)', async () => {
      await request(app.getHttpServer())
        .get('/attendance/admin/today')
        .set('Authorization', `Bearer ${tokenFieldExec}`)
        .expect(403);
    });

    it('allows Field Executive to perform self punch-in', async () => {
      await request(app.getHttpServer())
        .post('/attendance/punch-in')
        .set('Authorization', `Bearer ${tokenFieldExec}`)
        .send({
          latitude: 12.9716,
          longitude: 77.5946,
        })
        .expect(201);
    });
  });

  describe('4. Elimination of Legacy Role & Email Authority Bypasses', () => {
    it('rejects user with legacy User.role = SUPER_ADMIN when no Platform role is assigned', async () => {
      await request(app.getHttpServer())
        .get('/platform/tenants')
        .set('Authorization', `Bearer ${tokenLegacySuperAdmin}`)
        .expect(403);
    });

    it('rejects user with legacy User.role = ADMIN when no Platform role is assigned', async () => {
      await request(app.getHttpServer())
        .get('/platform/tenants')
        .set('Authorization', `Bearer ${tokenLegacyAdmin}`)
        .expect(403);
    });

    it('rejects user with @smartfieldwork.com email when no Platform role is assigned', async () => {
      await request(app.getHttpServer())
        .get('/platform/tenants')
        .set('Authorization', `Bearer ${tokenVisibloDomain}`)
        .expect(403);
    });

    it('rejects user with expired Platform assignment', async () => {
      await request(app.getHttpServer())
        .get('/platform/tenants')
        .set('Authorization', `Bearer ${tokenExpiredPlatform}`)
        .expect(403);
    });
  });

  describe('5. Scope Isolation & Mismatch Validation', () => {
    it('rejects Platform Super Admin from calling Tenant attendance endpoints without selected tenant membership (HTTP 403)', async () => {
      await request(app.getHttpServer())
        .get('/attendance/admin/today')
        .set('Authorization', `Bearer ${tokenPlatformSuperAdmin}`)
        .expect(403); // Denied by MembershipContextGuard
    });

    it('rejects Tenant Admin from calling Platform console endpoints', async () => {
      await request(app.getHttpServer())
        .get('/platform/tenants')
        .set('Authorization', `Bearer ${tokenTenantAdmin}`)
        .expect(403);
    });

    it('rejects granting TENANT-scoped permission to a PlatformRole', async () => {
      const platformRole = await prisma.platformRole.findFirst();
      await expect(
        rolePermissionService.grantPlatformPermission(platformRole!.id, 'workforce.shifts.view'),
      ).rejects.toThrow('Only PLATFORM scoped permissions are allowed');
    });

    it('rejects granting PLATFORM-scoped permission to a TenantRole', async () => {
      const tenantRole = await prisma.tenantRole.findFirst();
      await expect(
        rolePermissionService.grantTenantPermission(tenantA.id, tenantRole!.id, 'platform.tenants.view'),
      ).rejects.toThrow('Only TENANT scoped permissions are allowed');
    });
  });

  describe('6. Multi-Tenant Membership Isolation & Live Invalidation', () => {
    it('grants independent permissions for single user in Tenant A (sales_manager) vs Tenant B (field_executive)', async () => {
      const resA = await request(app.getHttpServer())
        .get('/auth/authorization')
        .set('Authorization', `Bearer ${tokenMultiA}`)
        .expect(200);

      expect(resA.body.tenant.id).toBe(tenantA.id);
      expect(resA.body.tenant.roleCode).toBe('sales_manager');
      expect(resA.body.tenant.permissions).toContain('workforce.shifts.create');

      const resB = await request(app.getHttpServer())
        .get('/auth/authorization')
        .set('Authorization', `Bearer ${tokenMultiB}`)
        .expect(200);

      expect(resB.body.tenant.id).toBe(tenantB.id);
      expect(resB.body.tenant.roleCode).toBe('field_executive');
      expect(resB.body.tenant.permissions).not.toContain('workforce.shifts.create');
    });

    it('invalidates cache and increments permissionsVersion on live grant revoke', async () => {
      const fieldExecRoleA = await prisma.tenantRole.findUnique({
        where: { tenantId_code: { tenantId: tenantA.id, code: 'field_executive' } },
      });

      // Revoke attendance.self.punch from field_executive in Tenant A
      await rolePermissionService.revokeTenantPermission(tenantA.id, fieldExecRoleA!.id, 'attendance.self.punch');

      const res = await request(app.getHttpServer())
        .get('/auth/authorization')
        .set('Authorization', `Bearer ${tokenFieldExec}`)
        .expect(200);

      expect(res.body.tenant.permissions).not.toContain('attendance.self.punch');
      expect(res.body.tenant.permissionVersion).toContain(':v2');
    });
  });
});
