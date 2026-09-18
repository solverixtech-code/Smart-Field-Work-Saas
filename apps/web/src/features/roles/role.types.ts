export interface TenantRoleItem {
  id: string;
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  isActive: boolean;
  permissionsVersion: number;
  userCount: number;
  permissionCount: number;
  status: 'default' | 'synced' | 'customized';
  templateVersion: string;
  updatedAt: string;
}

export interface RoleStats {
  activeRoles: number;
  syncedPermissions: number;
  customRoles: number;
  usersAssigned: number;
  breakdown: string;
}

export interface RoleCounts {
  all: number;
  synced: number;
  customized: number;
  default: number;
}

export interface ListRolesResponse {
  roles: TenantRoleItem[];
  stats: RoleStats;
  counts: RoleCounts;
}

export interface PermissionActionItem {
  action: string;
  label: string;
  code: string;
  granted: boolean;
}

export interface PermissionScopeItem {
  scope: string;
  label: string;
  code: string;
  granted: boolean;
}

export interface PermissionModuleGroup {
  moduleKey: string;
  moduleName: string;
  icon: string;
  actions: PermissionActionItem[];
  scopes: PermissionScopeItem[];
}

export interface AssignedUser {
  membershipId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  team: string;
  role: string;
  status: 'Active' | 'Inactive';
  addedOn: string;
}

export interface RoleDetailResponse {
  role: {
    id: string;
    code: string;
    name: string;
    description: string;
    isSystem: boolean;
    isActive: boolean;
    permissionsVersion: number;
    status: 'default' | 'synced' | 'customized';
    scope: string;
    moduleEntitlement: string;
    templateVersion: string;
    lastUpdated: string;
  };
  grantedPermissions: string[];
  permissionModules: PermissionModuleGroup[];
  assignedUsers: AssignedUser[];
}

export interface CreateRolePayload {
  name: string;
  code?: string;
  description?: string;
  baseRoleId?: string;
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface DuplicateRolePayload {
  name?: string;
  code?: string;
  description?: string;
}
