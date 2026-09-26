import React from 'react';
import { Target, PhoneCall, PhoneIncoming, Clock, Calendar, CheckCircle2, Activity, Percent, ArrowUpRight } from 'lucide-react';
import { TelecallerKpis } from '../telecaller.api';

interface KpiSummaryBarProps {
  kpis: TelecallerKpis;
}

export const KpiSummaryBar: React.FC<KpiSummaryBarProps> = ({ kpis }) => {
  const formatSeconds = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const completedPct = Math.round((kpis.callsCompleted / kpis.dailyCallTarget) * 100);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {/* 1. Daily Call Target */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Daily Call Target</span>
          <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-xl font-black text-[#0D1F3D]">{kpis.dailyCallTarget}</span>
        </div>
        <div className="mt-2">
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${completedPct}%` }} />
          </div>
          <span className="text-[10px] font-bold text-red-600 mt-1 inline-block">{completedPct}% completed</span>
        </div>
      </div>

      {/* 2. Calls Completed */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Calls Completed</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <PhoneCall className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-xl font-black text-[#0D1F3D]">
            {kpis.callsCompleted} <span className="text-xs text-slate-400 font-semibold">/{kpis.dailyCallTarget}</span>
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
          <ArrowUpRight className="w-3 h-3" />
          <span>{kpis.callsVsYesterdayPct}% vs yesterday</span>
        </div>
      </div>

      {/* 3. Connected Calls */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Connected Calls</span>
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <PhoneIncoming className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1.5">
          <span className="text-xl font-black text-[#0D1F3D]">{kpis.connectedCalls}</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
          <ArrowUpRight className="w-3 h-3" />
          <span>{kpis.connectedVsYesterdayPct}% vs yesterday</span>
        </div>
      </div>

      {/* 4. Follow-ups Due */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Follow-ups Due</span>
          <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1.5">
          <span className="text-xl font-black text-[#0D1F3D]">{kpis.followUpsDue}</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-red-600">
          <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-black">{kpis.followUpsOverdue} Overdue</span>
        </div>
      </div>

      {/* 5. Demos Booked */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Demos Booked</span>
          <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
            <Calendar className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1.5">
          <span className="text-xl font-black text-[#0D1F3D]">{kpis.demosBooked}</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
          <ArrowUpRight className="w-3 h-3" />
          <span>{kpis.demosVsYesterdayPct}% vs yesterday</span>
        </div>
      </div>

      {/* 6. Conversions */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Conversions</span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1.5">
          <span className="text-xl font-black text-[#0D1F3D]">{kpis.conversions}</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
          <ArrowUpRight className="w-3 h-3" />
          <span>{kpis.conversionsVsYesterdayPct}% vs yesterday</span>
        </div>
      </div>

      {/* 7. Talk Time */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Talk Time</span>
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1.5">
          <span className="text-base font-black text-[#0D1F3D] font-mono">{formatSeconds(kpis.talkTimeSeconds)}</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
          <ArrowUpRight className="w-3 h-3" />
          <span>{kpis.talkTimeVsYesterdayPct}% vs yesterday</span>
        </div>
      </div>

      {/* 8. Conversion Rate */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Conversion Rate</span>
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Percent className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-1.5">
          <span className="text-xl font-black text-[#0D1F3D]">{kpis.conversionRatePct}%</span>
        </div>
        <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
          <ArrowUpRight className="w-3 h-3" />
          <span>{kpis.conversionRateVsYesterdayPp} pp vs yesterday</span>
        </div>
      </div>
    </div>
  );
};
