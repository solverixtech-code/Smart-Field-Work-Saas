import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { toast } from 'sonner';
import {
  Calendar,
  Play,
  Pause,
  Filter,
  Download,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { DatePicker } from '../../components/ui/DatePicker';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { extractErrorMessage } from '../../common/api';
import { useAppSelector } from '../../store';
import { fieldDashboardApi, type FieldDashboardData } from '../dashboard/field-dashboard.api';
import { mockArjunMehtaRoute, type ExecutiveRoute, type RouteStop } from './mapsData';

interface RouteActivity {
  id: string;
  type: RouteStop['type'];
  title: string;
  address: string;
  timestamp: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
  leadId?: string;
}

const isExecutiveRole = (roleCode: string | null | undefined) =>
  ['field_executive', 'sales_executive', 'executive'].includes(roleCode?.toLowerCase() ?? '');

function formatTime(value: string | null | undefined, timezone: string): string {
  return value ? new Date(value).toLocaleTimeString('en-IN', {
    timeZone: timezone, hour: '2-digit', minute: '2-digit',
  }) : '—';
}

function liveActivities(data: FieldDashboardData): RouteActivity[] {
  return [
    ...data.visits.map((visit) => ({
      id: visit.id, type: 'visit' as const, title: visit.name,
      address: visit.location, timestamp: visit.scheduledAt,
      status: visit.status, latitude: visit.latitude, longitude: visit.longitude,
      leadId: visit.leadId,
    })),
    ...data.punches.map((punch) => ({
      id: punch.id, type: (punch.type === 'PUNCH_IN' ? 'start' : 'end') as RouteStop['type'],
      title: punch.type === 'PUNCH_IN' ? 'Attendance punch in' : 'Attendance punch out',
      address: punch.locationName || 'Location recorded by mobile device',
      timestamp: punch.timestamp, status: 'RECORDED',
      latitude: punch.latitude, longitude: punch.longitude,
    })),
  ].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export default function RoutePlaybackPage() {
  const tenant = useAppSelector((state) => state.authorization.tenant);
  const user = useAppSelector((state) => state.auth.user);
  const isOwnRoute = isExecutiveRole(tenant?.roleCode);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1x' | '2x' | '5x'>('1x');
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'timeline' | 'visits'>('timeline');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [completedOnly, setCompletedOnly] = useState(false);
  const [fieldData, setFieldData] = useState<FieldDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [actionVisitId, setActionVisitId] = useState<string | null>(null);
  const [outcomeVisitId, setOutcomeVisitId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState('');

  useEffect(() => {
    if (!isOwnRoute) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setFieldData(null);
    const range = selectedDate ? { startDate: selectedDate, endDate: selectedDate } : null;
    fieldDashboardApi.get(range, controller.signal)
      .then(setFieldData)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(extractErrorMessage(reason, 'Could not load your route.'));
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [isOwnRoute, selectedDate, refresh]);

  const timezone = fieldData?.timezone ?? 'Asia/Kolkata';
  const allActivities = useMemo(() => isOwnRoute && fieldData ? liveActivities(fieldData) : [], [isOwnRoute, fieldData]);
  const visibleActivities = useMemo(() => completedOnly
    ? allActivities.filter((activity) => activity.type !== 'visit' || activity.status === 'COMPLETED')
    : allActivities, [allActivities, completedOnly]);
  const liveStops: RouteStop[] = useMemo(() => visibleActivities.flatMap((activity, index) =>
    activity.latitude === null || activity.longitude === null ? [] : [{
      id: activity.id, stopNumber: index + 1, type: activity.type,
      title: activity.title, locationName: activity.title, address: activity.address,
      timestamp: formatTime(activity.timestamp, timezone), distanceKm: 0,
      lat: activity.latitude, lng: activity.longitude, statusText: activity.status,
    }]), [visibleActivities, timezone]);
  const punchIn = fieldData?.punches.find((punch) => punch.type === 'PUNCH_IN')?.timestamp ?? null;
  const punchOut = fieldData?.punches.slice().reverse().find((punch) => punch.type === 'PUNCH_OUT')?.timestamp ?? null;
  const workedMinutes = punchIn && punchOut
    ? Math.max(0, Math.floor((new Date(punchOut).getTime() - new Date(punchIn).getTime()) / 60000)) : null;
  const route: ExecutiveRoute = isOwnRoute ? {
    executiveId: tenant?.membershipId ?? '',
    executiveName: fieldData?.executive.name ?? user?.fullName ?? 'Field executive',
    executiveAvatar: fieldData?.executive.avatarUrl ?? '',
    status: fieldData?.startDate === fieldData?.today && punchIn && !punchOut ? 'On duty' : 'Off duty',
    date: new Date(`${selectedDate ?? fieldData?.today ?? new Date().toISOString().slice(0, 10)}T00:00:00Z`)
      .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }),
    startTime: formatTime(punchIn, timezone),
    endTime: formatTime(punchOut, timezone),
    totalDurationText: workedMinutes === null ? '—' : `${Math.floor(workedMinutes / 60)}h ${workedMinutes % 60}m`,
    totalDistanceKm: 0,
    totalVisitsPlanned: fieldData?.summary.visitCount ?? 0,
    totalVisitsCompleted: fieldData?.summary.completedVisits ?? 0,
    avgSpeedKmh: 0,
    stops: liveStops,
  } : mockArjunMehtaRoute;
  const timelineActivities: RouteActivity[] = isOwnRoute ? visibleActivities : route.stops.map((stop) => ({
    id: stop.id, type: stop.type, title: stop.locationName,
    address: stop.address, timestamp: stop.timestamp,
    status: stop.statusText ?? '', latitude: stop.lat, longitude: stop.lng,
  }));
  const listedActivities = activeTab === 'visits'
    ? timelineActivities.filter((activity) => activity.type === 'visit') : timelineActivities;

  useEffect(() => {
    setActiveStopIndex(0);
    setIsPlaying(false);
  }, [selectedDate, completedOnly]);

  function exportActivities() {
    if (!fieldData || !timelineActivities.length) return;
    const escape = (value: string) => `"${(/^[=+\-@]/.test(value) ? "'" : '') + value.replace(/"/g, '""')}"`;
    const rows = [['Time', 'Activity', 'Location', 'Status'], ...timelineActivities.map((activity) => [
      formatTime(activity.timestamp, timezone), activity.title, activity.address, activity.status,
    ])];
    const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `route-activities-${fieldData.startDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function checkIn(visitId: string) {
    setActionVisitId(visitId);
    try {
      await fieldDashboardApi.checkIn(visitId);
      toast.success('Visit check-in recorded.');
      setRefresh((value) => value + 1);
    } catch (reason: unknown) {
      toast.error(extractErrorMessage(reason, 'Could not check in to this visit.'));
    } finally {
      setActionVisitId(null);
    }
  }

  async function completeVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!outcomeVisitId || !outcome.trim()) return;
    setActionVisitId(outcomeVisitId);
    try {
      await fieldDashboardApi.complete(outcomeVisitId, outcome.trim());
      toast.success('Visit outcome recorded.');
      setOutcomeVisitId(null);
      setOutcome('');
      setRefresh((value) => value + 1);
    } catch (reason: unknown) {
      toast.error(extractErrorMessage(reason, 'Could not complete this visit.'));
    } finally {
      setActionVisitId(null);
    }
  }

  function closeOutcome() {
    setOutcomeVisitId(null);
    setOutcome('');
  }

  // Playback steps through recorded locations and assigned visit locations.
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    if (isPlaying && route.stops.length > 0) {
      const speedMs = playbackSpeed === '5x' ? 600 : playbackSpeed === '2x' ? 1200 : 2500;
      timer = setInterval(() => {
        setActiveStopIndex((prev) => {
          if (prev >= route.stops.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [isPlaying, playbackSpeed, route.stops.length]);

  return (
    <div className="space-y-4 font-sans pb-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#0D1F3D]">Route Playback</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> {isOwnRoute ? 'Live Data' : 'Sample Data'}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {isOwnRoute ? 'Review your assigned route and recorded activities' : 'Review the route and activities of the field executive'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isOwnRoute ? <DatePicker value={selectedDate ?? fieldData?.today ?? new Date().toISOString().slice(0, 10)} onChange={setSelectedDate} /> :
            <div className="flex items-center gap-1 rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D]">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /><span>{route.date}</span>
            </div>}
          <Button
            variant="outline"
            size="sm"
            onClick={() => isOwnRoute ? setCompletedOnly((value) => !value) : toast.info('Route filter opened')}
            aria-pressed={isOwnRoute ? completedOnly : undefined}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Filter className="h-3.5 w-3.5" /> {isOwnRoute && completedOnly ? 'Completed only' : 'Filters'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => isOwnRoute ? exportActivities() : toast.success('Exporting GPS route log GPX...')}
            disabled={isOwnRoute && !timelineActivities.length}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {isOwnRoute && loading && <p role="status" className="text-xs font-semibold text-slate-600">Loading your route…</p>}
      {isOwnRoute && error && <div role="alert" className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">
        <span>{error}</span><Button variant="outline" size="sm" onClick={() => setRefresh((value) => value + 1)}>Retry</Button>
      </div>}

      {/* Top Executive Profile & Detailed Metrics Row */}
      <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <Avatar name={route.executiveName} src={route.executiveAvatar} sizeClassName="h-12 w-12" />
          <div>
            <h3 className="font-extrabold text-[#0D1F3D] text-sm">{route.executiveName}</h3>
            <p className="text-[11px] text-slate-500 font-medium">Field Executive</p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {route.status}
            </span>
          </div>
        </div>

        {/* Metrics Horizontal Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 sm:gap-6 text-left border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-6">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Date</span>
            <span className="font-extrabold text-[#0D1F3D]">{route.date}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Start Time</span>
            <span className="font-extrabold text-[#0D1F3D]">{route.startTime}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block">End Time</span>
            <span className="font-extrabold text-[#0D1F3D]">{route.endTime}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Total Duration</span>
            <span className="font-extrabold text-[#0D1F3D]">{route.totalDurationText}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Total Distance</span>
            <span className="font-extrabold text-[#0D1F3D] font-mono">{isOwnRoute ? 'Not recorded' : `${route.totalDistanceKm} km`}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Total Visits</span>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-[#0D1F3D]">{route.totalVisitsCompleted}</span>
              <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-700">
                Completed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout (8-col Map Player + 4-col Route Summary & Timeline) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Map Area & Playback Controller */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {isOwnRoute && (!route.stops.length || !import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) ?
            <div className="flex h-[580px] items-center justify-center rounded-md border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
              {loading ? 'Loading route locations…' : error ? 'Route locations are unavailable. Retry to load them.' :
                route.stops.length ? 'Mapbox is not configured for this workspace.' : 'No geotagged visits or mobile attendance locations for this date.'}
            </div> :
            <InteractiveMap
              mode="route-playback"
              routeStops={route.stops}
              routePath={route.detailedRoadPath}
              playbackActiveStopIndex={activeStopIndex}
              heightClassName="h-[580px]"
            />}
          {isOwnRoute && route.stops.length > 1 && <p className="text-xs text-slate-500">Mapbox connects assigned visit locations and mobile punch coordinates with a suggested road route. This is not a GPS trace; travel distance and speed are not tracked here.</p>}

          {/* BOTTOM FLOATING ROUTE PLAYBACK PLAYER BAR */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-3 shadow-md flex items-center justify-between gap-4 text-xs font-semibold">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={!route.stops.length}
                aria-label={isPlaying ? 'Pause playback' : 'Play playback'}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0D1F3D] text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              <div className="flex items-center gap-1">
                {(['1x', '2x', '5x'] as const).map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`rounded-xs px-2 py-1 text-[11px] font-bold cursor-pointer transition-colors ${
                      playbackSpeed === spd ? 'bg-slate-100 text-[#0D1F3D] border border-slate-300' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {spd}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Scrubber Bar */}
            <div className="flex-1 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={Math.max(route.stops.length - 1, 0)}
                value={activeStopIndex}
                onChange={(e) => setActiveStopIndex(Number(e.target.value))}
                disabled={!route.stops.length}
                aria-label="Route playback position"
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D1F3D]"
              />
              <span className="text-[11px] font-mono font-bold text-slate-600 shrink-0">
                Stop {route.stops.length ? activeStopIndex + 1 : 0} / {route.stops.length}
              </span>
            </div>

            <button
              onClick={() => {
                setActiveStopIndex(0);
                setIsPlaying(false);
              }}
              className="p-1.5 text-slate-400 hover:text-[#0D1F3D] transition-colors"
              title="Reset Playback"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Route Summary & Itinerary Timeline */}
        <div className="lg:col-span-4 rounded-sm border border-slate-200/90 bg-white p-4 shadow-sm space-y-4 flex flex-col h-[650px]">
          {/* Route Summary Box */}
          <div className="rounded-sm border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 text-xs font-semibold">
            <h3 className="font-extrabold text-[#0D1F3D] text-xs border-b border-slate-200/80 pb-1.5">
              Route Summary
            </h3>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between"><span className="text-slate-500">Planned Visits</span><span className="font-extrabold text-[#0D1F3D]">{route.totalVisitsPlanned}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Completed Visits</span><span className="font-extrabold text-emerald-700">{route.totalVisitsCompleted}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Missed Visits</span><span className="font-extrabold text-slate-700">{isOwnRoute ? 'Not recorded' : '0'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Distance</span><span className="font-extrabold text-[#0D1F3D] font-mono">{isOwnRoute ? 'Not recorded' : `${route.totalDistanceKm} km`}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Avg. Speed</span><span className="font-extrabold text-[#0D1F3D] font-mono">{isOwnRoute ? 'Not recorded' : `${route.avgSpeedKmh} km/h`}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Duration</span><span className="font-extrabold text-[#0D1F3D]">{route.totalDurationText}</span></div>
            </div>
          </div>

          {/* Timeline & Visit List Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`pb-2 px-3 text-xs font-extrabold transition-colors border-b-2 cursor-pointer ${
                activeTab === 'timeline' ? 'border-[#0D1F3D] text-[#0D1F3D]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Timeline Itinerary
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`pb-2 px-3 text-xs font-extrabold transition-colors border-b-2 cursor-pointer ${
                activeTab === 'visits' ? 'border-[#0D1F3D] text-[#0D1F3D]' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Visit List ({isOwnRoute ? fieldData?.summary.visitCount ?? 0 : route.stops.length})
            </button>
          </div>

          {/* Chronological Waypoints Stream */}
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 text-xs">
            <div className="text-[10px] font-bold text-slate-400">{route.date}</div>

            {isOwnRoute && !loading && !error && listedActivities.length === 0 &&
              <p className="rounded-md border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-600">No {activeTab === 'visits' ? 'assigned visits' : 'route activities'} for this date.</p>}
            {isOwnRoute && fieldData && fieldData.summary.visitCount > fieldData.visits.length &&
              <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Showing the first {fieldData.visits.length} of {fieldData.summary.visitCount} assigned visits.</p>}
            {listedActivities.map((st) => {
              const mapIndex = route.stops.findIndex((stop) => stop.id === st.id);
              return <div key={st.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => mapIndex >= 0 && setActiveStopIndex(mapIndex)}
                  disabled={mapIndex < 0}
                  className={`flex w-full items-start gap-3 p-2.5 rounded-sm border text-left transition-all ${
                    activeStopIndex === mapIndex && mapIndex >= 0
                      ? 'border-[#0D1F3D] bg-slate-50 shadow-xs'
                      : 'border-slate-200/80 bg-white enabled:hover:border-slate-300'
                  }`}
                >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-white font-extrabold text-[11px] shrink-0 mt-0.5 ${
                    st.type === 'start' ? 'bg-emerald-600' :
                    st.type === 'end' ? 'bg-red-600' :
                    'bg-blue-600'
                  }`}
                >
                  {st.type === 'start' ? 'S' : st.type === 'end' ? 'E' : mapIndex >= 0 ? mapIndex + 1 : '•'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-[#0D1F3D] text-xs truncate">{st.title}</h4>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0">{isOwnRoute ? formatTime(st.timestamp, timezone) : st.timestamp}</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 truncate">{st.address}</p>

                  {st.status && (
                    <span className="inline-block rounded-xs bg-emerald-50 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-700 border border-emerald-200 mt-1">
                      {st.status.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  )}
                </div>
                </button>
                {isOwnRoute && st.type === 'visit' && tenant?.permissions.includes('crm.visits.checkin') &&
                  (st.status === 'SCHEDULED' || st.status === 'IN_PROGRESS') &&
                  <div className="flex justify-end">
                    <Button variant="outline" size="sm" className="text-xs" isLoading={actionVisitId === st.id}
                      disabled={st.status === 'SCHEDULED' && fieldData?.startDate !== fieldData?.today}
                      onClick={() => st.status === 'SCHEDULED' ? checkIn(st.id) : setOutcomeVisitId(st.id)}>
                      {st.status === 'SCHEDULED' ? 'Check in to visit' : 'Log visit outcome'}
                    </Button>
                  </div>}
              </div>;
            })}
          </div>

          {!isOwnRoute && <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Viewing full historical timeline')}
            className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D]"
          >
            <span>View Full History</span>
            <ChevronRight className="h-4 w-4" />
          </Button>}
        </div>
      </div>
      <Modal isOpen={outcomeVisitId !== null} onClose={closeOutcome} title="Log visit outcome" maxWidth="max-w-md">
        <form onSubmit={completeVisit} className="space-y-4">
          <Textarea id="route-visit-outcome" label="Outcome" value={outcome} onChange={(event) => setOutcome(event.target.value)} required maxLength={2000} rows={4} />
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={closeOutcome}>Cancel</Button>
            <Button type="submit" isLoading={actionVisitId === outcomeVisitId}>Complete visit</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
