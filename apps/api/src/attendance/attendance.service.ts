import { Injectable, BadRequestException } from '@nestjs/common';
import { AttendanceRepository, PunchInputDto } from '../repositories/attendance.repository';
import { TenantScope } from '../common/tenancy/tenant-scope';

@Injectable()
export class AttendanceService {
  constructor(private readonly attendanceRepository: AttendanceRepository) {}

  async punchIn(scope: TenantScope, dto: PunchInputDto) {
    const res = await this.attendanceRepository.punchIn(scope, dto);
    return {
      message: 'Punched In successfully',
      attendance: res.attendance,
      punchLog: res.punchLog,
    };
  }

  async punchOut(scope: TenantScope, dto: PunchInputDto) {
    const res = await this.attendanceRepository.punchOut(scope, dto);
    return {
      message: 'Punched Out successfully',
      attendance: res.attendance,
      punchLog: res.punchLog,
    };
  }

  async getTodayAttendanceAdmin(scope: TenantScope) {
    return this.attendanceRepository.getTodayAttendance(scope);
  }

  async getMonthlyAttendanceAdmin(scope: TenantScope, month: number, year: number) {
    return this.attendanceRepository.getMonthlyAttendance(scope, month, year);
  }
}
