import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { Prisma, PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { execFile, execFileSync } from "child_process";
import { promisify } from "util";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/persistence/prisma.service";
import { MasterService } from "../src/platform/masters/master.service";
import { MasterSeedService } from "../src/platform/masters/master-seed.service";
import { MasterReconciliationService } from "../src/platform/masters/master-reconciliation.service";
import { EffectiveMasterService } from "../src/platform/masters/effective-master.service";
import { IndustryService } from "../src/platform/industries/industry.service";
import { IndustryAssignmentService } from "../src/platform/industries/industry-assignment.service";
import { ProvisioningService } from "../src/platform/subscriptions/provisioning.service";
import { SubscriptionService } from "../src/platform/subscriptions/subscription.service";
import { verifyTestDatabaseSafety } from "../src/test-utils/test-db-safety";
import { seedTenantRoleTemplates } from "../prisma/seeds/tenant-role-templates";
import { syncRbac } from "../prisma/sync-rbac";
import { PlatformCatalogSyncService } from "../src/platform/modules/platform-catalog-sync.service";

describe("Phase 0.8 Master persistence, resolution and security", () => {
  let app: INestApplication,
    prisma: PrismaService,
    masters: MasterService,
    seed: MasterSeedService;
  let effective: EffectiveMasterService,
    industries: IndustryService,
    assignments: IndustryAssignmentService;
  let actor: string, token: string, baseUrl: string;
  const schema = `phase08_${randomUUID().replace(/-/g, "")}`;
  const reason = "Isolated M8 regression fixture; not a production default";
  const label = (code: string, name = code) => ({
    code,
    name,
    description: null,
    displayColor: null,
    sortOrder: 100,
    isActive: true,
    reason,
  });
  const override = (
    displayName: string | null,
    isHidden = false,
    expectedRevision = 0,
  ) => ({
    displayName,
    isHidden,
    expectedRevision,
    displayColor: null,
    sortOrder: null,
    reason,
  });
  const system = { kind: "SYSTEM" } as const;

  beforeAll(async () => {
    verifyTestDatabaseSafety();
    baseUrl = process.env.TEST_DATABASE_URL ?? "";
    const isolated = new URL(baseUrl);
    isolated.searchParams.set("schema", schema);
    process.env.DATABASE_URL = isolated.toString();
    execFileSync(
      process.execPath,
      [
        require.resolve("prisma/build/index.js"),
        "migrate",
        "deploy",
        "--schema=prisma/schema.prisma",
      ],
      { cwd: process.cwd(), env: process.env, stdio: "pipe" },
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
    masters = app.get(MasterService);
    seed = app.get(MasterSeedService);
    effective = app.get(EffectiveMasterService);
    industries = app.get(IndustryService);
    assignments = app.get(IndustryAssignmentService);
    await app.get(PlatformCatalogSyncService).syncCatalog();
    await seedTenantRoleTemplates(prisma);
    await syncRbac(prisma);
    const user = await prisma.user.create({
      data: {
        employeeCode: randomUUID(),
        fullName: "M8 test actor",
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
    token = app.get(JwtService).sign({ sub: actor });
  }, 60000);
  afterAll(async () => {
    if (app) await app.close();
    if (baseUrl) {
      const cleanup = new PrismaClient({
        datasources: { db: { url: baseUrl } },
      });
      if (!/^phase08_[a-f0-9]{32}$/.test(schema))
        throw new Error("Unsafe test schema");
      await cleanup.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
      );
      await cleanup.$disconnect();
      process.env.DATABASE_URL = baseUrl;
    }
  });

  async function template() {
    const code = `TEST_${randomUUID().replace(/-/g, "").toUpperCase()}`;
    await prisma.industryClassification.create({
      data: { code, name: "M8 test Industry" },
    });
    return industries.create(
      { code, name: "M8 test Industry", category: "Test", description: reason },
      actor,
    );
  }
  async function draft(id: string) {
    const parent = await industries.detail(id);
    const version = await industries.createDraft(
      id,
      { expectedRevision: parent.revision, reason },
      actor,
    );
    return industries.updateDraft(
      id,
      version.id,
      {
        expectedRevision: version.revision,
        reason,
        schemaVersion: 1,
        terminology: {},
        masterDefaults: [],
        recommendedModuleCodes: ["core_crm", "payroll"],
      },
      actor,
    );
  }
  function publish(id: string, version: { id: string; revision: number }) {
    return industries.publish(
      id,
      version.id,
      {
        expectedRevision: version.revision,
        reason,
        approvalReference: "TEST-ONLY",
      },
      actor,
    );
  }
  function direct<T>(work: (tx: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(
      async (tx) => {
        const result = await work(tx);
        await tx.$executeRawUnsafe("SET CONSTRAINTS ALL IMMEDIATE");
        return result;
      },
      { timeout: 15000 },
    );
  }
  async function commercialTenant(industryCode: string) {
    const core = await prisma.platformModule.findUniqueOrThrow({
      where: { code: "core_crm" },
      select: { id: true },
    });
    const plan = await prisma.plan.create({
      data: { code: `M8_${randomUUID()}`, name: reason, description: reason },
      select: { id: true },
    });
    const version = await prisma.planVersion.create({
      data: {
        planId: plan.id,
        version: 1,
        modules: { create: { moduleId: core.id } },
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
              trialEnabled: false,
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
              accessAfterExpiry: "READ_ONLY",
            },
          },
        },
      },
      select: { id: true },
    });
    await direct(async (tx) => {
      await tx.planVersion.update({
        where: { id: version.id },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      await tx.plan.update({
        where: { id: plan.id },
        data: { status: "ACTIVE", currentPublishedVersionId: version.id },
      });
    });
    const provision = app.get(ProvisioningService);
    const receipt = await provision.provision(
      {
        idempotencyKey: randomUUID(),
        tenant: { slug: `m8-${randomUUID()}`, displayName: reason },
        owner: { email: `${randomUUID()}@test.invalid`, fullName: "M8 owner" },
        industryCode,
        planVersionId: version.id,
        billingCycle: "MONTHLY",
        seatQuantity: 2,
        trial: false,
      },
      { userId: actor },
    );
    const owner = await prisma.tenantMembership.findUniqueOrThrow({
      where: { id: receipt.ownerMembershipId },
      select: { id: true, userId: true },
    });
    await provision.accept(receipt.id, { userId: owner.userId });
    return {
      id: receipt.tenantId,
      owner: owner.userId,
      membershipId: owner.id,
      token: app.get(JwtService).sign({ sub: owner.userId, mid: owner.id }),
      scope: { kind: "TENANT", tenantId: receipt.tenantId } as const,
    };
  }
  async function commercialState(tenantId: string) {
    return {
      subscription: await prisma.tenantSubscription.findUniqueOrThrow({
        where: { tenantId },
        select: {
          planVersionId: true,
          seatQuantity: true,
          revision: true,
          status: true,
          billingCycle: true,
          currentPeriodStart: true,
          currentPeriodEnd: true,
        },
      }),
      changes: await prisma.subscriptionChange.count({ where: { tenantId } }),
      grants: await prisma.tenantRolePermission.findMany({
        where: { tenantRole: { tenantId } },
        select: { id: true },
        orderBy: { id: "asc" },
      }),
    };
  }

  it("dry-runs and atomically seeds exactly 24 definitions / 44 System values; parallel replay creates nothing", async () => {
    const dry = await seed.run(actor);
    expect(dry).toMatchObject({
      mode: "DRY_RUN",
      definitions: 24,
      systemValues: 44,
      created: 0,
      wouldCreate: 68,
    });
    expect(await prisma.masterDefinition.count()).toBe(0);
    await expect(seed.run(actor, "wrong")).rejects.toThrow("hash mismatch");
    // Inject failure after all 68 inserts, at the final audit write.
    await prisma.$executeRawUnsafe(
      `CREATE FUNCTION m8_test_seed_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='master.seed.apply' THEN RAISE EXCEPTION 'MASTER_TEST_SEED_FAILURE'; END IF; RETURN NEW; END $$`,
    );
    await prisma.$executeRawUnsafe(
      `CREATE TRIGGER "M8_test_seed_failure" BEFORE INSERT ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION m8_test_seed_failure()`,
    );
    try {
      await expect(seed.run(actor, dry.reviewedHash)).rejects.toThrow();
      expect(await prisma.masterDefinition.count()).toBe(0);
      expect(await prisma.masterValue.count()).toBe(0);
    } finally {
      await prisma.$executeRawUnsafe(
        `DROP TRIGGER "M8_test_seed_failure" ON "AuditLog"`,
      );
      await prisma.$executeRawUnsafe("DROP FUNCTION m8_test_seed_failure()");
    }
    const applied = await seed.run(actor, dry.reviewedHash);
    expect(applied.created).toBe(68);
    const replays = await Promise.all(
      Array.from({ length: 5 }, () => seed.run(actor, dry.reviewedHash)),
    );
    expect(replays.every((r) => r.created === 0)).toBe(true);
    expect(await prisma.masterDefinition.count()).toBe(24);
    expect(await prisma.masterValue.count()).toBe(44);
    expect(
      await prisma.auditLog.count({ where: { action: "master.seed.apply" } }),
    ).toBe(1);
    expect(
      await prisma.masterValue.count({
        where: {
          definition: {
            code: {
              in: [
                "designation",
                "leave_type",
                "business_type",
                "incentive_type",
                "allowance_type",
                "deduction_type",
                "skill_set",
                "document_type",
                "competitor_brand",
              ],
            },
          },
        },
      }),
    ).toBe(0);
  }, 60000);

  it("executes the real seed/report CLI with explicit actor authorization", async () => {
    const { stdout: output } = await promisify(execFile)(
      process.execPath,
      [
        "-r",
        "ts-node/register",
        "prisma/backfills/reconcile-masters.ts",
        "--seed",
        actor,
        "--dry-run",
      ],
      {
        cwd: process.cwd(),
        env: process.env,
        encoding: "utf8",
        timeout: 30000,
      },
    );
    const result: unknown = JSON.parse(output);
    expect(result).toMatchObject({
      mode: "DRY_RUN",
      definitions: 24,
      systemValues: 44,
      created: 0,
    });
    const { stdout: report } = await promisify(execFile)(
      process.execPath,
      [
        "-r",
        "ts-node/register",
        "prisma/backfills/reconcile-masters.ts",
        "--legacy-report",
        actor,
        "--dry-run",
        "1",
      ],
      {
        cwd: process.cwd(),
        env: process.env,
        encoding: "utf8",
        timeout: 30000,
      },
    );
    expect(JSON.parse(report)).toMatchObject({
      mode: "DRY_RUN",
      tableRetired: false,
      page: 1,
    });
    await expect(seed.run(randomUUID())).rejects.toThrow("actor required");
  }, 60000);

  it("enforces Tenant manage permission, revisions, inherited identity and subscription access on actual API routes", async () => {
    const t = await template(),
      tenant = await commercialTenant(t.code);
    const other = await commercialTenant(t.code);
    const readerUser = await prisma.user.create({
      data: {
        employeeCode: randomUUID(),
        fullName: "M8 reader",
        email: `${randomUUID()}@test.invalid`,
        role: "SUPPORT",
        passwordHash: "unusable",
      },
      select: { id: true },
    });
    const role = await prisma.tenantRole.findFirstOrThrow({
      where: { tenantId: tenant.id, code: "sales_manager" },
      select: { id: true },
    });
    const membership = await prisma.tenantMembership.create({
      data: {
        tenantId: tenant.id,
        userId: readerUser.id,
        tenantRoleId: role.id,
        status: "ACTIVE",
      },
      select: { id: true },
    });
    const readerToken = app
      .get(JwtService)
      .sign({ sub: readerUser.id, mid: membership.id });
    const server = app.getHttpServer();
    await request(server).get("/tenant/masters").expect(401);
    await request(server)
      .get("/tenant/masters")
      .set("Authorization", `Bearer ${readerToken}`)
      .expect(200);
    await request(server)
      .post("/tenant/masters/designation/values")
      .set("Authorization", `Bearer ${readerToken}`)
      .send(label("M8_READER"))
      .expect(403);
    const value = await masters.createValue(
      tenant.scope,
      "designation",
      label("M8_API"),
      tenant.owner,
    );
    const edit = {
      name: "API edited",
      description: null,
      displayColor: null,
      sortOrder: 2,
      isActive: false,
      expectedRevision: 1,
      reason,
      requestId: "M8-API-AUDIT",
    };
    await request(server)
      .patch(`/tenant/masters/values/${value.id}`)
      .set("Authorization", `Bearer ${other.token}`)
      .send(edit)
      .expect(404);
    await request(server)
      .patch(`/tenant/masters/values/${value.id}`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send(edit)
      .expect(200);
    await request(server)
      .patch(`/tenant/masters/values/${value.id}`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send(edit)
      .expect(409);
    expect(
      (
        await effective.list(tenant.id, "designation", { limit: 100 })
      ).items.some((v) => v.id === value.id),
    ).toBe(false);
    expect(await effective.historical(tenant.id, value.id)).toMatchObject({
      selectable: false,
      name: "API edited",
    });
    expect(
      await prisma.auditLog.count({
        where: {
          actorUserId: tenant.owner,
          tenantId: tenant.id,
          entityId: value.id,
          action: "master.value.update",
        },
      }),
    ).toBe(1);
    const inherited = await prisma.masterValue.findFirstOrThrow({
      where: { source: "SYSTEM", definition: { code: "target_type" } },
      select: { id: true },
    });
    await request(server)
      .put(`/tenant/masters/overrides/${inherited.id}`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send(override("Forbidden"))
      .expect(409);
    await request(server)
      .patch(`/tenant/masters/values/${inherited.id}`)
      .set("Authorization", `Bearer ${tenant.token}`)
      .send(edit)
      .expect(404);
    await request(server)
      .post("/tenant/masters/designation/values")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send(label("M8_API"))
      .expect(409);
    const subscriptions = app.get(SubscriptionService);
    await subscriptions.command(
      tenant.id,
      {
        action: "PAST_DUE",
        expectedRevision: 1,
        idempotencyKey: randomUUID(),
        reason,
      },
      { userId: actor },
    );
    await request(server)
      .get("/tenant/masters")
      .set("Authorization", `Bearer ${tenant.token}`)
      .expect(200);
    await request(server)
      .post("/tenant/masters/designation/values")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send(label("M8_READONLY"))
      .expect(403);
    await subscriptions.command(
      tenant.id,
      {
        action: "SUSPEND",
        expectedRevision: 2,
        idempotencyKey: randomUUID(),
        reason,
      },
      { userId: actor },
    );
    await request(server)
      .get("/tenant/masters")
      .set("Authorization", `Bearer ${tenant.token}`)
      .expect(403);
    await expect(effective.list(tenant.id, "designation", {})).rejects.toThrow(
      "Subscription",
    );
  }, 60000);

  it("proves System -> exact Industry v1 -> Tenant layering; publishing v2 never silently repins or grants Modules", async () => {
    const t = await template(),
      v1 = await draft(t.id);
    const referral = await prisma.masterValue.findFirstOrThrow({
      where: {
        source: "SYSTEM",
        code: "REFERRAL",
        definition: { code: "lead_source" },
      },
      select: { id: true },
    });
    const inbound = await masters.createValue(
      system,
      "lead_source",
      label("INBOUND", "Inbound"),
      actor,
    );
    const field = await masters.createValue(
      system,
      "lead_source",
      label("FIELD_PROSPECTING", "Field prospecting"),
      actor,
    );
    const v1Scope = { kind: "INDUSTRY", versionId: v1.id } as const;
    const industryValue = await masters.createValue(
      v1Scope,
      "lead_source",
      label("INDUSTRY_SOURCE_A", "Industry v1 source"),
      actor,
    );
    await masters.setOverride(
      v1Scope,
      inbound.id,
      override("Industry inbound"),
      actor,
    );
    await publish(t.id, v1);
    const tenant = await commercialTenant(t.code),
      other = await commercialTenant(t.code);
    await assignments.assign(
      tenant.id,
      { industryTemplateVersionId: v1.id, reason },
      actor,
    );
    const before = await commercialState(tenant.id);
    const tenantValue = await masters.createValue(
      tenant.scope,
      "lead_source",
      label("TENANT_SOURCE_A", "Tenant source"),
      tenant.owner,
    );
    await masters.setOverride(
      tenant.scope,
      referral.id,
      override("Partner referral"),
      tenant.owner,
    );
    await masters.setOverride(
      tenant.scope,
      inbound.id,
      override(null, true),
      tenant.owner,
    );
    const first = await effective.list(tenant.id, "lead_source", {
      limit: 100,
    });
    expect(first.items.find((v) => v.id === referral.id)).toMatchObject({
      name: "Partner referral",
      code: "REFERRAL",
      provenance: { source: "SYSTEM", overrides: [{ scope: "TENANT" }] },
    });
    expect(first.items.find((v) => v.id === field.id)).toMatchObject({
      code: "FIELD_PROSPECTING",
      provenance: { source: "SYSTEM" },
    });
    expect(first.items.map((v) => v.id)).toEqual(
      expect.arrayContaining([industryValue.id, tenantValue.id]),
    );
    expect(first.items.some((v) => v.id === inbound.id)).toBe(false);
    expect(await effective.historical(tenant.id, inbound.id)).toMatchObject({
      selectable: false,
      code: "INBOUND",
    });
    await expect(
      effective.historical(other.id, tenantValue.id),
    ).rejects.toThrow("not found");
    await expect(
      effective.historical(other.id, industryValue.id),
    ).rejects.toThrow("not found");
    const v2 = await draft(t.id);
    const v2Value = await masters.createValue(
      { kind: "INDUSTRY", versionId: v2.id },
      "lead_source",
      label("M8_INDUSTRY_V2", "Industry v2 source"),
      actor,
    );
    await publish(t.id, v2);
    expect(
      await effective.list(tenant.id, "lead_source", { limit: 100 }),
    ).toEqual(first);
    expect(
      (await effective.definitions(tenant.id)).some(
        (d) => d.moduleCode === "payroll",
      ),
    ).toBe(false);
    await assignments.migrate(
      tenant.id,
      { industryTemplateVersionId: v2.id, expectedRevision: 1, reason },
      actor,
    );
    const second = await effective.list(tenant.id, "lead_source", {
      limit: 100,
    });
    expect(second.industryTemplateVersionId).toBe(v2.id);
    expect(second.items.map((v) => v.id)).toEqual(
      expect.arrayContaining([
        referral.id,
        field.id,
        tenantValue.id,
        v2Value.id,
      ]),
    );
    expect(second.items.some((v) => v.id === industryValue.id)).toBe(false);
    expect(
      await effective.historical(tenant.id, industryValue.id),
    ).toMatchObject({ selectable: false, name: "Industry v1 source" });
    expect(await commercialState(tenant.id)).toEqual(before);
    expect((await assignments.history(tenant.id, {})).total).toBe(2);
    await request(app.getHttpServer())
      .get("/tenant/masters/lead_source/values")
      .set("Authorization", `Bearer ${tenant.token}`)
      .expect(200);
    await request(app.getHttpServer())
      .get("/tenant/masters/leave_type/values")
      .set("Authorization", `Bearer ${tenant.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .get(`/tenant/masters/values/${tenantValue.id}`)
      .set("Authorization", `Bearer ${other.token}`)
      .expect(404);
    await request(app.getHttpServer())
      .post("/tenant/masters/lead_source/values")
      .set("Authorization", `Bearer ${tenant.token}`)
      .send({ ...label("M8_SPOOF"), tenantId: other.id })
      .expect(400);
    await request(app.getHttpServer())
      .get("/tenant/masters")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);
    await request(app.getHttpServer())
      .get("/platform/configuration/masters")
      .set("Authorization", `Bearer ${tenant.token}`)
      .expect(403);
  }, 60000);

  it("rejects unknown definitions, scope corruption, immutable identities and invalid override ancestry directly in PostgreSQL", async () => {
    const definition = await prisma.masterDefinition.findUniqueOrThrow({
      where: { code: "designation" },
      select: { id: true },
    });
    const tenant = await prisma.tenant.create({
      data: { slug: `m8-raw-${randomUUID()}`, displayName: reason },
      select: { id: true },
    });
    const base = {
      definitionId: definition.id,
      code: "M8_RAW",
      name: "Raw",
      sortOrder: 0,
      source: "SYSTEM" as const,
    };
    await expect(
      prisma.masterValue.create({ data: { ...base, tenantId: tenant.id } }),
    ).rejects.toThrow();
    await expect(
      prisma.masterValue.create({ data: { ...base, source: "TENANT" } }),
    ).rejects.toThrow();
    const value = await prisma.masterValue.create({
      data: base,
      select: { id: true },
    });
    await expect(
      prisma.masterValue.update({
        where: { id: value.id },
        data: { code: "M8_RENAMED", revision: 2 },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.masterValue.delete({ where: { id: value.id } }),
    ).rejects.toThrow();
    const local = await prisma.masterValue.create({
      data: {
        ...base,
        code: "M8_LOCAL",
        source: "TENANT",
        tenantId: tenant.id,
      },
      select: { id: true },
    });
    await expect(
      prisma.masterValueOverride.create({
        data: {
          inheritedMasterValueId: local.id,
          scope: "TENANT",
          tenantId: tenant.id,
        },
      }),
    ).rejects.toThrow();
    const closed = await prisma.masterDefinition.findUniqueOrThrow({
      where: { code: "target_type" },
      select: { id: true },
    });
    await expect(
      prisma.masterValue.create({
        data: { ...base, definitionId: closed.id, code: "M8_RULE" },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.masterDefinition.update({
        where: { id: definition.id },
        data: { code: "subscription_plan", revision: 2 },
      }),
    ).rejects.toThrow();
  });

  it("serializes reverse System/Tenant collisions and competing Tenant inserts without duplicate committed codes", async () => {
    const definition = await prisma.masterDefinition.findUniqueOrThrow({
      where: { code: "designation" },
      select: { id: true },
    });
    const tenant = await prisma.tenant.create({
      data: { slug: `m8-race-${randomUUID()}`, displayName: reason },
      select: { id: true },
    });
    for (const reverse of [false, true]) {
      const code = reverse ? "M8_REVERSE" : "M8_FORWARD";
      const rows: Prisma.MasterValueUncheckedCreateInput[] = [
        {
          definitionId: definition.id,
          source: "SYSTEM",
          code,
          name: code,
          sortOrder: 0,
        },
        {
          definitionId: definition.id,
          source: "TENANT",
          tenantId: tenant.id,
          code,
          name: code,
          sortOrder: 0,
        },
      ];
      if (reverse) rows.reverse();
      const results = await Promise.allSettled(
        rows.map((data) =>
          prisma.masterValue.create({ data, select: { id: true } }),
        ),
      );
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      expect(
        await prisma.masterValue.count({
          where: { definitionId: definition.id, code },
        }),
      ).toBe(1);
    }
    const results = await Promise.allSettled(
      Array.from({ length: 10 }, () =>
        masters.createValue(
          { kind: "TENANT", tenantId: tenant.id },
          "designation",
          label("M8_DUPLICATE"),
          actor,
        ),
      ),
    );
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(
      await prisma.masterValue.count({
        where: { tenantId: tenant.id, code: "M8_DUPLICATE" },
      }),
    ).toBe(1);
  }, 60000);

  it("rejects every published Industry child mutation and blocks migration with old-version overrides or code collisions", async () => {
    const t = await template(),
      v1 = await draft(t.id),
      scope = { kind: "INDUSTRY", versionId: v1.id } as const;
    const value = await masters.createValue(
      scope,
      "designation",
      label("M8_PINNED"),
      actor,
    );
    const inherited = await masters.createValue(
      system,
      "designation",
      label("M8_PUB_SYSTEM"),
      actor,
    );
    const child = await masters.setOverride(
      scope,
      inherited.id,
      override("Published label"),
      actor,
    );
    await publish(t.id, v1);
    await expect(
      masters.createValue(scope, "designation", label("M8_LATE"), actor),
    ).rejects.toThrow();
    await expect(
      prisma.masterValue.update({
        where: { id: value.id },
        data: { name: "Changed", revision: 2 },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.masterValue.delete({ where: { id: value.id } }),
    ).rejects.toThrow();
    if (!child.override) throw new Error("Missing fixture override");
    await expect(
      prisma.masterValueOverride.update({
        where: { id: child.override.id },
        data: { displayName: "Changed", revision: 2 },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.masterValueOverride.delete({ where: { id: child.override.id } }),
    ).rejects.toThrow();
    const tenant = await commercialTenant(t.code);
    await assignments.assign(
      tenant.id,
      { industryTemplateVersionId: v1.id, reason },
      actor,
    );
    await masters.setOverride(
      tenant.scope,
      value.id,
      override("Tenant inherited label"),
      tenant.owner,
    );
    const v2 = await draft(t.id);
    await publish(t.id, v2);
    const rejectedMigration = await request(app.getHttpServer())
      .post(`/platform/tenants/${tenant.id}/industry-template/migrate`)
      .set("Authorization", `Bearer ${token}`)
      .send({ industryTemplateVersionId: v2.id, expectedRevision: 1, reason })
      .expect(409);
    expect(rejectedMigration.body.message).toBe(
      "MASTER_OVERRIDE_RECONCILIATION_REQUIRED",
    );
    await expect(
      assignments.migrate(
        tenant.id,
        { industryTemplateVersionId: v2.id, expectedRevision: 1, reason },
        actor,
      ),
    ).rejects.toThrow();
    expect((await assignments.read(tenant.id))?.revision).toBe(1);
    await masters.removeOverride(
      tenant.scope,
      value.id,
      { expectedRevision: 1, reason },
      tenant.owner,
    );
    await assignments.migrate(
      tenant.id,
      { industryTemplateVersionId: v2.id, expectedRevision: 1, reason },
      actor,
    );
    const v3 = await draft(t.id);
    await masters.createValue(
      { kind: "INDUSTRY", versionId: v3.id },
      "designation",
      label("M8_COLLIDING"),
      actor,
    );
    await masters.createValue(
      tenant.scope,
      "designation",
      label("M8_COLLIDING"),
      tenant.owner,
    );
    await publish(t.id, v3);
    await expect(
      assignments.migrate(
        tenant.id,
        { industryTemplateVersionId: v3.id, expectedRevision: 2, reason },
        actor,
      ),
    ).rejects.toThrow();
    expect((await assignments.read(tenant.id))?.industryTemplateVersionId).toBe(
      v2.id,
    );
  }, 60000);

  it("reconciles only explicit reviewed legacy ownership, retains source rows, and rejects stale/different replay", async () => {
    const reconcile = app.get(MasterReconciliationService);
    const legacy = await prisma.masterRecord.create({
      data: {
        category: "designation",
        code: "M8_LEGACY",
        name: "Reviewed legacy label",
        displayColor: "#123456",
      },
      select: { id: true },
    });
    const report = await reconcile.report(actor);
    const row = report.items.find((item) => item.id === legacy.id);
    if (!row) throw new Error("Missing legacy report row");
    const mapping = {
      legacyRecordId: legacy.id,
      legacyHash: row.legacyHash,
      targetValueId: randomUUID(),
      definitionCode: "designation",
      scope: { kind: "SYSTEM" },
    };
    const command = { reason, mappings: [mapping] };
    const dry = await reconcile.run(command, actor);
    expect(dry.results[0].status).toBe("CREATE");
    expect(await prisma.masterLegacyReconciliation.count()).toBe(0);
    await expect(reconcile.run(command, actor, "bad")).rejects.toThrow(
      "hash mismatch",
    );
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        reconcile.run(command, actor, dry.reviewedHash),
      ),
    );
    expect(
      results.filter((r) => r.results[0].status === "CREATE"),
    ).toHaveLength(1);
    expect(await prisma.masterLegacyReconciliation.count()).toBe(1);
    expect(await prisma.masterRecord.count({ where: { id: legacy.id } })).toBe(
      1,
    );
    await expect(
      prisma.masterLegacyReconciliation.delete({
        where: { legacyRecordId: legacy.id },
      }),
    ).rejects.toThrow();
    await expect(
      reconcile.run(
        { reason, mappings: [{ ...mapping, targetValueId: randomUUID() }] },
        actor,
      ),
    ).rejects.toThrow("differently");
    await prisma.masterRecord.update({
      where: { id: legacy.id },
      data: { updatedAt: new Date(row.updatedAt.getTime() + 1000) },
    });
    await expect(
      reconcile.run(command, actor, dry.reviewedHash),
    ).rejects.toThrow("changed since review");
  });

  it("rolls back an entire legacy batch when its later row fails and rejects unknown categories", async () => {
    const reconcile = app.get(MasterReconciliationService);
    const ids: string[] = [];
    for (const code of ["M8_BATCH_A", "M8_BATCH_B"]) {
      const row = await prisma.masterRecord.create({
        data: { category: "designation", code, name: code },
        select: { id: true },
      });
      ids.push(row.id);
    }
    const report = await reconcile.report(actor, { limit: 100 });
    const mappings = report.items
      .filter((r) => ids.includes(r.id))
      .map((row) => ({
        legacyRecordId: row.id,
        legacyHash: row.legacyHash,
        targetValueId: randomUUID(),
        definitionCode: "designation",
        scope: { kind: "SYSTEM" },
      }));
    const command = { reason, mappings };
    const dry = await reconcile.run(command, actor);
    const last = [...mappings].sort((a, b) =>
      a.legacyRecordId < b.legacyRecordId ? -1 : 1,
    )[1];
    await prisma.masterRecord.update({
      where: { id: last.legacyRecordId },
      data: { name: "Invalidated later reviewed row" },
    });
    await expect(
      reconcile.run(command, actor, dry.reviewedHash),
    ).rejects.toThrow("changed since review");
    expect(
      await prisma.masterValue.count({
        where: { id: { in: mappings.map((m) => m.targetValueId) } },
      }),
    ).toBe(0);
    expect(
      await prisma.masterLegacyReconciliation.count({
        where: { legacyRecordId: { in: ids } },
      }),
    ).toBe(0);
    await expect(
      reconcile.run(
        {
          reason,
          mappings: [{ ...mappings[0], definitionCode: "subscription_plan" }],
        },
        actor,
      ),
    ).rejects.toThrow();
  });

  it("serializes publication against a Master child write in both lock orders", async () => {
    const definition = await prisma.masterDefinition.findUniqueOrThrow({
      where: { code: "designation" },
      select: { id: true },
    });
    for (const publisherFirst of [false, true]) {
      const t = await template(),
        version = await draft(t.id);
      let release: () => void = () => {
        throw new Error("Release not initialized");
      };
      let ready: () => void = () => {
        throw new Error("Ready not initialized");
      };
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const started = new Promise<void>((resolve) => {
        ready = resolve;
      });
      const code = publisherFirst ? "M8_PUBLISH_FIRST" : "M8_CHILD_FIRST";
      const first = direct(async (tx) => {
        if (publisherFirst) {
          await tx.industryTemplateVersion.update({
            where: { id: version.id },
            data: {
              status: "PUBLISHED",
              publishedAt: new Date(),
              publishedByUserId: actor,
              approvalReference: "TEST-ONLY",
              revision: { increment: 1 },
            },
          });
          await tx.industryTemplate.update({
            where: { id: t.id },
            data: {
              status: "ACTIVE",
              currentPublishedVersionId: version.id,
              revision: { increment: 1 },
            },
          });
        } else {
          await tx.masterValue.create({
            data: {
              definitionId: definition.id,
              source: "INDUSTRY",
              industryTemplateVersionId: version.id,
              code,
              name: code,
              sortOrder: 0,
            },
            select: { id: true },
          });
        }
        ready();
        await gate;
      });
      await started;
      const second = publisherFirst
        ? masters.createValue(
            { kind: "INDUSTRY", versionId: version.id },
            "designation",
            label(code),
            actor,
          )
        : publish(t.id, version);
      // Attach rejection handling before releasing the first transaction.
      const settled = Promise.allSettled([second]);
      try {
        let waiting = false;
        for (let attempt = 0; attempt < 40; attempt++) {
          const rows = await prisma.$queryRaw<
            { count: bigint }[]
          >`SELECT count(*) FROM pg_stat_activity WHERE datname=current_database() AND wait_event_type='Lock' AND pid<>pg_backend_pid()`;
          if (Number(rows[0].count) > 0) {
            waiting = true;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 25));
        }
        expect(waiting).toBe(true);
      } finally {
        release();
      }
      await first;
      const [result] = await settled;
      expect(result.status).toBe(publisherFirst ? "rejected" : "fulfilled");
      expect(
        await prisma.masterValue.count({
          where: { industryTemplateVersionId: version.id, code },
        }),
      ).toBe(publisherFirst ? 0 : 1);
      expect(
        (
          await prisma.industryTemplateVersion.findUniqueOrThrow({
            where: { id: version.id },
            select: { status: true },
          })
        ).status,
      ).toBe("PUBLISHED");
    }
  }, 60000);

  it("enforces definition flags and permits inheritance restoration after policy tightening", async () => {
    const definition = await prisma.masterDefinition.findUniqueOrThrow({
      where: { code: "designation" },
      select: { id: true },
    });
    const tenant = await prisma.tenant.create({
      data: { slug: `m8-policy-${randomUUID()}`, displayName: reason },
      select: { id: true },
    });
    const scope = { kind: "TENANT", tenantId: tenant.id } as const;
    const inherited = await masters.createValue(
      system,
      "designation",
      label("M8_POLICY_BASE"),
      actor,
    );
    await masters.setOverride(
      scope,
      inherited.id,
      override("Customized"),
      actor,
    );
    await prisma.masterDefinition.update({
      where: { id: definition.id },
      data: {
        allowTenantCreate: false,
        allowTenantEdit: false,
        allowTenantDeactivate: false,
        revision: { increment: 1 },
      },
    });
    await expect(
      masters.createValue(scope, "designation", label("M8_DENIED"), actor),
    ).rejects.toThrow("CREATE_POLICY");
    await expect(
      masters.setOverride(
        scope,
        inherited.id,
        override("Denied", true, 1),
        actor,
      ),
    ).rejects.toThrow();
    expect(
      (
        await effective.list(tenant.id, "designation", { limit: 100 })
      ).items.find((v) => v.id === inherited.id)?.name,
    ).toBe("M8_POLICY_BASE");
    await prisma.masterDefinition.update({
      where: { id: definition.id },
      data: {
        allowTenantCreate: true,
        systemValuePolicy: "LOCKED_IDENTITY",
        revision: { increment: 1 },
      },
    });
    // Presentation locking does not silently override the explicit extension flag.
    await masters.createValue(
      scope,
      "designation",
      label("M8_ALLOWED_EXTENSION"),
      actor,
    );
    await prisma.masterDefinition.update({
      where: { id: definition.id },
      data: { status: "INACTIVE", revision: { increment: 1 } },
    });
    await masters.removeOverride(
      scope,
      inherited.id,
      { reason, expectedRevision: 1 },
      actor,
    );
    expect(
      await prisma.masterValueOverride.count({
        where: { tenantId: tenant.id, inheritedMasterValueId: inherited.id },
      }),
    ).toBe(0);
    await prisma.masterDefinition.update({
      where: { id: definition.id },
      data: {
        status: "ACTIVE",
        allowTenantEdit: true,
        allowTenantDeactivate: true,
        systemValuePolicy: "OVERRIDABLE_LABEL",
        revision: { increment: 1 },
      },
    });
  });

  it("rejects stale-snapshot writes and preserves cross-scope uniqueness under SERIALIZABLE", async () => {
    const definition = await prisma.masterDefinition.findUniqueOrThrow({
      where: { code: "designation" },
      select: { id: true },
    });
    const tenant = await prisma.tenant.create({
      data: { slug: `m8-isolation-${randomUUID()}`, displayName: reason },
      select: { id: true },
    });
    await expect(
      prisma.$transaction(
        (tx) =>
          tx.masterValue.create({
            data: {
              definitionId: definition.id,
              source: "SYSTEM",
              code: "M8_UNSUPPORTED_ISOLATION",
              name: reason,
              sortOrder: 0,
            },
          }),
        { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
      ),
    ).rejects.toThrow("MASTER_WRITE_ISOLATION_UNSUPPORTED");
    const results = await Promise.allSettled([
      prisma.$transaction(
        (tx) =>
          tx.masterValue.create({
            data: {
              definitionId: definition.id,
              source: "SYSTEM",
              code: "M8_SERIALIZABLE",
              name: reason,
              sortOrder: 0,
            },
          }),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ),
      prisma.$transaction(
        (tx) =>
          tx.masterValue.create({
            data: {
              definitionId: definition.id,
              source: "TENANT",
              tenantId: tenant.id,
              code: "M8_SERIALIZABLE",
              name: reason,
              sortOrder: 0,
            },
          }),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      ),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(
      await prisma.masterValue.count({
        where: { definitionId: definition.id, code: "M8_SERIALIZABLE" },
      }),
    ).toBe(1);
  });

  it("preserves seed conflicts rather than overwriting reviewed data", async () => {
    const value = await prisma.masterValue.findFirstOrThrow({
      where: { source: "SYSTEM", definition: { code: "deal_priority" } },
      select: { id: true, revision: true },
    });
    await prisma.masterValue.update({
      where: { id: value.id },
      data: {
        name: "Explicit platform customization",
        revision: { increment: 1 },
      },
    });
    await expect(seed.run(actor)).rejects.toThrow("seed conflict");
    expect(
      (
        await prisma.masterValue.findUniqueOrThrow({
          where: { id: value.id },
          select: { name: true },
        })
      ).name,
    ).toBe("Explicit platform customization");
  });
});
