import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Map,
  Users,
  Target,
  ShoppingBag,
  TrendingUp,
  PieChart,
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  UserPlus,
  Building,
  BarChart2,
  MapPin,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { mockTerritoriesList, TerritoryItem } from './territoriesData';

export default function TerritoriesListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [managerFilter, setManagerFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [performanceFilter, setPerformanceFilter] = useState('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const filteredTerritories = mockTerritoriesList.filter((terr) => {
    const matchesSearch =
      terr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      terr.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      terr.regionArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      terr.managerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || terr.status === statusFilter;
    const matchesManager = managerFilter === 'All' || terr.managerName === managerFilter;
    const matchesRegion = regionFilter === 'All' || terr.regionArea.includes(regionFilter);
    const matchesPerformance =
      performanceFilter === 'All'
        ? true
        : performanceFilter === 'High'
        ? terr.performancePercentage >= 75
        : performanceFilter === 'Good'
        ? terr.performancePercentage >= 60 && terr.performancePercentage < 75
        : terr.performancePercentage < 60;

    return matchesSearch && matchesStatus && matchesManager && matchesRegion && matchesPerformance;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedRows(filteredTerritories.map((t) => t.id));
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

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setManagerFilter('All');
    setRegionFilter('All');
    setPerformanceFilter('All');
    toast.info('Filters cleared');
  };

  return (
    <div className="space-y-4 font-sans pb-12 text-left bg-slate-50/50 min-h-screen p-1 sm:p-2">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Territories</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Manage sales territories, boundaries, executives and performance
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Import Territories CSV template...')}
            className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting Territories data...')}
            className="bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/territories/create')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Territory
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid (6 Metric Cards matching Territories Page.png) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <MapKpiCard
          title="Total Territories"
          value="12"
          subValue="Active territories"
          icon={MapPin}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <MapKpiCard
          title="Total Executives"
          value="128"
          subValue="Across all territories"
          icon={Users}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <MapKpiCard
          title="Target (This Month)"
          value="₹ 95,00,000"
          subValue="Total target"
          icon={Target}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <MapKpiCard
          title="Achieved (This Month)"
          value="₹ 63,45,200"
          subValue="66.8% of target"
          icon={ShoppingBag}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <MapKpiCard
          title="Growth"
          value="18%"
          subValue="vs last month"
          icon={TrendingUp}
          iconBgColor="bg-teal-50"
          iconTextColor="text-teal-600"
        />
        <MapKpiCard
          title="Avg. Performance"
          value="72%"
          subValue="Across territories"
          icon={PieChart}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="rounded-sm border border-slate-200/90 bg-white p-3 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-center">
          {/* Search Input */}
          <div className="relative lg:col-span-4">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search territories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Manager Filter */}
          <div className="lg:col-span-2">
            <select
              value={managerFilter}
              onChange={(e) => setManagerFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
            >
              <option value="All">Manager: All</option>
              <option value="Vikram Singh">Vikram Singh</option>
              <option value="Neha Sharma">Neha Sharma</option>
              <option value="Arjun Mehta">Arjun Mehta</option>
              <option value="Pooja Yadav">Pooja Yadav</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="lg:col-span-2">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
            >
              <option value="All">Region: All</option>
              <option value="Andheri East">Andheri East</option>
              <option value="Andheri West">Andheri West</option>
              <option value="Bandra">Bandra</option>
              <option value="Ghatkopar">Ghatkopar</option>
              <option value="Thane">Thane</option>
            </select>
          </div>

          {/* Clear & Filters Buttons */}
          <div className="lg:col-span-2 flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-600 rounded-sm"
            >
              Clear Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Advanced Filters drawer opened')}
              className="text-xs font-bold border-slate-200 hover:bg-slate-50 text-slate-700 rounded-sm flex items-center gap-1"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" /> Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="p-3 w-10 text-center">
                  <Checkbox
                    checked={
                      selectedRows.length === filteredTerritories.length &&
                      filteredTerritories.length > 0
                    }
                    onChange={(checked) => {
                      if (checked) {
                        setSelectedRows(filteredTerritories.map((t) => t.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </th>
                <th className="p-3">Territory Name</th>
                <th className="p-3">Code</th>
                <th className="p-3">Region / Area</th>
                <th className="p-3">Manager / Owner</th>
                <th className="p-3 text-center">Executives</th>
                <th className="p-3 text-right">Target (Monthly)</th>
                <th className="p-3 text-right">Achieved (This Month)</th>
                <th className="p-3 text-center">Performance</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTerritories.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-400 font-medium">
                    No territories match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTerritories.map((terr) => {
                  const isChecked = selectedRows.includes(terr.id);
                  const isMenuOpen = activeMenuId === terr.id;

                  return (
                    <tr
                      key={terr.id}
                      className={`hover:bg-slate-50/70 transition-colors ${
                        isChecked ? 'bg-slate-50/90' : ''
                      }`}
                    >
                      <td className="p-3 text-center">
                        <Checkbox
                          checked={isChecked}
                          onChange={() => handleToggleRow(terr.id)}
                        />
                      </td>

                      {/* Territory Name */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: terr.color }}
                          />
                          <button
                            onClick={() => navigate(`/admin/territories/${terr.id}`)}
                            className="font-extrabold text-[#0D1F3D] hover:text-blue-600 transition-colors text-left"
                          >
                            {terr.name}
                          </button>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="p-3">
                        <span className="rounded-xs bg-slate-100 px-2 py-0.5 font-mono font-bold text-slate-600 border border-slate-200">
                          {terr.code}
                        </span>
                      </td>

                      {/* Region / Area */}
                      <td className="p-3 text-slate-600">{terr.regionArea}</td>

                      {/* Manager / Owner */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={terr.managerAvatar}
                            alt={terr.managerName}
                            className="h-7 w-7 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-extrabold text-[#0D1F3D] block text-xs">
                              {terr.managerName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {terr.managerRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Executives count */}
                      <td className="p-3 text-center">
                        <span className="font-extrabold text-[#0D1F3D]">{terr.executivesCount}</span>
                      </td>

                      {/* Target */}
                      <td className="p-3 text-right font-mono font-bold text-slate-800">
                        {terr.monthlyTargetFormatted}
                      </td>

                      {/* Achieved */}
                      <td className="p-3 text-right font-mono font-extrabold text-emerald-700">
                        {terr.monthlyAchievedFormatted}
                      </td>

                      {/* Performance Progress Bar */}
                      <td className="p-3 text-center w-36">
                        <div className="space-y-1">
                          <span className="font-extrabold text-xs text-slate-700">
                            {terr.performancePercentage}%
                          </span>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                terr.performancePercentage >= 75
                                  ? 'bg-emerald-500'
                                  : terr.performancePercentage >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${terr.performancePercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            terr.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              terr.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}
                          />
                          {terr.status}
                        </span>
                      </td>

                      {/* Actions Dropdown */}
                      <td className="p-3 text-center relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : terr.id)}
                          className="p-1 rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-2 top-full mt-1 z-30 w-48 rounded-sm border border-slate-200 bg-white py-1 shadow-xl text-left text-xs font-semibold animate-fadeIn">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/admin/territories/${terr.id}`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5 text-slate-400" /> View Details
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/admin/territories/${terr.id}/edit`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                            >
                              <Edit className="h-3.5 w-3.5 text-slate-400" /> Edit Territory
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/admin/territories/${terr.id}/executives`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                            >
                              <UserPlus className="h-3.5 w-3.5 text-slate-400" /> Assign Executives
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/admin/territories/${terr.id}/businesses`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                            >
                              <Building className="h-3.5 w-3.5 text-slate-400" /> Territory Businesses
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/admin/territories/${terr.id}/performance`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50"
                            >
                              <BarChart2 className="h-3.5 w-3.5 text-slate-400" /> Territory Performance
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate(`/admin/territories/${terr.id}/map`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 border-t border-slate-100 pt-1.5"
                            >
                              <Map className="h-3.5 w-3.5 text-blue-600" /> Territory Map
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-600">
          <span>Showing 1 to {filteredTerritories.length} of {mockTerritoriesList.length} territories</span>

          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50">
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-bold">
              1
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-100">
              2
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500 hover:bg-slate-100">
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
