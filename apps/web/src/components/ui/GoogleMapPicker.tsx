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
  readOnly?: boolean;
  height?: string;
  showLocateMe?: boolean;
}

export function GoogleMapPicker({
  address = 'Orion Mall, Dr. C. H. Street, Mumbai, Maharashtra 400001',
  onAddressChange,
  lat = 19.119698,
  lng = 72.869701,
  onCoordinatesChange,
  readOnly = false,
  height = 'h-64',
  showLocateMe = true,
}: GoogleMapPickerProps) {
  const [currentAddress, setCurrentAddress] = useState(address);
  const [currentLat, setCurrentLat] = useState(lat);
  const [currentLng, setCurrentLng] = useState(lng);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(
    `Mapbox GPS: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
  );

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

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

  // Update Mapbox marker position on coordinate changes
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([currentLng, currentLat]);
      mapRef.current.flyTo({ center: [currentLng, currentLat], zoom: 15, duration: 800 });
    }
  }, [currentLat, currentLng]);

  // Geolocation trigger using browser Geolocation API
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    toast.info('Acquiring real-time GPS location via Mapbox...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
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
    if (onAddressChange) {
      onAddressChange(currentAddress);
    }
    toast.success('Map location updated for address search.');
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
              className="font-bold text-slate-700 border-slate-200 hover:bg-slate-100 rounded-sm h-8"
            >
              Pin Address
            </Button>
          </form>

          {showLocateMe && (
            <Button
              type="button"
              variant="accent"
              size="sm"
              onClick={handleLocateMe}
              disabled={isLocating}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm h-8 shrink-0"
            >
              {isLocating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Locating...
                </>
              ) : (
                <>
                  <Crosshair className="h-3.5 w-3.5 text-emerald-400" /> Locate Me (GPS)
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Lat & Lng Input Coordinates Bar */}
      {!readOnly && (
        <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold bg-white p-2 rounded-sm border border-slate-100">
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

        <div className="absolute bottom-2 right-2 rounded-sm bg-white/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-extrabold text-[#0D1F3D] border border-slate-200 shadow-xs flex items-center gap-1 z-10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Mapbox GL JS Engine Active
        </div>
      </div>
    </div>
  );
}

export const MapPicker = GoogleMapPicker;

