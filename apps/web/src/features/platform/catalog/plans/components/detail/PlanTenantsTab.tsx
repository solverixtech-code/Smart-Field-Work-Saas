import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  RotateCcw,
  Download,
  IndianRupee,
  Building2,
  Calendar,
  Clock,
  MoreVertical,
  CheckCircle,
  Eye,
  Edit,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Plan } from '../../types/plan.types';
import { Tenant } from '../../../../tenants/types/platform.types';
import { PlanDetailMetrics } from '../../hooks/usePlanDetails';
import { KpiCard } from '../../../../../../components/dashboard/KpiCard';
import { formatCurrency } from '../../utils/plan-pricing.utils';
import { DataTable } from '../../../../../../components/ui/DataTable';
import { Select } from '../../../../../../components/ui/Select';
import { Button } from '../../../../../../components/ui/Button';

export interface PlanTenantsTabProps {
  plan: Plan;
  planTenants: Tenant[];
  metrics: PlanDetailMetrics;
}

const DONUT_COLORS: Record<string, string> = {
  Active: '#3B82F6',
  Trial: '#F59E0B',
  Suspended: '#8B5CF6',
  'Past Due': '#F97316',
};

export function PlanTenantsTab({ plan, planTenants, metrics }: PlanTenantsTabProps) {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [billingFilter, setBillingFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [activeRowMenu, setActiveRowMenu] = useState<string | null>(null);

  // Mock list of tenants matching reference design if planTenants empty
  const mockTenants = useMemo(() => {
    if (planTenants && planTenants.length > 0) return planTenants;

    return [
      {
        id: 'ten-1',
        companyName: 'Acme Corp',
        domain: 'acme.visiblosfw.com',
        tenantStatus: 'Active',
        activeUsers: 42,
        seatLimit: 50,
        mrr: 83958,
        joinedDate: '15 May 2024',
        contactName: 'Rahul Verma',
        contactEmail: 'rahul@acmecorp.com',
      },
      {
        id: 'ten-2',
        companyName: 'Omni Supplies',
        domain: 'omni.visiblosfw.com',
        tenantStatus: 'Active',
        activeUsers: 38,
        seatLimit: 50,
        mrr: 75962,
        joinedDate: '10 May 2024',
        contactName: 'Priya Sharma',
        contactEmail: 'priya@omnisupplies.com',
      },
      {
        id: 'ten-3',
        companyName: 'GrowFast Solutions',
        domain: 'growfast.visiblosfw.com',
        tenantStatus: 'Active',
        activeUsers: 30,
        seatLimit: 40,
        mrr: 59970,
        joinedDate: '02 May 2024',
        contactName: 'Amit Patel',
        contactEmail: 'amit@growfast.com',
      },
      {
        id: 'ten-4',
        companyName: 'FieldServe Ltd.',
        domain: 'fieldserve.visiblosfw.com',
        tenantStatus: 'Active',
        activeUsers: 25,
        seatLimit: 30,
        mrr: 49975,
        joinedDate: '28 Apr 2024',
        contactName: 'Sneha Kapoor',
        contactEmail: 'sneha@fieldserve.in',
      },
      {
        id: 'ten-5',
        companyName: 'Trueway Retail',
        domain: 'trueway.visiblosfw.com',
        tenantStatus: 'Active',
        activeUsers: 22,
        seatLimit: 25,
        mrr: 43978,
        joinedDate: '20 Apr 2024',
        contactName: 'Vikas Roy',
        contactEmail: 'vikas@trueway.com',
      },
      {
        id: 'ten-6',
        companyName: 'LogiTech Solutions',
        domain: 'logitech.visiblosfw.com',
        tenantStatus: 'Trial',
        activeUsers: 15,
        seatLimit: 20,
        mrr: 0,
        joinedDate: '24 May 2024',
        contactName: 'Ananya Gupta',
        contactEmail: 'ananya@logitech.io',
      },
    ];
  }, [planTenants]);

  const filteredTenants = useMemo(() => {
    return mockTenants.filter((t) => {
      const q = searchTerm.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        t.companyName.toLowerCase().includes(q) ||
        (t.domain && t.domain.toLowerCase().includes(q)) ||
        (t.contactName && t.contactName.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'All' || t.tenantStatus === statusFilter;
      const matchBilling =
        billingFilter === 'All' ||
        (billingFilter === 'Paid' ? (t.mrr || 0) > 0 : (t.mrr || 0) === 0);

      return matchSearch && matchStatus && matchBilling;
    });
  }, [mockTenants, searchTerm, statusFilter, billingFilter]);

  // Table Columns
  const columns = [
    {
      header: 'Tenant Name',
      accessorKey: 'companyName',
      cell: (t: any) => (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-extrabold text-xs">
            {t.companyName[0]}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-[#0D1F3D] truncate">{t.companyName}</p>
            <p className="text-[11px] font-semibold text-slate-500 truncate">{t.domain || `${t.companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.visiblosfw.com`}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'tenantStatus',
      cell: (t: any) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-extrabold border ${
            t.tenantStatus === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : t.tenantStatus === 'Trial'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-purple-50 text-purple-700 border-purple-200'
          }`}
        >
          {t.tenantStatus}
        </span>
      ),
    },
    {
      header: 'Seats Usage',
      cell: (t: any) => {
        const used = t.activeUsers || 20;
        const limit = t.seatLimit || 50;
        const percent = Math.min(Math.round((used / limit) * 100), 100);

        return (
          <div className="min-w-[130px] space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#0D1F3D]">
              <span>{used} / {limit}</span>
              <span className="text-slate-500 font-semibold">{percent}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  percent > 85 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-semibold block">{percent}% used</span>
          </div>
        );
      },
    },
    {
      header: 'MRR',
      cell: (t: any) => (
        <div className="min-w-[100px]">
          <span className="font-extrabold text-[#0D1F3D] text-xs block">
            {t.mrr > 0 ? formatCurrency(t.mrr) : '₹0'}
          </span>
          <span className="text-[10px] text-slate-500 font-semibold block">{t.mrr > 0 ? 'Monthly' : 'Trial'}</span>
        </div>
      ),
    },
    {
      header: 'Subscribed Date',
      cell: (t: any) => (
        <div className="min-w-[110px]">
          <span className="font-semibold text-slate-700 text-xs block">{t.joinedDate || '15 May 2024'}</span>
          <span className="text-[10px] text-slate-500 font-medium">10:30 AM</span>
        </div>
      ),
    },
    {
      header: 'Primary Contact',
      cell: (t: any) => (
        <div className="min-w-[150px]">
          <p className="font-extrabold text-[#0D1F3D] text-xs">{t.contactName || 'Rahul Verma'}</p>
          <p className="text-[10px] text-slate-500 font-medium truncate">{t.contactEmail || 'rahul@acmecorp.com'}</p>
        </div>
      ),
    },
    {
      header: 'Actions',
      cell: (t: any) => (
        <div className="relative text-right">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveRowMenu(activeRowMenu === t.id ? null : t.id);
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {activeRowMenu === t.id && (
            <div className="absolute right-0 top-9 z-30 w-44 rounded-sm border border-slate-200 bg-white p-1 shadow-xl text-left font-sans animate-in fade-in">
              <button
                type="button"
                onClick={() => {
                  setActiveRowMenu(null);
                  navigate(`/platform/tenants/${t.id}`);
                }}
                className="flex w-full items-center gap-2 rounded-xs px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Eye className="h-3.5 w-3.5 text-blue-600" /> View Tenant
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveRowMenu(null);
                  navigate(`/platform/tenants/${t.id}/edit`);
                }}
                className="flex w-full items-center gap-2 rounded-xs px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Edit className="h-3.5 w-3.5 text-indigo-600" /> Edit Details
              </button>
              <button
                type="button"
                onClick={() => setActiveRowMenu(null)}
                className="flex w-full items-center gap-2 rounded-xs px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Mail className="h-3.5 w-3.5 text-purple-600" /> Contact Admin
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const donutData = [
    { name: 'Active', value: 48, color: DONUT_COLORS.Active },
    { name: 'Trial', value: 14, color: DONUT_COLORS.Trial },
    { name: 'Suspended', value: 2, color: DONUT_COLORS.Suspended },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Context matching screenshot */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-sm border border-slate-200 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Plan Tenants</h3>
            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
              64 Total Subscribed
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            All active, trial and legacy tenants subscribed to this plan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value="30"
            onChange={() => {}}
            options={[
              { value: '30', label: 'Last 30 Days' },
              { value: '90', label: 'Last 90 Days' },
              { value: '365', label: 'Last Year' },
            ]}
          />
        </div>
      </div>

      {/* Top 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Subscriptions"
          value="64"
          subValue="All time"
          icon={Building2}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Active Tenants"
          value="48"
          subValue="Paying active"
          icon={Users}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Trial Tenants"
          value="14"
          subValue="In trial period"
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Total MRR"
          value={formatCurrency(942000)}
          subValue="Monthly revenue"
          icon={IndianRupee}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Avg Seats / Tenant"
          value="34"
          subValue="Seat utilization"
          icon={Users}
          iconBgColor="bg-cyan-50"
          iconTextColor="text-cyan-600"
        />
      </div>

      {/* Main Grid: Left Column (2 Cols Table) + Right Column (1 Col Widgets) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tenants by name, domain, contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 w-full rounded-sm border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="w-36">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Statuses' },
                    { value: 'Active', label: 'Active' },
                    { value: 'Trial', label: 'Trial' },
                    { value: 'Suspended', label: 'Suspended' },
                  ]}
                />
              </div>

              <div className="w-36">
                <Select
                  value={billingFilter}
                  onChange={(e) => setBillingFilter(e.target.value)}
                  options={[
                    { value: 'All', label: 'All Billing' },
                    { value: 'Paid', label: 'Paid' },
                    { value: 'Trial', label: 'Trial' },
                  ]}
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const csvData =
                    'data:text/csv;charset=utf-8,' +
                    ['Company,Status,MRR,Contact'].concat(
                      filteredTenants.map((t) => `${t.companyName},${t.tenantStatus},${t.mrr},${t.contactName}`)
                    ).join('\n');
                  const encodedUri = encodeURI(csvData);
                  const link = document.createElement('a');
                  link.setAttribute('href', encodedUri);
                  link.setAttribute('download', `plan-${plan.id}-tenants.csv`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }}
                className="gap-2 font-bold text-slate-700 h-10 border-slate-200"
              >
                <Download className="h-4 w-4 text-slate-500" /> Export
              </Button>
            </div>

            {/* 100% Full Width DataTable */}
            <DataTable data={filteredTenants} columns={columns} />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Card 1: Plan Adoption Donut Chart */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-[#0D1F3D] border-b border-slate-100 pb-3">Plan Adoption Breakdown</h4>

            <div className="flex items-center gap-4">
              <div className="relative h-32 w-32 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={52}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      wrapperStyle={{ zIndex: 100 }}
                      contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none', color: '#fff' }}
                      itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold text-[#0D1F3D]">64</span>
                  <span className="text-[10px] font-semibold text-slate-500">Total Tenants</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-600">Active</span>
                  </div>
                  <span className="text-[#0D1F3D] font-extrabold">48 (75%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                    <span className="text-slate-600">Trial</span>
                  </div>
                  <span className="text-[#0D1F3D] font-extrabold">14 (22%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                    <span className="text-slate-600">Suspended</span>
                  </div>
                  <span className="text-[#0D1F3D] font-extrabold">2 (3%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Top Tenants by MRR */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">Top Tenants by MRR</h4>
            <div className="space-y-3">
              {mockTenants.slice(0, 5).map((t, idx) => (
                <div key={t.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-xs font-bold text-slate-500 w-3">{idx + 1}</span>
                    <span className="font-extrabold text-[#0D1F3D] truncate">{t.companyName}</span>
                  </div>
                  <span className="font-mono font-extrabold text-indigo-700 shrink-0">
                    {t.mrr > 0 ? formatCurrency(t.mrr) : '₹0'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Tenant Insights */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-[#0D1F3D]">Tenant Insights</h4>
            <div className="space-y-2 text-xs text-slate-600 font-medium">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Highest MRR plan across platform</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>94% renewal rate over past 12 months</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Zero policy violations reported</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
