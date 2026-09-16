ALTER TABLE "Lead"
  ADD COLUMN "leadCode" TEXT,
  ADD COLUMN "businessName" TEXT,
  ADD COLUMN "estimatedValue" DECIMAL(14,2),
  ADD COLUMN "expectedClosingDate" TIMESTAMP(3),
  ADD COLUMN "nextFollowUpAt" TIMESTAMP(3),
  ADD COLUMN "nextActionNote" TEXT,
  ADD COLUMN "requirementNote" TEXT,
  ADD COLUMN "disqualificationReason" TEXT;

WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY "tenantId" ORDER BY "createdAt", id) AS rn
  FROM "Lead"
)
UPDATE "Lead" l
SET
  "leadCode" = 'LD-' || LPAD(numbered.rn::TEXT, 6, '0'),
  "businessName" = CASE WHEN l.kind = 'BUSINESS' THEN l.name ELSE NULL END
FROM numbered
WHERE numbered.id = l.id;

ALTER TABLE "Lead" ALTER COLUMN "leadCode" SET NOT NULL;

CREATE UNIQUE INDEX "Lead_tenantId_leadCode_key" ON "Lead"("tenantId", "leadCode");
CREATE INDEX "Lead_tenantId_nextFollowUpAt_deletedAt_idx" ON "Lead"("tenantId", "nextFollowUpAt", "deletedAt");

CREATE TABLE "LeadHistory" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "leadId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "note" TEXT,
  "actorMembershipId" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LeadHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LeadHistory_tenantId_leadId_createdAt_idx" ON "LeadHistory"("tenantId", "leadId", "createdAt");
CREATE INDEX "LeadHistory_tenantId_eventType_createdAt_idx" ON "LeadHistory"("tenantId", "eventType", "createdAt");

ALTER TABLE "LeadHistory"
  ADD CONSTRAINT "LeadHistory_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
  ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "LeadHistory"
  ADD CONSTRAINT "LeadHistory_leadId_tenantId_fkey"
  FOREIGN KEY ("leadId", "tenantId") REFERENCES "Lead"("id", "tenantId")
  ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE "LeadHistory"
  ADD CONSTRAINT "LeadHistory_actorMembershipId_tenantId_fkey"
  FOREIGN KEY ("actorMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId")
  ON DELETE RESTRICT ON UPDATE RESTRICT;
