import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/persistence/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { syncRbac } from '../prisma/sync-rbac';
import { PlatformCatalogSyncService } from '../src/platform/modules/platform-catalog-sync.service';

describe('Plan Commercial Engine — REST API & RBAC E2E Test Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let platformAdminToken: string;
  let legacySuperAdminToken: string;

  beforeAll(async () => {
    const testDbUrl = process.env.TEST_DATABASE_URL || 'postgresql://postgres:123456@127.0.0.1:5432/visiblo_crm_test?schema=public';
    process.env.DATABASE_URL = testDbUrl;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Sync platform module catalog and RBAC definitions in test database
    const catalogSync = moduleFixture.get<PlatformCatalogSyncService>(PlatformCatalogSyncService);
    await catalogSync.syncCatalog();
    await syncRbac(prisma);

    // 1. Create Platform Admin user with PlatformRole assignment
    const adminUser = await prisma.user.upsert({
      where: { email: 'e2e.plan.admin@visiblo.com' },
      update: {},
      create: {
        employeeCode: 'EMP_PLAN_ADM_001',
        fullName: 'E2E Plan Platform Admin',
        email: 'e2e.plan.admin@visiblo.com',
        passwordHash: '$2b$10$e2e.dummy.password.hash',
        role: 'PLATFORM_SUPER_ADMIN',
      },
    });

    const platformSuperRole = await prisma.platformRole.findUnique({
      where: { code: 'PLATFORM_SUPER_ADMIN' },
    });

    if (platformSuperRole) {
      await prisma.platformUserRoleAssignment.upsert({
        where: {
          userId_platformRoleId: {
            userId: adminUser.id,
            platformRoleId: platformSuperRole.id,
          },
        },
        update: { status: 'ACTIVE' },
        create: {
          userId: adminUser.id,
          platformRoleId: platformSuperRole.id,
          status: 'ACTIVE',
        },
      });
    }

    // 2. Create Legacy User with User.role = SUPER_ADMIN but NO PlatformRole assignment
    const legacyUser = await prisma.user.upsert({
      where: { email: 'e2e.legacy.admin@visiblo.com' },
      update: {},
      create: {
        employeeCode: 'EMP_LEGACY_ADM_001',
        fullName: 'E2E Legacy Admin',
        email: 'e2e.legacy.admin@visiblo.com',
        passwordHash: '$2b$10$e2e.dummy.password.hash',
        role: 'SUPER_ADMIN',
      },
    });

    // Clean up any platform role assignments for legacy user
    await prisma.platformUserRoleAssignment.deleteMany({
      where: { userId: legacyUser.id },
    });

    // 3. Generate JWT tokens
    platformAdminToken = jwtService.sign({ sub: adminUser.id, email: adminUser.email, role: adminUser.role });
    legacySuperAdminToken = jwtService.sign({ sub: legacyUser.id, email: legacyUser.email, role: legacyUser.role });
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET /platform/plans should succeed for authorized Platform Admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/platform/plans')
      .set('Authorization', `Bearer ${platformAdminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('2. GET /platform/plans should fail with 403 Forbidden for legacy User.role = SUPER_ADMIN without Platform assignment', async () => {
    const res = await request(app.getHttpServer())
      .get('/platform/plans')
      .set('Authorization', `Bearer ${legacySuperAdminToken}`);

    expect(res.status).toBe(403);
  });

  it('3. POST /platform/plans should create a new Plan identity and DRAFT v1 snapshot', async () => {
    const testCode = `E2E_PLAN_${Date.now()}`;

    const createPayload = {
      code: testCode,
      name: 'E2E Sales Plan',
      description: 'E2E test plan for complete lifecycle',
      visibility: 'PUBLIC',
      displayOrder: 10,
      pricing: [
        {
          model: 'PER_USER',
          billingCycle: 'MONTHLY',
          currency: 'INR',
          perSeatFee: 999,
          taxMode: 'EXCLUSIVE',
          prorationPolicy: 'IMMEDIATE',
        },
      ],
      limits: [
        { limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 2, isUnlimited: false },
        { limitCode: 'default_seat_limit', valueType: 'INTEGER', integerValue: 10, isUnlimited: false },
        { limitCode: 'maximum_seats', valueType: 'INTEGER', integerValue: 50, isUnlimited: false },
      ],
      includedModuleCodes: ['core_crm'],
      commercialRules: {
        trialEnabled: true,
        trialDurationDays: 14,
        trialSeatLimit: 5,
        trialModulePolicy: 'USE_PLAN_MODULES',
        autoConvertAfterTrial: false,
        autoRenew: true,
        allowUpgrade: true,
        allowDowngrade: false,
        changeEffectiveTiming: 'IMMEDIATE',
        minimumCommitmentMonths: '1',
        availableForNewTenants: true,
        availableForExistingTenants: true,
        cancellationAllowed: true,
        gracePeriodDays: 7,
        accessAfterExpiry: 'READ_ONLY',
      },
    };

    const res = await request(app.getHttpServer())
      .post('/platform/plans')
      .set('Authorization', `Bearer ${platformAdminToken}`)
      .send(createPayload);

    expect(res.status).toBe(201);
    expect(res.body.code).toBe(testCode);
    expect(res.body.status).toBe('DRAFT');
    expect(res.body.currentDraftVersion).toBeDefined();
    expect(res.body.currentDraftVersion.version).toBe(1);
    expect(res.body.currentDraftVersion.displayStatus).toBe('DRAFT');
  });

  it('4. POST /platform/plans/:id/versions/draft should create v2 DRAFT cloned from v1 published version', async () => {
    const testCode = `E2E_CLONE_${Date.now()}`;

    // Create & publish v1
    const planRes = await request(app.getHttpServer())
      .post('/platform/plans')
      .set('Authorization', `Bearer ${platformAdminToken}`)
      .send({
        code: testCode,
        name: 'E2E Clone Test Plan',
        description: 'Test cloning draft versions',
        visibility: 'PUBLIC',
        displayOrder: 20,
        pricing: [{ model: 'PER_USER', billingCycle: 'MONTHLY', currency: 'INR', perSeatFee: 499, taxMode: 'EXCLUSIVE', prorationPolicy: 'NONE' }],
        limits: [{ limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 1, isUnlimited: false }],
        includedModuleCodes: ['core_crm'],
        commercialRules: { trialEnabled: false, trialDurationDays: 14, trialModulePolicy: 'USE_PLAN_MODULES', autoConvertAfterTrial: false, autoRenew: true, allowUpgrade: true, allowDowngrade: true, changeEffectiveTiming: 'IMMEDIATE', minimumCommitmentMonths: '0', availableForNewTenants: true, availableForExistingTenants: true, cancellationAllowed: true, gracePeriodDays: 7, accessAfterExpiry: 'READ_ONLY' },
      });

    expect(planRes.status).toBe(201);

    const planId = planRes.body.id;
    const v1Id = planRes.body.currentDraftVersion.id;

    // Publish v1
    const publishRes = await request(app.getHttpServer())
      .post(`/platform/plans/${planId}/versions/${v1Id}/publish`)
      .set('Authorization', `Bearer ${platformAdminToken}`)
      .send({ allowBetaModules: true });

    expect(publishRes.status).toBe(200);

    // Create next draft (v2)
    const v2Res = await request(app.getHttpServer())
      .post(`/platform/plans/${planId}/versions/draft`)
      .set('Authorization', `Bearer ${platformAdminToken}`);

    expect(v2Res.status).toBe(201);
    expect(v2Res.body.version).toBe(2);
    expect(v2Res.body.displayStatus).toBe('DRAFT');

    // Attempt creating another draft while v2 draft exists -> MUST fail with 409 Conflict!
    const conflictRes = await request(app.getHttpServer())
      .post(`/platform/plans/${planId}/versions/draft`)
      .set('Authorization', `Bearer ${platformAdminToken}`);

    expect(conflictRes.status).toBe(409);
  });
});
