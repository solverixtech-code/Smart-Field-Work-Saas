BEGIN;
-- Serialize capacity changes with commercial commands, including membership writers
-- outside the provisioning API. Legacy Tenants without subscriptions stay compatible.
CREATE FUNCTION sfw_membership_capacity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE capacity INTEGER; occupied INTEGER;
BEGIN
 IF NEW.status IN ('ACTIVE', 'INVITED', 'SUSPENDED') THEN
  PERFORM pg_advisory_xact_lock(hashtextextended('subscription:' || NEW."tenantId", 0));
  SELECT "seatQuantity" INTO capacity FROM "TenantSubscription" WHERE "tenantId" = NEW."tenantId" FOR UPDATE;
  IF capacity IS NOT NULL THEN
   SELECT count(*) INTO occupied FROM "TenantMembership" WHERE "tenantId" = NEW."tenantId"
    AND status IN ('ACTIVE', 'INVITED', 'SUSPENDED') AND id <> NEW.id;
   IF occupied >= capacity THEN RAISE EXCEPTION 'Subscription seats exhausted' USING ERRCODE = '23514'; END IF;
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER membership_capacity_guard BEFORE INSERT OR UPDATE OF status, "tenantId" ON "TenantMembership"
 FOR EACH ROW EXECUTE FUNCTION sfw_membership_capacity_guard();

CREATE FUNCTION sfw_subscription_capacity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW."seatQuantity" < (SELECT count(*) FROM "TenantMembership" WHERE "tenantId" = NEW."tenantId" AND status IN ('ACTIVE', 'INVITED', 'SUSPENDED')) THEN
  RAISE EXCEPTION 'Subscription seats below occupied memberships' USING ERRCODE = '23514';
 END IF;
 IF (NEW.status = 'SUSPENDED' AND (NEW."suspendedFromStatus" IS NULL OR NEW."suspendedFromStatus" IN ('SUSPENDED', 'CANCELLED')))
  OR (NEW.status <> 'SUSPENDED' AND NEW."suspendedFromStatus" IS NOT NULL) THEN
  RAISE EXCEPTION 'Invalid suspended state provenance' USING ERRCODE = '23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER subscription_capacity_guard BEFORE INSERT OR UPDATE ON "TenantSubscription" FOR EACH ROW EXECUTE FUNCTION sfw_subscription_capacity_guard();

CREATE FUNCTION sfw_event_intent_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Event intent cannot be deleted' USING ERRCODE = '23514'; END IF;
 IF NEW.id <> OLD.id OR NEW."provisioningId" <> OLD."provisioningId" OR NEW.kind <> OLD.kind
  OR NEW."schemaVersion" <> OLD."schemaVersion" OR NEW."createdAt" <> OLD."createdAt" OR OLD.status = 'COMPLETED' THEN
  RAISE EXCEPTION 'Event identity or completed delivery is immutable' USING ERRCODE = '23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER event_intent_guard BEFORE UPDATE OR DELETE ON "ProvisioningEvent" FOR EACH ROW EXECUTE FUNCTION sfw_event_intent_guard();

CREATE FUNCTION sfw_attempt_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Attempt history cannot be deleted' USING ERRCODE = '23514'; END IF;
 IF OLD.status <> 'PROCESSING' OR NEW.status NOT IN ('FAILED', 'COMPLETED') OR NEW."finishedAt" IS NULL
  OR (to_jsonb(NEW) - 'status' - 'errorCode' - 'finishedAt') IS DISTINCT FROM (to_jsonb(OLD) - 'status' - 'errorCode' - 'finishedAt') THEN
  RAISE EXCEPTION 'Attempt identity and resolved history are immutable' USING ERRCODE = '23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER attempt_guard BEFORE UPDATE OR DELETE ON "ProvisioningAttempt" FOR EACH ROW EXECUTE FUNCTION sfw_attempt_guard();

CREATE FUNCTION sfw_provisioned_industry_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NEW."industryCode" IS NULL AND EXISTS (SELECT 1 FROM "TenantProvisioning" WHERE "tenantId" = NEW.id) THEN
  RAISE EXCEPTION 'Provisioned Industry assignment cannot be removed' USING ERRCODE = '23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER provisioned_industry_guard BEFORE UPDATE OF "industryCode" ON "Tenant" FOR EACH ROW EXECUTE FUNCTION sfw_provisioned_industry_guard();
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_actor_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"(id) ON DELETE RESTRICT;
ALTER TABLE "TenantProvisioning" ADD CONSTRAINT "TenantProvisioning_actor_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"(id) ON DELETE RESTRICT;
ALTER TABLE "ProvisioningAttempt" ADD CONSTRAINT "ProvisioningAttempt_actor_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"(id) ON DELETE RESTRICT;
COMMIT;
