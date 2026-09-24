import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  Plus,
  Search,
  Eye,
  MoreVertical,
  Target,
  ChevronRight,
  ChevronLeft,
  UserCheck,
  Building2,
  BarChart3,
  Clock,
  Download,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { api, extractErrorMessage } from '../../common/api';
import { useDebouncedSearch } from '../../features/crm/CrmContext';

interface SalesTeamItem {
  id: string;
  name: string;
  code: string;
  region: string;
  leaderName: string;
  leaderCode: string | null;
  leaderAvatarUrl: string | null;
  memberCount: number;
  department: string;
  monthlyTarget: number;
  achievedAmount: number;
  achievedPercent: number;
  dealsThisMonth: number;
  status: 'Active' | 'Inactive';
}

interface TeamDirectoryResponse {
  items: SalesTeamItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  regions: string[];
  summary: {
    totalTeams: number;
    totalMembers: number;
    activeTeams: number;
    averageTeamSize: number;
    currentDeals: number;
    dealChangePercent: number;
  };
  distribution: Array<{ region: string; value: number }>;
  topPerformers: Array<Pick<SalesTeamItem, 'id' | 'name' | 'monthlyTarget' | 'achievedAmount' | 'achievedPercent'>>;
}

const emptyDirectory: TeamDirectoryResponse = {
  items: [], total: 0, page: 1, limit: 10, totalPages: 0, regions: [],
  summary: { totalTeams: 0, totalMembers: 0, activeTeams: 0, averageTeamSize: 0, currentDeals: 0, dealChangePercent: 0 },
  distribution: [], topPerformers: [],
};

const colors = ['#0D1F3D', '#10B981', '#2563EB', '#F59E0B', '#E20613', '#8B5CF6'];
const avatarClasses = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-indigo-100 text-indigo-700'];
const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
const teamColor = (code: string) => avatarClasses[[...code].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarClasses.length];
const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`;
export default function SalesTeamsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedSearch(searchTerm.trim());
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [directory, setDirectory] = useState(emptyDirectory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    api.get<TeamDirectoryResponse>('/tenant/crm/teams', {
      signal: controller.signal,
      params: {
        page,
        limit,
        search: debouncedSearch || undefined,
        region: regionFilter === 'All' ? undefined : regionFilter,
        status: statusFilter === 'All' ? undefined : statusFilter,
      },
    }).then(({ data }) => {
      setDirectory(data);
      setSelectedIds([]);
    }).catch((requestError: unknown) => {
      if (!controller.signal.aborted) setError(extractErrorMessage(requestError, 'Unable to load sales teams.'));
    }).finally(() => {
      if (!controller.signal.aborted) setLoading(false);
    });
    return () => controller.abort();
  }, [debouncedSearch, limit, page, regionFilter, statusFilter]);

  const filteredTeams = directory.items;
  const teamDistributionData = directory.distribution.map((item, index) => ({
    name: item.region,
    value: item.value,
    color: colors[index % colors.length],
  }));

  const exportTeams = async () => {
    try {
      const params = {
        limit: 500,
        search: debouncedSearch || undefined,
        region: regionFilter === 'All' ? undefined : regionFilter,
        status: statusFilter === 'All' ? undefined : statusFilter,
      };
      const firstPage = await api.get<TeamDirectoryResponse>('/tenant/crm/teams', { params: { ...params, page: 1 } });
      const remainingPages = await Promise.all(
        Array.from({ length: Math.max(0, firstPage.data.totalPages - 1) }, (_, index) =>
          api.get<TeamDirectoryResponse>('/tenant/crm/teams', { params: { ...params, page: index + 2 } })),
      );
      const items = [firstPage.data, ...remainingPages.map(({ data }) => data)].flatMap((response) => response.items);
      if (!items.length) {
        toast.info('No team records to export.');
        return;
      }
      const escape = (value: string | number | null) => `"${String(value ?? '').replace(/"/g, '""')}"`;
      const rows = [
        ['Team', 'Code', 'Region', 'Leader', 'Leader code', 'Members', 'Department', 'Monthly target', 'Achieved', 'Performance', 'Status'],
        ...items.map((team) => [team.name, team.code, team.region, team.leaderName, team.leaderCode, team.memberCount, team.department, team.monthlyTarget, team.achievedAmount, `${team.achievedPercent}%`, team.status]),
      ];
      const blob = new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-teams-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Team data exported.');
    } catch (requestError) {
      toast.error(extractErrorMessage(requestError, 'Unable to export team data.'));
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredTeams.map((t) => t.id));
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

  return (
    <div className="space-y-3 font-sans pb-10">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Sales Teams Management</h1>
          <p className="text-xs font-normal text-slate-500">
            Configure sales team structures, assign team leaders, track monthly targets, and monitor overall performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={exportTeams}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export Data
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/teams/create')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white"
          >
            <Plus className="h-4 w-4" /> Create Team
          </Button>
        </div>
      </div>

      {/* 5 Top Metric KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:grid-cols-3">
        <KpiCard
          title="Total Teams"
          value={String(directory.summary.totalTeams)}
          subValue="Active & Operational"
          timeframe=""
          icon={Building2}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Total Members"
          value={String(directory.summary.totalMembers)}
          subValue="Active Field Staff"
          timeframe=""
          icon={Users}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Active Teams"
          value={String(directory.summary.activeTeams)}
          subValue={`${directory.summary.totalTeams ? ((directory.summary.activeTeams / directory.summary.totalTeams) * 100).toFixed(1) : 0}% Active`}
          timeframe=""
          icon={Target}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Avg Team Size"
          value={`${directory.summary.averageTeamSize} Staff`}
          subValue="Staff Per Team"
          timeframe=""
          icon={UserCheck}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Total Deals (This Month)"
          value={`${directory.summary.currentDeals} Deals`}
          change={`${directory.summary.dealChangePercent >= 0 ? '+' : ''}${directory.summary.dealChangePercent}%`}
          changeType={directory.summary.dealChangePercent >= 0 ? 'positive' : 'negative'}
          timeframe="vs last month"
          icon={BarChart3}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
      </div>

      {/* Main Table Section */}
      <div className="space-y-3">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-slate-200/80 bg-white p-3 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teams by name, code, leader..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full rounded-sm border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Region Dropdown */}
          <select
            value={regionFilter}
            onChange={(e) => { setRegionFilter(e.target.value); setPage(1); }}
            className="rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none cursor-pointer"
          >
            <option value="All">All Regions</option>
            {directory.regions.map((region) => <option key={region} value={region}>{region}</option>)}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-sm border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Table Card Container */}
        <div className="overflow-hidden rounded-sm border border-slate-200/80 bg-white shadow-sm flex flex-col justify-between min-h-[360px]">
          <div>
            <div className="overflow-x-auto custom-scrollbar min-h-[300px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/90 text-xs font-semibold text-slate-800">
                    <th className="p-3.5 text-center w-10">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === filteredTeams.length && filteredTeams.length > 0}
                        className="rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                    </th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[200px]">Team Name</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[180px]">Team Leader</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-center min-w-[90px]">Members</th>
                    <th className="px-4 py-3.5 whitespace-nowrap min-w-[120px]">Department</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-right min-w-[140px]">Monthly Target</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-right min-w-[160px]">Achieved (This Month)</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-center min-w-[130px]">Performance</th>
                    <th className="px-4 py-3.5 whitespace-nowrap text-center min-w-[100px]">Status</th>
                    <th className="px-4 py-3.5 text-right whitespace-nowrap min-w-[90px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredTeams.map((t) => {
                    const isSelected = selectedIds.includes(t.id);
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectOne(t.id)}
                            className="rounded-sm border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                        </td>

                        {/* Team Name */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-sm font-bold text-xs shrink-0 ${teamColor(t.code)}`}>
                              {initials(t.name)}
                            </div>
                            <div>
                              <button
                                onClick={() => navigate(`/admin/teams/${t.id}`)}
                                className="font-semibold text-slate-900 hover:text-blue-700 hover:underline text-left block whitespace-nowrap"
                              >
                                {t.name}
                              </button>
                              <p className="text-xs text-slate-600 font-normal whitespace-nowrap">{t.region}</p>
                            </div>
                          </div>
                        </td>

                        {/* Team Leader */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={t.leaderName} src={t.leaderAvatarUrl} sizeClassName="h-7 w-7" />
                            <div>
                              <p className="font-semibold text-slate-900 whitespace-nowrap">{t.leaderName}</p>
                              <p className="text-xs text-slate-600 font-mono whitespace-nowrap">{t.leaderCode ?? 'Not assigned'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Members */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <div>
                            <span className="font-semibold text-slate-900">{t.memberCount}</span>
                            <button
                              onClick={() => navigate(`/admin/teams/${t.id}/members`)}
                              className="block text-xs text-blue-700 font-medium hover:underline whitespace-nowrap mx-auto"
                            >
                              View Members
                            </button>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-4 py-3.5 font-medium text-slate-700 whitespace-nowrap">
                          {t.department}
                        </td>

                        {/* Target (Monthly) - Aligned Right */}
                        <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap text-right">
                          {inr(t.monthlyTarget)}
                        </td>

                        {/* Achieved (This Month) - Aligned Right */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <div>
                            <p className="font-semibold text-slate-900">{inr(t.achievedAmount)}</p>
                            <p className={`text-xs font-semibold ${t.achievedPercent >= 75 ? 'text-emerald-700' : t.achievedPercent >= 50 ? 'text-amber-700' : 'text-rose-600'}`}>
                              {t.achievedPercent}%
                            </p>
                          </div>
                        </td>

                        {/* Performance Bar */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="w-24 mx-auto">
                            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full ${
                                  t.achievedPercent >= 75
                                    ? 'bg-emerald-600'
                                    : t.achievedPercent >= 50
                                      ? 'bg-amber-500'
                                      : 'bg-rose-600'
                                }`}
                                style={{ width: `${Math.min(t.achievedPercent, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <span
                            className={`inline-block rounded-sm px-2.5 py-0.5 text-xs font-semibold border ${
                              t.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        {/* Actions Column with Floating Dropdown Menu */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap relative">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/admin/teams/${t.id}`)}
                              title="View Team Details"
                              className="p-1.5 rounded-sm text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors border border-slate-200 shadow-xs"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === t.id ? null : t.id);
                                }}
                                title="Team Actions Menu"
                                className={`p-1.5 rounded-sm transition-colors border shadow-xs ${
                                  activeMenuId === t.id
                                    ? 'bg-[#0D1F3D] text-white border-[#0D1F3D]'
                                    : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-[#0D1F3D]'
                                }`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {/* Floating Dropdown Action Menu */}
                              {activeMenuId === t.id && (
                                <div
                                  className="absolute right-0 top-full mt-1 z-50 w-52 rounded-sm border border-slate-200 bg-white p-1.5 shadow-2xl space-y-1 text-left animate-fadeIn"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      navigate(`/admin/teams/${t.id}/leader`);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-bold text-[#0D1F3D] hover:bg-red-50 hover:text-[#E20613] transition-colors"
                                  >
                                    <UserCheck className="h-4 w-4 text-[#E20613]" />
                                    <span>Assign / Change Leader</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      navigate(`/admin/teams/${t.id}/members`);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <Users className="h-4 w-4 text-blue-600" />
                                    <span>Manage Members ({t.memberCount})</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      navigate(`/admin/teams/${t.id}/performance`);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <BarChart3 className="h-4 w-4 text-emerald-600" />
                                    <span>View Team Performance</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      navigate(`/admin/teams/${t.id}/targets`);
                                    }}
                                    className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                    <Target className="h-4 w-4 text-purple-600" />
                                    <span>Manage Team Targets</span>
                                  </button>

                                  <div className="border-t border-slate-100 pt-1">
                                    <button
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        navigate(`/admin/teams/${t.id}`);
                                      }}
                                      className="flex w-full items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                      <Eye className="h-4 w-4 text-slate-500" />
                                      <span>Team Full Details</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && !error && filteredTeams.length === 0 && (
                    <tr><td colSpan={10} className="px-4 py-16 text-center text-sm font-medium text-slate-500">No sales teams match these filters.</td></tr>
                  )}
                  {loading && (
                    <tr><td colSpan={10} className="px-4 py-16 text-center text-sm font-medium text-slate-500">Loading sales teams...</td></tr>
                  )}
                  {!loading && error && (
                    <tr><td colSpan={10} className="px-4 py-16 text-center text-sm font-medium text-[#E20613]">{error}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer Pagination */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-700 font-medium bg-slate-50">
            <p>Showing {firstResult} to {lastResult} of {directory.total} teams</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={directory.page <= 1 || loading}
                  aria-label="Previous page"
                  className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-slate-900 text-xs font-semibold text-white">
                  {directory.page}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(directory.totalPages, current + 1))}
                  disabled={directory.page >= directory.totalPages || loading}
                  aria-label="Next page"
                  className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <select
                value={limit}
                onChange={(event) => { setLimit(Number(event.target.value)); setPage(1); }}
                aria-label="Teams per page"
                className="rounded-sm border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-900"
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Team Distribution + Top Performing Teams + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Team Distribution Donut Chart */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Team Distribution</h3>
          <div className="flex flex-col items-center">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={teamDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {teamDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val) => [`${val ?? 0} Teams`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-slate-900">{directory.summary.totalTeams}</span>
                <span className="text-xs font-normal text-slate-600">Total Teams</span>
              </div>
            </div>

            <div className="mt-2 w-full space-y-1.5 text-xs font-medium text-slate-700">
              {teamDistributionData.map((d) => (
                <div key={d.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    <span className="truncate text-slate-700">{d.name}</span>
                  </span>
                  <span className="font-semibold text-slate-900 ml-2">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Teams Leaderboard */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Top Performing Teams</h3>
            <span className="text-xs font-normal text-slate-600">This Month</span>
          </div>

          <div className="space-y-3">
            {directory.topPerformers.map((t, index) => (
              <button type="button" onClick={() => navigate(`/admin/teams/${t.id}`)} key={t.id} className="block w-full space-y-1.5 text-xs font-medium text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-800 border border-slate-200">
                      {index + 1}
                    </span>
                    <span className="font-semibold text-slate-900">{t.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{t.achievedPercent}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div className={`h-full ${t.achievedPercent >= 75 ? 'bg-emerald-600' : t.achievedPercent >= 50 ? 'bg-amber-500' : 'bg-rose-600'} rounded-full`} style={{ width: `${Math.min(t.achievedPercent, 100)}%` }} />
                </div>
                <p className="text-xs text-right text-slate-600 font-normal">{inr(t.achievedAmount)} / {inr(t.monthlyTarget)}</p>
              </button>
            ))}
            {!loading && directory.topPerformers.length === 0 && (
              <p className="rounded-sm border border-slate-100 bg-slate-50 p-6 text-center text-xs font-medium text-slate-500">No monthly team targets are recorded.</p>
            )}
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
          <h3 className="text-base font-bold text-slate-900">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/admin/teams/create')}
              className="w-full flex items-center justify-between rounded-sm border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="h-4 w-4 text-slate-900" />
                <div>
                  <p className="font-bold text-slate-900">Create New Team</p>
                  <p className="text-xs text-slate-600 font-normal">Add a new sales team</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>

            <button
              onClick={() => navigate('/admin/teams/targets')}
              className="w-full flex items-center justify-between rounded-sm border border-slate-200 bg-slate-50 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
            >
              <div className="flex items-center gap-2.5">
                <Users className="h-4 w-4 text-slate-900" />
                <div>
                  <p className="font-bold text-slate-900">Team Targets Matrix</p>
                  <p className="text-xs text-slate-600 font-normal">View overall target structure & performance</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Status Notice Footer */}
      <div className="flex items-center justify-center gap-2 pt-2 text-center text-xs font-normal text-slate-600">
        <Clock className="h-4 w-4 text-slate-500" />
        <span>Team targets and performance are updated in real-time.</span>
      </div>
    </div>
  );
}
