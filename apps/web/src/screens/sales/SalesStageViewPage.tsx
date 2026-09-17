import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  Building2,
  MapPin,
  Globe,
  Phone,
  Search,
  Filter as FilterIcon,
  Upload,
  Download,
  Plus,
  MoreVertical,
  Check,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Calendar,
  Clock,
  Star,
  Monitor,
  Store,
  Zap,
  Flame,
  FileText,
  DollarSign,
  Handshake,
  Percent,
  Award,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  XCircle,
  RotateCcw,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { Checkbox } from '../../components/ui/Checkbox';
import {
  Eye,
  Edit,
  RefreshCw,
  PhoneCall,
  CalendarClock,
  Trash2,
  X,
} from 'lucide-react';
import {
  stageRouteMetadataMap,
  mockPipelineDeals,
  pipelineStagesList,
  PipelineDealCard,
} from './salesPipelineData';

const iconComponentMap: Record<string, any> = {
  Users,
  Building2,
  MapPin,
  Globe,
  Phone,
  Clock,
  CheckCircle2,
  TrendingUp,
  Monitor,
  Store,
  Star,
  Zap,
  Flame,
  FileText,
  DollarSign,
  Calendar,
  Handshake,
  Percent,
  Award,
  CreditCard,
  AlertTriangle,
  Trophy,
  XCircle,
  RotateCcw,
};

interface SalesStageViewPageProps {
  stageKeyOverride?: string;
}

export default function SalesStageViewPage({ stageKeyOverride }: SalesStageViewPageProps) {
  const navigate = useNavigate();
  const params = useParams<{ stageKey?: string }>();
  const activeStageKey = stageKeyOverride || params.stageKey || 'prospects';

  const metadata = stageRouteMetadataMap[activeStageKey] || stageRouteMetadataMap.prospects;

  // Deals State
  const [deals, setDeals] = useState<PipelineDealCard[]>(mockPipelineDeals);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [stageDate, setStageDate] = useState('2025-05-24');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Change Stage Modal State
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [activeDealForStage, setActiveDealForStage] = useState<PipelineDealCard | null>(null);
  const [targetStageId, setTargetStageId] = useState<string>('new');
  const [stageNotes, setStageNotes] = useState<string>('');

  // Map active stage to deals
  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      !searchQuery.trim() ||
      deal.businessName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      deal.phone.includes(searchQuery.trim()) ||
      deal.city.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesSource =
      selectedSource === 'all' || deal.source.toLowerCase() === selectedSource.toLowerCase();

    const matchesPriority =
      selectedPriority === 'all' || deal.priority.toLowerCase() === selectedPriority.toLowerCase();

    return matchesSearch && matchesSource && matchesPriority;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredDeals.map((d) => d.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleToggleRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const openChangeStageModal = (deal: PipelineDealCard) => {
    setActiveDealForStage(deal);
    setTargetStageId(deal.stage);
    setStageNotes('');
    setStageModalOpen(true);
  };

  const handleSaveStageChange = () => {
    if (!activeDealForStage) return;

    const newStageConfig = pipelineStagesList.find((s) => s.id === targetStageId);
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id === activeDealForStage.id) {
          return {
            ...d,
            stage: targetStageId as any,
            stageLabel: newStageConfig?.title || d.stageLabel,
          };
        }
        return d;
      })
    );

    toast.success(`Updated stage for ${activeDealForStage.businessName} to "${newStageConfig?.title || targetStageId}"`);
    setStageModalOpen(false);
  };

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER BAR */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/sales/pipeline')}>
            Sales Pipeline
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-extrabold">{metadata.title}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">{metadata.title}</h1>
            <p className="text-xs font-medium text-slate-600">{metadata.description}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info(`Exporting ${metadata.title} CSV report...`)}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" /> Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info(`Importing template for ${metadata.title}...`)}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="h-3.5 w-3.5 text-blue-600" /> Import
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/admin/leads/create')}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md px-4 py-2"
            >
              <Plus className="h-4 w-4" /> Add Lead
            </Button>
          </div>
        </div>
      </div>

      {/* STAGE METRIC KPI CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {metadata.kpis.map((kpi, idx) => {
          const IconComponent = iconComponentMap[kpi.icon] || Users;
          return (
            <div
              key={idx}
              className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-extrabold text-[#0D1F3D] block">{kpi.label}</span>
                <span className="text-xl font-extrabold text-[#0D1F3D]">{kpi.value}</span>
                <span className="text-xs font-bold text-emerald-700 block mt-0.5">
                  {kpi.subtext}
                </span>
              </div>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-sm border border-slate-100 shrink-0 ${kpi.color}`}
              >
                <IconComponent className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTER TOOLBAR CONTAINER */}
      <div className="rounded-md border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <div className="w-36">
              <Select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                options={[
                  { value: 'all', label: 'All Sources' },
                  { value: 'nearby', label: 'Nearby Scouting' },
                  { value: 'referral', label: 'Partner Referral' },
                  { value: 'import', label: 'CSV Import' },
                  { value: 'website', label: 'Website Form' },
                ]}
                searchable={false}
              />
            </div>

            <div className="w-36">
              <Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                options={[
                  { value: 'all', label: 'All Locations' },
                  { value: 'andheri', label: 'Andheri East' },
                  { value: 'bhiwandi', label: 'Bhiwandi' },
                  { value: 'jogeshwari', label: 'Jogeshwari' },
                  { value: 'vileparle', label: 'Vile Parle' },
                ]}
                searchable={false}
              />
            </div>

            <div className="w-36">
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                options={[
                  { value: 'all', label: 'All Business Types' },
                  { value: 'grocery', label: 'Grocery Store' },
                  { value: 'pharmacy', label: 'Pharmacy' },
                  { value: 'electronics', label: 'Electronics Store' },
                  { value: 'salon', label: 'Beauty Salon' },
                ]}
                searchable={false}
              />
            </div>

            <div className="w-36">
              <Select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'low', label: 'Low Priority' },
                ]}
                searchable={false}
              />
            </div>

            {/* Date Picker Tag */}
            <div className="w-40">
              <DatePicker
                value={stageDate}
                onChange={(d) => {
                  setStageDate(d);
                  toast.success(`Filtered for date ${d}`);
                }}
              />
            </div>
          </div>

          {/* Search & Action Buttons */}
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, contact or business..."
                className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-purple-600 focus:outline-none"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Advanced filter options')}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <FilterIcon className="h-3.5 w-3.5" /> Filters
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Import prospects dialog opened')}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Exported prospects report (CSV)')}
              className="flex items-center gap-1.5 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          </div>
        </div>

        {/* PROSPECTS & DEALS DATA TABLE */}
        <div className="overflow-x-auto border-t border-slate-100 pt-2">
          <table className="w-full text-left text-xs font-semibold text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-extrabold text-[#0D1F3D]">
                <th className="py-3 px-3 w-10 text-center">
                  <Checkbox
                    onChange={(e) => handleSelectAll(e as any)}
                    checked={
                      filteredDeals.length > 0 && selectedRows.length === filteredDeals.length
                    }
                  />
                </th>
                <th className="py-3 px-3">Prospect Name / Business</th>
                <th className="py-3 px-3">Contact Details</th>
                <th className="py-3 px-3">Business Type / Location</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Added On</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Assigned To</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredDeals.map((deal) => {
                const isChecked = selectedRows.includes(deal.id);
                return (
                  <tr
                    key={deal.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isChecked ? 'bg-purple-50/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 text-center">
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleToggleRow(deal.id)}
                      />
                    </td>

                    {/* Prospect Name & Business */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-2xs font-bold text-xs">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <span
                            onClick={() => navigate(`/admin/leads/${deal.id}`)}
                            className="font-extrabold text-[#0D1F3D] hover:text-purple-600 cursor-pointer block truncate max-w-[200px]"
                          >
                            {deal.businessName}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 block truncate">
                            {deal.category}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-slate-800 font-mono text-[11px]">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{deal.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                          <span>✉ {deal.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Business Type / Location */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="font-extrabold text-slate-800 block text-xs">
                          {deal.category}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{deal.city}</span>
                        </div>
                      </div>
                    </td>

                    {/* Source */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 text-purple-700 px-2 py-0.5 text-[10px] font-extrabold border border-purple-200/60">
                        {deal.source}
                      </span>
                    </td>

                    {/* Added On */}
                    <td className="py-3 px-3">
                      <span className="text-slate-600 text-xs block font-semibold">
                        {deal.date}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">11:30 AM</span>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                          deal.priority === 'High'
                            ? 'bg-red-50 text-red-600 border-red-200'
                            : deal.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        }`}
                      >
                        {deal.priority}
                      </span>
                    </td>

                    {/* Assigned To */}
                    <td className="py-3 px-3">
                      {deal.executiveName ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={deal.executiveAvatar}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-extrabold text-[#0D1F3D] block text-xs">
                              {deal.executiveName}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400 block">
                              Sales Executive
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="rounded-md bg-slate-100 text-slate-500 px-2 py-0.5 text-[10px] font-bold">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-[10px] font-extrabold border border-blue-200/60">
                        {metadata.title.split(' ')[0]}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <RowActionsMenu
                        items={[
                          {
                            label: 'View Lead Details',
                            icon: Eye,
                            onClick: () => navigate(`/admin/leads/${deal.id}`),
                          },
                          {
                            label: 'Change Stage / Status',
                            icon: RefreshCw,
                            onClick: () => openChangeStageModal(deal),
                          },
                          {
                            label: 'Schedule Product Demo',
                            icon: Monitor,
                            onClick: () => navigate('/admin/demos/today'),
                          },
                          {
                            label: 'Add Follow-up Action',
                            icon: PhoneCall,
                            onClick: () => navigate('/admin/follow-ups/today'),
                          },
                          {
                            label: 'Edit Lead Profile',
                            icon: Edit,
                            divider: true,
                            onClick: () => navigate(`/admin/leads/${deal.id}/edit`),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BOTTOM PAGINATION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500">
          <span>Showing 1 to {filteredDeals.length} of 156 records</span>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-7 px-2.5 items-center justify-center rounded-md bg-[#0D1F3D] text-white font-bold text-xs"
            >
              1
            </button>
            <button
              type="button"
              className="flex h-7 px-2.5 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
            >
              2
            </button>
            <button
              type="button"
              className="flex h-7 px-2.5 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
            >
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button
              type="button"
              className="flex h-7 px-2.5 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs"
            >
              20
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CHANGE LEAD STAGE MODAL */}
      {stageModalOpen && activeDealForStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-md bg-white p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#0D1F3D]">Change Lead Stage</h3>
                <p className="text-xs font-semibold text-slate-400">{activeDealForStage.businessName}</p>
              </div>
              <button
                type="button"
                onClick={() => setStageModalOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <Select
                  label="Select New Stage *"
                  value={targetStageId}
                  onChange={(e) => setTargetStageId(e.target.value)}
                  options={pipelineStagesList.map((s) => ({
                    value: s.id,
                    label: `${s.title} (${s.subtitle})`,
                  }))}
                  searchable={false}
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-bold block">Stage Change Remarks / Reason</label>
                <textarea
                  rows={3}
                  value={stageNotes}
                  onChange={(e) => setStageNotes(e.target.value)}
                  placeholder="Provide reason for moving lead to new stage..."
                  className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-[#0D1F3D] placeholder-slate-400 focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStageModalOpen(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleSaveStageChange}
                className="bg-[#E20613] hover:bg-red-700 text-white font-bold text-xs"
              >
                Update Stage
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
