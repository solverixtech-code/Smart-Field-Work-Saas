import React from 'react';
import { Target, Trophy, Award, Star, ThumbsUp, MessageSquare, TrendingUp, DollarSign } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis } from 'recharts';

const leadsBySourceData = [
  { name: 'Website', value: 34, color: '#0D1F3D' },
  { name: 'Google Ads', value: 28, color: '#E20613' },
  { name: 'Referral', value: 20, color: '#10B981' },
  { name: 'Walk-in', value: 16, color: '#F59E0B' },
  { name: 'Justdial', value: 12, color: '#8B5CF6' },
  { name: 'Others', value: 10, color: '#64748B' },
];

const trendLineData = [
  { month: 'Dec 2024', leads: 25, deals: 8, revenue: 4.5 },
  { month: 'Jan 2025', leads: 32, converted: 14, deals: 10, revenue: 5.8 },
  { month: 'Feb 2025', leads: 30, converted: 12, deals: 9, revenue: 5.2 },
  { month: 'Mar 2025', leads: 42, converted: 18, deals: 13, revenue: 6.9 },
  { month: 'Apr 2025', leads: 48, converted: 22, deals: 15, revenue: 7.4 },
  { month: 'May 2025', leads: 55, converted: 28, deals: 18, revenue: 8.45 },
];

export function PerformanceTab() {
  return (
    <div className="space-y-6 font-sans">
      {/* Row 1: Target Progress Bars & Performance Trend */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Targets Breakdown Progress Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Target Progress (May 2025)</h3>
            </div>
            <span className="text-xs font-bold text-[#E20613]">75% Overall</span>
          </div>

          <div className="space-y-4 pt-1">
            {[
              { label: 'Revenue Target', val: '₹8,45,000 / ₹11,25,000', pct: 75, color: 'bg-[#E20613]' },
              { label: 'Deals Target', val: '18 / 25 Deals', pct: 72, color: 'bg-emerald-500' },
              { label: 'Leads Conversion Target', val: '28 / 40 Leads', pct: 70, color: 'bg-blue-600' },
              { label: 'Activities Target', val: '86 / 100 Visits', pct: 86, color: 'bg-purple-600' },
            ].map((t) => (
              <div key={t.label} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-[#0D1F3D]">
                  <span>{t.label}</span>
                  <span className="text-slate-500">{t.val} ({t.pct}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${t.color}`} style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Performance Trend Line Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Conversion & Revenue Trend</h3>
            <span className="text-xs font-bold text-slate-400">Last 6 Months</span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendLineData}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700 }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="revenue" name="Revenue (Lakhs)" stroke="#E20613" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="deals" name="Deals Won" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="leads" name="Leads" stroke="#0D1F3D" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Leads by Source Donut & Top Deal Categories & Achievements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Leads by Source */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4 space-y-3">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Leads by Source</h3>
          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={leadsBySourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                  {leadsBySourceData.map((e, idx) => (
                    <Cell key={idx} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold pt-1 border-t border-slate-100">
            {leadsBySourceData.map((s) => (
              <div key={s.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-slate-600">{s.name}:</span>
                <span className="font-bold text-[#0D1F3D]">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Deal Categories */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4 space-y-3">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Top Deal Categories</h3>
          <div className="space-y-2.5 text-xs font-semibold">
            {[
              { name: 'Web Development', amt: '₹3,20,000', share: '37.9%' },
              { name: 'CRM Software', amt: '₹1,80,000', share: '21.3%' },
              { name: 'Digital Marketing', amt: '₹1,50,000', share: '17.8%' },
              { name: 'Mobile App', amt: '₹1,20,000', share: '14.2%' },
              { name: 'Other Services', amt: '₹75,000', share: '8.8%' },
            ].map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5">
                <span className="font-bold text-[#0D1F3D]">{c.name}</span>
                <div className="text-right">
                  <span className="font-extrabold text-[#E20613]">{c.amt}</span>
                  <span className="text-[10px] text-slate-400 block font-medium">{c.share}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4 space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Recent Achievements</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 rounded-xl bg-amber-50/80 border border-amber-200/60 p-3">
              <Award className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-amber-900">Top Performer (May 2025)</p>
                <p className="text-[11px] text-amber-700 font-medium">Achieved highest revenue in Mumbai North team.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-purple-50/80 border border-purple-200/60 p-3">
              <Star className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-purple-900">Deal Champion</p>
                <p className="text-[11px] text-purple-700 font-medium">Closed 18 deals in a single calendar month.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Manager's Note & Rating */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#E20613]" />
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Manager's Review & Feedback</h3>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl text-xs font-extrabold text-amber-700">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> 4.2 / 5 Overall Rating
          </div>
        </div>
        <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 font-medium leading-relaxed">
          "Rahul is consistently performing well and maintaining a high conversion rate in Mumbai North. Excellent store relationships and punctual site visits."
        </p>
      </div>
    </div>
  );
}
