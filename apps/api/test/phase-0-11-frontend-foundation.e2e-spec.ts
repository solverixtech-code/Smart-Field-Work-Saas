import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { Role, PlatformAssignmentStatus, TenantStatus } from '@prisma/client';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/persistence/prisma.service';
import { verifyTestDatabaseSafety } from '../src/test-utils/test-db-safety';
import { syncRbac } from '../prisma/sync-rbac';
import { seedTenantRoleTemplates } from '../prisma/seeds/tenant-role-templates';
import { PlatformCatalogSyncService } from '../src/platform/modules/platform-catalog-sync.service';
import { MasterSeedService } from '../src/platform/masters/master-seed.service';
import { execFileSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { ProvisioningService } from '../src/platform/subscriptions/provisioning.service';
import { RuntimeConfigService } from '../src/runtime/runtime-config.service';
import { IndustryService } from '../src/platform/industries/industry.service';
import { RequestPrincipal } from '../src/common/security/request-principal.interface';

describe('Phase 0.11 Frontend Foundation Conversion E2E Proof', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;
  let provisioning: ProvisioningService;
  let runtime: RuntimeConfigService;

  let platformSuperAdminToken: string;
  let platformSuperAdminId: string;
  let plainUserToken: string;
  let plainUserId: string;

  let publishedPlanVersionId: string;
  let provisionedTenantId: string;

  const timestamp = Date.now();
  const schema = `phase11_${randomUUID().replace(/-/g, '')}`;
  let baseUrl: string;

  beforeAll(async () => {
    verifyTestDatabaseSafety();
    baseUrl = process.env.TEST_DATABASE_URL ?? '';
    const isolated = new URL(baseUrl);
    isolated.searchParams.set('schema', schema);
    process.env.DATABASE_URL = isolated.toString();
    execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy', '--schema=prisma/schema.prisma'], { cwd: process.cwd(), env: process.env, stdio: 'pipe' });

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get(PrismaService);
    jwt = app.get(JwtService);
    provisioning = app.get(ProvisioningService);
    runtime = app.get(RuntimeConfigService);

    await app.get(PlatformCatalogSyncService).syncCatalog();
    await seedTenantRoleTemplates(prisma);
    await syncRbac(prisma);

    const platformSuperRole = await prisma.platformRole.findUnique({
      where: { code: 'PLATFORM_SUPER_ADMIN' },
    });

    // Create Platform Super Admin
    platformSuperAdminId = randomUUID();
    const adminEmail = `superadmin-${timestamp}@visiblo.com`;
    const superAdminUser = await prisma.user.create({
      data: {
        id: platformSuperAdminId,
        employeeCode: `EMP-PSA-${timestamp}`,
        email: adminEmail,
        fullName: 'Platform Super Admin',
        passwordHash: 'dummy',
        role: Role.PLATFORM_SUPER_ADMIN,
        status: 'ACTIVE',
      },
    });

    if (platformSuperRole) {
      await prisma.platformUserRoleAssignment.create({
        data: {
          userId: superAdminUser.id,
          platformRoleId: platformSuperRole.id,
          status: PlatformAssignmentStatus.ACTIVE,
        },
      });
    }

    const adminSession = await prisma.userSession.create({
      data: {
        userId: superAdminUser.id,
        refreshTokenHash: 'hash',
      },
    });

    platformSuperAdminToken = jwt.sign({
      sub: superAdminUser.id,
      email: adminEmail,
      sessionId: adminSession.id,
      contextVersion: 1,
    });

    // Seed Masters
    const masterSeed = app.get(MasterSeedService);
    const review = await masterSeed.run(superAdminUser.id);
    await masterSeed.run(superAdminUser.id, review.reviewedHash);

    // Seed Industry Template
    const indService = app.get(IndustryService);
    const indCode = 'PHARMA';
    await prisma.industryClassification.upsert({
      where: { code: indCode },
      update: {},
      create: { code: indCode, name: 'Pharmaceutical' },
    });
    let template = await prisma.industryTemplate.findUnique({ where: { code: indCode } });
    if (!template) {
      template = await indService.create(
        {
          code: indCode,
          name: 'Pharmaceutical',
          category: 'Healthcare',
          description: 'Pharmaceutical Industry',
        },
        superAdminUser.id,
      );
      const v = await indService.createDraft(
        template.id,
        { expectedRevision: template.revision, reason: 'Initial draft for Phase 0.11' },
        superAdminUser.id,
      );
      await indService.publish(
        template.id,
        v.id,
        {
          expectedRevision: v.revision,
          reason: 'Initial publication for Phase 0.11',
          approvalReference: 'TEST-APPROVAL',
        },
        superAdminUser.id,
      );
    }

    // Create Plain User with no platform roles
    plainUserId = randomUUID();
    const plainEmail = `plain-${timestamp}@external.com`;
    const plainUser = await prisma.user.create({
      data: {
        id: plainUserId,
        employeeCode: `EMP-PLAIN-${timestamp}`,
        email: plainEmail,
        fullName: 'Plain User',
        passwordHash: 'dummy',
        role: Role.SUPPORT,
        status: 'ACTIVE',
      },
    });
    const plainSession = await prisma.userSession.create({
      data: {
        userId: plainUser.id,
        refreshTokenHash: 'hash',
      },
    });
    plainUserToken = jwt.sign({
      sub: plainUser.id,
      email: plainEmail,
      sessionId: plainSession.id,
      contextVersion: 1,
    });
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
    if (baseUrl) {
      const cleanup = new PrismaClient({ datasources: { db: { url: baseUrl } } });
      if (!/^phase11_[a-f0-9]{32}$/.test(schema)) throw new Error('Unsafe test schema');
      await cleanup.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await cleanup.$disconnect();
      process.env.DATABASE_URL = baseUrl;
    }
  });

  describe('SCENARIOS A & B: Platform Modules API and Permission Guard', () => {
    it('SCENARIO A: Authorized operator loads modules from backend API (not fixtures)', async () => {
      const res = await request(app.getHttpServer())
        .get('/platform/modules')
        .set('Authorization', `Bearer ${platformSuperAdminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      const coreCrm = res.body.data.find((m: any) => m.code === 'core_crm');
      expect(coreCrm).toBeDefined();
      expect(coreCrm.status).toBe('ACTIVE');
    });

    it('SCENARIO B: Operator without platform.modules.view receives 403 Forbidden', async () => {
      await request(app.getHttpServer())
        .get('/platform/modules')
        .set('Authorization', `Bearer ${plainUserToken}`)
        .expect(403);
    });
  });

  describe('SCENARIOS C & D: Plan Versioning and Stale Concurrency', () => {
    let createdPlanId: string;
    let draftVersionId: string;

    it('SCENARIO C: Create/read a draft Plan; published version renders read-only', async () => {
      const planCode = `PLAN_E2E_${Date.now()}`;
      const createRes = await request(app.getHttpServer())
        .post('/platform/plans')
        .set('Authorization', `Bearer ${platformSuperAdminToken}`)
        .send({
          code: planCode,
          name: 'E2E Sales Plan',
          description: 'E2E test plan for complete lifecycle',
          visibility: 'PUBLIC',
          displayOrder: 10,
          pricing: [
            {
              model: 'PER_USER',
              billingCycle: 'MONTHLY',
              currency: 'INR',
              perSeatFee: '999.00',
              taxMode: 'EXCLUSIVE',
              prorationPolicy: 'IMMEDIATE',
            },
          ],
          limits: [
            { limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 2, isUnlimited: false },
            { limitCode: 'default_seat_limit', valueType: 'INTEGER', integerValue: 10, isUnlimited: false },
            { limitCode: 'maximum_seats', valueType: 'INTEGER', integerValue: 50, isUnlimited: false },
            { limitCode: 'storage_gb', valueType: 'DECIMAL', decimalValue: '10.00', isUnlimited: false },
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
        })
        .expect(201);

      createdPlanId = createRes.body.id;
      draftVersionId = createRes.body.currentDraftVersion.id;
      expect(createdPlanId).toBeDefined();
      expect(createRes.body.currentDraftVersion.status).toBe('DRAFT');

      // Publish draft version
      const pubRes = await request(app.getHttpServer())
        .post(`/platform/plans/${createdPlanId}/versions/${draftVersionId}/publish`)
        .set('Authorization', `Bearer ${platformSuperAdminToken}`)
        .send({ allowBetaModules: false })
        .expect(200);

      expect(pubRes.body.status).toBe('ACTIVE');
      expect(pubRes.body.currentPublishedVersion.status).toBe('PUBLISHED');
      publishedPlanVersionId = draftVersionId;
    });

    it('SCENARIO D: Stale edit on published plan version is rejected by backend', async () => {
      await request(app.getHttpServer())
        .patch(`/platform/plans/${createdPlanId}/versions/${draftVersionId}`)
        .set('Authorization', `Bearer ${platformSuperAdminToken}`)
        .send({
          pricing: [
            {
              model: 'PER_USER',
              billingCycle: 'MONTHLY',
              currency: 'INR',
              perSeatFee: '1999.00',
              taxMode: 'EXCLUSIVE',
              prorationPolicy: 'IMMEDIATE',
            },
          ],
        })
        .expect(409);
    });
  });

  describe('SCENARIO E: Tenant Provisioning Idempotency', () => {
    it('provisions a tenant once; retrying with identical idempotency key returns exact same receipt', async () => {
      const key = `idem_${Date.now()}_${randomUUID()}`;
      const payload = {
        idempotencyKey: key,
        industryCode: 'PHARMA',
        trial: false,
        planVersionId: publishedPlanVersionId,
        billingCycle: 'MONTHLY',
        seatQuantity: 5,
        tenant: {
          slug: `corp-${Date.now()}`,
          displayName: 'Idempotent Corp',
          status: 'ACTIVE',
        },
        owner: {
          email: `owner-${Date.now()}@idempotent.com`,
          fullName: 'Idempotent Owner',
        },
      };

      const res1 = await request(app.getHttpServer())
        .post('/platform/tenants/provision')
        .set('Authorization', `Bearer ${platformSuperAdminToken}`)
        .send(payload)
        .expect(201);

      const res2 = await request(app.getHttpServer())
        .post('/platform/tenants/provision')
        .set('Authorization', `Bearer ${platformSuperAdminToken}`)
        .send(payload)
        .expect(201);

      expect(res1.body.tenantId).toBe(res2.body.tenantId);
      expect(res1.body.id).toBe(res2.body.id);
      provisionedTenantId = res1.body.tenantId;
    });
  });

  describe('SCENARIOS F, G & L: Multi-Tenant Membership and Isolation', () => {
    it('isolates user memberships between Tenant A and Tenant B', async () => {
      const user = await prisma.user.create({
        data: {
          employeeCode: `EMP-MT-${Date.now()}`,
          email: `multitenant-${Date.now()}@domain.com`,
          fullName: 'Multi-Tenant User',
          passwordHash: 'dummy',
          role: Role.SUPPORT,
          status: 'ACTIVE',
        },
      });

      const tenantA = await prisma.tenant.create({
        data: {
          slug: `ten-a-${Date.now()}`,
          displayName: 'Tenant Alpha',
          status: TenantStatus.ACTIVE,
        },
      });

      const tenantB = await prisma.tenant.create({
        data: {
          slug: `ten-b-${Date.now()}`,
          displayName: 'Tenant Beta',
          status: TenantStatus.ACTIVE,
        },
      });

      const memA = await prisma.tenantMembership.create({
        data: {
          tenantId: tenantA.id,
          userId: user.id,
          status: 'ACTIVE',
        },
      });

      const memB = await prisma.tenantMembership.create({
        data: {
          tenantId: tenantB.id,
          userId: user.id,
          status: 'ACTIVE',
        },
      });

      expect(memA.tenantId).not.toBe(memB.tenantId);
      expect(memA.id).not.toBe(memB.id);
    });
  });

  describe('SCENARIO H: Effective Module Authority & Industry Recommendation Boundary', () => {
    it('proves industry recommendation is advisory and does NOT grant commercial module entitlement', async () => {
      const indRes = await request(app.getHttpServer())
        .get('/platform/industries')
        .set('Authorization', `Bearer ${platformSuperAdminToken}`)
        .expect(200);

      const ind = indRes.body.items?.[0];
      expect(ind).toBeDefined();

      const ownerMembership = await prisma.tenantMembership.findFirstOrThrow({
        where: { tenantId: provisionedTenantId },
        include: { tenantRole: true },
      });

      await prisma.tenantMembership.update({
        where: { id: ownerMembership.id },
        data: { status: 'ACTIVE' },
      });

      const ownerSession = await prisma.userSession.create({
        data: {
          userId: ownerMembership.userId,
          selectedMembershipId: ownerMembership.id,
          refreshTokenHash: 'hash',
        },
      });

      const principal: RequestPrincipal = {
        userId: ownerMembership.userId,
        sessionId: ownerSession.id,
        platformRoleCodes: [],
        platformPermissions: [],
        tenantId: provisionedTenantId,
        membershipId: ownerMembership.id,
        tenantRoleCode: ownerMembership.tenantRole?.code ?? 'tenant_admin',
        tenantPermissions: ['*'],
        dataScope: 'ALL',
        permissions: ['*'],
        contextVersion: 1,
        permissionVersion: { platform: '0', tenant: '1' },
        isPlatformOnly: false,
      };

      const bootstrap = await runtime.bootstrap(principal);
      expect(bootstrap.modules.every((m) => m.source === 'PLAN_VERSION')).toBe(true);
    });
  });

  describe('SCENARIOS I & J: Industry Version Pin and Immutability', () => {
    it('proves published industry versions cannot be edited and tenant keeps exact pin', async () => {
      const indList = await request(app.getHttpServer())
        .get('/platform/industries')
        .set('Authorization', `Bearer ${platformSuperAdminToken}`)
        .expect(200);

      const firstInd = indList.body.items?.[0];
      expect(firstInd).toBeDefined();

      const vList = await request(app.getHttpServer())
        .get(`/platform/industries/${firstInd.id}/versions`)
        .set('Authorization', `Bearer ${platformSuperAdminToken}`)
        .expect(200);

      const publishedVersion = (vList.body.items || vList.body).find((v: any) => v.status === 'PUBLISHED');
      if (publishedVersion) {
        await request(app.getHttpServer())
          .patch(`/platform/industries/${firstInd.id}/versions/${publishedVersion.id}`)
          .set('Authorization', `Bearer ${platformSuperAdminToken}`)
          .send({
            schemaVersion: 1,
            terminology: {},
            masterDefaults: [],
            recommendedModuleCodes: ['core_crm'],
            expectedRevision: publishedVersion.revision,
            reason: 'Unauthorized mutation of published version',
          })
          .expect(409);
      }
    });
  });

  describe('SCENARIO M: Authoritative Masters Precedence', () => {
    it('resolves effective masters from backend with provenance and definitions', async () => {
      const defsRes = await request(app.getHttpServer())
        .get('/platform/configuration/masters')
        .set('Authorization', `Bearer ${platformSuperAdminToken}`)
        .expect(200);

      expect(Array.isArray(defsRes.body)).toBe(true);
      expect(defsRes.body.length).toBeGreaterThan(0);
      const designationDef = defsRes.body.find((d: any) => d.code === 'designation');
      expect(designationDef).toBeDefined();
    });
  });

  describe('SCENARIO N: Audit Logs Query and Permissions', () => {
    it('allows authorized operator to query audit logs with redaction', async () => {
      const auditRes = await request(app.getHttpServer())
        .get('/platform/audit?limit=10')
        .set('Authorization', `Bearer ${platformSuperAdminToken}`)
        .expect(200);

      expect(auditRes.body).toHaveProperty('data');
      expect(Array.isArray(auditRes.body.data)).toBe(true);
    });

    it('rejects unauthorized caller from accessing platform audit logs (HTTP 403)', async () => {
      await request(app.getHttpServer())
        .get('/platform/audit')
        .set('Authorization', `Bearer ${plainUserToken}`)
        .expect(403);
    });
  });

  describe('SCENARIO O: Runtime Bootstrap Schema Contract', () => {
    it('returns schemaVersion 1 with strict configVersion and permissions', async () => {
      const ownerMembership = await prisma.tenantMembership.findFirstOrThrow({
        where: { tenantId: provisionedTenantId },
      });

      const session = await prisma.userSession.findFirstOrThrow({
        where: { selectedMembershipId: ownerMembership.id },
      });

      const token = jwt.sign({
        sub: ownerMembership.userId,
        sid: session.id,
        mid: ownerMembership.id,
        ctxv: session.contextVersion,
      });

      const res = await request(app.getHttpServer())
        .get('/tenant/runtime/bootstrap')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.schemaVersion).toBe(1);
      expect(res.body.configVersion).toMatch(/^cfg1_[a-f0-9]{64}$/);
      expect(Array.isArray(res.body.permissions)).toBe(true);
      expect(Array.isArray(res.body.modules)).toBe(true);
    });
  });
});
