import React from 'react';
import {
  Users,
  CreditCard,
  DollarSign,
  ShoppingBag,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAppSelector } from '../../store';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { Button } from '../../components/ui/Button';

const revenueData = [
  { date: '14 May', mrr: 2400000, totalRevenue: 3800000 },
  { date: '15 May', mrr: 2800000, totalRevenue: 4700000 },
  { date: '16 May', mrr: 4200000, totalRevenue: 6100000 },
  { date: '17 May', mrr: 4100000, totalRevenue: 6600000 },
  { date: '18 May', mrr: 3100000, totalRevenue: 5800000 },
  { date: '19 May', mrr: 4400000, totalRevenue: 6400000 },
  { date: '20 May', mrr: 5600000, totalRevenue: 7200000 },
];

const newCustomersData = [
  { day: 'Wed', count: 420 },
  { day: 'Thu', count: 580 },
  { day: 'Fri', count: 390 },
  { day: 'Sat', count: 680 },
  { day: 'Sun', count: 490 },
  { day: 'Mon', count: 790 },
  { day: 'Tue', count: 980 },
];

const subscriptionStatusData = [
  { name: 'Active', value: 8742, color: '#0D1F3D' },
  { name: 'Trial', value: 1248, color: '#2563EB' },
  { name: 'Expired', value: 1023, color: '#F59E0B' },
  { name: 'Cancelled', value: 1511, color: '#E20613' },
];

export default function ExecutiveDashboardPage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Executive Command Dashboard</h1>
          <p className="text-xs font-medium text-slate-500">
            Welcome back, <span className="font-extrabold text-[#0D1F3D]">{user?.fullName || 'Amit Sharma'}</span>! Here is your real-time SaaS performance overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker />
        </div>
      </div>

      {/* 5 Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Executives & Staff"
          value="12,524"
          change="+18.6%"
          changeType="positive"
          timeframe="vs last week"
          icon={Users}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Active Field Subscriptions"
          value="8,742"
          change="+14.3%"
          changeType="positive"
          timeframe="vs last week"
          icon={CreditCard}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Monthly Recurring Revenue"
          value="₹48,76,320"
          change="+21.7%"
          changeType="positive"
          timeframe="vs last month"
          icon={DollarSign}
          iconBgColor="bg-[#E20613]/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Total Gross Revenue"
          value="₹1,92,45,620"
          change="+16.2%"
          changeType="positive"
          timeframe="vs last month"
          icon={ShoppingBag}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="AI Field Punch Audits"
          value="2.45M"
          change="+23.8%"
          changeType="positive"
          timeframe="vs last month"
          icon={BarChart3}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
      </div>

      {/* Middle Row: Revenue Overview, New Customers, Subscription Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Revenue Overview Interactive Area Chart */}
        <ChartCard
          title="Revenue Overview & Trajectory"
          subtitle="MRR vs Total Revenue trend"
          className="lg:col-span-6 flex flex-col justify-between"
        >
          <div className="flex flex-col justify-between h-full space-y-4 pt-2">
            <div className="flex items-center gap-6 text-xs font-semibold">
              <span className="flex items-center gap-2 text-blue-600">
                <span className="h-3 w-3 rounded-full bg-blue-600" /> MRR
              </span>
              <span className="flex items-center gap-2 text-[#0D1F3D]">
                <span className="h-3 w-3 rounded-full bg-[#0D1F3D]" /> Total Revenue
              </span>
            </div>

            <div className="h-60 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrGradSfw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="totalGradSfw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D1F3D" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0D1F3D" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 100000}L`} />
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any, name: any) => [`₹${Number(val || 0).toLocaleString()}`, name]}
                  />
                  <Area type="monotone" dataKey="totalRevenue" name="Total Revenue" stroke="#0D1F3D" strokeWidth={3} fillOpacity={1} fill="url(#totalGradSfw)" />
                  <Area type="monotone" dataKey="mrr" name="MRR" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#mrrGradSfw)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* New Customers Interactive Bar Chart */}
        <ChartCard title="Executive Onboarding" subtitle="1,248 Field Staff Onboarded this week" className="lg:col-span-3 flex flex-col justify-between">
          <div className="flex flex-col justify-between h-full pt-2">
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={newCustomersData} margin={{ top: 20, right: 15, left: 15, bottom: 0 }} barCategoryGap="15%" barSize={22}>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(13, 31, 61, 0.04)' }}
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any) => [`${val || 0} Staff`, 'Onboarded']}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {newCustomersData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index === newCustomersData.length - 1 ? '#E20613' : '#0D1F3D'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* Subscription Status Donut Chart */}
        <ChartCard title="Subscription Health" className="lg:col-span-3 flex flex-col justify-between">
          <div className="flex flex-col justify-between h-full pt-2">
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {subscriptionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any) => [`${Number(val || 0).toLocaleString()} Subscribers`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 grid w-full grid-cols-2 gap-2 text-xs font-medium">
              {subscriptionStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-semibold truncate">{item.name} ({((item.value / 12524) * 100).toFixed(1)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Bottom Row: Top Performing Plans, Recent Payments, System Health */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Performing Plans */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Top Performing Tiers</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Enterprise Plan', subs: '4,231', mrr: '₹21,15,500', growth: '+22.5%' },
              { name: 'Business Plan', subs: '3,142', mrr: '₹15,71,000', growth: '+18.3%' },
              { name: 'Field Executive Pack', subs: '2,156', mrr: '₹6,46,800', growth: '+11.7%' },
              { name: 'Starter Plan', subs: '1,213', mrr: '₹5,43,020', growth: '+24.8%' },
            ].map((plan) => (
              <div key={plan.name} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">{plan.name}</p>
                  <p className="text-[11px] font-semibold text-slate-400">{plan.subs} active teams</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[#0D1F3D]">{plan.mrr}</p>
                  <p className="font-bold text-emerald-600">{plan.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Recent Transactions</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { company: 'Visiblo Technologies', inv: 'INV-2025-10528', amount: '₹24,999', status: 'Paid', time: '20 May, 11:32 AM' },
              { company: 'Sharma Enterprises', inv: 'INV-2025-10527', amount: '₹9,999', status: 'Paid', time: '20 May, 10:21 AM' },
              { company: 'RK Digital Agency', inv: 'INV-2025-10526', amount: '₹14,999', status: 'Paid', time: '20 May, 09:48 AM' },
              { company: 'Digital Minds', inv: 'INV-2025-10525', amount: '₹4,999', status: 'Pending', time: '20 May, 09:25 AM' },
            ].map((pmt) => (
              <div key={pmt.inv} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">{pmt.company}</p>
                  <p className="text-[11px] font-semibold text-slate-400">{pmt.inv} • {pmt.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[#0D1F3D]">{pmt.amount}</p>
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                    pmt.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {pmt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">System Infrastructure Health</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">Details</button>
          </div>
          <div className="space-y-3 text-xs">
            {[
              { label: 'Core API Gateway', val: 'All Systems Operational', ok: true },
              { label: 'PostgreSQL & Prisma DB', val: 'Healthy (0.4ms)', ok: true },
              { label: 'GPS Tracking Stream', val: 'Active (24,102 connected)', ok: true },
              { label: 'Async Queue Jobs', val: '128 Jobs Processing', warning: true },
              { label: 'AWS S3 Asset Storage', val: '64% Allocated', info: true },
              { label: 'Mobile Sync Engine', val: '99.98% Uptime', info: true },
            ].map((sys) => (
              <div key={sys.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span className="font-semibold text-slate-700">{sys.label}</span>
                <span className={`font-extrabold flex items-center gap-1 ${
                  sys.ok ? 'text-emerald-600' : sys.warning ? 'text-amber-600' : 'text-blue-600'
                }`}>
                  {sys.ok && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {sys.warning && <AlertTriangle className="h-3.5 w-3.5" />}
                  {sys.val}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
