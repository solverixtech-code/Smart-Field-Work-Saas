import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Info,
  FileText,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Flag,
  CheckCircle2,
  PauseCircle,
  Settings2,
  BookOpen,
  Lightbulb,
  Edit2,
  Trash2,
  X,
  Tag,
  Layers,
  ShieldAlert,
  Users,
  Building2,
  DollarSign,
  CreditCard,
  Percent,
  MapPin,
  Briefcase,
  PieChart,
  Share2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import {
  masterCategories,
  initialMasterRecords,
  MasterRecordItem,
  MasterCategoryConfig,
} from './systemMastersData';

export default function MasterManagementPage() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('designation');
  const [recordsByCategory, setRecordsByCategory] = useState<Record<string, MasterRecordItem[]>>(initialMasterRecords);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [statusTypeFilter, setStatusTypeFilter] = useState<'all' | 'system_default' | 'custom'>('all');
  const [showFilters, setShowFilters] = useState(false);

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

  // Icon mapping for categories
  const categoryIconMap: Record<string, React.ElementType> = {
    designation: Users,
    team: Building2,
    incentive_type: Percent,
    allowance_type: DollarSign,
    deduction_type: CreditCard,
    territory: MapPin,
    expense_category: Briefcase,
    lead_stage: PieChart,
    lead_source: Share2,
  };

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
    setShowFilters(false);
  };

  return (
    <div className="space-y-3 font-sans pb-12">
      {/* PAGE HEADER */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">System Masters</h1>
            <Info className="h-4 w-4 text-slate-700" />
          </div>
          <p className="mt-1 text-sm text-slate-600 font-normal">
            Manage reusable business parameters, designations, team clusters, incentive structures, and CRM pipeline stages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.success('Audit log downloaded for master records')}
            className="h-10 px-4 font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 shadow-none flex items-center gap-1.5"
          >
            <FileText className="h-4 w-4 text-slate-600" /> Audit Log
          </Button>
          <Button
            type="button"
            variant="accent"
            onClick={handleOpenAddModal}
            className="h-10 px-5 font-semibold shadow-xs flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> {activeCategoryConfig.addLabel}
          </Button>
        </div>
      </header>

      {/* TWO-COLUMN WORKSPACE LAYOUT */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        {/* LEFT COLUMN: MASTER CATEGORY PANEL & HELP CARD */}
        <div className="flex flex-col gap-3">
          {/* MasterCategoryPanel */}
          <div className="shrink-0 rounded-xl border border-slate-200 bg-white py-2 shadow-xs lg:w-[260px] xl:w-[280px]">
            <div className="px-4 py-3 border-b border-slate-100 mb-1">
              <h3 className="text-sm font-bold text-slate-900">Master Categories</h3>
            </div>
            <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 custom-scrollbar">
              {masterCategories.map((cat) => {
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
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-all relative ${
                      isActive
                        ? 'bg-slate-900 text-white font-semibold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800'
                      }`}
                    />
                    <span className="flex-1 truncate">{cat.name}</span>
                    <span
                      className={`ml-auto inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {catCount}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* MasterHelpCard Component */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-xs lg:w-[260px] xl:w-[280px]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs text-slate-800 border border-slate-200">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="mb-1 text-sm font-bold text-slate-900">Need Help?</h3>
            <p className="mb-4 text-xs font-normal leading-relaxed text-slate-600">
              Masters are used across the system. Changes here will reflect in all related modules.
            </p>
            <Button
              variant="outline"
              onClick={() => toast.success('Documentation guide for Master Data Management')}
              className="w-full bg-white text-xs font-semibold text-slate-800 border-slate-300 shadow-xs hover:bg-slate-100"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: MASTER DETAIL CARD & WARNING NOTE */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* MasterDetailCard Component */}
          <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-xs">
            {/* Detail Card Header */}
            <div className="border-b border-slate-100 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{activeCategoryConfig.name}</h2>
                  <p className="mt-1 text-xs font-normal text-slate-600">{activeCategoryConfig.description}</p>
                </div>

                <div className="flex flex-col gap-3 md:items-end">
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="relative min-w-[240px]">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={activeCategoryConfig.searchPlaceholder}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-slate-800 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`h-10 gap-2 rounded-lg border-slate-300 px-4 text-xs font-semibold text-slate-800 ${
                          showFilters ? 'bg-slate-100 border-slate-400' : ''
                        }`}
                      >
                        <Filter className="h-4 w-4" /> Filters
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetFilters}
                        className="h-10 gap-2 rounded-lg border-slate-300 px-4 text-xs font-semibold text-slate-800"
                      >
                        <RotateCcw className="h-4 w-4" /> Reset
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Filter Section */}
              {showFilters && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 pt-3 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Filter by Activity</label>
                    <select
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value as any)}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:border-slate-800 focus:outline-none"
                    >
                      <option value="all">All activity</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Filter by Status Type</label>
                    <select
                      value={statusTypeFilter}
                      onChange={(e) => setStatusTypeFilter(e.target.value as any)}
                      className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-900 focus:border-slate-800 focus:outline-none"
                    >
                      <option value="all">All status types</option>
                      <option value="system_default">System Default</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* MasterStatsCard Component */}
            <div className="p-5">
              <div className="mb-6 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                <div className="flex min-w-0 items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
                    <Flag className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-600">{activeCategoryConfig.totalLabel}</p>
                    <p className="truncate text-xl font-bold text-slate-900 mt-0.5">{stats.total}</p>
                  </div>
                </div>

                <div className="flex min-w-0 items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-600">Active</p>
                    <p className="truncate text-xl font-bold text-slate-900 mt-0.5">{stats.active}</p>
                  </div>
                </div>

                <div className="flex min-w-0 items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <PauseCircle className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-600">Inactive</p>
                    <p className="truncate text-xl font-bold text-slate-900 mt-0.5">{stats.inactive}</p>
                  </div>
                </div>

                <div className="flex min-w-0 items-start gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Settings2 className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-600">System Default</p>
                    <p className="truncate text-xl font-bold text-slate-900 mt-0.5">{stats.systemDefault}</p>
                  </div>
                </div>
              </div>

              {/* MasterDataTable Component */}
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold text-slate-800">
                        <th className="px-4 py-3">Master Name & Code</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3 text-center">Sort Order</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRows.length > 0 ? (
                        filteredRows.map((row) => (
                          <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Name & Code */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                {row.displayColor && (
                                  <span
                                    className="h-3.5 w-3.5 rounded-full shrink-0 border border-slate-200 shadow-xs"
                                    style={{ backgroundColor: row.displayColor }}
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-slate-900">{row.name}</p>
                                  <p className="text-xs font-mono font-semibold text-slate-600 mt-0.5">{row.code}</p>
                                </div>
                              </div>
                            </td>

                            {/* Description */}
                            <td className="px-4 py-3 text-slate-700 font-normal max-w-[280px]">
                              <p className="truncate">{row.description || '—'}</p>
                            </td>

                            {/* Sort Order */}
                            <td className="px-4 py-3 text-center">
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-800 border border-slate-200">
                                #{row.sortOrder}
                              </span>
                            </td>

                            {/* Type (System Default / Custom) */}
                            <td className="px-4 py-3">
                              {row.isSystemDefault ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-900 border border-blue-200">
                                  <Tag className="h-3 w-3 text-blue-800" /> System Default
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800 border border-slate-200">
                                  Custom
                                </span>
                              )}
                            </td>

                            {/* Status Toggle */}
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleToggleActive(row)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer border ${
                                  row.isActive
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                                }`}
                              >
                                {row.isActive ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" /> : <PauseCircle className="h-3.5 w-3.5 text-slate-600" />}
                                {row.isActive ? 'Active' : 'Inactive'}
                              </button>
                            </td>

                            {/* Action Buttons */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(row)}
                                  className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-700 hover:border-slate-800 hover:text-slate-900 transition-colors shadow-xs"
                                  title="Edit Master Record"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRequest(row)}
                                  disabled={row.isSystemDefault}
                                  className={`rounded-lg border p-1.5 transition-colors ${
                                    row.isSystemDefault
                                      ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                                      : 'border-rose-200 bg-white text-rose-600 hover:bg-rose-50 shadow-xs'
                                  }`}
                                  title={row.isSystemDefault ? 'System Default Cannot Be Deleted' : 'Delete Record'}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                            <Layers className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                            <p className="font-bold text-slate-800">No master records found</p>
                            <p className="text-xs text-slate-600 mt-0.5">Try clearing search filters or add a new record.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* MasterWarningNote Component */}
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-900">
            <Lightbulb className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="font-semibold">
              Note: System default masters cannot be deleted but can be deactivated.
            </p>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MASTER RECORD MODAL */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} maxWidth="max-w-md">
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {modalMode === 'add' ? activeCategoryConfig.addTitle : activeCategoryConfig.editTitle}
              </h3>
              <p className="text-xs font-normal text-slate-600 mt-0.5">
                Category: <span className="font-semibold text-slate-900">{activeCategoryConfig.name}</span>
              </p>
            </div>
            <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="font-semibold text-slate-800 block mb-1">Master Record Name *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Senior Field Executive"
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">System Code Key *</label>
              <input
                type="text"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                placeholder="e.g. SR_FIELD_EXEC"
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono font-semibold text-slate-900 focus:border-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800 block mb-1">Description</label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Brief summary of how this master is used across the system..."
                className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-normal text-slate-900 focus:border-slate-800 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-800 block mb-1">Display Color Tag</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="h-9 w-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2 text-xs font-mono font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-800 block mb-1">Sort Order</label>
                <input
                  type="number"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900"
              />
              <div>
                <p className="font-semibold text-slate-900">Active Status</p>
                <p className="text-xs text-slate-600 font-normal">Active masters appear in application dropdowns and forms.</p>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="accent" size="sm" onClick={handleSaveRecord} className="font-semibold shadow-xs px-6">
              {modalMode === 'add' ? 'Create Record' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <Modal isOpen={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="max-w-sm">
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Master Record?</h3>
              <p className="text-xs text-slate-600 font-normal mt-1">
                Are you sure you want to delete <span className="font-semibold text-rose-700">{deleteTarget?.name}</span>? This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold h-9 px-4 rounded-xl text-xs"
            >
              Delete Record
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
