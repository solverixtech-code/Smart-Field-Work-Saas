import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Building,
  Map,
  PieChart,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import {
  mockTerritoriesList,
  mockTerritoryBusinesses,
  TerritoryBusiness,
} from './territoriesData';

export default function TerritoryBusinessesPage() {
  const { territoryId } = useParams();
  const navigate = useNavigate();

  const territory =
    mockTerritoriesList.find((t) => t.id === territoryId || t.code === territoryId) ||
    mockTerritoriesList[0];

  const [searchTerm, setSearchTerm] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [assignedToFilter, setAssignedToFilter] = useState('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeBusinessId, setActiveBusinessId] = useState<string>(
    mockTerritoryBusinesses[0]?.id || ''
  );

  const activeBusiness =
    mockTerritoryBusinesses.find((b) => b.id === activeBusinessId) ||
    mockTerritoryBusinesses[0];

  const filteredBusinesses = mockTerritoryBusinesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.businessType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesAssigned = assignedToFilter === 'All' || b.assignedToName === assignedToFilter;

    return matchesSearch && matchesStatus && matchesAssigned;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredBusinesses.map((b) => b.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleToggleRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

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
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Territory Businesses</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              View and manage all businesses in {territory.name} territory
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Exporting business list...')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Import Businesses template...')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/admin/businesses/add')}
              className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add Business
            </Button>
          </div>
        </div>

        {/* Territory Manager & Summary Pill */}
        <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <Map className="h-4 w-4 text-blue-600" />
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
            <span className="font-extrabold text-[#0D1F3D]">{territory.managerName}</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Total Businesses</span>
            <span className="font-extrabold text-[#0D1F3D]">{territory.activeBusinessesCount}</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Active Businesses</span>
            <span className="font-extrabold text-emerald-600">142</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Coverage Area</span>
            <span className="font-extrabold text-slate-700">{territory.areaKm2} km²</span>
          </div>
        </div>
      </div>

      {/* 5 Stat Cards Grid (Matching Territory Businesses Page.png) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs text-left">
          <span className="text-[10px] text-slate-400 font-bold block">Total Businesses</span>
          <span className="text-xl font-extrabold text-[#0D1F3D]">168</span>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs text-left">
          <span className="text-[10px] text-slate-400 font-bold block">Active Businesses</span>
          <span className="text-xl font-extrabold text-emerald-600">142</span>
          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">84% of total</span>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs text-left">
          <span className="text-[10px] text-slate-400 font-bold block">New This Month</span>
          <span className="text-xl font-extrabold text-amber-600">18</span>
          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">10.7% growth</span>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs text-left">
          <span className="text-[10px] text-slate-400 font-bold block">Visited This Month</span>
          <span className="text-xl font-extrabold text-purple-600">116</span>
          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">69% coverage</span>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs text-left">
          <span className="text-[10px] text-slate-400 font-bold block">Not Visited</span>
          <span className="text-xl font-extrabold text-red-600">52</span>
          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">31% remaining</span>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="rounded-sm border border-slate-200/90 bg-white p-3 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-center">
          <div className="relative lg:col-span-4">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search businesses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              value={businessTypeFilter}
              onChange={(e) => setBusinessTypeFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D]"
            >
              <option value="All">Type: All</option>
              <option value="Electronics Store">Electronics</option>
              <option value="Medical">Medical</option>
              <option value="Supermarket">Supermarket</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D]"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D]"
            >
              <option value="All">Assigned: All</option>
              <option value="Arjun Mehta">Arjun Mehta</option>
              <option value="Neha Sharma">Neha Sharma</option>
              <option value="Pooja Yadav">Pooja Yadav</option>
            </select>
          </div>

          <div className="lg:col-span-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Filters drawer opened')}
              className="text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" /> More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid (8-col Left Table + 4-col Right Sidebars) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT COLUMN (8 COLS TABLE) */}
        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                    <th className="p-3 w-10 text-center">
                      <Checkbox
                        checked={
                          selectedRows.length === filteredBusinesses.length &&
                          filteredBusinesses.length > 0
                        }
                        onChange={(checked) => {
                          if (checked) {
                            setSelectedRows(filteredBusinesses.map((b) => b.id));
                          } else {
                            setSelectedRows([]);
                          }
                        }}
                      />
                    </th>
                    <th className="p-3">Business Name</th>
                    <th className="p-3">Business Type</th>
                    <th className="p-3">Contact Person</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Assigned To</th>
                    <th className="p-3 text-center">Last Visit</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBusinesses.map((b) => {
                    const isChecked = selectedRows.includes(b.id);
                    const isActive = activeBusinessId === b.id;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => setActiveBusinessId(b.id)}
                        className={`cursor-pointer transition-all ${
                          isActive
                            ? 'bg-red-50/60 font-bold border-l-4 border-l-[#E20613]'
                            : 'hover:bg-slate-50/70'
                        }`}
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isChecked}
                            onChange={() => handleToggleRow(b.id)}
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-[#0D1F3D]">{b.name}</span>
                            {b.badge && (
                              <span className="rounded-xs bg-lime-100 px-1.5 py-0.5 text-[9px] font-bold text-lime-800">
                                {b.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="rounded-xs bg-sky-50 text-sky-700 px-2 py-0.5 text-[10px] font-bold border border-sky-200">
                            {b.businessType}
                          </span>
                        </td>
                        <td className="p-3">
                          <div>
                            <span className="font-extrabold text-[#0D1F3D] block">{b.contactPerson}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{b.contactRole}</span>
                          </div>
                        </td>
                        <td className="p-3 font-mono text-slate-600">{b.phone}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={b.assignedToAvatar}
                              alt={b.assignedToName}
                              className="h-6 w-6 rounded-full object-cover border border-slate-200"
                            />
                            <span>{b.assignedToName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-slate-500 font-medium">{b.lastVisitDate}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                              b.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            • {b.status}
                          </span>
                        </td>
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <button className="p-1 rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-600">
              <span>Showing 1 to {filteredBusinesses.length} of 168 businesses</span>
              <div className="flex items-center gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-bold">
                  1
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-700">
                  2
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS SIDEBAR) */}
        <div className="space-y-4 lg:col-span-4">
          {/* Territory & Active Business Map Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Selected Business Location</h3>
              <span className="text-[10px] text-blue-600 font-bold">{activeBusiness.name}</span>
            </div>

            <div className="relative rounded-sm border border-slate-200 overflow-hidden h-[200px] shadow-inner">
              <InteractiveMap
                key={activeBusiness.id}
                mode="prospects"
                heightClassName="h-full"
                compact
                prospects={[
                  {
                    id: activeBusiness.id,
                    name: activeBusiness.name,
                    category: activeBusiness.category,
                    address: activeBusiness.address || activeBusiness.contactPerson,
                    status: activeBusiness.visitStatus === 'Visited' ? 'Visited' : activeBusiness.visitStatus === 'Scheduled' ? 'Follow-up' : 'New Prospect',
                    markerColor: 'green',
                    contactPerson: activeBusiness.contactPerson,
                    phone: activeBusiness.phone,
                    lastVisitTime: activeBusiness.lastVisitDate,
                    lat: activeBusiness.lat || 19.118,
                    lng: activeBusiness.lng || 72.868,
                    region: 'Andheri East',
                  },
                ]}
              />
            </div>
            <button
              onClick={() => navigate(`/admin/territories/${territory.id}/map`)}
              className="text-xs font-bold text-blue-600 hover:underline block text-center w-full pt-1 cursor-pointer"
            >
              View Full Territory Map →
            </button>
          </div>

          {/* Business Categories Donut Chart Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Business Categories
            </h3>

            <div className="relative py-2 flex flex-col items-center justify-center">
              <div className="h-24 w-24 rounded-full border-8 border-blue-600 border-t-purple-600 border-r-emerald-500 border-b-amber-500 flex flex-col items-center justify-center shadow-inner">
                <span className="text-lg font-extrabold text-[#0D1F3D]">168</span>
                <span className="text-[9px] font-bold text-slate-400">Total</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-blue-600" /> Retail
                </span>
                <span className="font-extrabold">38% (64)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-purple-600" /> Service
                </span>
                <span className="font-extrabold">26% (44)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Healthcare
                </span>
                <span className="font-extrabold">14% (24)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Food & Beverage
                </span>
                <span className="font-extrabold">12% (20)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-slate-400" /> Others
                </span>
                <span className="font-extrabold">10% (16)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
