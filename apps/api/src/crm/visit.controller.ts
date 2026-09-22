import { Controller, Get, Param, Query, UseFilters } from "@nestjs/common";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { TenantAuthorized } from "../common/decorators/tenant-authorized.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmValidationFilter } from "./crm-validation.filter";
import { VisitService } from "./visit.service";

@Controller("tenant/crm/visits")
@TenantAuthorized()
@UseFilters(CrmValidationFilter)
export class VisitController {
  constructor(private readonly visits: VisitService) {}

  @Get()
  @RequirePermissions("crm.visits.view")
  list(@CurrentPrincipal() actor: RequestPrincipal, @Query() query: unknown) {
    return this.visits.list(actor, query);
  }

  @Get(":id")
  @RequirePermissions("crm.visits.view")
  get(@CurrentPrincipal() actor: RequestPrincipal, @Param("id") id: string) {
    return this.visits.get(actor, id);
  }
}
