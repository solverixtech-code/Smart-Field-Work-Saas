import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { Prisma, PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { execFileSync } from "child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join, resolve, sep } from "path";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/persistence/prisma.service";
import { verifyTestDatabaseSafety } from "../src/test-utils/test-db-safety";
import { seedTenantRoleTemplates } from "../prisma/seeds/tenant-role-templates";
import { syncRbac } from "../prisma/sync-rbac";
import { PlatformCatalogSyncService } from "../src/platform/modules/platform-catalog-sync.service";
import { MasterSeedService } from "../src/platform/masters/master-seed.service";
import { MasterService } from "../src/platform/masters/master.service";
import { EffectiveMasterService } from "../src/platform/masters/effective-master.service";
import { IndustryService } from "../src/platform/industries/industry.service";
import { IndustryAssignmentService } from "../src/platform/industries/industry-assignment.service";
import { ProvisioningService } from "../src/platform/subscriptions/provisioning.service";
import { SubscriptionService } from "../src/platform/subscriptions/subscription.service";
import { SubscriptionCommand } from "../src/platform/subscriptions/subscription-contract";
import { TenantService } from "../src/platform/tenants/tenant.service";
import { EffectivePermissionService } from "../src/common/security/effective-permission.service";
import { AuthSecurityModule } from "../src/common/security/auth-security.module";
import { RequestPrincipalService } from "../src/common/security/request-principal.service";
import { AuthService } from "../src/auth/auth.service";
import { RuntimeConfigService } from "../src/runtime/runtime-config.service";
import {
  RuntimeClock,
  RuntimeConfigCache,
} from "../src/runtime/runtime-cache.service";
import {
  runtimeBootstrapSchema,
  RuntimeBootstrap,
  SYSTEM_RUNTIME_SETTINGS,
} from "../src/runtime/runtime-contract";

describe("Phase 0.9 authoritative runtime configuration", () => {
  let app: INestApplication,
    prisma: PrismaClient,
    actor: string,
    platformToken: string,
    baseUrl: string;
  let runtime: RuntimeConfigService,
    masters: MasterService,
    clock: RuntimeClock;
  let queryCount = 0;
  const schema = `phase09_${randomUUID().replace(/-/g, "")}`;
  const reason = "Isolated M9 test, not production configuration";
  const route = "/tenant/runtime/bootstrap";
  const label = (code: string) => ({
    code,
    name: code,
    description: null,
    displayColor: null,
    sortOrder: 100,
    isActive: true,
    reason,
  });
  const override = (displayName: string | null, isHidden = false) => ({
    displayName,
    isHidden,
    displayColor: null,
    sortOrder: null,
    expectedRevision: 0,
    reason,
  });
  type TenantFixture = {
    id: string;
    userId: string;
    membershipId: string;
    token: string;
    roleId: string;
    planVersionId: string;
  };

  beforeAll(async () => {
    verifyTestDatabaseSafety();
    baseUrl = process.env.TEST_DATABASE_URL ?? "";
    const isolated = new URL(baseUrl);
    isolated.searchParams.set("schema", schema);
    process.env.DATABASE_URL = isolated.toString();
    // Rehearse real upgrade/backfill: deploy the unchanged 27-migration baseline,
    // add existing owner rows, then deploy M9 through the normal migration engine.
    const baselineDir = mkdtempSync(join(tmpdir(), "sfw-m9-upgrade-"));
    let legacyTenantId: string, legacyVersionId: string;
    const deploy = (schemaPath: string) =>
      execFileSync(
        process.execPath,
        [
          require.resolve("prisma/build/index.js"),
          "migrate",
          "deploy",
          `--schema=${schemaPath}`,
        ],
        { cwd: process.cwd(), env: process.env, stdio: "pipe" },
      );
    try {
      mkdirSync(join(baselineDir, "migrations"));
      writeFileSync(
        join(baselineDir, "schema.prisma"),
        'datasource db {\n provider = "postgresql"\n url = env("DATABASE_URL")\n}\n',
      );
      const history = readdirSync("prisma/migrations", {
        withFileTypes: true,
      }).filter(
        (entry) => entry.isDirectory() && entry.name < "20260908110000",
      );
      expect(history).toHaveLength(27);
      for (const entry of history)
        cpSync(
          join("prisma/migrations", entry.name),
          join(baselineDir, "migrations", entry.name),
          { recursive: true },
        );
      cpSync(
        "prisma/migrations/migration_lock.toml",
        join(baselineDir, "migrations/migration_lock.toml"),
      );
      deploy(join(baselineDir, "schema.prisma"));
      const baselineDb = new PrismaClient();
      try {
        const legacy = await baselineDb.tenant.create({
          data: {
            slug: `existing-${randomUUID()}`,
            displayName: "Existing owner for M9 backfill",
          },
        });
        legacyTenantId = legacy.id;
        const code = `OLD_${randomUUID().replace(/-/g, "").toUpperCase()}`;
        await baselineDb.industryClassification.create({
          data: { code, name: reason },
        });
        const industry = await baselineDb.industryTemplate.create({
          data: { code, name: reason, category: "Test", description: reason },
        });
        const version = await baselineDb.industryTemplateVersion.create({
          data: {
            industryTemplateId: industry.id,
            version: 1,
            terminology: {},
            masterDefaults: [],
          },
        });
        legacyVersionId = version.id;
      } finally {
        await baselineDb.$disconnect();
      }
      deploy("prisma/schema.prisma");
    } finally {
      if (
        resolve(baselineDir).startsWith(resolve(tmpdir()) + sep) &&
        /^sfw-m9-upgrade-[A-Za-z0-9]+$/.test(
          baselineDir.split(/[\\/]/).pop() ?? "",
        )
      )
        rmSync(baselineDir, { recursive: true });
    }
    const instrumented = new PrismaClient({
      log: [{ emit: "event", level: "query" }],
    });
    instrumented.$on("query", () => {
      queryCount++;
    });
    prisma = instrumented;
    const initialized = await prisma.runtimeConfigEpoch.findMany({
      orderBy: { id: "asc" },
    });
    expect(initialized).toHaveLength(3);
    expect(initialized.every((row) => row.version === 1n)).toBe(true);
    expect(initialized.some((row) => row.tenantId === legacyTenantId)).toBe(
      true,
    );
    expect(
      initialized.some(
        (row) => row.industryTemplateVersionId === legacyVersionId,
      ),
    ).toBe(true);
    deploy("prisma/schema.prisma");
    expect(
      await prisma.runtimeConfigEpoch.findMany({ orderBy: { id: "asc" } }),
    ).toEqual(initialized);
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    runtime = app.get(RuntimeConfigService);
    masters = app.get(MasterService);
    clock = app.get(RuntimeClock);
    await app.get(PlatformCatalogSyncService).syncCatalog();
    await seedTenantRoleTemplates(prisma);
    await syncRbac(prisma);
    const user = await prisma.user.create({
      data: {
        employeeCode: randomUUID(),
        fullName: "M9 test actor",
        email: `${randomUUID()}@test.invalid`,
        role: "SUPPORT",
        passwordHash: "unusable",
      },
      select: { id: true },
    });
    actor = user.id;
    const role = await prisma.platformRole.findUniqueOrThrow({
      where: { code: "PLATFORM_SUPER_ADMIN" },
      select: { id: true },
    });
    await prisma.platformUserRoleAssignment.create({
      data: { userId: actor, platformRoleId: role.id, status: "ACTIVE" },
    });
    platformToken = app.get(JwtService).sign({ sub: actor });
    const seed = app.get(MasterSeedService),
      review = await seed.run(actor);
    await seed.run(actor, review.reviewedHash);
  }, 60000);
  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => {
    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
    if (baseUrl) {
      const cleanup = new PrismaClient({
        datasources: { db: { url: baseUrl } },
      });
      if (!/^phase09_[a-f0-9]{32}$/.test(schema))
        throw new Error("Unsafe cleanup schema");
      await cleanup.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
      );
      await cleanup.$disconnect();
      process.env.DATABASE_URL = baseUrl;
    }
  });
  const tokenFor = (userId: string, membershipId: string) =>
    app.get(JwtService).sign({ sub: userId, mid: membershipId });
  async function bootstrap(tenant: TenantFixture): Promise<RuntimeBootstrap> {
    const response = await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${tenant.token}`)
      .expect(200);
    return runtimeBootstrapSchema.parse(response.body);
  }
  async function principal(tenant: TenantFixture) {
    return app
      .get(RequestPrincipalService)
      .resolvePrincipal({ sub: tenant.userId, mid: tenant.membershipId });
  }
  async function plan(
    moduleCodes = ["core_crm", "field_visits"],
    expiry: "READ_ONLY" | "BLOCKED" = "READ_ONLY",
  ) {
    const modules = await prisma.platformModule.findMany({
      where: { code: { in: moduleCodes } },
      select: { id: true },
    });
    const parent = await prisma.plan.create({
      data: { code: `M9_${randomUUID()}`, name: reason, description: reason },
      select: { id: true },
    });
    const version = await prisma.planVersion.create({
      data: {
        planId: parent.id,
        version: 1,
        modules: { create: modules.map((m) => ({ moduleId: m.id })) },
        pricing: { create: { billingCycle: "MONTHLY", perSeatFee: "100.00" } },
        limits: {
          create: [
            {
              limitCode: "minimum_seats",
              valueType: "INTEGER",
              integerValue: 1,
            },
            {
              limitCode: "maximum_seats",
              valueType: "INTEGER",
              integerValue: 10,
            },
          ],
        },
        commercialRule: {
          create: {
            rules: {
              trialEnabled: true,
              trialDurationDays: 7,
              trialModulePolicy: "USE_PLAN_MODULES",
              autoConvertAfterTrial: false,
              autoRenew: true,
              allowUpgrade: true,
              allowDowngrade: true,
              changeEffectiveTiming: "IMMEDIATE",
              minimumCommitmentMonths: "0",
              availableForNewTenants: true,
              availableForExistingTenants: true,
              cancellationAllowed: true,
              gracePeriodDays: 7,
              accessAfterExpiry: expiry,
            },
          },
        },
      },
      select: { id: true },
    });
    await prisma.$transaction(async (tx) => {
      await tx.planVersion.update({
        where: { id: version.id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      await tx.plan.update({
        where: { id: parent.id },
        data: { status: "ACTIVE", currentPublishedVersionId: version.id },
      });
      await tx.$executeRaw`SET CONSTRAINTS ALL IMMEDIATE`;
    });
    return version.id;
  }
  async function tenant(
    options: {
      industryCode?: string;
      planVersionId?: string;
      trial?: boolean;
      ownerEmail?: string;
    } = {},
  ): Promise<TenantFixture> {
    const planVersionId = options.planVersionId ?? (await plan());
    const provision = app.get(ProvisioningService);
    const receipt = await provision.provision(
      {
        idempotencyKey: randomUUID(),
        tenant: { slug: `m9-${randomUUID()}`, displayName: reason },
        owner: {
          email: options.ownerEmail ?? `${randomUUID()}@test.invalid`,
          fullName: "M9 owner",
        },
        industryCode: options.industryCode ?? "RETAIL",
        planVersionId,
        billingCycle: "MONTHLY",
        seatQuantity: 5,
        trial: options.trial ?? false,
      },
      { userId: actor },
    );
    const member = await prisma.tenantMembership.findUniqueOrThrow({
      where: { id: receipt.ownerMembershipId },
      select: { id: true, userId: true, tenantRoleId: true },
    });
    await provision.accept(receipt.id, { userId: member.userId });
    return {
      id: receipt.tenantId,
      membershipId: member.id,
      userId: member.userId,
      token: tokenFor(member.userId, member.id),
      roleId: member.tenantRoleId!,
      planVersionId,
    };
  }
  async function command(
    t: TenantFixture,
    action: SubscriptionCommand["action"],
    target?: string,
  ) {
    const sub = await prisma.tenantSubscription.findUniqueOrThrow({
      where: { tenantId: t.id },
      select: { revision: true },
    });
    return app
      .get(SubscriptionService)
      .command(
        t.id,
        {
          idempotencyKey: randomUUID(),
          expectedRevision: sub.revision,
          reason,
          action,
          ...(target
            ? {
                planVersionId: target,
                billingCycle: "MONTHLY",
                seatQuantity: 5,
              }
            : {}),
        },
        { userId: actor },
      );
  }
  async function template() {
    const code = `M9_${randomUUID().replace(/-/g, "").toUpperCase()}`;
    await prisma.industryClassification.create({
      data: { code, name: reason },
    });
    return app
      .get(IndustryService)
      .create(
        { code, name: reason, category: "Test", description: reason },
        actor,
      );
  }
  async function industryVersion(id: string, sourceCode: string) {
    const service = app.get(IndustryService),
      parent = await service.detail(id);
    const version = await service.createDraft(
      id,
      { expectedRevision: parent.revision, reason },
      actor,
    );
    const updated = await service.updateDraft(
      id,
      version.id,
      {
        expectedRevision: version.revision,
        reason,
        schemaVersion: 1,
        terminology: {},
        masterDefaults: [],
        recommendedModuleCodes: ["core_crm", "field_visits"],
      },
      actor,
    );
    await masters.createValue(
      { kind: "INDUSTRY", versionId: version.id },
      "lead_source",
      label(sourceCode),
      actor,
    );
    await service.publish(
      id,
      version.id,
      {
        expectedRevision: updated.revision,
        reason,
        approvalReference: "TEST ONLY",
      },
      actor,
    );
    return version.id;
  }

  it("deploys the complete append-only chain and initializes each live scope exactly once", async () => {
    const rows = await prisma.$queryRaw<
      { migration_name: string }[]
    >`SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`;
    expect(rows.length).toBeGreaterThanOrEqual(28);
    expect(
      rows.some(
        (r) => r.migration_name === "20260908110000_m9_runtime_configuration",
      ),
    ).toBe(true);
    expect(
      await prisma.runtimeConfigEpoch.count({ where: { scope: "SYSTEM" } }),
    ).toBe(1);
    expect(
      await prisma.runtimeConfigEpoch.count({ where: { scope: "TENANT" } }),
    ).toBe(await prisma.tenant.count());
    expect(
      await prisma.runtimeConfigEpoch.count({ where: { scope: "INDUSTRY" } }),
    ).toBe(await prisma.industryTemplateVersion.count());
  });
  it("returns deterministic strict bootstrap, warm-cache reuse, current ETag and bounded measured SQL/payload", async () => {
    const t = await tenant(),
      effective = app.get(EffectiveMasterService),
      spy = jest.spyOn(effective, "definitionsInSnapshot");
    queryCount = 0;
    const start = performance.now(),
      cold = await bootstrap(t),
      coldMs = performance.now() - start,
      coldQueries = queryCount;
    queryCount = 0;
    const warmStart = performance.now(),
      warm = await bootstrap(t),
      warmMs = performance.now() - warmStart,
      warmQueries = queryCount;
    expect({ ...warm, generatedAt: cold.generatedAt }).toEqual(cold);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(cold.modules.map((m) => m.code)).toEqual([
      "core_crm",
      "field_visits",
    ]);
    expect(cold.access.planVersionId).toBe(t.planVersionId);
    expect(cold.settingsProvenance).toBe("TENANT");
    expect(cold.industry).toBeNull();
    expect(cold.permissions.every((p) => !p.startsWith("platform."))).toBe(
      true,
    );
    expect(cold.masters.definitions.map((d) => d.code)).toContain(
      "lead_source",
    );
    expect(coldQueries).toBeLessThanOrEqual(60);
    expect(warmQueries).toBeLessThanOrEqual(50);
    expect(warmQueries).toBeLessThan(coldQueries);
    expect(Buffer.byteLength(JSON.stringify(cold))).toBeLessThan(32768);
    console.info("M9 measured bootstrap", {
      coldQueries,
      warmQueries,
      coldMs,
      warmMs,
      bytes: Buffer.byteLength(JSON.stringify(cold)),
    });
    await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${t.token}`)
      .set("If-None-Match", `"${cold.configVersion}"`)
      .expect(304);
  });
  it("invalidates direct settings writes without relying on the frozen unused configVersion field", async () => {
    const t = await tenant(),
      old = await bootstrap(t);
    const before = await prisma.tenantSettings.findUniqueOrThrow({
      where: { tenantId: t.id },
    });
    await prisma.tenantSettings.update({
      where: { tenantId: t.id },
      data: { timezone: "UTC" },
    });
    const current = await bootstrap(t);
    expect(current.settings.timezone).toBe("UTC");
    expect(current.configVersion).not.toBe(old.configVersion);
    expect(
      (
        await prisma.tenantSettings.findUniqueOrThrow({
          where: { tenantId: t.id },
        })
      ).configVersion,
    ).toBe(before.configVersion);
    await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${t.token}`)
      .set("If-None-Match", `"${old.configVersion}"`)
      .expect(200);
  });
  it("uses System defaults for a missing settings row without creating it; rejects corrupt settings", async () => {
    const t = await tenant();
    await prisma.tenantSettings.delete({ where: { tenantId: t.id } });
    const result = await bootstrap(t);
    expect(result.settings).toEqual(SYSTEM_RUNTIME_SETTINGS);
    expect(result.settingsProvenance).toBe("SYSTEM");
    expect(
      await prisma.tenantSettings.count({ where: { tenantId: t.id } }),
    ).toBe(0);
    await prisma.tenantSettings.create({
      data: { tenantId: t.id, timezone: "invalid/timezone" },
    });
    await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${t.token}`)
      .expect(503);
  });
  it("immediately reflects direct role-grant revocation and restoration, never a TTL-only permission result", async () => {
    const t = await tenant(),
      before = await bootstrap(t);
    const permission = await prisma.permission.findUniqueOrThrow({
      where: { code: "system.masters.view" },
    });
    await prisma.tenantRolePermission.delete({
      where: {
        tenantRoleId_permissionId: {
          tenantRoleId: t.roleId,
          permissionId: permission.id,
        },
      },
    });
    const revoked = await bootstrap(t);
    expect(revoked.permissions).not.toContain(permission.code);
    expect(revoked.masters.definitions).toEqual([]);
    expect(revoked.configVersion).not.toBe(before.configVersion);
    await prisma.tenantRolePermission.create({
      data: { tenantRoleId: t.roleId, permissionId: permission.id },
    });
    expect((await bootstrap(t)).permissions).toContain(permission.code);
  });
  it("includes Permission lifecycle changes not represented by role version", async () => {
    const t = await tenant(),
      before = await bootstrap(t),
      permission = await prisma.permission.findUniqueOrThrow({
        where: { code: "system.masters.manage" },
      });
    try {
      await prisma.permission.update({
        where: { id: permission.id },
        data: { isActive: false },
      });
      const result = await bootstrap(t);
      expect(result.permissions).not.toContain(permission.code);
      expect(result.masters.canManage).toBe(false);
      expect(result.configVersion).not.toBe(before.configVersion);
    } finally {
      await prisma.permission.update({
        where: { id: permission.id },
        data: { isActive: true },
      });
    }
  });
  it("rejects client authority selectors, platform-only callers and missing authentication", async () => {
    const a = await tenant(),
      b = await tenant();
    for (const key of [
      "tenantId",
      "membershipId",
      "userId",
      "planVersionId",
      "industryTemplateVersionId",
      "moduleCodes",
      "configVersion",
    ]) {
      await request(app.getHttpServer())
        .get(route)
        .query({ [key]: b.id })
        .set("Authorization", `Bearer ${a.token}`)
        .expect(400);
    }
    const result = await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${a.token}`)
      .set("X-Tenant-Id", b.id)
      .expect(200);
    expect(runtimeBootstrapSchema.parse(result.body).tenant.id).toBe(a.id);
    await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${platformToken}`)
      .expect(403);
    await request(app.getHttpServer()).get(route).expect(401);
  });
  it("isolates one global User across two Tenant memberships and frozen session switches", async () => {
    const email = `${randomUUID()}@test.invalid`,
      a = await tenant({ ownerEmail: email }),
      b = await tenant({
        ownerEmail: email,
        planVersionId: await plan(["core_crm"]),
      });
    expect(a.userId).toBe(b.userId);
    await prisma.tenantSettings.update({
      where: { tenantId: b.id },
      data: { timezone: "UTC" },
    });
    const session = await prisma.userSession.create({
      data: {
        userId: a.userId,
        refreshTokenHash: "unusable",
        selectedMembershipId: a.membershipId,
      },
    });
    const aToken = app
      .get(JwtService)
      .sign({
        sub: a.userId,
        sid: session.id,
        mid: a.membershipId,
        ctxv: session.contextVersion,
      });
    const first = await bootstrap({ ...a, token: aToken });
    const switched = await app
      .get(AuthService)
      .selectMembership(a.userId, session.id, b.membershipId, {});
    const second = await bootstrap({ ...b, token: switched.accessToken });
    expect(second.tenant.id).toBe(b.id);
    expect(second.settings.timezone).toBe("UTC");
    expect(second.modules.map((m) => m.code)).toEqual(["core_crm"]);
    expect(second.configVersion).not.toBe(first.configVersion);
    await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${aToken}`)
      .expect(401);
    const back = await app
      .get(AuthService)
      .selectMembership(a.userId, session.id, a.membershipId, {});
    expect((await bootstrap({ ...a, token: back.accessToken })).tenant.id).toBe(
      a.id,
    );
  });
  it("denies warm cached access after membership or Tenant suspension", async () => {
    const t = await tenant();
    await bootstrap(t);
    await prisma.tenantMembership.update({
      where: { id: t.membershipId },
      data: { status: "SUSPENDED" },
    });
    await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${t.token}`)
      .expect(403);
    await prisma.tenantMembership.update({
      where: { id: t.membershipId },
      data: { status: "ACTIVE" },
    });
    await prisma.tenant.update({
      where: { id: t.id },
      data: { status: "SUSPENDED" },
    });
    await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${t.token}`)
      .expect(403);
  });
  it("fails closed if a direct writer corrupts the selected membership with a foreign Tenant role", async () => {
    const a = await tenant(),
      b = await tenant();
    await bootstrap(a);
    await prisma.tenantMembership.update({
      where: { id: a.membershipId },
      data: { tenantRoleId: b.roleId },
    });
    await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${a.token}`)
      .expect(403);
  });
  it("retains frozen legacy behavior with no guessed commercial Modules or Industry pin", async () => {
    const result = await app
      .get(TenantService)
      .createTenantFoundation({
        slug: `m9-legacy-${randomUUID()}`,
        displayName: reason,
        status: "ACTIVE",
      });
    const membership = await prisma.tenantMembership.create({
      data: {
        tenantId: result.id,
        userId: actor,
        status: "ACTIVE",
        tenantRoleId: (
          await prisma.tenantRole.findFirstOrThrow({
            where: { tenantId: result.id, code: "tenant_admin" },
          })
        ).id,
      },
    });
    const state = await bootstrap({
      id: result.id,
      userId: actor,
      membershipId: membership.id,
      token: tokenFor(actor, membership.id),
      roleId: membership.tenantRoleId!,
      planVersionId: "",
    });
    expect(state.access.mapping).toBe("LEGACY_UNMAPPED");
    expect(state.access.planVersionId).toBeNull();
    expect(state.modules).toEqual([]);
    expect(state.industry).toBeNull();
    expect(state.masters.definitions.every((d) => d.moduleCode === null)).toBe(
      true,
    );
  });
  it("proves persisted exact Industry Master v1/v2 pins, label overrides, explicit migration and commercial removal", async () => {
    const industry = await template(),
      v1 = await industryVersion(industry.id, "INDUSTRY_SOURCE_A"),
      t = await tenant({ industryCode: industry.code });
    const assignments = app.get(IndustryAssignmentService),
      effective = app.get(EffectiveMasterService);
    await assignments.assign(
      t.id,
      { industryTemplateVersionId: v1, reason },
      actor,
    );
    const referral = await prisma.masterValue.findFirstOrThrow({
      where: {
        source: "SYSTEM",
        code: "REFERRAL",
        definition: { code: "lead_source" },
      },
    });
    const inbound = await masters.createValue(
      { kind: "SYSTEM" },
      "lead_source",
      label("INBOUND"),
      actor,
    );
    await masters.createValue(
      { kind: "SYSTEM" },
      "lead_source",
      label("FIELD_PROSPECTING"),
      actor,
    );
    await masters.createValue(
      { kind: "TENANT", tenantId: t.id },
      "lead_source",
      label("TENANT_SOURCE_A"),
      t.userId,
    );
    await masters.setOverride(
      { kind: "TENANT", tenantId: t.id },
      referral.id,
      override("Partner referral"),
      t.userId,
    );
    await masters.setOverride(
      { kind: "TENANT", tenantId: t.id },
      inbound.id,
      override(null, true),
      t.userId,
    );
    const first = await bootstrap(t),
      values = await effective.list(t.id, "lead_source", { limit: 100 });
    expect(first.industry?.versionId).toBe(v1);
    expect(values.items.find((v) => v.code === "REFERRAL")?.name).toBe(
      "Partner referral",
    );
    expect(values.items.map((v) => v.code)).not.toContain("INBOUND");
    expect((await effective.historical(t.id, inbound.id)).selectable).toBe(
      false,
    );
    const v2 = await industryVersion(industry.id, "INDUSTRY_SOURCE_B");
    const pinned = await bootstrap(t);
    expect(pinned.configVersion).toBe(first.configVersion);
    expect(pinned.industry?.versionId).toBe(v1);
    const assignment =
      await prisma.tenantIndustryTemplateAssignment.findUniqueOrThrow({
        where: { tenantId: t.id },
      });
    await assignments.migrate(
      t.id,
      {
        industryTemplateVersionId: v2,
        expectedRevision: assignment.revision,
        reason,
      },
      actor,
    );
    const migrated = await bootstrap(t);
    expect(migrated.industry?.versionId).toBe(v2);
    expect(migrated.configVersion).not.toBe(first.configVersion);
    const afterValues = await effective.list(t.id, "lead_source", {
      limit: 100,
    });
    expect(afterValues.items.map((v) => v.code)).toContain("INDUSTRY_SOURCE_B");
    expect(afterValues.items.map((v) => v.code)).not.toContain(
      "INDUSTRY_SOURCE_A",
    );
    await command(t, "CHANGE_PLAN", await plan(["core_crm"]));
    const reduced = await bootstrap(t);
    expect(reduced.modules.map((m) => m.code)).toEqual(["core_crm"]);
    expect(
      reduced.masters.definitions.some((d) => d.moduleCode === "field_visits"),
    ).toBe(false);
    await expect(effective.list(t.id, "visit_type", {})).rejects.toThrow(
      "Master definition unavailable",
    );
    expect(
      await prisma.masterDefinition.count({
        where: { moduleCode: "field_visits" },
      }),
    ).toBeGreaterThan(0);
  });
  it("invalidates System and Tenant Master mutations at their correct scopes", async () => {
    const a = await tenant(),
      b = await tenant(),
      beforeA = await bootstrap(a),
      beforeB = await bootstrap(b);
    await masters.createValue(
      { kind: "TENANT", tenantId: a.id },
      "lead_source",
      label("LOCAL_SOURCE"),
      a.userId,
    );
    expect((await bootstrap(a)).configVersion).not.toBe(beforeA.configVersion);
    expect((await bootstrap(b)).configVersion).toBe(beforeB.configVersion);
    await masters.createValue(
      { kind: "SYSTEM" },
      "lead_source",
      label("GLOBAL_SOURCE"),
      actor,
    );
    expect((await bootstrap(b)).configVersion).not.toBe(beforeB.configVersion);
  });
  it("invalidates registry lifecycle changes and agrees with the frozen Master resolver", async () => {
    const t = await tenant(),
      old = await bootstrap(t);
    try {
      await prisma.platformModule.update({
        where: { code: "field_visits" },
        data: { status: "ARCHIVED" },
      });
      const current = await bootstrap(t);
      expect(current.modules.map((m) => m.code)).toEqual(["core_crm"]);
      expect(current.configVersion).not.toBe(old.configVersion);
      expect(
        (await app.get(EffectiveMasterService).definitions(t.id)).map(
          (d) => d.code,
        ),
      ).toEqual(current.masters.definitions.map((d) => d.code));
    } finally {
      await prisma.platformModule.update({
        where: { code: "field_visits" },
        data: { status: "ACTIVE" },
      });
    }
  });
  it.each(["TRIALING", "GRACE"] as const)(
    "crosses %s expiry without a Subscription revision change",
    async (state) => {
      const t = await tenant({ trial: state === "TRIALING" });
      if (state === "GRACE") {
        await command(t, "PAST_DUE");
        await command(t, "GRACE");
      }
      const sub = await prisma.tenantSubscription.findUniqueOrThrow({
          where: { tenantId: t.id },
        }),
        boundary = state === "TRIALING" ? sub.trialEndsAt! : sub.graceEndsAt!;
      const mock = jest
          .spyOn(clock, "now")
          .mockReturnValue(new Date(boundary.getTime() - 1)),
        p = await principal(t);
      const before = await runtime.bootstrap(p);
      expect(before.access.mode).toBe("FULL");
      expect(before.nextRevalidationAt).toBe(boundary.toISOString());
      mock.mockReturnValue(boundary);
      const after = await runtime.bootstrap(p);
      expect(after.access.mode).toBe("READ_ONLY");
      expect(after.masters.canManage).toBe(false);
      expect(after.configVersion).not.toBe(before.configVersion);
      expect(
        (
          await prisma.tenantSubscription.findUniqueOrThrow({
            where: { tenantId: t.id },
          })
        ).revision,
      ).toBe(sub.revision);
    },
  );
  it("rejects time-expired BLOCKED subscriptions even with a previously warm cache", async () => {
    const t = await tenant({
      trial: true,
      planVersionId: await plan(["core_crm"], "BLOCKED"),
    });
    const sub = await prisma.tenantSubscription.findUniqueOrThrow({
        where: { tenantId: t.id },
      }),
      p = await principal(t);
    const mock = jest
      .spyOn(clock, "now")
      .mockReturnValue(new Date(sub.trialEndsAt!.getTime() - 1));
    await runtime.bootstrap(p);
    mock.mockReturnValue(sub.trialEndsAt!);
    await expect(runtime.bootstrap(p)).rejects.toThrow(
      "Subscription does not permit",
    );
  });
  it.each(["SUSPEND", "CANCEL"] as const)(
    "retains HTTP 403 after %s, including an old ETag",
    async (action) => {
      const t = await tenant(),
        old = await bootstrap(t);
      await command(t, action);
      await request(app.getHttpServer())
        .get(route)
        .set("Authorization", `Bearer ${t.token}`)
        .set("If-None-Match", `"${old.configVersion}"`)
        .expect(403);
    },
  );
  it("enforces epoch scope, monotonicity, retention and rollback of the source mutation on bump failure", async () => {
    const t = await tenant(),
      epoch = await prisma.runtimeConfigEpoch.findUniqueOrThrow({
        where: { tenantId: t.id },
      });
    await expect(
      prisma.runtimeConfigEpoch.create({
        data: { scope: "SYSTEM", tenantId: t.id },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.runtimeConfigEpoch.create({
        data: { scope: "TENANT", tenantId: t.id },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.runtimeConfigEpoch.update({
        where: { id: epoch.id },
        data: { version: 1 },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.runtimeConfigEpoch.delete({ where: { id: epoch.id } }),
    ).rejects.toThrow();
    await prisma.$executeRawUnsafe(
      `CREATE FUNCTION m9_test_fail_epoch() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'TEST_EPOCH_FAILURE'; END $$`,
    );
    await prisma.$executeRawUnsafe(
      `CREATE TRIGGER m9_test_fail_epoch BEFORE UPDATE ON "RuntimeConfigEpoch" FOR EACH ROW EXECUTE FUNCTION m9_test_fail_epoch()`,
    );
    try {
      await expect(
        prisma.tenantSettings.update({
          where: { tenantId: t.id },
          data: { timezone: "UTC" },
        }),
      ).rejects.toThrow();
    } finally {
      await prisma.$executeRawUnsafe(
        'DROP TRIGGER m9_test_fail_epoch ON "RuntimeConfigEpoch"',
      );
      await prisma.$executeRawUnsafe("DROP FUNCTION m9_test_fail_epoch()");
    }
    expect(
      (
        await prisma.tenantSettings.findUniqueOrThrow({
          where: { tenantId: t.id },
        })
      ).timezone,
    ).toBe("Asia/Kolkata");
    expect(
      (
        await prisma.runtimeConfigEpoch.findUniqueOrThrow({
          where: { tenantId: t.id },
        })
      ).version,
    ).toBe(epoch.version);
  });
  it("does not mutate commercial/RBAC/Master authority on cold or warm reads; cache failure remains optional", async () => {
    const t = await tenant();
    const before = await prisma.tenantSubscription.findUniqueOrThrow({
      where: { tenantId: t.id },
    });
    const epoch = await prisma.runtimeConfigEpoch.findUniqueOrThrow({
      where: { tenantId: t.id },
    });
    const history = await prisma.subscriptionChange.count({
      where: { tenantId: t.id },
    });
    const cache = app.get(RuntimeConfigCache),
      broken = jest.spyOn(cache, "set").mockImplementation(() => {
        throw new Error("test cache unavailable");
      });
    await bootstrap(t);
    broken.mockRestore();
    await bootstrap(t);
    await bootstrap(t);
    expect(
      await prisma.tenantSubscription.findUniqueOrThrow({
        where: { tenantId: t.id },
      }),
    ).toEqual(before);
    expect(
      await prisma.runtimeConfigEpoch.findUniqueOrThrow({
        where: { tenantId: t.id },
      }),
    ).toEqual(epoch);
    expect(
      await prisma.subscriptionChange.count({ where: { tenantId: t.id } }),
    ).toBe(history);
  });
  it("double-checks and retries a committed settings change during composition, never inserting mixed data under the old key", async () => {
    const t = await tenant(),
      effective = app
        .select(AuthSecurityModule)
        .get(EffectivePermissionService, { strict: true }),
      original = effective.resolveTenantPermissions.bind(effective);
    let changed = false;
    const spy = jest
      .spyOn(effective, "resolveTenantPermissions")
      .mockImplementation(async (tenantId, membershipId, tx) => {
        const result = await original(tenantId, membershipId, tx);
        if (tx && tenantId === t.id && !changed) {
          changed = true;
          await prisma.tenantSettings.update({
            where: { tenantId: t.id },
            data: { timezone: "UTC" },
          });
        }
        return result;
      });
    const value = await bootstrap(t);
    expect(value.settings.timezone).toBe("UTC");
    expect(changed).toBe(true);
    expect(spy.mock.calls.filter((call) => call[2]).length).toBe(2);
    expect((await bootstrap(t)).configVersion).toBe(value.configVersion);
  });
  it("fails safely after three consecutive version changes instead of spinning", async () => {
    const t = await tenant(),
      effective = app
        .select(AuthSecurityModule)
        .get(EffectivePermissionService, { strict: true }),
      original = effective.resolveTenantPermissions.bind(effective);
    let counter = 0;
    jest
      .spyOn(effective, "resolveTenantPermissions")
      .mockImplementation(async (tenantId, membershipId, tx) => {
        const result = await original(tenantId, membershipId, tx);
        if (tx && tenantId === t.id) {
          counter++;
          await prisma.tenantSettings.update({
            where: { tenantId: t.id },
            data: { timezone: counter % 2 ? "UTC" : "Asia/Kolkata" },
          });
        }
        return result;
      });
    const response = await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${t.token}`)
      .expect(503);
    expect(response.body.message).toBe("RUNTIME_CONFIG_UNSTABLE");
    expect(counter).toBe(3);
  });
  it("handles simultaneous same-key cold requests with deterministic results", async () => {
    const t = await tenant(),
      p = await principal(t);
    const results = await Promise.all(
      Array.from({ length: 10 }, () => runtime.bootstrap(p)),
    );
    expect(new Set(results.map((r) => r.configVersion)).size).toBe(1);
    expect(results.every((r) => r.tenant.id === t.id)).toBe(true);
  });

  async function mutateDuringComposition(
    t: TenantFixture,
    mutate: () => Promise<unknown>,
  ) {
    const permissions = app
      .select(AuthSecurityModule)
      .get(EffectivePermissionService, { strict: true });
    const original = permissions.resolveTenantPermissions.bind(permissions);
    let changed = false;
    jest
      .spyOn(permissions, "resolveTenantPermissions")
      .mockImplementation(async (tenantId, membershipId, tx) => {
        const result = await original(tenantId, membershipId, tx);
        if (tx && tenantId === t.id && !changed) {
          changed = true;
          await mutate();
        }
        return result;
      });
    const result = await bootstrap(t);
    expect(changed).toBe(true);
    return result;
  }
  it("retries RBAC revocation during composition and never labels old permissions with the new version", async () => {
    const t = await tenant(),
      permission = await prisma.permission.findUniqueOrThrow({
        where: { code: "system.masters.view" },
      });
    const value = await mutateDuringComposition(t, () =>
      prisma.tenantRolePermission.delete({
        where: {
          tenantRoleId_permissionId: {
            tenantRoleId: t.roleId,
            permissionId: permission.id,
          },
        },
      }),
    );
    expect(value.permissions).not.toContain(permission.code);
    expect(value.masters.definitions).toEqual([]);
    expect((await bootstrap(t)).configVersion).toBe(value.configVersion);
  });
  it("retries an exact subscription Plan change during composition with no mixed Module manifest", async () => {
    const t = await tenant(),
      target = await plan(["core_crm"]);
    const value = await mutateDuringComposition(t, () =>
      command(t, "CHANGE_PLAN", target),
    );
    expect(value.access.planVersionId).toBe(target);
    expect(value.modules.map((m) => m.code)).toEqual(["core_crm"]);
    expect(
      value.masters.definitions.some((d) => d.moduleCode === "field_visits"),
    ).toBe(false);
  });
  it("retries a Tenant Master override during composition and exposes the same dependency as the effective API", async () => {
    const t = await tenant(),
      referral = await prisma.masterValue.findFirstOrThrow({
        where: {
          source: "SYSTEM",
          code: "REFERRAL",
          definition: { code: "lead_source" },
        },
      });
    const value = await mutateDuringComposition(t, () =>
      masters.setOverride(
        { kind: "TENANT", tenantId: t.id },
        referral.id,
        override("Concurrent referral"),
        t.userId,
      ),
    );
    expect(
      (
        await app
          .get(EffectiveMasterService)
          .list(t.id, "lead_source", { limit: 100 })
      ).items.find((v) => v.code === "REFERRAL")?.name,
    ).toBe("Concurrent referral");
    expect((await bootstrap(t)).configVersion).toBe(value.configVersion);
  });
  it("retries exact Industry migration during composition, never caching mixed v1/v2 state", async () => {
    const industry = await template(),
      v1 = await industryVersion(industry.id, "RACE_V1"),
      v2 = await industryVersion(industry.id, "RACE_V2");
    const t = await tenant({ industryCode: industry.code }),
      assignments = app.get(IndustryAssignmentService);
    await assignments.assign(
      t.id,
      { industryTemplateVersionId: v1, reason },
      actor,
    );
    const pin = await prisma.tenantIndustryTemplateAssignment.findUniqueOrThrow(
      { where: { tenantId: t.id } },
    );
    const result = await mutateDuringComposition(t, () =>
      assignments.migrate(
        t.id,
        {
          industryTemplateVersionId: v2,
          expectedRevision: pin.revision,
          reason,
        },
        actor,
      ),
    );
    expect(result.industry?.versionId).toBe(v2);
    const values = await app
      .get(EffectiveMasterService)
      .list(t.id, "lead_source", { limit: 100 });
    expect(values.items.map((v) => v.code)).toContain("RACE_V2");
    expect(values.items.map((v) => v.code)).not.toContain("RACE_V1");
  });
  it("rejects an in-flight old context after a real session switch commits", async () => {
    const email = `${randomUUID()}@test.invalid`,
      a = await tenant({ ownerEmail: email }),
      b = await tenant({ ownerEmail: email });
    const session = await prisma.userSession.create({
      data: {
        userId: a.userId,
        refreshTokenHash: "unusable",
        selectedMembershipId: a.membershipId,
      },
    });
    const signed = app
      .get(JwtService)
      .sign({ sub: a.userId, sid: session.id, mid: a.membershipId, ctxv: 1 });
    const permissions = app
        .select(AuthSecurityModule)
        .get(EffectivePermissionService, { strict: true }),
      original = permissions.resolveTenantPermissions.bind(permissions);
    let changed = false;
    jest
      .spyOn(permissions, "resolveTenantPermissions")
      .mockImplementation(async (tenantId, membershipId, tx) => {
        const result = await original(tenantId, membershipId, tx);
        if (tx && tenantId === a.id && !changed) {
          changed = true;
          await app
            .get(AuthService)
            .selectMembership(a.userId, session.id, b.membershipId, {});
        }
        return result;
      });
    await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${signed}`)
      .expect(401);
    expect(changed).toBe(true);
  });
  it("revalidates an old ETag across a time-only trial boundary", async () => {
    const t = await tenant({ trial: true }),
      sub = await prisma.tenantSubscription.findUniqueOrThrow({
        where: { tenantId: t.id },
      });
    const mock = jest
      .spyOn(clock, "now")
      .mockReturnValue(new Date(sub.trialEndsAt!.getTime() - 1));
    const old = await bootstrap(t);
    mock.mockReturnValue(sub.trialEndsAt!);
    const response = await request(app.getHttpServer())
      .get(route)
      .set("Authorization", `Bearer ${t.token}`)
      .set("If-None-Match", `"${old.configVersion}"`)
      .expect(200);
    const value = runtimeBootstrapSchema.parse(response.body);
    expect(value.access.mode).toBe("READ_ONLY");
    expect(value.configVersion).not.toBe(old.configVersion);
  });
  it("prevents unversioned TRUNCATE and retains new epoch incarnation on legitimate parent recreation", async () => {
    await expect(
      prisma.$executeRawUnsafe('TRUNCATE "RuntimeConfigEpoch"'),
    ).rejects.toThrow();
    await expect(
      prisma.$executeRawUnsafe('TRUNCATE "TenantSettings"'),
    ).rejects.toThrow();
    const parent = await prisma.tenant.create({
      data: { slug: `recreate-${randomUUID()}`, displayName: reason },
    });
    const first = await prisma.runtimeConfigEpoch.findUniqueOrThrow({
      where: { tenantId: parent.id },
    });
    await prisma.tenant.delete({ where: { id: parent.id } });
    await prisma.tenant.create({
      data: { id: parent.id, slug: parent.slug, displayName: reason },
    });
    const second = await prisma.runtimeConfigEpoch.findUniqueOrThrow({
      where: { tenantId: parent.id },
    });
    expect(second.id).not.toBe(first.id);
    expect(second.version).toBe(1n);
  });
  it("invalidates two independent application caches through the same committed DB vector", async () => {
    const t = await tenant(),
      p = await principal(t);
    const second = new RuntimeConfigService(
      app.get(PrismaService),
      app
        .select(AuthSecurityModule)
        .get(EffectivePermissionService, { strict: true }),
      app.get(EffectiveMasterService),
      new RuntimeConfigCache(),
      new RuntimeClock(),
    );
    const firstValue = await runtime.bootstrap(p);
    expect((await second.bootstrap(p)).configVersion).toBe(
      firstValue.configVersion,
    );
    await prisma.tenantSettings.update({
      where: { tenantId: t.id },
      data: { timezone: "UTC" },
    });
    const [a, b] = await Promise.all([
      runtime.bootstrap(p),
      second.bootstrap(p),
    ]);
    expect(a.configVersion).toBe(b.configVersion);
    expect(a.configVersion).not.toBe(firstValue.configVersion);
    expect(a.settings.timezone).toBe("UTC");
    expect(b.settings.timezone).toBe("UTC");
  });
  it("retries Module lifecycle changes during composition using the canonical intersection", async () => {
    const t = await tenant();
    try {
      const result = await mutateDuringComposition(t, () =>
        prisma.platformModule.update({
          where: { code: "field_visits" },
          data: { status: "ARCHIVED" },
        }),
      );
      expect(result.modules.map((m) => m.code)).not.toContain("field_visits");
      expect(
        result.masters.definitions.some((d) => d.moduleCode === "field_visits"),
      ).toBe(false);
    } finally {
      await prisma.platformModule.update({
        where: { code: "field_visits" },
        data: { status: "ACTIVE" },
      });
    }
  });
  it("retries System Master mutation during composition and resolves its new value", async () => {
    const t = await tenant(),
      code = `SYSTEM_${randomUUID().replace(/-/g, "").toUpperCase()}`;
    const result = await mutateDuringComposition(t, () =>
      masters.createValue(
        { kind: "SYSTEM" },
        "lead_source",
        label(code),
        actor,
      ),
    );
    expect((await bootstrap(t)).configVersion).toBe(result.configVersion);
    expect(
      (
        await app
          .get(EffectiveMasterService)
          .list(t.id, "lead_source", { limit: 100 })
      ).items.map((v) => v.code),
    ).toContain(code);
  });
  it("retries typed serialization failures and bounds repeated driver failure", async () => {
    const t = await tenant(),
      p = await principal(t);
    const error = new Prisma.PrismaClientKnownRequestError(
      "test transaction retry",
      { code: "P2010", clientVersion: "test", meta: { code: "40001" } },
    );
    const spy = jest
      .spyOn(prisma, "$transaction")
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error);
    expect((await runtime.bootstrap(p)).tenant.id).toBe(t.id);
    expect(spy).toHaveBeenCalledTimes(4);
    spy.mockReset().mockRejectedValue(error);
    await expect(runtime.bootstrap(p)).rejects.toThrow(
      "RUNTIME_CONFIG_UNSTABLE",
    );
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
