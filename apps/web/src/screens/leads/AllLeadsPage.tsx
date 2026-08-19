import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Target,
  UserPlus,
  Search,
  Filter,
  Download,
  Upload,
  UserCheck,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Eye,
  Edit,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  DollarSign,
  FileText,
  MessageSquare,
  Video,
  CalendarClock,
  Ban,
} from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { mockLeadsData, LeadItem } from './leadsData';

interface AllLeadsPageProps {
  viewMode?: 'all' | 'unassigned' | 'hot' | 'follow-up' | 'converted' | 'lost' | 'not-interested' | 'duplicates';
}

export default function AllLeadsPage({ viewMode }: AllLeadsPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active view mode from props or URL pathname
  const currentPath = location.pathname;
  let activeCategory = viewMode || 'all';
  if (currentPath.includes('/unassigned')) activeCategory = 'unassigned';
  else if (currentPath.includes('/hot')) activeCategory = 'hot';
  else if (currentPath.includes('/follow-up')) activeCategory = 'follow-up';
  else if (currentPath.includes('/converted')) activeCategory = 'converted';
  else if (currentPath.includes('/lost')) activeCategory = 'lost';
  else if (currentPath.includes('/not-interested')) activeCategory = 'not-interested';
  else if (currentPath.includes('/duplicates')) activeCategory = 'duplicates';

  const [leads, setLeads] = useState<LeadItem[]>(mockLeadsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleGlobalClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  // Filter leads based on active category tab & search parameters
  const filteredLeads = leads.filter((lead) => {
    const search = searchTerm.toLowerCase().trim();
    const matchesSearch =
      search === '' ||
      lead.companyName.toLowerCase().includes(search) ||
      lead.contactPerson.toLowerCase().includes(search) ||
      lead.code.toLowerCase().includes(search) ||
      lead.email.toLowerCase().includes(search) ||
      lead.phone.includes(search);

    const matchesRegion = regionFilter === 'All' || lead.region.includes(regionFilter);
    const matchesPriority = priorityFilter === 'All' || lead.priority === priorityFilter;
    const matchesStage = stageFilter === 'All' || lead.stage === stageFilter;

    let matchesCategory = true;
    if (activeCategory === 'unassigned') matchesCategory = lead.status === 'Unassigned';
    else if (activeCategory === 'hot') matchesCategory = lead.status === 'Hot';
    else if (activeCategory === 'follow-up') matchesCategory = lead.status === 'Follow-up';
    else if (activeCategory === 'converted') matchesCategory = lead.status === 'Converted';
    else if (activeCategory === 'lost') matchesCategory = lead.status === 'Lost';
    else if (activeCategory === 'not-interested') matchesCategory = lead.status === 'Not Interested';
    else if (activeCategory === 'duplicates') matchesCategory = lead.status === 'Duplicate';

    return matchesSearch && matchesRegion && matchesPriority && matchesStage && matchesCategory;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredLeads.map((l) => l.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const getCategoryTitle = () => {
    switch (activeCategory) {
      case 'unassigned': return 'Unassigned Leads';
      case 'hot': return 'Hot High-Priority Leads';
      case 'follow-up': return 'Pending Follow-up Leads';
      case 'converted': return 'Won / Converted Deals';
      case 'lost': return 'Lost Opportunities';
      case 'not-interested': return 'Not Interested Leads';
      case 'duplicates': return 'Duplicate Lead Entries';
      default: return 'All Enterprise Leads';
    }
  };

  // Stats calculation
  const totalPipelineValue = filteredLeads.reduce((acc, curr) => acc + curr.estimatedValue, 0);
  const hotLeadsCount = leads.filter((l) => l.status === 'Hot').length;
  const unassignedCount = leads.filter((l) => l.status === 'Unassigned').length;
  const followUpCount = leads.filter((l) => l.status === 'Follow-up').length;
  const convertedCount = leads.filter((l) => l.status === 'Converted').length;

  return (
    <div className="space-y-3 font-sans pb-10">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">All Leads</h1>
          <p className="text-xs font-normal text-slate-500">
            Manage and track all incoming leads from multiple sources.
          </p>
        </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/leads/import')}
              className="flex items-center gap-1.5 font-bold"
            >
              <Upload className="h-4 w-4 text-blue-600" /> Import Leads
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/leads/export')}
              className="flex items-center gap-1.5 font-bold"
            >
              <Download className="h-4 w-4 text-emerald-600" /> Export Data
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/leads/bulk-assign')}
              className="flex items-center gap-1.5 font-bold"
            >
              <UserCheck className="h-4 w-4 text-purple-600" /> Bulk Assign
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/admin/leads/create')}
              className="flex items-center gap-1.5 font-bold shadow-xs"
            >
              <UserPlus className="h-4 w-4" /> Add New Lead
            </Button>
          </div>
        </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:grid-cols-3">
        <KpiCard
          title="Total Leads"
          value={String(leads.length)}
          subValue="Active Pipeline"
          timeframe=""
          icon={Target}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Hot High Priority"
          value={String(hotLeadsCount)}
          subValue="Immediate Action"
          timeframe=""
          icon={Flame}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Pending Follow-ups"
          value={String(followUpCount)}
          subValue="Scheduled Calls"
          timeframe=""
          icon={Clock}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Unassigned Leads"
          value={String(unassignedCount)}
          subValue="Needs Executive"
          timeframe=""
          icon={AlertCircle}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Won / Converted"
          value={String(convertedCount)}
          subValue={`₹${(totalPipelineValue / 100000).toFixed(1)}L Total`}
          timeframe=""
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
      </div>

      {/* Category Filter Sub-Tabs Bar */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 bg-white p-1.5 rounded-md shadow-xs scrollbar-none">
        {[
          { id: 'all', label: 'All Leads', path: '/admin/leads', count: leads.length, icon: Target },
          { id: 'hot', label: 'Hot Leads', path: '/admin/leads/hot', count: hotLeadsCount, icon: Flame },
          { id: 'follow-up', label: 'Follow-ups', path: '/admin/leads/follow-up', count: followUpCount, icon: CalendarClock },
          { id: 'unassigned', label: 'Unassigned', path: '/admin/leads/unassigned', count: unassignedCount, icon: UserPlus },
          { id: 'converted', label: 'Won / Converted', path: '/admin/leads/converted', count: convertedCount, icon: TrendingUp },
          { id: 'lost', label: 'Lost Leads', path: '/admin/leads/lost', count: leads.filter((l) => l.status === 'Lost').length, icon: XCircle },
          { id: 'not-interested', label: 'Not Interested', path: '/admin/leads/not-interested', count: leads.filter((l) => l.status === 'Not Interested').length, icon: Ban },
          { id: 'duplicates', label: 'Duplicates', path: '/admin/leads/duplicates', count: leads.filter((l) => l.status === 'Duplicate').length, icon: Copy },
        ].map((tab) => {
          const isActive = activeCategory === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#0D1F3D] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D]'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table Section */}
      <div className="space-y-3">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200/80 bg-white p-3 shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company, contact person, lead ID, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Region Filter */}
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none cursor-pointer"
          >
            <option value="All">All Regions</option>
            <option value="North Mumbai">North Mumbai</option>
            <option value="Western Suburbs">Western Suburbs</option>
            <option value="Eastern Suburbs">Eastern Suburbs</option>
            <option value="Thane">Thane & Navi Mumbai</option>
            <option value="Pune">Pune</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Stage Filter */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none cursor-pointer"
          >
            <option value="All">All Lead Stages</option>
            <option value="New / Fresh">New / Fresh</option>
            <option value="Contacted">Contacted</option>
            <option value="Meeting Scheduled">Meeting Scheduled</option>
            <option value="Demo Completed">Demo Completed</option>
            <option value="Proposal Sent">Proposal Sent</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Won / Converted">Won / Converted</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Leads Data Table Container */}
        <DataTable
          columns={[
            {
              header: 'Lead / Company',
              cell: (lead) => (
                <div>
                  <button
                    onClick={() => navigate(`/admin/leads/${lead.id}`)}
                    className="font-extrabold text-[#0D1F3D] hover:text-[#E20613] hover:underline block text-left"
                  >
                    {lead.companyName}
                  </button>
                  <span className="text-[10px] font-mono text-slate-400">{lead.code} • {lead.leadSource}</span>
                </div>
              ),
            },
            {
              header: 'Contact Person',
              cell: (lead) => (
                <div>
                  <p className="font-bold text-slate-900">{lead.contactPerson}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{lead.phone}</p>
                </div>
              ),
            },
            {
              header: 'Stage & Score',
              cell: (lead) => (
                <div className="flex items-center gap-2">
                  <span className={`rounded-md px-2.5 py-0.5 text-[10px] font-extrabold border ${
                    lead.stage === 'Won / Converted' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                    lead.stage === 'Lost' ? 'bg-red-50 text-red-600 border-red-200' :
                    lead.stage === 'Negotiation' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                    lead.stage === 'Proposal Sent' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {lead.stage}
                  </span>
                  <span className="rounded-full bg-slate-900 text-white px-2 py-0.5 text-[10px] font-extrabold">
                    {lead.score} pts
                  </span>
                </div>
              ),
            },
            {
              header: 'Est. Value (₹)',
              cell: (lead) => (
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">₹{lead.estimatedValue.toLocaleString()}</p>
                  <span className="text-[10px] text-slate-400 font-medium">{lead.probabilityPct}% Prob</span>
                </div>
              ),
            },
            {
              header: 'Assigned Executive',
              cell: (lead) => (
                <div className="flex items-center gap-2">
                  <img
                    src={lead.assignedExecutiveAvatar}
                    alt={lead.assignedExecutive}
                    className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-slate-900 text-xs">{lead.assignedExecutive}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{lead.assignedLeader}</p>
                  </div>
                </div>
              ),
            },
            {
              header: 'Region & Territory',
              cell: (lead) => (
                <div>
                  <p className="font-bold text-slate-800">{lead.territory}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{lead.region}</p>
                </div>
              ),
            },
            {
              header: 'Next Follow-up',
              accessorKey: 'nextFollowUpDate',
              className: 'font-bold text-slate-700',
            },
            {
              header: 'Actions',
              align: 'right',
              cell: (lead) => (
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => navigate(`/admin/leads/${lead.id}`)}
                    title="View Lead Details"
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors border border-slate-200 shadow-xs"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === lead.id ? null : lead.id);
                      }}
                      title="Lead Actions Menu"
                      className={`p-1.5 rounded-lg transition-colors border shadow-xs ${
                        activeMenuId === lead.id
                          ? 'bg-[#0D1F3D] text-white border-[#0D1F3D]'
                          : 'text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-[#0D1F3D]'
                      }`}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {activeMenuId === lead.id && (
                      <div
                        className="absolute right-0 top-full mt-1 z-50 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xl space-y-1 text-left animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => { setActiveMenuId(null); navigate(`/admin/leads/${lead.id}`); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-[#0D1F3D] hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                          <span>View Full Details</span>
                        </button>

                        <button
                          onClick={() => { setActiveMenuId(null); navigate(`/admin/leads/${lead.id}/edit`); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Edit className="h-4 w-4 text-emerald-600" />
                          <span>Edit Lead Info</span>
                        </button>

                        <button
                          onClick={() => { setActiveMenuId(null); navigate(`/admin/leads/${lead.id}/assignment`); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <UserCheck className="h-4 w-4 text-purple-600" />
                          <span>Assign / Reassign Lead</span>
                        </button>

                        <button
                          onClick={() => { setActiveMenuId(null); navigate(`/admin/leads/${lead.id}/timeline`); }}
                          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span>View Activity Timeline</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
          ]}
          data={filteredLeads}
          keyExtractor={(l) => l.id}
          selectable
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelectOne={handleSelectOne}
          pagination={{
            currentPage: 1,
            totalPages: 1,
            totalEntries: filteredLeads.length,
            pageSize: 10,
            onPageChange: () => {},
          }}
          emptyMessage="No Leads Found"
        />
      </div>
    </div>
  );
}
