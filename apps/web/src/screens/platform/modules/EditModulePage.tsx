import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Package,
  ArrowLeft,
  Search,
  ShieldAlert,
  Sparkles,
  Save,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import { moduleService } from '../../../features/platform/catalog/modules/services/module.service';
import {
  PlatformModule,
  PlatformModuleCategory,
  PlatformModuleStatus,
} from '../../../features/platform/catalog/modules/types/module.types';

const categoryOptions = [
  { value: 'CORE', label: 'Core Infrastructure' },
  { value: 'SALES', label: 'Sales Engine' },
  { value: 'FIELD_OPS', label: 'Field Operations' },
  { value: 'AUTOMATION', label: 'Automation & AI' },
  { value: 'ENTERPRISE', label: 'Enterprise Suite' },
];

const statusOptions = [
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'BETA', label: 'BETA' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'DEPRECATED', label: 'DEPRECATED' },
];

export function EditModulePage() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();

  const [module, setModule] = useState<PlatformModule | null>(null);
  const [catalog, setCatalog] = useState<PlatformModule[]>([]);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PlatformModuleCategory>('CORE');
  const [status, setStatus] =
    useState<Exclude<PlatformModuleStatus, 'ARCHIVED'>>('DRAFT');
  const [requiredBySystem, setRequiredBySystem] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [dependencyCodes, setDependencyCodes] = useState<string[]>([]);
  const [depSearch, setDepSearch] = useState('');

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!moduleId) return;

    void Promise.all([
      moduleService.getModuleById(moduleId),
      moduleService.getModules({ limit: 100 }),
    ])
      .then(([loaded, modules]) => {
        if (!loaded) return;
        setModule(loaded);
        setName(loaded.name);
        setDescription(loaded.description);
        setCategory(loaded.category);
        setStatus(loaded.status as Exclude<PlatformModuleStatus, 'ARCHIVED'>);
        setRequiredBySystem(loaded.requiredBySystem);
        setDisplayOrder(loaded.displayOrder);
        setDependencyCodes(loaded.dependencyCodes || []);
        setCatalog(modules.filter((item) => item.id !== loaded.id));
      })
      .catch(() => toast.error('Unable to load module editor data.'));
  }, [moduleId]);

  const filteredCatalog = useMemo(() => {
    return catalog
      .filter((m) => m.status !== 'ARCHIVED')
      .filter((m) => {
        if (!depSearch.trim()) return true;
        const q = depSearch.toLowerCase().trim();
        return (
          m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q)
        );
      });
  }, [catalog, depSearch]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!module) return;

    if (!name.trim()) {
      toast.error('Module Name is required.');
      return;
    }

    if (!description.trim()) {
      toast.error('Module Description is required.');
      return;
    }

    setSaving(true);

    try {
      await moduleService.updateModule(module.id, {
        name,
        description,
        category,
        status,
        requiredBySystem,
        displayOrder,
        dependencyCodes,
      });

      toast.success(`Module '${name}' updated successfully.`);
      navigate(`/platform/modules/${module.id}`);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message ?? 'Failed to update module.');
    } finally {
      setSaving(false);
    }
  };

  if (!module) {
    return (
      <div className="p-8 text-center space-y-3 font-sans">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0D1F3D] mx-auto" />
        <p className="text-xs font-semibold text-slate-500">
          Loading module editor...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 pb-20 font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Edit Module: {module.name}</h1>
            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-sm border border-indigo-200">
              {module.code}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Module Code is a stable platform identifier and cannot be changed after creation.
          </p>
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => navigate(`/platform/modules/${module.id}`)}
            className="gap-2 font-bold text-slate-700 bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Cancel & Back
          </Button>
        </div>
      </div>

      {/* 8/4 Composition Layout Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* LEFT COLUMN — 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Module Identification */}
          <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Module Identification</h2>
              <p className="text-xs font-medium text-slate-500">
                Update module display name, description, category and display order.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Module Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="space-y-1">
                <Input label="Module Code (Read-Only)" value={module.code} disabled />
                <p className="text-[10px] font-medium text-slate-400">
                  Stable identifier locked at creation.
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 block">
                Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white p-3 text-xs font-medium text-[#0D1F3D] placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
              />
              <div className="flex justify-end text-[10px] font-semibold text-slate-400">
                {description.length} / 500 characters
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Category *"
                value={category}
                onChange={(e) => setCategory(e.target.value as PlatformModuleCategory)}
                options={categoryOptions}
              />

              <Select
                label="Lifecycle Status *"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as Exclude<PlatformModuleStatus, 'ARCHIVED'>)
                }
                options={statusOptions}
              />
            </div>
          </section>

          {/* Card 2: Lifecycle & Platform Rules */}
          <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Lifecycle & Platform Rules</h2>
            </div>

            <div className="space-y-3">
              <Checkbox
                label="Required by System (Protected Platform Module)"
                checked={requiredBySystem}
                onChange={(checked) => setRequiredBySystem(checked)}
              />

              {requiredBySystem && (
                <div className="rounded-sm border border-amber-200 bg-amber-50/70 p-3 text-xs font-medium text-amber-900 flex items-start gap-2.5">
                  <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    System-required modules are protected platform capabilities and cannot be archived while active.
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Card 3: Module Dependencies */}
          <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Module Dependencies</h2>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search available modules..."
                value={depSearch}
                onChange={(e) => setDepSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <div className="grid gap-2.5 md:grid-cols-2 max-h-60 overflow-y-auto pr-1">
              {filteredCatalog.map((item) => {
                const isChecked = dependencyCodes.includes(item.code);
                return (
                  <div
                    key={item.id}
                    onClick={() =>
                      setDependencyCodes((curr) =>
                        curr.includes(item.code)
                          ? curr.filter((c) => c !== item.code)
                          : [...curr, item.code],
                      )
                    }
                    className={`p-3 rounded-sm border transition-all cursor-pointer flex items-center justify-between ${
                      isChecked
                        ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-extrabold text-xs text-[#0D1F3D]">
                        {item.name}
                      </p>
                      <p className="font-mono text-[10px] font-bold text-slate-500">
                        {item.code}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-sm border ${
                        isChecked
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {isChecked ? 'Selected' : 'Add'}
                    </span>
                  </div>
                );
              })}
            </div>

            {dependencyCodes.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Selected Dependencies ({dependencyCodes.length}):</span>
                {dependencyCodes.map((c) => (
                  <span
                    key={c}
                    className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-sm border border-indigo-200 flex items-center gap-1.5"
                  >
                    {c}
                    <button
                      type="button"
                      onClick={() =>
                        setDependencyCodes((curr) => curr.filter((val) => val !== c))
                      }
                      className="text-indigo-400 hover:text-indigo-900 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Form Scoped Action Footer */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(`/platform/modules/${module.id}`)}
              className="font-bold text-slate-700"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              isLoading={saving}
              className="font-extrabold bg-[#0D1F3D] text-white hover:bg-[#162e57] px-6 gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN — 4 Columns Sticky Live Preview */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          <section className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 font-sans">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Live Module Preview</h3>
            </div>

            <div className="rounded-sm border border-slate-200 bg-slate-50/80 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#0D1F3D] text-white shadow-xs">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0D1F3D]">
                    {name.trim() || 'Module Name'}
                  </h4>
                  <span className="font-mono text-xs font-bold text-indigo-600 block">
                    {module.code}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium line-clamp-3">
                {description.trim() || 'No description provided.'}
              </p>

              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">Category</span>
                  <span className="font-extrabold text-slate-800 text-[11px]">{category}</span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">Status</span>
                  <span className="font-extrabold text-emerald-700 text-[11px]">{status}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
