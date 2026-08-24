import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Sparkles,
  Facebook,
  Search,
  MessageSquare,
  Globe,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  TrendingUp,
  Users,
  BarChart3,
  Calendar,
  Eye,
  UserCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { mockLiveActivitiesList } from './leadSourcesData';

const LEADS_BY_SOURCE_DONUT = [
  { name: 'Meta Lead Ads', value: 1248, pct: '47.7%', color: '#2563EB' },
  { name: 'Google Ads', value: 723, pct: '27.6%', color: '#10B981' },
  { name: 'WhatsApp', value: 432, pct: '16.5%', color: '#8B5CF6' },
  { name: 'Website', value: 215, pct: '8.2%', color: '#F59E0B' },
];

export default function LiveLeadActivityPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Assigned' | 'Duplicate' | 'Failed' | 'Unassigned'>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredActivities = mockLiveActivitiesList.filter((item) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Unassigned') return item.assignedToName === 'Unassigned';
    return item.status === activeTab;
  });

  const allSelected = filteredActivities.length > 0 && filteredActivities.every((item) => selectedIds.includes(item.id));

  const getSourceIcon = (platform: string) => {
    switch (platform) {
      case 'Meta':
        return <Facebook className="h-3.5 w-3.5 text-blue-600 shrink-0" />;
      case 'Google':
        return <Search className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
      case 'WhatsApp':
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0" />;
      case 'Website':
        return <Globe className="h-3.5 w-3.5 text-purple-600 shrink-0" />;
      default:
        return <Globe className="h-3.5 w-3.5 text-slate-500 shrink-0" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'New':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-black px-2.5 py-0.5 rounded-xs">New</span>;
      case 'Assigned':
        return <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2.5 py-0.5 rounded-xs">Assigned</span>;
      case 'Duplicate':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-xs">Duplicate</span>;
      case 'Failed':
        return <span className="bg-red-100 text-red-800 text-[10px] font-black px-2.5 py-0.5 rounded-xs">Failed</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-black px-2.5 py-0.5 rounded-xs">{status}</span>;
    }
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
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/leads/automation')}>
            Lead Automation
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Live Lead Activity</span>
          <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs ml-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Automation Activity</h1>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Real-time view of leads captured from all sources and their current status.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <DateRangePicker />

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Activity filters opened')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Filter className="h-3.5 w-3.5" /> Filters
            </Button>
          </div>
        </div>
      </div>

      {/* TOP 6 METRIC CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Captured</span>
            <div className="h-7 w-7 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <span className="text-xl font-extrabold text-[#0D1F3D] block">2,618</span>
          <span className="text-xs font-semibold text-emerald-600 block">↑ 24.6% vs last 7 days</span>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">New Leads</span>
            <div className="h-7 w-7 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <span className="text-xl font-extrabold text-[#0D1F3D]">2,306</span>
          <span className="text-xs font-semibold text-emerald-600 block">↑ 22.1% vs last 7 days</span>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Assigned Leads</span>
            <div className="h-7 w-7 rounded-sm bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <span className="text-xl font-extrabold text-[#0D1F3D]">2,148</span>
          <span className="text-xs font-semibold text-emerald-600 block">↑ 25.3% vs last 7 days</span>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Duplicate Leads</span>
            <div className="h-7 w-7 rounded-sm bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <span className="text-xl font-extrabold text-[#0D1F3D]">216</span>
          <span className="text-xs font-semibold text-emerald-600 block">↓ 8.3% vs last 7 days</span>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Failed Leads</span>
            <div className="h-7 w-7 rounded-sm bg-rose-50 text-rose-600 flex items-center justify-center">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <span className="text-xl font-extrabold text-[#0D1F3D]">48</span>
          <span className="text-xs font-semibold text-emerald-600 block">↓ 14.6% vs last 7 days</span>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Response Rate</span>
            <div className="h-7 w-7 rounded-sm bg-teal-50 text-teal-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <span className="text-xl font-extrabold text-teal-600">68%</span>
          <span className="text-xs font-semibold text-emerald-600 block">↑ 10.2% vs last 7 days</span>
        </div>
      </div>

      {/* SYSTEM STANDARD SUB-TABS NAVIGATION BAR */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-2 pt-1.5 rounded-sm shadow-xs overflow-x-auto custom-scrollbar">
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'All', label: 'All Leads', count: '2,618' },
              { id: 'New', label: 'New', count: '2,306' },
              { id: 'Assigned', label: 'Assigned', count: '2,148' },
              { id: 'Duplicate', label: 'Duplicate', count: '216' },
              { id: 'Failed', label: 'Failed', count: '48' },
              { id: 'Unassigned', label: 'Unassigned', count: '104' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-slate-50/80 rounded-t-sm'
                    : 'border-transparent text-slate-500 hover:text-[#0D1F3D] hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 py-1.5 pr-2">
          <select className="rounded-sm border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-[#0D1F3D]">
            <option value="Newest First">Newest First ∨</option>
            <option value="Oldest First">Oldest First ∨</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting activity log...')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* 100% FULL-WIDTH DATATABLE */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-extrabold text-[#0D1F3D]">
                <th className="py-3 px-3 text-center w-10">
                  <Checkbox
                    checked={allSelected}
                    onChange={(checked) => {
                      if (checked) setSelectedIds(filteredActivities.map((a) => a.id));
                      else setSelectedIds([]);
                    }}
                  />
                </th>
                <th className="py-3 px-3">Lead Details</th>
                <th className="py-3 px-3">Source</th>
                <th className="py-3 px-3">Campaign / Form</th>
                <th className="py-3 px-3">Time Captured</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Assigned To</th>
                <th className="py-3 px-3">SLA Timer</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActivities.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 text-center">
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onChange={(checked) => {
                        if (checked) setSelectedIds([...selectedIds, item.id]);
                        else setSelectedIds(selectedIds.filter((i) => i !== item.id));
                      }}
                    />
                  </td>
                  {/* Lead Name (Clickable link) */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-full bg-slate-100 text-[#0D1F3D] font-extrabold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                        {item.leadName.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <span
                          onClick={() => navigate('/admin/businesses')}
                          className="font-extrabold text-[#0D1F3D] block text-xs hover:text-indigo-600 hover:underline cursor-pointer"
                        >
                          {item.leadName}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.phone}</span>
                      </div>
                    </div>
                  </td>
                  {/* Source Channel */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-sm border border-slate-200/80 inline-flex">
                      {getSourceIcon(item.platform)}
                      <span className="font-extrabold text-slate-800 text-[11px]">{item.sourceName}</span>
                    </div>
                  </td>
                  {/* Campaign / Form */}
                  <td className="py-3 px-3 text-slate-700 font-semibold text-[11px]">
                    {item.campaignOrForm}
                  </td>
                  {/* Time Captured */}
                  <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">
                    {item.timeCaptured}
                  </td>
                  {/* Status Badge */}
                  <td className="py-3 px-3 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                  {/* Assigned To Executive (Clickable Link with Avatar) */}
                  <td className="py-3 px-3">
                    {item.assignedToName === 'Unassigned' ? (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-xs text-[11px]">
                        Unassigned (Queue)
                      </span>
                    ) : item.assignedToName?.startsWith('Merged') ? (
                      <div>
                        <span className="font-bold text-slate-700 block text-[11px]">{item.assignedToName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.assignedToTeam}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <img
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                          alt="Executive"
                          className="h-6 w-6 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div>
                          <span
                            onClick={() => navigate('/admin/executives/FE-1001')}
                            className="font-extrabold text-[#0D1F3D] block text-[11px] hover:text-indigo-600 hover:underline cursor-pointer"
                          >
                            {item.assignedToName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">{item.assignedToTeam}</span>
                        </div>
                      </div>
                    )}
                  </td>
                  {/* SLA Timer */}
                  <td className="py-3 px-3 font-mono font-bold text-indigo-700 text-[11px]">
                    {item.slaTime}
                  </td>
                  {/* Interactive Row Actions Menu */}
                  <td className="py-3 px-3 text-center">
                    <RowActionsMenu
                      items={[
                        {
                          label: 'View Lead Details',
                          icon: Eye,
                          onClick: () => {
                            toast.info(`Viewing details for ${item.leadName}`);
                            navigate('/admin/businesses');
                          },
                        },
                        {
                          label: 'Re-assign Executive',
                          icon: UserCheck,
                          onClick: () => toast.success(`Re-assigned lead ${item.leadName}`),
                        },
                        {
                          label: 'View Source Details',
                          icon: ExternalLink,
                          onClick: () => navigate('/admin/leads/sources/src-101'),
                        },
                        {
                          label: 'Delete Log',
                          icon: Trash2,
                          danger: true,
                          divider: true,
                          onClick: () => toast.info('Activity log deleted'),
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

      {/* BOTTOM ROW ANALYTICS CARDS (100% WIDTH BELOW TABLE) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* Leads by Source Donut Chart */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Leads by Source
          </h3>

          <div className="flex items-center justify-between">
            <div className="h-36 w-36 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={LEADS_BY_SOURCE_DONUT}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {LEADS_BY_SOURCE_DONUT.map((entry, index) => (
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
                <span className="text-xs font-black text-[#0D1F3D]">2,618</span>
                <span className="text-[9px] font-medium text-slate-400">Total</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] flex-1 pl-2">
              {LEADS_BY_SOURCE_DONUT.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Recent Activity</h3>
            <button onClick={() => toast.info('All logs opened')} className="text-[11px] font-bold text-indigo-600 hover:underline">
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start justify-between text-[11px]">
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-sm bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Facebook className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block">New lead captured from Meta Lead Ads</span>
                  <span className="text-[10px] text-slate-500">Rahul Verma | 98765 43210</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">10:24 AM</span>
            </div>

            <div className="flex items-start justify-between text-[11px]">
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-sm bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block">Lead assigned to Amit Verma</span>
                  <span className="text-[10px] text-slate-500">Website Enquiry Form</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">10:24 AM</span>
            </div>

            <div className="flex items-start justify-between text-[11px]">
              <div className="flex items-start gap-2">
                <div className="h-6 w-6 rounded-sm bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Search className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block">New lead captured from Google Ads</span>
                  <span className="text-[10px] text-slate-500">Neha Patel | 96548 76543</span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">10:18 AM</span>
            </div>
          </div>
        </div>

        {/* SLA Performance Card */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">SLA Performance (All Teams)</h3>
            <button onClick={() => navigate('/admin/performance')} className="text-[11px] font-bold text-indigo-600 hover:underline">
              View Report
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                <span>Within SLA</span>
                <span className="text-emerald-600">68%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[68%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                <span>Breached SLA</span>
                <span className="text-rose-600">32%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full w-[32%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
