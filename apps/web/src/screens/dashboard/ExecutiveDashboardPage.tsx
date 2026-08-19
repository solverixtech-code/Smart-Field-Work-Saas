import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Users,
  UserCheck,
  Store,
  Video,
  Flame,
  CalendarClock,
  CreditCard,
  UserPlus,
  DollarSign,
  Target,
  TrendingUp,
  ArrowUpRight,
  Download,
  CheckCircle2,
  Bell,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAppSelector } from '../../store';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { Button } from '../../components/ui/Button';

const performanceOverviewData = [
  { date: 'May 12', leads: 6000, tasks: 3200, visits: 2600, conversions: 1200 },
  { date: 'May 13', leads: 7000, tasks: 4200, visits: 3400, conversions: 2100 },
  { date: 'May 14', leads: 6800, tasks: 3900, visits: 3100, conversions: 1900 },
  { date: 'May 15', leads: 7600, tasks: 4800, visits: 3600, conversions: 2400 },
  { date: 'May 16', leads: 7400, tasks: 4400, visits: 3400, conversions: 2200 },
  { date: 'May 17', leads: 5200, tasks: 3000, visits: 2200, conversions: 1100 },
  { date: 'May 18', leads: 7100, tasks: 4600, visits: 3400, conversions: 2300 },
];

const leadSourceDistributionData = [
  { name: 'Website', value: 2845, pct: '22.1%', color: '#2563EB' },
  { name: 'Walk-In', value: 2456, pct: '19.1%', color: '#E20613' },
  { name: 'Referral', value: 2150, pct: '16.7%', color: '#F59E0B' },
  { name: 'Meta Ads', value: 2120, pct: '16.5%', color: '#10B981' },
  { name: 'Google Ads', value: 1890, pct: '14.7%', color: '#8B5CF6' },
  { name: 'Others', value: 1384, pct: '10.8%', color: '#64748B' },
];

const tasksOverviewData = [
  { name: 'Completed', value: 5312, pct: '62.2%', color: '#10B981' },
  { name: 'In Progress', value: 2124, pct: '24.9%', color: '#2563EB' },
  { name: 'Pending', value: 1096, pct: '12.9%', color: '#F59E0B' },
];

const topExecutives = [
  { name: 'Amit Verma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', tasks: 142, conversions: 28, score: 92 },
  { name: 'Neha Singh', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', tasks: 128, conversions: 25, score: 89 },
  { name: 'Vikram Patil', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', tasks: 115, conversions: 22, score: 87 },
  { name: 'Prakash Yadav', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', tasks: 108, conversions: 20, score: 85 },
  { name: 'Anita Kumari', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', tasks: 102, conversions: 18, score: 82 },
];

const realtimeActivities = [
  { id: '1', title: 'Amit Verma completed Site Inspection', time: '2 min ago', type: 'check', color: 'bg-emerald-100 text-emerald-700' },
  { id: '2', title: 'New lead assigned to Neha Singh', time: '5 min ago', type: 'user', color: 'bg-blue-100 text-blue-700' },
  { id: '3', title: 'Prakash Yadav completed Daily Target', time: '15 min ago', type: 'target', color: 'bg-red-100 text-[#E20613]' },
  { id: '4', title: 'Sales report submitted by Vikram Patil', time: '25 min ago', type: 'check', color: 'bg-emerald-100 text-emerald-700' },
  { id: '5', title: 'Anita Kumari achieved Top Performer', time: '1 hour ago', type: 'trophy', color: 'bg-purple-100 text-purple-700' },
];

export default function ExecutiveDashboardPage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Page Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">
            Welcome back, {user?.fullName?.split(' ')[0] || 'Rohit'}! 👋
          </h1>
          <p className="text-xs font-normal text-slate-600 mt-0.5">
            Here's what's happening with your field operations today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker />
          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.success('Exporting Executive Report...')}
            className="flex items-center gap-2 font-semibold shadow-xs"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* 11 REQUIRED KPI METRICS GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <KpiCard
          title="Executives Online"
          value="42 Online"
          subValue="Active in App"
          icon={Users}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-700"
        />
        <KpiCard
          title="Checked-In Executives"
          value="38 Checked-In"
          subValue="90.4% Attendance"
          icon={UserCheck}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
        <KpiCard
          title="Shops Visited Today"
          value="186 Visited"
          subValue="+14% vs yesterday"
          icon={Store}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-700"
        />
        <KpiCard
          title="Demos Completed"
          value="54 Demos"
          subValue="85% Success Rate"
          icon={Video}
          iconBgColor="bg-teal-50"
          iconTextColor="text-teal-700"
        />
        <KpiCard
          title="Hot Prospects"
          value="32 Prospects"
          subValue="High Intent"
          icon={Flame}
          iconBgColor="bg-red-50"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Follow-ups"
          value="78 Due"
          subValue="Scheduled Today"
          icon={CalendarClock}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-700"
        />
        <KpiCard
          title="Payments"
          value="₹4,25,000"
          subValue="Collected Today"
          icon={CreditCard}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
        <KpiCard
          title="New Customers"
          value="24 Customers"
          subValue="+8 Joins Today"
          icon={UserPlus}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-700"
        />
        <KpiCard
          title="Revenue Collected"
          value="₹24,85,600"
          change="+18.6%"
          changeType="positive"
          timeframe="vs last week"
          icon={DollarSign}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
        <KpiCard
          title="Target Achievement"
          value="82.9%"
          subValue="₹24.85L / ₹30.00L"
          icon={Target}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-700"
        />
        <KpiCard
          title="Conversion Rate"
          value="18.6%"
          change="+2.3%"
          changeType="positive"
          timeframe="vs last week"
          icon={TrendingUp}
          iconBgColor="bg-red-50"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Total Leads"
          value="12,845"
          change="+15.6%"
          changeType="positive"
          timeframe="vs last week"
          icon={Users}
          iconBgColor="bg-slate-100"
          iconTextColor="text-[#0D1F3D]"
        />
      </div>

      {/* MIDDLE SECTION: Performance Overview Line Chart + Leads Donut Chart + Real-time Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        {/* Performance Overview (Line Chart, 7 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0D1F3D]">Performance Overview</h3>
              <p className="text-xs text-slate-600">Weekly activity trends across all field operations</p>
            </div>
            <select className="rounded-sm border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#0D1F3D]">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1">
            <span className="flex items-center gap-1.5 text-blue-600"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Leads</span>
            <span className="flex items-center gap-1.5 text-[#E20613]"><span className="h-2.5 w-2.5 rounded-full bg-[#E20613]" /> Tasks</span>
            <span className="flex items-center gap-1.5 text-emerald-600"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Visits</span>
            <span className="flex items-center gap-1.5 text-purple-600"><span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Conversions</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceOverviewData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  position={{ y: -15 }}
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="leads" name="Leads" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="tasks" name="Tasks" stroke="#E20613" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="visits" name="Visits" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="conversions" name="Conversions" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leads Source Distribution (Donut Chart, 3 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-[#0D1F3D]">Leads Source Distribution</h3>

          <div className="flex flex-col items-center">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {leadSourceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any) => [`${Number(val || 0).toLocaleString()} Leads`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-[#0D1F3D]">12,845</span>
                <span className="text-[10px] font-semibold text-slate-500">Total Leads</span>
              </div>
            </div>

            <div className="w-full space-y-1.5 text-xs font-semibold text-slate-700 mt-2">
              {leadSourceDistributionData.map((s) => (
                <div key={s.name} className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-bold text-[#0D1F3D]">{s.value.toLocaleString()} ({s.pct})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View Full Report <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Real-time Activity Stream (3 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0D1F3D]">Real-time Activity</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
          </div>

          <div className="space-y-3 font-semibold text-xs">
            {realtimeActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-2.5 border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${act.color} text-xs font-bold`}>
                  ✓
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 text-xs leading-snug">{act.title}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{act.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View All Activity <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Tasks Overview Donut + Top Performing Executives + Upcoming Reminders */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        {/* Tasks Overview (3 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0D1F3D]">Tasks Overview</h3>
            <select className="rounded-sm border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-[#0D1F3D]">
              <option>This Week</option>
            </select>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksOverviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {tasksOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-[#0D1F3D]">8,532</span>
                <span className="text-[10px] font-semibold text-slate-500">Total Tasks</span>
              </div>
            </div>

            <div className="w-full space-y-1.5 text-xs font-semibold text-slate-700 mt-2">
              {tasksOverviewData.map((t) => (
                <div key={t.name} className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </span>
                  <span className="font-bold text-[#0D1F3D]">{t.value.toLocaleString()} ({t.pct})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View Task Report <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Top Performing Executives Table (6 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0D1F3D]">Top Performing Executives</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-800">
                  <th className="py-2.5 px-3">Executive</th>
                  <th className="py-2.5 px-3 text-center">Tasks</th>
                  <th className="py-2.5 px-3 text-center">Conversions</th>
                  <th className="py-2.5 px-3 text-right">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {topExecutives.map((exec) => (
                  <tr key={exec.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img src={exec.avatar} alt={exec.name} className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0" />
                        <span className="font-semibold text-slate-900">{exec.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-800">{exec.tasks}</td>
                    <td className="py-2.5 px-3 text-center font-semibold text-slate-800">{exec.conversions}</td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-emerald-700">{exec.score}%</span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${exec.score}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View All Executives <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Upcoming Reminders (3 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0D1F3D]">Upcoming Reminders</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
          </div>

          <div className="space-y-3 font-semibold text-xs">
            <div className="flex items-start gap-3 rounded-sm border border-slate-100 bg-slate-50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-[#0D1F3D]">Team Meeting</p>
                <p className="text-[10px] text-slate-500 font-medium">May 19, 2025 • 10:00 AM</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-sm border border-slate-100 bg-slate-50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-red-50 text-[#E20613] border border-red-100">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-[#0D1F3D]">Monthly Target Review</p>
                <p className="text-[10px] text-slate-500 font-medium">May 20, 2025 • 11:00 AM</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-sm border border-slate-100 bg-slate-50 p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-bold text-[#0D1F3D]">System Maintenance</p>
                <p className="text-[10px] text-slate-500 font-medium">May 21, 2025 • 02:00 AM</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View All Reminders <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
