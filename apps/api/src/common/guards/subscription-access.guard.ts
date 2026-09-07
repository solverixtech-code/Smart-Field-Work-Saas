import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { RequestPrincipal } from '../security/request-principal.interface';
import { readRules, subscriptionAccess } from '../../platform/subscriptions/subscription-contract';

@Injectable()
export class SubscriptionAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ principal?: RequestPrincipal; method: string }>();
    if (!request.principal?.tenantId || !request.principal.membershipId) throw new ForbiddenException('Selected Tenant membership required');
    const sub = await this.prisma.tenantSubscription.findUnique({ where: { tenantId: request.principal.tenantId }, select: {
      status: true, trialEndsAt: true, graceEndsAt: true,
      planVersion: { select: { commercialRule: { select: { schemaVersion: true, rules: true } } } },
    } });
    // Explicit compatibility debt: unmapped legacy Tenants retain the frozen behavior.
    if (!sub) return true;
    const access = subscriptionAccess(sub, readRules(sub.planVersion.commercialRule), new Date());
    if (access === 'BLOCKED' || (access === 'READ_ONLY' && !['GET', 'HEAD', 'OPTIONS'].includes(request.method))) throw new ForbiddenException('Subscription does not permit this Tenant operation');
    return true;
  }
}
