import { Tenant, TenantStatus, SubscriptionStatus, TenantCreateFormState } from '../types/platform.types';
import { MOCK_TENANTS, PLATFORM_INDUSTRIES, PLATFORM_PLANS, PLATFORM_MODULES } from '../fixtures/platform.fixtures';

export interface ITenantService {
  getTenants(): Promise<Tenant[]>;
  getTenantById(id: string): Promise<Tenant | undefined>;
  createTenant(input: TenantCreateFormState): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant>;
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
    const found = this.tenants.find(
      (t) =>
        t.id === id ||
        t.slug === id ||
        t.id.toLowerCase().includes(id.toLowerCase()) ||
        t.companyName.toLowerCase().includes(id.toLowerCase())
    );
    return Promise.resolve(found || this.tenants[0]);
  }

  async createTenant(input: TenantCreateFormState): Promise<Tenant> {
    const selectedIndustry = PLATFORM_INDUSTRIES.find((i) => i.id === input.industryId) || PLATFORM_INDUSTRIES[0];
    const selectedPlan = PLATFORM_PLANS.find((p) => p.id === input.planId) || PLATFORM_PLANS[0];

    const newTenant: Tenant = {
      id: `t_${input.slug || Date.now()}`,
      slug: input.slug || `tenant-${Date.now()}`,
      companyName: input.companyName,
      legalEntityName: input.legalEntityName || input.companyName,
      taxId: input.taxId,
      domain: `${input.slug || 'tenant'}.smartfieldwork.com`,
      industryId: selectedIndustry.id,
      industryCode: selectedIndustry.code,
      industryLabel: selectedIndustry.label,
      companySize: input.companySize,
      country: input.country || 'India',
      timezone: input.timezone || 'Asia/Kolkata (IST +5:30)',
      currency: input.currency || 'INR (₹)',
      
      tenantStatus: input.isDraft ? 'Draft' : input.provisioningType === 'Free Trial' ? 'Trial' : 'Active',
      subscriptionStatus: input.provisioningType === 'Free Trial' ? 'Trialing' : 'Active',
      
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
      trialEndDate: input.provisioningType === 'Free Trial' ? new Date(Date.now() + input.trialDurationDays * 86400000).toISOString().split('T')[0] : undefined,
      trialConversionPolicy: input.trialConversionPolicy,
      
      billingContactName: input.billingContactName,
      billingContactEmail: input.billingContactEmail,
      paymentCollectionMethod: input.paymentCollectionMethod,
      
      mrr: input.provisioningType === 'Free Trial' ? 0 : input.userLicensesCount * selectedPlan.monthlyPricePerUser,
      createdAt: this.nowTimestamp(),
      updatedAt: this.nowTimestamp()
    };

    this.tenants.unshift(newTenant);
    return Promise.resolve(newTenant);
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) throw new Error('Tenant not found');

    // If industryId changed, re-resolve label/code from fixtures
    if (updates.industryId && updates.industryId !== tenant.industryId) {
      const industry = PLATFORM_INDUSTRIES.find((i) => i.id === updates.industryId);
      if (industry) {
        updates.industryCode = industry.code;
        updates.industryLabel = industry.label;
      }
    }

    // If planId changed, re-resolve plan name and recalculate MRR
    if (updates.planId && updates.planId !== tenant.planId) {
      const plan = PLATFORM_PLANS.find((p) => p.id === updates.planId);
      if (plan) {
        updates.planName = plan.name;
        const licenses = updates.userLicensesCount ?? tenant.userLicensesCount;
        updates.mrr = licenses * plan.monthlyPricePerUser;
      }
    }

    Object.assign(tenant, updates, { updatedAt: this.nowTimestamp() });
    return Promise.resolve({ ...tenant });
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
