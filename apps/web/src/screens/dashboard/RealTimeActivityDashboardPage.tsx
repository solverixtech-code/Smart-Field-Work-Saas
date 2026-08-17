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
  Filter,
  Layers,
  MapPin,
  Search,
} from 'lucide-react';
import { useAppSelector } from '../../store';
import { KpiCard } from '../../components/dashboard/KpiCard';

const visitorLocations = [
  { id: 1, city: 'Mumbai, India', visitors: 78, lat: 19.076, lng: 72.8777, country: '🇮🇳 India' },
  { id: 2, city: 'New York, USA', visitors: 24, lat: 40.7128, lng: -74.006, country: '🇺🇸 United States' },
  { id: 3, city: 'Dubai, UAE', visitors: 12, lat: 25.2048, lng: 55.2708, country: '🇦🇪 UAE' },
  { id: 4, city: 'London, UK', visitors: 8, lat: 51.5074, lng: -0.1278, country: '🇬🇧 United Kingdom' },
  { id: 5, city: 'Singapore', visitors: 6, lat: 1.3521, lng: 103.8198, country: '🇸🇬 Singapore' },
];

export default function RealTimeActivityDashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const [selectedLoc, setSelectedLoc] = useState(visitorLocations[0]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  const googleMapUrl = `https://maps.google.com/maps?q=${selectedLoc.lat},${selectedLoc.lng}&t=${
    mapType === 'satellite' ? 'k' : 'm'
  }&z=11&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Real-Time Activity</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200/60 px-3 py-1 text-xs font-bold text-[#E20613]">
              <span className="h-2 w-2 rounded-full bg-[#E20613] animate-ping" /> Live Streaming
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Monitor system activities, live traffic on Google Maps, and user events as they happen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-[#0D1F3D] shadow-xs">
            🕒 Live Sync: {new Date().toLocaleTimeString()}
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-[#E20613] shadow-xs">
            Auto Refresh: 5s
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#0D1F3D] shadow-xs hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5 text-[#E20613]" /> Filters
          </button>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          title="Active Users"
          value="128"
          subValue="Online Now"
          icon={Users}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Active Sessions"
          value="156"
          subValue="Live Sessions"
          icon={Activity}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Page Views (Live)"
          value="342"
          subValue="Per Minute"
          icon={Eye}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Events (Today)"
          value="1,842"
          subValue="Total Events"
          icon={Zap}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Errors (Today)"
          value="3"
          subValue="Total Errors"
          icon={AlertCircle}
          iconBgColor="bg-rose-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="System Status"
          value="Healthy"
          subValue="All Systems OK"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
      </div>

      {/* Middle Row: Actual Google Maps Live Visitors Widget & Live Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Actual Google Maps Widget */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-7 flex flex-col justify-between">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#E20613]" />
                <h3 className="text-base font-extrabold text-[#0D1F3D]">Live Visitors on Map (Google Maps)</h3>
              </div>
              <p className="text-xs text-slate-500">Real-time visitor geolocation & traffic cluster mapping</p>
            </div>

            {/* Google Map Layer Toggle */}
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
          <div className="relative h-[380px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
            <iframe
              title="Google Maps Live Visitors Traffic Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={googleMapUrl}
              className="h-full w-full border-0 transition-opacity duration-300"
            />

            {/* Region Selector Bar on Top of Google Maps */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/95 p-2.5 shadow-lg backdrop-blur-md border border-white/60">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0D1F3D]">
                <MapPin className="h-4 w-4 text-[#E20613]" />
                <span>Focus Region:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visitorLocations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLoc(loc)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      selectedLoc.id === loc.id
                        ? 'bg-[#E20613] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {loc.country}: {loc.visitors}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Location Summary Overlay Card */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md space-y-1">
              <p className="text-xs font-extrabold text-[#0D1F3D]">Active Region: {selectedLoc.city}</p>
              <p className="text-[11px] font-bold text-[#E20613]">{selectedLoc.visitors} Live Visitors Right Now</p>
              <p className="text-[10px] text-slate-500 font-medium">GPS: {selectedLoc.lat}, {selectedLoc.lng}</p>
            </div>
          </div>
        </div>

        {/* Live Activity Feed Stream */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Live Activity Feed</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { time: '12:45:28 PM', title: 'New deal created', detail: 'Rahul Verma created deal "VisibloAI Pro Plan"', tag: 'Deal' },
              { time: '12:45:26 PM', title: 'Payment received', detail: '₹24,999 received from Sharma Enterprises', tag: 'Payment' },
              { time: '12:45:24 PM', title: 'New lead added', detail: 'Priya Mehta added lead "Tech Solutions"', tag: 'Lead' },
              { time: '12:45:22 PM', title: 'User logged in', detail: 'Amit Sharma logged in from Mumbai, India', tag: 'Auth' },
              { time: '12:45:20 PM', title: 'Subscription activated', detail: 'Basic Plan activated for Digital Minds', tag: 'Subscription' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                <Clock className="h-4 w-4 text-[#E20613] flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <p className="font-extrabold text-[#0D1F3D]">{item.title}</p>
                    <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{item.detail}</p>
                </div>
                <span className="rounded bg-red-50 border border-red-200/60 px-1.5 py-0.5 text-[9px] font-bold text-[#E20613]">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Pages, Live Users, System Resources */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Active Pages */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">Top Active Pages</h3>
          <div className="space-y-3 text-xs font-semibold text-slate-700">
            {[
              { path: '/admin/dashboard', count: 48, pct: '18.7%' },
              { path: '/admin/executives', count: 32, pct: '12.5%' },
              { path: '/admin/dashboard/sales', count: 28, pct: '10.9%' },
              { path: '/admin/dashboard/field', count: 22, pct: '8.6%' },
            ].map((p) => (
              <div key={p.path} className="flex justify-between items-center rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                <span className="font-mono text-[11px] text-[#E20613]">{p.path}</span>
                <span className="font-extrabold text-[#0D1F3D]">{p.count} ({p.pct})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Active Users */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">Live Active Users</h3>
          <div className="space-y-3 text-xs font-semibold">
            {[
              { name: 'Rahul Verma', area: 'Mumbai', page: '/admin/executives' },
              { name: 'Priya Mehta', area: 'Delhi', page: '/admin/dashboard' },
              { name: 'Sanjay Yadav', area: 'Bangalore', page: '/admin/dashboard/sales' },
              { name: 'Kavita Singh', area: 'Pune', page: '/admin/profile' },
            ].map((u) => (
              <div key={u.name} className="flex justify-between items-center rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">{u.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{u.area} • {u.page}</p>
                </div>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* System Resources */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-6">
          <h3 className="mb-4 text-base font-extrabold text-[#0D1F3D]">System Resources</h3>
          <div className="space-y-4 text-xs font-semibold">
            {[
              { label: 'CPU Usage', val: '28%', pct: 28, color: 'bg-emerald-500' },
              { label: 'Memory Usage', val: '46%', pct: 46, color: 'bg-blue-600' },
              { label: 'Disk Usage', val: '35%', pct: 35, color: 'bg-amber-500' },
              { label: 'Database Load', val: '22%', pct: 22, color: 'bg-purple-500' },
              { label: 'API Response Time', val: '128ms', pct: 15, color: 'bg-[#E20613]' },
            ].map((r) => (
              <div key={r.label} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#0D1F3D] font-bold">{r.label}</span>
                  <span className="font-extrabold text-slate-700">{r.val}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
