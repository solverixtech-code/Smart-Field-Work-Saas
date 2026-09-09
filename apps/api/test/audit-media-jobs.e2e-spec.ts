import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve, sep } from "node:path";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/persistence/prisma.service";
import { verifyTestDatabaseSafety } from "../src/test-utils/test-db-safety";
import { seedTenantRoleTemplates } from "../prisma/seeds/tenant-role-templates";
import { syncRbac } from "../prisma/sync-rbac";
import { TenantService } from "../src/platform/tenants/tenant.service";
import { TenantMembershipService } from "../src/platform/tenants/tenant-membership.service";
import { RequestPrincipalService } from "../src/common/security/request-principal.service";
import { RolePermissionService } from "../src/common/security/role-permission.service";
import {
  StorageProvider,
  MediaConfiguration,
  StoredObject,
  ObjectObservation,
} from "../src/media/storage-provider";
import { MediaService } from "../src/media/media.service";
import { JobService } from "../src/jobs/job.service";
import { JobWorkerService } from "../src/jobs/job-worker.service";
import { auditEvents } from "../src/audit/audit-event-writer";
import { MetricsService } from "../src/observability/metrics.service";

// Explicit test injection only. No production module/config can select this provider.
class RecordingStorage extends StorageProvider {
  readonly objects = new Map<string, ObjectObservation>();
  readonly calls: Array<{ operation: string; key: string }> = [];
  failDelete = false;
  configuration(): MediaConfiguration {
    return {
      region: "ap-south-1",
      bucket: "private-test-bucket",
      prefix: "",
      maxBytes: 10000,
      mimeTypes: ["image/png"],
      uploadTtl: 60,
      downloadTtl: 30,
      encryption: "AES256",
    };
  }
  async upload(object: StoredObject) {
    this.calls.push({ operation: "upload", key: object.objectKey });
    return {
      url: "https://test-storage.invalid/put?X-Amz-Signature=secret-marker",
      headers: {
        "Content-Type": object.mimeType,
        "If-None-Match": "*",
        "x-amz-checksum-sha256": object.checksumSha256,
      },
    };
  }
  async head(object: StoredObject) {
    this.calls.push({ operation: "head", key: object.objectKey });
    const stored = this.objects.get(object.objectKey);
    if (!stored) throw new Error("Not found");
    return { ...stored };
  }
  async download(object: StoredObject) {
    this.calls.push({ operation: "download", key: object.objectKey });
    return "https://test-storage.invalid/get?X-Amz-Signature=secret-marker";
  }
  async delete(object: StoredObject, signal: AbortSignal) {
    this.calls.push({ operation: "delete", key: object.objectKey });
    signal.throwIfAborted();
    if (this.failDelete)
      throw new Error(
        "Provider token secret-marker must never leave the adapter",
      );
    this.objects.delete(object.objectKey);
  }
  async readiness(): Promise<"ready"> {
    return "ready";
  }
}

describe("Phase 0.10 audit, private media and durable job exit proof", () => {
  let app: INestApplication,
    prisma: PrismaClient,
    baseUrl: string,
    platformToken: string,
    auditorToken: string,
    supportToken: string;
  let jobs: JobService, worker: JobWorkerService;
  const storage = new RecordingStorage();
  const schema = `phase010_${randomUUID().replace(/-/g, "")}`;
  const input = {
    displayName: "field-proof.png",
    mimeType: "image/png",
    expectedBytes: 4,
    checksumSha256: Buffer.alloc(32, 1).toString("base64"),
  };
  type TenantFixture = {
    id: string;
    userId: string;
    membershipId: string;
    roleId: string;
    token: string;
  };
  let a: TenantFixture, b: TenantFixture;
  const legacyAuditIds = [randomUUID(), randomUUID()];

  beforeAll(async () => {
    verifyTestDatabaseSafety();
    baseUrl = process.env.TEST_DATABASE_URL ?? "";
    const url = new URL(baseUrl);
    url.searchParams.set("schema", schema);
    process.env.DATABASE_URL = url.toString();
    const deploy = (schemaPath: string) =>
      execFileSync(
        process.execPath,
        [
          require.resolve("prisma/build/index.js"),
          "migrate",
          "deploy",
          `--schema=${schemaPath}`,
        ],
        { env: process.env, stdio: "pipe" },
      );
    const baseline = mkdtempSync(join(tmpdir(), "sfw-m010-upgrade-"));
    prisma = new PrismaClient({ datasources: { db: { url: url.toString() } } });
    try {
      mkdirSync(join(baseline, "migrations"));
      writeFileSync(
        join(baseline, "schema.prisma"),
        'datasource db {\n provider = "postgresql"\n url = env("DATABASE_URL")\n}\n',
      );
      const migrations = readdirSync("prisma/migrations", {
        withFileTypes: true,
      }).filter(
        (entry) => entry.isDirectory() && entry.name < "20260908120000",
      );
      expect(migrations).toHaveLength(29);
      for (const entry of migrations)
        cpSync(
          join("prisma/migrations", entry.name),
          join(baseline, "migrations", entry.name),
          { recursive: true },
        );
      cpSync(
        "prisma/migrations/migration_lock.toml",
        join(baseline, "migrations/migration_lock.toml"),
      );
      deploy(join(baseline, "schema.prisma"));
      const legacyTenant = await prisma.tenant.create({
        data: {
          slug: `legacy-${randomUUID()}`,
          displayName: "Historical audit owner",
        },
        select: { id: true },
      });
      await prisma.$executeRaw`INSERT INTO "AuditLog" (id,action,"tenantId","beforeJson") VALUES (${legacyAuditIds[0]},'PRE_M010_TENANT',${legacyTenant.id},'{"moduleCode":"core_crm"}'::jsonb), (${legacyAuditIds[1]},'PRE_M010_UNSCOPED',NULL,'{"passwordHash":"legacy-secret"}'::jsonb)`;
      deploy("prisma/schema.prisma");
    } finally {
      const target = resolve(baseline);
      if (
        !target.startsWith(resolve(tmpdir()) + sep) ||
        !basename(target).startsWith("sfw-m010-upgrade-")
      )
        throw new Error("Unsafe temporary migration cleanup");
      rmSync(target, { recursive: true, force: true });
    }
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .overrideProvider(StorageProvider)
      .useValue(storage)
      .compile();
    app = module.createNestApplication();
    app.useLogger(false);
    await app.init();
    await seedTenantRoleTemplates(prisma);
    await syncRbac(prisma);
    jobs = app.get(JobService);
    worker = app.get(JobWorkerService);
    a = await tenant();
    b = await tenant();
    platformToken = await platform("PLATFORM_SUPER_ADMIN");
    auditorToken = await platform("PLATFORM_AUDITOR");
    supportToken = await platform("PLATFORM_SUPPORT");
  }, 60000);
  afterEach(() => {
    storage.failDelete = false;
    jest.restoreAllMocks();
  });
  afterAll(async () => {
    if (app) await app.close();
    if (prisma) await prisma.$disconnect();
    if (baseUrl) {
      const cleanup = new PrismaClient({
        datasources: { db: { url: baseUrl } },
      });
      if (!/^phase010_[a-f0-9]{32}$/.test(schema))
        throw new Error("Unsafe cleanup schema");
      await cleanup.$executeRawUnsafe(
        `DROP SCHEMA IF EXISTS "${schema}" CASCADE`,
      );
      await cleanup.$disconnect();
      process.env.DATABASE_URL = baseUrl;
    }
  });
  async function user() {
    return prisma.user.create({
      data: {
        employeeCode: randomUUID(),
        fullName: "Isolated Phase 0.10 actor",
        email: `${randomUUID()}@test.invalid`,
        passwordHash: "unusable",
        role: "SUPPORT",
      },
      select: { id: true },
    });
  }
  async function tenant(): Promise<TenantFixture> {
    const identity = await user();
    const created = await app
      .get(TenantService)
      .createTenantFoundation({
        slug: `m010-${randomUUID()}`,
        displayName: "Isolated media Tenant",
        status: "ACTIVE",
      });
    const role = await prisma.tenantRole.findUniqueOrThrow({
      where: { tenantId_code: { tenantId: created.id, code: "tenant_admin" } },
      select: { id: true },
    });
    const membership = await app
      .get(TenantMembershipService)
      .createMembership({
        tenantId: created.id,
        userId: identity.id,
        tenantRoleId: role.id,
        status: "ACTIVE",
      });
    return {
      id: created.id,
      userId: identity.id,
      membershipId: membership.id,
      roleId: role.id,
      token: app.get(JwtService).sign({ sub: identity.id, mid: membership.id }),
    };
  }
  async function platform(code: string) {
    const identity = await user();
    const role = await prisma.platformRole.findUniqueOrThrow({
      where: { code },
      select: { id: true },
    });
    await prisma.platformUserRoleAssignment.create({
      data: { userId: identity.id, platformRoleId: role.id, status: "ACTIVE" },
    });
    return app.get(JwtService).sign({ sub: identity.id });
  }
  async function intent(t = a, correlationId = randomUUID()) {
    const response = await request(app.getHttpServer())
      .post("/tenant/media/assets/upload-intent")
      .set("Authorization", `Bearer ${t.token}`)
      .set("X-Correlation-Id", correlationId)
      .send(input)
      .expect(201);
    const id = String(response.body.id);
    const asset = await prisma.mediaAsset.findUniqueOrThrow({ where: { id } });
    return { asset, response, correlationId };
  }
  async function uploadAndComplete(t = a) {
    const created = await intent(t);
    storage.objects.set(created.asset.objectKey, {
      bytes: input.expectedBytes,
      mimeType: input.mimeType,
      checksum: input.checksumSha256,
      etag: "opaque-etag",
    });
    await request(app.getHttpServer())
      .post(`/tenant/media/assets/${created.asset.id}/complete`)
      .set("Authorization", `Bearer ${t.token}`)
      .send({})
      .expect(201);
    return created;
  }
  async function deletion(t = a) {
    const created = await uploadAndComplete(t);
    const response = await request(app.getHttpServer())
      .delete(`/tenant/media/assets/${created.asset.id}`)
      .set("Authorization", `Bearer ${t.token}`)
      .set("X-Correlation-Id", created.correlationId)
      .expect(200);
    const jobId = String(response.body.jobId);
    // Test DB only: advance eligibility without waiting for a signed URL to expire.
    await prisma.backgroundJob.update({
      where: { id: jobId },
      data: { availableAt: new Date(0) },
    });
    return { ...created, jobId };
  }

  it("upgrades the frozen chain without losing or inventing historical audit ownership", async () => {
    const rows = await prisma.auditLog.findMany({
      where: { id: { in: legacyAuditIds } },
      select: {
        id: true,
        scope: true,
        schemaVersion: true,
        actorType: true,
        correlationId: true,
        beforeJson: true,
      },
    });
    expect(rows).toHaveLength(2);
    expect(rows.find((row) => row.id === legacyAuditIds[0])?.scope).toBe(
      "TENANT",
    );
    expect(rows.find((row) => row.id === legacyAuditIds[1])?.scope).toBe(
      "LEGACY",
    );
    for (const row of rows) {
      expect(row.schemaVersion).toBe(1);
      expect(row.actorType).toBe("LEGACY");
      expect(row.correlationId).toBeNull();
    }
    expect(
      rows.find((row) => row.id === legacyAuditIds[1])?.beforeJson,
    ).toEqual({ passwordHash: "legacy-secret" });
  });

  it("atomically persists private upload intent, authoritative correlation and redacted audit", async () => {
    const { asset, response, correlationId } = await intent();
    expect(asset.tenantId).toBe(a.id);
    expect(asset.creatorMembershipId).toBe(a.membershipId);
    expect(asset.objectKey).toMatch(
      new RegExp(`^tenants/${a.id}/media/${asset.id}/[a-f0-9-]+$`),
    );
    expect(response.body.bucket).toBeUndefined();
    expect(response.body.objectKey).toBeUndefined();
    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { eventCode: "media.upload.intent", entityId: asset.id },
    });
    expect(audit.scope).toBe("TENANT");
    expect(audit.tenantId).toBe(a.id);
    expect(audit.actorUserId).toBe(a.userId);
    expect(audit.tenantMembershipId).toBe(a.membershipId);
    expect(audit.requestId).toBe(response.headers["x-request-id"]);
    expect(audit.correlationId).toBe(correlationId);
    expect(JSON.stringify(audit)).not.toContain("secret-marker");
  });
  it("blocks foreign known IDs, malicious input, unauthenticated callers and platform-only media access before storage", async () => {
    const { asset } = await intent();
    const before = storage.calls.length;
    for (const method of ["get", "post", "delete"] as const) {
      const path = `/tenant/media/assets/${asset.id}${method === "get" ? "/download-url" : method === "post" ? "/complete" : ""}`;
      await request(app.getHttpServer())
        [method](path)
        .set("Authorization", `Bearer ${b.token}`)
        .send(method === "post" ? {} : undefined)
        .expect(404);
    }
    expect(storage.calls.length).toBe(before);
    await request(app.getHttpServer())
      .post("/tenant/media/assets/upload-intent")
      .send(input)
      .expect(401);
    await request(app.getHttpServer())
      .post("/tenant/media/assets/upload-intent")
      .set("Authorization", `Bearer ${platformToken}`)
      .send(input)
      .expect(403);
    for (const invalid of [
      { ...input, tenantId: b.id },
      { ...input, objectKey: "forged" },
      { ...input, mimeType: "text/html" },
      { ...input, expectedBytes: 0 },
      { ...input, checksumSha256: "wrong" },
      { ...input, displayName: "../evil.png" },
    ]) {
      await request(app.getHttpServer())
        .post("/tenant/media/assets/upload-intent")
        .set("Authorization", `Bearer ${a.token}`)
        .send(invalid)
        .expect(400);
    }
    expect(storage.calls.length).toBe(before);
  });
  it("verifies trusted HEAD and repeated completion; READY is required for signed download", async () => {
    const { asset } = await intent();
    await request(app.getHttpServer())
      .get(`/tenant/media/assets/${asset.id}/download-url`)
      .set("Authorization", `Bearer ${a.token}`)
      .expect(409);
    for (const wrong of [
      { bytes: 999 },
      { mimeType: "text/html" },
      { checksum: Buffer.alloc(32, 2).toString("base64") },
    ]) {
      storage.objects.set(asset.objectKey, {
        bytes: 4,
        mimeType: input.mimeType,
        checksum: input.checksumSha256,
        etag: "opaque",
        ...wrong,
      });
      await request(app.getHttpServer())
        .post(`/tenant/media/assets/${asset.id}/complete`)
        .set("Authorization", `Bearer ${a.token}`)
        .send({})
        .expect(409);
    }
    storage.objects.set(asset.objectKey, {
      bytes: 4,
      mimeType: input.mimeType,
      checksum: input.checksumSha256,
      etag: "opaque",
    });
    for (let count = 0; count < 2; count++)
      await request(app.getHttpServer())
        .post(`/tenant/media/assets/${asset.id}/complete`)
        .set("Authorization", `Bearer ${a.token}`)
        .send({})
        .expect(201);
    expect(
      await prisma.auditLog.count({
        where: { entityId: asset.id, eventCode: "media.upload.completed" },
      }),
    ).toBe(1);
    await request(app.getHttpServer())
      .get(`/tenant/media/assets/${asset.id}/download-url`)
      .set("Authorization", `Bearer ${a.token}`)
      .expect(200);
    storage.objects.delete(asset.objectKey);
    await request(app.getHttpServer())
      .post(`/tenant/media/assets/${asset.id}/complete`)
      .set("Authorization", `Bearer ${a.token}`)
      .send({})
      .expect(503);
  });
  it("recovers a crash after external deletion, fences stale acknowledgment and keeps one destructive job", async () => {
    const { asset, jobId, correlationId } = await deletion();
    const [first] = await jobs.claim(randomUUID());
    expect(first.id).toBe(jobId);
    await storage.delete(asset, new AbortController().signal); // crash before DB acknowledgment
    await prisma.backgroundJob.update({
      where: { id: jobId },
      data: { leaseExpiresAt: new Date(0) },
    });
    const [second] = await jobs.claim(randomUUID());
    expect(second.id).toBe(jobId);
    await expect(jobs.succeed(first, async () => undefined)).rejects.toThrow(
      "JOB_LEASE_LOST",
    );
    await worker.execute(second);
    const completed = await prisma.backgroundJob.findUniqueOrThrow({
      where: { id: jobId },
      include: { attempts: { orderBy: { number: "asc" } } },
    });
    expect(completed.status).toBe("SUCCEEDED");
    expect(completed.attempts.map((attempt) => attempt.status)).toEqual([
      "LEASE_EXPIRED",
      "SUCCEEDED",
    ]);
    expect(
      (await prisma.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } }))
        .status,
    ).toBe("DELETED");
    expect(
      storage.calls.filter(
        (call) => call.operation === "delete" && call.key === asset.objectKey,
      ),
    ).toHaveLength(2);
    await request(app.getHttpServer())
      .delete(`/tenant/media/assets/${asset.id}`)
      .set("Authorization", `Bearer ${a.token}`)
      .expect(200);
    expect(
      await prisma.backgroundJob.count({
        where: { idempotencyKey: `media-delete:${asset.id}` },
      }),
    ).toBe(1);
    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { entityId: asset.id, eventCode: "media.deleted" },
    });
    expect(audit.correlationId).toBe(correlationId);
    expect(audit.originRequestId).toBe(completed.originRequestId);
    expect(JSON.stringify(audit)).not.toContain("secret-marker");
    expect(JSON.stringify(app.get(MetricsService).snapshot())).not.toContain(
      asset.id,
    );
  });
  it("rolls back delete and audit when enqueue fails; equal replay shares one job and unequal payload conflicts", async () => {
    const { asset } = await uploadAndComplete();
    const principal = await app
      .get(RequestPrincipalService)
      .resolvePrincipal({ sub: a.userId, mid: a.membershipId });
    const spy = jest
      .spyOn(jobs, "enqueue")
      .mockRejectedValueOnce(new Error("forced enqueue failure"));
    await expect(
      app.get(MediaService).remove(principal, asset.id),
    ).rejects.toThrow("forced enqueue failure");
    spy.mockRestore();
    expect(
      (await prisma.mediaAsset.findUniqueOrThrow({ where: { id: asset.id } }))
        .status,
    ).toBe("READY");
    expect(
      await prisma.auditLog.count({
        where: { entityId: asset.id, eventCode: "media.delete.requested" },
      }),
    ).toBe(0);
    const key = randomUUID();
    const enqueued = await Promise.all(
      Array.from({ length: 20 }, () =>
        prisma.$transaction((tx) =>
          jobs.enqueue(
            tx,
            "media.delete-object",
            { tenantId: a.id, assetId: asset.id },
            key,
            new Date("2100-01-01"),
          ),
        ),
      ),
    );
    expect(new Set(enqueued.map((job) => job.id)).size).toBe(1);
    await expect(
      prisma.$transaction((tx) =>
        jobs.enqueue(
          tx,
          "media.delete-object",
          { tenantId: a.id, assetId: randomUUID() },
          key,
        ),
      ),
    ).rejects.toThrow("JOB_IDEMPOTENCY_CONFLICT");
  }, 20000);
  it("records bounded retry/dead state and authorizes concurrent reasoned manual retry without resetting attempts", async () => {
    const { jobId } = await deletion();
    storage.failDelete = true;
    for (let attempt = 0; attempt < 5; attempt++) {
      await prisma.backgroundJob.update({
        where: { id: jobId },
        data: { availableAt: new Date(0) },
      });
      const [job] = await jobs.claim(randomUUID());
      expect(job.id).toBe(jobId);
      await worker.execute(job);
    }
    const dead = await prisma.backgroundJob.findUniqueOrThrow({
      where: { id: jobId },
    });
    expect(dead.status).toBe("DEAD");
    expect(dead.lastErrorCode).toBe("HANDLER_FAILED");
    expect(JSON.stringify(dead)).not.toContain("secret-marker");
    const path = `/platform/operations/jobs/${jobId}/retry`;
    for (const token of [a.token, auditorToken, supportToken])
      await request(app.getHttpServer())
        .post(path)
        .set("Authorization", `Bearer ${token}`)
        .send({ expectedRevision: dead.revision, reason: "Reviewed failure" })
        .expect(403);
    await request(app.getHttpServer())
      .post(path)
      .set("Authorization", `Bearer ${platformToken}`)
      .send({ expectedRevision: dead.revision })
      .expect(400);
    const retries = await Promise.all(
      Array.from({ length: 2 }, () =>
        request(app.getHttpServer())
          .post(path)
          .set("Authorization", `Bearer ${platformToken}`)
          .send({
            expectedRevision: dead.revision,
            reason: "Provider restored; reviewed retry",
          }),
      ),
    );
    expect(retries.map((response) => response.status).sort()).toEqual([
      201, 409,
    ]);
    expect(await prisma.backgroundJobAttempt.count({ where: { jobId } })).toBe(
      5,
    );
    expect(
      await prisma.auditLog.count({
        where: { eventCode: "job.manual.retry", entityId: jobId },
      }),
    ).toBe(1);
    storage.failDelete = false;
    const [job] = await jobs.claim(randomUUID());
    await worker.execute(job);
    expect(
      (await prisma.backgroundJob.findUniqueOrThrow({ where: { id: jobId } }))
        .status,
    ).toBe("SUCCEEDED");
  });
  it("uses SKIP LOCKED for 20 competing claims and rejects malformed database intent before external access", async () => {
    const ids: string[] = [];
    for (let index = 0; index < 20; index++) {
      const result = await prisma.$transaction((tx) =>
        jobs.enqueue(
          tx,
          "media.delete-object",
          { tenantId: a.id, assetId: randomUUID() },
          randomUUID(),
        ),
      );
      ids.push(result.id);
    }
    const claims = (
      await Promise.all(
        Array.from({ length: 20 }, () => jobs.claim(randomUUID())),
      )
    ).flat();
    expect(claims.map((claim) => claim.id).sort()).toEqual(ids.sort());
    expect(new Set(claims.map((claim) => claim.leaseToken)).size).toBe(20);
    const before = storage.calls.length;
    await Promise.all(claims.map((claim) => worker.execute(claim)));
    expect(storage.calls.length).toBe(before);
    expect(
      await prisma.backgroundJob.count({
        where: {
          id: { in: ids },
          status: "DEAD",
          lastErrorCode: "MEDIA_SCOPE_MISMATCH",
        },
      }),
    ).toBe(20);
  }, 20000);
  it("enforces append-only audit content, tenant-membership integrity and immutable media/job identity directly in PostgreSQL", async () => {
    const { asset } = await intent();
    await expect(
      prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { tenantId: b.id },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { objectKey: "forged" },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.mediaAsset.update({
        where: { id: asset.id },
        data: { expectedBytes: -1 },
      }),
    ).rejects.toThrow();
    await expect(
      auditEvents.write(prisma, {
        action: "media.upload.intent",
        scope: "TENANT",
        tenantId: a.id,
        tenantMembershipId: b.membershipId,
        actorUserId: b.userId,
      }),
    ).rejects.toThrow();
    const audit = await prisma.auditLog.findFirstOrThrow({
      where: { entityId: asset.id, schemaVersion: 2 },
    });
    await expect(
      prisma.auditLog.update({
        where: { id: audit.id },
        data: { action: "forged" },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.auditLog.update({
        where: { id: audit.id },
        data: { actorUserId: null },
      }),
    ).rejects.toThrow();
    const job = await prisma.$transaction((tx) =>
      jobs.enqueue(
        tx,
        "media.delete-object",
        { assetId: asset.id, tenantId: a.id },
        randomUUID(),
        new Date("2100-01-01"),
      ),
    );
    await expect(
      prisma.backgroundJob.update({
        where: { id: job.id },
        data: { payload: { assetId: randomUUID(), tenantId: a.id } },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.backgroundJob.update({
        where: { id: job.id },
        data: { status: "RUNNING" },
      }),
    ).rejects.toThrow();
  });
  it('keeps leases live under a non-UTC PostgreSQL session on an independent worker connection', async () => {
    const url = new URL(baseUrl);
    url.searchParams.set('schema', schema);
    url.searchParams.set('connection_limit', '1');
    const independent = new PrismaService({ datasources: { db: { url: url.toString() } } });
    try {
      await independent.$executeRaw`SET TIME ZONE 'Asia/Calcutta'`;
      const queue = new JobService(independent, new MetricsService());
      const created = await independent.$transaction((tx) => queue.enqueue(tx, 'media.delete-object', { tenantId: a.id, assetId: randomUUID() }, randomUUID()));
      const [claim] = await queue.claim(randomUUID());
      expect(claim.id).toBe(created.id);
      expect(claim.leaseExpiresAt!.getTime()).toBeGreaterThan(Date.now());
      expect(await queue.claim(randomUUID())).toHaveLength(0);
      await queue.succeed(claim, async () => undefined);
      expect((await independent.backgroundJob.findUniqueOrThrow({ where: { id: created.id } })).status).toBe('SUCCEEDED');
    } finally { await independent.$disconnect(); }
  });

  it("keeps RBAC mutation and critical audit in one transaction", async () => {
    const before = await prisma.tenantRole.findUniqueOrThrow({
      where: { id: a.roleId },
      select: { permissionsVersion: true },
    });
    const spy = jest
      .spyOn(auditEvents, "write")
      .mockRejectedValueOnce(new Error("Audit unavailable"));
    await expect(
      app
        .get(RolePermissionService)
        .revokeTenantPermission(a.id, a.roleId, "system.media.manage"),
    ).rejects.toThrow("Audit unavailable");
    spy.mockRestore();
    expect(
      (await prisma.tenantRole.findUniqueOrThrow({ where: { id: a.roleId } }))
        .permissionsVersion,
    ).toBe(before.permissionsVersion);
    const principal = await app
      .get(RequestPrincipalService)
      .resolvePrincipal({ sub: a.userId, mid: a.membershipId });
    expect(principal.tenantPermissions).toContain("system.media.manage");
  });
  it("authorizes bounded audit/job queries, redacts historical snapshots and keeps audit write transaction failure atomic", async () => {
    const legacy = await prisma.auditLog.create({
      data: {
        action: "HISTORICAL_TEST",
        beforeJson: { nested: { passwordHash: "secret-marker" } },
      },
    });
    await request(app.getHttpServer())
      .get(`/platform/audit/${legacy.id}`)
      .set("Authorization", `Bearer ${a.token}`)
      .expect(403);
    const detail = await request(app.getHttpServer())
      .get(`/platform/audit/${legacy.id}`)
      .set("Authorization", `Bearer ${auditorToken}`)
      .expect(200);
    expect(JSON.stringify(detail.body)).not.toContain("secret-marker");
    const list = await request(app.getHttpServer())
      .get("/platform/audit?limit=1")
      .set("Authorization", `Bearer ${auditorToken}`)
      .expect(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].beforeJson).toBeUndefined();
    for (const query of [
      "limit=101",
      "cursor=bad",
      "from=2020-01-01T00:00:00.000Z&to=2026-01-01T00:00:00.000Z",
    ])
      await request(app.getHttpServer())
        .get(`/platform/audit?${query}`)
        .set("Authorization", `Bearer ${platformToken}`)
        .expect(400);
    await request(app.getHttpServer())
      .get("/platform/operations/jobs")
      .set("Authorization", `Bearer ${auditorToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get("/platform/operations/jobs")
      .set("Authorization", `Bearer ${a.token}`)
      .expect(403);
    await expect(
      prisma.$transaction(async (tx) => {
        await auditEvents.write(tx, {
          action: "media.upload.intent",
          scope: "TENANT",
          tenantId: a.id,
          entityId: "rolled-back-audit",
        });
        throw new Error("rollback");
      }),
    ).rejects.toThrow("rollback");
    expect(
      await prisma.auditLog.count({ where: { entityId: "rolled-back-audit" } }),
    ).toBe(0);
    await request(app.getHttpServer()).get("/health/ready").expect(200);
  });
});
