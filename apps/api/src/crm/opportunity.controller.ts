import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseFilters,
} from "@nestjs/common";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { TenantAuthorized } from "../common/decorators/tenant-authorized.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmValidationFilter } from "./crm-validation.filter";
import { OpportunityService } from "./opportunity.service";

@Controller("tenant/crm/deals")
@TenantAuthorized()
@UseFilters(CrmValidationFilter)
export class OpportunityController {
  constructor(private readonly opportunities: OpportunityService) {}

  @Get("")
  @RequirePermissions("crm.leads.view")
  list(@CurrentPrincipal() p: RequestPrincipal, @Query() q: unknown) {
    return this.opportunities.list(p, q);
  }

  @Get("summary")
  @RequirePermissions("crm.leads.view")
  summary(@CurrentPrincipal() p: RequestPrincipal) {
    return this.opportunities.summary(p);
  }

  @Get(":id")
  @RequirePermissions("crm.leads.view")
  findOne(@CurrentPrincipal() p: RequestPrincipal, @Param("id") id: string) {
    return this.opportunities.findOne(p, id);
  }

  @Post("")
  @RequirePermissions("crm.leads.create")
  create(@CurrentPrincipal() p: RequestPrincipal, @Body() v: unknown) {
    return this.opportunities.create(p, v);
  }

  @Patch(":id")
  @RequirePermissions("crm.leads.update")
  update(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.opportunities.update(p, id, v);
  }

  @Patch(":id/stage")
  @RequirePermissions("crm.leads.update")
  updateStage(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.opportunities.updateStage(p, id, v);
  }

  @Delete(":id")
  @RequirePermissions("crm.leads.delete")
  delete(@CurrentPrincipal() p: RequestPrincipal, @Param("id") id: string) {
    return this.opportunities.delete(p, id);
  }
}
