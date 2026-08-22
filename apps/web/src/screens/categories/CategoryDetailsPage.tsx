import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Users,
  TrendingUp,
  Target,
  Filter,
  Calendar,
  Edit,
  Power,
  BarChart3,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from '../../components/ui/Button';
import { mockCategoriesList } from './categoriesData';

const performanceTrendData = [
  { month: 'Dec 2024', sales: 280000, leads: 8200, conversions: 780, businesses: 1420 },
  { month: 'Jan 2025', sales: 310000, leads: 9100, conversions: 860, businesses: 1510 },
  { month: 'Feb 2025', sales: 340000, leads: 9800, conversions: 940, businesses: 1620 },
  { month: 'Mar 2025', sales: 360000, leads: 10400, conversions: 990, businesses: 1710 },
  { month: 'Apr 2025', sales: 390000, leads: 11200, conversions: 1060, businesses: 1780 },
  { month: 'May 2025', sales: 426000, leads: 12458, conversions: 1148, businesses: 1854 },
];

export default function CategoryDetailsPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  const category = mockCategoriesList.find((c) => c.id === categoryId) || mockCategoriesList[0];

  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Businesses' | 'Executives' | 'Performance' | 'Leads & Conversions' | 'Sales & Revenue' | 'Targets' | 'Activity Timeline' | 'Settings'
  >('Overview');

  const [trendMetric, setTrendMetric] = useState<'sales' | 'leads' | 'conversions' | 'businesses'>('sales');
  const [timeRange, setTimeRange] = useState('Last 6 Months');
  const [isActionsOpen, setIsActionsOpen] = useState(false);

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
          <span className="text-[#0D1F3D] font-bold">{category.name}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#0D1F3D]">{category.name}</h1>
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5">
                  {category.status}
                </span>
                <button
                  onClick={() => toast.info('Edit category opened')}
                  className="text-slate-400 hover:text-purple-600 cursor-pointer"
                  title="Edit Category Name"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Code: <strong className="font-mono text-[#0D1F3D]">{category.code}</strong> • Created on {category.createdOn} by {category.createdBy}
              </p>
            </div>
          </div>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              Actions <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </Button>

            {isActionsOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-slate-200 bg-white p-1.5 shadow-xl z-50 text-left font-semibold text-xs space-y-0.5">
                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    toast.info(`Editing category ${category.name}`);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-100 text-[#0D1F3D]"
                >
                  <Edit className="h-3.5 w-3.5 text-indigo-600" /> Edit Category
                </button>
                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    navigate(`/admin/categories/${category.id}/performance`);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-slate-100 text-[#0D1F3D]"
                >
                  <BarChart3 className="h-3.5 w-3.5 text-emerald-600" /> View Performance
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setIsActionsOpen(false);
                    toast.success(`Category ${category.name} deactivated`);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm hover:bg-red-50 text-red-600"
                >
                  <Power className="h-3.5 w-3.5 text-red-600" /> Deactivate Category
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOP 6 KPI CARDS ROW */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Businesses</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{category.businessesCount.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-indigo-600 block">12.6% of total businesses</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Executives</span>
            <span className="text-xl font-extrabold text-emerald-600">{category.activeExecutives}</span>
            <span className="text-xs font-medium text-slate-500 block">11.8% of total executives</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Sales (₹)</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ {category.sales.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 block">18.4% of total sales</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Avg. Achievement</span>
            <span className="text-xl font-extrabold text-blue-600">{category.achievementPct}%</span>
            <span className="text-xs font-medium text-slate-500 block">vs target quota</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 shrink-0">
            <Filter className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-red-600">9.2%</span>
            <span className="text-xs font-semibold text-emerald-600 block">vs avg 6.8%</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Last Activity</span>
            <span className="text-sm font-extrabold text-[#0D1F3D]">Today, 10:35 AM</span>
            <span className="text-xs font-medium text-slate-500 block">2 new activities</span>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION BAR */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 pt-1.5 rounded-sm shadow-xs overflow-x-auto custom-scrollbar">
        {(
          [
            'Overview',
            'Businesses',
            'Executives',
            'Performance',
            'Leads & Conversions',
            'Sales & Revenue',
            'Targets',
            'Activity Timeline',
            'Settings',
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

      {/* MAIN OVERVIEW LAYOUT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Category Information Card (4 Cols on LG) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Category Information
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Category Name</span>
                <span className="font-extrabold text-[#0D1F3D]">{category.name}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Category Code</span>
                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-200">
                  {category.code}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="rounded-full bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 text-[10px] border border-emerald-200">
                  {category.status}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Parent Category</span>
                <span className="font-bold text-slate-700">{category.parentCategory}</span>
              </div>

              <div className="pt-2">
                <span className="text-slate-500 font-medium block mb-1">Description</span>
                <p className="text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-sm border border-slate-200">
                  {category.description}
                </p>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100 pt-2">
                <span className="text-slate-500 font-medium">Created On</span>
                <span className="font-bold text-slate-800">{category.createdOn}, 09:15 AM</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Created By</span>
                <div className="flex items-center gap-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                    alt={category.createdBy}
                    className="h-5 w-5 rounded-full object-cover border border-slate-200"
                  />
                  <span className="font-bold text-[#0D1F3D]">{category.createdBy}</span>
                </div>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Last Updated</span>
                <span className="font-bold text-slate-800">19 May 2025, 03:40 PM</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Updated By</span>
                <div className="flex items-center gap-1.5">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Priya Sharma"
                    className="h-5 w-5 rounded-full object-cover border border-slate-200"
                  />
                  <span className="font-bold text-[#0D1F3D]">Priya Sharma</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <Button
                variant="accent"
                size="sm"
                fullWidth
                onClick={() => toast.info(`Editing category ${category.name}`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center justify-center gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" /> Edit Category
              </Button>

              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => toast.success(`Category ${category.name} deactivated`)}
                className="text-red-600 border-red-200 hover:bg-red-50 font-bold flex items-center justify-center gap-1.5"
              >
                <Power className="h-3.5 w-3.5" /> Deactivate Category
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Performance Trend & Dashboard Widgets (8 Cols on LG) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Performance Trend Card */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Performance Trend</h3>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-sm border border-slate-200">
                  <button
                    onClick={() => setTrendMetric('sales')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-xs cursor-pointer ${
                      trendMetric === 'sales' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sales (₹)
                  </button>
                  <button
                    onClick={() => setTrendMetric('leads')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-xs cursor-pointer ${
                      trendMetric === 'leads' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Leads
                  </button>
                  <button
                    onClick={() => setTrendMetric('conversions')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-xs cursor-pointer ${
                      trendMetric === 'conversions' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Conversions
                  </button>
                  <button
                    onClick={() => setTrendMetric('businesses')}
                    className={`px-2 py-1 text-[10px] font-bold rounded-xs cursor-pointer ${
                      trendMetric === 'businesses' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Businesses
                  </button>
                </div>

                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="rounded-sm border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-[#0D1F3D]"
                >
                  <option value="Last 6 Months">Last 6 Months</option>
                  <option value="Last 3 Months">Last 3 Months</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>
            </div>

            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceTrendData}>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1F3D',
                      borderRadius: '4px',
                      color: '#FFF',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey={trendMetric}
                    stroke={
                      trendMetric === 'sales'
                        ? '#8B5CF6'
                        : trendMetric === 'leads'
                        ? '#2563EB'
                        : trendMetric === 'conversions'
                        ? '#10B981'
                        : '#F59E0B'
                    }
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 4 Mini KPI Stats Bar */}
            <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center">
              <div className="bg-slate-50 p-2 rounded-sm border border-slate-200">
                <span className="text-[10px] font-medium text-slate-500 block">Total Sales (₹)</span>
                <span className="text-xs font-extrabold text-[#0D1F3D]">₹ 4,26,000</span>
                <span className="text-[9px] font-bold text-emerald-600 block">↑ 18.4%</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-sm border border-slate-200">
                <span className="text-[10px] font-medium text-slate-500 block">Total Leads</span>
                <span className="text-xs font-extrabold text-[#0D1F3D]">12,458</span>
                <span className="text-[9px] font-bold text-emerald-600 block">↑ 16.2%</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-sm border border-slate-200">
                <span className="text-[10px] font-medium text-slate-500 block">Total Conversions</span>
                <span className="text-xs font-extrabold text-[#0D1F3D]">1,148</span>
                <span className="text-[9px] font-bold text-emerald-600 block">↑ 21.6%</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-sm border border-slate-200">
                <span className="text-[10px] font-medium text-slate-500 block">Total Businesses</span>
                <span className="text-xs font-extrabold text-[#0D1F3D]">1,854</span>
                <span className="text-[9px] font-bold text-emerald-600 block">↑ 12.6%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Top Performing Executives Widget */}
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">Top Performing Executives</h3>
                <button onClick={() => navigate('/admin/performance/executives')} className="text-[11px] font-bold text-indigo-600 hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black flex items-center justify-center">1</span>
                    <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Rohit Sharma" className="h-6 w-6 rounded-full object-cover" />
                    <div>
                      <span className="font-extrabold text-[#0D1F3D] block">Rohit Sharma</span>
                      <span className="text-[9px] text-slate-400 font-medium">Sales Manager</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#0D1F3D] block">₹ 58,600</span>
                    <span className="text-[10px] font-extrabold text-emerald-600">156%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black flex items-center justify-center">2</span>
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Priya Sharma" className="h-6 w-6 rounded-full object-cover" />
                    <div>
                      <span className="font-extrabold text-[#0D1F3D] block">Priya Sharma</span>
                      <span className="text-[9px] text-slate-400 font-medium">Team Leader</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#0D1F3D] block">₹ 47,200</span>
                    <span className="text-[10px] font-extrabold text-emerald-600">148%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-amber-700/10 text-amber-900 text-[10px] font-black flex items-center justify-center">3</span>
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Vijay Patel" className="h-6 w-6 rounded-full object-cover" />
                    <div>
                      <span className="font-extrabold text-[#0D1F3D] block">Vijay Patel</span>
                      <span className="text-[9px] text-slate-400 font-medium">Senior Executive</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#0D1F3D] block">₹ 36,850</span>
                    <span className="text-[10px] font-extrabold text-emerald-600">142%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Leads & Conversion Funnel Widget */}
            <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">Leads & Conversion Funnel</h3>
                <span className="text-[10px] font-bold text-slate-500">This Month</span>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                    <span>Total Leads</span>
                    <span>2,358</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-purple-600 w-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                    <span>Contacted Leads</span>
                    <span>1,642 (69.6%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600 w-[70%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                    <span>Interested Leads</span>
                    <span>1,284 (54.4%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-600 w-[54%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                    <span>Demos Conducted</span>
                    <span>468 (19.9%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500 w-[20%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-[#0D1F3D] mb-1">
                    <span>Converted</span>
                    <span>216 (9.2%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-red-500 w-[9%]" />
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="font-medium text-slate-500">Overall Conversion Rate</span>
                <span className="font-extrabold text-emerald-600">9.2%</span>
              </div>
            </div>
          </div>

          {/* Recent Businesses Added Table */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Recent Businesses Added</h3>
              <button onClick={() => navigate('/admin/businesses')} className="text-[11px] font-bold text-indigo-600 hover:underline">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/70">
                    <th className="py-2 px-2.5">Business Name</th>
                    <th className="py-2 px-2.5">Location</th>
                    <th className="py-2 px-2.5">Added On</th>
                    <th className="py-2 px-2.5">Added By</th>
                    <th className="py-2 px-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-2.5 font-extrabold text-[#0D1F3D]">Fashion Hub</td>
                    <td className="py-2.5 px-2.5 text-slate-600">Mumbai</td>
                    <td className="py-2.5 px-2.5 text-slate-500">19 May 2025</td>
                    <td className="py-2.5 px-2.5 text-slate-800">Rohit Sharma</td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-2.5 font-extrabold text-[#0D1F3D]">Smart Electronics</td>
                    <td className="py-2.5 px-2.5 text-slate-600">Pune</td>
                    <td className="py-2.5 px-2.5 text-slate-500">18 May 2025</td>
                    <td className="py-2.5 px-2.5 text-slate-800">Priya Sharma</td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-2.5 font-extrabold text-[#0D1F3D]">Daily Mart</td>
                    <td className="py-2.5 px-2.5 text-slate-600">Nagpur</td>
                    <td className="py-2.5 px-2.5 text-slate-500">18 May 2025</td>
                    <td className="py-2.5 px-2.5 text-slate-800">Vijay Patel</td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-2.5 font-extrabold text-[#0D1F3D]">Lifestyle Store</td>
                    <td className="py-2.5 px-2.5 text-slate-600">Nashik</td>
                    <td className="py-2.5 px-2.5 text-slate-500">17 May 2025</td>
                    <td className="py-2.5 px-2.5 text-slate-800">Priya Sharma</td>
                    <td className="py-2.5 px-2.5 text-center">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
