import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Users,
  TrendingUp,
  Search,
  Filter,
  RotateCcw,
  Download,
  Upload,
  Plus,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Sun,
  Activity,
  Box,
  Cpu,
  Layers,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';

export function AllTenantsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedPlan, setSelectedPlan] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // 6 KPI Summary Cards
  const kpis = [
    { title: 'Total Tenants', value: '128', change: '↑ 12 this month', color: 'text-blue-600 bg-blue-50 border-blue-100', icon: Building2 },
    { title: 'Active Tenants', value: '102', change: '79.7% of total', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', icon: CheckCircle2 },
    { title: 'Trial Tenants', value: '18', change: '14.1% of total', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: Clock },
    { title: 'Suspended Tenants', value: '6', change: '4.7% of total', color: 'text-rose-600 bg-rose-50 border-rose-100', icon: AlertOctagon },
    { title: 'Total SaaS Users', value: '2,845', change: '↑ 156 this month', color: 'text-purple-600 bg-purple-50 border-purple-100', icon: Users },
    { title: 'MRR', value: '₹28,74,320', change: '↑ 18.6% vs last month', color: 'text-sky-600 bg-sky-50 border-sky-100', icon: TrendingUp },
  ];

  // Tenants Mock Data (Matching All Tenants Page.png)
  const tenantsList = [
    { id: '1', name: 'Sunrise Solar Pvt Ltd', domain: 'sunrisesolar.smartfieldwork.com', code: 'SFW-TNT-00124', industry: 'Solar', plan: 'Growth', users: '18 / 25', mrr: '₹14,999', status: 'Active', createdOn: '24 Aug 2025', iconBg: 'bg-amber-100 text-amber-600' },
    { id: '2', name: 'Genix Pharma Pvt Ltd', domain: 'genixpharma.smartfieldwork.com', code: 'SFW-TNT-00123', industry: 'Pharma', plan: 'Growth', users: '35 / 50', mrr: '₹24,999', status: 'Active', createdOn: '22 Aug 2025', iconBg: 'bg-rose-100 text-rose-600' },
    { id: '3', name: 'Metro FMCG Distributors', domain: 'metrofmcg.smartfieldwork.com', code: 'SFW-TNT-00122', industry: 'FMCG', plan: 'Enterprise', users: '120 / 150', mrr: '₹79,999', status: 'Active', createdOn: '20 Aug 2025', iconBg: 'bg-blue-100 text-blue-600' },
    { id: '4', name: 'Blue Star Distributors', domain: 'bluestar.smartfieldwork.com', code: 'SFW-TNT-00121', industry: 'Distributors', plan: 'Growth', users: '22 / 30', mrr: '₹17,999', status: 'Active', createdOn: '18 Aug 2025', iconBg: 'bg-emerald-100 text-emerald-600' },
    { id: '5', name: 'Apex Solar Pvt Ltd', domain: 'apexsolar.smartfieldwork.com', code: 'SFW-TNT-00120', industry: 'Solar', plan: 'Professional', users: '12 / 20', mrr: '₹9,999', status: 'Active', createdOn: '16 Aug 2025', iconBg: 'bg-amber-100 text-amber-600' },
    { id: '6', name: 'Krishna FMCG Pvt Ltd', domain: 'krishnafmcg.smartfieldwork.com', code: 'SFW-TNT-00119', industry: 'FMCG', plan: 'Enterprise', users: '85 / 100', mrr: '₹59,999', status: 'Active', createdOn: '14 Aug 2025', iconBg: 'bg-blue-100 text-blue-600' },
    { id: '7', name: 'Om Sai FMCG', domain: 'omsai.smartfieldwork.com', code: 'SFW-TNT-00118', industry: 'FMCG', plan: 'Growth', users: '16 / 25', mrr: '₹14,999', status: 'Past Due', createdOn: '12 Aug 2025', iconBg: 'bg-purple-100 text-purple-600' },
    { id: '8', name: 'Bright Services', domain: 'brightservices.smartfieldwork.com', code: 'SFW-TNT-00117', industry: 'Services', plan: 'Professional', users: '10 / 15', mrr: '₹7,999', status: 'Active', createdOn: '10 Aug 2025', iconBg: 'bg-indigo-100 text-indigo-600' },
    { id: '9', name: 'Vertex Manufacturing', domain: 'vertexmanufacturing.smartfieldwork.com', code: 'SFW-TNT-00116', industry: 'Manufacturing', plan: 'Growth', users: '28 / 40', mrr: '₹19,999', status: 'Trial', createdOn: '08 Aug 2025', iconBg: 'bg-teal-100 text-teal-600' },
    { id: '10', name: 'Sagar Pharma', domain: 'sagarpharma.smartfieldwork.com', code: 'SFW-TNT-00115', industry: 'Pharma', plan: 'Growth', users: '15 / 25', mrr: '₹14,999', status: 'Suspended', createdOn: '06 Aug 2025', iconBg: 'bg-rose-100 text-rose-600' },
  ];

  // Industry donut legend
  const industries = [
    { name: 'Pharma', count: 24, percentage: '18.8%', color: 'bg-blue-600' },
    { name: 'FMCG', count: 20, percentage: '15.6%', color: 'bg-emerald-500' },
    { name: 'Distributors', count: 18, percentage: '14.1%', color: 'bg-indigo-500' },
    { name: 'Manufacturing', count: 16, percentage: '12.5%', color: 'bg-teal-500' },
    { name: 'Solar', count: 12, percentage: '9.4%', color: 'bg-amber-500' },
    { name: 'Services', count: 10, percentage: '7.8%', color: 'bg-rose-500' },
    { name: 'Other', count: 28, percentage: '21.9%', color: 'bg-slate-400' },
  ];

  // Plan donut legend
  const plans = [
    { name: 'Enterprise', count: 32, percentage: '25.0%', color: 'bg-blue-600' },
    { name: 'Growth', count: 46, percentage: '35.9%', color: 'bg-emerald-500' },
    { name: 'Professional', count: 34, percentage: '26.6%', color: 'bg-amber-500' },
    { name: 'Starter', count: 16, percentage: '12.5%', color: 'bg-rose-500' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">Active</span>;
      case 'Past Due':
        return <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">Past Due</span>;
      case 'Trial':
        return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">Trial</span>;
      case 'Suspended':
        return <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">Suspended</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">All Tenants</h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Building2 className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Manage and monitor all tenant workspaces across the Smart Field Work SaaS platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2 font-bold text-slate-700">
            <Download className="h-4 w-4 text-slate-400" /> Export
          </Button>
          <Button variant="outline" size="sm" className="gap-2 font-bold text-slate-700">
            <Upload className="h-4 w-4 text-slate-400" /> Import
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/platform/tenants/create')}
            className="gap-2 font-bold shadow-sm"
          >
            <Plus className="h-4 w-4" /> Create Tenant
          </Button>
        </div>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">{kpi.title}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${kpi.color}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#0D1F3D]">{kpi.value}</p>
              <p className="mt-1 text-[11px] font-bold text-slate-500">{kpi.change}</p>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tenants by name, code, domain, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {/* Industry Filter Dropdown */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer min-w-[140px]"
          >
            <option value="All">All Industries</option>
            <option value="Pharma">Pharma</option>
            <option value="FMCG">FMCG</option>
            <option value="Distributors">Distributors</option>
            <option value="Solar">Solar</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Services">Services</option>
          </select>

          {/* Plan Filter Dropdown */}
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer min-w-[130px]"
          >
            <option value="All">All Plans</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Growth">Growth</option>
            <option value="Professional">Professional</option>
            <option value="Starter">Starter</option>
          </select>

          {/* Status Filter Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none cursor-pointer min-w-[130px]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Trial">Trial</option>
            <option value="Past Due">Past Due</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* Filter Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 font-bold text-slate-700 h-10">
              <Filter className="h-4 w-4 text-slate-400" /> More Filters
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedIndustry('All');
                setSelectedPlan('All');
                setSelectedStatus('All');
              }}
              className="gap-2 font-bold text-slate-700 h-10"
            >
              <RotateCcw className="h-4 w-4 text-slate-400" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Table Left (2 Cols) + Analytics Right (1 Col) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Table Section */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0D1F3D]">All Tenants</h3>
              <span className="text-xs font-medium text-slate-500">
                Showing <span className="font-bold text-[#0D1F3D]">1 to 10</span> of <span className="font-bold text-[#0D1F3D]">128</span> tenants
              </span>
            </div>

            {/* 100% Full-Width Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-[#0D1F3D]">
                    <th className="pb-3 w-8">#</th>
                    <th className="pb-3">Tenant Name</th>
                    <th className="pb-3">Tenant Code</th>
                    <th className="pb-3">Industry</th>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Users</th>
                    <th className="pb-3">MRR</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Created On</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {tenantsList.map((t, idx) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3.5 text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold ${t.iconBg}`}>
                            {t.name[0]}
                          </div>
                          <div>
                            <p
                              onClick={() => navigate(`/platform/tenants/${t.id}`)}
                              className="font-bold text-[#0D1F3D] hover:text-blue-600 hover:underline cursor-pointer"
                            >
                              {t.name}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400">{t.domain}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-xs font-bold text-slate-800">{t.code}</td>
                      <td className="py-3.5 text-slate-600 font-semibold">{t.industry}</td>
                      <td className="py-3.5 text-slate-700 font-bold">{t.plan}</td>
                      <td className="py-3.5 text-slate-700 font-semibold">{t.users}</td>
                      <td className="py-3.5 font-bold text-[#0D1F3D]">{t.mrr}</td>
                      <td className="py-3.5">{getStatusBadge(t.status)}</td>
                      <td className="py-3.5 text-slate-500 font-medium">{t.createdOn}</td>
                      <td className="py-3.5 text-right relative">
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === t.id ? null : t.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {/* Three-Dots Floating Popover Menu */}
                        {activeMenuId === t.id && (
                          <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in zoom-in-95">
                            <button
                              type="button"
                              onClick={() => { setActiveMenuId(null); navigate(`/platform/tenants/${t.id}`); }}
                              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4 text-blue-600" /> View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => { setActiveMenuId(null); navigate(`/platform/tenants/${t.id}/edit`); }}
                              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              <Edit className="h-4 w-4 text-emerald-600" /> Edit Tenant
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveMenuId(null)}
                              className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            >
                              <Trash2 className="h-4 w-4" /> Delete Tenant
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Pagination Bar */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none">
                  <option>25</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span>1-25 of 128</span>
                <button type="button" className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"><ChevronLeft className="h-4 w-4" /></button>
                <button type="button" className="h-8 w-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center">1</button>
                <button type="button" className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50">2</button>
                <button type="button" className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50">3</button>
                <button type="button" className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50">4</button>
                <button type="button" className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-700 font-bold hover:bg-slate-50">5</button>
                <button type="button" className="h-8 w-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:bg-slate-50"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Analytics Widgets Column */}
        <div className="space-y-6">
          {/* Tenants by Industry Donut Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#0D1F3D] mb-4">Tenants by Industry</h3>
            <div className="flex items-center gap-4">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#2563EB" strokeWidth="4.5" strokeDasharray="25, 100" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#10B981" strokeWidth="4.5" strokeDasharray="20, 100" strokeDashoffset="-25" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#F59E0B" strokeWidth="4.5" strokeDasharray="18, 100" strokeDashoffset="-45" />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-lg font-extrabold text-[#0D1F3D]">128</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {industries.slice(0, 4).map((ind, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${ind.color}`} />
                      <span className="text-slate-600">{ind.name}</span>
                    </div>
                    <span className="text-[#0D1F3D] font-bold">{ind.count} ({ind.percentage})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tenants by Plan Donut Chart */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-[#0D1F3D] mb-4">Tenants by Plan</h3>
            <div className="flex items-center gap-4">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#2563EB" strokeWidth="4.5" strokeDasharray="36, 100" />
                  <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#10B981" strokeWidth="4.5" strokeDasharray="26, 100" strokeDashoffset="-36" />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-lg font-extrabold text-[#0D1F3D]">128</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
                </div>
              </div>
              <div className="flex-1 space-y-1">
                {plans.map((pl, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] font-semibold">
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${pl.color}`} />
                      <span className="text-slate-600">{pl.name}</span>
                    </div>
                    <span className="text-[#0D1F3D] font-bold">{pl.count} ({pl.percentage})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tenant Status Overview Progress Bars */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Tenant Status Overview</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Active</span>
                  <span>102 (79.7%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '79.7%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Trial</span>
                  <span>18 (14.1%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '14.1%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Suspended</span>
                  <span>6 (4.7%)</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '4.7%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
