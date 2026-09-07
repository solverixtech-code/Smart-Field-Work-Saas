import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequestPrincipalGuard } from '../../common/guards/request-principal.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentPrincipal } from '../../common/decorators/current-principal.decorator';
import { RequestPrincipal } from '../../common/security/request-principal.interface';
import { ProvisioningService } from './provisioning.service';
import { ProvisioningEventService } from './provisioning-event.service';
import { SubscriptionService } from './subscription.service';

const pagination = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(25) }).strict();

@Controller('platform')
@UseGuards(JwtAuthGuard, RequestPrincipalGuard, PermissionsGuard)
export class PlatformSubscriptionsController {
  constructor(private readonly subscriptions: SubscriptionService, private readonly provisioning: ProvisioningService, private readonly events: ProvisioningEventService) {}

  @Post('tenants/provision')
  @RequirePermissions('platform.tenants.provision')
  provision(@Body() body: unknown, @CurrentPrincipal() principal: RequestPrincipal) { return this.provisioning.provision(body, principal); }

  @Get('industry-classifications')
  @RequirePermissions('platform.tenants.view')
  industries() { return this.provisioning.industries(); }

  @Get('tenants/:tenantId/subscription')
  @RequirePermissions('platform.subscriptions.view')
  get(@Param('tenantId') tenantId: string) { return this.subscriptions.get(tenantId); }

  @Get('tenants/:tenantId/subscription/history')
  @RequirePermissions('platform.subscriptions.view')
  history(@Param('tenantId') tenantId: string, @Query() query: unknown) {
    const { page, limit } = pagination.parse(query);
    return this.subscriptions.history(tenantId, page, limit);
  }

  @Post('tenants/:tenantId/subscription/commands')
  @RequirePermissions('platform.subscriptions.manage')
  command(@Param('tenantId') tenantId: string, @Body() body: unknown, @CurrentPrincipal() principal: RequestPrincipal) { return this.subscriptions.command(tenantId, body, principal); }

  @Get('provisioning/events')
  @RequirePermissions('platform.tenants.provision')
  listEvents(@Query() query: unknown) {
    const { page, limit } = pagination.parse(query);
    return this.events.list(page, limit);
  }

  @Post('provisioning/events/:id/claim')
  @RequirePermissions('platform.tenants.provision')
  claim(@Param('id') id: string, @Body() body: unknown, @CurrentPrincipal() principal: RequestPrincipal) { return this.events.claim(id, body, principal); }

  @Post('provisioning/events/:id/acknowledge')
  @RequirePermissions('platform.tenants.provision')
  acknowledge(@Param('id') id: string, @Body() body: unknown, @CurrentPrincipal() principal: RequestPrincipal) { return this.events.finish(id, body, principal); }
}

@Controller('invitations')
@UseGuards(JwtAuthGuard, RequestPrincipalGuard)
export class OwnerInvitationController {
  constructor(private readonly provisioning: ProvisioningService) {}

  // Invited users cannot yet select this membership. Service checks the exact owner identity.
  @Post(':id/accept')
  accept(@Param('id') id: string, @CurrentPrincipal() principal: RequestPrincipal) { return this.provisioning.accept(id, principal); }
}
