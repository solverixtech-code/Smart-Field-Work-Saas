-- Keep the frozen SET NULL reference lifecycle; protect event content, not parent deletion.
-- New inserts require authoritative references. Only nested FK actions may unlink them.
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_v2_shape";
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_v2_shape" CHECK (
  "schemaVersion" IN (1,2) AND scope IN ('TENANT','PLATFORM','SYSTEM','LEGACY') AND
  ("schemaVersion"=1 OR (
    scope <> 'LEGACY' AND ("tenantId" IS NULL OR scope='TENANT') AND
    "eventCode" IS NOT NULL AND length("eventCode") BETWEEN 1 AND 100 AND
    category IS NOT NULL AND category IN ('AUTH','RBAC','CATALOG','PLAN','SUBSCRIPTION','PROVISIONING','INDUSTRY','MASTER','MEDIA','JOB') AND
    outcome IS NOT NULL AND outcome IN ('SUCCESS','FAILURE','DENIED') AND
    "actorType" IN ('USER','SYSTEM','ANONYMOUS') AND "redactionVersion" IS NOT NULL AND "redactionVersion"=1 AND
    ("requestId" IS NULL OR length("requestId")<=100) AND
    ("correlationId" IS NULL OR length("correlationId")<=100) AND
    ("originRequestId" IS NULL OR length("originRequestId")<=100) AND
    ("beforeJson" IS NULL OR octet_length("beforeJson"::text)<=32768) AND
    ("afterJson" IS NULL OR octet_length("afterJson"::text)<=32768) AND
    (metadata IS NULL OR octet_length(metadata::text)<=32768)
  ))
);
CREATE OR REPLACE FUNCTION sfw_audit_v2_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='UPDATE' AND OLD."schemaVersion"=2 THEN
    IF NEW IS NOT DISTINCT FROM OLD THEN RETURN NEW; END IF;
    IF pg_trigger_depth()>1 AND
       (to_jsonb(NEW)-ARRAY['actorUserId','tenantId','tenantMembershipId'])=(to_jsonb(OLD)-ARRAY['actorUserId','tenantId','tenantMembershipId']) AND
       (NEW."actorUserId" IS NULL OR NEW."actorUserId" IS NOT DISTINCT FROM OLD."actorUserId") AND
       (NEW."tenantId" IS NULL OR NEW."tenantId" IS NOT DISTINCT FROM OLD."tenantId") AND
       (NEW."tenantMembershipId" IS NULL OR NEW."tenantMembershipId" IS NOT DISTINCT FROM OLD."tenantMembershipId")
    THEN RETURN NEW; END IF;
    RAISE EXCEPTION 'Audit content is append-only' USING ERRCODE='23514';
  END IF;
  IF NEW."schemaVersion"=2 THEN
    IF (NEW.scope='TENANT')<>(NEW."tenantId" IS NOT NULL) OR
       (NEW."actorType"='USER' AND NEW."actorUserId" IS NULL) OR
       (NEW."tenantMembershipId" IS NOT NULL AND NEW."tenantId" IS NULL) THEN
      RAISE EXCEPTION 'Audit scope mismatch' USING ERRCODE='23514';
    END IF;
    IF NEW."tenantMembershipId" IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM "TenantMembership" m WHERE m.id=NEW."tenantMembershipId" AND m."tenantId"=NEW."tenantId" AND m."userId"=NEW."actorUserId"
    ) THEN RAISE EXCEPTION 'Audit membership scope mismatch' USING ERRCODE='23514'; END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE FUNCTION sfw_job_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='UPDATE' AND ROW(NEW.type,NEW."schemaVersion",NEW."tenantId",NEW."actorUserId",NEW."membershipId",NEW."originRequestId",NEW."correlationId",NEW.payload,NEW."idempotencyKey",NEW."payloadHash",NEW."maxAttempts") IS DISTINCT FROM
    ROW(OLD.type,OLD."schemaVersion",OLD."tenantId",OLD."actorUserId",OLD."membershipId",OLD."originRequestId",OLD."correlationId",OLD.payload,OLD."idempotencyKey",OLD."payloadHash",OLD."maxAttempts") THEN
    RAISE EXCEPTION 'Job intent is immutable' USING ERRCODE='23514';
  END IF;
  IF NEW."membershipId" IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM "TenantMembership" m WHERE m.id=NEW."membershipId" AND m."tenantId"=NEW."tenantId" AND m."userId"=NEW."actorUserId"
  ) THEN RAISE EXCEPTION 'Job actor scope mismatch' USING ERRCODE='23514'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER job_integrity BEFORE INSERT OR UPDATE ON "BackgroundJob" FOR EACH ROW EXECUTE FUNCTION sfw_job_integrity();

CREATE FUNCTION sfw_job_attempt_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='UPDATE' AND (OLD.status<>'RUNNING' OR
    ROW(NEW."jobId",NEW.number,NEW."leaseToken",NEW."workerId",NEW."startedAt") IS DISTINCT FROM
    ROW(OLD."jobId",OLD.number,OLD."leaseToken",OLD."workerId",OLD."startedAt")) AND NEW IS DISTINCT FROM OLD THEN
    RAISE EXCEPTION 'Job attempt history is immutable' USING ERRCODE='23514';
  END IF;
  IF TG_OP='INSERT' AND NOT EXISTS (SELECT 1 FROM "BackgroundJob" j WHERE j.id=NEW."jobId" AND j.status='RUNNING' AND j."leaseToken"=NEW."leaseToken" AND j."workerId"=NEW."workerId" AND j."attemptCount"=NEW.number) THEN
    RAISE EXCEPTION 'Job attempt must match claim' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER job_attempt_integrity BEFORE INSERT OR UPDATE ON "BackgroundJobAttempt" FOR EACH ROW EXECUTE FUNCTION sfw_job_attempt_integrity();
