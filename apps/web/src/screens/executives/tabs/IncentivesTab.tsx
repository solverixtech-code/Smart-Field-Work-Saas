import { AlertCircle, Award, CheckCircle2, IndianRupee } from 'lucide-react';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import type { ExecutiveProfileData } from '../executive-profile.types';

export function IncentivesTab({ data }: { data: ExecutiveProfileData['incentives'] }) {
  return <div className="space-y-6 font-sans">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <KpiCard title="Total Earned (This Month)" value="—" icon={IndianRupee} iconBgColor="bg-emerald-500/10" iconTextColor="text-emerald-600" />
      <KpiCard title="Total Payout (This Month)" value="—" icon={CheckCircle2} iconBgColor="bg-[#0D1F3D]/10" iconTextColor="text-[#0D1F3D]" />
      <KpiCard title="Pending Payout" value="—" icon={AlertCircle} iconBgColor="bg-amber-500/10" iconTextColor="text-amber-600" />
      <KpiCard title="YTD Earned" value="—" icon={Award} iconBgColor="bg-blue-500/10" iconTextColor="text-blue-600" />
      <KpiCard title="YTD Payout" value="—" icon={IndianRupee} iconBgColor="bg-red-500/10" iconTextColor="text-[#E20613]" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8 space-y-3"><h3 className="text-base font-extrabold text-[#0D1F3D]">Incentive Details Log</h3><p className="rounded-xl border border-slate-100 bg-slate-50/60 p-10 text-center text-xs font-semibold text-slate-500">{data.message}</p></div>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4 space-y-3"><h3 className="text-base font-extrabold text-[#0D1F3D]">Incentive Plan Summary</h3><p className="rounded-xl border border-slate-100 bg-slate-50/60 p-6 text-center text-xs font-semibold text-slate-500">No incentive plan is linked to this executive.</p></div>
    </div>
  </div>;
}
