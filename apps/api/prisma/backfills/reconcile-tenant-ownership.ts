import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('======================================================================');
  console.log('          TENANT OWNERSHIP RECONCILIATION REPORT (M3)');
  console.log('======================================================================\n');

  const [
    usersCount,
    teamsCount,
    shiftsCount,
    userShiftsCount,
    attendancesCount,
    punchLogsCount,
    salaryStructuresCount,
    payrollPeriodsCount,
    payslipsCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.team.count(),
    prisma.shift.count(),
    prisma.userShift.count(),
    prisma.attendance.count(),
    prisma.punchLog.count(),
    prisma.salaryStructure.count(),
    prisma.payrollPeriod.count(),
    prisma.payslip.count(),
  ]);

  const [
    scopedTeams,
    scopedShifts,
    scopedUserShifts,
    scopedAttendances,
    scopedPunchLogs,
    scopedSalaryStructures,
    scopedPayrollPeriods,
    scopedPayslips,
  ] = await Promise.all([
    prisma.team.count({ where: { tenantId: { not: null } } }),
    prisma.shift.count({ where: { tenantId: { not: null } } }),
    prisma.userShift.count({ where: { tenantId: { not: null } } }),
    prisma.attendance.count({ where: { tenantId: { not: null } } }),
    prisma.punchLog.count({ where: { tenantId: { not: null } } }),
    prisma.salaryStructure.count({ where: { tenantId: { not: null } } }),
    prisma.payrollPeriod.count({ where: { tenantId: { not: null } } }),
    prisma.payslip.count({ where: { tenantId: { not: null } } }),
  ]);

  const report = [
    { Model: 'Users', Total: usersCount, TenantScoped: 'N/A (Global User identity)', Unscoped: 0 },
    { Model: 'Teams', Total: teamsCount, TenantScoped: scopedTeams, Unscoped: teamsCount - scopedTeams },
    { Model: 'Shifts', Total: shiftsCount, TenantScoped: scopedShifts, Unscoped: shiftsCount - scopedShifts },
    { Model: 'UserShifts', Total: userShiftsCount, TenantScoped: scopedUserShifts, Unscoped: userShiftsCount - scopedUserShifts },
    { Model: 'Attendance', Total: attendancesCount, TenantScoped: scopedAttendances, Unscoped: attendancesCount - scopedAttendances },
    { Model: 'PunchLogs', Total: punchLogsCount, TenantScoped: scopedPunchLogs, Unscoped: punchLogsCount - scopedPunchLogs },
    { Model: 'SalaryStructures', Total: salaryStructuresCount, TenantScoped: scopedSalaryStructures, Unscoped: salaryStructuresCount - scopedSalaryStructures },
    { Model: 'PayrollPeriods', Total: payrollPeriodsCount, TenantScoped: scopedPayrollPeriods, Unscoped: payrollPeriodsCount - scopedPayrollPeriods },
    { Model: 'Payslips', Total: payslipsCount, TenantScoped: scopedPayslips, Unscoped: scopedPayslips, Unscoped: payslipsCount - scopedPayslips },
  ];

  console.table(report);

  console.log('\n[Summary Status]:');
  console.log(`- Total Scanned Records: ${usersCount + teamsCount + shiftsCount + userShiftsCount + attendancesCount + punchLogsCount + salaryStructuresCount + payrollPeriodsCount + payslipsCount}`);
  console.log(`- Non-mutating diagnostic audit completed successfully.`);
  console.log('======================================================================\n');
}

main()
  .catch((e) => {
    console.error('Reconciliation report failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
