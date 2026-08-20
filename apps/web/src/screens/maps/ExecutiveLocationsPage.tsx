import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  MapPin,
  Truck,
  Coffee,
  UserX,
  Navigation,
  RefreshCw,
  Filter,
  Download,
  Maximize2,
  Search,
  ChevronRight,
  MoreVertical,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { mockExecutiveLocations, ExecutiveLocation } from './mapsData';

export default function ExecutiveLocationsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedExec, setSelectedExec] = useState<ExecutiveLocation | null>(
    mockExecutiveLocations[0],
  );

  const filteredExecutives = mockExecutiveLocations.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.currentLocation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 font-sans pb-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#0D1F3D]">Executive Locations</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Real-time locations and status of all field executives
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Executive locations updated')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
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
            onClick={() => toast.success('Exporting executive location logs...')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Full Screen Mode toggled')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Full Screen
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards Grid (6 Cards) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <MapKpiCard
          title="Total Executives"
          value="32"
          subValue="All field executives"
          icon={Users}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <MapKpiCard
          title="On Field"
          value="24"
          subValue="75% of total"
          icon={MapPin}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <MapKpiCard
          title="In Transit"
          value="3"
          subValue="Travelling"
          icon={Truck}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <MapKpiCard
          title="Break"
          value="1"
          subValue="On break"
          icon={Coffee}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <MapKpiCard
          title="Offline"
          value="4"
          subValue="Not reporting"
          icon={UserX}
          iconBgColor="bg-slate-100"
          iconTextColor="text-slate-600"
        />
        <MapKpiCard
          title="Distance Covered"
          value="512 km"
          subValue="Today"
          icon={Navigation}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Main Grid Layout (8-col Map + 4-col Sidebar) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Interactive Map Area */}
        <div className="relative lg:col-span-8">
          <InteractiveMap
            mode="executives-only"
            executives={filteredExecutives}
            selectedExecutiveId={selectedExec?.id}
            onSelectExecutive={(exec) => setSelectedExec(exec)}
            heightClassName="h-[650px]"
          >
            {/* Top Right Overlay Filter Selector inside Map */}
            <div className="absolute right-4 top-4 z-20 w-52">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'View by: All Executives', value: 'All' },
                  { label: 'View by: On Field', value: 'On Field' },
                  { label: 'View by: In Transit', value: 'In Transit' },
                  { label: 'View by: On Break', value: 'Break' },
                  { label: 'View by: Offline', value: 'Offline' },
                ]}
              />
            </div>
          </InteractiveMap>
        </div>

        {/* Right Sidebar: Executive List */}
        <div className="lg:col-span-4 rounded-sm border border-slate-200/90 bg-white p-4 shadow-sm space-y-3 flex flex-col h-[650px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-[#0D1F3D] text-xs">
              Executive List ({filteredExecutives.length})
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Live Status</span>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search executive..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-slate-50/80 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Scrollable Executive Cards Stream */}
          <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {filteredExecutives.map((exec) => (
              <div
                key={exec.id}
                onClick={() => setSelectedExec(exec)}
                className={`flex items-center justify-between rounded-sm border p-3 transition-all cursor-pointer ${
                  selectedExec?.id === exec.id
                    ? 'border-[#0D1F3D] bg-slate-50 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img src={exec.avatar} alt={exec.name} className="h-9 w-9 rounded-full object-cover border shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-extrabold text-[#0D1F3D] text-xs truncate">{exec.name}</h4>
                      <span className={`h-2 w-2 rounded-full shrink-0 ${
                        exec.status === 'On Field' ? 'bg-emerald-500' :
                        exec.status === 'In Transit' ? 'bg-amber-500' :
                        exec.status === 'Break' ? 'bg-purple-500' : 'bg-slate-400'
                      }`} />
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 truncate">{exec.currentLocation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-extrabold text-emerald-600 block">
                      {exec.batteryLevel}% 🔋
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{exec.lastUpdated}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/map/routes/${exec.id}`);
                    }}
                    className="p-1 text-slate-400 hover:text-[#0D1F3D] transition-colors"
                    title="View Route Playback"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/executives')}
            className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D]"
          >
            <span>View All Field Executives</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
