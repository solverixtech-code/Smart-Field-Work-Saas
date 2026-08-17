import React from 'react';
import {
  DollarSign,
  Briefcase,
  TrendingUp,
  Award,
  Download,
  Plus,
  ChevronDown,
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
  { name: 'Lead', value: 22, color: '#2563EB' },
  { name: 'Qualification', value: 18, color: '#00C2A8' },
  { name: 'Proposal', value: 15, color: '#F59E0B' },
  { name: 'Negotiation', value: 12, color: '#8B5CF6' },
  { name: 'Won', value: 14, color: '#10B981' },
  { name: 'Lost', value: 5, color: '#F43F5E' },
];

const productRevenueData = [
  { product: 'Pro', revenue: 900000, color: '#2563EB' },
  { product: 'Business', revenue: 650000, color: '#00C2A8' },
  { product: 'Enterprise', revenue: 450000, color: '#F59E0B' },
  { product: 'Other', revenue: 250000, color: '#8B5CF6' },
];

export default function SalesDashboardPage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B2E6B]">Sales Dashboard</h1>
          <p className="text-xs font-medium text-slate-500">
            Track your sales performance, pipeline and revenue at a glance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker />
          <div className="relative">
            <select className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-8 text-xs font-bold text-[#0B2E6B] shadow-sm focus:outline-none cursor-pointer">
              <option>📍 Mumbai Territory</option>
              <option>📍 Delhi Territory</option>
              <option>📍 Bangalore Territory</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#0B2E6B] shadow-sm hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="flex items-center gap-1.5 rounded-xl bg-[#0B2E6B] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#0B2E6B]/20 hover:bg-[#123A8F]">
            <Plus className="h-3.5 w-3.5" /> New Opportunity
          </button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Sales Revenue"
          value="₹12,48,320"
          change="18.6%"
          changeType="positive"
          timeframe="from last week"
          icon={DollarSign}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Total Deals"
          value="86"
          change="12.4%"
          changeType="positive"
          timeframe="from last week"
          icon={Briefcase}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Average Deal Size"
          value="₹14,520"
          change="6.8%"
          changeType="positive"
          timeframe="from last week"
          icon={TrendingUp}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Win Rate"
          value="68.2%"
          change="4.3%"
          changeType="positive"
          timeframe="from last week"
          icon={Award}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
      </div>

      {/* Middle Row: Interactive Revenue Trend, Sales by Stage, Revenue by Product */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ChartCard title="Sales Revenue Trend" subtitle="Revenue vs Deals" className="lg:col-span-6">
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-6 text-xs font-semibold">
              <span className="flex items-center gap-2 text-blue-600">
                <span className="h-3 w-3 rounded-full bg-blue-600" /> Revenue
              </span>
              <span className="flex items-center gap-2 text-[#00C2A8]">
                <span className="h-3 w-3 rounded-full bg-[#00C2A8]" /> Deals
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#061838', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#00C2A8', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any, name: any) => [name === 'Revenue' ? `₹${Number(val || 0).toLocaleString()}` : `${val} deals`, name]}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* Sales by Stage Donut Chart */}
        <ChartCard title="Sales by Stage" className="lg:col-span-3">
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
                    contentStyle={{ backgroundColor: '#061838', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#00C2A8', fontWeight: 700, fontSize: '12px' }}
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
                  <span>{s.value} ({((s.value / 86) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Revenue by Product Bar Chart */}
        <ChartCard title="Revenue by Product" className="lg:col-span-3">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productRevenueData} margin={{ top: 25, right: 10, left: 10, bottom: 20 }}>
                <XAxis dataKey="product" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(13, 31, 61, 0.04)' }}
                  position={{ y: -15 }}
                  allowEscapeViewBox={{ x: true, y: true }}
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', padding: '8px 12px' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px', marginBottom: '2px' }}
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

      {/* Bottom Row: Top Performing Sales Team, Recent Deals, Sales Targets */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Performing Sales Team */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B2E6B]">Top Performing Sales Team</h3>
            <button className="text-xs font-semibold text-[#00C2A8] hover:underline">View All</button>
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
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B2E6B] text-[10px] font-bold text-white">
                    {rep.rank}
                  </span>
                  <div>
                    <p className="font-bold text-[#0B2E6B]">{rep.name}</p>
                    <p className="text-[11px] text-slate-400">{rep.deals} deals • {rep.win} win rate</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0B2E6B]">{rep.rev}</p>
                  <p className="font-semibold text-emerald-600">{rep.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Deals */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B2E6B]">Recent Deals</h3>
            <button className="text-xs font-semibold text-[#00C2A8] hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { client: 'TechCorp Ltd.', product: 'VisibloAI Pro', value: '₹85,000', stage: 'Won', date: '20 May 2025' },
              { client: 'Global Solutions', product: 'VisibloAI Business', value: '₹1,20,000', stage: 'Proposal', date: '19 May 2025' },
              { client: 'BrightMind Inc.', product: 'VisibloAI Pro', value: '₹62,000', stage: 'Negotiation', date: '18 May 2025' },
              { client: 'FutureTech', product: 'Enterprise', value: '₹2,40,000', stage: 'Qualification', date: '17 May 2025' },
            ].map((deal) => (
              <div key={deal.client} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
                <div>
                  <p className="font-bold text-[#0B2E6B]">{deal.client}</p>
                  <p className="text-[11px] text-slate-400">{deal.product} • {deal.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0B2E6B]">{deal.value}</p>
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    deal.stage === 'Won' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {deal.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Targets */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B2E6B]">Sales Targets</h3>
            <button className="text-xs font-semibold text-[#00C2A8] hover:underline">View Details</button>
          </div>
          <div className="flex flex-col items-center pt-2">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#00C2A8" strokeWidth="4" strokeDasharray="78, 100" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-extrabold text-[#0B2E6B]">78%</span>
                <span className="text-[10px] font-semibold text-slate-400">Target Achieved</span>
              </div>
            </div>

            <div className="mt-4 w-full text-center">
              <p className="text-sm font-bold text-[#0B2E6B]">₹12,48,320 / ₹16,00,000</p>
              <div className="mt-3 space-y-2 text-xs font-semibold">
                <div className="flex justify-between text-slate-600">
                  <span>Completed</span>
                  <span className="text-[#00C2A8]">78%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#00C2A8] rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
