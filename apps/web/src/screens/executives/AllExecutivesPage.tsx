import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  MapPin,
  Calendar,
  UserX,
  UserPlus,
  Search,
  Download,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Upload,
  UserPlus2,
  FileSpreadsheet,
  Edit,
  ShieldAlert,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Avatar } from '../../components/ui/Avatar';
import { api, extractErrorMessage } from '../../common/api';
import { useDebouncedSearch } from '../../features/crm/CrmContext';

type ExecutiveStatus = 'Active' | 'On Field' | 'On Leave' | 'Inactive';

interface ExecutiveDirectoryItem {
  membershipId: string;
  employeeCode: string;
  name: string;
  email: string;
  mobile: string | null;
  avatarUrl: string | null;
  team: string;
  region: string;
  status: ExecutiveStatus;
  visitsToday: number;
  leadsToday: number;
  joinedAt: string;
}

interface ExecutiveDirectoryResponse {
  items: ExecutiveDirectoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  summary: {
    total: number;
    active: number;
    onField: number;
    onLeave: number;
    inactive: number;
    newThisMonth: number;
  };
  regions: string[];
  topPerformers: Array<{
    membershipId: string;
    name: string;
    avatarUrl: string | null;
    leads: number;
  }>;
}

const emptyDirectory: ExecutiveDirectoryResponse = {
  items: [], total: 0, page: 1, limit: 10, totalPages: 0,
  summary: { total: 0, active: 0, onField: 0, onLeave: 0, inactive: 0, newThisMonth: 0 },
  regions: [], topPerformers: [],
};

const percent = (value: number, total: number) => total ? `${((value / total) * 100).toFixed(2)}%` : '0%';
const plural = (value: number, singular: string) => `${value} ${singular}${value === 1 ? '' : 's'}`;
const formatDate = (value: string) => new Intl.DateTimeFormat('en-IN', {
  day: '2-digit', month: 'short', year: 'numeric',
}).format(new Date(value));

export default function AllExecutivesPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedSearch(searchTerm.trim());
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [directory, setDirectory] = useState(emptyDirectory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api.get<ExecutiveDirectoryResponse>('/tenant/crm/executives', {
      signal: controller.signal,
      params: {
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        region: regionFilter === 'All' ? undefined : regionFilter,
        status: statusFilter === 'All' ? undefined : statusFilter,
      },
    }).then(({ data }) => {
      setDirectory(data);
      setSelectedIds([]);
    }).catch((requestError: unknown) => {
      if (!controller.signal.aborted) setError(extractErrorMessage(requestError, 'Unable to load field executives.'));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [debouncedSearch, page, regionFilter, statusFilter]);

  const teamOverviewData = [
    { name: 'Active', value: directory.summary.active, color: '#10B981' },
    { name: 'On Field', value: directory.summary.onField, color: '#3B82F6' },
    { name: 'On Leave', value: directory.summary.onLeave, color: '#F59E0B' },
    { name: 'Inactive', value: directory.summary.inactive, color: '#EF4444' },
  ];
  const filteredExecutives = directory.items;

  const exportExecutives = async () => {
    try {
      const params = {
        limit: 500,
        search: debouncedSearch || undefined,
        region: regionFilter === 'All' ? undefined : regionFilter,
        status: statusFilter === 'All' ? undefined : statusFilter,
      };
      const firstPage = await api.get<ExecutiveDirectoryResponse>('/tenant/crm/executives', { params: { ...params, page: 1 } });
      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(0, firstPage.data.totalPages - 1) }, (_, index) =>
          api.get<ExecutiveDirectoryResponse>('/tenant/crm/executives', { params: { ...params, page: index + 2 } })),
      );
      const exportItems = [firstPage.data, ...remainingPages.map(({ data }) => data)].flatMap(({ items }) => items);
      if (!exportItems.length) {
        toast.info('No executive records to export.');
        return;
      }
      const escape = (value: string | number | null) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      const rows = [
        ['Executive', 'ID', 'Email', 'Team', 'Region', 'Mobile', 'Status', "Today's visits", "Today's leads", 'Join date'],
        ...exportItems.map((item) => [item.name, item.employeeCode, item.email, item.team, item.region, item.mobile, item.status, item.visitsToday, item.leadsToday, formatDate(item.joinedAt)]),
      ];
      const blob = new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `field-executives-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Executive data exported.');
    } catch (requestError) {
      toast.error(extractErrorMessage(requestError, 'Unable to export executive data.'));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredExecutives.map((x) => x.membershipId));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };
  const firstResult = directory.total === 0 ? 0 : (directory.page - 1) * directory.limit + 1;
  const lastResult = Math.min(directory.page * directory.limit, directory.total);
  const pageNumbers = Array.from({ length: directory.totalPages }, (_, index) => index + 1)
    .filter((number) => Math.abs(number - directory.page) <= 1);

  return (
    <div className="space-y-3 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Field Executives Directory</h1>
          <p className="text-xs font-normal text-slate-500">
            Manage field staff, view live statuses, performance stats, and territory teams.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportExecutives}
            className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
          >
            <Download className="h-4 w-4 text-[#0D1F3D]" /> Export Data
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/executives/new')}
            className="flex items-center gap-2 font-bold shadow-sm"
          >
            <UserPlus className="h-4 w-4" /> Add Executive
          </Button>
        </div>
      </div>

      {/* Top 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6 sm:grid-cols-3">
        <KpiCard
          title="Total Executives"
          value={String(directory.summary.total)}
          subValue="Active Roster"
          timeframe=""
          icon={Users}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Active Executives"
          value={String(directory.summary.active)}
          subValue={`${percent(directory.summary.active, directory.summary.total)} Active`}
          timeframe=""
          icon={UserCheck}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="On Field"
          value={String(directory.summary.onField)}
          subValue={`${percent(directory.summary.onField, directory.summary.total)} On Field`}
          timeframe=""
          icon={MapPin}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="On Leave"
          value={String(directory.summary.onLeave)}
          subValue={`${percent(directory.summary.onLeave, directory.summary.total)} On Leave`}
          timeframe=""
          icon={Calendar}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Inactive"
          value={String(directory.summary.inactive)}
          subValue={`${percent(directory.summary.inactive, directory.summary.total)} Inactive`}
          timeframe=""
          icon={UserX}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="New This Month"
          value={String(directory.summary.newThisMonth)}
          subValue={`${percent(directory.summary.newThisMonth, directory.summary.total)} New Joins`}
          timeframe=""
          icon={UserPlus}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Full-Width Main Data Table Section */}
      <div className="space-y-3">
        {/* Filters & Search Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search executives by name, email, phone..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full rounded-sm border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Region Dropdown */}
          <div className="min-w-[150px]">
            <Select
              value={regionFilter}
              onChange={(e) => { setRegionFilter(e.target.value); setPage(1); }}
              options={[
                { label: 'All Regions', value: 'All' },
                ...directory.regions.map((region) => ({ label: region, value: region })),
              ]}
            />
          </div>

          {/* Status Dropdown */}
          <div className="min-w-[150px]">
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              options={[
                { label: 'All Statuses', value: 'All' },
                { label: 'Active', value: 'Active' },
                { label: 'On Field', value: 'On Field' },
                { label: 'On Leave', value: 'On Leave' },
                { label: 'Inactive', value: 'Inactive' },
              ]}
            />
          </div>
        </div>

        {/* Table Card Container */}
        <div className="overflow-hidden rounded-sm border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-600">
                    <th className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === filteredExecutives.length && filteredExecutives.length > 0}
                        className="rounded-sm border-slate-300 text-[#E20613] focus:ring-[#E20613]"
                      />
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Executive</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">ID</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Team & Region</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Mobile</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Today's Activity</th>
                    <th className="px-4 py-3.5 whitespace-nowrap">Join Date</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredExecutives.map((exec) => {
                    const isSelected = selectedIds.includes(exec.membershipId);
                    return (
                      <tr key={exec.membershipId} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(exec.membershipId)}
                            className="rounded-sm border-slate-300 text-[#E20613] focus:ring-[#E20613]"
                          />
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={exec.name} src={exec.avatarUrl} />
                            <div>
                              <NavLink
                                to={`/admin/executives/${exec.membershipId}`}
                                className="font-extrabold text-[#0D1F3D] hover:text-[#E20613] hover:underline whitespace-nowrap"
                              >
                                {exec.name}
                              </NavLink>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-500 whitespace-nowrap">{exec.employeeCode}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div>
                            <p className="font-bold text-[#0D1F3D] whitespace-nowrap">{exec.team}</p>
                            <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{exec.region}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-600 whitespace-nowrap">{exec.mobile ?? 'Not recorded'}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-sm px-2.5 py-0.5 text-[10px] font-extrabold whitespace-nowrap ${
                              exec.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                                : exec.status === 'On Field'
                                  ? 'bg-blue-50 text-blue-600 border border-blue-200/60'
                                  : exec.status === 'On Leave'
                                    ? 'bg-amber-50 text-amber-600 border border-amber-200/60'
                                    : 'bg-red-50 text-[#E20613] border border-red-200/60'
                            }`}
                          >
                            {exec.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div>
                            <p className="font-extrabold text-[#0D1F3D] whitespace-nowrap">{plural(exec.visitsToday, 'Visit')}</p>
                            <p className="text-[10px] font-semibold text-[#E20613] whitespace-nowrap">{plural(exec.leadsToday, 'Lead')}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 font-medium whitespace-nowrap">{formatDate(exec.joinedAt)}</td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5 relative">
                            <NavLink
                              to={`/admin/executives/${exec.membershipId}`}
                              title="View Executive Profile"
                              className="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#0D1F3D] transition duration-150"
                            >
                              <Eye className="h-4 w-4" />
                            </NavLink>

                            <button
                              type="button"
                              onClick={() => setActiveMenuId(activeMenuId === exec.membershipId ? null : exec.membershipId)}
                              aria-label={`Actions for ${exec.name}`}
                              className="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {/* Dropdown Quick Actions */}
                            {activeMenuId === exec.membershipId && (
                              <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-sm border border-slate-200 bg-white p-1.5 shadow-xl space-y-0.5 text-left animate-dropdown">
                                <NavLink
                                  to={`/admin/executives/${exec.membershipId}`}
                                  className="flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                  <Eye className="h-3.5 w-3.5 text-blue-600" /> View Profile
                                </NavLink>
                                <NavLink
                                  to={`/admin/executives/${exec.membershipId}/edit`}
                                  className="flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                                >
                                  <Edit className="h-3.5 w-3.5 text-emerald-600" /> Edit Profile
                                </NavLink>
                                <NavLink
                                  to={`/admin/executives/${exec.membershipId}/suspend`}
                                  className="flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-xs font-semibold text-[#E20613] hover:bg-red-50"
                                >
                                  <ShieldAlert className="h-3.5 w-3.5" /> Access Control
                                </NavLink>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && !error && filteredExecutives.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-16 text-center text-sm font-medium text-slate-500">No field executives match these filters.</td></tr>
                  )}
                  {loading && (
                    <tr><td colSpan={9} className="px-4 py-16 text-center text-sm font-medium text-slate-500">Loading field executives...</td></tr>
                  )}
                  {!loading && error && (
                    <tr><td colSpan={9} className="px-4 py-16 text-center text-sm font-medium text-[#E20613]">{error}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs font-medium text-slate-500 bg-slate-50/40">
            <span>Showing {firstResult} to {lastResult} of {directory.total} results</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={directory.page <= 1 || loading}
                aria-label="Previous page"
                className="rounded-sm border border-slate-200 p-1 hover:bg-slate-100 text-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {pageNumbers.map((number) => (
                <button
                  type="button"
                  key={number}
                  onClick={() => setPage(number)}
                  aria-label={`Page ${number}`}
                  aria-current={number === directory.page ? 'page' : undefined}
                  className={number === directory.page ? 'rounded-sm bg-[#0D1F3D] px-3 py-1 font-bold text-white' : 'px-1 text-slate-400'}
                >{number}</button>
              ))}
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(directory.totalPages, current + 1))}
                disabled={directory.page >= directory.totalPages || loading}
                aria-label="Next page"
                className="rounded-sm border border-slate-200 p-1 hover:bg-slate-100 text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Team Overview Donut, Top Performers, Quick Actions (3 Column Grid below table) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Team Overview Donut Chart */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Team Overview</h3>
            <span className="text-[11px] font-bold text-[#E20613]">{directory.summary.total} Total</span>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={teamOverviewData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {teamOverviewData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-xl font-extrabold text-[#0D1F3D]">{directory.summary.total}</span>
              <span className="text-[10px] font-bold text-slate-400">Total Team</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1 border-t border-slate-100">
            {teamOverviewData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600">{item.name}:</span>
                <span className="font-bold text-[#0D1F3D]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers This Month */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Top Performers</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">This Month</span>
          </div>

          <div className="space-y-3">
            {directory.topPerformers.map((perf, index) => (
              <NavLink to={`/admin/executives/${perf.membershipId}`} key={perf.membershipId} className="flex items-center justify-between rounded-sm bg-slate-50/70 p-2.5 border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'
                  }`}>
                    #{index + 1}
                  </span>
                  <Avatar name={perf.name} src={perf.avatarUrl} />
                  <span className="text-xs font-bold text-[#0D1F3D]">{perf.name}</span>
                </div>
                <span className="text-xs font-extrabold text-[#E20613]">{plural(perf.leads, 'Lead')}</span>
              </NavLink>
            ))}
            {!loading && directory.topPerformers.length === 0 && (
              <p className="rounded-sm border border-slate-100 bg-slate-50/70 p-6 text-center text-xs font-medium text-slate-500">No lead activity recorded this month.</p>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/admin/executives/new')}
              className="flex flex-col items-center justify-center rounded-sm border border-slate-200 bg-slate-50/60 p-3 text-center transition-all hover:bg-slate-100"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-sm bg-[#0D1F3D]/10 text-[#0D1F3D]">
                <UserPlus2 className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#0D1F3D]">Add Executive</span>
            </button>

            <button
              onClick={() => toast.info('Bulk executive upload is not available yet.')}
              className="flex flex-col items-center justify-center rounded-sm border border-slate-200 bg-slate-50/60 p-3 text-center transition-all hover:bg-slate-100"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-sm bg-blue-500/10 text-blue-600">
                <Upload className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#0D1F3D]">Bulk Upload</span>
            </button>

            <button
              onClick={() => navigate('/admin/leads/bulk-assign')}
              className="flex flex-col items-center justify-center rounded-sm border border-slate-200 bg-slate-50/60 p-3 text-center transition-all hover:bg-slate-100"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-sm bg-red-500/10 text-[#E20613]">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#0D1F3D]">Assign Leads</span>
            </button>

            <button
              onClick={exportExecutives}
              className="flex flex-col items-center justify-center rounded-sm border border-slate-200 bg-slate-50/60 p-3 text-center transition-all hover:bg-slate-100"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-sm bg-emerald-500/10 text-emerald-600">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-[#0D1F3D]">Export Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
