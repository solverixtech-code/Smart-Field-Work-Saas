import { Controller, Post, Get, Body, Query, Headers, BadRequestException } from '@nestjs/common';
import { AttendanceService, MobilePunchDto } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('punch-in')
  async punchIn(
    @Body() dto: MobilePunchDto & { userId: string },
    @Headers('x-device-id') headerDeviceId?: string,
  ) {
    if (!dto.userId) {
      throw new BadRequestException('userId is required for punch-in');
    }
    const deviceId = dto.deviceId ?? headerDeviceId;
    return this.attendanceService.punchIn(dto.userId, { ...dto, deviceId });
  }

  @Post('punch-out')
  async punchOut(
    @Body() dto: MobilePunchDto & { userId: string },
    @Headers('x-device-id') headerDeviceId?: string,
  ) {
    if (!dto.userId) {
      throw new BadRequestException('userId is required for punch-out');
    }
    const deviceId = dto.deviceId ?? headerDeviceId;
    return this.attendanceService.punchOut(dto.userId, { ...dto, deviceId });
  }

  @Get('admin/today')
  async getTodayAttendanceAdmin() {
    return this.attendanceService.getTodayAttendanceAdmin();
  }

  @Get('admin/monthly')
  async getMonthlyAttendanceAdmin(
    @Query('month') monthStr?: string,
    @Query('year') yearStr?: string,
  ) {
    const month = monthStr ? parseInt(monthStr, 10) : new Date().getMonth() + 1;
    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
    return this.attendanceService.getMonthlyAttendanceAdmin(month, year);
  }
}
