import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Target,
  Trophy,
  Users,
  Percent,
  Gift,
  CreditCard,
  Plus,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Eye,
  Edit,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { Avatar } from '../../components/ui/Avatar';
import { extractErrorMessage } from '../../common/api';
import { SetTargetModal } from './SetTargetModal';
import { currentPeriod, getTargetDashboard, periodLabel, shiftPeriod, TargetDashboardResponse, TeamTargetSummary } from './target.api';

export default function TeamTargetsScreen() {
  const navigate = useNavigate();

  // Filters State
  const initialPeriod = currentPeriod();
  const [selectedMonth, setSelectedMonth] = useState(initialPeriod);
  const [isSetTargetModalOpen, setIsSetTargetModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamTargetSummary | null>(null);
  const [dashboard, setDashboard] = useState<TargetDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const monthOptions = Array.from({ length: 18 }, (_, index) => shiftPeriod(initialPeriod, 3 - index)).map((value) => ({ value, label: periodLabel(value) }));
  const teamTargets = dashboard?.teams ?? [];
  const totalTeams = dashboard?.options.teams.length ?? 0;
  const status = dashboard?.statusDistribution ?? { 'On Track': 0, 'At Risk': 0, Behind: 0 };
  const statusValue = (count: number) => `${count} (${totalTeams ? ((count / totalTeams) * 100).toFixed(1) : '0.0'}%)`;
  const topTeams = [...teamTargets].sort((left, right) => right.achievementPct - left.achievementPct).slice(0, 3);
  const totalTargetAmount = teamTargets.reduce((sum, team) => sum + team.targetAmount, 0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    getTargetDashboard(selectedMonth, shiftPeriod(selectedMonth, -1), controller.signal)
      .then(({ data }) => setDashboard(data))
      .catch((requestError: unknown) => { if (!controller.signal.aborted) setError(extractErrorMessage(requestError, 'Unable to load team targets.')); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reloadToken, selectedMonth]);

  const exportTargets = () => {
    if (!teamTargets.length) { toast.info('No team target records to export.'); return; }
    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [['Team', 'Branch', 'Manager', 'Target', 'Achieved', 'Achievement %', 'Status', 'Executives', 'Incentive'], ...teamTargets.map((team) => [team.teamName, team.branch, team.teamLeaderName, team.targetAmount, team.achievedAmount, team.achievementPct, team.status, team.executivesCount, team.incentiveEarned])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `team-targets-${selectedMonth}.csv`; link.click(); URL.revokeObjectURL(url);
    toast.success('Team targets exported.');
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
          <span className="text-[#0D1F3D] font-bold">Team Targets</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1F3D]">Team Targets</h1>
            <p className="text-xs font-normal text-slate-500">
              Track team-wise targets, achievements and performance across branches.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {/* Time Period Select */}
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
              onClick={() => { setEditingTeam(null); setIsSetTargetModalOpen(true); }}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md px-4 py-2"
            >
              <Plus className="h-4 w-4" /> Create Team Target
            </Button>
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS (6 CARDS) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Teams</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{totalTeams}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Active teams</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">On Track</span>
            <span className="text-xl font-extrabold text-emerald-600">{statusValue(status['On Track'])}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Meeting threshold</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">At Risk</span>
            <span className="text-xl font-extrabold text-amber-600">{statusValue(status['At Risk'])}</span>
            <span className="text-xs font-semibold text-red-600 block mt-0.5">Action needed</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Behind</span>
            <span className="text-xl font-extrabold text-red-600">{statusValue(status.Behind)}</span>
            <span className="text-xs font-semibold text-red-600 block mt-0.5">Needs coaching</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 border border-red-100 shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Incentive Earned</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ {(dashboard?.summary.incentiveEarned ?? 0).toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Calculated earnings</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-cyan-50 text-cyan-600 border border-cyan-100 shrink-0">
            <Gift className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Incentive Paid</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ {(dashboard?.summary.incentivePaid ?? 0).toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Disbursed payouts</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 100% FULL-WIDTH TABLE */}
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Team Targets Overview</h3>
          <span className="text-xs font-semibold text-slate-500">Showing {teamTargets.length ? 1 : 0} to {teamTargets.length} of {totalTeams} teams</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-extrabold text-[#0D1F3D]">
                <th className="py-2.5 px-3">Team / Branch</th>
                <th className="py-2.5 px-3">Team Manager</th>
                <th className="py-2.5 px-3">Target (₹)</th>
                <th className="py-2.5 px-3">Achieved (₹)</th>
                <th className="py-2.5 px-3">Achievement %</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Executives</th>
                <th className="py-2.5 px-3">Incentive (₹)</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading && <tr><td colSpan={9} className="py-8 text-center text-slate-500">Loading team targets...</td></tr>}
              {!loading && error && <tr><td colSpan={9} className="py-8 text-center text-red-600">{error}</td></tr>}
              {!loading && !error && !teamTargets.length && <tr><td colSpan={9} className="py-8 text-center text-slate-500">No team targets are set for {periodLabel(selectedMonth)}.</td></tr>}
              {!loading && !error && teamTargets.map((tt) => (
                <tr key={tt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div>
                      <span className="font-extrabold text-[#0D1F3D] block">{tt.teamName}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{tt.branch}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={tt.teamLeaderName} src={tt.teamLeaderAvatar} sizeClassName="h-6 w-6" />
                      <div>
                        <span className="font-bold text-[#0D1F3D] block text-xs">{tt.teamLeaderName}</span>
                        <span className="text-[9px] text-slate-400 font-semibold block">Sales Manager</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-800">₹{tt.targetAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-mono text-slate-800">₹{tt.achievedAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <div className="space-y-1 w-28">
                      <span className="font-extrabold text-[#0D1F3D] text-[11px]">{tt.achievementPct}%</span>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            tt.achievementPct >= 70
                              ? 'bg-emerald-500'
                              : tt.achievementPct >= 55
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(tt.achievementPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                        tt.status === 'On Track'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : tt.status === 'At Risk'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      {tt.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-700">{tt.executivesCount}</td>
                  <td className="py-3 px-3 font-mono text-emerald-600 font-bold">₹{tt.incentiveEarned.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-center">
                    <RowActionsMenu
                      items={[
                        { label: 'Edit Team Target', icon: Edit, onClick: () => { setEditingTeam(tt); setIsSetTargetModalOpen(true); } },
                        { label: 'View Team Members', icon: Eye, onClick: () => navigate('/admin/targets/executives') },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM ANALYTICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0D1F3D]">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Top Performing Teams</span>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              This Month
            </span>
          </div>

          <div className="space-y-2 text-xs font-semibold">
            {!topTeams.length && <div className="p-4 text-center text-slate-500">No team performance records for this month.</div>}
            {topTeams.map((team, index) => <div key={team.id} className={`flex items-center justify-between p-2 rounded-md ${index === 0 ? 'bg-emerald-50/50 border border-emerald-200/60' : 'bg-slate-50 border border-slate-100'}`}><div className="flex items-center gap-2"><span className="font-extrabold text-[#0D1F3D]">{index + 1}. {team.teamName}</span><span className="text-[10px] text-slate-400 font-semibold">({team.branch})</span></div><span className={`font-black ${team.achievementPct >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>{team.achievementPct}%</span></div>)}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Target Distribution by Region
          </h3>
          <div className="space-y-2 text-xs font-semibold">
            {!topTeams.length && <div className="p-4 text-center text-slate-500">No target distribution is available.</div>}
            {topTeams.map((team, index) => <div key={team.id} className={`flex justify-between text-slate-700 ${index ? 'border-t border-slate-100 pt-1.5' : ''}`}><span>{team.teamName}</span><span className="font-extrabold text-[#0D1F3D]">₹ {team.targetAmount.toLocaleString('en-IN')} ({totalTargetAmount ? ((team.targetAmount / totalTargetAmount) * 100).toFixed(1) : '0.0'}%)</span></div>)}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Team Status Breakdown
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold pt-1">
            <div className="rounded-md bg-emerald-50 p-2 border border-emerald-200/60">
              <span className="text-emerald-700 block text-lg font-black">{status['On Track']}</span>
              <span className="text-[10px] text-emerald-600 font-semibold">On Track</span>
            </div>
            <div className="rounded-md bg-amber-50 p-2 border border-amber-200/60">
              <span className="text-amber-700 block text-lg font-black">{status['At Risk']}</span>
              <span className="text-[10px] text-amber-600 font-semibold">At Risk</span>
            </div>
            <div className="rounded-md bg-red-50 p-2 border border-red-200/60">
              <span className="text-red-700 block text-lg font-black">{status.Behind}</span>
              <span className="text-[10px] text-red-600 font-semibold">Behind</span>
            </div>
          </div>
        </div>
      </div>

      {/* SET NEW TARGET MODAL */}
      <SetTargetModal
        isOpen={isSetTargetModalOpen}
        onClose={() => setIsSetTargetModalOpen(false)}
        onSaved={() => { setIsSetTargetModalOpen(false); setReloadToken((value) => value + 1); }}
        period={selectedMonth}
        teamOptions={dashboard?.options.teams ?? []}
        executiveOptions={dashboard?.options.executives ?? []}
        initialTeam={editingTeam}
      />
    </div>
  );
}
