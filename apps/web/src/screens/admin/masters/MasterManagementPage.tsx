import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Info,
  FileText,
  Plus,
  Search,
  RotateCcw,
  Flag,
  CheckCircle2,
  PauseCircle,
  Settings2,
  BookOpen,
  Edit2,
  Trash2,
  X,
  Tag,
  ShieldAlert,
  Users,
  Building2,
  DollarSign,
  CreditCard,
  Percent,
  MapPin,
  Briefcase,
  UserCheck,
  Calendar,
  AlertTriangle,
  Flame,
  Navigation,
  CalendarX,
  Store,
  TrendingUp,
  ShoppingBag,
  Zap,
  Lightbulb,
  Lock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import { Checkbox } from '../../../components/ui/Checkbox';
import {
  masterService,
  EffectiveMasterDefinition,
  EffectiveMasterValue,
} from '../../../features/platform/masters/services/master.service';

// Icon mapping for master definitions / modules
const categoryIconMap: Record<string, React.ElementType> = {
  DESIGNATION: Users,
  DEPARTMENT: Building2,
  CONTACT_ROLE: UserCheck,
  LEAVE_TYPE: Calendar,
  LEAD_STAGE: TrendingUp,
  LEAD_STATUS: TrendingUp,
  LEAD_SOURCE: Briefcase,
  LOST_REASON: AlertTriangle,
  LEAD_RATING: Flame,
  TERRITORY: MapPin,
  VISIT_TYPE: Navigation,
  VISIT_REASON: CalendarX,
  EXPENSE_CATEGORY: Briefcase,
  BUSINESS_TYPE: Store,
  BUSINESS_SCALE: TrendingUp,
  MARKET_HUB: ShoppingBag,
  INCENTIVE_TYPE: Percent,
  ALLOWANCE_TYPE: DollarSign,
  DEDUCTION_TYPE: CreditCard,
  SUBSCRIPTION_PLAN: Zap,
};

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
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#0D1F3D');
  const [formDisplayOrder, setFormDisplayOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<EffectiveMasterValue | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadDefinitions();
  }, []);

  const loadDefinitions = async () => {
    setLoadingDefs(true);
    try {
      const defs = await masterService.getEffectiveDefinitions();
      const safeDefs = Array.isArray(defs) ? defs : [];
      setDefinitions(safeDefs);
      if (safeDefs.length > 0) {
        const initial = safeDefs[0].code;
        setActiveDefinitionCode(initial);
        loadValues(initial);
      }
    } catch {
      toast.error('Failed to load master definitions from backend');
    } finally {
      setLoadingDefs(false);
    }
  };

  const loadValues = async (code: string) => {
    if (!code) return;
    setLoadingValues(true);
    try {
      const res = await masterService.getEffectiveValues(code);
      const safeValues = Array.isArray(res) ? res : [];
      setValues(safeValues);
    } catch {
      toast.error(`Failed to load values for ${code}`);
    } finally {
      setLoadingValues(false);
    }
  };

  const activeDefinition = useMemo(() => {
    return definitions.find((d) => d.code === activeDefinitionCode) || null;
  }, [definitions, activeDefinitionCode]);

  const handleSelectDefinition = (code: string) => {
    setActiveDefinitionCode(code);
    setSearchTerm('');
    setProvenanceFilter('ALL');
    setActivityFilter('all');
    loadValues(code);
  };

  const handleOpenAdd = () => {
    if (activeDefinition && !activeDefinition.allowTenantCreate) {
      toast.error('This master category does not permit tenant additions');
      return;
    }
    setModalMode('add');
    setEditingValue(null);
    setFormCode('');
    setFormLabel('');
    setFormDescription('');
    setFormColor('#0D1F3D');
    setFormDisplayOrder((Array.isArray(values) ? values.length : 0) + 1);
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
    setFormDescription((item.metadata?.description as string) || '');
    setFormColor((item.metadata?.color as string) || '#0D1F3D');
    setFormDisplayOrder(item.displayOrder);
    setFormIsActive(item.isActive);
    setModalOpen(true);
  };

  const handleToggleActive = async (item: EffectiveMasterValue) => {
    const updatedStatus = !item.isActive;
    try {
      if (item.provenance === 'TENANT') {
        await masterService.updateTenantValue(item.id, { isActive: updatedStatus });
      } else {
        await masterService.setTenantOverride(item.originId || item.id, { isHidden: !updatedStatus });
      }
      toast.success(updatedStatus ? 'Master record activated' : 'Master record deactivated');
      loadValues(activeDefinitionCode);
    } catch {
      toast.error('Failed to update record status');
    }
  };

  const handleDeleteRequest = (item: EffectiveMasterValue) => {
    if (item.provenance === 'SYSTEM') {
      toast.error('System default records cannot be deleted. Deactivate them instead.');
      return;
    }
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.provenance === 'TENANT') {
        await masterService.updateTenantValue(deleteTarget.id, { isActive: false });
      } else if (deleteTarget.isOverridden) {
        await masterService.removeTenantOverride(deleteTarget.originId || deleteTarget.id);
      } else {
        await masterService.setTenantOverride(deleteTarget.originId || deleteTarget.id, { isHidden: true });
      }
      toast.success('Master record deleted');
      setDeleteTarget(null);
      loadValues(activeDefinitionCode);
    } catch {
      toast.error('Failed to delete master record');
    } finally {
      setDeleting(false);
    }
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
      const metadata = {
        description: formDescription.trim(),
        color: formColor,
      };

      if (modalMode === 'add') {
        const generatedCode =
          formCode.trim().toUpperCase() ||
          formLabel.trim().toUpperCase().replace(/[^A-Z0-9_]+/g, '_');

        await masterService.createTenantValue(activeDefinitionCode, {
          code: generatedCode,
          label: formLabel.trim(),
          displayOrder: formDisplayOrder,
          metadata,
        });
        toast.success('Master value created successfully');
      } else if (editingValue) {
        if (editingValue.provenance === 'TENANT') {
          await masterService.updateTenantValue(editingValue.id, {
            label: formLabel.trim(),
            displayOrder: formDisplayOrder,
            isActive: formIsActive,
            metadata,
          });
        } else {
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

  const handleResetFilters = () => {
    setSearchTerm('');
    setActivityFilter('all');
    setProvenanceFilter('ALL');
  };

  // Group definitions by moduleCode or domain
  const definitionsList = useMemo(() => Array.isArray(definitions) ? definitions : [], [definitions]);
  const valuesList = useMemo(() => Array.isArray(values) ? values : [], [values]);

  const filteredDefinitions = useMemo(() => {
    return definitionsList.filter(
      (d) =>
        d.name.toLowerCase().includes(categorySearchQuery.toLowerCase().trim()) ||
        d.code.toLowerCase().includes(categorySearchQuery.toLowerCase().trim()) ||
        (d.description && d.description.toLowerCase().includes(categorySearchQuery.toLowerCase().trim()))
    );
  }, [definitionsList, categorySearchQuery]);

  const filteredValues = useMemo(() => {
    return valuesList
      .filter((v) => {
        const search = searchTerm.trim().toLowerCase();
        const matchSearch =
          search.length === 0 ||
          v.label.toLowerCase().includes(search) ||
          v.code.toLowerCase().includes(search) ||
          ((v.metadata?.description as string) || '').toLowerCase().includes(search);

        const matchProvenance =
          provenanceFilter === 'ALL' || v.provenance === provenanceFilter;

        const matchActivity =
          activityFilter === 'all' ||
          (activityFilter === 'active' ? v.isActive : !v.isActive);

        return matchSearch && matchProvenance && matchActivity;
      })
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }, [valuesList, searchTerm, provenanceFilter, activityFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const total = valuesList.length;
    const active = valuesList.filter((r) => r.isActive).length;
    const inactive = total - active;
    const systemProtected = valuesList.filter((r) => r.provenance === 'SYSTEM').length;
    return { total, active, inactive, systemProtected };
  }, [valuesList]);

  const getProvenanceBadge = (item: EffectiveMasterValue) => {
    switch (item.provenance) {
      case 'SYSTEM':
        return (
          <span className="inline-flex items-center gap-1 rounded-sm bg-purple-50 px-2 py-0.5 text-[10px] font-extrabold text-purple-700 border border-purple-200">
            <Lock className="h-2.5 w-2.5" /> SYSTEM
          </span>
        );
      case 'INDUSTRY':
        return (
          <span className="inline-flex items-center gap-1 rounded-sm bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
            <Sparkles className="h-2.5 w-2.5" /> INDUSTRY
          </span>
        );
      case 'TENANT':
        return (
          <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 border border-emerald-200">
            TENANT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 font-sans text-slate-800 pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0D1F3D]">System Masters</h1>
            <span className="rounded-sm bg-[#0D1F3D]/10 text-[#0D1F3D] px-2.5 py-0.5 text-xs font-bold">
              {definitionsList.length} Categories
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500 mt-0.5">
            Configure reusable enterprise dropdown parameters, designations, sales pipeline stages, and operational masters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => activeDefinitionCode && loadValues(activeDefinitionCode)}
            className="flex items-center gap-1.5 font-bold rounded-sm text-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Refresh
          </Button>

          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={handleOpenAdd}
            disabled={activeDefinition ? !activeDefinition.allowTenantCreate : false}
            className="flex items-center gap-1.5 font-bold shadow-xs rounded-sm bg-[#0D1F3D] hover:bg-[#1A365D] text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add Record
          </Button>
        </div>
      </div>

      {/* 2. Authority & Precedence Banner */}
      <div className="rounded-sm border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Info className="h-4 w-4 text-indigo-600 shrink-0" />
          <span className="font-medium">
            Resolution Precedence: <strong>TENANT OVERRIDE</strong> → <strong>INDUSTRY TEMPLATE</strong> → <strong>SYSTEM PLATFORM</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-sm border border-purple-200">
            SYSTEM
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200">
            INDUSTRY
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-200">
            TENANT
          </span>
        </div>
      </div>

      {/* 3. Two-Column Workspace Layout */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* LEFT COLUMN: CATEGORIES SIDEBAR */}
        <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0 space-y-3">
          <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-xs space-y-2.5">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0D1F3D]">
                Master Categories
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">{filteredDefinitions.length} Available</span>
            </div>

            {/* Category Searchbar */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-sm border border-slate-200 bg-slate-50/80 pl-8 pr-7 py-1.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
              />
              {categorySearchQuery && (
                <button
                  type="button"
                  onClick={() => setCategorySearchQuery('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Navigation List */}
            <nav className="space-y-1 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              {loadingDefs ? (
                <div className="py-8 text-center text-xs text-slate-500 font-medium">
                  <div className="inline-block animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full mb-2" />
                  <p>Loading master categories...</p>
                </div>
              ) : filteredDefinitions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No matching categories.
                </div>
              ) : (
                filteredDefinitions.map((cat) => {
                  const isActive = cat.code === activeDefinitionCode;
                  const Icon = categoryIconMap[cat.code] || Tag;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectDefinition(cat.code)}
                      className={`flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-left text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0D1F3D] text-white shadow-xs font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D]'
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="block truncate font-bold text-xs">{cat.name}</span>
                        <span className={`block truncate text-[9px] font-mono ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                          {cat.code}
                        </span>
                      </div>
                      {cat.moduleCode && (
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold font-mono ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {cat.moduleCode}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </nav>
          </div>

          {/* Help Card */}
          <div className="rounded-sm border border-slate-200 bg-slate-50/70 p-3.5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-[#0D1F3D]">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-bold">Master Data Governance</h3>
            </div>
            <p className="text-[11px] font-normal leading-relaxed text-slate-500">
              System masters govern dropdown menus throughout CRM Lead Management, Field Operations, and Financial Rules.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT PANEL */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Top Panel Header & Search Toolbar */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  {activeDefinition?.moduleCode && (
                    <span className="rounded-sm bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 border border-slate-200 font-mono">
                      {activeDefinition.moduleCode}
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-[#0D1F3D]">
                    {activeDefinition?.name || 'Select a Category'}
                  </h2>
                </div>
                <p className="text-xs font-normal text-slate-500 mt-1">
                  {activeDefinition?.description || 'Authoritative effective master values from backend resolution.'}
                </p>
              </div>
            </div>

            {/* Toolbar: Search & Inline Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Search ${activeDefinition?.name || 'master values'}...`}
                  className="w-full rounded-sm border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Inline Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={provenanceFilter}
                  onChange={(e) => setProvenanceFilter(e.target.value as any)}
                  className="rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Provenances</option>
                  <option value="SYSTEM">System Only</option>
                  <option value="INDUSTRY">Industry Only</option>
                  <option value="TENANT">Tenant Only</option>
                </select>

                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value as any)}
                  className="rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Activity</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                {(searchTerm || activityFilter !== 'all' || provenanceFilter !== 'ALL') && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    className="flex items-center gap-1 font-bold text-slate-600 rounded-sm"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Stats KPI Cards Row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-xs flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#0D1F3D]/10 text-[#0D1F3D]">
                <Flag className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Total Records</p>
                <p className="text-lg font-extrabold text-[#0D1F3D]">{stats.total}</p>
              </div>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-xs flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Active</p>
                <p className="text-lg font-extrabold text-emerald-600">{stats.active}</p>
              </div>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-xs flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-amber-500/10 text-amber-600">
                <PauseCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">Inactive</p>
                <p className="text-lg font-extrabold text-amber-600">{stats.inactive}</p>
              </div>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-xs flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-purple-500/10 text-purple-600">
                <Settings2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-500">System Protected</p>
                <p className="text-lg font-extrabold text-purple-600">{stats.systemProtected}</p>
              </div>
            </div>
          </div>

          {/* Datatable */}
          <DataTable
            columns={[
              {
                header: 'Master Label & Code',
                cell: (row) => {
                  const colorTag = (row.metadata?.color as string) || '#0D1F3D';
                  return (
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3.5 w-3.5 rounded-full shrink-0 border border-slate-200 shadow-xs"
                        style={{ backgroundColor: colorTag }}
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-[#0D1F3D]">{row.label}</p>
                          {row.isOverridden && (
                            <span className="text-[9px] font-extrabold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-xs border border-amber-200">
                              Overridden
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 font-semibold">{row.code}</p>
                      </div>
                    </div>
                  );
                },
              },
              {
                header: 'Description',
                cell: (row) => (
                  <span className="text-xs font-normal text-slate-600 max-w-[280px] truncate block">
                    {(row.metadata?.description as string) || '—'}
                  </span>
                ),
              },
              {
                header: 'Sort Order',
                align: 'center',
                cell: (row) => (
                  <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 border border-slate-200 font-mono">
                    #{row.displayOrder}
                  </span>
                ),
              },
              {
                header: 'Provenance',
                cell: (row) => getProvenanceBadge(row),
              },
              {
                header: 'Status',
                cell: (row) => (
                  <button
                    type="button"
                    onClick={() => handleToggleActive(row)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer border ${
                      row.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {row.isActive ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    ) : (
                      <PauseCircle className="h-3 w-3 text-slate-400" />
                    )}
                    {row.isActive ? 'Active' : 'Inactive'}
                  </button>
                ),
              },
              {
                header: 'Actions',
                align: 'right',
                cell: (row) => (
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(row)}
                      className="p-1.5 rounded-sm text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors border border-slate-200 shadow-xs"
                      title="Edit Master Record"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(row)}
                      disabled={row.provenance === 'SYSTEM'}
                      className={`p-1.5 rounded-sm transition-colors border shadow-xs ${
                        row.provenance === 'SYSTEM'
                          ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                          : 'text-rose-600 border-slate-200 hover:bg-rose-50 hover:border-rose-200'
                      }`}
                      title={row.provenance === 'SYSTEM' ? 'System Default Cannot Be Deleted' : 'Delete Record'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredValues}
            keyExtractor={(row) => row.id}
            density="relaxed"
            emptyMessage="No Master Records Found"
          />

          {/* Master Warning Note */}
          <div className="flex items-center gap-2.5 rounded-sm border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 shadow-xs">
            <Lightbulb className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="font-medium">
              Note: System default masters cannot be permanently deleted from origin, but tenant overrides or deactivations can be applied cleanly.
            </p>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MASTER RECORD MODAL */}
      {modalOpen && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} maxWidth="max-w-md">
          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0D1F3D]">
                  {modalMode === 'add'
                    ? `Add ${activeDefinition?.name || 'Master Record'}`
                    : `Edit Master Record — ${formLabel || formCode}`}
                </h3>
                <p className="text-xs font-normal text-slate-500 mt-0.5">
                  Category: <span className="font-bold text-[#0D1F3D]">{activeDefinition?.name}</span> ({activeDefinitionCode})
                </p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Master Record Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  placeholder="e.g. Senior Representative"
                  className="w-full rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              {modalMode === 'add' && (
                <div>
                  <label className="font-bold text-slate-800 block mb-1">System Code Key (Optional)</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SR_REP (auto-derived if blank)"
                    className="w-full rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-mono font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-800 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Brief summary of how this master is used..."
                  className="w-full rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-normal text-[#0D1F3D] focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Display Color Tag</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="h-8 w-8 rounded-sm border border-slate-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={formColor}
                      onChange={(e) => setFormColor(e.target.value)}
                      className="w-full rounded-sm border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-xs font-mono font-semibold text-[#0D1F3D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={formDisplayOrder}
                    onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                    className="w-full rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
                    min={1}
                  />
                </div>
              </div>

              <div className="rounded-sm border border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-[#0D1F3D] text-xs">Active Status</p>
                  <p className="text-[11px] text-slate-500 font-medium">Active masters appear in application dropdown menus.</p>
                </div>
                <Checkbox
                  checked={formIsActive}
                  onChange={(checked) => setFormIsActive(checked)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="outline" size="sm" type="button" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" disabled={saving} className="font-bold shadow-xs px-6 bg-[#0D1F3D] hover:bg-[#1A365D] text-white">
                  {saving ? 'Saving...' : modalMode === 'add' ? 'Create Record' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deleteTarget && (
        <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="max-w-sm">
          <div className="space-y-4 font-sans text-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-rose-50 text-rose-600 border border-rose-200">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0D1F3D]">Delete Master Record?</h3>
                <p className="text-xs text-slate-500 font-normal mt-1">
                  Are you sure you want to delete <span className="font-bold text-rose-700">{deleteTarget.label}</span>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 px-4 rounded-sm text-xs shadow-xs"
              >
                {deleting ? 'Deleting...' : 'Delete Record'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
