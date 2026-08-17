import React from 'react';
import { Users, CheckCircle2, Trophy, IndianRupee, Gauge, Clock, Phone, FileText, CheckSquare } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { KpiCard } from '../../../components/dashboard/KpiCard';

const performanceTrendData = [
  { month: 'Dec 2024', leads: 40, converted: 12, deals: 8, revenue: 4.5 },
  { month: 'Jan 2025', leads: 50, converted: 16, deals: 10, revenue: 5.8 },
  { month: 'Feb 2025', leads: 48, converted: 15, deals: 9, revenue: 5.2 },
  { month: 'Mar 2025', leads: 60, converted: 20, deals: 13, revenue: 6.9 },
  { month: 'Apr 2025', leads: 65, converted: 24, deals: 15, revenue: 7.4 },
  { month: 'May 2025', leads: 75, converted: 28, deals: 18, revenue: 8.45 },
];

const targetAchievedData = [
  { name: 'Achieved', value: 845000, color: '#E20613' },
  { name: 'Remaining', value: 280000, color: '#E2E8F0' },
];

export function OverviewTab() {
  return (
    <div className="space-y-6 font-sans">
      {/* 4 Performance Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Leads Assigned"
          value="120"
          change="+15%"
          changeType="positive"
          timeframe="vs last month"
          icon={Users}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Leads Converted"
          value="28"
          change="+12%"
          changeType="positive"
          timeframe="vs last month"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Deals Won"
          value="18"
          change="+20%"
          changeType="positive"
          timeframe="vs last month"
          icon={Trophy}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Revenue Generated"
          value="₹8,45,000"
          change="+18%"
          changeType="positive"
          timeframe="vs last month"
          icon={IndianRupee}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Conversion Rate"
          value="23.33%"
          change="+2.5%"
          changeType="positive"
          timeframe="vs last month"
          icon={Gauge}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Row 2: Target vs Achievement Donut & Monthly Performance Trend Area Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Target vs Achievement */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Target vs Achievement</h3>
            <span className="text-xs font-bold text-slate-400">This Month</span>
          </div>

          <div className="relative h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={targetAchievedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  startAngle={180}
                  endAngle={0}
                  dataKey="value"
                >
                  {targetAchievedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700 }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-6 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-[#0D1F3D]">75%</span>
              <span className="text-xs font-bold text-[#E20613]">Achieved</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Target (Revenue):</span>
              <span className="font-extrabold text-[#0D1F3D]">₹11,25,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Achieved (Revenue):</span>
              <span className="font-extrabold text-[#E20613]">₹8,45,000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Remaining Gap:</span>
              <span className="font-bold text-slate-600">₹2,80,000</span>
            </div>
          </div>
        </div>

        {/* Monthly Performance Trend Area Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Monthly Performance Trend</h3>
              <p className="text-xs text-slate-500">Tracking leads assigned vs converted vs revenue over 6 months</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-[#0D1F3D]">Last 6 Months</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrendData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E20613" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E20613" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0D1F3D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0D1F3D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue (Lakhs)" stroke="#E20613" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="converted" name="Converted" stroke="#10B981" strokeWidth={2} fillOpacity={0} />
                <Area type="monotone" dataKey="leads" name="Leads" stroke="#0D1F3D" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Activity Log */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Recent Executive Activity</h3>
          <span className="text-xs font-bold text-[#E20613]">Real-time log</span>
        </div>

        <div className="space-y-3 text-xs">
          {[
            { type: 'Call Logged', desc: 'Spoke with Ramesh Enterprises regarding proposal follow up.', time: 'Today, 11:25 AM', tag: 'Follow Up', icon: Phone, color: 'text-blue-600 bg-blue-50' },
            { type: 'New Lead Added', desc: 'Added a new lead - Shree Ganesh Traders (Andheri West).', time: 'Today, 10:05 AM', tag: 'Lead', icon: Users, color: 'text-purple-600 bg-purple-50' },
            { type: 'Deal Won', desc: 'Deal won with Sharma Electronics - Value: ₹68,000.', time: 'Yesterday, 06:15 PM', tag: 'Deal Won', icon: Trophy, color: 'text-emerald-600 bg-emerald-50' },
            { type: 'Task Completed', desc: 'Completed store visit to Patel Distributors (Goregaon East).', time: 'Yesterday, 03:40 PM', tag: 'Task', icon: CheckSquare, color: 'text-amber-600 bg-amber-50' },
          ].map((act, i) => {
            const Icon = act.icon;
            return (
              <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${act.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">{act.type} • <span className="font-medium text-slate-600">{act.desc}</span></p>
                    <p className="text-[10px] font-semibold text-slate-400">{act.time}</p>
                  </div>
                </div>
                <span className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-[#0D1F3D] shadow-2xs">
                  {act.tag}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
