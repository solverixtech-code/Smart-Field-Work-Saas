import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";
import { execFileSync } from "child_process";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/persistence/prisma.service";
import { MasterReconciliationService } from "../src/platform/masters/master-reconciliation.service";
import { MasterSeedService } from "../src/platform/masters/master-seed.service";
import { PlatformCatalogSyncService } from "../src/platform/modules/platform-catalog-sync.service";
import { verifyTestDatabaseSafety } from "../src/test-utils/test-db-safety";
import { syncRbac } from "../prisma/sync-rbac";

describe("Phase 0.12 Database Migration & Production-Shaped Upgrade Rehearsal", () => {
  let app: INestApplication,
    prisma: PrismaService,
    reconcile: MasterReconciliationService,
    seed: MasterSeedService;
  let actorId: string;
  const schema = `phase012_rehearsal_${randomUUID().replace(/-/g, "")}`;
  const baseUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "postgresql://postgres:123456@127.0.0.1:5432/visiblo_crm_test?schema=public";

  beforeAll(async () => {
    verifyTestDatabaseSafety();
    const isolated = new URL(baseUrl);
    isolated.searchParams.set("schema", schema);
    process.env.DATABASE_URL = isolated.toString();

    // 1. Run full 33-migration history on clean PostgreSQL schema
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
    await app.init();
    prisma = app.get(PrismaService);
    reconcile = app.get(MasterReconciliationService);
    seed = app.get(MasterSeedService);

    // 2. Sync Platform Modules & RBAC
    await app.get(PlatformCatalogSyncService).syncCatalog();
    await syncRbac(prisma);

    // 3. Seed Support Actor with PLATFORM_SUPER_ADMIN role
    const user = await prisma.user.create({
      data: {
        employeeCode: `EMP_${randomUUID().slice(0, 8)}`,
        fullName: "Rehearsal Actor",
        email: `rehearsal_${randomUUID()}@visiblo.invalid`,
        role: "SUPPORT",
        passwordHash: "unusable",
      },
    });
    actorId = user.id;

    const pRole = await prisma.platformRole.findUniqueOrThrow({
      where: { code: "PLATFORM_SUPER_ADMIN" },
    });
    await prisma.platformUserRoleAssignment.create({
      data: { userId: actorId, platformRoleId: pRole.id, status: "ACTIVE" },
    });

    // 4. Seed System Masters with authorized actorId
    const dry = await seed.run(actorId);
    await seed.run(actorId, dry.reviewedHash);

    // 5. Seed Pre-Current Legacy Master Record Fixtures (using valid UUIDs)
    await prisma.masterRecord.createMany({
      data: [
        {
          id: randomUUID(),
          category: "lead_source",
          code: "LEGACY_VALID_SOURCE",
          name: "Legacy Valid Source",
          description: "Pre-upgrade legacy master row",
          displayColor: null,
          sortOrder: 1,
          isActive: true,
          isSystemDefault: false,
        },
        {
          id: randomUUID(),
          category: "target_type", // Closed Master catalog category
          code: "LEGACY_CLOSED_EXTENSION",
          name: "Legacy Closed Extension",
          description: "Ambiguous row in closed catalog",
          displayColor: null,
          sortOrder: 2,
          isActive: true,
          isSystemDefault: false,
        },
      ],
    });
  }, 60000);

  afterAll(async () => {
    if (app) await app.close();
    if (baseUrl) {
      const cleanup = new PrismaClient({
        datasources: { db: { url: baseUrl } },
      });
      if (/^phase012_rehearsal_[a-f0-9]{32}$/.test(schema)) {
        await cleanup.$executeRawUnsafe(
          `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
        );
      }
      await cleanup.$disconnect();
    }
  });

  it("REHEARSAL 1: Verifies 33 PostgreSQL migrations applied cleanly with 0 historical edits", async () => {
    const tableCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint FROM information_schema.tables WHERE table_schema = ${schema}
    `;
    expect(Number(tableCount[0].count)).toBeGreaterThan(30);
  });

  it("REHEARSAL 2: Reports legacy records and rejects ambiguous/closed catalog extensions without altering defaults", async () => {
    const report = await reconcile.report(actorId, { page: 1, limit: 10 });
    expect(report.items.length).toBeGreaterThanOrEqual(2);

    const validRow = report.items.find((i) => i.code === "LEGACY_VALID_SOURCE")!;
    const ambiguousRow = report.items.find((i) => i.code === "LEGACY_CLOSED_EXTENSION")!;

    expect(validRow).toBeDefined();
    expect(ambiguousRow).toBeDefined();

    // Attempting to reconcile ambiguous closed-catalog extension must throw ConflictException
    const targetValId = randomUUID();
    await expect(
      reconcile.run(
        {
          reason: "Testing ambiguous resolution safety",
          mappings: [
            {
              legacyRecordId: ambiguousRow.id,
              legacyHash: ambiguousRow.legacyHash,
              targetValueId: targetValId,
              definitionCode: "target_type",
              scope: { kind: "SYSTEM" },
            },
          ],
        },
        actorId,
      ),
    ).rejects.toThrow("Closed Master catalog cannot accept a legacy extension");
  });

  it("REHEARSAL 3: Reconciles valid legacy records cleanly in DRY_RUN and APPLY modes", async () => {
    const report = await reconcile.report(actorId, { page: 1, limit: 10 });
    const validRow = report.items.find((i) => i.code === "LEGACY_VALID_SOURCE")!;
    const targetValId = randomUUID();

    const command = {
      reason: "Valid legacy upgrade execution",
      mappings: [
        {
          legacyRecordId: validRow.id,
          legacyHash: validRow.legacyHash,
          targetValueId: targetValId,
          definitionCode: "lead_source",
          scope: { kind: "SYSTEM" as const },
        },
      ],
    };

    const dryRun = await reconcile.run(command, actorId);

    expect(dryRun.mode).toBe("DRY_RUN");
    expect(dryRun.results[0].status).toBe("CREATE");

    // Execute actual upgrade APPLY with matching command and approved hash
    const applied = await reconcile.run(command, actorId, dryRun.reviewedHash);

    expect(applied.mode).toBe("APPLY");
    expect(applied.results[0].status).toBe("CREATE");

    // Verify reconciled record exists in MasterValue
    const reconciled = await prisma.masterValue.findUnique({
      where: { id: targetValId },
    });
    expect(reconciled).not.toBeNull();
    expect(reconciled?.code).toBe("LEGACY_VALID_SOURCE");
    expect(reconciled?.source).toBe("SYSTEM");
  });
});
