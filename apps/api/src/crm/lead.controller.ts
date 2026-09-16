import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { LeadService } from "./lead.service";
@Controller("tenant/crm/leads")
@TenantAuthorized()
@UseFilters(CrmValidationFilter)
export class LeadController {
  constructor(private readonly leads: LeadService) {}
  @Get("")
  @RequirePermissions("crm.leads.view")
  list(@CurrentPrincipal() p: RequestPrincipal, @Query() q: unknown) {
    return this.leads.list(p, q);
  }
  @Get("counts")
  @RequirePermissions("crm.leads.view")
  counts(@CurrentPrincipal() p: RequestPrincipal, @Query() q: unknown) {
    return this.leads.counts(p, q);
  }
  @Get("owner-options")
  @RequirePermissions("crm.leads.assign")
  owners(@CurrentPrincipal() p: RequestPrincipal, @Query() q: unknown) {
    return this.leads.owners(p, q);
  }
  @Get(":id")
  @RequirePermissions("crm.leads.view")
  get(@CurrentPrincipal() p: RequestPrincipal, @Param("id") id: string) {
    return this.leads.get(p, id);
  }
  @Post("")
  @RequirePermissions("crm.leads.create")
  create(@CurrentPrincipal() p: RequestPrincipal, @Body() v: unknown) {
    return this.leads.create(p, v);
  }
  @Patch(":id")
  @RequirePermissions("crm.leads.update")
  update(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.leads.update(p, id, v);
  }
  @Patch(":id/assignment")
  @RequirePermissions("crm.leads.assign")
  assign(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.leads.assign(p, id, v);
  }
  @Post(":id/conversion")
  @RequirePermissions("crm.leads.convert")
  convert(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.leads.convert(p, id, v);
  }
  @Delete(":id")
  @HttpCode(204)
  @RequirePermissions("crm.leads.delete")
  remove(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.leads.remove(p, id, v);
  }
}
