import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Search,
  Check,
  Plus,
  Info,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select, SelectOption } from '../../components/ui/Select';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { mockTerritoriesList, mockTerritoryExecutives, getEmployeeProfile } from './territoriesData';
import { crmApi } from '../../features/crm/crm.api';

export default function EditTerritoryPage() {
  const { territoryId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revision, setRevision] = useState(1);
  const [managerOptions, setManagerOptions] = useState<SelectOption[]>([]);

  const territory =
    mockTerritoriesList.find((t) => t.id === territoryId || t.code === territoryId) ||
    mockTerritoriesList[0];

  // Form State initialized from existing territory data
  const [territoryName, setTerritoryName] = useState(territory.name);
  const [territoryCode, setTerritoryCode] = useState(territory.code);
  const [regionArea, setRegionArea] = useState(territory.regionArea);
  const [city, setCity] = useState(territory.city);
  const [description, setDescription] = useState(territory.description);
  const [status, setStatus] = useState(territory.status);
  const [color, setColor] = useState(territory.color);

  const [managerMembershipId, setManagerMembershipId] = useState('');
  const [revenueTarget, setRevenueTarget] = useState('1400000');
  const [visitTarget, setVisitTarget] = useState('250');
  const [collectionTarget, setCollectionTarget] = useState('930000');
  const [newBusinessTarget, setNewBusinessTarget] = useState('50');
  const [activeBusinessTarget, setActiveBusinessTarget] = useState('200');
  const [retentionTarget, setRetentionTarget] = useState('85');

  const [assignedExecutives, setAssignedExecutives] = useState<string[]>([
    'Arjun Mehta',
    'Neha Sharma',
    'Pooja Yadav',
    'Rakesh Patel',
  ]);

  const [notes, setNotes] = useState(
    'High potential commercial area with good market reach and business density.',
  );

  React.useEffect(() => {
    crmApi
      .owners({ limit: 100 })
      .then((res) => {
        if (res && res.items) {
          setManagerOptions(
            res.items.map((m) => {
              const profile = getEmployeeProfile(m.displayName, m.role, m.avatarUrl);
              return {
                value: m.id,
                label: m.displayName,
                sublabel: profile.sublabel,
                avatar: profile.avatar,
              };
            }),
          );
        }
      })
      .catch(() => {});

    if (territoryId) {
      crmApi
        .territory(territoryId)
        .then((data) => {
          if (data) {
            setTerritoryName(data.name);
            setTerritoryCode(data.code);
            if (data.regionArea) setRegionArea(data.regionArea);
            if (data.city) setCity(data.city);
            if (data.description) setDescription(data.description);
            setStatus(data.status === 'ACTIVE' ? 'Active' : 'Inactive');
            if (data.color) setColor(data.color);
            if (data.managerMembershipId) setManagerMembershipId(data.managerMembershipId);
            setRevision(data.revision);
            if (data.targets?.[0]?.monthlyTarget) {
              setRevenueTarget(String(data.targets[0].monthlyTarget));
            }
          }
        })
        .catch(() => {});
    }
  }, [territoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!territoryName.trim()) {
      toast.error('Please enter a Territory Name');
      return;
    }

    try {
      setIsSubmitting(true);
      if (territoryId) {
        await crmApi.updateTerritory(territoryId, {
          expectedRevision: revision,
          name: territoryName.trim(),
          code: territoryCode.trim() || undefined,
          regionArea: regionArea.trim() || undefined,
          city: city.trim() || undefined,
          description: description.trim() || undefined,
          status: status === 'Active' ? 'ACTIVE' : 'INACTIVE',
          color,
          managerMembershipId: managerMembershipId || undefined,
          monthlyTarget: Number(revenueTarget) || 0,
        });
      }
      toast.success(`Territory "${territoryName}" updated successfully!`);
      navigate(`/admin/territories/${territoryId || territory.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update territory');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/admin/territories/${territory.id}`)}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Details
            </button>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] mt-1">Edit Territory</h1>
          <p className="text-xs font-semibold text-slate-500">
            Update territory details, boundary, targets and assignments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/territories/${territory.id}`)}
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
            Save Changes
          </Button>
        </div>
      </div>

      {/* Main Form Grid (Matching Edit Territory Page.png) */}
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
                  value={territoryName}
                  onChange={(e) => setTerritoryName(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 font-bold focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Territory Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={territoryCode}
                  onChange={(e) => setTerritoryCode(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 font-mono font-bold focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <Select
                  label="Region / Area *"
                  value={regionArea}
                  onChange={(e) => setRegionArea(e.target.value)}
                  placeholder="Select region / area"
                  searchable
                  options={[
                    { value: 'Mumbai – Andheri East', label: 'Mumbai – Andheri East' },
                    { value: 'Mumbai – Andheri West', label: 'Mumbai – Andheri West' },
                    { value: 'Mumbai – Bandra', label: 'Mumbai – Bandra' },
                  ]}
                />
              </div>

              <div className="space-y-1">
                <Select
                  label="City *"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Select city"
                  searchable
                  options={[
                    { value: 'Mumbai', label: 'Mumbai' },
                    { value: 'Thane', label: 'Thane' },
                  ]}
                />
              </div>

              <div className="space-y-1">
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  searchable={false}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                  ]}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Color</label>
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

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 block">Description</label>
                <textarea
                  rows={3}
                  maxLength={200}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white p-3 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 text-right block">
                  {description.length}/200
                </span>
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

            <Select
              searchable
              value={managerMembershipId}
              onChange={(e) => setManagerMembershipId(e.target.value)}
              placeholder="Search and select manager..."
              options={
                managerOptions.length > 0
                  ? managerOptions
                  : [
                      {
                        value: '',
                        label: 'No managers available',
                      },
                    ]
              }
            />
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
                <label className="font-bold text-slate-700 block">Revenue Target (₹) *</label>
                <input
                  type="number"
                  value={revenueTarget}
                  onChange={(e) => setRevenueTarget(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 font-bold focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Visit Target *</label>
                <input
                  type="number"
                  value={visitTarget}
                  onChange={(e) => setVisitTarget(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 font-bold focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Collection Target (₹)</label>
                <input
                  type="number"
                  value={collectionTarget}
                  onChange={(e) => setCollectionTarget(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 font-bold focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">New Business Target</label>
                <input
                  type="number"
                  value={newBusinessTarget}
                  onChange={(e) => setNewBusinessTarget(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 font-bold focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Active Business Target</label>
                <input
                  type="number"
                  value={activeBusinessTarget}
                  onChange={(e) => setActiveBusinessTarget(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 font-bold focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">
                  Business Retention Target (%)
                </label>
                <input
                  type="number"
                  value={retentionTarget}
                  onChange={(e) => setRetentionTarget(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-slate-800 font-bold focus:border-[#0D1F3D] focus:outline-none"
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

            <div className="flex flex-wrap gap-2">
              {assignedExecutives.map((name) => {
                const execObj = mockTerritoryExecutives.find((e) => e.name === name);
                return (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 pl-1 pr-2.5 py-1 text-xs font-bold text-[#0D1F3D] shadow-2xs"
                  >
                    <img
                      src={
                        execObj?.avatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'
                      }
                      alt={name}
                      className="h-5 w-5 rounded-full object-cover border border-white shrink-0"
                    />
                    <span>{name}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAssignedExecutives(assignedExecutives.filter((n) => n !== name))
                      }
                      className="text-slate-400 hover:text-slate-900 font-extrabold ml-1 cursor-pointer"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => toast.info('Executive selector opened')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 mt-1"
            >
              <Plus className="h-3.5 w-3.5" /> Add More Executives
            </button>

            <span className="text-[11px] text-slate-400 font-normal block">
              14 executives assigned
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN (6 COLS - MAP & SUMMARY) */}
        <div className="space-y-4 lg:col-span-6">
          {/* Card 5: Boundary Editor Map */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                5
              </span>
              Define Territory Boundary
            </h3>

            <div className="relative rounded-sm border border-slate-200 overflow-hidden">
              <InteractiveMap
                mode="territories"
                heightClassName="h-[360px]"
                enablePolygonDrawing
                territoryPath={territory.pathPoints}
                compact
              />
            </div>
          </div>

          {/* Notes & Guidance Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
              <label className="font-bold text-[#0D1F3D] block">Notes (Optional)</label>
              <textarea
                rows={4}
                maxLength={300}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white p-2.5 text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
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
                <li>Changes will be applied to the territory immediately.</li>
                <li>Targets will be updated for assigned executives.</li>
                <li>Boundary changes may affect visit assignments.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
