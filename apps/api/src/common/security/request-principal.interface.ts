export interface RequestPrincipal {
  userId: string;
  sessionId: string;

  platformRoleCodes: string[];

  tenantId: string | null;
  membershipId: string | null;
  tenantRoleCode: string | null;

  dataScope: string | null;

  permissions: string[];

  contextVersion: number;

  isPlatformOnly: boolean;
}
