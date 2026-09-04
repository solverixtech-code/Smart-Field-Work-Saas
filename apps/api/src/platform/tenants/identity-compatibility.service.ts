import { Injectable } from '@nestjs/common';
import { User, TenantMembership, DataScope, Role } from '@prisma/client';

export interface ResolvedIdentityContext {
  userId: string;
  tenantId: string | null;
  membershipId: string | null;
  roleCode: string;
  tenantRoleCode: string | null;
  dataScope: DataScope;
  employeeCode: string | null;
  teamId: string | null;
  managerId: string | null;
  managerMembershipId: string | null;
  legacyManagerUserId: string | null;
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
    membership?: (TenantMembership & { tenantRole?: { code: string } | null }) | null,
    overrideTenantRoleCode?: string | null,
  ): ResolvedIdentityContext {
    if (membership) {
      const resolvedRoleCode =
        membership.tenantRole?.code ||
        overrideTenantRoleCode ||
        user.role.toString();

      return {
        userId: user.id,
        tenantId: membership.tenantId,
        membershipId: membership.id,
        roleCode: resolvedRoleCode,
        tenantRoleCode: membership.tenantRole?.code || overrideTenantRoleCode || null,
        dataScope: membership.dataScope || user.dataScope,
        employeeCode: membership.employeeCode || user.employeeCode || null,
        teamId: membership.teamId || user.teamId || null,
        managerId: membership.managerMembershipId || user.managerId || null,
        managerMembershipId: membership.managerMembershipId || null,
        legacyManagerUserId: null,
        isLegacyFallback: false,
      };
    }

    return {
      userId: user.id,
      tenantId: null,
      membershipId: null,
      roleCode: user.role.toString(),
      tenantRoleCode: null,
      dataScope: user.dataScope,
      employeeCode: user.employeeCode || null,
      teamId: user.teamId || null,
      managerId: user.managerId || null,
      managerMembershipId: null,
      legacyManagerUserId: user.managerId || null,
      isLegacyFallback: true,
    };
  }
}
