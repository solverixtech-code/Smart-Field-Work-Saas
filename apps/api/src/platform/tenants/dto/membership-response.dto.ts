import { TenantMembershipStatus, DataScope } from '@prisma/client';

export interface TenantMembershipUserDto {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface TenantMembershipRoleDto {
  id: string;
  code: string;
  name: string;
}

export interface TenantMembershipSummaryDto {
  id: string;
  tenantId: string;
  tenantDisplayName?: string;
  tenantSlug?: string;
  userId: string;
  user?: TenantMembershipUserDto;
  status: TenantMembershipStatus;
  isPrimary: boolean;
  employeeCode?: string | null;
  designation?: string | null;
  department?: string | null;
  dataScope?: DataScope | null;
  teamId?: string | null;
  managerMembershipId?: string | null;
  tenantRole?: TenantMembershipRoleDto | null;
  invitedAt?: string | null;
  joinedAt?: string | null;
  activatedAt?: string | null;
  deactivatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
