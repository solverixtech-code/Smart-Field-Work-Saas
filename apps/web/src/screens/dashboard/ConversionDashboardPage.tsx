import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Users,
  CheckSquare,
  Send,
  Trophy,
  Percent,
  Clock,
  Filter,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAppSelector } from '../../store';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { Button } from '../../components/ui/Button';

const conversionTrendData = [
  { date: '14 May', rate: 9.4, won: 24 },
  { date: '15 May', rate: 10.2, won: 29 },
  { date: '16 May', rate: 11.1, won: 35 },
  { date: '17 May', rate: 10.8, won: 32 },
  { date: '18 May', rate: 11.5, won: 41 },
  { date: '19 May', rate: 12.1, won: 48 },
  { date: '20 May', rate: 12.8, won: 52 },
];

const sourceData = [
  { name: 'Direct Field Contact', value: 776, color: '#0D1F3D' },
  { name: 'Web Campaign', value: 542, color: '#2563EB' },
  { name: 'Partner Referral', value: 458, color: '#F59E0B' },
  { name: 'Inbound Leads', value: 286, color: '#10B981' },
];

export default function ConversionDashboardPage() {
  const [selectedTeam, setSelectedTeam] = useState('All');

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Conversion Funnel & Analytics</h1>
          <p className="text-xs font-medium text-slate-500">
            Track lead velocity, conversion progression, deal win rates, and stage drop-offs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker />
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0D1F3D] shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="All">👥 All Field Teams</option>
            <option value="North">👥 North Field Team</option>
            <option value="West">👥 West Regional Team</option>
            <option value="South">👥 South Tech Team</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Filtering Conversion Metrics...')}
            className="flex items-center gap-2 font-bold"
          >
            <Filter className="h-4 w-4 text-[#0D1F3D]" /> Filter Funnel
          </Button>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          title="Total Leads"
          value="2,418"
          change="+18.6%"
          changeType="positive"
          timeframe="vs last month"
          icon={Users}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Qualified Leads"
          value="1,326"
          change="+16.3%"
          changeType="positive"
          timeframe="vs last month"
          icon={CheckSquare}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Proposals Sent"
          value="842"
          change="+14.8%"
          changeType="positive"
          timeframe="vs last month"
          icon={Send}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Won Deals"
          value="286"
          change="+20.4%"
          changeType="positive"
          timeframe="vs last month"
          icon={Trophy}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Conversion Rate"
          value="11.83%"
          change="+2.15%"
          changeType="positive"
          timeframe="vs last month"
          icon={Percent}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Avg. Sales Cycle"
          value="17.6 Days"
          change="-1.8 days"
          changeType="positive"
          timeframe="vs last month"
          icon={Clock}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Middle Row: Conversion Funnel, Conversion Trend, Conversion by Source */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Conversion Funnel */}
        <ChartCard title="Stage Conversion Funnel" className="lg:col-span-5">
          <div className="space-y-3 pt-2">
            {[
              { stage: 'Total Leads Acquired', count: '2,418', pct: '100%', drop: '-', color: 'bg-[#0D1F3D]' },
              { stage: 'Qualified Leads', count: '1,326', pct: '54.85%', drop: '45.15%', color: 'bg-blue-600' },
              { stage: 'Proposals Sent', count: '842', pct: '34.83%', drop: '20.02%', color: 'bg-amber-500' },
              { stage: 'In Negotiation', count: '452', pct: '18.70%', drop: '16.13%', color: 'bg-purple-500' },
              { stage: 'Closed & Won Deals', count: '286', pct: '11.83%', drop: '6.87%', color: 'bg-[#E20613]' },
            ].map((f) => (
              <div key={f.stage} className="space-y-1 text-xs">
                <div className="flex justify-between font-extrabold text-[#0D1F3D]">
                  <span>{f.stage}</span>
                  <span>{f.count} ({f.pct})</span>
                </div>
                <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${f.color} rounded-full transition-all duration-300`} style={{ width: f.pct }} />
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-sm border border-slate-100 bg-slate-50/60 p-3 text-center text-xs font-semibold text-slate-700">
              Overall Funnel Conversion Rate: <span className="font-extrabold text-[#E20613]">11.83%</span> (+2.15% vs last month)
            </div>
          </div>
        </ChartCard>

        {/* Conversion Trend Interactive Line Chart */}
        <ChartCard title="Conversion Rate Trend" subtitle="Daily conversion percentage (%)" className="lg:col-span-4">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={conversionTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="convGradSfw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E20613" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E20613" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  position={{ y: -15 }}
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                  formatter={(val: any, name: any) => [name === 'Conversion Rate' ? `${val}%` : `${val} deals`, name]}
                />
                <Area type="monotone" dataKey="rate" name="Conversion Rate" stroke="#E20613" strokeWidth={3} fillOpacity={1} fill="url(#convGradSfw)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Conversion by Source Donut Chart */}
        <ChartCard title="Lead Channel Distribution" className="lg:col-span-3">
          <div className="flex flex-col items-center pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any) => [`${val} Leads`, 'Leads']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 w-full space-y-1 text-[11px] font-semibold text-slate-600">
              {sourceData.map((s) => (
                <div key={s.name} className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-extrabold text-[#0D1F3D]">{s.value} ({((s.value / 2418) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row: Team Performance, Stage Analysis, Top Sales Reps */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Conversion by Sales Team */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">Conversion by Field Team</h3>
          <div className="space-y-3 text-xs font-semibold">
            {[
              { team: 'North Field Team', leads: 812, won: 118, rate: '14.53%' },
              { team: 'West Regional Team', leads: 654, won: 82, rate: '12.54%' },
              { team: 'South Tech Team', leads: 512, won: 54, rate: '10.55%' },
              { team: 'East Territory Team', leads: 440, won: 32, rate: '7.27%' },
            ].map((t) => (
              <div key={t.team} className="flex justify-between items-center rounded-sm border border-slate-100 bg-slate-50/60 p-3">
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">{t.team}</p>
                  <p className="text-[11px] text-slate-400">{t.won} won out of {t.leads} leads</p>
                </div>
                <span className="font-extrabold text-emerald-600">{t.rate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Conversion Analysis */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">Stage Transition Velocity</h3>
          <div className="space-y-3 text-xs font-semibold">
            {[
              { stage: 'Lead → Qualified', rate: '54.85%', target: '50%', status: 'Above Target' },
              { stage: 'Qualified → Proposal', rate: '63.50%', target: '60%', status: 'Above Target' },
              { stage: 'Proposal → Negotiation', rate: '53.68%', target: '50%', status: 'Above Target' },
              { stage: 'Negotiation → Won', rate: '63.27%', target: '60%', status: 'Above Target' },
            ].map((s) => (
              <div key={s.stage} className="flex justify-between items-center rounded-sm border border-slate-100 bg-slate-50/60 p-3">
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">{s.stage}</p>
                  <p className="text-[11px] text-slate-400">Benchmark: {s.target}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[#0D1F3D]">{s.rate}</p>
                  <span className="inline-block rounded-sm bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-600">
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Sales Reps */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Top Field Converters</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3 text-xs font-semibold">
            {[
              { name: 'Rahul Verma', won: 48, rate: '16.45%' },
              { name: 'Priya Mehta', won: 36, rate: '14.81%' },
              { name: 'Sanjay Yadav', won: 28, rate: '13.59%' },
              { name: 'Kavita Singh', won: 22, rate: '12.22%' },
            ].map((rep) => (
              <div key={rep.name} className="flex justify-between items-center rounded-sm border border-slate-100 bg-slate-50/60 p-3">
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">{rep.name}</p>
                  <p className="text-[11px] text-slate-400">{rep.won} won deals</p>
                </div>
                <span className="font-extrabold text-[#E20613]">{rep.rate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
