-- Claim/attempt consistency is checked at commit so one transaction can create both.
CREATE FUNCTION sfw_job_transition_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP='INSERT' AND (NEW.status<>'PENDING' OR NEW."attemptCount"<>0) THEN
    RAISE EXCEPTION 'Jobs start as pending intents' USING ERRCODE='23514';
  END IF;
  IF TG_OP='UPDATE' THEN
    IF NEW."attemptCount"<OLD."attemptCount" OR NEW."retryUntilAttempt"<OLD."retryUntilAttempt" THEN
      RAISE EXCEPTION 'Job attempt counters cannot reset' USING ERRCODE='23514';
    END IF;
    IF NEW.status<>OLD.status AND NOT (
      (OLD.status='PENDING' AND NEW.status IN ('RUNNING','DEAD')) OR
      (OLD.status='RUNNING' AND NEW.status IN ('PENDING','SUCCEEDED','DEAD')) OR
      (OLD.status='DEAD' AND NEW.status='PENDING')
    ) THEN RAISE EXCEPTION 'Invalid job transition' USING ERRCODE='23514'; END IF;
    IF NEW.status='RUNNING' AND NEW."leaseToken" IS DISTINCT FROM OLD."leaseToken" THEN
      IF OLD.status='RUNNING' AND OLD."leaseExpiresAt">(clock_timestamp() AT TIME ZONE 'UTC') THEN
        RAISE EXCEPTION 'Cannot replace a live lease' USING ERRCODE='23514';
      END IF;
      IF NEW."attemptCount"<>OLD."attemptCount"+1 THEN
        RAISE EXCEPTION 'Claim must increment attempt count' USING ERRCODE='23514';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER job_transition_integrity BEFORE INSERT OR UPDATE ON "BackgroundJob" FOR EACH ROW EXECUTE FUNCTION sfw_job_transition_integrity();

CREATE FUNCTION sfw_job_claim_consistency() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE target_id text; job_row record; attempt_count bigint;
BEGIN
  IF TG_TABLE_NAME='BackgroundJob' THEN target_id=NEW.id;
  ELSE target_id=COALESCE(NEW."jobId",OLD."jobId"); END IF;
  SELECT id,status,"attemptCount","leaseToken","workerId" INTO job_row FROM "BackgroundJob" WHERE id=target_id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT count(*) INTO attempt_count FROM "BackgroundJobAttempt" WHERE "jobId"=target_id;
  IF attempt_count<>job_row."attemptCount" THEN
    RAISE EXCEPTION 'Job attempt count inconsistent' USING ERRCODE='23514';
  END IF;
  IF job_row.status='RUNNING' AND NOT EXISTS (SELECT 1 FROM "BackgroundJobAttempt" a WHERE a."jobId"=target_id AND a.number=job_row."attemptCount" AND a.status='RUNNING' AND a."leaseToken"=job_row."leaseToken" AND a."workerId"=job_row."workerId") THEN
    RAISE EXCEPTION 'Running job must own current attempt' USING ERRCODE='23514';
  END IF;
  IF EXISTS (SELECT 1 FROM "BackgroundJobAttempt" a WHERE a."jobId"=target_id AND a.status='RUNNING' AND (job_row.status<>'RUNNING' OR a."leaseToken"<>job_row."leaseToken")) THEN
    RAISE EXCEPTION 'Orphan running job attempt' USING ERRCODE='23514';
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER job_claim_consistency AFTER INSERT OR UPDATE ON "BackgroundJob" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sfw_job_claim_consistency();
CREATE CONSTRAINT TRIGGER job_attempt_consistency AFTER INSERT OR UPDATE OR DELETE ON "BackgroundJobAttempt" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sfw_job_claim_consistency();
