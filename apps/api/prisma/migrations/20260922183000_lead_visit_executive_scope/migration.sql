CREATE INDEX IF NOT EXISTS "LeadVisit_tenantId_executiveMembershipId_checkInTime_idx"
ON "LeadVisit"("tenantId", "executiveMembershipId", "checkInTime");
