CREATE TABLE "IncentiveRule" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "createdByMembershipId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "ruleType" TEXT NOT NULL,
  "appliesTo" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "payoutRate" DECIMAL(14,2) NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "revision" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IncentiveRule_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "IncentiveRule_dates_check" CHECK ("endDate" >= "startDate"),
  CONSTRAINT "IncentiveRule_rate_check" CHECK ("payoutRate" >= 0),
  CONSTRAINT "IncentiveRule_status_check" CHECK ("status" IN ('ACTIVE', 'PAUSED', 'INACTIVE'))
);

CREATE TABLE "IncentiveCalculation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "membershipId" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "salesIncentive" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "demoIncentive" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "visitIncentive" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "bonusIncentive" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "totalIncentive" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "approvedAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
  "ruleSnapshot" JSONB NOT NULL,
  "metricSnapshot" JSONB NOT NULL,
  "approvedByMembershipId" TEXT,
  "approvedAt" TIMESTAMP(3),
  "revision" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IncentiveCalculation_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "IncentiveCalculation_period_check" CHECK ("period" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  CONSTRAINT "IncentiveCalculation_status_check" CHECK ("status" IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'PAID'))
);

CREATE TABLE "IncentivePayout" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "calculationId" TEXT NOT NULL,
  "membershipId" TEXT NOT NULL,
  "payoutCode" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "paymentMode" TEXT NOT NULL DEFAULT 'Bank Transfer',
  "accountReference" TEXT,
  "transactionReference" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PROCESSING',
  "payoutDate" TIMESTAMP(3),
  "updatedByMembershipId" TEXT NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IncentivePayout_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "IncentivePayout_amount_check" CHECK ("amount" >= 0),
  CONSTRAINT "IncentivePayout_status_check" CHECK ("status" IN ('PROCESSING', 'PAID', 'FAILED'))
);

CREATE INDEX "IncentiveRule_tenantId_status_startDate_endDate_idx" ON "IncentiveRule"("tenantId", "status", "startDate", "endDate");
CREATE UNIQUE INDEX "IncentiveCalculation_tenantId_membershipId_period_key" ON "IncentiveCalculation"("tenantId", "membershipId", "period");
CREATE INDEX "IncentiveCalculation_tenantId_period_status_idx" ON "IncentiveCalculation"("tenantId", "period", "status");
CREATE INDEX "IncentiveCalculation_membershipId_idx" ON "IncentiveCalculation"("membershipId");
CREATE UNIQUE INDEX "IncentivePayout_calculationId_key" ON "IncentivePayout"("calculationId");
CREATE UNIQUE INDEX "IncentivePayout_tenantId_payoutCode_key" ON "IncentivePayout"("tenantId", "payoutCode");
CREATE INDEX "IncentivePayout_tenantId_status_createdAt_idx" ON "IncentivePayout"("tenantId", "status", "createdAt");
CREATE INDEX "IncentivePayout_membershipId_idx" ON "IncentivePayout"("membershipId");

ALTER TABLE "IncentiveRule" ADD CONSTRAINT "IncentiveRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "IncentiveRule" ADD CONSTRAINT "IncentiveRule_createdByMembershipId_tenantId_fkey" FOREIGN KEY ("createdByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "IncentiveCalculation" ADD CONSTRAINT "IncentiveCalculation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "IncentiveCalculation" ADD CONSTRAINT "IncentiveCalculation_membershipId_tenantId_fkey" FOREIGN KEY ("membershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "IncentiveCalculation" ADD CONSTRAINT "IncentiveCalculation_approvedByMembershipId_tenantId_fkey" FOREIGN KEY ("approvedByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "IncentivePayout" ADD CONSTRAINT "IncentivePayout_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "IncentivePayout" ADD CONSTRAINT "IncentivePayout_calculationId_fkey" FOREIGN KEY ("calculationId") REFERENCES "IncentiveCalculation"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "IncentivePayout" ADD CONSTRAINT "IncentivePayout_membershipId_tenantId_fkey" FOREIGN KEY ("membershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE CASCADE ON UPDATE RESTRICT;
ALTER TABLE "IncentivePayout" ADD CONSTRAINT "IncentivePayout_updatedByMembershipId_tenantId_fkey" FOREIGN KEY ("updatedByMembershipId", "tenantId") REFERENCES "TenantMembership"("id", "tenantId") ON DELETE RESTRICT ON UPDATE RESTRICT;
