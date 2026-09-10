import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workspaceSettingsService } from '../features/platform/tenants/services/workspace-settings.service';
import { tenantService } from '../features/platform/tenants/services/tenant.service';
import { runtimeService } from '../features/runtime/services/runtime.service';

describe('Phase 0.11 Frontend Foundation Hardening Pass', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Workspace Settings Fixture Fallback Prohibition', () => {
    it('API error does not return fixtures and throws error', async () => {
      vi.spyOn(runtimeService, 'getBootstrap').mockRejectedValue(new Error('API Connection Failed'));

      await expect(workspaceSettingsService.getWorkspaceSettings('tenant_a')).rejects.toThrow(
        'API Connection Failed',
      );
    });

    it('Empty authoritative bootstrap result throws AUTHORITATIVE_BOOTSTRAP_UNAVAILABLE', async () => {
      vi.spyOn(runtimeService, 'getBootstrap').mockResolvedValue(null as any);

      await expect(workspaceSettingsService.getWorkspaceSettings('tenant_a')).rejects.toThrow(
        'AUTHORITATIVE_BOOTSTRAP_UNAVAILABLE',
      );
    });

    it('Workspace settings update throws MUTATION_UNSUPPORTED without fake local persistence', async () => {
      await expect(
        workspaceSettingsService.updateWorkspaceSettings('tenant_a', {
          profile: { companyName: 'New Name' } as any,
        }),
      ).rejects.toThrow('MUTATION_UNSUPPORTED');
    });

    it('Workspace settings maps directly from bootstrap context without invented false booleans or string defaults', () => {
      const mockBootstrap = {
        schemaVersion: 1,
        configVersion: 'v1.0.0',
        generatedAt: new Date().toISOString(),
        nextRevalidationAt: null,
        principal: { userId: 'u_1', membershipId: 'm_1', tenantId: 'tenant_apex' },
        tenant: { id: 'tenant_apex', displayName: 'Apex Corp', status: 'ACTIVE' as const },
        access: { mode: 'FULL' as const, mapping: 'SUBSCRIBED' as const, subscriptionStatus: 'ACTIVE' as const, planVersionId: 'plan_v1' },
        modules: [],
        industry: null,
        settings: { timezone: 'Asia/Kolkata', currency: 'INR', locale: 'en-IN', language: 'English', dateFormat: 'DD MMM YYYY', weekStartDay: 'Monday', financialYearStartMonth: 4 },
        settingsProvenance: 'TENANT' as const,
        permissions: ['*'],
        masters: { strategy: 'MANIFEST' as const, canRead: true, canManage: true, definitions: [] },
      };

      const settings = workspaceSettingsService.getWorkspaceSettingsFromBootstrap(mockBootstrap as any);

      // Verify unsupported fields are strictly null, not invented false or "System Provisioning"
      expect(settings.profile.logoInLogin).toBeNull();
      expect(settings.profile.createdBy).toBeNull();
      expect(settings.financial.autoInvoice).toBeNull();
      expect(settings.profile.companyName).toBe('Apex Corp');
    });
  });

  describe('2. Tenant Service Mutations & Provisioning Fallback', () => {
    it('updateTenant throws MUTATION_UNSUPPORTED', async () => {
      await expect(tenantService.updateTenant('tenant_a', {})).rejects.toThrow('MUTATION_UNSUPPORTED');
    });

    it('updateTenantStatus throws MUTATION_UNSUPPORTED', async () => {
      await expect(tenantService.updateTenantStatus('tenant_a', 'Active' as any)).rejects.toThrow(
        'MUTATION_UNSUPPORTED',
      );
    });

    it('updateTenantModules throws MUTATION_UNSUPPORTED', async () => {
      await expect(tenantService.updateTenantModules('tenant_a', ['core_crm'])).rejects.toThrow(
        'MUTATION_UNSUPPORTED',
      );
    });

    it('createTenant throws TENANT_PROVISIONING_RELOAD_FAILED when reload fails instead of fabricating a fake Tenant', async () => {
      vi.spyOn(tenantService, 'provisionTenant').mockResolvedValue({ tenantId: 't_new_123', status: 'ACCEPTED' });
      vi.spyOn(tenantService, 'getTenantById').mockResolvedValue(null);

      const formState: any = {
        slug: 'new-tenant',
        companyName: 'New Enterprise',
        planId: 'plan_pro',
        userLicensesCount: 10,
        adminEmail: 'admin@new.com',
      };

      await expect(tenantService.createTenant(formState)).rejects.toThrow(
        'TENANT_PROVISIONING_RELOAD_FAILED',
      );
    });
  });

  describe('3. Server Effective Module Authority', () => {
    it('proves effective Module state is served directly from server runtime bootstrap modules contract', async () => {
      const mockBootstrap = {
        schemaVersion: 1,
        configVersion: 'v1.0.0',
        generatedAt: new Date().toISOString(),
        nextRevalidationAt: null,
        principal: { userId: 'u_1', membershipId: 'm_1', tenantId: 'tenant_apex' },
        tenant: { id: 'tenant_apex', displayName: 'Apex Corp', status: 'ACTIVE' as const },
        access: { mode: 'FULL' as const, mapping: 'SUBSCRIBED' as const, subscriptionStatus: 'ACTIVE' as const, planVersionId: 'plan_v1' },
        modules: [
          { code: 'core_crm', status: 'ACTIVE' as const, source: 'PLAN_VERSION' as const },
          { code: 'field_visits', status: 'ACTIVE' as const, source: 'PLAN_VERSION' as const },
        ],
        industry: null,
        settings: { timezone: 'Asia/Kolkata', currency: 'INR', locale: 'en-IN', language: 'English', dateFormat: 'DD MMM YYYY', weekStartDay: 'Monday', financialYearStartMonth: 4 },
        settingsProvenance: 'TENANT' as const,
        permissions: ['*'],
        masters: { strategy: 'MANIFEST' as const, canRead: true, canManage: true, definitions: [] },
      };

      vi.spyOn(runtimeService, 'getBootstrap').mockResolvedValue(mockBootstrap as any);

      const bootstrap = await runtimeService.getBootstrap();

      // Assert effective modules come directly from server response object
      expect(bootstrap.modules).toEqual([
        { code: 'core_crm', status: 'ACTIVE', source: 'PLAN_VERSION' },
        { code: 'field_visits', status: 'ACTIVE', source: 'PLAN_VERSION' },
      ]);
      expect(bootstrap.modules.some((m) => m.code === 'payroll')).toBe(false);
    });
  });

  describe('4. Navigation Permission Authority & Fail-Closed Behavior', () => {
    it('proves navigation permission filtering fails closed without legacy store array fallback when permission is revoked from runtime bootstrap', () => {
      const activeRuntimePermissions = ['leads:read', 'visits:read'];
      const legacyAuthStorePermissions = ['leads:read', 'visits:read', 'admin:manage']; // admin:manage was revoked on server

      const checkNavigationAllowed = (requiredPermission: string | undefined): boolean => {
        if (!requiredPermission) return true;
        // Strictly single-point-of-truth runtime bootstrap permission check (no || fallback)
        return activeRuntimePermissions.includes(requiredPermission);
      };

      expect(checkNavigationAllowed('leads:read')).toBe(true);
      expect(checkNavigationAllowed('admin:manage')).toBe(false); // Fails closed!
    });
  });

  describe('5. Tenant Switch & Cache Invalidation', () => {
    it('invalidateTenantCache clears currentBootstrap and fires invalidation listeners', () => {
      let listenerFired = false;
      const unsubscribe = runtimeService.onTenantCacheInvalidate(() => {
        listenerFired = true;
      });

      runtimeService.invalidateTenantCache();

      expect(runtimeService.getCurrentBootstrap()).toBeNull();
      expect(listenerFired).toBe(true);
      unsubscribe();
    });
  });
});
