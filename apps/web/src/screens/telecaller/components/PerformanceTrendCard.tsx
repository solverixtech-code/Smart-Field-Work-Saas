import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowRight } from 'lucide-react';
import { PerformanceTrendDay } from '../telecaller.api';

interface PerformanceTrendCardProps {
  data: PerformanceTrendDay[];
  weeklyAvg: {
    calls: number;
    callsChangePct: number;
    connected: number;
    connectedChangePct: number;
    conversions: number;
    conversionsChangePct: number;
  };
}

export const PerformanceTrendCard: React.FC<PerformanceTrendCardProps> = ({ data, weeklyAvg }) => {
  const maxVal = Math.max(...data.map((d) => Math.max(d.callsCompleted, d.connectedCalls, d.conversions)), 100);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between h-full min-h-[300px]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">My Performance Trend</h3>
              <span className="text-[10px] font-semibold text-slate-400">(Last 7 Days)</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 mt-1">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Calls Completed</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Connected Calls</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Conversions</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* SVG Line/Bar Visualizer */}
          <div className="lg:col-span-3 h-36 flex items-end justify-between gap-2 pt-4 px-2 bg-slate-50/50 rounded-xl border border-slate-100 relative">
            {data.map((item, idx) => {
              const callsH = Math.round((item.callsCompleted / maxVal) * 100);
              const connH = Math.round((item.connectedCalls / maxVal) * 100);
              const convH = Math.round((item.conversions / maxVal) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-28">
                    <div className="w-2 bg-red-500/80 rounded-t group-hover:bg-red-600 transition-all" style={{ height: `${callsH}%` }} title={`Calls: ${item.callsCompleted}`} />
                    <div className="w-2 bg-blue-500/80 rounded-t group-hover:bg-blue-600 transition-all" style={{ height: `${connH}%` }} title={`Connected: ${item.connectedCalls}`} />
                    <div className="w-2 bg-emerald-500/80 rounded-t group-hover:bg-emerald-600 transition-all" style={{ height: `${convH}%` }} title={`Conversions: ${item.conversions}`} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-500">{item.day}</span>
                </div>
              );
            })}
          </div>

          {/* Right Weekly Averages Panel */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-2.5 flex flex-col justify-center">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">This Week (Avg/Day)</span>

            <div>
              <p className="text-[10px] text-slate-500 font-semibold">Calls</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-[#0D1F3D]">{weeklyAvg.calls}</span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> {weeklyAvg.callsChangePct}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 font-semibold">Connected Calls</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-[#0D1F3D]">{weeklyAvg.connected}</span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> {weeklyAvg.connectedChangePct}%
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-slate-500 font-semibold">Conversions</p>
              <div className="flex items-center justify-between">
                <span className="text-base font-black text-[#0D1F3D]">{weeklyAvg.conversions}</span>
                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> {weeklyAvg.conversionsChangePct}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Link */}
      <div className="mt-3 pt-2 border-t border-slate-100 text-center">
        <button
          type="button"
          className="text-xs font-extrabold text-slate-600 hover:text-red-600 flex items-center justify-center gap-1 w-full transition-colors"
        >
          <span>View Detailed Report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
