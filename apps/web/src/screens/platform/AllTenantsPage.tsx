import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Users,
  TrendingUp,
  Search,
  Filter,
  RotateCcw,
  Download,
  Upload,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Layers,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { tenantService } from '../../features/platform/tenants/services/tenant.service';
import { Tenant } from '../../features/platform/tenants/types/platform.types';
import { toast } from 'sonner';

const INDUSTRY_COLORS: Record<string, string> = {
  'Pharma & Healthcare': '#2563EB',
  'FMCG & Consumer Goods': '#10B981',
  'Solar & Renewable Energy': '#F59E0B',
  'Construction & Real Estate': '#6366F1',
  'EdTech & Higher Education': '#14B8A6',
};

const PLAN_COLORS: Record<string, string> = {
  'Starter Field CRM': '#F43F5E',
  'Growth Field Automation': '#10B981',
  'Enterprise Field Suite': '#2563EB',
};

const INDUSTRY_DOT_COLORS: Record<string, string> = {
  'Pharma & Healthcare': 'bg-blue-600',
  'FMCG & Consumer Goods': 'bg-emerald-500',
  'Solar & Renewable Energy': 'bg-amber-500',
  'Construction & Real Estate': 'bg-indigo-500',
  'EdTech & Higher Education': 'bg-teal-500',
};

const PLAN_DOT_COLORS: Record<string, string> = {
  'Starter Field CRM': 'bg-rose-500',
  'Growth Field Automation': 'bg-emerald-500',
  'Enterprise Field Suite': 'bg-blue-600',
};

const formatCurrency = (amount: number): string => {
  if (amount === 0) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
};

export function AllTenantsPage() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedPlan, setSelectedPlan] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    tenantService.getTenants().then(setTenants);
  }, []);

  const filteredTenants = tenants.filter((t) => {
    const matchSearch = searchTerm === '' ||
      t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.adminUser.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchIndustry = selectedIndustry === 'All' || t.industryLabel === selectedIndustry;
    const matchPlan = selectedPlan === 'All' || t.planName === selectedPlan;
    const matchStatus = selectedStatus === 'All' || t.tenantStatus === selectedStatus;
    return matchSearch && matchIndustry && matchPlan && matchStatus;
  });

  // Compute KPIs from live data
  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t) => t.tenantStatus === 'Active').length;
  const trialTenants = tenants.filter((t) => t.tenantStatus === 'Trial').length;
  const suspendedTenants = tenants.filter((t) => t.tenantStatus === 'Suspended').length;
  const totalUsers = tenants.reduce((sum, t) => sum + t.userLicensesCount, 0);
  const totalMrr = tenants.reduce((sum, t) => sum + t.mrr, 0);

  // Derive industry chart from tenants
  const industryMap = new Map<string, number>();
  tenants.forEach((t) => industryMap.set(t.industryLabel, (industryMap.get(t.industryLabel) || 0) + 1));
  const industryChartData = Array.from(industryMap.entries()).map(([name, value]) => ({
    name, value, color: INDUSTRY_COLORS[name] || '#94A3B8',
  }));
  const industries = Array.from(industryMap.entries()).map(([name, count]) => ({
    name, count, percentage: totalTenants > 0 ? ((count / totalTenants) * 100).toFixed(1) + '%' : '0%',
    color: INDUSTRY_DOT_COLORS[name] || 'bg-slate-400',
  }));

  // Derive plan chart from tenants
  const planMap = new Map<string, number>();
  tenants.forEach((t) => planMap.set(t.planName, (planMap.get(t.planName) || 0) + 1));
  const planChartData = Array.from(planMap.entries()).map(([name, value]) => ({
    name, value, color: PLAN_COLORS[name] || '#94A3B8',
  }));
  const plans = Array.from(planMap.entries()).map(([name, count]) => ({
    name, count, percentage: totalTenants > 0 ? ((count / totalTenants) * 100).toFixed(1) + '%' : '0%',
    color: PLAN_DOT_COLORS[name] || 'bg-slate-400',
  }));

  const handleDeleteTenant = async (id: string) => {
    try {
      await tenantService.deleteTenant(id);
      const refreshed = await tenantService.getTenants();
      setTenants(refreshed);
      setActiveMenuId(null);
      toast.success('Tenant deleted successfully');
    } catch {
      toast.error('Failed to delete tenant');
    }
  };

  const getIconBg = (t: Tenant): string => {
    if (t.tenantStatus === 'Suspended') return 'bg-rose-100 text-rose-800 font-extrabold';
    if (t.tenantStatus === 'Past Due') return 'bg-amber-100 text-amber-800 font-extrabold';
    if (t.tenantStatus === 'Trial') return 'bg-amber-100 text-amber-800 font-extrabold';
    return 'bg-[#0D1F3D] text-white font-extrabold';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">Active</span>;
      case 'Past Due':
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">Past Due</span>;
      case 'Trial':
        return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">Trial</span>;
      case 'Suspended':
        return <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">Suspended</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">All Tenants</h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Manage and monitor all tenant workspaces across the Smart Field Work SaaS platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 font-bold text-slate-700">
            <Download className="h-4 w-4 text-slate-400" /> Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2 font-bold text-slate-700">
            <Upload className="h-4 w-4 text-slate-400" /> Import
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/platform/tenants/create')}
            className="gap-2 font-bold shadow-xs"
          >
            <Plus className="h-4 w-4" /> Create Tenant
          </Button>
        </div>
      </div>

      {/* Top 6 KPI Summary Cards (Reusing KpiCard Component 100%) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          title="Total Tenants"
          value={String(totalTenants)}
          icon={Building2}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-700"
        />
        <KpiCard
          title="Active Tenants"
          value={String(activeTenants)}
          subValue={totalTenants > 0 ? `${((activeTenants / totalTenants) * 100).toFixed(1)}% of total` : '0%'}
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
        <KpiCard
          title="Trial Tenants"
          value={String(trialTenants)}
          subValue={totalTenants > 0 ? `${((trialTenants / totalTenants) * 100).toFixed(1)}% of total` : '0%'}
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-700"
        />
        <KpiCard
          title="Suspended Tenants"
          value={String(suspendedTenants)}
          subValue={totalTenants > 0 ? `${((suspendedTenants / totalTenants) * 100).toFixed(1)}% of total` : '0%'}
          icon={AlertOctagon}
          iconBgColor="bg-red-50"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Total SaaS Users"
          value={totalUsers.toLocaleString('en-IN')}
          icon={Users}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-700"
        />
        <KpiCard
          title="MRR"
          value={formatCurrency(totalMrr)}
          icon={TrendingUp}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
      </div>

      {/* Filters Bar */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tenants by name, code, domain, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          <div className="w-40">
            <Select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              searchable={true}
              options={[
                { value: 'All', label: 'All Industries' },
                ...Array.from(new Set(tenants.map((t) => t.industryLabel))).map((label) => ({ value: label, label })),
              ]}
            />
          </div>

          <div className="w-40">
            <Select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              searchable={true}
              options={[
                { value: 'All', label: 'All Plans' },
                ...Array.from(new Set(tenants.map((t) => t.planName))).map((name) => ({ value: name, label: name })),
              ]}
            />
          </div>

          <div className="w-40">
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              searchable={true}
              options={[
                { value: 'All', label: 'All Statuses' },
                { value: 'Active', label: 'Active' },
                { value: 'Trial', label: 'Trial' },
                { value: 'Past Due', label: 'Past Due' },
                { value: 'Suspended', label: 'Suspended' },
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 font-bold text-slate-700 h-10">
              <Filter className="h-4 w-4 text-slate-400" /> More Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedIndustry('All');
                setSelectedPlan('All');
                setSelectedStatus('All');
              }}
              className="gap-2 font-bold text-slate-700 h-10"
            >
              <RotateCcw className="h-4 w-4 text-slate-400" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0D1F3D]">All Tenants</h3>
              <span className="text-xs font-medium text-slate-500">
                Showing <span className="font-bold text-[#0D1F3D]">{filteredTenants.length}</span> of <span className="font-bold text-[#0D1F3D]">{totalTenants}</span> tenants
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-[#0D1F3D]">
                    <th className="pb-3 w-8">#</th>
                    <th className="pb-3">Tenant Name</th>
                    <th className="pb-3">Tenant Code</th>
                    <th className="pb-3">Industry</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Users</th>
                    <th className="pb-3">MRR</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Created On</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredTenants.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3.5 text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm font-bold ${getIconBg(t)}`}>
                            {t.companyName[0]}
                          </div>
                          <div>
                            <p
                              onClick={() => navigate(`/platform/tenants/${t.id}`)}
                              className="font-bold text-[#0D1F3D] hover:text-blue-600 hover:underline cursor-pointer"
                            >
                              {t.companyName}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400">{t.domain}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-xs font-bold text-slate-800">{t.slug.toUpperCase()}</td>
                      <td className="py-3.5 text-slate-600 font-semibold">{t.industryLabel}</td>
                      <td className="py-3.5 text-slate-700 font-bold">{t.planName}</td>
                      <td className="py-3.5 text-slate-700 font-semibold">{t.userLicensesCount}</td>
                      <td className="py-3.5 font-bold text-[#0D1F3D]">{formatCurrency(t.mrr)}</td>
                      <td className="py-3.5">{getStatusBadge(t.tenantStatus)}</td>
                      <td className="py-3.5 text-slate-500 font-medium">{t.createdAt.split(' ·')[0]}</td>
                      <td className="py-3.5 text-right relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === t.id ? null : t.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {activeMenuId === t.id && (
                          <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-sm border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95">
                            <button
                              type="button"
                              onClick={() => { setActiveMenuId(null); navigate(`/platform/tenants/${t.id}`); }}
                              className="w-full flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4 text-blue-600" /> View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => { setActiveMenuId(null); navigate(`/platform/tenants/${t.id}/users`); }}
                              className="w-full flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Users className="h-4 w-4 text-purple-600" /> Manage Users
                            </button>
                            <button
                              type="button"
                              onClick={() => { setActiveMenuId(null); navigate(`/platform/tenants/${t.id}/modules`); }}
                              className="w-full flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Layers className="h-4 w-4 text-indigo-600" /> Manage Modules
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTenant(t.id)}
                              className="w-full flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" /> Delete Tenant
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select className="rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none">
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span>1-{filteredTenants.length} of {totalTenants}</span>
                <button type="button" className="h-8 w-8 rounded-sm border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" className="h-8 w-8 rounded-sm bg-blue-600 text-white font-bold flex items-center justify-center">1</button>
                <button type="button" className="h-8 w-8 rounded-sm border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50">2</button>
                <button type="button" className="h-8 w-8 rounded-sm border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50">3</button>
                <button type="button" className="h-8 w-8 rounded-sm border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50">4</button>
                <button type="button" className="h-8 w-8 rounded-sm border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50">5</button>
                <button type="button" className="h-8 w-8 rounded-sm border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Analytics Widgets Column */}
        <div className="space-y-6">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#0D1F3D] mb-4">Tenants by Industry</h3>
            <div className="flex items-center gap-4">
              <div className="relative h-28 w-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={industryChartData} cx="50%" cy="50%" innerRadius={32} outerRadius={48} paddingAngle={2} dataKey="value">
                      {industryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      wrapperStyle={{ zIndex: 100 }}
                      contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none', color: '#fff' }}
                      itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '11px' }}
                      formatter={(val: any) => [`${val} Tenants`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-[#0D1F3D]">128</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {industries.map((ind, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${ind.color}`} />
                      <span className="text-slate-600">{ind.name}</span>
                    </div>
                    <span className="text-[#0D1F3D] font-bold">{ind.count} ({ind.percentage})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#0D1F3D] mb-4">Tenants by Plan</h3>
            <div className="flex items-center gap-4">
              <div className="relative h-28 w-28 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planChartData} cx="50%" cy="50%" innerRadius={32} outerRadius={48} paddingAngle={2} dataKey="value">
                      {planChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      wrapperStyle={{ zIndex: 100 }}
                      contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none', color: '#fff' }}
                      itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '11px' }}
                      formatter={(val: any) => [`${val} Tenants`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-[#0D1F3D]">{totalTenants}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {plans.map((pl, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${pl.color}`} />
                      <span className="text-slate-600">{pl.name}</span>
                    </div>
                    <span className="text-[#0D1F3D] font-bold">{pl.count} ({pl.percentage})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
