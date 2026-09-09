import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Info,
  FileText,
  Plus,
  Search,
  RotateCcw,
  CheckCircle2,
  PauseCircle,
  Settings2,
  Edit2,
  Trash2,
  Tag,
  ShieldAlert,
  Users,
  Building2,
  Briefcase,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Checkbox } from '../../../components/ui/Checkbox';
import {
  masterService,
  EffectiveMasterDefinition,
  EffectiveMasterValue,
} from '../../../features/platform/masters/services/master.service';

export default function MasterManagementPage() {
  const [definitions, setDefinitions] = useState<EffectiveMasterDefinition[]>([]);
  const [activeDefinitionCode, setActiveDefinitionCode] = useState<string>('');
  const [values, setValues] = useState<EffectiveMasterValue[]>([]);
  const [loadingDefs, setLoadingDefs] = useState(true);
  const [loadingValues, setLoadingValues] = useState(false);

  // Category search
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Values filter
  const [searchTerm, setSearchTerm] = useState('');
  const [provenanceFilter, setProvenanceFilter] = useState<'ALL' | 'SYSTEM' | 'INDUSTRY' | 'TENANT'>('ALL');
  const [activityFilter, setActivityFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingValue, setEditingValue] = useState<EffectiveMasterValue | null>(null);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDefinitions();
  }, []);

  const loadDefinitions = async () => {
    setLoadingDefs(true);
    try {
      const defs = await masterService.getEffectiveDefinitions();
      setDefinitions(defs);
      if (defs.length > 0) {
        const initial = defs[0].code;
        setActiveDefinitionCode(initial);
        loadValues(initial);
      }
    } catch {
      toast.error('Failed to load master definitions from authoritative backend');
    } finally {
      setLoadingDefs(false);
    }
  };

  const loadValues = async (code: string) => {
    if (!code) return;
    setLoadingValues(true);
    try {
      const res = await masterService.getEffectiveValues(code);
      setValues(res);
    } catch {
      toast.error(`Failed to load effective values for ${code}`);
    } finally {
      setLoadingValues(false);
    }
  };

  const activeDefinition = useMemo(() => {
    return definitions.find((d) => d.code === activeDefinitionCode) || null;
  }, [definitions, activeDefinitionCode]);

  const handleSelectDefinition = (code: string) => {
    setActiveDefinitionCode(code);
    loadValues(code);
  };

  const handleOpenAdd = () => {
    if (!activeDefinition?.allowTenantCreate) {
      toast.error('This master definition does not permit tenant-level custom additions');
      return;
    }
    setModalMode('add');
    setEditingValue(null);
    setFormCode('');
    setFormLabel('');
    setFormDisplayOrder(values.length + 1);
    setFormIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: EffectiveMasterValue) => {
    if (item.provenance === 'SYSTEM' && activeDefinition?.systemValuePolicy === 'LOCKED_IDENTITY') {
      toast.error('System identity is locked and cannot be edited');
      return;
    }
    setModalMode('edit');
    setEditingValue(item);
    setFormCode(item.code);
    setFormLabel(item.overrideLabel || item.label);
    setFormDisplayOrder(item.displayOrder);
    setFormIsActive(item.isActive);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDefinitionCode) return;

    if (!formLabel.trim()) {
      toast.error('Label is required');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'add') {
        const generatedCode =
          formCode.trim().toUpperCase() ||
          formLabel.trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_');
        await masterService.createTenantValue(activeDefinitionCode, {
          code: generatedCode,
          label: formLabel.trim(),
          displayOrder: formDisplayOrder,
        });
        toast.success('Master value created successfully');
      } else if (editingValue) {
        if (editingValue.provenance === 'TENANT') {
          await masterService.updateTenantValue(editingValue.id, {
            label: formLabel.trim(),
            displayOrder: formDisplayOrder,
            isActive: formIsActive,
          });
        } else {
          // System or Industry value -> set tenant override
          await masterService.setTenantOverride(editingValue.originId || editingValue.id, {
            overrideLabel: formLabel.trim(),
            displayOrder: formDisplayOrder,
          });
        }
        toast.success('Master value updated successfully');
      }
      setModalOpen(false);
      loadValues(activeDefinitionCode);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save master value');
    } finally {
      setSaving(false);
    }
  };

  const filteredDefinitions = definitions.filter(
    (d) =>
      d.name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(categorySearchQuery.toLowerCase()),
  );

  const filteredValues = values
    .filter((v) => {
      const matchSearch =
        searchTerm === '' ||
        v.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchProvenance =
        provenanceFilter === 'ALL' || v.provenance === provenanceFilter;
      const matchActivity =
        activityFilter === 'all' ||
        (activityFilter === 'active' ? v.isActive : !v.isActive);
      return matchSearch && matchProvenance && matchActivity;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const getProvenanceBadge = (item: EffectiveMasterValue) => {
    switch (item.provenance) {
      case 'SYSTEM':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200">
            <Lock className="h-2.5 w-2.5" /> SYSTEM
          </span>
        );
      case 'INDUSTRY':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
            <Sparkles className="h-2.5 w-2.5" /> INDUSTRY
          </span>
        );
      case 'TENANT':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
            TENANT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-16">
      {/* 1. Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">
            System Masters Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage system definitions, industry presets, and tenant-level master records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => activeDefinitionCode && loadValues(activeDefinitionCode)}
            className="gap-1.5 font-bold text-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleOpenAdd}
            disabled={!activeDefinition?.allowTenantCreate}
            className="gap-1.5 font-bold bg-[#0D1F3D] hover:bg-[#1A365D] text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>

      {/* 2. Authority & Provenance Info Banner */}
      <div className="rounded-sm border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Info className="h-4 w-4 text-indigo-600 shrink-0" />
          <span className="font-medium">
            Precedence is resolved authoritatively on the backend: <strong>TENANT OVERRIDE</strong> → <strong>INDUSTRY TEMPLATE</strong> → <strong>SYSTEM PLATFORM</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            SYSTEM
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            INDUSTRY
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            TENANT
          </span>
        </div>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Category / Definition Selector */}
        <div className="lg:col-span-4 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search master categories..."
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-3 text-xs font-medium bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {loadingDefs ? (
              <div className="py-8 text-center text-xs text-slate-500 font-medium">
                <div className="inline-block animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full mb-2" />
                <p>Loading master definitions...</p>
              </div>
            ) : filteredDefinitions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-medium">
                No master categories found.
              </div>
            ) : (
              filteredDefinitions.map((def) => {
                const isSelected = activeDefinitionCode === def.code;
                return (
                  <button
                    key={def.id}
                    type="button"
                    onClick={() => handleSelectDefinition(def.code)}
                    className={`w-full text-left p-3 rounded-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <span className="font-extrabold text-xs text-[#0D1F3D] block">{def.name}</span>
                      <span className="font-mono text-[10px] text-slate-400 block">{def.code}</span>
                    </div>
                    {def.moduleCode && (
                      <span className="px-1.5 py-0.5 rounded-xs bg-slate-100 text-[10px] font-mono font-bold text-slate-600">
                        {def.moduleCode}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Values Table & Filters */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#0D1F3D]">
                  {activeDefinition?.name || 'Select a Category'}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  {activeDefinition?.description || 'Effective values from backend resolution.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={provenanceFilter}
                  onChange={(e) => setProvenanceFilter(e.target.value as any)}
                  className="h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-sm font-semibold focus:outline-none focus:border-indigo-600"
                >
                  <option value="ALL">All Provenances</option>
                  <option value="SYSTEM">System Only</option>
                  <option value="INDUSTRY">Industry Only</option>
                  <option value="TENANT">Tenant Only</option>
                </select>

                <div className="relative w-44">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search values..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-8 pl-8 pr-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Datatable */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-700 font-extrabold">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Label</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Provenance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {loadingValues ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                        <div className="inline-block animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full mb-2" />
                        <p className="text-xs font-semibold">Loading effective master records...</p>
                      </td>
                    </tr>
                  ) : filteredValues.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                        <Layers className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                        <p className="text-sm font-bold text-[#0D1F3D]">No master records found</p>
                        <p className="text-xs text-slate-400 font-medium">No records match the current filter criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredValues.map((row, idx) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 text-slate-400 font-semibold">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-[#0D1F3D]">
                          {row.label}
                          {row.isOverridden && (
                            <span className="ml-1.5 text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-xs">
                              Overridden
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 font-semibold">
                          {row.code}
                        </td>
                        <td className="py-3 px-4">{getProvenanceBadge(row)}</td>
                        <td className="py-3 px-4">
                          {row.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                              <PauseCircle className="h-3 w-3 text-slate-400" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(row)}
                            disabled={!activeDefinition?.allowTenantEdit}
                            className="h-7 px-2.5 text-[11px] font-bold text-slate-700 hover:text-indigo-600"
                          >
                            <Edit2 className="h-3 w-3 mr-1" /> Edit
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Master Value Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            modalMode === 'add'
              ? `Add Record to ${activeDefinition?.name}`
              : `Edit Master Value — ${formLabel || formCode}`
          }
        >
          <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">
                Record Label <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formLabel}
                onChange={(e) => setFormLabel(e.target.value)}
                placeholder="e.g. Senior Medical Representative"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-indigo-600"
                required
              />
            </div>

            {modalMode === 'add' && (
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">
                  Identifier Code (Optional)
                </label>
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SR_MED_REP (auto-derived if empty)"
                  className="w-full h-9 px-3 text-xs font-mono bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-indigo-600"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 block">Display Order</label>
              <input
                type="number"
                value={formDisplayOrder}
                onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                className="w-full h-9 px-3 text-xs bg-white border border-slate-200 rounded-sm focus:outline-none focus:border-indigo-600"
                min={1}
              />
            </div>

            <div className="pt-1">
              <Checkbox
                checked={formIsActive}
                onChange={setFormIsActive}
                label="Mark this master record as active"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setModalOpen(false)}
                className="font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                type="submit"
                disabled={saving}
                className="font-bold bg-[#0D1F3D] hover:bg-[#1A365D] text-white"
              >
                {saving ? 'Saving...' : modalMode === 'add' ? 'Create Record' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
