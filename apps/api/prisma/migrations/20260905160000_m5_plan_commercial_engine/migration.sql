-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PlanVisibility" AS ENUM ('PUBLIC', 'INTERNAL', 'INVITE_ONLY');

-- CreateEnum
CREATE TYPE "PlanVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('PER_USER', 'BASE_PLUS_PER_USER', 'FLAT', 'CUSTOM_CONTRACT');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "TaxMode" AS ENUM ('EXCLUSIVE', 'INCLUSIVE');

-- CreateEnum
CREATE TYPE "ProrationPolicy" AS ENUM ('NONE', 'IMMEDIATE', 'NEXT_BILLING_CYCLE');

-- CreateEnum
CREATE TYPE "ExpiryAccess" AS ENUM ('READ_ONLY', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ChangeEffectiveTiming" AS ENUM ('IMMEDIATE', 'NEXT_BILLING_CYCLE');

-- CreateEnum
CREATE TYPE "LimitValueType" AS ENUM ('INTEGER', 'DECIMAL', 'BOOLEAN');

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "internalDescription" TEXT,
    "status" "PlanStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "PlanVisibility" NOT NULL DEFAULT 'PUBLIC',
    "tier" TEXT,
    "badge" TEXT,
    "recommendedFor" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "currentPublishedVersionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanVersion" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "PlanVersionStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "publishedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanPricing" (
    "id" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "billingCycle" "BillingCycle" NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "baseFee" DECIMAL(18,2),
    "perSeatFee" DECIMAL(18,2),
    "flatFee" DECIMAL(18,2),
    "setupFee" DECIMAL(18,2),
    "minimumCommitmentAmount" DECIMAL(18,2),
    "discountPercent" DECIMAL(5,2),
    "taxMode" "TaxMode" NOT NULL DEFAULT 'EXCLUSIVE',
    "prorationPolicy" "ProrationPolicy" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanLimit" (
    "id" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "limitCode" TEXT NOT NULL,
    "valueType" "LimitValueType" NOT NULL,
    "integerValue" INTEGER,
    "decimalValue" DECIMAL(18,2),
    "booleanValue" BOOLEAN,
    "isUnlimited" BOOLEAN NOT NULL DEFAULT false,
    "unit" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanModule" (
    "id" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanCommercialRule" (
    "id" TEXT NOT NULL,
    "planVersionId" TEXT NOT NULL,
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "rules" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlanCommercialRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Plan_code_key" ON "Plan"("code");

-- CreateIndex
CREATE INDEX "Plan_status_idx" ON "Plan"("status");

-- CreateIndex
CREATE INDEX "Plan_visibility_idx" ON "Plan"("visibility");

-- CreateIndex
CREATE INDEX "Plan_displayOrder_idx" ON "Plan"("displayOrder");

-- CreateIndex
CREATE INDEX "PlanVersion_planId_status_idx" ON "PlanVersion"("planId", "status");

-- CreateIndex
CREATE INDEX "PlanVersion_status_idx" ON "PlanVersion"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PlanVersion_planId_version_key" ON "PlanVersion"("planId", "version");

-- Partial unique index enforcing AT MOST ONE active DRAFT version per Plan
CREATE UNIQUE INDEX "PlanVersion_planId_draft_key" ON "PlanVersion"("planId") WHERE status = 'DRAFT';

-- CreateIndex
CREATE INDEX "PlanPricing_planVersionId_idx" ON "PlanPricing"("planVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanPricing_planVersionId_billingCycle_key" ON "PlanPricing"("planVersionId", "billingCycle");

-- CreateIndex
CREATE INDEX "PlanLimit_planVersionId_idx" ON "PlanLimit"("planVersionId");

-- CreateIndex
CREATE INDEX "PlanLimit_limitCode_idx" ON "PlanLimit"("limitCode");

-- CreateIndex
CREATE UNIQUE INDEX "PlanLimit_planVersionId_limitCode_key" ON "PlanLimit"("planVersionId", "limitCode");

-- CreateIndex
CREATE INDEX "PlanModule_planVersionId_idx" ON "PlanModule"("planVersionId");

-- CreateIndex
CREATE INDEX "PlanModule_moduleId_idx" ON "PlanModule"("moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanModule_planVersionId_moduleId_key" ON "PlanModule"("planVersionId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanCommercialRule_planVersionId_key" ON "PlanCommercialRule"("planVersionId");

-- CreateIndex
CREATE INDEX "PlanCommercialRule_planVersionId_idx" ON "PlanCommercialRule"("planVersionId");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_currentPublishedVersionId_fkey" FOREIGN KEY ("currentPublishedVersionId") REFERENCES "PlanVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanVersion" ADD CONSTRAINT "PlanVersion_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanVersion" ADD CONSTRAINT "PlanVersion_publishedByUserId_fkey" FOREIGN KEY ("publishedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanPricing" ADD CONSTRAINT "PlanPricing_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "PlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanLimit" ADD CONSTRAINT "PlanLimit_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "PlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanModule" ADD CONSTRAINT "PlanModule_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "PlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanModule" ADD CONSTRAINT "PlanModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "PlatformModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanCommercialRule" ADD CONSTRAINT "PlanCommercialRule_planVersionId_fkey" FOREIGN KEY ("planVersionId") REFERENCES "PlanVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ─── Database Immutability Triggers ─────────────────────────────────────────────

-- Function: prevent modification of published PlanVersion
CREATE OR REPLACE FUNCTION prevent_published_plan_version_modification()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow publishing transition: DRAFT -> PUBLISHED
    IF OLD.status = 'DRAFT' AND NEW.status = 'PUBLISHED' THEN
        RETURN NEW;
    END IF;

    -- Block any modification or deletion of a published version
    IF OLD.status = 'PUBLISHED' OR OLD."publishedAt" IS NOT NULL THEN
        RAISE EXCEPTION 'Immutable error: Published PlanVersion % cannot be updated or deleted.', OLD.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_plan_version_immutability
BEFORE UPDATE OR DELETE ON "PlanVersion"
FOR EACH ROW
EXECUTE FUNCTION prevent_published_plan_version_modification();

-- Function: prevent child record modification for published PlanVersion
CREATE OR REPLACE FUNCTION prevent_published_plan_child_modification()
RETURNS TRIGGER AS $$
DECLARE
    target_plan_version_id TEXT;
    target_status "PlanVersionStatus";
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_plan_version_id := OLD."planVersionId";
    ELSE
        target_plan_version_id := NEW."planVersionId";
    END IF;

    SELECT status INTO target_status FROM "PlanVersion" WHERE id = target_plan_version_id;

    IF target_status = 'PUBLISHED' THEN
        RAISE EXCEPTION 'Immutable error: Cannot insert, update, or delete child records for published PlanVersion %.', target_plan_version_id;
    END IF;

    IF TG_OP = 'UPDATE' AND OLD."planVersionId" <> NEW."planVersionId" THEN
        SELECT status INTO target_status FROM "PlanVersion" WHERE id = OLD."planVersionId";
        IF target_status = 'PUBLISHED' THEN
            RAISE EXCEPTION 'Immutable error: Cannot move child records out of published PlanVersion %.', OLD."planVersionId";
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_plan_pricing_immutability
BEFORE INSERT OR UPDATE OR DELETE ON "PlanPricing"
FOR EACH ROW
EXECUTE FUNCTION prevent_published_plan_child_modification();

CREATE TRIGGER enforce_plan_limit_immutability
BEFORE INSERT OR UPDATE OR DELETE ON "PlanLimit"
FOR EACH ROW
EXECUTE FUNCTION prevent_published_plan_child_modification();

CREATE TRIGGER enforce_plan_module_immutability
BEFORE INSERT OR UPDATE OR DELETE ON "PlanModule"
FOR EACH ROW
EXECUTE FUNCTION prevent_published_plan_child_modification();

CREATE TRIGGER enforce_plan_commercial_rule_immutability
BEFORE INSERT OR UPDATE OR DELETE ON "PlanCommercialRule"
FOR EACH ROW
EXECUTE FUNCTION prevent_published_plan_child_modification();
