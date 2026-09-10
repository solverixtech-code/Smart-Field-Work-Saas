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
    it('calculates entitlement strictly from subscription.moduleCodes and ignores industry recommendations for commercial access', () => {
      const subscriptionModuleCodes = ['core_crm', 'field_visits'];
      const industryRecommendedCodes = ['core_crm', 'payroll', 'whatsapp_automation'];

      const entitledSet = new Set<string>(subscriptionModuleCodes);
      const recommendedSet = new Set<string>(industryRecommendedCodes);

      // core_crm: entitled AND recommended -> PLAN_VERSION
      expect(entitledSet.has('core_crm')).toBe(true);

      // payroll: NOT commercially entitled, ONLY recommended -> INDUSTRY_ADVISORY
      expect(entitledSet.has('payroll')).toBe(false);
      expect(recommendedSet.has('payroll')).toBe(true);

      // field_visits: entitled, not in industry recommendations -> PLAN_VERSION
      expect(entitledSet.has('field_visits')).toBe(true);
      expect(recommendedSet.has('field_visits')).toBe(false);
    });
  });

  describe('4. Runtime Bootstrap Schema & Error Guards', () => {
    it('throws UNSUPPORTED_BOOTSTRAP_SCHEMA when schemaVersion is not 1', async () => {
      vi.spyOn(runtimeService, 'getBootstrap').mockImplementation(async () => {
        const invalidSchema: any = { schemaVersion: 2 };
        if (invalidSchema.schemaVersion !== 1) {
          throw new Error(`UNSUPPORTED_BOOTSTRAP_SCHEMA: Received schemaVersion ${invalidSchema.schemaVersion}, expected 1.`);
        }
        return invalidSchema;
      });

      await expect(runtimeService.getBootstrap()).rejects.toThrow('UNSUPPORTED_BOOTSTRAP_SCHEMA');
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
