ALTER TABLE "LeadVisit" ALTER COLUMN "leadId" DROP NOT NULL;

ALTER TABLE "LeadVisit"
  ADD COLUMN IF NOT EXISTS "accountId" TEXT,
  ADD COLUMN IF NOT EXISTS "targetType" TEXT NOT NULL DEFAULT 'LEAD',
  ADD COLUMN IF NOT EXISTS "targetName" TEXT,
  ADD COLUMN IF NOT EXISTS "contactName" TEXT,
  ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "contactEmail" TEXT,
  ADD COLUMN IF NOT EXISTS "createdByMembershipId" TEXT,
  ADD COLUMN IF NOT EXISTS "scheduledEndTime" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "visitType" TEXT NOT NULL DEFAULT 'Sales Visit',
  ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS "recurrence" TEXT NOT NULL DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS "routeArea" TEXT,
  ADD COLUMN IF NOT EXISTS "travelMode" TEXT,
  ADD COLUMN IF NOT EXISTS "geofenceRadiusMeters" INTEGER NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS "allowManualCheckIn" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "instructions" TEXT,
  ADD COLUMN IF NOT EXISTS "checklist" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "LeadVisit" visit
SET
  "targetName" = COALESCE(visit."targetName", lead."businessName", lead."name", 'Lead visit'),
  "createdByMembershipId" = COALESCE(visit."createdByMembershipId", visit."executiveMembershipId")
FROM "Lead" lead
WHERE lead.id = visit."leadId" AND lead."tenantId" = visit."tenantId";

UPDATE "LeadVisit"
SET
  "targetName" = COALESCE("targetName", 'Field visit'),
  "createdByMembershipId" = COALESCE("createdByMembershipId", "executiveMembershipId");

ALTER TABLE "LeadVisit"
  ALTER COLUMN "targetName" SET NOT NULL,
  ALTER COLUMN "createdByMembershipId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeadVisit_accountId_tenantId_fkey') THEN
    ALTER TABLE "LeadVisit" ADD CONSTRAINT "LeadVisit_accountId_tenantId_fkey"
      FOREIGN KEY ("accountId", "tenantId") REFERENCES "Account"("id", "tenantId")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeadVisit_createdByMembershipId_tenantId_fkey') THEN
    ALTER TABLE "LeadVisit" ADD CONSTRAINT "LeadVisit_createdByMembershipId_tenantId_fkey"
      FOREIGN KEY ("createdByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'LeadVisit_target_shape') THEN
    ALTER TABLE "LeadVisit" ADD CONSTRAINT "LeadVisit_target_shape" CHECK (
      ("targetType" = 'LEAD' AND "leadId" IS NOT NULL AND "accountId" IS NULL) OR
      ("targetType" = 'ACCOUNT' AND "accountId" IS NOT NULL AND "leadId" IS NULL) OR
      ("targetType" = 'QUICK_ADDRESS' AND "leadId" IS NULL AND "accountId" IS NULL)
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "LeadVisit_tenantId_accountId_createdAt_idx"
  ON "LeadVisit"("tenantId", "accountId", "createdAt");
