import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, AlertCircle, Award, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { KpiCard } from '../../../components/dashboard/KpiCard';

const attendanceBreakdownData = [
  { name: 'Present', value: 22, color: '#10B981' },
  { name: 'Absent', value: 5, color: '#EF4444' },
  { name: 'Late', value: 2, color: '#F59E0B' },
  { name: 'Half Day', value: 1, color: '#8B5CF6' },
  { name: 'Weekly Off', value: 8, color: '#94A3B8' },
];

const mayDays = [
  { day: 1, status: 'P', in: '09:01 AM', out: '06:02 PM' },
  { day: 2, status: 'P', in: '09:03 AM', out: '06:01 PM' },
  { day: 3, status: 'WO', in: '-', out: '-' },
  { day: 4, status: 'WO', in: '-', out: '-' },
  { day: 5, status: 'P', in: '08:58 AM', out: '06:05 PM' },
  { day: 6, status: 'L', in: '09:15 AM', out: '06:10 PM' },
  { day: 7, status: 'P', in: '09:00 AM', out: '06:00 PM' },
  { day: 8, status: 'P', in: '08:55 AM', out: '06:00 PM' },
  { day: 9, status: 'P', in: '09:02 AM', out: '06:04 PM' },
  { day: 10, status: 'WO', in: '-', out: '-' },
  { day: 11, status: 'WO', in: '-', out: '-' },
  { day: 12, status: 'P', in: '08:59 AM', out: '06:02 PM' },
  { day: 13, status: 'A', in: '-', out: '-' },
  { day: 14, status: 'P', in: '09:00 AM', out: '06:03 PM' },
  { day: 15, status: 'HD', in: '09:05 AM', out: '01:15 PM' },
  { day: 16, status: 'P', in: '09:01 AM', out: '06:00 PM' },
  { day: 17, status: 'WO', in: '-', out: '-' },
  { day: 18, status: 'WO', in: '-', out: '-' },
  { day: 19, status: 'P', in: '08:57 AM', out: '06:02 PM' },
  { day: 20, status: 'P', in: '08:58 AM', out: '06:03 PM' },
  { day: 21, status: 'L', in: '09:20 AM', out: '06:12 PM' },
  { day: 22, status: 'P', in: '09:00 AM', out: '06:01 PM' },
  { day: 23, status: 'A', in: '-', out: '-' },
  { day: 24, status: 'WO', in: '-', out: '-' },
  { day: 25, status: 'WO', in: '-', out: '-' },
  { day: 26, status: 'P', in: '08:56 AM', out: '06:00 PM' },
  { day: 27, status: 'P', in: '08:59 AM', out: '06:05 PM' },
  { day: 28, status: 'P', in: '09:01 AM', out: '06:02 PM' },
  { day: 29, status: 'P', in: '09:00 AM', out: '06:01 PM' },
  { day: 30, status: 'P', in: '09:03 AM', out: '06:03 PM' },
  { day: 31, status: 'P', in: '09:00 AM', out: '06:00 PM' },
];

export function AttendanceTab() {
  const [selectedMonth, setSelectedMonth] = useState('May 2025');

  return (
    <div className="space-y-6 font-sans">
      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          title="Present Days"
          value="22"
          subValue="73.33% attendance"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Absent Days"
          value="5"
          subValue="16.67% absent"
          icon={XCircle}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Late Days"
          value="2"
          subValue="6.67% late"
          icon={Clock}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Half Days"
          value="1"
          subValue="3.33% half days"
          icon={AlertCircle}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Total Working Days"
          value="30"
          subValue="This Month"
          icon={CalendarIcon}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Attendance %"
          value="73.33%"
          change="+8%"
          changeType="positive"
          timeframe="vs last month"
          icon={Award}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
      </div>

      {/* Main Grid: Interactive Monthly Calendar Grid & Right Side Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Monthly Attendance Calendar Grid */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-[#E20613]" />
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Attendance Calendar - {selectedMonth}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-100">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-[#0D1F3D]">{selectedMonth}</span>
              <button className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:bg-slate-100">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Days Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold text-slate-400 pb-1 border-b border-slate-100">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          {/* Monthly Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {/* 3 Empty Cells for Offset */}
            <div className="h-16 rounded-xl border border-slate-100 bg-slate-50/30 p-1 text-[10px] text-slate-300 font-bold">28</div>
            <div className="h-16 rounded-xl border border-slate-100 bg-slate-50/30 p-1 text-[10px] text-slate-300 font-bold">29</div>
            <div className="h-16 rounded-xl border border-slate-100 bg-slate-50/30 p-1 text-[10px] text-slate-300 font-bold">30</div>

            {mayDays.map((d) => {
              let badgeColor = 'bg-emerald-100 text-emerald-700';
              if (d.status === 'A') badgeColor = 'bg-red-100 text-[#E20613]';
              if (d.status === 'L') badgeColor = 'bg-amber-100 text-amber-700';
              if (d.status === 'HD') badgeColor = 'bg-purple-100 text-purple-700';
              if (d.status === 'WO') badgeColor = 'bg-slate-100 text-slate-500';

              return (
                <div key={d.day} className="h-16 rounded-xl border border-slate-200/80 bg-slate-50/60 p-1.5 flex flex-col justify-between hover:bg-white hover:shadow-xs transition duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-[#0D1F3D]">{d.day}</span>
                    <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold ${badgeColor}`}>
                      {d.status}
                    </span>
                  </div>
                  {d.in !== '-' && (
                    <div className="text-[9px] font-semibold text-slate-500 space-y-0.5">
                      <p>In: {d.in}</p>
                      <p>Out: {d.out}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-3 border-t border-slate-100 text-slate-600">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> P: Present</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#E20613]" /> A: Absent</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> L: Late</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> HD: Half Day</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> WO: Weekly Off</span>
          </div>
        </div>

        {/* Right Column: Donut Chart, Punctuality Stats, Leaves List */}
        <div className="space-y-6 lg:col-span-4">
          {/* Attendance Donut Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Attendance Distribution</h3>
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={attendanceBreakdownData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">
                    {attendanceBreakdownData.map((e, idx) => (
                      <Cell key={idx} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-[#0D1F3D]">73.3%</span>
                <span className="text-[10px] font-bold text-slate-400">Attendance</span>
              </div>
            </div>
          </div>

          {/* Punctuality Insights */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Punctuality Insights</h3>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400">Avg Check-in</p>
                <p className="font-extrabold text-[#0D1F3D] mt-0.5">09:01 AM</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400">Avg Check-out</p>
                <p className="font-extrabold text-[#0D1F3D] mt-0.5">06:03 PM</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400">Working Hrs</p>
                <p className="font-extrabold text-[#E20613] mt-0.5">8h 58m</p>
              </div>
            </div>
          </div>

          {/* Recent Leaves */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Recent Leaves</h3>
              <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
            </div>
            <div className="space-y-2 text-xs font-semibold">
              {[
                { date: '13 May 2025', type: 'Casual Leave', days: '1 Day', status: 'Approved' },
                { date: '23 May 2025', type: 'Sick Leave', days: '1 Day', status: 'Approved' },
                { date: '15 May 2025', type: 'Casual Leave (Half Day)', days: '0.5 Day', status: 'Approved' },
              ].map((l, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">{l.type}</p>
                    <p className="text-[10px] text-slate-400">{l.date} • {l.days}</p>
                  </div>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    {l.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
