import { useState, useEffect, useCallback } from 'react';
import { Plan } from '../types/plan.types';
import { planService } from '../services/plan.service';
import { tenantService } from '../../../tenants/services/tenant.service';

export interface PlanMetrics {
  totalPlans: number;
  activePlans: number;
  draftPlans: number;
  archivedPlans: number;
  activeSubscriptions: number;
  trialTenants: number;
  totalMrr: number;
  tenantsByPlan: Record<string, number>;
  mrrByPlan: Record<string, number>;
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [metrics, setMetrics] = useState<PlanMetrics>({
    totalPlans: 0,
    activePlans: 0,
    draftPlans: 0,
    archivedPlans: 0,
    activeSubscriptions: 0,
    trialTenants: 0,
    totalMrr: 0,
    tenantsByPlan: {},
    mrrByPlan: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlansAndMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allPlans = await planService.getPlans();
      const allTenants = await tenantService.getTenants();

      const activePlans = allPlans.filter((p) => p.status === 'Active').length;
      const draftPlans = allPlans.filter((p) => p.status === 'Draft').length;
      const archivedPlans = allPlans.filter((p) => p.status === 'Archived').length;

      const activeSubs = allTenants.filter((t) => t.tenantStatus === 'Active').length;
      const trialTenants = allTenants.filter((t) => t.tenantStatus === 'Trial').length;
      const totalMrr = allTenants.reduce((acc, t) => acc + (t.mrr || 0), 0);

      const tenantsByPlan: Record<string, number> = {};
      const mrrByPlan: Record<string, number> = {};

      allPlans.forEach((p) => {
        tenantsByPlan[p.id] = 0;
        mrrByPlan[p.id] = 0;
      });

      allTenants.forEach((t) => {
        if (t.planId) {
          tenantsByPlan[t.planId] = (tenantsByPlan[t.planId] || 0) + 1;
          mrrByPlan[t.planId] = (mrrByPlan[t.planId] || 0) + (t.mrr || 0);
        }
      });

      setPlans(allPlans);
      setMetrics({
        totalPlans: allPlans.length,
        activePlans,
        draftPlans,
        archivedPlans,
        activeSubscriptions: activeSubs,
        trialTenants,
        totalMrr,
        tenantsByPlan,
        mrrByPlan,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlansAndMetrics();
  }, [fetchPlansAndMetrics]);

  return {
    plans,
    metrics,
    loading,
    error,
    refreshPlans: fetchPlansAndMetrics,
  };
}
