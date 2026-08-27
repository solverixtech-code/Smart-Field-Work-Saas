import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Search,
  Plus,
  Filter,
  Eye,
  MoreVertical,
  Shield,
  CreditCard,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button, DataTable, Select, type ColumnDef } from '../../components/ui';
import { tenantService } from '../../features/platform/tenants/services/tenant.service';
import { Tenant, TenantStatus, SubscriptionStatus } from '../../features/platform/tenants/types/platform.types';
import { usePlatformPermissions } from '../../features/platform/tenants/hooks/usePlatformPermissions';

export function AllTenantsPage() {
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [search, setSearch] = useState('');
  const [tenantStatusFilter, setTenantStatusFilter] = useState<string>('all');
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<string>('all');
  const { canCreateTenant, canSuspendTenant } = usePlatformPermissions();

  useEffect(() => {
    tenantService.getTenants().then(setTenants);
  }, []);

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch =
        t.companyName.toLowerCase().includes(search.toLowerCase()) ||
        t.domain.toLowerCase().includes(search.toLowerCase()) ||
        t.industryLabel.toLowerCase().includes(search.toLowerCase());
      const matchesTenantStatus = tenantStatusFilter === 'all' || t.tenantStatus === tenantStatusFilter;
      const matchesSubStatus = subscriptionStatusFilter === 'all' || t.subscriptionStatus === subscriptionStatusFilter;
      return matchesSearch && matchesTenantStatus && matchesSubStatus;
    });
  }, [tenants, search, tenantStatusFilter, subscriptionStatusFilter]);

  const handleStatusChange = async (tenantId: string, newStatus: TenantStatus) => {
    const updated = await tenantService.updateTenantStatus(tenantId, newStatus);
    setTenants((prev) => prev.map((t) => (t.id === tenantId ? updated : t)));
    toast.success(`Tenant status updated to ${newStatus}`);
  };

  const columns: ColumnDef<Tenant>[] = [
    {
      header: 'Tenant Company & Domain',
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
          r.tenantStatus === 'Trial' ? 'bg-blue-50 text-blue-700 border-blue-200' :
          r.tenantStatus === 'Draft' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-rose-50 text-rose-700 border-rose-200'
        }`}>
          ● {r.tenantStatus}
        </span>
      ),
    },
    {
      header: 'Subscription Status',
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
      header: 'Admin User',
      cell: (r) => (
        <div>
          <p className="font-extrabold text-[#0D1F3D] text-xs">{r.adminUser.fullName}</p>
          <p className="text-[10px] text-slate-500">{r.adminUser.email}</p>
        </div>
      ),
    },
    {
      header: 'Plan & Licenses',
      cell: (r) => (
        <div>
          <p className="text-xs font-bold text-slate-700">{r.planName}</p>
          <p className="text-[10px] font-mono text-slate-500">{r.userLicensesCount} Reps</p>
        </div>
      ),
    },
    {
      header: 'MRR',
      cell: (r) => <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">₹{r.mrr.toLocaleString()}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (r) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button variant="outline" size="sm" onClick={() => navigate(`/platform/tenants/${r.id}`)} className="text-[10px] font-bold">
            Details
          </Button>
          {canSuspendTenant && (
            <button
              onClick={() => handleStatusChange(r.id, r.tenantStatus === 'Suspended' ? 'Active' : 'Suspended')}
              className={`px-2 py-1 rounded-sm text-[10px] font-extrabold cursor-pointer border ${
                r.tenantStatus === 'Suspended' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {r.tenantStatus === 'Suspended' ? 'Activate' : 'Suspend'}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <span>Platform</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#0D1F3D] font-bold">Tenant Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">All Provisioned Tenants</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Manage all customer tenant accounts, subscription statuses, and user limits.</p>
        </div>

        {canCreateTenant && (
          <Button variant="accent" size="sm" onClick={() => navigate('/platform/tenants/create')} className="gap-2 font-bold shadow-xs">
            <Plus className="h-4 w-4" /> Create Tenant Wizard
          </Button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company name, domain or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          <Select
            label="Tenant Status"
            value={tenantStatusFilter}
            onChange={(e) => setTenantStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Tenant Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Trial', label: 'Trial' },
              { value: 'Draft', label: 'Draft' },
              { value: 'Past Due', label: 'Past Due' },
              { value: 'Suspended', label: 'Suspended' },
            ]}
            searchable={true}
          />

          <Select
            label="Subscription Status"
            value={subscriptionStatusFilter}
            onChange={(e) => setSubscriptionStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Subscription Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Trialing', label: 'Trialing' },
              { value: 'Past Due', label: 'Past Due' },
              { value: 'Cancelled', label: 'Cancelled' },
            ]}
            searchable={true}
          />
        </div>
      </div>

      {/* Datatable */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable columns={columns} data={filteredTenants} keyExtractor={(r) => r.id} density="compact" />
      </div>
    </div>
  );
}
