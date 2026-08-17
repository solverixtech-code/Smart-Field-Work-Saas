import React from 'react';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  RefreshCw,
  PieChart as PieIcon,
  Download,
  ChevronDown,
  CheckCircle2,
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

const revenueTrendData = [
  { date: '14 May', total: 620000, net: 580000, collections: 540000, refunds: 40000 },
  { date: '15 May', total: 710000, net: 660000, collections: 610000, refunds: 50000 },
  { date: '16 May', total: 840000, net: 780000, collections: 730000, refunds: 60000 },
  { date: '17 May', total: 790000, net: 740000, collections: 690000, refunds: 50000 },
  { date: '18 May', total: 920000, net: 860000, collections: 810000, refunds: 60000 },
  { date: '19 May', total: 980000, net: 910000, collections: 850000, refunds: 70000 },
  { date: '20 May', total: 1050000, net: 980000, collections: 920000, refunds: 70000 },
];

const revenueSourceData = [
  { name: 'Subscriptions', value: 68.2, color: '#2563EB' },
  { name: 'One-time', value: 18.7, color: '#00C2A8' },
  { name: 'Upgrades', value: 7.6, color: '#F59E0B' },
  { name: 'Add-ons', value: 5.5, color: '#8B5CF6' },
];

export default function RevenueDashboardPage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B2E6B]">Revenue Dashboard</h1>
          <p className="text-xs font-medium text-slate-500">
            Overview of all revenue, collections and financial performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker />
          <div className="relative">
            <select className="appearance-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 pr-8 text-xs font-bold text-[#0B2E6B] shadow-sm focus:outline-none cursor-pointer">
              <option>💳 All Payment Methods</option>
              <option>💳 Razorpay</option>
              <option>💳 Stripe</option>
              <option>💳 Bank Transfer</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#0B2E6B] shadow-sm hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Download Report
          </button>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          title="Total Revenue"
          value="₹48,76,320"
          change="21.7%"
          changeType="positive"
          timeframe="vs last month"
          icon={DollarSign}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Net Revenue"
          value="₹44,12,890"
          change="19.3%"
          changeType="positive"
          timeframe="vs last month"
          icon={CreditCard}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="MRR"
          value="₹12,45,678"
          change="18.6%"
          changeType="positive"
          timeframe="vs last month"
          icon={TrendingUp}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="ARR"
          value="₹1,49,48,136"
          change="22.5%"
          changeType="positive"
          timeframe="vs last month"
          icon={PieIcon}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Total Collections"
          value="₹46,05,110"
          change="20.2%"
          changeType="positive"
          timeframe="vs last month"
          icon={CheckCircle2}
          iconBgColor="bg-teal-50"
          iconTextColor="text-[#00C2A8]"
        />
        <KpiCard
          title="Refunds"
          value="₹1,92,450"
          change="-8.4%"
          changeType="positive"
          timeframe="vs last month"
          icon={RefreshCw}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Middle Row: Revenue Overview, Revenue by Source, Revenue Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ChartCard title="Revenue Overview" subtitle="Revenue trends & breakdown" className="lg:col-span-6">
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-blue-600"><span className="h-3 w-3 rounded-full bg-blue-600" /> Total</span>
              <span className="flex items-center gap-1.5 text-emerald-600"><span className="h-3 w-3 rounded-full bg-emerald-600" /> Net</span>
              <span className="flex items-center gap-1.5 text-purple-600"><span className="h-3 w-3 rounded-full bg-purple-600" /> Collections</span>
              <span className="flex items-center gap-1.5 text-rose-500"><span className="h-3 w-3 rounded-full bg-rose-500" /> Refunds</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="totalRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 100000}L`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#061838', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#00C2A8', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any, name: any) => [`₹${Number(val || 0).toLocaleString()}`, name]}
                  />
                  <Area type="monotone" dataKey="total" name="Total Revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#totalRevGrad)" />
                  <Area type="monotone" dataKey="net" name="Net Revenue" stroke="#10B981" strokeWidth={2} fillOpacity={0} />
                  <Area type="monotone" dataKey="collections" name="Collections" stroke="#8B5CF6" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* Revenue by Source Donut Chart */}
        <ChartCard title="Revenue by Source" className="lg:col-span-3">
          <div className="flex flex-col items-center pt-2">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {revenueSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#061838', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#00C2A8', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any) => [`${val}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 w-full space-y-1 text-[11px] font-semibold text-slate-600">
              {revenueSourceData.map((s) => (
                <div key={s.name} className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span>{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Revenue Summary */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="mb-4 text-base font-bold text-[#0B2E6B]">Revenue Summary</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between font-medium text-slate-600"><span>Gross Revenue</span><span className="font-bold text-[#0B2E6B]">₹50,68,770</span></div>
            <div className="flex justify-between font-medium text-slate-600"><span>Discounts</span><span className="font-bold text-rose-600">-₹2,25,980</span></div>
            <div className="flex justify-between font-medium text-slate-600"><span>Taxes (GST)</span><span className="font-bold text-slate-700">₹6,34,120</span></div>
            <div className="flex justify-between font-medium text-slate-600"><span>Refunds</span><span className="font-bold text-rose-600">-₹1,92,450</span></div>
            <div className="border-t pt-2 flex justify-between font-bold text-[#0B2E6B] text-sm"><span>Net Revenue</span><span className="text-emerald-600">₹44,12,890</span></div>
            <div className="pt-2 text-[11px] font-medium text-slate-400 space-y-1">
              <div className="flex justify-between"><span>Effective Tax Rate</span><span>12.51%</span></div>
              <div className="flex justify-between"><span>Refund Rate</span><span>3.95%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Revenue by Plan, Payment Methods, Recent Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Revenue by Plan */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <h3 className="mb-4 text-base font-bold text-[#0B2E6B]">Revenue by Plan</h3>
          <div className="space-y-4 text-xs font-semibold">
            {[
              { plan: 'Pro Plan', rev: '₹21,15,500', subs: '4,231', share: 43.3, color: 'bg-blue-600' },
              { plan: 'Business Plan', rev: '₹15,71,000', subs: '3,142', share: 32.2, color: 'bg-teal-500' },
              { plan: 'Basic Plan', rev: '₹6,46,800', subs: '2,156', share: 13.2, color: 'bg-purple-500' },
              { plan: 'Enterprise Plan', rev: '₹5,43,020', subs: '1,213', share: 11.1, color: 'bg-amber-500' },
            ].map((p) => (
              <div key={p.plan} className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#0B2E6B] font-bold">{p.plan}</span>
                  <span>{p.rev} ({p.share}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${p.color} rounded-full`} style={{ width: `${p.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <h3 className="mb-4 text-base font-bold text-[#0B2E6B]">Revenue by Payment Method</h3>
          <div className="space-y-3 text-xs font-semibold text-slate-700">
            {[
              { method: 'Razorpay', pct: '61.3%', val: '₹29,93,210' },
              { method: 'Stripe', pct: '22.8%', val: '₹11,12,450' },
              { method: 'PayPal', pct: '8.7%', val: '₹4,23,800' },
              { method: 'Bank Transfer', pct: '5.2%', val: '₹2,54,860' },
            ].map((m) => (
              <div key={m.method} className="flex justify-between items-center rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span>{m.method}</span>
                <span className="font-bold text-[#0B2E6B]">{m.val} ({m.pct})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B2E6B]">Recent Transactions</h3>
            <button className="text-xs font-semibold text-[#00C2A8] hover:underline">View All</button>
          </div>
          <div className="space-y-3 text-xs">
            {[
              { client: 'VisibloPro Plan', org: 'Sharma Enterprises', amount: '₹24,999', status: 'Paid' },
              { client: 'Business Plan', org: 'RK Digital Agency', amount: '₹9,999', status: 'Paid' },
              { client: 'Add-on (AI Credits)', org: 'Digital Minds', amount: '₹4,999', status: 'Paid' },
              { client: 'Enterprise Plan', org: 'Kumar Traders', amount: '₹49,999', status: 'Paid' },
            ].map((t, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div>
                  <p className="font-bold text-[#0B2E6B]">{t.client}</p>
                  <p className="text-[11px] text-slate-400">{t.org}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0B2E6B]">{t.amount}</p>
                  <span className="inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
