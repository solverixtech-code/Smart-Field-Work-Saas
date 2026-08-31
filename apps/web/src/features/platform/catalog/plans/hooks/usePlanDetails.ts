import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plan } from '../types/plan.types';
import { planService } from '../services/plan.service';
import { moduleService } from '../../modules/services/module.service';
import { PlatformModule } from '../../modules/types/module.types';
import { tenantService } from '../../../tenants/services/tenant.service';
import { Tenant } from '../../../tenants/types/platform.types';

export interface PlanDetailMetrics {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  pastDueTenants: number;
  suspendedTenants: number;
  totalMrr: number;
  arrProjection: number;
}

export function usePlanDetails(planId: string | undefined) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [allModules, setAllModules] = useState<PlatformModule[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!planId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const [fetchedPlan, fetchedModules, fetchedTenants] = await Promise.all([
        planService.getPlanById(planId),
        moduleService.getModules(),
        tenantService.getTenants(),
      ]);

      if (!fetchedPlan) {
        setError(`Plan with ID '${planId}' was not found.`);
        setPlan(null);
      } else {
        setPlan(fetchedPlan);
      }
      setAllModules(fetchedModules);
      setTenants(fetchedTenants);
    } catch (err: any) {
      setError(err?.message || 'Failed to load plan details');
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Derived included modules
  const includedModules = useMemo(() => {
    if (!plan) return [];
    return allModules.filter((m) => plan.includedModuleCodes.includes(m.code));
  }, [plan, allModules]);

  // Derived plan tenants (strictly matching planId)
  const planTenants = useMemo(() => {
    if (!plan) return [];
    return tenants.filter((t) => t.planId === plan.id);
  }, [plan, tenants]);

  // Derived live metrics
  const metrics = useMemo<PlanDetailMetrics>(() => {
    const totalTenants = planTenants.length;
    const activeTenants = planTenants.filter((t) => t.tenantStatus === 'Active').length;
    const trialTenants = planTenants.filter((t) => t.tenantStatus === 'Trial').length;
    const pastDueTenants = planTenants.filter((t) => t.tenantStatus === 'Past Due').length;
    const suspendedTenants = planTenants.filter((t) => t.tenantStatus === 'Suspended').length;
    const totalMrr = planTenants.reduce((sum, t) => sum + (t.mrr || 0), 0);
    const arrProjection = totalMrr * 12;

    return {
      totalTenants,
      activeTenants,
      trialTenants,
      pastDueTenants,
      suspendedTenants,
      totalMrr,
      arrProjection,
    };
  }, [planTenants]);

  return {
    plan,
    allModules,
    includedModules,
    planTenants,
    metrics,
    loading,
    error,
    refresh: fetchDetails,
  };
}
