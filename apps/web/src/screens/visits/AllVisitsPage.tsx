import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  RefreshCw,
  Eye,
  MoreVertical,
  MapPin,
  Filter,
  Download,
  CalendarRange,
  ChevronRight,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { GoogleMapPicker } from '../../components/ui/GoogleMapPicker';
import { VisitItem } from './visitsData';
import GpsExceptionsPage from './GpsExceptionsPage';
import { useCrm, useCrmQuery, useDebouncedSearch } from '../../features/crm/CrmContext';
import { visitApi, VisitView } from './visit.api';
import { toVisitItem } from './visit-adapter';

interface AllVisitsPageProps {
  viewMode?: 'all' | 'today' | 'scheduled' | 'completed' | 'missed' | 'verified' | 'unverified' | 'gps-exceptions';
}

export default function AllVisitsPage({ viewMode = 'all' }: AllVisitsPageProps) {
  const navigate = useNavigate();
  const { can } = useCrm();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  React.useEffect(() => {
    const handleClose = () => setActiveActionId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedSearch(searchTerm.trim());
  const [executiveFilter, setExecutiveFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');

  const apiView: VisitView = viewMode === 'gps-exceptions' ? 'all' : viewMode;
  const visitsQuery = useCrmQuery(
    `visits:${apiView}:${page}:${debouncedSearch}`,
    (_service, signal) =>
      visitApi.list(
        { view: apiView, page, limit: 25, ...(debouncedSearch ? { search: debouncedSearch } : {}) },
        signal,
      ),
  );
  const dynamicVisitsList = useMemo(
    () => (visitsQuery.data?.items ?? []).map(toVisitItem),
    [visitsQuery.data?.items],
  );
  const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
  useEffect(() => {
    if (!dynamicVisitsList.some((visit) => visit.id === selectedVisitId)) {
      setSelectedVisitId(dynamicVisitsList[0]?.id ?? null);
    }
  }, [dynamicVisitsList, selectedVisitId]);
  const selectedVisit = dynamicVisitsList.find((visit) => visit.id === selectedVisitId);

  useEffect(() => setPage(1), [apiView, debouncedSearch]);

  const executiveFilterOptions = useMemo(() => [
    { label: 'All Executives', value: 'All' },
    ...Array.from(new Set(dynamicVisitsList.map((visit) => visit.executiveName)))
      .sort()
      .map((name) => ({ label: name, value: name })),
  ], [dynamicVisitsList]);
  const areaFilterOptions = useMemo(() => [
    { label: 'All Areas / Locations', value: 'All' },
    ...Array.from(new Set(dynamicVisitsList.map((visit) => visit.routeArea)))
      .sort()
      .map((area) => ({ label: area, value: area })),
  ], [dynamicVisitsList]);
  const summary = visitsQuery.data?.summary;
  const allCount = summary?.all ?? 0;
  const todayCount = summary?.today ?? 0;
  const scheduledCount = summary?.scheduled ?? 0;
  const completedCount = summary?.completed ?? 0;
  const missedCount = summary?.missed ?? 0;
  const verifiedCount = summary?.verified ?? 0;
  const unverifiedCount = summary?.unverified ?? 0;

  const visitsTrendData = useMemo(() => {
    const counts = new Map<string, number>();
    dynamicVisitsList.forEach((visit) => {
      const day = visit.scheduledDateTime.split(',').slice(0, 2).join(',');
      counts.set(day, (counts.get(day) ?? 0) + 1);
    });
    return Array.from(counts, ([day, visits]) => ({ day, visits })).slice(-7);
  }, [dynamicVisitsList]);

  const visitTabs = [
    { key: 'all', label: 'All Visits', badge: String(allCount), path: '/admin/visits' },
    { key: 'today', label: "Today's Visits", badge: String(todayCount), path: '/admin/visits/today' },
    { key: 'scheduled', label: 'Scheduled Visits', badge: String(scheduledCount), path: '/admin/visits/scheduled' },
    { key: 'completed', label: 'Completed Visits', badge: String(completedCount), path: '/admin/visits/completed' },
    { key: 'missed', label: 'Missed Visits', badge: String(missedCount), path: '/admin/visits/missed' },
    { key: 'verified', label: 'Verified Visits', badge: String(verifiedCount), path: '/admin/visits/verified' },
    { key: 'unverified', label: 'Unverified Visits', badge: String(unverifiedCount), path: '/admin/visits/unverified' },
  ];

  // View titles & descriptions
  const getPageTitle = () => {
    switch (viewMode) {
      case 'today':
        return "Today's Visits";
      case 'scheduled':
        return 'Scheduled Visits';
      case 'completed':
        return 'Completed Visits';
      case 'missed':
        return 'Missed Visits';
      case 'verified':
        return 'Verified Visits';
      case 'unverified':
        return 'Unverified Visits';
      case 'gps-exceptions':
        return 'GPS Exception Requests';
      default:
        return 'All Visits';
    }
  };

  const getPageDescription = () => {
    switch (viewMode) {
      case 'today':
        return 'Real-time monitoring of today field visits, check-ins, and check-outs';
      case 'scheduled':
        return 'View and manage all upcoming scheduled field visits across executive routes';
      case 'completed':
        return 'History of completed field visits with GPS proof and outcome reports';
      case 'missed':
        return 'Missed or cancelled field visits requiring rescheduling or manager review';
      case 'verified':
        return 'Field visits with 100% verified GPS check-in location (within 100m radius)';
      case 'unverified':
        return 'Visits flagged for GPS location mismatch or missing check-in proof';
      case 'gps-exceptions':
        return 'Review and manage GPS check-in/out exceptions requested by field executives';
      default:
        return 'Comprehensive dashboard of all field executive visits, check-ins, and outcomes';
    }
  };

  // Secondary presentation filters only operate on the already authorized API page.
  const filteredVisits = dynamicVisitsList.filter((v) => {
    const matchesExec = executiveFilter === 'All' || v.executiveName === executiveFilter;
    const matchesType = typeFilter === 'All' || v.visitType === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesArea = areaFilter === 'All' || v.routeArea.includes(areaFilter);

    return matchesExec && matchesType && matchesStatus && matchesArea;
  });

  // Helper to extract executive initials
  const getExecutiveInitials = (name: string) => {
    if (!name) return 'EX';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const columns: ColumnDef<VisitItem>[] = [
    {
      header: 'Visit ID & Date',
      cell: (v) => (
        <div>
          <button
            onClick={() => navigate(`/admin/visits/${v.id}`)}
            className="font-bold text-[#0D1F3D] hover:text-blue-600 hover:underline block text-left"
          >
            {v.displayId || 'Visit'}
          </button>
          <p className="text-[11px] text-slate-500 font-medium whitespace-nowrap">{v.scheduledDateTime}</p>
        </div>
      ),
    },
    {
      header: 'Business / Shop',
      cell: (v) => (
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(v.businessPath || `/admin/businesses/${v.businessId}`);
            }}
            className="font-bold text-[#0D1F3D] hover:text-[#E20613] hover:underline text-left cursor-pointer block"
          >
            {v.businessName}
          </button>
          <p className="text-[11px] text-slate-500 font-normal truncate max-w-[180px]">{v.location}</p>
        </div>
      ),
    },
    {
      header: 'Executive',
      cell: (v) => {
        const hasAvatar = Boolean(
          v.executiveAvatar &&
            (v.executiveAvatar.startsWith('http://') ||
              v.executiveAvatar.startsWith('https://') ||
              v.executiveAvatar.startsWith('data:'))
        );

        return (
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/employees/${v.executiveId}`);
            }}
            className="flex items-center gap-2 cursor-pointer group"
            title={`View ${v.executiveName}'s Profile`}
          >
            {hasAvatar ? (
              <img
                src={v.executiveAvatar}
                alt={v.executiveName}
                className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-purple-600 transition-all shadow-xs"
              />
            ) : (
              <div className="h-7 w-7 rounded-full bg-[#0D1F3D] text-white flex items-center justify-center font-bold text-[11px] shrink-0 border border-slate-200 group-hover:ring-2 group-hover:ring-purple-600 transition-all shadow-xs">
                {getExecutiveInitials(v.executiveName)}
              </div>
            )}
            <div>
              <p className="font-bold text-[#0D1F3D] group-hover:text-purple-600 group-hover:underline transition-colors">
                {v.executiveName}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">{v.executiveRole}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Check-in',
      cell: (v) => (
        <div>
          {v.checkInTime ? (
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm border border-emerald-100 text-[11px]">
              {v.checkInTime}
            </span>
          ) : (
            <span className="text-slate-400 font-medium text-[11px]">-</span>
          )}
        </div>
      ),
    },
    {
      header: 'GPS Verification',
      cell: (v) => (
        <div className="flex items-center gap-1.5">
          {v.isGpsVerified ? (
            <span className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm text-[10px] border border-emerald-200">
              <ShieldCheck className="h-3 w-3" /> Verified{v.distanceFromShop ? ` (${v.distanceFromShop})` : ''}
            </span>
          ) : (
            <span className="flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm text-[10px] border border-amber-200">
              <ShieldAlert className="h-3 w-3 text-amber-600" /> Outside ({v.distanceFromShop || '350m'})
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Duration',
      cell: (v) => (
        <span className="font-semibold text-slate-700">{v.duration || '-'}</span>
      ),
    },
    {
      header: 'Outcome',
      cell: (v) => (
        <span
          className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-extrabold border ${
            v.outcome === 'Positive'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : v.outcome === 'Neutral'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : v.outcome === 'Lost'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {v.outcome}
        </span>
      ),
    },
    {
      header: 'Check-out',
      cell: (v) => (
        <div>
          {v.checkOutTime ? (
            <span className="font-bold text-slate-800 text-[11px]">{v.checkOutTime}</span>
          ) : (
            <span className="text-slate-400 font-medium text-[11px]">-</span>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (v) => {
        const isOpen = activeActionId === v.id;
        return (
          <div className="relative flex items-center justify-end gap-1">
            <button
              onClick={() => navigate(`/admin/visits/${v.id}`)}
              className="p-1.5 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-sm transition-colors cursor-pointer"
              title="View Visit Details"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveActionId(isOpen ? null : v.id);
              }}
              className="p-1.5 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-sm transition-colors cursor-pointer"
              title="Actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Action Dropdown Card */}
            {isOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-full mt-1 w-48 rounded-sm border border-slate-200 bg-white p-1.5 shadow-xl z-50 text-left font-semibold text-xs space-y-0.5 animate-dropdown"
              >
                <button
                  onClick={() => {
                    setActiveActionId(null);
                    navigate(`/admin/visits/${v.id}`);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-100 text-[#0D1F3D] cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5 text-blue-600" /> View Details
                </button>

                {can('crm.visits.schedule') ? (
                  <button
                    onClick={() => {
                      setActiveActionId(null);
                      navigate('/admin/visits/schedule');
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-100 text-[#0D1F3D] cursor-pointer"
                  >
                    <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Reschedule Visit
                  </button>
                ) : null}

                <button
                  onClick={() => {
                    setActiveActionId(null);
                    navigate(v.businessPath || `/admin/businesses/${v.businessId}`);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-100 text-[#0D1F3D] cursor-pointer"
                >
                  <Building2 className="h-3.5 w-3.5 text-slate-500" /> View Business
                </button>

                <button
                  onClick={() => {
                    setActiveActionId(null);
                    toast.success(`Outcome logged for visit ${v.id}`);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-100 text-[#0D1F3D] cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Log Outcome
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setActiveActionId(null);
                    toast.error(`Visit ${v.id} marked as cancelled`);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-red-50 text-red-600 cursor-pointer"
                >
                  <XCircle className="h-3.5 w-3.5 text-red-600" /> Cancel Visit
                </button>
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span onClick={() => navigate('/admin/dashboard')} className="hover:text-[#0D1F3D] cursor-pointer">
              Dashboard
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0D1F3D] font-bold">Visit Management</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0D1F3D] font-bold">{getPageTitle()}</span>
          </div>

          <h1 className="text-2xl font-bold text-[#0D1F3D]">Visit Management</h1>
          <p className="text-xs font-normal text-slate-500">{getPageDescription()}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              visitsQuery.reload();
              toast.success('Visit data refreshed.');
            }}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          {can('crm.visits.schedule') ? <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/visits/schedule')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
          >
            <Plus className="h-4 w-4" /> Schedule Visit
          </Button> : null}
        </div>
      </div>

      {/* SINGLE UNIFIED TABS NAVIGATION BAR */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 pt-1.5 rounded-sm shadow-xs overflow-x-auto custom-scrollbar">
        {visitTabs.map((tab) => {
          const isActive = viewMode === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-[#0D1F3D] text-[#0D1F3D] bg-slate-50/80 rounded-t-sm'
                  : 'border-transparent text-slate-500 hover:text-[#0D1F3D] hover:border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.2 text-[10px] font-extrabold ${
                  isActive ? 'bg-[#0D1F3D] text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* If viewMode is 'gps-exceptions', render the GpsExceptionsPage view */}
      {viewMode === 'gps-exceptions' ? (
        <GpsExceptionsPage />
      ) : (
        <>
          {/* 5 KPI Header Cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:grid-cols-3">
            <KpiCard
              title="Total Scheduled"
              value={String(scheduledCount)}
              subValue="All upcoming"
              icon={Calendar}
              iconBgColor="bg-[#0D1F3D]/10"
              iconTextColor="text-[#0D1F3D]"
            />
            <KpiCard
              title="Today Visits"
              value={String(todayCount)}
              subValue={`${allCount > 0 ? ((todayCount / allCount) * 100).toFixed(1) : '0'}% of total`}
              icon={Clock}
              iconBgColor="bg-emerald-500/10"
              iconTextColor="text-emerald-600"
            />
            <KpiCard
              title="Tomorrow"
              value={String(Math.round(scheduledCount * 0.3))}
              subValue="Upcoming next day"
              icon={CalendarRange}
              iconBgColor="bg-amber-500/10"
              iconTextColor="text-amber-600"
            />
            <KpiCard
              title="Overdue / Missed"
              value={String(missedCount)}
              subValue={`${allCount > 0 ? ((missedCount / allCount) * 100).toFixed(1) : '0'}% delayed`}
              icon={XCircle}
              iconBgColor="bg-red-500/10"
              iconTextColor="text-red-600"
            />
            <KpiCard
              title="GPS Exceptions"
              value={String(unverifiedCount)}
              subValue="Location not verified"
              icon={ShieldAlert}
              iconBgColor="bg-purple-500/10"
              iconTextColor="text-purple-600"
            />
          </div>

          {/* Filters Bar */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search business, executive..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
                />
              </div>

              <Select
                value={executiveFilter}
                onChange={(e) => setExecutiveFilter(e.target.value)}
                options={executiveFilterOptions}
              />

              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { label: 'All Visit Types', value: 'All' },
                  { label: 'Sales Visit', value: 'Sales Visit' },
                  { label: 'Follow-up', value: 'Follow-up' },
                  { label: 'Collection', value: 'Collection' },
                  { label: 'Requirement Discussion', value: 'Requirement Discussion' },
                  { label: 'Product Demo', value: 'Product Demo' },
                ]}
              />

              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Completed', value: 'Completed' },
                  { label: 'Scheduled', value: 'Scheduled' },
                  { label: 'In Progress', value: 'In Progress' },
                  { label: 'Missed', value: 'Missed' },
                ]}
              />

              <Select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                options={areaFilterOptions}
              />
            </div>
          </div>

          {/* Full-width Datatable */}
          <div className="space-y-4">
            {visitsQuery.error ? (
              <div role="alert" className="rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
                {visitsQuery.error.message}
              </div>
            ) : null}
            <DataTable
              data={filteredVisits}
              columns={columns}
              keyExtractor={(v) => v.id}
              density="relaxed"
              onRowClick={(v) => setSelectedVisitId(v.id)}
              isLoading={visitsQuery.loading}
              emptyMessage="No visits are assigned for this view"
              pagination={visitsQuery.data ? {
                currentPage: visitsQuery.data.page,
                totalPages: Math.max(1, visitsQuery.data.totalPages),
                totalEntries: visitsQuery.data.total,
                pageSize: visitsQuery.data.limit,
                onPageChange: setPage,
              } : undefined}
            />
          </div>

          {/* 3 Side-by-Side Inspection & Analytics Cards directly next to Datatable */}
          {selectedVisit ? <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Card 1: Selected Visit Location Map (4 Cols) */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs lg:col-span-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Visit Location & Map</span>
                  <span className="font-mono text-[#E20613]">{selectedVisit.displayId || 'Visit'}</span>
                </h3>

                <div className="pt-3">
                  <GoogleMapPicker
                    address={`${selectedVisit.businessName}, ${selectedVisit.routeArea}`}
                    height="h-44"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-1 text-[11px] font-semibold pt-2 border-t border-slate-100">
                <p className="text-[#0D1F3D] font-extrabold">{selectedVisit.businessName}</p>
                <p className="text-slate-500 font-medium">{selectedVisit.routeArea} • GPS Verified Check-in</p>
              </div>
            </div>

            {/* Card 2: Selected Visit Details (5 Cols) */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-2 text-xs font-semibold lg:col-span-5 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Selected Visit Details</span>
                  <span className="rounded-sm bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200">
                    {selectedVisit.visitType}
                  </span>
                </h3>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Visit ID</span>
                    <span className="font-bold text-[#E20613] font-mono">{selectedVisit.displayId || 'Visit'}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Executive</span>
                    <span className="font-bold text-[#0D1F3D]">{selectedVisit.executiveName}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Business / Store</span>
                    <span className="font-bold text-[#0D1F3D]">{selectedVisit.businessName}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Scheduled Date</span>
                    <span className="font-bold text-slate-800">{selectedVisit.scheduledDateTime}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Check-in</span>
                    <span className="font-bold text-emerald-700">{selectedVisit.checkInTime || 'Not checked in'}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Check-out</span>
                    <span className="font-bold text-slate-800">{selectedVisit.checkOutTime || '-'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-slate-400 text-[10.5px] block font-medium mb-1">Outcome & Notes</span>
                  <p className="text-slate-700 font-bold bg-slate-50 p-2 rounded-sm border border-slate-200">
                    {selectedVisit.outcome || 'Visit scheduled. Awaiting executive check-in.'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">Duration: <strong className="text-[#0D1F3D]">{selectedVisit.duration || 'Not recorded'}</strong></span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/visits/${selectedVisit.id}`)}
                  className="font-bold text-blue-700 border-blue-200 hover:bg-blue-50 text-[11px]"
                >
                  <Eye className="h-3.5 w-3.5" /> Full Visit Details
                </Button>
              </div>
            </div>

            {/* Card 3: Visits Trend & Actions (3 Cols) */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs lg:col-span-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-extrabold text-[#0D1F3D]">Visits Trend</h3>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>

                <div className="h-28 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visitsTrendData}>
                      <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} tickLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0D1F3D',
                          borderRadius: '4px',
                          color: '#FFF',
                          fontSize: '10px',
                          fontWeight: 'bold',
                        }}
                      />
                      <Line type="monotone" dataKey="visits" stroke="#2563EB" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {can('crm.visits.schedule') ? (
                  <Button
                    variant="accent"
                    size="sm"
                    fullWidth
                    onClick={() => navigate('/admin/visits/schedule')}
                    className="flex items-center justify-center gap-1.5 font-bold bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm h-8"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Schedule New Visit
                  </Button>
                ) : null}

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(selectedVisit.businessPath || `/admin/businesses/${selectedVisit.businessId}`)}
                  className="flex items-center justify-center gap-1.5 font-bold text-slate-700 border-slate-200 hover:bg-slate-100 rounded-sm h-8"
                >
                  <Building2 className="h-3.5 w-3.5 text-slate-500" /> Business Profile
                </Button>
              </div>
            </div>
          </div> : null}
        </>
      )}
    </div>
  );
}
