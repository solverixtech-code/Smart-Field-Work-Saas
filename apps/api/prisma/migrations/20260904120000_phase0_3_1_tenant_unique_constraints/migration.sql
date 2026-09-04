-- Forward migration 20260904120000_phase0_3_1_tenant_unique_constraints

-- Shift
DROP INDEX IF EXISTS "Shift_code_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Shift_tenantId_code_key" ON "Shift"("tenantId", "code");

-- Attendance
DROP INDEX IF EXISTS "Attendance_userId_date_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Attendance_tenantId_tenantMembershipId_date_key" ON "Attendance"("tenantId", "tenantMembershipId", "date");

-- SalaryStructure
DROP INDEX IF EXISTS "SalaryStructure_userId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "SalaryStructure_tenantId_tenantMembershipId_key" ON "SalaryStructure"("tenantId", "tenantMembershipId");

-- PayrollPeriod
DROP INDEX IF EXISTS "PayrollPeriod_month_year_key";
CREATE UNIQUE INDEX IF NOT EXISTS "PayrollPeriod_tenantId_month_year_key" ON "PayrollPeriod"("tenantId", "month", "year");

-- Payslip
DROP INDEX IF EXISTS "Payslip_userId_payrollPeriodId_key";
CREATE UNIQUE INDEX IF NOT EXISTS "Payslip_tenantMembershipId_payrollPeriodId_key" ON "Payslip"("tenantMembershipId", "payrollPeriodId");
