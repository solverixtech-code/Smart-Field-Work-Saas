import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { TenantAuthorized } from "../common/decorators/tenant-authorized.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { FieldDashboardService } from "./field-dashboard.service";

@Controller("tenant/crm/field-dashboard")
@TenantAuthorized()
export class FieldDashboardController {
  constructor(private readonly dashboard: FieldDashboardService) {}

  @Get()
  @RequirePermissions("crm.dashboard.view")
  get(@CurrentPrincipal() actor: RequestPrincipal, @Query() query: unknown) {
    return this.dashboard.get(actor, query);
  }

  @Patch("visits/:visitId/check-in")
  @RequirePermissions("crm.visits.checkin")
  checkIn(@CurrentPrincipal() actor: RequestPrincipal, @Param("visitId") visitId: string) {
    return this.dashboard.checkIn(actor, visitId);
  }

  @Patch("visits/:visitId/complete")
  @RequirePermissions("crm.visits.checkin")
  complete(@CurrentPrincipal() actor: RequestPrincipal, @Param("visitId") visitId: string, @Body() body: unknown) {
    return this.dashboard.complete(actor, visitId, body);
  }
}
