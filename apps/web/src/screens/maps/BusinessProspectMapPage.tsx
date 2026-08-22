import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  Target,
  Flame,
  UserCheck,
  Clock,
  TrendingUp,
  RefreshCw,
  Filter,
  Download,
  Maximize2,
  Search,
  ChevronRight,
  Star,
  MapPin,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { mockProspectMarkers, BusinessProspectMarker } from './mapsData';

export default function BusinessProspectMapPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [prospectFilter, setProspectFilter] = useState('All');
  const [selectedProspect, setSelectedProspect] = useState<BusinessProspectMarker | null>(
    mockProspectMarkers[0],
  );

  const filteredProspects = mockProspectMarkers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      prospectFilter === 'All' ||
      (prospectFilter === 'New' && p.status === 'New Prospect') ||
      (prospectFilter === 'Visited' && p.status === 'Visited') ||
      (prospectFilter === 'Unvisited' && p.lastVisitTime === 'Unvisited') ||
      (prospectFilter === 'Customer' && p.status === 'Customer');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 font-sans pb-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[#0D1F3D]">Business Prospect Map</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Explore and manage business prospects across your territory
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Prospect map updated')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Filters drawer opened')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting prospect coordinates...')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Full Screen Mode toggled')}
            className="font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Full Screen
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards Grid (6 Cards) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <MapKpiCard
          title="Total Prospects"
          value="248"
          subValue="All businesses"
          icon={Building2}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <MapKpiCard
          title="New Prospects"
          value="76"
          subValue="This month"
          icon={Target}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <MapKpiCard
          title="Hot Prospects"
          value="42"
          subValue="High potential"
          icon={Flame}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <MapKpiCard
          title="Assigned"
          value="168"
          subValue="67% of total"
          icon={UserCheck}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <MapKpiCard
          title="Unvisited"
          value="58"
          subValue="Need attention"
          icon={Clock}
          iconBgColor="bg-slate-100"
          iconTextColor="text-slate-600"
        />
        <MapKpiCard
          title="Conversions"
          value="32"
          subValue="This month"
          icon={TrendingUp}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Main Grid Layout (8-col Map + 4-col Sidebar) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Interactive Map Area */}
        <div className="relative lg:col-span-8">
          <InteractiveMap
            mode="prospects"
            prospects={filteredProspects}
            selectedProspectId={selectedProspect?.id}
            onSelectProspect={(pr) => setSelectedProspect(pr)}
            heightClassName="h-[650px]"
          >
            {/* Filter Overlay inside Map */}
            <div className="absolute right-4 top-4 z-20 w-52">
              <Select
                value={prospectFilter}
                onChange={(e) => setProspectFilter(e.target.value)}
                options={[
                  { label: 'View by: All Prospects', value: 'All' },
                  { label: 'View by: New Prospects', value: 'New' },
                  { label: 'View by: Visited', value: 'Visited' },
                  { label: 'View by: Unvisited', value: 'Unvisited' },
                  { label: 'View by: Customers', value: 'Customer' },
                ]}
              />
            </div>
          </InteractiveMap>
        </div>

        {/* Right Sidebar: Business Prospects List */}
        <div className="lg:col-span-4 rounded-sm border border-slate-200/90 bg-white p-4 shadow-sm space-y-3 flex flex-col h-[650px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-[#0D1F3D] text-xs">
              Business Prospects ({filteredProspects.length})
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Territory Directory</span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search business..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-slate-50/80 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Prospects List */}
          <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {filteredProspects.map((pr) => {
              const isSelected = selectedProspect?.id === pr.id;
              const initials = pr.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2);

              const avatarBg =
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
                    if (isSelected) {
                      navigate(`/admin/businesses/${pr.id}`);
                    } else {
                      setSelectedProspect(pr);
                      toast.info(`Centered map on ${pr.name}`);
                    }
                  }}
                  onDoubleClick={() => navigate(`/admin/businesses/${pr.id}`)}
                  className={`group flex items-center justify-between rounded-sm border p-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#0D1F3D] bg-purple-50/60 shadow-xs ring-1 ring-[#0D1F3D]'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full font-extrabold text-xs shrink-0 ${avatarBg}`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-[#0D1F3D] text-xs truncate">{pr.name}</h4>
                      <p className="text-[11px] font-medium text-slate-500 truncate">{pr.category} • {pr.address}</p>
                      <span className={`inline-block rounded-xs px-1.5 py-0.2 text-[9px] font-bold mt-0.5 border ${
                        pr.status === 'New Prospect' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        pr.status === 'Visited' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        pr.status === 'Customer' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {pr.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium block">{pr.lastVisitTime}</span>
                      <span className="text-[10px] text-purple-700 font-bold hidden group-hover:block">
                        {isSelected ? 'Click to Open' : 'Focus Map'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/businesses/${pr.id}`);
                      }}
                      title="Open Business Details"
                      className="p-1 rounded-sm text-slate-400 hover:text-[#0D1F3D] hover:bg-slate-200/60 transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/businesses')}
            className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D]"
          >
            <span>View All Businesses</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
