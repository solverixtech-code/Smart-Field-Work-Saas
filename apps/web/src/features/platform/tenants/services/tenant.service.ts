import { Tenant, TenantStatus, SubscriptionStatus, TenantCreateFormState } from '../types/platform.types';
import { MOCK_TENANTS, PLATFORM_INDUSTRIES, PLATFORM_PLANS } from '../fixtures/platform.fixtures';
import { resolveProvisioningLifecycle } from '../utils/provisioning-lifecycle.utils';

export interface ITenantService {
  getTenants(): Promise<Tenant[]>;
  getTenantById(id: string): Promise<Tenant | undefined>;
  createTenant(input: TenantCreateFormState): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant>;
  updateTenantModules(id: string, moduleCodes: string[]): Promise<Tenant>;
  deleteTenant(id: string): Promise<void>;
  updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant>;
  updateSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<Tenant>;
}

class FixtureTenantService implements ITenantService {
  private tenants: Tenant[] = [...MOCK_TENANTS];

  private nowTimestamp(): string {
    return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · 12:00 PM';
  }

  async getTenants(): Promise<Tenant[]> {
    return Promise.resolve([...this.tenants]);
  }

  async getTenantById(id: string): Promise<Tenant | undefined> {
    if (!id) return Promise.resolve(undefined);
    const found = this.tenants.find((t) => t.id === id || t.slug === id);
    return Promise.resolve(found);
  }

  async createTenant(input: TenantCreateFormState): Promise<Tenant> {
    const selectedIndustry = PLATFORM_INDUSTRIES.find((i) => i.id === input.industryId);
    if (!selectedIndustry) {
      throw new Error(`Invalid industry selected: ${input.industryId}`);
    }

    const selectedPlan = PLATFORM_PLANS.find((p) => p.id === input.planId);
    if (!selectedPlan) {
      throw new Error(`Invalid plan selected: ${input.planId}`);
    }

    const lifecycle = resolveProvisioningLifecycle(
      input.provisioningType,
      input.paymentCollectionMethod,
      input.userLicensesCount,
      selectedPlan.monthlyPricePerUser,
      input.isDraft
    );

    const newTenant: Tenant = {
      id: input.draftTenantId || `t_${input.slug || Date.now()}`,
      slug: input.slug || `tenant-${Date.now()}`,
      companyName: input.companyName,
      legalEntityName: input.legalEntityName || input.companyName,
      taxId: input.taxId,
      domain: input.domain || `${input.slug || 'tenant'}.smartfieldwork.com`,
      website: input.website,
      logoUrl: undefined,
      industryId: selectedIndustry.id,
      industryCode: selectedIndustry.code,
      industryLabel: selectedIndustry.label,
      companySize: input.companySize,
      country: input.country || 'India',
      timezone: input.timezone || 'Asia/Kolkata (IST +5:30)',
      currency: input.currency || 'INR (₹)',
      
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      dateFormat: input.dateFormat,
      financialYearStart: input.financialYearStart,
      weekStartDay: input.weekStartDay,
      totalEmployees: input.totalEmployees,
      fieldUsers: input.fieldUsers,
      yearsInBusiness: input.yearsInBusiness,
      businessModel: input.businessModel,
      branchCount: input.branchCount,
      billingCycle: input.billingCycle,
      seatLimit: input.seatLimit,
      storageLimit: input.storageLimit,
      subscriptionStartDate: input.subscriptionStartDate,
      trialDurationDays: input.trialDurationDays,
      draftTenantId: input.draftTenantId,
      
      tenantStatus: lifecycle.tenantStatus,
      subscriptionStatus: lifecycle.subscriptionStatus,
      
      adminUser: {
        fullName: input.adminFullName,
        email: input.adminEmail,
        phone: input.adminPhone,
        designation: input.adminDesignation,
        sendInviteEmail: input.sendInviteEmail
      },
      
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      provisioningType: input.provisioningType,
      userLicensesCount: input.userLicensesCount,
      enabledModuleCodes: input.selectedModuleCodes,
      
      trialStartDate: input.provisioningType === 'Free Trial' ? new Date().toISOString().split('T')[0] : undefined,
      trialEndDate: input.provisioningType === 'Free Trial' ? new Date(Date.now() + (input.trialDurationDays || 14) * 86400000).toISOString().split('T')[0] : undefined,
      trialConversionPolicy: input.trialConversionPolicy,
      
      billingContactName: input.billingContactName,
      billingContactEmail: input.billingContactEmail,
      paymentCollectionMethod: input.paymentCollectionMethod,
      
      mrr: lifecycle.mrr,
      usage: {
        usersUsed: 1,
        storageUsedGb: 5,
        apiRequestsUsed: 120,
      },
      createdAt: this.nowTimestamp(),
      updatedAt: this.nowTimestamp()
    };

    // If updating an existing draft by ID
    const existingIndex = this.tenants.findIndex((t) => t.id === newTenant.id);
    if (existingIndex >= 0) {
      this.tenants[existingIndex] = newTenant;
    } else {
      this.tenants.unshift(newTenant);
    }

    return Promise.resolve(newTenant);
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) throw new Error('Tenant not found');

    // If industryId changed, re-resolve label/code from fixtures
    if (updates.industryId && updates.industryId !== tenant.industryId) {
      const industry = PLATFORM_INDUSTRIES.find((i) => i.id === updates.industryId);
      if (!industry) {
        throw new Error(`Invalid industry selected: ${updates.industryId}`);
      }
      updates.industryCode = industry.code;
      updates.industryLabel = industry.label;
    }

    // If planId changed, re-resolve plan name and recalculate MRR
    if (updates.planId && updates.planId !== tenant.planId) {
      const plan = PLATFORM_PLANS.find((p) => p.id === updates.planId);
      if (!plan) {
        throw new Error(`Invalid plan selected: ${updates.planId}`);
      }
      updates.planName = plan.name;
    }

    // Re-eval lifecycle if provisioning fields change
    if (updates.provisioningType || updates.paymentCollectionMethod || updates.userLicensesCount || updates.planId) {
      const pType = updates.provisioningType || tenant.provisioningType;
      const pMethod = updates.paymentCollectionMethod || tenant.paymentCollectionMethod;
      const pCount = updates.userLicensesCount ?? tenant.userLicensesCount;
      const pPlanId = updates.planId || tenant.planId;
      const planObj = PLATFORM_PLANS.find((p) => p.id === pPlanId);
      
      if (planObj) {
        const lifecycle = resolveProvisioningLifecycle(
          pType,
          pMethod,
          pCount,
          planObj.monthlyPricePerUser,
          tenant.tenantStatus === 'Draft'
        );
        updates.tenantStatus = updates.tenantStatus || lifecycle.tenantStatus;
        updates.subscriptionStatus = updates.subscriptionStatus || lifecycle.subscriptionStatus;
        updates.mrr = lifecycle.mrr;
      }
    }

    Object.assign(tenant, updates, { updatedAt: this.nowTimestamp() });
    return Promise.resolve({ ...tenant });
  }

  async updateTenantModules(id: string, moduleCodes: string[]): Promise<Tenant> {
    return this.updateTenant(id, { enabledModuleCodes: moduleCodes });
  }

  async deleteTenant(id: string): Promise<void> {
    const idx = this.tenants.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Tenant not found');
    this.tenants.splice(idx, 1);
    return Promise.resolve();
  }

  async updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) throw new Error('Tenant not found');
    tenant.tenantStatus = status;
    tenant.updatedAt = this.nowTimestamp();
    return Promise.resolve(tenant);
  }

  async updateSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<Tenant> {
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) throw new Error('Tenant not found');
    tenant.subscriptionStatus = status;
    tenant.updatedAt = this.nowTimestamp();
    return Promise.resolve(tenant);
  }
}

export const tenantService: ITenantService = new FixtureTenantService();

