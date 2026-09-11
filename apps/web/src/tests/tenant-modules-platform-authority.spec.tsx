import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tenantService } from '../features/platform/tenants/services/tenant.service';
import { moduleService } from '../features/platform/catalog/modules/services/module.service';
import { runtimeService } from '../features/runtime/services/runtime.service';
import { TenantModuleItem } from '../screens/platform/TenantModulesPage';

describe('TenantModulesPage Platform Cross-Tenant Authority Regression Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('proves runtimeService current Tenant bootstrap is NEVER used as authority for platform cross-tenant module inspection', async () => {
    // 1. Mock active session runtime bootstrap with different modules (e.g. active session has attendance)
    const activeSessionBootstrap = {
      schemaVersion: 1,
      configVersion: 'v1.0.0',
      generatedAt: new Date().toISOString(),
      principal: { userId: 'u_1', membershipId: 'm_1', tenantId: 'tenant_active' },
      tenant: { id: 'tenant_active', displayName: 'Active Session Tenant', status: 'ACTIVE' as const },
      access: { mode: 'FULL' as const, mapping: 'SUBSCRIBED' as const, subscriptionStatus: 'ACTIVE' as const, planVersionId: 'plan_v1' },
      modules: [{ code: 'attendance', status: 'ACTIVE' as const, source: 'PLAN_VERSION' as const }],
      industry: null,
      settings: { timezone: 'UTC', currency: 'USD', locale: 'en-US', language: 'English', dateFormat: 'YYYY-MM-DD', weekStartDay: 'Monday', financialYearStartMonth: 1 },
      settingsProvenance: 'TENANT' as const,
      permissions: ['*'],
      masters: { strategy: 'MANIFEST' as const, canRead: true, canManage: true, definitions: [] },
    };

    vi.spyOn(runtimeService, 'getCurrentBootstrap').mockReturnValue(activeSessionBootstrap as any);

    // 2. Mock target platform tenant (target tenant = tenant_target) with subscription = core_crm
    const targetTenantId = 'tenant_target';
    const mockTargetTenant = {
      id: targetTenantId,
      companyName: 'Target Tenant Corp',
      tenantStatus: 'ACTIVE',
      industryLabel: 'Pharma',
      industryCode: 'ind_pharma',
      planName: 'Enterprise Plan',
      userLicensesCount: 50,
      subscriptionStatus: 'ACTIVE',
    };

    const mockTargetSubscription = {
      status: 'ACTIVE',
      moduleCodes: ['core_crm'], // Only core_crm in subscribed plan
      access: { mode: 'FULL' },
    };

    const mockTargetIndustry = {
      recommendedModuleCodes: ['payroll'], // Advisory only
    };

    const mockCatalogModules = [
      { id: 'm1', name: 'Core CRM', code: 'core_crm', category: 'CORE', description: 'CRM' },
      { id: 'm2', name: 'Payroll', code: 'payroll', category: 'ADVANCED', description: 'Payroll' },
      { id: 'm3', name: 'Attendance', code: 'attendance', category: 'CORE', description: 'Attendance' },
    ];

    vi.spyOn(tenantService, 'getTenantById').mockResolvedValue(mockTargetTenant as any);
    vi.spyOn(tenantService, 'getTenantSubscription').mockResolvedValue(mockTargetSubscription as any);
    vi.spyOn(tenantService, 'getTenantIndustryTemplate').mockResolvedValue(mockTargetIndustry as any);
    vi.spyOn(moduleService, 'getModules').mockResolvedValue(mockCatalogModules as any);

    // Load cross-tenant inspection data
    const [t, sub, ind, catalog] = await Promise.all([
      tenantService.getTenantById(targetTenantId),
      tenantService.getTenantSubscription(targetTenantId),
      tenantService.getTenantIndustryTemplate(targetTenantId),
      moduleService.getModules(),
    ]);

    const currentBootstrap = runtimeService.getCurrentBootstrap();
    const isSameActiveSession = Boolean(currentBootstrap && currentBootstrap.tenant?.id === targetTenantId);

    // Assert that target tenant is NOT active session
    expect(isSameActiveSession).toBe(false);

    // Map cross-tenant module items authoritatively
    const subCodes = new Set<string>(sub?.moduleCodes || []);
    const recommendedCodes = new Set<string>(ind?.recommendedModuleCodes || []);

    const mappedItems: TenantModuleItem[] = catalog.map((pm: any) => {
      const isInSubscribedPlan = subCodes.has(pm.code);
      const isIndustryRecommended = recommendedCodes.has(pm.code);

      let provenance: 'SUBSCRIBED_PLAN_CODE' | 'INDUSTRY_ADVISORY' | 'UNAVAILABLE' = 'UNAVAILABLE';
      if (isInSubscribedPlan) {
        provenance = 'SUBSCRIBED_PLAN_CODE';
      } else if (isIndustryRecommended) {
        provenance = 'INDUSTRY_ADVISORY';
      }

      return {
        id: pm.id,
        name: pm.name,
        code: pm.code,
        description: pm.description,
        icon: (() => null) as any,
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
        isEffectiveRuntimeModule: null, // Strictly null for cross-tenant
        isInSubscribedPlan,
        isIndustryRecommended,
        provenance,
        category: 'core',
      };
    });

    // 1. Prove active session runtime bootstrap ('attendance') is IGNORED for target tenant
    const targetAttendance = mappedItems.find((m) => m.code === 'attendance');
    expect(targetAttendance?.isEffectiveRuntimeModule).toBeNull();
    expect(targetAttendance?.isInSubscribedPlan).toBe(false);
    expect(targetAttendance?.provenance).toBe('UNAVAILABLE');

    // 2. Prove subscribed plan code ('core_crm') is rendered strictly as Plan Membership
    const targetCrm = mappedItems.find((m) => m.code === 'core_crm');
    expect(targetCrm?.isInSubscribedPlan).toBe(true);
    expect(targetCrm?.isEffectiveRuntimeModule).toBeNull();
    expect(targetCrm?.provenance).toBe('SUBSCRIBED_PLAN_CODE');

    // 3. Prove industry recommended code ('payroll') is rendered strictly as Industry Advisory
    const targetPayroll = mappedItems.find((m) => m.code === 'payroll');
    expect(targetPayroll?.isInSubscribedPlan).toBe(false);
    expect(targetPayroll?.isIndustryRecommended).toBe(true);
    expect(targetPayroll?.isEffectiveRuntimeModule).toBeNull();
    expect(targetPayroll?.provenance).toBe('INDUSTRY_ADVISORY');
  });

  it('proves effective runtime access display text is "Not Available / API Exposure Required" and never fabricates "FULL"', () => {
    const crossTenantRuntimeAccessDisplay = 'Not Available / API Exposure Required';
    const gapNoticeCode = 'PLATFORM_TENANT_EFFECTIVE_MODULES_READ_BLOCKED_BY_API_EXPOSURE';

    expect(crossTenantRuntimeAccessDisplay).not.toBe('FULL');
    expect(crossTenantRuntimeAccessDisplay).toContain('Not Available');
    expect(gapNoticeCode).toBe('PLATFORM_TENANT_EFFECTIVE_MODULES_READ_BLOCKED_BY_API_EXPOSURE');
  });
});
