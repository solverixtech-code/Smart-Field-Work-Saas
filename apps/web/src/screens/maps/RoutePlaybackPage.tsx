import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
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
import { mapsApi, type ExecutiveRoute, type RouteStop, type RouteTrackPoint } from './maps.api';

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
      ...(visit.leadId ? { leadId: visit.leadId } : {}),
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
  const { executiveId } = useParams<{ executiveId?: string }>();
  const tenant = useAppSelector((state) => state.authorization.tenant);
  const isOwnRoute = isExecutiveRole(tenant?.roleCode);

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1x' | '2x' | '5x'>('1x');
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'timeline' | 'visits'>('timeline');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [completedOnly, setCompletedOnly] = useState(false);
  const [fieldData, setFieldData] = useState<FieldDashboardData | null>(null);
  const [adminRoute, setAdminRoute] = useState<ExecutiveRoute | null>(null);
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

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setAdminRoute(null);
    const resolveRoute = async () => {
      if (isOwnRoute) return mapsApi.ownRoute(selectedDate ?? undefined);
      const membershipId = executiveId ?? (await mapsApi.snapshot()).executives[0]?.id;
      if (!membershipId) throw new Error('No field executive is available for route playback.');
      return mapsApi.route(membershipId, selectedDate ?? undefined);
    };
    void resolveRoute()
      .then((result) => { if (!controller.signal.aborted) setAdminRoute(result); })
      .catch((reason: unknown) => { if (!controller.signal.aborted) setError(extractErrorMessage(reason, 'Could not load this route.')); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [executiveId, isOwnRoute, refresh, selectedDate]);

  const timezone = fieldData?.timezone ?? 'Asia/Kolkata';
  const allActivities = useMemo(() => isOwnRoute && fieldData ? liveActivities(fieldData) : [], [isOwnRoute, fieldData]);
  const route: ExecutiveRoute = adminRoute ?? {
    executiveId: executiveId ?? '', executiveName: 'Field executive', executiveAvatar: null,
    status: 'Route history', date: selectedDate ?? new Date().toISOString().slice(0, 10),
    startTime: null, endTime: null, totalDurationText: '—', totalDistanceKm: 0,
    totalVisitsPlanned: 0, totalVisitsCompleted: 0, avgSpeedKmh: 0, stops: [],
  };
  const routeActivities: RouteActivity[] = isOwnRoute && fieldData ? allActivities : route.stops.map((stop) => ({
    id: stop.id, type: stop.type, title: stop.locationName,
    address: stop.address, timestamp: stop.timestamp,
    status: stop.statusText ?? '', latitude: stop.lat, longitude: stop.lng,
  }));
  const timelineActivities = completedOnly
    ? routeActivities.filter((activity) => activity.type !== 'visit' || activity.status === 'COMPLETED')
    : routeActivities;
  const visibleStops = completedOnly
    ? route.stops.filter((stop) => stop.type !== 'visit' || stop.statusText === 'COMPLETED')
    : route.stops;
  const listedActivities = activeTab === 'visits'
    ? timelineActivities.filter((activity) => activity.type === 'visit') : timelineActivities;

  useEffect(() => {
    setPlaybackProgress(0);
    setIsPlaying(false);
  }, [selectedDate, completedOnly]);

  function exportActivities() {
    if (!timelineActivities.length) return;
    const escape = (value: string) => `"${(/^[=+\-@]/.test(value) ? "'" : '') + value.replace(/"/g, '""')}"`;
    const rows = [['Time', 'Activity', 'Location', 'Status'], ...timelineActivities.map((activity) => [
      formatTime(activity.timestamp, timezone), activity.title, activity.address, activity.status,
    ])];
    const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `route-activities-${selectedDate ?? fieldData?.startDate ?? route.date}.csv`;
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

  const playbackTrack = useMemo(() => route.trackPoints?.length
    ? route.trackPoints
    : route.stops.map((stop): RouteTrackPoint => ({
        id: stop.id, capturedAt: stop.timestamp, lat: stop.lat, lng: stop.lng,
        accuracyMeters: null, speedKmh: 0, headingDegrees: null, cumulativeDistanceKm: stop.distanceKm,
      })), [route.stops, route.trackPoints]);
  const trackStartMs = playbackTrack.length ? Date.parse(playbackTrack[0].capturedAt) : 0;
  const trackEndMs = playbackTrack.length ? Date.parse(playbackTrack.at(-1)!.capturedAt) : trackStartMs;
  const trackDurationMs = Math.max(0, trackEndMs - trackStartMs);
  const playbackTimestampMs = trackStartMs + trackDurationMs * playbackProgress;
  const playbackPosition = useMemo(() => {
    if (!playbackTrack.length) return undefined;
    const nextIndex = playbackTrack.findIndex((point) => Date.parse(point.capturedAt) >= playbackTimestampMs);
    if (nextIndex <= 0) return { lat: playbackTrack[0].lat, lng: playbackTrack[0].lng };
    if (nextIndex < 0) {
      const last = playbackTrack.at(-1)!;
      return { lat: last.lat, lng: last.lng };
    }
    const previous = playbackTrack[nextIndex - 1];
    const next = playbackTrack[nextIndex];
    const previousMs = Date.parse(previous.capturedAt);
    const nextMs = Date.parse(next.capturedAt);
    const ratio = nextMs === previousMs ? 1 : (playbackTimestampMs - previousMs) / (nextMs - previousMs);
    return { lat: previous.lat + (next.lat - previous.lat) * ratio, lng: previous.lng + (next.lng - previous.lng) * ratio };
  }, [playbackTimestampMs, playbackTrack]);
  const activeStopIndex = visibleStops.reduce((active, stop, index) =>
    Date.parse(stop.timestamp) <= playbackTimestampMs ? index : active, 0);
  const progressForTimestamp = (timestamp: string) => trackDurationMs
    ? Math.min(1, Math.max(0, (Date.parse(timestamp) - trackStartMs) / trackDurationMs))
    : 0;

  useEffect(() => {
    if (!isPlaying || playbackTrack.length < 2) return;
    const speed = playbackSpeed === '5x' ? 5 : playbackSpeed === '2x' ? 2 : 1;
    const compressedDurationMs = Math.max(1000, Math.min(trackDurationMs, 120_000));
    const startedAt = performance.now();
    const initialProgress = playbackProgress;
    let frame = 0;
    const animate = (now: number) => {
      const next = initialProgress + ((now - startedAt) * speed) / compressedDurationMs;
      if (next >= 1) {
        setPlaybackProgress(1);
        setIsPlaying(false);
        return;
      }
      setPlaybackProgress(next);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, playbackSpeed, playbackTrack.length, trackDurationMs]);

  return (
    <div className="space-y-4 font-sans pb-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#0D1F3D]">Route Playback</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live Data
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {isOwnRoute ? 'Review your assigned route and recorded activities' : 'Review the route and activities of the field executive'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DatePicker value={selectedDate ?? fieldData?.today ?? route.date ?? new Date().toISOString().slice(0, 10)} onChange={setSelectedDate} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompletedOnly((value) => !value)}
            aria-pressed={completedOnly}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Filter className="h-3.5 w-3.5" /> {completedOnly ? 'Completed only' : 'Filters'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportActivities}
            disabled={!timelineActivities.length}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {loading && <p role="status" className="text-xs font-semibold text-slate-600">Loading your route…</p>}
      {error && <div role="alert" className="flex items-center gap-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-800">
        <span>{error}</span><Button variant="outline" size="sm" onClick={() => setRefresh((value) => value + 1)}>Retry</Button>
      </div>}

      {/* Top Executive Profile & Detailed Metrics Row */}
      <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <Avatar name={route.executiveName} src={route.executiveAvatar ?? undefined} sizeClassName="h-12 w-12" />
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
            <span className="font-extrabold text-[#0D1F3D]">{isOwnRoute ? route.date : new Date(`${route.date}T00:00:00Z`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Start Time</span>
            <span className="font-extrabold text-[#0D1F3D]">{isOwnRoute ? route.startTime : formatTime(route.startTime, timezone)}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block">End Time</span>
            <span className="font-extrabold text-[#0D1F3D]">{isOwnRoute ? route.endTime : formatTime(route.endTime, timezone)}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Total Duration</span>
            <span className="font-extrabold text-[#0D1F3D]">{route.totalDurationText}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Total Distance</span>
            <span className="font-extrabold text-[#0D1F3D] font-mono">{route.totalDistanceKm ? `${route.totalDistanceKm} km` : 'Not recorded'}</span>
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
          {!playbackTrack.length || !import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ?
            <div className="flex h-[580px] items-center justify-center rounded-md border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
              {loading ? 'Loading route locations…' : error ? 'Route locations are unavailable. Retry to load them.' :
                playbackTrack.length ? 'Mapbox is not configured for this workspace.' : 'No recorded GPS locations for this date.'}
            </div> :
            <InteractiveMap
              mode="route-playback"
              routeStops={visibleStops}
              routePath={playbackTrack.map((point) => [point.lat, point.lng])}
              playbackActiveStopIndex={activeStopIndex}
              playbackPosition={playbackPosition}
              heightClassName="h-[580px]"
            />}
          {playbackTrack.length > 1 && <p className="text-xs text-slate-500">The route, distance, speed, and playback marker use the same recorded GPS samples.</p>}

          {/* BOTTOM FLOATING ROUTE PLAYBACK PLAYER BAR */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-3 shadow-md flex items-center justify-between gap-4 text-xs font-semibold">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                disabled={playbackTrack.length < 2}
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
                max={1000}
                value={Math.round(playbackProgress * 1000)}
                onChange={(e) => setPlaybackProgress(Number(e.target.value) / 1000)}
                disabled={playbackTrack.length < 2}
                aria-label="Route playback position"
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D1F3D]"
              />
              <span className="text-[11px] font-mono font-bold text-slate-600 shrink-0">
                {playbackTrack.length ? formatTime(new Date(playbackTimestampMs).toISOString(), timezone) : '—'}
              </span>
            </div>

            <button
              onClick={() => {
                setPlaybackProgress(0);
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
              <div className="flex justify-between"><span className="text-slate-500">Missed Visits</span><span className="font-extrabold text-slate-700">{Math.max(0, route.totalVisitsPlanned - route.totalVisitsCompleted)}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Distance</span><span className="font-extrabold text-[#0D1F3D] font-mono">{route.totalDistanceKm ? `${route.totalDistanceKm} km` : 'Not recorded'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Avg. Speed</span><span className="font-extrabold text-[#0D1F3D] font-mono">{route.avgSpeedKmh ? `${route.avgSpeedKmh} km/h` : 'Not recorded'}</span></div>
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
              Visit List ({route.totalVisitsPlanned})
            </button>
          </div>

          {/* Chronological Waypoints Stream */}
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 text-xs">
            <div className="text-[10px] font-bold text-slate-400">{route.date}</div>

            {!loading && !error && listedActivities.length === 0 &&
              <p className="rounded-md border border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-600">No {activeTab === 'visits' ? 'assigned visits' : 'route activities'} for this date.</p>}
            {isOwnRoute && fieldData && fieldData.summary.visitCount > fieldData.visits.length &&
              <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">Showing the first {fieldData.visits.length} of {fieldData.summary.visitCount} assigned visits.</p>}
            {listedActivities.map((st) => {
              const mapIndex = visibleStops.findIndex((stop) => stop.id === st.id || stop.visitId === st.id);
              return <div key={st.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => setPlaybackProgress(progressForTimestamp(st.timestamp))}
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
                    <span className="text-[10px] font-medium text-slate-400 shrink-0">{formatTime(st.timestamp, timezone)}</span>
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
            onClick={() => { setActiveTab('timeline'); setPlaybackProgress(0); }}
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
