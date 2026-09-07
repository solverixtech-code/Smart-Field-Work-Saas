import { Controller, Get, INestApplication, Post, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Prisma, PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { execFileSync } from 'child_process';
import request from 'supertest';
import { z } from 'zod';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/persistence/prisma.service';
import { ProvisioningService } from '../src/platform/subscriptions/provisioning.service';
import { SubscriptionService } from '../src/platform/subscriptions/subscription.service';
import { ProvisioningEventService } from '../src/platform/subscriptions/provisioning-event.service';
import { SubscriptionReconciliationService } from '../src/platform/subscriptions/subscription-reconciliation.service';
import { SubscriptionTransactionService } from '../src/platform/subscriptions/subscription-transaction.service';
import { TenantService } from '../src/platform/tenants/tenant.service';
import { TenantAuthorized } from '../src/common/decorators/tenant-authorized.decorator';
import { RequirePermissions } from '../src/common/decorators/require-permissions.decorator';
import { jsonValue } from '../src/platform/subscriptions/subscription-contract';
import { verifyTestDatabaseSafety } from '../src/test-utils/test-db-safety';
import { seedTenantRoleTemplates } from '../prisma/seeds/tenant-role-templates';
import { syncRbac } from '../prisma/sync-rbac';
import { PlatformCatalogSyncService } from '../src/platform/modules/platform-catalog-sync.service';

@Controller('phase06-test-workspace')
@TenantAuthorized()
class WorkspaceProbeController {
  @Get() @RequirePermissions('workforce.shifts.view') read() { return { ok: true }; }
  @Post() @RequirePermissions('workforce.shifts.view') write() { return { ok: true }; }
}

const rules = {
  trialEnabled: true, trialDurationDays: 14, trialSeatLimit: 10, trialModulePolicy: 'USE_PLAN_MODULES',
  autoConvertAfterTrial: false, autoRenew: true, allowUpgrade: true, allowDowngrade: true,
  changeEffectiveTiming: 'IMMEDIATE', minimumCommitmentMonths: '0', availableForNewTenants: true,
  availableForExistingTenants: true, cancellationAllowed: true, gracePeriodDays: 7, accessAfterExpiry: 'READ_ONLY',
};
const receiptSchema = z.object({ id: z.string(), tenantId: z.string(), subscriptionId: z.string(), ownerMembershipId: z.string(), events: z.array(z.object({ id: z.string(), kind: z.string() })) });

describe('Phase 0.6 PostgreSQL, API, replay and concurrency proof', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let provision: ProvisioningService;
  let subscriptions: SubscriptionService;
  let events: ProvisioningEventService;
  let jwt: JwtService;
  let actor: { userId: string };
  let token: string;
  let outsider: { id: string; email: string };
  let versionId: string;
  let baseUrl: string;
  const schema = `phase06_${randomUUID().replace(/-/g, '')}`;

  beforeAll(async () => {
    verifyTestDatabaseSafety();
    baseUrl = process.env.TEST_DATABASE_URL ?? '';
    const isolated = new URL(baseUrl);
    isolated.searchParams.set('schema', schema);
    process.env.DATABASE_URL = isolated.toString();
    execFileSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy', '--schema=prisma/schema.prisma'], { cwd: process.cwd(), env: process.env, stdio: 'pipe' });
    const module = await Test.createTestingModule({ imports: [AppModule], controllers: [WorkspaceProbeController] }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);
    provision = app.get(ProvisioningService);
    subscriptions = app.get(SubscriptionService);
    events = app.get(ProvisioningEventService);
    jwt = app.get(JwtService);
    await app.get(PlatformCatalogSyncService).syncCatalog();
    await seedTenantRoleTemplates(prisma);
    await syncRbac(prisma);
    const user = await prisma.user.create({ data: { employeeCode: randomUUID(), fullName: 'Phase 0.6 Operator', email: `${randomUUID()}@test.invalid`, role: 'SUPPORT', passwordHash: 'test-unusable' } });
    actor = { userId: user.id };
    const role = await prisma.platformRole.findUniqueOrThrow({ where: { code: 'PLATFORM_SUPER_ADMIN' } });
    await prisma.platformUserRoleAssignment.create({ data: { userId: user.id, platformRoleId: role.id, status: 'ACTIVE' } });
    token = jwt.sign({ sub: user.id });
    outsider = await prisma.user.create({ data: { employeeCode: randomUUID(), fullName: 'Other user', email: `${randomUUID()}@test.invalid`, role: 'SUPER_ADMIN', passwordHash: 'unchanged-secret-hash' } });
    versionId = await makePlan();
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
    if (baseUrl) {
      const cleanup = new PrismaClient({ datasources: { db: { url: baseUrl } } });
      // Exact suite-owned random schema only; never truncate shared/production tables.
      if (!/^phase06_[a-f0-9]{32}$/.test(schema)) throw new Error('Unsafe test schema');
      await cleanup.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      await cleanup.$disconnect();
      process.env.DATABASE_URL = baseUrl;
    }
  });

  async function makePlan(overrides: Prisma.InputJsonObject = {}) {
    const core = await prisma.platformModule.findUniqueOrThrow({ where: { code: 'core_crm' } });
    const plan = await prisma.plan.create({ data: { code: `P_${randomUUID()}`, name: 'Phase 0.6 test Plan', description: 'Test commercial contract' } });
    const v = await prisma.planVersion.create({ data: { planId: plan.id, version: 1,
      modules: { create: { moduleId: core.id } },
      pricing: { create: [{ billingCycle: 'MONTHLY', perSeatFee: '100.00' }, { billingCycle: 'ANNUAL', perSeatFee: '1200.00' }] },
      limits: { create: [{ limitCode: 'minimum_seats', valueType: 'INTEGER', integerValue: 1 }, { limitCode: 'maximum_seats', valueType: 'INTEGER', integerValue: 100 }] },
      commercialRule: { create: { rules: { ...rules, ...overrides } } },
    } });
    await prisma.$transaction(async tx => {
      await tx.planVersion.update({ where: { id: v.id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
      await tx.plan.update({ where: { id: plan.id }, data: { status: 'ACTIVE', currentPublishedVersionId: v.id } });
    });
    return v.id;
  }

  function payload(planVersionId = versionId) {
    const id = randomUUID();
    return { idempotencyKey: id, tenant: { slug: `tenant-${id}`, displayName: 'Test tenant' }, owner: { email: `${id}@test.invalid`, fullName: 'Owner' }, industryCode: 'PHARMA', planVersionId, billingCycle: 'MONTHLY', seatQuantity: 5, trial: false };
  }
  async function create(planVersionId = versionId) { return receiptSchema.parse(await provision.provision(payload(planVersionId), actor)); }
  async function command(tenantId: string, action: string, extra = {}) {
    const sub = await prisma.tenantSubscription.findUniqueOrThrow({ where: { tenantId } });
    return subscriptions.command(tenantId, { idempotencyKey: randomUUID(), expectedRevision: sub.revision, reason: 'Test command', action, ...extra }, actor);
  }
  // Backdate fixtures through a real audited revision, without disabling integrity triggers.
  async function dates(tenantId: string, data: { currentPeriodEnd?: Date; currentPeriodStart?: Date; trialEndsAt?: Date; graceEndsAt?: Date }) {
    await prisma.$transaction(async tx => {
      const old = await tx.tenantSubscription.findUniqueOrThrow({ where: { tenantId } });
      const next = await tx.tenantSubscription.update({ where: { tenantId }, data: { ...data, revision: { increment: 1 } } });
      await tx.subscriptionChange.create({ data: { subscriptionId: old.id, tenantId, idempotencyKey: randomUUID(), payloadHash: 'test-fixture', kind: 'TEST_CLOCK', reason: 'Deterministic time boundary', fromPlanVersionId: old.planVersionId, toPlanVersionId: old.planVersionId, fromStatus: old.status, toStatus: next.status, status: 'APPLIED', effectiveAt: new Date(), appliedAt: new Date(), actorUserId: actor.userId, revision: next.revision, requestData: jsonValue(data), result: jsonValue(next) } });
    });
  }

  it('converges 20 identical HTTP provisions to exactly one Tenant, owner, membership, Subscription and two logical events', async () => {
    const body = payload();
    const responses = await Promise.all(Array.from({ length: 20 }, () => request(app.getHttpServer()).post('/platform/tenants/provision').set('Authorization', `Bearer ${token}`).send(body)));
    expect(responses.map(r => r.status)).toEqual(Array(20).fill(201));
    expect(new Set(responses.map(r => receiptSchema.parse(r.body).id)).size).toBe(1);
    const receipt = receiptSchema.parse(responses[0].body);
    expect(await prisma.tenant.count({ where: { slug: body.tenant.slug } })).toBe(1);
    expect(await prisma.user.count({ where: { email: body.owner.email } })).toBe(1);
    expect(await prisma.tenantMembership.count({ where: { tenantId: receipt.tenantId } })).toBe(1);
    expect(await prisma.tenantSubscription.count({ where: { tenantId: receipt.tenantId } })).toBe(1);
    expect(await prisma.provisioningEvent.count({ where: { provisioningId: receipt.id } })).toBe(2);
    expect(await prisma.subscriptionChange.count({ where: { tenantId: receipt.tenantId } })).toBe(1);
    const conflict = await request(app.getHttpServer()).post('/platform/tenants/provision').set('Authorization', `Bearer ${token}`).send({ ...body, seatQuantity: 6 });
    expect(conflict.status).toBe(409);
  }, 60000);

  it('normalizes email and slug for replay and preserves an existing owner identity and credentials', async () => {
    const body = { ...payload(), owner: { email: outsider.email.toUpperCase(), fullName: 'Do not overwrite' } };
    const first = await provision.provision(body, actor);
    const second = await provision.provision({ ...body, owner: { ...body.owner, email: outsider.email }, tenant: { ...body.tenant, slug: ` ${body.tenant.slug.toUpperCase()} ` } }, actor);
    expect(first).toEqual(second);
    expect(await prisma.user.findUnique({ where: { id: outsider.id }, select: { passwordHash: true, fullName: true } })).toEqual({ passwordHash: 'unchanged-secret-hash', fullName: 'Other user' });
    expect((await prisma.tenantMembership.findUniqueOrThrow({ where: { id: first.ownerMembershipId } })).status).toBe('INVITED');
    await expect(provision.accept(first.id, actor)).rejects.toThrow('another user');
    const accepted = await provision.accept(first.id, { userId: outsider.id });
    expect(await provision.accept(first.id, { userId: outsider.id })).toEqual(accepted);
  });

  it('rolls back owner, Tenant and children when the commercial selection fails, then retries successfully', async () => {
    const body = payload('missing-version');
    await expect(provision.provision(body, actor)).rejects.toThrow();
    expect(await prisma.tenant.count({ where: { slug: body.tenant.slug } })).toBe(0);
    expect(await prisma.user.count({ where: { email: body.owner.email } })).toBe(0);
    expect(await prisma.tenantProvisioning.count({ where: { idempotencyKey: body.idempotencyKey } })).toBe(0);
    expect(await provision.provision({ ...body, planVersionId: versionId }, actor)).toHaveProperty('subscriptionId');
  });

  it('rolls back foundation and membership helpers with an outer transaction', async () => {
    const slug = `rollback-${randomUUID()}`;
    await expect(prisma.$transaction(async tx => {
      await app.get(TenantService).createTenantFoundation({ slug, displayName: 'Rollback' }, tx);
      throw new Error('injected failure');
    })).rejects.toThrow('injected failure');
    expect(await prisma.tenant.count({ where: { slug } })).toBe(0);
  });

  it('requires platform grants on every command and exact authenticated owner for acceptance', async () => {
    const r = await create();
    const otherToken = jwt.sign({ sub: outsider.id });
    for (const path of ['/platform/tenants/provision', `/platform/tenants/${r.tenantId}/subscription/commands`, `/platform/provisioning/events/${r.events[0].id}/claim`, `/platform/provisioning/events/${r.events[0].id}/acknowledge`]) {
      expect((await request(app.getHttpServer()).post(path).set('Authorization', `Bearer ${otherToken}`).send({})).status).toBe(403);
      expect((await request(app.getHttpServer()).post(path).send({})).status).toBe(401);
    }
    expect((await request(app.getHttpServer()).post(`/invitations/${r.id}/accept`).set('Authorization', `Bearer ${otherToken}`)).status).toBe(403);
    expect((await request(app.getHttpServer()).get(`/platform/tenants/${r.tenantId}/subscription`).set('Authorization', `Bearer ${otherToken}`)).status).toBe(403);
  });

  it('returns safe validation errors and bounds pagination', async () => {
    expect((await request(app.getHttpServer()).post('/platform/tenants/provision').set('Authorization', `Bearer ${token}`).send({ ...payload(), seatQuantity: -1 })).status).toBe(400);
    expect((await request(app.getHttpServer()).get('/platform/provisioning/events?limit=10000').set('Authorization', `Bearer ${token}`)).status).toBe(400);
  });

  it('serializes competing Plan changes using optimistic revision checks and stable replay receipts', async () => {
    const r = await create();
    const next = await makePlan();
    const body = { idempotencyKey: randomUUID(), expectedRevision: 1, reason: 'Upgrade', action: 'CHANGE_PLAN', planVersionId: next, billingCycle: 'MONTHLY', seatQuantity: 6 };
    const results = await Promise.allSettled([subscriptions.command(r.tenantId, body, actor), subscriptions.command(r.tenantId, { ...body, idempotencyKey: randomUUID(), seatQuantity: 7 }, actor)]);
    expect(results.filter(x => x.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(x => x.status === 'rejected')).toHaveLength(1);
    if (results[0].status === 'fulfilled') expect(await subscriptions.command(r.tenantId, body, actor)).toEqual(results[0].value);
    expect((await subscriptions.get(r.tenantId)).revision).toBe(2);
  });

  it.each([['CANCEL', 'CHANGE_PLAN'], ['SUSPEND', 'ACTIVATE']])('serializes %s versus %s', async (first, second) => {
    const r = await create();
    if (second === 'ACTIVATE') await command(r.tenantId, 'PAST_DUE');
    const sub = await prisma.tenantSubscription.findUniqueOrThrow({ where: { tenantId: r.tenantId } });
    const base = { expectedRevision: sub.revision, reason: 'Concurrent command' };
    const results = await Promise.allSettled([
      subscriptions.command(r.tenantId, { ...base, idempotencyKey: randomUUID(), action: first }, actor),
      subscriptions.command(r.tenantId, { ...base, idempotencyKey: randomUUID(), action: second, ...(second === 'CHANGE_PLAN' ? { planVersionId: versionId, billingCycle: 'MONTHLY', seatQuantity: 6 } : {}) }, actor),
    ]);
    expect(results.filter(x => x.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(x => x.status === 'rejected')).toHaveLength(1);
  });

  it('applies NEXT_BILLING_CYCLE changes only when due and preserves the original pin and receipt until then', async () => {
    const source = await makePlan({ changeEffectiveTiming: 'NEXT_BILLING_CYCLE' });
    const r = await create(source);
    const body = { action: 'CHANGE_PLAN', idempotencyKey: randomUUID(), reason: 'Scheduled', expectedRevision: 1, planVersionId: versionId, billingCycle: 'ANNUAL', seatQuantity: 6 };
    const receipt = await subscriptions.command(r.tenantId, body, actor);
    expect((await subscriptions.get(r.tenantId)).planVersionId).toBe(source);
    await expect(command(r.tenantId, 'APPLY_DUE')).rejects.toThrow('No lifecycle');
    const past = new Date(Date.now() - 60000);
    // Scheduling uses period boundary frozen at request time; create another due fixture.
    const due = await create(source);
    await dates(due.tenantId, { currentPeriodStart: new Date(Date.now() - 86400000), currentPeriodEnd: past });
    await command(due.tenantId, 'CHANGE_PLAN', { planVersionId: versionId, billingCycle: 'ANNUAL', seatQuantity: 6 });
    await command(due.tenantId, 'APPLY_DUE');
    expect((await subscriptions.get(due.tenantId)).planVersionId).toBe(versionId);
    expect((await subscriptions.get(due.tenantId)).billingCycle).toBe('ANNUAL');
    expect(await subscriptions.command(r.tenantId, body, actor)).toEqual(receipt);
  });

  it('preserves expired trial on suspend/resume and obeys auto-conversion and auto-renew rules', async () => {
    const r = receiptSchema.parse(await provision.provision({ ...payload(), trial: true }, actor));
    await dates(r.tenantId, { trialEndsAt: new Date(Date.now() - 1000) });
    await command(r.tenantId, 'SUSPEND');
    await expect(command(r.tenantId, 'ACTIVATE')).rejects.toThrow();
    await command(r.tenantId, 'RESUME');
    expect((await subscriptions.get(r.tenantId)).access).toBe('READ_ONLY');
    await command(r.tenantId, 'APPLY_DUE');
    expect((await subscriptions.get(r.tenantId)).status).toBe('PAST_DUE');
    const automatic = await makePlan({ autoConvertAfterTrial: true, autoRenew: false });
    const converted = receiptSchema.parse(await provision.provision({ ...payload(automatic), trial: true }, actor));
    await dates(converted.tenantId, { trialEndsAt: new Date(Date.now() - 1000) });
    await command(converted.tenantId, 'APPLY_DUE');
    expect((await subscriptions.get(converted.tenantId)).status).toBe('ACTIVE');
    await dates(converted.tenantId, { currentPeriodStart: new Date(Date.now() - 86400000), currentPeriodEnd: new Date(Date.now() - 1000) });
    await command(converted.tenantId, 'APPLY_DUE');
    expect((await subscriptions.get(converted.tenantId)).status).toBe('PAST_DUE');
  });

  it('enforces commitment, trial seats, availability and commercial change flags', async () => {
    const restricted = await makePlan({ minimumCommitmentMonths: '12', allowUpgrade: false, allowDowngrade: false, trialSeatLimit: 1 });
    await expect(provision.provision({ ...payload(restricted), trial: true }, actor)).rejects.toThrow('trial seats');
    const r = await create(restricted);
    await expect(command(r.tenantId, 'CANCEL')).rejects.toThrow('commitment');
    await expect(command(r.tenantId, 'CHANGE_PLAN', { planVersionId: versionId, billingCycle: 'MONTHLY', seatQuantity: 6 })).rejects.toThrow('does not allow');
    const unavailable = await makePlan({ availableForNewTenants: false });
    await expect(create(unavailable)).rejects.toThrow('unavailable');
  });

  it('records invitation failures and retries against one event, rejecting competing and stale claims', async () => {
    const r = await create();
    const id = r.events.find(e => e.kind === 'OWNER_INVITATION')?.id ?? '';
    const attempt = { attemptKey: randomUUID() };
    const lease = await events.claim(id, attempt, actor);
    expect(await events.claim(id, attempt, actor)).toEqual(lease);
    await expect(events.claim(id, { attemptKey: randomUUID() }, actor)).rejects.toThrow('leased');
    await events.finish(id, { leaseToken: lease.leaseToken, status: 'FAILED', errorCode: 'PROVIDER_UNAVAILABLE' }, actor);
    const retry = await events.claim(id, { attemptKey: randomUUID() }, actor);
    await expect(events.finish(id, { leaseToken: lease.leaseToken, status: 'COMPLETED' }, actor)).rejects.toThrow();
    const ack = { leaseToken: retry.leaseToken, status: 'COMPLETED' };
    expect(await events.finish(id, ack, actor)).toEqual(await events.finish(id, ack, actor));
    expect(await prisma.provisioningAttempt.count({ where: { eventId: id } })).toBe(2);
    expect(await prisma.provisioningEvent.count({ where: { id } })).toBe(1);
  });

  it('expires abandoned leases and records their failure before reclaiming', async () => {
    const r = await create();
    const id = r.events[0].id;
    const first = await events.claim(id, { attemptKey: randomUUID() }, actor);
    await prisma.provisioningEvent.update({ where: { id }, data: { leaseEndsAt: new Date(Date.now() - 1000) } });
    const next = await events.claim(id, { attemptKey: randomUUID() }, actor);
    expect(next.leaseToken).not.toBe(first.leaseToken);
    expect((await prisma.provisioningAttempt.findUniqueOrThrow({ where: { leaseToken: first.leaseToken } })).errorCode).toBe('LEASE_EXPIRED');
  });

  it('enforces direct-database uniqueness, same-Tenant owner/subscription, revision, history and terminal constraints', async () => {
    const r = await create();
    const other = await create();
    const sub = await prisma.tenantSubscription.findUniqueOrThrow({ where: { tenantId: r.tenantId } });
    const { id: ignoredId, createdAt: ignoredCreated, updatedAt: ignoredUpdated, ...copy } = sub;
    await expect(prisma.tenantSubscription.create({ data: copy })).rejects.toThrow();
    await expect(prisma.tenantSubscription.update({ where: { id: sub.id }, data: { seatQuantity: 6 } })).rejects.toThrow();
    await expect(prisma.tenantSubscription.update({ where: { id: sub.id }, data: { seatQuantity: 6, revision: { increment: 1 } } })).rejects.toThrow();
    await expect(prisma.tenantSubscription.delete({ where: { id: sub.id } })).rejects.toThrow();
    await expect(prisma.tenantProvisioning.update({ where: { id: r.id }, data: { ownerMembershipId: other.ownerMembershipId } })).rejects.toThrow();
    await expect(prisma.subscriptionChange.deleteMany({ where: { subscriptionId: sub.id } })).rejects.toThrow();
    await command(r.tenantId, 'CANCEL');
    await expect(command(r.tenantId, 'ACTIVATE')).rejects.toThrow('terminal');
    await expect(prisma.tenantSubscription.update({ where: { id: sub.id }, data: { status: 'ACTIVE', revision: { increment: 1 } } })).rejects.toThrow();
  });

  it('enforces subscription access after membership/RBAC, without platform or client-Tenant bypass', async () => {
    const r = await create();
    const owner = await prisma.tenantMembership.findUniqueOrThrow({ where: { id: r.ownerMembershipId }, select: { userId: true, tenantRoleId: true } });
    await provision.accept(r.id, { userId: owner.userId });
    // The probe uses an existing permission; explicitly grant it in this test role.
    const perm = await prisma.permission.findUniqueOrThrow({ where: { code: 'workforce.shifts.view' } });
    await prisma.tenantRolePermission.upsert({ where: { tenantRoleId_permissionId: { tenantRoleId: owner.tenantRoleId ?? '', permissionId: perm.id } }, create: { tenantRoleId: owner.tenantRoleId ?? '', permissionId: perm.id }, update: {} });
    const ownerToken = jwt.sign({ sub: owner.userId, mid: r.ownerMembershipId });
    const hit = (method: 'get' | 'post', auth = ownerToken) => request(app.getHttpServer())[method]('/phase06-test-workspace').set('Authorization', `Bearer ${auth}`);
    expect((await hit('post')).status).toBe(201);
    await command(r.tenantId, 'PAST_DUE');
    expect((await hit('get')).status).toBe(200);
    expect((await hit('post')).status).toBe(403);
    expect((await hit('get', token)).status).toBe(403);
    expect((await hit('get', jwt.sign({ sub: outsider.id, mid: r.ownerMembershipId }))).status).toBe(403);
    await command(r.tenantId, 'GRACE');
    expect((await hit('post')).status).toBe(201);
    await dates(r.tenantId, { graceEndsAt: new Date(Date.now() - 1000) });
    expect((await hit('post')).status).toBe(403);
    await command(r.tenantId, 'SUSPEND');
    expect((await hit('get')).status).toBe(403);
  });

  it('requires explicit reconciliation, supports dry-run and equal replay, and rejects conflicting mappings', async () => {
    const legacy = await app.get(TenantService).createTenantFoundation({ slug: `legacy-${randomUUID()}`, displayName: 'Legacy', status: 'ACTIVE' });
    const service = app.get(SubscriptionReconciliationService);
    const mappings = [{ tenantId: legacy.id, industryCode: 'PHARMA', planVersionId: versionId, billingCycle: 'MONTHLY', seatQuantity: 5, startedAt: new Date().toISOString(), reason: 'Approved test mapping' }];
    const dry = await service.run(mappings, actor);
    expect(await prisma.tenantSubscription.findUnique({ where: { tenantId: legacy.id } })).toBeNull();
    expect(dry.results[0].status).toBe('WOULD_CREATE');
    await service.run(mappings, actor, dry.mappingHash);
    expect((await service.run(mappings, actor, dry.mappingHash)).results[0].status).toBe('ALREADY_MAPPED');
    await expect(service.run([{ ...mappings[0], seatQuantity: 6 }], actor, dry.mappingHash)).rejects.toThrow('differs');
  });

  it('retries retryable database conflicts within a bounded transaction budget', async () => {
    let calls = 0;
    const value = await app.get(SubscriptionTransactionService).run(`retry-test:${randomUUID()}`, async () => {
      if (++calls < 3) throw new Prisma.PrismaClientKnownRequestError('Injected serialization conflict', { code: 'P2034', clientVersion: '5.22.0' });
      return 'committed';
    });
    expect(value).toBe('committed');
    expect(calls).toBe(3);
  });

  it('never follows the current Plan pointer and rejects draft versions', async () => {
    const r = await create();
    const original = await prisma.planVersion.findUniqueOrThrow({ where: { id: versionId } });
    const draft = await prisma.planVersion.create({ data: { planId: original.planId, version: 2 } });
    await expect(create(draft.id)).rejects.toThrow('published');
    await prisma.$transaction(async tx => {
      await tx.planVersion.update({ where: { id: draft.id }, data: { status: 'PUBLISHED', publishedAt: new Date() } });
      await tx.plan.update({ where: { id: original.planId }, data: { currentPublishedVersionId: draft.id } });
    });
    expect((await subscriptions.get(r.tenantId)).planVersionId).toBe(versionId);
    await expect(create(draft.id)).rejects.toThrow();
  });

  it('rejects fabricated applied history even through direct database writes', async () => {
    const r = await create();
    const history = await prisma.subscriptionChange.findFirstOrThrow({ where: { tenantId: r.tenantId } });
    const { id: ignored, ...data } = history;
    await expect(prisma.subscriptionChange.create({ data: { ...data, requestData: jsonValue(data.requestData), result: jsonValue(data.result), idempotencyKey: randomUUID(), revision: 99, fromStatus: 'PAST_DUE', toStatus: 'ACTIVE' } })).rejects.toThrow();
    await expect(prisma.$transaction(async tx => {
      await tx.tenantSubscription.update({ where: { tenantId: r.tenantId }, data: { status: 'PAST_DUE', revision: { increment: 1 } } });
      await tx.subscriptionChange.create({ data: { ...data, requestData: jsonValue(data.requestData), result: jsonValue(data.result), idempotencyKey: randomUUID(), revision: 2, fromStatus: 'GRACE', toStatus: 'PAST_DUE' } });
    })).rejects.toThrow();
    expect((await subscriptions.get(r.tenantId)).revision).toBe(1);
  });

  it('enforces occupied seats against direct membership writes', async () => {
    const r = receiptSchema.parse(await provision.provision({ ...payload(), seatQuantity: 1 }, actor));
    await expect(prisma.tenantMembership.create({ data: { tenantId: r.tenantId, userId: outsider.id, status: 'INVITED' } })).rejects.toThrow();
    expect(await prisma.tenantMembership.count({ where: { tenantId: r.tenantId } })).toBe(1);
    await expect(prisma.tenant.update({ where: { id: r.tenantId }, data: { industryCode: null } })).rejects.toThrow();
    await expect(prisma.provisioningEvent.delete({ where: { id: r.events[0].id } })).rejects.toThrow();
  });

  it('reuses one global owner across concurrent independent Tenant provisions', async () => {
    const email = `${randomUUID()}@test.invalid`;
    const first = { ...payload(), owner: { email, fullName: 'Shared owner' } };
    const second = { ...payload(), owner: { email: email.toUpperCase(), fullName: 'Shared owner' } };
    const receipts = await Promise.all([provision.provision(first, actor), provision.provision(second, actor)]);
    expect(new Set(receipts.map(r => r.ownerMembershipId)).size).toBe(2);
    expect(await prisma.user.count({ where: { email } })).toBe(1);
    expect(JSON.stringify(receipts)).not.toMatch(/passwordHash|passwordReset|leaseToken/);
  });
});
