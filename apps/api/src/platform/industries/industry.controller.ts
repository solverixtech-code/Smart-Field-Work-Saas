import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestPrincipalGuard } from '../../common/guards/request-principal.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentPrincipal } from '../../common/decorators/current-principal.decorator';
import { TenantAuthenticated } from '../../common/decorators/tenant-authenticated.decorator';
import { RequestPrincipal } from '../../common/security/request-principal.interface';
import { IndustryService } from './industry.service';
import { IndustryAssignmentService } from './industry-assignment.service';

@Controller('platform/industries')
@UseGuards(JwtAuthGuard, RequestPrincipalGuard, PermissionsGuard)
export class IndustryController {
  constructor(private readonly industries: IndustryService) {}
  @Get() @RequirePermissions('platform.industries.view') list(
    @Query() query: unknown,
  ) {
    return this.industries.list(query);
  }
  @Get(':id') @RequirePermissions('platform.industries.view') detail(
    @Param('id') id: string,
  ) {
    return this.industries.detail(id);
  }
  @Post() @RequirePermissions('platform.industries.manage') create(
    @Body() body: unknown,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.industries.create(body, principal.userId);
  }
  @Patch(':id') @RequirePermissions('platform.industries.manage') update(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.industries.update(id, body, principal.userId);
  }
  @Get(':id/versions') @RequirePermissions('platform.industries.view') versions(
    @Param('id') id: string,
    @Query() query: unknown,
  ) {
    return this.industries.versions(id, query);
  }
  @Get(':id/versions/:versionId')
  @RequirePermissions('platform.industries.view')
  version(@Param('id') id: string, @Param('versionId') versionId: string) {
    return this.industries.version(id, versionId);
  }
  @Post(':id/versions/draft')
  @RequirePermissions('platform.industries.manage')
  draft(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.industries.createDraft(id, body, principal.userId);
  }
  @Patch(':id/versions/:versionId')
  @RequirePermissions('platform.industries.manage')
  updateDraft(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Body() body: unknown,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.industries.updateDraft(id, versionId, body, principal.userId);
  }
  @Post(':id/versions/:versionId/publish')
  @RequirePermissions('platform.industries.manage')
  publish(
    @Param('id') id: string,
    @Param('versionId') versionId: string,
    @Body() body: unknown,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.industries.publish(id, versionId, body, principal.userId);
  }
  @Post(':id/archive')
  @RequirePermissions('platform.industries.manage')
  archive(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.industries.archive(id, body, principal.userId);
  }
}

@Controller('platform/tenants/:tenantId/industry-template')
@UseGuards(JwtAuthGuard, RequestPrincipalGuard, PermissionsGuard)
export class PlatformIndustryAssignmentController {
  constructor(private readonly assignments: IndustryAssignmentService) {}
  @Get() @RequirePermissions('platform.industries.view') read(
    @Param('tenantId') tenantId: string,
  ) {
    return this.assignments.read(tenantId);
  }
  @Get('history') @RequirePermissions('platform.industries.view') history(
    @Param('tenantId') tenantId: string,
    @Query() query: unknown,
  ) {
    return this.assignments.history(tenantId, query);
  }
  @Post() @RequirePermissions('platform.industries.manage') assign(
    @Param('tenantId') tenantId: string,
    @Body() body: unknown,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.assignments.assign(tenantId, body, principal.userId);
  }
  @Post('migrate') @RequirePermissions('platform.industries.manage') migrate(
    @Param('tenantId') tenantId: string,
    @Body() body: unknown,
    @CurrentPrincipal() principal: RequestPrincipal,
  ) {
    return this.assignments.migrate(tenantId, body, principal.userId);
  }
}

@Controller('tenant/industry-template')
@TenantAuthenticated()
export class TenantIndustryAssignmentController {
  constructor(private readonly assignments: IndustryAssignmentService) {}
  @Get() read(@CurrentPrincipal() principal: RequestPrincipal) {
    if (!principal.tenantId || !principal.membershipId)
      throw new ForbiddenException('Selected Tenant membership required');
    return this.assignments.read(principal.tenantId);
  }
}
