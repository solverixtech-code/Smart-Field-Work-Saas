import React from 'react';
import {
  Users,
  CreditCard,
  DollarSign,
  ShoppingBag,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
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
  { name: 'Active', value: 8742, color: '#00C2A8' },
  { name: 'Trial', value: 1248, color: '#2563EB' },
  { name: 'Expired', value: 1023, color: '#F59E0B' },
  { name: 'Cancelled', value: 1511, color: '#F43F5E' },
];

export default function ExecutiveDashboardPage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B2E6B]">Executive Dashboard</h1>
          <p className="text-xs font-medium text-slate-500">
            Welcome back, <span className="font-bold text-[#0B2E6B]">{user?.fullName || 'Amit Sharma'}</span>! Here's what's happening with VisibloAI today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker />
        </div>
      </div>

      {/* 5 Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Customers"
          value="12,524"
          change="18.6%"
          changeType="positive"
          timeframe="from last week"
          icon={Users}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Active Subscriptions"
          value="8,742"
          change="14.3%"
          changeType="positive"
          timeframe="from last week"
          icon={CreditCard}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Monthly Recurring Revenue"
          value="₹48,76,320"
          change="21.7%"
          changeType="positive"
          timeframe="from last month"
          icon={DollarSign}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Total Revenue"
          value="₹1,92,45,620"
          change="16.2%"
          changeType="positive"
          timeframe="from last month"
          icon={ShoppingBag}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="AI Usage This Month"
          value="2.45M"
          change="23.8%"
          changeType="positive"
          timeframe="from last month"
          icon={BarChart3}
          iconBgColor="bg-teal-50"
          iconTextColor="text-[#00C2A8]"
        />
      </div>

      {/* Middle Row: Interactive Revenue Overview, New Customers, Subscription Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Revenue Overview Interactive Area Chart */}
        <ChartCard
          title="Revenue Overview"
          subtitle="MRR vs Total Revenue trend"
          className="lg:col-span-6"
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-6 text-xs font-semibold">
              <span className="flex items-center gap-2 text-blue-600">
                <span className="h-3 w-3 rounded-full bg-blue-600" /> MRR
              </span>
              <span className="flex items-center gap-2 text-[#00C2A8]">
                <span className="h-3 w-3 rounded-full bg-[#00C2A8]" /> Total Revenue
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C2A8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00C2A8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 100000}L`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#061838', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#00C2A8', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any) => [`₹${Number(val || 0).toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="totalRevenue" name="Total Revenue" stroke="#00C2A8" strokeWidth={3} fillOpacity={1} fill="url(#totalGrad)" />
                  <Area type="monotone" dataKey="mrr" name="MRR" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#mrrGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* New Customers Interactive Bar Chart */}
        <ChartCard title="New Customers" subtitle="1,248 New Customers this week" className="lg:col-span-3">
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={newCustomersData}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#061838', borderRadius: '12px', border: 'none' }}
                  labelStyle={{ color: '#00C2A8', fontWeight: 700, fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                  formatter={(val: any) => [`${val || 0} Customers`, 'New']}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {newCustomersData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === newCustomersData.length - 1 ? '#00C2A8' : '#94E2D5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Subscription Status Donut Chart */}
        <ChartCard title="Subscription Status" actionText="View All" className="lg:col-span-3">
          <div className="flex flex-col items-center pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {subscriptionStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#061838', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#00C2A8', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any) => [`${Number(val || 0).toLocaleString()} Subscribers`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 grid w-full grid-cols-2 gap-2 text-[11px] font-semibold">
              {subscriptionStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name} ({((item.value / 12524) * 100).toFixed(1)}%)</span>
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
            <h3 className="text-base font-bold text-[#0B2E6B]">Top Performing Plans</h3>
            <button className="text-xs font-semibold text-[#00C2A8] hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { name: 'Pro Plan', subs: '4,231', mrr: '₹21,15,500', growth: '+22.5%' },
              { name: 'Business Plan', subs: '3,142', mrr: '₹15,71,000', growth: '+18.3%' },
              { name: 'Basic Plan', subs: '2,156', mrr: '₹6,46,800', growth: '+11.7%' },
              { name: 'Enterprise Plan', subs: '1,213', mrr: '₹5,43,020', growth: '+24.8%' },
            ].map((plan) => (
              <div key={plan.name} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-xs">
                <div>
                  <p className="font-bold text-[#0B2E6B]">{plan.name}</p>
                  <p className="text-[11px] text-slate-400">{plan.subs} subscribers</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0B2E6B]">{plan.mrr}</p>
                  <p className="font-semibold text-emerald-600">{plan.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B2E6B]">Recent Payments</h3>
            <button className="text-xs font-semibold text-[#00C2A8] hover:underline">View All</button>
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
                  <p className="font-bold text-[#0B2E6B]">{pmt.company}</p>
                  <p className="text-[11px] text-slate-400">{pmt.inv} • {pmt.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0B2E6B]">{pmt.amount}</p>
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    pmt.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
            <h3 className="text-base font-bold text-[#0B2E6B]">System Health</h3>
            <button className="text-xs font-semibold text-[#00C2A8] hover:underline">View All</button>
          </div>
          <div className="space-y-3 text-xs">
            {[
              { label: 'Server Status', val: 'All Systems Operational', ok: true },
              { label: 'Database', val: 'Healthy', ok: true },
              { label: 'API Services', val: 'Healthy', ok: true },
              { label: 'Queue Jobs', val: '128 Pending', warning: true },
              { label: 'Storage Usage', val: '64% Used', info: true },
              { label: 'AI Service Credits', val: '78% Remaining', info: true },
            ].map((sys) => (
              <div key={sys.label} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span className="font-medium text-slate-700">{sys.label}</span>
                <span className={`font-bold flex items-center gap-1 ${
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
