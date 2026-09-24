import { CheckCircle2, Gauge, IndianRupee, Phone, Trophy, Users } from 'lucide-react';
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import type { ExecutiveProfileData } from '../executive-profile.types';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const activityDate = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

function changeProps(value: number) {
  return {
    change: `${value >= 0 ? '+' : ''}${value}%`,
    changeType: value > 0 ? 'positive' as const : value < 0 ? 'negative' as const : 'neutral' as const,
  };
}

export function OverviewTab({ data }: { data: ExecutiveProfileData['overview'] }) {
  const remaining = data.target ? Math.max(0, data.target.target - data.target.achieved) : 0;
  const targetData = data.target ? [
    { name: 'Achieved', value: data.target.achieved, color: '#E20613' },
    { name: 'Remaining', value: remaining, color: '#E2E8F0' },
  ] : [];
  const trend = data.trend.map((item) => ({ ...item, revenueLakhs: Math.round((item.revenue / 100_000) * 100) / 100 }));

  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard title="Leads Assigned" value={data.totals.leadsAssigned} {...changeProps(data.changes.leadsAssigned)} timeframe="vs last month" icon={Users} iconBgColor="bg-[#0D1F3D]/10" iconTextColor="text-[#0D1F3D]" />
        <KpiCard title="Leads Converted" value={data.totals.leadsConverted} {...changeProps(data.changes.leadsConverted)} timeframe="vs last month" icon={CheckCircle2} iconBgColor="bg-emerald-500/10" iconTextColor="text-emerald-600" />
        <KpiCard title="Deals Won" value={data.totals.dealsWon} {...changeProps(data.changes.dealsWon)} timeframe="vs last month" icon={Trophy} iconBgColor="bg-amber-500/10" iconTextColor="text-amber-600" />
        <KpiCard title="Revenue Generated" value={currency.format(data.totals.revenue)} {...changeProps(data.changes.revenue)} timeframe="vs last month" icon={IndianRupee} iconBgColor="bg-red-500/10" iconTextColor="text-[#E20613]" />
        <KpiCard title="Conversion Rate" value={`${data.totals.conversionRate}%`} icon={Gauge} iconBgColor="bg-purple-500/10" iconTextColor="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between"><h3 className="text-base font-extrabold text-[#0D1F3D]">Target vs Achievement</h3><span className="text-xs font-bold text-slate-400">{data.target?.period ?? 'This Month'}</span></div>
          {data.target ? <>
            <div className="relative h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={targetData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} startAngle={180} endAngle={0} dataKey="value">{targetData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} formatter={(value) => currency.format(Number(value))} /></PieChart></ResponsiveContainer>
              <div className="absolute bottom-6 flex flex-col items-center justify-center text-center"><span className="text-2xl font-extrabold text-[#0D1F3D]">{data.target.percentage}%</span><span className="text-xs font-bold text-[#E20613]">Achieved</span></div>
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-semibold">
              <div className="flex items-center justify-between"><span className="text-slate-500">Target (Revenue):</span><span className="font-extrabold text-[#0D1F3D]">{currency.format(data.target.target)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Achieved (Revenue):</span><span className="font-extrabold text-[#E20613]">{currency.format(data.target.achieved)}</span></div>
              <div className="flex items-center justify-between"><span className="text-slate-500">Remaining Gap:</span><span className="font-bold text-slate-600">{currency.format(remaining)}</span></div>
            </div>
          </> : <p className="flex h-48 items-center justify-center text-center text-xs font-semibold text-slate-500">No target records are available for this month.</p>}
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between"><div><h3 className="text-base font-extrabold text-[#0D1F3D]">Monthly Performance Trend</h3><p className="text-xs text-slate-500">Tracking leads assigned vs converted vs revenue over 6 months</p></div><span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-[#0D1F3D]">Last 6 Months</span></div>
          <div className="h-60 w-full pt-2"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}>
            <defs><linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#E20613" stopOpacity={0.4} /><stop offset="95%" stopColor="#E20613" stopOpacity={0} /></linearGradient><linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0D1F3D" stopOpacity={0.3} /><stop offset="95%" stopColor="#0D1F3D" stopOpacity={0} /></linearGradient></defs>
            <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} /><YAxis stroke="#94A3B8" fontSize={11} tickLine={false} /><Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} />
            <Area type="monotone" dataKey="revenueLakhs" name="Revenue (Lakhs)" stroke="#E20613" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" /><Area type="monotone" dataKey="leadsConverted" name="Converted" stroke="#10B981" strokeWidth={2} fillOpacity={0} /><Area type="monotone" dataKey="leadsAssigned" name="Leads" stroke="#0D1F3D" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
          </AreaChart></ResponsiveContainer></div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-base font-extrabold text-[#0D1F3D]">Recent Executive Activity</h3><span className="text-xs font-bold text-[#E20613]">Real-time log</span></div>
        <div className="space-y-3 text-xs">
          {data.recentActivity.length ? data.recentActivity.map((activity) => <div key={activity.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl text-blue-600 bg-blue-50"><Phone className="h-4 w-4" /></div><div><p className="font-extrabold text-[#0D1F3D]">{activity.type} · <span className="font-medium text-slate-600">{activity.description}</span></p><p className="text-[10px] font-semibold text-slate-400">{activityDate.format(new Date(activity.occurredAt))}</p></div></div><span className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-[10px] font-bold text-[#0D1F3D] shadow-2xs">{activity.tag}</span></div>) : <p className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center font-semibold text-slate-500">No recent activity is recorded for this executive.</p>}
        </div>
      </div>
    </div>
  );
}
