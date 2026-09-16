import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { Prisma, PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { execFileSync } from "child_process";
import request from "supertest";
import { z } from "zod";
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
    await expect(
      prisma.contact.delete({ where: { id: standalone.id } }),
    ).rejects.toThrow("CRM_SOFT_DELETE_ONLY");
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
      prisma.contact.delete({ where: { id: row.primaryContact!.id } }),
    ).rejects.toThrow("CRM_SOFT_DELETE_ONLY");
    const empty = await account();
    await expect(
      prisma.account.delete({ where: { id: empty.id } }),
    ).rejects.toThrow("CRM_SOFT_DELETE_ONLY");
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

  describe("Phase 1.2 Lead persistence, authorization and conversion", () => {
    let c: Tenant,
      d: Tenant,
      restricted: { token: string; id: string; roleId: string };
    const shape = z.object({
      id: z.string(),
      revision: z.number(),
      status: z.string(),
      name: z.string(),
      ownerMembershipId: z.string(),
      assignedMembershipId: z.string().nullable(),
    });
    const createLead = async (extra: object = {}, t = c) =>
      shape.parse(
        (
          await api(t.token)
            .post("/leads", {
              name: "Lead proof",
              phone: "+919876543210",
              ...extra,
            })
            .expect(201)
        ).body,
      );
    const qualify = async (extra: object = {}) => {
      const lead = await createLead(extra);
      return shape.parse(
        (
          await api(c.token)
            .patch("/leads/" + lead.id, {
              expectedRevision: lead.revision,
              status: "QUALIFIED",
            })
            .expect(200)
        ).body,
      );
    };
    const conversion = (expectedRevision: number) => ({
      expectedRevision,
      idempotencyKey: randomUUID(),
      account: { mode: "create", data: { name: "Converted account" } },
      contact: {
        mode: "create",
        data: { name: "Converted person", email: "converted@test.invalid" },
      },
    });
    const convert = (id: string, body: object, token = c.token) =>
      api(token).post("/leads/" + id + "/conversion", body);
    async function grants(codes: string[]) {
      const service = app.get(RolePermissionService);
      const current = await prisma.tenantRolePermission.findMany({
        where: { tenantRoleId: restricted.roleId },
        select: { permission: { select: { code: true } } },
      });
      for (const grant of current)
        if (grant.permission.code && !codes.includes(grant.permission.code))
          await service.revokeTenantPermission(
            c.id,
            restricted.roleId,
            grant.permission.code,
          );
      for (const code of codes)
        await service.grantTenantPermission(
          c.id,
          restricted.roleId,
          code,
          true,
        );
    }
    beforeAll(async () => {
      c = await commercialTenant("CRM_TEST");
      d = await commercialTenant("CRM_TEST");
      const role = await prisma.tenantRole.create({
        data: {
          tenantId: c.id,
          code: "lead_restricted",
          name: "Lead restricted",
        },
        select: { id: true },
      });
      const user = await prisma.user.create({
        data: {
          employeeCode: randomUUID(),
          email: randomUUID() + "@test.invalid",
          fullName: "Lead scope proof",
          role: "ADMIN",
          dataScope: "ALL",
          passwordHash: "unusable",
        },
        select: { id: true },
      });
      const member = await prisma.tenantMembership.create({
        data: {
          tenantId: c.id,
          userId: user.id,
          tenantRoleId: role.id,
          status: "ACTIVE",
        },
        select: { id: true },
      });
      restricted = {
        id: member.id,
        roleId: role.id,
        token: app.get(JwtService).sign({ sub: user.id, mid: member.id }),
      };
    }, 60000);
    it("has an empty bounded workspace and zero scoped aggregates", async () => {
      expect((await api(c.token).get("/leads").expect(200)).body).toMatchObject(
        { items: [], total: 0, totalPages: 0 },
      );
      expect(
        (await api(c.token).get("/leads/counts").expect(200)).body,
      ).toMatchObject({ total: 0, unassigned: 0, lifecycle: [], sources: [] });
    });
    it("persists normalized fields and rejects forged input and source identity", async () => {
      const row = await createLead({
        phone: "+91 (98765) 43210",
        sourceValueId: source,
        priority: "HIGH",
      });
      const read = (
        await api(c.token)
          .get("/leads/" + row.id)
          .expect(200)
      ).body;
      expect(read).toMatchObject({
        phone: "+919876543210",
        source: reason,
        priority: "HIGH",
        revision: 1,
        status: "OPEN",
      });
      for (const field of [
        "tenantId",
        "convertedAt",
        "revision",
        "createdByMembershipId",
      ])
        await api(c.token)
          .post("/leads", { name: "bad", [field]: randomUUID() })
          .expect(400);
      await api(c.token)
        .post("/leads", {
          name: "bad",
          phone: "+919876543210",
          sourceValueId: roleValue,
        })
        .expect(422);
      await api(c.token)
        .post("/leads", {
          name: "bad",
          phone: "+919876543210",
          sourceValueId: randomUUID(),
        })
        .expect(404);
      await api(c.token).get("/leads?limit=101").expect(400);
    });
    it("isolates foreign UUIDs across every read/write/assignment/conversion path", async () => {
      const foreign = await createLead({}, d);
      await api(c.token)
        .get("/leads/" + foreign.id)
        .expect(404);
      await api(c.token)
        .patch("/leads/" + foreign.id, { name: "attack", expectedRevision: 1 })
        .expect(404);
      await api(c.token)
        .delete("/leads/" + foreign.id, 1)
        .expect(404);
      await api(c.token)
        .patch("/leads/" + foreign.id + "/assignment", {
          assignedMembershipId: c.membershipId,
          expectedRevision: 1,
        })
        .expect(404);
      await convert(foreign.id, conversion(1)).expect(404);
      expect(
        (await api(c.token).get("/leads").expect(200)).body.items.some(
          (r: { id: string }) => r.id === foreign.id,
        ),
      ).toBe(false);
    });
    it.each(["own", "assigned", "tenant"])(
      "enforces the %s scope and exact tenant isolation",
      async (scope) => {
        await grants(["crm.leads.view", "crm.leads.access." + scope]);
        const own = await createLead({ ownerMembershipId: restricted.id });
        const assigned = await createLead({
          assignedMembershipId: restricted.id,
        });
        const other = await createLead();
        const rows = (
          await api(restricted.token).get("/leads?limit=100").expect(200)
        ).body.items as Array<{ id: string }>;
        expect(rows.some((r) => r.id === own.id)).toBe(
          scope === "own" || scope === "tenant",
        );
        expect(rows.some((r) => r.id === assigned.id)).toBe(
          scope === "assigned" || scope === "tenant",
        );
        expect(rows.some((r) => r.id === other.id)).toBe(scope === "tenant");
        if (scope !== "tenant")
          await api(restricted.token)
            .get("/leads/" + other.id)
            .expect(404);
        const total = (
          await api(restricted.token).get("/leads/counts").expect(200)
        ).body.total;
        expect(total).toBe(rows.length);
      },
    );
    it("unions OWN and ASSIGNED and denies scope-free and manage-only authority", async () => {
      const own = await createLead({ ownerMembershipId: restricted.id }),
        assigned = await createLead({ assignedMembershipId: restricted.id });
      await grants([
        "crm.leads.view",
        "crm.leads.access.own",
        "crm.leads.access.assigned",
      ]);
      for (const id of [own.id, assigned.id])
        await api(restricted.token)
          .get("/leads/" + id)
          .expect(200);
      await grants(["crm.leads.view", "crm.leads.manage"]);
      await api(restricted.token).get("/leads").expect(403);
      await api(restricted.token).get("/leads/counts").expect(403);
      await api(restricted.token)
        .post("/leads", { name: "Denied", phone: "+919876543210" })
        .expect(403);
      await grants([
        "crm.leads.view",
        "crm.leads.manage",
        "crm.leads.access.tenant",
      ]);
      await api(restricted.token)
        .patch("/leads/" + own.id, { expectedRevision: 1, name: "Denied" })
        .expect(403);
      await api(restricted.token)
        .delete("/leads/" + own.id, 1)
        .expect(403);
      await api(restricted.token)
        .patch("/leads/" + own.id + "/assignment", {
          expectedRevision: 1,
          assignedMembershipId: restricted.id,
        })
        .expect(403);
      await convert(own.id, conversion(1), restricted.token).expect(403);
    });
    it("permits exact create/update/delete grants without manage", async () => {
      await grants([
        "crm.leads.view",
        "crm.leads.create",
        "crm.leads.update",
        "crm.leads.delete",
        "crm.leads.access.own",
      ]);
      const row = shape.parse(
        (
          await api(restricted.token)
            .post("/leads", {
              name: "Scoped create",
              phone: "+919876543210",
            })
            .expect(201)
        ).body,
      );
      await api(restricted.token)
        .patch("/leads/" + row.id, { expectedRevision: 1, name: "Scoped edit" })
        .expect(200);
      await api(restricted.token)
        .delete("/leads/" + row.id, 1)
        .expect(409);
      await api(restricted.token)
        .delete("/leads/" + row.id, 2)
        .expect(204);
      await api(restricted.token)
        .get("/leads/" + row.id)
        .expect(404);
    });
    it("validates membership references and serializes competing assignments", async () => {
      const row = await createLead();
      for (const field of ["ownerMembershipId", "assignedMembershipId"])
        await api(c.token)
          .patch("/leads/" + row.id + "/assignment", {
            expectedRevision: 1,
            [field]: d.membershipId,
          })
          .expect(404);
      await prisma.tenantMembership.update({
        where: { id: restricted.id },
        data: { status: "SUSPENDED" },
      });
      try {
        await api(c.token)
          .patch("/leads/" + row.id + "/assignment", {
            expectedRevision: 1,
            assignedMembershipId: restricted.id,
          })
          .expect(422);
      } finally {
        await prisma.tenantMembership.update({
          where: { id: restricted.id },
          data: { status: "ACTIVE" },
        });
      }
      const race = await Promise.all(
        [c.membershipId, restricted.id].map((id) =>
          api(c.token).patch("/leads/" + row.id + "/assignment", {
            expectedRevision: 1,
            assignedMembershipId: id,
          }),
        ),
      );
      expect(race.map((r) => r.status).sort()).toEqual([200, 409]);
      await expect(
        prisma.lead.update({
          where: { id: row.id },
          data: { assignedMembershipId: d.membershipId },
        }),
      ).rejects.toThrow();
      const options = (
        await api(c.token).get("/leads/owner-options?limit=1").expect(200)
      ).body;
      expect(options.items).toHaveLength(1);
      expect(Object.keys(options.items[0]).sort()).toEqual([
        "avatarUrl",
        "displayName",
        "id",
        "role",
      ]);
    });
    it("supports real bulk assignment, history, notes, import preview, import and CSV export", async () => {
      const row = await createLead({ phone: "+919000000001" });
      const bulk = await api(c.token)
        .post("/leads/bulk-assign", {
          leadIds: [row.id],
          assignedMembershipId: c.membershipId,
          reason: "Manual coverage",
        })
        .expect(201);
      expect(bulk.body).toMatchObject({
        mode: "atomic",
        requested: 1,
        assigned: 1,
      });

      await api(c.token)
        .post("/leads/" + row.id + "/notes", { note: "Customer asked for demo" })
        .expect(201);
      const history = await api(c.token)
        .get("/leads/" + row.id + "/history")
        .expect(200);
      expect(
        history.body.items.some(
          (item: { eventType: string; note?: string }) =>
            item.eventType === "note" && item.note === "Customer asked for demo",
        ),
      ).toBe(true);
      expect(
        history.body.items.some(
          (item: { eventType: string; note?: string }) =>
            item.eventType === "assigned" && item.note === "Manual coverage",
        ),
      ).toBe(true);

      const csv = [
        "leadType,businessName,contactName,phone,email,priority,sourceValueId,nextFollowUpAt,nextActionNote",
        `BUSINESS,=Injected,Importer,+919000000002,importer@test.invalid,HIGH,${source},2000-01-01T00:00:00.000Z,Call back`,
      ].join("\n");
      const preview = await api(c.token)
        .post("/leads/import/preview", {
          csv,
          duplicatePolicy: "SKIP",
          defaultSourceValueId: source,
        })
        .expect(201);
      expect(preview.body).toMatchObject({
        totalRows: 1,
        readyRows: 1,
        rejectedRows: 0,
      });
      const imported = await api(c.token)
        .post("/leads/import", {
          csv,
          duplicatePolicy: "SKIP",
          defaultSourceValueId: source,
          confirmed: true,
        })
        .expect(201);
      expect(imported.body).toMatchObject({
        created: 1,
        skipped: 0,
        rejected: 0,
      });

      const counts = await api(c.token)
        .get("/leads/summary?followUp=pending")
        .expect(200);
      expect(counts.body.pendingFollowUps).toBeGreaterThanOrEqual(1);
      const exported = await api(c.token)
        .get("/leads/export?priority=HIGH&maxRows=50")
        .expect(200)
        .expect("Content-Type", /text\/csv/);
      expect(exported.text).toContain("Lead Code");
      expect(exported.text).toContain("'=Injected");
    });
    it("validates Account/Contact links and protects referenced records", async () => {
      const parent = await account(c),
        linked = await contact(c, { accountId: parent.id }),
        foreign = await account(d);
      await api(c.token)
        .post("/leads", {
          name: "bad",
          phone: "+919876543210",
          accountId: foreign.id,
        })
        .expect(404);
      await api(c.token)
        .post("/leads", {
          name: "bad",
          phone: "+919876543210",
          contactId: (await contact(d)).id,
        })
        .expect(404);
      await api(c.token)
        .post("/leads", {
          name: "bad",
          phone: "+919876543210",
          contactId: linked.id,
        })
        .expect(422);
      const lead = await createLead({
        accountId: parent.id,
        contactId: linked.id,
      });
      await api(c.token)
        .delete("/contacts/" + linked.id, 1)
        .expect(409);
      await expect(
        prisma.lead.update({
          where: { id: lead.id },
          data: { accountId: foreign.id },
        }),
      ).rejects.toThrow();
      await expect(
        prisma.lead.update({
          where: { id: lead.id },
          data: { tenantId: d.id },
        }),
      ).rejects.toThrow();
      await expect(
        prisma.lead.delete({ where: { id: lead.id } }),
      ).rejects.toThrow("CRM_SOFT_DELETE_ONLY");
    });
    it("enforces lifecycle and stale update races", async () => {
      const row = await createLead();
      await convert(row.id, conversion(1)).expect(409);
      const race = await Promise.all(
        ["QUALIFIED", "DISQUALIFIED"].map((status) =>
          api(c.token).patch("/leads/" + row.id, {
            expectedRevision: 1,
            status,
          }),
        ),
      );
      expect(race.map((r) => r.status).sort()).toEqual([200, 409]);
      const closed = await createLead();
      await api(c.token)
        .patch("/leads/" + closed.id, {
          expectedRevision: 1,
          status: "DUPLICATE",
        })
        .expect(200);
      await api(c.token)
        .patch("/leads/" + closed.id, { expectedRevision: 2, status: "OPEN" })
        .expect(409);
      await api(c.token)
        .patch("/leads/" + closed.id, {
          expectedRevision: 2,
          status: "CONVERTED",
        })
        .expect(400);
      await expect(
        prisma.lead.update({
          where: { id: closed.id },
          data: { status: "OPEN" },
        }),
      ).rejects.toThrow("CRM_LEAD_TRANSITION_INVALID");
    });
    it("converts atomically, replays one identity, rejects changed payloads and double conversion", async () => {
      const lead = await qualify();
      const command = conversion(lead.revision);
      const counts = {
        accounts: await prisma.account.count(),
        contacts: await prisma.contact.count(),
      };
      const race = await Promise.all([
        convert(lead.id, command),
        convert(lead.id, command),
      ]);
      expect(race.map((r) => r.status)).toEqual([201, 201]);
      expect(race[0].body).toEqual(race[1].body);
      expect(await prisma.account.count()).toBe(counts.accounts + 1);
      expect(await prisma.contact.count()).toBe(counts.contacts + 1);
      expect(
        await prisma.leadConversionCommand.count({
          where: { leadId: lead.id },
        }),
      ).toBe(1);
      await convert(lead.id, {
        ...command,
        account: { mode: "create", data: { name: "Changed payload" } },
      }).expect(409);
      await convert(lead.id, {
        ...command,
        idempotencyKey: randomUUID(),
      }).expect(409);
      await api(c.token)
        .delete("/leads/" + lead.id, 3)
        .expect(409);
      await expect(
        prisma.lead.update({
          where: { id: lead.id },
          data: { convertedAt: new Date(0) },
        }),
      ).rejects.toThrow("CRM_LEAD_IMMUTABLE");
      await expect(
        prisma.leadConversionCommand.updateMany({
          where: { leadId: lead.id },
          data: { payloadHash: "f".repeat(64) },
        }),
      ).rejects.toThrow("CRM_CONVERSION_IMMUTABLE");
      await expect(
        prisma.leadConversionCommand.deleteMany({ where: { leadId: lead.id } }),
      ).rejects.toThrow("CRM_CONVERSION_IMMUTABLE");
    });
    it("allows at most one distinct concurrent conversion and rejects a stale revision", async () => {
      const lead = await qualify();
      await convert(lead.id, conversion(1)).expect(409);
      const before = await prisma.account.count();
      const responses = await Promise.all([
        convert(lead.id, conversion(2)),
        convert(lead.id, conversion(2)),
      ]);
      expect(responses.map((r) => r.status).sort()).toEqual([201, 409]);
      expect(await prisma.account.count()).toBe(before + 1);
    });
    it("does not let conversion permission bypass Account/Contact grants or replay revocations", async () => {
      await grants(["crm.leads.convert", "crm.leads.access.tenant"]);
      const lead = await qualify();
      const command = conversion(2);
      await convert(lead.id, command, restricted.token).expect(403);
      await convert(lead.id, command).expect(201);
      await convert(lead.id, command, restricted.token).expect(403);
      await grants([
        "crm.leads.convert",
        "crm.leads.access.own",
        "crm.businesses.view",
        "crm.businesses.create",
        "crm.businesses.access.tenant",
        "crm.contacts.view",
        "crm.contacts.create",
        "crm.contacts.access.tenant",
        "crm.businesses.update",
      ]);
      await convert(lead.id, command, restricted.token).expect(404);
    });
    it("paginates standalone Contact choices on the server and rejects contradictory filters", async () => {
      const name = "Standalone lookup " + randomUUID();
      const parent = await account(c);
      const standalone = await contact(c, { name });
      await contact(c, { name, accountId: parent.id });
      const result = await api(c.token)
        .get(
          "/contacts?standalone=true&limit=1&search=" +
            encodeURIComponent(name),
        )
        .expect(200);
      expect(result.body).toMatchObject({
        total: 1,
        totalPages: 1,
        items: [{ id: standalone.id }],
      });
      await api(c.token)
        .get("/contacts?standalone=true&accountId=" + parent.id)
        .expect(400);
      await api(c.token)
        .get("/accounts/" + parent.id + "/contacts?standalone=true")
        .expect(400);
    });
    it("links existing targets and supports individual conversion without an Account", async () => {
      const accountRow = await account(c),
        contactRow = await contact(c, { accountId: accountRow.id });
      const lead = await qualify();
      await convert(lead.id, {
        expectedRevision: 2,
        idempotencyKey: randomUUID(),
        account: { mode: "link", id: accountRow.id },
        contact: { mode: "link", id: contactRow.id },
      }).expect(201);
      const individual = await qualify({
        kind: "INDIVIDUAL",
        contactName: "Person",
      });
      await convert(individual.id, {
        expectedRevision: 2,
        idempotencyKey: randomUUID(),
        contact: {
          mode: "create",
          data: { name: "Person", email: "individual@test.invalid" },
        },
      }).expect(201);
      await convert((await qualify()).id, {
        ...conversion(2),
        opportunity: { mode: "create" },
      }).expect(400);
    });
    it.each(["account.created", "contact.created", "lead.converted"])(
      "rolls back every conversion write when %s fails",
      async (action) => {
        const lead = await qualify();
        const before = {
          accounts: await prisma.account.count(),
          contacts: await prisma.contact.count(),
          commands: await prisma.leadConversionCommand.count(),
        };
        await prisma.$executeRawUnsafe(
          `CREATE FUNCTION lead_test_fail() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.action='${action}' THEN RAISE EXCEPTION 'injected failure'; END IF; RETURN NEW; END $$`,
        );
        await prisma.$executeRawUnsafe(
          'CREATE TRIGGER lead_test_fail BEFORE INSERT ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION lead_test_fail()',
        );
        try {
          await convert(lead.id, conversion(2)).expect(500);
        } finally {
          await prisma.$executeRawUnsafe(
            'DROP TRIGGER lead_test_fail ON "AuditLog"',
          );
          await prisma.$executeRawUnsafe("DROP FUNCTION lead_test_fail()");
        }
        expect(await prisma.account.count()).toBe(before.accounts);
        expect(await prisma.contact.count()).toBe(before.contacts);
        expect(await prisma.leadConversionCommand.count()).toBe(
          before.commands,
        );
        expect(
          (
            await api(c.token)
              .get("/leads/" + lead.id)
              .expect(200)
          ).body,
        ).toMatchObject({ status: "QUALIFIED", revision: 2 });
      },
    );
    it("uses bounded search, filters, pagination and aggregates on all matching rows", async () => {
      const name = "Filter " + randomUUID();
      for (let i = 0; i < 3; i++)
        await createLead({
          name: name + " " + i,
          priority: "URGENT",
          sourceValueId: source,
        });
      const first = (
        await api(c.token)
          .get("/leads?search=" + encodeURIComponent(name) + "&limit=2")
          .expect(200)
      ).body;
      expect(first).toMatchObject({ total: 3, totalPages: 2 });
      expect(first.items).toHaveLength(2);
      const second = (
        await api(c.token)
          .get("/leads?search=" + encodeURIComponent(name) + "&limit=2&page=2")
          .expect(200)
      ).body;
      expect(second.items).toHaveLength(1);
      expect(
        first.items.some((r: { id: string }) => r.id === second.items[0].id),
      ).toBe(false);
      const counts = (
        await api(c.token)
          .get("/leads/counts?search=" + encodeURIComponent(name))
          .expect(200)
      ).body;
      expect(counts).toMatchObject({
        total: 3,
        priorities: [{ priority: "URGENT", count: 3 }],
        sources: [{ id: source, count: 3 }],
      });
      expect(
        (await api(c.token).get("/leads?search=()").expect(200)).body.total,
      ).toBe(0);
    });
    it("denies missing core CRM entitlement on reads and commands", async () => {
      await prisma.platformModule.update({
        where: { code: "core_crm" },
        data: { status: "DEPRECATED" },
      });
      try {
        await api(c.token).get("/leads").expect(403);
        await api(c.token)
          .post("/leads", { name: "Denied", phone: "+919876543210" })
          .expect(403);
      } finally {
        await prisma.platformModule.update({
          where: { code: "core_crm" },
          data: { status: "ACTIVE" },
        });
      }
    });
  });
});
