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

class PlatformAuthService {
  private currentPrincipal: PlatformPrincipal | null = {
    userId: 'usr_super_admin',
    email: 'admin@smartfieldwork.com',
    fullName: 'Platform Super Admin',
    role: 'PLATFORM_SUPER_ADMIN',
    permissions: [...ALL_PERMISSIONS],
  };

  getPlatformPrincipal(): PlatformPrincipal | null {
    return this.currentPrincipal;
  }

  setPlatformPrincipal(principal: PlatformPrincipal | null): void {
    this.currentPrincipal = principal;
  }

  hasPermission(permission: PlatformPermission): boolean {
    if (!this.currentPrincipal) return false;
    return this.currentPrincipal.permissions.includes(permission);
  }
}

export const platformAuthService = new PlatformAuthService();
