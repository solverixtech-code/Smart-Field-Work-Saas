import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Target,
  Download,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  Filter,
  BarChart3,
  RefreshCw,
  Award,
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
  Legend,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { mockCategoriesList } from '../categories/categoriesData';

const salesDailyData = [
  { day: '01 May', current: 150000, previous: 120000 },
  { day: '04 May', current: 180000, previous: 140000 },
  { day: '08 May', current: 220000, previous: 170000 },
  { day: '12 May', current: 270000, previous: 210000 },
  { day: '16 May', current: 310000, previous: 250000 },
  { day: '20 May', current: 350000, previous: 290000 },
  { day: '24 May', current: 380000, previous: 320000 },
  { day: '28 May', current: 410000, previous: 340000 },
  { day: '31 May', current: 426000, previous: 360000 },
];

const leadsVsConversionsData = [
  { day: '01 May', leads: 420, conversions: 38 },
  { day: '05 May', leads: 480, conversions: 44 },
  { day: '09 May', leads: 520, conversions: 49 },
  { day: '13 May', leads: 490, conversions: 42 },
  { day: '17 May', leads: 580, conversions: 54 },
  { day: '21 May', leads: 610, conversions: 58 },
  { day: '25 May', leads: 650, conversions: 62 },
  { day: '29 May', leads: 710, conversions: 68 },
];

const regionalPerformanceData = [
  { region: 'Mumbai', businesses: 412, sales: 112500, leads: 3245, conversions: 312, cr: '9.6%', growth: '+21.2%' },
  { region: 'Pune', businesses: 286, sales: 68400, leads: 1892, conversions: 174, cr: '9.2%', growth: '+17.8%' },
  { region: 'Delhi', businesses: 255, sales: 56200, leads: 1564, conversions: 148, cr: '9.5%', growth: '+14.6%' },
  { region: 'Bangalore', businesses: 198, sales: 45300, leads: 1246, conversions: 112, cr: '9.0%', growth: '+16.1%' },
  { region: 'Hyderabad', businesses: 182, sales: 38900, leads: 1102, conversions: 98, cr: '8.9%', growth: '+12.4%' },
  { region: 'Ahmedabad', businesses: 153, sales: 28700, leads: 862, conversions: 68, cr: '7.9%', growth: '+10.3%' },
  { region: 'Kolkata', businesses: 128, sales: 21800, leads: 655, conversions: 47, cr: '7.2%', growth: '+8.6%' },
];

const topExecutivesData = [
  { rank: 1, name: 'Rohit Sharma', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', sales: 58600, leads: 1854, conversions: 156, cr: '8.4%' },
  { rank: 2, name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', sales: 47200, leads: 1482, conversions: 138, cr: '9.3%' },
  { rank: 3, name: 'Vijay Patel', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', sales: 36850, leads: 1236, conversions: 112, cr: '9.1%' },
  { rank: 4, name: 'Suresh Patel', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', sales: 31900, leads: 1028, conversions: 96, cr: '9.3%' },
  { rank: 5, name: 'Neha Verma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', sales: 28450, leads: 942, conversions: 88, cr: '9.3%' },
];

export function CategoryPerformancePage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const category = mockCategoriesList.find((c) => c.id === categoryId) || mockCategoriesList[0];

  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Sales Analysis' | 'Lead Analysis' | 'Conversion Analysis' | 'Trend Analysis' | 'Executive Performance' | 'Regional Performance' | 'Time Comparison'
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
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/categories')}>
            Categories
          </span>
          <span>/</span>
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate(`/admin/categories/${category.id}`)}>
            {category.name}
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Category Performance</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Category Performance</h1>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5">
                  {category.status}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Track and analyze performance metrics for {category.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DateRangePicker />

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Exporting Category Performance Report...')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* TOP 6 KPI CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {/* Card 1: Category Badge */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-extrabold text-[#0D1F3D] block truncate max-w-[110px]">{category.name}</span>
            <span className="text-xs font-mono font-bold text-slate-500 block">Code: {category.code}</span>
            <span className="text-[10px] font-medium text-slate-400 block">{category.businessesCount.toLocaleString('en-IN')} Businesses</span>
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Sales (₹)</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 4,26,000</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 18.4% vs. Apr 2025</span>
          </div>
        </div>

        {/* Card 3: Total Leads */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Leads</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">12,458</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 16.2% vs. Apr 2025</span>
          </div>
        </div>

        {/* Card 4: Conversion Rate */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">9.2%</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 1.4 pp vs Apr 2025</span>
          </div>
        </div>

        {/* Card 5: Avg. Deal Value */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-rose-50 text-rose-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Avg. Deal Value (₹)</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 3,708</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 2.1% vs. Apr 2025</span>
          </div>
        </div>

        {/* Card 6: Active Executives */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-teal-50 text-teal-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Executives</span>
            <span className="text-xl font-extrabold text-teal-600">326</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 11.8% vs Apr 2025</span>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 pt-1.5 rounded-sm shadow-xs overflow-x-auto custom-scrollbar">
        {(
          [
            'Overview',
            'Sales Analysis',
            'Lead Analysis',
            'Conversion Analysis',
            'Trend Analysis',
            'Executive Performance',
            'Regional Performance',
            'Time Comparison',
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

      {/* TOP ROW CHARTS & FUNNEL (2 ROW LAYOUT FOR PROPER SPACING & VISIBILITY) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sales Trend (₹) Line Chart (7 Cols) */}
        <div className="lg:col-span-7 rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Sales Trend (₹)</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Revenue growth comparison vs previous period</p>
            </div>
            <select className="rounded-sm border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-[#0D1F3D] shadow-2xs">
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesDailyData} margin={{ top: 10, right: 20, left: 25, bottom: 5 }}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} dy={5} />
                <YAxis
                  stroke="#64748B"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹ ${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                  contentStyle={{
                    backgroundColor: '#0D1F3D',
                    borderRadius: '6px',
                    color: '#FFF',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  name="This Period"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#FFF' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  name="Last Period"
                  stroke="#CBD5E1"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-bold border-t border-slate-100 pt-3">
            <span className="flex items-center gap-2 text-[#0D1F3D]">
              <span className="h-3 w-3 rounded-full bg-purple-600 shadow-xs" /> This Period (₹4.26L)
            </span>
            <span className="flex items-center gap-2 text-slate-500">
              <span className="h-3 w-3 rounded-full bg-slate-300" /> Last Period (₹3.60L)
            </span>
          </div>
        </div>

        {/* Conversion Funnel Diagram Card (5 Cols) */}
        <div className="lg:col-span-5 rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Conversion Funnel</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                9.2% Overall CR
              </span>
            </div>

            <div className="space-y-2.5 pt-3">
              <div className="bg-indigo-600 text-white p-2.5 rounded-sm flex items-center justify-between shadow-xs">
                <span className="font-extrabold text-xs">Total Leads</span>
                <span className="font-mono text-xs font-black">12,458</span>
              </div>

              <div className="bg-blue-600 text-white p-2.5 rounded-sm flex items-center justify-between mx-2 shadow-xs">
                <span className="font-extrabold text-xs">Contacted Leads</span>
                <span className="font-mono text-xs font-black">8,246 (66.2%)</span>
              </div>

              <div className="bg-emerald-600 text-white p-2.5 rounded-sm flex items-center justify-between mx-4 shadow-xs">
                <span className="font-extrabold text-xs">Interested Leads</span>
                <span className="font-mono text-xs font-black">4,752 (38.1%)</span>
              </div>

              <div className="bg-amber-500 text-white p-2.5 rounded-sm flex items-center justify-between mx-6 shadow-xs">
                <span className="font-extrabold text-xs">Demos Conducted</span>
                <span className="font-mono text-xs font-black">2,158 (17.3%)</span>
              </div>

              <div className="bg-rose-600 text-white p-2.5 rounded-sm flex items-center justify-between mx-8 shadow-xs">
                <span className="font-extrabold text-xs">Converted</span>
                <span className="font-mono text-xs font-black">1,148 (9.2%)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-2.5 rounded-sm">
            <span className="text-slate-600 font-bold text-xs">Category Conversion Benchmark</span>
            <span className="text-sm font-extrabold text-emerald-600">9.2%</span>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW TABLES & KEY INSIGHTS (3 CARDS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Performance by Region Table (5 Cols) */}
        <div className="lg:col-span-5 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Performance by Region</h3>
            <button onClick={() => navigate('/admin/performance/territories')} className="text-[11px] font-bold text-indigo-600 hover:underline">
              View all regions →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/70">
                  <th className="py-2 px-2">Region</th>
                  <th className="py-2 px-2 text-right">Businesses</th>
                  <th className="py-2 px-2 text-right">Sales (₹)</th>
                  <th className="py-2 px-2 text-right">Leads</th>
                  <th className="py-2 px-2 text-right">Conversions</th>
                  <th className="py-2 px-2 text-right">CR (%)</th>
                  <th className="py-2 px-2 text-right">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regionalPerformanceData.map((row) => (
                  <tr key={row.region} className="hover:bg-slate-50/70">
                    <td className="py-2 px-2 font-extrabold text-[#0D1F3D]">{row.region}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-slate-700">{row.businesses}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-[#0D1F3D]">₹{row.sales.toLocaleString('en-IN')}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{row.leads}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{row.conversions}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700">{row.cr}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-emerald-600">{row.growth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Executives Table (4 Cols) */}
        <div className="lg:col-span-4 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Top Performing Executives</h3>
            <button onClick={() => navigate('/admin/performance/executives')} className="text-[11px] font-bold text-indigo-600 hover:underline">
              View all executives →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/70">
                  <th className="py-2 px-2 text-center">Rank</th>
                  <th className="py-2 px-2">Executive</th>
                  <th className="py-2 px-2 text-right">Sales (₹)</th>
                  <th className="py-2 px-2 text-right">Leads</th>
                  <th className="py-2 px-2 text-right">Conversions</th>
                  <th className="py-2 px-2 text-right">CR (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topExecutivesData.map((exec) => (
                  <tr key={exec.name} className="hover:bg-slate-50/70">
                    <td className="py-2 px-2 text-center">
                      {exec.rank === 1 ? '🥇 1' : exec.rank === 2 ? '🥈 2' : exec.rank === 3 ? '🥉 3' : exec.rank}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        <img src={exec.avatar} alt={exec.name} className="h-6 w-6 rounded-full object-cover border border-slate-200 shrink-0" />
                        <span className="font-extrabold text-[#0D1F3D]">{exec.name}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-[#0D1F3D]">₹{exec.sales.toLocaleString('en-IN')}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{exec.leads}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-600">{exec.conversions}</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700">{exec.cr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights Card (3 Cols) */}
        <div className="lg:col-span-3 rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-600" /> Key Insights
            </h3>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 p-2.5 rounded-sm bg-emerald-50/70 border border-emerald-100">
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0D1F3D] text-xs">Sales increased by 18.4%</h4>
                  <p className="text-[11px] font-medium text-slate-600">Compared to April 2025. Strong growth across most regions.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-sm bg-blue-50/70 border border-blue-100">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0D1F3D] text-xs">Conversion rate improved by 1.4%</h4>
                  <p className="text-[11px] font-medium text-slate-600">Better lead quality and faster follow-ups.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-sm bg-purple-50/70 border border-purple-100">
                <div className="h-6 w-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0D1F3D] text-xs">Mumbai is top performing region</h4>
                  <p className="text-[11px] font-medium text-slate-600">₹ 1,12,500 sales with 9.6% conversion rate.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-sm bg-amber-50/70 border border-amber-100">
                <div className="h-6 w-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Award className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0D1F3D] text-xs">Rohit Sharma is top performer</h4>
                  <p className="text-[11px] font-medium text-slate-600">₹ 58,600 sales and 8.4% conversion rate.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-center text-[10px] font-semibold text-slate-400 flex items-center justify-between">
            <span>Note: Metrics calculated on selected date range.</span>
            <span className="font-mono text-slate-500 font-bold">Data as of: 31 May 2025</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryPerformancePage;
