import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { DataTable } from '../../../components/ui/DataTable';
import {
  masterCategories,
  initialMasterRecords,
  MasterRecordItem,
  MasterCategoryConfig,
} from './systemMastersData';

const domainGroups = [
  'HR & Personnel',
  'Sales & Pipeline',
  'Demos & Follow-ups',
  'Operations & Field',
  'Business & Merchants',
  'Payroll & Subscriptions',
] as const;

export default function MasterManagementPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('designation');
  const [recordsByCategory, setRecordsByCategory] = useState<Record<string, MasterRecordItem[]>>(initialMasterRecords);

  // Category Sidebar Search State
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [statusTypeFilter, setStatusTypeFilter] = useState<'all' | 'system_default' | 'custom'>('all');

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingRowId, setEditingRowId] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#0D1F3D');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formIsActive, setFormIsActive] = useState(true);

  // Delete Dialog State
  const [deleteTarget, setDeleteTarget] = useState<MasterRecordItem | null>(null);

  const activeCategoryConfig = useMemo<MasterCategoryConfig>(() => {
    return masterCategories.find((c) => c.id === activeCategoryId) || masterCategories[0];
  }, [activeCategoryId]);

  const currentCategoryRecords = useMemo<MasterRecordItem[]>(() => {
    return recordsByCategory[activeCategoryId] || [];
  }, [recordsByCategory, activeCategoryId]);

  // Filtered & Sorted Rows
  const filteredRows = useMemo(() => {
    return currentCategoryRecords
      .filter((row) => {
        const search = searchTerm.trim().toLowerCase();
        const matchesSearch =
          search.length === 0 ||
          row.name.toLowerCase().includes(search) ||
          row.code.toLowerCase().includes(search) ||
          (row.description && row.description.toLowerCase().includes(search));

        const matchesActivity =
          activityFilter === 'all' ||
          (activityFilter === 'active' ? row.isActive : !row.isActive);

        const matchesStatusType =
          statusTypeFilter === 'all' ||
          (statusTypeFilter === 'system_default' ? row.isSystemDefault : !row.isSystemDefault);

        return matchesSearch && matchesActivity && matchesStatusType;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [currentCategoryRecords, searchTerm, activityFilter, statusTypeFilter]);

  // Summary Stats
  const stats = useMemo(() => {
    const total = currentCategoryRecords.length;
    const active = currentCategoryRecords.filter((r) => r.isActive).length;
    const inactive = total - active;
    const systemDefault = currentCategoryRecords.filter((r) => r.isSystemDefault).length;
    return { total, active, inactive, systemDefault };
  }, [currentCategoryRecords]);

  // Icon mapping for 18 categories
  const categoryIconMap: Record<string, React.ElementType> = {
    designation: Users,
    team: Building2,
    contact_role: UserCheck,
    leave_type: Calendar,
    lead_stage: TrendingUp,
    lead_source: Share2Icon,
    lost_reason: AlertTriangle,
    lead_rating: Flame,
    territory: MapPin,
    visit_type: Navigation,
    visit_reason: CalendarX,
    expense_category: Briefcase,
    business_type: Store,
    business_scale: TrendingUp,
    market_hub: ShoppingBag,
    incentive_type: Percent,
    allowance_type: DollarSign,
    deduction_type: CreditCard,
    subscription_plan: Zap,
  };

  // Helper dummy icon fallback
  function Share2Icon(props: any) {
    return <Briefcase {...props} />;
  }

  // Handlers
  const handleOpenAddModal = () => {
    setModalMode('add');
    setEditingRowId(null);
    setFormName('');
    setFormCode(`${activeCategoryConfig.defaultCodePrefix}_${Date.now().toString().slice(-4)}`);
    setFormDescription('');
    setFormColor('#0D1F3D');
    setFormSortOrder(currentCategoryRecords.length + 1);
    setFormIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEditModal = (row: MasterRecordItem) => {
    setModalMode('edit');
    setEditingRowId(row.id);
    setFormName(row.name);
    setFormCode(row.code);
    setFormDescription(row.description || '');
    setFormColor(row.displayColor || '#0D1F3D');
    setFormSortOrder(row.sortOrder);
    setFormIsActive(row.isActive);
    setModalOpen(true);
  };

  const handleSaveRecord = () => {
    if (!formName.trim()) {
      toast.error('Please enter a record name');
      return;
    }

    if (modalMode === 'add') {
      const newRecord: MasterRecordItem = {
        id: `${activeCategoryId}-${Date.now()}`,
        category: activeCategoryId,
        name: formName.trim(),
        code: formCode.trim() || `${activeCategoryConfig.defaultCodePrefix}_${Date.now().toString().slice(-4)}`,
        description: formDescription.trim(),
        displayColor: formColor,
        sortOrder: Number(formSortOrder || 1),
        isActive: formIsActive,
        isSystemDefault: false,
      };

      setRecordsByCategory((prev) => ({
        ...prev,
        [activeCategoryId]: [...(prev[activeCategoryId] || []), newRecord],
      }));

      toast.success(`${activeCategoryConfig.name} record created`);
    } else if (editingRowId) {
      setRecordsByCategory((prev) => ({
        ...prev,
        [activeCategoryId]: (prev[activeCategoryId] || []).map((row) =>
          row.id === editingRowId
            ? {
                ...row,
                name: formName.trim(),
                code: formCode.trim(),
                description: formDescription.trim(),
                displayColor: formColor,
                sortOrder: Number(formSortOrder || 1),
                isActive: formIsActive,
              }
            : row
        ),
      }));

      toast.success(`${activeCategoryConfig.name} record updated`);
    }

    setModalOpen(false);
  };

  const handleToggleActive = (row: MasterRecordItem) => {
    const updatedStatus = !row.isActive;
    setRecordsByCategory((prev) => ({
      ...prev,
      [activeCategoryId]: (prev[activeCategoryId] || []).map((r) =>
        r.id === row.id ? { ...r, isActive: updatedStatus } : r
      ),
    }));

    toast.success(updatedStatus ? 'Master activated' : 'Master deactivated');
  };

  const handleDeleteRequest = (row: MasterRecordItem) => {
    if (row.isSystemDefault) {
      toast.error('System default masters cannot be deleted.');
      return;
    }
    setDeleteTarget(row);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    setRecordsByCategory((prev) => ({
      ...prev,
      [activeCategoryId]: (prev[activeCategoryId] || []).filter((r) => r.id !== deleteTarget.id),
    }));

    toast.success('Master record deleted');
    setDeleteTarget(null);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setActivityFilter('all');
    setStatusTypeFilter('all');
  };

  return (
    <div className="space-y-4 font-sans pb-10">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#0D1F3D]">System Masters</h1>
            <span className="rounded-sm bg-[#0D1F3D]/10 text-[#0D1F3D] px-2.5 py-0.5 text-xs font-bold">
              {masterCategories.length} Categories
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
            onClick={() => toast.success('Audit log downloaded for master records')}
            className="flex items-center gap-1.5 font-bold rounded-sm"
          >
            <FileText className="h-4 w-4 text-slate-600" /> Audit Log
          </Button>

          <Button
            type="button"
            variant="accent"
            size="sm"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 font-bold shadow-xs rounded-sm"
          >
            <Plus className="h-4 w-4" /> {activeCategoryConfig.addLabel}
          </Button>
        </div>
      </div>

      {/* TWO-COLUMN WORKSPACE LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* LEFT COLUMN: CATEGORIES SIDEBAR */}
        <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0 space-y-3">
          <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-xs space-y-2.5">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#0D1F3D]">
                Master Categories
              </h3>
              <span className="text-[11px] font-medium text-slate-500">{masterCategories.length} Configured</span>
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

            <nav className="space-y-3 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
              {domainGroups.map((groupName) => {
                const groupCategories = masterCategories.filter(
                  (c) =>
                    c.group === groupName &&
                    (c.name.toLowerCase().includes(categorySearchQuery.toLowerCase().trim()) ||
                      c.description.toLowerCase().includes(categorySearchQuery.toLowerCase().trim()))
                );
                if (groupCategories.length === 0) return null;

                return (
                  <div key={groupName} className="space-y-1">
                    <p className="px-2 text-[11px] font-medium text-slate-500">
                      {groupName}
                    </p>
                    <div className="space-y-0.5">
                      {groupCategories.map((cat) => {
                        const isActive = cat.id === activeCategoryId;
                        const Icon = categoryIconMap[cat.id] || Tag;
                        const catCount = (recordsByCategory[cat.id] || []).length;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setActiveCategoryId(cat.id);
                              setSearchTerm('');
                              setActivityFilter('all');
                              setStatusTypeFilter('all');
                            }}
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
                            <span className="flex-1 truncate">{cat.name}</span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {catCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Help Card */}
          <div className="rounded-sm border border-slate-200 bg-slate-50/70 p-3.5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-[#0D1F3D]">
              <BookOpen className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-xs font-semibold">Master Data Help</h3>
            </div>
            <p className="text-[11px] font-normal leading-relaxed text-slate-500">
              System masters populate dropdown menus throughout CRM Lead Management, Field Visits, and Payroll.
            </p>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => toast.success('Documentation guide for Master Data Management')}
              className="text-xs font-semibold rounded-sm"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT PANEL */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Card Header & Search Toolbar Container */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-sm bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                    {activeCategoryConfig.group}
                  </span>
                  <h2 className="text-lg font-bold text-[#0D1F3D]">{activeCategoryConfig.name}</h2>
                </div>
                <p className="text-xs font-normal text-slate-500 mt-1">{activeCategoryConfig.description}</p>
              </div>
            </div>

            {/* Toolbar: Search & Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={activeCategoryConfig.searchPlaceholder}
                  className="w-full rounded-sm border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
                />
              </div>

              {/* Inline Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <select
                  value={activityFilter}
                  onChange={(e) => setActivityFilter(e.target.value as any)}
                  className="rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Activity</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>

                <select
                  value={statusTypeFilter}
                  onChange={(e) => setStatusTypeFilter(e.target.value as any)}
                  className="rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Master Types</option>
                  <option value="system_default">System Default</option>
                  <option value="custom">Custom Masters</option>
                </select>

                {(searchTerm || activityFilter !== 'all' || statusTypeFilter !== 'all') && (
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

          {/* Stats Cards Row */}
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
                <p className="text-[11px] font-medium text-slate-500">System Default</p>
                <p className="text-lg font-extrabold text-purple-600">{stats.systemDefault}</p>
              </div>
            </div>
          </div>

          {/* Master Records Data Table */}
          <DataTable
            columns={[
              {
                header: 'Master Name & Code',
                cell: (row) => (
                  <div className="flex items-center gap-2.5">
                    {row.displayColor && (
                      <span
                        className="h-3 w-3 rounded-full shrink-0 border border-slate-200"
                        style={{ backgroundColor: row.displayColor }}
                      />
                    )}
                    <div>
                      <p className="font-bold text-[#0D1F3D]">{row.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{row.code}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Description',
                cell: (row) => (
                  <span className="text-xs font-normal text-slate-600 max-w-[320px] truncate block">
                    {row.description || '—'}
                  </span>
                ),
              },
              {
                header: 'Sort Order',
                align: 'center',
                cell: (row) => (
                  <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 border border-slate-200 font-mono">
                    #{row.sortOrder}
                  </span>
                ),
              },
              {
                header: 'Type',
                cell: (row) =>
                  row.isSystemDefault ? (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 border border-purple-200/80">
                      <Tag className="h-3 w-3" /> System Default
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 border border-slate-200">
                      Custom
                    </span>
                  ),
              },
              {
                header: 'Status',
                cell: (row) => (
                  <button
                    type="button"
                    onClick={() => handleToggleActive(row)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all cursor-pointer border ${
                      row.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
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
                      onClick={() => handleOpenEditModal(row)}
                      className="p-1.5 rounded-sm text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors border border-slate-200 shadow-xs"
                      title="Edit Master Record"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(row)}
                      disabled={row.isSystemDefault}
                      className={`p-1.5 rounded-sm transition-colors border shadow-xs ${
                        row.isSystemDefault
                          ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                          : 'text-rose-600 border-slate-200 hover:bg-rose-50 hover:border-rose-200'
                      }`}
                      title={row.isSystemDefault ? 'System Default Cannot Be Deleted' : 'Delete Record'}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredRows}
            keyExtractor={(row) => row.id}
            density="relaxed"
            emptyMessage="No Master Records Found"
          />

          {/* Master Warning Note */}
          <div className="flex items-center gap-2.5 rounded-sm border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 shadow-xs">
            <Lightbulb className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="font-medium">
              Note: System default masters cannot be deleted but can be deactivated. Custom masters can be added or modified freely.
            </p>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MASTER RECORD MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} maxWidth="max-w-md">
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#0D1F3D]">
                {modalMode === 'add' ? activeCategoryConfig.addTitle : activeCategoryConfig.editTitle}
              </h3>
              <p className="text-xs font-normal text-slate-500 mt-0.5">
                Category: <span className="font-bold text-[#0D1F3D]">{activeCategoryConfig.name}</span>
              </p>
            </div>
            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="font-bold text-slate-800 block mb-1">Master Record Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Senior Field Executive"
                className="w-full rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">System Code Key *</label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. SR_FIELD_EXEC"
                className="w-full rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-mono font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1">Description</label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief summary of how this master is used..."
                className="w-full rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-normal text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
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
                <label className="font-bold text-slate-800 block mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  className="w-full rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 rounded-sm border border-slate-200 bg-slate-50 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="h-4 w-4 rounded-sm border-slate-300 text-[#0D1F3D]"
              />
              <div>
                <p className="font-bold text-[#0D1F3D]">Active Status</p>
                <p className="text-[11px] text-slate-500 font-normal">Active masters appear in application dropdown menus.</p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={handleSaveRecord} className="font-bold shadow-xs px-6">
              {modalMode === 'add' ? 'Create Record' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="max-w-sm">
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-rose-50 text-rose-600 border border-rose-200">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0D1F3D]">Delete Master Record?</h3>
              <p className="text-xs text-slate-500 font-normal mt-1">
                Are you sure you want to delete <span className="font-bold text-rose-700">{deleteTarget?.name}</span>? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold h-9 px-4 rounded-sm text-xs shadow-xs"
            >
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

