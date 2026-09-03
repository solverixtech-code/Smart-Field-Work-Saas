import { Controller, Post, Get, Body, Query, Headers, BadRequestException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MobilePunchSwaggerDto } from './dto/attendance.dto';

@ApiTags('Attendance & Punch Logs')
@ApiBearerAuth('OAuth2PasswordBearer')
@ApiBearerAuth('JWT-auth')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('punch-in')
  @ApiOperation({
    summary: 'Mobile GPS Punch In',
    description: 'Clock in employee attendance with GPS location, selfie photo URL, and device ID.',
  })
  @ApiHeader({ name: 'x-device-id', required: false, description: 'Device hardware ID header' })
  @ApiBody({ type: MobilePunchSwaggerDto })
  @ApiResponse({ status: 201, description: 'Punched in successfully' })
  async punchIn(
    @Body() dto: MobilePunchSwaggerDto,
    @Headers('x-device-id') headerDeviceId?: string,
  ) {
    if (!dto.userId) {
      throw new BadRequestException('userId is required for punch-in');
    }
    const deviceId = dto.deviceId ?? headerDeviceId;
    return this.attendanceService.punchIn(dto.userId, { ...dto, deviceId });
  }

  @Post('punch-out')
  @ApiOperation({
    summary: 'Mobile GPS Punch Out',
    description: 'Clock out employee attendance with GPS location, calculate total work duration & overtime.',
  })
  @ApiHeader({ name: 'x-device-id', required: false, description: 'Device hardware ID header' })
  @ApiBody({ type: MobilePunchSwaggerDto })
  @ApiResponse({ status: 201, description: 'Punched out successfully' })
  async punchOut(
    @Body() dto: MobilePunchSwaggerDto,
    @Headers('x-device-id') headerDeviceId?: string,
  ) {
    if (!dto.userId) {
      throw new BadRequestException('userId is required for punch-out');
    }
    const deviceId = dto.deviceId ?? headerDeviceId;
    return this.attendanceService.punchOut(dto.userId, { ...dto, deviceId });
  }

  @Get('admin/today')
  @ApiOperation({
    summary: 'Get Today Attendance Log (Admin)',
    description: 'Fetch real-time punch logs and attendance status for all employees today.',
  })
  @ApiResponse({ status: 200, description: 'Today attendance logs returned' })
  async getTodayAttendanceAdmin() {
    return this.attendanceService.getTodayAttendanceAdmin();
  }

  @Get('admin/monthly')
  @ApiOperation({
    summary: 'Get Monthly Attendance Muster Roll (Admin)',
    description: 'Fetch monthly attendance records for HR muster roll calculation.',
  })
  @ApiQuery({ name: 'month', required: false, description: 'Month number (1-12)', example: 9 })
  @ApiQuery({ name: 'year', required: false, description: 'Year', example: 2026 })
  @ApiResponse({ status: 200, description: 'Monthly attendance array returned' })
  async getMonthlyAttendanceAdmin(
    @Query('month') monthStr?: string,
    @Query('year') yearStr?: string,
  ) {
    const month = monthStr ? parseInt(monthStr, 10) : new Date().getMonth() + 1;
    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
    return this.attendanceService.getMonthlyAttendanceAdmin(month, year);
  }
}
