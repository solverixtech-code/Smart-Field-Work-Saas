import React, { useState } from 'react';
import {
  DollarSign,
  Briefcase,
  TrendingUp,
  Award,
  Download,
  Plus,
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
  BarChart,
  Bar,
} from 'recharts';
import { useAppSelector } from '../../store';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { Button } from '../../components/ui/Button';

const salesTrendData = [
  { date: '14 May', deals: 12, revenue: 140000 },
  { date: '15 May', deals: 15, revenue: 190000 },
  { date: '16 May', deals: 18, revenue: 230000 },
  { date: '17 May', deals: 14, revenue: 180000 },
  { date: '18 May', deals: 21, revenue: 290000 },
  { date: '19 May', deals: 24, revenue: 340000 },
  { date: '20 May', deals: 28, revenue: 410000 },
];

const stageData = [
  { name: 'Lead', value: 22, color: '#0D1F3D' },
  { name: 'Qualification', value: 18, color: '#2563EB' },
  { name: 'Proposal', value: 15, color: '#F59E0B' },
  { name: 'Negotiation', value: 12, color: '#8B5CF6' },
  { name: 'Won', value: 14, color: '#10B981' },
  { name: 'Lost', value: 5, color: '#E20613' },
];

const productRevenueData = [
  { product: 'Pro Plan', revenue: 900000, color: '#0D1F3D' },
  { product: 'Business', revenue: 650000, color: '#E20613' },
  { product: 'Enterprise', revenue: 450000, color: '#2563EB' },
  { product: 'Custom Pack', revenue: 250000, color: '#10B981' },
];

export default function SalesDashboardPage() {
  const [territory, setTerritory] = useState('All');

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Sales Performance Dashboard</h1>
          <p className="text-xs font-medium text-slate-500">
            Track sales revenue, deal stages, win rates, and field executive sales performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker />
          <select
            value={territory}
            onChange={(e) => setTerritory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0D1F3D] shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="All">📍 All Territories</option>
            <option value="Mumbai">📍 Mumbai North</option>
            <option value="Delhi">📍 Delhi NCR</option>
            <option value="Bangalore">📍 Bangalore Tech Corridor</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Exporting Sales Summary...')}
            className="flex items-center gap-2 font-bold"
          >
            <Download className="h-4 w-4 text-[#0D1F3D]" /> Export Summary
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => alert('Opening New Deal Opportunity Form...')}
            className="flex items-center gap-2 font-bold shadow-xs"
          >
            <Plus className="h-4 w-4" /> New Opportunity
          </Button>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Sales Revenue"
          value="₹12,48,320"
          change="+18.6%"
          changeType="positive"
          timeframe="vs last week"
          icon={DollarSign}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Total Deals Closed"
          value="86 Deals"
          change="+12.4%"
          changeType="positive"
          timeframe="vs last week"
          icon={Briefcase}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Average Deal Size"
          value="₹14,520"
          change="+6.8%"
          changeType="positive"
          timeframe="vs last week"
          icon={TrendingUp}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Conversion Win Rate"
          value="68.2%"
          change="+4.3%"
          changeType="positive"
          timeframe="vs last week"
          icon={Award}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
      </div>

      {/* Middle Row: Revenue Trend, Sales by Stage, Revenue by Product */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ChartCard title="Sales Revenue & Deal Volume Trend" subtitle="Daily revenue progression" className="lg:col-span-6">
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-6 text-xs font-semibold">
              <span className="flex items-center gap-2 text-[#0D1F3D]">
                <span className="h-3 w-3 rounded-full bg-[#0D1F3D]" /> Revenue (₹)
              </span>
              <span className="flex items-center gap-2 text-emerald-600">
                <span className="h-3 w-3 rounded-full bg-emerald-600" /> Closed Deals
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGradSfw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D1F3D" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0D1F3D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any, name: any) => [name === 'Revenue' ? `₹${Number(val || 0).toLocaleString()}` : `${val} deals`, name]}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0D1F3D" strokeWidth={3} fillOpacity={1} fill="url(#salesGradSfw)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* Sales by Stage Donut Chart */}
        <ChartCard title="Sales Pipeline by Stage" className="lg:col-span-3">
          <div className="flex flex-col items-center pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any) => [`${val} Deals`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 w-full space-y-1 text-[11px] font-semibold text-slate-600">
              {stageData.map((s) => (
                <div key={s.name} className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-extrabold text-[#0D1F3D]">{s.value} ({((s.value / 86) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Revenue by Product Bar Chart */}
        <ChartCard title="Revenue Tier Split" className="lg:col-span-3">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productRevenueData} margin={{ top: 25, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="product" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(13, 31, 61, 0.04)' }}
                  position={{ y: -15 }}
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                  formatter={(val: any) => [`₹${Number(val || 0).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                  {productRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row: Top Performing Sales Representatives, Recent Deals, Sales Target Gauge */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Performing Sales Reps */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Top Sales Executives</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Rohit Mehta', deals: 24, rev: '₹4,28,000', win: '75.0%', growth: '+22.4%' },
              { rank: 2, name: 'Priya Nair', deals: 22, rev: '₹3,92,000', win: '68.2%', growth: '+18.1%' },
              { rank: 3, name: 'Vikram Singh', deals: 18, rev: '₹2,76,000', win: '61.1%', growth: '+12.3%' },
              { rank: 4, name: 'Neha Kapoor', deals: 14, rev: '₹2,18,000', win: '57.1%', growth: '+9.8%' },
            ].map((rep) => (
              <div key={rep.name} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0D1F3D] text-[10px] font-extrabold text-white">
                    {rep.rank}
                  </span>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">{rep.name}</p>
                    <p className="text-[11px] font-semibold text-slate-400">{rep.deals} deals • {rep.win} win</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[#0D1F3D]">{rep.rev}</p>
                  <p className="font-bold text-emerald-600">{rep.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Deals */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Recent Deals</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { client: 'TechCorp Ltd.', product: 'SFW Pro', value: '₹85,000', stage: 'Won', date: '20 May 2025' },
              { client: 'Global Solutions', product: 'SFW Business', value: '₹1,20,000', stage: 'Proposal', date: '19 May 2025' },
              { client: 'BrightMind Inc.', product: 'SFW Pro', value: '₹62,000', stage: 'Negotiation', date: '18 May 2025' },
              { client: 'FutureTech', product: 'Enterprise', value: '₹2,40,000', stage: 'Qualification', date: '17 May 2025' },
            ].map((deal) => (
              <div key={deal.client} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">{deal.client}</p>
                  <p className="text-[11px] font-semibold text-slate-400">{deal.product} • {deal.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[#0D1F3D]">{deal.value}</p>
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                    deal.stage === 'Won' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}>
                    {deal.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Targets Gauge */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Monthly Target Progress</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">Details</button>
          </div>
          <div className="flex flex-col items-center pt-2">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#E20613" strokeWidth="4" strokeDasharray="78, 100" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold text-[#0D1F3D]">78%</span>
                <span className="text-[10px] font-extrabold text-slate-400">Target Achieved</span>
              </div>
            </div>

            <div className="mt-4 w-full text-center">
              <p className="text-sm font-extrabold text-[#0D1F3D]">₹12,48,320 / ₹16,00,000</p>
              <div className="mt-3 space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-slate-600">
                  <span>Target Completion</span>
                  <span className="font-extrabold text-[#E20613]">78%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#E20613] rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
