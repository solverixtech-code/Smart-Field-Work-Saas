import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/persistence/prisma.service';
import { TenantMembershipStatus, TenantStatus, Role } from '@prisma/client';

describe('Phase 0.3.2 — Real PostgreSQL 2-Tenant Adversarial E2E Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let jwtSecret: string;

  // Test Entities
  let tenantA: any;
  let tenantB: any;
  let tenantSuspended: any;

  let userA: any;
  let userB: any;

  let membershipA1: any;
  let membershipB1: any;
  let membershipSuspended: any;
  let membershipTenantSuspended: any;

  let sessionA: any;
  let sessionB: any;
  let sessionRevoked: any;
  let sessionSuspendedMember: any;
  let sessionSuspendedTenant: any;

  let shiftA: any;
  let shiftB: any;

  let payslipA: any;
  let payslipB: any;

  // Access Tokens
  let tokenTenantA: string;
  let tokenTenantB: string;
  let staleTokenTenantA: string;
  let revokedSessionToken: string;
  let suspendedMemberToken: string;
  let suspendedTenantToken: string;

  const timestamp = Date.now();

  beforeAll(async () => {
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

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    jwtSecret = configService.getOrThrow<string>('JWT_ACCESS_SECRET');

    await app.init();

    // ─── 1. Clean & Provision Real Test Database Entities ─────────────────────

    // Tenant A (Active)
    tenantA = await prisma.tenant.create({
      data: {
        slug: `tenant-a-${timestamp}`,
        displayName: 'Tenant Alpha E2E',
        status: TenantStatus.ACTIVE,
      },
    });

    // Tenant B (Active)
    tenantB = await prisma.tenant.create({
      data: {
        slug: `tenant-b-${timestamp}`,
        displayName: 'Tenant Beta E2E',
        status: TenantStatus.ACTIVE,
      },
    });

    // Tenant Suspended
    tenantSuspended = await prisma.tenant.create({
      data: {
        slug: `tenant-susp-${timestamp}`,
        displayName: 'Tenant Suspended E2E',
        status: TenantStatus.SUSPENDED,
      },
    });

    // User A (Belongs to Tenant A)
    userA = await prisma.user.create({
      data: {
        employeeCode: `EMP-A-${timestamp}`,
        fullName: 'User Alpha',
        email: `user.a.${timestamp}@example.com`,
        passwordHash: 'dummy_hash',
        role: Role.SALES_MANAGER,
      },
    });

    // User B (Belongs to Tenant B)
    userB = await prisma.user.create({
      data: {
        employeeCode: `EMP-B-${timestamp}`,
        fullName: 'User Beta',
        email: `user.b.${timestamp}@example.com`,
        passwordHash: 'dummy_hash',
        role: Role.SALES_MANAGER,
      },
    });

    // User Suspended (Belongs to Tenant A but membership suspended)
    const userSuspended = await prisma.user.create({
      data: {
        employeeCode: `EMP-SUSP-${timestamp}`,
        fullName: 'User Suspended',
        email: `user.susp.${timestamp}@example.com`,
        passwordHash: 'dummy_hash',
        role: Role.SALES_MANAGER,
      },
    });

    // Membership A1 (Active in Tenant A)
    membershipA1 = await prisma.tenantMembership.create({
      data: {
        tenantId: tenantA.id,
        userId: userA.id,
        employeeCode: `MEM-A1-${timestamp}`,
        status: TenantMembershipStatus.ACTIVE,
      },
    });

    // Membership B1 (Active in Tenant B)
    membershipB1 = await prisma.tenantMembership.create({
      data: {
        tenantId: tenantB.id,
        userId: userB.id,
        employeeCode: `MEM-B1-${timestamp}`,
        status: TenantMembershipStatus.ACTIVE,
      },
    });

    // Membership Suspended (User Suspended in Tenant A)
    membershipSuspended = await prisma.tenantMembership.create({
      data: {
        tenantId: tenantA.id,
        userId: userSuspended.id,
        employeeCode: `MEM-SUSP-${timestamp}`,
        status: TenantMembershipStatus.SUSPENDED,
      },
    });

    // Membership in Suspended Tenant
    membershipTenantSuspended = await prisma.tenantMembership.create({
      data: {
        tenantId: tenantSuspended.id,
        userId: userB.id,
        employeeCode: `MEM-TSUSP-${timestamp}`,
        status: TenantMembershipStatus.ACTIVE,
      },
    });

    // Session A (Active for User A, Membership A1, ctxv 1)
    sessionA = await prisma.userSession.create({
      data: {
        userId: userA.id,
        refreshTokenHash: 'dummy_refresh_hash',
        status: 'ACTIVE',
        contextVersion: 1,
        selectedMembershipId: membershipA1.id,
      },
    });

    // Session B (Active for User B, Membership B1, ctxv 1)
    sessionB = await prisma.userSession.create({
      data: {
        userId: userB.id,
        refreshTokenHash: 'dummy_refresh_hash',
        status: 'ACTIVE',
        contextVersion: 1,
        selectedMembershipId: membershipB1.id,
      },
    });

    // Session Revoked
    sessionRevoked = await prisma.userSession.create({
      data: {
        userId: userA.id,
        refreshTokenHash: 'dummy_refresh_hash',
        status: 'REVOKED',
        contextVersion: 1,
        selectedMembershipId: membershipA1.id,
      },
    });

    // Session Suspended Member
    sessionSuspendedMember = await prisma.userSession.create({
      data: {
        userId: userSuspended.id,
        refreshTokenHash: 'dummy_refresh_hash',
        status: 'ACTIVE',
        contextVersion: 1,
        selectedMembershipId: membershipSuspended.id,
      },
    });

    // Session Suspended Tenant
    sessionSuspendedTenant = await prisma.userSession.create({
      data: {
        userId: userB.id,
        refreshTokenHash: 'dummy_refresh_hash',
        status: 'ACTIVE',
        contextVersion: 1,
        selectedMembershipId: membershipTenantSuspended.id,
      },
    });

    // Shift A in Tenant A
    shiftA = await prisma.shift.create({
      data: {
        tenantId: tenantA.id,
        name: 'Morning Shift A',
        code: `SHF-A-${timestamp}`,
        startTime: '09:00',
        endTime: '18:00',
      },
    });

    // Shift B in Tenant B
    shiftB = await prisma.shift.create({
      data: {
        tenantId: tenantB.id,
        name: 'Evening Shift B',
        code: `SHF-B-${timestamp}`,
        startTime: '14:00',
        endTime: '22:00',
      },
    });

    // Attendance records
    await prisma.attendance.create({
      data: {
        tenantId: tenantA.id,
        tenantMembershipId: membershipA1.id,
        userId: userA.id,
        date: new Date('2026-09-01'),
        status: 'PRESENT',
        punchInTime: new Date('2026-09-01T09:00:00Z'),
      },
    });

    await prisma.attendance.create({
      data: {
        tenantId: tenantB.id,
        tenantMembershipId: membershipB1.id,
        userId: userB.id,
        date: new Date('2026-09-01'),
        status: 'PRESENT',
        punchInTime: new Date('2026-09-01T14:00:00Z'),
      },
    });

    // Salary Structure & Payslips
    const periodA = await prisma.payrollPeriod.create({
      data: {
        tenantId: tenantA.id,
        month: 9,
        year: 2026,
        status: 'DRAFT',
      },
    });

    const periodB = await prisma.payrollPeriod.create({
      data: {
        tenantId: tenantB.id,
        month: 9,
        year: 2026,
        status: 'DRAFT',
      },
    });

    payslipA = await prisma.payslip.create({
      data: {
        tenantId: tenantA.id,
        tenantMembershipId: membershipA1.id,
        userId: userA.id,
        payrollPeriodId: periodA.id,
        baseSalary: 50000,
        netPay: 50000,
      },
    });

    payslipB = await prisma.payslip.create({
      data: {
        tenantId: tenantB.id,
        tenantMembershipId: membershipB1.id,
        userId: userB.id,
        payrollPeriodId: periodB.id,
        baseSalary: 60000,
        netPay: 60000,
      },
    });

    // ─── 2. Issue Signed JWT Tokens ──────────────────────────────────────────

    tokenTenantA = jwtService.sign(
      { sub: userA.id, sid: sessionA.id, mid: membershipA1.id, ctxv: 1, tokenUse: 'access' },
      { secret: jwtSecret, expiresIn: '1h' },
    );

    tokenTenantB = jwtService.sign(
      { sub: userB.id, sid: sessionB.id, mid: membershipB1.id, ctxv: 1, tokenUse: 'access' },
      { secret: jwtSecret, expiresIn: '1h' },
    );

    staleTokenTenantA = jwtService.sign(
      { sub: userA.id, sid: sessionA.id, mid: membershipA1.id, ctxv: 0 /* STALE! */, tokenUse: 'access' },
      { secret: jwtSecret, expiresIn: '1h' },
    );

    revokedSessionToken = jwtService.sign(
      { sub: userA.id, sid: sessionRevoked.id, mid: membershipA1.id, ctxv: 1, tokenUse: 'access' },
      { secret: jwtSecret, expiresIn: '1h' },
    );

    suspendedMemberToken = jwtService.sign(
      { sub: sessionSuspendedMember.userId, sid: sessionSuspendedMember.id, mid: membershipSuspended.id, ctxv: 1, tokenUse: 'access' },
      { secret: jwtSecret, expiresIn: '1h' },
    );

    suspendedTenantToken = jwtService.sign(
      { sub: userB.id, sid: sessionSuspendedTenant.id, mid: membershipTenantSuspended.id, ctxv: 1, tokenUse: 'access' },
      { secret: jwtSecret, expiresIn: '1h' },
    );
  });

  afterAll(async () => {
    // Cleanup seeded entities
    if (tenantA) {
      await prisma.payslip.deleteMany({ where: { tenantId: { in: [tenantA.id, tenantB.id, tenantSuspended.id] } } });
      await prisma.payrollPeriod.deleteMany({ where: { tenantId: { in: [tenantA.id, tenantB.id, tenantSuspended.id] } } });
      await prisma.attendance.deleteMany({ where: { tenantId: { in: [tenantA.id, tenantB.id, tenantSuspended.id] } } });
      await prisma.shift.deleteMany({ where: { tenantId: { in: [tenantA.id, tenantB.id, tenantSuspended.id] } } });
      await prisma.userSession.deleteMany({ where: { userId: { in: [userA.id, userB.id] } } });
      await prisma.tenantMembership.deleteMany({ where: { tenantId: { in: [tenantA.id, tenantB.id, tenantSuspended.id] } } });
      await prisma.user.deleteMany({ where: { id: { in: [userA.id, userB.id] } } });
      await prisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id, tenantSuspended.id] } } });
    }
    await app.close();
  });

  describe('Unauthenticated Request Protection', () => {
    it('GET /shifts should return 401 Unauthorized without JWT token', async () => {
      await request(app.getHttpServer()).get('/shifts').expect(401);
    });

    it('POST /attendance/punch-in should return 401 Unauthorized without JWT token', async () => {
      await request(app.getHttpServer())
        .post('/attendance/punch-in')
        .send({ latitude: 19.076, longitude: 72.8777 })
        .expect(401);
    });

    it('POST /payroll/generate should return 401 Unauthorized without JWT token', async () => {
      await request(app.getHttpServer())
        .post('/payroll/generate')
        .send({ month: 9, year: 2026 })
        .expect(401);
    });
  });

  describe('Global ValidationPipe & DTO Whitelisting Enforcement', () => {
    it('POST /shifts with valid fields + unwhitelisted extra parameter should return 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/shifts')
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .send({
          name: 'Test Shift Whitelist',
          code: `TS-WHITE-${timestamp}`,
          startTime: '09:00',
          endTime: '17:00',
          unwhitelistedExtraField: 'malicious-payload',
        })
        .expect(400);

      expect(res.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('property unwhitelistedExtraField should not exist')]),
      );
    });
  });

  describe('Adversarial Cross-Tenant Data Isolation Tests', () => {
    it('ATTACK 1: Token A querying Shift B UUID should return 404 Not Found', async () => {
      await request(app.getHttpServer())
        .get(`/shifts/${shiftB.id}`)
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .expect(404);
    });

    it('ATTACK 2: Token A selecting Membership B1 should return 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/auth/memberships/select')
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .send({ membershipId: membershipB1.id })
        .expect(400);
    });

    it('ATTACK 3: Token A updating/paying Payslip B UUID should return 404 Not Found', async () => {
      await request(app.getHttpServer())
        .post(`/payroll/payslips/${payslipB.id}/pay`)
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .send({ transactionRef: 'TXN-HACK' })
        .expect(404);
    });

    it('ATTACK 4: Token A fetching monthly attendance should return ONLY Tenant A records', async () => {
      const res = await request(app.getHttpServer())
        .get('/attendance/admin/monthly?month=9&year=2026')
        .set('Authorization', `Bearer ${tokenTenantA}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      const tenantBRecords = res.body.filter(
        (r: any) => r.tenantId === tenantB.id || r.tenantMembershipId === membershipB1.id,
      );
      expect(tenantBRecords.length).toBe(0);
    });

    it('ATTACK 5: Stale Token A (contextVersion mismatch) should return 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/shifts')
        .set('Authorization', `Bearer ${staleTokenTenantA}`)
        .expect(401);
    });

    it('ATTACK 6: Token for REVOKED session should return 401 Unauthorized', async () => {
      await request(app.getHttpServer())
        .get('/shifts')
        .set('Authorization', `Bearer ${revokedSessionToken}`)
        .expect(401);
    });

    it('ATTACK 7: Token for SUSPENDED TenantMembership should return 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/shifts')
        .set('Authorization', `Bearer ${suspendedMemberToken}`)
        .expect(403);
    });

    it('ATTACK 8: Token for SUSPENDED Tenant should return 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/shifts')
        .set('Authorization', `Bearer ${suspendedTenantToken}`)
        .expect(403);
    });
  });
});
