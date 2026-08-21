import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Users,
  MapPin,
  CheckCircle2,
  Clock,
  Globe,
  Layers,
  Search,
  Battery,
  Navigation,
  RefreshCw,
  Download,
  PhoneCall,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { Button } from '../../components/ui/Button';
import { InteractiveMap } from '../../components/maps/InteractiveMap';

interface FieldExecutive {
  id: string;
  name: string;
  avatar: string;
  role: string;
  status: 'Checked-in' | 'In Transit' | 'Demo Completed' | 'On Break';
  area: string;
  lat: number;
  lng: number;
  battery: string;
  speed: string;
  lastUpdated: string;
  phone: string;
}

const executivesData: FieldExecutive[] = [
  {
    id: 'ex-1',
    name: 'Amit Verma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    role: 'Sr. Field Executive',
    status: 'Checked-in',
    area: 'Andheri West, Mumbai',
    lat: 19.1197,
    lng: 72.8464,
    battery: '88%',
    speed: '0 km/h',
    lastUpdated: 'Just now',
    phone: '+91 98765 43210',
  },
  {
    id: 'ex-2',
    name: 'Neha Singh',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    role: 'Field Specialist',
    status: 'In Transit',
    area: 'Bandra West, Mumbai',
    lat: 19.0596,
    lng: 72.8295,
    battery: '74%',
    speed: '28 km/h',
    lastUpdated: '1 min ago',
    phone: '+91 98765 43211',
  },
  {
    id: 'ex-3',
    name: 'Vikram Patil',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    role: 'Field Lead',
    status: 'Demo Completed',
    area: 'BKC, Mumbai',
    lat: 19.0657,
    lng: 72.8687,
    battery: '92%',
    speed: '0 km/h',
    lastUpdated: '3 mins ago',
    phone: '+91 98765 43212',
  },
  {
    id: 'ex-4',
    name: 'Prakash Yadav',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    role: 'Field Officer',
    status: 'On Break',
    area: 'Powai, Mumbai',
    lat: 19.1176,
    lng: 72.906,
    battery: '65%',
    speed: '0 km/h',
    lastUpdated: '5 mins ago',
    phone: '+91 98765 43213',
  },
  {
    id: 'ex-5',
    name: 'Anita Kumari',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    role: 'Sr. Field Executive',
    status: 'Checked-in',
    area: 'Lower Parel, Mumbai',
    lat: 18.9953,
    lng: 72.8288,
    battery: '81%',
    speed: '0 km/h',
    lastUpdated: 'Just now',
    phone: '+91 98765 43214',
  },
];

export default function FieldActivityDashboardPage() {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [selectedExec, setSelectedExec] = useState<FieldExecutive>(executivesData[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [showMapSearchResults, setShowMapSearchResults] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredExecutives = executivesData.filter((e) => {
    const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || e.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const matchingMapExecs = executivesData.filter((e) =>
    e.name.toLowerCase().includes(mapSearchQuery.toLowerCase()) ||
    e.area.toLowerCase().includes(mapSearchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0D1F3D]">Live Field Tracking</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-[#E20613]">
              <span className="h-2 w-2 rounded-full bg-[#E20613] animate-ping" /> Live GPS Stream
            </span>
          </div>
          <p className="text-xs font-normal text-slate-600 mt-0.5">
            Real-time GPS tracking and live status monitoring of all field executives on Google Maps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker />
          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.success('Exporting Live GPS Tracking Logs...')}
            className="flex items-center gap-2 font-semibold shadow-xs"
          >
            <Download className="h-4 w-4" /> Export GPS Log
          </Button>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Executives Online"
          value="42 / 56"
          subValue="75% Active Now"
          timeframe=""
          icon={Users}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Field Visits Today"
          value="184 Visits"
          subValue="128 Verified"
          timeframe=""
          icon={MapPin}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Total Distance Covered"
          value="482 km"
          subValue="Citywide Total"
          timeframe=""
          icon={Navigation}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Geofence Alerts"
          value="3 Alerts"
          subValue="Out of Bounds"
          timeframe=""
          icon={AlertCircle}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
      </div>

      {/* MAIN LIVE TRACKING SECTION: Executive List Sidebar (Left) + Google Maps Canvas with Profile Pins (Right) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        {/* Left 4 Cols: Executives Selection & Filter Panel */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Field Executives</h3>
              <button
                onClick={() => toast.info('Refreshing live GPS coordinates...')}
                className="flex items-center gap-1 text-xs font-bold text-[#E20613] hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search executive or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-medium text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs font-bold">
              {['All', 'Checked-in', 'In Transit', 'Demo Completed', 'On Break'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedFilter(st)}
                  className={`rounded-lg px-2.5 py-1 transition-all whitespace-nowrap ${
                    selectedFilter === st
                      ? 'bg-[#0D1F3D] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Executive Items List */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
            {filteredExecutives.map((exec) => {
              const isSelected = selectedExec.id === exec.id;
              return (
                <div
                  key={exec.id}
                  onClick={() => setSelectedExec(exec)}
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#E20613] bg-red-50/40 shadow-xs'
                      : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={exec.avatar}
                        alt={exec.name}
                        className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-xs"
                      />
                      <span
                        className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                          exec.status === 'Checked-in'
                            ? 'bg-emerald-500'
                            : exec.status === 'In Transit'
                            ? 'bg-blue-500'
                            : exec.status === 'Demo Completed'
                            ? 'bg-purple-500'
                            : 'bg-amber-500'
                        }`}
                      />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[#0D1F3D] text-xs">{exec.name}</h4>
                      <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400" /> {exec.area}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-0.5">
                        <span className="flex items-center gap-0.5 text-slate-600">
                          <Battery className="h-3 w-3 text-emerald-600" /> {exec.battery}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-blue-600">
                          <Navigation className="h-3 w-3" /> {exec.speed}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold border ${
                        exec.status === 'Checked-in'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : exec.status === 'In Transit'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : exec.status === 'Demo Completed'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {exec.status}
                    </span>
                    <p className="text-[9px] text-slate-400 font-medium mt-1">{exec.lastUpdated}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Interactive Mapbox Map Canvas */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-[#E20613]" />
                <h3 className="text-base font-extrabold text-[#0D1F3D]">Live Interactive Map View</h3>
              </div>
              <p className="text-xs text-slate-500">Real-time Mapbox GL JS engine with executive GPS markers</p>
            </div>
          </div>

          <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner">
            <InteractiveMap
              mode="live-executives"
              heightClassName="h-full"
              selectedExecutiveId={selectedExec.id}
              executives={executivesData.map((e) => ({
                id: e.id,
                name: e.name,
                avatar: e.avatar,
                status: (e.status === 'Checked-in' ? 'On Field' : e.status === 'In Transit' ? 'In Transit' : 'On Field') as any,
                currentLocation: e.area,
                lastUpdated: e.lastUpdated,
                batteryLevel: parseInt(e.battery),
                lat: e.lat,
                lng: e.lng,
                phone: e.phone,
                team: 'Field Team',
                visitsTodayCompleted: 4,
                visitsTodayTotal: 8,
                distanceKmToday: 24.2,
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
