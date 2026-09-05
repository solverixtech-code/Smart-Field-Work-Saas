export interface RequestPrincipal {
  userId: string;
  sessionId: string;

  platformRoleCodes: string[];
  platformPermissions: string[];

  tenantId: string | null;
  membershipId: string | null;
  tenantRoleCode: string | null;
  tenantPermissions: string[];

  dataScope: string | null;

  permissions: string[]; // Transitional union for backwards compatibility

  contextVersion: number;

  permissionVersion: {
    platform: string;
    tenant: string | null;
  };

  isPlatformOnly: boolean;
}
