import { Controller, Get, Param, Query, UseFilters } from "@nestjs/common";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { TenantAuthorized } from "../common/decorators/tenant-authorized.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmValidationFilter } from "./crm-validation.filter";
import { FollowUpService } from "./follow-up.service";

@Controller("tenant/crm/follow-ups")
@TenantAuthorized()
@UseFilters(CrmValidationFilter)
export class FollowUpController {
  constructor(private readonly followUps: FollowUpService) {}

  @Get()
  @RequirePermissions("crm.followups.view")
  list(@CurrentPrincipal() actor: RequestPrincipal, @Query() query: unknown) {
    return this.followUps.list(actor, query);
  }

  @Get(":id")
  @RequirePermissions("crm.followups.view")
  get(@CurrentPrincipal() actor: RequestPrincipal, @Param("id") id: string) {
    return this.followUps.get(actor, id);
  }
}
