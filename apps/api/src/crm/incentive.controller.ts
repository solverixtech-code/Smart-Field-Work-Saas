import { Body, Controller, Get, Param, Patch, Post, Query, UseFilters } from '@nestjs/common';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { TenantAuthorized } from '../common/decorators/tenant-authorized.decorator';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmValidationFilter } from './crm-validation.filter';
import { IncentiveService } from './incentive.service';

@Controller('tenant/crm')
@TenantAuthorized()
@UseFilters(CrmValidationFilter)
export class IncentiveController {
  constructor(private readonly incentives: IncentiveService) {}

  @Get('incentive-rules')
  @RequirePermissions('crm.incentives.view')
  rules(@CurrentPrincipal() principal: RequestPrincipal, @Query() query: unknown) { return this.incentives.rules(principal, query); }

  @Post('incentive-rules')
  @RequirePermissions('crm.incentives.manage')
  createRule(@CurrentPrincipal() principal: RequestPrincipal, @Body() body: unknown) { return this.incentives.createRule(principal, body); }

  @Patch('incentive-rules/:id')
  @RequirePermissions('crm.incentives.manage')
  updateRule(@CurrentPrincipal() principal: RequestPrincipal, @Param('id') id: string, @Body() body: unknown) { return this.incentives.updateRule(principal, id, body); }

  @Patch('incentive-rules/:id/status')
  @RequirePermissions('crm.incentives.manage')
  updateRuleStatus(@CurrentPrincipal() principal: RequestPrincipal, @Param('id') id: string, @Body() body: unknown) { return this.incentives.updateRuleStatus(principal, id, body); }

  @Post('incentives/calculate')
  @RequirePermissions('crm.incentives.manage')
  calculate(@CurrentPrincipal() principal: RequestPrincipal, @Body() body: unknown) { return this.incentives.calculate(principal, body); }

  @Get('incentives')
  @RequirePermissions('crm.incentives.view')
  list(@CurrentPrincipal() principal: RequestPrincipal, @Query() query: unknown) { return this.incentives.list(principal, query); }

  @Post('incentives/approve')
  @RequirePermissions('crm.incentives.approve')
  approve(@CurrentPrincipal() principal: RequestPrincipal, @Body() body: unknown) { return this.incentives.approve(principal, body); }

  @Patch('incentive-payouts/:id/status')
  @RequirePermissions('crm.incentives.payout')
  updatePayout(@CurrentPrincipal() principal: RequestPrincipal, @Param('id') id: string, @Body() body: unknown) { return this.incentives.updatePayout(principal, id, body); }
}
