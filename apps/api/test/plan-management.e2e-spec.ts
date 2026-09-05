import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/persistence/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { syncRbac } from '../prisma/sync-rbac';
import { PlatformCatalogSyncService } from '../src/platform/modules/platform-catalog-sync.service';

describe('Plan Commercial Engine — REST API & Full RBAC Matrix E2E Test Suite', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let platformAdminToken: string;
  let legacySuperAdminToken: string;

  beforeAll(async () => {
    const testDbUrl = process.env.TEST_DATABASE_URL;
    if (!testDbUrl) {
      throw new Error('E2E Safety Guard: TEST_DATABASE_URL environment variable is mandatory.');
    }
    if (!testDbUrl.includes('visiblo_crm_test') && !testDbUrl.includes('_test')) {
      throw new Error(`E2E Safety Guard: TEST_DATABASE_URL '${testDbUrl}' does not contain explicit test database marker ('_test').`);
    }

    process.env.DATABASE_URL = testDbUrl;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    jwtService = moduleFixture.get<JwtService>(JwtService);

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

    await prisma.platformUserRoleAssignment.deleteMany({
      where: { userId: legacyUser.id },
    });

    // 3. Generate Tokens
    platformAdminToken = jwtService.sign({ sub: adminUser.id, email: adminUser.email, role: adminUser.role });
    legacySuperAdminToken = jwtService.sign({ sub: legacyUser.id, email: legacyUser.email, role: legacyUser.role });
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET /platform/plans should succeed for authorized Platform Admin and fail 403 for legacy SuperAdmin', async () => {
    const resAllow = await request(app.getHttpServer())
      .get('/platform/plans')
      .set('Authorization', `Bearer ${platformAdminToken}`);

    expect(resAllow.status).toBe(200);

    const resDeny = await request(app.getHttpServer())
      .get('/platform/plans')
      .set('Authorization', `Bearer ${legacySuperAdminToken}`);

    expect(resDeny.status).toBe(403);
  });

  it('2. POST /platform/plans should create a new Plan identity and DRAFT v1 snapshot (Allow + Deny RBAC)', async () => {
    const testCode = `E2E_PLAN_${Date.now()}`;
    const payload = {
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

    // Deny check
    const resDeny = await request(app.getHttpServer())
      .post('/platform/plans')
      .set('Authorization', `Bearer ${legacySuperAdminToken}`)
      .send(payload);
    expect(resDeny.status).toBe(403);

    // Allow check
    const resAllow = await request(app.getHttpServer())
      .post('/platform/plans')
      .set('Authorization', `Bearer ${platformAdminToken}`)
      .send(payload);

    expect(resAllow.status).toBe(201);
    expect(resAllow.body.code).toBe(testCode);
    expect(resAllow.body.status).toBe('DRAFT');
    expect(resAllow.body.currentDraftVersion).toBeDefined();
    expect(resAllow.body.currentDraftVersion.version).toBe(1);
    expect(resAllow.body.currentDraftVersion.pricing[0].model).toBe('PER_USER');
  });

  it('3. GET /platform/plans/:planId/versions/:version should return detailed version snapshot', async () => {
    const testCode = `VER_DET_${Date.now()}`;
    const planRes = await request(app.getHttpServer())
      .post('/platform/plans')
      .set('Authorization', `Bearer ${platformAdminToken}`)
      .send({
        code: testCode,
        name: 'Version Detail Test Plan',
        description: 'Test version detail endpoint',
        visibility: 'PUBLIC',
        displayOrder: 15,
        pricing: [{ model: 'PER_USER', billingCycle: 'MONTHLY', currency: 'INR', perSeatFee: 499, taxMode: 'EXCLUSIVE', prorationPolicy: 'NONE' }],
        limits: [{ limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 1, isUnlimited: false }],
        includedModuleCodes: ['core_crm'],
        commercialRules: { trialEnabled: false, trialDurationDays: 14, trialModulePolicy: 'USE_PLAN_MODULES', autoConvertAfterTrial: false, autoRenew: true, allowUpgrade: true, allowDowngrade: true, changeEffectiveTiming: 'IMMEDIATE', minimumCommitmentMonths: '0', availableForNewTenants: true, availableForExistingTenants: true, cancellationAllowed: true, gracePeriodDays: 7, accessAfterExpiry: 'READ_ONLY' },
      });

    const planId = planRes.body.id;

    const detailRes = await request(app.getHttpServer())
      .get(`/platform/plans/${planId}/versions/1`)
      .set('Authorization', `Bearer ${platformAdminToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.version).toBe(1);
    expect(detailRes.body.planId).toBe(planId);
  });

  it('4. POST /platform/plans/:id/versions/draft should create v2 DRAFT and handle concurrent requests safely', async () => {
    const testCode = `CONCURR_CLONE_${Date.now()}`;

    // Create & publish v1
    const planRes = await request(app.getHttpServer())
      .post('/platform/plans')
      .set('Authorization', `Bearer ${platformAdminToken}`)
      .send({
        code: testCode,
        name: 'E2E Concurrent Clone Plan',
        description: 'Test concurrent draft version creation',
        visibility: 'PUBLIC',
        displayOrder: 20,
        pricing: [{ model: 'PER_USER', billingCycle: 'MONTHLY', currency: 'INR', perSeatFee: 499, taxMode: 'EXCLUSIVE', prorationPolicy: 'NONE' }],
        limits: [{ limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 1, isUnlimited: false }],
        includedModuleCodes: ['core_crm'],
        commercialRules: { trialEnabled: false, trialDurationDays: 14, trialModulePolicy: 'USE_PLAN_MODULES', autoConvertAfterTrial: false, autoRenew: true, allowUpgrade: true, allowDowngrade: true, changeEffectiveTiming: 'IMMEDIATE', minimumCommitmentMonths: '0', availableForNewTenants: true, availableForExistingTenants: true, cancellationAllowed: true, gracePeriodDays: 7, accessAfterExpiry: 'READ_ONLY' },
      });

    const planId = planRes.body.id;
    const v1Id = planRes.body.currentDraftVersion.id;

    // Publish v1
    await request(app.getHttpServer())
      .post(`/platform/plans/${planId}/versions/${v1Id}/publish`)
      .set('Authorization', `Bearer ${platformAdminToken}`)
      .send({ allowBetaModules: true });

    // Execute parallel createNextDraft requests
    const [req1, req2] = await Promise.all([
      request(app.getHttpServer())
        .post(`/platform/plans/${planId}/versions/draft`)
        .set('Authorization', `Bearer ${platformAdminToken}`),
      request(app.getHttpServer())
        .post(`/platform/plans/${planId}/versions/draft`)
        .set('Authorization', `Bearer ${platformAdminToken}`),
    ]);

    const statuses = [req1.status, req2.status].sort();
    expect(statuses).toEqual([201, 409]);
  });

  it('5. BETA module publication without allowBetaModules: true must fail with 400', async () => {
    const testCode = `BETA_PUB_${Date.now()}`;
    const planRes = await request(app.getHttpServer())
      .post('/platform/plans')
      .set('Authorization', `Bearer ${platformAdminToken}`)
      .send({
        code: testCode,
        name: 'Beta Module Test Plan',
        description: 'Test beta module acknowledgement requirement',
        visibility: 'PUBLIC',
        displayOrder: 25,
        pricing: [{ model: 'CUSTOM_CONTRACT', billingCycle: 'MONTHLY', currency: 'INR', taxMode: 'EXCLUSIVE', prorationPolicy: 'NONE' }],
        limits: [{ limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 1, isUnlimited: false }],
        includedModuleCodes: ['core_crm', 'ai_copilot'],
        commercialRules: { trialEnabled: false, trialDurationDays: 14, trialModulePolicy: 'USE_PLAN_MODULES', autoConvertAfterTrial: false, autoRenew: true, allowUpgrade: true, allowDowngrade: true, changeEffectiveTiming: 'IMMEDIATE', minimumCommitmentMonths: '0', availableForNewTenants: true, availableForExistingTenants: true, cancellationAllowed: true, gracePeriodDays: 7, accessAfterExpiry: 'READ_ONLY' },
      });

    const planId = planRes.body.id;
    const versionId = planRes.body.currentDraftVersion.id;

    // Publish without allowBetaModules -> MUST fail!
    const resFail = await request(app.getHttpServer())
      .post(`/platform/plans/${planId}/versions/${versionId}/publish`)
      .set('Authorization', `Bearer ${platformAdminToken}`)
      .send({ allowBetaModules: false });

    expect(resFail.status).toBe(400);
    expect(resFail.body.errors[0].code).toBe('PLAN_MODULE_BETA_ACKNOWLEDGEMENT_REQUIRED');

    // Publish with allowBetaModules: true -> MUST succeed!
    const resSuccess = await request(app.getHttpServer())
      .post(`/platform/plans/${planId}/versions/${versionId}/publish`)
      .set('Authorization', `Bearer ${platformAdminToken}`)
      .send({ allowBetaModules: true });

    expect(resSuccess.status).toBe(200);
  });
});
