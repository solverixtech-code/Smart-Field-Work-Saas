import { Body, Controller, Get, Post, Query, UseFilters } from '@nestjs/common';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { TenantAuthorized } from '../common/decorators/tenant-authorized.decorator';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmValidationFilter } from './crm-validation.filter';
import { TargetService } from './target.service';

@Controller('tenant/crm/targets')
@TenantAuthorized()
@UseFilters(CrmValidationFilter)
export class TargetController {
  constructor(private readonly targets: TargetService) {}

  @Get('dashboard')
  @RequirePermissions('crm.targets.view')
  dashboard(@CurrentPrincipal() principal: RequestPrincipal, @Query() query: unknown) {
    return this.targets.dashboard(principal, query);
  }

  @Get('navigation-summary')
  @RequirePermissions('crm.targets.view')
  navigationSummary(@CurrentPrincipal() principal: RequestPrincipal) {
    return this.targets.navigationSummary(principal);
  }

  @Post()
  @RequirePermissions('crm.targets.manage')
  setTarget(@CurrentPrincipal() principal: RequestPrincipal, @Body() body: unknown) {
    return this.targets.setTarget(principal, body);
  }
}
