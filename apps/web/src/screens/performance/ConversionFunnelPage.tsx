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
  Info,
  ArrowDown,
  CheckCircle2,
  Users,
  Monitor,
  DollarSign,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface StagePerformance {
  id: string;
  stageName: string;
  shortLabel: string;
  count: number;
  conversionFromPrevPct: number;
  conversionFromTotalPct: number;
  changeVsAprPct: number;
  dropOffCount: number;
  widthClass: string;
  colorClass: string;
  bgHex: string;
  revenueVal: string;
  description: string;
}

const funnelStages: StagePerformance[] = [
  {
    id: 'stage-1',
    stageName: '1. Total Leads Generated',
    shortLabel: 'Total Leads',
    count: 15280,
    conversionFromPrevPct: 100,
    conversionFromTotalPct: 100,
    changeVsAprPct: 16.2,
    dropOffCount: 0,
    widthClass: 'w-full',
    colorClass: 'bg-purple-600 hover:bg-purple-700',
    bgHex: '#9333ea',
    revenueVal: '₹0 (Top Funnel)',
    description: 'All inbound marketing leads, field executive signups, and store discovery entries.',
  },
  {
    id: 'stage-2',
    stageName: '2. Contacted / Visited',
    shortLabel: 'Visited / Contacted',
    count: 9842,
    conversionFromPrevPct: 64.5,
    conversionFromTotalPct: 64.5,
    changeVsAprPct: 9.8,
    dropOffCount: 5438,
    widthClass: 'w-[86%]',
    colorClass: 'bg-blue-600 hover:bg-blue-700',
    bgHex: '#2563eb',
    revenueVal: '₹1.85L (Pipeline Value)',
    description: 'Leads verified by field executive in-person visit or outbound phone call.',
  },
  {
    id: 'stage-3',
    stageName: '3. Demos Conducted',
    shortLabel: 'Demos Conducted',
    count: 2856,
    conversionFromPrevPct: 29.0,
    conversionFromTotalPct: 18.7,
    changeVsAprPct: 7.1,
    dropOffCount: 6986,
    widthClass: 'w-[68%]',
    colorClass: 'bg-amber-500 hover:bg-amber-600',
    bgHex: '#f59e0b',
    revenueVal: '₹4.50L (Demo Stage Value)',
    description: 'In-person POS/CRM product walkthrough completed at merchant store location.',
  },
  {
    id: 'stage-4',
    stageName: '4. Converted / Won',
    shortLabel: 'Converted / Won',
    count: 1248,
    conversionFromPrevPct: 43.7,
    conversionFromTotalPct: 8.2,
    changeVsAprPct: 11.3,
    dropOffCount: 1608,
    widthClass: 'w-[48%]',
    colorClass: 'bg-emerald-600 hover:bg-emerald-700',
    bgHex: '#059669',
    revenueVal: '₹12.48L (Closed Revenue)',
    description: 'Merchants onboarded with active paid subscription or hardware sale contract.',
  },
  {
    id: 'stage-5',
    stageName: '5. Revenue Realized',
    shortLabel: 'Revenue Realized',
    count: 892,
    conversionFromPrevPct: 71.3,
    conversionFromTotalPct: 5.8,
    changeVsAprPct: 13.6,
    dropOffCount: 356,
    widthClass: 'w-[32%]',
    colorClass: 'bg-teal-600 hover:bg-teal-700',
    bgHex: '#0d9488',
    revenueVal: '₹12.48L (Fully Collected)',
    description: 'Payments fully collected and verified by Finance Ops.',
  },
];

export const ConversionFunnelPage: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<string>('stage-1');

  const activeStage = funnelStages.find((s) => s.id === (hoveredStageId || selectedStageId)) || funnelStages[0];

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
              Interactive lead journey conversion stages from initial discovery to deal win and revenue realization
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
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Funnel Stage Breakdown</h3>
              <p className="text-[11px] font-medium text-slate-500">Hover or click any stage to inspect drop-off, conversion rates, and stage details</p>
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Interactive Stage Inspection
            </span>
          </div>

          {/* INTERACTIVE VISUAL FUNNEL STACK */}
          <div className="space-y-2.5 py-3">
            {funnelStages.map((f) => {
              const isSelected = selectedStageId === f.id;
              const isHovered = hoveredStageId === f.id;
              const isActive = isSelected || isHovered;

              return (
                <div key={f.id} className="mx-auto flex flex-col items-center">
                  <div
                    onMouseEnter={() => setHoveredStageId(f.id)}
                    onMouseLeave={() => setHoveredStageId(null)}
                    onClick={() => { setSelectedStageId(f.id); toast.info(`Selected ${f.shortLabel}`); }}
                    className={`${f.widthClass} ${f.colorClass} text-white font-extrabold text-xs py-2.5 px-4 rounded-sm shadow-xs transition-all duration-200 cursor-pointer transform ${
                      isActive
                        ? 'scale-[1.03] shadow-lg ring-2 ring-offset-2 ring-[#0D1F3D] opacity-100 z-10'
                        : 'opacity-90 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        <span>{f.shortLabel} ({f.count.toLocaleString('en-IN')})</span>
                      </div>
                      <span className="font-mono text-white/95">{f.conversionFromTotalPct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DYNAMIC SELECTED STAGE DETAILS CARD */}
          <div className="rounded-sm border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 transition-all">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: activeStage.bgHex }} />
                <h4 className="text-xs font-extrabold text-[#0D1F3D]">{activeStage.stageName}</h4>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                +{activeStage.changeVsAprPct}% vs. Apr
              </span>
            </div>

            <p className="text-[11px] text-slate-600 font-medium">{activeStage.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-white p-2 rounded-xs border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold block">Stage Volume</span>
                <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">{activeStage.count.toLocaleString('en-IN')} Leads</span>
              </div>
              <div className="bg-white p-2 rounded-xs border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold block">Conversion % (Prev)</span>
                <span className="font-mono font-extrabold text-blue-700 text-xs">{activeStage.conversionFromPrevPct}%</span>
              </div>
              <div className="bg-white p-2 rounded-xs border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold block">Conversion % (Total)</span>
                <span className="font-mono font-extrabold text-purple-700 text-xs">{activeStage.conversionFromTotalPct}%</span>
              </div>
              <div className="bg-white p-2 rounded-xs border border-slate-200/80">
                <span className="text-[10px] text-slate-400 font-bold block">Stage Revenue Yield</span>
                <span className="font-mono font-extrabold text-emerald-700 text-xs">{activeStage.revenueVal}</span>
              </div>
            </div>
          </div>

          {/* INTERACTIVE FUNNEL STAGE TABLE WITH BI-DIRECTIONAL HOVER */}
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
                {funnelStages.map((stg) => {
                  const isSelected = selectedStageId === stg.id;
                  const isHovered = hoveredStageId === stg.id;
                  const isActive = isSelected || isHovered;

                  return (
                    <tr
                      key={stg.id}
                      onMouseEnter={() => setHoveredStageId(stg.id)}
                      onMouseLeave={() => setHoveredStageId(null)}
                      onClick={() => setSelectedStageId(stg.id)}
                      className={`transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-purple-50/80 font-bold border-l-4 border-purple-600'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-[#0D1F3D]">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stg.bgHex }} />
                          {stg.stageName}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-extrabold text-blue-700">{stg.count.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">{stg.conversionFromPrevPct}%</td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-purple-700">{stg.conversionFromTotalPct}%</td>
                      <td className="py-3 px-3 text-center font-bold text-emerald-600">+{stg.changeVsAprPct}%</td>
                    </tr>
                  );
                })}
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
