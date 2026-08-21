import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  MapPin,
  Search,
  Maximize2,
  Trash2,
  Layers,
  Plus,
  Minus,
  Check,
  Building,
  Users,
  Target,
  FileText,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { mockTerritoriesList } from './territoriesData';

export default function CreateTerritoryPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [territoryName, setTerritoryName] = useState('');
  const [territoryCode, setTerritoryCode] = useState('T011');
  const [regionArea, setRegionArea] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [color, setColor] = useState('#2563EB');

  const [managerName, setManagerName] = useState('');
  const [revenueTarget, setRevenueTarget] = useState('');
  const [visitTarget, setVisitTarget] = useState('');
  const [collectionTarget, setCollectionTarget] = useState('');
  const [newBusinessTarget, setNewBusinessTarget] = useState('');
  const [selectedExecutives, setSelectedExecutives] = useState<string[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!territoryName.trim()) {
      toast.error('Please enter a Territory Name');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Territory "${territoryName}" created successfully!`);
      navigate('/admin/territories');
    }, 600);
  };

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Create Territory</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Define territory details, boundaries and assign manager & targets
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/territories')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="accent"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 shadow-xs"
          >
            Save Territory
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout (Matching Create Territory Page.png) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT COLUMN (6 COLS) */}
        <div className="space-y-4 lg:col-span-6">
          {/* Card 1: Territory Information */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                1
              </span>
              Territory Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Territory Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter territory name"
                  value={territoryName}
                  onChange={(e) => setTerritoryName(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Territory Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter code (e.g. T001)"
                  value={territoryCode}
                  onChange={(e) => setTerritoryCode(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Region / Area <span className="text-red-500">*</span>
                </label>
                <select
                  value={regionArea}
                  onChange={(e) => setRegionArea(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
                >
                  <option value="">Select region / area</option>
                  <option value="Mumbai – Andheri East">Mumbai – Andheri East</option>
                  <option value="Mumbai – Andheri West">Mumbai – Andheri West</option>
                  <option value="Mumbai – Bandra">Mumbai – Bandra</option>
                  <option value="Mumbai – Ghatkopar">Mumbai – Ghatkopar</option>
                  <option value="Thane – West">Thane – West</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
                >
                  <option value="Mumbai">Mumbai</option>
                  <option value="Thane">Thane</option>
                  <option value="Navi Mumbai">Navi Mumbai</option>
                  <option value="Pune">Pune</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 block">Description</label>
                <textarea
                  rows={3}
                  maxLength={200}
                  placeholder="Enter description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white p-3 text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 text-right block">
                  {description.length}/200
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Color <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-8 w-10 cursor-pointer rounded-sm border border-slate-200 p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-slate-800 font-mono text-xs focus:border-[#0D1F3D] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Assign Manager */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                2
              </span>
              Assign Manager
            </h3>

            <div>
              <select
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
              >
                <option value="">Search and select manager</option>
                <option value="Vikram Singh">Vikram Singh (Sales Manager)</option>
                <option value="Neha Sharma">Neha Sharma (Sales Manager)</option>
                <option value="Arjun Mehta">Arjun Mehta (Sales Manager)</option>
                <option value="Pooja Yadav">Pooja Yadav (Team Leader)</option>
              </select>
              <p className="text-[11px] text-slate-400 font-normal mt-1">
                Manager will be responsible for this territory.
              </p>
            </div>
          </div>

          {/* Card 3: Targets (Monthly) */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                3
              </span>
              Targets (Monthly)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Revenue Target (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter revenue target"
                  value={revenueTarget}
                  onChange={(e) => setRevenueTarget(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Visit Target <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter visit target"
                  value={visitTarget}
                  onChange={(e) => setVisitTarget(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Collection Target (₹)</label>
                <input
                  type="number"
                  placeholder="Enter collection target"
                  value={collectionTarget}
                  onChange={(e) => setCollectionTarget(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">New Business Target</label>
                <input
                  type="number"
                  placeholder="Enter new business target"
                  value={newBusinessTarget}
                  onChange={(e) => setNewBusinessTarget(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Assign Executives */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                4
              </span>
              Assign Executives
            </h3>

            <div className="space-y-2">
              <select
                onChange={(e) => {
                  if (e.target.value && !selectedExecutives.includes(e.target.value)) {
                    setSelectedExecutives([...selectedExecutives, e.target.value]);
                  }
                }}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
              >
                <option value="">Search and select executives</option>
                <option value="Arjun Mehta">Arjun Mehta (Senior Executive)</option>
                <option value="Neha Sharma">Neha Sharma (Sales Executive)</option>
                <option value="Pooja Yadav">Pooja Yadav (Field Representative)</option>
                <option value="Rakesh Patel">Rakesh Patel (Sales Executive)</option>
                <option value="Kiran Jadhav">Kiran Jadhav (Field Representative)</option>
              </select>

              {selectedExecutives.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedExecutives.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center gap-1.5 rounded-sm bg-slate-100 border border-slate-200 px-2 py-1 text-xs font-bold text-[#0D1F3D]"
                    >
                      <span>{name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedExecutives(selectedExecutives.filter((n) => n !== name))
                        }
                        className="text-slate-400 hover:text-slate-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[11px] text-slate-400 font-normal">
                Select one or more executives for this territory.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (6 COLS - MAP & BOUNDARY SUMMARY) */}
        <div className="space-y-4 lg:col-span-6">
          {/* Card 5: Define Territory Boundary */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                  5
                </span>
                Define Territory Boundary
              </h3>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toast.info('Boundary cleared')}
                className="text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 rounded-sm"
              >
                Clear Boundary
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Search location and draw the boundary on map
            </p>

            {/* Location Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search location (e.g. Andheri East, Mumbai)"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toast.info(`Searching ${searchLocation}...`)}
                className="text-xs font-bold border-slate-200 bg-white hover:bg-slate-50"
              >
                Search on Map
              </Button>
            </div>

            {/* Map Canvas */}
            <div className="relative rounded-sm border border-slate-200 overflow-hidden">
              <InteractiveMap
                mode="territories"
                heightClassName="h-[360px]"
                territoryPath={[
                  [19.16, 72.85],
                  [19.16, 72.9],
                  [19.11, 72.9],
                  [19.11, 72.85],
                ]}
                compact
              />

              {/* Map Polygon Stats Footer Overlay */}
              <div className="absolute bottom-3 right-3 z-20 rounded-sm border border-slate-200 bg-white/95 px-3 py-1.5 text-[11px] font-extrabold text-[#0D1F3D] shadow-md">
                Area: 18.45 km² &nbsp;|&nbsp; Perimeter: 23.67 km
              </div>
            </div>
          </div>

          {/* Card 6: Territory Summary (5 Stat Cards) */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                6
              </span>
              Territory Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="rounded-sm border border-slate-100 bg-slate-50 p-2.5 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Area</span>
                <span className="text-xs font-extrabold text-[#0D1F3D]">18.45 km²</span>
              </div>

              <div className="rounded-sm border border-slate-100 bg-slate-50 p-2.5 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Perimeter</span>
                <span className="text-xs font-extrabold text-[#0D1F3D]">23.67 km</span>
              </div>

              <div className="rounded-sm border border-slate-100 bg-slate-50 p-2.5 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Est. Businesses</span>
                <span className="text-xs font-extrabold text-[#0D1F3D]">1,248</span>
              </div>

              <div className="rounded-sm border border-slate-100 bg-slate-50 p-2.5 text-center">
                <span className="text-[10px] text-slate-400 font-bold block">Est. Population</span>
                <span className="text-xs font-extrabold text-[#0D1F3D]">3.2 Lakh</span>
              </div>

              <div className="rounded-sm border border-slate-100 bg-slate-50 p-2.5 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 font-bold block">Active Executives</span>
                <span className="text-xs font-extrabold text-blue-600">
                  {selectedExecutives.length || 12}
                </span>
              </div>
            </div>
          </div>

          {/* Card 7: Notes & Note Guidance Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
              <label className="font-bold text-[#0D1F3D] block">Notes (Optional)</label>
              <textarea
                rows={4}
                maxLength={300}
                placeholder="Add any notes about this territory"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white p-2.5 text-slate-800 placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 text-right block">
                {notes.length}/300
              </span>
            </div>

            <div className="rounded-sm border border-blue-100 bg-blue-50/60 p-4 space-y-2 text-xs font-semibold text-blue-900">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold">
                <Info className="h-4 w-4" /> Note
              </div>
              <ul className="space-y-1.5 text-[11px] text-blue-800 font-medium list-disc pl-4">
                <li>You can edit territory boundary anytime after creation.</li>
                <li>Ensure the territory coverage is balanced for fair distribution of resources.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
