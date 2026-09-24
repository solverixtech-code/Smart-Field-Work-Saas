import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Target, Trophy, Users, Percent, Gift, CreditCard, Plus, Download, Filter, Eye, Edit } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { Avatar } from '../../components/ui/Avatar';
import { extractErrorMessage } from '../../common/api';
import { SetTargetModal } from './SetTargetModal';
import { currentPeriod, getTargetDashboard, periodLabel, shiftPeriod, TargetDashboardResponse, TeamTargetSummary } from './target.api';
const inr = (value: number) => `₹ ${value.toLocaleString('en-IN')}`;
const emptyDashboard: TargetDashboardResponse = {
  period: currentPeriod(), comparePeriod: shiftPeriod(currentPeriod(), -1),
  summary: { totalTarget: 0, achieved: 0, achievementPercent: 0, activeExecutives: 0, incentiveEarned: 0, incentivePaid: 0, changes: { totalTarget: 0, achieved: 0, achievementPercent: 0, activeExecutives: 0, incentiveEarned: 0, incentivePaid: 0 } },
  teams: [], executives: [], topAchievers: [], statusDistribution: { 'On Track': 0, 'At Risk': 0, Behind: 0 },
  options: { teams: [], executives: [] }, sourceAvailability: { incentives: false, collections: false },
};

function Kpi({ title, value, change, icon: Icon, iconClass, changeSuffix = '% vs last month' }: { title: string; value: string; change: number; icon: LucideIcon; iconClass: string; changeSuffix?: string }) {
  const direction = change >= 0 ? '▲' : '▼';
  return <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
    <div><span className="text-xs font-semibold text-slate-500 block">{title}</span><span className="text-xl font-extrabold text-[#0D1F3D]">{value}</span><span className={`text-xs font-semibold block mt-0.5 ${change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{direction} {Math.abs(change)}{changeSuffix}</span></div>
    <div className={`flex h-10 w-10 items-center justify-center rounded-sm border shrink-0 ${iconClass}`}><Icon className="h-5 w-5" /></div>
  </div>;
}

export default function TargetDashboardPage() {
  const navigate = useNavigate();
  const initialPeriod = currentPeriod();
  const [selectedMonth, setSelectedMonth] = useState(initialPeriod);
  const [compareMonth, setCompareMonth] = useState(shiftPeriod(initialPeriod, -1));
  const [activeTab, setActiveTab] = useState<'Overview' | 'Team Performance' | 'Individual Performance' | 'Incentives Overview'>('Overview');
  const [isSetTargetModalOpen, setIsSetTargetModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamTargetSummary | null>(null);
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const monthOptions = Array.from({ length: 18 }, (_, index) => shiftPeriod(initialPeriod, 3 - index)).map((value) => ({ value, label: periodLabel(value) }));

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    getTargetDashboard(selectedMonth, compareMonth, controller.signal)
      .then(({ data }) => setDashboard(data))
      .catch((requestError: unknown) => { if (!controller.signal.aborted) setError(extractErrorMessage(requestError, 'Unable to load targets and incentives.')); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [compareMonth, reloadToken, selectedMonth]);

  const exportReport = () => {
    if (!dashboard.teams.length) { toast.info('No target records to export.'); return; }
    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [['Team', 'Branch', 'Manager', 'Target', 'Achieved', 'Achievement %', 'Executives', 'Incentive', 'Status'], ...dashboard.teams.map((team) => [team.teamName, team.branch, team.teamLeaderName, team.targetAmount, team.achievedAmount, team.achievementPct, team.executivesCount, team.incentiveEarned, team.status])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `target-report-${selectedMonth}.csv`; link.click(); URL.revokeObjectURL(url);
    toast.success('Target report exported.');
  };
  const openCreate = () => { setEditingTeam(null); setIsSetTargetModalOpen(true); };

  return <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium"><span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span><span>/</span><span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/targets')}>Targets & Incentives</span><span>/</span><span className="text-[#0D1F3D] font-bold">Target Dashboard</span></div>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div><h1 className="text-2xl font-bold text-[#0D1F3D]">Target Dashboard</h1><p className="text-xs font-normal text-slate-500">Track targets, achievements and incentives across teams and individuals.</p></div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <div className="w-36"><Select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)} options={monthOptions} searchable={false} /></div>
          <div className="w-36"><Select value={compareMonth} onChange={(event) => setCompareMonth(event.target.value)} options={monthOptions.map((option) => ({ ...option, label: `Vs ${option.label}` }))} searchable={false} /></div>
          <Button variant="outline" size="sm" onClick={() => setReloadToken((value) => value + 1)} className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"><Filter className="h-3.5 w-3.5" /> Filters</Button>
          <Button variant="outline" size="sm" onClick={exportReport} className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"><Download className="h-3.5 w-3.5 text-emerald-600" /> Export</Button>
          <Button variant="accent" size="sm" onClick={openCreate} className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md px-4 py-2"><Plus className="h-4 w-4" /> Set New Target</Button>
        </div>
      </div>
    </div>
    {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{error} <button type="button" className="ml-2 underline" onClick={() => setReloadToken((value) => value + 1)}>Retry</button></div>}

    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
      <Kpi title="Total Target (Month)" value={inr(dashboard.summary.totalTarget)} change={dashboard.summary.changes.totalTarget} icon={Target} iconClass="bg-blue-50 text-blue-600 border-blue-100" />
      <Kpi title="Achieved (Month)" value={inr(dashboard.summary.achieved)} change={dashboard.summary.changes.achieved} icon={Trophy} iconClass="bg-emerald-50 text-emerald-600 border-emerald-100" />
      <Kpi title="Achievement %" value={`${dashboard.summary.achievementPercent}%`} change={dashboard.summary.changes.achievementPercent} icon={Percent} iconClass="bg-amber-50 text-amber-600 border-amber-100" />
      <Kpi title="Active Executives" value={String(dashboard.summary.activeExecutives)} change={dashboard.summary.changes.activeExecutives} changeSuffix=" vs last month" icon={Users} iconClass="bg-purple-50 text-purple-600 border-purple-100" />
      <Kpi title="Incentive Earned" value={inr(dashboard.summary.incentiveEarned)} change={dashboard.summary.changes.incentiveEarned} icon={Gift} iconClass="bg-cyan-50 text-cyan-600 border-cyan-100" />
      <Kpi title="Incentive Paid" value={inr(dashboard.summary.incentivePaid)} change={dashboard.summary.changes.incentivePaid} icon={CreditCard} iconClass="bg-red-50 text-red-600 border-red-100" />
    </div>

    <div className="flex items-center gap-2 border-b border-slate-200 pb-0 text-xs font-bold">{(['Overview', 'Team Performance', 'Individual Performance', 'Incentives Overview'] as const).map((tab) => <button key={tab} type="button" onClick={() => { setActiveTab(tab); if (tab === 'Team Performance') navigate('/admin/targets/teams'); else if (tab === 'Individual Performance') navigate('/admin/targets/executives'); else if (tab === 'Incentives Overview') navigate('/admin/incentives'); }} className={`px-4 py-2.5 border-b-2 transition cursor-pointer ${activeTab === tab ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>{tab}</button>)}</div>

    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5"><h3 className="text-sm font-extrabold text-[#0D1F3D]">Team Target Summary</h3><Button variant="outline" size="sm" onClick={() => navigate('/admin/targets/teams')} className="text-xs font-bold text-slate-700">View All Team Targets →</Button></div>
      <div className="overflow-x-auto"><table className="w-full text-left text-xs font-semibold text-slate-700 whitespace-nowrap">
        <thead><tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-extrabold text-[#0D1F3D]"><th className="py-2.5 px-3">Team / Branch</th><th className="py-2.5 px-3">Team Manager</th><th className="py-2.5 px-3">Target (₹)</th><th className="py-2.5 px-3">Achieved (₹)</th><th className="py-2.5 px-3">Achievement %</th><th className="py-2.5 px-3">Executives</th><th className="py-2.5 px-3">Incentive (₹)</th><th className="py-2.5 px-3">Status</th><th className="py-2.5 px-3 text-center">Actions</th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {loading && <tr><td colSpan={9} className="py-8 text-center text-slate-500">Loading target records...</td></tr>}
          {!loading && !dashboard.teams.length && <tr><td colSpan={9} className="py-8 text-center text-slate-500">No team revenue targets are set for {periodLabel(selectedMonth)}.</td></tr>}
          {!loading && dashboard.teams.map((team) => <tr key={team.id} className="hover:bg-slate-50/80 transition-colors">
            <td className="py-3 px-3"><span className="font-extrabold text-[#0D1F3D] block">{team.teamName}</span><span className="text-[10px] text-slate-500 font-semibold">{team.branch}</span></td>
            <td className="py-3 px-3"><div className="flex items-center gap-2"><Avatar name={team.teamLeaderName} src={team.teamLeaderAvatar} sizeClassName="h-6 w-6" /><div><span className="font-bold text-[#0D1F3D] block text-xs">{team.teamLeaderName}</span><span className="text-[9px] text-slate-500 font-semibold block">Sales Manager</span></div></div></td>
            <td className="py-3 px-3 font-mono text-slate-800">{inr(team.targetAmount)}</td><td className="py-3 px-3 font-mono text-slate-800">{inr(team.achievedAmount)}</td>
            <td className="py-3 px-3"><div className="space-y-1 w-28"><span className="font-extrabold text-[#0D1F3D] text-[11px]">{team.achievementPct}%</span><div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${team.achievementPct >= 70 ? 'bg-emerald-500' : team.achievementPct >= 55 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(team.achievementPct, 100)}%` }} /></div></div></td>
            <td className="py-3 px-3 font-bold text-slate-700">{team.executivesCount}</td><td className="py-3 px-3 font-mono text-emerald-600 font-bold">{inr(team.incentiveEarned)}</td>
            <td className="py-3 px-3"><span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${team.status === 'On Track' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : team.status === 'At Risk' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{team.status}</span></td>
            <td className="py-3 px-3 text-center"><RowActionsMenu items={[{ label: 'View Team Targets', icon: Eye, onClick: () => navigate('/admin/targets/teams') }, { label: 'Edit Target Quota', icon: Edit, onClick: () => { setEditingTeam(team); setIsSetTargetModalOpen(true); } }]} /></td>
          </tr>)}
        </tbody>
      </table></div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3"><div className="flex items-center justify-between border-b border-slate-100 pb-2.5"><div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0D1F3D]"><Trophy className="h-4 w-4 text-amber-500" /><span>Top Achievers</span></div><span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">This Month</span></div><div className="space-y-2 text-xs font-semibold">
        {!dashboard.topAchievers.length && <div className="p-4 text-center text-slate-500">No individual revenue targets are set for this month.</div>}
        {dashboard.topAchievers.map((person, index) => <div key={person.id} className={`flex items-center justify-between p-2 rounded-md ${index === 0 ? 'bg-amber-50/50 border border-amber-200/60' : 'bg-slate-50 border border-slate-100'}`}><div className="flex items-center gap-2.5"><span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${index === 0 ? 'bg-amber-500 text-white' : index === 1 ? 'bg-slate-300 text-slate-700' : 'bg-amber-700 text-white'}`}>{index + 1}</span><Avatar name={person.name} src={person.avatarUrl} sizeClassName="h-7 w-7" /><div><span className="font-extrabold text-[#0D1F3D] block">{person.name}</span><span className="text-[10px] text-slate-500 font-semibold">{person.teamName}</span></div></div><span className="font-black text-emerald-600 text-sm">{person.achievementPct}%</span></div>)}
      </div></div>
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3"><h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Achievement Status Distribution</h3><div className="grid grid-cols-3 gap-2 text-center text-xs font-bold pt-1"><div className="rounded-md bg-emerald-50 p-2.5 border border-emerald-200/60"><span className="text-emerald-700 block text-xl font-black">{dashboard.statusDistribution['On Track']}</span><span className="text-[10px] text-emerald-600 font-semibold">On Track</span></div><div className="rounded-md bg-amber-50 p-2.5 border border-amber-200/60"><span className="text-amber-700 block text-xl font-black">{dashboard.statusDistribution['At Risk']}</span><span className="text-[10px] text-amber-600 font-semibold">At Risk</span></div><div className="rounded-md bg-red-50 p-2.5 border border-red-200/60"><span className="text-red-700 block text-xl font-black">{dashboard.statusDistribution.Behind}</span><span className="text-[10px] text-red-600 font-semibold">Behind</span></div></div></div>
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3"><h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Performance Highlights</h3><div className="space-y-2 text-xs font-semibold"><div className="flex items-center justify-between"><span className="text-slate-600">Company Target Achievement</span><span className="font-extrabold text-[#0D1F3D]">{dashboard.summary.achievementPercent}% <span className={dashboard.summary.changes.achievementPercent >= 0 ? 'text-[10px] text-emerald-600' : 'text-[10px] text-red-600'}>{dashboard.summary.changes.achievementPercent >= 0 ? '▲' : '▼'} {Math.abs(dashboard.summary.changes.achievementPercent)}%</span></span></div><div className="flex items-center justify-between border-t border-slate-100 pt-2"><span className="text-slate-600">Total Incentive Earned</span><span className="font-extrabold text-[#0D1F3D]">{inr(dashboard.summary.incentiveEarned)}</span></div><div className="flex items-center justify-between border-t border-slate-100 pt-2"><span className="text-slate-600">Disbursed Payouts</span><span className="font-extrabold text-[#0D1F3D]">{inr(dashboard.summary.incentivePaid)}</span></div></div></div>
    </div>

    <SetTargetModal isOpen={isSetTargetModalOpen} onClose={() => setIsSetTargetModalOpen(false)} onSaved={() => { setIsSetTargetModalOpen(false); setReloadToken((value) => value + 1); }} period={selectedMonth} teamOptions={dashboard.options.teams} executiveOptions={dashboard.options.executives} initialTeam={editingTeam} />
  </div>;
}
