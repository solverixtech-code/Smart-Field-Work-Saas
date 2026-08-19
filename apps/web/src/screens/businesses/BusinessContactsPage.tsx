import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Search,
  Download,
  Eye,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { BusinessItem, mockBusinessContacts, BusinessContactItem } from './businessesData';

const contactStatusDistribution = [
  { name: 'Active', value: 9, color: '#10B981' },
  { name: 'Inactive', value: 2, color: '#F59E0B' },
  { name: 'Blocked', value: 1, color: '#E20613' },
];

const rolesBreakdown = [
  { name: 'Owner', count: 1, pct: '8.3%', color: 'bg-purple-600' },
  { name: 'Manager', count: 1, pct: '8.3%', color: 'bg-blue-600' },
  { name: 'Operations Head', count: 1, pct: '8.3%', color: 'bg-amber-500' },
  { name: 'Sales Head', count: 1, pct: '8.3%', color: 'bg-pink-500' },
  { name: 'Trainer', count: 1, pct: '8.3%', color: 'bg-emerald-500' },
  { name: 'Others', count: 7, pct: '58.3%', color: 'bg-slate-400' },
];

export default function BusinessContactsPage() {
  const business = useOutletContext<BusinessItem>();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredContacts = mockBusinessContacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || c.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredContacts.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const columns: ColumnDef<BusinessContactItem>[] = [
    {
      header: 'Contact Name',
      cell: (c) => (
        <div className="flex items-center gap-2.5">
          <img
            src={c.avatar}
            alt={c.name}
            className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div>
            <p className="font-bold text-[#0D1F3D]">{c.name}</p>
            <p className="text-[10px] text-slate-400 font-mono">ID: {c.id}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      cell: (c) => (
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${c.roleBadgeColor}`}>
          {c.role}
        </span>
      ),
    },
    {
      header: 'Phone / Email',
      cell: (c) => (
        <div>
          <p className="font-semibold text-slate-800">{c.phone}</p>
          <p className="text-[11px] text-slate-500">{c.email}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      align: 'center',
      cell: (c) => (
        <span
          className={`inline-block rounded-md px-2 py-0.5 text-[11px] font-bold border ${
            c.status === 'Active'
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : c.status === 'Inactive'
              ? 'bg-amber-50 text-amber-600 border-amber-200'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}
        >
          {c.status}
        </span>
      ),
    },
    {
      header: 'Added On',
      accessorKey: 'addedOn',
      className: 'text-slate-600 text-[11px]',
    },
    {
      header: 'Added By',
      cell: (c) => (
        <div>
          <p className="font-semibold text-[#0D1F3D]">{c.addedByName}</p>
          <p className="text-[10px] text-slate-500">{c.addedByRole}</p>
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => toast.info(`Viewing details for ${c.name}`)}
            className="p-1 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-md"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => toast.info(`Options for ${c.name}`)}
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
      {/* Sub-Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0D1F3D]">Business Contacts</h2>
          <p className="text-xs text-slate-500">Manage all key personnel and decision makers for this business.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting contacts list...')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.info('Opening Add Contact modal...')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white"
          >
            <Plus className="h-4 w-4" /> Add Contact
          </Button>
        </div>
      </div>

      {/* 4 Top Metric Cards Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          title="Total Contacts"
          value="12"
          subValue="All time"
          icon={Users}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Active Contacts"
          value="9"
          subValue="75% Active"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Inactive Contacts"
          value="2"
          subValue="16.7% Inactive"
          icon={AlertCircle}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Blocked Contacts"
          value="1"
          subValue="8.3% Blocked"
          icon={XCircle}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
      </div>

      {/* Toolbar & Filters */}
      <div className="rounded-md border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 text-xs font-semibold">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contact by name, phone, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { label: 'All Roles', value: 'All' },
              { label: 'Owner', value: 'Owner' },
              { label: 'Manager', value: 'Manager' },
              { label: 'Operations Head', value: 'Operations Head' },
              { label: 'Sales Head', value: 'Sales Head' },
              { label: 'Customer Support', value: 'Customer Support' },
              { label: 'Trainer', value: 'Trainer' },
              { label: 'Accountant', value: 'Accountant' },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { label: 'All Statuses', value: 'All' },
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
              { label: 'Blocked', value: 'Blocked' },
            ]}
          />
        </div>
      </div>

      {/* Main Content Grid: DataTable (9 Cols) + Breakdown Sidebar (3 Cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-9">
          <DataTable
            columns={columns}
            data={filteredContacts}
            keyExtractor={(c) => c.id}
            selectable
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            density="relaxed"
            pagination={{
              currentPage,
              totalPages: 2,
              totalEntries: 12,
              pageSize: 10,
              onPageChange: (p) => setCurrentPage(p),
            }}
          />
        </div>

        {/* Right Sidebar Charts (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Business Contact Summary</h3>
            <div className="flex items-center justify-center">
              <div className="h-32 w-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contactStatusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={48}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {contactStatusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} Contacts`, 'Count']}
                      contentStyle={{ backgroundColor: '#0D1F3D', color: '#fff', borderRadius: '6px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-1 text-xs font-semibold text-slate-600">
              {contactStatusDistribution.map((s) => (
                <div key={s.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-bold text-[#0D1F3D]">{s.value} ({((s.value / 12) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Roles Breakdown</h3>
            <div className="space-y-2 text-xs font-semibold">
              {rolesBreakdown.map((r) => (
                <div key={r.name} className="space-y-1">
                  <div className="flex justify-between text-slate-700 text-[11px]">
                    <span>{r.name}</span>
                    <span className="font-bold text-[#0D1F3D]">{r.count} ({r.pct})</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${r.color} rounded-full`} style={{ width: r.pct }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Quick Actions</h3>
            <button
              onClick={() => toast.info('Opening Add Contact form...')}
              className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2 text-xs font-bold text-[#0D1F3D] hover:bg-slate-100"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <span>Add New Contact</span>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
