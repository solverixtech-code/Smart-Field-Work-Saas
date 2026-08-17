import React from 'react';
import { IndianRupee, Trophy, Calendar, CheckCircle2, AlertCircle, TrendingUp, Award, Layers } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { KpiCard } from '../../../components/dashboard/KpiCard';

const incentiveTrendData = [
  { month: 'Apr 2024', earned: 12000, paid: 10000 },
  { month: 'May 2024', earned: 14500, paid: 12000 },
  { month: 'Jun 2024', earned: 18750, paid: 15000 },
  { month: 'Jul 2024', earned: 13000, paid: 10000 },
  { month: 'Aug 2024', earned: 16000, paid: 14000 },
  { month: 'Sep 2024', earned: 15500, paid: 13500 },
];

const summaryRules = [
  { type: 'New Deal Incentive', criteria: 'On Closed Won Deals', rate: '2% of Deal Value', earned: '₹8,250', paid: '₹7,500', pending: '₹750', status: 'Active' },
  { type: 'Collection Incentive', criteria: 'On Payments Collected', rate: '1% of Collection', earned: '₹4,000', paid: '₹3,500', pending: '₹500', status: 'Active' },
  { type: 'Visit Incentive', criteria: 'On Productive Visits', rate: '₹100 per Visit', earned: '₹2,700', paid: '₹2,400', pending: '₹300', status: 'Active' },
  { type: 'Target Achievement', criteria: 'Monthly Target Achievement', rate: 'Upto ₹5,000', earned: '₹2,500', paid: '₹1,500', pending: '₹1,000', status: 'Active' },
  { type: 'Cross Sell Incentive', criteria: 'On Cross Sell Deals', rate: '1.5% of Deal Value', earned: '₹1,300', paid: '₹1,000', pending: '₹300', status: 'Active' },
];

const incentiveLog = [
  { date: '20 May 2025', type: 'New Deal Incentive', ref: 'Deal #DEAL-1045', val: 'Deal Value: ₹1,25,000', earned: '₹2,500', paid: '₹2,250', pending: '₹250', status: 'Pending' },
  { date: '19 May 2025', type: 'Collection Incentive', ref: 'Payment #PAY-4532', val: 'Collection: ₹50,000', earned: '₹500', paid: '₹500', pending: '₹0', status: 'Paid' },
  { date: '18 May 2025', type: 'Visit Incentive', ref: 'Visit #VISIT-2281', val: '27 Productive Visits', earned: '₹2,700', paid: '₹2,400', pending: '₹300', status: 'Pending' },
  { date: '01 May 2025', type: 'Target Achievement', ref: 'Target - Apr 2025', val: 'Achievement: 112%', earned: '₹2,500', paid: '₹1,500', pending: '₹1,000', status: 'Partially Paid' },
  { date: '30 Apr 2025', type: 'Cross Sell Incentive', ref: 'Deal #DEAL-1031', val: 'Cross Sell Value: ₹86,000', earned: '₹1,300', paid: '₹1,000', pending: '₹300', status: 'Paid' },
];

export function IncentivesTab() {
  return (
    <div className="space-y-6 font-sans">
      {/* 5 Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Total Earned (This Month)"
          value="₹18,750"
          change="+23%"
          changeType="positive"
          timeframe="vs last month"
          icon={IndianRupee}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Total Payout (This Month)"
          value="₹15,000"
          change="+15%"
          changeType="positive"
          timeframe="vs last month"
          icon={CheckCircle2}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Pending Payout"
          value="₹3,750"
          subValue="Scheduled for next cycle"
          icon={AlertCircle}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="YTD Earned (FY 2025-26)"
          value="₹1,24,500"
          change="+28%"
          changeType="positive"
          timeframe="vs last year"
          icon={Award}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="YTD Payout"
          value="₹1,00,000"
          change="+25%"
          changeType="positive"
          timeframe="vs last year"
          icon={IndianRupee}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
      </div>

      {/* Main Grid: Incentives Summary Table & Right Trend / Plan Info */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Summary Rules & Transaction Log */}
        <div className="space-y-6 lg:col-span-8">
          {/* Incentives Summary Rules Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Incentives Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase">
                    <th className="px-3 py-3">Incentive Type</th>
                    <th className="px-3 py-3">Criteria</th>
                    <th className="px-3 py-3">Rate / Slab</th>
                    <th className="px-3 py-3">Earned</th>
                    <th className="px-3 py-3">Paid</th>
                    <th className="px-3 py-3">Pending</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {summaryRules.map((r, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-extrabold text-[#0D1F3D]">{r.type}</td>
                      <td className="px-3 py-3 text-slate-500">{r.criteria}</td>
                      <td className="px-3 py-3 text-blue-600 font-bold">{r.rate}</td>
                      <td className="px-3 py-3 font-extrabold text-emerald-600">{r.earned}</td>
                      <td className="px-3 py-3 text-[#0D1F3D] font-bold">{r.paid}</td>
                      <td className="px-3 py-3 text-amber-600 font-bold">{r.pending}</td>
                      <td className="px-3 py-3">
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Incentive Details Log Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Incentive Details Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase">
                    <th className="px-3 py-3">Date</th>
                    <th className="px-3 py-3">Incentive Type</th>
                    <th className="px-3 py-3">Reference</th>
                    <th className="px-3 py-3">Criteria Basis</th>
                    <th className="px-3 py-3">Earned</th>
                    <th className="px-3 py-3">Paid</th>
                    <th className="px-3 py-3">Pending</th>
                    <th className="px-3 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {incentiveLog.map((l, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="px-3 py-3 font-medium text-slate-500">{l.date}</td>
                      <td className="px-3 py-3 font-extrabold text-[#0D1F3D]">{l.type}</td>
                      <td className="px-3 py-3 text-slate-500 font-bold">{l.ref}</td>
                      <td className="px-3 py-3 text-slate-600">{l.val}</td>
                      <td className="px-3 py-3 font-extrabold text-emerald-600">{l.earned}</td>
                      <td className="px-3 py-3 font-bold text-[#0D1F3D]">{l.paid}</td>
                      <td className="px-3 py-3 font-bold text-amber-600">{l.pending}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-extrabold ${
                            l.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : l.status === 'Pending'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Monthly Trend & Plan Info & Payout Summary */}
        <div className="space-y-6 lg:col-span-4">
          {/* Monthly Incentive Trend Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Monthly Incentive Trend</h3>
            <div className="h-44 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={incentiveTrendData}>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} />
                  <Line type="monotone" dataKey="earned" name="Earned (₹)" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="paid" name="Paid (₹)" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incentive Plan Summary Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 text-xs font-semibold">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Incentive Plan Summary</h3>
            <div className="space-y-2 pt-1 border-t border-slate-100 text-slate-600">
              <div className="flex justify-between">
                <span>Plan Name:</span>
                <span className="font-extrabold text-[#0D1F3D]">Standard Field Incentive Plan</span>
              </div>
              <div className="flex justify-between">
                <span>Plan Type:</span>
                <span className="font-extrabold text-blue-600">Performance Based</span>
              </div>
              <div className="flex justify-between">
                <span>Effective From:</span>
                <span className="font-extrabold text-[#0D1F3D]">01 Apr 2024</span>
              </div>
              <div className="flex justify-between">
                <span>Payout Frequency:</span>
                <span className="font-extrabold text-[#E20613]">Monthly Cycle</span>
              </div>
            </div>
          </div>

          {/* Payout Summary */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Payout Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-center text-xs font-bold">
              <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200">
                <p className="text-[10px] text-emerald-700">Total Payout</p>
                <p className="text-base font-extrabold text-emerald-800 mt-1">₹15,000</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 border border-blue-200">
                <p className="text-[10px] text-blue-700">Next Payout</p>
                <p className="text-xs font-extrabold text-blue-900 mt-1">20 Jun 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
