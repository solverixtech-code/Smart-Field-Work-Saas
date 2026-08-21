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
import mapboxgl from 'mapbox-gl';
import {
  ExecutiveLocation,
  BusinessProspectMarker,
  HeatmapPoint,
  TerritoryPolygon,
  RouteStop,
} from '../../screens/maps/mapsData';

// Function to resolve Mapbox style (supports user VITE_MAPBOX_ACCESS_TOKEN or open tile fallback)
export function getMapboxStyle(mapType: 'map' | 'satellite' | 'terrain'): string | mapboxgl.Style {
  const customToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  if (customToken) {
    mapboxgl.accessToken = customToken;
    return mapType === 'satellite'
      ? 'mapbox://styles/mapbox/satellite-v9'
      : mapType === 'terrain'
      ? 'mapbox://styles/mapbox/outdoors-v12'
      : 'mapbox://styles/mapbox/streets-v12';
  }

  // Open-Source Raster Tile Style (No 401 Error, 100% Free & Fast)
  if (mapType === 'satellite') {
    return {
      version: 8,
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        },
      },
      layers: [
        {
          id: 'esri-satellite-layer',
          type: 'raster',
          source: 'esri-satellite',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };
  }

  return {
    version: 8,
    sources: {
      'osm-tiles': {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap contributors',
      },
    },
    layers: [
      {
        id: 'osm-layer',
        type: 'raster',
        source: 'osm-tiles',
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };
}

export interface InteractiveMapProps {
  mode?:
    | 'live-executives'
    | 'executives-only'
    | 'prospects'
    | 'visit-heatmap'
    | 'sales-heatmap'
    | 'territories'
    | 'route-playback';
  executives?: ExecutiveLocation[];
  prospects?: BusinessProspectMarker[];
  heatmapPoints?: HeatmapPoint[];
  territories?: TerritoryPolygon[];
  routeStops?: RouteStop[];
  routePath?: [number, number][];
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
  routePath = [],
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
  const [, setMapTick] = useState(0);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Default Mumbai Coordinates
  const defaultCenter: [number, number] = [72.8697, 19.1197];

  // Initialize Mapbox GL map instance with frame listeners
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: getMapboxStyle(mapType),
        center: defaultCenter,
        zoom: zoomLevel,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');
      mapRef.current = map;

      // Force recalculation of marker projection on every camera movement
      const updatePositions = () => {
        setMapTick((t) => t + 1);
      };

      map.on('move', updatePositions);
      map.on('zoom', updatePositions);
      map.on('drag', updatePositions);
      map.on('pitch', updatePositions);
      map.on('rotate', updatePositions);

      // Trigger initial render projection
      map.on('load', updatePositions);

      return () => {
        map.remove();
        mapRef.current = null;
      };
    } catch (e) {
      console.warn('Mapbox GL Map mount warning:', e);
    }
  }, []);

  // Dynamic Mapbox Geographic to Screen Pixel Projection
  const getPixelPoint = (lat: number, lng: number) => {
    if (mapRef.current) {
      const pt = mapRef.current.project([lng, lat]);
      return { x: pt.x, y: pt.y };
    }
    // Fallback static projection before map initializes
    return { x: (lng - 72.8) * 1200 + 200, y: (19.3 - lat) * 2200 + 50 };
  };

  // Update Mapbox Style on Map Type Toggle
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setStyle(getMapboxStyle(mapType));
    }
  }, [mapType]);

  // Smoothly Fly Mapbox Camera to Selected Executive Location
  useEffect(() => {
    if (!mapRef.current || !selectedExecutiveId) return;

    const exec = executives.find((e) => e.id === selectedExecutiveId);
    if (exec) {
      setSelectedMarkerId(exec.id);
      mapRef.current.flyTo({
        center: [exec.lng, exec.lat],
        zoom: 15,
        duration: 1200,
        essential: true,
      });
    }
  }, [selectedExecutiveId, executives]);

  const [fetchedRealRoadPath, setFetchedRealRoadPath] = useState<[number, number][]>([]);

  // Fetch real-world driving route geometry from Mapbox / OSRM routing API
  useEffect(() => {
    if ((mode !== 'route-playback' && routeStops.length === 0) || routeStops.length < 2) return;

    let isMounted = true;
    const fetchRealRoadRoute = async () => {
      try {
        const customToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        const coordinatesString = routeStops
          .slice(0, 25)
          .map((st) => `${st.lng},${st.lat}`)
          .join(';');

        let url = `https://router.project-osrm.org/route/v1/driving/${coordinatesString}?overview=full&geometries=geojson`;

        if (customToken) {
          url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinatesString}?overview=full&geometries=geojson&access_token=${customToken}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (isMounted && data.routes && data.routes[0] && data.routes[0].geometry) {
          const realCoords: [number, number][] = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng],
          );
          setFetchedRealRoadPath(realCoords);
        }
      } catch (err) {
        console.warn('Real road routing API notice:', err);
      }
    };

    fetchRealRoadRoute();

    return () => {
      isMounted = false;
    };
  }, [routeStops, mode]);

  // Sync Native Mapbox GL GeoJSON Route Line Layer
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateRouteNativeLayer = () => {
      try {
        if (!map.isStyleLoaded()) return;

        const activeCoords =
          fetchedRealRoadPath.length > 0
            ? fetchedRealRoadPath
            : routePath.length > 0
            ? routePath
            : routeStops.map((st) => [st.lat, st.lng] as [number, number]);

        const pathCoords = activeCoords.map(([lat, lng]) => [lng, lat]);

        if (pathCoords.length < 2) return;

        const geojson: any = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: pathCoords,
          },
        };

        if (map.getSource('mapbox-route-src')) {
          (map.getSource('mapbox-route-src') as mapboxgl.GeoJSONSource).setData(geojson);
        } else {
          map.addSource('mapbox-route-src', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'mapbox-route-glow',
            type: 'line',
            source: 'mapbox-route-src',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#60A5FA',
              'line-width': 8,
              'line-opacity': 0.4,
            },
          });

          map.addLayer({
            id: 'mapbox-route-line',
            type: 'line',
            source: 'mapbox-route-src',
            layout: { 'line-join': 'round', 'line-cap': 'round' },
            paint: {
              'line-color': '#2563EB',
              'line-width': 4.5,
            },
          });
        }
      } catch (err) {
        console.warn('Mapbox route layer sync notice:', err);
      }
    };

    if (map.isStyleLoaded()) {
      updateRouteNativeLayer();
    } else {
      map.once('styledata', updateRouteNativeLayer);
    }
  }, [fetchedRealRoadPath, routePath, routeStops, mapType]);

  // Sync Native Mapbox GL GPU Heatmap Shader Layer
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const updateHeatmapNativeLayer = () => {
      try {
        if (!map.isStyleLoaded()) return;

        const isHeatmapActive = showHeatmapToggle || mode === 'visit-heatmap' || mode === 'sales-heatmap';

        if (!isHeatmapActive || heatmapPoints.length === 0) {
          if (map.getLayer('mapbox-heatmap-layer')) map.removeLayer('mapbox-heatmap-layer');
          if (map.getSource('mapbox-heatmap-src')) map.removeSource('mapbox-heatmap-src');
          return;
        }

        const geojson: any = {
          type: 'FeatureCollection',
          features: heatmapPoints.map((pt) => ({
            type: 'Feature',
            properties: {
              intensity: pt.intensity || 0.8,
            },
            geometry: {
              type: 'Point',
              coordinates: [pt.lng, pt.lat],
            },
          })),
        };

        if (map.getSource('mapbox-heatmap-src')) {
          (map.getSource('mapbox-heatmap-src') as mapboxgl.GeoJSONSource).setData(geojson);
        } else {
          map.addSource('mapbox-heatmap-src', {
            type: 'geojson',
            data: geojson,
          });

          map.addLayer({
            id: 'mapbox-heatmap-layer',
            type: 'heatmap',
            source: 'mapbox-heatmap-src',
            maxzoom: 18,
            paint: {
              'heatmap-weight': ['get', 'intensity'],
              'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0,
                'rgba(33,102,172,0)',
                0.2,
                'rgb(103,169,207)',
                0.4,
                'rgb(209,229,240)',
                0.6,
                'rgb(253,219,199)',
                0.8,
                'rgb(239,138,98)',
                1,
                'rgb(178,24,43)',
              ],
              'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 45, 16, 90],
              'heatmap-opacity': 0.85,
            },
          });
        }
      } catch (err) {
        console.warn('Mapbox heatmap sync notice:', err);
      }
    };

    if (map.isStyleLoaded()) {
      updateHeatmapNativeLayer();
    } else {
      map.once('styledata', updateHeatmapNativeLayer);
    }
  }, [heatmapPoints, showHeatmapToggle, mode, mapType]);

  // Handle Zoom Controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
      setZoomLevel(Math.min(zoomLevel + 1, 18));
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
      setZoomLevel(Math.max(zoomLevel - 1, 8));
    }
  };

  const handleRecenter = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({ center: defaultCenter, zoom: 13, duration: 1000 });
      setZoomLevel(13);
    }
  };

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
      {/* MAPBOX GL TILE CANVAS CONTAINER */}
      <div className="absolute inset-0 overflow-hidden select-none bg-[#E3EAF2]">
        <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

        {/* Vector SVG Grid Overlay for Crisp Territory & Polygon Details */}
        <svg
          className="w-full h-full object-cover opacity-90 transition-opacity duration-300 pointer-events-none absolute inset-0 z-10"
          viewBox={`0 0 ${mapContainerRef.current?.clientWidth || 1000} ${
            mapContainerRef.current?.clientHeight || 800
          }`}
        >
          {/* MAPBOX VECTOR POLYGON TERRITORIES LAYER */}
          {(mode === 'territories' || territories.length > 0) &&
            territories.map((terr) => (
              <g key={terr.id}>
                <polygon
                  points={terr.pathPoints
                    .map(([lat, lng]) => {
                      const pt = getPixelPoint(lat, lng);
                      return `${pt.x},${pt.y}`;
                    })
                    .join(' ')}
                  fill={terr.fillColor}
                  fillOpacity="0.22"
                  stroke={terr.borderColor}
                  strokeWidth="3"
                  strokeDasharray="6 4"
                />
              </g>
            ))}



          {/* ROUTE PLAYBACK MAPBOX POLYLINE LAYER */}
          {(mode === 'route-playback' || routeStops.length > 0 || routePath.length > 0 || fetchedRealRoadPath.length > 0) && (
            <g>
              {/* Outer Glow Halo */}
              <polyline
                points={(fetchedRealRoadPath.length > 0
                  ? fetchedRealRoadPath
                  : routePath.length > 0
                  ? routePath
                  : routeStops.map((st) => [st.lat, st.lng] as [number, number])
                )
                  .map(([lat, lng]) => {
                    const pt = getPixelPoint(lat, lng);
                    return `${pt.x},${pt.y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="7"
                strokeOpacity="0.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Core Road Line */}
              <polyline
                points={(fetchedRealRoadPath.length > 0
                  ? fetchedRealRoadPath
                  : routePath.length > 0
                  ? routePath
                  : routeStops.map((st) => [st.lat, st.lng] as [number, number])
                )
                  .map(([lat, lng]) => {
                    const pt = getPixelPoint(lat, lng);
                    return `${pt.x},${pt.y}`;
                  })
                  .join(' ')}
                fill="none"
                stroke="#2563EB"
                strokeWidth="4"
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
          onClick={handleZoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer font-bold"
          title="Zoom In (Mapbox)"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer font-bold"
          title="Zoom Out (Mapbox)"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={handleRecenter}
          className="flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer font-bold"
          title="Recenter Mapbox Map"
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
        executives.map((exec) => {
          const pt = getPixelPoint(exec.lat, exec.lng);
          const isSelected = selectedMarkerId === exec.id;

          const ringColor =
            exec.status === 'On Field'
              ? 'ring-emerald-500 bg-emerald-500'
              : exec.status === 'In Transit'
              ? 'ring-amber-500 bg-amber-500'
              : exec.status === 'Break'
              ? 'ring-purple-500 bg-purple-500'
              : exec.status === 'Vehicle'
              ? 'ring-red-500 bg-red-500'
              : 'ring-slate-400 bg-slate-400';

          return (
            <div
              key={exec.id}
              onClick={() => {
                setSelectedMarkerId(exec.id);
                if (onSelectExecutive) onSelectExecutive(exec);
              }}
              style={{
                transform: `translate3d(${pt.x}px, ${pt.y}px, 0)`,
                left: 0,
                top: 0,
              }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
            >
              <div
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white shadow-lg ring-4 transition-transform hover:scale-110 ${ringColor}`}
              >
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
                    <p>
                      <span className="text-slate-400 font-bold block text-[9px] uppercase">
                        Current Location / Visit
                      </span>{' '}
                      {exec.currentLocation}
                    </p>
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
          const pt = getPixelPoint(pr.lat, pr.lng);

          const markerBg =
            pr.markerColor === 'blue'
              ? 'bg-blue-600 text-white'
              : pr.markerColor === 'green'
              ? 'bg-emerald-600 text-white'
              : pr.markerColor === 'yellow'
              ? 'bg-amber-500 text-white'
              : pr.markerColor === 'red'
              ? 'bg-red-600 text-white'
              : pr.markerColor === 'purple'
              ? 'bg-purple-600 text-white'
              : 'bg-amber-400 text-slate-900';

          return (
            <div
              key={pr.id}
              onClick={() => {
                setSelectedMarkerId(pr.id);
                if (onSelectProspect) onSelectProspect(pr);
              }}
              style={{
                transform: `translate3d(${pt.x}px, ${pt.y}px, 0)`,
                left: 0,
                top: 0,
              }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-md font-bold text-xs transition-transform hover:scale-125 ${markerBg}`}
              >
                {pr.markerColor === 'star' ? (
                  <Star className="h-4 w-4 fill-slate-900" />
                ) : (
                  <MapPin className="h-4 w-4" />
                )}
              </div>
            </div>
          );
        })}

      {/* MAPBOX MARKERS: ROUTE PLAYBACK WAYPOINTS */}
      {mode === 'route-playback' &&
        routeStops.map((st, i) => {
          const pt = getPixelPoint(st.lat, st.lng);
          const isActive = playbackActiveStopIndex === i;

          return (
            <div
              key={st.id}
              style={{
                transform: `translate3d(${pt.x}px, ${pt.y}px, 0)`,
                left: 0,
                top: 0,
              }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-auto"
            >
              <div
                className={`flex items-center justify-center rounded-full border-2 border-white shadow-md font-extrabold text-xs text-white transition-all ${
                  st.type === 'start'
                    ? 'h-9 w-9 bg-emerald-600 ring-4 ring-emerald-200'
                    : st.type === 'end'
                    ? 'h-9 w-9 bg-red-600 ring-4 ring-red-200'
                    : isActive
                    ? 'h-8 w-8 bg-blue-600 ring-4 ring-blue-300 scale-125'
                    : 'h-7 w-7 bg-blue-500'
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
          const pt = getPixelPoint(terr.centerLat, terr.centerLng);
          return (
            <div
              key={terr.id}
              style={{
                transform: `translate3d(${pt.x}px, ${pt.y}px, 0)`,
                left: 0,
                top: 0,
              }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none"
            >
              <div className="rounded-sm bg-white/95 border border-slate-300 p-2 shadow-md space-y-0.5 text-xs pointer-events-auto">
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
            {mode === 'prospects'
              ? 'Prospect Status Legend'
              : mode === 'territories'
              ? 'Sales Achievement %'
              : mode === 'route-playback'
              ? 'Route Legend'
              : mode === 'visit-heatmap'
              ? 'Visit Density Scale'
              : mode === 'sales-heatmap'
              ? 'Sales Amount (₹)'
              : 'Status Legend'}
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
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> 80% and above
              </span>{' '}
              <span className="text-slate-400 font-normal">High</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-lime-500" /> 60% – 79%
              </span>{' '}
              <span className="text-slate-400 font-normal">Good</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> 40% – 59%
              </span>{' '}
              <span className="text-slate-400 font-normal">Average</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Below 20%
              </span>{' '}
              <span className="text-slate-400 font-normal">Low</span>
            </div>
          </div>
        ) : mode === 'route-playback' ? (
          <div className="space-y-1.5 text-[11px] font-bold">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Start Location
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" /> End Location
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Visited Stop
            </div>
          </div>
        ) : (
          <div className="space-y-1.5 text-[11px] font-bold">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> On Field
              </span>{' '}
              <span className="text-slate-500">24</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> In Transit
              </span>{' '}
              <span className="text-slate-500">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Break
              </span>{' '}
              <span className="text-slate-500">1</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Offline / Not Working
              </span>{' '}
              <span className="text-slate-500">4</span>
            </div>
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
            showHeatmapToggle
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Toggle Heatmap
        </button>
      </div>

      {children}
    </div>
  );
}
