import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Search,
  RotateCcw,
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Layers,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { createPortal } from 'react-dom';

import { usePlans } from '../../features/platform/catalog/plans/hooks/usePlans';
import { Plan, PlanStatus, PricingModel } from '../../features/platform/catalog/plans/types/plan.types';
import { planService } from '../../features/platform/catalog/plans/services/plan.service';
import {
  formatCurrency,
  formatPlanMonthlyPrice,
  formatPlanAnnualPrice,
  getPlanStatusBadge,
} from '../../features/platform/catalog/plans/utils/plan-pricing.utils';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';

const PIE_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6'];

export function PlansPricingPage() {
  const navigate = useNavigate();
  const { plans, metrics, loading, error, refreshPlans } = usePlans();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedModel, setSelectedModel] = useState<string>('All');
  const [selectedBilling, setSelectedBilling] = useState<string>('All');

  // Action Menu state
  const [activeMenuPlanId, setActiveMenuPlanId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  // Archive Confirmation Modal
  const [archivingPlan, setArchivingPlan] = useState<Plan | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === 'All' ? true : plan.status === selectedStatus;

      const matchesModel =
        selectedModel === 'All' ? true : plan.pricing.model === selectedModel;

      const matchesBilling =
        selectedBilling === 'All'
          ? true
          : selectedBilling === 'Monthly'
          ? plan.pricing.allowMonthlyBilling
          : selectedBilling === 'Annual'
          ? plan.pricing.allowAnnualBilling
          : plan.pricing.allowMonthlyBilling && plan.pricing.allowAnnualBilling;

      return matchesSearch && matchesStatus && matchesModel && matchesBilling;
    });
  }, [plans, searchTerm, selectedStatus, selectedModel, selectedBilling]);

  // Handle Action menu open
  const handleOpenMenu = (e: React.MouseEvent, planId: string) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY + 4,
      left: rect.right + window.scrollX - 160,
    });
    setActiveMenuPlanId(activeMenuPlanId === planId ? null : planId);
  };

  // Close menu on backdrop click
  React.useEffect(() => {
    const handleOutsideClick = () => setActiveMenuPlanId(null);
    if (activeMenuPlanId) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [activeMenuPlanId]);

  // Actions
  const handleDuplicate = async (plan: Plan) => {
    setActiveMenuPlanId(null);
    try {
      const duplicated = await planService.duplicatePlan(plan.id);
      toast.success(`Plan '${plan.name}' duplicated as draft '${duplicated.name}'`);
      await refreshPlans();
      navigate(`/platform/plans/create?planId=${duplicated.id}`);
    } catch {
      toast.error('Failed to duplicate plan');
    }
  };

  const handleConfirmArchive = async () => {
    if (!archivingPlan) return;
    setIsArchiving(true);
    try {
      await planService.archivePlan(archivingPlan.id);
      toast.success(`Plan '${archivingPlan.name}' has been archived.`);
      await refreshPlans();
      setArchivingPlan(null);
    } catch {
      toast.error('Failed to archive plan');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleExportCatalog = () => {
    toast.success('Plan catalog exported as JSON payload.');
  };

  // Chart data for Adoption & MRR
  const pieChartData = useMemo(() => {
    return plans.map((p) => ({
      name: p.name,
      value: metrics.tenantsByPlan[p.id] || 0,
    })).filter((d) => d.value > 0);
  }, [plans, metrics]);

  const barChartData = useMemo(() => {
    return plans.map((p) => ({
      name: p.name.replace(' Field', '').replace(' Suite', ''),
      mrr: metrics.mrrByPlan[p.id] || 0,
    }));
  }, [plans, metrics]);

  return (
    <main className="flex-1 overflow-y-auto bg-[#F3F5F7]">
      <div className="mx-auto w-full max-w-[1720px] p-6 lg:p-8 space-y-6 font-sans">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span>Platform SaaS</span>
              <span>›</span>
              <span className="font-extrabold text-[#0D1F3D]">Plans & Pricing</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight mt-1 flex items-center gap-2.5">
              <span className="p-1.5 rounded-sm bg-indigo-50 text-indigo-600 border border-indigo-100">
                <CreditCard className="h-5 w-5" />
              </span>
              Plans & Pricing
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage commercial plans, pricing, limits, modules and tenant adoption across the Smart Field Work SaaS platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCatalog}
              className="gap-2 font-bold text-slate-700 h-10"
            >
              <Download className="h-4 w-4 text-slate-500" /> Export Catalog
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/platform/plans/create?step=basic')}
              className="gap-2 font-bold h-10 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Create Plan
            </Button>
          </div>
        </div>

        {/* 6 KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <KpiCard
            title="TOTAL PLANS"
            value={metrics.totalPlans.toString()}
            icon={Layers}
            iconBgColor="bg-indigo-50"
            iconTextColor="text-indigo-600"
            subtitle="Catalog tiers"
          />
          <KpiCard
            title="ACTIVE PLANS"
            value={metrics.activePlans.toString()}
            icon={CheckCircle2}
            iconBgColor="bg-emerald-50"
            iconTextColor="text-emerald-600"
            subtitle="Publicly available"
          />
          <KpiCard
            title="DRAFT PLANS"
            value={metrics.draftPlans.toString()}
            icon={Clock}
            iconBgColor="bg-slate-100"
            iconTextColor="text-slate-600"
            subtitle="In configuration"
          />
          <KpiCard
            title="ACTIVE SUBS"
            value={metrics.activeSubscriptions.toString()}
            icon={Users}
            iconBgColor="bg-blue-50"
            iconTextColor="text-blue-600"
            subtitle="Subscribed tenants"
          />
          <KpiCard
            title="TRIAL TENANTS"
            value={metrics.trialTenants.toString()}
            icon={Clock}
            iconBgColor="bg-amber-50"
            iconTextColor="text-amber-600"
            subtitle="14-day trials active"
          />
          <KpiCard
            title="TOTAL MRR"
            value={formatCurrency(metrics.totalMrr)}
            icon={TrendingUp}
            iconBgColor="bg-purple-50"
            iconTextColor="text-purple-600"
            subtitle="Combined recurring"
          />
        </div>

        {/* FILTER BAR */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search plans by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 h-10 text-xs font-semibold rounded-sm border border-slate-200 bg-[#F8FAFC] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0D1F3D] focus:ring-1 focus:ring-[#0D1F3D]"
              />
            </div>

            {/* Status Filter */}
            <div className="w-40">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-sm border border-slate-200 bg-[#F8FAFC] text-slate-700 focus:outline-none focus:border-[#0D1F3D]"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            {/* Pricing Model Filter */}
            <div className="w-48">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-sm border border-slate-200 bg-[#F8FAFC] text-slate-700 focus:outline-none focus:border-[#0D1F3D]"
              >
                <option value="All">All Pricing Models</option>
                <option value="Per User">Per User</option>
                <option value="Base + Per User">Base + Per User</option>
                <option value="Flat Monthly">Flat Monthly</option>
                <option value="Custom Contract">Custom Contract</option>
              </select>
            </div>

            {/* Billing Filter */}
            <div className="w-44">
              <select
                value={selectedBilling}
                onChange={(e) => setSelectedBilling(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-sm border border-slate-200 bg-[#F8FAFC] text-slate-700 focus:outline-none focus:border-[#0D1F3D]"
              >
                <option value="All">All Billing Cycles</option>
                <option value="Monthly">Monthly Billing</option>
                <option value="Annual">Annual Billing</option>
                <option value="Both">Both Enabled</option>
              </select>
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('All');
                setSelectedModel('All');
                setSelectedBilling('All');
              }}
              className="gap-2 font-bold text-slate-700 h-10"
            >
              <RotateCcw className="h-4 w-4 text-slate-400" /> Reset
            </Button>
          </div>
        </div>

        {/* MAIN CONTENT GRID: Table + Right Analytics Sidebar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Main Table Column */}
          <div className="lg:col-span-8 space-y-4">
            <div className="rounded-sm border border-slate-200 bg-white shadow-xs overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500 font-sans">
                  <div className="inline-block animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2" />
                  <p className="text-xs font-semibold">Loading plan catalog...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-rose-600">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-80" />
                  <p className="text-xs font-bold">{error}</p>
                </div>
              ) : filteredPlans.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Layers className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <h3 className="text-sm font-extrabold text-[#0D1F3D]">No plans found</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Try adjusting your search terms or filter selection.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-200 bg-[#F8FAFC] text-[11px] font-extrabold text-[#0D1F3D] uppercase tracking-wider">
                        <th className="py-3 px-4">#</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Plan Code</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Pricing Model</th>
                        <th className="py-3 px-4">Monthly Price</th>
                        <th className="py-3 px-4">Annual Price</th>
                        <th className="py-3 px-4">Min Seats</th>
                        <th className="py-3 px-4">Default Seats</th>
                        <th className="py-3 px-4">Storage</th>
                        <th className="py-3 px-4">Modules</th>
                        <th className="py-3 px-4">Trial</th>
                        <th className="py-3 px-4">Tenants</th>
                        <th className="py-3 px-4">MRR</th>
                        <th className="py-3 px-4">Version</th>
                        <th className="py-3 px-4">Updated On</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredPlans.map((plan, index) => {
                        const badge = getPlanStatusBadge(plan.status);
                        const tenantCount = metrics.tenantsByPlan[plan.id] || 0;
                        const planMrr = metrics.mrrByPlan[plan.id] || 0;

                        return (
                          <tr
                            key={plan.id}
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                            onClick={() => navigate(`/platform/plans/create?planId=${plan.id}&step=basic`)}
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                              {index + 1}
                            </td>
                            {/* Plan Cell */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="h-8 w-8 rounded-sm flex items-center justify-center text-white font-extrabold text-xs shadow-2xs shrink-0"
                                  style={{ backgroundColor: plan.color || '#6366F1' }}
                                >
                                  {plan.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-extrabold text-[#0D1F3D] text-xs flex items-center gap-1.5">
                                    {plan.name}
                                    {plan.badge && plan.badge !== 'None' && (
                                      <span className="inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-extrabold text-indigo-700 border border-indigo-100">
                                        {plan.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                                    {plan.description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#0D1F3D]">
                              {plan.code}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              {plan.pricing.model}
                            </td>
                            <td className="py-3.5 px-4 font-extrabold text-[#0D1F3D]">
                              {formatPlanMonthlyPrice(plan.pricing)}
                            </td>
                            <td className="py-3.5 px-4 font-extrabold text-emerald-700">
                              {formatPlanAnnualPrice(plan.pricing)}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                              {plan.limits.minimumSeats}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                              {plan.limits.defaultSeatLimit}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-slate-700">
                              {plan.limits.storageGb} GB
                            </td>
                            <td className="py-3.5 px-4 font-bold text-indigo-700">
                              {plan.includedModuleCodes.length} modules
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-700">
                              {plan.commercialRules.trialEnabled
                                ? `${plan.commercialRules.trialDurationDays} days`
                                : 'No Trial'}
                            </td>
                            <td className="py-3.5 px-4 font-bold text-slate-800">
                              <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-extrabold text-slate-700">
                                {tenantCount}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-extrabold text-[#0D1F3D]">
                              {formatCurrency(planMrr)}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-500 font-semibold">
                              v{plan.version || 1}
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 font-medium">
                              {plan.updatedAt.split('T')[0]}
                            </td>
                            <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={(e) => handleOpenMenu(e, plan.id)}
                                className="p-1.5 rounded-sm hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Analytics Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Widget 1: Tenants Adoption by Plan */}
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold text-[#0D1F3D] uppercase tracking-wider flex items-center justify-between">
                <span>Tenants by Plan</span>
                <Users className="h-4 w-4 text-indigo-600" />
              </h3>

              {pieChartData.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No tenant adoption data recorded</p>
              ) : (
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: number) => [`${val} tenants`, 'Adoption']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="border-t border-slate-100 pt-2 space-y-1.5 text-xs">
                {plans.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between text-slate-600 font-semibold">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      {p.name}
                    </span>
                    <span className="font-extrabold text-[#0D1F3D] font-mono">
                      {metrics.tenantsByPlan[p.id] || 0} tenants
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 2: MRR Contribution by Plan */}
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold text-[#0D1F3D] uppercase tracking-wider flex items-center justify-between">
                <span>MRR Contribution by Plan</span>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </h3>

              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(val: number) => [formatCurrency(val), 'MRR']} />
                    <Bar dataKey="mrr" fill="#6366F1" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="border-t border-slate-100 pt-2 space-y-1.5 text-xs">
                {plans.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-slate-600 font-semibold">
                    <span>{p.name}</span>
                    <span className="font-extrabold text-[#0D1F3D] font-mono">
                      {formatCurrency(metrics.mrrByPlan[p.id] || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Row Actions Popover Menu */}
      {activeMenuPlanId && (
        <div
          className="fixed z-50 w-44 rounded-sm border border-slate-200 bg-white py-1 shadow-lg text-xs font-semibold text-slate-700 font-sans"
          style={{ top: `${menuPosition.top}px`, left: `${menuPosition.left}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800"
            onClick={() => {
              const plan = plans.find((p) => p.id === activeMenuPlanId);
              setActiveMenuPlanId(null);
              if (plan) navigate(`/platform/plans/create?planId=${plan.id}&step=basic`);
            }}
          >
            <Edit className="h-3.5 w-3.5 text-indigo-600" /> Edit Plan
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800"
            onClick={() => {
              const plan = plans.find((p) => p.id === activeMenuPlanId);
              if (plan) handleDuplicate(plan);
            }}
          >
            <Copy className="h-3.5 w-3.5 text-emerald-600" /> Duplicate Plan
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-rose-600 border-t border-slate-100"
            onClick={() => {
              const plan = plans.find((p) => p.id === activeMenuPlanId);
              setActiveMenuPlanId(null);
              if (plan) setArchivingPlan(plan);
            }}
          >
            <Archive className="h-3.5 w-3.5 text-rose-600" /> Archive Plan
          </button>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {archivingPlan &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 font-sans">
            <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-amber-600">
                <div className="p-2 rounded-full bg-amber-50">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0D1F3D]">Archive Commercial Plan</h3>
                  <p className="text-xs text-slate-500 font-medium">Action requires confirmation</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Archived plans will no longer be available for new tenant subscriptions. Existing tenant records subscribed to{' '}
                <strong className="text-[#0D1F3D]">{archivingPlan.name}</strong> are not deleted or affected.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setArchivingPlan(null)}
                  disabled={isArchiving}
                  className="font-bold"
                >
                  Cancel
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={handleConfirmArchive}
                  disabled={isArchiving}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-2"
                >
                  {isArchiving ? 'Archiving...' : 'Archive Plan'}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </main>
  );
}
