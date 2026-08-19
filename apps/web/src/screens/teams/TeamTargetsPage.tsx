import React, { useState } from 'react';
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

const teamTargetItems = [
  { id: '1', metric: 'Revenue', sub: 'Total revenue in ₹', target: '₹15,00,000', achieved: '₹12,45,000', pct: 83, status: 'On Track', statusBadge: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  { id: '2', metric: 'Deals', sub: 'Total deals won', target: '60', achieved: '48', pct: 80, status: 'On Track', statusBadge: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  { id: '3', metric: 'Leads', sub: 'Total leads generated', target: '1,500', achieved: '1,140', pct: 76, status: 'On Track', statusBadge: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  { id: '4', metric: 'Win Rate', sub: 'Winning percentage', target: '30%', achieved: '30.8%', pct: 103, status: '★ Achieved', statusBadge: 'bg-blue-50 text-blue-600 border border-blue-200' },
  { id: '5', metric: 'Avg Deal Value', sub: 'Average deal value in ₹', target: '₹25,000', achieved: '₹23,450', pct: 92, status: 'On Track', statusBadge: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  { id: '6', metric: 'Follow Ups', sub: 'Total follow ups', target: '2,000', achieved: '1,620', pct: 81, status: 'On Track', statusBadge: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  { id: '7', metric: 'Calls', sub: 'Total calls made', target: '3,000', achieved: '2,410', pct: 80, status: 'On Track', statusBadge: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  { id: '8', metric: 'Meetings', sub: 'Total meetings set', target: '120', achieved: '96', pct: 80, status: 'On Track', statusBadge: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
];

const targetOverviewData = [
  { name: 'On Track', value: 6, color: '#10B981' },
  { name: 'Achieved', value: 1, color: '#2563EB' },
  { name: 'At Risk', value: 1, color: '#F59E0B' },
  { name: 'Missed', value: 0, color: '#E20613' },
];

const allTeamsOverview = [
  { team: 'Mumbai North Team', code: 'MN-001', leader: 'Sanjay Yadav', members: 8, revTarget: '₹15,00,000', revAchv: '₹12,45,000', revPct: 83, dealsTarget: 60, dealsAchv: 48, dealsPct: 80, leadsTarget: 1500, leadsAchv: 1140, leadsPct: 76, winTarget: '30%', winAchv: '30.8%', overall: 85 },
  { team: 'Mumbai West Team', code: 'MW-002', leader: 'Priya Mehta', members: 7, revTarget: '₹15,00,000', revAchv: '₹9,80,000', revPct: 65, dealsTarget: 60, dealsAchv: 36, dealsPct: 60, leadsTarget: 1500, leadsAchv: 930, leadsPct: 62, winTarget: '30%', winAchv: '28.1%', overall: 65 },
  { team: 'Navi Mumbai Team', code: 'NM-003', leader: 'Rohit Singh', members: 6, revTarget: '₹15,00,000', revAchv: '₹8,25,000', revPct: 55, dealsTarget: 60, dealsAchv: 28, dealsPct: 47, leadsTarget: 1500, leadsAchv: 720, leadsPct: 48, winTarget: '30%', winAchv: '27.4%', overall: 55 },
  { team: 'Thane Team', code: 'TH-004', leader: 'Karan Patil', members: 7, revTarget: '₹15,00,000', revAchv: '₹9,25,000', revPct: 62, dealsTarget: 60, dealsAchv: 34, dealsPct: 57, leadsTarget: 1500, leadsAchv: 960, leadsPct: 64, winTarget: '30%', winAchv: '32.5%', overall: 62 },
  { team: 'Pune Team', code: 'PU-005', leader: 'Neha Deshpande', members: 4, revTarget: '₹15,00,000', revAchv: '₹8,50,000', revPct: 57, dealsTarget: 60, dealsAchv: 18, dealsPct: 30, leadsTarget: 1500, leadsAchv: 570, leadsPct: 38, winTarget: '30%', winAchv: '25.2%', overall: 57 },
];

export default function TeamTargetsPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const isAllTeams = !teamId || teamId === 'all' || teamId === 'targets';

  const [activeTab, setActiveTab] = useState<'Team Targets' | 'Member Targets'>('Team Targets');
  const [isSetTargetsModalOpen, setIsSetTargetsModalOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<any>(null);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">
            {isAllTeams ? 'All Teams — Target Overview' : 'Team Targets — Mumbai North Team'}
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
              onClick={() => navigate(`/admin/teams/${teamId || 'MN-001'}`)}
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
            onClick={() => setIsSetTargetsModalOpen(true)}
            className="flex items-center gap-2 font-bold shadow-xs"
          >
            <Plus className="h-4 w-4" /> Set Team Targets
          </Button>
        </div>
      </div>

      {/* Meta Banner Card */}
      {!isAllTeams && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 text-lg font-extrabold">
                MN
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-extrabold text-[#0D1F3D]">Mumbai North Team</h2>
                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600">
                    Active
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400">Team Leader: <span className="font-bold text-[#0D1F3D]">Sanjay Yadav (TL-1003)</span></p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-600">
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Department</span>
                <span className="font-extrabold text-[#0D1F3D]">Sales</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Region / Area</span>
                <span className="font-extrabold text-[#0D1F3D]">North Mumbai Region</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Total Members</span>
                <span className="font-extrabold text-[#0D1F3D]">8 Executive Staff</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 block mb-0.5">Team Code</span>
                <span className="font-mono font-extrabold text-[#0D1F3D]">MN-001</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5 Top Target KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Revenue Target"
          value="₹15,00,000"
          subValue="Achieved: ₹12,45,000 (83%)"
          icon={Target}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Deals Target"
          value="60 Deals"
          subValue="Achieved: 48 (80%)"
          icon={Trophy}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Leads Target"
          value="1,500 Leads"
          subValue="Achieved: 1,140 (76%)"
          icon={Users}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Win Rate Target"
          value="30.0%"
          subValue="Achieved: 30.8% (103%)"
          icon={Percent}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Avg Deal Value Target"
          value="₹25,000"
          subValue="Achieved: ₹23,450 (92%)"
          icon={DollarSign}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* View Switch: Single Team Detailed Targets vs All Teams Targets Matrix */}
      {isAllTeams ? (
        /* All Teams Target Performance Table */
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Team Target Performance Matrix</h2>
              <select className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D]">
                <option>This Month (May 2025)</option>
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
                    <tr key={t.code} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-4 py-4 text-slate-400 font-extrabold">{idx + 1}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => navigate(`/admin/teams/${t.code}`)}
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
                        <span className={`inline-block rounded-md px-2.5 py-0.5 text-[11px] font-extrabold ${t.overall >= 75 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>
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
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-8 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Team Target Details</h2>

              <div className="flex items-center gap-2 text-xs font-bold">
                <select className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-[#0D1F3D]">
                  <option>This Month (May 2025)</option>
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
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold ${item.statusBadge}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setEditingMetric(item)}
                          title="Edit target metric"
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors border border-slate-200 shadow-xs"
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
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
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
                        contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                        labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                        itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                        formatter={(val: any) => [`${val} Targets`, 'Count']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-extrabold text-[#0D1F3D]">8</span>
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
                      <span className="font-extrabold text-[#0D1F3D]">{t.value} ({((t.value / 8) * 100).toFixed(1)}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setIsSetTargetsModalOpen(true)}
                  className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
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
                  className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
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
                  className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
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
                  className="w-full flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 hover:bg-slate-100 transition-colors text-xs text-left"
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
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 text-xs">
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
        teamName="Mumbai North Team"
      />

      {/* Edit Single Target Metric Modal */}
      <EditSingleTargetModal
        isOpen={!!editingMetric}
        onClose={() => setEditingMetric(null)}
        metricItem={editingMetric}
      />
    </div>
  );
}
