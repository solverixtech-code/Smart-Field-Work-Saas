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
import { useMapSnapshot } from './useMapSnapshot';

export default function VisitHeatmapPage() {
  const navigate = useNavigate();
  const { data, range } = useMapSnapshot(30);
  const [selectedTerritory, setSelectedTerritory] = useState('All');
  const [showAllAreas, setShowAllAreas] = useState(false);
  const heatmapPoints = (data?.visitHeatmap ?? []).filter((point) => selectedTerritory === 'All' || point.areaName.toLowerCase().includes(selectedTerritory.toLowerCase()));
  const rankedAreas = [...heatmapPoints].sort((a, b) => b.count - a.count);
  const topAreas = rankedAreas.slice(0, showAllAreas ? undefined : 5);
  const highest = rankedAreas[0];
  const dayCount = Math.max(1, Math.round((Date.parse(`${range.endDate}T00:00:00Z`) - Date.parse(`${range.startDate}T00:00:00Z`)) / 86_400_000) + 1);
  const timeBuckets = [0, 6, 12, 18].map((startHour) => Array.from({ length: 7 }, (_, weekday) => (data?.visitHeatmap ?? []).filter((point) => {
    if (!point.occurredAt) return false;
    const date = new Date(point.occurredAt);
    const hour = date.getHours();
    const mondayIndex = (date.getDay() + 6) % 7;
    return mondayIndex === weekday && hour >= startHour && hour < startHour + 6;
  }).reduce((sum, point) => sum + point.count, 0)));
  const maxBucket = Math.max(1, ...timeBuckets.flat());
  const rangeLabel = `${new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' }).format(new Date(`${range.startDate}T00:00:00`))} – ${new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${range.endDate}T00:00:00`))}`;

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
            <span>{rangeLabel}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedTerritory('All')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const rows = [['Area', 'Visits', 'Latitude', 'Longitude'], ...heatmapPoints.map((row) => [row.areaName, String(row.count), String(row.lat), String(row.lng)])];
              const blob = new Blob([rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
              const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `visit-heatmap-${range.endDate}.csv`; link.click(); URL.revokeObjectURL(link.href);
            }}
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
          value={String(data?.summary.visits ?? 0)}
          subValue="This period"
          icon={MapPin}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <MapKpiCard
          title="Avg. Visits / Day"
          value={String(Math.round((data?.summary.visits ?? 0) / dayCount))}
          change="0%"
          changeType="positive"
          subValue="vs last period"
          icon={Target}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <MapKpiCard
          title="Highest Density Area"
          value={highest?.areaName ?? 'No data'}
          subValue={`${highest?.count ?? 0} visits`}
          icon={Flame}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <MapKpiCard
          title="Active Executives"
          value={String(data?.summary.activeExecutives ?? 0)}
          subValue={`${data?.summary.totalExecutives ? Math.round((data.summary.activeExecutives / data.summary.totalExecutives) * 100) : 0}% active`}
          icon={Users}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <MapKpiCard
          title="Total Duration"
          value={`${Math.round((data?.summary.visitMinutes ?? 0) / 60)}h`}
          subValue="This period"
          icon={Clock}
          iconBgColor="bg-sky-50"
          iconTextColor="text-sky-600"
        />
        <MapKpiCard
          title="Completion Rate"
          value={`${data?.summary.visits ? Math.round((data.summary.completedVisits / data.summary.visits) * 100) : 0}%`}
          change="0%"
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
            heatmapPoints={heatmapPoints}
            heightClassName="h-[650px]"
          >
            {/* Territory Overlay Selector */}
            <div className="absolute left-4 bottom-24 z-20 w-48">
              <Select
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
                options={[{ label: 'All Territories', value: 'All' }, ...(data?.territories ?? []).map((territory) => ({ label: territory.name, value: territory.name }))]}
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
              {topAreas.map((area, index) => (
                <div key={area.id} className="flex items-center justify-between rounded-sm bg-slate-50 p-2 border border-slate-100">
                  <span className="flex items-center gap-2">
                    <span className={`flex h-5 w-5 items-center justify-center rounded-full text-white font-extrabold text-[10px] ${index === 0 ? 'bg-red-600' : index === 1 ? 'bg-amber-500' : index === 2 ? 'bg-amber-400' : index === 3 ? 'bg-blue-500' : 'bg-slate-400'}`}>{index + 1}</span>
                    <span className="text-[#0D1F3D]">{area.areaName}</span>
                  </span>
                  <span className="font-extrabold text-slate-700">{area.count} visits</span>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllAreas((value) => !value)}
              className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D]"
            >
              <span>{showAllAreas ? 'Show Top Areas' : 'View All Areas'}</span>
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
                  {timeBuckets[rIdx].map((value, cIdx) => {
                    const val = value / maxBucket;
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
                <p><strong className="text-emerald-700 font-extrabold">{data?.summary.completedVisits ?? 0}</strong> of {data?.summary.visits ?? 0} visits were completed in this period.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                <p><strong className="text-[#0D1F3D] font-extrabold">{highest?.areaName ?? 'No area'}</strong> shows the highest visit concentration.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                <p>The heatmap contains <strong className="text-slate-800 font-extrabold">{heatmapPoints.length} mapped areas</strong> with recorded GPS coordinates.</p>
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
