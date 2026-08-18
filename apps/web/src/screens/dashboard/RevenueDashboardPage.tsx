import React, { useState } from 'react';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  RefreshCw,
  PieChart as PieIcon,
  Download,
  ChevronDown,
  CheckCircle2,
  Building2,
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
  { name: 'Subscriptions', value: 68.2, color: '#0D1F3D' },
  { name: 'One-time', value: 18.7, color: '#E20613' },
  { name: 'Upgrades', value: 7.6, color: '#2563EB' },
  { name: 'Add-ons', value: 5.5, color: '#10B981' },
];

export default function RevenueDashboardPage() {
  const [paymentGateway, setPaymentGateway] = useState('All');

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Revenue & Financial Performance</h1>
          <p className="text-xs font-medium text-slate-500">
            Comprehensive breakdown of gross revenue, net MRR/ARR, payment gateways, and transaction logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker />
          <select
            value={paymentGateway}
            onChange={(e) => setPaymentGateway(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0D1F3D] shadow-xs focus:outline-none cursor-pointer"
          >
            <option value="All">💳 All Gateways</option>
            <option value="Razorpay">💳 Razorpay</option>
            <option value="Stripe">💳 Stripe</option>
            <option value="Bank">💳 Bank Transfer</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Downloading Financial Statement...')}
            className="flex items-center gap-2 font-bold"
          >
            <Download className="h-4 w-4 text-[#0D1F3D]" /> Download Report
          </Button>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          title="Total Revenue"
          value="₹48,76,320"
          change="+21.7%"
          changeType="positive"
          timeframe="vs last month"
          icon={DollarSign}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Net Revenue"
          value="₹44,12,890"
          change="+19.3%"
          changeType="positive"
          timeframe="vs last month"
          icon={CreditCard}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="MRR"
          value="₹12,45,678"
          change="+18.6%"
          changeType="positive"
          timeframe="vs last month"
          icon={TrendingUp}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="ARR"
          value="₹1,49,48,136"
          change="+22.5%"
          changeType="positive"
          timeframe="vs last month"
          icon={PieIcon}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Total Collections"
          value="₹46,05,110"
          change="+20.2%"
          changeType="positive"
          timeframe="vs last month"
          icon={CheckCircle2}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
        <KpiCard
          title="Refunds"
          value="₹1,92,450"
          change="-8.4%"
          changeType="positive"
          timeframe="vs last month"
          icon={RefreshCw}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
      </div>

      {/* Middle Row: Revenue Overview, Revenue by Source, Revenue Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <ChartCard title="Revenue Overview & Collections Trend" subtitle="Daily revenue breakdown" className="lg:col-span-6">
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-[#0D1F3D]"><span className="h-3 w-3 rounded-full bg-[#0D1F3D]" /> Total Revenue</span>
              <span className="flex items-center gap-1.5 text-emerald-600"><span className="h-3 w-3 rounded-full bg-emerald-600" /> Net Revenue</span>
              <span className="flex items-center gap-1.5 text-blue-600"><span className="h-3 w-3 rounded-full bg-blue-600" /> Collections</span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sfwRevGrad" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="total" name="Total Revenue" stroke="#0D1F3D" strokeWidth={3} fillOpacity={1} fill="url(#sfwRevGrad)" />
                  <Area type="monotone" dataKey="net" name="Net Revenue" stroke="#10B981" strokeWidth={2} fillOpacity={0} />
                  <Area type="monotone" dataKey="collections" name="Collections" stroke="#2563EB" strokeWidth={2} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ChartCard>

        {/* Revenue by Source Donut Chart */}
        <ChartCard title="Revenue Distribution" className="lg:col-span-3">
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
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
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
                  <span className="font-extrabold text-[#0D1F3D]">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Revenue Summary */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">Financial Statement Summary</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between font-medium text-slate-600"><span>Gross Revenue</span><span className="font-bold text-[#0D1F3D]">₹50,68,770</span></div>
            <div className="flex justify-between font-medium text-slate-600"><span>Discounts</span><span className="font-bold text-[#E20613]">-₹2,25,980</span></div>
            <div className="flex justify-between font-medium text-slate-600"><span>Taxes (GST 18%)</span><span className="font-bold text-slate-700">₹6,34,120</span></div>
            <div className="flex justify-between font-medium text-slate-600"><span>Refunds</span><span className="font-bold text-[#E20613]">-₹1,92,450</span></div>
            <div className="border-t border-slate-100 pt-2 flex justify-between font-extrabold text-[#0D1F3D] text-sm"><span>Net Revenue</span><span className="text-emerald-600">₹44,12,890</span></div>
            <div className="pt-2 text-[11px] font-medium text-slate-400 space-y-1 border-t border-slate-100">
              <div className="flex justify-between"><span>Effective Tax Rate</span><span className="font-bold text-slate-700">12.51%</span></div>
              <div className="flex justify-between"><span>Refund Rate</span><span className="font-bold text-slate-700">3.95%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Revenue by Plan, Payment Methods, Recent Transactions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Revenue by Plan */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">Revenue by Plan Tier</h3>
          <div className="space-y-4 text-xs font-semibold">
            {[
              { plan: 'Enterprise Plan', rev: '₹21,15,500', subs: '4,231', share: 43.3, color: 'bg-[#0D1F3D]' },
              { plan: 'Pro Business Plan', rev: '₹15,71,000', subs: '3,142', share: 32.2, color: 'bg-[#E20613]' },
              { plan: 'Field Team Plan', rev: '₹6,46,800', subs: '2,156', share: 13.2, color: 'bg-blue-600' },
              { plan: 'Starter Plan', rev: '₹5,43,020', subs: '1,213', share: 11.1, color: 'bg-emerald-500' },
            ].map((p) => (
              <div key={p.plan} className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#0D1F3D] font-extrabold">{p.plan}</span>
                  <span className="font-bold text-slate-700">{p.rev} ({p.share}%)</span>
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
          <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">Payment Gateway Split</h3>
          <div className="space-y-3 text-xs font-semibold text-slate-700">
            {[
              { method: 'Razorpay Auto-Debit', pct: '61.3%', val: '₹29,93,210' },
              { method: 'Stripe Corporate', pct: '22.8%', val: '₹11,12,450' },
              { method: 'UPI Instant Payout', pct: '8.7%', val: '₹4,23,800' },
              { method: 'NEFT / RTGS Wire', pct: '5.2%', val: '₹2,54,860' },
            ].map((m) => (
              <div key={m.method} className="flex justify-between items-center rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <span className="font-bold text-slate-700">{m.method}</span>
                <span className="font-extrabold text-[#0D1F3D]">{m.val} <span className="text-slate-400 font-normal">({m.pct})</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Financial Transactions */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Recent Transactions</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline flex items-center gap-1">
              View All <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="space-y-3 text-xs">
            {[
              { client: 'SFW Enterprise Plan', org: 'Sharma Enterprises', amount: '₹24,999', status: 'Completed' },
              { client: 'Field Executive Pack', org: 'RK Digital Agency', amount: '₹9,999', status: 'Completed' },
              { client: 'Add-on (GPS Credits)', org: 'Digital Minds', amount: '₹4,999', status: 'Completed' },
              { client: 'Annual License', org: 'Kumar Traders', amount: '₹49,999', status: 'Completed' },
            ].map((t, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">{t.client}</p>
                  <p className="text-[11px] font-semibold text-slate-400">{t.org}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-[#0D1F3D]">{t.amount}</p>
                  <span className="inline-block rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-600">
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
