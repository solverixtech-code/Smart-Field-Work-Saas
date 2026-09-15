import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { Prisma, PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { execFileSync } from "child_process";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/persistence/prisma.service";
import { MasterService } from "../src/platform/masters/master.service";
import { MasterSeedService } from "../src/platform/masters/master-seed.service";
import { ProvisioningService } from "../src/platform/subscriptions/provisioning.service";
import { PlatformCatalogSyncService } from "../src/platform/modules/platform-catalog-sync.service";
import { verifyTestDatabaseSafety } from "../src/test-utils/test-db-safety";
import { syncRbac } from "../prisma/sync-rbac";
import { seedTenantRoleTemplates } from "../prisma/seeds/tenant-role-templates";
import { syncCrmAdministratorGrants } from "../prisma/sync-crm-grants";
import { RolePermissionService } from "../src/common/security/role-permission.service";

describe("Phase 1.1 CRM PostgreSQL and authenticated HTTP", () => {
  let app: INestApplication,
    prisma: PrismaService,
    actor: string,
    baseUrl: string;
  const schema = `crm11_${randomUUID().replace(/-/g, "")}`;
  const reason = "Isolated CRM test data";
  type Tenant = {
    id: string;
    owner: string;
    membershipId: string;
    token: string;
  };
  let a: Tenant, b: Tenant;
  let businessType: string, source: string, roleValue: string;
  const api = (token: string) => ({
    get: (url: string) =>
      request(app.getHttpServer())
        .get(`/tenant/crm${url}`)
        .auth(token, { type: "bearer" }),
    post: (url: string, body: object) =>
      request(app.getHttpServer())
        .post(`/tenant/crm${url}`)
        .auth(token, { type: "bearer" })
        .send(body),
    patch: (url: string, body: object) =>
      request(app.getHttpServer())
        .patch(`/tenant/crm${url}`)
        .auth(token, { type: "bearer" })
        .send(body),
    delete: (url: string, expectedRevision: number) =>
      request(app.getHttpServer())
        .delete(`/tenant/crm${url}`)
        .auth(token, { type: "bearer" })
        .send({ expectedRevision }),
  });
  const account = async (t = a, extra: object = {}) =>
    (
      await api(t.token)
        .post("/accounts", { name: "Shared business", ...extra })
        .expect(201)
    ).body as {
      id: string;
      revision: number;
      primaryContact?: { id: string; revision: number };
    };
  const contact = async (t = a, extra: object = {}) =>
    (
      await api(t.token)
        .post("/contacts", {
          name: "Shared person",
          email: "shared@test.invalid",
          ...extra,
        })
        .expect(201)
    ).body as {
      id: string;
      revision: number;
      accountId: string | null;
      ownerMembershipId: string | null;
    };
  beforeAll(async () => {
    verifyTestDatabaseSafety();
    baseUrl = process.env.TEST_DATABASE_URL!;
    const url = new URL(baseUrl);
    url.searchParams.set("schema", schema);
    process.env.DATABASE_URL = url.toString();
    execFileSync(
      process.execPath,
      [
        require.resolve("prisma/build/index.js"),
        "migrate",
        "deploy",
        "--schema=prisma/schema.prisma",
      ],
      { env: process.env, stdio: "pipe" },
    );
    app = (
      await Test.createTestingModule({ imports: [AppModule] }).compile()
    ).createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    await app.get(PlatformCatalogSyncService).syncCatalog();
    await seedTenantRoleTemplates(prisma);
    await syncRbac(prisma);
    actor = (
      await prisma.user.create({
        data: {
          employeeCode: randomUUID(),
          fullName: reason,
          email: `${randomUUID()}@test.invalid`,
          role: "SUPPORT",
          passwordHash: "unusable",
        },
        select: { id: true },
      })
    ).id;
    await prisma.platformUserRoleAssignment.create({
      data: {
        userId: actor,
        platformRoleId: (
          await prisma.platformRole.findUniqueOrThrow({
            where: { code: "PLATFORM_SUPER_ADMIN" },
            select: { id: true },
          })
        ).id,
        status: "ACTIVE",
      },
    });
    const seed = app.get(MasterSeedService);
    const dry = await seed.run(actor);
    await seed.run(actor, dry.reviewedHash);
    await prisma.industryClassification.create({
      data: { code: "CRM_TEST", name: reason },
    });
    a = await commercialTenant("CRM_TEST");
    b = await commercialTenant("CRM_TEST");
    await syncRbac(prisma);
    const masters = app.get(MasterService);
    const value = async (code: string) =>
      (
        await masters.createValue(
          { kind: "SYSTEM" },
          code,
          {
            code: `TEST_${randomUUID().replace(/-/g, "").toUpperCase()}`,
            name: reason,
            description: null,
            displayColor: null,
            sortOrder: 100,
            isActive: true,
            reason,
          },
          actor,
        )
      ).id;
    businessType = await value("business_type");
    source = await value("lead_source");
    roleValue = await value("contact_role");
  }, 120000);
  afterAll(async () => {
    if (app) await app.close();
    if (baseUrl) {
      const cleanup = new PrismaClient({
        datasources: { db: { url: baseUrl } },
      });
      if (!/^crm11_[a-f0-9]{32}$/.test(schema))
        throw new Error("Unsafe schema");
      await cleanup.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
      );
      await cleanup.$disconnect();
      process.env.DATABASE_URL = baseUrl;
    }
  });
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
        seatQuantity: 10,
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

  it("creates with effective business type and source, normalized nested primary, and CRM audits", async () => {
    const row = await account(a, {
      businessTypeValueId: businessType,
      sourceValueId: source,
      primaryContact: {
        name: "Private name",
        phone: "+91 (98765) 43210",
        roleValueId: roleValue,
      },
    });
    expect(row.primaryContact).toMatchObject({ revision: 1 });
    const audits = await prisma.auditLog.findMany({
      where: { tenantId: a.id, entityId: row.id },
      select: { category: true, metadata: true },
    });
    expect(audits.length).toBe(2);
    expect(audits.every((r) => r.category === "CRM")).toBe(true);
    expect(JSON.stringify(audits)).not.toContain("Private name");
    expect(JSON.stringify(audits)).not.toContain("98765");
  });
  it.each(["accounts", "contacts"])(
    "hides foreign %s for reads, updates and deletion",
    async (resource) => {
      const row = resource === "accounts" ? await account(b) : await contact(b);
      await api(a.token).get(`/${resource}/${row.id}`).expect(404);
      await api(a.token)
        .patch(`/${resource}/${row.id}`, {
          name: "Attack",
          expectedRevision: 1,
        })
        .expect(404);
      await api(a.token).delete(`/${resource}/${row.id}`, 1).expect(404);
    },
  );
  it("cannot use a foreign parent, nested child, owner or mismatched child", async () => {
    const own = await account(),
      foreign = await account(b),
      foreignContact = await contact(b, { accountId: foreign.id }),
      other = await account(),
      wrongChild = await contact(a, { accountId: other.id });
    await api(a.token).get(`/accounts/${foreign.id}/contacts`).expect(404);
    await api(a.token)
      .post(`/accounts/${foreign.id}/contacts`, {
        name: "Attack",
        email: "test@test.invalid",
      })
      .expect(404);
    for (const child of [foreignContact, wrongChild])
      await api(a.token)
        .patch(`/accounts/${own.id}/primary-contact`, {
          contactId: child.id,
          expectedRevision: 1,
        })
        .expect(404);
    await api(a.token)
      .post("/accounts", { name: "Attack", ownerMembershipId: b.membershipId })
      .expect(404);
  });
  it("requires phone or email, rejects server fields and normalizes without global uniqueness", async () => {
    await api(a.token).post("/contacts", { name: "Invalid" }).expect(400);
    await api(a.token)
      .post("/accounts", { name: "Invalid", tenantId: b.id })
      .expect(400);
    await contact();
    await contact();
    await account();
    await account();
  });
  it.each(["accounts", "contacts"])(
    "uses atomic revisions and hides soft-deleted %s",
    async (resource) => {
      const row = resource === "accounts" ? await account() : await contact();
      const results = await Promise.all(
        [1, 2].map((n) =>
          api(a.token).patch(`/${resource}/${row.id}`, {
            name: `Revision ${n}`,
            expectedRevision: 1,
          }),
        ),
      );
      expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
      expect(results.find((r) => r.status === 409)?.body.code).toBe(
        "CRM_STALE_REVISION",
      );
      await api(a.token).delete(`/${resource}/${row.id}`, 1).expect(409);
      await api(a.token).delete(`/${resource}/${row.id}`, 2).expect(204);
      await api(a.token).get(`/${resource}/${row.id}`).expect(404);
      await api(a.token).delete(`/${resource}/${row.id}`, 3).expect(404);
    },
  );
  it("serializes concurrent primary switches and enforces explicit demotion before delete/deactivation", async () => {
    const row = await account();
    const first = await contact(a, { accountId: row.id }),
      second = await contact(a, { accountId: row.id });
    const results = await Promise.all(
      [first, second].map((c) =>
        api(a.token).patch(`/accounts/${row.id}/primary-contact`, {
          contactId: c.id,
          expectedRevision: 3,
        }),
      ),
    );
    expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
    const primary = await prisma.contact.findFirstOrThrow({
      where: { accountId: row.id, isPrimary: true },
      select: { id: true, revision: true },
    });
    expect(
      await prisma.contact.count({
        where: { accountId: row.id, isPrimary: true },
      }),
    ).toBe(1);
    expect(
      (
        await api(a.token)
          .delete(`/contacts/${primary.id}`, primary.revision)
          .expect(409)
      ).body.code,
    ).toBe("CRM_PRIMARY_CONTACT_REQUIRED_CHANGE");
    await api(a.token)
      .patch(`/contacts/${primary.id}`, {
        status: "INACTIVE",
        expectedRevision: primary.revision,
      })
      .expect(409);
    expect(
      (await api(a.token).delete(`/accounts/${row.id}`, 4).expect(409)).body
        .code,
    ).toBe("CRM_ACCOUNT_HAS_CONTACTS");
    await api(a.token)
      .patch(`/accounts/${row.id}/primary-contact`, {
        contactId: null,
        expectedRevision: 4,
      })
      .expect(200);
    await api(a.token)
      .delete(`/contacts/${primary.id}`, primary.revision + 1)
      .expect(204);
  });
  it("maintains linked and standalone ownership and immutable links at SQL level", async () => {
    const row = await account(),
      standalone = await contact(),
      linked = await contact(a, { accountId: row.id });
    expect(standalone.ownerMembershipId).toBe(a.membershipId);
    expect(linked.ownerMembershipId).toBeNull();
    await expect(
      prisma.contact.update({
        where: { id: standalone.id },
        data: { ownerMembershipId: null },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.contact.update({
        where: { id: linked.id },
        data: { ownerMembershipId: a.membershipId },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.contact.update({
        where: { id: standalone.id },
        data: { accountId: row.id, ownerMembershipId: null },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.account.update({
        where: { id: row.id },
        data: { ownerMembershipId: b.membershipId },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.account.update({ where: { id: row.id }, data: { revision: 0 } }),
    ).rejects.toThrow();
    await expect(
      prisma.account.update({
        where: { id: row.id },
        data: { tenantId: b.id },
      }),
    ).rejects.toThrow();
  });
  it("SQL blocks dual primary, primary deletion, inactive primary and live-child deletion", async () => {
    const row = await account(a, {
      primaryContact: { name: "Primary", email: "primary@test.invalid" },
    });
    const child = await contact(a, { accountId: row.id });
    await expect(
      prisma.contact.update({
        where: { id: child.id },
        data: { isPrimary: true },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.contact.update({
        where: { id: row.primaryContact!.id },
        data: { status: "INACTIVE" },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.contact.update({
        where: { id: row.primaryContact!.id },
        data: { deletedAt: new Date() },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.account.update({
        where: { id: row.id },
        data: { deletedAt: new Date() },
      }),
    ).rejects.toThrow();
  });
  it("rejects wrong and inactive Master selections while retaining historical labels", async () => {
    await api(a.token)
      .post("/accounts", { name: "Invalid", businessTypeValueId: roleValue })
      .expect(422);
    await api(a.token)
      .post("/accounts", { name: "Invalid", sourceValueId: businessType })
      .expect(422);
    await api(a.token)
      .post("/contacts", {
        name: "Invalid",
        email: "x@test.invalid",
        roleValueId: source,
      })
      .expect(422);
    const row = await account(a, { businessTypeValueId: businessType });
    await prisma.masterValue.update({
      where: { id: businessType },
      data: { isActive: false, revision: { increment: 1 } },
    });
    await api(a.token)
      .post("/accounts", { name: "Invalid", businessTypeValueId: businessType })
      .expect(422);
    expect(
      (await api(a.token).get(`/accounts/${row.id}`).expect(200)).body
        .businessType,
    ).toBe(reason);
    await prisma.masterValue.update({
      where: { id: businessType },
      data: { isActive: true, revision: { increment: 1 } },
    });
  });
  it("rolls back all writes if the transactional audit fails", async () => {
    await prisma.$executeRawUnsafe(
      `CREATE FUNCTION crm_test_fail_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='account.created' THEN RAISE EXCEPTION 'test audit failure'; END IF; RETURN NEW; END $$`,
    );
    await prisma.$executeRawUnsafe(
      `CREATE TRIGGER crm_test_fail_audit BEFORE INSERT ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION crm_test_fail_audit()`,
    );
    const before = await prisma.account.count();
    try {
      const response = await api(a.token)
        .post("/accounts", { name: "Sensitive rollback name" })
        .expect(500);
      expect(JSON.stringify(response.body)).not.toMatch(
        /INSERT|Sensitive rollback name|test audit failure/,
      );
      expect(await prisma.account.count()).toBe(before);
    } finally {
      await prisma.$executeRawUnsafe(
        'DROP TRIGGER crm_test_fail_audit ON "AuditLog"',
      );
      await prisma.$executeRawUnsafe("DROP FUNCTION crm_test_fail_audit()");
    }
  });
  it("denies inactive owners and returns bounded same-tenant owner options", async () => {
    const user = await prisma.user.create({
      data: {
        employeeCode: randomUUID(),
        email: `${randomUUID()}@test.invalid`,
        fullName: "Inactive owner",
        passwordHash: "unusable",
        role: "SUPPORT",
      },
      select: { id: true },
    });
    const member = await prisma.tenantMembership.create({
      data: { tenantId: a.id, userId: user.id, status: "SUSPENDED" },
      select: { id: true },
    });
    await api(a.token)
      .post("/accounts", { name: "Invalid", ownerMembershipId: member.id })
      .expect(422);
    const response = await api(a.token)
      .get("/owner-options?limit=1")
      .expect(200);
    expect(response.body.items).toHaveLength(1);
    expect(Object.keys(response.body.items[0]).sort()).toEqual([
      "displayName",
      "id",
    ]);
    expect(response.body.items[0].id).not.toBe(b.membershipId);
  });
  it("requires explicit action and scope; tenant grant widens only its selected tenant", async () => {
    const tenantRole = await prisma.tenantRole.create({
      data: {
        tenantId: a.id,
        code: `test_${randomUUID()}`,
        name: "Policy test",
      },
      select: { id: true },
    });
    const user = await prisma.user.create({
      data: {
        employeeCode: randomUUID(),
        email: `${randomUUID()}@test.invalid`,
        fullName: "Restricted",
        passwordHash: "unusable",
        role: "ADMIN",
        dataScope: "ALL",
      },
      select: { id: true },
    });
    const member = await prisma.tenantMembership.create({
      data: {
        tenantId: a.id,
        userId: user.id,
        status: "ACTIVE",
        tenantRoleId: tenantRole.id,
      },
      select: { id: true },
    });
    const token = app.get(JwtService).sign({ sub: user.id, mid: member.id });
    const grants = app.get(RolePermissionService);
    await grants.grantTenantPermission(
      a.id,
      tenantRole.id,
      "crm.businesses.view",
    );
    await api(token).get("/accounts").expect(403);
    await grants.grantTenantPermission(
      a.id,
      tenantRole.id,
      "crm.businesses.access.own",
    );
    const row = await account();
    await api(token).get(`/accounts/${row.id}`).expect(404);
    await grants.grantTenantPermission(
      a.id,
      tenantRole.id,
      "crm.businesses.access.tenant",
    );
    const response = await api(token).get(`/accounts/${row.id}`).expect(200);
    expect(response.body).not.toHaveProperty("primaryContact");
    const foreign = await account(b);
    await api(token).get(`/accounts/${foreign.id}`).expect(404);
    await api(token).post("/accounts", { name: "Denied" }).expect(403);
  });
  it("platform-only authority and legacy unmapped tenants cannot access CRM", async () => {
    const platformToken = app.get(JwtService).sign({ sub: actor });
    await api(platformToken).get("/accounts").expect(403);
    const legacy = await prisma.tenant.create({
      data: { slug: `legacy-${randomUUID()}`, displayName: "Legacy test" },
      select: { id: true },
    });
    await syncRbac(prisma);
    const role = await prisma.tenantRole.findUniqueOrThrow({
      where: { tenantId_code: { tenantId: legacy.id, code: "tenant_admin" } },
      select: { id: true },
    });
    const member = await prisma.tenantMembership.create({
      data: {
        tenantId: legacy.id,
        userId: actor,
        status: "ACTIVE",
        tenantRoleId: role.id,
      },
      select: { id: true },
    });
    await api(app.get(JwtService).sign({ sub: actor, mid: member.id }))
      .get("/accounts")
      .expect(403);
  });
  it("synchronizes versioned admin grants once without overwriting customized grants", async () => {
    const admin = await prisma.tenantRole.findUniqueOrThrow({
      where: { tenantId_code: { tenantId: a.id, code: "tenant_admin" } },
      select: { id: true },
    });
    const grants = app.get(RolePermissionService);
    await grants.revokeTenantPermission(a.id, admin.id, "crm.contacts.assign");
    expect((await syncCrmAdministratorGrants(prisma)).added).toBe(1);
    const before = await prisma.tenantRole.findUniqueOrThrow({
      where: { id: admin.id },
      select: { permissionsVersion: true },
    });
    const audits = await prisma.auditLog.count({
      where: { action: "rbac.tenant.grant" },
    });
    expect((await syncCrmAdministratorGrants(prisma)).added).toBe(0);
    expect(
      await prisma.tenantRole.findUniqueOrThrow({
        where: { id: admin.id },
        select: { permissionsVersion: true },
      }),
    ).toEqual(before);
    expect(
      await prisma.auditLog.count({ where: { action: "rbac.tenant.grant" } }),
    ).toBe(audits);
  });
  it("keeps Contact scope and protected primary search independent of Business read access", async () => {
    const role = await prisma.tenantRole.create({
      data: {
        tenantId: a.id,
        code: `limited_${randomUUID()}`,
        name: "Contact policy test",
      },
      select: { id: true },
    });
    const user = await prisma.user.create({
      data: {
        employeeCode: randomUUID(),
        email: `${randomUUID()}@test.invalid`,
        fullName: "Contact policy actor",
        passwordHash: "unusable",
        role: "ADMIN",
        dataScope: "ALL",
      },
      select: { id: true },
    });
    const member = await prisma.tenantMembership.create({
      data: {
        tenantId: a.id,
        userId: user.id,
        tenantRoleId: role.id,
        status: "ACTIVE",
      },
      select: { id: true },
    });
    const token = app.get(JwtService).sign({ sub: user.id, mid: member.id });
    const grants = app.get(RolePermissionService);
    for (const code of [
      "crm.businesses.view",
      "crm.businesses.access.tenant",
      "crm.contacts.view",
      "crm.contacts.create",
    ])
      await grants.grantTenantPermission(a.id, role.id, code);
    const needle = `Private_${randomUUID()}`;
    const row = await account(a, {
      primaryContact: { name: needle, email: "private@test.invalid" },
    });
    await api(token).get("/contacts").expect(403);
    expect(
      (await api(token).get(`/accounts?search=${needle}`).expect(200)).body
        .total,
    ).toBe(0);
    await grants.grantTenantPermission(
      a.id,
      role.id,
      "crm.contacts.access.own",
    );
    // Linked scope comes from the visible Account; standalone OWN still restricts the owner.
    expect(
      (
        await api(token).get(`/accounts?search=${needle}`).expect(200)
      ).body.items.map((item: { id: string }) => item.id),
    ).toEqual([row.id]);
    await api(token).get(`/contacts/${row.primaryContact!.id}`).expect(200);
    const standalone = await contact();
    await api(token).get(`/contacts/${standalone.id}`).expect(404);
    await grants.grantTenantPermission(
      a.id,
      role.id,
      "crm.contacts.access.tenant",
    );
    await api(token).get(`/contacts/${standalone.id}`).expect(200);
    await grants.revokeTenantPermission(a.id, role.id, "crm.contacts.view");
    const created = await api(token)
      .post("/contacts", {
        name: "Do not project without view",
        email: "private@test.invalid",
      })
      .expect(201);
    expect(created.body).not.toHaveProperty("name");
    expect(created.body).not.toHaveProperty("email");
  });
  it("allows an explicit assign grant to transfer an owned Business and removes subsequent OWN access", async () => {
    const role = await prisma.tenantRole.create({
      data: {
        tenantId: a.id,
        code: `assign_${randomUUID()}`,
        name: "Assignment policy",
      },
      select: { id: true },
    });
    const user = await prisma.user.create({
      data: {
        employeeCode: randomUUID(),
        email: `${randomUUID()}@test.invalid`,
        fullName: "Assignment actor",
        passwordHash: "unusable",
        role: "SUPPORT",
      },
      select: { id: true },
    });
    const member = await prisma.tenantMembership.create({
      data: {
        tenantId: a.id,
        userId: user.id,
        tenantRoleId: role.id,
        status: "ACTIVE",
      },
      select: { id: true },
    });
    const token = app.get(JwtService).sign({ sub: user.id, mid: member.id });
    const grants = app.get(RolePermissionService);
    for (const code of [
      "crm.businesses.view",
      "crm.businesses.create",
      "crm.businesses.update",
      "crm.businesses.access.own",
    ])
      await grants.grantTenantPermission(a.id, role.id, code);
    const row = (
      await api(token).post("/accounts", { name: "Owned business" }).expect(201)
    ).body as { id: string };
    await api(token)
      .patch(`/accounts/${row.id}`, {
        ownerMembershipId: a.membershipId,
        expectedRevision: 1,
      })
      .expect(403);
    await grants.grantTenantPermission(a.id, role.id, "crm.businesses.assign");
    await api(token)
      .patch(`/accounts/${row.id}`, {
        ownerMembershipId: a.membershipId,
        expectedRevision: 1,
      })
      .expect(200);
    await api(token).get(`/accounts/${row.id}`).expect(404);
    expect(
      await prisma.auditLog.count({
        where: { action: "account.owner.changed", entityId: row.id },
      }),
    ).toBe(1);
  });
  it("rejects foreign Contact composite references through direct SQL-backed Prisma writes", async () => {
    const parent = await account(b);
    const data = {
      tenantId: a.id,
      name: "Foreign reference",
      email: "test@test.invalid",
      createdByMembershipId: a.membershipId,
      updatedByMembershipId: a.membershipId,
    };
    await expect(
      prisma.contact.create({ data: { ...data, accountId: parent.id } }),
    ).rejects.toThrow();
    await expect(
      prisma.contact.create({
        data: { ...data, ownerMembershipId: b.membershipId },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.contact.create({
        data: {
          ...data,
          ownerMembershipId: a.membershipId,
          createdByMembershipId: b.membershipId,
        },
      }),
    ).rejects.toThrow();
  });
  it("paginates with a scoped total, stable order, bounded inputs and real authentication errors", async () => {
    const one = await account(a, { name: "Pagination exact" }),
      two = await account(a, { name: "Pagination exact" });
    const first = await api(a.token)
      .get(
        "/accounts?search=Pagination%20exact&limit=1&sortBy=name&sortDirection=asc",
      )
      .expect(200);
    const second = await api(a.token)
      .get(
        "/accounts?search=Pagination%20exact&limit=1&page=2&sortBy=name&sortDirection=asc",
      )
      .expect(200);
    expect(first.body).toMatchObject({
      total: 2,
      page: 1,
      limit: 1,
      totalPages: 2,
    });
    expect([first.body.items[0].id, second.body.items[0].id]).toEqual(
      [one.id, two.id].sort(),
    );
    expect(
      (await api(a.token).get("/accounts?search=%28%29").expect(200)).body
        .total,
    ).toBe(0);
    expect(
      (await api(a.token).get("/contacts?search=%28%29").expect(200)).body
        .total,
    ).toBe(0);
    await api(a.token).get("/accounts?limit=101").expect(400);
    await api(a.token).get("/accounts?sortBy=tenantId").expect(400);
    await api(a.token).get("/accounts/not-a-uuid").expect(400);
    await request(app.getHttpServer()).get("/tenant/crm/accounts").expect(401);
  });

  it("denies subscribed access when core_crm is no longer an effective active module", async () => {
    await prisma.platformModule.update({
      where: { code: "core_crm" },
      data: { status: "DEPRECATED" },
    });
    try {
      await api(a.token).get("/accounts").expect(403);
      await api(a.token).post("/accounts", { name: "Denied" }).expect(403);
    } finally {
      await prisma.platformModule.update({
        where: { code: "core_crm" },
        data: { status: "ACTIVE" },
      });
    }
  });
  it("does not echo unknown properties, enum values or search URLs in validation errors", async () => {
    const secret = "SensitiveCRMTestValue";
    const body = await api(a.token)
      .post("/accounts", { name: "Invalid", status: secret, [secret]: true })
      .expect(400);
    expect(JSON.stringify(body.body)).not.toContain(secret);
    const query = await api(a.token)
      .get(`/accounts?limit=0&search=${secret}`)
      .expect(400);
    expect(JSON.stringify(query.body)).not.toContain(secret);
  });
});
