import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  RefreshCw,
  Edit,
  Download,
  MapPin,
  Layers,
  Building,
  Users,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import {
  mockTerritoriesList,
  mockTerritoryBusinesses,
  mockTerritoryExecutives,
} from './territoriesData';

export default function TerritoryMapPage() {
  const { territoryId } = useParams();
  const navigate = useNavigate();

  const territory =
    mockTerritoriesList.find((t) => t.id === territoryId || t.code === territoryId) ||
    mockTerritoriesList[0];

  // Map Layers Toggle State
  const [showBoundary, setShowBoundary] = useState(true);
  const [showBusinesses, setShowBusinesses] = useState(true);
  const [showActiveBusinesses, setShowActiveBusinesses] = useState(true);
  const [showLeads, setShowLeads] = useState(true);
  const [showVisitedLocations, setShowVisitedLocations] = useState(true);
  const [showExecutives, setShowExecutives] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="space-y-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => navigate(`/admin/territories/${territory.id}`)}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Territory Details
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Territory Map</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                • {territory.status}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Visualize boundary, coverage and key points in {territory.name} territory
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Territory map refreshed')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh Map
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/territories/${territory.id}/edit`)}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Edit className="h-3.5 w-3.5" /> Edit Boundary
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={() => toast.success('Exporting Territory map PNG/PDF...')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export Map
            </Button>
          </div>
        </div>

        {/* Territory Summary Bar */}
        <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="font-extrabold text-[#0D1F3D]">{territory.name}</span>
            <span className="font-mono text-slate-400">({territory.code})</span>
            <span className="text-slate-500">{territory.regionArea}</span>
          </div>

          <div className="border-l border-slate-200 pl-4 flex items-center gap-2">
            <img
              src={territory.managerAvatar}
              alt={territory.managerName}
              className="h-6 w-6 rounded-full object-cover border border-slate-200"
            />
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Manager</span>
              <span className="font-extrabold text-[#0D1F3D]">{territory.managerName}</span>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Coverage Area</span>
            <span className="font-extrabold text-slate-700">{territory.areaKm2} km²</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Total Businesses</span>
            <span className="font-extrabold text-[#0D1F3D]">168</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Active Businesses</span>
            <span className="font-extrabold text-emerald-600">142</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Executives</span>
            <span className="font-extrabold text-blue-600">14</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Last Updated</span>
            <span className="font-extrabold text-slate-700">{territory.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main Grid (4-col Left Control Sidebar + 8-col Right Interactive Mapbox View) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT COLUMN (4 COLS MAP LAYERS & LEGEND) */}
        <div className="space-y-4 lg:col-span-4 flex flex-col">
          {/* Map Layers Card */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Map Layers</span>
              <Layers className="h-3.5 w-3.5 text-slate-400" />
            </h3>

            <div className="space-y-2 text-slate-700">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBoundary}
                  onChange={(e) => setShowBoundary(e.target.checked)}
                  className="rounded-xs border-slate-300 accent-[#0D1F3D]"
                />
                <span className="text-blue-600 font-mono font-bold">---</span>
                <span>Territory Boundary</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBusinesses}
                  onChange={(e) => setShowBusinesses(e.target.checked)}
                  className="rounded-xs border-slate-300 accent-[#0D1F3D]"
                />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Businesses</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showActiveBusinesses}
                  onChange={(e) => setShowActiveBusinesses(e.target.checked)}
                  className="rounded-xs border-slate-300 accent-[#0D1F3D]"
                />
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                <span>Active Businesses</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLeads}
                  onChange={(e) => setShowLeads(e.target.checked)}
                  className="rounded-xs border-slate-300 accent-[#0D1F3D]"
                />
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                <span>Leads</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showVisitedLocations}
                  onChange={(e) => setShowVisitedLocations(e.target.checked)}
                  className="rounded-xs border-slate-300 accent-[#0D1F3D]"
                />
                <span className="text-amber-500">📍</span>
                <span>Visited Locations (This Month)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showExecutives}
                  onChange={(e) => setShowExecutives(e.target.checked)}
                  className="rounded-xs border-slate-300 accent-[#0D1F3D]"
                />
                <span className="text-red-500">👤</span>
                <span>Executives Live Location</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="rounded-xs border-slate-300 accent-[#0D1F3D]"
                />
                <span className="text-blue-500 font-mono">---</span>
                <span>Routes (This Month)</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="rounded-xs border-slate-300 accent-[#0D1F3D]"
                />
                <span>🔥 Heatmap (Visits)</span>
              </label>
            </div>
          </div>

          {/* Legend Card with Counts */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Legend & Counts
            </h3>

            <div className="space-y-1.5 text-slate-700 text-[11px]">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Active Businesses
                </span>
                <span className="font-extrabold text-[#0D1F3D]">142</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> Inactive Businesses
                </span>
                <span className="font-extrabold text-[#0D1F3D]">26</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Leads
                </span>
                <span className="font-extrabold text-[#0D1F3D]">98</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="text-amber-500">📍</span> Visited Locations
                </span>
                <span className="font-extrabold text-[#0D1F3D]">176</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="text-red-500">👤</span> Executives
                </span>
                <span className="font-extrabold text-[#0D1F3D]">14</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <span className="text-blue-500 font-mono">---</span> Routes
                </span>
                <span className="font-extrabold text-[#0D1F3D]">28</span>
              </div>
            </div>
          </div>

          {/* Territory Info Box */}
          <div className="rounded-sm border border-slate-200/90 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Territory Info
            </h3>

            <div className="space-y-1 text-slate-600 text-[11px]">
              <div className="flex justify-between">
                <span>Territory Code :</span>
                <span className="font-mono font-bold text-[#0D1F3D]">{territory.code}</span>
              </div>
              <div className="flex justify-between">
                <span>Region / Area :</span>
                <span>{territory.regionArea}</span>
              </div>
              <div className="flex justify-between">
                <span>Coverage Area :</span>
                <span className="font-bold text-slate-800">{territory.areaKm2} km²</span>
              </div>
              <div className="flex justify-between">
                <span>Created On :</span>
                <span>{territory.createdOn}</span>
              </div>
              <div className="flex justify-between">
                <span>Created By :</span>
                <span>{territory.createdBy}</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/territories/${territory.id}`)}
              className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D] mt-2"
            >
              <span>View Territory Details</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN (8 COLS FULL MAPBOX VIEW) */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="relative rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden flex-1 min-h-[580px]">
            <InteractiveMap
              mode={showHeatmap ? 'visit-heatmap' : 'live-executives'}
              executives={
                showExecutives
                  ? mockTerritoryExecutives.map((exec, idx) => ({
                      id: exec.id,
                      name: exec.name,
                      avatar: exec.avatar,
                      status: (exec.status as any) || 'On Field',
                      currentLocation: 'Andheri East, Mumbai',
                      lastUpdated: '10:25 AM',
                      batteryLevel: 85 - idx * 5,
                      lat: 19.115 + idx * 0.008,
                      lng: 72.86 + idx * 0.008,
                      phone: exec.phone,
                      team: exec.team,
                      visitsTodayCompleted: exec.visitsCount,
                      visitsTodayTotal: 30,
                      distanceKmToday: 18.5,
                    }))
                  : []
              }
              prospects={
                showBusinesses
                  ? mockTerritoryBusinesses.map((b, idx) => ({
                      id: b.id,
                      name: b.name,
                      category: b.category,
                      address: 'Andheri East, Mumbai',
                      status: (b.status === 'Active' ? 'Visited' : 'New Prospect') as any,
                      markerColor: b.status === 'Active' ? 'green' : 'purple',
                      contactPerson: b.contactPerson,
                      phone: b.phone,
                      lastVisitTime: b.lastVisitDate,
                      lat: 19.11 + (idx % 4) * 0.01,
                      lng: 72.85 + (idx % 3) * 0.015,
                      region: 'Mumbai – Andheri East',
                    }))
                  : []
              }
              heightClassName="h-full min-h-[580px]"
              territoryPath={showBoundary ? territory.pathPoints : undefined}
              showHeatmapToggle={showHeatmap}
            />

            {/* Map Polygon Stats Overlay Footer */}
            <div className="absolute bottom-3 right-3 z-20 rounded-sm border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-extrabold text-[#0D1F3D] shadow-md">
              Area: {territory.areaKm2} km² &nbsp;|&nbsp; Perimeter: {territory.perimeterKm} km
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Metrics Cards Grid (5 Stat Cards matching Territory Map.png) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 pt-2">
        <MapKpiCard
          title="Total Visits (This Month)"
          value="176"
          subValue="↑ 18.4% vs last month"
          icon={TrendingUp}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <MapKpiCard
          title="Active Businesses"
          value="142"
          subValue="84% of total"
          icon={Building}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <MapKpiCard
          title="Leads"
          value="98"
          subValue="58.3% converted"
          icon={Users}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <MapKpiCard
          title="Avg. Visit Duration"
          value="32m 15s"
          subValue="↑ 8.6% vs last month"
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <MapKpiCard
          title="Coverage Efficiency"
          value="78%"
          subValue="Good coverage"
          icon={CheckCircle2}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>
    </div>
  );
}
