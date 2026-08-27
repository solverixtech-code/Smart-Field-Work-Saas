import { Tenant, TenantStatus, SubscriptionStatus, TenantCreateFormState } from '../types/platform.types';
import { MOCK_TENANTS, PLATFORM_INDUSTRIES, PLATFORM_PLANS, PLATFORM_MODULES } from '../fixtures/platform.fixtures';

export interface ITenantService {
  getTenants(): Promise<Tenant[]>;
  getTenantById(id: string): Promise<Tenant | undefined>;
  createTenant(input: TenantCreateFormState): Promise<Tenant>;
  updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant>;
  updateSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<Tenant>;
}

class FixtureTenantService implements ITenantService {
  private tenants: Tenant[] = [...MOCK_TENANTS];

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
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · 12:00 PM',
      updatedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · 12:00 PM'
    };

    this.tenants.unshift(newTenant);
    return Promise.resolve(newTenant);
  }

  async updateTenantStatus(id: string, status: TenantStatus): Promise<Tenant> {
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) throw new Error('Tenant not found');
    tenant.tenantStatus = status;
    tenant.updatedAt = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · 12:00 PM';
    return Promise.resolve(tenant);
  }

  async updateSubscriptionStatus(id: string, status: SubscriptionStatus): Promise<Tenant> {
    const tenant = this.tenants.find((t) => t.id === id);
    if (!tenant) throw new Error('Tenant not found');
    tenant.subscriptionStatus = status;
    tenant.updatedAt = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · 12:00 PM';
    return Promise.resolve(tenant);
  }
}

export const tenantService: ITenantService = new FixtureTenantService();
