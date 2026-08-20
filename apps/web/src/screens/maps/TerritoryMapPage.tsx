import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Map,
  Users,
  Target,
  ShoppingBag,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  Download,
  ChevronRight,
  Sparkles,
  Search,
  MoreVertical,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { mockTerritoryPolygons, TerritoryPolygon } from './mapsData';

export default function TerritoryMapPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('May 24 – Jun 7, 2025');
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryPolygon | null>(
    mockTerritoryPolygons[0],
  );

  const filteredTerritories = mockTerritoryPolygons.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4 font-sans pb-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#0D1F3D]">Territory Map</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            View and manage sales territories and team allocation
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
            onClick={() => toast.success('Exporting territory allocation data...')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards Grid (6 Cards) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <MapKpiCard
          title="Total Territories"
          value="12"
          subValue="Active territories"
          icon={Map}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <MapKpiCard
          title="Total Executives"
          value="128"
          subValue="Across all territories"
          icon={Users}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <MapKpiCard
          title="Target (This Period)"
          value="₹ 95,00,000"
          subValue="Total target"
          icon={Target}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <MapKpiCard
          title="Achieved (This Period)"
          value="₹ 63,45,200"
          subValue="66.8% of target"
          icon={ShoppingBag}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <MapKpiCard
          title="Growth"
          value="18%"
          change="18%"
          changeType="positive"
          subValue="vs last period"
          icon={TrendingUp}
          iconBgColor="bg-sky-50"
          iconTextColor="text-sky-600"
        />
        <MapKpiCard
          title="Avg. Performance"
          value="72%"
          subValue="Across territories"
          icon={PieChartIcon}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Main Grid Layout (8-col Map + 4-col Sidebar) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Map Area */}
        <div className="relative lg:col-span-8">
          <InteractiveMap
            mode="territories"
            territories={mockTerritoryPolygons}
            heightClassName="h-[650px]"
          >
            {/* Territory Overlay Selector */}
            <div className="absolute right-4 top-4 z-20 w-52">
              <Select
                value="Territories"
                onChange={() => {}}
                options={[
                  { label: 'View by: Territories', value: 'Territories' },
                  { label: 'View by: Region Performance', value: 'Performance' },
                ]}
              />
            </div>
          </InteractiveMap>
        </div>

        {/* Right Sidebar Column (4 Cols) */}
        <div className="space-y-4 lg:col-span-4 flex flex-col">
          {/* Territories List (12) */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-[#0D1F3D] text-xs">
                Territories (12)
              </h3>
              <span className="text-[10px] font-bold text-slate-400">Team Allocation</span>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search territory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-slate-50/80 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
              />
            </div>

            {/* Territory List Items */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto custom-scrollbar pr-1">
              {filteredTerritories.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTerritory(t)}
                  className={`flex items-center justify-between rounded-sm border p-2.5 transition-all cursor-pointer ${
                    selectedTerritory?.id === t.id
                      ? 'border-[#0D1F3D] bg-slate-50 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: t.fillColor }} />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-[#0D1F3D] text-xs truncate">{t.name}</h4>
                      <p className="text-[10px] font-medium text-slate-500">{t.executivesCount} Execs</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-xs px-2 py-0.5 text-[10px] font-extrabold border ${
                      t.achievementPercentage >= 70
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {t.achievementPercentage}%
                    </span>
                    <button className="text-slate-300 hover:text-slate-500">
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Viewing all 12 territories')}
              className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D]"
            >
              <span>View All Territories</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Territory Performance Distribution / Donut Panel */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-sm space-y-3 text-xs font-semibold">
            <h3 className="font-extrabold text-[#0D1F3D] text-xs border-b border-slate-100 pb-2">
              Territory Performance
            </h3>

            <div className="space-y-2 text-[11px] font-bold text-slate-600">
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> High (≥80%)</span> <span className="text-slate-800 font-extrabold">3 (25%)</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-lime-500" /> Good (60–79%)</span> <span className="text-slate-800 font-extrabold">6 (50%)</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-400" /> Average (40–59%)</span> <span className="text-slate-800 font-extrabold">2 (16%)</span></div>
              <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" /> Low (&lt;40%)</span> <span className="text-slate-800 font-extrabold">1 (9%)</span></div>
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
                <p><strong className="text-[#0D1F3D] font-extrabold">Ghatkopar territory</strong> is performing the best this period (77%).</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                <p><strong className="text-[#0D1F3D] font-extrabold">Andheri East</strong> has highest revenue (₹ 14,00,000).</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 mt-1 shrink-0" />
                <p><strong className="text-red-700 font-extrabold">Vikhroli territory</strong> needs attention (58% achievement).</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Navigating to territory analytics')}
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
