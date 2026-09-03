import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Package,
  ArrowLeft,
  Search,
  ShieldAlert,
  GitBranch,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
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

export function CreateModulePage() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<PlatformModule[]>([]);

  // Form Fields
  const [code, setCode] = useState('');
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
    void moduleService
      .getModules({ limit: 100 })
      .then((data) => {
        setCatalog(data);
        setDisplayOrder(data.length + 1);
      })
      .catch(() => toast.error('Unable to load existing module dependencies.'));
  }, []);

  const handleCodeChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setCode(sanitized);
  };

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error('Module Name is required.');
      return;
    }

    if (!code || !/^[a-z][a-z0-9_]*$/.test(code)) {
      toast.error(
        'Module Code is required and must be lowercase snake_case (e.g. core_crm).',
      );
      return;
    }

    if (!description.trim()) {
      toast.error('Module Description is required.');
      return;
    }

    setSaving(true);

    try {
      const createdModule = await moduleService.createModule({
        code,
        name,
        description,
        category,
        status,
        requiredBySystem,
        displayOrder,
        dependencyCodes,
      });

      toast.success(`Module '${createdModule.name}' created successfully.`);
      navigate(`/platform/modules/${createdModule.id}`);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : undefined;
      toast.error(message ?? 'Failed to create module. Please check input parameters.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20 font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Create Module</h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Define a reusable platform capability package and connect its dependencies. Features are registered from implemented product code.
          </p>
        </div>

        <div>
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={() => navigate('/platform/modules')}
            className="gap-2 font-bold text-slate-700 bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Modules
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
                Define the stable identity used by plans, tenants, and runtime configuration.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Module Name *"
                placeholder="e.g. Field Visit Execution"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <div className="space-y-1">
                <Input
                  label="Module Code *"
                  placeholder="e.g. field_visits"
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                />
                <p className="text-[10px] font-medium text-slate-400">
                  Stable lowercase snake_case identifier. Cannot be changed after creation.
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
                placeholder="Describe the platform capability, workflows and product areas included in this module..."
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
              <p className="text-xs font-medium text-slate-500">
                Configure system protection and platform isolation rules.
              </p>
            </div>

            <div className="space-y-3">
              <Checkbox
                label="Required by System (Protected Platform Module)"
                checked={requiredBySystem}
                onChange={(checked) => setRequiredBySystem(checked)}
              />

              <div className="rounded-sm border border-amber-200 bg-amber-50/70 p-3 text-xs font-medium text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  <strong>System Protection Flag:</strong> System-required modules are protected platform capabilities and cannot be archived while this flag is active.
                </span>
              </div>
            </div>
          </section>

          {/* Card 3: Module Dependencies */}
          <section className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Module Dependencies</h2>
              <p className="text-xs font-medium text-slate-500">
                Select prerequisite modules that must be available before this module can operate.
              </p>
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

            {filteredCatalog.length > 0 ? (
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
            ) : (
              <p className="text-xs font-medium text-slate-400 italic">
                No existing modules are available as dependencies.
              </p>
            )}

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
              onClick={() => navigate('/platform/modules')}
              className="font-bold text-slate-700"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              isLoading={saving}
              className="font-extrabold bg-[#0D1F3D] text-white hover:bg-[#162e57] px-6"
            >
              {saving ? 'Creating Module...' : 'Create Module'}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN — 4 Columns (Sticky Live Preview Panel & Guidance) */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          {/* Card 1: Live Module Preview */}
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
                    {code || 'module_code'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium line-clamp-3">
                {description.trim() || 'No module description provided yet.'}
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

                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block">Dependencies</span>
                  <span className="font-extrabold text-indigo-700 text-[11px]">
                    {dependencyCodes.length} Selected
                  </span>
                </div>
              </div>

              {requiredBySystem && (
                <div className="pt-1">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-amber-100 text-amber-900 border border-amber-200 block text-center">
                    Protected System Module
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Card 2: How Modules Work */}
          <section className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3 font-sans">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Layers className="h-4 w-4 text-indigo-600 shrink-0" />
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">How Modules Work</h3>
            </div>

            <div className="space-y-2 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700 text-[10px]">1</span>
                <span>Feature Code</span>
              </div>
              <div className="ml-2.5 border-l-2 border-slate-200 pl-4 py-0.5 text-[11px] text-slate-400 font-mono">
                ↓
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700 text-[10px]">2</span>
                <span className="font-bold text-[#0D1F3D]">Platform Module</span>
              </div>
              <div className="ml-2.5 border-l-2 border-slate-200 pl-4 py-0.5 text-[11px] text-slate-400 font-mono">
                ↓
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700 text-[10px]">3</span>
                <span>Commercial Plan</span>
              </div>
              <div className="ml-2.5 border-l-2 border-slate-200 pl-4 py-0.5 text-[11px] text-slate-400 font-mono">
                ↓
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-50 font-bold text-indigo-700 text-[10px]">4</span>
                <span>Tenant Runtime</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
              Modules package coded platform capabilities. Plans determine which Modules a tenant receives.
            </p>
          </section>

          {/* Card 3: What Happens Next */}
          <section className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3 font-sans">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Info className="h-4 w-4 text-blue-600 shrink-0" />
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">What Happens Next</h3>
            </div>

            <ol className="space-y-2 text-xs font-medium text-slate-600 list-decimal list-inside">
              <li>Create the Module in the catalog</li>
              <li>Registered Features link under the Module</li>
              <li>Include the Module in commercial Plans</li>
              <li>Tenants inherit it via their selected Plan</li>
            </ol>
          </section>
        </div>
      </div>
    </form>
  );
}
