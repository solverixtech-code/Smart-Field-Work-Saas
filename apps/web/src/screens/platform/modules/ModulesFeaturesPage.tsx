import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  Eye,
  Edit2,
  Archive,
  RotateCcw,
  CheckCircle,
  Package,
  Boxes,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { DataTable } from '../../../components/ui/DataTable';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import { moduleService } from '../../../features/platform/catalog/modules/services/module.service';
import { PlatformModule, PlatformModuleCategory, PlatformModuleStatus } from '../../../features/platform/catalog/modules/types/module.types';
import { usePlatformPermissions } from '../../../features/platform/tenants/hooks/usePlatformPermissions';
import { toast } from 'react-hot-toast';

export function ModulesFeaturesPage() {
  const navigate = useNavigate();
  const { canCreateModule, canUpdateModule, canArchiveModule } = usePlatformPermissions();

  const [modules, setModules] = useState<PlatformModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const fetchModules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moduleService.getModules({
        status: statusFilter === 'ALL' ? undefined : (statusFilter as PlatformModuleStatus),
      });
      setModules(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load platform modules from backend.');
      toast.error('Failed to load modules catalog from server');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  // Client-side filtering & search
  const filteredModules = useMemo(() => {
    return modules.filter((m) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSearch =
          m.name.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }

      if (categoryFilter !== 'ALL' && m.category.toUpperCase() !== categoryFilter.toUpperCase()) {
        return false;
      }

      if (typeFilter === 'ADDON' && !m.isAddon) return false;
      if (typeFilter === 'STANDARD' && m.isAddon) return false;

      return true;
    });
  }, [modules, search, categoryFilter, typeFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = modules.length;
    const active = modules.filter((m) => m.status === 'ACTIVE').length;
    const addons = modules.filter((m) => m.isAddon).length;
    const totalFeatures = modules.reduce((acc, m) => acc + (m.features?.length || 0), 0);
    return { total, active, addons, totalFeatures };
  }, [modules]);

  const handleArchive = async (m: PlatformModule) => {
    if (m.requiredBySystem) {
      toast.error(`System-required module '${m.name}' cannot be archived.`);
      return;
    }
    try {
      await moduleService.archiveModule(m.id);
      toast.success(`Module '${m.name}' archived successfully`);
      fetchModules();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to archive module');
    }
  };

  const handleRestore = async (m: PlatformModule) => {
    try {
      await moduleService.restoreModule(m.id);
      toast.success(`Module '${m.name}' restored successfully`);
      fetchModules();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to restore module');
    }
  };

  const columns = [
    {
      accessorKey: 'name' as keyof PlatformModule,
      header: 'Module Name',
      cell: (m: PlatformModule) => (
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate(`/platform/modules/${m.id}`)}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Package className="h-4 w-4" />
          </div>
          <div>
            <div className="font-extrabold text-[#0D1F3D] group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
              {m.name}
              {m.requiredBySystem && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-xs bg-amber-50 text-amber-700 border border-amber-200">
                  System Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium truncate max-w-[320px]">
              {m.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'code' as keyof PlatformModule,
      header: 'Module Code',
      cell: (m: PlatformModule) => (
        <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200">
          {m.code}
        </span>
      ),
    },
    {
      accessorKey: 'category' as keyof PlatformModule,
      header: 'Category',
      cell: (m: PlatformModule) => {
        const categoryLabels: Record<string, string> = {
          CORE: 'Core Module',
          SALES: 'Sales Engine',
          FIELD_OPS: 'Field Operations',
          AUTOMATION: 'Automation & AI',
          ENTERPRISE: 'Enterprise Suite',
        };
        const displayLabel = categoryLabels[m.category.toUpperCase()] || m.category;

        return (
          <span className="inline-flex items-center gap-1 font-semibold text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-sm border border-slate-200">
            <Boxes className="h-3 w-3 text-slate-400" />
            {displayLabel}
          </span>
        );
      },
    },
    {
      header: 'Features',
      cell: (m: PlatformModule) => (
        <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm border border-indigo-100">
          {m.features?.length || 0} features
        </span>
      ),
    },
    {
      header: 'Type',
      cell: (m: PlatformModule) => (
        <span
          className={`font-extrabold text-xs px-2.5 py-1 rounded-sm border ${
            m.isAddon
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {m.isAddon ? 'Add-on' : 'Standard'}
        </span>
      ),
    },
    {
      header: 'Add-on Price',
      cell: (m: PlatformModule) => (
        <span className="font-extrabold text-xs text-[#0D1F3D]">
          {m.isAddon && m.monthlyPrice > 0 ? `₹${m.monthlyPrice.toLocaleString('en-IN')}/mo` : 'Included'}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (m: PlatformModule) => {
        const isArchived = m.status === 'ARCHIVED';
        const isBeta = m.status === 'BETA';
        return (
          <span
            className={`font-extrabold text-xs px-2.5 py-0.5 rounded-sm border ${
              isArchived
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : isBeta
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}
          >
            {m.status}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      cell: (m: PlatformModule) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/platform/modules/${m.id}`)}
            className="h-8 px-2.5 text-xs font-bold text-slate-700"
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> View
          </Button>

          {canUpdateModule && m.status !== 'ARCHIVED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/platform/modules/${m.id}/edit`)}
              className="h-8 px-2.5 text-xs font-bold text-slate-700"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
          )}

          {canArchiveModule &&
            (!m.requiredBySystem ? (
              m.status === 'ARCHIVED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(m)}
                  className="h-8 px-2.5 text-xs font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArchive(m)}
                  className="h-8 px-2.5 text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  <Archive className="h-3.5 w-3.5 mr-1" /> Archive
                </Button>
              )
            ) : null)}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Modules & Features</h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Manage the platform capability catalog used by commercial plans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchModules}
            className="gap-2 font-bold text-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          {canCreateModule && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/platform/modules/create')}
              className="gap-2 font-extrabold shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white px-4"
            >
              <Plus className="h-4 w-4" /> Create Module
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Modules"
          value={metrics.total}
          icon={Package}
          iconBgColor="bg-indigo-50"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Active Modules"
          value={metrics.active}
          icon={CheckCircle}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Add-on Modules"
          value={metrics.addons}
          icon={Zap}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Total Features"
          value={metrics.totalFeatures}
          icon={Boxes}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
      </div>


      {/* Filter Toolbar */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search module name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Categories' },
              { value: 'CORE', label: 'Core Modules' },
              { value: 'SALES', label: 'Sales Engine' },
              { value: 'FIELD_OPS', label: 'Field Operations' },
              { value: 'AUTOMATION', label: 'Automation & AI' },
              { value: 'ENTERPRISE', label: 'Enterprise Suite' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'Active & Drafts (Exclude Archived)' },
              { value: 'ACTIVE', label: 'Active Only' },
              { value: 'BETA', label: 'Beta Only' },
              { value: 'DEPRECATED', label: 'Deprecated Only' },
              { value: 'ARCHIVED', label: 'Archived Only' },
            ]}
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'ALL', label: 'All Types' },
              { value: 'STANDARD', label: 'Standard Included' },
              { value: 'ADDON', label: 'Paid Add-ons' },
            ]}
          />
        </div>
      </div>

      {/* Main Full-Width Table */}
      <div className="rounded-sm border border-slate-200 bg-white shadow-xs">
        <DataTable
          data={filteredModules}
          columns={columns}
          isLoading={loading}
          emptyMessage="No platform modules match the selected filter parameters."
          onRowClick={(m) => navigate(`/platform/modules/${m.id}`)}
        />
      </div>
    </div>
  );
}
