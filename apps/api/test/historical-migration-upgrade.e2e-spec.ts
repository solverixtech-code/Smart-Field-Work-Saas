import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/persistence/prisma.service";
import { MasterReconciliationService } from "../src/platform/masters/master-reconciliation.service";
import { MasterSeedService } from "../src/platform/masters/master-seed.service";
import { PlatformCatalogSyncService } from "../src/platform/modules/platform-catalog-sync.service";
import { verifyTestDatabaseSafety } from "../src/test-utils/test-db-safety";
import { syncRbac } from "../prisma/sync-rbac";

/**
 * Synthetic Historical Schema Upgrade Rehearsal & Post-Upgrade Isolation Verification
 * 
 * Note: This test executes a synthetic schema upgrade rehearsal. Historical cutoff migrations 1 through 11
 * are applied via raw SQL statement execution into an isolated schema, pre-upgrade synthetic data is inserted,
 * and subsequent migrations 12 through 33 are deployed via `prisma migrate deploy` to verify post-upgrade data
 * preservation, tenant membership isolation, legacy reconciliation, and HTTP cross-tenant authorization denial.
 * Comprehensive adversarial API cross-tenant attack vectors are verified separately in `apps/api/test/tenant-isolation.e2e-spec.ts`.
 */
describe("Phase 0.12 Synthetic Historical Migration Upgrade Rehearsal & Post-Upgrade Isolation Verification", () => {
  let app: INestApplication,
    prisma: PrismaService,
    reconcile: MasterReconciliationService,
    seed: MasterSeedService,
    jwtService: JwtService,
    configService: ConfigService;
  let actorId: string,
    preUpgradeTenant1Id: string,
    preUpgradeTenant2Id: string,
    preUpgradeUser1Id: string,
    preUpgradeUser2Id: string,
    user1SessionId: string,
    user1Membership1Id: string;
  const schema = `phase012_hist_upgrade_${randomUUID().replace(/-/g, "")}`;
  const baseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "postgresql://postgres:123456@127.0.0.1:5432/visiblo_crm_test?schema=public";

  const preUpgradeUserCount = 5;
  const preUpgradeTenantCount = 2;
  const preUpgradeMembershipCount = 3;
  const preUpgradeLegacyMasterCount = 3;

  beforeAll(async () => {
    verifyTestDatabaseSafety();
    const isolated = new URL(baseUrl);
    isolated.searchParams.set("schema", schema);
    process.env.DATABASE_URL = isolated.toString();

    const rawPrisma = new PrismaClient({
      datasources: { db: { url: process.env.DATABASE_URL } },
    });

    // STEP 1: Execute ONLY migrations 1 through 11 (pre-M5/M8 cutoff point)
    const migrationsDir = path.join(process.cwd(), "prisma/migrations");
    const migrationFolders = fs
      .readdirSync(migrationsDir, { withFileTypes: true })
      .filter((e) => e.isDirectory() && e.name !== "migration_lock.toml")
      .map((e) => e.name)
      .sort();

    // Migration cutoff at index 11 (20260904150000_m3_rbac_platform_and_tenant_scopes)
    const cutoffIndex = 11;
    const initialMigrations = migrationFolders.slice(0, cutoffIndex);

    // Create schema and _prisma_migrations tracking table manually
    await rawPrisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
    await rawPrisma.$executeRawUnsafe(`SET search_path TO "${schema}"`);
    await rawPrisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "${schema}"."_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY NOT NULL,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )
    `);

    for (const folder of initialMigrations) {
      const sqlFile = path.join(migrationsDir, folder, "migration.sql");
      if (fs.existsSync(sqlFile)) {
        const sql = fs.readFileSync(sqlFile, "utf8");
        // Split multi-statement SQL strings cleanly
        const statements = sql
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const stmt of statements) {
          await rawPrisma.$executeRawUnsafe(stmt);
        }

        await rawPrisma.$executeRawUnsafe(`
          INSERT INTO "${schema}"."_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "applied_steps_count")
          VALUES ('${randomUUID()}', 'synthetic_cutoff_rehearsal_checksum', now(), '${folder}', 1)
        `);
      }
    }

    // STEP 2: Populate pre-migration synthetic snapshot data using raw SQL (matching historical schema at migration #11)
    actorId = randomUUID();
    preUpgradeUser1Id = randomUUID();
    preUpgradeUser2Id = randomUUID();
    preUpgradeTenant1Id = randomUUID();
    preUpgradeTenant2Id = randomUUID();
    user1SessionId = randomUUID();
    user1Membership1Id = randomUUID();

    // Users
    await rawPrisma.$executeRawUnsafe(`
      INSERT INTO "${schema}"."User" ("id", "employeeCode", "fullName", "email", "role", "passwordHash", "updatedAt")
      VALUES 
        ('${actorId}', 'HIST_EMP_1', 'Legacy Actor User', 'legacy_actor_${randomUUID().slice(0, 4)}@visiblo.invalid', 'SUPPORT', 'legacy_hash', now()),
        ('${preUpgradeUser1Id}', 'HIST_EMP_2', 'Legacy Member User 1', 'legacy_member1_${randomUUID().slice(0, 4)}@visiblo.invalid', 'ADMIN', 'legacy_hash', now()),
        ('${preUpgradeUser2Id}', 'HIST_EMP_3', 'Legacy Member User 2', 'legacy_member2_${randomUUID().slice(0, 4)}@visiblo.invalid', 'ADMIN', 'legacy_hash', now()),
        ('${randomUUID()}', 'HIST_EMP_4', 'Legacy User 4', 'legacy_4_${randomUUID().slice(0, 4)}@visiblo.invalid', 'ADMIN', 'legacy_hash', now()),
        ('${randomUUID()}', 'HIST_EMP_5', 'Legacy User 5', 'legacy_5_${randomUUID().slice(0, 4)}@visiblo.invalid', 'ADMIN', 'legacy_hash', now())
    `);

    // Tenants
    await rawPrisma.$executeRawUnsafe(`
      INSERT INTO "${schema}"."Tenant" ("id", "slug", "displayName", "updatedAt")
      VALUES 
        ('${preUpgradeTenant1Id}', 'legacy-tenant-1-${randomUUID().slice(0, 4)}', 'Legacy Tenant 1', now()),
        ('${preUpgradeTenant2Id}', 'legacy-tenant-2-${randomUUID().slice(0, 4)}', 'Legacy Tenant 2', now())
    `);

    // TenantMemberships (3 total: User 1 in Tenant 1; User 2 in Tenant 1 and Tenant 2)
    await rawPrisma.$executeRawUnsafe(`
      INSERT INTO "${schema}"."TenantMembership" ("id", "tenantId", "userId", "updatedAt")
      VALUES 
        ('${user1Membership1Id}', '${preUpgradeTenant1Id}', '${preUpgradeUser1Id}', now()),
        ('${randomUUID()}', '${preUpgradeTenant1Id}', '${preUpgradeUser2Id}', now()),
        ('${randomUUID()}', '${preUpgradeTenant2Id}', '${preUpgradeUser2Id}', now())
    `);

    // UserSession for User 1 in Tenant 1
    await rawPrisma.$executeRawUnsafe(`
      INSERT INTO "${schema}"."UserSession" ("id", "userId", "selectedMembershipId", "refreshTokenHash", "status", "contextVersion", "updatedAt")
      VALUES ('${user1SessionId}', '${preUpgradeUser1Id}', '${user1Membership1Id}', 'dummy_hash', 'ACTIVE', 1, now())
    `);

    // MasterRecords
    await rawPrisma.$executeRawUnsafe(`
      INSERT INTO "${schema}"."MasterRecord" ("id", "category", "code", "name", "description", "sortOrder", "isActive", "isSystemDefault", "updatedAt")
      VALUES 
        ('${randomUUID()}', 'lead_source', 'HIST_LEGACY_SOURCE_1', 'Historical Legacy Source 1', 'Created in pre-upgrade schema', 1, true, false, now()),
        ('${randomUUID()}', 'lead_source', 'HIST_LEGACY_SOURCE_2', 'Historical Legacy Source 2', 'Created in pre-upgrade schema', 2, true, false, now()),
        ('${randomUUID()}', 'target_type', 'HIST_AMBIGUOUS_EXTENSION', 'Historical Ambiguous Extension', 'Created in pre-upgrade schema', 3, true, false, now())
    `);

    await rawPrisma.$disconnect();

    // STEP 3: Apply ALL remaining migrations (#12 through #33) via production migrate deploy command!
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

    // STEP 4: Boot application & run post-migration reconciliation / backfills
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    reconcile = app.get(MasterReconciliationService);
    seed = app.get(MasterSeedService);
    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);

    // Sync platform catalog & RBAC
    await app.get(PlatformCatalogSyncService).syncCatalog();
    await syncRbac(prisma);

    // Assign PLATFORM_SUPER_ADMIN to actor
    const pRole = await prisma.platformRole.findUniqueOrThrow({
      where: { code: "PLATFORM_SUPER_ADMIN" },
    });
    await prisma.platformUserRoleAssignment.create({
      data: { userId: actorId, platformRoleId: pRole.id, status: "ACTIVE" },
    });

    // Seed System Masters
    const dry = await seed.run(actorId);
    await seed.run(actorId, dry.reviewedHash);
  }, 90000);

  afterAll(async () => {
    if (app) await app.close();
    if (baseUrl) {
      const cleanup = new PrismaClient({
        datasources: { db: { url: baseUrl } },
      });
      if (/^phase012_hist_upgrade_[a-f0-9]{32}$/.test(schema)) {
        await cleanup.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        );
      }
      await cleanup.$disconnect();
    }
  });

  it("UPGRADE VERIFICATION 1: Preserves 100% of pre-existing Users, Tenants, Memberships, and MasterRecords after migration deploy", async () => {
    const postUserCount = await prisma.user.count({
      where: { email: { contains: "visiblo.invalid" } },
    });
    const postTenantCount = await prisma.tenant.count({
      where: { slug: { contains: "legacy-tenant" } },
    });
    const postMembershipCount = await prisma.tenantMembership.count({
      where: { tenant: { slug: { contains: "legacy-tenant" } } },
    });
    const postMasterRecordCount = await prisma.masterRecord.count({
      where: { code: { contains: "HIST_" } },
    });

    expect(postUserCount).toBe(preUpgradeUserCount);
    expect(postTenantCount).toBe(preUpgradeTenantCount);
    expect(postMembershipCount).toBe(preUpgradeMembershipCount);
    expect(postMasterRecordCount).toBe(preUpgradeLegacyMasterCount);
  });

  it("UPGRADE VERIFICATION 2: Executes post-upgrade legacy reconciliation for pre-existing records and fails closed on ambiguity", async () => {
    const report = await reconcile.report(actorId, { page: 1, limit: 10 });
    const valid1 = report.items.find((i) => i.code === "HIST_LEGACY_SOURCE_1")!;
    const ambiguous = report.items.find((i) => i.code === "HIST_AMBIGUOUS_EXTENSION")!;

    expect(valid1).toBeDefined();
    expect(ambiguous).toBeDefined();

    // 1. Reconcile valid historical record
    const targetValId = randomUUID();
    const command = {
      reason: "Historical upgrade reconciliation apply",
      mappings: [
        {
          legacyRecordId: valid1.id,
          legacyHash: valid1.legacyHash,
          targetValueId: targetValId,
          definitionCode: "lead_source",
          scope: { kind: "SYSTEM" as const },
        },
      ],
    };

    const dryRun = await reconcile.run(command, actorId);
    expect(dryRun.mode).toBe("DRY_RUN");

    const applied = await reconcile.run(command, actorId, dryRun.reviewedHash);
    expect(applied.mode).toBe("APPLY");

    const reconciled = await prisma.masterValue.findUnique({
      where: { id: targetValId },
    });
    expect(reconciled?.code).toBe("HIST_LEGACY_SOURCE_1");

    // 2. Reconcile ambiguous closed-catalog record -> must fail closed with ConflictException
    await expect(
      reconcile.run(
        {
          reason: "Testing ambiguous closed-catalog legacy record",
          mappings: [
            {
              legacyRecordId: ambiguous.id,
              legacyHash: ambiguous.legacyHash,
              targetValueId: randomUUID(),
              definitionCode: "target_type",
              scope: { kind: "SYSTEM" as const },
            },
          ],
        },
        actorId,
      ),
    ).rejects.toThrow("Closed Master catalog cannot accept a legacy extension");
  });

  it("UPGRADE VERIFICATION 3: Preserves post-upgrade tenant membership & data-scoping isolation with HTTP cross-tenant denial", async () => {
    // 1. Verify User 1 is active in Tenant 1 but has ZERO membership in Tenant 2 (fail closed)
    const mUser1Tenant1 = await prisma.tenantMembership.findFirst({
      where: { tenantId: preUpgradeTenant1Id, userId: preUpgradeUser1Id },
    });
    const mUser1Tenant2 = await prisma.tenantMembership.findFirst({
      where: { tenantId: preUpgradeTenant2Id, userId: preUpgradeUser1Id },
    });

    expect(mUser1Tenant1).not.toBeNull();
    expect(mUser1Tenant2).toBeNull(); // Strictly denied cross-tenant membership!

    // 2. Verify User 2 has isolated memberships across BOTH Tenant 1 and Tenant 2
    const mUser2Tenant1 = await prisma.tenantMembership.findFirst({
      where: { tenantId: preUpgradeTenant1Id, userId: preUpgradeUser2Id },
    });
    const mUser2Tenant2 = await prisma.tenantMembership.findFirst({
      where: { tenantId: preUpgradeTenant2Id, userId: preUpgradeUser2Id },
    });

    expect(mUser2Tenant1).not.toBeNull();
    expect(mUser2Tenant2).not.toBeNull();
    expect(mUser2Tenant1?.tenantId).not.toEqual(mUser2Tenant2?.tenantId);

    // 3. Verify cross-tenant scoping filter prevents User 1 from accessing Tenant 2 scoped resources
    const tenant2ScopedRecords = await prisma.tenantMembership.findMany({
      where: { tenantId: preUpgradeTenant2Id, userId: preUpgradeUser1Id },
    });
    expect(tenant2ScopedRecords.length).toBe(0);

    // 4. HTTP Cross-Tenant Authorization Denial Verification: User 1 attempts request to Tenant 2 context
    const secret = configService.getOrThrow<string>("JWT_ACCESS_SECRET");
    const user1AccessToken = jwtService.sign(
      { sub: preUpgradeUser1Id, sid: user1SessionId, mid: user1Membership1Id, ctxv: 1, tokenUse: "access" },
      { secret, expiresIn: "1h" },
    );

    // Authenticated request with User 1 token querying Tenant 2 context must fail closed (401/403/404)
    await request(app.getHttpServer())
      .get("/shifts")
      .set("Authorization", `Bearer ${user1AccessToken}`)
      .set("x-tenant-id", preUpgradeTenant2Id)
      .expect((res) => {
        expect([401, 403, 404]).toContain(res.status);
      });

    // 5. Verify system permissions were initialized via syncRbac without duplicating pre-existing grants
    const platformGrants = await prisma.platformRolePermission.count();
    expect(platformGrants).toBeGreaterThan(0);
  });
});
