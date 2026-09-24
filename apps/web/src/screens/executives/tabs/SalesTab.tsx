import { CheckCircle2, IndianRupee, Layers, Target, TrendingUp, Trophy } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import type { ExecutiveProfileData } from '../executive-profile.types';

const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });

export function SalesTab({ data }: { data: ExecutiveProfileData['sales'] }) {
  const totalStages = data.stages.reduce((sum, item) => sum + item.count, 0);
  return <div className="space-y-6 font-sans">
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <KpiCard title="Leads Assigned" value={data.summary.leadsAssigned} icon={Target} iconBgColor="bg-[#0D1F3D]/10" iconTextColor="text-[#0D1F3D]" />
      <KpiCard title="Leads Converted" value={data.summary.leadsConverted} icon={CheckCircle2} iconBgColor="bg-emerald-500/10" iconTextColor="text-emerald-600" />
      <KpiCard title="Deals Won" value={data.summary.dealsWon} icon={Trophy} iconBgColor="bg-amber-500/10" iconTextColor="text-amber-600" />
      <KpiCard title="Revenue Generated" value={currency.format(data.summary.revenue)} icon={IndianRupee} iconBgColor="bg-red-500/10" iconTextColor="text-[#E20613]" />
      <KpiCard title="Pipeline Value" value={currency.format(data.summary.pipelineValue)} icon={TrendingUp} iconBgColor="bg-blue-500/10" iconTextColor="text-blue-600" />
      <KpiCard title="Pipeline Deals" value={totalStages} icon={Layers} iconBgColor="bg-purple-500/10" iconTextColor="text-purple-600" />
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3"><h3 className="text-base font-extrabold text-[#0D1F3D]">Revenue Trend</h3><div className="h-44 w-full pt-1"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data.trend}><XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} /><YAxis stroke="#94A3B8" fontSize={11} tickLine={false} /><Tooltip contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }} formatter={(value) => currency.format(Number(value))} /><Area type="monotone" dataKey="revenue" name="Revenue" stroke="#E20613" strokeWidth={3} fill="#E20613" fillOpacity={0.15} /></AreaChart></ResponsiveContainer></div></div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3"><h3 className="text-base font-extrabold text-[#0D1F3D]">Deals Won Log</h3><div className="overflow-x-auto"><table className="w-full text-left text-xs font-semibold"><thead><tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase"><th className="px-3 py-3">Deal / Customer</th><th className="px-3 py-3">Deal Code</th><th className="px-3 py-3">Deal Value</th><th className="px-3 py-3">Won Date</th></tr></thead><tbody className="divide-y divide-slate-100 text-slate-700">{data.wonDeals.length ? data.wonDeals.map((deal) => <tr key={deal.id} className="hover:bg-slate-50"><td className="px-3 py-3"><p className="font-extrabold text-[#0D1F3D]">{deal.title}</p><p className="text-[10px] text-slate-400">{deal.customer || 'Customer not linked'}</p></td><td className="px-3 py-3 text-slate-500">{deal.dealCode}</td><td className="px-3 py-3 font-extrabold text-[#E20613]">{currency.format(deal.amount)}</td><td className="px-3 py-3 text-slate-500">{date.format(new Date(deal.wonAt))}</td></tr>) : <tr><td colSpan={4} className="px-3 py-12 text-center text-slate-500">No won deals are recorded for this executive.</td></tr>}</tbody></table></div></div>
      </div>
      <div className="space-y-6 lg:col-span-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4"><h3 className="text-base font-extrabold text-[#0D1F3D]">Sales Funnel (Current)</h3><div className="space-y-2 text-xs font-semibold">{data.stages.length ? data.stages.map((item, index) => { const percentage = totalStages ? Math.round((item.count / totalStages) * 1000) / 10 : 0; const colors = ['bg-[#0D1F3D]', 'bg-blue-600', 'bg-indigo-600', 'bg-amber-500', 'bg-[#E20613]']; return <div key={item.stage} className={`flex items-center justify-between rounded-xl p-2.5 text-white ${colors[index % colors.length]}`}><span className="capitalize">{item.stage.replace(/_/g, ' ')}</span><span className="font-extrabold">{item.count} ({percentage}%)</span></div>; }) : <p className="rounded-xl bg-slate-50 p-4 text-center text-slate-500 border border-slate-100">No pipeline records are available.</p>}</div></div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3"><h3 className="text-base font-extrabold text-[#0D1F3D]">Top Products / Services</h3><p className="rounded-xl bg-slate-50 p-4 text-center text-xs font-semibold text-slate-500 border border-slate-100">Product-level sales data is not recorded for these deals.</p></div>
      </div>
    </div>
  </div>;
}
