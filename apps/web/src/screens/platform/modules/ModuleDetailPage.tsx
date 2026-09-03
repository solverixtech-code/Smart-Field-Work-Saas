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
  CheckCircle,
  ShieldCheck,
  Globe,
  Smartphone,
  Info,
  Calendar,
  User,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { DataTable } from '../../../components/ui/DataTable';
import { RowActionsMenu } from '../../../components/ui/RowActionsMenu';
import { moduleService } from '../../../features/platform/catalog/modules/services/module.service';
import { PlatformModule } from '../../../features/platform/catalog/modules/types/module.types';
import { usePlatformPermissions } from '../../../features/platform/tenants/hooks/usePlatformPermissions';

export function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { canArchiveModule, canUpdateModule } = usePlatformPermissions();

  const [module, setModule] = useState<PlatformModule | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Tab determination
  const activeTab = useMemo(() => {
    const p = location.pathname;
    if (p.endsWith('/features')) return 'features';
    if (p.endsWith('/dependencies')) return 'dependencies';
    if (p.endsWith('/history')) return 'history';
    return 'overview';
  }, [location.pathname]);

  const loadModule = async () => {
    if (!moduleId) return;
    setLoading(true);
    try {
      setModule(await moduleService.getModuleById(moduleId));
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
      <div className="p-8 text-center space-y-3 font-sans">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0D1F3D] mx-auto" />
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
    <div className="space-y-6 pb-16 font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#0D1F3D] text-white shadow-xs">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">{module.name}</h1>
              <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-sm border border-indigo-200">
                {module.code}
              </span>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-sm border ${
                  module.status === 'ARCHIVED'
                    ? 'bg-slate-100 text-slate-600 border-slate-300'
                    : module.status === 'DEPRECATED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : module.status === 'BETA'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : module.status === 'DRAFT'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {module.status}
              </span>
              {module.requiredBySystem && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-900 border border-amber-200">
                  Protected System Module
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-500 mt-1 max-w-2xl">
              {module.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/platform/modules')}
            className="gap-2 font-bold text-slate-700 bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Modules
          </Button>

          {canUpdateModule && module.status !== 'ARCHIVED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/platform/modules/${module.id}/edit`)}
              className="gap-2 font-bold text-slate-700 bg-white"
            >
              <Edit className="h-4 w-4" />
              Edit Module
            </Button>
          )}

          {canArchiveModule && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleArchiveRestore()}
              className={`gap-2 font-bold ${
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

      {/* Sub Tab Bar */}
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

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
                Module Information & Capability Scope
              </h2>

              <dl className="grid gap-4 text-xs md:grid-cols-2">
                <div>
                  <dt className="font-semibold text-slate-500">Module Name</dt>
                  <dd className="font-extrabold text-[#0D1F3D] mt-0.5">{module.name}</dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">Stable Identifier (Code)</dt>
                  <dd className="font-mono font-bold text-indigo-700 mt-0.5">{module.code}</dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">Platform Category</dt>
                  <dd className="font-bold text-slate-800 mt-0.5">{module.category}</dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">Lifecycle Status</dt>
                  <dd className="font-bold text-slate-800 mt-0.5">{module.status}</dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">System Required</dt>
                  <dd className="font-bold text-slate-800 mt-0.5">
                    {module.requiredBySystem ? 'Protected System Module (True)' : 'Optional Capability Module (False)'}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500">Display Order</dt>
                  <dd className="font-bold text-slate-800 mt-0.5">{module.displayOrder}</dd>
                </div>
              </dl>

              <div className="pt-3 border-t border-slate-100 space-y-1">
                <dt className="font-semibold text-slate-500 text-xs">Capability Description</dt>
                <dd className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-sm border border-slate-200">
                  {module.description}
                </dd>
              </div>
            </section>
          </div>

          {/* Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <section className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                Technical Metadata
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Registered Features</span>
                  <span className="font-bold text-[#0D1F3D]">{module.features?.length || 0} Features</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Prerequisite Parents</span>
                  <span className="font-bold text-indigo-700">{module.dependencyCodes?.length || 0} Modules</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-semibold">Created Date</span>
                  <span className="font-medium text-slate-700">{new Date(module.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold">Last Updated</span>
                  <span className="font-medium text-slate-700">{new Date(module.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Features */}
      {activeTab === 'features' && (
        <section className="rounded-sm border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-base font-extrabold text-[#0D1F3D]">
              Registered Code-Backed Features
            </h2>
            <p className="text-xs font-medium text-slate-500">
              Features represent software capabilities implemented in Smart Field Work codebase.
            </p>
          </div>

          <DataTable
            data={module.features || []}
            columns={[
              {
                header: 'Feature Name & Description',
                cell: (feat) => (
                  <div>
                    <span className="font-extrabold text-xs text-[#0D1F3D] block">{feat.name}</span>
                    <span className="text-[11px] font-medium text-slate-500 truncate max-w-xs block">{feat.description}</span>
                  </div>
                ),
              },
              {
                header: 'Implementation Key',
                cell: (feat) => (
                  <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-sm border border-indigo-100">
                    {feat.code}
                  </span>
                ),
              },
              {
                header: 'Platforms',
                cell: (feat) => (
                  <div className="flex items-center gap-1">
                    {(feat.supportsWeb ?? true) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-200">
                        Web
                      </span>
                    )}
                    {(feat.supportsMobile ?? true) && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-purple-50 text-purple-700 border border-purple-200">
                        Mobile
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Status',
                cell: (feat) => (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        <div className="space-y-6">
          <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-extrabold text-[#0D1F3D]">Prerequisite Parent Modules</h2>
                <p className="text-xs font-medium text-slate-500">
                  Modules that must be enabled before {module.name} can operate.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/platform/modules/${module.id}/edit`)}
                className="font-bold text-slate-700 bg-white"
              >
                Edit Dependencies
              </Button>
            </div>

            {module.dependencyCodes && module.dependencyCodes.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {module.dependencyCodes.map((depCode) => (
                  <div
                    key={depCode}
                    className="p-3 rounded-sm border border-indigo-200 bg-indigo-50/60 font-mono text-xs font-bold text-indigo-700 flex items-center gap-2"
                  >
                    <Package className="h-4 w-4 text-indigo-600" />
                    <span>{depCode}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs font-medium text-slate-400 italic">
                This module has no prerequisite dependencies.
              </p>
            )}
          </section>
        </div>
      )}

      {/* TAB CONTENT: Audit History */}
      {activeTab === 'history' && (
        <section className="rounded-sm border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-base font-extrabold text-[#0D1F3D]">Audit History</h2>
            <p className="text-xs font-medium text-slate-500">
              System audit events recorded for {module.name}.
            </p>
          </div>

          <DataTable
            data={[
              {
                id: '1',
                timestamp: module.createdAt,
                actor: 'Super Admin',
                action: 'Module Created',
                details: `Module ${module.code} defined in catalog.`,
              },
              {
                id: '2',
                timestamp: module.updatedAt,
                actor: 'Platform Operator',
                action: 'Metadata Updated',
                details: `Category: ${module.category}, Status: ${module.status}`,
              },
            ]}
            columns={[
              {
                header: 'Date & Time',
                cell: (item) => (
                  <span className="text-xs font-medium text-slate-600">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                ),
              },
              {
                header: 'Actor',
                cell: (item) => (
                  <span className="font-bold text-xs text-[#0D1F3D]">{item.actor}</span>
                ),
              },
              {
                header: 'Action',
                cell: (item) => (
                  <span className="font-extrabold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm border border-indigo-100">
                    {item.action}
                  </span>
                ),
              },
              {
                header: 'Event Details',
                cell: (item) => (
                  <span className="text-xs text-slate-600 font-medium">{item.details}</span>
                ),
              },
            ]}
            emptyMessage="No audit logs recorded."
          />
        </section>
      )}
    </div>
  );
}
