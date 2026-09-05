import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { RequestPrincipal } from '../security/request-principal.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const principal = (request['principal'] || request.principal) as RequestPrincipal | undefined;

    if (!principal) {
      throw new ForbiddenException('Unauthenticated request context');
    }

    // Validate every required permission against appropriate scope
    const hasAll = requiredPermissions.every((perm) => {
      const isPlatformScope = perm.startsWith('platform.');
      if (isPlatformScope) {
        return principal.platformPermissions?.includes(perm);
      } else {
        return (
          principal.tenantPermissions?.includes(perm) ||
          principal.permissions?.includes(perm)
        );
      }
    });

    if (!hasAll) {
      throw new ForbiddenException('You do not have permission to perform this action.');
    }

    return true;
  }
}
