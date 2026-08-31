import { PlanVersionRecord } from '../types/plan-version.types';
import { CANONICAL_PLATFORM_PLANS } from '../fixtures/plan.fixtures';

// Seeding realistic historical versions for canonical plans
const SEEDED_VERSION_HISTORY: Record<string, PlanVersionRecord[]> = {
  plan_professional: [
    {
      id: 'ver_prof_v1_0',
      planId: 'plan_professional',
      version: 1.0,
      status: 'Current',
      publishedAt: '2026-05-28',
      effectiveFrom: '2026-05-28',
      actorName: 'Sahibjit Singh (Platform Admin)',
      changeSummary: [
        'Active production version for Professional Field Suite (PROFESSIONAL)',
        'Configured with Per User model (₹1,199/mo, ₹999/yr) and 100 GB storage allowance',
      ],
      snapshot: {
        pricing: {
          model: 'Per User',
          monthlyPerUser: 1199,
          annualPerUser: 999,
          allowMonthlyBilling: true,
          allowAnnualBilling: true,
          defaultBillingCycle: 'Annual',
          currency: 'INR',
          taxMode: 'Exclusive',
          prorationPolicy: 'Prorate Immediately',
        },
        limits: {
          minimumSeats: 5,
          defaultSeatLimit: 50,
          maximumSeats: 250,
          seatIncrement: 5,
          storageGb: 100,
          apiRequestsPerMonth: 100000,
          activeWorkflows: 25,
          customForms: 50,
          aiCreditsPerMonth: 5000,
          reportExportsPerMonth: 500,
          dataRetentionDays: 365,
        },
        includedModuleCodes: ['core_crm', 'field_visits', 'demo_scheduler', 'order_management', 'attendance_plus'],
        commercialRules: {
          trialEnabled: true,
          trialDurationDays: 14,
          trialModulePolicy: 'Use Plan Modules',
          autoConvertAfterTrial: false,
          autoRenew: true,
          allowUpgrade: true,
          allowDowngrade: false,
          changeEffectiveTiming: 'Immediately',
          minimumCommitment: '1 Month',
          availableForNewTenants: true,
          availableForExistingTenants: true,
          cancellationAllowed: true,
          gracePeriodDays: 7,
          accessAfterExpiry: 'Read Only',
        },
      },
    },
    {
      id: 'ver_prof_v0_9',
      planId: 'plan_professional',
      version: 0.9,
      status: 'Replaced',
      publishedAt: '2026-03-15',
      effectiveFrom: '2026-03-15',
      effectiveTo: '2026-05-27',
      actorName: 'Sahibjit Singh (Platform Admin)',
      changeSummary: [
        'Added Attendance & Leave Tracking module and increased storage allowance to 80 GB',
      ],
      snapshot: {
        pricing: {
          model: 'Per User',
          monthlyPerUser: 1099,
          annualPerUser: 899,
          allowMonthlyBilling: true,
          allowAnnualBilling: true,
          defaultBillingCycle: 'Annual',
          currency: 'INR',
          taxMode: 'Exclusive',
          prorationPolicy: 'Prorate Immediately',
        },
        limits: {
          minimumSeats: 5,
          defaultSeatLimit: 50,
          maximumSeats: 200,
          seatIncrement: 5,
          storageGb: 80,
          apiRequestsPerMonth: 75000,
          activeWorkflows: 20,
          customForms: 30,
          aiCreditsPerMonth: 3000,
          reportExportsPerMonth: 300,
          dataRetentionDays: 180,
        },
        includedModuleCodes: ['core_crm', 'field_visits', 'demo_scheduler', 'order_management'],
        commercialRules: {
          trialEnabled: true,
          trialDurationDays: 14,
          trialModulePolicy: 'Use Plan Modules',
          autoConvertAfterTrial: false,
          autoRenew: true,
          allowUpgrade: true,
          allowDowngrade: false,
          changeEffectiveTiming: 'Immediately',
          minimumCommitment: '1 Month',
          availableForNewTenants: true,
          availableForExistingTenants: true,
          cancellationAllowed: true,
          gracePeriodDays: 7,
          accessAfterExpiry: 'Read Only',
        },
      },
    },
    {
      id: 'ver_prof_v0_8',
      planId: 'plan_professional',
      version: 0.8,
      status: 'Archived',
      publishedAt: '2026-01-10',
      effectiveFrom: '2026-01-10',
      effectiveTo: '2026-03-14',
      actorName: 'Ananya Sharma (Product Manager)',
      changeSummary: [
        'Initial beta release configuration for Professional Field Suite',
      ],
      snapshot: {
        pricing: {
          model: 'Per User',
          monthlyPerUser: 999,
          annualPerUser: 799,
          allowMonthlyBilling: true,
          allowAnnualBilling: true,
          defaultBillingCycle: 'Monthly',
          currency: 'INR',
          taxMode: 'Exclusive',
          prorationPolicy: 'No Proration',
        },
        limits: {
          minimumSeats: 5,
          defaultSeatLimit: 25,
          maximumSeats: 100,
          seatIncrement: 5,
          storageGb: 50,
          apiRequestsPerMonth: 50000,
          activeWorkflows: 15,
          customForms: 20,
          aiCreditsPerMonth: 2500,
          reportExportsPerMonth: 200,
          dataRetentionDays: 90,
        },
        includedModuleCodes: ['core_crm', 'field_visits', 'order_management'],
        commercialRules: {
          trialEnabled: true,
          trialDurationDays: 14,
          trialModulePolicy: 'Use Plan Modules',
          autoConvertAfterTrial: false,
          autoRenew: true,
          allowUpgrade: true,
          allowDowngrade: true,
          changeEffectiveTiming: 'Next Billing Cycle',
          minimumCommitment: '1 Month',
          availableForNewTenants: true,
          availableForExistingTenants: true,
          cancellationAllowed: true,
          gracePeriodDays: 7,
          accessAfterExpiry: 'Read Only',
        },
      },
    },
  ],
};

class PlanVersionService {
  async getVersions(planId: string): Promise<PlanVersionRecord[]> {
    if (SEEDED_VERSION_HISTORY[planId]) {
      return SEEDED_VERSION_HISTORY[planId];
    }

    // Default current version generator for any plan
    const canonical = CANONICAL_PLATFORM_PLANS.find((p) => p.id === planId);
    if (!canonical) return [];

    return [
      {
        id: `ver_${planId}_current`,
        planId: canonical.id,
        version: canonical.version || 1.0,
        status: 'Current',
        publishedAt: '2026-06-01',
        effectiveFrom: '2026-06-01',
        actorName: 'Platform Operations Admin',
        changeSummary: ['Current published commercial configuration.'],
        snapshot: {
          pricing: canonical.pricing,
          limits: canonical.limits,
          includedModuleCodes: canonical.includedModuleCodes,
          commercialRules: canonical.commercialRules,
        },
      },
    ];
  }

  async getVersion(planId: string, version: number): Promise<PlanVersionRecord | null> {
    const list = await this.getVersions(planId);
    return list.find((v) => v.version === version) || null;
  }
}

export const planVersionService = new PlanVersionService();
