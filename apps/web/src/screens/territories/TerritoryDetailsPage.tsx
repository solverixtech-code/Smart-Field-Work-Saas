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
  mapTerritoryDtoToItem,
} from './territoriesData';
import { mockBusinesses } from '../businesses/businessesData';
import { crmApi } from '../../features/crm/crm.api';

export default function TerritoryDetailsPage({ initialTab = 'Overview' }: { initialTab?: string }) {
  const { territoryId } = useParams();
  const navigate = useNavigate();

  const [liveTerritory, setLiveTerritory] = useState<TerritoryItem | null>(null);

  React.useEffect(() => {
    if (territoryId) {
      crmApi
        .territory(territoryId)
        .then((data) => {
          if (data) {
            setLiveTerritory(mapTerritoryDtoToItem(data));
          }
        })
        .catch(() => {
          // graceful fallback
        });
    }
  }, [territoryId]);

  // Active Tab State (No page jump - seamlessly renders under tab header)
  const [activeTab, setActiveTab] = useState(initialTab);

  // Link Existing Business Modal State
  const [isLinkBusinessModalOpen, setIsLinkBusinessModalOpen] = useState(false);
  const [linkSearchQuery, setLinkSearchQuery] = useState('');
  const [selectedLinkBizId, setSelectedLinkBizId] = useState(mockBusinesses[0]?.id || '');
  const [linkAssignedExec, setLinkAssignedExec] = useState('Arjun Mehta');

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

  // Map Layers Toggle State
  const [showBoundary, setShowBoundary] = useState(true);
  const [showBusinesses, setShowBusinesses] = useState(true);
  const [showActiveBusinesses, setShowActiveBusinesses] = useState(true);
  const [showLeads, setShowLeads] = useState(true);
  const [showVisitedLocations, setShowVisitedLocations] = useState(true);
  const [showExecutives, setShowExecutives] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Targets Tab State
  const [targetPeriodFilter, setTargetPeriodFilter] = useState('May 2025');
  const [targetMetricType, setTargetMetricType] = useState('all');
  const [isSetTargetModalOpen, setIsSetTargetModalOpen] = useState(false);
  const [editingTargetExec, setEditingTargetExec] = useState<any>(null);
  const [targetRevenueInput, setTargetRevenueInput] = useState('250000');
  const [targetVisitInput, setTargetVisitInput] = useState('35');

  // Businesses List State
  const [businessesList, setBusinessesList] = useState(mockTerritoryBusinesses);
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [newBusinessData, setNewBusinessData] = useState({
    name: '',
    category: 'Retail',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    assignedExecutive: 'Arjun Mehta',
    status: 'Active',
  });

  const territory =
    liveTerritory ||
    mockTerritoriesList.find((t) => t.id === territoryId || t.code === territoryId) ||
    mockTerritoriesList[0];

  const filteredBusinesses = businessesList.filter((b) => {
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
    businessesList.find((b) => b.id === selectedBusinessId) || businessesList[0];

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
              <span className="text-xs font-semibold text-slate-500 block">Manager</span>
              <span className="font-extrabold text-[#0D1F3D]">{territory.managerName}</span>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-xs font-semibold text-slate-500 block">Team Size</span>
            <span className="font-extrabold text-[#0D1F3D]">14 Executives</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-xs font-semibold text-slate-500 block">Coverage Area</span>
            <span className="font-extrabold text-[#0D1F3D]">{territory.areaKm2} km²</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-xs font-semibold text-slate-500 block">Total Businesses</span>
            <span className="font-extrabold text-[#0D1F3D]">168</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-xs font-semibold text-slate-500 block">Active Businesses</span>
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
              className={`px-4 py-2.5 border-b-2 font-extrabold transition-all whitespace-nowrap cursor-pointer text-xs ${
                isActive
                  ? 'border-purple-600 text-purple-700 bg-transparent'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
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
                  <span className="text-xs font-semibold text-slate-500">Top Performers</span>
                </div>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold text-slate-700">
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
                    <span className="text-xs font-semibold text-slate-500">Overall</span>
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
        <div className="space-y-4">
          {/* Header Controls & Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-40">
                <Select
                  value={targetPeriodFilter}
                  onChange={(e) => setTargetPeriodFilter(e.target.value)}
                  options={[
                    { value: 'May 2025', label: 'May 2025 (Current)' },
                    { value: 'April 2025', label: 'April 2025' },
                    { value: 'March 2025', label: 'March 2025' },
                    { value: 'Q2 2025', label: 'Q2 2025 Overall' },
                  ]}
                  searchable={false}
                />
              </div>

              <div className="w-44">
                <Select
                  value={targetMetricType}
                  onChange={(e) => setTargetMetricType(e.target.value)}
                  options={[
                    { value: 'all', label: 'All Metric Targets' },
                    { value: 'revenue', label: 'Revenue Target' },
                    { value: 'visits', label: 'Visit Target' },
                    { value: 'businesses', label: 'Business Goal' },
                  ]}
                  searchable={false}
                />
              </div>
            </div>

            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setEditingTargetExec(null);
                setIsSetTargetModalOpen(true);
              }}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] text-white hover:bg-[#07152E]"
            >
              <Plus className="h-3.5 w-3.5" /> Set Executive Targets
            </Button>
          </div>

          {/* Top 4 Target KPI Summary Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MapKpiCard
              title="Revenue Target (Monthly)"
              value="₹ 15,00,000"
              subValue="₹ 14,00,000 Achieved (93.3%)"
              icon={Target}
              iconBgColor="bg-emerald-50"
              iconTextColor="text-emerald-600"
            />
            <MapKpiCard
              title="Visit Volume Target"
              value="200 Visits"
              subValue="176 Completed (88.0%)"
              icon={TrendingUp}
              iconBgColor="bg-blue-50"
              iconTextColor="text-blue-600"
            />
            <MapKpiCard
              title="New Business Goal"
              value="200 Businesses"
              subValue="168 Acquired (84.0%)"
              icon={Building}
              iconBgColor="bg-purple-50"
              iconTextColor="text-purple-600"
            />
            <MapKpiCard
              title="Top Performer Goal"
              value="Arjun Mehta"
              subValue="₹ 2,48,000 / ₹ 2,50,000 (106% Exceeded)"
              icon={Award}
              iconBgColor="bg-amber-50"
              iconTextColor="text-amber-600"
            />
          </div>

          {/* Territory Target Completion Overview Banner */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">Territory Target Progress ({targetPeriodFilter})</h3>
                <p className="text-[11px] font-medium text-slate-500">Overall progress toward monthly revenue & field operational goals</p>
              </div>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-extrabold text-emerald-700">
                93.3% Base Target Completed
              </span>
            </div>

            <div className="space-y-1.5 pt-1 text-xs">
              <div className="flex justify-between font-extrabold text-[#0D1F3D]">
                <span>Progress: ₹ 14,00,000</span>
                <span>Target: ₹ 15,00,000</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex p-0.5 border border-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                  style={{ width: '93.3%' }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>0%</span>
                <span>50% Milestone</span>
                <span>80% Base Goal</span>
                <span className="text-emerald-600 font-extrabold">100% Target Met</span>
              </div>
            </div>
          </div>

          {/* Detailed Executive Target Matrix Table */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">
                Executive Target & Achievement Matrix ({targetPeriodFilter})
              </h3>
              <span className="text-[11px] font-bold text-slate-500">5 Active Executives Assigned</span>
            </div>

            <div className="space-y-4">
              {mockTerritoryExecutives.map((exec) => {
                const targetRev = 250000;
                const achievedRev = parseInt(exec.revenueFormatted.replace(/[^0-9]/g, '')) || 200000;
                const revPct = Math.round((achievedRev / targetRev) * 100);
                const visitTarget = 35;
                const visitsDone = exec.visitsCount;
                const visitPct = Math.round((visitsDone / visitTarget) * 100);
                const isExceeded = revPct >= 100;
                const isOnTrack = revPct >= 85 && revPct < 100;

                return (
                  <div
                    key={exec.id}
                    className="rounded-sm border border-slate-200 bg-slate-50/50 p-3.5 space-y-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={exec.avatar}
                          alt={exec.name}
                          className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-[#0D1F3D] text-sm">{exec.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({exec.id})</span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-normal">{exec.team}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isExceeded
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : isOnTrack
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {isExceeded ? '• Target Exceeded' : isOnTrack ? '• On Track' : '• Needs Attention'}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingTargetExec(exec);
                            setTargetRevenueInput(targetRev.toString());
                            setTargetVisitInput(visitTarget.toString());
                            setIsSetTargetModalOpen(true);
                          }}
                          className="text-[11px] py-1 px-2.5 bg-white border-slate-200 font-bold hover:bg-slate-100"
                        >
                          <Edit className="mr-1 h-3 w-3" /> Edit Target
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Metric 1: Revenue Goal */}
                      <div className="space-y-1 bg-white p-2.5 rounded-sm border border-slate-200/70">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Revenue Goal</span>
                          <span className="font-mono text-emerald-700">
                            {exec.revenueFormatted} / ₹ 2,50,000 ({revPct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isExceeded ? 'bg-emerald-500' : 'bg-blue-600'}`}
                            style={{ width: `${Math.min(revPct, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Metric 2: Visit Goal */}
                      <div className="space-y-1 bg-white p-2.5 rounded-sm border border-slate-200/70">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-600">Visits Goal</span>
                          <span className="font-mono text-blue-700">
                            {visitsDone} / {visitTarget} visits ({visitPct}%)
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${visitPct >= 90 ? 'bg-teal-500' : 'bg-purple-600'}`}
                            style={{ width: `${Math.min(visitPct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Target Distribution Grid */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Category Target vs Actual Achievement Split
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold">
              {[
                { category: 'Retail Stores', target: '₹ 6,00,000', achieved: '₹ 5,88,000', pct: 98, color: 'bg-emerald-500' },
                { category: 'Healthcare & Pharma', target: '₹ 3,50,000', achieved: '₹ 3,36,000', pct: 96, color: 'bg-blue-500' },
                { category: 'Automobile & Service', target: '₹ 3,00,000', achieved: '₹ 2,52,000', pct: 84, color: 'bg-purple-500' },
                { category: 'Food & Beverage', target: '₹ 2,00,000', achieved: '₹ 1,54,000', pct: 77, color: 'bg-amber-500' },
              ].map((cat) => (
                <div key={cat.category} className="rounded-sm bg-slate-50 border border-slate-200 p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-[#0D1F3D]">{cat.category}</span>
                    <span className="font-bold text-blue-600">{cat.pct}%</span>
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono flex justify-between">
                    <span>Achieved: {cat.achieved}</span>
                    <span className="text-slate-400">Target: {cat.target}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
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

          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <MapKpiCard title="Total Visits" value="176" subValue="↑ 18.4%" icon={TrendingUp} iconBgColor="bg-emerald-50" iconTextColor="text-emerald-600" />
            <MapKpiCard title="Completed Visits" value="142" subValue="↑ 21.7%" icon={CheckCircle2} iconBgColor="bg-blue-50" iconTextColor="text-blue-600" />
            <MapKpiCard title="New Leads" value="98" subValue="↑ 16.3%" icon={Users} iconBgColor="bg-purple-50" iconTextColor="text-purple-600" />
            <MapKpiCard title="Demos Conducted" value="36" subValue="↑ 12.5%" icon={Target} iconBgColor="bg-amber-50" iconTextColor="text-amber-600" />
            <MapKpiCard title="Sales Closed" value="28" subValue="↑ 21.7%" icon={ShoppingBag} iconBgColor="bg-teal-50" iconTextColor="text-teal-600" />
            <MapKpiCard title="Revenue" value="₹ 14,00,000" subValue="↑ 24.6%" icon={Award} iconBgColor="bg-rose-50" iconTextColor="text-rose-600" />
          </div>

          {/* Performance Analytics Grid Section */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Monthly Trend & Revenue Analysis */}
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-extrabold text-[#0D1F3D]">Monthly Revenue & Target Trend</h3>
                  <p className="text-[11px] font-medium text-slate-500">Historical performance across last 5 months in {territory.name}</p>
                </div>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Target Met: 67%
                </span>
              </div>

              {/* Bar Chart Visualization */}
              <div className="space-y-3 pt-2">
                {[
                  { month: 'Jan 2025', revenue: 950000, target: 1200000, visits: 130, pct: 79 },
                  { month: 'Feb 2025', revenue: 1100000, target: 1250000, visits: 145, pct: 88 },
                  { month: 'Mar 2025', revenue: 1280000, target: 1300000, visits: 160, pct: 98 },
                  { month: 'Apr 2025', revenue: 1350000, target: 1400000, visits: 168, pct: 96 },
                  { month: 'May 2025 (Current)', revenue: 1400000, target: 1500000, visits: 176, pct: 93 },
                ].map((item) => (
                  <div key={item.month} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-[#0D1F3D]">{item.month}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-normal">{item.visits} visits</span>
                        <span className="font-mono text-emerald-700">₹ {(item.revenue / 100000).toFixed(2)}L / ₹ {(item.target / 100000).toFixed(2)}L</span>
                        <span className="w-10 text-right text-blue-600 font-extrabold">{item.pct}%</span>
                      </div>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden flex">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Conversion Pipeline Breakdown */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-extrabold text-[#0D1F3D] mb-3">Field Conversion Funnel Metrics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-sm bg-slate-50 p-3 border border-slate-200/70 text-center">
                    <span className="text-xs font-semibold text-slate-600 block">Total Prospects</span>
                    <span className="text-lg font-extrabold text-[#0D1F3D]">168</span>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">100% Coverage</span>
                  </div>
                  <div className="rounded-sm bg-blue-50/50 p-3 border border-blue-100 text-center">
                    <span className="text-[10px] font-bold text-blue-600 block">Visits Completed</span>
                    <span className="text-lg font-extrabold text-blue-900">142</span>
                    <span className="text-[10px] text-blue-700 font-bold block mt-0.5">84.5% Visit Rate</span>
                  </div>
                  <div className="rounded-sm bg-amber-50/50 p-3 border border-amber-100 text-center">
                    <span className="text-[10px] font-bold text-amber-700 block">Demos Conducted</span>
                    <span className="text-lg font-extrabold text-amber-900">36</span>
                    <span className="text-[10px] text-amber-800 font-bold block mt-0.5">25.3% Demo Rate</span>
                  </div>
                  <div className="rounded-sm bg-emerald-50/50 p-3 border border-emerald-100 text-center">
                    <span className="text-[10px] font-bold text-emerald-700 block">Sales Closed</span>
                    <span className="text-lg font-extrabold text-emerald-900">28</span>
                    <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">77.7% Closing Rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Revenue Breakdown & Health Score */}
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-4 space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">Revenue Share by Category</h3>
                <p className="text-[11px] font-medium text-slate-500">Distribution across business categories</p>
              </div>

              <div className="space-y-3">
                {[
                  { category: 'Retail Stores', share: 42, amount: '₹ 5,88,000', color: 'bg-emerald-500' },
                  { category: 'Healthcare & Pharmacy', share: 24, amount: '₹ 3,36,000', color: 'bg-blue-500' },
                  { category: 'Automobile & Service', share: 18, amount: '₹ 2,52,000', color: 'bg-purple-500' },
                  { category: 'Food & Beverage', share: 11, amount: '₹ 1,54,000', color: 'bg-amber-500' },
                  { category: 'Hardware & Others', share: 5, amount: '₹ 70,000', color: 'bg-rose-500' },
                ].map((cat) => (
                  <div key={cat.category} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0D1F3D]">{cat.category}</span>
                      <span className="font-mono text-slate-600 font-extrabold">{cat.amount} ({cat.share}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <h4 className="text-xs font-extrabold text-[#0D1F3D]">Territory Health Score</h4>
                <div className="flex items-center justify-between p-3 rounded-sm bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 block">Overall Territory Score</span>
                    <span className="text-xl font-extrabold text-emerald-600">88.5 / 100</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-slate-500 block">Status</span>
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Optimal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Executive Performance Leaderboard Table */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Executive Performance Leaderboard ({territory.name})</h3>
              <span className="text-[11px] font-bold text-slate-500">May 2025 Performance</span>
            </div>

            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                  <th className="p-3">Executive</th>
                  <th className="p-3 text-center">Visits Done</th>
                  <th className="p-3 text-center">Demos</th>
                  <th className="p-3 text-center">Closed Deals</th>
                  <th className="p-3 text-right">Revenue (₹)</th>
                  <th className="p-3 text-center">Conversion Rate</th>
                  <th className="p-3 text-center">Target Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockTerritoryExecutives.map((exec) => (
                  <tr key={exec.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img src={exec.avatar} alt={exec.name} className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0" />
                        <div>
                          <span className="font-extrabold text-[#0D1F3D] block">{exec.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{exec.team}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-700">{exec.visitsCount}</td>
                    <td className="p-3 text-center font-bold text-amber-700">{Math.round(exec.visitsCount * 0.28)}</td>
                    <td className="p-3 text-center font-bold text-emerald-700">{Math.round(exec.visitsCount * 0.2)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{exec.revenueFormatted}</td>
                    <td className="p-3 text-center font-extrabold text-blue-600">
                      {(20 + (exec.performancePercentage % 15)).toFixed(1)}%
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        exec.performancePercentage >= 85
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {exec.performancePercentage}% Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLinkBusinessModalOpen(true)}
                className="flex items-center gap-1.5 font-bold border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
              >
                <Building className="h-3.5 w-3.5 text-blue-600" /> Assign Existing Business
              </Button>

              <Button
                variant="accent"
                size="sm"
                onClick={() => navigate(`/admin/businesses/create?territoryId=${territory.id}`)}
                className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Create & Assign New Business
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-8">
              <table className="w-full text-left border-collapse text-xs font-semibold">
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
                  {filteredBusinesses.map((b) => {
                    const isSelected = selectedBusinessId === b.id;
                    return (
                      <tr
                        key={b.id}
                        onClick={() => setSelectedBusinessId(b.id)}
                        className={`cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-red-50/60 font-bold border-l-4 border-l-[#E20613]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-sm bg-slate-100 flex items-center justify-center font-extrabold text-[#0D1F3D] border border-slate-200 shrink-0">
                              {b.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-extrabold text-[#0D1F3D]">{b.name}</span>
                                {b.badge && (
                                  <span className="rounded-xs bg-lime-100 px-1 py-0.2 text-[9px] font-bold text-lime-800">
                                    {b.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">{b.businessType}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600">{b.category}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={b.assignedToAvatar}
                              alt={b.assignedToName}
                              className="h-5 w-5 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                            <span>{b.assignedToName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-700">
                          {b.revenueFormatted || '₹ 1,80,000'}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            • {b.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Interactive Selected Business Details Preview Panel */}
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-4 space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">
                  Business Details Preview
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {selectedBusiness.status}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-[#0D1F3D]">{selectedBusiness.name}</h4>
                  {selectedBusiness.badge && (
                    <span className="rounded-xs bg-lime-100 px-1.5 py-0.5 text-[9px] font-bold text-lime-800">
                      {selectedBusiness.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] font-bold text-blue-600 mt-0.5">{selectedBusiness.category} • {selectedBusiness.businessType}</p>
              </div>

              <div className="space-y-1.5 text-slate-700 border-t border-slate-100 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Contact Person :</span>
                  <span className="font-extrabold text-[#0D1F3D]">{selectedBusiness.contactPerson} ({selectedBusiness.contactRole})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone :</span>
                  <span className="font-mono font-bold text-slate-800">{selectedBusiness.phone}</span>
                </div>
                {selectedBusiness.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email :</span>
                    <span className="font-mono text-slate-600 truncate max-w-[160px]">{selectedBusiness.email}</span>
                  </div>
                )}
                {selectedBusiness.address && (
                  <div className="pt-1">
                    <span className="text-slate-400 block mb-0.5">Address :</span>
                    <p className="text-[11px] text-slate-600 font-medium leading-tight">
                      {selectedBusiness.address}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Assigned Executive</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <img
                      src={selectedBusiness.assignedToAvatar}
                      alt={selectedBusiness.assignedToName}
                      className="h-5 w-5 rounded-full object-cover border border-slate-200"
                    />
                    <span className="font-bold text-[#0D1F3D]">{selectedBusiness.assignedToName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-500 block">Last Visit</span>
                  <span className="font-extrabold text-slate-700">{selectedBusiness.lastVisitDate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => toast.info(`Calling ${selectedBusiness.contactPerson} at ${selectedBusiness.phone}...`)}
                  className="flex items-center justify-center gap-1.5 rounded-sm bg-[#0D1F3D] py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#07152E] cursor-pointer"
                >
                  <Phone className="h-3.5 w-3.5" /> Call Owner
                </button>
                <button
                  type="button"
                  onClick={() => toast.info(`Navigating to ${selectedBusiness.name}...`)}
                  className="flex items-center justify-center gap-1.5 rounded-sm border border-slate-200 bg-white py-1.5 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 cursor-pointer"
                >
                  <MapPin className="h-3.5 w-3.5 text-red-600" /> Directions
                </button>
              </div>

              {/* Interactive Mapbox Map Centered on Selected Business */}
              <div className="relative h-[280px] w-full rounded-sm border border-slate-200 overflow-hidden shadow-inner">
                <InteractiveMap
                  key={selectedBusiness.id}
                  mode="prospects"
                  heightClassName="h-full"
                  compact
                  prospects={[
                    {
                      id: selectedBusiness.id,
                      name: selectedBusiness.name,
                      category: selectedBusiness.category,
                      address: selectedBusiness.address || selectedBusiness.contactPerson,
                      status: selectedBusiness.visitStatus === 'Visited' ? 'Visited' : selectedBusiness.visitStatus === 'Scheduled' ? 'Follow-up' : 'New Prospect',
                      markerColor: 'green',
                      contactPerson: selectedBusiness.contactPerson,
                      phone: selectedBusiness.phone,
                      lastVisitTime: selectedBusiness.lastVisitDate,
                      lat: selectedBusiness.lat || 19.118,
                      lng: selectedBusiness.lng || 72.868,
                      region: 'Andheri East',
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: MAP & BOUNDARIES VIEW */}
      {activeTab === 'Map' && (
        <div className="space-y-4">
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

                <div className="space-y-2.5 text-slate-700">
                  <div>
                    <Checkbox
                      checked={showBoundary}
                      onChange={(val) => setShowBoundary(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-blue-600 font-mono font-bold">---</span>
                          <span>Territory Boundary</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showBusinesses}
                      onChange={(val) => setShowBusinesses(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          <span>Businesses</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showActiveBusinesses}
                      onChange={(val) => setShowActiveBusinesses(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                          <span>Active Businesses</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showLeads}
                      onChange={(val) => setShowLeads(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                          <span>Leads</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showVisitedLocations}
                      onChange={(val) => setShowVisitedLocations(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-amber-500">📍</span>
                          <span>Visited Locations (This Month)</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showExecutives}
                      onChange={(val) => setShowExecutives(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-red-500">👤</span>
                          <span>Executives Live Location</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showRoutes}
                      onChange={(val) => setShowRoutes(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-blue-500 font-mono">---</span>
                          <span>Routes (This Month)</span>
                        </span>
                      }
                    />
                  </div>

                  <div>
                    <Checkbox
                      checked={showHeatmap}
                      onChange={(val) => setShowHeatmap(val)}
                      label={
                        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                          <span>🔥 Heatmap (Visits)</span>
                        </span>
                      }
                    />
                  </div>
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
              </div>
            </div>

            {/* RIGHT COLUMN (8 COLS FULL MAPBOX VIEW) */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="relative rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden flex-1 min-h-[580px]">
                <InteractiveMap
                  mode={showHeatmap ? 'visit-heatmap' : 'live-executives'}
                  enablePolygonDrawing
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

          {/* Bottom Metrics Cards Grid (5 Stat Cards matching Territory Map) */}
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

      {/* Modal for Setting Executive Targets */}
      <Modal isOpen={isSetTargetModalOpen} onClose={() => setIsSetTargetModalOpen(false)} maxWidth="max-w-md">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              {editingTargetExec ? `Edit Target for ${editingTargetExec.name}` : 'Set Executive Targets'}
            </h3>
            <button onClick={() => setIsSetTargetModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="text-slate-500 block mb-1">Target Month / Period</label>
              <input
                type="text"
                value={targetPeriodFilter}
                disabled
                className="w-full rounded-sm border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1">Revenue Target (₹)</label>
              <input
                type="number"
                value={targetRevenueInput}
                onChange={(e) => setTargetRevenueInput(e.target.value)}
                placeholder="250000"
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1">Monthly Visit Target</label>
              <input
                type="number"
                value={targetVisitInput}
                onChange={(e) => setTargetVisitInput(e.target.value)}
                placeholder="35"
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-700 block mb-1">New Business Goal</label>
              <input
                type="number"
                defaultValue="12"
                placeholder="12"
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsSetTargetModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setIsSetTargetModalOpen(false);
                toast.success('Executive targets updated successfully!');
              }}
              className="bg-[#0D1F3D] text-white font-bold"
            >
              Save Targets
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal for Adding New Business to Territory */}
      <Modal isOpen={isAddBusinessModalOpen} onClose={() => setIsAddBusinessModalOpen(false)} maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Add New Business to {territory.name}</h3>
              <p className="text-[11px] font-medium text-slate-500">Create a business record and assign to field executive</p>
            </div>
            <button onClick={() => setIsAddBusinessModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newBusinessData.name.trim()) {
                toast.error('Please enter business name');
                return;
              }
              if (!newBusinessData.contactPerson.trim()) {
                toast.error('Please enter contact person name');
                return;
              }
              if (!newBusinessData.phone.trim()) {
                toast.error('Please enter contact phone number');
                return;
              }

              const created: any = {
                id: `biz-${Date.now()}`,
                name: newBusinessData.name,
                category: newBusinessData.category,
                businessType: newBusinessData.category === 'Retail' ? 'Electronics Store' : newBusinessData.category,
                contactPerson: newBusinessData.contactPerson,
                phone: newBusinessData.phone,
                email: newBusinessData.email || `${newBusinessData.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
                address: newBusinessData.address || `${territory.name}, Mumbai`,
                assignedToName: newBusinessData.assignedExecutive,
                assignedToAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                status: newBusinessData.status,
                annualRevenue: '₹ 1,50,000',
                revenueFormatted: '₹ 1,50,000',
                lastVisitDate: 'Just now',
                hotBadge: true,
                badge: 'Hot',
              };

              setBusinessesList([created, ...businessesList]);
              setSelectedBusinessId(created.id);
              setIsAddBusinessModalOpen(false);
              setNewBusinessData({
                name: '',
                category: 'Retail',
                contactPerson: '',
                phone: '',
                email: '',
                address: '',
                assignedExecutive: 'Arjun Mehta',
                status: 'Active',
              });
              toast.success(`Business "${created.name}" added to ${territory.name} successfully!`);
            }}
            className="space-y-3 text-xs font-semibold"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-slate-700 block">Business Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Traders"
                  value={newBusinessData.name}
                  onChange={(e) => setNewBusinessData({ ...newBusinessData, name: e.target.value })}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
                />
              </div>

              <Select
                label="Category / Industry *"
                value={newBusinessData.category}
                onChange={(e) => setNewBusinessData({ ...newBusinessData, category: e.target.value })}
                options={[
                  { label: 'Retail', value: 'Retail' },
                  { label: 'Healthcare', value: 'Healthcare' },
                  { label: 'Food & Beverage', value: 'Food & Beverage' },
                  { label: 'Automobile', value: 'Automobile' },
                  { label: 'Technology', value: 'Technology' },
                  { label: 'Fitness & Gym', value: 'Gym' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-slate-700 block">Contact Person Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Kumar"
                  value={newBusinessData.contactPerson}
                  onChange={(e) => setNewBusinessData({ ...newBusinessData, contactPerson: e.target.value })}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 block">Phone / Mobile *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newBusinessData.phone}
                  onChange={(e) => setNewBusinessData({ ...newBusinessData, phone: e.target.value })}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-slate-700 block">Email Address</label>
                <input
                  type="email"
                  placeholder="contact@business.com"
                  value={newBusinessData.email}
                  onChange={(e) => setNewBusinessData({ ...newBusinessData, email: e.target.value })}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
                />
              </div>

              <Select
                label="Assign To Field Executive *"
                value={newBusinessData.assignedExecutive}
                onChange={(e) => setNewBusinessData({ ...newBusinessData, assignedExecutive: e.target.value })}
                options={mockTerritoryExecutives.map((ex) => ({
                  label: `${ex.name} (${ex.team})`,
                  value: ex.name,
                }))}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 block">Full Address</label>
              <input
                type="text"
                placeholder="Shop No, Building, Street, Area"
                value={newBusinessData.address}
                onChange={(e) => setNewBusinessData({ ...newBusinessData, address: e.target.value })}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddBusinessModalOpen(false);
                  navigate('/admin/businesses/add');
                }}
                className="text-[11px] font-extrabold text-blue-600 hover:underline"
              >
                Or open full registration page →
              </button>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setIsAddBusinessModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" className="bg-[#E20613] hover:bg-red-700 text-white font-bold">
                  Save & Add Business
                </Button>
              </div>
            </div>
          </form>
        </div>
      </Modal>

      {/* Modal for Assigning Existing Business to Territory */}
      <Modal isOpen={isLinkBusinessModalOpen} onClose={() => setIsLinkBusinessModalOpen(false)} maxWidth="max-w-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Assign Existing Business to {territory.name}</h3>
              <p className="text-[11px] font-medium text-slate-500">Select an existing business from the database to add to this territory</p>
            </div>
            <button onClick={() => setIsLinkBusinessModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search business by name, owner, or city..."
                value={linkSearchQuery}
                onChange={(e) => setLinkSearchQuery(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
              />
            </div>

            {/* Business Selection List */}
            <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-sm divide-y divide-slate-100 bg-slate-50/50">
              {mockBusinesses
                .filter(
                  (b) =>
                    b.name.toLowerCase().includes(linkSearchQuery.toLowerCase()) ||
                    b.contactPerson.toLowerCase().includes(linkSearchQuery.toLowerCase()) ||
                    b.city.toLowerCase().includes(linkSearchQuery.toLowerCase()),
                )
                .map((b) => {
                  const isSelected = selectedLinkBizId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setSelectedLinkBizId(b.id)}
                      className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600 font-bold' : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-sm bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-xs">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-extrabold text-[#0D1F3D] block">{b.name}</span>
                          <span className="text-[10px] text-slate-500 font-normal">
                            {b.businessType} • {b.contactPerson} ({b.city})
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{b.id}</span>
                    </div>
                  );
                })}
            </div>

            {/* Executive Assignment Select */}
            <Select
              label="Assign Executive in Territory *"
              value={linkAssignedExec}
              onChange={(e) => setLinkAssignedExec(e.target.value)}
              options={mockTerritoryExecutives.map((ex) => ({
                label: `${ex.name} (${ex.team})`,
                value: ex.name,
              }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setIsLinkBusinessModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                const targetBiz = mockBusinesses.find((b) => b.id === selectedLinkBizId);
                if (targetBiz) {
                  const created: any = {
                    id: targetBiz.id,
                    name: targetBiz.name,
                    category: targetBiz.category || 'Retail',
                    businessType: targetBiz.businessType,
                    contactPerson: targetBiz.contactPerson,
                    contactRole: targetBiz.contactRole || 'Owner',
                    phone: targetBiz.phone,
                    email: targetBiz.email,
                    address: targetBiz.fullAddress || targetBiz.address,
                    assignedToName: linkAssignedExec,
                    assignedToAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
                    status: 'Active',
                    annualRevenue: targetBiz.annualRevenue || '₹ 1,80,000',
                    revenueFormatted: '₹ 1,80,000',
                    lastVisitDate: 'Just now',
                    hotBadge: true,
                    badge: 'Assigned',
                  };

                  setBusinessesList([created, ...businessesList.filter((b) => b.id !== targetBiz.id)]);
                  setSelectedBusinessId(created.id);
                  setIsLinkBusinessModalOpen(false);
                  toast.success(`Business "${targetBiz.name}" assigned to ${territory.name}!`);
                }
              }}
              className="bg-[#0D1F3D] text-white font-bold"
            >
              Assign to Territory
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
