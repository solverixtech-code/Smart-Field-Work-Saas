import React, { useState } from 'react';
import { MapPin, Navigation, Clock, Store, Globe, Eye, Download, Layers, CheckCircle2 } from 'lucide-react';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import { Button } from '../../../components/ui/Button';
import { InteractiveMap } from '../../../components/maps/InteractiveMap';

const routeLogs = [
  { date: '20 May 2025 Tue', startEnd: '09:15 AM - 05:45 PM', distance: '32.16 km', duration: '7h 24m', visits: 5, status: 'Completed', lat: 19.1197, lng: 72.8464 },
  { date: '19 May 2025 Mon', startEnd: '09:05 AM - 06:10 PM', distance: '28.73 km', duration: '7h 05m', visits: 4, status: 'Completed', lat: 19.0596, lng: 72.8295 },
  { date: '17 May 2025 Sat', startEnd: '09:10 AM - 07:15 PM', distance: '48.62 km', duration: '8h 05m', visits: 6, status: 'Completed', lat: 19.0657, lng: 72.8687 },
  { date: '16 May 2025 Fri', startEnd: '09:20 AM - 05:30 PM', distance: '26.81 km', duration: '6h 10m', visits: 4, status: 'Completed', lat: 19.1176, lng: 72.9060 },
  { date: '15 May 2025 Thu', startEnd: '09:00 AM - 06:05 PM', distance: '30.12 km', duration: '7h 05m', visits: 5, status: 'Completed', lat: 19.1197, lng: 72.8464 },
  { date: '14 May 2025 Wed', startEnd: '09:30 AM - 05:50 PM', distance: '25.01 km', duration: '6h 15m', visits: 4, status: 'Completed', lat: 19.0596, lng: 72.8295 },
  { date: '13 May 2025 Tue', startEnd: '09:15 AM - 05:40 PM', distance: '20.00 km', duration: '4h 35m', visits: 4, status: 'Partially Tracked', lat: 19.0657, lng: 72.8687 },
];

const waypoints = [
  { id: 1, location: 'Shree Ganesh Traders, Andheri West', checkin: '09:15 AM', duration: '45m', type: 'Follow Up' },
  { id: 2, location: 'Patel Distributors, Goregaon East', checkin: '10:45 AM', duration: '30m', type: 'Meeting' },
  { id: 3, location: 'Sharma Enterprises, Borivali West', checkin: '12:15 PM', duration: '40m', type: 'New Prospect' },
  { id: 4, location: 'Maharashtra Electricals, Malad West', checkin: '02:15 PM', duration: '35m', type: 'Follow Up' },
  { id: 5, location: 'Raj Sales Corporation, Kandivali East', checkin: '04:00 PM', duration: '50m', type: 'New Prospect' },
];

export function RouteHistoryTab() {
  const [selectedRoute, setSelectedRoute] = useState(routeLogs[0]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  return (
    <div className="space-y-6 font-sans">
      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          title="Total Distance"
          value="212.45 km"
          change="+18%"
          changeType="positive"
          timeframe="vs last 7 days"
          icon={Navigation}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Total Duration"
          value="26h 34m"
          change="+12%"
          changeType="positive"
          timeframe="vs last 7 days"
          icon={Clock}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Total Visits"
          value="32"
          change="+14%"
          changeType="positive"
          timeframe="vs last 7 days"
          icon={Store}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Unique Locations"
          value="28"
          change="+17%"
          changeType="positive"
          timeframe="vs last 7 days"
          icon={MapPin}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Avg Daily Distance"
          value="30.35 km"
          change="+10%"
          changeType="positive"
          timeframe="vs last 7 days"
          icon={Navigation}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Max Distance Day"
          value="48.62 km"
          subValue="On 17 May 2025"
          icon={Globe}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
      </div>

      {/* Main Grid: Route History Log Table + Live Interactive Google Maps Route Waypoints */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Route History Days Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Daily Route History Log</h3>
            <span className="text-xs font-bold text-slate-400">7 Days Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Timing</th>
                  <th className="px-3 py-3">Distance</th>
                  <th className="px-3 py-3">Duration</th>
                  <th className="px-3 py-3">Visits</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3 text-right">Map</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {routeLogs.map((r) => {
                  const isSelected = selectedRoute.date === r.date;
                  return (
                    <tr
                      key={r.date}
                      onClick={() => setSelectedRoute(r)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-red-50/60 font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-3 py-3 font-extrabold text-[#0D1F3D]">{r.date}</td>
                      <td className="px-3 py-3 text-slate-500 text-[11px]">{r.startEnd}</td>
                      <td className="px-3 py-3 text-[#E20613] font-bold">{r.distance}</td>
                      <td className="px-3 py-3 text-slate-600">{r.duration}</td>
                      <td className="px-3 py-3 font-bold text-[#0D1F3D]">{r.visits} visits</td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${
                            r.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                              : 'bg-amber-50 text-amber-600 border border-amber-200/60'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button
                          variant={isSelected ? 'accent' : 'ghost'}
                          size="sm"
                          className="!p-1.5 !h-7 !w-7 !rounded-lg"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Google Map Embed & Waypoint Location Timeline */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-6 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-[#E20613]" />
                <h3 className="text-base font-extrabold text-[#0D1F3D]">Route Map - {selectedRoute.date}</h3>
              </div>
              <p className="text-xs text-slate-500">Live GPS tracking path & visited waypoints</p>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold">
              <button
                onClick={() => setMapType('roadmap')}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  mapType === 'roadmap' ? 'bg-[#0D1F3D] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setMapType('satellite')}
                className={`rounded-lg px-2.5 py-1 transition-all ${
                  mapType === 'satellite' ? 'bg-[#0D1F3D] text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                Satellite
              </button>
            </div>
          </div>

          {/* Interactive Mapbox Route Map */}
          <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner">
            <InteractiveMap
              mode="route-playback"
              heightClassName="h-full"
              compact
              routeStops={waypoints.map((w, idx) => ({
                id: String(w.id),
                stopNumber: w.id,
                type: idx === 0 ? 'start' : idx === waypoints.length - 1 ? 'end' : 'visit',
                title: w.location,
                locationName: w.location,
                address: w.location,
                timestamp: w.checkin,
                distanceKm: idx * 2.5,
                lat: selectedRoute.lat + idx * 0.005,
                lng: selectedRoute.lng + idx * 0.005,
              }))}
            />
          </div>

          {/* Waypoints Table */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-extrabold text-[#0D1F3D]">Waypoint Check-in Timeline ({waypoints.length} stops)</h4>
            <div className="space-y-1.5 text-[11px] font-semibold">
              {waypoints.map((w) => (
                <div key={w.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0D1F3D] text-[10px] font-bold text-white">
                      {w.id}
                    </span>
                    <span className="font-extrabold text-[#0D1F3D]">{w.location}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <span>{w.checkin}</span>
                    <span className="font-bold text-[#E20613]">{w.duration}</span>
                    <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700 font-bold">
                      {w.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
