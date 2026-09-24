import { Target, TrendingUp } from 'lucide-react';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ExecutiveProfileData } from '../executive-profile.types';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const colors = ['#0D1F3D', '#E20613', '#10B981', '#F59E0B', '#8B5CF6', '#64748B'];

export function PerformanceTab({ data }: { data: ExecutiveProfileData['performance'] }) {
  const sourceData = data.leadsBySource.map((item, index) => ({ ...item, color: colors[index % colors.length] }));
  return (
    <div className="space-y-6 font-sans">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Target className="h-4 w-4 text-[#E20613]" /><h3 className="text-base font-extrabold text-[#0D1F3D]">Target Progress ({data.period})</h3></div></div>
          <div className="space-y-4 pt-1">
            {data.targets.length ? data.targets.map((target, index) => {
              const percentage = target.target ? Math.min(100, Math.round((target.achieved / target.target) * 100)) : 0;
              const display = target.kind === 'currency' ? `${currency.format(target.achieved)} / ${currency.format(target.target)}` : `${target.achieved} / ${target.target}`;
              const bar = ['bg-[#E20613]', 'bg-emerald-500', 'bg-blue-500'][index % 3];
              return <div key={target.label} className="space-y-1.5"><div className="flex justify-between text-xs font-bold"><span className="text-slate-600">{target.label}</span><span className="text-[#0D1F3D]">{display}</span></div><div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${bar}`} style={{ width: `${percentage}%` }} /></div><p className="text-right text-[10px] font-bold text-slate-400">{percentage}% achieved</p></div>;
            }) : <p className="py-12 text-center text-xs font-semibold text-slate-500">No performance targets are assigned for this period.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#E20613]" /><h3 className="text-base font-extrabold text-[#0D1F3D]">Performance Trend</h3></div>
          <div className="h-64 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.trend}><XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} /><YAxis stroke="#94A3B8" fontSize={11} tickLine={false} /><Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} /><Line type="monotone" dataKey="leadsAssigned" name="Leads" stroke="#0D1F3D" strokeWidth={3} /><Line type="monotone" dataKey="leadsConverted" name="Converted" stroke="#10B981" strokeWidth={2} /><Line type="monotone" dataKey="dealsWon" name="Deals" stroke="#E20613" strokeWidth={2} /></LineChart></ResponsiveContainer></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-7 space-y-4">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Leads by Source</h3>
          {sourceData.length ? <div className="grid grid-cols-1 items-center gap-5 sm:grid-cols-2"><div className="h-52"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={sourceData} cx="50%" cy="50%" innerRadius={52} outerRadius={78} dataKey="value">{sourceData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} /></PieChart></ResponsiveContainer></div><div className="space-y-2 text-xs font-semibold">{sourceData.map((source) => <div key={source.name} className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: source.color }} />{source.name}</span><span className="font-extrabold text-[#0D1F3D]">{source.value}</span></div>)}</div></div> : <p className="py-12 text-center text-xs font-semibold text-slate-500">No lead source data is available for this executive.</p>}
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-5 space-y-4">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Field Performance</h3>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4"><p className="text-xs font-bold text-slate-500">Visit completion rate</p><p className="mt-1 text-2xl font-extrabold text-[#0D1F3D]">{data.visitCompletionRate}%</p></div>
          <p className="text-xs font-semibold text-slate-500">Customer ratings and manager review scores will appear when those records are available.</p>
        </div>
      </div>
    </div>
  );
}
