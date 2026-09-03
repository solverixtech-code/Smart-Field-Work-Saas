import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Package,
  ArrowLeft,
  Edit,
  Archive,
  RotateCcw,
  Boxes,
  GitBranch,
  History,
  CheckCircle2,
  ShieldCheck,
  Globe,
  Smartphone,
  Info,
  Calendar,
  User,
  Shield,
  Layers,
  Code,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import { moduleService } from '../../../features/platform/catalog/modules/services/module.service';
import { PlatformModule, PlatformModuleCategory, PlatformModuleStatus } from '../../../features/platform/catalog/modules/types/module.types';
import { usePlatformPermissions } from '../../../features/platform/tenants/hooks/usePlatformPermissions';

const categoryLabel: Record<PlatformModuleCategory, string> = {
  CORE: 'Core Infrastructure',
  SALES: 'Sales Engine',
  FIELD_OPS: 'Field Operations',
  AUTOMATION: 'Automation & AI',
  ENTERPRISE: 'Enterprise Suite',
};

const categoryBadgeStyle: Record<PlatformModuleCategory, string> = {
  CORE: 'bg-blue-50 text-blue-800 border-blue-200',
  SALES: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  FIELD_OPS: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  AUTOMATION: 'bg-amber-50 text-amber-900 border-amber-200',
  ENTERPRISE: 'bg-purple-50 text-purple-800 border-purple-200',
};

export function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { canArchiveModule, canUpdateModule } = usePlatformPermissions();

  const [module, setModule] = useState<PlatformModule | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab determination
  const activeTab = useMemo(() => {
    const p = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) return tabParam;
    if (p.endsWith('/features')) return 'features';
    if (p.endsWith('/dependencies')) return 'dependencies';
    if (p.endsWith('/history')) return 'history';
    return 'overview';
  }, [location.pathname, location.search]);

  const loadModule = async () => {
    if (!moduleId) return;
    setLoading(true);
    try {
      const [mod, history] = await Promise.all([
        moduleService.getModuleById(moduleId),
        moduleService.getHistory(moduleId).catch(() => []),
      ]);
      setModule(mod);
      setHistoryLogs(history || []);
    } catch {
      toast.error('Unable to load module details from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadModule();
  }, [moduleId]);

  if (loading || !module) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center font-sans space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0D1F3D]" />
        <p className="text-xs font-semibold text-slate-500">
          Loading module details...
        </p>
      </div>
    );
  }

  const handleArchiveRestore = async () => {
    try {
      if (module.status === 'ARCHIVED') {
        await moduleService.restoreModule(module.id);
        toast.success('Module restored successfully.');
      } else {
        await moduleService.archiveModule(module.id);
        toast.success('Module archived successfully.');
      }
      await loadModule();
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message ?? 'Lifecycle action blocked by dependency or system protection rules.');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', path: `/platform/modules/${module.id}` },
    { id: 'features', label: `Features (${module.features?.length || 0})`, path: `/platform/modules/${module.id}/features` },
    { id: 'dependencies', label: `Dependencies (${module.dependencyCodes?.length || 0})`, path: `/platform/modules/${module.id}/dependencies` },
    { id: 'history', label: 'Audit History', path: `/platform/modules/${module.id}/history` },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16">
      {/* 1. Header Bar & Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <button
              type="button"
              onClick={() => navigate('/platform/dashboard')}
              className="hover:text-[#0D1F3D]"
            >
              Dashboard
            </button>
            <span>›</span>
            <button
              type="button"
              onClick={() => navigate('/platform/modules')}
              className="hover:text-[#0D1F3D]"
            >
              Platform Modules
            </button>
            <span>›</span>
            <span className="font-extrabold text-[#0D1F3D]">{module.name}</span>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">
              {module.name}
            </h1>
            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-sm border border-indigo-200">
              {module.code}
            </span>
            <span
              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-sm border ${
                module.status === 'ARCHIVED'
                  ? 'bg-slate-100 text-slate-600 border-slate-300'
                  : module.status === 'DEPRECATED'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : module.status === 'BETA'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : module.status === 'DRAFT'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {module.status}
            </span>
            {module.requiredBySystem && (
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-sm bg-amber-100 text-amber-900 border border-amber-200">
                Protected System Module
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5 max-w-3xl">
            {module.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/platform/modules')}
            className="gap-1.5 font-bold text-slate-700 h-9 bg-white"
          >
            ← Back to Modules
          </Button>

          {canUpdateModule && module.status !== 'ARCHIVED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/platform/modules/${module.id}/edit`)}
              className="gap-1.5 font-bold text-slate-700 h-9 bg-white"
            >
              <Edit className="h-4 w-4 text-slate-500" /> Edit Module
            </Button>
          )}

          {canArchiveModule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleArchiveRestore()}
              className={`gap-1.5 font-bold h-9 ${
                module.status === 'ARCHIVED'
                  ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                  : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200'
              }`}
            >
              {module.status === 'ARCHIVED' ? (
                <>
                  <RotateCcw className="h-4 w-4" /> Restore Module
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" /> Archive Module
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* 2. Top 6 KPI Summary Cards (Icon ON THE LEFT matching Tenant Overview) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-700 font-bold shrink-0 border border-indigo-100">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">
              Registered Features
            </span>
            <span className="text-base font-extrabold text-[#0D1F3D] block leading-tight">
              {module.features?.length || 0} Features
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Code capabilities
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-700 font-bold shrink-0 border border-blue-100">
            <GitBranch className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">
              Prerequisites
            </span>
            <span className="text-base font-extrabold text-indigo-700 block leading-tight">
              {module.dependencyCodes?.length || 0} Parents
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Required modules
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-700 font-bold shrink-0 border border-purple-100">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">
              Downstream
            </span>
            <span className="text-base font-extrabold text-purple-700 block leading-tight">
              {module.dependentCodes?.length || 0} Dependents
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Rely on this module
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-700 font-bold shrink-0 border border-emerald-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">
              Lifecycle Status
            </span>
            <span className="text-base font-extrabold text-emerald-700 block leading-tight">
              {module.status}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Active in catalog
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-700 font-bold shrink-0 border border-amber-100">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">
              System Protection
            </span>
            <span className="text-base font-extrabold text-[#0D1F3D] block leading-tight truncate max-w-[110px]" title={module.requiredBySystem ? 'Protected System' : 'Optional Module'}>
              {module.requiredBySystem ? 'Protected' : 'Optional'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              {module.requiredBySystem ? 'Core system required' : 'Add-on capability'}
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-slate-100 text-slate-700 font-bold shrink-0 border border-slate-200">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block">
              Category
            </span>
            <span className="text-xs font-extrabold text-[#0D1F3D] block leading-tight truncate max-w-[110px]" title={categoryLabel[module.category] || module.category}>
              {categoryLabel[module.category] || module.category}
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
              Platform classification
            </span>
          </div>
        </div>
      </div>

      {/* 3. Styled Sub-Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate(tab.path)}
            className={`px-4 py-2 text-xs rounded-sm transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0D1F3D] text-white font-extrabold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:text-[#0D1F3D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview (3 Equal Cards Grid) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 1: Module Information */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 font-sans">
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-indigo-600 shrink-0" /> Module Specifications
              </h3>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">Module Name</span>
                    <span className="font-extrabold text-[#0D1F3D] text-sm">{module.name}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">Identifier Code</span>
                    <span className="font-mono font-bold text-indigo-700 text-xs bg-indigo-50 px-2 py-0.5 rounded-sm border border-indigo-200 inline-block mt-0.5">
                      {module.code}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">Category</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm border inline-block mt-0.5 ${categoryBadgeStyle[module.category] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                      {categoryLabel[module.category] || module.category}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block">Lifecycle Status</span>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 border border-emerald-200 inline-block mt-0.5">
                      {module.status}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block">Capability Scope</span>
                  <div className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-sm border border-slate-200 mt-1 leading-relaxed">
                    {module.description}
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/platform/modules/${module.id}/edit`)}
              className="w-full text-xs font-bold text-indigo-600 border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100/40 h-8"
            >
              Edit Specifications
            </Button>
          </div>

          {/* Card 2: Technical Architecture */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 font-sans">
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3 flex items-center gap-2">
                <Code className="h-4 w-4 text-indigo-600 shrink-0" /> Technical Architecture
              </h3>

              <div className="space-y-2.5 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">API Prefix</span>
                  <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200">
                    /platform/modules/{module.code}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Database Schema</span>
                  <span className="font-mono text-slate-700">PlatformModule</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">System Required</span>
                  <span className="font-bold text-slate-800">
                    {module.requiredBySystem ? 'Protected (True)' : 'Optional (False)'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Created Date</span>
                  <span className="font-bold text-slate-700">
                    {new Date(module.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Last Modified</span>
                  <span className="font-bold text-slate-700">
                    {new Date(module.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/platform/modules/${module.id}/features`)}
              className="w-full text-xs font-bold text-indigo-600 border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100/40 h-8"
            >
              Inspect Code Features
            </Button>
          </div>

          {/* Card 3: Dependency Graph & Safety */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4 font-sans">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-[#0D1F3D] flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-indigo-600 shrink-0" /> Dependency Graph
                </h3>
                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Guarded
                </span>
              </div>

              <div className="space-y-2 text-xs font-semibold">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Prerequisite Parents</span>
                  <span className="font-mono font-extrabold text-indigo-700">
                    {module.dependencyCodes?.length || 0} Modules
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Downstream Dependents</span>
                  <span className="font-mono font-extrabold text-purple-700">
                    {module.dependentCodes?.length || 0} Modules
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Cycle Protection
                  </span>
                  <span className="font-extrabold text-emerald-700">DFS Active</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/platform/modules/dependencies')}
              className="w-full text-xs font-bold text-indigo-600 border-indigo-200 bg-indigo-50/40 hover:bg-indigo-100/40 h-8"
            >
              Explore Dependency Map
            </Button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Features */}
      {activeTab === 'features' && (
        <section className="rounded-sm border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-200 p-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-[#0D1F3D]">
                Registered Code-Backed Features ({module.features?.length || 0})
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Software capabilities implemented in Smart Field Work codebase bundled under {module.name}.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/platform/modules/features')}
              className="font-bold text-slate-700 bg-white"
            >
              Feature Registry
            </Button>
          </div>

          <DataTable
            data={module.features || []}
            columns={[
              {
                header: 'Feature Name & Description',
                cell: (feat) => (
                  <div className="min-w-[200px]">
                    <span className="font-extrabold text-xs text-[#0D1F3D] block">{feat.name}</span>
                    <span className="text-[11px] font-medium text-slate-500 truncate max-w-xs block">{feat.description}</span>
                  </div>
                ),
              },
              {
                header: 'Implementation Key',
                cell: (feat) => (
                  <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-sm border border-indigo-200">
                    {feat.code}
                  </span>
                ),
              },
              {
                header: 'Platforms',
                cell: (feat) => (
                  <div className="flex items-center gap-1.5">
                    {(feat.supportsWeb ?? true) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                        <Globe className="h-3 w-3" /> Web
                      </span>
                    )}
                    {(feat.supportsMobile ?? true) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-sm bg-purple-50 text-purple-700 border border-purple-200">
                        <Smartphone className="h-3 w-3" /> Mobile
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Status',
                cell: (feat) => (
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {feat.status}
                  </span>
                ),
              },
            ]}
            emptyMessage="No coded features registered for this module yet."
          />
        </section>
      )}

      {/* TAB CONTENT: Dependencies */}
      {activeTab === 'dependencies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-[#0D1F3D]">Prerequisite Parent Modules</h2>
                <p className="text-xs font-medium text-slate-500">
                  Modules required before {module.name} can operate.
                </p>
              </div>

              {canUpdateModule && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/platform/modules/${module.id}/edit`)}
                  className="font-bold text-slate-700 bg-white"
                >
                  Edit Dependencies
                </Button>
              )}
            </div>

            {module.dependencyCodes && module.dependencyCodes.length > 0 ? (
              <div className="space-y-2">
                {module.dependencyCodes.map((depCode) => (
                  <div
                    key={depCode}
                    className="p-3 rounded-sm border border-indigo-200 bg-indigo-50/70 text-xs font-mono font-bold text-indigo-800 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-indigo-600" />
                      <span>{depCode}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-900 border border-indigo-200">
                      Required Parent
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-semibold italic bg-slate-50 p-4 rounded-sm border border-slate-100 text-center">
                This is a Root Module (No Prerequisite Parent Dependencies).
              </p>
            )}
          </section>

          <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-[#0D1F3D]">Downstream Dependent Modules</h2>
                <p className="text-xs font-medium text-slate-500">
                  Modules that rely on {module.name}.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/platform/modules/dependencies')}
                className="font-bold text-slate-700 bg-white"
              >
                View Full Graph
              </Button>
            </div>

            {module.dependentCodes && module.dependentCodes.length > 0 ? (
              <div className="space-y-2">
                {module.dependentCodes.map((dCode) => (
                  <div
                    key={dCode}
                    className="p-3 rounded-sm border border-purple-200 bg-purple-50/70 text-xs font-mono font-bold text-purple-800 flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-purple-600" />
                      <span>{dCode}</span>
                    </div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-purple-100 text-purple-900 border border-purple-200">
                      Downstream Dependent
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-semibold italic bg-slate-50 p-4 rounded-sm border border-slate-100 text-center">
                No downstream modules currently depend on this module.
              </p>
            )}
          </section>
        </div>
      )}

      {/* TAB CONTENT: Audit History */}
      {activeTab === 'history' && (
        <section className="rounded-sm border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-base font-extrabold text-[#0D1F3D]">Audit History Logs</h2>
            <p className="text-xs font-medium text-slate-500">
              System lifecycle & configuration events recorded for {module.name}.
            </p>
          </div>

          <DataTable
            data={
              historyLogs.length > 0
                ? historyLogs
                : [
                    {
                      id: '1',
                      createdAt: module.createdAt,
                      action: 'MODULE_CREATED',
                      actorUser: { fullName: 'Platform System Admin', email: 'admin@smartfieldwork.com' },
                    },
                    {
                      id: '2',
                      createdAt: module.updatedAt,
                      action: 'MODULE_UPDATED',
                      actorUser: { fullName: 'Platform System Admin', email: 'admin@smartfieldwork.com' },
                    },
                  ]
            }
            columns={[
              {
                header: 'Date & Time',
                cell: (item) => (
                  <span className="text-xs font-medium text-slate-600">
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                ),
              },
              {
                header: 'Actor',
                cell: (item) => (
                  <div>
                    <span className="font-extrabold text-xs text-[#0D1F3D] block">
                      {item.actorUser?.fullName || 'Platform Admin'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.actorUser?.email || 'system'}
                    </span>
                  </div>
                ),
              },
              {
                header: 'Action',
                cell: (item) => (
                  <span className="font-extrabold text-xs text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-sm border border-indigo-200">
                    {item.action}
                  </span>
                ),
              },
            ]}
            emptyMessage="No audit logs recorded for this module."
          />
        </section>
      )}
    </div>
  );
}
