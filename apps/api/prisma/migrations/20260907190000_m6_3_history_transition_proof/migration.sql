BEGIN;
CREATE UNIQUE INDEX "SubscriptionChange_applied_revision_key" ON "SubscriptionChange"("subscriptionId", revision)
 WHERE status = 'APPLIED' AND kind <> 'SCHEDULED_PLAN';

CREATE OR REPLACE FUNCTION sfw_subscription_history_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE prior_version TEXT; prior_status "SubscriptionStatus";
BEGIN
 IF TG_OP = 'INSERT' THEN prior_version := NEW."planVersionId"; prior_status := NEW.status;
 ELSE prior_version := OLD."planVersionId"; prior_status := OLD.status; END IF;
 IF NOT EXISTS (
  SELECT 1 FROM "SubscriptionChange" c WHERE c."subscriptionId" = NEW.id
   AND c."tenantId" = NEW."tenantId" AND c."fromPlanVersionId" = prior_version AND c."fromStatus" = prior_status
   AND c."toPlanVersionId" = NEW."planVersionId" AND c."toStatus" = NEW.status
   AND c.revision = NEW.revision AND c.status = 'APPLIED' AND c.kind <> 'SCHEDULED_PLAN'
 ) THEN RAISE EXCEPTION 'Exact applied transition history required' USING ERRCODE = '23514'; END IF;
 RETURN NEW;
END $$;

CREATE FUNCTION sfw_change_transition_proof() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE sub RECORD;
BEGIN
 SELECT id, revision, "planVersionId", status INTO sub FROM "TenantSubscription" WHERE id = NEW."subscriptionId";
 IF NEW.status = 'APPLIED' THEN
  IF sub.revision <> NEW.revision OR sub."planVersionId" <> NEW."toPlanVersionId" OR sub.status <> NEW."toStatus" THEN
   RAISE EXCEPTION 'History cannot claim a transition that did not occur' USING ERRCODE = '23514';
  END IF;
  IF NEW.kind = 'SCHEDULED_PLAN' AND NOT EXISTS (
   SELECT 1 FROM "SubscriptionChange" c WHERE c."subscriptionId" = sub.id AND c.revision = NEW.revision
    AND c.kind = 'APPLY_DUE' AND c.status = 'APPLIED' AND c."toPlanVersionId" = NEW."toPlanVersionId"
  ) THEN RAISE EXCEPTION 'Scheduled application requires an explicit apply-due command' USING ERRCODE = '23514'; END IF;
 ELSIF NEW.status = 'SCHEDULED' THEN
  IF NEW.kind <> 'SCHEDULED_PLAN' OR NEW."fromPlanVersionId" <> sub."planVersionId" OR NEW.revision <> sub.revision
   OR NEW."fromStatus" <> sub.status OR NEW."toStatus" <> 'ACTIVE'
   OR NEW."requestData"->>'planVersionId' IS DISTINCT FROM NEW."toPlanVersionId" THEN
   RAISE EXCEPTION 'Invalid scheduled change provenance' USING ERRCODE = '23514';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER change_transition_proof AFTER INSERT OR UPDATE ON "SubscriptionChange"
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sfw_change_transition_proof();
COMMIT;
