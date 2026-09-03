import { useMemo, useState } from 'react';
import { PlatformRole, PlatformPermission } from '../types/platform.types';

const ROLE_PERMISSIONS: Record<PlatformRole, PlatformPermission[]> = {
  PLATFORM_SUPER_ADMIN: [
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
    'platform.modules.create',
    'platform.modules.update',
    'platform.modules.archive',
    'platform.industries.view',
    'platform.users.view',
    'platform.roles.view',
    'platform.subscriptions.view',
    'platform.subscriptions.manage',
    'platform.billing.view',
    'platform.users.manage',
    'platform.audit.view'
  ],
  PLATFORM_OPERATIONS_ADMIN: [
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
    'platform.modules.create',
    'platform.modules.update',
    'platform.modules.archive',
    'platform.industries.view',
    'platform.users.view',
    'platform.roles.view',
    'platform.subscriptions.view',
    'platform.subscriptions.manage',
    'platform.audit.view'
  ],
  PLATFORM_ONBOARDING: [
    'platform.dashboard.view',
    'platform.tenants.view',
    'platform.tenants.create',
    'platform.tenants.update',
    'platform.tenants.provision',
    'platform.tenants.members.manage'
  ],
  PLATFORM_SUPPORT: [
    'platform.dashboard.view',
    'platform.tenants.view',
    'platform.subscriptions.view',
    'platform.modules.view',
    'platform.audit.view'
  ],
  PLATFORM_BILLING: [
    'platform.dashboard.view',
    'platform.tenants.view',
    'platform.subscriptions.view',
    'platform.subscriptions.manage',
    'platform.billing.view'
  ],
  PLATFORM_AUDITOR: [
    'platform.dashboard.view',
    'platform.tenants.view',
    'platform.subscriptions.view',
    'platform.modules.view',
    'platform.audit.view'
  ]
};

export function usePlatformPermissions(currentRole: PlatformRole = 'PLATFORM_SUPER_ADMIN') {
  const [role, setRole] = useState<PlatformRole>(currentRole);

  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[role] || [];
  }, [role]);

  const hasPlatformPermission = (permission: PlatformPermission): boolean => {
    return permissions.includes(permission);
  };

  const canCreateTenant = hasPlatformPermission('platform.tenants.create');
  const canManageSubscriptions = hasPlatformPermission('platform.subscriptions.manage');
  const canSuspendTenant = hasPlatformPermission('platform.tenants.suspend');
  const canViewAuditLogs = hasPlatformPermission('platform.audit.view');

  const canCreatePlan = hasPlatformPermission('platform.plans.create');
  const canUpdatePlan = hasPlatformPermission('platform.plans.update');
  const canArchivePlan = hasPlatformPermission('platform.plans.archive');
  const canPublishPlan = hasPlatformPermission('platform.plans.publish');

  const canViewModules = hasPlatformPermission('platform.modules.view');
  const canCreateModule = hasPlatformPermission('platform.modules.create');
  const canUpdateModule = hasPlatformPermission('platform.modules.update');
  const canArchiveModule = hasPlatformPermission('platform.modules.archive');

  return {
    role,
    setRole,
    permissions,
    hasPlatformPermission,
    canCreateTenant,
    canManageSubscriptions,
    canSuspendTenant,
    canViewAuditLogs,
    canCreatePlan,
    canUpdatePlan,
    canArchivePlan,
    canPublishPlan,
    canViewModules,
    canCreateModule,
    canUpdateModule,
    canArchiveModule
  };
}
