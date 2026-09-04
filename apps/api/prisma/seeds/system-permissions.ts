import { PrismaClient, Role } from '@prisma/client';

export const DEFAULT_SYSTEM_PERMISSIONS = [
  { moduleKey: 'platform.dashboard', action: 'view', description: 'View Platform Dashboard' },
  { moduleKey: 'platform.tenants', action: 'view', description: 'View Tenants' },
  { moduleKey: 'platform.tenants', action: 'create', description: 'Create Tenants' },
  { moduleKey: 'platform.tenants', action: 'update', description: 'Update Tenants' },
  { moduleKey: 'platform.tenants', action: 'provision', description: 'Provision Tenants' },
  { moduleKey: 'platform.tenants', action: 'suspend', description: 'Suspend Tenants' },
  { moduleKey: 'platform.tenants.members', action: 'manage', description: 'Manage Tenant Members' },
  { moduleKey: 'platform.tenants.modules', action: 'manage', description: 'Manage Tenant Modules' },
  { moduleKey: 'platform.plans', action: 'view', description: 'View Plans' },
  { moduleKey: 'platform.plans', action: 'create', description: 'Create Plans' },
  { moduleKey: 'platform.plans', action: 'update', description: 'Update Plans' },
  { moduleKey: 'platform.plans', action: 'publish', description: 'Publish Plans' },
  { moduleKey: 'platform.plans', action: 'archive', description: 'Archive Plans' },
  { moduleKey: 'platform.modules', action: 'view', description: 'View Platform Modules' },
  { moduleKey: 'platform.modules', action: 'update', description: 'Update Platform Modules' },
  { moduleKey: 'platform.modules', action: 'archive', description: 'Archive Platform Modules' },
  { moduleKey: 'platform.industries', action: 'view', description: 'View Industries' },
  { moduleKey: 'platform.users', action: 'view', description: 'View Platform Users' },
  { moduleKey: 'platform.roles', action: 'view', description: 'View Platform Roles' },
  { moduleKey: 'platform.subscriptions', action: 'view', description: 'View Subscriptions' },
  { moduleKey: 'platform.subscriptions', action: 'manage', description: 'Manage Subscriptions' },
  { moduleKey: 'platform.billing', action: 'view', description: 'View Billing' },
  { moduleKey: 'platform.users', action: 'manage', description: 'Manage Users' },
  { moduleKey: 'platform.audit', action: 'view', description: 'View Audit Logs' },
];

const ALL_PERMISSIONS = DEFAULT_SYSTEM_PERMISSIONS.map((p) => `${p.moduleKey}.${p.action}`);

const ROLE_PERMISSIONS_MATRIX: Partial<Record<Role, string[]>> = {
  [Role.SUPER_ADMIN]: ALL_PERMISSIONS,
  [Role.PLATFORM_SUPER_ADMIN]: ALL_PERMISSIONS,
  [Role.PLATFORM_OPERATIONS_ADMIN]: [
    'platform.dashboard.view',
    'platform.tenants.view',
    'platform.tenants.create',
    'platform.tenants.update',
    'platform.tenants.provision',
    'platform.tenants.suspend',
    'platform.tenants.members.manage',
    'platform.tenants.modules.manage',
    'platform.plans.view',
    'platform.plans.create',
    'platform.plans.update',
    'platform.plans.publish',
    'platform.plans.archive',
    'platform.modules.view',
    'platform.modules.update',
    'platform.modules.archive',
    'platform.industries.view',
    'platform.users.view',
    'platform.roles.view',
    'platform.subscriptions.view',
    'platform.subscriptions.manage',
    'platform.audit.view',
  ],
  [Role.PLATFORM_ONBOARDING]: [
    'platform.dashboard.view',
    'platform.tenants.view',
    'platform.tenants.create',
    'platform.tenants.update',
    'platform.tenants.provision',
    'platform.tenants.members.manage',
  ],
  [Role.PLATFORM_SUPPORT]: [
    'platform.dashboard.view',
    'platform.tenants.view',
    'platform.subscriptions.view',
    'platform.modules.view',
    'platform.audit.view',
  ],
  [Role.PLATFORM_BILLING]: [
    'platform.dashboard.view',
    'platform.tenants.view',
    'platform.subscriptions.view',
    'platform.subscriptions.manage',
    'platform.billing.view',
  ],
  [Role.PLATFORM_AUDITOR]: [
    'platform.dashboard.view',
    'platform.tenants.view',
    'platform.subscriptions.view',
    'platform.modules.view',
    'platform.audit.view',
  ],
};

export async function seedPermissions(client: PrismaClient) {
  for (const perm of DEFAULT_SYSTEM_PERMISSIONS) {
    const permKey = `${perm.moduleKey}.${perm.action}`;
    const dbPerm = await client.permission.upsert({
      where: {
        moduleKey_action: {
          moduleKey: perm.moduleKey,
          action: perm.action,
        },
      },
      update: { description: perm.description },
      create: {
        moduleKey: perm.moduleKey,
        action: perm.action,
        description: perm.description,
      },
    });

    for (const [roleStr, permKeys] of Object.entries(ROLE_PERMISSIONS_MATRIX)) {
      const role = roleStr as Role;
      if (permKeys && permKeys.includes(permKey)) {
        await client.rolePermission.upsert({
          where: {
            role_permissionId: {
              role,
              permissionId: dbPerm.id,
            },
          },
          update: {},
          create: {
            role,
            permissionId: dbPerm.id,
          },
        });
      }
    }
  }
}
