import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Target,
  Plus,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  Globe,
  MessageSquare,
  Facebook,
  Instagram,
  Users,
  Mail,
  PhoneCall,
  Calendar,
  MoreHorizontal,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  DollarSign,
  Share2,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { mockLeadSourcesList, LeadSourceItem } from './leadSourcesData';

const DONUT_COLORS = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#6366F1'];

export default function AllLeadSourcesPage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter logic
  const filteredSources = mockLeadSourcesList.filter((source) => {
    const matchesSearch =
      source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.channel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || source.status === statusFilter;
    const matchesType = typeFilter === 'All' || source.sourceType === typeFilter;
    const matchesUser = userFilter === 'All' || source.defaultOwner === userFilter;
    return matchesSearch && matchesStatus && matchesType && matchesUser;
  });

  const allSelected = filteredSources.length > 0 && filteredSources.every((s) => selectedIds.includes(s.id));

  const getSourceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe':
        return <Globe className="h-4 w-4 text-purple-600 shrink-0" />;
      case 'MessageSquare':
        return <MessageSquare className="h-4 w-4 text-emerald-600 shrink-0" />;
      case 'Facebook':
        return <Facebook className="h-4 w-4 text-blue-600 shrink-0" />;
      case 'Search':
        return <Search className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'Instagram':
        return <Instagram className="h-4 w-4 text-pink-600 shrink-0" />;
      case 'Users':
        return <Users className="h-4 w-4 text-indigo-600 shrink-0" />;
      case 'Mail':
        return <Mail className="h-4 w-4 text-sky-600 shrink-0" />;
      case 'PhoneCall':
        return <PhoneCall className="h-4 w-4 text-teal-600 shrink-0" />;
      case 'Calendar':
        return <Calendar className="h-4 w-4 text-amber-600 shrink-0" />;
      default:
        return <MoreHorizontal className="h-4 w-4 text-slate-500 shrink-0" />;
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTypeFilter('All');
    setUserFilter('All');
    toast.info('Filters reset to default');
  };

  // Donut chart data for bottom analytics
  const donutData = [
    { name: 'Website', value: 2542 },
    { name: 'WhatsApp', value: 2156 },
    { name: 'Facebook Ads', value: 1845 },
    { name: 'Google Ads', value: 1684 },
    { name: 'Instagram Ads', value: 1256 },
    { name: 'Other', value: 2975 },
  ];

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Lead Sources</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Lead Sources</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Track, manage and optimize lead generation sources across all online and offline channels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/leads/integrations')}
              className="bg-white text-[#0D1F3D] border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Share2 className="h-4 w-4 text-indigo-600" /> Platform Integrations
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/admin/leads/sources/create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add Lead Source
            </Button>
          </div>
        </div>
      </div>

      {/* 5 HEADER KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Sources</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">18</span>
            <span className="text-xs font-semibold text-emerald-600 block">16 Active</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Leads</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">12,458</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 18.4% vs last mo</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Converted Leads</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">2,358</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 14.2% vs last mo</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">18.9%</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 2.1% vs last mo</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-teal-50 text-teal-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Revenue</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 42,68,000</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 19.7% vs last mo</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="rounded-sm border border-slate-200 bg-white p-3 shadow-xs space-y-2">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search source name, code, channel..."
              className="w-full rounded-sm border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-bold text-[#0D1F3D] placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active Only' },
              { value: 'Inactive', label: 'Inactive Only' },
            ]}
            searchable={true}
          />

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Source Types' },
              { value: 'Website', label: 'Website' },
              { value: 'WhatsApp', label: 'WhatsApp' },
              { value: 'Facebook', label: 'Facebook' },
              { value: 'Google Ads', label: 'Google Ads' },
              { value: 'Instagram', label: 'Instagram' },
              { value: 'Referral', label: 'Referral' },
              { value: 'Email', label: 'Email' },
              { value: 'Telecalling', label: 'Telecalling' },
              { value: 'Offline', label: 'Offline / Event' },
              { value: 'Other', label: 'Other' },
            ]}
            searchable={true}
          />

          <Select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Assignees' },
              { value: 'Rohit Sharma', label: 'Rohit Sharma', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', sublabel: 'Sales Manager' },
              { value: 'Priya Sharma', label: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', sublabel: 'Team Leader' },
              { value: 'Vijay Patel', label: 'Vijay Patel', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', sublabel: 'Senior Executive' },
              { value: 'Mumbai Sales Team', label: 'Mumbai Sales Team', sublabel: 'Team Queue' },
            ]}
            searchable={true}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset Filters
          </Button>
        </div>
      </div>

      {/* 100% FULL-WIDTH DATATABLE */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-extrabold text-[#0D1F3D]">
            Lead Sources ({filteredSources.length})
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting lead sources list...')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-extrabold text-[#0D1F3D]">
                <th className="py-3 px-3 text-center w-10">
                  <Checkbox
                    checked={allSelected}
                    onChange={(checked) => {
                      if (checked) setSelectedIds(filteredSources.map((s) => s.id));
                      else setSelectedIds([]);
                    }}
                  />
                </th>
                <th className="py-3 px-3">Lead Source</th>
                <th className="py-3 px-3 font-mono">Code</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3 text-right">Total Leads</th>
                <th className="py-3 px-3 text-right">Converted</th>
                <th className="py-3 px-3 text-right">CR %</th>
                <th className="py-3 px-3 text-right">Revenue</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSources.map((source) => (
                <tr key={source.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-center">
                    <Checkbox
                      checked={selectedIds.includes(source.id)}
                      onChange={(checked) => {
                        if (checked) setSelectedIds([...selectedIds, source.id]);
                        else setSelectedIds(selectedIds.filter((i) => i !== source.id));
                      }}
                    />
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                        {getSourceIcon(source.iconName)}
                      </div>
                      <div>
                        <span
                          onClick={() => navigate(`/admin/leads/sources/${source.id}`)}
                          className="font-extrabold text-[#0D1F3D] block text-xs hover:text-indigo-600 hover:underline cursor-pointer"
                        >
                          {source.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">{source.description || 'Lead source'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800 text-[11px]">
                    {source.code}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-semibold text-[11px]">
                    {source.sourceType}
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium text-[11px]">
                    {source.channel}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-[#0D1F3D]">
                    {source.totalLeads.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                    {source.convertedLeads.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-indigo-700">
                    {source.conversionRate}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-[#0D1F3D]">
                    ₹ {source.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        source.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {source.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <RowActionsMenu
                      items={[
                        {
                          label: 'View Source Performance',
                          icon: Eye,
                          onClick: () => navigate(`/admin/leads/sources/${source.id}`),
                        },
                        {
                          label: 'Edit Source Settings',
                          icon: Edit,
                          onClick: () => toast.info(`Editing ${source.name}`),
                        },
                        {
                          label: 'Deactivate Source',
                          icon: Trash2,
                          danger: true,
                          divider: true,
                          onClick: () => toast.info(`Source ${source.name} deactivated`),
                        },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM ROW ANALYTICS CARDS (100% WIDTH BELOW DATATABLE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Donut Chart: Leads by Source Type */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Leads by Source Type
          </h3>

          <div className="flex items-center justify-between">
            <div className="h-36 w-36 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1F3D',
                      borderRadius: '4px',
                      color: '#FFF',
                      fontSize: '10px',
                      fontWeight: 'bold',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-black text-[#0D1F3D]">12.4K</span>
                <span className="text-[9px] font-medium text-slate-400">Total</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] flex-1 pl-2">
              {donutData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performing Sources Leaderboard */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Top Performing Sources</h3>
            <span className="text-[10px] text-slate-400 font-medium">By Conversion Rate</span>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="font-extrabold text-[#0D1F3D]">Client Referral</span>
              </div>
              <span className="font-mono font-extrabold text-emerald-600">25.0% CR</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-amber-500" />
                <span className="font-extrabold text-[#0D1F3D]">Google Ads Search</span>
              </div>
              <span className="font-mono font-extrabold text-emerald-600">21.5% CR</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="font-extrabold text-[#0D1F3D]">Website aimbeat.com</span>
              </div>
              <span className="font-mono font-extrabold text-emerald-600">21.3% CR</span>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Lead Sources Breakdown</h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              16 Active
            </span>
          </div>

          <div className="space-y-2 text-slate-700">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="font-medium">Organic Sources</span>
              <span className="font-extrabold text-[#0D1F3D]">6 Sources (4,408 Leads)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="font-medium">Paid Ad Campaigns</span>
              <span className="font-extrabold text-[#0D1F3D]">7 Sources (6,285 Leads)</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="font-medium">Referral & Offline</span>
              <span className="font-extrabold text-[#0D1F3D]">3 Sources (1,765 Leads)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
