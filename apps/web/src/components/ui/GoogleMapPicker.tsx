import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { MapPin, Search, ShieldCheck, RefreshCw, Crosshair } from 'lucide-react';
import { Button } from './Button';
import mapboxgl from 'mapbox-gl';
import { getMapboxStyle } from '../maps/InteractiveMap';

export interface GoogleMapPickerProps {
  address?: string;
  onAddressChange?: (address: string) => void;
  lat?: number;
  lng?: number;
  onCoordinatesChange?: (coords: { lat: number; lng: number }) => void;
  radiusMeters?: number;
  onRadiusChange?: (radius: number) => void;
  readOnly?: boolean;
  height?: string;
  showLocateMe?: boolean;
}

// Helper to construct a GeoJSON Polygon circle for Mapbox GL JS
function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 64) {
  const lng = center[0];
  const lat = center[1];
  const km = radiusInMeters / 1000;
  const ret: [number, number][] = [];
  const distanceX = km / (111.32 * Math.cos((lat * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([lng + x, lat + y]);
  }
  ret.push(ret[0]); // Close polygon loop

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [ret],
    },
    properties: {},
  };
}

export function GoogleMapPicker({
  address = 'Orion Mall, Dr. C. H. Street, Mumbai, Maharashtra 400001',
  onAddressChange,
  lat = 19.119698,
  lng = 72.869701,
  onCoordinatesChange,
  radiusMeters = 100,
  onRadiusChange,
  readOnly = false,
  height = 'h-64',
  showLocateMe = true,
}: GoogleMapPickerProps) {
  const [currentAddress, setCurrentAddress] = useState(address);
  const [currentLat, setCurrentLat] = useState(lat);
  const [currentLng, setCurrentLng] = useState(lng);
  const [currentRadius, setCurrentRadius] = useState(radiusMeters);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(
    `Mapbox GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
  );

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // Sync state when parent lat or lng props update dynamically
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) {
      setCurrentLat(lat);
      setCurrentLng(lng);
      setGpsStatus(`Mapbox Location: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`);
    }
  }, [lat, lng]);

  useEffect(() => {
    if (address !== undefined) {
      setCurrentAddress(address);
    }
  }, [address]);

  useEffect(() => {
    if (radiusMeters !== undefined) {
      setCurrentRadius(radiusMeters);
    }
  }, [radiusMeters]);

  // Helper to add or update geofence source and layers on Mapbox map
  const updateGeofenceLayer = (map: mapboxgl.Map, centerLat: number, centerLng: number, radius: number) => {
    const geojsonCircle = createGeoJSONCircle([centerLng, centerLat], radius);
    const sourceId = 'geofence-radius-source';

    const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource | undefined;
    if (source) {
      source.setData(geojsonCircle);
    } else {
      map.addSource(sourceId, {
        type: 'geojson',
        data: geojsonCircle,
      });

      map.addLayer({
        id: 'geofence-radius-fill',
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': '#0D1F3D',
          'fill-opacity': 0.18,
        },
      });

      map.addLayer({
        id: 'geofence-radius-outline',
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': '#E20613',
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });
    }
  };

  // Initialize Mapbox GL JS map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: getMapboxStyle('map'),
        center: [currentLng, currentLat],
        zoom: 14,
        interactive: !readOnly,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right');

      // Create a draggable Mapbox marker
      const marker = new mapboxgl.Marker({
        color: '#0D1F3D',
        draggable: !readOnly,
      })
        .setLngLat([currentLng, currentLat])
        .addTo(map);

      map.on('load', () => {
        updateGeofenceLayer(map, currentLat, currentLng, currentRadius);
      });

      // Click anywhere on map to move pin marker
      map.on('click', (e) => {
        if (readOnly) return;
        const newLat = Number(e.lngLat.lat.toFixed(6));
        const newLng = Number(e.lngLat.lng.toFixed(6));
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        marker.setLngLat([newLng, newLat]);
        setGpsStatus(`Map Pin Placed: ${newLat}° N, ${newLng}° E`);
        if (onCoordinatesChange) {
          onCoordinatesChange({ lat: newLat, lng: newLng });
        }
      });

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        const newLat = Number(lngLat.lat.toFixed(6));
        const newLng = Number(lngLat.lng.toFixed(6));
        setCurrentLat(newLat);
        setCurrentLng(newLng);
        setGpsStatus(`Mapbox Location Pinned: ${newLat}° N, ${newLng}° E`);
        if (onCoordinatesChange) {
          onCoordinatesChange({ lat: newLat, lng: newLng });
        }
      });

      mapRef.current = map;
      markerRef.current = marker;

      return () => {
        map.remove();
      };
    } catch (err) {
      console.warn('Mapbox GL initialize warning fallback:', err);
    }
  }, []);

  // Update Mapbox marker position & Geofence mask on coordinate or radius changes
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([currentLng, currentLat]);
      mapRef.current.flyTo({ center: [currentLng, currentLat], zoom: 15, duration: 800 });

      if (mapRef.current.isStyleLoaded()) {
        updateGeofenceLayer(mapRef.current, currentLat, currentLng, currentRadius);
      }
    }
  }, [currentLat, currentLng, currentRadius]);

  // Geolocation trigger using browser Geolocation API
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  const performGeocoding = async (queryAddress: string) => {
    const query = queryAddress.trim();
    if (!query) {
      toast.error('Please enter an address or landmark to search.');
      return;
    }

    setIsSearchingAddress(true);
    toast.info(`Searching map coordinates for "${query}"...`);

    try {
      let latFound: number | null = null;
      let lngFound: number | null = null;
      let resolvedAddress = query;

      // 1. Try Mapbox Places Geocoding API first
      const mapboxToken =
        import.meta.env.VITE_MAPBOX_ACCESS_TOKEN ||
        'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.aA53nVisualised';

      try {
        const mbRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxToken}&limit=1`
        );
        if (mbRes.ok) {
          const mbData = await mbRes.json();
          if (mbData && mbData.features && mbData.features.length > 0) {
            const feat = mbData.features[0];
            lngFound = Number(feat.center[0].toFixed(6));
            latFound = Number(feat.center[1].toFixed(6));
            resolvedAddress = feat.place_name || query;
          }
        }
      } catch (e) {}

      // 2. OpenStreetMap Nominatim Fallback if Mapbox API returns no features
      if (latFound === null || lngFound === null) {
        try {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
            { headers: { 'User-Agent': 'SmartFieldWorkSaaS/1.0' } }
          );
          if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (nomData && nomData.length > 0) {
              latFound = Number(parseFloat(nomData[0].lat).toFixed(6));
              lngFound = Number(parseFloat(nomData[0].lon).toFixed(6));
              resolvedAddress = nomData[0].display_name || query;
            }
          }
        } catch (e) {}
      }

      if (latFound !== null && lngFound !== null) {
        setCurrentLat(latFound);
        setCurrentLng(lngFound);
        setCurrentAddress(resolvedAddress);
        setGpsStatus(`Geocoded Location: ${latFound}° N, ${lngFound}° E`);

        if (mapRef.current && markerRef.current) {
          markerRef.current.setLngLat([lngFound, latFound]);
          mapRef.current.flyTo({ center: [lngFound, latFound], zoom: 16, duration: 1000 });
        }

        if (onCoordinatesChange) {
          onCoordinatesChange({ lat: latFound, lng: lngFound });
        }
        if (onAddressChange) {
          onAddressChange(resolvedAddress);
        }

        toast.success(`Location pinned at coordinates (${latFound}, ${lngFound})!`);
      } else {
        toast.error(`No geographic location found for "${query}". Please check spelling or select map directly.`);
      }
    } catch (err) {
      toast.error('Search request failed. Please check network connection.');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    toast.info('Acquiring real-time GPS location via Mapbox...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        const accuracy = Math.round(position.coords.accuracy);

        setCurrentLat(latitude);
        setCurrentLng(longitude);
        setGpsStatus(`GPS Acquired: ${latitude}° N, ${longitude}° E (±${accuracy}m)`);
        setIsLocating(false);

        if (onCoordinatesChange) {
          onCoordinatesChange({ lat: latitude, lng: longitude });
        }

        // Reverse geocode to get human-readable street address
        try {
          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'User-Agent': 'SmartFieldWorkSaaS/1.0' } }
          );
          if (nomRes.ok) {
            const nomData = await nomRes.json();
            if (nomData && nomData.display_name) {
              setCurrentAddress(nomData.display_name);
              if (onAddressChange) onAddressChange(nomData.display_name);
            }
          }
        } catch (e) {}

        toast.success(`Current GPS Location captured! (${latitude}, ${longitude})`);
      },
      (error) => {
        setIsLocating(false);
        toast.error(`GPS Error: ${error.message || 'Unable to retrieve location.'}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performGeocoding(currentAddress);
  };

  // Fallback OpenStreetMap tile embed URL if WebGL context is disabled in certain browser sessions
  const fallbackEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${currentLng - 0.005},${currentLat - 0.005},${currentLng + 0.005},${currentLat + 0.005}&layer=mapnik&marker=${currentLat},${currentLng}`;

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Top Search & Locate Me Bar */}
      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-sm border border-slate-200">
          <form onSubmit={handleAddressSubmit} className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={currentAddress}
                onChange={(e) => {
                  setCurrentAddress(e.target.value);
                  if (onAddressChange) onAddressChange(e.target.value);
                }}
                placeholder="Search shop, building, street or landmark..."
                className="w-full rounded-sm border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={isSearchingAddress}
              className="font-bold text-slate-700 border-slate-200 hover:bg-slate-100 rounded-sm h-8 shrink-0 flex items-center gap-1"
            >
              {isSearchingAddress ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#0D1F3D]" /> Searching...
                </>
              ) : (
                'Pin Address'
              )}
            </Button>
          </form>

          {showLocateMe && (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-[#071326] text-white rounded-sm h-8 shrink-0 border border-slate-700"
            >
              {isLocating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-white" /> Locating...
                </>
              ) : (
                <>
                  <Crosshair className="h-3.5 w-3.5 text-white" /> Locate Me (GPS)
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Lat, Lng & Geofence Radius Bar */}
      {!readOnly && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-semibold bg-white p-2 rounded-sm border border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Lat:</span>
            <input
              type="number"
              step="any"
              value={currentLat}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setCurrentLat(val);
                if (onCoordinatesChange) onCoordinatesChange({ lat: val, lng: currentLng });
              }}
              className="w-full rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 font-mono font-bold text-[#0D1F3D] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Lng:</span>
            <input
              type="number"
              step="any"
              value={currentLng}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                setCurrentLng(val);
                if (onCoordinatesChange) onCoordinatesChange({ lat: currentLat, lng: val });
              }}
              className="w-full rounded-sm border border-slate-200 bg-slate-50 px-2 py-1 font-mono font-bold text-[#0D1F3D] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold whitespace-nowrap">Radius:</span>
            <div className="relative flex-1">
              <input
                type="number"
                min="10"
                max="5000"
                step="10"
                value={currentRadius}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 100;
                  setCurrentRadius(val);
                  if (onRadiusChange) onRadiusChange(val);
                }}
                className="w-full rounded-sm border border-slate-200 bg-slate-50 pl-2 pr-6 py-1 font-mono font-bold text-[#0D1F3D] focus:outline-none"
              />
              <span className="absolute right-2 top-1 text-[10px] text-slate-400 font-bold">m</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Mapbox Map Canvas Container */}
      <div className={`relative ${height} w-full rounded-sm border border-slate-200 overflow-hidden shadow-xs bg-slate-100`}>
        <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />

        {/* Fallback iframe in case Mapbox GL canvas is blocked by browser hardware acceleration */}
        {!mapRef.current && (
          <iframe
            title="Mapbox Geolocator Map"
            src={fallbackEmbedUrl}
            className="w-full h-full border-0 pointer-events-auto"
            loading="lazy"
            allowFullScreen
          />
        )}

        {/* Floating GPS Status Badge */}
        {gpsStatus && (
          <div className="absolute top-2 left-2 rounded-sm bg-[#0D1F3D]/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-bold text-white shadow-md flex items-center gap-1.5 z-10">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>{gpsStatus}</span>
          </div>
        )}

        {!readOnly && (
          <div className="absolute top-2 right-12 rounded-sm bg-blue-900/85 backdrop-blur-xs px-2 py-1 text-[10px] font-bold text-white shadow-xs flex items-center gap-1 z-10">
            <MapPin className="h-3 w-3 text-amber-300 animate-bounce" />
            <span>Click map or drag marker to pin position ({currentRadius}m geofence)</span>
          </div>
        )}

        <div className="absolute bottom-2 right-2 rounded-sm bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-extrabold text-[#0D1F3D] border border-slate-200 shadow-xs flex items-center gap-1 z-10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Geofence Mask Active ({currentRadius}m)
        </div>
      </div>
    </div>
  );
}

export const MapPicker = GoogleMapPicker;

