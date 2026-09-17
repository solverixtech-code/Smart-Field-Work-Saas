import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  Phone,
  Monitor,
  Trophy,
  Target,
  Plus,
  Building2,
  TrendingUp,
  Clock,
  Zap,
  ChevronRight,
  Flame,
  X,
  User,
  ArrowUpRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import {
  mockPipelineDeals,
  pipelineStagesList,
  PipelineDealCard,
} from './salesPipelineData';

export default function SalesPipelinePage() {
  const navigate = useNavigate();

  // Drag and Drop & Deals State
  const [deals, setDeals] = useState<PipelineDealCard[]>(mockPipelineDeals);
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<string | null>(null);

  // Filters State
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedExec, setSelectedExec] = useState('all');
  const [pipelineDate, setPipelineDate] = useState('2025-05-24');

  const handleCardClick = (deal: PipelineDealCard) => {
    toast.info(`Viewing details for ${deal.businessName}`);
    navigate(`/admin/leads/${deal.id}`);
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
    setDraggedDealId(dealId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStageId(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStageId(null);
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    setDragOverStageId(null);
    const dealId = e.dataTransfer.getData('text/plain') || draggedDealId;
    if (!dealId) return;

    const targetStageConfig = pipelineStagesList.find((s) => s.id === targetStageId);
    const foundDeal = deals.find((d) => d.id === dealId);

    if (foundDeal && foundDeal.stage !== targetStageId) {
      setDeals((prevDeals) =>
        prevDeals.map((d) => {
          if (d.id === dealId) {
            return {
              ...d,
              stage: targetStageId as any,
              stageLabel: targetStageConfig?.title || d.stageLabel,
            };
          }
          return d;
        })
      );
      toast.success(`Moved "${foundDeal.businessName}" to ${targetStageConfig?.title || targetStageId}`);
    }
    setDraggedDealId(null);
  };

  return (
    <div className="space-y-5 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & PAGE HEADER */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/leads')}>
            Sales & Field
          </span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[#0D1F3D] font-bold">Sales Pipeline</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1F3D]">Sales Pipeline</h1>
            <p className="text-xs font-semibold text-slate-500">
              Track active deal progress, revenue forecast, and stage conversions across your field team.
            </p>
          </div>

          {/* Header Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Standard DatePicker Component */}
            <div className="w-44">
              <DatePicker
                value={pipelineDate}
                onChange={(d) => {
                  setPipelineDate(d);
                  toast.success(`Pipeline filtered for ${d}`);
                }}
              />
            </div>

            {/* Teams Dropdown */}
            <div className="w-40">
              <Select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                options={[
                  { value: 'all', label: 'All Teams' },
                  { value: 'western', label: 'Western Suburbs' },
                  { value: 'central', label: 'Central Suburbs' },
                  { value: 'thane', label: 'Thane Cluster' },
                ]}
                searchable={false}
              />
            </div>

            {/* Executives Dropdown */}
            <div className="w-44">
              <Select
                value={selectedExec}
                onChange={(e) => setSelectedExec(e.target.value)}
                options={[
                  { value: 'all', label: 'All Executives' },
                  { value: 'amit', label: 'Amit Verma' },
                  { value: 'neha', label: 'Neha Sharma' },
                  { value: 'rahul', label: 'Rahul Gupta' },
                  { value: 'pooja', label: 'Pooja Yadav' },
                ]}
                searchable={false}
              />
            </div>

            {/* Primary Action Button */}
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/admin/leads/create')}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md px-4 py-2.5"
            >
              <Plus className="h-4 w-4" /> Add Lead
            </Button>
          </div>
        </div>
      </div>

      {/* TOP KPI METRICS SUMMARY GRID (5 CARDS) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Leads</span>
            <span className="text-2xl font-extrabold text-[#0D1F3D]">246</span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              ▲ 12% vs last week
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Contacted</span>
            <span className="text-2xl font-extrabold text-[#0D1F3D]">78</span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              ▲ 18% vs last week
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
            <Phone className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Demo Scheduled</span>
            <span className="text-2xl font-extrabold text-[#0D1F3D]">42</span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              ▲ 22% vs last week
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Monitor className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Won Deals</span>
            <span className="text-2xl font-extrabold text-[#0D1F3D]">26</span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              ▲ 30% vs last week
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <Trophy className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Win Conversion</span>
            <span className="text-2xl font-extrabold text-[#0D1F3D]">10.57%</span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              ▲ 2.4% vs last week
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <Target className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* FULL-WIDTH 6-COLUMN KANBAN PIPELINE BOARD */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#0D1F3D]">Sales Pipeline Stages</h2>
          <span className="text-xs font-semibold text-slate-500">6 Active Stages • Click stage to view details</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3.5 items-start">
          {pipelineStagesList.map((stg) => {
            const stageDeals = deals.filter((d) => d.stage === stg.id);
            const isDragOver = dragOverStageId === stg.id;

            return (
              <div
                key={stg.id}
                onDragOver={(e) => handleDragOver(e, stg.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stg.id)}
                className={`space-y-3 rounded-md p-3 border transition-all ${
                  isDragOver
                    ? 'bg-purple-50/80 border-purple-400 ring-2 ring-purple-400/30'
                    : 'bg-slate-100/70 border-slate-200/80'
                }`}
              >
                {/* Column Header */}
                <div
                  onClick={() => navigate(`/admin/sales/${stg.routeKey}`)}
                  className="flex items-center justify-between rounded-md bg-white p-2.5 border border-slate-200/90 shadow-2xs cursor-pointer hover:border-purple-300 transition"
                >
                  <span className="text-xs font-extrabold text-[#0D1F3D]">
                    {stg.title} <span className="text-slate-500 font-bold">({stageDeals.length})</span>
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stg.color }} />
                </div>

                {/* Column Card List */}
                <div className="space-y-2.5 min-h-[280px]">
                  {stageDeals.map((deal) => {
                    const isBeingDragged = draggedDealId === deal.id;
                    return (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal.id)}
                        onDragEnd={() => setDraggedDealId(null)}
                        onClick={() => handleCardClick(deal)}
                        className={`rounded-md border border-slate-200/90 bg-white p-3 shadow-xs space-y-2.5 cursor-grab active:cursor-grabbing hover:border-purple-600 hover:shadow-md transition-all group ${
                          isBeingDragged ? 'opacity-40 scale-95 border-dashed border-purple-500' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-xs font-bold mt-0.5">
                            <Building2 className="h-3.5 w-3.5" />
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-extrabold text-[#0D1F3D] group-hover:text-purple-600 transition truncate">
                              {deal.businessName}
                            </h4>
                            <p className="text-[10px] font-semibold text-slate-400 truncate">
                              {deal.city}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          {deal.amount && deal.amount > 0 ? (
                            <span className="font-extrabold text-[#0D1F3D] text-xs">
                              ₹{deal.amount.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-slate-400 italic">
                              Value Unspecified
                            </span>
                          )}
                          <span className="text-[10px] font-medium text-slate-400">
                            {deal.date}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={deal.executiveAvatar}
                              alt={deal.executiveName}
                              className="h-5 w-5 rounded-full object-cover border border-slate-200"
                            />
                            <span className="text-[10px] font-semibold text-slate-600 truncate max-w-[80px]">
                              {deal.executiveName}
                            </span>
                          </div>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold border ${stg.badgeBg} ${stg.badgeText} ${stg.badgeBorder}`}
                          >
                            {stg.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/admin/sales/${stg.routeKey}`)}
                  className="w-full text-center text-xs font-bold text-slate-600 hover:text-purple-700 py-1.5 rounded-md hover:bg-white transition cursor-pointer"
                >
                  + View All ({stageDeals.length})
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ANALYTICS WIDGETS ROW (ACCORDING TO VISIBLO_DESIGN_SYSTEM.md SECTION 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* CARD 1: TOP DEAL SPOTLIGHT */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0D1F3D]">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Top Deal Spotlight</span>
            </div>
            <span className="rounded-full bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-0.5 text-[10px] font-extrabold">
              🔥 Hot Opportunity
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">FreshMart Grocery</h3>
              <p className="text-xs font-semibold text-slate-400">Bhiwandi, Maharashtra</p>
              <p className="text-base font-black text-purple-700 mt-0.5">₹25,000</p>
            </div>
          </div>

          <Button
            variant="accent"
            fullWidth
            size="sm"
            onClick={() => navigate('/admin/leads/dl-101')}
            className="font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md text-xs py-2"
          >
            View Opportunity Details
          </Button>
        </div>

        {/* CARD 2: PIPELINE VALUE BREAKDOWN */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Pipeline Value Distribution</h3>
            <span className="text-[11px] font-semibold text-slate-500">₹2.46 Cr Total</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs font-semibold pt-1">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-600">New Deals</span>
              <span className="font-extrabold text-[#0D1F3D] ml-auto">24%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-600">Contacted</span>
              <span className="font-extrabold text-[#0D1F3D] ml-auto">27%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span className="text-slate-600">Demo Scheduled</span>
              <span className="font-extrabold text-[#0D1F3D] ml-auto">17%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-600">Negotiation</span>
              <span className="font-extrabold text-[#0D1F3D] ml-auto">16%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Won</span>
              <span className="font-extrabold text-[#0D1F3D] ml-auto">11%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="text-slate-600">Lost</span>
              <span className="font-extrabold text-[#0D1F3D] ml-auto">6%</span>
            </div>
          </div>
        </div>

        {/* CARD 3: SALES INSIGHTS METRICS */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Sales Performance Insights
          </h3>

          <div className="space-y-2.5 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Win Rate Conversion</span>
              <span className="font-extrabold text-[#0D1F3D]">10.57% <span className="text-[10px] text-emerald-600">▲ 2.4%</span></span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-600">Average Deal Size</span>
              <span className="font-extrabold text-[#0D1F3D]">₹58,000 <span className="text-[10px] text-emerald-600">▲ 6.7%</span></span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-600">Average Sales Velocity</span>
              <span className="font-extrabold text-[#0D1F3D]">12 days <span className="text-[10px] text-red-600">▼ 14%</span></span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-600">Deals in Active Pipeline</span>
              <span className="font-extrabold text-[#0D1F3D]">151 deals</span>
            </div>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH RECENT ACTIVITIES STREAM TABLE */}
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-extrabold text-[#0D1F3D]">Recent Pipeline Activities</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Full sales activity log opened')}
            className="text-xs font-bold text-slate-700"
          >
            View All Activities →
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-extrabold text-[#0D1F3D]">
                <th className="py-2.5 px-3">Lead / Business</th>
                <th className="py-2.5 px-3">Stage</th>
                <th className="py-2.5 px-3">Executive</th>
                <th className="py-2.5 px-3">Last Activity</th>
                <th className="py-2.5 px-3">Next Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-extrabold text-[#0D1F3D]">FreshMart Grocery</td>
                <td className="py-2.5 px-3">
                  <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-[10px] font-extrabold border border-blue-200/60">
                    New Deal
                  </span>
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-600">Amit Verma</td>
                <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">24 May 2025 – 11:24 AM</td>
                <td className="py-2.5 px-3 font-bold text-purple-700">26 May 2025</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-extrabold text-[#0D1F3D]">Prime Wellness</td>
                <td className="py-2.5 px-3">
                  <span className="rounded-full bg-amber-50 text-amber-700 px-2.5 py-0.5 text-[10px] font-extrabold border border-amber-200/60">
                    Negotiation
                  </span>
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-600">Vikram Joshi</td>
                <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">24 May 2025 – 10:48 AM</td>
                <td className="py-2.5 px-3 font-bold text-purple-700">25 May 2025</td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="py-2.5 px-3 font-extrabold text-[#0D1F3D]">Wellness Hub</td>
                <td className="py-2.5 px-3">
                  <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-[10px] font-extrabold border border-emerald-200/60">
                    Won
                  </span>
                </td>
                <td className="py-2.5 px-3 font-medium text-slate-600">Pooja Yadav</td>
                <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">24 May 2025 – 09:32 AM</td>
                <td className="py-2.5 px-3 text-slate-400 font-medium">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
