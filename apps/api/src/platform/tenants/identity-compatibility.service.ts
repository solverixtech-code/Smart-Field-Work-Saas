import { Injectable } from '@nestjs/common';
import { User, TenantMembership, DataScope, Role } from '@prisma/client';

export interface ResolvedIdentityContext {
  userId: string;
  tenantId: string | null;
  membershipId: string | null;
  roleCode: string;
  dataScope: DataScope;
  employeeCode: string;
  teamId: string | null;
  managerId: string | null;
  isLegacyFallback: boolean;
}

@Injectable()
export class IdentityCompatibilityService {
  /**
   * Resolves effective identity context, prioritizing TenantMembership context when present,
   * with fallback to legacy single-workspace User fields for unmigrated legacy flows.
   */
  resolveIdentityContext(
    user: User,
    membership?: TenantMembership | null,
  ): ResolvedIdentityContext {
    if (membership) {
      return {
        userId: user.id,
        tenantId: membership.tenantId,
        membershipId: membership.id,
        roleCode: membership.tenantRoleId || user.role.toString(),
        dataScope: membership.dataScope || user.dataScope,
        employeeCode: membership.employeeCode || user.employeeCode,
        teamId: membership.teamId || user.teamId,
        managerId: membership.managerMembershipId || user.managerId,
        isLegacyFallback: false,
      };
    }

    return {
      userId: user.id,
      tenantId: null,
      membershipId: null,
      roleCode: user.role.toString(),
      dataScope: user.dataScope,
      employeeCode: user.employeeCode,
      teamId: user.teamId,
      managerId: user.managerId,
      isLegacyFallback: true,
    };
  }
}
