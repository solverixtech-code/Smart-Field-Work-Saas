import { useState } from 'react';
import { CheckCircle2, Clock, MapPin, Search, Store } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import type { ExecutiveProfileData } from '../executive-profile.types';

const dateTime = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export function VisitsTab({ data }: { data: ExecutiveProfileData['visits'] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const query = searchTerm.trim().toLowerCase();
  const items = data.items.filter((item) => !query || [item.targetName, item.location, item.purpose, item.id].some((value) => value.toLowerCase().includes(query)));
  const summaryData = [
    { name: 'Completed', value: data.summary.completed, color: '#10B981' },
    { name: 'Scheduled', value: data.summary.scheduled, color: '#3B82F6' },
    { name: 'Cancelled', value: data.summary.cancelled, color: '#EF4444' },
  ];
  const uniqueCustomers = new Set(data.items.map((item) => item.targetName)).size;
  const totalMinutes = data.items.reduce((sum, item) => sum + item.durationMinutes, 0);

  return <div className="space-y-6 font-sans">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard title="Total Visits" value={data.summary.total} icon={Store} iconBgColor="bg-[#0D1F3D]/10" iconTextColor="text-[#0D1F3D]" />
      <KpiCard title="Unique Customers" value={uniqueCustomers} icon={MapPin} iconBgColor="bg-blue-500/10" iconTextColor="text-blue-600" />
      <KpiCard title="Productive Visits" value={data.summary.productive} subValue={data.summary.total ? `${Math.round((data.summary.productive / data.summary.total) * 100)}% of total` : 'No visits recorded'} icon={CheckCircle2} iconBgColor="bg-emerald-500/10" iconTextColor="text-emerald-600" />
      <KpiCard title="Visit Duration" value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`} icon={Clock} iconBgColor="bg-red-500/10" iconTextColor="text-[#E20613]" />
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-base font-extrabold text-[#0D1F3D]">Store & Site Visits Log</h3><div className="relative w-64"><Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" /><input type="text" placeholder="Search visits by customer, area..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none" /></div></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs font-semibold"><thead><tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider"><th className="px-3.5 py-3">Visit Details</th><th className="px-3.5 py-3">Customer & Location</th><th className="px-3.5 py-3">Visit Type</th><th className="px-3.5 py-3">Outcome</th><th className="px-3.5 py-3">Duration</th><th className="px-3.5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100 text-slate-700">
          {items.length ? items.map((item) => <tr key={item.id} className="hover:bg-slate-50 transition-colors"><td className="px-3.5 py-3"><p className="font-extrabold text-[#0D1F3D]">{dateTime.format(new Date(item.checkInTime))}</p></td><td className="px-3.5 py-3"><p className="font-extrabold text-[#0D1F3D]">{item.targetName}</p><p className="text-[10px] text-slate-400 font-medium">{item.location}</p></td><td className="px-3.5 py-3 font-semibold text-slate-600">{item.visitType}</td><td className="px-3.5 py-3"><span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold text-slate-700">{item.outcome || 'Not recorded'}</span></td><td className="px-3.5 py-3 text-slate-600 font-bold">{item.durationMinutes} min</td><td className="px-3.5 py-3"><span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${item.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : item.status === 'CANCELLED' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-amber-50 text-amber-600 border border-amber-200'}`}>{item.status}</span></td></tr>) : <tr><td colSpan={6} className="px-3 py-12 text-center text-slate-500">{query ? 'No visits match your search.' : 'No visits are recorded for this month.'}</td></tr>}
        </tbody></table></div>
      </div>

      <div className="space-y-6 lg:col-span-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4"><h3 className="text-base font-extrabold text-[#0D1F3D]">Visit Summary</h3>{data.summary.total ? <div className="h-44 w-full relative flex items-center justify-center"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={summaryData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value">{summaryData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} /></PieChart></ResponsiveContainer><div className="absolute flex flex-col items-center justify-center text-center"><span className="text-xl font-extrabold text-[#0D1F3D]">{data.summary.total}</span><span className="text-[10px] font-bold text-slate-400">Total Visits</span></div></div> : <p className="py-12 text-center text-xs font-semibold text-slate-500">No visit summary is available.</p>}</div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3"><h3 className="text-base font-extrabold text-[#0D1F3D]">Recent Visit Timeline</h3><div className="space-y-3 pl-2 border-l-2 border-slate-200 text-xs">{data.items.slice(0, 5).map((item) => <div key={item.id} className="relative pl-4 space-y-0.5"><span className="absolute -left-[17px] top-0 h-3 w-3 rounded-full bg-[#E20613] ring-4 ring-white" /><p className="text-[10px] font-bold text-slate-400">{dateTime.format(new Date(item.checkInTime))}</p><p className="font-extrabold text-[#0D1F3D]">Visited - {item.targetName}</p><p className="text-[11px] text-slate-500 font-medium">{item.purpose} · {item.durationMinutes} min</p>{item.outcome ? <span className="inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 mt-1">{item.outcome}</span> : null}</div>)}{!data.items.length ? <p className="pl-4 text-xs font-semibold text-slate-500">No visits are recorded for this month.</p> : null}</div></div>
      </div>
    </div>
  </div>;
}
