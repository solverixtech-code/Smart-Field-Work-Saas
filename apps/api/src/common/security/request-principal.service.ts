import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { RequestPrincipal } from './request-principal.interface';
import { EffectivePermissionService } from './effective-permission.service';
import { TenantMembershipStatus, TenantStatus, PlatformAssignmentStatus } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  sid?: string;
  mid?: string | null;
  ctxv?: number;
  email?: string;
  role?: string;
  tokenUse?: string;
  jti?: string;
}

@Injectable()
export class RequestPrincipalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly effectivePermissions: EffectivePermissionService,
  ) {}

  async resolvePrincipal(payload: JwtPayload): Promise<RequestPrincipal> {
    if (!payload || !payload.sub) {
      throw new UnauthorizedException('Invalid payload claims');
    }

    // 1. Load User & verify ACTIVE status
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User account disabled or unavailable');
    }

    // 2. Load Session if sid claim is present
    let sessionId = payload.sid ?? '';
    let sessionContextVersion = 1;
    let selectedMembershipId: string | null = payload.mid ?? null;

    if (payload.sid) {
      const session = await this.prisma.userSession.findUnique({
        where: { id: payload.sid },
      });

      if (!session || session.userId !== user.id || session.status !== 'ACTIVE') {
        throw new UnauthorizedException('Session is invalid or revoked');
      }

      // Context version validation
      if (typeof payload.ctxv === 'number' && payload.ctxv !== session.contextVersion) {
        throw new UnauthorizedException('Session context version mismatch. Please re-authenticate.');
      }

      // Token membership must match session membership
      if (payload.mid !== undefined && payload.mid !== session.selectedMembershipId) {
        throw new UnauthorizedException('Token membership context mismatch');
      }

      sessionId = session.id;
      sessionContextVersion = session.contextVersion;
      selectedMembershipId = session.selectedMembershipId;
    }

    // 3. Resolve active Platform Roles
    const now = new Date();
    const platformAssignments = await this.prisma.platformUserRoleAssignment.findMany({
      where: {
        userId: user.id,
        status: PlatformAssignmentStatus.ACTIVE,
        platformRole: { isActive: true },
        OR: [
          { validFrom: null, validUntil: null },
          { validFrom: { lte: now }, validUntil: null },
          { validFrom: null, validUntil: { gte: now } },
          { validFrom: { lte: now }, validUntil: { gte: now } },
        ],
      },
      include: { platformRole: true },
    });

    const platformRoleCodes = platformAssignments.map((pa) => pa.platformRole.code);

    // 4. Resolve selected TenantMembership if set
    let tenantId: string | null = null;
    let membershipId: string | null = null;
    let tenantRoleCode: string | null = null;
    let dataScope: string | null = null;

    if (selectedMembershipId) {
      const membership = await this.prisma.tenantMembership.findUnique({
        where: { id: selectedMembershipId },
        include: {
          tenant: true,
          tenantRole: true,
        },
      });

      if (
        membership &&
        membership.userId === user.id &&
        membership.status === TenantMembershipStatus.ACTIVE &&
        membership.tenant &&
        membership.tenant.status === TenantStatus.ACTIVE
      ) {
        tenantId = membership.tenantId;
        membershipId = membership.id;
        tenantRoleCode = membership.tenantRole?.code ?? null;
        dataScope = membership.dataScope ?? user.dataScope;
      }
    }

    // 5. Resolve scope-separated effective permissions
    const platformPermissions = await this.effectivePermissions.resolvePlatformPermissions(
      user.id,
    );

    const tenantPermissions = await this.effectivePermissions.resolveTenantPermissions(
      tenantId,
      membershipId,
    );

    const permissions = Array.from(
      new Set([...platformPermissions, ...tenantPermissions]),
    ).sort();

    const isPlatformOnly = !tenantId && platformRoleCodes.length > 0;

    return {
      userId: user.id,
      sessionId,
      platformRoleCodes,
      platformPermissions,
      tenantId,
      membershipId,
      tenantRoleCode,
      tenantPermissions,
      dataScope,
      permissions,
      contextVersion: sessionContextVersion,
      permissionVersion: {
        platform: `p_${platformRoleCodes.sort().join('_')}`,
        tenant: tenantRoleCode ? `t_${tenantRoleCode}` : null,
      },
      isPlatformOnly,
    };
  }
}
