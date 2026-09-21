import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { RequestPrincipalGuard } from "../common/guards/request-principal.guard";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { NotificationSettingsService } from "./notification-settings.service";

@Controller("platform/notifications/settings")
@UseGuards(JwtAuthGuard, RequestPrincipalGuard, PermissionsGuard)
export class PlatformNotificationSettingsController {
  constructor(private readonly settings: NotificationSettingsService) {}

  @Get()
  @RequirePermissions("platform.notifications.settings.view")
  get() {
    return this.settings.get();
  }

  @Patch()
  @RequirePermissions("platform.notifications.settings.manage")
  update(@CurrentPrincipal() actor: RequestPrincipal, @Body() body: unknown) {
    return this.settings.update(actor.userId, body);
  }
}
