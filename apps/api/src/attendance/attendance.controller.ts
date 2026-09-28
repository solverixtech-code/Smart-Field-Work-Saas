import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { TenantAuthorized } from "../common/decorators/tenant-authorized.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { TenantScopeFactory } from "../common/tenancy/tenant-scope";
import { MobilePunchSwaggerDto } from "./dto/attendance.dto";
import { AttendanceService } from "./attendance.service";

@ApiTags("Attendance & Punch Logs")
@ApiBearerAuth("OAuth2PasswordBearer")
@ApiBearerAuth("JWT-auth")
@Controller("attendance")
@TenantAuthorized()
export class AttendanceController {
  constructor(private readonly attendance: AttendanceService) {}

  @Post("punch-in")
  @RequirePermissions("attendance.self.punch")
  punchIn(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() dto: MobilePunchSwaggerDto,
    @Headers("x-device-id") headerDeviceId?: string,
  ) {
    return this.attendance.punchIn(
      TenantScopeFactory.fromPrincipal(principal),
      {
        ...dto,
        deviceId: dto.deviceId ?? headerDeviceId,
      },
    );
  }

  @Post("punch-out")
  @RequirePermissions("attendance.self.punch")
  punchOut(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() dto: MobilePunchSwaggerDto,
    @Headers("x-device-id") headerDeviceId?: string,
  ) {
    return this.attendance.punchOut(
      TenantScopeFactory.fromPrincipal(principal),
      {
        ...dto,
        deviceId: dto.deviceId ?? headerDeviceId,
      },
    );
  }

  @Get("me/context")
  @RequirePermissions("attendance.self.punch")
  context(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Query("installationId") installationId?: string,
  ) {
    return this.attendance.selfContext(principal, installationId);
  }

  @Post("me/devices/enroll")
  @RequirePermissions("attendance.self.punch")
  enrollDevice(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() body: unknown,
  ) {
    return this.attendance.enrollDevice(principal, body);
  }

  @Post("me/selfies/upload-intent")
  @RequirePermissions("attendance.self.punch")
  selfieIntent(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() body: unknown,
  ) {
    return this.attendance.selfieIntent(principal, body);
  }

  @Post("me/selfies/:id/complete")
  @RequirePermissions("attendance.self.punch")
  selfieComplete(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.attendance.selfieComplete(principal, id, body);
  }

  @Post("me/punch-in")
  @RequirePermissions("attendance.self.punch")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  mobilePunchIn(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() body: unknown,
  ) {
    return this.attendance.mobilePunch(principal, "PUNCH_IN", body);
  }

  @Post("me/punch-out")
  @RequirePermissions("attendance.self.punch")
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  mobilePunchOut(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() body: unknown,
  ) {
    return this.attendance.mobilePunch(principal, "PUNCH_OUT", body);
  }

  @Get("admin/today")
  @RequirePermissions("attendance.monitoring.view")
  today(@CurrentPrincipal() principal: RequestPrincipal) {
    return this.attendance.getTodayAttendanceAdmin(
      TenantScopeFactory.fromPrincipal(principal),
    );
  }

  @Get("admin/monthly")
  @RequirePermissions("attendance.monitoring.view")
  monthly(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Query("month") monthValue?: string,
    @Query("year") yearValue?: string,
  ) {
    const month = monthValue
      ? Number.parseInt(monthValue, 10)
      : new Date().getMonth() + 1;
    const year = yearValue
      ? Number.parseInt(yearValue, 10)
      : new Date().getFullYear();
    return this.attendance.getMonthlyAttendanceAdmin(
      TenantScopeFactory.fromPrincipal(principal),
      month,
      year,
    );
  }

  @Get("admin/monitoring")
  @RequirePermissions("attendance.monitoring.view")
  monitoring(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Query() query: Record<string, string>,
  ) {
    return this.attendance.monitoring(
      TenantScopeFactory.fromPrincipal(principal),
      query,
    );
  }

  @Get("admin/punches/:id/selfie-preview")
  @RequirePermissions("attendance.monitoring.view")
  selfiePreview(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param("id") id: string,
  ) {
    return this.attendance.selfiePreview(principal, id);
  }

  @Get("admin/sites")
  @RequirePermissions("attendance.settings.manage")
  sites(@CurrentPrincipal() principal: RequestPrincipal) {
    return this.attendance.listSites(
      TenantScopeFactory.fromPrincipal(principal),
    );
  }

  @Post("admin/sites")
  @RequirePermissions("attendance.settings.manage")
  createSite(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() body: unknown,
  ) {
    return this.attendance.createSite(
      TenantScopeFactory.fromPrincipal(principal),
      body,
    );
  }

  @Put("admin/sites/:id")
  @RequirePermissions("attendance.settings.manage")
  updateSite(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.attendance.updateSite(
      TenantScopeFactory.fromPrincipal(principal),
      id,
      body,
    );
  }

  @Delete("admin/sites/:id")
  @RequirePermissions("attendance.settings.manage")
  deleteSite(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param("id") id: string,
  ) {
    return this.attendance.deleteSite(
      TenantScopeFactory.fromPrincipal(principal),
      id,
    );
  }

  @Get("admin/policy")
  @RequirePermissions("attendance.settings.manage")
  policy(@CurrentPrincipal() principal: RequestPrincipal) {
    return this.attendance.getPolicy(
      TenantScopeFactory.fromPrincipal(principal),
    );
  }

  @Put("admin/policy")
  @RequirePermissions("attendance.settings.manage")
  updatePolicy(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() body: unknown,
  ) {
    return this.attendance.updatePolicy(
      TenantScopeFactory.fromPrincipal(principal),
      body,
    );
  }

  @Put("admin/memberships/:membershipId/override")
  @RequirePermissions("attendance.settings.manage")
  setOverride(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param("membershipId") membershipId: string,
    @Body() body: unknown,
  ) {
    return this.attendance.setOverride(
      TenantScopeFactory.fromPrincipal(principal),
      membershipId,
      body,
    );
  }

  @Get("admin/membership-overrides")
  @RequirePermissions("attendance.settings.manage")
  overrides(@CurrentPrincipal() principal: RequestPrincipal) {
    return this.attendance.listOverrides(
      TenantScopeFactory.fromPrincipal(principal),
    );
  }

  @Delete("admin/memberships/:membershipId/override")
  @RequirePermissions("attendance.settings.manage")
  deleteOverride(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param("membershipId") membershipId: string,
  ) {
    return this.attendance.deleteOverride(
      TenantScopeFactory.fromPrincipal(principal),
      membershipId,
    );
  }

  @Post("admin/holidays")
  @RequirePermissions("attendance.settings.manage")
  createHoliday(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() body: unknown,
  ) {
    return this.attendance.createHoliday(
      TenantScopeFactory.fromPrincipal(principal),
      body,
    );
  }

  @Get("admin/holidays")
  @RequirePermissions("attendance.settings.manage")
  holidays(@CurrentPrincipal() principal: RequestPrincipal) {
    return this.attendance.listHolidays(
      TenantScopeFactory.fromPrincipal(principal),
    );
  }

  @Delete("admin/holidays/:id")
  @RequirePermissions("attendance.settings.manage")
  deleteHoliday(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param("id") id: string,
  ) {
    return this.attendance.deleteHoliday(
      TenantScopeFactory.fromPrincipal(principal),
      id,
    );
  }

  @Post("admin/leaves")
  @RequirePermissions("attendance.settings.manage")
  createLeave(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() body: unknown,
  ) {
    return this.attendance.createLeave(
      TenantScopeFactory.fromPrincipal(principal),
      body,
    );
  }

  @Get("admin/leaves")
  @RequirePermissions("attendance.settings.manage")
  leaves(@CurrentPrincipal() principal: RequestPrincipal) {
    return this.attendance.listLeaves(
      TenantScopeFactory.fromPrincipal(principal),
    );
  }

  @Put("admin/leaves/:id")
  @RequirePermissions("attendance.settings.manage")
  updateLeave(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.attendance.updateLeave(
      TenantScopeFactory.fromPrincipal(principal),
      id,
      body,
    );
  }

  @Delete("admin/leaves/:id")
  @RequirePermissions("attendance.settings.manage")
  deleteLeave(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param("id") id: string,
  ) {
    return this.attendance.deleteLeave(
      TenantScopeFactory.fromPrincipal(principal),
      id,
    );
  }

  @Get("admin/devices")
  @RequirePermissions("attendance.devices.manage")
  devices(@CurrentPrincipal() principal: RequestPrincipal) {
    return this.attendance.listDevices(
      TenantScopeFactory.fromPrincipal(principal),
    );
  }

  @Get("admin/exceptions")
  @RequirePermissions("attendance.exceptions.manage")
  exceptions(@CurrentPrincipal() principal: RequestPrincipal) {
    return this.attendance.listExceptions(
      TenantScopeFactory.fromPrincipal(principal),
    );
  }

  @Patch("admin/exceptions/:id/review")
  @RequirePermissions("attendance.exceptions.manage")
  reviewException(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param("id") id: string,
  ) {
    return this.attendance.reviewException(
      TenantScopeFactory.fromPrincipal(principal),
      id,
    );
  }

  @Patch("admin/devices/:id/status")
  @RequirePermissions("attendance.devices.manage")
  setDeviceStatus(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.attendance.setDeviceStatus(
      TenantScopeFactory.fromPrincipal(principal),
      id,
      body,
    );
  }
}
