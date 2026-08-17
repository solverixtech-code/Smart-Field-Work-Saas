import React from 'react';
import { IndianRupee, Trophy, TrendingUp, Percent, RefreshCw, Layers } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { KpiCard } from '../../../components/dashboard/KpiCard';

const salesTrendData = [
  { day: '14 May', period: 92, lastPeriod: 70 },
  { day: '15 May', period: 115, lastPeriod: 80 },
  { day: '16 May', period: 132, lastPeriod: 90 },
  { day: '17 May', period: 105, lastPeriod: 85 },
  { day: '18 May', period: 125, lastPeriod: 95 },
  { day: '19 May', period: 141, lastPeriod: 100 },
];

const dealTypeData = [
  { name: 'New Connection', value: 8, color: '#3B82F6' },
  { name: 'Package Upgrade', value: 5, color: '#10B981' },
  { name: 'Renewal', value: 3, color: '#F59E0B' },
  { name: 'Cross Sell', value: 2, color: '#E20613' },
];

const dealsWonList = [
  { deal: 'Shree Ganesh Traders', type: 'New Connection', val: '₹65,000', status: 'Paid', date: '20 May 2025', comm: '₹3,250' },
  { deal: 'Patel Distributors', type: 'Package Upgrade', val: '₹45,000', status: 'Paid', date: '19 May 2025', comm: '₹2,250' },
  { deal: 'Sharma Enterprises', type: 'New Connection', val: '₹1,20,000', status: 'Partially Paid', date: '19 May 2025', comm: '₹6,000' },
  { deal: 'Maharashtra Electricals', type: 'Renewal', val: '₹35,000', status: 'Paid', date: '18 May 2025', comm: '₹1,750' },
  { deal: 'Raj Sales Corporation', type: 'Cross Sell', val: '₹55,000', status: 'Paid', date: '18 May 2025', comm: '₹2,750' },
];

export function SalesTab() {
  return (
    <div className="space-y-6 font-sans">
      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          title="Total Sales"
          value="₹8,45,000"
          change="+18%"
          changeType="positive"
          timeframe="vs last month"
          icon={IndianRupee}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Deals Won"
          value="18"
          change="+20%"
          changeType="positive"
          timeframe="vs last month"
          icon={Trophy}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Avg Deal Value"
          value="₹46,944"
          change="+5%"
          changeType="positive"
          timeframe="vs last month"
          icon={TrendingUp}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Total Commission"
          value="₹42,250"
          change="+18%"
          changeType="positive"
          timeframe="vs last month"
          icon={IndianRupee}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Win Rate"
          value="72%"
          change="+6%"
          changeType="positive"
          timeframe="vs last month"
          icon={Percent}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Refunds / Returns"
          value="₹15,000"
          change="-8%"
          changeType="positive"
          timeframe="vs last month"
          icon={RefreshCw}
          iconBgColor="bg-slate-500/10"
          iconTextColor="text-slate-600"
        />
      </div>

      {/* Main Grid: Revenue Trend + Deal Type Donut + Deals Won Table + Sales Funnel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Revenue Trend & Deals Won Table */}
        <div className="space-y-6 lg:col-span-8">
          {/* Revenue Trend & Deal Types */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:col-span-7 space-y-3">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Revenue Trend</h3>
              <div className="h-44 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData}>
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} />
                    <Area type="monotone" dataKey="period" name="This Period" stroke="#E20613" strokeWidth={3} fill="#E20613" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:col-span-5 space-y-3">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Sales by Deal Type</h3>
              <div className="h-32 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dealTypeData} cx="50%" cy="50%" innerRadius={35} outerRadius={50} dataKey="value">
                      {dealTypeData.map((e, idx) => (
                        <Cell key={idx} fill={e.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 text-[11px] font-semibold">
                {dealTypeData.map((d) => (
                  <div key={d.name} className="flex justify-between text-slate-600">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} /> {d.name}</span>
                    <span className="font-bold text-[#0D1F3D]">{d.value} deals</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deals Won Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Deals Won Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase">
                    <th className="px-3 py-3">Deal / Customer</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">Deal Value</th>
                    <th className="px-3 py-3">Payment Status</th>
                    <th className="px-3 py-3">Won Date</th>
                    <th className="px-3 py-3 text-right">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {dealsWonList.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-extrabold text-[#0D1F3D]">{d.deal}</td>
                      <td className="px-3 py-3 text-slate-500">{d.type}</td>
                      <td className="px-3 py-3 font-extrabold text-[#E20613]">{d.val}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-extrabold ${
                          d.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-500">{d.date}</td>
                      <td className="px-3 py-3 text-right font-extrabold text-[#0D1F3D]">{d.comm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Sales Funnel & Top Products & Monthly Comparison */}
        <div className="space-y-6 lg:col-span-4">
          {/* Sales Funnel */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Sales Funnel (This Month)</h3>
            <div className="space-y-2 text-xs font-semibold">
              {[
                { stage: 'Total Leads', count: 120, pct: '100%', bg: 'bg-[#0D1F3D] text-white' },
                { stage: 'Qualified Leads', count: 56, pct: '46.6%', bg: 'bg-blue-600 text-white' },
                { stage: 'Proposals Sent', count: 32, pct: '26.6%', bg: 'bg-indigo-600 text-white' },
                { stage: 'Negotiation', count: 21, pct: '17.5%', bg: 'bg-amber-500 text-white' },
                { stage: 'Deals Won', count: 18, pct: '15.0%', bg: 'bg-[#E20613] text-white' },
              ].map((f) => (
                <div key={f.stage} className={`flex items-center justify-between rounded-xl p-2.5 ${f.bg}`}>
                  <span>{f.stage}</span>
                  <span className="font-extrabold">{f.count} ({f.pct})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products / Services */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Top Products / Services</h3>
            <div className="space-y-2 text-xs font-semibold">
              {[
                { name: 'VisibloAI Pro Plan', amt: '₹3,60,000', share: '42.6%' },
                { name: 'Social Media Automation', amt: '₹2,10,000', share: '24.8%' },
                { name: 'Local SEO Booster', amt: '₹1,55,000', share: '18.3%' },
                { name: 'Website Builder Add-on', amt: '₹20,000', share: '2.37%' },
              ].map((p) => (
                <div key={p.name} className="flex justify-between items-center rounded-xl bg-slate-50 p-2 border border-slate-100">
                  <span className="font-extrabold text-[#0D1F3D]">{p.name}</span>
                  <div className="text-right">
                    <span className="font-extrabold text-[#E20613]">{p.amt}</span>
                    <span className="text-[10px] text-slate-400 block font-medium">{p.share}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
