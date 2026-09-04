import { ForbiddenException } from '@nestjs/common';
import { RequestPrincipal } from '../security/request-principal.interface';

export interface TenantScope {
  tenantId: string;
  membershipId: string;
  userId: string;
  tenantRoleCode?: string | null;
  dataScope?: string | null;
}

export class TenantScopeFactory {
  static fromPrincipal(principal: RequestPrincipal): TenantScope {
    if (!principal || !principal.tenantId || !principal.membershipId) {
      throw new ForbiddenException(
        'TenantScope requires an active validated tenant membership context.',
      );
    }

    return {
      tenantId: principal.tenantId,
      membershipId: principal.membershipId,
      userId: principal.userId,
      tenantRoleCode: principal.tenantRoleCode,
      dataScope: principal.dataScope,
    };
  }
}
