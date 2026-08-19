import React, { useState } from 'react';
import {
  Users,
  Activity,
  Eye,
  Zap,
  AlertCircle,
  CheckCircle2,
  Globe,
  Clock,
  Layers,
  Search,
} from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';

interface FieldUser {
  id: string;
  name: string;
  avatar: string;
  location: string;
  lat: number;
  lng: number;
  status: 'Online' | 'In Visit' | 'Traveling' | 'Offline';
  battery: string;
  speed: string;
  phone: string;
}

const liveUsers: FieldUser[] = [
  {
    id: 'u-1',
    name: 'Amit Verma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    location: 'Andheri West, Mumbai',
    lat: 19.1197,
    lng: 72.8464,
    status: 'In Visit',
    battery: '88%',
    speed: '0 km/h',
    phone: '+91 98765 43210',
  },
  {
    id: 'u-2',
    name: 'Neha Singh',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    location: 'Bandra West, Mumbai',
    lat: 19.0596,
    lng: 72.8295,
    status: 'Traveling',
    battery: '74%',
    speed: '32 km/h',
    phone: '+91 98765 43211',
  },
  {
    id: 'u-3',
    name: 'Vikram Patil',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    location: 'BKC, Mumbai',
    lat: 19.0657,
    lng: 72.8687,
    status: 'Online',
    battery: '92%',
    speed: '0 km/h',
    phone: '+91 98765 43212',
  },
  {
    id: 'u-4',
    name: 'Prakash Yadav',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    location: 'Powai, Mumbai',
    lat: 19.1176,
    lng: 72.906,
    status: 'Online',
    battery: '65%',
    speed: '0 km/h',
    phone: '+91 98765 43213',
  },
  {
    id: 'u-5',
    name: 'Anita Kumari',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    location: 'Lower Parel, Mumbai',
    lat: 18.9953,
    lng: 72.8288,
    status: 'In Visit',
    battery: '81%',
    speed: '0 km/h',
    phone: '+91 98765 43214',
  },
];

export default function RealTimeActivityDashboardPage() {
  const [selectedUser, setSelectedUser] = useState<FieldUser>(liveUsers[0]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const matchingUsers = liveUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Dynamic Google Map Embed URL centered on selected executive GPS
  const googleMapUrl = `https://maps.google.com/maps?q=${selectedUser.lat},${selectedUser.lng}&t=${
    mapType === 'satellite' ? 'k' : 'm'
  }&z=13&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0D1F3D]">Real-Time Activity & Live Map</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-bold text-[#E20613]">
              <span className="h-2 w-2 rounded-full bg-[#E20613] animate-ping" /> Live Streaming
            </span>
          </div>
          <p className="text-xs font-normal text-slate-600 mt-0.5">
            Monitor active users on Google Maps with dynamic profile picture markers synced to GPS location.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker />
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0D1F3D] shadow-xs">
            🕒 Live Sync: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          title="Active Users"
          value="128 Online"
          subValue="Real-time Stream"
          icon={Users}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-700"
        />
        <KpiCard
          title="Active Sessions"
          value="156 Live"
          subValue="Active Devices"
          icon={Activity}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
        <KpiCard
          title="Page Views"
          value="342 / min"
          subValue="High Activity"
          icon={Eye}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-700"
        />
        <KpiCard
          title="Events Today"
          value="1,842"
          subValue="Total Recorded"
          icon={Zap}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-700"
        />
        <KpiCard
          title="Errors"
          value="0 Errors"
          subValue="Stable Connection"
          icon={AlertCircle}
          iconBgColor="bg-teal-50"
          iconTextColor="text-teal-700"
        />
        <KpiCard
          title="System Status"
          value="100% Healthy"
          subValue="All Systems Operational"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
      </div>

      {/* Google Maps Container with Profile Picture Markers + Live Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Google Maps Canvas (7 Cols) */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-[#E20613]" />
                <h3 className="text-base font-extrabold text-[#0D1F3D]">Live Users Map (Google Maps)</h3>
              </div>
              <p className="text-xs text-slate-500">Search any user below or on map to center Google Maps on their GPS location</p>
            </div>

            {/* Map Layer Toggle */}
            <div className="flex items-center gap-2 rounded-sm border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 transition-all ${
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
                className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 transition-all ${
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
          <div className="relative h-[500px] w-full overflow-hidden rounded-sm border border-slate-200 bg-slate-100 shadow-inner">
            <iframe
              title="Google Maps Live Visitors Map"
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
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(true);
                  }}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-8 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold text-xs"
                  >
                    ✕
                  </button>
                )}

                {/* Autocomplete Search Dropdown */}
                {showSearchResults && searchQuery && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-1 custom-scrollbar">
                    {matchingUsers.length > 0 ? (
                      matchingUsers.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => {
                            setSelectedUser(u);
                            setShowSearchResults(false);
                          }}
                          className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <img src={u.avatar} alt={u.name} className="h-7 w-7 rounded-full object-cover shrink-0 border border-slate-200" />
                            <div>
                              <p className="text-xs font-bold text-[#0D1F3D]">{u.name}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{u.location}</p>
                            </div>
                          </div>
                          <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                            {u.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-xs font-medium text-slate-400">
                        No field executives found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Executive Profile Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-0.5 max-w-full">
                {liveUsers.map((u) => {
                  const isSelected = selectedUser.id === u.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all shrink-0 ${
                        isSelected
                          ? 'bg-[#E20613] text-white shadow-sm ring-2 ring-[#E20613]/20'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <img src={u.avatar} alt={u.name} className="h-5 w-5 rounded-full object-cover border border-white" />
                      <span className="truncate max-w-[90px]">{u.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Profile Avatar Map Pins Overlay Layer */}
            <div className="absolute inset-0 pointer-events-none p-4">
              <div className="relative w-full h-full">
                {liveUsers.map((userItem) => {
                  const isSelected = selectedUser.id === userItem.id;
                  
                  // Calculate dynamic viewport offset relative to selected executive GPS center
                  const dLat = userItem.lat - selectedUser.lat;
                  const dLng = userItem.lng - selectedUser.lng;

                  // Zoom level 13 distance scale factor
                  const topPos = 50 - dLat * 1800;
                  const leftPos = 50 + dLng * 1800;

                  // Hide if outside map viewport boundaries
                  if (topPos < 5 || topPos > 95 || leftPos < 5 || leftPos > 95) {
                    return null;
                  }

                  return (
                    <div
                      key={userItem.id}
                      onClick={() => setSelectedUser(userItem)}
                      className={`pointer-events-auto absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
                        isSelected ? 'z-30 scale-110' : 'z-20 hover:scale-105'
                      }`}
                      style={{
                        top: `${topPos}%`,
                        left: `${leftPos}%`,
                      }}
                    >
                      {/* Profile Picture Pin Component */}
                      <div className="relative flex flex-col items-center group">
                        <div
                          className={`mb-1 flex flex-col items-center rounded-xl bg-[#0D1F3D] px-3 py-1 text-xs font-bold text-white shadow-2xl border border-white/20 whitespace-nowrap transition-all ${
                            isSelected ? 'opacity-100 scale-105' : 'opacity-85 group-hover:opacity-100'
                          }`}
                        >
                          <span className="text-xs font-extrabold">{userItem.name}</span>
                          <span className="text-[10px] text-emerald-400 font-semibold">{userItem.status} • {userItem.location}</span>
                        </div>

                        <div
                          className={`relative h-12 w-12 rounded-full p-0.5 bg-white shadow-2xl ring-4 ${
                            isSelected ? 'ring-[#E20613] scale-110' : 'ring-blue-600'
                          }`}
                        >
                          <img
                            src={userItem.avatar}
                            alt={userItem.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                        </div>

                        <div className={`h-3 w-3 rotate-45 transform -mt-1.5 ${isSelected ? 'bg-[#E20613]' : 'bg-blue-600'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected User Info Overlay Card at Bottom */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto rounded-2xl border border-slate-200/90 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md space-y-2 min-w-[280px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2.5">
                  <img
                    src={selectedUser.avatar}
                    alt={selectedUser.name}
                    className="h-9 w-9 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-[#0D1F3D]">{selectedUser.name}</h4>
                    <p className="text-[10px] font-semibold text-slate-500">{selectedUser.location}</p>
                  </div>
                </div>
                <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                  {selectedUser.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="text-[10px] text-slate-500 font-medium">GPS: {selectedUser.lat}, {selectedUser.lng}</span>
                <span className="font-extrabold text-blue-600">{selectedUser.speed} • {selectedUser.battery}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Stream (5 Cols) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0D1F3D]">Live Activity Feed</h3>
              <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
            </div>

            <div className="space-y-3.5 font-semibold text-xs">
              {[
                { time: '12:45:28 PM', title: 'New deal created', detail: 'Rahul Verma created deal "VisibloAI Pro Plan"', tag: 'Deal' },
                { time: '12:45:26 PM', title: 'Payment received', detail: '₹24,999 received from Sharma Enterprises', tag: 'Payment' },
                { time: '12:45:24 PM', title: 'New lead added', detail: 'Priya Mehta added lead "Tech Solutions"', tag: 'Lead' },
                { time: '12:45:22 PM', title: 'User logged in', detail: 'Amit Sharma logged in from Mumbai, India', tag: 'Auth' },
                { time: '12:45:20 PM', title: 'Subscription activated', detail: 'Basic Plan activated for Digital Minds', tag: 'Subscription' },
                { time: '12:45:15 PM', title: 'Check-in completed', detail: 'Amit Verma checked in at Andheri West', tag: 'Check-in' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <Clock className="h-4 w-4 text-[#E20613] shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-[#0D1F3D]">{item.title}</p>
                      <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium">{item.detail}</p>
                  </div>
                  <span className="rounded bg-red-50 border border-red-200 px-1.5 py-0.5 text-[9px] font-bold text-[#E20613]">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-right mt-4">
            <button className="text-xs font-bold text-[#E20613] hover:underline">
              View All 128 Real-time Logs →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
