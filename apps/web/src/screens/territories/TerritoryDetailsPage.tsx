import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Users,
  Target,
  ShoppingBag,
  Building,
  TrendingUp,
  MapPin,
  Calendar,
  Clock,
  ChevronRight,
  Plus,
  Download,
  Map,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MapKpiCard } from '../../components/maps/MapKpiCard';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import {
  mockTerritoriesList,
  mockTerritoryExecutives,
  mockTerritoryBusinesses,
  TerritoryItem,
} from './territoriesData';

export default function TerritoryDetailsPage() {
  const { territoryId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  const territory =
    mockTerritoriesList.find((t) => t.id === territoryId || t.code === territoryId) ||
    mockTerritoriesList[0];

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Back Link & Header */}
      <div className="space-y-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => navigate('/admin/territories')}
          className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Territories
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">{territory.name}</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {territory.status}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500 border border-slate-200 bg-white px-2 py-0.5 rounded-xs">
              Code: {territory.code}
            </span>
            <span className="text-xs font-semibold text-slate-500">{territory.regionArea}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/territories/${territory.id}/edit`)}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Edit className="h-3.5 w-3.5" /> Edit Territory
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Territory options menu')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              Actions <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Territory Manager & Stats Summary Pill */}
        <div className="flex flex-wrap items-center gap-6 pt-1 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-2">
            <img
              src={territory.managerAvatar}
              alt={territory.managerName}
              className="h-7 w-7 rounded-full object-cover border border-slate-200"
            />
            <div>
              <span className="text-[10px] text-slate-400 font-bold block">Manager</span>
              <span className="font-extrabold text-[#0D1F3D]">{territory.managerName}</span>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Team Leads</span>
            <span className="font-extrabold text-[#0D1F3D]">{territory.teamLeadsCount}</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Executives</span>
            <span className="font-extrabold text-blue-600">{territory.executivesCount}</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Created On</span>
            <span className="font-extrabold text-slate-700">{territory.createdOn}</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 font-bold block">Last Updated</span>
            <span className="font-extrabold text-slate-700">{territory.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Horizontal Tabs Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none pb-0.5">
        {[
          { id: 'Overview', label: 'Overview' },
          { id: 'Executives', label: 'Executives', path: `/admin/territories/${territory.id}/executives` },
          { id: 'Targets', label: 'Targets' },
          { id: 'Performance', label: 'Performance', path: `/admin/territories/${territory.id}/performance` },
          { id: 'Visits', label: 'Visits' },
          { id: 'Businesses', label: 'Leads & Businesses', path: `/admin/territories/${territory.id}/businesses` },
          { id: 'Map', label: 'Map & Boundaries', path: `/admin/territories/${territory.id}/map` },
          { id: 'Activities', label: 'Activities' },
          { id: 'Documents', label: 'Documents' },
          { id: 'History', label: 'History' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.path) navigate(tab.path);
              }}
              className={`px-3 py-2 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-red-600 text-red-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/50'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <MapKpiCard
          title="Revenue Target (Monthly)"
          value={territory.monthlyTargetFormatted}
          subValue="Set Target"
          icon={Target}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <MapKpiCard
          title="Revenue Achieved"
          value={territory.monthlyAchievedFormatted}
          subValue="66.8% of target"
          icon={ShoppingBag}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <MapKpiCard
          title="Business Target"
          value="200"
          subValue="Set Target"
          icon={Building}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <MapKpiCard
          title="Active Businesses"
          value={territory.activeBusinessesCount.toString()}
          subValue="84% of target"
          icon={Building}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <MapKpiCard
          title="Visits (This Month)"
          value={territory.totalVisitsThisMonth.toString()}
          subValue="Completed"
          icon={TrendingUp}
          iconBgColor="bg-teal-50"
          iconTextColor="text-teal-600"
        />
        <MapKpiCard
          title="Avg. Performance"
          value={`${territory.performancePercentage}%`}
          subValue="Across all metrics"
          icon={PieChart}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
      </div>

      {/* Main Content Grid (8-col Left + 4-col Right Sidebars matching Territory Details Page.png) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT COLUMN (8 COLS) */}
        <div className="space-y-4 lg:col-span-8">
          {/* Card 1 & Card 2 side-by-side: Territory Information & Boundary Map */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Territory Information Summary */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
              <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                Territory Information
              </h3>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Territory Name :</span>
                  <span className="font-extrabold text-[#0D1F3D]">{territory.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Territory Code :</span>
                  <span className="font-mono font-bold">{territory.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Region / Area :</span>
                  <span>{territory.regionArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">City :</span>
                  <span>{territory.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status :</span>
                  <span className="font-bold text-emerald-600">{territory.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created On :</span>
                  <span>{territory.createdOn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Created By :</span>
                  <span>{territory.createdBy}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-400 block mb-1">Description :</span>
                  <p className="text-[11px] text-slate-600 font-normal leading-relaxed">
                    {territory.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Territory Boundary Map Box */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold flex flex-col justify-between">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Territory Boundary</h3>

              <div className="relative rounded-sm border border-slate-200 overflow-hidden flex-1 min-h-[220px]">
                <InteractiveMap
                  mode="territories"
                  heightClassName="h-full"
                  territoryPath={territory.pathPoints}
                  compact
                />
                <div className="absolute bottom-2 right-2 z-20 rounded-sm bg-white/95 border border-slate-200 px-2.5 py-1 text-[10px] font-extrabold text-[#0D1F3D] shadow-sm">
                  Area: {territory.areaKm2} km² | Perimeter: {territory.perimeterKm} km
                </div>
              </div>
            </div>
          </div>

          {/* Top Executives (This Month) Table */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Top Executives (This Month)</h3>
              <span className="text-[10px] text-slate-400 font-bold">Top 5 Performers</span>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400">
                  <th className="py-2">Executive</th>
                  <th className="py-2 text-center">Visits</th>
                  <th className="py-2 text-right">Revenue (₹)</th>
                  <th className="py-2 text-center">Performance</th>
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
                    <td className="py-2.5 text-right font-mono font-bold">{exec.revenueFormatted}</td>
                    <td className="py-2.5 text-center w-28">
                      <div className="space-y-1">
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${Math.min(exec.performancePercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/territories/${territory.id}/executives`)}
              className="w-full text-xs font-bold justify-center shadow-xs border-slate-200 text-[#0D1F3D]"
            >
              View All Executives
            </Button>
          </div>

          {/* Target vs Achievement (This Month) Progress Bars */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Target vs Achievement (This Month)
            </h3>

            <div className="space-y-3">
              {/* Revenue */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700">Revenue</span>
                  <span className="font-bold text-slate-600">
                    ₹ 9,38,200 / ₹ 14,00,000 <span className="text-emerald-600 ml-2 font-extrabold">66.8%</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '66.8%' }} />
                </div>
              </div>

              {/* Business */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700">Business</span>
                  <span className="font-bold text-slate-600">
                    168 / 200 <span className="text-blue-600 ml-2 font-extrabold">84%</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-600" style={{ width: '84%' }} />
                </div>
              </div>

              {/* Visits */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700">Visits</span>
                  <span className="font-bold text-slate-600">
                    176 / 250 <span className="text-purple-600 ml-2 font-extrabold">70.4%</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-purple-600" style={{ width: '70.4%' }} />
                </div>
              </div>

              {/* Collection */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-700">Collection</span>
                  <span className="font-bold text-slate-600">
                    ₹ 5,70,000 / ₹ 9,30,000 <span className="text-amber-600 ml-2 font-extrabold">61.3%</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-amber-500" style={{ width: '61.3%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS SIDEBARS) */}
        <div className="space-y-4 lg:col-span-4">
          {/* Performance Summary (Gauge/Donut Chart) */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold text-center">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] text-left border-b border-slate-100 pb-2">
              Performance Summary (This Month)
            </h3>

            <div className="relative py-2 flex flex-col items-center justify-center">
              {/* Semi-circle Donut Visual */}
              <div className="h-28 w-28 rounded-full border-8 border-emerald-500 border-b-slate-100 border-l-emerald-500 flex flex-col items-center justify-center shadow-inner">
                <span className="text-2xl font-extrabold text-[#0D1F3D]">67%</span>
                <span className="text-[9px] font-bold text-slate-400">Overall Performance</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-left text-[11px]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Revenue
                </span>
                <span className="font-extrabold text-slate-900">66%</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Visits
                </span>
                <span className="font-extrabold text-slate-900">72%</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-purple-500" /> Business
                </span>
                <span className="font-extrabold text-slate-900">84%</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Collection
                </span>
                <span className="font-extrabold text-slate-900">61%</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/admin/territories/${territory.id}/performance`)}
              className="w-full text-xs font-bold justify-between shadow-xs border-slate-200 text-[#0D1F3D] mt-2"
            >
              <span>View Full Analytics</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Recent Activities Stream */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Recent Activities
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5 border-b border-slate-100 pb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">Visit completed by Arjun Mehta</p>
                  <p className="text-[10px] text-slate-400 font-medium">20 May 2025, 04:15 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-b border-slate-100 pb-2">
                <Building className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">New business added – Sai Enterprises</p>
                  <p className="text-[10px] text-slate-400 font-medium">20 May 2025, 02:30 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 border-b border-slate-100 pb-2">
                <Target className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">Target updated for May 2025</p>
                  <p className="text-[10px] text-slate-400 font-medium">19 May 2025, 11:45 AM</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => toast.info('Viewing full activity stream')}
              className="text-[11px] font-bold text-blue-600 hover:underline block text-center w-full"
            >
              View All Activities →
            </button>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Quick Actions
            </h3>

            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <button
                onClick={() => navigate(`/admin/territories/${territory.id}/businesses`)}
                className="flex items-center gap-1.5 rounded-sm border border-slate-200 p-2 hover:bg-slate-50 text-[11px] font-bold text-[#0D1F3D]"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-600" /> Add Business
              </button>

              <button
                onClick={() => navigate(`/admin/territories/${territory.id}/executives`)}
                className="flex items-center gap-1.5 rounded-sm border border-slate-200 p-2 hover:bg-slate-50 text-[11px] font-bold text-[#0D1F3D]"
              >
                <Users className="h-3.5 w-3.5 text-blue-600" /> Add Executive
              </button>

              <button
                onClick={() => toast.info('Assign Target modal opened')}
                className="flex items-center gap-1.5 rounded-sm border border-slate-200 p-2 hover:bg-slate-50 text-[11px] font-bold text-[#0D1F3D]"
              >
                <Target className="h-3.5 w-3.5 text-purple-600" /> Assign Target
              </button>

              <button
                onClick={() => navigate(`/admin/territories/${territory.id}/map`)}
                className="flex items-center gap-1.5 rounded-sm border border-slate-200 p-2 hover:bg-slate-50 text-[11px] font-bold text-[#0D1F3D]"
              >
                <Map className="h-3.5 w-3.5 text-rose-600" /> View on Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
