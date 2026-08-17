import React, { useState } from 'react';
import {
  Users,
  MapPin,
  Store,
  CheckCircle2,
  Clock,
  Flame,
  Globe,
  Layers,
  Search,
} from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';

const executiveMarkers = [
  { id: 1, name: 'Rohit Mehta', store: 'Supermart Retail', status: 'Checked-in', area: 'Andheri West, Mumbai', lat: 19.1197, lng: 72.8464, avatar: 'RM' },
  { id: 2, name: 'Priya Nair', store: 'Apex Retail Hub', status: 'Demoing', area: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295, avatar: 'PN' },
  { id: 3, name: 'Vikram Singh', store: 'In Transit', status: 'En Route', area: 'BKC, Mumbai', lat: 19.0657, lng: 72.8687, avatar: 'VS' },
  { id: 4, name: 'Neha Kapoor', store: 'Metro Traders', status: 'Checked-in', area: 'Powai, Mumbai', lat: 19.1176, lng: 72.9060, avatar: 'NK' },
];

export default function FieldActivityDashboardPage() {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  const [selectedMarker, setSelectedMarker] = useState(executiveMarkers[0]);

  // Dynamic Google Map Embed URL (Centered on Mumbai with Satellite/Roadmap toggle)
  const mapEmbedUrl = `https://maps.google.com/maps?q=${selectedMarker.lat},${selectedMarker.lng}&t=${
    mapType === 'satellite' ? 'k' : 'm'
  }&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Field Activity Dashboard</h1>
          <p className="text-xs font-medium text-slate-500">
            Monitor field executives, live GPS visits, demo completions, and territory routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-[#E20613] shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#E20613] animate-pulse" /> Live GPS Tracking Active
          </span>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Executives Online"
          value="48"
          subValue="Active in field"
          icon={Users}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Checked-in Executives"
          value="36"
          subValue="At shop locations"
          icon={MapPin}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Shops Visited Today"
          value="342"
          change="+24%"
          changeType="positive"
          timeframe="from yesterday"
          icon={Store}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Demos Completed"
          value="128"
          subValue="84% success rate"
          icon={CheckCircle2}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
      </div>

      {/* Middle Row: Live Google Maps Container & Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Actual Google Maps Container */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8 flex flex-col justify-between">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#E20613]" />
                <h3 className="text-base font-extrabold text-[#0D1F3D]">Live GPS Field Map (Google Maps)</h3>
              </div>
              <p className="text-xs text-slate-500">Real-time GPS coordinates & store visit tracking</p>
            </div>

            {/* Google Maps Layer Toggle Buttons */}
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

          {/* Actual Google Map Render */}
          <div className="relative h-[380px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
            <iframe
              title="Actual Google Maps Live Field Tracking"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={mapEmbedUrl}
              className="h-full w-full border-0 transition-opacity duration-300"
            />

            {/* Interactive Live Executives Overlay Bar on Top of Google Maps */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/90 p-2.5 shadow-lg backdrop-blur-md border border-white/50">
              <div className="flex items-center gap-2 text-xs font-extrabold text-[#0D1F3D]">
                <Search className="h-4 w-4 text-[#E20613]" />
                <span>Select Executive to Focus:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {executiveMarkers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMarker(m)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      selectedMarker.id === m.id
                        ? 'bg-[#E20613] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    📍 {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Executive Info Overlay Card */}
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto rounded-xl border border-slate-200/80 bg-white/95 p-3.5 shadow-xl backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0D1F3D] text-xs font-bold text-white">
                  {selectedMarker.avatar}
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#0D1F3D]">{selectedMarker.name}</p>
                  <p className="text-[10px] font-semibold text-[#E20613]">{selectedMarker.store}</p>
                </div>
              </div>
              <p className="text-[11px] font-medium text-slate-500 pl-9">
                Location: {selectedMarker.area} ({selectedMarker.lat}, {selectedMarker.lng})
              </p>
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Live Activity Feed</h3>
            <span className="text-[11px] font-bold text-[#E20613]">Auto-updating</span>
          </div>

          <div className="space-y-3.5 text-xs">
            {[
              { exec: 'Rohit Mehta', action: 'Checked-in at Supermart Retail', time: '2 mins ago' },
              { exec: 'Priya Nair', action: 'Completed Pro Demo at Apex Retail', time: '8 mins ago' },
              { exec: 'Vikram Singh', action: 'Collected ₹15,000 Payment', time: '14 mins ago' },
              { exec: 'Neha Kapoor', action: 'Added New Lead: Metro Traders', time: '22 mins ago' },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-[#E20613]">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-extrabold text-[#0D1F3D]">{act.exec}</p>
                  <p className="text-slate-600 font-medium">{act.action}</p>
                  <p className="text-[10px] font-bold text-slate-400">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Field Executive Leaderboard & Hot Prospects */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Executive Performance Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Executive Field Leaderboard</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3.5">Executive</th>
                  <th className="px-4 py-3.5">Territory</th>
                  <th className="px-4 py-3.5">Check-ins</th>
                  <th className="px-4 py-3.5">Demos</th>
                  <th className="px-4 py-3.5">Route %</th>
                  <th className="px-4 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  { name: 'Rohit Mehta', area: 'Mumbai West', checkins: 14, demos: 6, route: '92%', status: 'Checked-in' },
                  { name: 'Priya Nair', area: 'Mumbai South', checkins: 12, demos: 5, route: '88%', status: 'Checked-in' },
                  { name: 'Vikram Singh', area: 'Navi Mumbai', checkins: 10, demos: 4, route: '75%', status: 'In Transit' },
                  { name: 'Neha Kapoor', area: 'Thane Central', checkins: 9, demos: 3, route: '70%', status: 'Checked-in' },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-extrabold text-[#0D1F3D]">{row.name}</td>
                    <td className="px-4 py-3.5 text-slate-500">{row.area}</td>
                    <td className="px-4 py-3.5">{row.checkins} visits</td>
                    <td className="px-4 py-3.5">{row.demos} demos</td>
                    <td className="px-4 py-3.5 text-[#E20613] font-bold">{row.route}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-extrabold ${
                        row.status === 'Checked-in' ? 'bg-red-100 text-[#E20613]' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hot Prospects & Due Follow-ups */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Hot Prospects & Follow-ups</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {[
              { client: 'Apex Supermarket', tag: 'Hot Prospect', exec: 'Priya Nair', action: 'Final Pricing Call' },
              { client: 'Royal Mart Stores', tag: 'High Intent', exec: 'Rohit Mehta', action: 'Contract Signing' },
              { client: 'Grand Retail Hub', tag: 'Follow-up Due', exec: 'Vikram Singh', action: 'Demo Follow-up' },
            ].map((item) => (
              <div key={item.client} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-[#E20613]">
                  <Flame className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="font-extrabold text-[#0D1F3D]">{item.client}</p>
                  <p className="text-slate-600 font-medium">{item.action} • {item.exec}</p>
                  <span className="inline-block rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-[#E20613]">
                    {item.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
