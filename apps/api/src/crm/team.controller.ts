import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseFilters } from '@nestjs/common';
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

  @Get('options')
  @RequirePermissions('crm.teams.view')
  options(@CurrentPrincipal() principal: RequestPrincipal) {
    return this.teams.options(principal);
  }

  @Get('targets-overview')
  @RequirePermissions('crm.targets.view')
  targetsOverview(@CurrentPrincipal() principal: RequestPrincipal, @Query() query: unknown) {
    return this.teams.targetsOverview(principal, query);
  }

  @Post()
  @RequirePermissions('crm.teams.create')
  create(@CurrentPrincipal() principal: RequestPrincipal, @Body() body: unknown) {
    return this.teams.create(principal, body);
  }

  @Get(':teamId/workspace')
  @RequirePermissions('crm.teams.view')
  workspace(@CurrentPrincipal() principal: RequestPrincipal, @Param('teamId') teamId: string, @Query() query: unknown) {
    return this.teams.workspace(principal, teamId, query);
  }

  @Patch(':teamId')
  @RequirePermissions('crm.teams.update')
  update(@CurrentPrincipal() principal: RequestPrincipal, @Param('teamId') teamId: string, @Body() body: unknown) {
    return this.teams.update(principal, teamId, body);
  }

  @Put(':teamId/leader')
  @RequirePermissions('crm.teams.assign')
  assignLeader(@CurrentPrincipal() principal: RequestPrincipal, @Param('teamId') teamId: string, @Body() body: unknown) {
    return this.teams.assignLeader(principal, teamId, body);
  }

  @Post(':teamId/members')
  @RequirePermissions('crm.teams.assign')
  assignMembers(@CurrentPrincipal() principal: RequestPrincipal, @Param('teamId') teamId: string, @Body() body: unknown) {
    return this.teams.assignMembers(principal, teamId, body);
  }

  @Delete(':teamId/members/:membershipId')
  @RequirePermissions('crm.teams.assign')
  removeMember(@CurrentPrincipal() principal: RequestPrincipal, @Param('teamId') teamId: string, @Param('membershipId') membershipId: string) {
    return this.teams.removeMember(principal, teamId, membershipId);
  }
}
