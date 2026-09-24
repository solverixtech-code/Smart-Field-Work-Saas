CREATE TABLE "SalesTarget" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "teamId" TEXT,
  "membershipId" TEXT,
  "createdByMembershipId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "targetValue" DECIMAL(14,2) NOT NULL,
  "thresholdPct" DECIMAL(5,2) NOT NULL DEFAULT 80,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesTarget_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SalesTarget_scope_check" CHECK (("teamId" IS NOT NULL) <> ("membershipId" IS NOT NULL)),
  CONSTRAINT "SalesTarget_period_check" CHECK ("period" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  CONSTRAINT "SalesTarget_metric_check" CHECK ("metric" IN ('sales_amount', 'demos_count', 'visits_count', 'collections_amount')),
  CONSTRAINT "SalesTarget_value_check" CHECK ("targetValue" > 0 AND "thresholdPct" >= 0 AND "thresholdPct" <= 100)
);

CREATE UNIQUE INDEX "SalesTarget_tenantId_teamId_period_metric_key"
  ON "SalesTarget"("tenantId", "teamId", "period", "metric");
CREATE UNIQUE INDEX "SalesTarget_tenantId_membershipId_period_metric_key"
  ON "SalesTarget"("tenantId", "membershipId", "period", "metric");
CREATE INDEX "SalesTarget_tenantId_period_metric_idx" ON "SalesTarget"("tenantId", "period", "metric");
CREATE INDEX "SalesTarget_teamId_idx" ON "SalesTarget"("teamId");
CREATE INDEX "SalesTarget_membershipId_idx" ON "SalesTarget"("membershipId");

ALTER TABLE "SalesTarget" ADD CONSTRAINT "SalesTarget_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "SalesTarget" ADD CONSTRAINT "SalesTarget_teamId_fkey"
  FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "SalesTarget" ADD CONSTRAINT "SalesTarget_membershipId_tenantId_fkey"
  FOREIGN KEY ("membershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "SalesTarget" ADD CONSTRAINT "SalesTarget_createdByMembershipId_tenantId_fkey"
  FOREIGN KEY ("createdByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;
