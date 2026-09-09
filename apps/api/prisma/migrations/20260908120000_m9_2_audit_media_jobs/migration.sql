-- Phase 0.10 continuation; M10 remains reserved for legacy contraction.
-- Deliberately preserve all hand-authored M6-M9 constraints and triggers.

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "actorType" TEXT NOT NULL DEFAULT 'LEGACY',
ADD COLUMN     "category" TEXT,
ADD COLUMN     "correlationId" TEXT,
ADD COLUMN     "eventCode" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "originRequestId" TEXT,
ADD COLUMN     "outcome" TEXT,
ADD COLUMN     "redactionVersion" INTEGER,
ADD COLUMN     "requestId" TEXT,
ADD COLUMN     "schemaVersion" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'LEGACY';

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "creatorUserId" TEXT NOT NULL,
    "creatorMembershipId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'S3',
    "bucket" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "expectedBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "etag" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPLOAD_PENDING',
    "uploadExpiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackgroundJob" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "tenantId" TEXT,
    "actorUserId" TEXT,
    "membershipId" TEXT,
    "originRequestId" TEXT,
    "correlationId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "availableAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "retryUntilAttempt" INTEGER NOT NULL DEFAULT 5,
    "workerId" TEXT,
    "leaseToken" TEXT,
    "leaseExpiresAt" TIMESTAMP(3),
    "lastErrorCode" TEXT,
    "completedAt" TIMESTAMP(3),
    "deadAt" TIMESTAMP(3),
    "revision" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackgroundJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackgroundJobAttempt" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "leaseToken" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "errorCode" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "BackgroundJobAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MediaAsset_tenantId_status_createdAt_idx" ON "MediaAsset"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_bucket_objectKey_key" ON "MediaAsset"("bucket", "objectKey");

-- CreateIndex
CREATE INDEX "BackgroundJob_status_availableAt_id_idx" ON "BackgroundJob"("status", "availableAt", "id");

-- CreateIndex
CREATE INDEX "BackgroundJob_tenantId_createdAt_id_idx" ON "BackgroundJob"("tenantId", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "BackgroundJobAttempt_leaseToken_key" ON "BackgroundJobAttempt"("leaseToken");

-- CreateIndex
CREATE UNIQUE INDEX "BackgroundJobAttempt_jobId_number_key" ON "BackgroundJobAttempt"("jobId", "number");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_id_idx" ON "AuditLog"("tenantId", "createdAt", "id");

-- CreateIndex
CREATE INDEX "AuditLog_eventCode_createdAt_id_idx" ON "AuditLog"("eventCode", "createdAt", "id");

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_creatorUserId_fkey" FOREIGN KEY ("creatorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_creatorMembershipId_tenantId_fkey" FOREIGN KEY ("creatorMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackgroundJobAttempt" ADD CONSTRAINT "BackgroundJobAttempt_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "BackgroundJob"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_actor_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_membership_fkey" FOREIGN KEY ("membershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT;

-- AddForeignKey
CREATE UNIQUE INDEX "BackgroundJob_tenant_idempotency" ON "BackgroundJob" ("tenantId", type, "idempotencyKey") WHERE "tenantId" IS NOT NULL;
CREATE UNIQUE INDEX "BackgroundJob_system_idempotency" ON "BackgroundJob" (type, "idempotencyKey") WHERE "tenantId" IS NULL;
CREATE INDEX "BackgroundJob_expired_lease" ON "BackgroundJob" ("leaseExpiresAt", id) WHERE status='RUNNING';

DO $$
DECLARE before_count bigint; tenant_count bigint; legacy_count bigint; unresolved_count bigint;
BEGIN
  SELECT count(*), count(*) FILTER (WHERE "tenantId" IS NOT NULL), count(*) FILTER (WHERE "tenantId" IS NULL), count(*) FILTER (WHERE "actorUserId" IS NULL)
    INTO before_count, tenant_count, legacy_count, unresolved_count FROM "AuditLog";
  UPDATE "AuditLog" SET scope = CASE WHEN "tenantId" IS NOT NULL THEN 'TENANT' ELSE 'LEGACY' END;
  RAISE NOTICE 'AuditLog preserved=%, TENANT=%, LEGACY=%, unresolved actor=%', before_count, tenant_count, legacy_count, unresolved_count;
END $$;

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_v2_shape" CHECK (
  "schemaVersion" IN (1,2) AND scope IN ('TENANT','PLATFORM','SYSTEM','LEGACY') AND
  ("schemaVersion"=1 OR (
    scope <> 'LEGACY' AND (scope='TENANT')=("tenantId" IS NOT NULL) AND
    ("tenantMembershipId" IS NULL OR "tenantId" IS NOT NULL) AND
    "eventCode" IS NOT NULL AND length("eventCode") BETWEEN 1 AND 100 AND
    category IN ('AUTH','RBAC','CATALOG','PLAN','SUBSCRIPTION','PROVISIONING','INDUSTRY','MASTER','MEDIA','JOB') AND
    outcome IN ('SUCCESS','FAILURE','DENIED') AND "actorType" IN ('USER','SYSTEM','ANONYMOUS') AND
    ("actorType" <> 'USER' OR "actorUserId" IS NOT NULL) AND "redactionVersion"=1
  ))
);

CREATE FUNCTION sfw_audit_v2_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='UPDATE' AND OLD."schemaVersion"=2 AND NEW IS DISTINCT FROM OLD THEN
    RAISE EXCEPTION 'Audit content is append-only' USING ERRCODE='23514';
  END IF;
  IF NEW."schemaVersion"=2 AND NEW."tenantMembershipId" IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM "TenantMembership" m WHERE m.id=NEW."tenantMembershipId" AND m."tenantId"=NEW."tenantId" AND m."userId"=NEW."actorUserId"
  ) THEN RAISE EXCEPTION 'Audit membership scope mismatch' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER audit_v2_integrity BEFORE INSERT OR UPDATE ON "AuditLog" FOR EACH ROW EXECUTE FUNCTION sfw_audit_v2_integrity();

ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_shape" CHECK (
  provider='S3' AND "expectedBytes" BETWEEN 1 AND 104857600 AND revision>0 AND
  "checksumSha256" ~ '^[A-Za-z0-9+/]{43}=$' AND length(bucket) BETWEEN 3 AND 63 AND
  length("objectKey") BETWEEN 1 AND 1024 AND length("displayName") BETWEEN 1 AND 200 AND
  "mimeType" IN ('image/jpeg','image/png','image/webp','application/pdf') AND
  status IN ('UPLOAD_PENDING','READY','DELETE_PENDING','DELETED','FAILED') AND
  (status <> 'READY' OR "completedAt" IS NOT NULL) AND
  (status='DELETED')=("deletedAt" IS NOT NULL)
);
CREATE FUNCTION sfw_media_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='UPDATE' AND ROW(NEW."tenantId",NEW."creatorUserId",NEW."creatorMembershipId",NEW.provider,NEW.bucket,NEW."objectKey",NEW."expectedBytes",NEW."mimeType",NEW."checksumSha256",NEW."uploadExpiresAt") IS DISTINCT FROM
    ROW(OLD."tenantId",OLD."creatorUserId",OLD."creatorMembershipId",OLD.provider,OLD.bucket,OLD."objectKey",OLD."expectedBytes",OLD."mimeType",OLD."checksumSha256",OLD."uploadExpiresAt") THEN
    RAISE EXCEPTION 'Media identity is immutable' USING ERRCODE='23514';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM "TenantMembership" m WHERE m.id=NEW."creatorMembershipId" AND m."tenantId"=NEW."tenantId" AND m."userId"=NEW."creatorUserId") THEN
    RAISE EXCEPTION 'Media creator scope mismatch' USING ERRCODE='23514';
  END IF;
  IF TG_OP='UPDATE' AND NEW.status<>OLD.status AND NOT (
    (OLD.status='UPLOAD_PENDING' AND NEW.status IN ('READY','FAILED','DELETE_PENDING')) OR
    (OLD.status IN ('READY','FAILED') AND NEW.status='DELETE_PENDING') OR
    (OLD.status='DELETE_PENDING' AND NEW.status='DELETED')
  ) THEN RAISE EXCEPTION 'Invalid media transition' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER media_integrity BEFORE INSERT OR UPDATE ON "MediaAsset" FOR EACH ROW EXECUTE FUNCTION sfw_media_integrity();

ALTER TABLE "BackgroundJob" ADD CONSTRAINT "BackgroundJob_shape" CHECK (
  status IN ('PENDING','RUNNING','SUCCEEDED','DEAD') AND "schemaVersion"=1 AND
  "attemptCount">=0 AND "maxAttempts" BETWEEN 1 AND 10 AND "retryUntilAttempt">=1 AND revision>0 AND
  length(type) BETWEEN 1 AND 100 AND length("idempotencyKey") BETWEEN 1 AND 200 AND
  "payloadHash" ~ '^[a-f0-9]{64}$' AND jsonb_typeof(payload)='object' AND pg_column_size(payload)<=4096 AND
  length("correlationId") BETWEEN 1 AND 100 AND ("membershipId" IS NULL OR "tenantId" IS NOT NULL) AND
  (status='RUNNING' AND "workerId" IS NOT NULL AND "leaseToken" IS NOT NULL AND "leaseExpiresAt" IS NOT NULL OR
   status<>'RUNNING' AND "workerId" IS NULL AND "leaseToken" IS NULL AND "leaseExpiresAt" IS NULL) AND
  (status='SUCCEEDED')=("completedAt" IS NOT NULL) AND (status='DEAD')=("deadAt" IS NOT NULL)
);
ALTER TABLE "BackgroundJobAttempt" ADD CONSTRAINT "BackgroundJobAttempt_shape" CHECK (
  number>0 AND status IN ('RUNNING','SUCCEEDED','FAILED','LEASE_EXPIRED') AND
  (status='RUNNING')=("finishedAt" IS NULL)
);
