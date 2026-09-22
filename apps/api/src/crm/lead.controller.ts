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
  Res,
  UseFilters,
} from "@nestjs/common";
import { Response } from "express";
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
  @Get("summary")
  @RequirePermissions("crm.leads.view")
  summary(@CurrentPrincipal() p: RequestPrincipal, @Query() q: unknown) {
    return this.leads.counts(p, q);
  }
  @Get("owner-options")
  @RequirePermissions("crm.leads.assign")
  owners(@CurrentPrincipal() p: RequestPrincipal, @Query() q: unknown) {
    return this.leads.owners(p, q);
  }
  @Post("bulk-assign")
  @RequirePermissions("crm.leads.assign")
  bulkAssign(@CurrentPrincipal() p: RequestPrincipal, @Body() v: unknown) {
    return this.leads.bulkAssign(p, v);
  }
  @Post("import/preview")
  @RequirePermissions("crm.leads.import")
  importPreview(@CurrentPrincipal() p: RequestPrincipal, @Body() v: unknown) {
    return this.leads.importPreview(p, v);
  }
  @Post("import")
  @RequirePermissions("crm.leads.import")
  import(@CurrentPrincipal() p: RequestPrincipal, @Body() v: unknown) {
    return this.leads.import(p, v);
  }
  @Get("export")
  @RequirePermissions("crm.leads.export")
  async export(
    @CurrentPrincipal() p: RequestPrincipal,
    @Query() q: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const csv = await this.leads.exportCsv(p, q);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="leads-export.csv"',
    );
    return csv;
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
  @Post(":id/convert")
  @RequirePermissions("crm.leads.convert")
  convertAlias(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.leads.convert(p, id, v);
  }
  @Get(":id/history")
  @RequirePermissions("crm.leads.view")
  history(@CurrentPrincipal() p: RequestPrincipal, @Param("id") id: string) {
    return this.leads.history(p, id);
  }
  @Post(":id/notes")
  @RequirePermissions("crm.leads.update")
  note(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.leads.note(p, id, v);
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

  // ─── Sub-Resources ─────────────────────────────────────────────────────────────
  @Get(":id/visits")
  @RequirePermissions("crm.leads.view")
  listVisits(@CurrentPrincipal() p: RequestPrincipal, @Param("id") id: string) {
    return this.leads.listVisits(p, id);
  }

  @Post(":id/visits")
  @RequirePermissions("crm.leads.update")
  createVisit(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.leads.createVisit(p, id, v);
  }

  @Get(":id/follow-ups")
  @RequirePermissions("crm.leads.view")
  listFollowUps(@CurrentPrincipal() p: RequestPrincipal, @Param("id") id: string) {
    return this.leads.listFollowUps(p, id);
  }

  @Post(":id/follow-ups")
  @RequirePermissions("crm.leads.view")
  createFollowUp(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.leads.createFollowUp(p, id, v);
  }

  @Patch(":id/follow-ups/:followUpId")
  @RequirePermissions("crm.leads.view")
  updateFollowUp(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Param("followUpId") followUpId: string,
    @Body() v: unknown,
  ) {
    return this.leads.updateFollowUp(p, id, followUpId, v);
  }

  @Delete(":id/follow-ups/:followUpId")
  @RequirePermissions("crm.leads.view")
  deleteFollowUp(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Param("followUpId") followUpId: string,
  ) {
    return this.leads.deleteFollowUp(p, id, followUpId);
  }

  @Get(":id/demos")
  @RequirePermissions("crm.leads.view")
  listDemos(@CurrentPrincipal() p: RequestPrincipal, @Param("id") id: string) {
    return this.leads.listDemos(p, id);
  }

  @Post(":id/demos")
  @RequirePermissions("crm.leads.update")
  createDemo(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.leads.createDemo(p, id, v);
  }

  @Get(":id/communications")
  @RequirePermissions("crm.leads.view")
  listCommunications(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
  ) {
    return this.leads.listCommunications(p, id);
  }

  @Post(":id/communications")
  @RequirePermissions("crm.leads.update")
  createCommunication(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param("id") id: string,
    @Body() v: unknown,
  ) {
    return this.leads.createCommunication(p, id, v);
  }
}

