import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { TenantAuthorized } from "../common/decorators/tenant-authorized.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { MapService } from "./map.service";
import { LocationTrackingService } from "./location-tracking.service";

@Controller("tenant/crm/maps")
@TenantAuthorized()
export class MapController {
  constructor(private readonly maps: MapService, private readonly tracking: LocationTrackingService) {}

  @Get("snapshot")
  @RequirePermissions("crm.map.view")
  snapshot(@CurrentPrincipal() actor: RequestPrincipal, @Query() query: unknown) {
    return this.maps.snapshot(actor, query);
  }

  @Get("routes/me")
  @RequirePermissions("crm.location.track")
  ownRoute(@CurrentPrincipal() actor: RequestPrincipal, @Query() query: unknown) {
    return this.maps.ownRoute(actor, query);
  }

  @Get("routes/:membershipId")
  @RequirePermissions("crm.map.view")
  route(@CurrentPrincipal() actor: RequestPrincipal, @Param("membershipId") membershipId: string, @Query() query: unknown) {
    return this.maps.route(actor, membershipId, query);
  }

  @Get("tracking-session")
  @RequirePermissions("crm.location.track")
  trackingSession(@CurrentPrincipal() actor: RequestPrincipal) {
    return this.tracking.session(actor);
  }

  @Post("location-samples")
  @RequirePermissions("crm.location.track")
  locationSamples(@CurrentPrincipal() actor: RequestPrincipal, @Body() body: unknown) {
    return this.tracking.ingest(actor, body);
  }
}
