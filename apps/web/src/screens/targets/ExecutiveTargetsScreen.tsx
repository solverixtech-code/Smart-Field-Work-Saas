import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  Target,
  Gift,
  Plus,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Edit,
  RotateCcw,
  X,
  Filter,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { MonthPicker } from '../../components/ui/MonthPicker';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { Avatar } from '../../components/ui/Avatar';
import { extractErrorMessage } from '../../common/api';
import { SetTargetModal } from './SetTargetModal';
import { currentPeriod, ExecutiveTargetSummary, getTargetDashboard, periodLabel, shiftPeriod, TargetDashboardResponse } from './target.api';

export default function ExecutiveTargetsScreen() {
  const navigate = useNavigate();

  const initialPeriod = currentPeriod();
  const [selectedMonth, setSelectedMonth] = useState(initialPeriod);
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSetTargetModalOpen, setIsSetTargetModalOpen] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState<ExecutiveTargetSummary | null>(null);
  const [dashboard, setDashboard] = useState<TargetDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const monthOptions = Array.from({ length: 18 }, (_, index) => shiftPeriod(initialPeriod, 3 - index)).map((value) => ({ value, label: periodLabel(value) }));
  const executives = dashboard?.executives ?? [];
  const teams = dashboard?.options.teams ?? [];
  const roles = Array.from(new Set(executives.map((e) => e.role))).filter(Boolean);

  const filteredExecs = executives.filter((e) => {
    const matchesSearch =
      !searchQuery.trim() ||
      e.executiveName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      e.executiveId.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesTeam = selectedTeam === 'all' || e.teamId === selectedTeam;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesRole = roleFilter === 'all' || e.role === roleFilter;
    return matchesSearch && matchesTeam && matchesStatus && matchesRole;
  });

  const hasActiveFilters = selectedTeam !== 'all' || statusFilter !== 'all' || roleFilter !== 'all' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedTeam('all');
    setStatusFilter('all');
    setRoleFilter('all');
    setSearchQuery('');
  };
  const statusCount = (status: ExecutiveTargetSummary['status']) => executives.filter((executive) => executive.status === status).length;
  const statusValue = (status: ExecutiveTargetSummary['status']) => {
    const count = statusCount(status);
    return `${count} (${executives.length ? ((count / executives.length) * 100).toFixed(1) : '0.0'}%)`;
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    getTargetDashboard(selectedMonth, shiftPeriod(selectedMonth, -1), controller.signal)
      .then(({ data }) => setDashboard(data))
      .catch((requestError: unknown) => { if (!controller.signal.aborted) setError(extractErrorMessage(requestError, 'Unable to load executive targets.')); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reloadToken, selectedMonth]);

  const exportTargets = () => {
    if (!filteredExecs.length) { toast.info('No executive target records to export.'); return; }
    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [['Executive', 'Employee ID', 'Team', 'Sales target', 'Sales achieved', 'Sales %', 'Demos', 'Visits', 'Incentive', 'Status'], ...filteredExecs.map((executive) => [executive.executiveName, executive.executiveId, executive.teamName, executive.salesTarget, executive.salesAchieved, executive.salesPct, `${executive.demosAchieved}/${executive.demosTarget}`, `${executive.visitsAchieved}/${executive.visitsTarget}`, executive.incentiveEarned, executive.status])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `executive-targets-${selectedMonth}.csv`; link.click(); URL.revokeObjectURL(url);
    toast.success('Executive targets exported.');
  };

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER BAR */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/targets')}>
            Targets & Incentives
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Executive Targets</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1F3D]">Executive Targets</h1>
            <p className="text-xs font-normal text-slate-500">
              Track individual executive quotas, sales achievements and earned incentives.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <div className="w-36">
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={monthOptions}
                searchable={false}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={exportTargets}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" /> Export
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={() => { setEditingExecutive(null); setIsSetTargetModalOpen(true); }}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md px-4 py-2"
            >
              <Plus className="h-4 w-4" /> Assign Executive Target
            </Button>
          </div>
        </div>
      </div>

      {/* TOP KPI SUMMARY CARDS (5 CARDS) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Executives</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{executives.length}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">{executives.length ? Math.round((executives.filter((executive) => executive.salesTarget > 0).length / executives.length) * 100) : 0}% Assigned</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">On Track (&gt;80%)</span>
            <span className="text-xl font-extrabold text-emerald-600">{statusValue('On Track')}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Current period</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">At Risk (60-80%)</span>
            <span className="text-xl font-extrabold text-amber-600">{statusValue('At Risk')}</span>
            <span className="text-xs font-semibold text-amber-600 block mt-0.5">Action Needed</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Behind (&lt;60%)</span>
            <span className="text-xl font-extrabold text-red-600">{statusValue('Behind')}</span>
            <span className="text-xs font-semibold text-red-600 block mt-0.5">Needs Coaching</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 border border-red-100 shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Incentive Earned</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ {dashboard?.summary.incentiveEarned.toLocaleString('en-IN') ?? '0'}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Avg ₹ {executives.length ? Math.round((dashboard?.summary.incentiveEarned ?? 0) / executives.length).toLocaleString('en-IN') : '0'} / exec</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Gift className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* FILTER TOOLBAR & EXECUTIVE TARGETS TABLE */}
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setStatusFilter('all')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${statusFilter === 'all' ? 'bg-[#0D1F3D] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>All ({executives.length})</button>
            <button type="button" onClick={() => setStatusFilter('On Track')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${statusFilter === 'On Track' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'}`}><CheckCircle2 className="h-3.5 w-3.5" /> On Track ({statusCount('On Track')})</button>
            <button type="button" onClick={() => setStatusFilter('At Risk')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${statusFilter === 'At Risk' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'}`}><AlertTriangle className="h-3.5 w-3.5" /> At Risk ({statusCount('At Risk')})</button>
            <button type="button" onClick={() => setStatusFilter('Behind')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 ${statusFilter === 'Behind' ? 'bg-red-600 text-white shadow-xs' : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/60'}`}><XCircle className="h-3.5 w-3.5" /> Behind ({statusCount('Behind')})</button>
          </div>
          <div className="text-xs font-semibold text-slate-500">Showing <span className="font-extrabold text-[#0D1F3D]">{filteredExecs.length}</span> of {executives.length} executives</div>



        </div>





        {/* SEARCH & FILTERS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-start pt-1">
          {/* Search Box */}
          <div className="lg:col-span-1">
            <label className="text-xs font-semibold text-slate-500 block mb-1">Search Executive</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, ID, or role..."
                className="w-full h-10 min-h-[40px] rounded-md border border-slate-200 bg-white pl-9 pr-8 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-purple-600 focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Team Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Filter by Team</label>
            <Select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              options={[{ value: 'all', label: 'All Teams' }, ...teams]}
              searchable={true}
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Filter by Role</label>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Roles' },
                ...roles.map((r) => ({ value: r, label: r })),
              ]}
              searchable={false}
            />
          </div>

          {/* Reset Action */}
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1 opacity-0 select-none">&nbsp;</label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className={`w-full h-10 min-h-[40px] bg-white border-slate-200 font-bold flex items-center justify-center gap-1.5 rounded-md shadow-xs ${
                hasActiveFilters ? 'text-purple-700 border-purple-300 bg-purple-50/50 hover:bg-purple-100/50' : 'text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          </div>
        </div>











        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-extrabold text-[#0D1F3D]">
                <th className="py-2.5 px-3">Executive</th>
                <th className="py-2.5 px-3">Team</th>
                <th className="py-2.5 px-3">Sales Quota (Achieved / Target)</th>
                <th className="py-2.5 px-3">Demos Quota</th>
                <th className="py-2.5 px-3">Visits Quota</th>
                <th className="py-2.5 px-3">Incentive (₹)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={8} className="py-8 text-center text-slate-500">Loading executive targets...</td></tr>}
              {!loading && error && <tr><td colSpan={8} className="py-8 text-center text-red-600">{error}</td></tr>}
              {!loading && !error && filteredExecs.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-slate-500">No executive targets found for this period.</td></tr>}
              {filteredExecs.map((et) => (
                <tr key={et.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div
                      onClick={() => navigate(`/admin/executives/${et.id}`)}
                      className="flex items-center gap-2.5 cursor-pointer group"
                      title={`View ${et.executiveName}'s Profile`}
                    >
                      <Avatar src={et.executiveAvatar} name={et.executiveName} sizeClassName="h-7 w-7" className="group-hover:ring-2 group-hover:ring-purple-600 transition-all shrink-0" />
                      <div>
                        <span className="font-extrabold text-[#0D1F3D] block group-hover:text-purple-600 group-hover:underline transition-colors">{et.executiveName}</span>
                        <span className="text-[10px] text-slate-400 font-mono font-semibold block">{et.executiveId} • {et.role}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">
                    <div
                      onClick={() => navigate('/admin/teams')}
                      className="cursor-pointer group"
                      title={`View ${et.teamName}`}
                    >
                      <span className="group-hover:text-purple-600 group-hover:underline transition-colors">{et.teamName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      <span className="font-mono text-slate-800 text-[11px] block">
                        ₹{et.salesAchieved.toLocaleString('en-IN')} / {et.salesTarget > 0 ? `₹${et.salesTarget.toLocaleString('en-IN')} (${et.salesPct}%)` : et.salesAchieved > 0 ? '(No Target Set)' : 'Unassigned'}
                      </span>
                      <div className="h-1.5 w-36 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${et.salesPct >= 70 || (et.salesTarget === 0 && et.salesAchieved > 0) ? 'bg-emerald-500' : et.salesPct >= 50 ? 'bg-amber-500' : 'bg-purple-600'}`}
                          style={{ width: `${Math.min(et.salesTarget > 0 ? et.salesPct : et.salesAchieved > 0 ? 100 : 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">{et.demosAchieved} / {et.demosTarget} demos</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{et.visitsAchieved} / {et.visitsTarget} visits</td>
                  <td className="py-3 px-3 font-mono text-emerald-600 font-bold">₹{et.incentiveEarned.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                        et.status === 'On Track'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : et.status === 'At Risk'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      {et.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <RowActionsMenu
                      items={[
                        { label: 'View Incentive Details', icon: Eye, onClick: () => navigate(`/admin/incentives/${et.executiveId}`) },
                        { label: 'Edit Target Quota', icon: Edit, onClick: () => { setEditingExecutive(et); setIsSetTargetModalOpen(true); } },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SetTargetModal
        isOpen={isSetTargetModalOpen}
        onClose={() => { setIsSetTargetModalOpen(false); setEditingExecutive(null); }}
        period={selectedMonth}
        teamOptions={dashboard?.options.teams ?? []}
        executiveOptions={dashboard?.options.executives ?? []}
        initialExecutive={editingExecutive}
        onSaved={() => setReloadToken((token) => token + 1)}
      />
    </div>
  );
}
