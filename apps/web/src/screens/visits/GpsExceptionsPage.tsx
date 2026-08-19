import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Search,
  RefreshCw,
  Download,
  Eye,
  MoreVertical,
  MapPin,
  Filter,
  ChevronRight,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { mockGpsExceptions, GpsExceptionItem } from './visitsData';

export default function GpsExceptionsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'overdue'>('all');
  const [selectedId, setSelectedId] = useState<string>(mockGpsExceptions[0].id);

  const [execFilter, setExecFilter] = useState('All');
  const [teamFilter, setTeamFilter] = useState('All');
  const [reasonFilter, setReasonFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const selectedRequest = mockGpsExceptions.find((r) => r.id === selectedId) || mockGpsExceptions[0];

  const filteredRequests = mockGpsExceptions.filter((r) => {
    let matchesTab = true;
    if (activeTab === 'pending') matchesTab = r.status === 'Pending Review';
    else if (activeTab === 'approved') matchesTab = r.status === 'Approved';
    else if (activeTab === 'rejected') matchesTab = r.status === 'Rejected';

    const matchesExec = execFilter === 'All' || r.executiveName === execFilter;
    const matchesTeam = teamFilter === 'All' || r.teamManager.includes(teamFilter);
    const matchesType = typeFilter === 'All' || r.exceptionType === typeFilter;

    return matchesTab && matchesExec && matchesTeam && matchesType;
  });

  const columns: ColumnDef<GpsExceptionItem>[] = [
    {
      header: 'Request ID',
      cell: (r) => (
        <button
          onClick={() => navigate(`/admin/visits/gps-exceptions/${r.id}`)}
          className="font-bold text-[#E20613] hover:underline text-left block font-mono text-xs"
        >
          {r.id}
        </button>
      ),
    },
    {
      header: 'Executive',
      cell: (r) => (
        <div className="flex items-center gap-2">
          <img
            src={r.executiveAvatar}
            alt={r.executiveName}
            className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div>
            <p className="font-bold text-[#0D1F3D]">{r.executiveName}</p>
            <p className="text-[10px] text-slate-500 font-medium">{r.executiveRole}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Team / Manager',
      cell: (r) => (
        <div>
          <p className="font-bold text-[#0D1F3D] text-[11px]">{r.teamManager.split(' ')[0]} Team</p>
          <p className="text-[10px] text-slate-500 font-medium">{r.teamManager}</p>
        </div>
      ),
    },
    {
      header: 'Visit / Business',
      cell: (r) => (
        <div>
          <p className="font-bold text-[#0D1F3D]">{r.businessName}</p>
          <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{r.businessAddress}</p>
        </div>
      ),
    },
    {
      header: 'Exception Type',
      cell: (r) => (
        <span className="rounded-sm bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold text-orange-700 border border-orange-200 whitespace-nowrap">
          {r.exceptionType}
        </span>
      ),
    },
    {
      header: 'Reason',
      cell: (r) => (
        <p className="text-slate-700 font-semibold text-[11px] max-w-[180px] truncate">{r.detailedReason}</p>
      ),
    },
    {
      header: 'Requested At',
      cell: (r) => (
        <span className="text-slate-600 font-medium text-[11px] whitespace-nowrap">{r.requestedAt}</span>
      ),
    },
    {
      header: 'Status',
      cell: (r) => (
        <span
          className={`inline-block rounded-sm px-2 py-0.5 text-[10px] font-extrabold border ${
            r.status === 'Approved'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : r.status === 'Pending Review'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {r.status === 'Pending Review' ? 'Pending' : r.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (r) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => {
              setSelectedId(r.id);
              navigate(`/admin/visits/gps-exceptions/${r.id}`);
            }}
            className="p-1.5 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-sm transition-colors cursor-pointer"
            title="View Exception Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedId(r.id)}
            className="p-1.5 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-100 rounded-sm transition-colors cursor-pointer"
            title="Preview Request"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      ),
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
            <span onClick={() => navigate('/admin/visits')} className="hover:text-[#0D1F3D] cursor-pointer">
              Visit Management
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0D1F3D] font-bold">GPS Exception Requests</span>
          </div>

          <h1 className="text-2xl font-bold text-[#0D1F3D]">GPS Exception Requests</h1>
          <p className="text-xs font-normal text-slate-500">
            Review and manage GPS check-in/out exceptions requested by field executives.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Refreshed requests list')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-sm"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting exception log...')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-sm"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export
          </Button>
        </div>
      </div>

      {/* 5 Top KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:grid-cols-3">
        <KpiCard
          title="Pending Review"
          value="18"
          subValue="Needs attention"
          icon={Clock}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Approved"
          value="42"
          subValue="This month"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Rejected"
          value="11"
          subValue="This month"
          icon={XCircle}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-red-600"
        />
        <KpiCard
          title="Overdue"
          value="7"
          subValue="Older than 48h"
          icon={AlertCircle}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Total Requests"
          value="78"
          subValue="This month"
          icon={ShieldAlert}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
      </div>

      {/* Filter Row */}
      <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            value={execFilter}
            onChange={(e) => setExecFilter(e.target.value)}
            options={[
              { label: 'All Executives', value: 'All' },
              { label: 'Amit Verma', value: 'Amit Verma' },
              { label: 'Neha Gupta', value: 'Neha Gupta' },
              { label: 'Vikram Patil', value: 'Vikram Patil' },
              { label: 'Pooja Yadav', value: 'Pooja Yadav' },
            ]}
          />

          <Select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            options={[
              { label: 'All Teams', value: 'All' },
              { label: 'North Mumbai', value: 'North Mumbai' },
              { label: 'West Mumbai', value: 'West Mumbai' },
              { label: 'Thane Zone', value: 'Thane Zone' },
              { label: 'Navi Mumbai', value: 'Navi Mumbai' },
            ]}
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { label: 'All Exception Types', value: 'All' },
              { label: 'Check-in Outside Radius', value: 'Check-in Outside Radius' },
              { label: 'Check-out Outside Radius', value: 'Check-out Outside Radius' },
              { label: 'No Signal Area', value: 'No Signal Area' },
              { label: 'Wrong Location Marked', value: 'Wrong Location Marked' },
            ]}
          />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setExecFilter('All');
                setTeamFilter('All');
                setTypeFilter('All');
              }}
              className="w-full font-bold text-red-600 border-slate-200 hover:bg-red-50 rounded-sm h-9"
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Status Tabs Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          {[
            { key: 'all', label: 'All Requests (78)' },
            { key: 'pending', label: 'Pending (18)' },
            { key: 'approved', label: 'Approved (42)' },
            { key: 'rejected', label: 'Rejected (11)' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-[#E20613] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Datatable (8 Cols) + Right Location Preview & Action Sidebar (4 Cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column Datatable */}
        <div className="space-y-4 lg:col-span-8">
          <DataTable
            data={filteredRequests}
            columns={columns}
            keyExtractor={(r) => r.id}
            density="relaxed"
          />
        </div>

        {/* Right Preview Sidebar */}
        <div className="space-y-6 lg:col-span-4 sticky top-4 self-start">
          {/* Location Preview Map Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Location Preview
            </h3>

            <div className="relative h-56 w-full rounded-sm border border-slate-200 bg-slate-100 overflow-hidden shadow-xs">
              <iframe
                title="GPS Exception Map Preview"
                src={`https://maps.google.com/maps?q=${selectedRequest.expectedLatitude},${selectedRequest.expectedLongitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>

            <div className="space-y-2 text-[11px] font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-600 shrink-0" />
                <span className="text-slate-600">Expected Location ({selectedRequest.allowedRadiusMeters}m radius)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-600 shrink-0" />
                <span className="text-slate-600">Actual Location ({selectedRequest.capturedDistanceMeters}m away)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-600 shrink-0" />
                <span className="text-slate-600">Business Location</span>
              </div>
            </div>
          </div>

          {/* Request Details Live Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Request Details
            </h3>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Request ID</span>
              <span className="font-bold text-[#E20613] font-mono">{selectedRequest.id}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Executive</span>
              <span className="font-bold text-[#0D1F3D]">{selectedRequest.executiveName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Phone</span>
              <span className="font-bold text-[#0D1F3D]">{selectedRequest.executivePhone}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Visit / Business</span>
              <span className="font-bold text-[#0D1F3D]">{selectedRequest.businessName}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Scheduled Time</span>
              <span className="font-bold text-slate-800">{selectedRequest.scheduledTime}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Requested At</span>
              <span className="font-bold text-slate-800">{selectedRequest.requestedAt}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Exception Type</span>
              <span className="rounded-sm bg-orange-50 px-2 py-0.5 text-[10px] font-extrabold text-orange-700 border border-orange-200">
                {selectedRequest.exceptionType}
              </span>
            </div>

            <div className="py-1 border-b border-slate-100">
              <span className="text-slate-400 text-[10.5px] block font-medium mb-1">Reason</span>
              <p className="text-slate-700 font-bold bg-slate-50 p-2 rounded-sm border border-slate-200">
                {selectedRequest.detailedReason}
              </p>
            </div>

            <div className="py-1">
              <span className="text-slate-400 text-[10.5px] block font-medium mb-1">Notes by Executive</span>
              <p className="text-slate-600 font-medium italic bg-slate-50 p-2 rounded-sm border border-slate-100">
                "{selectedRequest.notesByExecutive}"
              </p>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <Button
                variant="accent"
                size="sm"
                fullWidth
                onClick={() => toast.success(`Approved GPS exception ${selectedRequest.id}`)}
                className="flex items-center justify-center gap-1.5 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm h-9"
              >
                <Check className="h-4 w-4" /> Approve Request
              </Button>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => toast.error(`Rejected GPS exception ${selectedRequest.id}`)}
                className="flex items-center justify-center gap-1.5 font-bold text-red-600 border-red-200 hover:bg-red-50 rounded-sm h-9"
              >
                <X className="h-4 w-4" /> Reject Request
              </Button>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => toast.info(`Adding comment to ${selectedRequest.id}`)}
                className="flex items-center justify-center gap-1.5 font-bold text-slate-700 border-slate-200 hover:bg-slate-100 rounded-sm h-9"
              >
                <MessageSquare className="h-4 w-4 text-blue-600" /> Add Note / Comment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
