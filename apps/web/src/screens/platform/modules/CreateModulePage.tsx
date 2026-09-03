import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowLeft,
  Save,
  CheckCircle,
  Package,
  Boxes,
  Zap,
  GitBranch,
  Info,
  DollarSign,
  Shield,
  Tag,
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
import { toast } from 'react-hot-toast';

export function CreateModulePage() {
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PlatformModuleCategory>('CORE');
  const [status, setStatus] = useState<PlatformModuleStatus>('ACTIVE');
  const [isAddon, setIsAddon] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState<number>(0);
  const [requiredBySystem, setRequiredBySystem] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(10);
  const [selectedDepCodes, setSelectedDepCodes] = useState<string[]>([]);

  const [availableModules, setAvailableModules] = useState<PlatformModule[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    moduleService.getModules().then(setAvailableModules).catch(() => {});
  }, []);

  const handleCodeChange = (val: string) => {
    // Force lowercase snake_case
    const cleaned = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setCode(cleaned);
  };

  const handleToggleDep = (depCode: string) => {
    setSelectedDepCodes((prev) =>
      prev.includes(depCode) ? prev.filter((c) => c !== depCode) : [...prev, depCode]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter Module Name');
      return;
    }

    if (!code.trim()) {
      toast.error('Please enter Module Code');
      return;
    }

    if (!/^[a-z][a-z0-9_]*$/.test(code)) {
      toast.error('Module code must be lowercase snake_case format (e.g. order_management)');
      return;
    }

    if (!description.trim()) {
      toast.error('Please enter Module Description');
      return;
    }

    setSubmitting(true);
    try {
      const created = await moduleService.createModule({
        code,
        name,
        description,
        category,
        status,
        isAddon,
        monthlyPrice: isAddon ? Number(monthlyPrice) || 0 : 0,
        requiredBySystem,
        displayOrder: Number(displayOrder) || 0,
        dependencyCodes: selectedDepCodes,
      });

      toast.success(`Platform module '${created.name}' created successfully!`);
      navigate(`/platform/modules/${created.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create platform module');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Create Platform Module</h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <Package className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Define a new capability module, commercial model, and dependency graph for the platform catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/platform/modules')}
            className="font-bold text-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Modules
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Form Cards */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Module Identification</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Set display name, canonical snake_case code, and detailed functional description.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Module Display Name *"
                placeholder="e.g. Field Order Booking"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <div>
                <label className="font-bold text-slate-700 text-xs block mb-1">Module Code *</label>
                <div className="flex rounded-sm border border-slate-200 bg-[#F8FAFC] overflow-hidden h-10 focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] transition-all">
                  <span className="bg-slate-100 border-r border-slate-200 px-3 flex items-center text-xs font-mono font-bold text-slate-600">
                    mod_
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. order_management"
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    className="flex-1 px-3 text-xs font-mono font-bold text-[#0D1F3D] bg-transparent focus:outline-none"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  Globally unique immutable snake_case code (e.g. `core_crm`, `field_visits`)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Module Description *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the capabilities, features, and workflows provided by this module..."
                className="w-full text-xs font-medium rounded-sm border border-slate-200 bg-[#F8FAFC] p-3 text-[#0D1F3D] placeholder-slate-400 focus:bg-white focus:border-[#0D1F3D] focus:outline-none focus:ring-1 focus:ring-[#0D1F3D] transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Select
                label="Module Category *"
                value={category}
                onChange={(e) => setCategory(e.target.value as PlatformModuleCategory)}
                options={[
                  { value: 'CORE', label: 'CORE — Base Infrastructure' },
                  { value: 'SALES', label: 'SALES — Sales Engine' },
                  { value: 'FIELD_OPS', label: 'FIELD_OPS — Field Operations' },
                  { value: 'AUTOMATION', label: 'AUTOMATION — Automation & AI' },
                  { value: 'ENTERPRISE', label: 'ENTERPRISE — Enterprise Suite' },
                ]}
              />

              <Select
                label="Initial Status *"
                value={status}
                onChange={(e) => setStatus(e.target.value as PlatformModuleStatus)}
                options={[
                  { value: 'ACTIVE', label: 'ACTIVE' },
                  { value: 'BETA', label: 'BETA' },
                  { value: 'DRAFT', label: 'DRAFT' },
                  { value: 'DEPRECATED', label: 'DEPRECATED' },
                ]}
              />

              <Input
                label="Catalog Display Order"
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Card 2: Commercial & System Rules */}
          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Commercial & System Rules</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configure commercial packaging, add-on pricing, and system-required locks.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Commercial Packaging Type *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setIsAddon(false)}
                    className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                      !isAddon
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-[#0D1F3D]">Standard Base Module</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Included
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      Included in base subscription plans at no extra charge.
                    </p>
                  </div>

                  <div
                    onClick={() => setIsAddon(true)}
                    className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                      isAddon
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-[#0D1F3D]">Paid Add-on Module</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-sm bg-purple-50 text-purple-700 border border-purple-200">
                        Add-on
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-1">
                      Purchasable as a standalone monthly add-on capability.
                    </p>
                  </div>
                </div>
              </div>

              {isAddon && (
                <div className="max-w-xs pt-1">
                  <Input
                    label="Monthly Add-on Price (₹) *"
                    type="number"
                    placeholder="e.g. 799"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(Number(e.target.value))}
                  />
                </div>
              )}

              <div className="pt-2 border-t border-slate-100">
                <Checkbox
                  checked={requiredBySystem}
                  onChange={(checked) => setRequiredBySystem(checked)}
                  label={
                    <span className="text-xs font-bold text-[#0D1F3D]">
                      System Required Module (Mandatory base module; cannot be unselected or archived)
                    </span>
                  }
                />
              </div>
            </div>
          </div>

          {/* Card 3: Module Dependencies Selection */}
          <div className="rounded-sm border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Required Parent Dependencies</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select prerequisite parent modules that must be present in a plan before this module can be enabled.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {availableModules.map((m) => {
                const isChecked = selectedDepCodes.includes(m.code);
                return (
                  <div
                    key={m.code}
                    onClick={() => handleToggleDep(m.code)}
                    className={`p-3.5 rounded-sm border cursor-pointer flex items-start justify-between transition-all ${
                      isChecked
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-2xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#0D1F3D]">{m.name}</span>
                        <span className="font-mono text-[11px] font-bold text-slate-500">({m.code})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-1">{m.description}</p>
                    </div>
                    <Checkbox checked={isChecked} onChange={() => {}} />
                  </div>
                );
              })}

              {availableModules.length === 0 && (
                <p className="text-xs text-slate-500 font-medium col-span-2 text-center p-4">
                  No other modules exist in the catalog yet.
                </p>
              )}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => navigate('/platform/modules')}
              className="font-bold text-slate-700"
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              type="submit"
              disabled={submitting}
              className="gap-2 font-extrabold shadow-xs bg-indigo-600 hover:bg-indigo-700 text-white px-6"
            >
              <CheckCircle className="h-4 w-4" /> {submitting ? 'Saving Module...' : 'Save & Publish Module'}
            </Button>
          </div>
        </div>

        {/* Right Column: Live Module Summary Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs font-sans">
            <h3 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
              Module Preview
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
                    <Package className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Module Name</p>
                    <p className="text-[11px] text-slate-500 font-medium">{name || '—'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-50 text-purple-600 font-bold border border-purple-100">
                    <Tag className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Canonical Code</p>
                    <p className="font-mono text-[11px] text-indigo-600 font-bold">{code ? `mod_${code}` : '—'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 font-bold border border-emerald-100">
                    <Boxes className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Category</p>
                    <p className="text-[11px] text-slate-500 font-medium">{category}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber-50 text-amber-600 font-bold border border-amber-100">
                    <DollarSign className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Commercial Type</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {isAddon ? `Add-on (₹${monthlyPrice}/mo)` : 'Standard Included'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-50 text-blue-600 font-bold border border-blue-100">
                    <GitBranch className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">Dependencies</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {selectedDepCodes.length} parent modules required
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-rose-50 text-rose-600 font-bold border border-rose-100">
                    <Shield className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">System Lock</p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {requiredBySystem ? 'Required by System' : 'Optional Capability'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
