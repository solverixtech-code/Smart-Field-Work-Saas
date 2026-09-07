BEGIN;
-- Use the same lock as membership capacity checks, including direct SQL writers.
-- A direct UPDATE may already hold a row lock before this BEFORE trigger runs;
-- PostgreSQL can abort one contender on a deadlock. Retrying the whole transaction
-- is safe; neither transaction is allowed to commit an oversubscribed Tenant.
CREATE OR REPLACE FUNCTION sfw_subscription_capacity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 PERFORM pg_advisory_xact_lock(hashtextextended('subscription:' || NEW."tenantId", 0));
 IF NEW."seatQuantity" < (SELECT count(*) FROM "TenantMembership" WHERE "tenantId" = NEW."tenantId" AND status IN ('ACTIVE', 'INVITED', 'SUSPENDED')) THEN
  RAISE EXCEPTION 'Subscription seats below occupied memberships' USING ERRCODE = '23514';
 END IF;
 IF (NEW.status = 'SUSPENDED' AND (NEW."suspendedFromStatus" IS NULL OR NEW."suspendedFromStatus" IN ('SUSPENDED', 'CANCELLED')))
  OR (NEW.status <> 'SUSPENDED' AND NEW."suspendedFromStatus" IS NOT NULL) THEN
  RAISE EXCEPTION 'Invalid suspended state provenance' USING ERRCODE = '23514';
 END IF;
 RETURN NEW;
END $$;
COMMIT;
