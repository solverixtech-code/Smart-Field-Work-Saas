import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { RequestPrincipal } from '../security/request-principal.interface';

@Injectable()
export class MembershipContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const principal: RequestPrincipal | undefined = request.principal;

    if (!principal || !principal.tenantId || !principal.membershipId) {
      throw new ForbiddenException(
        'An active tenant membership selection is required to access workspace resources.',
      );
    }

    return true;
  }
}
