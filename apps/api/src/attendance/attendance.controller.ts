import { Controller, Post, Get, Body, Query, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiHeader } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { TenantAuthenticated } from '../common/decorators/tenant-authenticated.decorator';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { TenantScopeFactory } from '../common/tenancy/tenant-scope';
import { MobilePunchSwaggerDto } from './dto/attendance.dto';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';

@ApiTags('Attendance & Punch Logs')
@ApiBearerAuth('OAuth2PasswordBearer')
@ApiBearerAuth('JWT-auth')
@Controller('attendance')
@TenantAuthenticated()
@UseGuards(PermissionsGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('punch-in')
  @RequirePermissions('attendance.self.punch')
  @ApiOperation({
    summary: 'Mobile GPS Punch In',
    description: 'Clock in employee attendance with GPS location, selfie photo URL, and device ID.',
  })
  @ApiHeader({ name: 'x-device-id', required: false, description: 'Device hardware ID header' })
  @ApiBody({ type: MobilePunchSwaggerDto })
  @ApiResponse({ status: 201, description: 'Punched in successfully' })
  async punchIn(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() dto: MobilePunchSwaggerDto,
    @Headers('x-device-id') headerDeviceId?: string,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    const deviceId = dto.deviceId ?? headerDeviceId;
    return this.attendanceService.punchIn(scope, { ...dto, deviceId });
  }

  @Post('punch-out')
  @RequirePermissions('attendance.self.punch')
  @ApiOperation({
    summary: 'Mobile GPS Punch Out',
    description: 'Clock out employee attendance with GPS location, calculate total work duration & overtime.',
  })
  @ApiHeader({ name: 'x-device-id', required: false, description: 'Device hardware ID header' })
  @ApiBody({ type: MobilePunchSwaggerDto })
  @ApiResponse({ status: 201, description: 'Punched out successfully' })
  async punchOut(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() dto: MobilePunchSwaggerDto,
    @Headers('x-device-id') headerDeviceId?: string,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    const deviceId = dto.deviceId ?? headerDeviceId;
    return this.attendanceService.punchOut(scope, { ...dto, deviceId });
  }

  @Get('admin/today')
  @RequirePermissions('attendance.monitoring.view')
  @ApiOperation({
    summary: 'Get Today Attendance Log (Admin)',
    description: 'Fetch real-time punch logs and attendance status for employees in current tenant.',
  })
  @ApiResponse({ status: 200, description: 'Today attendance logs returned' })
  async getTodayAttendanceAdmin(@CurrentPrincipal() principal: RequestPrincipal) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    return this.attendanceService.getTodayAttendanceAdmin(scope);
  }

  @Get('admin/monthly')
  @RequirePermissions('attendance.monitoring.view')
  @ApiOperation({
    summary: 'Get Monthly Attendance Muster Roll (Admin)',
    description: 'Fetch monthly attendance records for current tenant.',
  })
  @ApiQuery({ name: 'month', required: false, description: 'Month number (1-12)', example: 9 })
  @ApiQuery({ name: 'year', required: false, description: 'Year', example: 2026 })
  @ApiResponse({ status: 200, description: 'Monthly attendance array returned' })
  async getMonthlyAttendanceAdmin(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Query('month') monthStr?: string,
    @Query('year') yearStr?: string,
  ) {
    const scope = TenantScopeFactory.fromPrincipal(principal);
    const month = monthStr ? parseInt(monthStr, 10) : new Date().getMonth() + 1;
    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
    return this.attendanceService.getMonthlyAttendanceAdmin(scope, month, year);
  }
}
