import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseFilters } from "@nestjs/common";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { TenantAuthorized } from "../common/decorators/tenant-authorized.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmValidationFilter } from "./crm-validation.filter";
import { DemoService } from "./demo.service";

@Controller("tenant/crm/demos")
@TenantAuthorized()
@UseFilters(CrmValidationFilter)
export class DemoController {
  constructor(private readonly demos: DemoService) {}

  @Get()
  @RequirePermissions("crm.demos.view")
  list(@CurrentPrincipal() actor: RequestPrincipal, @Query() query: unknown) {
    return this.demos.list(actor, query);
  }

  @Get("options")
  @RequirePermissions("crm.demos.view")
  options(@CurrentPrincipal() actor: RequestPrincipal) {
    return this.demos.options(actor);
  }

  @Get("navigation-summary")
  @RequirePermissions("crm.demos.view")
  navigationSummary(@CurrentPrincipal() actor: RequestPrincipal) {
    return this.demos.navigationSummary(actor);
  }

  @Get("conversion-report")
  @RequirePermissions("crm.demos.view")
  conversionReport(@CurrentPrincipal() actor: RequestPrincipal, @Query() query: unknown) {
    return this.demos.conversionReport(actor, query);
  }

  @Get(":id")
  @RequirePermissions("crm.demos.view")
  get(@CurrentPrincipal() actor: RequestPrincipal, @Param("id") id: string) {
    return this.demos.get(actor, id);
  }

  @Post()
  @RequirePermissions("crm.demos.manage")
  create(@CurrentPrincipal() actor: RequestPrincipal, @Body() body: unknown) {
    return this.demos.create(actor, body);
  }

  @Patch(":id")
  @RequirePermissions("crm.demos.manage")
  update(@CurrentPrincipal() actor: RequestPrincipal, @Param("id") id: string, @Body() body: unknown) {
    return this.demos.update(actor, id, body);
  }

  @Delete(":id")
  @RequirePermissions("crm.demos.manage")
  remove(@CurrentPrincipal() actor: RequestPrincipal, @Param("id") id: string) {
    return this.demos.remove(actor, id);
  }
}
