import { PlanVersionRecord } from '../types/plan-version.types';
import { api } from '../../../../../common/api';

class ApiPlanVersionService {
  async getVersions(planId: string): Promise<PlanVersionRecord[]> {
    try {
      const response = await api.get(`/platform/plans/${planId}/versions`);
      const backendVersions: any[] = response.data;

      return backendVersions.map((v) => {
        const pricingList: any[] = v.pricing || [];
        const limitsList: any[] = v.limits || [];
        const rules = v.commercialRule || {};

        const monthly = pricingList.find((p) => p.billingCycle === 'MONTHLY');
        const annual = pricingList.find((p) => p.billingCycle === 'ANNUAL');
        const firstPrice = monthly || annual || {};

        const modelMap: Record<string, any> = {
          PER_USER: 'Per User',
          BASE_PLUS_PER_USER: 'Base + Per User',
          FLAT: 'Flat Monthly',
          CUSTOM_CONTRACT: 'Custom Contract',
        };

        const limitsMap: Record<string, any> = {};
        for (const l of limitsList) {
          limitsMap[l.limitCode] = l;
        }

        const displayStatusMap: Record<string, 'Current' | 'Replaced' | 'Draft' | 'Archived'> = {
          CURRENT: 'Current',
          REPLACED: 'Replaced',
          DRAFT: 'Draft',
        };

        return {
          id: v.id,
          planId: v.planId,
          version: v.version,
          status: displayStatusMap[v.displayStatus] || 'Draft',
          publishedAt: v.publishedAt || undefined,
          effectiveFrom: v.publishedAt || undefined,
          actorName: v.publishedByUserId ? 'Platform Admin' : 'System',
          changeSummary: [
            `Version ${v.version} commercial snapshot (${v.displayStatus})`,
          ],
          snapshot: {
            pricing: {
              model: modelMap[firstPrice.model] || 'Per User',
              monthlyPerUser: monthly?.perSeatFee ? Number(monthly.perSeatFee) : undefined,
              annualPerUser: annual?.perSeatFee ? Number(annual.perSeatFee) : undefined,
              allowMonthlyBilling: Boolean(monthly),
              allowAnnualBilling: Boolean(annual),
              defaultBillingCycle: annual && !monthly ? 'Annual' : 'Monthly',
              currency: firstPrice.currency || 'INR',
              taxMode: firstPrice.taxMode === 'INCLUSIVE' ? 'Inclusive' : 'Exclusive',
              prorationPolicy: firstPrice.prorationPolicy === 'NEXT_BILLING_CYCLE' ? 'Next Billing Cycle' : firstPrice.prorationPolicy === 'IMMEDIATE' ? 'Prorate Immediately' : 'No Proration',
            },
            limits: {
              minimumSeats: limitsMap.minimum_seats?.integerValue ?? 1,
              defaultSeatLimit: limitsMap.default_seat_limit?.integerValue ?? 5,
              maximumSeats: limitsMap.maximum_seats?.integerValue ?? 25,
              seatIncrement: limitsMap.seat_increment?.integerValue ?? 1,
              storageGb: limitsMap.storage_gb?.decimalValue ? Number(limitsMap.storage_gb.decimalValue) : 10,
              dataRetentionDays: limitsMap.data_retention_days?.integerValue ?? 90,
            },
            includedModuleCodes: v.includedModuleCodes || [],
            commercialRules: {
              trialEnabled: Boolean(rules.trialEnabled),
              trialDurationDays: rules.trialDurationDays ?? 14,
              trialModulePolicy: rules.trialModulePolicy === 'RESTRICTED' ? 'Restricted' : 'Use Plan Modules',
              autoConvertAfterTrial: Boolean(rules.autoConvertAfterTrial),
              autoRenew: rules.autoRenew !== false,
              allowUpgrade: rules.allowUpgrade !== false,
              allowDowngrade: Boolean(rules.allowDowngrade),
              changeEffectiveTiming: rules.changeEffectiveTiming === 'NEXT_BILLING_CYCLE' ? 'Next Billing Cycle' : 'Immediately',
              minimumCommitment: rules.minimumCommitmentMonths === '12' ? '12 Months' : rules.minimumCommitmentMonths === '6' ? '6 Months' : rules.minimumCommitmentMonths === '3' ? '3 Months' : rules.minimumCommitmentMonths === '1' ? '1 Month' : 'None',
              availableForNewTenants: rules.availableForNewTenants !== false,
              availableForExistingTenants: rules.availableForExistingTenants !== false,
              cancellationAllowed: rules.cancellationAllowed !== false,
              gracePeriodDays: rules.gracePeriodDays ?? 7,
              accessAfterExpiry: rules.accessAfterExpiry === 'BLOCKED' ? 'Blocked' : 'Read Only',
            },
          },
        };
      });
    } catch {
      return [];
    }
  }

  async getVersion(planId: string, versionNumber: number): Promise<PlanVersionRecord | null> {
    const list = await this.getVersions(planId);
    return list.find((v) => v.version === versionNumber) || null;
  }
}

export const planVersionService = new ApiPlanVersionService();
