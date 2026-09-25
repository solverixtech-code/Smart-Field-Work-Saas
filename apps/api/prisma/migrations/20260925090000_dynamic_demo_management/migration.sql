ALTER TABLE "LeadDemo"
  ADD COLUMN "demoCode" TEXT,
  ADD COLUMN "demoTime" TEXT NOT NULL DEFAULT '11:00 AM',
  ADD COLUMN "demoType" TEXT NOT NULL DEFAULT 'Product Demo',
  ADD COLUMN "productService" TEXT,
  ADD COLUMN "outcome" TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "nextAction" TEXT,
  ADD COLUMN "nextActionDate" TEXT,
  ADD COLUMN "durationMinutes" INTEGER,
  ADD COLUMN "probabilityPercentage" INTEGER,
  ADD COLUMN "startedAt" TIMESTAMP(3),
  ADD COLUMN "completedAt" TIMESTAMP(3),
  ADD COLUMN "cancelledAt" TIMESTAMP(3);

WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "tenantId" ORDER BY "createdAt", "id") AS sequence
  FROM "LeadDemo"
)
UPDATE "LeadDemo" AS demo
SET "demoCode" = 'DEM-' || LPAD(ranked.sequence::TEXT, 4, '0')
FROM ranked
WHERE demo."id" = ranked."id";

ALTER TABLE "LeadDemo" ALTER COLUMN "demoCode" SET NOT NULL;

CREATE UNIQUE INDEX "LeadDemo_tenantId_demoCode_key" ON "LeadDemo"("tenantId", "demoCode");
CREATE INDEX "LeadDemo_tenantId_status_demoDate_idx" ON "LeadDemo"("tenantId", "status", "demoDate");
CREATE INDEX "LeadDemo_tenantId_conductedByMembershipId_demoDate_idx" ON "LeadDemo"("tenantId", "conductedByMembershipId", "demoDate");
CREATE INDEX "LeadDemo_tenantId_leadId_createdAt_idx" ON "LeadDemo"("tenantId", "leadId", "createdAt");
