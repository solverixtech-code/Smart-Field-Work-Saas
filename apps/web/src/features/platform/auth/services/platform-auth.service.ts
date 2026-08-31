import { PlatformPrincipal } from '../types/platform-auth.types';
import { PlatformPermission } from '../../tenants/types/platform.types';

const ALL_PERMISSIONS: PlatformPermission[] = [
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
  'platform.industries.view',
  'platform.users.view',
  'platform.roles.view',
  'platform.subscriptions.view',
  'platform.subscriptions.manage',
  'platform.billing.view',
  'platform.users.manage',
  'platform.audit.view',
];

export const MOCK_PLATFORM_PRINCIPALS: PlatformPrincipal[] = [
  {
    userId: 'usr_super_admin',
    email: 'admin@smartfieldwork.com',
    fullName: 'Platform Super Admin',
    role: 'PLATFORM_SUPER_ADMIN',
    permissions: [...ALL_PERMISSIONS],
  },
  {
    userId: 'usr_platform_support',
    email: 'support@smartfieldwork.com',
    fullName: 'Platform Support Lead',
    role: 'PLATFORM_SUPPORT',
    permissions: [
      'platform.dashboard.view',
      'platform.tenants.view',
      'platform.plans.view',
      'platform.modules.view',
      'platform.industries.view',
      'platform.users.view',
      'platform.subscriptions.view',
      'platform.billing.view',
      'platform.audit.view',
    ],
  },
  {
    userId: 'usr_platform_auditor',
    email: 'auditor@smartfieldwork.com',
    fullName: 'Platform Auditor',
    role: 'PLATFORM_AUDITOR',
    permissions: [
      'platform.dashboard.view',
      'platform.tenants.view',
      'platform.audit.view',
    ],
  },
];

class PlatformAuthService {
  /**
   * Strictly resolve PlatformPrincipal from user identity.
   * Return null if the user is a normal Tenant ADMIN or non-platform user.
   */
  getPlatformPrincipalForUser(user?: { id?: string; email?: string; role?: string } | null): PlatformPrincipal | null {
    if (!user) return null;

    // Check direct email or userId match
    const matched = MOCK_PLATFORM_PRINCIPALS.find(
      (p) => p.email.toLowerCase() === user.email?.toLowerCase() || p.userId === user.id
    );
    if (matched) return matched;

    // Check if user role is explicitly PLATFORM_SUPER_ADMIN or platform email domain
    if ((user.role as string) === 'PLATFORM_SUPER_ADMIN' || user.email?.endsWith('@smartfieldwork.com')) {
      return MOCK_PLATFORM_PRINCIPALS[0];
    }

    // Normal tenant admins (Role.ADMIN, Role.SUPER_ADMIN of tenant CRM) are NOT platform principals
    return null;
  }

  hasPermission(permission: PlatformPermission, user?: { id?: string; email?: string; role?: string } | null): boolean {
    const principal = this.getPlatformPrincipalForUser(user);
    if (!principal) return false;
    return principal.permissions.includes(permission);
  }
}

export const platformAuthService = new PlatformAuthService();

