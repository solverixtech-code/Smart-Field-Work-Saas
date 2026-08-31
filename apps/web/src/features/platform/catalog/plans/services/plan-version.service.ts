import { PlanVersionRecord } from '../types/plan-version.types';
import { CANONICAL_PLATFORM_PLANS } from '../fixtures/plan.fixtures';

// Seeding realistic historical versions for canonical plans
const SEEDED_VERSION_HISTORY: Record<string, PlanVersionRecord[]> = {
  plan_professional: [
    {
      id: 'ver_prof_v1_2',
      planId: 'plan_professional',
      version: 1.2,
      status: 'Current',
      publishedAt: '2026-06-15',
      effectiveFrom: '2026-06-15',
      actorName: 'Sahibjit Singh (Platform Admin)',
      changeSummary: [
        'Added Face AI Geofence Attendance module to included package',
        'Increased storage limit from 50 GB to 100 GB',
        'Updated annual billing discount rate to 17%',
      ],
      snapshot: {
        pricing: {
          model: 'Per User',
          monthlyPerUser: 899,
          annualPerUser: 749,
          allowMonthlyBilling: true,
          allowAnnualBilling: true,
          defaultBillingCycle: 'Annual',
          currency: 'INR',
        },
        limits: {
          minimumSeats: 10,
          defaultSeatLimit: 50,
          maximumSeats: 250,
          seatIncrements: 5,
          storageGb: 100,
          apiRequestsPerMonth: 100000,
          activeWorkflowsLimit: 25,
          customFormsLimit: 50,
          aiCreditsPerMonth: 5000,
          reportExportsPerMonth: 500,
          dataRetentionDays: 365,
        },
        includedModuleCodes: ['core_crm', 'field_visits', 'demo_scheduler', 'order_management', 'attendance_plus'],
        commercialRules: {
          trialEnabled: true,
          trialDurationDays: 14,
          autoRenewDefault: true,
          allowSelfServiceUpgrade: true,
          allowSelfServiceDowngrade: false,
          effectiveTiming: 'Immediate',
        },
      },
    },
    {
      id: 'ver_prof_v1_1',
      planId: 'plan_professional',
      version: 1.1,
      status: 'Replaced',
      publishedAt: '2026-01-10',
      effectiveFrom: '2026-01-10',
      effectiveTo: '2026-06-14',
      actorName: 'Platform Operations Team',
      changeSummary: [
        'Introduced minimum 10-seat commitment rule',
        'Added Demo Scheduler module to core inclusions',
      ],
      snapshot: {
        pricing: {
          model: 'Per User',
          monthlyPerUser: 899,
          annualPerUser: 749,
          allowMonthlyBilling: true,
          allowAnnualBilling: true,
          defaultBillingCycle: 'Annual',
          currency: 'INR',
        },
        limits: {
          minimumSeats: 10,
          defaultSeatLimit: 50,
          maximumSeats: 200,
          seatIncrements: 5,
          storageGb: 50,
          apiRequestsPerMonth: 50000,
          activeWorkflowsLimit: 15,
          customFormsLimit: 30,
          aiCreditsPerMonth: 2500,
          reportExportsPerMonth: 250,
          dataRetentionDays: 180,
        },
        includedModuleCodes: ['core_crm', 'field_visits', 'demo_scheduler', 'order_management'],
        commercialRules: {
          trialEnabled: true,
          trialDurationDays: 14,
          autoRenewDefault: true,
          allowSelfServiceUpgrade: true,
          allowSelfServiceDowngrade: false,
          effectiveTiming: 'Immediate',
        },
      },
    },
    {
      id: 'ver_prof_v1_0',
      planId: 'plan_professional',
      version: 1.0,
      status: 'Archived',
      publishedAt: '2025-09-01',
      effectiveFrom: '2025-09-01',
      effectiveTo: '2026-01-09',
      actorName: 'System Initial Release',
      changeSummary: [
        'Initial release of Professional Field Suite plan',
        'Set base monthly rate to ₹899/user',
      ],
      snapshot: {
        pricing: {
          model: 'Per User',
          monthlyPerUser: 899,
          annualPerUser: 749,
          allowMonthlyBilling: true,
          allowAnnualBilling: true,
          defaultBillingCycle: 'Monthly',
          currency: 'INR',
        },
        limits: {
          minimumSeats: 5,
          defaultSeatLimit: 25,
          maximumSeats: 100,
          seatIncrements: 5,
          storageGb: 25,
          apiRequestsPerMonth: 25000,
          activeWorkflowsLimit: 10,
          customFormsLimit: 15,
          aiCreditsPerMonth: 1000,
          reportExportsPerMonth: 100,
          dataRetentionDays: 90,
        },
        includedModuleCodes: ['core_crm', 'field_visits', 'order_management'],
        commercialRules: {
          trialEnabled: true,
          trialDurationDays: 14,
          autoRenewDefault: true,
          allowSelfServiceUpgrade: true,
          allowSelfServiceDowngrade: true,
          effectiveTiming: 'Next Billing Cycle',
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
