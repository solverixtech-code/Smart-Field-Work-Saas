import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Globe,
  Users,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  Download,
  Calendar,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  Filter,
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Edit,
  Power,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { mockLeadSourcesList } from './leadSourcesData';

const leadsOverTimeData = [
  { day: '01 May', leads: 24 },
  { day: '04 May', leads: 48 },
  { day: '08 May', leads: 56 },
  { day: '12 May', leads: 44 },
  { day: '16 May', leads: 58 },
  { day: '20 May', leads: 52 },
  { day: '24 May', leads: 68 },
  { day: '28 May', leads: 74 },
  { day: '31 May', leads: 88 },
];

const leadsVsConversionsDaily = [
  { day: '01 May', leads: 48, conversions: 12 },
  { day: '05 May', leads: 56, conversions: 14 },
  { day: '09 May', leads: 62, conversions: 18 },
  { day: '13 May', leads: 54, conversions: 13 },
  { day: '17 May', leads: 70, conversions: 20 },
  { day: '21 May', leads: 76, conversions: 22 },
  { day: '25 May', leads: 82, conversions: 25 },
  { day: '29 May', leads: 90, conversions: 28 },
];

const campaignsPerformanceData = [
  { name: 'Organic Traffic', leads: 1256, converted: 298, cr: '23.7%', revenue: '₹ 5,45,000', roi: '402%' },
  { name: 'Google Ads - Search', leads: 856, converted: 186, cr: '21.7%', revenue: '₹ 2,85,000', roi: '333%' },
  { name: 'Google Ads - Display', leads: 248, converted: 38, cr: '15.3%', revenue: '₹ 65,000', roi: '262%' },
  { name: 'Facebook Ads', leads: 132, converted: 20, cr: '15.2%', revenue: '₹ 35,000', roi: '198%' },
  { name: 'Email Campaign', leads: 50, converted: 0, cr: '0%', revenue: '₹ 0', roi: '0%' },
];

const topLandingPagesData = [
  { page: '/crm-software', leads: 482, converted: 118, cr: '24.5%' },
  { page: '/ai-automation', leads: 371, converted: 92, cr: '24.8%' },
  { page: '/digital-marketing', leads: 286, converted: 61, cr: '21.3%' },
  { page: '/pricing', leads: 195, converted: 38, cr: '19.5%' },
  { page: '/thank-you', leads: 82, converted: 17, cr: '20.7%' },
];

const deviceBreakdownData = [
  { name: 'Mobile', value: 1684, pct: '66.2%', color: '#8B5CF6' },
  { name: 'Desktop', value: 742, pct: '29.2%', color: '#10B981' },
  { name: 'Tablet', value: 116, pct: '4.6%', color: '#F59E0B' },
];

export default function LeadSourceDetailsPage() {
  const { sourceId } = useParams<{ sourceId: string }>();
  const navigate = useNavigate();

  const source = mockLeadSourcesList.find((s) => s.id === sourceId) || mockLeadSourcesList[0];

  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Lead Analysis' | 'Conversion Analysis' | 'Revenue Analysis' | 'Campaigns' | 'Geography' | 'Devices' | 'Trend Analysis' | 'Activities' | 'UTM Analysis'
  >('Overview');

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/leads/sources')}>
            Lead Sources
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">{source.name}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#0D1F3D]">{source.name}</h1>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5">
                  {source.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Source Type: <strong>{source.sourceType}</strong> • Code: <strong className="font-mono">{source.code}</strong> • Channel: <strong>{source.channel}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DateRangePicker />

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`Exporting ${source.name} Report...`)}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* TOP 6 KPI CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Leads</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{source.totalLeads.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 18.4% vs. Apr 2025</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Converted Leads</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{source.convertedLeads.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 21.3% vs. Apr 2025</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{source.conversionRate}%</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 2.9% vs. Apr 2025</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Revenue</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ {source.revenue.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 19.7% vs. Apr 2025</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-rose-50 text-rose-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Cost (This Period)</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ {source.cost.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 8.6% vs Apr 2025</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-teal-50 text-teal-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">ROI</span>
            <span className="text-xl font-extrabold text-teal-600">358%</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 10.2% vs. Apr 2025</span>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 pt-1.5 rounded-sm shadow-xs overflow-x-auto custom-scrollbar">
        {(
          [
            'Overview',
            'Lead Analysis',
            'Conversion Analysis',
            'Revenue Analysis',
            'Campaigns',
            'Geography',
            'Devices',
            'Trend Analysis',
            'Activities',
            'UTM Analysis',
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-700 bg-slate-50/80 rounded-t-sm'
                  : 'border-transparent text-slate-500 hover:text-[#0D1F3D] hover:border-slate-300'
              }`}
            >
              <span>{tab}</span>
            </button>
          );
        })}
      </div>

      {/* TOP ROW CHARTS & FUNNEL (3 WIDGETS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Leads Over Time Line Chart (4 Cols) */}
        <div className="lg:col-span-4 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Leads Over Time</h3>
            <select className="rounded-sm border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-[#0D1F3D]">
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={leadsOverTimeData}>
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
                <Line type="monotone" dataKey="leads" name="Leads" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] font-bold border-t border-slate-100 pt-2 text-purple-700">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-purple-600" /> Inbound Leads Trend
            </span>
          </div>
        </div>

        {/* Leads vs Conversions Bar Chart (4 Cols) */}
        <div className="lg:col-span-4 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Leads vs Conversions</h3>
            <select className="rounded-sm border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-[#0D1F3D]">
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadsVsConversionsDaily}>
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
                <Bar dataKey="leads" name="Leads" fill="#2563EB" radius={[2, 2, 0, 0]} />
                <Bar dataKey="conversions" name="Conversions" fill="#10B981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] font-bold border-t border-slate-100 pt-2">
            <span className="flex items-center gap-1 text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-600" /> Leads
            </span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Conversions
            </span>
          </div>
        </div>

        {/* Conversion Funnel Card (4 Cols) */}
        <div className="lg:col-span-4 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Conversion Funnel
            </h3>

            <div className="space-y-2 pt-2">
              <div className="bg-indigo-600 text-white p-2 rounded-sm flex items-center justify-between shadow-xs">
                <span className="font-extrabold text-xs">Total Leads</span>
                <span className="font-mono text-xs font-black">2,542 (100%)</span>
              </div>

              <div className="bg-blue-600 text-white p-2 rounded-sm flex items-center justify-between mx-3 shadow-xs">
                <span className="font-extrabold text-xs">Contacted Leads</span>
                <span className="font-mono text-xs font-black">2,031 (79.9%)</span>
              </div>

              <div className="bg-emerald-600 text-white p-2 rounded-sm flex items-center justify-between mx-6 shadow-xs">
                <span className="font-extrabold text-xs">Interested Leads</span>
                <span className="font-mono text-xs font-black">1,125 (44.3%)</span>
              </div>

              <div className="bg-amber-500 text-white p-2 rounded-sm flex items-center justify-between mx-9 shadow-xs">
                <span className="font-extrabold text-xs">Demos Conducted</span>
                <span className="font-mono text-xs font-black">678 (26.7%)</span>
              </div>

              <div className="bg-rose-600 text-white p-2 rounded-sm flex items-center justify-between mx-12 shadow-xs">
                <span className="font-extrabold text-xs">Converted Leads</span>
                <span className="font-mono text-xs font-black">542 (21.3%)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-2 rounded-sm">
            <span className="text-slate-600 font-bold text-xs">Overall Conversion Rate</span>
            <span className="text-sm font-extrabold text-emerald-600">21.3%</span>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW TABLES & BREAKDOWNS (4 WIDGETS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Performance by Campaign Table (4 Cols) */}
        <div className="lg:col-span-4 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Performance by Campaign</h3>
            <button onClick={() => toast.info('View all campaigns')} className="text-[11px] font-bold text-indigo-600 hover:underline">
              View all campaigns →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/70">
                  <th className="py-2 px-2">Campaign Name</th>
                  <th className="py-2 px-2 text-right">Total Leads</th>
                  <th className="py-2 px-2 text-right">Converted</th>
                  <th className="py-2 px-2 text-right">CR (%)</th>
                  <th className="py-2 px-2 text-right">Revenue</th>
                  <th className="py-2 px-2 text-right">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaignsPerformanceData.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/70">
                    <td className="py-2 px-2 font-extrabold text-[#0D1F3D]">{row.name}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-slate-700">{row.leads}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-slate-700">{row.converted}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700">{row.cr}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-[#0D1F3D]">{row.revenue}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-teal-600">{row.roi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Pages Table (3 Cols) */}
        <div className="lg:col-span-3 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Top Performing Pages</h3>
            <button onClick={() => toast.info('View all pages')} className="text-[11px] font-bold text-indigo-600 hover:underline">
              View all pages →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/70">
                  <th className="py-2 px-2">Landing Page</th>
                  <th className="py-2 px-2 text-right">Leads</th>
                  <th className="py-2 px-2 text-right">Converted</th>
                  <th className="py-2 px-2 text-right">CR (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topLandingPagesData.map((row) => (
                  <tr key={row.page} className="hover:bg-slate-50/70">
                    <td className="py-2 px-2 font-mono font-bold text-indigo-700">{row.page}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-slate-700">{row.leads}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-slate-700">{row.converted}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700">{row.cr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Geographic Performance Bar List (3 Cols) */}
        <div className="lg:col-span-3 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Geographic Performance</h3>
            <button onClick={() => navigate('/admin/map/live')} className="text-[11px] font-bold text-indigo-600 hover:underline">
              View on Map
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span className="font-bold">Mumbai</span>
                <span className="font-mono font-bold text-[#0D1F3D]">856 (33.7%)</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[100%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span className="font-bold">Delhi</span>
                <span className="font-mono font-bold text-[#0D1F3D]">542 (21.3%)</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[63%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span className="font-bold">Bangalore</span>
                <span className="font-mono font-bold text-[#0D1F3D]">428 (16.8%)</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[50%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span className="font-bold">Pune</span>
                <span className="font-mono font-bold text-[#0D1F3D]">356 (14.0%)</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[41%]" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-slate-700">
                <span className="font-bold">Hyderabad</span>
                <span className="font-mono font-bold text-[#0D1F3D]">360 (14.2%)</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full w-[42%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Device Breakdown Donut Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Device Breakdown
            </h3>

            <div className="h-32 w-full relative pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceBreakdownData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {deviceBreakdownData.map((entry, index) => (
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
                <span className="text-xs font-black text-[#0D1F3D]">2,542</span>
                <span className="text-[8px] font-medium text-slate-400">Leads</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-purple-600" /> Mobile
                </span>
                <span className="font-mono font-bold">1,684 (66.2%)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Desktop
                </span>
                <span className="font-mono font-bold">742 (29.2%)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Tablet
                </span>
                <span className="font-mono font-bold">116 (4.6%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI INSIGHTS & RECOMMENDATIONS BANNER CARD */}
      <div className="rounded-sm border border-indigo-100 bg-indigo-50/70 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-[#0D1F3D]">Insights & Recommendations</h4>
            <p className="text-slate-600 font-medium mt-0.5">
              Your website source is performing exceptionally well with a conversion rate of <strong>21.3%</strong>, which is higher than the overall platform average (18.9%).
            </p>
          </div>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => toast.info('AI Recommendations modal opened')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
        >
          View Recommendations
        </Button>
      </div>
    </div>
  );
}
