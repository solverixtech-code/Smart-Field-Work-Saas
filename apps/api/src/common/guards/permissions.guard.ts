import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../persistence/prisma.service';
import { Role } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request['user'];

    if (!user || !user.role) {
      throw new ForbiddenException('Unauthenticated or missing user role');
    }

    // PLATFORM_SUPER_ADMIN & SUPER_ADMIN automatically bypass permission checks
    if (
      user.role === Role.PLATFORM_SUPER_ADMIN ||
      user.role === Role.SUPER_ADMIN
    ) {
      return true;
    }

    // Query granted permissions for user's role
    const grantedPermissions = await this.prisma.rolePermission.findMany({
      where: { role: user.role },
      include: { permission: true },
    });

    const userPermKeys = grantedPermissions.map(
      (rp) => `${rp.permission.moduleKey}.${rp.permission.action}`,
    );

    const hasAll = requiredPermissions.every((perm) =>
      userPermKeys.includes(perm),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        `Insufficient permission. Required: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }
}
