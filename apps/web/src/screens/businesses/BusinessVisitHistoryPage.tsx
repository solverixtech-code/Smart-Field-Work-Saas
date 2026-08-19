import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
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
  MoreVertical,
  UserCheck,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { BusinessItem, mockBusinessVisits, BusinessVisitItem } from './businessesData';

const visitStatusDistribution = [
  { name: 'Completed', value: 28, color: '#10B981' },
  { name: 'In Progress', value: 6, color: '#F59E0B' },
  { name: 'No Show', value: 5, color: '#8B5CF6' },
  { name: 'Cancelled', value: 3, color: '#E20613' },
];

const visitTrend7Days = [
  { date: 'May 18', visits: 5 },
  { date: 'May 19', visits: 7 },
  { date: 'May 20', visits: 10 },
  { date: 'May 21', visits: 6 },
  { date: 'May 22', visits: 9 },
  { date: 'May 23', visits: 6 },
  { date: 'May 24', visits: 12 },
];

const topExecutivesByVisits = [
  { name: 'Amit Verma', visits: 12, pct: '28.6%', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' },
  { name: 'Neha Gupta', visits: 10, pct: '23.8%', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
  { name: 'Vikram Patil', visits: 8, pct: '19.0%', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
  { name: 'Pooja Yadav', visits: 6, pct: '14.3%', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80' },
];

export default function BusinessVisitHistoryPage() {
  const business = useOutletContext<BusinessItem>();
  const [searchTerm, setSearchTerm] = useState('');
  const [visitTypeFilter, setVisitTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredVisits = mockBusinessVisits.filter((v) => {
    const matchesSearch =
      v.visitCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.executiveName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = visitTypeFilter === 'All' || v.visitType === visitTypeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

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
      cell: (v) => <span className="font-mono font-bold text-[#0D1F3D]">{v.visitCode}</span>,
    },
    {
      header: 'Visit Date & Time',
      accessorKey: 'date',
      className: 'text-[11px] text-slate-500',
    },
    {
      header: 'Executive',
      cell: (v) => (
        <div className="flex items-center gap-2">
          <img src={v.executiveAvatar} alt="" className="h-6 w-6 rounded-full object-cover shrink-0" />
          <span className="font-bold text-[#0D1F3D]">{v.executiveName}</span>
        </div>
      ),
    },
    {
      header: 'Visit Type',
      cell: (v) => (
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${
            v.visitType === 'Sales Visit'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : v.visitType === 'Follow-up'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          {v.visitType}
        </span>
      ),
    },
    {
      header: 'Purpose',
      accessorKey: 'purpose',
    },
    {
      header: 'Status',
      align: 'center',
      cell: (v) => (
        <span
          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold border ${
            v.status === 'Completed'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : v.status === 'In Progress'
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}
        >
          {v.status}
        </span>
      ),
    },
    {
      header: 'Duration',
      accessorKey: 'duration',
      align: 'center',
      className: 'font-mono text-[11px]',
    },
    {
      header: 'Notes',
      cell: (v) => <span className="text-[11px] max-w-xs truncate block">{v.notes}</span>,
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (v) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => toast.info(`Viewing visit log ${v.visitCode}`)}
            className="p-1 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-md"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => toast.info(`Options for ${v.visitCode}`)}
            className="p-1 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-md"
          >
            <MoreVertical className="h-4 w-4" />
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
            onClick={() => toast.info('Opening Plan New Visit form...')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white"
          >
            <Plus className="h-4 w-4" /> Plan New Visit
          </Button>
        </div>
      </div>

      {/* Visit Banner Summary */}
      <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-6 text-xs font-semibold text-slate-600">
          <div>
            <span className="text-slate-400 text-[11px] block">Business ID</span>
            <span className="font-mono text-[#0D1F3D] font-bold">{business.id}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Phone</span>
            <span className="text-[#0D1F3D] font-bold">{business.phone}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Total Visits</span>
            <span className="text-[#0D1F3D] font-extrabold text-sm">42</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Last Visit</span>
            <span className="text-[#0D1F3D] font-bold">May 24, 2025</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Sales Manager</span>
            <span className="text-[#0D1F3D] font-bold">{business.assignedToName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Next Planned</span>
            <span className="text-emerald-700 font-bold">May 28, 2025</span>
          </div>
        </div>
      </div>

      {/* 5 Top Metric Cards Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:grid-cols-3">
        <KpiCard
          title="Total Visits"
          value="42"
          subValue="All time"
          icon={Calendar}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Completed"
          value="28"
          subValue="66.7% completed"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="In Progress"
          value="6"
          subValue="14.3% in progress"
          icon={Clock}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Cancelled"
          value="3"
          subValue="7.1% cancelled"
          icon={XCircle}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Avg. Duration"
          value="34m"
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
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, executive, purpose..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
            />
          </div>

          <Select
            value={visitTypeFilter}
            onChange={(e) => setVisitTypeFilter(e.target.value)}
            options={[
              { label: 'All Visit Types', value: 'All' },
              { label: 'Sales Visit', value: 'Sales Visit' },
              { label: 'Follow-up', value: 'Follow-up' },
              { label: 'Collection', value: 'Collection' },
              { label: 'Product Demo', value: 'Product Demo' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'All' },
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
          <DataTable
            columns={columns}
            data={filteredVisits}
            keyExtractor={(v) => v.id}
            selectable
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            pagination={{
              currentPage,
              totalPages: 5,
              totalEntries: 42,
              pageSize: 10,
              onPageChange: (p) => setCurrentPage(p),
            }}
          />
        </div>

        {/* Right Sidebar Visit Analytics (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Top Executive (by Visits)</h3>
            <div className="space-y-2 text-xs font-semibold">
              {topExecutivesByVisits.map((exec) => (
                <div key={exec.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={exec.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                    <span className="text-slate-800 font-bold">{exec.name}</span>
                  </div>
                  <span className="font-extrabold text-[#0D1F3D]">{exec.visits} Visits ({exec.pct})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Visit Trend (Last 7 Days)</h3>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visitTrend7Days}>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D1F3D', color: '#fff', borderRadius: '6px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="visits" stroke="#2563EB" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Visit by Status</h3>
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
                  <span className="font-bold text-[#0D1F3D]">{s.value} ({((s.value / 42) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
