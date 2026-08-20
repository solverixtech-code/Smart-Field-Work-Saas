import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  MapPin,
  Target,
  Flame,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { mockVisitHeatmapPoints } from './mapsData';

export default function VisitHeatmapPage() {
  const navigate = useNavigate();
  const [selectedTerritory, setSelectedTerritory] = useState('All');
  const [dateRange, setDateRange] = useState('May 24 – Jun 7, 2025');

  return (
    <div className="space-y-4 font-sans pb-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#0D1F3D]">Visit Heatmap</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Visualization of visit density across territories
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D]">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{dateRange}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Filters drawer opened')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting visit heatmap data...')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards Grid (6 Cards) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <MapKpiCard
          title="Total Visits"
          value="1,248"
          subValue="This period"
          icon={MapPin}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <MapKpiCard
          title="Avg. Visits / Day"
          value="178"
          change="12%"
          changeType="positive"
          subValue="vs last period"
          icon={Target}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <MapKpiCard
          title="Highest Density Area"
          value="Andheri East"
          subValue="857 visits"
          icon={Flame}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <MapKpiCard
          title="Active Executives"
          value="28"
          subValue="87% active"
          icon={Users}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <MapKpiCard
          title="Total Duration"
          value="2,486h"
          subValue="This period"
          icon={Clock}
          iconBgColor="bg-sky-50"
          iconTextColor="text-sky-600"
        />
        <MapKpiCard
          title="Completion Rate"
          value="63%"
          change="8%"
          changeType="positive"
          subValue="vs last period"
          icon={TrendingUp}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Main Grid Layout (8-col Map + 4-col Analytics Sidebars) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Map Area */}
        <div className="relative lg:col-span-8">
          <InteractiveMap
            mode="visit-heatmap"
            heatmapPoints={mockVisitHeatmapPoints}
            heightClassName="h-[650px]"
          >
            {/* Territory Overlay Selector */}
            <div className="absolute left-4 bottom-24 z-20 w-48">
              <Select
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
                options={[
                  { label: 'All Territories', value: 'All' },
                  { label: 'Andheri Region', value: 'Andheri' },
                  { label: 'Western Suburbs', value: 'Western' },
                  { label: 'Eastern Suburbs', value: 'Eastern' },
                  { label: 'Thane Region', value: 'Thane' },
                ]}
              />
            </div>
          </InteractiveMap>
        </div>

        {/* Right Analytics Sidebar Column (4 Cols) */}
        <div className="space-y-4 lg:col-span-4 flex flex-col">
          {/* Top High-Density Areas List */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-sm space-y-3">
            <h3 className="font-extrabold text-[#0D1F3D] text-xs border-b border-slate-100 pb-2">
              Top High-Density Areas
            </h3>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between rounded-sm bg-slate-50 p-2 border border-slate-100">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white font-extrabold text-[10px]">1</span>
                  <span className="text-[#0D1F3D]">Andheri East</span>
                </span>
                <span className="font-extrabold text-slate-700">857 visits</span>
              </div>

              <div className="flex items-center justify-between rounded-sm bg-slate-50 p-2 border border-slate-100">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white font-extrabold text-[10px]">2</span>
                  <span className="text-[#0D1F3D]">Malad West</span>
                </span>
                <span className="font-extrabold text-slate-700">642 visits</span>
              </div>

              <div className="flex items-center justify-between rounded-sm bg-slate-50 p-2 border border-slate-100">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px]">3</span>
                  <span className="text-[#0D1F3D]">Powai</span>
                </span>
                <span className="font-extrabold text-slate-700">532 visits</span>
              </div>

              <div className="flex items-center justify-between rounded-sm bg-slate-50 p-2 border border-slate-100">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white font-extrabold text-[10px]">4</span>
                  <span className="text-[#0D1F3D]">Vikhroli West</span>
                </span>
                <span className="font-extrabold text-slate-700">418 visits</span>
              </div>

              <div className="flex items-center justify-between rounded-sm bg-slate-50 p-2 border border-slate-100">
                <span className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-400 text-white font-extrabold text-[10px]">5</span>
                  <span className="text-[#0D1F3D]">Goregaon East</span>
                </span>
                <span className="font-extrabold text-slate-700">376 visits</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Viewing all density areas')}
              className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D]"
            >
              <span>View All Areas</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Visits by Time of Day Matrix Grid */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-sm space-y-3">
            <h3 className="font-extrabold text-[#0D1F3D] text-xs border-b border-slate-100 pb-2">
              Visits by Time of Day
            </h3>

            <div className="space-y-1.5 text-[10px] font-bold text-slate-500">
              <div className="grid grid-cols-8 gap-1 text-center">
                <span>Time</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>

              {['12 AM', '6 AM', '12 PM', '6 PM'].map((tRow, rIdx) => (
                <div key={tRow} className="grid grid-cols-8 gap-1 items-center text-center">
                  <span className="text-left font-semibold text-slate-400">{tRow}</span>
                  {[0.1, 0.4, 0.9, 0.8, 0.7, 0.6, 0.2].map((val, cIdx) => {
                    const bgClass =
                      rIdx === 2
                        ? val > 0.7
                          ? 'bg-blue-700'
                          : 'bg-blue-500'
                        : rIdx === 3
                        ? 'bg-blue-400'
                        : 'bg-blue-100';
                    return <div key={cIdx} className={`h-4 rounded-xs ${bgClass}`} />;
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-100">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-xs bg-blue-100" />
                <span className="h-2.5 w-2.5 rounded-xs bg-blue-400" />
                <span className="h-2.5 w-2.5 rounded-xs bg-blue-600" />
                <span className="h-2.5 w-2.5 rounded-xs bg-blue-800" />
              </div>
              <span>More</span>
            </div>
          </div>

          {/* Insights Panel */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-sm space-y-2.5 text-xs font-semibold">
            <h3 className="font-extrabold text-[#0D1F3D] text-xs border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" /> Insights
            </h3>

            <div className="space-y-2 text-[11px] text-slate-600 font-medium">
              <div className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <p>Visits are <strong className="text-emerald-700 font-extrabold">12% higher</strong> compared to May 10 – May 24, 2025.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                <p><strong className="text-[#0D1F3D] font-extrabold">Andheri East</strong> shows the highest visit concentration.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                <p>Most visits are happening between <strong className="text-slate-800 font-extrabold">10 AM – 2 PM</strong>.</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/map/live')}
              className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D] mt-2"
            >
              <span>View Full Analytics</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
