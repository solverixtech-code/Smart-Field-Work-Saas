import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Plus,
  Target,
  Trophy,
  Users,
  Percent,
  DollarSign,
  Download,
  Edit,
  Copy,
  Upload,
  History,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { SetTeamTargetsModal } from '../../components/teams/SetTeamTargetsModal';
import { EditSingleTargetModal } from '../../components/teams/EditSingleTargetModal';
import { api, extractErrorMessage } from '../../common/api';
import { TeamTarget, useTeamWorkspace } from './teams.api';

interface TargetItemView {
  id: string; backendMetric: string; metric: string; sub: string; target: string; targetValue: number;
  achieved: string; pct: number; status: string; statusBadge: string;
}

interface TeamTargetOverviewRow {
  id: string; name: string; code: string; leaderName: string; memberCount: number;
  revenueTarget: number; revenueAchieved: number; revenuePercent: number;
  dealsTarget: number; dealsAchieved: number; dealsPercent: number;
  leadsTarget: number; leadsAchieved: number; leadsPercent: number;
  winTarget: number; winAchieved: number; overallPercent: number;
}

export default function TeamTargetsPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const isAllTeams = !teamId || teamId === 'all' || teamId === 'targets';
  const { data, refresh } = useTeamWorkspace(isAllTeams ? undefined : teamId);

  const [activeTab, setActiveTab] = useState<'Team Targets' | 'Member Targets'>('Team Targets');
  const [isSetTargetsModalOpen, setIsSetTargetsModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<TargetItemView | null>(null);
  const [allTeamsOverview, setAllTeamsOverview] = useState<Array<{
    id: string; team: string; code: string; leader: string; members: number; revTarget: string; revAchv: string;
    revPct: number; dealsTarget: number; dealsAchv: number; dealsPct: number; leadsTarget: number; leadsAchv: number;
    leadsPct: number; winTarget: string; winAchv: string; overall: number;
  }>>([]);

  useEffect(() => {
    if (!isAllTeams) return;
    const now = new Date();
    const period = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit' }).format(now);
    api.get<{ teams: TeamTargetOverviewRow[] }>('/tenant/crm/teams/targets-overview', { params: { period } })
      .then(({ data: response }) => setAllTeamsOverview(response.teams.map((team) => ({
        id: team.id, team: team.name, code: team.code, leader: team.leaderName, members: team.memberCount,
        revTarget: `₹${team.revenueTarget.toLocaleString('en-IN')}`, revAchv: `₹${team.revenueAchieved.toLocaleString('en-IN')}`, revPct: team.revenuePercent,
        dealsTarget: team.dealsTarget, dealsAchv: team.dealsAchieved, dealsPct: team.dealsPercent,
        leadsTarget: team.leadsTarget, leadsAchv: team.leadsAchieved, leadsPct: team.leadsPercent,
        winTarget: `${team.winTarget}%`, winAchv: `${team.winAchieved}%`, overall: team.overallPercent,
      }))))
      .catch((error: unknown) => toast.error(extractErrorMessage(error, 'Unable to load team targets.')));
  }, [isAllTeams]);

  const metricMeta: Record<string, { label: string; sub: string; kind: 'currency' | 'percent' | 'number' }> = {
    sales_amount: { label: 'Revenue', sub: 'Total revenue in ₹', kind: 'currency' },
    deals_count: { label: 'Deals', sub: 'Total deals won', kind: 'number' },
    leads_count: { label: 'Leads', sub: 'Total leads generated', kind: 'number' },
    win_rate: { label: 'Win Rate', sub: 'Winning percentage', kind: 'percent' },
    average_deal_value: { label: 'Avg Deal Value', sub: 'Average deal value in ₹', kind: 'currency' },
    calls_count: { label: 'Calls', sub: 'Total calls made', kind: 'number' },
    meetings_count: { label: 'Meetings', sub: 'Total meetings completed', kind: 'number' },
    visits_count: { label: 'Visits', sub: 'Total visits completed', kind: 'number' },
    demos_count: { label: 'Demos', sub: 'Total demos completed', kind: 'number' },
  };
  const formatMetric = (value: number, kind: 'currency' | 'percent' | 'number') => kind === 'currency' ? `₹${value.toLocaleString('en-IN')}` : kind === 'percent' ? `${value}%` : value.toLocaleString('en-IN');
  const teamTargetItems: TargetItemView[] = (data?.targets ?? []).map((target: TeamTarget) => {
    const meta = metricMeta[target.metric] ?? { label: target.title, sub: target.metric, kind: 'number' as const };
    return {
      id: target.id, backendMetric: target.metric, metric: meta.label, sub: meta.sub,
      target: formatMetric(target.targetValue, meta.kind), targetValue: target.targetValue,
      achieved: formatMetric(target.achieved, meta.kind), pct: target.percent, status: target.status,
      statusBadge: target.status === 'Achieved' ? 'bg-blue-50 text-blue-600 border border-blue-200' : target.status === 'On Track' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200',
    };
  });
  const targetOverviewData = [
    { name: 'On Track', value: teamTargetItems.filter((target) => target.status === 'On Track').length, color: '#10B981' },
    { name: 'Achieved', value: teamTargetItems.filter((target) => target.status === 'Achieved').length, color: '#2563EB' },
    { name: 'Behind', value: teamTargetItems.filter((target) => target.status === 'Behind').length, color: '#F59E0B' },
  ];
  const targetByMetric = (metric: string) => data?.targets.find((target) => target.metric === metric);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">
            {isAllTeams ? 'All Teams — Target Overview' : `Team Targets — ${data?.team.name ?? 'Team'}`}
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Configure monthly targets, track real-time target fulfillment, and analyze team quotas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isAllTeams && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/teams/${teamId ?? ''}`)}
              className="flex items-center gap-2 font-bold"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Team Details
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Downloading Target Report...')}
            className="flex items-center gap-2 font-bold"
          >
            <Download className="h-4 w-4 text-slate-500" /> Download Report
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => isAllTeams ? toast.info('Open a team to set its targets.') : setIsSetTargetsModalOpen(true)}
            className="flex items-center gap-2 font-bold shadow-xs"
          >
            <Plus className="h-4 w-4" /> Set Team Targets
          </Button>
        </div>
      </div>

      {/* Meta Banner Card */}
      {!isAllTeams && (
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-blue-100 text-blue-700 text-lg font-extrabold">
                {(data?.team.name ?? 'Team').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-[#0D1F3D]">{data?.team.name ?? 'Loading team...'}</h2>
                  <span className="rounded-sm bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600">
                    {data?.team.status ?? 'Active'}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400">Team Leader: <span className="font-bold text-[#0D1F3D]">{data?.leader ? `${data.leader.name} (${data.leader.employeeCode ?? 'No code'})` : 'Not assigned'}</span></p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Department</span>
                <span className="font-extrabold text-[#0D1F3D]">{data?.team.department ?? '—'}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Region / Area</span>
                <span className="font-extrabold text-[#0D1F3D]">{data?.team.region ?? 'Not assigned'}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Total Members</span>
                <span className="font-extrabold text-[#0D1F3D]">{data?.summary.totalMembers ?? 0} Executive Staff</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Team Code</span>
                <span className="font-mono font-extrabold text-[#0D1F3D]">{data?.team.code ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5 Top Target KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Revenue Target"
          value={`₹${(targetByMetric('sales_amount')?.targetValue ?? 0).toLocaleString('en-IN')}`}
          subValue={`Achieved: ₹${(targetByMetric('sales_amount')?.achieved ?? 0).toLocaleString('en-IN')} (${targetByMetric('sales_amount')?.percent ?? 0}%)`}
          icon={Target}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Deals Target"
          value={`${targetByMetric('deals_count')?.targetValue ?? 0} Deals`}
          subValue={`Achieved: ${targetByMetric('deals_count')?.achieved ?? 0} (${targetByMetric('deals_count')?.percent ?? 0}%)`}
          icon={Trophy}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Leads Target"
          value={`${(targetByMetric('leads_count')?.targetValue ?? 0).toLocaleString('en-IN')} Leads`}
          subValue={`Achieved: ${(targetByMetric('leads_count')?.achieved ?? 0).toLocaleString('en-IN')} (${targetByMetric('leads_count')?.percent ?? 0}%)`}
          icon={Users}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Win Rate Target"
          value={`${targetByMetric('win_rate')?.targetValue ?? 0}%`}
          subValue={`Achieved: ${targetByMetric('win_rate')?.achieved ?? 0}% (${targetByMetric('win_rate')?.percent ?? 0}%)`}
          icon={Percent}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Avg Deal Value Target"
          value={`₹${(targetByMetric('average_deal_value')?.targetValue ?? 0).toLocaleString('en-IN')}`}
          subValue={`Achieved: ₹${(targetByMetric('average_deal_value')?.achieved ?? 0).toLocaleString('en-IN')} (${targetByMetric('average_deal_value')?.percent ?? 0}%)`}
          icon={DollarSign}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* View Switch: Single Team Detailed Targets vs All Teams Targets Matrix */}
      {isAllTeams ? (
        /* All Teams Target Performance Table */
        <div className="space-y-6">
          <div className="rounded-sm border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Team Target Performance Matrix</h2>
              <select className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D]">
                <option>This Month ({new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-600">
                    <th className="px-4 py-3.5">#</th>
                    <th className="px-4 py-3.5">Team / Manager</th>
                    <th className="px-4 py-3.5">Team Leader</th>
                    <th className="px-4 py-3.5">Revenue (₹) Target / Achv / %</th>
                    <th className="px-4 py-3.5">Deals Target / Achv / %</th>
                    <th className="px-4 py-3.5">Leads Target / Achv / %</th>
                    <th className="px-4 py-3.5">Win Rate Target / Achv</th>
                    <th className="px-4 py-3.5 text-right">Overall Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {allTeamsOverview.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-4 text-slate-400 font-extrabold">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => navigate(`/admin/teams/${t.id}`)}
                          className="font-extrabold text-[#0D1F3D] hover:text-[#E20613] hover:underline block text-left"
                        >
                          {t.team}
                        </button>
                        <span className="text-[10px] font-mono text-slate-400">{t.code} • {t.members} Members</span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-700">{t.leader}</td>
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#0D1F3D]">{t.revTarget} / <span className="text-emerald-600">{t.revAchv}</span></p>
                        <span className="text-[10px] font-extrabold text-emerald-600">{t.revPct}%</span>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-700">
                        {t.dealsTarget} / <span className="font-extrabold text-[#0D1F3D]">{t.dealsAchv}</span> ({t.dealsPct}%)
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-700">
                        {t.leadsTarget} / <span className="font-extrabold text-[#0D1F3D]">{t.leadsAchv}</span> ({t.leadsPct}%)
                      </td>
                      <td className="px-4 py-4 font-bold text-blue-600">
                        {t.winTarget} / {t.winAchv}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className={`inline-block rounded-sm px-2.5 py-0.5 text-[11px] font-extrabold ${t.overall >= 75 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
                          {t.overall}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Single Team Targets Breakdown */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Team Targets Details Table */}
          <div className="rounded-sm border border-slate-200/80 bg-white shadow-sm lg:col-span-8 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Team Target Details</h2>

              <div className="flex items-center gap-2 text-xs font-bold">
                <select className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs text-[#0D1F3D]">
                  <option>This Month ({data?.period ?? 'Current'})</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-600">
                    <th className="px-4 py-3.5">#</th>
                    <th className="px-4 py-3.5">Target Metric</th>
                    <th className="px-4 py-3.5">Target (This Month)</th>
                    <th className="px-4 py-3.5">Achieved</th>
                    <th className="px-4 py-3.5">Progress</th>
                    <th className="px-4 py-3.5">% Achieved</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {teamTargetItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-4 text-slate-400 font-extrabold">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <p className="font-extrabold text-[#0D1F3D]">{item.metric}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.sub}</p>
                      </td>
                      <td className="px-4 py-4 font-bold text-slate-700">{item.target}</td>
                      <td className="px-4 py-4 font-extrabold text-[#0D1F3D]">{item.achieved}</td>
                      <td className="px-4 py-4">
                        <div className="w-24">
                          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${item.pct >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                              style={{ width: `${Math.min(item.pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`font-bold ${item.pct >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {item.pct}%
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-sm px-2 py-0.5 text-[10px] font-extrabold ${item.statusBadge}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setEditingMetric(item)}
                          title="Edit target metric"
                          className="p-1.5 rounded-sm text-slate-500 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors border border-slate-200 shadow-xs"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Donut + Quick Actions + Target Rules */}
          <div className="space-y-6 lg:col-span-4">
            {/* Target Overview Donut Chart */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Target Overview</h3>
              <div className="flex flex-col items-center">
                <div className="h-44 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={targetOverviewData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {targetOverviewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        position={{ y: -15 }}
                        wrapperStyle={{ zIndex: 100 }}
                        contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                        labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                        itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                        formatter={(val) => [`${val ?? 0} Targets`, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-extrabold text-[#0D1F3D]">{teamTargetItems.length}</span>
                    <span className="text-[10px] font-bold text-slate-400">Total Targets</span>
                  </div>
                </div>

                <div className="mt-2 w-full space-y-1.5 text-[11px] font-semibold text-slate-600">
                  {targetOverviewData.map((t) => (
                    <div key={t.name} className="flex justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: t.color }} />
                        {t.name}
                      </span>
                      <span className="font-extrabold text-[#0D1F3D]">{t.value} ({(teamTargetItems.length ? (t.value / teamTargetItems.length) * 100 : 0).toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setIsSetTargetsModalOpen(true)}
                  className="w-full flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Target className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Set / Update Team Targets</p>
                      <p className="text-[10px] text-slate-400 font-medium">Create or update monthly targets</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => toast.success('Targets copied from last month successfully!')}
                  className="w-full flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Copy className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Copy Targets from Last Month</p>
                      <p className="text-[10px] text-slate-400 font-medium">Use previous month targets as base</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => toast.info('Select Excel file to import targets...')}
                  className="w-full flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Upload className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Import Targets</p>
                      <p className="text-[10px] text-slate-400 font-medium">Bulk import targets via Excel</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => toast.info('Loading target history...')}
                  className="w-full flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <History className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">View Target History</p>
                      <p className="text-[10px] text-slate-400 font-medium">See previous targets and performance</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Target Rules Card */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 text-xs">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Target Rules</h3>
              <div className="space-y-2.5 font-medium text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Targets are set monthly and reset on 1st of every month.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Progress is calculated in real-time.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Win Rate and Avg Deal Value targets are percentage and currency based.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Only Admin & Sales Manager can set team targets.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Set Team Targets Modal */}
      <SetTeamTargetsModal
        isOpen={isSetTargetsModalOpen}
        onClose={() => setIsSetTargetsModalOpen(false)}
        teamId={isAllTeams ? undefined : teamId}
        period={data?.period}
        teamName={data?.team.name ?? 'Team'}
        onTargetsSaved={refresh}
      />

      {/* Edit Single Target Metric Modal */}
      <EditSingleTargetModal
        isOpen={!!editingMetric}
        onClose={() => setEditingMetric(null)}
        metricItem={editingMetric}
        teamId={teamId}
        period={data?.period}
        onTargetUpdated={refresh}
      />
    </div>
  );
}
