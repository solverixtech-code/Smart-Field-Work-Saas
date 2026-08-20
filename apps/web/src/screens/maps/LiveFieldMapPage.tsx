import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  MapPin,
  Truck,
  Coffee,
  CalendarCheck,
  Navigation,
  RefreshCw,
  Filter,
  Maximize2,
  Search,
  ChevronRight,
  Battery,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { mockExecutiveLocations, ExecutiveLocation } from './mapsData';

export default function LiveFieldMapPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExec, setSelectedExec] = useState<ExecutiveLocation | null>(
    mockExecutiveLocations[0],
  );

  const filteredExecutives = mockExecutiveLocations.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.currentLocation.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-4 font-sans pb-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#0D1F3D]">Live Field Map</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Real-time location of field executives and their activities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Live map refreshed')}
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
          title="Active Executives"
          value="28 / 32"
          subValue="87% active"
          icon={Users}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <MapKpiCard
          title="On Field"
          value="24"
          subValue="Currently working"
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
          title="Today's Visits"
          value="156"
          subValue="Completed: 98 (63%)"
          icon={CalendarCheck}
          iconBgColor="bg-sky-50"
          iconTextColor="text-sky-600"
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

      {/* Main Map Grid Layout (8-col Left Map + 4-col Right Sidebars) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Interactive Map (8 Cols) */}
        <div className="lg:col-span-8">
          <InteractiveMap
            mode="live-executives"
            executives={mockExecutiveLocations}
            selectedExecutiveId={selectedExec?.id}
            onSelectExecutive={(exec) => {
              setSelectedExec(exec);
              navigate(`/admin/map/routes/${exec.id}`);
            }}
            heightClassName="h-[650px]"
          />
        </div>

        {/* Right Sidebars Column (4 Cols) */}
        <div className="space-y-4 lg:col-span-4 flex flex-col">
          {/* Live Executives Panel */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-sm space-y-3 flex-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-[#0D1F3D] text-xs">Live Executives (28)</h3>
              <span className="text-[10px] font-bold text-slate-400">Real-time</span>
            </div>

            {/* Search Input */}
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

            {/* Executives List */}
            <div className="space-y-2 max-h-[330px] overflow-y-auto custom-scrollbar pr-1">
              {filteredExecutives.map((exec) => (
                <div
                  key={exec.id}
                  onClick={() => setSelectedExec(exec)}
                  className={`flex items-center justify-between rounded-sm border p-2.5 transition-all cursor-pointer ${
                    selectedExec?.id === exec.id
                      ? 'border-[#0D1F3D] bg-slate-50 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={exec.avatar} alt={exec.name} className="h-8 w-8 rounded-full object-cover border shrink-0" />
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

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-medium block">{exec.lastUpdated}</span>
                    <span className="text-[10px] font-mono font-extrabold text-emerald-600">
                      {exec.batteryLevel}% 🔋
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/map/executives')}
              className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D]"
            >
              <span>View All Executives</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Live Activity Feed */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-[#0D1F3D] text-xs">Live Activity Feed</h3>
              <button onClick={() => toast.info('Viewing full activity stream')} className="text-[11px] font-bold text-blue-600 hover:underline">
                View All →
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-start gap-2">
                  <img src={mockExecutiveLocations[0].avatar} alt="Amit Verma" className="h-6 w-6 rounded-full object-cover border mt-0.5" />
                  <div>
                    <p className="font-bold text-[#0D1F3D]">Amit Verma <span className="text-emerald-600 font-semibold">• Check-in Success</span></p>
                    <p className="text-[11px] text-slate-500 font-medium">FitZone Gym, Andheri East</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">10:25 AM</span>
              </div>

              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                <div className="flex items-start gap-2">
                  <img src={mockExecutiveLocations[2].avatar} alt="Sanjay More" className="h-6 w-6 rounded-full object-cover border mt-0.5" />
                  <div>
                    <p className="font-bold text-[#0D1F3D]">Sanjay More <span className="text-amber-600 font-semibold">• Started Travel</span></p>
                    <p className="text-[11px] text-slate-500 font-medium">From Ghatkopar to BKC</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">10:22 AM</span>
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <img src={mockExecutiveLocations[4].avatar} alt="Pooja Yadav" className="h-6 w-6 rounded-full object-cover border mt-0.5" />
                  <div>
                    <p className="font-bold text-[#0D1F3D]">Pooja Yadav <span className="text-purple-600 font-semibold">• Break Started</span></p>
                    <p className="text-[11px] text-slate-500 font-medium">Near Borivali West Station</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">10:20 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
