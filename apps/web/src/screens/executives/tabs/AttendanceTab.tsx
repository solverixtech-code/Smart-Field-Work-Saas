import { AlertCircle, Award, Calendar as CalendarIcon, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import type { ExecutiveProfileData } from '../executive-profile.types';

const time = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' });
const duration = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
const statusCode: Record<string, string> = { PRESENT: 'P', ABSENT: 'A', LATE: 'L', HALF_DAY: 'HD', ON_LEAVE: 'OL', WEEKLY_OFF: 'WO', HOLIDAY: 'H' };

export function AttendanceTab({ data }: { data: ExecutiveProfileData['attendance'] }) {
  const summary = data.summary;
  const breakdown = [
    { name: 'Present', value: summary.present, color: '#10B981' },
    { name: 'Absent', value: summary.absent, color: '#EF4444' },
    { name: 'Late', value: summary.late, color: '#F59E0B' },
    { name: 'Half Day', value: summary.halfDay, color: '#8B5CF6' },
  ];
  const firstDate = data.days[0]?.date ?? new Date().toISOString().slice(0, 10);
  const year = Number(firstDate.slice(0, 4));
  const month = Number(firstDate.slice(5, 7));
  const daysInMonth = new Date(year, month, 0).getDate();
  const mondayOffset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const byDay = new Map(data.days.map((item) => [Number(item.date.slice(8, 10)), item]));

  return <div className="space-y-6 font-sans">
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <KpiCard title="Present Days" value={summary.present} subValue={`${summary.percentage}% attendance`} icon={CheckCircle2} iconBgColor="bg-emerald-500/10" iconTextColor="text-emerald-600" />
      <KpiCard title="Absent Days" value={summary.absent} icon={XCircle} iconBgColor="bg-red-500/10" iconTextColor="text-[#E20613]" />
      <KpiCard title="Late Days" value={summary.late} icon={Clock} iconBgColor="bg-amber-500/10" iconTextColor="text-amber-600" />
      <KpiCard title="Half Days" value={summary.halfDay} icon={AlertCircle} iconBgColor="bg-purple-500/10" iconTextColor="text-purple-600" />
      <KpiCard title="Recorded Working Days" value={summary.workingDays} subValue={data.period} icon={CalendarIcon} iconBgColor="bg-[#0D1F3D]/10" iconTextColor="text-[#0D1F3D]" />
      <KpiCard title="Attendance %" value={`${summary.percentage}%`} icon={Award} iconBgColor="bg-blue-500/10" iconTextColor="text-blue-600" />
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8 space-y-4">
        <div className="flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-[#E20613]" /><h3 className="text-base font-extrabold text-[#0D1F3D]">Attendance Calendar - {data.period}</h3></div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold text-slate-400 pb-1 border-b border-slate-100">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {Array.from({ length: mondayOffset }, (_, index) => <div key={`offset-${index}`} className="h-16 rounded-xl border border-slate-100 bg-slate-50/30" />)}
          {Array.from({ length: daysInMonth }, (_, index) => { const day = index + 1; const record = byDay.get(day); const code = record ? statusCode[record.status] ?? record.status : '—'; const badge = code === 'A' ? 'bg-red-100 text-[#E20613]' : code === 'L' ? 'bg-amber-100 text-amber-700' : code === 'HD' ? 'bg-purple-100 text-purple-700' : code === '—' ? 'bg-slate-100 text-slate-400' : 'bg-emerald-100 text-emerald-700'; return <div key={day} className="h-16 rounded-xl border border-slate-200/80 bg-slate-50/60 p-1.5 flex flex-col justify-between hover:bg-white hover:shadow-xs transition duration-150"><div className="flex items-center justify-between"><span className="text-xs font-extrabold text-[#0D1F3D]">{day}</span><span className={`rounded-md px-1.5 py-0.5 text-[9px] font-extrabold ${badge}`}>{code}</span></div>{record?.punchInTime ? <div className="text-[9px] font-semibold text-slate-500 space-y-0.5"><p>In: {time.format(new Date(record.punchInTime))}</p><p>Out: {record.punchOutTime ? time.format(new Date(record.punchOutTime)) : '—'}</p></div> : null}</div>; })}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-3 border-t border-slate-100 text-slate-600"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> P: Present</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#E20613]" /> A: Absent</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> L: Late</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> HD: Half Day</span></div>
      </div>

      <div className="space-y-6 lg:col-span-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4"><h3 className="text-base font-extrabold text-[#0D1F3D]">Attendance Distribution</h3>{data.days.length ? <div className="h-44 w-full relative flex items-center justify-center"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={breakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">{breakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} /></PieChart></ResponsiveContainer><div className="absolute flex flex-col items-center justify-center text-center"><span className="text-xl font-extrabold text-[#0D1F3D]">{summary.percentage}%</span><span className="text-[10px] font-bold text-slate-400">Attendance</span></div></div> : <p className="py-12 text-center text-xs font-semibold text-slate-500">No attendance records are available for this month.</p>}</div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3"><h3 className="text-base font-extrabold text-[#0D1F3D]">Punctuality Insights</h3><div className="grid grid-cols-2 gap-2 text-center text-xs"><div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100"><p className="text-[10px] font-bold text-slate-400">Avg Working Hours</p><p className="font-extrabold text-[#E20613] mt-0.5">{duration(summary.averageWorkMinutes)}</p></div><div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100"><p className="text-[10px] font-bold text-slate-400">Late Days</p><p className="font-extrabold text-[#0D1F3D] mt-0.5">{summary.late}</p></div></div></div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3"><h3 className="text-base font-extrabold text-[#0D1F3D]">Recent Leaves</h3><p className="rounded-xl bg-slate-50 p-4 text-center text-xs font-semibold text-slate-500 border border-slate-100">No leave records are available for this executive.</p></div>
      </div>
    </div>
  </div>;
}
