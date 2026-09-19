import React, { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Calendar,
  Plus,
  Search,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Trash2,
  X,
  Building2,
  UserCheck,
  MapPin,
  FileText,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { DatePicker } from '../../components/ui/DatePicker';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { useCrmQuery } from '../../features/crm/CrmContext';

export interface BusinessVisitItem {
  id: string;
  visitCode: string;
  date: string;
  timeSlot?: string;
  executiveName: string;
  executiveAvatar?: string;
  visitType: string;
  purpose: string;
  status: 'Completed' | 'In Progress' | 'Scheduled' | 'Cancelled' | 'No Show';
  duration: string;
  notes: string;
  priority?: string;
}

export function formatDisplayId(id?: string | null, prefix = 'BIZ'): string {
  if (!id) return `${prefix}-NEW`;
  if (id.startsWith(`${prefix}-`) || (id.length <= 8 && !id.includes('-'))) return id;
  const clean = id.replace(/-/g, '').toUpperCase();
  return `${prefix}-${clean.slice(-6)}`;
}

const STATUS_COLORS: Record<string, string> = {
  Completed: '#10B981',
  'In Progress': '#F59E0B',
  Scheduled: '#2563EB',
  'No Show': '#8B5CF6',
  Cancelled: '#E20613',
  Default: '#64748B',
};

export default function BusinessVisitHistoryPage() {
  const context = useOutletContext<any>();
  const navigate = useNavigate();
  const business = context?.business || context || {};
  const businessId = business?.id;

  const [searchTerm, setSearchTerm] = useState('');
  const [visitTypeFilter, setVisitTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // --- Dynamic Executive Owners Query ---
  const ownersQuery = useCrmQuery('executive-owners-list', (service, signal) =>
    service.owners({}, signal).catch(() => []),
  );

  const executiveOptions = useMemo(() => {
    const defaultManager = business.assignedToName || 'Amit Sharma';
    const list = Array.isArray(ownersQuery.data) ? ownersQuery.data : [];
    const mapped = list.map((owner: any) => ({
      label: `${owner.displayName} (${owner.role || 'Field Executive'})`,
      value: owner.displayName,
      avatar: owner.avatarUrl,
      sublabel: owner.role,
    }));

    if (!mapped.some((m) => m.value === defaultManager)) {
      mapped.unshift({
        label: `${defaultManager} (Assigned Account Manager)`,
        value: defaultManager,
        avatar: undefined,
        sublabel: 'Account Manager',
      });
    }
    return mapped;
  }, [ownersQuery.data, business.assignedToName]);

  // --- Dynamic Local Visits State ---
  const [localVisits, setLocalVisits] = useState<BusinessVisitItem[]>(() => {
    try {
      const saved = localStorage.getItem(`visiblo_biz_visits_${businessId}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const allVisits = localVisits;

  // --- Filtered Visits ---
  const filteredVisits = useMemo(() => {
    return allVisits.filter((v) => {
      const matchesSearch =
        v.visitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.executiveName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.visitType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = visitTypeFilter === 'All' || v.visitType === visitTypeFilter;
      const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [allVisits, searchTerm, visitTypeFilter, statusFilter]);

  // --- Dynamic Summary Metrics ---
  const totalVisits = allVisits.length;
  const completedVisits = allVisits.filter((v) => v.status === 'Completed').length;
  const inProgressVisits = allVisits.filter((v) => v.status === 'In Progress' || v.status === 'Scheduled').length;
  const cancelledVisits = allVisits.filter((v) => v.status === 'Cancelled').length;
  const completionPct = totalVisits > 0 ? `${((completedVisits / totalVisits) * 100).toFixed(1)}%` : '0%';

  const lastVisitDate = useMemo(() => {
    const past = allVisits.filter((v) => v.status === 'Completed');
    return past.length > 0 ? past.at(0)?.date : 'No visits yet';
  }, [allVisits]);

  const nextPlannedDate = useMemo(() => {
    const upcoming = allVisits.filter((v) => v.status === 'In Progress' || v.status === 'Scheduled');
    return upcoming.length > 0 ? upcoming.at(0)?.date : 'None scheduled';
  }, [allVisits]);

  // --- Dynamic Visit Status Distribution ---
  const visitStatusDistribution = useMemo(() => {
    if (allVisits.length === 0) return [];
    const counts: Record<string, number> = {};
    allVisits.forEach((v) => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, val]) => ({
      name,
      value: val,
      color: STATUS_COLORS[name] || STATUS_COLORS.Default,
    }));
  }, [allVisits]);

  // --- Dynamic Top Executives by Visits ---
  const topExecutivesByVisits = useMemo(() => {
    if (allVisits.length === 0) return [];
    const counts: Record<string, { count: number; avatar?: string }> = {};
    allVisits.forEach((v) => {
      if (!counts[v.executiveName]) {
        counts[v.executiveName] = { count: 0, avatar: v.executiveAvatar };
      }
      counts[v.executiveName].count += 1;
    });

    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        visits: data.count,
        pct: `${((data.count / allVisits.length) * 100).toFixed(1)}%`,
        avatar: data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 4);
  }, [allVisits]);

  // --- Dynamic 7-Day / Recent Visits Trend ---
  const visitTrend7Days = useMemo(() => {
    const days: { date: string; visits: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      days.push({ date: label, visits: 0 });
    }

    allVisits.forEach((v) => {
      const vDate = new Date(v.date);
      if (!isNaN(vDate.getTime())) {
        const label = vDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const item = days.find((d) => d.date === label);
        if (item) item.visits += 1;
      }
    });

    return days;
  }, [allVisits]);

  // --- Plan New Visit Modal State ---
  const [isPlanVisitOpen, setIsPlanVisitOpen] = useState(false);
  const [newVisitCode, setNewVisitCode] = useState('');
  const [newVisitType, setNewVisitType] = useState('Sales Visit');
  const [newVisitDate, setNewVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTimeSlot, setNewTimeSlot] = useState('11:00 AM - 12:30 PM');
  const [newExecutive, setNewExecutive] = useState(business.assignedToName || 'Amit Sharma');
  const [newPriority, setNewPriority] = useState('High Priority');
  const [newPurpose, setNewPurpose] = useState('Sales Demo & Pricing Review');
  const [newNotes, setNewNotes] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<BusinessVisitItem | null>(null);

  const handleOpenPlanVisitModal = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setNewVisitCode(`VST-2026-${randomCode}`);
    setIsPlanVisitOpen(true);
  };

  const handleScheduleVisit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPurpose.trim()) {
      toast.error('Please enter visit purpose or agenda.');
      return;
    }

    const created: BusinessVisitItem = {
      id: `vst-${Date.now()}`,
      visitCode: newVisitCode.trim() || `VST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date(newVisitDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      timeSlot: newTimeSlot,
      executiveName: newExecutive,
      executiveAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      visitType: newVisitType,
      purpose: newPurpose.trim(),
      status: 'Scheduled',
      duration: '45m',
      notes: newNotes.trim() || 'Scheduled field meeting with business contact.',
      priority: newPriority,
    };

    const updated = [created, ...localVisits];
    setLocalVisits(updated);
    try {
      localStorage.setItem(`visiblo_biz_visits_${businessId}`, JSON.stringify(updated));
    } catch {}
    setIsPlanVisitOpen(false);
    toast.success(`Field visit ${created.visitCode} scheduled successfully!`);
  };

  const handleToggleComplete = (id: string) => {
    const updated = localVisits.map((v) =>
      v.id === id ? { ...v, status: (v.status === 'Completed' ? 'Scheduled' : 'Completed') as any } : v,
    );
    setLocalVisits(updated);
    try {
      localStorage.setItem(`visiblo_biz_visits_${businessId}`, JSON.stringify(updated));
    } catch {}
    toast.success('Visit status updated.');
  };

  const handleDeleteVisit = (id: string) => {
    const updated = localVisits.filter((v) => v.id !== id);
    setLocalVisits(updated);
    try {
      localStorage.setItem(`visiblo_biz_visits_${businessId}`, JSON.stringify(updated));
    } catch {}
    toast.success('Visit deleted.');
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredVisits.map((v) => v.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const columns: ColumnDef<BusinessVisitItem>[] = [
    {
      header: 'Visit ID',
      cell: (v) => <span className="font-mono font-bold text-[#0D1F3D] text-xs">{v.visitCode}</span>,
    },
    {
      header: 'Date & Time',
      cell: (v) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs block">{v.date}</span>
          {v.timeSlot && <span className="text-[10px] text-slate-400 font-mono">{v.timeSlot}</span>}
        </div>
      ),
    },
    {
      header: 'Field Executive',
      cell: (v) => (
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold shrink-0">
            {v.executiveName ? v.executiveName.slice(0, 2).toUpperCase() : 'EX'}
          </div>
          <span className="font-bold text-[#0D1F3D] text-xs truncate max-w-[130px]">{v.executiveName}</span>
        </div>
      ),
    },
    {
      header: 'Visit Type',
      cell: (v) => (
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-bold border whitespace-nowrap ${
            v.visitType.includes('Sales')
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : v.visitType.includes('Demo')
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : v.visitType.includes('Follow')
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {v.visitType}
        </span>
      ),
    },
    {
      header: 'Purpose / Agenda',
      cell: (v) => (
        <div className="max-w-[220px]">
          <p className="font-semibold text-[#0D1F3D] text-xs truncate">{v.purpose}</p>
          <p className="text-[10px] text-slate-400 truncate">{v.notes}</p>
        </div>
      ),
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      align: 'center',
      className: 'font-mono text-slate-600 text-xs font-semibold',
    },
    {
      header: 'Status',
      align: 'center',
      cell: (v) => (
        <span
          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold border whitespace-nowrap ${
            v.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : v.status === 'Scheduled' || v.status === 'In Progress'
              ? 'bg-blue-50 text-blue-600 border-blue-200'
              : 'bg-rose-50 text-rose-600 border-rose-200'
          }`}
        >
          {v.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (v) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => setSelectedVisit(v)}
            className="p-1 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleToggleComplete(v.id)}
            className={`p-1 rounded-md cursor-pointer transition-colors ${
              v.status === 'Completed'
                ? 'text-emerald-600 hover:bg-emerald-50'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-100'
            }`}
            title={v.status === 'Completed' ? 'Mark Incomplete' : 'Mark Completed'}
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDeleteVisit(v.id)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer transition-colors"
            title="Delete Visit"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Sub Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0D1F3D] flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" /> Business Visit History
          </h2>
          <p className="text-xs text-slate-500">View and manage all field visits made to this business.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting visit logs...')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleOpenPlanVisitModal}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md"
          >
            <Plus className="h-4 w-4" /> Plan New Visit
          </Button>
        </div>
      </div>

      {/* Visit Banner Summary (No raw UUIDs) */}
      <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6 text-xs font-semibold text-slate-600">
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Business ID</span>
            <span className="font-mono text-[#0D1F3D] font-bold">
              {formatDisplayId(business.id, 'BIZ')}
            </span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Phone</span>
            <span className="text-[#0D1F3D] font-bold">{business.phone || 'Not set'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Total Visits</span>
            <span className="text-[#0D1F3D] font-extrabold text-sm">{totalVisits}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Last Visit</span>
            <span className="text-[#0D1F3D] font-bold">{lastVisitDate}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Sales Manager</span>
            <span className="text-[#0D1F3D] font-bold">{business.assignedToName || 'Unassigned'}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block font-medium">Next Planned</span>
            <span className="text-emerald-700 font-bold">{nextPlannedDate}</span>
          </div>
        </div>
      </div>

      {/* 5 Top Metric Cards Row (Dynamic KPIs) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:grid-cols-3">
        <KpiCard
          title="Total Visits"
          value={String(totalVisits)}
          subValue="All time"
          icon={Calendar}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Completed"
          value={String(completedVisits)}
          subValue={`${completionPct} completed`}
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Scheduled / In Progress"
          value={String(inProgressVisits)}
          subValue="Upcoming"
          icon={Clock}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Cancelled"
          value={String(cancelledVisits)}
          subValue="Exceptions"
          icon={XCircle}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Avg. Duration"
          value={totalVisits > 0 ? '45m' : '0m'}
          subValue="Per Visit"
          icon={UserCheck}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Filter Bar */}
      <div className="rounded-md border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 text-xs font-semibold">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search code, executive, purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/60 pl-9 pr-8 py-2 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 p-1"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Select
            value={visitTypeFilter}
            onChange={(e) => setVisitTypeFilter(e.target.value)}
            options={[
              { label: 'All Visit Types', value: 'All' },
              { label: 'Sales Visit', value: 'Sales Visit' },
              { label: 'Product Demo', value: 'Product Demo' },
              { label: 'Follow-up', value: 'Follow-up' },
              { label: 'Collection', value: 'Collection' },
              { label: 'Onboarding & Training', value: 'Onboarding' },
              { label: 'Store Audit', value: 'Store Audit' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Scheduled', value: 'Scheduled' },
              { label: 'Completed', value: 'Completed' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Cancelled', value: 'Cancelled' },
              { label: 'No Show', value: 'No Show' },
            ]}
          />
        </div>
      </div>

      {/* Main Content Grid: DataTable (9 Cols) + Visit Analytics Sidebar (3 Cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-9">
          {filteredVisits.length > 0 ? (
            <DataTable
              columns={columns}
              data={filteredVisits}
              keyExtractor={(v) => v.id}
              selectable
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              density="relaxed"
              pagination={{
                currentPage,
                totalPages: Math.ceil(filteredVisits.length / 10) || 1,
                totalEntries: filteredVisits.length,
                pageSize: 10,
                onPageChange: (p) => setCurrentPage(p),
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-md border border-slate-200 bg-white p-12 text-center shadow-xs">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-[#0D1F3D] mb-1">No field visits recorded yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                No field visits or client meetings have been scheduled for {business.name || 'this business'}. Plan a new on-site visit now.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenPlanVisitModal}
                className="text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Plan New Visit
              </Button>
            </div>
          )}
        </div>

        {/* Right Sidebar Visit Analytics (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Top Executive (by Visits)</h3>
            {topExecutivesByVisits.length > 0 ? (
              <div className="space-y-2 text-xs font-semibold">
                {topExecutivesByVisits.map((exec) => (
                  <div key={exec.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                        {exec.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-slate-800 font-bold truncate max-w-[90px]">{exec.name}</span>
                    </div>
                    <span className="font-extrabold text-[#0D1F3D] text-[11px]">{exec.visits} ({exec.pct})</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No executive visits logged yet.</p>
            )}
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Visit Trend (Last 7 Days)</h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitTrend7Days}>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D1F3D', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="visits" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Visit by Status</h3>
            {visitStatusDistribution.length > 0 ? (
              <>
                <div className="flex items-center justify-center">
                  <div className="h-32 w-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={visitStatusDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={32}
                          outerRadius={48}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {visitStatusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0D1F3D', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-semibold text-slate-600">
                  {visitStatusDistribution.map((s) => (
                    <div key={s.name} className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.name}
                      </span>
                      <span className="font-bold text-[#0D1F3D]">
                        {s.value} ({totalVisits > 0 ? ((s.value / totalVisits) * 100).toFixed(1) : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-4">No visits recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Plan New Field Visit */}
      <Modal
        isOpen={isPlanVisitOpen}
        onClose={() => setIsPlanVisitOpen(false)}
        title="Plan New Field Visit"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleScheduleVisit} className="space-y-4 py-1 text-xs">
          {/* Selected Business Context Card */}
          <div className="rounded-md border border-blue-100 bg-gradient-to-r from-blue-50/70 to-slate-50 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0D1F3D] text-white shrink-0 shadow-xs">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0D1F3D]">{business.name || 'Account'}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {business.businessType || 'Merchant Account'} •{' '}
                    <span className="font-mono text-slate-600 font-semibold">
                      {formatDisplayId(business.id, 'BIZ')}
                    </span>
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-100/80 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                {business.status || 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-blue-100 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Location</span>
                <span className="font-bold text-[#0D1F3D] truncate block">
                  {business.city || 'Location not set'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Contact Person</span>
                <span className="font-semibold text-slate-800">
                  {business.contactPerson || business.primaryContact?.name || 'Primary Contact'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Assigned Executive</span>
                <span className="font-bold text-[#0D1F3D] truncate block">
                  {business.assignedToName || 'Unassigned'}
                </span>
              </div>
            </div>
          </div>

          {/* Visit Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Visit Code *</label>
              <input
                type="text"
                value={newVisitCode}
                onChange={(e) => setNewVisitCode(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-mono font-bold text-[#0D1F3D] focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
                required
              />
            </div>

            <div>
              <Select
                label="Visit Type / Purpose *"
                value={newVisitType}
                onChange={(e) => setNewVisitType(e.target.value)}
                options={[
                  { label: 'Sales Pitch & Demo', value: 'Sales Visit' },
                  { label: 'Product Demo & Presentation', value: 'Product Demo' },
                  { label: 'Follow-up & Quotation Review', value: 'Follow-up' },
                  { label: 'Payment & Invoice Collection', value: 'Collection' },
                  { label: 'Onboarding & Training', value: 'Onboarding' },
                  { label: 'Store Audit & Inspection', value: 'Store Audit' },
                ]}
              />
            </div>

            <div>
              <DatePicker
                label="Visit Date *"
                value={newVisitDate}
                onChange={(dateStr) => setNewVisitDate(dateStr)}
              />
            </div>
          </div>

          {/* Time & Executive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Time Slot / Duration *</label>
              <input
                type="text"
                value={newTimeSlot}
                onChange={(e) => setNewTimeSlot(e.target.value)}
                placeholder="e.g. 11:00 AM - 12:30 PM"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
                required
              />
            </div>

            <div>
              <Select
                label="Assigned Field Executive *"
                searchable={true}
                value={newExecutive}
                onChange={(e) => setNewExecutive(e.target.value)}
                options={executiveOptions}
              />
            </div>

            <div>
              <Select
                label="Visit Priority *"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                options={[
                  { label: 'High Priority (Immediate)', value: 'High Priority' },
                  { label: 'Medium (Standard)', value: 'Medium' },
                  { label: 'Routine / Follow-up', value: 'Routine' },
                ]}
              />
            </div>
          </div>

          {/* Agenda & Instructions */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Meeting Objective / Agenda *</label>
            <input
              type="text"
              value={newPurpose}
              onChange={(e) => setNewPurpose(e.target.value)}
              placeholder="e.g. Present enterprise field work module & collect requirements"
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Field Rep Instructions (Optional)</label>
            <textarea
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Any specific instructions, parking notes, or contact person guidance..."
              className="w-full rounded-md border border-slate-200 p-2 text-xs font-medium text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">
              Visit will be added to executive daily itinerary
            </span>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPlanVisitOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-[#E20613] hover:bg-red-700 text-white font-bold">
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Schedule Visit
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: View Visit Details */}
      {selectedVisit && (
        <Modal
          isOpen={Boolean(selectedVisit)}
          onClose={() => setSelectedVisit(null)}
          title={`Field Visit — ${selectedVisit.visitCode}`}
        >
          <div className="space-y-4 py-2 text-xs">
            <div className="rounded-md bg-slate-50 p-3.5 border border-slate-200/80 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Business:</span>
                <span className="font-bold text-[#0D1F3D] text-sm">{business.name || 'Account'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Business Code:</span>
                <span className="font-mono font-bold text-slate-700">{formatDisplayId(business.id, 'BIZ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Visit Date:</span>
                <span className="font-bold text-[#0D1F3D]">{selectedVisit.date} {selectedVisit.timeSlot ? `(${selectedVisit.timeSlot})` : ''}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Executive:</span>
                <span className="font-bold text-[#0D1F3D]">{selectedVisit.executiveName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Visit Type:</span>
                <span className="font-semibold text-blue-700">{selectedVisit.visitType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md text-[11px] border ${
                    selectedVisit.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {selectedVisit.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Purpose:</span>
                <p className="font-bold text-[#0D1F3D]">{selectedVisit.purpose}</p>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-medium">Notes:</span>
                <p className="font-medium text-slate-700">{selectedVisit.notes || 'No extra notes recorded.'}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                type="button"
                variant={selectedVisit.status === 'Completed' ? 'outline' : 'primary'}
                size="sm"
                onClick={() => {
                  handleToggleComplete(selectedVisit.id);
                  setSelectedVisit(null);
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {selectedVisit.status === 'Completed' ? 'Mark Incomplete' : 'Mark Completed'}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedVisit(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
