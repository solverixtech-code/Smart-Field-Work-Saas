-- Additive M2 migration for Phase 0.3 Tenant Isolation

-- UserSession
ALTER TABLE "UserSession" ADD COLUMN IF NOT EXISTS "selectedMembershipId" TEXT;
ALTER TABLE "UserSession" ADD COLUMN IF NOT EXISTS "contextVersion" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "UserSession" ADD COLUMN IF NOT EXISTS "selectedMembershipAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "UserSession_selectedMembershipId_idx" ON "UserSession"("selectedMembershipId");
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_selectedMembershipId_fkey" FOREIGN KEY ("selectedMembershipId") REFERENCES "TenantMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Team
ALTER TABLE "Team" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "Team_tenantId_idx" ON "Team"("tenantId");
ALTER TABLE "Team" ADD CONSTRAINT "Team_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Shift
ALTER TABLE "Shift" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "Shift_tenantId_idx" ON "Shift"("tenantId");
CREATE INDEX IF NOT EXISTS "Shift_tenantId_isActive_idx" ON "Shift"("tenantId", "isActive");
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- UserShift
ALTER TABLE "UserShift" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "UserShift" ADD COLUMN IF NOT EXISTS "tenantMembershipId" TEXT;
CREATE INDEX IF NOT EXISTS "UserShift_tenantId_idx" ON "UserShift"("tenantId");
CREATE INDEX IF NOT EXISTS "UserShift_tenantMembershipId_idx" ON "UserShift"("tenantMembershipId");
ALTER TABLE "UserShift" ADD CONSTRAINT "UserShift_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserShift" ADD CONSTRAINT "UserShift_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Attendance
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS "tenantMembershipId" TEXT;
CREATE INDEX IF NOT EXISTS "Attendance_tenantId_idx" ON "Attendance"("tenantId");
CREATE INDEX IF NOT EXISTS "Attendance_tenantMembershipId_idx" ON "Attendance"("tenantMembershipId");
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PunchLog
ALTER TABLE "PunchLog" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "PunchLog" ADD COLUMN IF NOT EXISTS "tenantMembershipId" TEXT;
CREATE INDEX IF NOT EXISTS "PunchLog_tenantId_idx" ON "PunchLog"("tenantId");
CREATE INDEX IF NOT EXISTS "PunchLog_tenantMembershipId_idx" ON "PunchLog"("tenantMembershipId");
ALTER TABLE "PunchLog" ADD CONSTRAINT "PunchLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PunchLog" ADD CONSTRAINT "PunchLog_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SalaryStructure
ALTER TABLE "SalaryStructure" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "SalaryStructure" ADD COLUMN IF NOT EXISTS "tenantMembershipId" TEXT;
CREATE INDEX IF NOT EXISTS "SalaryStructure_tenantId_idx" ON "SalaryStructure"("tenantId");
CREATE INDEX IF NOT EXISTS "SalaryStructure_tenantMembershipId_idx" ON "SalaryStructure"("tenantMembershipId");
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PayrollPeriod
ALTER TABLE "PayrollPeriod" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
CREATE INDEX IF NOT EXISTS "PayrollPeriod_tenantId_idx" ON "PayrollPeriod"("tenantId");
ALTER TABLE "PayrollPeriod" ADD CONSTRAINT "PayrollPeriod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Payslip
ALTER TABLE "Payslip" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "Payslip" ADD COLUMN IF NOT EXISTS "tenantMembershipId" TEXT;
CREATE INDEX IF NOT EXISTS "Payslip_tenantId_idx" ON "Payslip"("tenantId");
CREATE INDEX IF NOT EXISTS "Payslip_tenantMembershipId_idx" ON "Payslip"("tenantMembershipId");
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AuditLog
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "tenantId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "tenantMembershipId" TEXT;
CREATE INDEX IF NOT EXISTS "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");
CREATE INDEX IF NOT EXISTS "AuditLog_tenantMembershipId_idx" ON "AuditLog"("tenantMembershipId");
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
