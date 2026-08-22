import React, { useState } from 'react';
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
import { ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { GoogleMapPicker } from '../../components/ui/GoogleMapPicker';
import { mockVisits, mockGpsExceptions, VisitItem, GpsExceptionItem } from './visitsData';
import GpsExceptionsPage from './GpsExceptionsPage';

interface AllVisitsPageProps {
  viewMode?: 'all' | 'today' | 'scheduled' | 'completed' | 'missed' | 'verified' | 'unverified' | 'gps-exceptions';
}

const visitsTrendData = [
  { day: 'May 24', visits: 20 },
  { day: 'May 25', visits: 32 },
  { day: 'May 26', visits: 24 },
  { day: 'May 27', visits: 30 },
  { day: 'May 28', visits: 22 },
  { day: 'May 29', visits: 28 },
  { day: 'May 30', visits: 35 },
];

const visitsTypeDistribution = [
  { name: 'Sales Visit', value: 52, color: '#2563EB' },
  { name: 'Follow-up', value: 30, color: '#F59E0B' },
  { name: 'Collection', value: 24, color: '#10B981' },
  { name: 'Others', value: 22, color: '#8B5CF6' },
];

export default function AllVisitsPage({ viewMode = 'all' }: AllVisitsPageProps) {
  const navigate = useNavigate();
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  React.useEffect(() => {
    const handleClose = () => setActiveActionId(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [executiveFilter, setExecutiveFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');
  const [selectedVisitId, setSelectedVisitId] = useState<string>(mockVisits[0].id);

  const selectedVisit = mockVisits.find((v) => v.id === selectedVisitId) || mockVisits[0];

  const visitTabs = [
    { key: 'all', label: 'All Visits', badge: '128', path: '/admin/visits' },
    { key: 'today', label: "Today's Visits", badge: '26', path: '/admin/visits/today' },
    { key: 'scheduled', label: 'Scheduled Visits', badge: '128', path: '/admin/visits/scheduled' },
    { key: 'completed', label: 'Completed Visits', badge: '45', path: '/admin/visits/completed' },
    { key: 'missed', label: 'Missed Visits', badge: '6', path: '/admin/visits/missed' },
    { key: 'verified', label: 'Verified Visits', badge: '98', path: '/admin/visits/verified' },
    { key: 'unverified', label: 'Unverified Visits', badge: '30', path: '/admin/visits/unverified' },
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

  // Filter dataset based on viewMode & user filters
  const filteredVisits = mockVisits.filter((v) => {
    const matchesSearch =
      v.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.executiveName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesExec = executiveFilter === 'All' || v.executiveName === executiveFilter;
    const matchesType = typeFilter === 'All' || v.visitType === typeFilter;
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesArea = areaFilter === 'All' || v.routeArea.includes(areaFilter);

    let matchesView = true;
    if (viewMode === 'today') matchesView = v.scheduledDateTime.includes('May 24') || v.scheduledDateTime.includes('May 25');
    else if (viewMode === 'scheduled') matchesView = v.status === 'Scheduled';
    else if (viewMode === 'completed') matchesView = v.status === 'Completed';
    else if (viewMode === 'missed') matchesView = v.status === 'Missed';
    else if (viewMode === 'verified') matchesView = v.isGpsVerified;
    else if (viewMode === 'unverified') matchesView = !v.isGpsVerified;

    return matchesSearch && matchesExec && matchesType && matchesStatus && matchesArea && matchesView;
  });

  const columns: ColumnDef<VisitItem>[] = [
    {
      header: 'Visit ID & Date',
      cell: (v) => (
        <div>
          <button
            onClick={() => navigate(`/admin/visits/${v.id}`)}
            className="font-bold text-[#0D1F3D] hover:text-blue-600 hover:underline block text-left"
          >
            {v.id}
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
              navigate(`/admin/businesses/${v.businessId}`);
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
      cell: (v) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            navigate('/admin/executives/FE-1001');
          }}
          className="flex items-center gap-2 cursor-pointer group"
          title={`View ${v.executiveName}'s Profile`}
        >
          <img
            src={v.executiveAvatar}
            alt={v.executiveName}
            className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0 group-hover:ring-2 group-hover:ring-purple-600 transition-all"
          />
          <div>
            <p className="font-bold text-[#0D1F3D] group-hover:text-purple-600 group-hover:underline transition-colors">{v.executiveName}</p>
            <p className="text-[10px] text-slate-500 font-medium">{v.executiveRole}</p>
          </div>
        </div>
      ),
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
              <ShieldCheck className="h-3 w-3" /> Verified ({v.distanceFromShop})
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

                <button
                  onClick={() => {
                    setActiveActionId(null);
                    navigate('/admin/visits/schedule');
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-100 text-[#0D1F3D] cursor-pointer"
                >
                  <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Reschedule Visit
                </button>

                <button
                  onClick={() => {
                    setActiveActionId(null);
                    navigate(`/admin/businesses/${v.businessId}`);
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
            onClick={() => toast.success('Refreshing visit data...')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/visits/schedule')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
          >
            <Plus className="h-4 w-4" /> Schedule Visit
          </Button>
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
              value="128"
              subValue="All upcoming"
              icon={Calendar}
              iconBgColor="bg-[#0D1F3D]/10"
              iconTextColor="text-[#0D1F3D]"
            />
            <KpiCard
              title="Today Visits"
              value="26"
              subValue="20.3% of total"
              icon={Clock}
              iconBgColor="bg-emerald-500/10"
              iconTextColor="text-emerald-600"
            />
            <KpiCard
              title="Tomorrow"
              value="34"
              subValue="26.6% next day"
              icon={CalendarRange}
              iconBgColor="bg-amber-500/10"
              iconTextColor="text-amber-600"
            />
            <KpiCard
              title="Overdue / Missed"
              value="6"
              subValue="4.7% delayed"
              icon={XCircle}
              iconBgColor="bg-red-500/10"
              iconTextColor="text-red-600"
            />
            <KpiCard
              title="GPS Exceptions"
              value="18"
              subValue="Pending review"
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
                options={[
                  { label: 'All Executives', value: 'All' },
                  { label: 'Amit Verma', value: 'Amit Verma' },
                  { label: 'Neha Gupta', value: 'Neha Gupta' },
                  { label: 'Vikram Patil', value: 'Vikram Patil' },
                  { label: 'Pooja Yadav', value: 'Pooja Yadav' },
                  { label: 'Ankush Yadav', value: 'Ankush Yadav' },
                ]}
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
                options={[
                  { label: 'All Areas / Locations', value: 'All' },
                  { label: 'Andheri East', value: 'Andheri East' },
                  { label: 'Dadar West', value: 'Dadar West' },
                  { label: 'Thane West', value: 'Thane West' },
                  { label: 'Vashi', value: 'Vashi' },
                  { label: 'Borivali', value: 'Borivali' },
                ]}
              />
            </div>
          </div>

          {/* Full-width Datatable */}
          <div className="space-y-4">
            <DataTable
              data={filteredVisits}
              columns={columns}
              keyExtractor={(v) => v.id}
              density="relaxed"
            />
          </div>

          {/* 3 Side-by-Side Inspection & Analytics Cards directly next to Datatable */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Card 1: Selected Visit Location Map (4 Cols) */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs lg:col-span-4 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Visit Location & Map</span>
                  <span className="font-mono text-[#E20613]">{selectedVisit.id}</span>
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
                    <span className="font-bold text-[#E20613] font-mono">{selectedVisit.id}</span>
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
                <span className="text-slate-500 text-[11px]">Duration: <strong className="text-[#0D1F3D]">{selectedVisit.duration || '45m'}</strong></span>
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
                <Button
                  variant="accent"
                  size="sm"
                  fullWidth
                  onClick={() => navigate('/admin/visits/schedule')}
                  className="flex items-center justify-center gap-1.5 font-bold bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm h-8"
                >
                  <Calendar className="h-3.5 w-3.5" /> Schedule New Visit
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/admin/businesses/${selectedVisit.businessId}`)}
                  className="flex items-center justify-center gap-1.5 font-bold text-slate-700 border-slate-200 hover:bg-slate-100 rounded-sm h-8"
                >
                  <Building2 className="h-3.5 w-3.5 text-slate-500" /> Business Profile
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
