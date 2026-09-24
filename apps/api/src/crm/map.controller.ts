import { Controller, Get, Param, Query } from "@nestjs/common";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { TenantAuthorized } from "../common/decorators/tenant-authorized.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { MapService } from "./map.service";

@Controller("tenant/crm/maps")
@TenantAuthorized()
export class MapController {
  constructor(private readonly maps: MapService) {}

  @Get("snapshot")
  @RequirePermissions("crm.map.view")
  snapshot(@CurrentPrincipal() actor: RequestPrincipal, @Query() query: unknown) {
    return this.maps.snapshot(actor, query);
  }

  @Get("routes/:membershipId")
  @RequirePermissions("crm.map.view")
  route(@CurrentPrincipal() actor: RequestPrincipal, @Param("membershipId") membershipId: string, @Query() query: unknown) {
    return this.maps.route(actor, membershipId, query);
  }
}
