import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Users, MapPin, Globe, Search, Battery, Navigation, RefreshCw, Download, AlertCircle } from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { DateRange, DateRangePicker } from '../../components/ui/DateRangePicker';
import { Button } from '../../components/ui/Button';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { mapAvatar, type ExecutiveLocation } from '../maps/maps.api';
import { useMapSnapshot } from '../maps/useMapSnapshot';

type TrackingStatus = 'Checked-in' | 'In Transit' | 'Demo Completed' | 'On Break' | 'Offline';

interface FieldExecutive {
  id: string;
  name: string;
  avatar: string;
  status: TrackingStatus;
  area: string;
  battery: string;
  speed: string;
  lastUpdated: string;
}

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

function initialRange(): DateRange {
  const today = new Date();
  return { startDate: dateKey(new Date(today.getFullYear(), today.getMonth(), 1)), endDate: dateKey(today), label: 'This month' };
}

function relativeTime(value?: string | null) {
  if (!value) return 'Not reported';
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (elapsedSeconds < 60) return 'Just now';
  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function trackingStatus(executive: ExecutiveLocation): TrackingStatus {
  if (executive.status === 'On Field') return 'Checked-in';
  if (executive.status === 'In Transit') return 'In Transit';
  if (executive.status === 'Break') return 'On Break';
  if (executive.demoCompletedToday) return 'Demo Completed';
  return 'Offline';
}

function exportGpsLog(executives: ExecutiveLocation[], range: DateRange) {
  const escape = (value: string | number | null | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = [
    ['Executive', 'Employee Code', 'Status', 'Current Location', 'Last Updated', 'Latitude', 'Longitude', 'Distance (km)'],
    ...executives.map((executive) => [
      executive.name, executive.code ?? '', trackingStatus(executive), executive.currentLocation,
      executive.lastUpdatedAt ?? '', executive.lat, executive.lng, executive.distanceKmToday,
    ]),
  ];
  const csv = rows.map((row) => row.map(escape).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `gps-log-${range.startDate}-${range.endDate}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function FieldActivityDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange>(initialRange);
  const { data, loading, refresh } = useMapSnapshot(dateRange, 30_000);
  const [selectedExecId, setSelectedExecId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const executives = data?.executives ?? [];
  const summary = data?.summary;

  useEffect(() => {
    if (!executives.length) {
      setSelectedExecId(null);
      return;
    }
    if (!selectedExecId || !executives.some((executive) => executive.id === selectedExecId)) {
      setSelectedExecId(executives[0].id);
    }
  }, [executives, selectedExecId]);

  const executiveRows: FieldExecutive[] = executives.map((executive) => ({
    id: executive.id,
    name: executive.name,
    avatar: mapAvatar(executive.name, executive.avatar),
    status: trackingStatus(executive),
    area: executive.currentLocation,
    battery: executive.batteryLevel == null ? 'Not reported' : `${executive.batteryLevel}%`,
    speed: executive.speedKmh == null ? 'Not reported' : `${executive.speedKmh} km/h`,
    lastUpdated: relativeTime(executive.lastUpdatedAt),
  }));

  const filteredExecutives = executiveRows.filter((executive) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || executive.name.toLowerCase().includes(query) || executive.area.toLowerCase().includes(query);
    return matchesSearch && (selectedFilter === 'All' || executive.status === selectedFilter);
  });

  return (
    <div className="space-y-4 font-sans pb-12">
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
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              exportGpsLog(executives, dateRange);
              toast.success('GPS tracking log exported');
            }}
            className="flex items-center gap-2 font-semibold shadow-xs"
          >
            <Download className="h-4 w-4" /> Export GPS Log
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Executives Online"
          value={`${summary?.activeExecutives ?? 0} / ${summary?.totalExecutives ?? 0}`}
          subValue={`${summary?.totalExecutives ? Math.round((summary.activeExecutives / summary.totalExecutives) * 100) : 0}% Active Now`}
          timeframe=""
          icon={Users}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Field Visits Today"
          value={`${summary?.todayVisits ?? 0} Visits`}
          subValue={`${summary?.todayCompletedVisits ?? 0} Verified`}
          timeframe=""
          icon={MapPin}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Total Distance Covered"
          value={`${summary?.distanceKm ?? 0} km`}
          subValue="Citywide Total"
          timeframe=""
          icon={Navigation}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Geofence Alerts"
          value={`${summary?.geofenceAlerts ?? 0} Alerts`}
          subValue="Out of Bounds"
          timeframe=""
          icon={AlertCircle}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-stretch">
        <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Field Executives</h3>
              <button
                type="button"
                onClick={() => void refresh(true)}
                disabled={loading}
                className="flex items-center gap-1 text-xs font-bold text-[#E20613] hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search executive or location..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs font-medium text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs font-bold">
              {['All', 'Checked-in', 'In Transit', 'Demo Completed', 'On Break'].map((status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setSelectedFilter(status)}
                  className={`rounded-lg px-2.5 py-1 transition-all whitespace-nowrap ${selectedFilter === status ? 'bg-[#0D1F3D] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto custom-scrollbar pr-1">
            {filteredExecutives.length === 0 && (
              <div className="flex min-h-32 items-center justify-center px-4 text-center text-xs font-semibold text-slate-500">
                {loading ? 'Loading live locations...' : 'No executives match the selected filter.'}
              </div>
            )}
            {filteredExecutives.map((executive) => {
              const isSelected = selectedExecId === executive.id;
              return (
                <div
                  key={executive.id}
                  onClick={() => setSelectedExecId(executive.id)}
                  className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${isSelected ? 'border-[#E20613] bg-red-50/40 shadow-xs' : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img src={executive.avatar} alt={executive.name} className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-xs" />
                      <span className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                        executive.status === 'Checked-in' ? 'bg-emerald-500' : executive.status === 'In Transit' ? 'bg-blue-500' : executive.status === 'Demo Completed' ? 'bg-purple-500' : executive.status === 'Offline' ? 'bg-slate-400' : 'bg-amber-500'
                      }`} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-[#0D1F3D] text-xs truncate">{executive.name}</h4>
                      <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" /> {executive.area}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 mt-0.5">
                        <span className="flex items-center gap-0.5 text-slate-600"><Battery className="h-3 w-3 text-emerald-600" /> {executive.battery}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-blue-600"><Navigation className="h-3 w-3" /> {executive.speed}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold border ${
                      executive.status === 'Checked-in' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : executive.status === 'In Transit' ? 'bg-blue-50 text-blue-700 border-blue-200' : executive.status === 'Demo Completed' ? 'bg-purple-50 text-purple-700 border-purple-200' : executive.status === 'Offline' ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {executive.status}
                    </span>
                    <p className="text-[9px] text-slate-400 font-medium mt-1">{executive.lastUpdated}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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
              selectedExecutiveId={selectedExecId ?? undefined}
              executives={executives}
              onSelectExecutive={(executive) => setSelectedExecId(executive.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
