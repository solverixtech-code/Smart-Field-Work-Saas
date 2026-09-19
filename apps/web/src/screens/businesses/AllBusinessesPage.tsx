import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function BusinessRowLogo({ id, name }: { id: string; name?: string | null }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem(`visiblo_biz_logo_${id}`);
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail?.businessId === id) {
        setLogoUrl(e.detail.logoUrl);
      }
    };
    window.addEventListener('visiblo:business-logo-updated', handleUpdate);
    return () => window.removeEventListener('visiblo:business-logo-updated', handleUpdate);
  }, [id]);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={name || 'Business Logo'}
        className="h-8 w-8 rounded-md object-cover border border-slate-200 shrink-0 shadow-xs"
      />
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700 font-bold text-xs shrink-0">
      {name ? name.slice(0, 2).toUpperCase() : 'BU'}
    </div>
  );
}
import {
  Building2,
  Plus,
  Search,
  Download,
  Upload,
  Eye,
  Edit,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserPlus,
  ChevronRight,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import {
  useCrm,
  useCrmQuery,
  useDebouncedSearch,
} from '../../features/crm/CrmContext';
import { CrmFailure, statusLabel } from '../../features/crm/CrmControls';
import type { AccountDto, CrmStatus } from '../../features/crm/crm.types';

export default function AllBusinessesPage() {
  const navigate = useNavigate();
  const { can, readOnly } = useCrm();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const search = useDebouncedSearch(searchTerm);
  const city = cityFilter !== 'All' ? cityFilter : '';

  const result = useCrmQuery(
    JSON.stringify([
      'accounts',
      search,
      city,
      typeFilter,
      sourceFilter,
      statusFilter,
      currentPage,
    ]),
    (service, signal) =>
      service.accounts(
        {
          page: currentPage,
          limit: 10,
          search: search || undefined,
          city: city || undefined,
          businessTypeValueId: typeFilter !== 'All' ? typeFilter : undefined,
          sourceValueId: sourceFilter !== 'All' ? sourceFilter : undefined,
          status: statusFilter !== 'All' ? (statusFilter.toUpperCase() as CrmStatus) : undefined,
        },
        signal,
      ),
  );

  const counts = useCrmQuery(
    'account-status-counts',
    async (service, signal) => {
      const [active, inactive, blocked] = await Promise.all(
        (['ACTIVE', 'INACTIVE', 'BLOCKED'] as const).map((status) =>
          service
            .accounts({ page: 1, limit: 1, status }, signal)
            .then((p) => p.total),
        ),
      );
      return { active, inactive, blocked, total: active + inactive + blocked };
    },
  );

  useEffect(() => {
    if (result.data?.items) {
      try {
        result.data.items.forEach((item) => {
          if (item.id && item.name) {
            sessionStorage.setItem(`visiblo_biz_name_${item.id}`, item.name);
          }
        });
      } catch {}
    }
  }, [result.data?.items]);

  const statusDistributionData = counts.data
    ? [
        { name: 'Active', value: counts.data.active, color: '#10B981' },
        { name: 'Inactive', value: counts.data.inactive, color: '#F59E0B' },
        { name: 'Blocked', value: counts.data.blocked, color: '#E20613' },
      ]
    : [];

  const metric = (value?: number) =>
    value === undefined ? (counts.loading ? 'Loading...' : '0') : value.toLocaleString();

  const metricHint = counts.loading
    ? 'Loading...'
    : counts.error
      ? 'Unavailable'
      : 'Within your access';

  const canCreate = can('crm.businesses.create') && !readOnly;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && result.data?.items) {
      setSelectedIds(result.data.items.map((b) => b.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const columns: ColumnDef<AccountDto>[] = [
    {
      header: 'Business Details',
      cell: (b) => (
        <div className="flex items-center gap-2.5">
          <BusinessRowLogo id={b.id} name={b.name} />
          <div>
            <button
              onClick={() => navigate(`/admin/businesses/${b.id}`)}
              className="font-bold text-[#0D1F3D] hover:text-blue-600 hover:underline text-left block whitespace-nowrap cursor-pointer"
            >
              {b.name}
            </button>
            <p className="text-[11px] text-slate-500 font-normal whitespace-nowrap">
              {[b.city, b.state].filter(Boolean).join(', ') || 'Location not set'} •{' '}
              <span className="font-mono text-[10px] text-slate-400">ID: {b.id.startsWith('BIZ-') ? b.id : `BIZ-${b.id.replace(/-/g, '').slice(-6).toUpperCase()}`}</span>
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Business Type',
      cell: (b) => (
        <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 border border-blue-100">
          {b.businessType || 'Not set'}
        </span>
      ),
    },
    {
      header: 'Contact Person',
      cell: (b) =>
        can('crm.contacts.view') ? (
          <div>
            <p className="font-bold text-[#0D1F3D]">{b.primaryContact?.name || 'Not set'}</p>
            <p className="text-[11px] text-slate-500 font-normal">{b.primaryContact?.role || 'Primary Contact'}</p>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">Unavailable</span>
        ),
    },
    {
      header: 'Contact Info',
      cell: (b) =>
        can('crm.contacts.view') ? (
          <div>
            <p className="font-semibold text-slate-800">{b.primaryContact?.phone || 'Not set'}</p>
            <p className="text-[11px] text-slate-500">{b.primaryContact?.email || 'Not set'}</p>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">Unavailable</span>
        ),
    },
    {
      header: 'Source',
      cell: (b) => b.source || 'Direct',
    },
    {
      header: 'Assigned To',
      cell: (b) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-[#0D1F3D] font-bold text-[10px] shrink-0">
            {b.owner?.displayName ? b.owner.displayName.slice(0, 2).toUpperCase() : 'EX'}
          </div>
          <div>
            <p className="font-semibold text-[#0D1F3D] text-xs">{b.owner?.displayName || 'Unassigned'}</p>
            <p className="text-[10px] text-slate-500">{b.owner?.role || 'Executive'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      align: 'center',
      cell: (b) => {
        const isAct = b.status === 'ACTIVE';
        const isBlk = b.status === 'BLOCKED';
        return (
          <span
            className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold border ${
              isAct
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : isBlk
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}
          >
            {statusLabel(b.status)}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (b) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(`/admin/businesses/${b.id}`)}
            className="p-1.5 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-sm transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {can('crm.businesses.update') && !readOnly && (
            <button
              onClick={() => navigate(`/admin/businesses/${b.id}/edit`)}
              className="p-1.5 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-sm transition-colors cursor-pointer"
              title="Edit Business"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}
          <RowActionsMenu
            items={[
              {
                label: 'View Details',
                icon: Eye,
                onClick: () => navigate(`/admin/businesses/${b.id}`),
              },
              ...(can('crm.businesses.update') && !readOnly
                ? [
                    {
                      label: 'Edit Business',
                      icon: Edit,
                      onClick: () => navigate(`/admin/businesses/${b.id}/edit`),
                    },
                  ]
                : []),
              ...(can('crm.contacts.view')
                ? [
                    {
                      label: 'Contacts',
                      icon: UserPlus,
                      onClick: () => navigate(`/admin/businesses/${b.id}/contacts`),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3 font-sans pb-10">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">All Businesses</h1>
          <p className="text-xs font-normal text-slate-500">
            {result.data
              ? `${result.data.total.toLocaleString()} businesses match your filters.`
              : 'Manage and view all registered business accounts and merchant profiles.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Export is not available in this phase"
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export
          </Button>
          <Button
            variant="accent"
            size="sm"
            disabled={!canCreate}
            onClick={() => navigate('/admin/businesses/create')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
          >
            <Plus className="h-4 w-4" /> Add Business
          </Button>
        </div>
      </div>

      {/* 5 Top Metric KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:grid-cols-3">
        <KpiCard
          title="Total Businesses"
          value={metric(counts.data?.total)}
          subValue={counts.data?.total !== undefined ? 'All time' : metricHint}
          icon={Building2}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Active Businesses"
          value={metric(counts.data?.active)}
          subValue={
            counts.data?.total && counts.data.total > 0
              ? `${((counts.data.active / counts.data.total) * 100).toFixed(1)}% of total`
              : metricHint
          }
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Inactive Businesses"
          value={metric(counts.data?.inactive)}
          subValue={
            counts.data?.total && counts.data.total > 0
              ? `${((counts.data.inactive / counts.data.total) * 100).toFixed(1)}% of total`
              : metricHint
          }
          icon={AlertCircle}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Blocked Businesses"
          value={metric(counts.data?.blocked)}
          subValue={
            counts.data?.total && counts.data.total > 0
              ? `${((counts.data.blocked / counts.data.total) * 100).toFixed(1)}% of total`
              : metricHint
          }
          icon={XCircle}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="New This Month"
          value="Unavailable"
          subValue="Monthly analytics unavailable"
          icon={RefreshCw}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Toolbar & Filters */}
      <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 text-xs font-semibold">
          {/* Search Input */}
          <div className="relative xl:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              id="business-search"
              aria-label="Search businesses"
              type="text"
              placeholder="Search name, phone, email, city..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-sm border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All Business Types', value: 'All' },
              { label: 'Gym / Fitness', value: 'Gym' },
              { label: 'Food & Beverage', value: 'Food' },
              { label: 'Security Services', value: 'Security' },
              { label: 'Construction', value: 'Construction' },
              { label: 'Retail Supermarket', value: 'Retail' },
              { label: 'Beauty & Salon', value: 'Beauty' },
            ]}
          />

          <Select
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All Cities', value: 'All' },
              { label: 'Mumbai', value: 'Mumbai' },
              { label: 'Pune', value: 'Pune' },
              { label: 'Thane', value: 'Thane' },
              { label: 'Navi Mumbai', value: 'Navi Mumbai' },
              { label: 'Bengaluru', value: 'Bengaluru' },
              { label: 'Delhi', value: 'Delhi' },
            ]}
          />

          <Select
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All Sources', value: 'All' },
              { label: 'Website', value: 'Website' },
              { label: 'Referral', value: 'Referral' },
              { label: 'Google Ads', value: 'Google Ads' },
              { label: 'Justdial', value: 'Justdial' },
              { label: 'Cold Call', value: 'Cold Call' },
              { label: 'Instagram', value: 'Instagram' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
              { label: 'Blocked', value: 'Blocked' },
            ]}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('All');
                setCityFilter('All');
                setSourceFilter('All');
                setStatusFilter('All');
                setCurrentPage(1);
              }}
              className="w-full text-slate-600 border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-sm"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Error or Full Width DataTable Container */}
      <div className="space-y-3">
        {result.error ? (
          <CrmFailure error={result.error} retry={result.reload} />
        ) : (
          <DataTable
            columns={columns}
            data={result.data?.items ?? []}
            keyExtractor={(b) => b.id}
            selectable
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            density="relaxed"
            isLoading={result.loading}
            emptyMessage={
              result.data?.total === 0 && !searchTerm && typeFilter === 'All' && cityFilter === 'All' && sourceFilter === 'All' && statusFilter === 'All'
                ? 'No businesses yet'
                : 'No businesses match these filters.'
            }
            pagination={
              result.data
                ? {
                    currentPage: result.data.page,
                    totalPages: result.data.totalPages,
                    totalEntries: result.data.total,
                    pageSize: result.data.limit,
                    onPageChange: (p) => setCurrentPage(p),
                  }
                : undefined
            }
          />
        )}
      </div>

      {/* 3 Inspection & Analytics Cards Side-by-Side After the Table */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 pt-2">
        {/* Card 1: Businesses by Status (4 Cols) */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Businesses by Status</span>
              <span className="font-bold text-slate-400 text-[11px]">
                Total: {metric(counts.data?.total)}
              </span>
            </h3>

            <div className="flex items-center justify-center pt-2">
              <div className="h-40 w-40">
                {counts.data && counts.data.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val: any) => [`${val} Businesses`, 'Count']}
                        contentStyle={{
                          backgroundColor: '#0D1F3D',
                          color: '#fff',
                          borderRadius: '4px',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-slate-400 font-medium">
                    {counts.loading
                      ? 'Loading status counts...'
                      : counts.error
                      ? 'Status counts unavailable'
                      : 'No businesses yet'}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
            {statusDistributionData.map((s) => {
              const totalVal = counts.data?.total || 1;
              const pct = counts.data?.total ? ((s.value / totalVal) * 100).toFixed(1) : '0.0';
              return (
                <div key={s.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-extrabold text-[#0D1F3D]">
                    {s.value.toLocaleString()} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Businesses by Source (5 Cols) */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Businesses by Source</span>
              <span className="font-bold text-slate-400 text-[11px]">Analytics unavailable</span>
            </h3>

            <div className="space-y-2.5 text-xs font-semibold pt-2">
              <div className="flex min-h-36 items-center justify-center rounded-sm bg-slate-50/70 p-4 text-center text-slate-500 font-medium">
                Source distribution is not available yet. Filter by source to see matching businesses.
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Quick Actions (3 Cols) */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs lg:col-span-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Quick Actions
            </h3>
            <p className="text-[11px] text-slate-500 pt-1 font-medium">
              Perform quick merchant operations and bulk imports.
            </p>
          </div>

          <div className="space-y-2 text-xs font-semibold pt-1">
            <button
              disabled={!canCreate}
              onClick={() => navigate('/admin/businesses/create')}
              className="w-full flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">Add New Business</p>
                  <p className="text-[10px] text-slate-400">Manually add a new merchant</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              disabled
              title="Import is not available in this phase"
              className="w-full flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-2.5 text-left transition-colors opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">Import Businesses</p>
                  <p className="text-[10px] text-slate-400">Import unavailable in this phase</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              disabled
              title="Export is not available in this phase"
              className="w-full flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-2.5 text-left transition-colors opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">Export Businesses</p>
                  <p className="text-[10px] text-slate-400">Export unavailable in this phase</p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
