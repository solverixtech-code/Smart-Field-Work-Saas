import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus,
  Minus,
  Navigation,
  Layers,
  MapPin,
  Star,
  User,
  Clock,
  Battery,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import {
  ExecutiveLocation,
  BusinessProspectMarker,
  HeatmapPoint,
  TerritoryPolygon,
  RouteStop,
} from '../../screens/maps/mapsData';

export interface InteractiveMapProps {
  mode?: 'live-executives' | 'executives-only' | 'prospects' | 'visit-heatmap' | 'sales-heatmap' | 'territories' | 'route-playback';
  executives?: ExecutiveLocation[];
  prospects?: BusinessProspectMarker[];
  heatmapPoints?: HeatmapPoint[];
  territories?: TerritoryPolygon[];
  routeStops?: RouteStop[];
  playbackActiveStopIndex?: number;
  selectedExecutiveId?: string;
  onSelectExecutive?: (exec: ExecutiveLocation) => void;
  onSelectProspect?: (prospect: BusinessProspectMarker) => void;
  heightClassName?: string;
  children?: React.ReactNode;
}

export function InteractiveMap({
  mode = 'live-executives',
  executives = [],
  prospects = [],
  heatmapPoints = [],
  territories = [],
  routeStops = [],
  playbackActiveStopIndex,
  selectedExecutiveId,
  onSelectExecutive,
  onSelectProspect,
  heightClassName = 'h-[620px]',
  children,
}: InteractiveMapProps) {
  const [mapType, setMapType] = useState<'map' | 'satellite' | 'terrain'>('map');
  const [showHeatmapToggle, setShowHeatmapToggle] = useState(
    mode === 'visit-heatmap' || mode === 'sales-heatmap',
  );
  const [zoomLevel, setZoomLevel] = useState(13);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(
    selectedExecutiveId || null,
  );

  const activeExecutive = useMemo(() => {
    return (
      executives.find((e) => e.id === selectedMarkerId) ||
      executives[0] ||
      null
    );
  }, [executives, selectedMarkerId]);

  const activeProspect = useMemo(() => {
    return prospects.find((p) => p.id === selectedMarkerId) || null;
  }, [prospects, selectedMarkerId]);

  return (
    <div
      className={`relative w-full ${heightClassName} rounded-sm border border-slate-200/90 bg-[#E8EDF2] overflow-hidden shadow-sm flex flex-col`}
    >
      {/* MAPBOX VECTOR ENGINE CANVAS CONTAINER */}
      <div className="absolute inset-0 bg-[#E3EAF2] overflow-hidden select-none">
        {/* Vector Mapbox Grid / Tile Layer */}
        <svg
          className="w-full h-full object-cover opacity-90 transition-opacity duration-300"
          viewBox="0 0 1000 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <rect width="1000" height="800" fill={mapType === 'satellite' ? '#1E293B' : '#E8EEF5'} />

          {/* Water Bodies (Arabian Sea & Powai Lake) */}
          <path
            d="M 0,0 L 280,0 Q 320,180 220,380 Q 140,520 260,800 L 0,800 Z"
            fill={mapType === 'satellite' ? '#0F172A' : '#CBE2F7'}
          />
          <ellipse cx="620" cy="380" rx="45" ry="35" fill={mapType === 'satellite' ? '#0F172A' : '#CBE2F7'} />

          {/* Major Highways & Arterial Roads */}
          <g stroke={mapType === 'satellite' ? '#334155' : '#FFFFFF'} strokeWidth="10" fill="none">
            <path d="M 380,0 L 390,800" stroke={mapType === 'satellite' ? '#475569' : '#FCD34D'} strokeWidth="6" /> {/* W.E. Highway */}
            <path d="M 680,0 L 670,800" stroke={mapType === 'satellite' ? '#475569' : '#FCD34D'} strokeWidth="5" /> {/* E.E. Highway */}
            <path d="M 280,180 Q 420,240 680,260" strokeWidth="4" />
            <path d="M 390,320 L 670,360" strokeWidth="4" />
            <path d="M 260,520 Q 390,480 670,540" strokeWidth="4" />
          </g>

          {/* District Neighborhood Grids */}
          <g fill="none" stroke={mapType === 'satellite' ? '#1E293B' : '#E2E8F0'} strokeWidth="1.5">
            <line x1="280" y1="100" x2="800" y2="100" />
            <line x1="280" y1="200" x2="800" y2="200" />
            <line x1="280" y1="300" x2="800" y2="300" />
            <line x1="280" y1="400" x2="800" y2="400" />
            <line x1="280" y1="500" x2="800" y2="500" />
            <line x1="280" y1="600" x2="800" y2="600" />
            <line x1="450" y1="0" x2="450" y2="800" />
            <line x1="550" y1="0" x2="550" y2="800" />
            <line x1="650" y1="0" x2="650" y2="800" />
          </g>

          {/* Neighborhood Region Label Texts */}
          <g fill={mapType === 'satellite' ? '#94A3B8' : '#94A3B8'} fontSize="11" fontWeight="700" fontFamily="sans-serif" letterSpacing="1">
            <text x="310" y="80">BORIVALI WEST</text>
            <text x="300" y="190">KANDIVALI WEST</text>
            <text x="290" y="290">MALAD WEST</text>
            <text x="300" y="440">GOREGAON EAST</text>
            <text x="320" y="550">ANDHERI WEST</text>
            <text x="430" y="510">ANDHERI EAST</text>
            <text x="590" y="440">POWAI</text>
            <text x="640" y="520">VIKHROLI WEST</text>
            <text x="610" y="620">GHATKOPAR WEST</text>
            <text x="410" y="730">BANDRA KURLA COMPLEX</text>
            <text x="640" y="140">THANE WEST</text>
          </g>

          {/* MAPBOX VECTOR POLYGON TERRITORIES LAYER */}
          {(mode === 'territories' || territories.length > 0) &&
            territories.map((terr) => (
              <g key={terr.id}>
                <polygon
                  points={terr.pathPoints.map(([lat, lng]) => `${(lng - 72.8) * 1200 + 200},${(19.3 - lat) * 2200 + 50}`).join(' ')}
                  fill={terr.fillColor}
                  fillOpacity="0.22"
                  stroke={terr.borderColor}
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
              </g>
            ))}

          {/* MAPBOX GL HEATMAP LAYER OVERLAY */}
          {(showHeatmapToggle || mode === 'visit-heatmap' || mode === 'sales-heatmap') && (
            <g className="mix-blend-multiply opacity-85">
              {heatmapPoints.map((pt) => {
                const cx = (pt.lng - 72.8) * 1200 + 200;
                const cy = (19.3 - pt.lat) * 2200 + 50;
                const radius = pt.intensity * 90 + 30;
                return (
                  <g key={pt.id}>
                    <circle cx={cx} cy={cy} r={radius} fill="url(#heatGradRed)" opacity="0.65" />
                    <circle cx={cx} cy={cy} r={radius * 0.6} fill="url(#heatGradYellow)" opacity="0.8" />
                    <circle cx={cx} cy={cy} r={radius * 0.3} fill="#EF4444" opacity="0.9" />
                  </g>
                );
              })}
              <defs>
                <radialGradient id="heatGradRed">
                  <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#F59E0B" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="heatGradYellow">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="1" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </radialGradient>
              </defs>
            </g>
          )}

          {/* ROUTE PLAYBACK MAPBOX POLYLINE LAYER */}
          {(mode === 'route-playback' || routeStops.length > 0) && (
            <g>
              <polyline
                points={routeStops.map((st) => `${(st.lng - 72.8) * 1200 + 200},${(19.3 - st.lat) * 2200 + 50}`).join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}
        </svg>
      </div>

      {/* MAPBOX NAVIGATION CONTROLS */}
      <div className="absolute left-4 top-4 z-20 flex flex-col gap-1.5 shadow-md">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer font-bold"
          title="Zoom In"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 1, 8))}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer font-bold"
          title="Zoom Out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => setZoomLevel(13)}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer font-bold"
          title="Recenter Map"
        >
          <Navigation className="h-4 w-4 text-blue-600" />
        </button>
        <button
          onClick={() => setMapType((t) => (t === 'map' ? 'satellite' : t === 'satellite' ? 'terrain' : 'map'))}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer font-bold"
          title="Toggle Mapbox Layers"
        >
          <Layers className="h-4 w-4 text-indigo-600" />
        </button>
      </div>

      {/* MAPBOX MARKERS: EXECUTIVE LOCATIONS */}
      {(mode === 'live-executives' || mode === 'executives-only') &&
        executives.map((exec, idx) => {
          const cx = (exec.lng - 72.8) * 1200 + 200;
          const cy = (19.3 - exec.lat) * 2200 + 50;
          const isSelected = selectedMarkerId === exec.id;

          const ringColor =
            exec.status === 'On Field' ? 'ring-emerald-500 bg-emerald-500' :
            exec.status === 'In Transit' ? 'ring-amber-500 bg-amber-500' :
            exec.status === 'Break' ? 'ring-purple-500 bg-purple-500' :
            exec.status === 'Vehicle' ? 'ring-red-500 bg-red-500' :
            'ring-slate-400 bg-slate-400';

          return (
            <div
              key={exec.id}
              onClick={() => {
                setSelectedMarkerId(exec.id);
                if (onSelectExecutive) onSelectExecutive(exec);
              }}
              style={{ left: `${cx / 10}%`, top: `${cy / 8}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110"
            >
              <div className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-lg ring-4 ${ringColor}`}>
                <img src={exec.avatar} alt={exec.name} className="h-full w-full rounded-full object-cover" />
                <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white ${ringColor}`} />
              </div>

              {/* Selected Floating Mapbox Callout */}
              {isSelected && (
                <div className="absolute left-1/2 bottom-full mb-3 -translate-x-1/2 z-30 w-64 rounded-sm border border-slate-200 bg-white p-3 shadow-2xl animate-fadeIn space-y-2 text-left">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <img src={exec.avatar} alt={exec.name} className="h-8 w-8 rounded-full object-cover border" />
                    <div>
                      <h4 className="font-extrabold text-[#0D1F3D] text-xs">{exec.name}</h4>
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" /> {exec.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] space-y-1 text-slate-600 font-medium">
                    <p><span className="text-slate-400 font-bold block text-[9px] uppercase">Current Location / Visit</span> {exec.currentLocation}</p>
                    <div className="flex justify-between pt-1 font-bold text-slate-700">
                      <span>Time: {exec.lastUpdated}</span>
                      <span className="text-emerald-600 font-mono">{exec.batteryLevel}% 🔋</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectExecutive) onSelectExecutive(exec);
                    }}
                    className="w-full rounded-sm bg-[#0D1F3D] py-1.5 text-center text-[11px] font-bold text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1"
                  >
                    View Details <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

      {/* MAPBOX MARKERS: PROSPECT PINS */}
      {mode === 'prospects' &&
        prospects.map((pr) => {
          const cx = (pr.lng - 72.8) * 1200 + 200;
          const cy = (19.3 - pr.lat) * 2200 + 50;

          const markerBg =
            pr.markerColor === 'blue' ? 'bg-blue-600 text-white' :
            pr.markerColor === 'green' ? 'bg-emerald-600 text-white' :
            pr.markerColor === 'yellow' ? 'bg-amber-500 text-white' :
            pr.markerColor === 'red' ? 'bg-red-600 text-white' :
            pr.markerColor === 'purple' ? 'bg-purple-600 text-white' :
            'bg-amber-400 text-slate-900';

          return (
            <div
              key={pr.id}
              onClick={() => {
                setSelectedMarkerId(pr.id);
                if (onSelectProspect) onSelectProspect(pr);
              }}
              style={{ left: `${cx / 10}%`, top: `${cy / 8}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-125"
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md font-bold text-xs ${markerBg}`}>
                {pr.markerColor === 'star' ? <Star className="h-4 w-4 fill-slate-900" /> : <MapPin className="h-4 w-4" />}
              </div>
            </div>
          );
        })}

      {/* MAPBOX MARKERS: ROUTE PLAYBACK WAYPOINTS */}
      {mode === 'route-playback' &&
        routeStops.map((st, i) => {
          const cx = (st.lng - 72.8) * 1200 + 200;
          const cy = (19.3 - st.lat) * 2200 + 50;
          const isActive = playbackActiveStopIndex === i;

          return (
            <div
              key={st.id}
              style={{ left: `${cx / 10}%`, top: `${cy / 8}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1"
            >
              <div
                className={`flex items-center justify-center rounded-full border-2 border-white shadow-md font-extrabold text-xs text-white transition-all ${
                  st.type === 'start' ? 'h-9 w-9 bg-emerald-600 ring-4 ring-emerald-200' :
                  st.type === 'end' ? 'h-9 w-9 bg-red-600 ring-4 ring-red-200' :
                  isActive ? 'h-8 w-8 bg-blue-600 ring-4 ring-blue-300 scale-125' :
                  'h-7 w-7 bg-blue-500'
                }`}
              >
                {st.type === 'start' ? 'S' : st.type === 'end' ? 'E' : st.stopNumber}
              </div>
            </div>
          );
        })}

      {/* MAPBOX MARKERS: TERRITORY BADGES */}
      {mode === 'territories' &&
        territories.map((terr) => {
          const cx = (terr.centerLng - 72.8) * 1200 + 200;
          const cy = (19.3 - terr.centerLat) * 2200 + 50;
          return (
            <div
              key={terr.id}
              style={{ left: `${cx / 10}%`, top: `${cy / 8}%` }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
            >
              <div className="rounded-sm bg-white/95 border border-slate-300 p-2 shadow-md space-y-0.5 text-xs">
                <span className="font-extrabold text-[#0D1F3D] block text-xs">{terr.name}</span>
                <span className="rounded-sm px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 inline-block border border-indigo-200">
                  {terr.executivesCount} Executives
                </span>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Target: {terr.targetAmount}</p>
                <p className="text-[10px] font-bold text-emerald-700">Achieved: {terr.achievedAmount}</p>
              </div>
            </div>
          );
        })}

      {/* FLOATING MAP LEGEND CARD */}
      <div className="absolute left-4 bottom-4 z-20 rounded-sm border border-slate-200/90 bg-white/95 p-3.5 shadow-lg max-w-xs space-y-2 text-xs font-semibold backdrop-blur-xs text-left">
        <h4 className="font-extrabold text-[#0D1F3D] text-xs border-b border-slate-100 pb-1.5 flex items-center justify-between">
          <span>
            {mode === 'prospects' ? 'Prospect Status Legend' :
             mode === 'territories' ? 'Sales Achievement %' :
             mode === 'route-playback' ? 'Route Legend' :
             mode === 'visit-heatmap' ? 'Visit Density Scale' :
             mode === 'sales-heatmap' ? 'Sales Amount (₹)' :
             'Status Legend'}
          </span>
        </h4>

        {mode === 'prospects' ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> New Prospect
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Visited
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Follow-up
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" /> Not Interested
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Demo Done
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> Customer
            </span>
          </div>
        ) : mode === 'territories' ? (
          <div className="space-y-1 text-[11px] font-bold">
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> 80% and above</span> <span className="text-slate-400 font-normal">High</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-lime-500" /> 60% – 79%</span> <span className="text-slate-400 font-normal">Good</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> 40% – 59%</span> <span className="text-slate-400 font-normal">Average</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Below 20%</span> <span className="text-slate-400 font-normal">Low</span></div>
          </div>
        ) : mode === 'route-playback' ? (
          <div className="space-y-1.5 text-[11px] font-bold">
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Start Location</div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-600" /> End Location</div>
            <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Visited Stop</div>
          </div>
        ) : (
          <div className="space-y-1.5 text-[11px] font-bold">
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> On Field</span> <span className="text-slate-500">24</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> In Transit</span> <span className="text-slate-500">3</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Break</span> <span className="text-slate-500">1</span></div>
            <div className="flex items-center justify-between"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Offline / Not Working</span> <span className="text-slate-500">4</span></div>
          </div>
        )}
      </div>

      {/* FLOATING MAPBOX CONTROLS */}
      <div className="absolute right-4 bottom-4 z-20 flex items-center gap-2">
        <div className="flex items-center rounded-sm border border-slate-200 bg-white p-0.5 shadow-md">
          <button
            onClick={() => setMapType('map')}
            className={`rounded-xs px-3 py-1 text-xs font-extrabold cursor-pointer transition-colors ${
              mapType === 'map' ? 'bg-[#0D1F3D] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Mapbox Streets
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`rounded-xs px-3 py-1 text-xs font-extrabold cursor-pointer transition-colors ${
              mapType === 'satellite' ? 'bg-[#0D1F3D] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapType('terrain')}
            className={`rounded-xs px-3 py-1 text-xs font-extrabold cursor-pointer transition-colors ${
              mapType === 'terrain' ? 'bg-[#0D1F3D] text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Outdoors
          </button>
        </div>

        <button
          onClick={() => setShowHeatmapToggle(!showHeatmapToggle)}
          className={`flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-bold shadow-md cursor-pointer transition-colors ${
            showHeatmapToggle ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Toggle Heatmap
        </button>
      </div>

      {children}
    </div>
  );
}
