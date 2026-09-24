ALTER TABLE "PlatformNotificationSettings"
ADD COLUMN "followUpCompletedPush" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "LeadFollowUp"
ADD COLUMN "completionNote" TEXT,
ADD COLUMN "completedByMembershipId" TEXT;

CREATE INDEX "LeadFollowUp_tenantId_completedByMembershipId_idx"
ON "LeadFollowUp"("tenantId", "completedByMembershipId");

ALTER TABLE "LeadFollowUp"
ADD CONSTRAINT "LeadFollowUp_completedByMembershipId_tenantId_fkey"
FOREIGN KEY ("completedByMembershipId", "tenantId")
REFERENCES "TenantMembership"("id", "tenantId")
ON DELETE RESTRICT ON UPDATE RESTRICT;
