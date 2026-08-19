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

const performanceTrendData = [
  { date: '1 May', revenue: 680000, deals: 20 },
  { date: '4 May', revenue: 820000, deals: 24 },
  { date: '7 May', revenue: 950000, deals: 28 },
  { date: '10 May', revenue: 1060000, deals: 32 },
  { date: '13 May', revenue: 1020000, deals: 31 },
  { date: '16 May', revenue: 1140000, deals: 38 },
  { date: '19 May', revenue: 1210000, deals: 44 },
  { date: '20 May', revenue: 1245000, deals: 48 },
];

const sourceRevenueData = [
  { name: 'MagicBricks', pct: '28.5%', amount: 354825, color: '#0D1F3D' },
  { name: 'Meta Ads', pct: '21.0%', amount: 261450, color: '#2563EB' },
  { name: 'Google Ads', pct: '17.6%', amount: 219120, color: '#10B981' },
  { name: 'Justdial', pct: '11.8%', amount: 146910, color: '#F59E0B' },
  { name: 'Referral', pct: '8.2%', amount: 102290, color: '#E20613' },
  { name: '99Acres', pct: '6.4%', amount: 79680, color: '#8B5CF6' },
  { name: 'Others', pct: '6.5%', amount: 80725, color: '#64748B' },
];

const memberPerformance = [
  { id: '1', name: 'Priya Mehta', code: 'TL-1007', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', totalLeads: 246, dealsCreated: 32, dealsWon: 12, revenue: 325000, target: 400000, achv: 81, winRate: 37.5, avgDeal: 27083 },
  { id: '2', name: 'Rohit Singh', code: 'TL-1011', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', totalLeads: 198, dealsCreated: 24, dealsWon: 9, revenue: 210000, target: 300000, achv: 70, winRate: 37.5, avgDeal: 23333 },
  { id: '3', name: 'Karan Patil', code: 'TL-1009', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', totalLeads: 176, dealsCreated: 18, dealsWon: 6, revenue: 160000, target: 250000, achv: 64, winRate: 33.3, avgDeal: 26667 },
  { id: '4', name: 'Neha Deshpande', code: 'TL-1014', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', totalLeads: 154, dealsCreated: 16, dealsWon: 5, revenue: 125000, target: 200000, achv: 62, winRate: 31.3, avgDeal: 25000 },
  { id: '5', name: 'Vishal Shah', code: 'TL-1017', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80', totalLeads: 132, dealsCreated: 14, dealsWon: 4, revenue: 95000, target: 175000, achv: 54, winRate: 28.6, avgDeal: 23750 },
];

export default function TeamPerformancePage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [timeframe, setTimeframe] = useState('This Month');

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Team Performance — Mumbai North Team</h1>
          <p className="text-xs font-medium text-slate-500">
            Analyze sales velocity, revenue trends, conversion funnel drop-offs, and member achievements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/teams/${teamId || 'MN-001'}`)}
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
            MN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#0D1F3D]">Mumbai North Team</h2>
              <span className="rounded-sm bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600">
                Active
              </span>
            </div>
            <p className="text-xs font-medium text-slate-400">Team Leader: <span className="font-bold text-[#0D1F3D]">Sanjay Yadav (TL-1003)</span></p>
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
          value="₹12,45,000"
          change="+24.7%"
          changeType="positive"
          timeframe="vs last month"
          icon={TrendingUp}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Target Achievement"
          value="83.0%"
          subValue="₹12,46,000 / ₹15,00,000"
          icon={Target}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Deals Won"
          value="48"
          change="+26.3%"
          changeType="positive"
          timeframe="vs last month"
          icon={Trophy}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Win Rate"
          value="30.8%"
          change="+4.6%"
          changeType="positive"
          timeframe="vs last month"
          icon={Percent}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Avg Deal Value"
          value="₹25,938"
          change="+7.2%"
          changeType="positive"
          timeframe="vs last month"
          icon={DollarSign}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Conversion Rate"
          value="3.85%"
          change="+0.92%"
          changeType="positive"
          timeframe="vs last month"
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
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-extrabold text-[#0D1F3D]">₹12,45,000</span>
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
              { stage: 'Total Leads', count: '1,248', pct: '100%' },
              { stage: 'Qualified Leads', count: '742', pct: '59.46%' },
              { stage: 'Proposal Sent', count: '92', pct: '7.37%' },
              { stage: 'Negotiation', count: '68', pct: '5.45%' },
              { stage: 'Deals Won', count: '48', pct: '3.85%' },
            ].map((stg) => (
              <div key={stg.stage} className="flex justify-between items-center bg-slate-50/60 p-2 rounded-sm border border-slate-100">
                <span className="font-bold text-slate-700">{stg.stage}</span>
                <span className="font-extrabold text-[#0D1F3D]">{stg.count} <span className="text-slate-400 font-normal">({stg.pct})</span></span>
              </div>
            ))}

            <div className="mt-3 rounded-sm border border-emerald-200 bg-emerald-50/60 p-2.5 text-center text-xs font-bold text-emerald-800">
              Overall Conversion Rate: <span className="font-extrabold text-emerald-600">3.85%</span>
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
              onClick={() => navigate(`/admin/teams/${teamId || 'MN-001'}/members`)}
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
                        <img src={m.avatar} alt={m.name} className="h-7 w-7 rounded-full object-cover border border-slate-200" />
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
                { title: 'Highest Revenue', winner: 'Priya Mehta (TL-1007)', score: '₹3,25,000', badge: '🥇' },
                { title: 'Most Deals Won', winner: 'Priya Mehta (TL-1007)', score: '12 Deals', badge: '🥈' },
                { title: 'Best Win Rate', winner: 'Rohit Singh (TL-1011)', score: '37.5%', badge: '🥉' },
                { title: 'Fastest Conversion', winner: 'Karan Patil (TL-1009)', score: '10.42%', badge: '⚡' },
              ].map((ach, idx) => (
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
                <span>Revenue is up <strong className="text-emerald-600 font-extrabold">24.7%</strong> compared to last month.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>Deals Won increased by <strong className="text-emerald-600 font-extrabold">26.3%</strong> compared to last month.</span>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span>Rohit Singh needs improvement in conversion rate.</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>MagicBricks is the top performing lead source.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
