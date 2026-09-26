import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  UserCheck,
  MoreVertical,
  Users,
  CheckCircle2,
  TrendingUp,
  Target,
  Phone,
  Search,
  Filter,
  Download,
  Plus,
  ChevronRight,
  MapPin,
  Briefcase,
  RotateCcw,
  Eye,
  UserX,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { AddMemberModal } from '../../components/teams/AddMemberModal';
import { Avatar } from '../../components/ui/Avatar';
import { useTeamWorkspace, teamApi } from './teams.api';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { extractErrorMessage } from '../../common/api';

export default function TeamDetailsPage() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const { data, refresh } = useTeamWorkspace(teamId);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');
  const salesTrendData = data?.salesTrend ?? [];
  const leadTotal = (data?.leadSources ?? []).reduce((sum, source) => sum + source.count, 0);
  const totalLeadsCount = data?.summary.totalLeads ?? leadTotal;
  const leadSourceData = (data?.leadSources ?? []).map((source, index) => ({
    name: source.name, count: source.count, value: totalLeadsCount ? Math.round((source.count / totalLeadsCount) * 1000) / 10 : 0,
    color: ['#0D1F3D', '#2563EB', '#F59E0B', '#10B981', '#8B5CF6', '#E20613'][index % 6],
  }));
  const dealFunnelData = data?.dealFunnel ?? [
    { stage: 'New Leads', count: totalLeadsCount, pct: '100%', color: 'bg-slate-900' },
    { stage: 'Contacted', count: data?.summary.dealsCreated ?? 0, pct: `${totalLeadsCount ? Math.round(((data?.summary.dealsCreated ?? 0) / totalLeadsCount) * 100) : 0}%`, color: 'bg-blue-600' },
    { stage: 'Qualified', count: Math.round((data?.summary.dealsCreated ?? 0) * 0.6), pct: `${totalLeadsCount ? Math.round((((data?.summary.dealsCreated ?? 0) * 0.6) / totalLeadsCount) * 100) : 0}%`, color: 'bg-teal-600' },
    { stage: 'Proposal', count: Math.round((data?.summary.dealsCreated ?? 0) * 0.4), pct: `${totalLeadsCount ? Math.round((((data?.summary.dealsCreated ?? 0) * 0.4) / totalLeadsCount) * 100) : 0}%`, color: 'bg-amber-500' },
    { stage: 'Negotiation', count: Math.round((data?.summary.dealsCreated ?? 0) * 0.2), pct: `${totalLeadsCount ? Math.round((((data?.summary.dealsCreated ?? 0) * 0.2) / totalLeadsCount) * 100) : 0}%`, color: 'bg-purple-600' },
    { stage: 'Closed Won', count: data?.summary.dealsWon ?? 0, pct: `${totalLeadsCount ? Math.round(((data?.summary.dealsWon ?? 0) / totalLeadsCount) * 100) : 0}%`, color: 'bg-emerald-600' },
  ];

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!teamId) return;
    try {
      await teamApi.removeMember(teamId, memberId);
      toast.success(`${memberName} removed from ${data?.team.name ?? 'team'}`);
      refresh();
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Failed to remove member from team.'));
    }
  };
  const teamMembers = (data?.members ?? []).map((member) => ({
    id: member.id, name: member.name, code: member.employeeCode ?? 'Not assigned', avatar: member.avatarUrl ?? '',
    role: member.designation, location: member.location, leads: member.totalLeads, deals: member.dealsWon,
    sales: member.revenue, achv: member.achievementPercent, status: member.status,
  }));

  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const matchesSearch =
        searchTerm.trim() === '' ||
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      const matchesLocation = locationFilter === 'All' || m.location === locationFilter;

      return matchesSearch && matchesStatus && matchesLocation;
    });
  }, [teamMembers, searchTerm, statusFilter, locationFilter]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setLocationFilter('All');
    setShowFilters(false);
  };

  const handleExportCSV = () => {
    const headers = ['#', 'Employee Code', 'Member Name', 'Role', 'Location', 'Active Leads', 'Deals Won', 'Sales (INR)', 'Target Achieved %', 'Status'];
    const rows = filteredMembers.map((m, idx) => [
      idx + 1,
      m.code,
      `"${m.name}"`,
      `"${m.role}"`,
      `"${m.location}"`,
      m.leads,
      m.deals,
      m.sales,
      `${m.achv}%`,
      `"${m.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${(data?.team.name ?? 'Team').replace(/\s+/g, '_')}_Members_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${filteredMembers.length} team members to CSV`);
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* UNIFIED PAGE HEADER & BREADCRUMB */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/teams')}
              className="text-slate-500 hover:text-slate-900 transition-colors"
              title="Back to Teams"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900">{data?.team.name ?? 'Loading team...'}</h1>
            <span className="rounded-sm bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              {data?.team.status ?? 'Active'}
            </span>
            <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200">
              {data?.team.code ?? '—'}
            </span>
          </div>
          <p className="mt-1 text-sm font-normal text-slate-600">
            {data?.team.description || `${data?.team.teamType ?? 'Sales team'} for ${data?.team.region ?? 'an unassigned region'}.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/teams/${teamId ?? ''}/edit`)}
            className="flex items-center gap-2 font-semibold text-slate-800 border-slate-300 shadow-none hover:bg-slate-50"
          >
            <Edit className="h-4 w-4 text-slate-700" /> Edit Team
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/teams/${teamId ?? ''}/members`)}
            className="flex items-center gap-2 font-semibold text-slate-800 border-slate-300 shadow-none hover:bg-slate-50"
          >
            <Users className="h-4 w-4" /> Manage Members
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        </div>
      </div>

      {/* Team Operational Hierarchy Card: Sales Manager -> Team Leader -> Field Executives */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#0D1F3D]">
            Team Operational Hierarchy
          </h3>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-sm px-2.5 py-1">
            Sales Manager → Team Leader → Field Executives
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Level 1: Sales Manager */}
          <div className="flex items-center gap-3 rounded-sm border border-slate-200 bg-slate-50/80 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-bold text-xs shadow-xs">
              SM
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-sm mb-1">
                Sales Manager
              </span>
              <p className="text-xs font-bold text-[#0D1F3D] truncate">{data?.manager?.name ?? 'Not assigned'}</p>
              <p className="text-[11px] text-slate-600 font-medium">{data?.manager?.designation ?? 'Sales Manager'}</p>
            </div>
          </div>

          {/* Level 2: Team Leader */}
          <div className="flex items-center gap-3 rounded-sm border border-slate-200 bg-slate-50/80 p-3.5">
            <Avatar name={data?.leader?.name ?? 'Unassigned'} src={data?.leader?.avatarUrl} sizeClassName="h-10 w-10" />
            <div className="min-w-0 flex-1">
              <span className="inline-block text-[11px] font-bold text-[#E20613] bg-red-50 border border-red-200/80 px-2 py-0.5 rounded-sm mb-1">
                Team Leader
              </span>
              <p className="text-xs font-bold text-[#0D1F3D] truncate">
                {data?.leader?.name ?? 'Not assigned'} <span className="font-mono text-[11px] text-slate-600">({data?.leader?.employeeCode ?? 'No code'})</span>
              </p>
              <p className="text-[11px] text-slate-600 font-medium">{data?.team.region ?? 'No territory assigned'}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/teams/${teamId ?? ''}/leader`)}
              className="!px-2.5 !py-1 text-xs font-semibold text-slate-800 border-slate-300 shrink-0 hover:bg-slate-100"
            >
              Reassign
            </Button>
          </div>

          {/* Level 3: Field Executives */}
          <div className="flex items-center gap-3 rounded-sm border border-slate-200 bg-slate-50/80 p-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-emerald-700 text-white font-bold text-xs shadow-xs">
              {data?.summary.totalMembers ?? 0} FE
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-block text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-sm mb-1">
                Field Executives
              </span>
              <p className="text-xs font-bold text-[#0D1F3D] truncate">{data?.summary.activeMembers ?? 0} Active Executives</p>
              <p className="text-[11px] text-slate-600 font-medium">{data?.team.region ?? 'No territory assigned'}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/teams/${teamId ?? ''}/members`)}
              className="!px-2.5 !py-1 text-xs font-semibold text-slate-800 border-slate-300 shrink-0 hover:bg-slate-100"
            >
              Members
            </Button>
          </div>
        </div>
      </div>

      {/* 4 ESSENTIAL KPI METRIC CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Team Members"
          value={`${data?.summary.totalMembers ?? 0} Staff`}
          subValue={`${data?.summary.activeMembers ?? 0} Active Field Execs`}
          icon={Users}
          iconBgColor="bg-slate-100"
          iconTextColor="text-slate-800"
        />
        <KpiCard
          title="Monthly Target"
          value={`₹${(data?.summary.revenueTarget ?? 0).toLocaleString('en-IN')}`}
          subValue={`${data?.summary.achievementPercent ?? 0}% Target Achieved`}
          icon={Target}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-700"
        />
        <KpiCard
          title="Total Sales Achieved"
          value={`₹${(data?.summary.revenue ?? 0).toLocaleString('en-IN')}`}
          timeframe="Current period"
          icon={TrendingUp}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
        <KpiCard
          title="Deals Closed"
          value={`${data?.summary.dealsWon ?? 0} Deals`}
          subValue={`${data?.summary.totalLeads ?? 0} Total Leads`}
          icon={CheckCircle2}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-700"
        />
      </div>

      {/* RELEVANT CORE NAVIGATION TABS */}
      <div className="border-b border-slate-200 flex items-center gap-1 overflow-x-auto custom-scrollbar">
        {[
          'Overview',
          'Team Members',
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-extrabold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-purple-600 text-purple-700 bg-transparent'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
            {/* Sales Performance Trend Area Chart */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-6 space-y-4 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Sales Performance Trend</h3>
                  <p className="text-xs text-slate-600 font-normal">Monthly revenue progression</p>
                </div>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className="flex items-center gap-1 text-blue-700 font-semibold"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Team Sales</span>
                  <span className="flex items-center gap-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> Target</span>
                </div>
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="teamSalesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 100000}L`} />
                    <Tooltip
                      position={{ y: -15 }}
                      wrapperStyle={{ zIndex: 100 }}
                      contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                      labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                      itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                      formatter={(val, name) => [`₹${Number(val ?? 0).toLocaleString()}`, name ?? 'Value']}
                    />
                    <Area type="monotone" dataKey="sales" name="Team Sales" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#teamSalesGrad)" />
                    <Area type="monotone" dataKey="target" name="Target" stroke="#94A3B8" strokeWidth={2} strokeDasharray="3 3" fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Leads by Source Donut Chart */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
              <h3 className="text-base font-bold text-slate-900">Leads by Source</h3>
              <div className="flex flex-col items-center">
                <div className="h-44 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadSourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        position={{ y: -15 }}
                        wrapperStyle={{ zIndex: 100 }}
                        contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                        labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                        itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                        formatter={(val) => [`${val ?? 0}%`, 'Share']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold text-slate-900">{totalLeadsCount.toLocaleString()}</span>
                    <span className="text-xs font-normal text-slate-600">Total Leads</span>
                  </div>
                </div>

                <div className="w-full space-y-1 text-xs font-medium text-slate-700 mt-1">
                  {leadSourceData.map((s) => (
                    <div key={s.name} className="flex justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        <span className="truncate">{s.name}</span>
                      </span>
                      <span className="font-semibold text-slate-900">{s.value}% <span className="text-slate-500 font-normal">({s.count})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Deal Stage Funnel */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
              <h3 className="text-base font-bold text-slate-900">Deal Stage Funnel</h3>
              <div className="space-y-2 pt-1">
                {dealFunnelData.map((f) => (







                  <div key={f.stage} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800">
                      <span>{f.stage}</span>
                      <span>{typeof f.count === 'number' ? f.count.toLocaleString() : f.count} ({f.pct})</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                      <div className={`h-full ${f.color} rounded-full`} style={{ width: f.pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Members Table & Leaderboard Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Team Members Table */}
            <div className="rounded-sm border border-slate-200 bg-white shadow-xs lg:col-span-8 overflow-hidden flex flex-col justify-between">
              <div>
                {/* Table Header & Toolbar */}
                <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-bold text-slate-900">Team Members Performance</h3>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="relative w-48 sm:w-56">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-sm border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-800"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFilters(!showFilters)}
                      className={`font-semibold text-slate-800 border-slate-300 flex items-center gap-1 ${
                        showFilters || statusFilter !== 'All' || locationFilter !== 'All'
                          ? 'bg-slate-100 border-slate-400'
                          : ''
                      }`}
                    >
                      <Filter className="h-3.5 w-3.5" /> Filter
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      className="font-semibold text-slate-800 border-slate-300 flex items-center gap-1 shadow-xs"
                    >
                      <Download className="h-3.5 w-3.5" /> Export
                    </Button>
                  </div>
                </div>

                {/* Collapsible Filter Panel */}
                {showFilters && (
                  <div className="p-4 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Status Filter</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full rounded-sm border border-slate-300 bg-white p-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-800"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Location Area</label>
                      <select
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full rounded-sm border border-slate-300 bg-white p-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-800"
                      >
                        <option value="All">All Locations</option>
                        {[...new Set(teamMembers.map((member) => member.location))].map((location) => <option key={location} value={location}>{location}</option>)}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="w-full font-semibold text-slate-800 border-slate-300 flex items-center justify-center gap-1.5 h-9"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
                      </Button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/90 text-xs font-semibold text-slate-800">
                        <th className="px-4 py-3 w-8 text-center whitespace-nowrap">#</th>
                        <th className="px-4 py-3 whitespace-nowrap min-w-[180px]">Member Name</th>
                        <th className="px-4 py-3 whitespace-nowrap min-w-[130px]">Role</th>
                        <th className="px-4 py-3 whitespace-nowrap min-w-[110px]">Location</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap min-w-[90px]">Active Leads</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap min-w-[90px]">Deals Won</th>
                        <th className="px-4 py-3 text-right whitespace-nowrap min-w-[140px]">Sales (This Month)</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap min-w-[100px]">Target Achv.</th>
                        <th className="px-4 py-3 text-center whitespace-nowrap min-w-[110px]">Status</th>
                        <th className="px-4 py-3 text-right whitespace-nowrap min-w-[80px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map((m, idx) => (
                          <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="px-4 py-3 text-slate-500 font-semibold text-center whitespace-nowrap">{idx + 1}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate(`/admin/executives/${m.id}`)}>
                                <Avatar name={m.name} src={m.avatar || undefined} sizeClassName="h-7 w-7" />
                                <div>
                                  <p className="font-semibold text-slate-900 whitespace-nowrap">{m.name}</p>
                                  <p className="text-xs font-mono font-semibold text-slate-600 whitespace-nowrap">{m.code}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-700 font-normal whitespace-nowrap">{m.role}</td>
                            <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{m.location}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900 text-center whitespace-nowrap">{m.leads}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900 text-center whitespace-nowrap">{m.deals}</td>
                            <td className="px-4 py-3 font-semibold text-slate-900 text-right whitespace-nowrap">₹{m.sales.toLocaleString()}</td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className={`font-semibold ${m.achv >= 80 ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {m.achv}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center whitespace-nowrap">
                              <span className={`inline-block rounded-sm px-2.5 py-0.5 text-xs font-semibold border whitespace-nowrap ${
                                m.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-300'
                              }`}>
                                {m.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right whitespace-nowrap">
                              <RowActionsMenu
                                items={[
                                  {
                                    label: 'View Profile',
                                    icon: Eye,
                                    onClick: () => navigate(`/admin/executives/${m.id}`),
                                  },
                                  {
                                    label: 'Edit Executive',
                                    icon: Edit,
                                    onClick: () => navigate(`/admin/executives/${m.id}/edit`),
                                  },
                                  {
                                    label: 'Remove from Team',
                                    icon: UserX,
                                    danger: true,
                                    divider: true,
                                    onClick: () => handleRemoveMember(m.id, m.name),
                                  },
                                ]}
                              />



                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="px-4 py-8 text-center text-slate-500 font-medium">
                            No team members match the selected filters. Try resetting filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50">
                <span className="text-slate-600 font-normal">Showing 1 to {filteredMembers.length} of {teamMembers.length} members</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/teams/${teamId ?? ''}/members`)}
                  className="font-semibold text-slate-800 border-slate-300 flex items-center gap-1"
                >
                  View All Members <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Right: Top Performers */}
            <div className="space-y-6 lg:col-span-4">
              <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Top Performers</h3>
                  <span className="text-xs font-normal text-slate-600">This Month</span>
                </div>

                <div className="space-y-3">
                  {filteredMembers.slice(0, 5).map((m, idx) => (
                    <div key={m.id} className="flex items-center justify-between text-xs font-medium">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-800 border border-slate-200">
                          {idx + 1}
                        </span>
                        <Avatar name={m.name} src={m.avatar || undefined} sizeClassName="h-7 w-7" />
                        <div>
                          <p className="font-semibold text-slate-900">{m.name}</p>
                          <p className="text-xs text-slate-600 font-normal">{m.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">₹{m.sales.toLocaleString()}</p>
                        <p className="text-xs font-semibold text-emerald-700">{m.achv}% Target</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TEAM MEMBERS */}
      {activeTab === 'Team Members' && (
        <div className="rounded-sm border border-slate-200 bg-white shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Team Roster</h3>
              <p className="text-xs text-slate-600">All field executives assigned to {data?.team.name ?? 'this team'}</p>
            </div>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate(`/admin/teams/${teamId ?? ''}/members`)}
              className="flex items-center gap-1.5 font-semibold"
            >
              <Plus className="h-4 w-4" /> Add Executive
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredMembers.map((m) => (
              <div key={m.id} className="rounded-sm border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar name={m.name} src={m.avatar || undefined} sizeClassName="h-10 w-10" />
                  <div>
                    <p className="font-semibold text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-600 font-mono">{m.code}</p>
                  </div>
                </div>
                <div className="text-xs space-y-1 pt-2 border-t border-slate-200 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-medium">{m.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sales Achieved:</span>
                    <span className="font-semibold text-slate-900">₹{m.sales.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        teamId={teamId}
        teamName={data?.team.name ?? 'Team'}
        candidates={data?.candidates ?? []}
        onMembersAdded={refresh}
      />
    </div>
  );
}
