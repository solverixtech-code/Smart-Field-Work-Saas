import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Users,
  Target,
  ShoppingBag,
  Building,
  TrendingUp,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Download,
  Map as MapIcon,
  CheckCircle2,
  PieChart,
  Search,
  Filter,
  Zap,
  Phone,
  Mail,
  Award,
  FileText,
  FileSpreadsheet,
  Check,
  X,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { DateRangePicker, DateRange } from '../../components/ui/DateRangePicker';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import {
  mockTerritoriesList,
  mockTerritoryExecutives,
  mockTerritoryBusinesses,
  TerritoryItem,
} from './territoriesData';

export default function TerritoryDetailsPage({ initialTab = 'Overview' }: { initialTab?: string }) {
  const { territoryId } = useParams();
  const navigate = useNavigate();

  // Active Tab State (No page jump - seamlessly renders under tab header)
  const [activeTab, setActiveTab] = useState(initialTab);

  // Performance Filters State
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    label: '01 May 2025 - 20 May 2025',
    startDate: '2025-05-01',
    endDate: '2025-05-20',
  });
  const [compareFilter, setCompareFilter] = useState('none');

  // Business Tab Search & Filter State
  const [businessSearchQuery, setBusinessSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [selectedBusinessStatus, setSelectedBusinessStatus] = useState('All');
  const [selectedBusinessId, setSelectedBusinessId] = useState(mockTerritoryBusinesses[0]?.id);

  // Executives Tab State
  const [execSearchQuery, setExecSearchQuery] = useState('');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedExecIds, setSelectedExecIds] = useState<string[]>(['exec-1', 'exec-2', 'exec-3']);

  const territory =
    mockTerritoriesList.find((t) => t.id === territoryId || t.code === territoryId) ||
    mockTerritoriesList[0];

  const filteredBusinesses = mockTerritoryBusinesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(businessSearchQuery.toLowerCase()) ||
      b.businessType.toLowerCase().includes(businessSearchQuery.toLowerCase());
    const matchesCategory =
      selectedCategoryFilter === 'All' || b.category === selectedCategoryFilter;
    const matchesStatus =
      selectedBusinessStatus === 'All' || b.status === selectedBusinessStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedBusiness =
    mockTerritoryBusinesses.find((b) => b.id === selectedBusinessId) || mockTerritoryBusinesses[0];

  const filteredExecutives = mockTerritoryExecutives.filter(
    (e) =>
      e.name.toLowerCase().includes(execSearchQuery.toLowerCase()) ||
      e.team.toLowerCase().includes(execSearchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Back Link & Top Header Bar */}
      <div className="space-y-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => navigate('/admin/territories')}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Territories
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">{territory.name}</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {territory.status}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 border border-slate-200 bg-white px-2 py-0.5 rounded-xs">
              Code: {territory.code}
            </span>
            <span className="text-xs font-semibold text-slate-500">{territory.regionArea}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/territories/${territory.id}/edit`)}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Edit className="h-3.5 w-3.5" /> Edit Territory
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Exporting Territory Report...')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export Data
            </Button>
          </div>
        </div>

        {/* Territory Manager & Stats Summary Pill Strip */}
        <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <img
              src={territory.managerAvatar}
              alt={territory.managerName}
              className="h-7 w-7 rounded-full object-cover border border-slate-200"
            />
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Manager</span>
              <span className="font-extrabold text-[#0D1F3D]">{territory.managerName}</span>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Team Size</span>
            <span className="font-extrabold text-[#0D1F3D]">14 Executives</span>
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
        </div>
      </div>

      {/* Horizontal Tab Navigation Bar (Renders content seamlessly inside details page without page jump) */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none pb-0.5">
        {[
          { id: 'Overview', label: 'Overview' },
          { id: 'Executives', label: 'Executives' },
          { id: 'Targets', label: 'Targets' },
          { id: 'Performance', label: 'Performance Analytics' },
          { id: 'Visits', label: 'Visits Log' },
          { id: 'Businesses', label: 'Leads & Businesses' },
          { id: 'Map', label: 'Map & Boundaries' },
          { id: 'Activities', label: 'Activities Stream' },
          { id: 'Documents', label: 'Documents' },
          { id: 'History', label: 'Audit History' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-red-600 text-red-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* DYNAMIC SUB-VIEW TAB CONTENT */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-4">
          {/* Top 6 KPI Metric Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <MapKpiCard
              title="Revenue Target (Monthly)"
              value={territory.monthlyTargetFormatted}
              subValue="Set Target"
              icon={Target}
              iconBgColor="bg-emerald-50"
              iconTextColor="text-emerald-600"
            />
            <MapKpiCard
              title="Revenue Achieved"
              value={territory.monthlyAchievedFormatted}
              subValue="66.8% of target"
              icon={ShoppingBag}
              iconBgColor="bg-purple-50"
              iconTextColor="text-purple-600"
            />
            <MapKpiCard
              title="Business Target"
              value="200"
              subValue="Set Target"
              icon={Building}
              iconBgColor="bg-amber-50"
              iconTextColor="text-amber-600"
            />
            <MapKpiCard
              title="Active Businesses"
              value={territory.activeBusinessesCount.toString()}
              subValue="84% of target"
              icon={Building}
              iconBgColor="bg-blue-50"
              iconTextColor="text-blue-600"
            />
            <MapKpiCard
              title="Visits (This Month)"
              value={territory.totalVisitsThisMonth.toString()}
              subValue="Completed"
              icon={TrendingUp}
              iconBgColor="bg-teal-50"
              iconTextColor="text-teal-600"
            />
            <MapKpiCard
              title="Avg. Performance"
              value={`${territory.performancePercentage}%`}
              subValue="Across all metrics"
              icon={PieChart}
              iconBgColor="bg-rose-50"
              iconTextColor="text-rose-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
                  <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                    Territory Information
                  </h3>
                  <div className="space-y-2 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Territory Name :</span>
                      <span className="font-extrabold text-[#0D1F3D]">{territory.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Territory Code :</span>
                      <span className="font-mono font-bold">{territory.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Region / Area :</span>
                      <span>{territory.regionArea}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">City :</span>
                      <span>{territory.city}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status :</span>
                      <span className="font-bold text-emerald-600">{territory.status}</span>
                    </div>
                    <div className="pt-1">
                      <span className="text-slate-400 block mb-1">Description :</span>
                      <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                        {territory.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold flex flex-col justify-between">
                  <h3 className="text-xs font-extrabold text-[#0D1F3D]">Territory Boundary</h3>
                  <div className="relative rounded-sm border border-slate-200 overflow-hidden flex-1 min-h-[220px]">
                    <InteractiveMap
                      mode="territories"
                      heightClassName="h-full"
                      territoryPath={territory.pathPoints}
                      compact
                    />
                    <div className="absolute bottom-2 right-2 z-20 rounded-sm bg-white/95 border border-slate-200 px-2.5 py-1 text-[10px] font-extrabold text-[#0D1F3D] shadow-sm">
                      Area: {territory.areaKm2} km² | Perimeter: {territory.perimeterKm} km
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Executives */}
              <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-extrabold text-[#0D1F3D]">Top Executives (This Month)</h3>
                  <span className="text-[10px] text-slate-400 font-bold">Top Performers</span>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                      <th className="py-2">Executive</th>
                      <th className="py-2 text-center">Visits</th>
                      <th className="py-2 text-right">Revenue (₹)</th>
                      <th className="py-2 text-center">Performance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mockTerritoryExecutives.map((exec) => (
                      <tr key={exec.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <img
                              src={exec.avatar}
                              alt={exec.name}
                              className="h-6 w-6 rounded-full object-cover border border-slate-200"
                            />
                            <span className="font-extrabold text-[#0D1F3D]">{exec.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-center font-bold">{exec.visitsCount}</td>
                        <td className="py-2.5 text-right font-mono font-bold">{exec.revenueFormatted}</td>
                        <td className="py-2.5 text-center w-28">
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-500"
                              style={{ width: `${Math.min(exec.performancePercentage, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-4 lg:col-span-4">
              <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold text-center">
                <h3 className="text-xs font-extrabold text-[#0D1F3D] text-left border-b border-slate-100 pb-2">
                  Performance Summary
                </h3>

                <div className="relative py-2 flex flex-col items-center justify-center">
                  <div className="h-28 w-28 rounded-full border-8 border-emerald-500 border-b-slate-100 border-l-emerald-500 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-2xl font-extrabold text-[#0D1F3D]">67%</span>
                    <span className="text-[9px] font-bold text-slate-400">Overall</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('Performance')}
                  className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D] mt-2"
                >
                  <span>View Full Analytics Tab</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXECUTIVES VIEW */}
      {activeTab === 'Executives' && (
        <div className="space-y-4 text-xs font-semibold">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search executive name or team..."
                value={execSearchQuery}
                onChange={(e) => setExecSearchQuery(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
              />
            </div>
            <Button
              variant="accent"
              size="sm"
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Assign Executives
            </Button>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                  <th className="p-3">Executive</th>
                  <th className="p-3">Team</th>
                  <th className="p-3 text-center">Visits</th>
                  <th className="p-3 text-right">Revenue (₹)</th>
                  <th className="p-3 text-center">Performance</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExecutives.map((exec) => (
                  <tr key={exec.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img src={exec.avatar} alt={exec.name} className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                        <div>
                          <span className="font-extrabold text-[#0D1F3D] block">{exec.name}</span>
                          <span className="text-[10px] text-slate-400">{exec.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">{exec.team}</td>
                    <td className="p-3 text-center font-bold">{exec.visitsCount}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">{exec.revenueFormatted}</td>
                    <td className="p-3 text-center font-extrabold text-blue-600">{exec.performancePercentage}%</td>
                    <td className="p-3 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.success(`Removed ${exec.name} from territory`)}
                        className="text-[10px] py-0.5 px-2 text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Unassign
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TARGETS VIEW */}
      {activeTab === 'Targets' && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-4 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Territory & Executive Target Matrix (May 2025)
          </h3>

          <div className="space-y-3">
            {mockTerritoryExecutives.map((exec) => (
              <div key={exec.id} className="space-y-1 border-b border-slate-100 pb-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-[#0D1F3D]">{exec.name}</span>
                  <span className="font-mono text-slate-600">
                    {exec.revenueFormatted} / ₹ 2,50,000 ({exec.performancePercentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${exec.performancePercentage >= 90 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min(exec.performancePercentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PERFORMANCE ANALYTICS VIEW */}
      {activeTab === 'Performance' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200">
            <DateRangePicker
              value={selectedDateRange}
              onChange={(range) => setSelectedDateRange(range)}
            />
            <div className="w-48">
              <Select
                value={compareFilter}
                onChange={(e) => setCompareFilter(e.target.value)}
                options={[
                  { value: 'none', label: 'Compare: None' },
                  { value: 'previous-month', label: 'vs Previous Month' },
                  { value: 'previous-year', label: 'vs Previous Year' },
                ]}
                searchable={false}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <MapKpiCard title="Total Visits" value="176" subValue="↑ 18.4%" icon={TrendingUp} iconBgColor="bg-emerald-50" iconTextColor="text-emerald-600" />
            <MapKpiCard title="Completed Visits" value="142" subValue="↑ 21.7%" icon={CheckCircle2} iconBgColor="bg-blue-50" iconTextColor="text-blue-600" />
            <MapKpiCard title="New Leads" value="98" subValue="↑ 16.3%" icon={Users} iconBgColor="bg-purple-50" iconTextColor="text-purple-600" />
            <MapKpiCard title="Demos Conducted" value="36" subValue="↑ 12.5%" icon={Target} iconBgColor="bg-amber-50" iconTextColor="text-amber-600" />
            <MapKpiCard title="Sales Closed" value="28" subValue="↑ 21.7%" icon={ShoppingBag} iconBgColor="bg-teal-50" iconTextColor="text-teal-600" />
            <MapKpiCard title="Revenue" value="₹ 14,00,000" subValue="↑ 24.6%" icon={Award} iconBgColor="bg-rose-50" iconTextColor="text-rose-600" />
          </div>
        </div>
      )}

      {/* TAB 5: VISITS LOG VIEW */}
      {activeTab === 'Visits' && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Territory Field Visits Log
          </h3>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                <th className="p-2.5">Date & Time</th>
                <th className="p-2.5">Executive</th>
                <th className="p-2.5">Business Name</th>
                <th className="p-2.5">Purpose</th>
                <th className="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { time: '20 May, 10:30 AM', exec: 'Arjun Mehta', business: 'Sai Enterprises', purpose: 'Product Demo', status: 'Completed' },
                { time: '20 May, 11:45 AM', exec: 'Neha Sharma', business: 'Sharma Medical', purpose: 'Payment Collection', status: 'Completed' },
                { time: '20 May, 02:15 PM', exec: 'Pooja Yadav', business: 'Marol Electronics', purpose: 'Lead Follow-up', status: 'Completed' },
              ].map((v, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono text-slate-500">{v.time}</td>
                  <td className="p-2.5 font-extrabold text-[#0D1F3D]">{v.exec}</td>
                  <td className="p-2.5">{v.business}</td>
                  <td className="p-2.5 text-slate-600">{v.purpose}</td>
                  <td className="p-2.5 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">• {v.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: BUSINESSES VIEW */}
      {activeTab === 'Businesses' && (
        <div className="space-y-4 text-xs font-semibold">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search business name or address..."
                value={businessSearchQuery}
                onChange={(e) => setBusinessSearchQuery(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
              />
            </div>

            <Button
              variant="accent"
              size="sm"
              onClick={() => toast.info('Adding new business to territory...')}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add Business
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                    <th className="p-3">Business</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Assigned Exec</th>
                    <th className="p-3 text-right">Revenue (₹)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBusinesses.map((b) => (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBusinessId(b.id)}
                      className={`cursor-pointer transition-colors ${selectedBusinessId === b.id ? 'bg-red-50/50 font-bold' : 'hover:bg-slate-50'}`}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-sm bg-slate-100 flex items-center justify-center font-bold text-slate-700 border border-slate-200">
                            {b.name.charAt(0)}
                          </div>
                          <span className="font-extrabold text-[#0D1F3D]">{b.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600">{b.category}</td>
                      <td className="p-3">{b.assignedToName}</td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-700">₹ 1,80,000</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">• {b.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-4 space-y-3">
              <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                Business Details Preview
              </h3>
              <p className="font-extrabold text-sm text-[#0D1F3D]">{selectedBusiness.name}</p>
              <p className="text-slate-500">{selectedBusiness.contactPerson} ({selectedBusiness.contactRole})</p>
              <div className="relative h-44 w-full rounded-sm border border-slate-200 overflow-hidden">
                <InteractiveMap mode="prospects" heightClassName="h-full" compact prospects={[{ id: selectedBusiness.id, name: selectedBusiness.name, category: selectedBusiness.category, address: selectedBusiness.contactPerson, status: 'Visited', markerColor: 'green', contactPerson: selectedBusiness.contactPerson, phone: selectedBusiness.phone, lastVisitTime: 'Today', lat: 19.115, lng: 72.86, region: 'Marol' }]} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: MAP & BOUNDARIES VIEW */}
      {activeTab === 'Map' && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Territory Boundary Polygon Editor</h3>
            <span className="text-[10px] text-slate-400 font-bold">Mapbox GL JS Engine</span>
          </div>

          <div className="relative h-[550px] w-full rounded-sm border border-slate-200 overflow-hidden shadow-inner">
            <InteractiveMap
              mode="territories"
              heightClassName="h-full"
              territoryPath={territory.pathPoints}
              prospects={mockTerritoryBusinesses.map((b) => ({
                id: b.id,
                name: b.name,
                category: b.category,
                address: b.contactPerson,
                status: 'Visited',
                markerColor: 'green',
                contactPerson: b.contactPerson,
                phone: b.phone,
                lastVisitTime: 'Today',
                lat: 19.115,
                lng: 72.86,
                region: 'Marol',
              }))}
            />
          </div>
        </div>
      )}

      {/* TAB 8: ACTIVITIES STREAM VIEW */}
      {activeTab === 'Activities' && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Territory Activity Feed Stream
          </h3>

          <div className="space-y-3">
            {[
              { time: '10 mins ago', title: 'Deal Closed', desc: 'Arjun Mehta closed ₹ 45,000 order with Sai Enterprises', icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50' },
              { time: '35 mins ago', title: 'Visit Completed', desc: 'Neha Sharma completed visit at Sharma Medical', icon: CheckCircle2, color: 'text-blue-600 bg-blue-50' },
              { time: '1 hour ago', title: 'New Business Added', desc: 'Pooja Yadav added Marol Electronics', icon: Building, color: 'text-purple-600 bg-purple-50' },
            ].map((act, idx) => {
              const Icon = act.icon;
              return (
                <div key={idx} className="flex items-start gap-3 p-2.5 rounded-sm hover:bg-slate-50">
                  <div className={`p-2 rounded-full shrink-0 ${act.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-extrabold text-[#0D1F3D]">{act.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{act.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-normal mt-0.5">{act.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 9: DOCUMENTS VIEW */}
      {activeTab === 'Documents' && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Territory Documents Repository
          </h3>

          <div className="space-y-2">
            {[
              { name: 'Marol_Territory_Boundary_Polygon.geojson', size: '124 KB', date: '01 May 2025' },
              { name: 'May_2025_Executive_Target_Approvals.pdf', size: '1.4 MB', date: '02 May 2025' },
              { name: 'Field_Executive_Assignment_Roster.xlsx', size: '450 KB', date: '10 May 2025' },
            ].map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-extrabold text-[#0D1F3D]">{doc.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{doc.size} • Uploaded {doc.date}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success(`Downloading ${doc.name}`)}>
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: HISTORY VIEW */}
      {activeTab === 'History' && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Territory Audit & Modification Log
          </h3>

          <div className="space-y-3">
            {[
              { title: 'Boundary Polygon Modified', user: 'Vikram Singh (Admin)', time: '15 May 2025, 03:20 PM' },
              { title: 'Executive Assigned: Rahul Verma', user: 'Vikram Singh (Admin)', time: '10 May 2025, 11:15 AM' },
              { title: 'Monthly Target Updated to ₹ 14,00,000', user: 'Neha Gupta (Manager)', time: '01 May 2025, 09:00 AM' },
            ].map((h, i) => (
              <div key={i} className="border-l-2 border-slate-200 pl-3 space-y-0.5">
                <p className="font-extrabold text-[#0D1F3D]">{h.title}</p>
                <p className="text-[10px] text-slate-500">{h.user} • {h.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Assigning Executives */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Assign Executives to {territory.name}</h3>
            <button onClick={() => setIsAssignModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {mockTerritoryExecutives.map((exec) => {
              const isChecked = selectedExecIds.includes(exec.id);
              return (
                <div key={exec.id} className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <img src={exec.avatar} alt={exec.name} className="h-6 w-6 rounded-full object-cover" />
                    <span className="font-bold text-xs text-[#0D1F3D]">{exec.name}</span>
                  </div>
                  <Checkbox
                    checked={isChecked}
                    onChange={(val) => {
                      if (val) {
                        setSelectedExecIds([...selectedExecIds, exec.id]);
                      } else {
                        setSelectedExecIds(selectedExecIds.filter((id) => id !== exec.id));
                      }
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setIsAssignModalOpen(false);
                toast.success('Executive assignments updated successfully!');
              }}
              className="bg-[#0D1F3D] text-white"
            >
              Save Assignments
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
