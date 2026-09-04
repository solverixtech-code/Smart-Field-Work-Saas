import { Module, Global } from '@nestjs/common';
import { ShiftRepository } from './shift.repository';
import { AttendanceRepository } from './attendance.repository';
import { PayrollRepository } from './payroll.repository';

@Global()
@Module({
  providers: [ShiftRepository, AttendanceRepository, PayrollRepository],
  exports: [ShiftRepository, AttendanceRepository, PayrollRepository],
})
export class RepositoriesModule {}
