import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  Plus,
  ArrowRight,
  Shield,
  Activity,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Globe
} from 'lucide-react';
import { Button, DataTable, type ColumnDef } from '../../components/ui';
import { tenantService } from '../../features/platform/tenants/services/tenant.service';
import { Tenant } from '../../features/platform/tenants/types/platform.types';
import { usePlatformPermissions } from '../../features/platform/tenants/hooks/usePlatformPermissions';

export function PlatformDashboardPage() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const { canCreateTenant } = usePlatformPermissions();

  useEffect(() => {
    tenantService.getTenants().then(setTenants);
  }, []);

  const activeCount = tenants.filter((t) => t.tenantStatus === 'Active').length;
  const trialCount = tenants.filter((t) => t.tenantStatus === 'Trial').length;
  const pastDueCount = tenants.filter((t) => t.tenantStatus === 'Past Due').length;
  const totalMrr = tenants.reduce((acc, t) => acc + t.mrr, 0);

  const columns: ColumnDef<Tenant>[] = [
    {
      header: 'Tenant Company',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <img src={r.logoUrl || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=100'} alt="" className="h-8 w-8 rounded-sm object-cover border border-slate-200" />
          <div>
            <p className="font-extrabold text-[#0D1F3D] text-xs">{r.companyName}</p>
            <p className="text-[10px] text-slate-500 font-mono">{r.domain}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Industry',
      cell: (r) => <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-sm text-[10px] font-extrabold">{r.industryLabel}</span>,
    },
    {
      header: 'Tenant Status',
      cell: (r) => (
        <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-extrabold ${
          r.tenantStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          r.tenantStatus === 'Trial' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          ● {r.tenantStatus}
        </span>
      ),
    },
    {
      header: 'Subscription',
      cell: (r) => (
        <span className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-extrabold ${
          r.subscriptionStatus === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
          r.subscriptionStatus === 'Trialing' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          {r.subscriptionStatus}
        </span>
      ),
    },
    {
      header: 'Plan',
      cell: (r) => <span className="text-xs font-bold text-slate-700">{r.planName}</span>,
    },
    {
      header: 'Licenses',
      cell: (r) => <span className="font-mono text-xs font-bold">{r.userLicensesCount} Reps</span>,
    },
    {
      header: 'MRR',
      cell: (r) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">₹{r.mrr.toLocaleString()}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (r) => (
        <Button variant="outline" size="sm" onClick={() => navigate(`/platform/tenants/${r.id}`)} className="text-[10px] font-bold">
          Manage Tenant
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">Platform Operations Dashboard</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Global SaaS tenant provisioning, subscription health and platform MRR.</p>
        </div>
        {canCreateTenant && (
          <Button variant="accent" size="sm" onClick={() => navigate('/platform/tenants/create')} className="gap-2 font-bold shadow-xs">
            <Plus className="h-4 w-4" /> Provision New Tenant
          </Button>
        )}
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600">
              <CreditCard className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Platform MRR</p>
              <p className="text-xl font-extrabold text-[#0D1F3D]">₹{totalMrr.toLocaleString()}</p>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] font-semibold text-emerald-600">↑ 22.4% <span className="text-slate-400 font-normal">vs last month</span></p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-blue-50 text-blue-600">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Active Tenants</p>
              <p className="text-xl font-extrabold text-[#0D1F3D]">{activeCount} / {tenants.length}</p>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] font-semibold text-emerald-600">100% Provisioned</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Active Trials</p>
              <p className="text-xl font-extrabold text-[#0D1F3D]">{trialCount} Tenants</p>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] font-semibold text-blue-600">Avg 14 Days Duration</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-rose-50 text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Past Due Subscriptions</p>
              <p className="text-xl font-extrabold text-[#0D1F3D]">{pastDueCount} Tenant</p>
            </div>
          </div>
          <p className="mt-2.5 text-[11px] font-semibold text-rose-600">Action Required</p>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Provisioned SaaS Tenants</h3>
          <Button variant="outline" size="sm" onClick={() => navigate('/platform/tenants')} className="font-bold">
            View All Tenants ({tenants.length}) →
          </Button>
        </div>
        <DataTable columns={columns} data={tenants} keyExtractor={(r) => r.id} density="compact" />
      </div>
    </div>
  );
}
