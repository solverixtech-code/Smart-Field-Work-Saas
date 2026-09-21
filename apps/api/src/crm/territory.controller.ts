import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseFilters,
} from "@nestjs/common";
import { CurrentPrincipal } from "../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { TenantAuthorized } from "../common/decorators/tenant-authorized.decorator";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmValidationFilter } from "./crm-validation.filter";
import { TerritoryService } from "./territory.service";

@Controller("tenant/crm/territories")
@TenantAuthorized()
@UseFilters(CrmValidationFilter)
export class TerritoryController {
  constructor(private readonly territories: TerritoryService) {}

  @Get("")
  @RequirePermissions("crm.territories.view")
  list(@CurrentPrincipal() p: RequestPrincipal, @Query() q: unknown) {
    return this.territories.list(p, q);
  }

  @Get("member-options")
  @RequirePermissions("crm.territories.view")
  memberOptions(@CurrentPrincipal() p: RequestPrincipal, @Query() q: unknown) {
    return this.territories.memberOptions(p, q);
  }

  @Get(":id")
  @RequirePermissions("crm.territories.view")
  get(@CurrentPrincipal() p: RequestPrincipal, @Param("id") id: string) {
    return this.territories.get(p, id);
  }

  @Post("")
  @RequirePermissions("crm.territories.create")
  create(@CurrentPrincipal() p: RequestPrincipal, @Body() v: unknown) {
    return this.territories.create(p, v);
  }

  @Patch(":id")
  @RequirePermissions("crm.territories.update")
  update(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.territories.update(p, id, v);
  }

  @Delete(":id")
  @HttpCode(204)
  @RequirePermissions("crm.territories.delete")
  remove(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: { expectedRevision?: number },
  ) {
    return this.territories.remove(p, id, v?.expectedRevision);
  }

  // ─── Members ─────────────────────────────────────────────────────────────
  @Get(":id/members")
  @RequirePermissions("crm.territories.view")
  members(@CurrentPrincipal() p: RequestPrincipal, @Param("id") id: string) {
    return this.territories.listMembers(p, id);
  }

  @Post(":id/members")
  @RequirePermissions("crm.territories.assign")
  assignMember(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.territories.assignMember(p, id, v);
  }

  @Delete(":id/members/:membershipId")
  @HttpCode(204)
  @RequirePermissions("crm.territories.assign")
  unassignMember(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Param("membershipId") membershipId: string,
  ) {
    return this.territories.unassignMember(p, id, membershipId);
  }

  // ─── Businesses ──────────────────────────────────────────────────────────
  @Get(":id/businesses")
  @RequirePermissions("crm.territories.view")
  businesses(@CurrentPrincipal() p: RequestPrincipal, @Param("id") id: string) {
    return this.territories.listBusinesses(p, id);
  }

  @Post(":id/businesses")
  @RequirePermissions("crm.territories.update")
  assignBusiness(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.territories.assignBusiness(p, id, v);
  }

  @Delete(":id/businesses/:accountId")
  @HttpCode(204)
  @RequirePermissions("crm.territories.update")
  unassignBusiness(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Param("accountId") accountId: string,
  ) {
    return this.territories.unassignBusiness(p, id, accountId);
  }

  // ─── Targets ─────────────────────────────────────────────────────────────
  @Get(":id/targets")
  @RequirePermissions("crm.territories.view")
  targets(@CurrentPrincipal() p: RequestPrincipal, @Param("id") id: string) {
    return this.territories.getTargets(p, id);
  }

  @Put(":id/targets")
  @RequirePermissions("crm.territories.update")
  updateTargets(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.territories.updateTargets(p, id, v);
  }

  // ─── Performance ─────────────────────────────────────────────────────────
  @Get(":id/performance")
  @RequirePermissions("crm.territories.view")
  performance(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
  ) {
    return this.territories.getPerformance(p, id);
  }
}
