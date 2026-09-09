import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RequestPrincipalService } from '../security/request-principal.service';
import { requestContext } from '../../observability/request-context';

@Injectable()
export class RequestPrincipalGuard implements CanActivate {
  constructor(private readonly principalService: RequestPrincipalService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const payload = request.user; // Set by JwtAuthGuard

    if (!payload) {
      throw new UnauthorizedException('Authentication token missing');
    }

    const principal = await this.principalService.resolvePrincipal(payload);
    request.principal = principal;
    requestContext.attach(principal);

    return true;
  }
}
