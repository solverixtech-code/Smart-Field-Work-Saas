import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CurrentPrincipal } from "../../common/decorators/current-principal.decorator";
import { RequirePermissions } from "../../common/decorators/require-permissions.decorator";
import { TenantAuthorized } from "../../common/decorators/tenant-authorized.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RequestPrincipalGuard } from "../../common/guards/request-principal.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RequestPrincipal } from "../../common/security/request-principal.interface";
import { MasterService } from "./master.service";
import { EffectiveMasterService } from "./effective-master.service";

@Controller("platform/configuration/masters")
@UseGuards(JwtAuthGuard, RequestPrincipalGuard, PermissionsGuard)
export class PlatformMasterController {
  constructor(private readonly masters: MasterService) {}
  @Get() @RequirePermissions("platform.masters.view") definitions() {
    return this.masters.definitions();
  }
  @Patch(":code")
  @RequirePermissions("platform.masters.manage")
  updateDefinition(
    @Param("code") code: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.updateDefinition(code, body, actor.userId);
  }
  @Get(":code/system-values")
  @RequirePermissions("platform.masters.view")
  systemValues(@Param("code") code: string, @Query() query: unknown) {
    return this.masters.list({ kind: "SYSTEM" }, code, query);
  }
  @Post(":code/system-values")
  @RequirePermissions("platform.masters.manage")
  createSystem(
    @Param("code") code: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.createValue(
      { kind: "SYSTEM" },
      code,
      body,
      actor.userId,
    );
  }
  @Patch("system-values/:id")
  @RequirePermissions("platform.masters.manage")
  updateSystem(
    @Param("id") id: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.updateValue({ kind: "SYSTEM" }, id, body, actor.userId);
  }
  @Get("industry-versions/:versionId/:code/values")
  @RequirePermissions("platform.masters.view")
  industryValues(
    @Param("versionId") versionId: string,
    @Param("code") code: string,
    @Query() query: unknown,
  ) {
    return this.masters.list({ kind: "INDUSTRY", versionId }, code, query);
  }
  @Post("industry-versions/:versionId/:code/values")
  @RequirePermissions("platform.masters.manage")
  createIndustry(
    @Param("versionId") versionId: string,
    @Param("code") code: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.createValue(
      { kind: "INDUSTRY", versionId },
      code,
      body,
      actor.userId,
    );
  }
  @Patch("industry-versions/:versionId/values/:id")
  @RequirePermissions("platform.masters.manage")
  updateIndustry(
    @Param("versionId") versionId: string,
    @Param("id") id: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.updateValue(
      { kind: "INDUSTRY", versionId },
      id,
      body,
      actor.userId,
    );
  }
  @Get("industry-versions/:versionId/overrides")
  @RequirePermissions("platform.masters.view")
  overrides(@Param("versionId") versionId: string, @Query() query: unknown) {
    return this.masters.overrides({ kind: "INDUSTRY", versionId }, query);
  }
  @Put("industry-versions/:versionId/overrides/:id")
  @RequirePermissions("platform.masters.manage")
  setOverride(
    @Param("versionId") versionId: string,
    @Param("id") id: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.setOverride(
      { kind: "INDUSTRY", versionId },
      id,
      body,
      actor.userId,
    );
  }
  @Delete("industry-versions/:versionId/overrides/:id")
  @RequirePermissions("platform.masters.manage")
  removeOverride(
    @Param("versionId") versionId: string,
    @Param("id") id: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.removeOverride(
      { kind: "INDUSTRY", versionId },
      id,
      body,
      actor.userId,
    );
  }
}

@Controller("tenant/masters")
@TenantAuthorized()
export class TenantMasterController {
  constructor(
    private readonly masters: MasterService,
    private readonly effective: EffectiveMasterService,
  ) {}
  private tenant(principal: RequestPrincipal): string {
    if (!principal.tenantId || !principal.membershipId)
      throw new ForbiddenException("Selected Tenant membership required");
    return principal.tenantId;
  }
  @Get() @RequirePermissions("system.masters.view") definitions(
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.effective.definitions(this.tenant(actor));
  }
  @Get("values/:id") @RequirePermissions("system.masters.view") historical(
    @Param("id") id: string,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.effective.historical(this.tenant(actor), id);
  }
  @Get("overrides") @RequirePermissions("system.masters.view") overrides(
    @Query() query: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.overrides(
      { kind: "TENANT", tenantId: this.tenant(actor) },
      query,
    );
  }
  @Get(":code/values") @RequirePermissions("system.masters.view") values(
    @Param("code") code: string,
    @Query() query: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.effective.list(this.tenant(actor), code, query);
  }
  @Post(":code/values") @RequirePermissions("system.masters.manage") create(
    @Param("code") code: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.createValue(
      { kind: "TENANT", tenantId: this.tenant(actor) },
      code,
      body,
      actor.userId,
    );
  }
  @Patch("values/:id") @RequirePermissions("system.masters.manage") update(
    @Param("id") id: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.updateValue(
      { kind: "TENANT", tenantId: this.tenant(actor) },
      id,
      body,
      actor.userId,
    );
  }
  @Put("overrides/:id")
  @RequirePermissions("system.masters.manage")
  setOverride(
    @Param("id") id: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.setOverride(
      { kind: "TENANT", tenantId: this.tenant(actor) },
      id,
      body,
      actor.userId,
    );
  }
  @Delete("overrides/:id")
  @RequirePermissions("system.masters.manage")
  removeOverride(
    @Param("id") id: string,
    @Body() body: unknown,
    @CurrentPrincipal() actor: RequestPrincipal,
  ) {
    return this.masters.removeOverride(
      { kind: "TENANT", tenantId: this.tenant(actor) },
      id,
      body,
      actor.userId,
    );
  }
}
