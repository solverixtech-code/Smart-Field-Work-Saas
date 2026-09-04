-- Forward migration to fix FK deletion policies matching schema.prisma

-- Team
ALTER TABLE "Team" DROP CONSTRAINT IF EXISTS "Team_tenantId_fkey";
ALTER TABLE "Team" ADD CONSTRAINT "Team_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Shift
ALTER TABLE "Shift" DROP CONSTRAINT IF EXISTS "Shift_tenantId_fkey";
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- UserShift
ALTER TABLE "UserShift" DROP CONSTRAINT IF EXISTS "UserShift_tenantId_fkey";
ALTER TABLE "UserShift" DROP CONSTRAINT IF EXISTS "UserShift_tenantMembershipId_fkey";
ALTER TABLE "UserShift" ADD CONSTRAINT "UserShift_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "UserShift" ADD CONSTRAINT "UserShift_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Attendance
ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_tenantId_fkey";
ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_tenantMembershipId_fkey";
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- PunchLog
ALTER TABLE "PunchLog" DROP CONSTRAINT IF EXISTS "PunchLog_tenantId_fkey";
ALTER TABLE "PunchLog" DROP CONSTRAINT IF EXISTS "PunchLog_tenantMembershipId_fkey";
ALTER TABLE "PunchLog" ADD CONSTRAINT "PunchLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PunchLog" ADD CONSTRAINT "PunchLog_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- SalaryStructure
ALTER TABLE "SalaryStructure" DROP CONSTRAINT IF EXISTS "SalaryStructure_tenantId_fkey";
ALTER TABLE "SalaryStructure" DROP CONSTRAINT IF EXISTS "SalaryStructure_tenantMembershipId_fkey";
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- PayrollPeriod
ALTER TABLE "PayrollPeriod" DROP CONSTRAINT IF EXISTS "PayrollPeriod_tenantId_fkey";
ALTER TABLE "PayrollPeriod" ADD CONSTRAINT "PayrollPeriod_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Payslip
ALTER TABLE "Payslip" DROP CONSTRAINT IF EXISTS "Payslip_tenantId_fkey";
ALTER TABLE "Payslip" DROP CONSTRAINT IF EXISTS "Payslip_tenantMembershipId_fkey";
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Payslip" ADD CONSTRAINT "Payslip_tenantMembershipId_fkey" FOREIGN KEY ("tenantMembershipId") REFERENCES "TenantMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
