import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Eye, Globe, MapPin, Navigation, Store } from 'lucide-react';
import { KpiCard } from '../../../components/dashboard/KpiCard';
import { Button } from '../../../components/ui/Button';
import { InteractiveMap } from '../../../components/maps/InteractiveMap';
import type { ExecutiveProfileData } from '../executive-profile.types';

const dateFormat = new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' });
const timeFormat = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' });
const duration = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

export function RouteHistoryTab({ data }: { data: ExecutiveProfileData['routeHistory'] }) {
  const [selectedDate, setSelectedDate] = useState(data.days[0]?.date ?? '');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');
  useEffect(() => setSelectedDate(data.days[0]?.date ?? ''), [data.days]);
  const selected = data.days.find((item) => item.date === selectedDate) ?? data.days[0];
  const points = data.points.filter((point) => point.timestamp.startsWith(selectedDate));

  return <div className="space-y-6 font-sans">
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <KpiCard title="Total Distance" value="Not recorded" icon={Navigation} iconBgColor="bg-[#0D1F3D]/10" iconTextColor="text-[#0D1F3D]" />
      <KpiCard title="Total Duration" value={duration(data.totalDurationMinutes)} icon={Clock} iconBgColor="bg-emerald-500/10" iconTextColor="text-emerald-600" />
      <KpiCard title="Total Visits" value={data.totalVisits} icon={Store} iconBgColor="bg-red-500/10" iconTextColor="text-[#E20613]" />
      <KpiCard title="Geotagged Locations" value={data.points.length} icon={MapPin} iconBgColor="bg-purple-500/10" iconTextColor="text-purple-600" />
      <KpiCard title="Days Recorded" value={data.totalDays} icon={Globe} iconBgColor="bg-blue-500/10" iconTextColor="text-blue-600" />
      <KpiCard title="Completed Visits" value={data.completedVisits} icon={CheckCircle2} iconBgColor="bg-amber-500/10" iconTextColor="text-amber-600" />
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-6 space-y-4">
        <div className="flex items-center justify-between"><h3 className="text-base font-extrabold text-[#0D1F3D]">Daily Route History Log</h3><span className="text-xs font-bold text-slate-400">{data.totalDays} Days Recorded</span></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs font-semibold"><thead><tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider"><th className="px-3 py-3">Date</th><th className="px-3 py-3">Timing</th><th className="px-3 py-3">Duration</th><th className="px-3 py-3">Visits</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Map</th></tr></thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">{data.days.length ? data.days.map((row) => { const active = row.date === selected?.date; return <tr key={row.date} onClick={() => setSelectedDate(row.date)} className={`cursor-pointer transition-colors ${active ? 'bg-red-50/60 font-bold' : 'hover:bg-slate-50'}`}><td className="px-3 py-3 font-extrabold text-[#0D1F3D]">{dateFormat.format(new Date(`${row.date}T00:00:00`))}</td><td className="px-3 py-3 text-slate-500 text-[11px]">{row.firstCheckIn ? timeFormat.format(new Date(row.firstCheckIn)) : '—'} - {row.lastCheckOut ? timeFormat.format(new Date(row.lastCheckOut)) : '—'}</td><td className="px-3 py-3 text-slate-600">{duration(row.durationMinutes)}</td><td className="px-3 py-3 font-bold text-[#0D1F3D]">{row.visits} visits</td><td className="px-3 py-3"><span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold ${row.completed === row.visits ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60' : 'bg-amber-50 text-amber-600 border border-amber-200/60'}`}>{row.completed === row.visits ? 'Completed' : 'Partially tracked'}</span></td><td className="px-3 py-3 text-right"><Button variant={active ? 'accent' : 'ghost'} size="sm" className="!p-1.5 !h-7 !w-7 !rounded-lg"><Eye className="h-3.5 w-3.5" /></Button></td></tr>; }) : <tr><td colSpan={6} className="px-3 py-12 text-center text-slate-500">No route history is recorded for this executive.</td></tr>}</tbody>
        </table></div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-6 space-y-4 flex flex-col justify-between">
        <div className="flex items-center justify-between"><div><div className="flex items-center gap-2"><Globe className="h-4 w-4 text-[#E20613]" /><h3 className="text-base font-extrabold text-[#0D1F3D]">Route Map{selected ? ` - ${dateFormat.format(new Date(`${selected.date}T00:00:00`))}` : ''}</h3></div><p className="text-xs text-slate-500">Recorded geotagged visit waypoints</p></div><div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-bold"><button onClick={() => setMapType('roadmap')} className={`rounded-lg px-2.5 py-1 transition-all ${mapType === 'roadmap' ? 'bg-[#0D1F3D] text-white shadow-xs' : 'text-slate-600'}`}>Map</button><button onClick={() => setMapType('satellite')} className={`rounded-lg px-2.5 py-1 transition-all ${mapType === 'satellite' ? 'bg-[#0D1F3D] text-white shadow-xs' : 'text-slate-600'}`}>Satellite</button></div></div>
        <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner">{points.length ? <InteractiveMap mode="route-playback" heightClassName="h-full" compact routeStops={points.map((point, index) => ({ id: point.id, stopNumber: index + 1, type: index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'visit', title: point.name, locationName: point.location, address: point.location, timestamp: timeFormat.format(new Date(point.timestamp)), distanceKm: 0, lat: point.latitude, lng: point.longitude }))} /> : <div className="flex h-full items-center justify-center p-6 text-center text-xs font-semibold text-slate-500">No geotagged visits are available for the selected date.</div>}</div>
        <div className="space-y-2 pt-2 border-t border-slate-100"><h4 className="text-xs font-extrabold text-[#0D1F3D]">Waypoint Check-in Timeline ({points.length} stops)</h4><div className="space-y-1.5 text-[11px] font-semibold">{points.map((point, index) => <div key={point.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 border border-slate-100"><div className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0D1F3D] text-[10px] font-bold text-white">{index + 1}</span><span className="font-extrabold text-[#0D1F3D]">{point.name}</span></div><div className="flex items-center gap-3 text-slate-500"><span>{timeFormat.format(new Date(point.timestamp))}</span><span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-700 font-bold">{point.status}</span></div></div>)}</div></div>
      </div>
    </div>
  </div>;
}
