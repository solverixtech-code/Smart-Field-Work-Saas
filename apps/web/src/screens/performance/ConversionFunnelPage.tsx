import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Target,
  TrendingUp,
  Download,
  ChevronRight,
  Filter,
  Eye,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface StagePerformance {
  stage: string;
  count: number;
  conversionFromPrevPct: number;
  conversionFromTotalPct: number;
  changeVsAprPct: number;
}

const funnelStages: StagePerformance[] = [
  { stage: '1. Total Leads Generated', count: 15280, conversionFromPrevPct: 100, conversionFromTotalPct: 100, changeVsAprPct: 16.2 },
  { stage: '2. Contacted / Visited', count: 9842, conversionFromPrevPct: 64.5, conversionFromTotalPct: 64.5, changeVsAprPct: 9.8 },
  { stage: '3. Demos Conducted', count: 2856, conversionFromPrevPct: 29.0, conversionFromTotalPct: 18.7, changeVsAprPct: 7.1 },
  { stage: '4. Converted / Won', count: 1248, conversionFromPrevPct: 43.7, conversionFromTotalPct: 8.2, changeVsAprPct: 11.3 },
  { stage: '5. Revenue Generated', count: 892, conversionFromPrevPct: 71.3, conversionFromTotalPct: 5.8, changeVsAprPct: 13.6 },
];

export const ConversionFunnelPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB HEADER */}
      <div className="space-y-2 border-b border-slate-200/80 pb-3.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span>Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span>Performance</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-extrabold text-[#0D1F3D]">Conversion Funnel</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Conversion Funnel</h1>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                <Target className="h-4 w-4" />
              </span>
            </div>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Track lead journey conversion stages from initial discovery to deal win and revenue realization
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting Conversion Funnel Report...')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </Button>
        </div>
      </div>

      {/* TOP 5 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Leads (Top)</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">15,280</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 16.2% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Visited / Contacted</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">9,842</div>
          <p className="text-[11px] font-bold text-blue-600">64.5% of total leads</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Demos Conducted</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">2,856</div>
          <p className="text-[11px] font-bold text-purple-600">18.7% of total leads</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Converted / Won</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">1,248</div>
          <p className="text-[11px] font-bold text-emerald-600">8.2% conversion rate</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Revenue Generated</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">₹ 12,48,500</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 18.4% vs. Apr 2025</p>
        </div>
      </div>

      {/* STAGE-BY-STAGE FUNNEL DIAGRAM & TABLE */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-8 space-y-4">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Funnel Stage Breakdown</h3>

          {/* Visual Funnel Stack */}
          <div className="space-y-2 py-2">
            {[
              { label: 'Total Leads (15,280)', width: 'w-full', bg: 'bg-purple-600', pct: '100%' },
              { label: 'Visited / Contacted (9,842)', width: 'w-[85%]', bg: 'bg-blue-600', pct: '64.5%' },
              { label: 'Demos Conducted (2,856)', width: 'w-[65%]', bg: 'bg-amber-500', pct: '18.7%' },
              { label: 'Converted / Won (1,248)', width: 'w-[45%]', bg: 'bg-emerald-600', pct: '8.2%' },
              { label: 'Revenue Realized (892)', width: 'w-[30%]', bg: 'bg-teal-600', pct: '5.8%' },
            ].map((f) => (
              <div key={f.label} className="mx-auto flex flex-col items-center">
                <div className={`${f.width} ${f.bg} text-white font-extrabold text-xs py-2 px-4 rounded-xs shadow-xs text-center flex justify-between`}>
                  <span>{f.label}</span>
                  <span className="font-mono">{f.pct}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Funnel Stage Table */}
          <div className="overflow-x-auto custom-scrollbar pt-2">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3 text-center">Count</th>
                  <th className="py-2.5 px-3 text-center">Conversion % (Previous)</th>
                  <th className="py-2.5 px-3 text-center">Conversion % (Total)</th>
                  <th className="py-2.5 px-3 text-center">Change vs. Apr</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {funnelStages.map((stg) => (
                  <tr key={stg.stage} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-[#0D1F3D]">{stg.stage}</td>
                    <td className="py-3 px-3 text-center font-mono font-extrabold text-blue-700">{stg.count.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">{stg.conversionFromPrevPct}%</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-purple-700">{stg.conversionFromTotalPct}%</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600">+{stg.changeVsAprPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebars (4 Cols) */}
        <div className="space-y-4 lg:col-span-4 flex flex-col justify-between">
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Funnel Drop-off Analysis</h3>
            <div className="flex items-center justify-between">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-8 border-purple-600 border-r-blue-500 border-b-amber-500">
                <span className="text-xs font-extrabold text-[#0D1F3D]">14,032</span>
              </div>
              <div className="space-y-1 text-xs font-semibold">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full bg-purple-600" /> Leads not contacted</span>
                  <span className="font-bold text-slate-900">5,438 (37.8%)</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full bg-blue-500" /> No demo conducted</span>
                  <span className="font-bold text-slate-900">6,986 (48.6%)</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full bg-amber-500" /> Demo not converted</span>
                  <span className="font-bold text-slate-900">1,964 (13.6%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-blue-200 bg-blue-50/40 p-4 shadow-xs space-y-2">
            <div className="flex items-center gap-2 border-b border-blue-100 pb-1.5">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h4 className="text-xs font-extrabold text-[#0D1F3D]">Funnel Key Insights</h4>
            </div>
            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-[#0D1F3D]">Lead to Contacted conversion improved by 9.8%</p>
              <p className="text-[11px] text-slate-600">Demo to Won conversion rate is highest in West Zone (14.5%).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
