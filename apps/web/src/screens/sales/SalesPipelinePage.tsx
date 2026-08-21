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
  Calendar,
  ChevronDown,
  Building2,
  TrendingUp,
  Clock,
  Zap,
  Flame,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import {
  mockPipelineDeals,
  pipelineStagesList,
  PipelineDealCard,
} from './salesPipelineData';

export default function SalesPipelinePage() {
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedExec, setSelectedExec] = useState('all');
  const [dateRange, setDateRange] = useState('May 19, 2025 – May 26, 2025');

  const handleCardClick = (deal: PipelineDealCard) => {
    toast.info(`Viewing deal details for ${deal.businessName}`);
    navigate(`/admin/leads/${deal.id}`);
  };

  return (
    <div className="space-y-5 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2">
      {/* HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-200 shadow-xs">
            <span className="font-extrabold text-lg">S</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#0D1F3D]">Sales Pipeline</h1>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Track deals. Close more. Grow faster.
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Picker Button */}
          <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs cursor-pointer hover:border-slate-300">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span>{dateRange}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>

          {/* Teams Filter */}
          <div className="w-36">
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

          {/* Executives Filter */}
          <div className="w-40">
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

          {/* Add Lead Accent Button */}
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/leads/add')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md"
          >
            <Plus className="h-4 w-4" /> Add Lead
          </Button>
        </div>
      </div>

      {/* TOP KPI METRICS SUMMARY GRID (5 CARDS) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {/* Metric 1 */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">Total Leads</span>
            <span className="text-2xl font-black text-[#0D1F3D]">246</span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              ▲ 12% vs last week
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">Contacted</span>
            <span className="text-2xl font-black text-[#0D1F3D]">78</span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              ▲ 18% vs last week
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
            <Phone className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">Demo Scheduled</span>
            <span className="text-2xl font-black text-[#0D1F3D]">42</span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              ▲ 22% vs last week
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Monitor className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">Won</span>
            <span className="text-2xl font-black text-[#0D1F3D]">26</span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              ▲ 30% vs last week
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <Trophy className="h-6 w-6" />
          </div>
        </div>

        {/* Metric 5 */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">Conversion</span>
            <span className="text-2xl font-black text-[#0D1F3D]">10.57%</span>
            <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
              ▲ 2.4% vs last week
            </span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <Target className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN PIPELINE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT PIPELINE KANBAN BOARD (9 COLUMNS) */}
        <div className="lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#0D1F3D]">Sales Pipeline Overview</h2>
            <span className="text-xs font-semibold text-slate-500">6 Active Stages • Drag or click deals</span>
          </div>

          {/* KANBAN STAGE COLUMNS SCROLL CONTAINER */}
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-3 items-start overflow-x-auto pb-2">
            {pipelineStagesList.map((stg) => {
              const stageDeals = mockPipelineDeals.filter((d) => d.stage === stg.id);

              return (
                <div key={stg.id} className="space-y-3 min-w-[210px] rounded-md bg-slate-100/70 p-2.5 border border-slate-200/80">
                  {/* Stage Column Header */}
                  <div
                    onClick={() => navigate(`/admin/sales/${stg.routeKey}`)}
                    className="flex items-center justify-between rounded-md bg-white p-2.5 border border-slate-200/90 shadow-2xs cursor-pointer hover:border-purple-300 transition"
                  >
                    <span className="text-xs font-extrabold text-[#0D1F3D]">
                      {stg.title} <span className="text-slate-500 font-bold">({stg.count})</span>
                    </span>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stg.color }} />
                  </div>

                  {/* Stage Deals List */}
                  <div className="space-y-2.5 min-h-[300px]">
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        onClick={() => handleCardClick(deal)}
                        className="rounded-md border border-slate-200/90 bg-white p-3 shadow-xs space-y-2.5 cursor-pointer hover:border-purple-600 hover:shadow-md transition-all group"
                      >
                        {/* Title & Location */}
                        <div className="flex items-start gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-50 text-red-600 border border-red-100 text-xs font-bold mt-0.5">
                            <Building2 className="h-4 w-4" />
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

                        {/* Amount & Date */}
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="font-extrabold text-[#0D1F3D] text-xs">
                            ₹{deal.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {deal.date}
                          </span>
                        </div>

                        {/* Executive Avatar & Stage Badge */}
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

                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold border ${stg.badgeBg} ${stg.badgeText} ${stg.badgeBorder}`}>
                            {deal.stageLabel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Column Footer Link */}
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/sales/${stg.routeKey}`)}
                    className="w-full text-center text-[11px] font-bold text-slate-600 hover:text-purple-700 py-1.5 rounded-md hover:bg-white transition cursor-pointer"
                  >
                    + View All ({stg.count})
                  </button>
                </div>
              );
            })}
          </div>

          {/* BOTTOM SECTION: RECENT ACTIVITIES TABLE */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Recent Pipeline Activities</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Navigating to full audit log')}
                className="text-xs font-bold text-slate-700"
              >
                View All Activities →
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2 px-3">Lead / Business</th>
                    <th className="py-2 px-3">Stage</th>
                    <th className="py-2 px-3">Executive</th>
                    <th className="py-2 px-3">Last Activity</th>
                    <th className="py-2 px-3">Next Follow-up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-extrabold text-[#0D1F3D]">FreshMart Grocery</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-extrabold">New Lead</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600">Amit Verma</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">24 May 2025 – 11:24 AM</td>
                    <td className="py-2.5 px-3 font-bold text-purple-700">26 May 2025</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-extrabold text-[#0D1F3D]">Prime Wellness</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-extrabold">Negotiation</span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600">Vikram Joshi</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">24 May 2025 – 10:48 AM</td>
                    <td className="py-2.5 px-3 font-bold text-purple-700">25 May 2025</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-extrabold text-[#0D1F3D]">Wellness Hub</td>
                    <td className="py-2.5 px-3">
                      <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-extrabold">Won</span>
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

        {/* RIGHT SIDEBAR COLUMN (3 COLUMNS) */}
        <div className="lg:col-span-3 space-y-4">
          {/* CARD 1: TOP DEAL SPOTLIGHT */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0D1F3D]">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Top Deal</span>
              </div>
              <span className="rounded-full bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.2 text-[9px] font-extrabold">
                🔥 Hot
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100 shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">FreshMart Grocery</h3>
                <p className="text-[10px] font-semibold text-slate-400">Bhiwandi, Maharashtra</p>
                <p className="text-base font-black text-red-600 mt-0.5">₹25,000</p>
              </div>
            </div>

            <Button
              variant="accent"
              fullWidth
              size="sm"
              onClick={() => navigate('/admin/leads/dl-101')}
              className="font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md text-xs"
            >
              View Details
            </Button>
          </div>

          {/* CARD 2: PIPELINE VALUE & DONUT CHART */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Pipeline Value
            </h3>

            <div className="flex items-center justify-center py-2 relative">
              {/* CSS Donut Chart Ring */}
              <div className="h-28 w-28 rounded-full border-8 border-slate-100 flex items-center justify-center relative shadow-inner bg-gradient-to-tr from-emerald-500 via-purple-500 to-blue-500 p-1">
                <div className="h-full w-full rounded-full bg-white flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-black text-[#0D1F3D]">₹2.46 Cr</span>
                  <span className="text-[9px] font-semibold text-slate-400">Total Value</span>
                </div>
              </div>
            </div>

            {/* Stage Value Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold border-t border-slate-100 pt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-slate-600">New</span>
                <span className="font-extrabold text-[#0D1F3D] ml-auto">24%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-slate-600">Contacted</span>
                <span className="font-extrabold text-[#0D1F3D] ml-auto">27%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-slate-600">Demo</span>
                <span className="font-extrabold text-[#0D1F3D] ml-auto">17%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="text-slate-600">Negotiation</span>
                <span className="font-extrabold text-[#0D1F3D] ml-auto">16%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Won</span>
                <span className="font-extrabold text-[#0D1F3D] ml-auto">11%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-slate-600">Lost</span>
                <span className="font-extrabold text-[#0D1F3D] ml-auto">6%</span>
              </div>
            </div>
          </div>

          {/* CARD 3: SALES INSIGHTS */}
          <div className="rounded-md border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Sales Insights
            </h3>

            <div className="space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700">
                  <Target className="h-4 w-4 text-purple-600" />
                  <span>Conversion Rate</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#0D1F3D] block">10.57%</span>
                  <span className="text-[10px] font-bold text-emerald-600">▲ 2.4%</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span>Avg. Deal Size</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#0D1F3D] block">₹58,000</span>
                  <span className="text-[10px] font-bold text-emerald-600">▲ 6.7%</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>Sales Velocity</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#0D1F3D] block">12 days</span>
                  <span className="text-[10px] font-bold text-red-600">▼ 14%</span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                <div className="flex items-center gap-2 text-slate-700">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <span>Deals in Progress</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#0D1F3D] block">151</span>
                  <span className="text-[10px] font-bold text-emerald-600">▲ 12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
