import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Calendar,
  Download,
  TrendingUp,
  Target,
  Users,
  Award,
  Filter,
  CheckCircle2,
  PieChart,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { mockTerritoriesList, mockTerritoryExecutives } from './territoriesData';

export default function TerritoryPerformancePage() {
  const { territoryId } = useParams();
  const navigate = useNavigate();
  const [activeSubTab, setActiveSubTab] = useState('Overview');

  const territory =
    mockTerritoriesList.find((t) => t.id === territoryId || t.code === territoryId) ||
    mockTerritoriesList[0];

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="space-y-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => navigate(`/admin/territories/${territory.id}`)}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Territory Details
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Territory Performance</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                • {territory.status}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Track and analyze overall performance of {territory.name} territory
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>01 May 2025 - 20 May 2025</span>
            </div>

            <select className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
              <option value="none">Compare: None</option>
              <option value="previous-month">vs Previous Month</option>
              <option value="previous-year">vs Previous Year</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success('Exporting Performance Report...')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5" /> Export Report
            </Button>
          </div>
        </div>

        {/* Territory Manager & Summary Pill */}
        <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <img
              src={territory.managerAvatar}
              alt={territory.managerName}
              className="h-6 w-6 rounded-full object-cover border border-slate-200"
            />
            <span className="font-extrabold text-[#0D1F3D]">{territory.managerName}</span>
            <span className="text-[10px] text-slate-400 font-bold">({territory.managerRole})</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Team Size</span>
            <span className="font-extrabold text-[#0D1F3D]">14 Executives</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Coverage Area</span>
            <span className="font-extrabold text-slate-700">{territory.areaKm2} km²</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Total Businesses</span>
            <span className="font-extrabold text-[#0D1F3D]">168</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Active Businesses</span>
            <span className="font-extrabold text-emerald-600">142</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none pb-0.5">
        {[
          'Overview',
          'Leads & Visits',
          'Sales & Revenue',
          'Collections',
          'Demos & Conversions',
          'Performance by Executive',
          'Targets vs Achievement',
          'Trends',
          'Activities',
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-3 py-2 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === tab
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top Metrics Cards (6 Metric Cards matching Territory Performance.png) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <MapKpiCard
          title="Total Visits"
          value="176"
          subValue="↑ 18.4% vs 01-30 Apr"
          icon={TrendingUp}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <MapKpiCard
          title="Completed Visits"
          value="142"
          subValue="↑ 21.7% vs 01-30 Apr"
          icon={CheckCircle2}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <MapKpiCard
          title="New Leads"
          value="98"
          subValue="↑ 16.3% vs 01-30 Apr"
          icon={Users}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <MapKpiCard
          title="Demos Conducted"
          value="36"
          subValue="↑ 12.5% vs 01-30 Apr"
          icon={Target}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <MapKpiCard
          title="Sales Closed"
          value="28"
          subValue="↑ 21.7% vs 01-30 Apr"
          icon={ShoppingBag}
          iconBgColor="bg-teal-50"
          iconTextColor="text-teal-600"
        />
        <MapKpiCard
          title="Revenue"
          value="₹ 14,00,000"
          subValue="↑ 24.6% vs 01-30 Apr"
          icon={Award}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Analytics Dashboard Grid (Matching Territory Performance.png) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column (8 Cols): Visits Trend, Revenue Trend, Executive Performance Table */}
        <div className="space-y-4 lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Visits Trend Line Visual */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">Visits Trend</h3>
                <span className="text-[10px] text-slate-400 font-bold">Daily</span>
              </div>
              <div className="h-40 w-full flex items-end justify-between gap-1 pt-4 px-2 bg-slate-50/50 rounded-sm">
                {[12, 18, 22, 16, 25, 20, 28, 24, 19, 30, 26, 32, 28, 22, 18].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full bg-emerald-500 rounded-t-xs hover:bg-emerald-600 transition-all"
                      style={{ height: `${val * 3.5}px` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Missed
                </span>
              </div>
            </div>

            {/* Revenue Trend Visual */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">Revenue Trend (₹)</h3>
                <span className="text-[10px] text-slate-400 font-bold">Daily</span>
              </div>
              <div className="h-40 w-full flex items-end justify-between gap-1 pt-4 px-2 bg-blue-50/20 rounded-sm border border-blue-100">
                {[45, 65, 80, 50, 95, 70, 110, 85, 60, 130, 90, 120, 100, 75, 55].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-blue-600 rounded-t-xs hover:bg-blue-700 transition-all"
                      style={{ height: `${val}px` }}
                    />
                  </div>
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-500 block">
                Total Revenue: ₹ 14,00,000
              </span>
            </div>
          </div>

          {/* Performance by Executive (Top 5) */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Performance by Executive (Top 5)
            </h3>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                  <th className="py-2">Executive</th>
                  <th className="py-2 text-center">Visits</th>
                  <th className="py-2 text-center">New Leads</th>
                  <th className="py-2 text-center">Sales</th>
                  <th className="py-2 text-right">Revenue (₹)</th>
                  <th className="py-2 text-center">Achievement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockTerritoryExecutives.map((exec) => (
                  <tr key={exec.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <img
                          src={exec.avatar}
                          alt={exec.name}
                          className="h-6 w-6 rounded-full object-cover border border-slate-200"
                        />
                        <span className="font-extrabold text-[#0D1F3D]">{exec.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-center font-bold">{exec.visitsCount}</td>
                    <td className="py-2.5 text-center font-bold">{Math.floor(exec.visitsCount * 0.6)}</td>
                    <td className="py-2.5 text-center font-bold">{Math.floor(exec.visitsCount * 0.25)}</td>
                    <td className="py-2.5 text-right font-mono font-bold">{exec.revenueFormatted}</td>
                    <td className="py-2.5 text-center font-extrabold text-emerald-600">
                      {exec.performancePercentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 Cols): Sales Funnel & Donut Charts */}
        <div className="space-y-4 lg:col-span-4">
          {/* Sales Funnel Pyramid Visual */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold text-center">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] text-left border-b border-slate-100 pb-2">
              Sales Funnel
            </h3>

            <div className="space-y-1.5 py-2">
              <div className="bg-sky-500 text-white p-2 rounded-sm font-extrabold text-xs">
                New Leads &nbsp; 98 (100%)
              </div>
              <div className="bg-blue-600 text-white p-2 rounded-sm font-extrabold text-xs mx-3">
                Visited &nbsp; 116 (118%)
              </div>
              <div className="bg-purple-600 text-white p-2 rounded-sm font-extrabold text-xs mx-6">
                Demo Conducted &nbsp; 36 (36%)
              </div>
              <div className="bg-amber-500 text-white p-2 rounded-sm font-extrabold text-xs mx-9">
                Proposal Sent &nbsp; 32 (33%)
              </div>
              <div className="bg-emerald-600 text-white p-2 rounded-sm font-extrabold text-xs mx-12">
                Closed Won &nbsp; 28 (29%)
              </div>
            </div>

            <span className="text-xs font-extrabold text-emerald-600 block">
              Conversion Rate: 28.6%
            </span>
          </div>

          {/* Lead Source Performance Donut */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Lead Source Performance
            </h3>

            <div className="space-y-1 text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span>Walk-in</span>
                <span className="font-extrabold">42 (42.9%)</span>
              </div>
              <div className="flex justify-between">
                <span>Referral</span>
                <span className="font-extrabold">24 (24.5%)</span>
              </div>
              <div className="flex justify-between">
                <span>Call</span>
                <span className="font-extrabold">16 (16.3%)</span>
              </div>
              <div className="flex justify-between">
                <span>Website</span>
                <span className="font-extrabold">10 (10.2%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights Banner at Bottom */}
      <div className="rounded-sm border border-amber-200 bg-amber-50/60 p-4 space-y-2 text-xs font-semibold text-slate-800">
        <h4 className="font-extrabold text-[#0D1F3D] flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-amber-600" /> Key Insights
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-[11px]">
          <div>• Visits increased by 18.4% compared to last month.</div>
          <div>• Revenue is 70% of the monthly target.</div>
          <div>• Conversion rate from visit to sale is 24.1%.</div>
          <div>• Arjun Mehta is the top performer this month.</div>
        </div>
      </div>
    </div>
  );
}
