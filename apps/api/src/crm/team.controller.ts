import { Controller, Get, Query, UseFilters } from '@nestjs/common';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { TenantAuthorized } from '../common/decorators/tenant-authorized.decorator';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmValidationFilter } from './crm-validation.filter';
import { TeamService } from './team.service';

@Controller('tenant/crm/teams')
@TenantAuthorized()
@UseFilters(CrmValidationFilter)
export class TeamController {
  constructor(private readonly teams: TeamService) {}

  @Get()
  @RequirePermissions('crm.teams.view')
  list(@CurrentPrincipal() principal: RequestPrincipal, @Query() query: unknown) {
    return this.teams.list(principal, query);
  }
}
