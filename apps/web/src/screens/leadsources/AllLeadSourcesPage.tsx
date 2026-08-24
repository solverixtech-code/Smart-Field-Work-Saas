import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Globe,
  MessageSquare,
  Facebook,
  Search,
  Instagram,
  Users,
  Mail,
  PhoneCall,
  Calendar,
  MoreHorizontal,
  Plus,
  Download,
  Upload,
  Filter,
  RefreshCw,
  TrendingUp,
  Target,
  DollarSign,
  PieChart as PieChartIcon,
  CheckCircle2,
  XCircle,
  BarChart3,
  Edit,
  Power,
  Trash2,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { mockLeadSourcesList, LeadSourceItem } from './leadSourcesData';

const SOURCE_TYPE_DONUT = [
  { name: 'Website', value: 3412, pct: '27.4%', color: '#8B5CF6' },
  { name: 'WhatsApp', value: 3050, pct: '24.5%', color: '#10B981' },
  { name: 'Facebook', value: 2256, pct: '18.1%', color: '#2563EB' },
  { name: 'Google Ads', value: 1684, pct: '13.5%', color: '#F59E0B' },
  { name: 'Others', value: 2056, pct: '16.5%', color: '#64748B' },
];

export default function AllLeadSourcesPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getSourceIcon = (iconName: string, sourceType: string) => {
    switch (sourceType) {
      case 'Website':
        return <Globe className="h-4 w-4 text-purple-600" />;
      case 'WhatsApp':
        return <MessageSquare className="h-4 w-4 text-emerald-600" />;
      case 'Facebook':
        return <Facebook className="h-4 w-4 text-blue-600" />;
      case 'Google Ads':
        return <Search className="h-4 w-4 text-amber-500" />;
      case 'Instagram':
        return <Instagram className="h-4 w-4 text-pink-600" />;
      case 'Referral':
        return <Users className="h-4 w-4 text-indigo-600" />;
      case 'Email':
        return <Mail className="h-4 w-4 text-teal-600" />;
      case 'Telecalling':
        return <PhoneCall className="h-4 w-4 text-rose-500" />;
      case 'Offline':
        return <Calendar className="h-4 w-4 text-amber-600" />;
      default:
        return <MoreHorizontal className="h-4 w-4 text-slate-500" />;
    }
  };

  const filteredSources = mockLeadSourcesList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sourceType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesType = typeFilter === 'All' || item.sourceType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setTypeFilter('All');
    setUserFilter('All');
    toast.info('Filters reset to default');
  };

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
                Manage and analyze all lead sources from different channels
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Exporting lead sources...')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Import modal opened')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/admin/leads/sources/create')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add Lead Source
            </Button>
          </div>
        </div>
      </div>

      {/* TOP 5 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Sources</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">18</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 2 new this month</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Leads</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">12,458</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 18.4% vs. last month</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Converted Leads</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">2,358</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 21.6% vs. last month</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">18.9%</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 2.3% vs. last month</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Revenue</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 42,68,000</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 19.7% vs. last month</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search lead sources..."
              className="w-full rounded-sm border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          <div className="w-36">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
              searchable={false}
            />
          </div>

          <div className="w-40">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'Website', label: 'Website' },
                { value: 'WhatsApp', label: 'WhatsApp' },
                { value: 'Facebook', label: 'Facebook' },
                { value: 'Google Ads', label: 'Google Ads' },
                { value: 'Instagram', label: 'Instagram' },
                { value: 'Referral', label: 'Referral' },
                { value: 'Email', label: 'Email' },
                { value: 'Telecalling', label: 'Telecalling' },
                { value: 'Offline', label: 'Offline' },
              ]}
              searchable={false}
            />
          </div>

          <div className="w-36">
            <Select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Users' },
                { value: 'Rohit Sharma', label: 'Rohit Sharma' },
                { value: 'Priya Sharma', label: 'Priya Sharma' },
                { value: 'Vijay Patel', label: 'Vijay Patel' },
              ]}
              searchable={false}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Advanced filters opened')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" /> Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* MAIN LAYOUT GRID: DATATABLE (8 COLS) + SIDEBAR WIDGETS (4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: All Lead Sources Data Table (8 Cols) */}
        <div className="lg:col-span-8 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-extrabold text-[#0D1F3D]">All Lead Sources</h2>
            <span className="text-[11px] font-bold text-slate-500">
              Showing {filteredSources.length} of {mockLeadSourcesList.length} sources
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/70">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Source Name</th>
                  <th className="py-2.5 px-3">Source Type</th>
                  <th className="py-2.5 px-3 text-right">Total Leads</th>
                  <th className="py-2.5 px-3 text-right">Converted Leads</th>
                  <th className="py-2.5 px-3 text-right">Conversion Rate</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Created On</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSources.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 text-slate-400 font-mono font-bold">{index + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-sm bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                          {getSourceIcon(item.iconName, item.sourceType)}
                        </div>
                        <div>
                          <span
                            onClick={() => navigate(`/admin/leads/sources/${item.id}`)}
                            className="font-extrabold text-[#0D1F3D] hover:text-indigo-600 hover:underline cursor-pointer block"
                          >
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">({item.code})</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-bold">{item.sourceType}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#0D1F3D]">
                      {item.totalLeads.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-700">
                      {item.convertedLeads.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-emerald-600">
                      {item.conversionRate}%
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#0D1F3D]">
                      ₹ {item.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          item.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-medium">{item.createdOn}</td>
                    <td className="py-3 px-3 text-center relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                        className="text-slate-400 hover:text-slate-700 p-1 rounded-sm cursor-pointer"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {activeMenuId === item.id && (
                        <div className="absolute right-3 top-full mt-1 w-44 rounded-md border border-slate-200 bg-white p-1.5 shadow-xl z-50 text-left font-semibold text-xs space-y-0.5">
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              navigate(`/admin/leads/sources/${item.id}`);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-slate-100 text-[#0D1F3D]"
                          >
                            <BarChart3 className="h-3.5 w-3.5 text-indigo-600" /> View Performance
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              toast.info(`Editing source ${item.name}`);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-slate-100 text-[#0D1F3D]"
                          >
                            <Edit className="h-3.5 w-3.5 text-blue-600" /> Edit Source
                          </button>
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              toast.success(`Source ${item.name} status updated`);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-slate-100 text-[#0D1F3D]"
                          >
                            <Power className="h-3.5 w-3.5 text-amber-600" /> Toggle Status
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            onClick={() => {
                              setActiveMenuId(null);
                              toast.error(`Source ${item.name} deleted`);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-red-50 text-red-600"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" /> Delete Source
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Analytics Cards (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Leads by Source Type Donut Chart Card */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Leads by Source Type
            </h3>

            <div className="flex items-center justify-between">
              <div className="h-36 w-36 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SOURCE_TYPE_DONUT}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={56}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {SOURCE_TYPE_DONUT.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                  <span className="text-xs font-black text-[#0D1F3D]">12,458</span>
                  <span className="text-[9px] font-medium text-slate-400">Total Leads</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs flex-1 pl-2">
                {SOURCE_TYPE_DONUT.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold">{item.name}</span>
                    </div>
                    <span className="font-mono text-slate-500 font-bold">
                      {item.pct} ({item.value.toLocaleString('en-IN')})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Performing Sources Leaderboard Card */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Top Performing Sources</h3>
              <span className="text-[10px] font-bold text-slate-400">Conversion Rate</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">
                    1
                  </span>
                  <span className="font-bold text-[#0D1F3D]">Client Referral</span>
                </div>
                <div className="flex items-center gap-2 w-1/2 justify-end">
                  <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[100%]" />
                  </div>
                  <span className="font-mono font-extrabold text-emerald-600 text-xs">25.0%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">
                    2
                  </span>
                  <span className="font-bold text-[#0D1F3D]">Google Ads (Search)</span>
                </div>
                <div className="flex items-center gap-2 w-1/2 justify-end">
                  <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[86%]" />
                  </div>
                  <span className="font-mono font-extrabold text-emerald-600 text-xs">21.5%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">
                    3
                  </span>
                  <span className="font-bold text-[#0D1F3D]">Website (aimbeat.com)</span>
                </div>
                <div className="flex items-center gap-2 w-1/2 justify-end">
                  <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                  </div>
                  <span className="font-mono font-extrabold text-emerald-600 text-xs">21.3%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">
                    4
                  </span>
                  <span className="font-bold text-[#0D1F3D]">WhatsApp Campaign</span>
                </div>
                <div className="flex items-center gap-2 w-1/2 justify-end">
                  <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[84%]" />
                  </div>
                  <span className="font-mono font-extrabold text-emerald-600 text-xs">21.2%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">
                    5
                  </span>
                  <span className="font-bold text-[#0D1F3D]">Events & Exhibitions</span>
                </div>
                <div className="flex items-center gap-2 w-1/2 justify-end">
                  <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[73%]" />
                  </div>
                  <span className="font-mono font-extrabold text-emerald-600 text-xs">18.4%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Sources by Status Summary Cards */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Lead Sources by Status
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50/70 p-3 rounded-sm border border-emerald-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-emerald-800">Active Sources</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <span className="text-lg font-black text-emerald-900 block">16</span>
                <span className="text-[10px] text-emerald-700 font-medium block">88.9% of total</span>
              </div>

              <div className="bg-amber-50/70 p-3 rounded-sm border border-amber-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-amber-800">Inactive Sources</span>
                  <XCircle className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-lg font-black text-amber-900 block">2</span>
                <span className="text-[10px] text-amber-700 font-medium block">11.1% of total</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-500 font-medium">
              Track performance of all your lead sources and focus on the channels that bring the best results.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
