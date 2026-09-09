import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Optional,
} from '@nestjs/common';
import { RequestPrincipal } from '../security/request-principal.interface';
import { MetricsService } from '../../observability/metrics.service';

@Injectable()
export class MembershipContextGuard implements CanActivate {
  constructor(@Optional() private readonly metrics?: MetricsService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const principal: RequestPrincipal | undefined = request.principal;

    if (!principal || !principal.tenantId || !principal.membershipId) {
      this.metrics?.observe('tenant_denials', { operation: 'membership_denied', outcome: 'denied' });
      throw new ForbiddenException(
        'An active tenant membership selection is required to access workspace resources.',
      );
    }

    return true;
  }
}
