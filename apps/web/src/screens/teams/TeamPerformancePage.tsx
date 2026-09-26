import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  Target,
  Trophy,
  Percent,
  DollarSign,
  Award,
  AlertCircle,
  CheckCircle2,
  BarChart2,
  PieChart as PieIcon,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { useTeamWorkspace } from './teams.api';

export default function TeamPerformancePage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { data } = useTeamWorkspace(teamId);
  const [timeframe, setTimeframe] = useState('This Month');
  const performanceTrendData = data?.salesTrend ?? [];
  const totalSourceRevenue = (data?.sourceRevenue ?? []).reduce((sum, source) => sum + source.value, 0);
  const sourceRevenueData = (data?.sourceRevenue ?? []).map((source, index) => ({
    name: source.name, amount: source.value, pct: `${totalSourceRevenue ? ((source.value / totalSourceRevenue) * 100).toFixed(1) : '0.0'}%`,
    color: ['#0D1F3D', '#2563EB', '#10B981', '#F59E0B', '#E20613', '#8B5CF6', '#64748B'][index % 7],
  }));
  const memberPerformance = (data?.members ?? []).map((member) => ({
    id: member.id, name: member.name, code: member.employeeCode ?? 'Not assigned', avatar: member.avatarUrl ?? '',
    totalLeads: member.totalLeads, dealsCreated: member.dealsCreated, dealsWon: member.dealsWon,
    revenue: member.revenue, target: member.target, achv: member.achievementPercent,
    winRate: member.winRate, avgDeal: member.averageDeal,
  }));
  const totalDeals = data?.summary.dealsCreated ?? 0;
  const averageDeal = data?.summary.dealsWon ? Math.round(data.summary.revenue / data.summary.dealsWon) : 0;
  const conversionRate = data?.summary.totalLeads ? ((data.summary.dealsWon / data.summary.totalLeads) * 100) : 0;
  const highestRevenue = [...memberPerformance].sort((left, right) => right.revenue - left.revenue)[0];
  const mostDeals = [...memberPerformance].sort((left, right) => right.dealsWon - left.dealsWon)[0];
  const bestWinRate = [...memberPerformance].sort((left, right) => right.winRate - left.winRate)[0];

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Team Performance — {data?.team.name ?? 'Team'}</h1>
          <p className="text-xs font-medium text-slate-500">
            Analyze sales velocity, revenue trends, conversion funnel drop-offs, and member achievements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/teams/${teamId ?? ''}`)}
            className="flex items-center gap-2 font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Team Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting team performance report...')}
            className="flex items-center gap-2 font-bold"
          >
            <Download className="h-4 w-4 text-slate-500" /> Export Report
          </Button>
        </div>
      </div>

      {/* Meta Header Card & Timeframe Selector */}
      <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
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

        {/* Timeframe Selector Pill Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-sm text-xs font-extrabold">
          {['Today', 'This Week', 'This Month', 'This Quarter', 'This Year'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 rounded-sm transition-all cursor-pointer ${
                timeframe === t
                  ? 'bg-white text-[#0D1F3D] shadow-xs'
                  : 'text-slate-500 hover:text-[#0D1F3D]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          title="Revenue Achieved"
          value={`₹${(data?.summary.revenue ?? 0).toLocaleString('en-IN')}`}
          timeframe="Current period"
          icon={TrendingUp}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Target Achievement"
          value={`${data?.summary.achievementPercent ?? 0}%`}
          subValue={`₹${(data?.summary.revenue ?? 0).toLocaleString('en-IN')} / ₹${(data?.summary.revenueTarget ?? 0).toLocaleString('en-IN')}`}
          icon={Target}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Deals Won"
          value={String(data?.summary.dealsWon ?? 0)}
          timeframe="Current period"
          icon={Trophy}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Win Rate"
          value={`${totalDeals ? (((data?.summary.dealsWon ?? 0) / totalDeals) * 100).toFixed(1) : '0.0'}%`}
          timeframe="Current period"
          icon={Percent}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Avg Deal Value"
          value={`₹${averageDeal.toLocaleString('en-IN')}`}
          timeframe="Current period"
          icon={DollarSign}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Conversion Rate"
          value={`${conversionRate.toFixed(2)}%`}
          timeframe="Current period"
          icon={BarChart2}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
      </div>

      {/* Middle Row: Trend Line + Source Donut + Stage Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Performance Trend Dual Line Chart */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Performance Trend</h3>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1 text-blue-600"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Revenue (₹)</span>
              <span className="flex items-center gap-1 text-emerald-600"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Deals Won</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 100000}L`} />
                <YAxis yAxisId="right" orientation="right" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  position={{ y: -15 }}
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="deals" name="Deals Won" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance by Source Donut */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4 space-y-4">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Performance by Source <span className="text-xs text-slate-400 font-normal">(Revenue)</span></h3>
          <div className="flex flex-col items-center">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceRevenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {sourceRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val) => [`₹${Number(val ?? 0).toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-extrabold text-[#0D1F3D]">₹{(data?.summary.revenue ?? 0).toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-bold text-slate-400">Total Revenue</span>
              </div>
            </div>

            <div className="w-full space-y-1 text-[11px] font-semibold text-slate-600 mt-1">
              {sourceRevenueData.map((s) => (
                <div key={s.name} className="flex justify-between">
                  <span className="flex items-center gap-1.5 truncate">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                    <span className="truncate">{s.name}</span>
                  </span>
                  <span className="font-extrabold text-[#0D1F3D]">{s.pct} <span className="text-slate-400 font-normal">(₹{s.amount.toLocaleString()})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance by Stage Funnel */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3 space-y-4">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Performance by Stage</h3>
          <div className="space-y-2 pt-1 text-xs">
            {[
              { stage: 'Total Leads', count: String(data?.summary.totalLeads ?? 0), pct: '100%' },
              { stage: 'Deals Created', count: String(data?.summary.dealsCreated ?? 0), pct: `${data?.summary.totalLeads ? ((data.summary.dealsCreated / data.summary.totalLeads) * 100).toFixed(2) : '0.00'}%` },
              { stage: 'Deals Won', count: String(data?.summary.dealsWon ?? 0), pct: `${conversionRate.toFixed(2)}%` },
            ].map((stg) => (
              <div key={stg.stage} className="flex justify-between items-center bg-slate-50/60 p-2 rounded-sm border border-slate-100">
                <span className="font-bold text-slate-700">{stg.stage}</span>
                <span className="font-extrabold text-[#0D1F3D]">{stg.count} <span className="text-slate-400 font-normal">({stg.pct})</span></span>
              </div>
            ))}

            <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50/60 p-2.5 text-center text-xs font-bold text-emerald-800">
              Overall Conversion Rate: <span className="font-extrabold text-emerald-600">{conversionRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Member Summary Table + Achievements & Insights */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Member Performance Table */}
        <div className="rounded-sm border border-slate-200/80 bg-white shadow-sm lg:col-span-8 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Member Performance Summary</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/teams/${teamId ?? ''}/members`)}
              className="font-bold flex items-center gap-1"
            >
              View All Members <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-600">
                  <th className="px-4 py-3.5">#</th>
                  <th className="px-4 py-3.5">Member</th>
                  <th className="px-4 py-3.5">Total Leads</th>
                  <th className="px-4 py-3.5">Deals Created</th>
                  <th className="px-4 py-3.5">Deals Won</th>
                  <th className="px-4 py-3.5">Revenue (₹)</th>
                  <th className="px-4 py-3.5">Target (₹)</th>
                  <th className="px-4 py-3.5">Achievement</th>
                  <th className="px-4 py-3.5">Win Rate</th>
                  <th className="px-4 py-3.5">Avg Deal Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {memberPerformance.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3.5 text-slate-400 font-extrabold">{idx + 1}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.name} src={m.avatar || undefined} sizeClassName="h-7 w-7" />
                        <div>
                          <p className="font-extrabold text-[#0D1F3D]">{m.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{m.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-[#0D1F3D]">{m.totalLeads}</td>
                    <td className="px-4 py-3.5 font-extrabold text-[#0D1F3D]">{m.dealsCreated}</td>
                    <td className="px-4 py-3.5 font-extrabold text-[#0D1F3D]">{m.dealsWon}</td>
                    <td className="px-4 py-3.5 font-extrabold text-[#0D1F3D]">₹{m.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-600">₹{m.target.toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <span className={`font-bold ${m.achv >= 75 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {m.achv}%
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-blue-600">{m.winRate}%</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">₹{m.avgDeal.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Achievements & Insights */}
        <div className="space-y-6 lg:col-span-4">
          {/* Top Achievements */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Top Achievements</h3>
            <div className="space-y-3 text-xs">
              {[
                highestRevenue && { title: 'Highest Revenue', winner: `${highestRevenue.name} (${highestRevenue.code})`, score: `₹${highestRevenue.revenue.toLocaleString('en-IN')}`, badge: '🥇' },
                mostDeals && { title: 'Most Deals Won', winner: `${mostDeals.name} (${mostDeals.code})`, score: `${mostDeals.dealsWon} Deals`, badge: '🥈' },
                bestWinRate && { title: 'Best Win Rate', winner: `${bestWinRate.name} (${bestWinRate.code})`, score: `${bestWinRate.winRate}%`, badge: '🥉' },
              ].filter((achievement): achievement is { title: string; winner: string; score: string; badge: string } => Boolean(achievement)).map((ach, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{ach.badge}</span>
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">{ach.title}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{ach.winner}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#0D1F3D]">{ach.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Insights & Alerts */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 text-xs">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Insights & Alerts</h3>
            <div className="space-y-2.5 font-medium text-slate-600">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Revenue achievement is <strong className="text-emerald-600 font-extrabold">{data?.summary.achievementPercent ?? 0}%</strong> for the current period.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>The team has won <strong className="text-emerald-600 font-extrabold">{data?.summary.dealsWon ?? 0}</strong> deals in the current period.</span>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>{memberPerformance.length ? `${[...memberPerformance].sort((left, right) => left.winRate - right.winRate)[0].name} currently has the lowest win rate.` : 'No member performance is available yet.'}</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>{sourceRevenueData[0] ? `${sourceRevenueData[0].name} is the top performing lead source.` : 'No won-deal source data is available yet.'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
