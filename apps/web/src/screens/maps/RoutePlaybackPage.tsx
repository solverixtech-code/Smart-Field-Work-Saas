import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  User,
  Calendar,
  Clock,
  Navigation,
  MapPin,
  CheckCircle2,
  Play,
  Pause,
  Filter,
  Download,
  Maximize2,
  ChevronRight,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { mockArjunMehtaRoute, RouteStop } from './mapsData';

export default function RoutePlaybackPage() {
  const { executiveId } = useParams<{ executiveId?: string }>();
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1x' | '2x' | '5x'>('1x');
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'timeline' | 'visits'>('timeline');

  const route = mockArjunMehtaRoute;

  // Animated Playback Timer Simulation
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
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
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, route.stops.length]);

  return (
    <div className="space-y-4 font-sans pb-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#0D1F3D]">Route Playback</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Data
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Review the route and activities of the field executive
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D]">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{route.date}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Route filter opened')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting GPS route log GPX...')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Top Executive Profile & Detailed Metrics Row */}
      <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <img
            src={route.executiveAvatar}
            alt={route.executiveName}
            className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-xs"
          />
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
            <span className="font-extrabold text-[#0D1F3D] font-mono">{route.totalDistanceKm} km</span>
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
          <InteractiveMap
            mode="route-playback"
            routeStops={route.stops}
            routePath={route.detailedRoadPath}
            playbackActiveStopIndex={activeStopIndex}
            heightClassName="h-[580px]"
          />

          {/* BOTTOM FLOATING ROUTE PLAYBACK PLAYER BAR */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-3 shadow-md flex items-center justify-between gap-4 text-xs font-semibold">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
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
                max={route.stops.length - 1}
                value={activeStopIndex}
                onChange={(e) => setActiveStopIndex(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0D1F3D]"
              />
              <span className="text-[11px] font-mono font-bold text-slate-600 shrink-0">
                Stop {activeStopIndex + 1} / {route.stops.length}
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
              <div className="flex justify-between"><span className="text-slate-500">Missed Visits</span><span className="font-extrabold text-slate-700">0</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total Distance</span><span className="font-extrabold text-[#0D1F3D] font-mono">{route.totalDistanceKm} km</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Avg. Speed</span><span className="font-extrabold text-[#0D1F3D] font-mono">{route.avgSpeedKmh} km/h</span></div>
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
              Visit List ({route.stops.length})
            </button>
          </div>

          {/* Chronological Waypoints Stream */}
          <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 text-xs">
            <div className="text-[10px] font-bold text-slate-400">{route.date}</div>

            {route.stops.map((st, idx) => (
              <div
                key={st.id}
                onClick={() => setActiveStopIndex(idx)}
                className={`flex items-start gap-3 p-2.5 rounded-sm border transition-all cursor-pointer ${
                  activeStopIndex === idx
                    ? 'border-[#0D1F3D] bg-slate-50 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-white font-extrabold text-[11px] shrink-0 mt-0.5 ${
                    st.type === 'start' ? 'bg-emerald-600' :
                    st.type === 'end' ? 'bg-red-600' :
                    'bg-blue-600'
                  }`}
                >
                  {st.type === 'start' ? 'S' : st.type === 'end' ? 'E' : st.stopNumber}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-[#0D1F3D] text-xs truncate">{st.locationName}</h4>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0">{st.timestamp}</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 truncate">{st.address}</p>

                  {st.durationSpentMinutes && (
                    <span className="inline-block rounded-xs bg-emerald-50 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-700 border border-emerald-200 mt-1">
                      {st.durationSpentMinutes}m spent
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Viewing full historical timeline')}
            className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D]"
          >
            <span>View Full History</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
