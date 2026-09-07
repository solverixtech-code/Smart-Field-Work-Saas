import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Prisma, PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { execFileSync, spawnSync } from 'child_process';
import request from 'supertest';
import { z } from 'zod';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/persistence/prisma.service';
import { IndustryService } from '../src/platform/industries/industry.service';
import { IndustryAssignmentService } from '../src/platform/industries/industry-assignment.service';
import { IndustryImportService } from '../src/platform/industries/industry-import.service';
import { INDUSTRY_CANDIDATES } from '../src/platform/industries/industry-candidates';
import { ProvisioningService } from '../src/platform/subscriptions/provisioning.service';
import { SubscriptionService } from '../src/platform/subscriptions/subscription.service';
import { payloadHash } from '../src/platform/subscriptions/subscription-contract';
import { industryMappings } from '../src/platform/industries/industry-contract';
import { verifyTestDatabaseSafety } from '../src/test-utils/test-db-safety';
import { seedTenantRoleTemplates } from '../prisma/seeds/tenant-role-templates';
import { syncRbac } from '../prisma/sync-rbac';
import { PlatformCatalogSyncService } from '../src/platform/modules/platform-catalog-sync.service';

describe('Phase 0.7 Industry PostgreSQL, API and concurrency proof', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let industries: IndustryService;
  let assignments: IndustryAssignmentService;
  let importer: IndustryImportService;
  let actorUserId: string;
  let token: string;
  let baseUrl: string;
  const schema = `phase07_${randomUUID().replace(/-/g, '')}`;
  const snapshot = {
    schemaVersion: 1,
    terminology: {},
    masterDefaults: [],
    recommendedModuleCodes: ['core_crm'],
  };
  const reason = 'Dedicated Phase 0.7 test fixture, not production approval';

  beforeAll(async () => {
    verifyTestDatabaseSafety();
    baseUrl = process.env.TEST_DATABASE_URL ?? '';
    const isolated = new URL(baseUrl);
    isolated.searchParams.set('schema', schema);
    process.env.DATABASE_URL = isolated.toString();
    execFileSync(
      process.execPath,
      [
        require.resolve('prisma/build/index.js'),
        'migrate',
        'deploy',
        '--schema=prisma/schema.prisma',
      ],
      { cwd: process.cwd(), env: process.env, stdio: 'pipe' },
    );
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    industries = app.get(IndustryService);
    assignments = app.get(IndustryAssignmentService);
    importer = app.get(IndustryImportService);
    await app.get(PlatformCatalogSyncService).syncCatalog();
    await seedTenantRoleTemplates(prisma);
    await syncRbac(prisma);
    const user = await makeUser();
    actorUserId = user.id;
    const role = await prisma.platformRole.findUniqueOrThrow({
      where: { code: 'PLATFORM_SUPER_ADMIN' },
    });
    await prisma.platformUserRoleAssignment.create({
      data: { userId: actorUserId, platformRoleId: role.id, status: 'ACTIVE' },
    });
    token = app.get(JwtService).sign({ sub: actorUserId });
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
    if (baseUrl) {
      const cleanup = new PrismaClient({
        datasources: { db: { url: baseUrl } },
      });
      if (!/^phase07_[a-f0-9]{32}$/.test(schema))
        throw new Error('Unsafe test schema');
      await cleanup.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
      );
      await cleanup.$disconnect();
      process.env.DATABASE_URL = baseUrl;
    }
  });

  function makeUser() {
    return prisma.user.create({
      data: {
        employeeCode: randomUUID(),
        fullName: 'Industry test user',
        email: `${randomUUID()}@test.invalid`,
        role: 'SUPPORT',
        passwordHash: 'test-unusable',
      },
    });
  }
  async function makeTemplate() {
    const code = `TEST_${randomUUID().replace(/-/g, '').toUpperCase()}`;
    await prisma.industryClassification.create({
      data: { code, name: 'Isolated Industry fixture' },
    });
    return industries.create(
      {
        code,
        name: 'Isolated Industry fixture',
        category: 'Test',
        description: reason,
      },
      actorUserId,
    );
  }
  async function draft(templateId: string, codes = ['core_crm']) {
    const template = await industries.detail(templateId);
    const created = await industries.createDraft(
      templateId,
      { expectedRevision: template.revision, reason },
      actorUserId,
    );
    return industries.updateDraft(
      templateId,
      created.id,
      {
        ...snapshot,
        recommendedModuleCodes: codes,
        expectedRevision: created.revision,
        reason,
      },
      actorUserId,
    );
  }
  function publish(
    templateId: string,
    version: { id: string; revision: number },
  ) {
    return industries.publish(
      templateId,
      version.id,
      {
        expectedRevision: version.revision,
        reason,
        approvalReference: 'TEST-ONLY-APPROVAL',
      },
      actorUserId,
    );
  }
  function tenant(code: string) {
    return prisma.tenant.create({
      data: {
        slug: `industry-${randomUUID()}`,
        displayName: 'Industry test Tenant',
        industryCode: code,
        status: 'ACTIVE',
      },
    });
  }
  function assign(tenantId: string, versionId: string) {
    return assignments.assign(
      tenantId,
      { industryTemplateVersionId: versionId, reason },
      actorUserId,
    );
  }
  async function direct(
    work: (tx: Prisma.TransactionClient) => Promise<unknown>,
  ) {
    return prisma.$transaction(
      async (tx) => {
        const result = await work(tx);
        await tx.$executeRaw`SET CONSTRAINTS ALL IMMEDIATE`;
        return result;
      },
      { timeout: 15000 },
    );
  }

  it('imports all 25 reviewed candidates as drafts atomically and replays without publishing', async () => {
    const review = await importer.run(INDUSTRY_CANDIDATES, actorUserId);
    expect(review.total).toBe(25);
    expect(await prisma.industryTemplate.count()).toBe(0);
    await expect(
      importer.run(INDUSTRY_CANDIDATES, actorUserId, 'wrong'),
    ).rejects.toThrow();
    await importer.run(INDUSTRY_CANDIDATES, actorUserId, review.sourceHash);
    const replay = await importer.run(
      INDUSTRY_CANDIDATES,
      actorUserId,
      review.sourceHash,
    );
    expect(
      replay.results.every((row) => row.status === 'ALREADY_IMPORTED'),
    ).toBe(true);
    expect(await prisma.industryTemplate.count()).toBe(25);
    expect(
      await prisma.industryTemplateVersion.count({
        where: { status: 'DRAFT' },
      }),
    ).toBe(25);
    expect(
      await prisma.industryTemplateVersion.count({
        where: { status: 'PUBLISHED' },
      }),
    ).toBe(0);
    expect(await prisma.industryTemplateModuleRecommendation.count()).toBe(69);
    await expect(
      importer.run(
        [{ ...INDUSTRY_CANDIDATES[0], defaultModules: ['unknown_module'] }],
        actorUserId,
      ),
    ).rejects.toThrow('Unknown');
    await expect(
      importer.run(
        [{ ...INDUSTRY_CANDIDATES[0], label: 'Unreviewed replacement' }],
        actorUserId,
      ),
    ).rejects.toThrow('provenance');
  });

  it('runs the actual CLI without HTTP bootstrap and enforces its actor permission', async () => {
    const run = (userId: string) =>
      spawnSync(
        process.execPath,
        [
          require.resolve('ts-node/dist/bin.js'),
          'prisma/backfills/reconcile-industries.ts',
          '--candidates',
          userId,
          '--dry-run',
        ],
        {
          cwd: process.cwd(),
          env: {
            ...process.env,
            JWT_ACCESS_SECRET: undefined,
            JWT_REFRESH_SECRET: undefined,
          },
          encoding: 'utf8',
          timeout: 30000,
        },
      );
    const allowed = run(actorUserId);
    expect({ status: allowed.status, stderr: allowed.stderr }).toEqual({
      status: 0,
      stderr: '',
    });
    const report = z
      .object({ mode: z.literal('DRY_RUN'), total: z.literal(25) })
      .parse(JSON.parse(allowed.stdout));
    expect(report.total).toBe(25);
    const denied = run((await makeUser()).id);
    expect(denied.status).toBe(1);
    expect(denied.stderr).toContain('required Industry permission');
  }, 60000);

  it('retains an exact v1 pin when v2 publishes, then explicitly migrates with immutable evidence', async () => {
    const template = await makeTemplate();
    const v1 = await publish(template.id, await draft(template.id));
    const customer = await tenant(template.code);
    await assign(customer.id, v1.id);
    const commercialBefore = {
      subscriptions: await prisma.tenantSubscription.count(),
      planModules: await prisma.planModule.count(),
      roles: await prisma.tenantRolePermission.count(),
      platformGrants: await prisma.platformRolePermission.count(),
    };
    const v2 = await publish(
      template.id,
      await draft(template.id, ['core_crm', 'field_visits']),
    );
    expect(
      (await assignments.read(customer.id))?.industryTemplateVersionId,
    ).toBe(v1.id);
    const migrated = await assignments.migrate(
      customer.id,
      { industryTemplateVersionId: v2.id, expectedRevision: 1, reason },
      actorUserId,
    );
    expect(migrated.industryTemplateVersionId).toBe(v2.id);
    expect(
      migrated.industryTemplateVersion.recommendations
        .map((r) => r.module.code)
        .sort(),
    ).toEqual(['core_crm', 'field_visits']);
    expect(
      (await assignments.history(customer.id, {})).items.map((r) => [
        r.fromVersionId,
        r.toVersionId,
      ]),
    ).toEqual([
      [v1.id, v2.id],
      [null, v1.id],
    ]);
    expect({
      subscriptions: await prisma.tenantSubscription.count(),
      planModules: await prisma.planModule.count(),
      roles: await prisma.tenantRolePermission.count(),
      platformGrants: await prisma.platformRolePermission.count(),
    }).toEqual(commercialBefore);
    expect(
      (await industries.version(template.id, v1.id)).recommendations.map(
        (r) => r.module.code,
      ),
    ).toEqual(['core_crm']);
  });

  it('rejects draft pins, mismatched classification, stale edits and silent reassignment', async () => {
    const template = await makeTemplate();
    const v1 = await draft(template.id);
    const customer = await tenant(template.code);
    await expect(assign(customer.id, v1.id)).rejects.toThrow('published');
    await expect(
      industries.updateDraft(
        template.id,
        v1.id,
        { ...snapshot, expectedRevision: 1, reason },
        actorUserId,
      ),
    ).rejects.toThrow('revision');
    await publish(template.id, v1);
    const other = await tenant('PHARMA');
    await expect(assign(other.id, v1.id)).rejects.toThrow('classification');
    await assign(customer.id, v1.id);
    await expect(assign(customer.id, v1.id)).rejects.toThrow(
      'explicit migration',
    );
    await expect(
      industries.updateDraft(
        template.id,
        v1.id,
        { ...snapshot, expectedRevision: v1.revision + 1, reason },
        actorUserId,
      ),
    ).rejects.toThrow('immutable');
  });

  it('serializes competing draft creation and update-versus-publish without accepting stale data', async () => {
    const template = await makeTemplate();
    const attempts = await Promise.allSettled(
      Array.from({ length: 10 }, () =>
        industries.createDraft(
          template.id,
          { expectedRevision: 1, reason },
          actorUserId,
        ),
      ),
    );
    expect(attempts.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    const version = (await industries.versions(template.id, {})).items[0];
    const race = await Promise.allSettled([
      industries.updateDraft(
        template.id,
        version.id,
        { ...snapshot, expectedRevision: version.revision, reason },
        actorUserId,
      ),
      publish(template.id, version),
    ]);
    expect(race.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect((await industries.versions(template.id, {})).total).toBe(1);
  }, 30000);

  it('allows exactly one competing migration at a revision and preserves both assignment records', async () => {
    const template = await makeTemplate();
    const v1 = await publish(template.id, await draft(template.id));
    const customer = await tenant(template.code);
    await assign(customer.id, v1.id);
    const v2 = await publish(template.id, await draft(template.id));
    const v3 = await publish(template.id, await draft(template.id));
    const outcomes = await Promise.allSettled(
      [v2, v3].map((v) =>
        assignments.migrate(
          customer.id,
          { industryTemplateVersionId: v.id, expectedRevision: 1, reason },
          actorUserId,
        ),
      ),
    );
    expect(outcomes.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect((await assignments.read(customer.id))?.revision).toBe(2);
    expect((await assignments.history(customer.id, {})).total).toBe(2);
  });

  it('preserves archived reads while blocking new publication and assignment', async () => {
    const template = await makeTemplate();
    const v1 = await publish(template.id, await draft(template.id));
    const customer = await tenant(template.code);
    await assign(customer.id, v1.id);
    const v2 = await draft(template.id);
    await industries.archive(
      template.id,
      {
        expectedRevision: (await industries.detail(template.id)).revision,
        reason,
      },
      actorUserId,
    );
    expect(
      (await assignments.read(customer.id))?.industryTemplateVersionId,
    ).toBe(v1.id);
    await expect(publish(template.id, v2)).rejects.toThrow('archived');
    await expect(
      assign((await tenant(template.code)).id, v1.id),
    ).rejects.toThrow('archived');
  });

  it('rejects direct published parent and child mutation, insertion, deletion and reparenting', async () => {
    const template = await makeTemplate();
    const v1 = await publish(template.id, await draft(template.id));
    const v2 = await draft(template.id);
    const other = await makeTemplate();
    const recommendation =
      await prisma.industryTemplateModuleRecommendation.findFirstOrThrow({
        where: { industryTemplateVersionId: v1.id },
      });
    const field = await prisma.platformModule.findUniqueOrThrow({
      where: { code: 'field_visits' },
    });
    const attacks: ((tx: Prisma.TransactionClient) => Promise<unknown>)[] = [
      (tx) =>
        tx.industryTemplateVersion.update({
          where: { id: v1.id },
          data: { revision: { increment: 1 }, version: 999 },
        }),
      (tx) =>
        tx.industryTemplateVersion.update({
          where: { id: v1.id },
          data: { revision: { increment: 1 }, industryTemplateId: other.id },
        }),
      (tx) => tx.industryTemplateVersion.delete({ where: { id: v1.id } }),
      (tx) =>
        tx.industryTemplateModuleRecommendation.create({
          data: { industryTemplateVersionId: v1.id, moduleId: field.id },
        }),
      (tx) =>
        tx.industryTemplateModuleRecommendation.update({
          where: { id: recommendation.id },
          data: { moduleId: field.id },
        }),
      (tx) =>
        tx.industryTemplateModuleRecommendation.delete({
          where: { id: recommendation.id },
        }),
      (tx) =>
        tx.industryTemplateModuleRecommendation.update({
          where: { id: recommendation.id },
          data: { industryTemplateVersionId: v2.id },
        }),
      (tx) =>
        tx.industryTemplate.update({
          where: { id: other.id },
          data: {
            currentPublishedVersionId: v1.id,
            revision: { increment: 1 },
          },
        }),
      (tx) =>
        tx.industryTemplate.update({
          where: { id: template.id },
          data: {
            currentPublishedVersionId: v2.id,
            revision: { increment: 1 },
          },
        }),
      (tx) =>
        tx.industryTemplateVersion.update({
          where: { id: v2.id },
          data: {
            terminology: { invented: 'Denied' },
            revision: { increment: 1 },
          },
        }),
      (tx) =>
        tx.industryTemplateVersion.update({
          where: { id: v2.id },
          data: {
            status: 'PUBLISHED',
            publishedAt: new Date(),
            publishedByUserId: actorUserId,
            revision: { increment: 1 },
          },
        }),
    ];
    for (const attack of attacks)
      await expect(direct(attack)).rejects.toThrow();
    expect(
      (await industries.version(template.id, v1.id)).recommendations,
    ).toHaveLength(1);
  });

  it('rejects forged or missing transition evidence and direct reclassification', async () => {
    const template = await makeTemplate();
    const v1 = await publish(template.id, await draft(template.id));
    const customer = await tenant(template.code);
    await expect(
      direct((tx) =>
        tx.tenantIndustryTemplateAssignment.create({
          data: {
            tenantId: customer.id,
            industryTemplateVersionId: v1.id,
            assignedByUserId: actorUserId,
          },
        }),
      ),
    ).rejects.toThrow();
    expect(await assignments.read(customer.id)).toBeNull();
    await assign(customer.id, v1.id);
    const change = await prisma.tenantIndustryTemplateChange.findFirstOrThrow({
      where: { tenantId: customer.id },
    });
    await expect(
      direct((tx) =>
        tx.tenantIndustryTemplateChange.update({
          where: { id: change.id },
          data: { reason: 'rewrite' },
        }),
      ),
    ).rejects.toThrow();
    await expect(
      direct((tx) =>
        tx.tenantIndustryTemplateChange.delete({ where: { id: change.id } }),
      ),
    ).rejects.toThrow();
    await expect(
      direct((tx) =>
        tx.tenantIndustryTemplateChange.create({
          data: {
            tenantId: customer.id,
            toVersionId: v1.id,
            actorUserId,
            reason,
            revision: 2,
          },
        }),
      ),
    ).rejects.toThrow();
    await expect(
      direct((tx) =>
        tx.tenant.update({
          where: { id: customer.id },
          data: { industryCode: 'PHARMA' },
        }),
      ),
    ).rejects.toThrow();
    await expect(
      direct((tx) =>
        tx.tenantIndustryTemplateAssignment.delete({
          where: { tenantId: customer.id },
        }),
      ),
    ).rejects.toThrow();
  });

  it('applies only reviewed explicit mappings and rolls back an invalid batch', async () => {
    const template = await makeTemplate();
    const v1 = await publish(template.id, await draft(template.id));
    const first = await tenant(template.code);
    const second = await tenant(template.code);
    const mappings = [first, second].map((t) => ({
      tenantId: t.id,
      industryTemplateVersionId: v1.id,
      reason,
    }));
    const review = await assignments.reconcile(mappings, actorUserId);
    expect(await assignments.read(first.id)).toBeNull();
    await expect(
      assignments.reconcile(mappings, actorUserId, 'bad-hash'),
    ).rejects.toThrow();
    const invalid = [...mappings, { ...mappings[0], tenantId: randomUUID() }];
    await expect(
      assignments.reconcile(
        invalid,
        actorUserId,
        payloadHash(industryMappings.parse(invalid)),
      ),
    ).rejects.toThrow('Tenant not found');
    await expect(assignments.reconcile(invalid, actorUserId)).rejects.toThrow(
      'Tenant not found',
    );
    expect(await assignments.read(first.id)).toBeNull();
    const result = await assignments.reconcile(
      mappings,
      actorUserId,
      review.mappingHash,
    );
    expect(result.results.every((r) => r.status === 'ASSIGNED')).toBe(true);
    expect(
      (await assignments.reconcile(mappings, actorUserId, review.mappingHash))
        .alreadyMapped,
    ).toBe(2);
    expect((await assignments.history(first.id, {})).total).toBe(1);
  });

  it('exercises the authorized HTTP lifecycle and keeps support read-only', async () => {
    const code = `HTTP_${randomUUID().replace(/-/g, '').toUpperCase()}`;
    await prisma.industryClassification.create({
      data: { code, name: 'HTTP test classification' },
    });
    const metadata = {
      code,
      name: 'HTTP template',
      category: 'Test',
      description: reason,
    };
    const created = await request(app.getHttpServer())
      .post('/platform/industries')
      .set('Authorization', `Bearer ${token}`)
      .send(metadata);
    expect(created.status).toBe(201);
    const identity = z
      .object({ id: z.string(), revision: z.number() })
      .parse(created.body);
    const createdDraft = await request(app.getHttpServer())
      .post(`/platform/industries/${identity.id}/versions/draft`)
      .set('Authorization', `Bearer ${token}`)
      .send({ expectedRevision: identity.revision, reason });
    expect(createdDraft.status).toBe(201);
    const version = z
      .object({ id: z.string(), revision: z.number() })
      .parse(createdDraft.body);
    const edited = await request(app.getHttpServer())
      .patch(`/platform/industries/${identity.id}/versions/${version.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ ...snapshot, expectedRevision: version.revision, reason });
    expect(edited.status).toBe(200);
    const editedVersion = z.object({ revision: z.number() }).parse(edited.body);
    expect(
      (
        await request(app.getHttpServer())
          .post(
            `/platform/industries/${identity.id}/versions/${version.id}/publish`,
          )
          .set('Authorization', `Bearer ${token}`)
          .send({
            expectedRevision: editedVersion.revision,
            reason,
            approvalReference: 'HTTP-TEST-ONLY',
          })
      ).status,
    ).toBe(201);
    const support = await makeUser();
    const supportRole = await prisma.platformRole.findUniqueOrThrow({
      where: { code: 'PLATFORM_SUPPORT' },
    });
    await prisma.platformUserRoleAssignment.create({
      data: {
        userId: support.id,
        platformRoleId: supportRole.id,
        status: 'ACTIVE',
      },
    });
    const supportToken = app.get(JwtService).sign({ sub: support.id });
    expect(
      (
        await request(app.getHttpServer())
          .get(`/platform/industries/${identity.id}`)
          .set('Authorization', `Bearer ${supportToken}`)
      ).status,
    ).toBe(200);
    expect(
      (
        await request(app.getHttpServer())
          .post(`/platform/industries/${identity.id}/archive`)
          .set('Authorization', `Bearer ${supportToken}`)
          .send({ expectedRevision: 3, reason })
      ).status,
    ).toBe(403);
    expect(
      (
        await request(app.getHttpServer())
          .post(`/platform/industries/${identity.id}/archive`)
          .set('Authorization', `Bearer ${token}`)
          .send({ expectedRevision: 3, reason })
      ).status,
    ).toBe(201);
  });

  it('enforces platform permissions, strict inputs and selected Tenant membership without UUID overrides', async () => {
    const template = await makeTemplate();
    const v1 = await publish(template.id, await draft(template.id));
    const customer = await tenant(template.code);
    const other = await tenant(template.code);
    await assign(customer.id, v1.id);
    const user = await makeUser();
    const membership = await prisma.tenantMembership.create({
      data: { tenantId: customer.id, userId: user.id, status: 'ACTIVE' },
    });
    const selected = app
      .get(JwtService)
      .sign({ sub: user.id, mid: membership.id });
    const noContext = app.get(JwtService).sign({ sub: user.id });
    expect(
      (await request(app.getHttpServer()).get('/platform/industries')).status,
    ).toBe(401);
    expect(
      (
        await request(app.getHttpServer())
          .get('/platform/industries')
          .set('Authorization', `Bearer ${selected}`)
      ).status,
    ).toBe(403);
    expect(
      (
        await request(app.getHttpServer())
          .get('/platform/industries?limit=101')
          .set('Authorization', `Bearer ${token}`)
      ).status,
    ).toBe(400);
    expect(
      (
        await request(app.getHttpServer())
          .post('/platform/industries')
          .set('Authorization', `Bearer ${token}`)
          .send({
            code: 'PHARMA',
            name: 'bad',
            category: 'bad',
            description: 'bad',
            price: 5,
          })
      ).status,
    ).toBe(400);
    expect(
      (
        await request(app.getHttpServer())
          .get('/tenant/industry-template')
          .set('Authorization', `Bearer ${noContext}`)
      ).status,
    ).toBe(403);
    const response = await request(app.getHttpServer())
      .get(`/tenant/industry-template?tenantId=${other.id}`)
      .set('x-tenant-id', other.id)
      .set('Authorization', `Bearer ${selected}`);
    expect(response.status).toBe(200);
    expect(response.body.tenantId).toBe(customer.id);
    await prisma.tenantMembership.update({
      where: { id: membership.id },
      data: { status: 'SUSPENDED' },
    });
    expect(
      (
        await request(app.getHttpServer())
          .get('/tenant/industry-template')
          .set('Authorization', `Bearer ${selected}`)
      ).status,
    ).toBe(403);
  });

  it('serializes direct child writes with publication in both lock orders', async () => {
    const template = await makeTemplate();
    const version = await draft(template.id);
    const field = await prisma.platformModule.findUniqueOrThrow({
      where: { code: 'field_visits' },
    });
    let releaseChild = () => {};
    let childLocked = () => {};
    const childGate = new Promise<void>((resolve) => {
      releaseChild = resolve;
    });
    const childReady = new Promise<void>((resolve) => {
      childLocked = resolve;
    });
    const child = direct(async (tx) => {
      await tx.industryTemplateModuleRecommendation.create({
        data: { industryTemplateVersionId: version.id, moduleId: field.id },
      });
      childLocked();
      await childGate;
    });
    await childReady;
    const publishing = publish(template.id, version);
    releaseChild();
    await Promise.all([child, publishing]);
    expect(
      (await industries.version(template.id, version.id)).recommendations,
    ).toHaveLength(2);

    const second = await draft(template.id, ['core_crm']);
    let releasePublish = () => {};
    let publishLocked = () => {};
    const publishGate = new Promise<void>((resolve) => {
      releasePublish = resolve;
    });
    const publishReady = new Promise<void>((resolve) => {
      publishLocked = resolve;
    });
    const publisher = direct(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "IndustryTemplate" WHERE id = ${template.id} FOR UPDATE`;
      await tx.industryTemplateVersion.update({
        where: { id: second.id },
        data: {
          status: 'PUBLISHED',
          revision: { increment: 1 },
          publishedAt: new Date(),
          publishedByUserId: actorUserId,
          approvalReference: 'TEST-ONLY',
        },
      });
      await tx.industryTemplate.update({
        where: { id: template.id },
        data: {
          currentPublishedVersionId: second.id,
          revision: { increment: 1 },
        },
      });
      publishLocked();
      await publishGate;
    });
    await publishReady;
    const lateChild = direct((tx) =>
      tx.industryTemplateModuleRecommendation.create({
        data: { industryTemplateVersionId: second.id, moduleId: field.id },
      }),
    );
    const rejectedChild = expect(lateChild).rejects.toThrow();
    releasePublish();
    await Promise.all([publisher, rejectedChild]);
    expect(
      (await industries.version(template.id, second.id)).recommendations,
    ).toHaveLength(1);
  }, 30000);

  it('keeps a provisioned Tenant commercial pin, seats, grants and history unchanged by recommendations', async () => {
    const core = await prisma.platformModule.findUniqueOrThrow({
      where: { code: 'core_crm' },
    });
    const plan = await prisma.plan.create({
      data: {
        code: `P_${randomUUID()}`,
        name: 'Industry test Plan',
        description: reason,
      },
    });
    const planVersion = await prisma.planVersion.create({
      data: {
        planId: plan.id,
        version: 1,
        modules: { create: { moduleId: core.id } },
        pricing: { create: { billingCycle: 'MONTHLY', perSeatFee: '100.00' } },
        limits: {
          create: [
            {
              limitCode: 'minimum_seats',
              valueType: 'INTEGER',
              integerValue: 1,
            },
            {
              limitCode: 'maximum_seats',
              valueType: 'INTEGER',
              integerValue: 10,
            },
          ],
        },
        commercialRule: {
          create: {
            rules: {
              trialEnabled: false,
              trialModulePolicy: 'USE_PLAN_MODULES',
              autoConvertAfterTrial: false,
              autoRenew: true,
              allowUpgrade: true,
              allowDowngrade: true,
              changeEffectiveTiming: 'IMMEDIATE',
              minimumCommitmentMonths: '0',
              availableForNewTenants: true,
              availableForExistingTenants: true,
              cancellationAllowed: true,
              gracePeriodDays: 7,
              accessAfterExpiry: 'READ_ONLY',
            },
          },
        },
      },
    });
    await direct(async (tx) => {
      await tx.planVersion.update({
        where: { id: planVersion.id },
        data: { status: 'PUBLISHED', publishedAt: new Date() },
      });
      await tx.plan.update({
        where: { id: plan.id },
        data: { status: 'ACTIVE', currentPublishedVersionId: planVersion.id },
      });
    });
    const template = await makeTemplate();
    const v1 = await publish(template.id, await draft(template.id));
    const provision = app.get(ProvisioningService);
    const receipt = await provision.provision(
      {
        idempotencyKey: randomUUID(),
        tenant: { slug: `commercial-${randomUUID()}`, displayName: reason },
        owner: {
          email: `${randomUUID()}@test.invalid`,
          fullName: 'Test owner',
        },
        industryCode: template.code,
        planVersionId: planVersion.id,
        billingCycle: 'MONTHLY',
        seatQuantity: 2,
        trial: false,
      },
      { userId: actorUserId },
    );
    const owner = await prisma.tenantMembership.findUniqueOrThrow({
      where: { id: receipt.ownerMembershipId },
    });
    await provision.accept(receipt.id, { userId: owner.userId });
    const ownerToken = app
      .get(JwtService)
      .sign({ sub: owner.userId, mid: owner.id });
    const before = await prisma.tenantSubscription.findUniqueOrThrow({
      where: { tenantId: receipt.tenantId },
    });
    const beforeHistory = await prisma.subscriptionChange.count({
      where: { tenantId: receipt.tenantId },
    });
    const beforeGrants = await prisma.tenantRolePermission.findMany({
      where: { tenantRole: { tenantId: receipt.tenantId } },
      select: { id: true },
      orderBy: { id: 'asc' },
    });
    await assign(receipt.tenantId, v1.id);
    const v2 = await publish(
      template.id,
      await draft(template.id, [
        'core_crm',
        'field_visits',
        'attendance',
        'payroll',
      ]),
    );
    await assignments.migrate(
      receipt.tenantId,
      { industryTemplateVersionId: v2.id, expectedRevision: 1, reason },
      actorUserId,
    );
    expect(
      await prisma.tenantSubscription.findUniqueOrThrow({
        where: { tenantId: receipt.tenantId },
      }),
    ).toEqual(before);
    expect(
      await prisma.subscriptionChange.count({
        where: { tenantId: receipt.tenantId },
      }),
    ).toBe(beforeHistory);
    expect(
      await prisma.tenantRolePermission.findMany({
        where: { tenantRole: { tenantId: receipt.tenantId } },
        select: { id: true },
        orderBy: { id: 'asc' },
      }),
    ).toEqual(beforeGrants);
    expect(
      await prisma.planModule.findMany({
        where: { planVersionId: before.planVersionId },
        select: { moduleId: true },
      }),
    ).toEqual([{ moduleId: core.id }]);
    expect(
      (
        await request(app.getHttpServer())
          .get('/tenant/industry-template')
          .set('Authorization', `Bearer ${ownerToken}`)
      ).status,
    ).toBe(200);
    await app.get(SubscriptionService).command(
      receipt.tenantId,
      {
        action: 'SUSPEND',
        expectedRevision: before.revision,
        idempotencyKey: randomUUID(),
        reason,
      },
      { userId: actorUserId },
    );
    expect(
      (
        await request(app.getHttpServer())
          .get('/tenant/industry-template')
          .set('Authorization', `Bearer ${ownerToken}`)
      ).status,
    ).toBe(403);
  });
});
