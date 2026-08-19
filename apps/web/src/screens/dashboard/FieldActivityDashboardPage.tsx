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

  // Dynamic Google Map Embed URL centered on selected executive GPS
  const googleMapUrl = `https://maps.google.com/maps?q=${selectedExec.lat},${selectedExec.lng}&t=${
    mapType === 'satellite' ? 'k' : 'm'
  }&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6 font-sans pb-12">
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
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

        {/* Right 8 Cols: Interactive Google Maps Canvas with Custom Profile Picture Map Pins */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8 flex flex-col justify-between relative">
          {/* Google Maps Controls Bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-[#E20613]" />
                <h3 className="text-base font-extrabold text-[#0D1F3D]">Live Google Maps View</h3>
              </div>
              <p className="text-xs text-slate-500">Search any executive from the map search bar below to center Google Maps</p>
            </div>

            {/* Map Layer Toggle */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                  mapType === 'roadmap'
                    ? 'bg-[#0D1F3D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0D1F3D]'
                }`}
              >
                <Layers className="h-3.5 w-3.5" /> Map View
              </button>
              <button
                type="button"
                onClick={() => setMapType('satellite')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
                  mapType === 'satellite'
                    ? 'bg-[#0D1F3D] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0D1F3D]'
                }`}
              >
                <Globe className="h-3.5 w-3.5" /> Satellite View
              </button>
            </div>
          </div>

          {/* Actual Google Maps Render Container */}
          <div className="relative h-[520px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
            <iframe
              title="Google Maps Live GPS Field Executive Tracking"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={googleMapUrl}
              className="h-full w-full border-0 transition-opacity duration-300"
            />

            {/* Interactive Live Search Box & Executive Selection Bar on Top of Map */}
            <div className="absolute top-3 left-3 right-3 z-30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl bg-white/95 p-2.5 shadow-xl backdrop-blur-md border border-white/80">
              {/* Search Box Input with Clear Button */}
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search executive or location..."
                  value={mapSearchQuery}
                  onChange={(e) => {
                    setMapSearchQuery(e.target.value);
                    setShowMapSearchResults(true);
                  }}
                  onFocus={() => setShowMapSearchResults(true)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-8 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none transition-all"
                />
                {mapSearchQuery && (
                  <button
                    onClick={() => {
                      setMapSearchQuery('');
                      setShowMapSearchResults(false);
                    }}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                  >
                    ✕
                  </button>
                )}

                {/* Autocomplete Search Dropdown */}
                {showMapSearchResults && mapSearchQuery && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-1 custom-scrollbar">
                    {matchingMapExecs.length > 0 ? (
                      matchingMapExecs.map((exec) => (
                        <div
                          key={exec.id}
                          onClick={() => {
                            setSelectedExec(exec);
                            setShowMapSearchResults(false);
                          }}
                          className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={exec.avatar} alt={exec.name} className="h-7 w-7 rounded-full object-cover shrink-0 border border-slate-200" />
                            <div>
                              <p className="text-xs font-bold text-[#0D1F3D]">{exec.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{exec.area}</p>
                            </div>
                          </div>
                          <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                            {exec.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs font-medium text-slate-400">
                        No executives found matching "{mapSearchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Executive Profile Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 max-w-full">
                {executivesData.map((exec) => {
                  const isSelected = selectedExec.id === exec.id;
                  return (
                    <button
                      key={exec.id}
                      onClick={() => setSelectedExec(exec)}
                      className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all shrink-0 ${
                        isSelected
                          ? 'bg-[#E20613] text-white shadow-sm ring-2 ring-[#E20613]/20'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <img src={exec.avatar} alt={exec.name} className="h-5 w-5 rounded-full object-cover border border-white" />
                      <span className="truncate max-w-[90px]">{exec.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Profile Avatar Pins Overlay Layer on Top of Google Maps */}
            <div className="absolute inset-0 pointer-events-none p-4">
              <div className="relative w-full h-full">
                {executivesData.map((exec) => {
                  const isSelected = selectedExec.id === exec.id;

                  // Calculate dynamic viewport offset relative to selected executive GPS center
                  const dLat = exec.lat - selectedExec.lat;
                  const dLng = exec.lng - selectedExec.lng;

                  // Zoom level 13 distance scale factor
                  const topPos = 50 - dLat * 1800;
                  const leftPos = 50 + dLng * 1800;

                  // Hide if outside map viewport boundaries
                  if (topPos < 5 || topPos > 95 || leftPos < 5 || leftPos > 95) {
                    return null;
                  }

                  return (
                    <div
                      key={exec.id}
                      onClick={() => setSelectedExec(exec)}
                      className={`pointer-events-auto absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                        isSelected ? 'z-30 scale-110' : 'z-20 hover:scale-105'
                      }`}
                      style={{
                        top: `${topPos}%`,
                        left: `${leftPos}%`,
                      }}
                    >
                      {/* Profile Picture Map Pin Component */}
                      <div className="relative flex flex-col items-center group">
                        <div
                          className={`mb-1 flex flex-col items-center rounded-xl bg-[#0D1F3D] px-3 py-1.5 text-xs font-bold text-white shadow-2xl border border-white/20 whitespace-nowrap transition-all ${
                            isSelected ? 'opacity-100 scale-105' : 'opacity-85 group-hover:opacity-100'
                          }`}
                        >
                          <span className="text-xs font-extrabold">{exec.name}</span>
                          <span className="text-[10px] text-emerald-400 font-semibold">{exec.status} • {exec.area}</span>
                        </div>

                        <div
                          className={`relative h-12 w-12 rounded-full p-0.5 bg-white shadow-2xl ring-4 ${
                            isSelected ? 'ring-[#E20613] scale-110' : 'ring-blue-600'
                          }`}
                        >
                          <img
                            src={exec.avatar}
                            alt={exec.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                          <span
                            className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${
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

                        <div className={`h-3 w-3 rotate-45 transform -mt-1.5 ${isSelected ? 'bg-[#E20613]' : 'bg-blue-600'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Floating Info Overlay Card for Selected Executive */}
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xl backdrop-blur-md space-y-3 min-w-[280px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedExec.avatar}
                    alt={selectedExec.name}
                    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-[#0D1F3D]">{selectedExec.name}</h4>
                    <p className="text-[11px] font-semibold text-slate-500">{selectedExec.role}</p>
                  </div>
                </div>
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                  {selectedExec.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Area Location</span>
                  <span className="font-extrabold text-[#0D1F3D]">{selectedExec.area}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Live Speed & Battery</span>
                  <span className="font-extrabold text-blue-600">{selectedExec.speed} • {selectedExec.battery}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => toast.info(`Calling ${selectedExec.name} at ${selectedExec.phone}...`)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#0D1F3D] py-2 text-xs font-bold text-white shadow-xs hover:bg-[#07152E]"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> Call Executive
                </button>
                <button
                  onClick={() => toast.info(`Opening chat with ${selectedExec.name}...`)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[#E20613]" /> Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
