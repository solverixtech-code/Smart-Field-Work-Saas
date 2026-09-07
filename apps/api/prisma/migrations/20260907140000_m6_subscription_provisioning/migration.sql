BEGIN;
-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'GRACE', 'SUSPENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SubscriptionChangeStatus" AS ENUM ('SCHEDULED', 'APPLIED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProvisioningEventStatus" AS ENUM ('PENDING', 'PROCESSING', 'FAILED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "industryCode" TEXT;

-- CreateTable
CREATE TABLE "IndustryClassification" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "IndustryClassification_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "TenantSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "seatQuantity" INTEGER NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "trialEndsAt" TIMESTAMP(3),
    "graceEndsAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionChange" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "fromPlanVersionId" TEXT NOT NULL,
    "toPlanVersionId" TEXT NOT NULL,
    "fromStatus" "SubscriptionStatus" NOT NULL,
    "toStatus" "SubscriptionStatus" NOT NULL,
    "status" "SubscriptionChangeStatus" NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "appliedAt" TIMESTAMP(3),
    "actorUserId" TEXT NOT NULL,
    "requestId" TEXT,
    "revision" INTEGER NOT NULL,

    CONSTRAINT "SubscriptionChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantProvisioning" (
    "id" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "ownerMembershipId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "requestId" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantProvisioning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvisioningEvent" (
    "id" TEXT NOT NULL,
    "provisioningId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "status" "ProvisioningEventStatus" NOT NULL DEFAULT 'PENDING',
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "leaseToken" TEXT,
    "leaseEndsAt" TIMESTAMP(3),
    "lastErrorCode" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvisioningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvisioningAttempt" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "attemptKey" TEXT NOT NULL,
    "leaseToken" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "status" "ProvisioningEventStatus" NOT NULL DEFAULT 'PROCESSING',
    "errorCode" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "ProvisioningAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantSubscription_tenantId_key" ON "TenantSubscription"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSubscription_id_tenantId_key" ON "TenantSubscription"("id", "tenantId");

-- CreateIndex
CREATE INDEX "SubscriptionChange_subscriptionId_requestedAt_idx" ON "SubscriptionChange"("subscriptionId", "requestedAt");

-- CreateIndex
CREATE INDEX "SubscriptionChange_status_effectiveAt_idx" ON "SubscriptionChange"("status", "effectiveAt");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionChange_subscriptionId_idempotencyKey_key" ON "SubscriptionChange"("subscriptionId", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "TenantProvisioning_idempotencyKey_key" ON "TenantProvisioning"("idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX "TenantProvisioning_tenantId_key" ON "TenantProvisioning"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantProvisioning_subscriptionId_key" ON "TenantProvisioning"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantProvisioning_subscriptionId_tenantId_key" ON "TenantProvisioning"("subscriptionId", "tenantId");

-- CreateIndex
CREATE INDEX "ProvisioningEvent_status_createdAt_idx" ON "ProvisioningEvent"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProvisioningEvent_provisioningId_kind_key" ON "ProvisioningEvent"("provisioningId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "ProvisioningAttempt_leaseToken_key" ON "ProvisioningAttempt"("leaseToken");

-- CreateIndex
CREATE UNIQUE INDEX "ProvisioningAttempt_eventId_attemptKey_key" ON "ProvisioningAttempt"("eventId", "attemptKey");

-- CreateIndex
CREATE UNIQUE INDEX "TenantMembership_id_tenantId_key" ON "TenantMembership"("id", "tenantId");

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_industryCode_fkey" FOREIGN KEY ("industryCode") REFERENCES "IndustryClassification"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "PlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_subscriptionId_tenantId_fkey" FOREIGN KEY ("subscriptionId", "tenantId") REFERENCES "TenantSubscription"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_fromPlanVersionId_fkey" FOREIGN KEY ("fromPlanVersionId") REFERENCES "PlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_toPlanVersionId_fkey" FOREIGN KEY ("toPlanVersionId") REFERENCES "PlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantProvisioning" ADD CONSTRAINT "TenantProvisioning_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantProvisioning" ADD CONSTRAINT "TenantProvisioning_subscriptionId_tenantId_fkey" FOREIGN KEY ("subscriptionId", "tenantId") REFERENCES "TenantSubscription"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantProvisioning" ADD CONSTRAINT "TenantProvisioning_ownerMembershipId_tenantId_fkey" FOREIGN KEY ("ownerMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvisioningEvent" ADD CONSTRAINT "ProvisioningEvent_provisioningId_fkey" FOREIGN KEY ("provisioningId") REFERENCES "TenantProvisioning"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvisioningAttempt" ADD CONSTRAINT "ProvisioningAttempt_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ProvisioningEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Phase 0.6 integrity: a pin must refer to a published commercial snapshot.
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "Subscription_pricing_fkey"
 FOREIGN KEY ("planVersionId", "billingCycle") REFERENCES "PlanPricing"("planVersionId", "billingCycle") ON DELETE RESTRICT;
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "Subscription_positive_values"
 CHECK ("seatQuantity" > 0 AND "revision" > 0 AND "currentPeriodEnd" > "currentPeriodStart");
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "Subscription_state_dates"
 CHECK ((status <> 'TRIALING' OR "trialEndsAt" IS NOT NULL)
 AND (status <> 'GRACE' OR "graceEndsAt" IS NOT NULL)
 AND (status <> 'CANCELLED' OR "cancelledAt" IS NOT NULL));
CREATE UNIQUE INDEX "Subscription_one_scheduled_change" ON "SubscriptionChange"("subscriptionId") WHERE status = 'SCHEDULED';

CREATE FUNCTION sfw_subscription_pin_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS (SELECT 1 FROM "PlanVersion" WHERE id = NEW."planVersionId" AND status = 'PUBLISHED' AND "publishedAt" IS NOT NULL) THEN
  RAISE EXCEPTION 'Subscription requires a published PlanVersion' USING ERRCODE = '23514';
 END IF;
 IF TG_OP = 'UPDATE' THEN
  IF NEW.id <> OLD.id OR NEW."tenantId" <> OLD."tenantId" OR NEW."startedAt" <> OLD."startedAt" THEN
   RAISE EXCEPTION 'Subscription identity is immutable' USING ERRCODE = '23514';
  END IF;
  IF OLD.status = 'CANCELLED' THEN
   RAISE EXCEPTION 'Cancelled subscription is terminal' USING ERRCODE = '23514';
  END IF;
  IF NEW.revision <> OLD.revision + 1 THEN
   RAISE EXCEPTION 'Subscription revision must increment once' USING ERRCODE = '23514';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER subscription_pin_guard BEFORE INSERT OR UPDATE ON "TenantSubscription" FOR EACH ROW EXECUTE FUNCTION sfw_subscription_pin_guard();

CREATE FUNCTION sfw_subscription_history_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF NOT EXISTS (
  SELECT 1 FROM "SubscriptionChange" c WHERE c."subscriptionId" = NEW.id
   AND c."tenantId" = NEW."tenantId" AND c."toPlanVersionId" = NEW."planVersionId"
   AND c."toStatus" = NEW.status AND c.revision = NEW.revision AND c.status = 'APPLIED'
 ) THEN
  IF TG_OP = 'INSERT' OR NEW."planVersionId" <> OLD."planVersionId" OR NEW.status <> OLD.status THEN
   RAISE EXCEPTION 'Applied subscription history required' USING ERRCODE = '23514';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE CONSTRAINT TRIGGER subscription_history_guard AFTER INSERT OR UPDATE ON "TenantSubscription"
 DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION sfw_subscription_history_guard();

CREATE FUNCTION sfw_change_immutability() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP = 'DELETE' THEN
  RAISE EXCEPTION 'Subscription history cannot be deleted' USING ERRCODE = '23514';
 END IF;
 IF OLD.status <> 'SCHEDULED' OR NEW.status NOT IN ('APPLIED', 'CANCELLED')
 OR (to_jsonb(NEW) - 'status' - 'appliedAt' - 'revision') IS DISTINCT FROM
    (to_jsonb(OLD) - 'status' - 'appliedAt' - 'revision') THEN
  RAISE EXCEPTION 'Subscription history is immutable' USING ERRCODE = '23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER subscription_change_immutable BEFORE UPDATE OR DELETE ON "SubscriptionChange" FOR EACH ROW EXECUTE FUNCTION sfw_change_immutability();

-- Reviewed existing classification codes; no module recommendations or templates.
INSERT INTO "IndustryClassification" ("code", "name") VALUES
('PHARMA', 'Pharma & Healthcare'),
('FMCG', 'FMCG & Consumer Goods'),
('SOLAR', 'Solar & Renewable Energy'),
('RETAIL', 'Retail & Franchise Ops'),
('CONSTRUCTION', 'Construction & Real Estate'),
('BANKING', 'Banking & Financial Services'),
('INSURANCE', 'Insurance & Mutual Funds'),
('TELECOM', 'Telecom & ISP Operations'),
('LOGISTICS', 'Logistics & Supply Chain'),
('AGRI', 'Agri Inputs & Crop Protection'),
('AUTOMOTIVE', 'Automotive & Auto Components'),
('EDTECH', 'EdTech & Higher Education'),
('CHEMICAL', 'Chemicals & Specialty Materials'),
('DURABLES', 'Consumer Durables & Electronics'),
('APPAREL', 'Apparel & Fashion Brands'),
('HARDWARE', 'Paints & Building Hardware'),
('MEDICAL_DEVICE', 'Medical Devices & Equipment'),
('HOSPITALITY', 'Hospitality & HORECA'),
('WASTE_MGMT', 'Waste Management & ESG'),
('FACILITY', 'Facility Management & Security'),
('TEXTILE', 'Textiles & Yarn Spinning'),
('POWER_DIST', 'Power & Utility Metering'),
('DIAGNOSTICS', 'Diagnostics & Pathology Labs'),
('ECOM_LOGISTICS', 'E-Commerce Hyperlocal Delivery'),
('SOFTWARE_SAAS', 'Software & Cloud SaaS Services');
COMMIT;
