import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  Edit2,
  Archive,
  RotateCcw,
  CheckCircle,
  Package,
  Boxes,
  Plus,
  Trash2,
  Zap,
  AlertTriangle,
  GitBranch,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { moduleService } from '../../../features/platform/catalog/modules/services/module.service';
import {
  PlatformModule,
  ModuleFeature,
  ModuleFeatureStatus,
} from '../../../features/platform/catalog/modules/types/module.types';
import { usePlatformPermissions } from '../../../features/platform/tenants/hooks/usePlatformPermissions';
import { toast } from 'react-hot-toast';

export function ModuleDetailPage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { canUpdateModule, canArchiveModule } = usePlatformPermissions();

  const [module, setModule] = useState<PlatformModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'dependencies'>('overview');

  // All catalog modules for dependency selection
  const [allCatalogModules, setAllCatalogModules] = useState<PlatformModule[]>([]);

  // Modals state
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState<ModuleFeature | null>(null);
  const [featCode, setFeatCode] = useState('');
  const [featName, setFeatName] = useState('');
  const [featDesc, setFeatDesc] = useState('');
  const [featStatus, setFeatStatus] = useState<ModuleFeatureStatus>('ACTIVE');
  const [featSupport, setFeatSupport] = useState(true);
  const [savingFeature, setSavingFeature] = useState(false);

  // Manage Dependencies modal
  const [showDepModal, setShowDepModal] = useState(false);
  const [selectedDepCodes, setSelectedDepCodes] = useState<string[]>([]);
  const [savingDeps, setSavingDeps] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!moduleId) return;
    setLoading(true);
    try {
      const data = await moduleService.getModuleById(moduleId);
      setModule(data);
      if (data) {
        setSelectedDepCodes(data.dependencyCodes || []);
      }
    } catch {
      toast.error('Failed to load module details');
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    fetchDetail();
    moduleService.getModules().then(setAllCatalogModules).catch(() => {});
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500 font-sans">
        <div className="inline-block animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full mb-2" />
        <p className="text-xs font-semibold">Loading platform module details...</p>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="p-12 text-center text-slate-700 font-sans max-w-md mx-auto space-y-4">
        <AlertTriangle className="h-8 w-8 text-rose-600 mx-auto" />
        <h2 className="text-lg font-extrabold text-[#0D1F3D]">Module Not Found</h2>
        <p className="text-xs text-slate-500">The requested platform module does not exist or has been removed.</p>
        <Button variant="accent" size="sm" onClick={() => navigate('/platform/modules')}>
          Back to Modules Catalog
        </Button>
      </div>
    );
  }

  const handleArchive = async () => {
    if (module.requiredBySystem) {
      toast.error(`System-required module '${module.name}' cannot be archived.`);
      return;
    }
    try {
      await moduleService.archiveModule(module.id);
      toast.success(`Module '${module.name}' archived`);
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to archive module');
    }
  };

  const handleRestore = async () => {
    try {
      await moduleService.restoreModule(module.id);
      toast.success(`Module '${module.name}' restored`);
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to restore module');
    }
  };

  // Feature modal submit
  const handleOpenAddFeature = () => {
    setEditingFeature(null);
    setFeatCode('');
    setFeatName('');
    setFeatDesc('');
    setFeatStatus('ACTIVE');
    setFeatSupport(true);
    setShowFeatureModal(true);
  };

  const handleOpenEditFeature = (f: ModuleFeature) => {
    setEditingFeature(f);
    setFeatCode(f.code);
    setFeatName(f.name);
    setFeatDesc(f.description);
    setFeatStatus(f.status);
    setFeatSupport(f.platformSupport ?? true);
    setShowFeatureModal(true);
  };

  const handleSaveFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featCode.trim() || !featName.trim()) {
      toast.error('Feature code and name are required');
      return;
    }

    setSavingFeature(true);
    try {
      if (editingFeature && editingFeature.id) {
        await moduleService.updateFeature(module.id, editingFeature.id, {
          name: featName,
          description: featDesc,
          status: featStatus,
          platformSupport: featSupport,
        });
        toast.success(`Feature '${featName}' updated`);
      } else {
        await moduleService.createFeature(module.id, {
          code: featCode.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          name: featName,
          description: featDesc,
          status: featStatus,
          platformSupport: featSupport,
        });
        toast.success(`Feature '${featName}' added to module`);
      }
      setShowFeatureModal(false);
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save feature');
    } finally {
      setSavingFeature(false);
    }
  };

  const handleDeprecateFeature = async (f: ModuleFeature) => {
    if (!f.id) return;
    try {
      await moduleService.deleteFeature(module.id, f.id);
      toast.success(`Feature '${f.name}' deprecated`);
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to deprecate feature');
    }
  };

  // Save Dependencies
  const handleSaveDependencies = async () => {
    setSavingDeps(true);
    try {
      await moduleService.updateDependencies(module.id, selectedDepCodes);
      toast.success('Module dependencies updated successfully!');
      setShowDepModal(false);
      fetchDetail();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Dependency update rejected by server graph validator');
    } finally {
      setSavingDeps(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-16 max-w-6xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <span className="cursor-pointer hover:text-indigo-600" onClick={() => navigate('/platform/modules')}>
          Modules & Features
        </span>
        <span>/</span>
        <span className="text-[#0D1F3D] font-extrabold">{module.name}</span>
      </div>

      {/* Header Bar */}
      <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-[#0D1F3D]">{module.name}</h1>
              <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-sm border border-slate-200">
                {module.code}
              </span>
              <span
                className={`font-extrabold text-xs px-2.5 py-0.5 rounded-sm border ${
                  module.status === 'ARCHIVED'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : module.status === 'BETA'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {module.status}
              </span>
              {module.requiredBySystem && (
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 border border-amber-200">
                  System Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">{module.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/platform/modules')}
            className="font-bold text-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>

          {canUpdateModule && module.status !== 'ARCHIVED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/platform/modules/${module.id}/edit`)}
              className="gap-2 font-bold text-slate-700"
            >
              <Edit2 className="h-4 w-4" /> Edit Module
            </Button>
          )}

          {canArchiveModule &&
            (!module.requiredBySystem ? (
              module.status === 'ARCHIVED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRestore}
                  className="gap-2 font-bold text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                >
                  <RotateCcw className="h-4 w-4" /> Restore Module
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleArchive}
                  className="gap-2 font-bold text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  <Archive className="h-4 w-4" /> Archive Module
                </Button>
              )
            ) : null)}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 bg-white px-4 rounded-sm shadow-xs flex items-center gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Info className="h-4 w-4" /> Overview & Attributes
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'features'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Boxes className="h-4 w-4" /> Features & Capabilities ({module.features?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('dependencies')}
          className={`py-3 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'dependencies'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <GitBranch className="h-4 w-4" /> Dependencies ({module.dependencyCodes?.length || 0})
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
              Module Summary & Commercial Details
            </h3>

            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Module Name</span>
                <span className="font-extrabold text-[#0D1F3D]">{module.name}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Canonical Code</span>
                <span className="font-mono font-extrabold text-indigo-600">{module.code}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Category</span>
                <span className="font-semibold text-slate-800">{module.category}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Status</span>
                <span className="font-extrabold text-slate-800">{module.status}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Commercial Type</span>
                <span className="font-extrabold text-purple-700">
                  {module.isAddon ? 'Paid Add-on Module' : 'Standard Base Module'}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Monthly Add-on Price</span>
                <span className="font-extrabold text-[#0D1F3D]">
                  {module.isAddon ? `₹${module.monthlyPrice.toLocaleString('en-IN')}/mo` : 'Included in Base Plan'}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">System Required</span>
                <span className="font-bold text-slate-800">
                  {module.requiredBySystem ? 'Yes (Mandatory)' : 'No (Optional)'}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Display Order</span>
                <span className="font-bold text-slate-800">{module.displayOrder || 0}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-1">Full Description</span>
              <p className="text-xs text-slate-700 font-medium leading-relaxed">{module.description}</p>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
              Catalog Stats
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Contained Features:</span>
                <span className="font-extrabold text-indigo-600">{module.features?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Required Parent Modules:</span>
                <span className="font-extrabold text-indigo-600">{module.dependencyCodes?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Dependent Modules:</span>
                <span className="font-extrabold text-indigo-600">{module.dependentCodes?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FEATURES TAB */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Features represent non-commercial functional capabilities contained inside this module.
            </p>

            {canUpdateModule && (
              <Button
                variant="accent"
                size="sm"
                onClick={handleOpenAddFeature}
                className="gap-2 font-extrabold shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="h-4 w-4" /> Add Feature
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(module.features || []).map((f) => (
              <div
                key={f.code}
                className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-extrabold text-sm text-[#0D1F3D]">{f.name}</h4>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-sm border ${
                        f.status === 'DEPRECATED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : f.status === 'BETA'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {f.status}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-500 block mb-2">{f.code}</span>
                  <p className="text-xs text-slate-600 font-medium">{f.description}</p>
                </div>

                {canUpdateModule && (
                  <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEditFeature(f)}
                      className="h-7 text-xs font-bold text-slate-700 px-2"
                    >
                      <Edit2 className="h-3 w-3 mr-1" /> Edit
                    </Button>

                    {f.status !== 'DEPRECATED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeprecateFeature(f)}
                        className="h-7 text-xs font-bold text-rose-700 border-rose-200 hover:bg-rose-50 px-2"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Deprecate
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}

            {(!module.features || module.features.length === 0) && (
              <div className="col-span-2 p-8 text-center bg-white rounded-sm border border-slate-200 text-slate-500 text-xs font-medium">
                No features defined inside this module yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* DEPENDENCIES TAB */}
      {activeTab === 'dependencies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 font-medium">
              Dependency Graph: Configures parent prerequisite modules and shows dependent downstream modules.
            </p>

            {canUpdateModule && (
              <Button
                variant="accent"
                size="sm"
                onClick={() => setShowDepModal(true)}
                className="gap-2 font-extrabold shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <GitBranch className="h-4 w-4" /> Manage Dependencies
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Prerequisite Parents */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3 flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-indigo-600" /> Prerequisite Required Parent Modules
              </h3>

              <div className="space-y-2">
                {(module.dependencyCodes || []).map((depCode) => {
                  const target = allCatalogModules.find((m) => m.code === depCode);
                  return (
                    <div
                      key={depCode}
                      className="p-3 rounded-sm border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-extrabold text-xs text-[#0D1F3D]">{target?.name || depCode}</span>
                        <span className="font-mono text-[11px] text-slate-500 block">{depCode}</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Required Parent
                      </span>
                    </div>
                  );
                })}

                {(!module.dependencyCodes || module.dependencyCodes.length === 0) && (
                  <p className="text-xs text-slate-500 font-medium p-4 text-center">
                    This module has no required parent dependencies.
                  </p>
                )}
              </div>
            </div>

            {/* Card 2: Dependent Downstream Modules */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3 flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-600" /> Modules Depending on {module.name}
              </h3>

              <div className="space-y-2">
                {(module.dependentCodes || []).map((depCode) => {
                  const target = allCatalogModules.find((m) => m.code === depCode);
                  return (
                    <div
                      key={depCode}
                      className="p-3 rounded-sm border border-purple-200 bg-purple-50/40 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-extrabold text-xs text-[#0D1F3D]">{target?.name || depCode}</span>
                        <span className="font-mono text-[11px] text-slate-500 block">{depCode}</span>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-purple-100 text-purple-800">
                        Downstream Dependent
                      </span>
                    </div>
                  );
                })}

                {(!module.dependentCodes || module.dependentCodes.length === 0) && (
                  <p className="text-xs text-slate-500 font-medium p-4 text-center">
                    No downstream modules currently depend on this module.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Add / Edit Modal */}
      {showFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-sm border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">
              {editingFeature ? 'Edit Module Feature' : 'Add New Module Feature'}
            </h3>

            <form onSubmit={handleSaveFeature} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Feature Name</label>
                <Input
                  type="text"
                  placeholder="e.g. Lead Pipeline Stages"
                  value={featName}
                  onChange={(e) => setFeatName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Feature Code {!editingFeature && '(lowercase snake_case)'}
                </label>
                <Input
                  type="text"
                  placeholder="e.g. lead_pipeline"
                  value={featCode}
                  onChange={(e) => setFeatCode(e.target.value)}
                  disabled={Boolean(editingFeature)}
                  className="font-mono text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={featDesc}
                  onChange={(e) => setFeatDesc(e.target.value)}
                  placeholder="Brief feature description..."
                  className="w-full text-xs rounded-sm border border-slate-300 p-2.5 focus:border-indigo-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <Select
                  value={featStatus}
                  onChange={(e) => setFeatStatus(e.target.value as ModuleFeatureStatus)}
                  options={[
                    { value: 'ACTIVE', label: 'ACTIVE' },
                    { value: 'BETA', label: 'BETA' },
                    { value: 'DEPRECATED', label: 'DEPRECATED' },
                  ]}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setShowFeatureModal(false)}
                  className="font-bold text-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  type="submit"
                  disabled={savingFeature}
                  className="font-bold bg-indigo-600 text-white"
                >
                  {savingFeature ? 'Saving...' : 'Save Feature'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Dependencies Modal */}
      {showDepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-sm border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-indigo-600" /> Manage Dependencies for {module.name}
            </h3>

            <p className="text-xs text-slate-500 font-medium">
              Select prerequisite parent modules. Server graph validator will automatically reject self-dependencies or circular cycles.
            </p>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 border border-slate-200 p-3 rounded-sm bg-slate-50">
              {allCatalogModules
                .filter((m) => m.id !== module.id)
                .map((m) => {
                  const isChecked = selectedDepCodes.includes(m.code);
                  return (
                    <div
                      key={m.code}
                      onClick={() => {
                        setSelectedDepCodes((prev) =>
                          prev.includes(m.code)
                            ? prev.filter((c) => c !== m.code)
                            : [...prev, m.code]
                        );
                      }}
                      className={`p-2.5 rounded-sm border cursor-pointer flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-indigo-600 bg-indigo-50/60 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-100/60'
                      }`}
                    >
                      <div>
                        <span className="font-extrabold text-xs text-[#0D1F3D]">{m.name}</span>
                        <span className="font-mono text-[11px] text-slate-500 ml-2">({m.code})</span>
                      </div>
                      <Checkbox checked={isChecked} onChange={() => {}} />
                    </div>
                  );
                })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDepModal(false)}
                className="font-bold text-slate-700"
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleSaveDependencies}
                disabled={savingDeps}
                className="font-bold bg-indigo-600 text-white"
              >
                {savingDeps ? 'Validating...' : 'Save Dependencies'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
