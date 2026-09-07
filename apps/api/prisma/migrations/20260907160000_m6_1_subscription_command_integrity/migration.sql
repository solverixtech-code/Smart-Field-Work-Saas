BEGIN;
ALTER TABLE "TenantSubscription" ADD COLUMN "suspendedFromStatus" "SubscriptionStatus";
-- Do not invent replay receipts for existing commercial commands.
DO $$ BEGIN
 IF EXISTS (SELECT 1 FROM "SubscriptionChange") THEN
  RAISE EXCEPTION 'M6.1 requires explicit reconciliation of existing SubscriptionChange receipts before migration';
 END IF;
END $$;
ALTER TABLE "SubscriptionChange" ADD COLUMN "requestData" JSONB NOT NULL, ADD COLUMN "result" JSONB NOT NULL;

CREATE OR REPLACE FUNCTION sfw_subscription_history_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS (
  SELECT 1 FROM "SubscriptionChange" c WHERE c."subscriptionId" = NEW.id
   AND c."tenantId" = NEW."tenantId" AND c."toPlanVersionId" = NEW."planVersionId"
   AND c."toStatus" = NEW.status AND c.revision = NEW.revision AND c.status = 'APPLIED'
 ) THEN
  RAISE EXCEPTION 'Applied subscription history required for every revision' USING ERRCODE = '23514';
 END IF;
 RETURN NEW;
END $$;

CREATE FUNCTION sfw_subscription_no_delete() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 RAISE EXCEPTION 'Subscriptions cannot be deleted; cancel explicitly' USING ERRCODE = '23514';
END $$;
CREATE TRIGGER subscription_no_delete BEFORE DELETE ON "TenantSubscription" FOR EACH ROW EXECUTE FUNCTION sfw_subscription_no_delete();

CREATE FUNCTION sfw_provisioning_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'Provisioning receipt is immutable' USING ERRCODE = '23514'; END IF;
 IF TG_OP = 'UPDATE' AND ((to_jsonb(NEW) - 'acceptedAt') IS DISTINCT FROM (to_jsonb(OLD) - 'acceptedAt')
  OR OLD."acceptedAt" IS NOT NULL) THEN
  RAISE EXCEPTION 'Provisioning receipt is immutable' USING ERRCODE = '23514';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM "Tenant" WHERE id = NEW."tenantId" AND "industryCode" IS NOT NULL) THEN
  RAISE EXCEPTION 'Provisioned tenant requires Industry classification' USING ERRCODE = '23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER provisioning_guard BEFORE INSERT OR UPDATE OR DELETE ON "TenantProvisioning" FOR EACH ROW EXECUTE FUNCTION sfw_provisioning_guard();
COMMIT;
