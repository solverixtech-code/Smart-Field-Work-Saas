import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Users,
  TrendingUp,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Calendar,
  Download,
  Info,
  ChevronDown,
  Layers,
  Tag,
  Shield,
  FileText,
  UserPlus,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function PlatformDashboardPage() {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('May 20 - Jun 18, 2025');
  const [mrrTimeframe, setMrrTimeframe] = useState('Last 30 Days');

  // KPI summary statistics
  const kpis = [
    {
      title: 'Total Tenants',
      value: '128',
      change: '↑ 12 this month',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
      icon: Building2,
    },
    {
      title: 'Active Tenants',
      value: '102',
      change: '79.7% of total',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      icon: CheckCircle2,
    },
    {
      title: 'Trial Tenants',
      value: '18',
      change: '14.1% of total',
      color: 'text-amber-600 bg-amber-50 border-amber-100',
      icon: Clock,
    },
    {
      title: 'Suspended Tenants',
      value: '6',
      change: '4.7% of total',
      color: 'text-rose-600 bg-rose-50 border-rose-100',
      icon: AlertOctagon,
    },
    {
      title: 'Total SaaS Users',
      value: '2,845',
      change: '↑ 156 this month',
      color: 'text-purple-600 bg-purple-50 border-purple-100',
      icon: Users,
    },
    {
      title: 'MRR',
      value: '₹28,74,320',
      change: '↑ 18.6% vs last month',
      color: 'text-sky-600 bg-sky-50 border-sky-100',
      icon: TrendingUp,
    },
  ];

  // Industry breakdown donut data
  const industries = [
    { name: 'Pharma', count: 24, percentage: '18.8%', color: 'bg-blue-600' },
    { name: 'FMCG', count: 20, percentage: '15.6%', color: 'bg-emerald-500' },
    { name: 'Distributors', count: 18, percentage: '14.1%', color: 'bg-indigo-500' },
    { name: 'Manufacturing', count: 16, percentage: '12.5%', color: 'bg-teal-500' },
    { name: 'Solar', count: 12, percentage: '9.4%', color: 'bg-amber-500' },
    { name: 'Services', count: 10, percentage: '7.8%', color: 'bg-rose-500' },
    { name: 'Other', count: 28, percentage: '21.9%', color: 'bg-slate-400' },
  ];

  // Plan breakdown donut data
  const plans = [
    { name: 'Enterprise', count: 32, percentage: '25.0%', color: 'bg-blue-600' },
    { name: 'Growth', count: 46, percentage: '35.9%', color: 'bg-emerald-500' },
    { name: 'Professional', count: 34, percentage: '26.6%', color: 'bg-amber-500' },
    { name: 'Starter', count: 16, percentage: '12.5%', color: 'bg-rose-500' },
  ];

  // Recent signups table
  const recentSignups = [
    { tenant: 'Genix Pharma Pvt Ltd', industry: 'Pharma', plan: 'Growth', users: 12, signedUp: '18 Jun, 2025' },
    { tenant: 'Sunrise Solar Solutions', industry: 'Solar', plan: 'Professional', users: 8, signedUp: '17 Jun, 2025' },
    { tenant: 'Metro Distributors', industry: 'Distributors', plan: 'Growth', users: 15, signedUp: '16 Jun, 2025' },
    { tenant: 'Krishna FMCG Pvt Ltd', industry: 'FMCG', plan: 'Enterprise', users: 28, signedUp: '15 Jun, 2025' },
    { tenant: 'Vertex Manufacturing', industry: 'Manufacturing', plan: 'Professional', users: 6, signedUp: '15 Jun, 2025' },
  ];

  // Upcoming renewals table
  const upcomingRenewals = [
    { tenant: 'Blue Star Distributors', plan: 'Enterprise', date: '22 Jun, 2025', amount: '₹1,49,999' },
    { tenant: 'Sagar Pharma', plan: 'Growth', date: '25 Jun, 2025', amount: '₹49,999' },
    { tenant: 'Apex Solar Pvt Ltd', plan: 'Professional', date: '27 Jun, 2025', amount: '₹29,999' },
    { tenant: 'Om Sai FMCG', plan: 'Growth', date: '30 Jun, 2025', amount: '₹49,999' },
    { tenant: 'Bright Services', plan: 'Professional', date: '01 Jul, 2025', amount: '₹29,999' },
  ];

  // Top active tenants (user count)
  const topTenants = [
    { name: 'Krishna FMCG Pvt Ltd', users: 120, percentage: 95 },
    { name: 'Genix Pharma Pvt Ltd', users: 98, percentage: 78 },
    { name: 'Metro Distributors', users: 85, percentage: 68 },
    { name: 'Blue Star Distributors', users: 72, percentage: 58 },
    { name: 'Sagar Pharma', users: 65, percentage: 52 },
  ];

  // Platform recent activity feed
  const recentActivities = [
    { title: 'New tenant registered - Genix Pharma Pvt Ltd', time: '18 Jun, 2025 10:24 AM', icon: Building2, color: 'bg-blue-100 text-blue-600' },
    { title: 'Payment received from Metro Distributors', time: '18 Jun, 2025 09:16 AM', amount: '₹49,999', icon: CreditCard, color: 'bg-emerald-100 text-emerald-600' },
    { title: 'Tenant suspended - Old Age Home Services', time: '18 Jun, 2025 08:42 AM', icon: AlertTriangle, color: 'bg-rose-100 text-rose-600' },
    { title: 'Plan upgraded - Apex Solar Pvt Ltd (Professional → Growth)', time: '17 Jun, 2025 06:15 PM', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { title: 'New user added - Rajesh Kumar (Sagar Pharma)', time: '17 Jun, 2025 04:33 PM', icon: UserPlus, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Platform Dashboard</h1>
          <p className="text-xs font-medium text-slate-500">
            Overview of your Smart Field Work SaaS Platform
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Picker Button */}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{dateRange}</span>
          </button>

          {/* Export Report Button */}
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/platform/reports')}
            className="gap-2 font-bold shadow-sm"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* Top 6 KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:shadow-md transition"
            >
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

      {/* Middle Row 1: Charts (MRR Trend, Tenants by Industry, Tenants by Plan) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* MRR Trend Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-[#0D1F3D]">MRR Trend</h3>
                <Info className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <div className="relative">
                <select
                  value={mrrTimeframe}
                  onChange={(e) => setMrrTimeframe(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option>Last 30 Days</option>
                  <option>Last 90 Days</option>
                  <option>This Year</option>
                </select>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-extrabold text-[#0D1F3D]">₹28,74,320</span>
              <span className="text-xs font-bold text-emerald-600">▲ 18.6% vs last month</span>
            </div>

            {/* Simulated Line / Area Chart */}
            <div className="h-44 w-full pt-4">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Y Gridlines */}
                <line x1="0" y1="20" x2="400" y2="20" stroke="#F1F5F9" strokeDasharray="4 4" />
                <line x1="0" y1="60" x2="400" y2="60" stroke="#F1F5F9" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="400" y2="100" stroke="#F1F5F9" strokeDasharray="4 4" />

                {/* Area */}
                <path
                  d="M0,80 Q50,75 100,70 T200,55 T300,45 T400,30 L400,120 L0,120 Z"
                  fill="url(#mrrGrad)"
                />

                {/* Line */}
                <path
                  d="M0,80 Q50,75 100,70 T200,55 T300,45 T400,30"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                />

                {/* Dots */}
                <circle cx="0" cy="80" r="4" fill="#2563EB" stroke="#fff" strokeWidth="2" />
                <circle cx="100" cy="70" r="4" fill="#2563EB" stroke="#fff" strokeWidth="2" />
                <circle cx="200" cy="55" r="4" fill="#2563EB" stroke="#fff" strokeWidth="2" />
                <circle cx="300" cy="45" r="4" fill="#2563EB" stroke="#fff" strokeWidth="2" />
                <circle cx="400" cy="30" r="4" fill="#2563EB" stroke="#fff" strokeWidth="2" />
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between pt-2 text-[10px] font-semibold text-slate-400">
                <span>May 20</span>
                <span>May 27</span>
                <span>Jun 03</span>
                <span>Jun 10</span>
                <span>Jun 18</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants by Industry Donut Chart Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0D1F3D] mb-4">Tenants by Industry</h3>

            <div className="flex items-center gap-6">
              {/* Donut graphic */}
              <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="4"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4.5"
                    strokeDasharray="25, 100"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4.5"
                    strokeDasharray="20, 100"
                    strokeDashoffset="-25"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="4.5"
                    strokeDasharray="18, 100"
                    strokeDashoffset="-45"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="4.5"
                    strokeDasharray="15, 100"
                    strokeDashoffset="-63"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-xl font-extrabold text-[#0D1F3D]">128</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-1.5">
                {industries.slice(0, 5).map((ind, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${ind.color}`} />
                      <span className="text-slate-600">{ind.name}</span>
                    </div>
                    <span className="text-[#0D1F3D] font-bold">
                      {ind.count} ({ind.percentage})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/platform/industries')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              View all industries <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tenants by Plan Donut Chart Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0D1F3D] mb-4">Tenants by Plan</h3>

            <div className="flex items-center gap-6">
              {/* Donut graphic */}
              <div className="relative flex h-36 w-36 shrink-0 items-center justify-center">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="4"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#2563EB"
                    strokeWidth="4.5"
                    strokeDasharray="36, 100"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="4.5"
                    strokeDasharray="26, 100"
                    strokeDashoffset="-36"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="4.5"
                    strokeDasharray="25, 100"
                    strokeDashoffset="-62"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="4.5"
                    strokeDasharray="13, 100"
                    strokeDashoffset="-87"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-xl font-extrabold text-[#0D1F3D]">128</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-2">
                {plans.map((pl, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${pl.color}`} />
                      <span className="text-slate-600">{pl.name}</span>
                    </div>
                    <span className="text-[#0D1F3D] font-bold">
                      {pl.count} ({pl.percentage})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <button
              type="button"
              onClick={() => navigate('/platform/plans')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              View all plans <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row 2: Recent Signups, Renewals, Status Overview + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Tenant Signups Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0D1F3D] mb-3">Recent Tenant Signups</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="pb-2">Tenant</th>
                    <th className="pb-2">Industry</th>
                    <th className="pb-2">Plan</th>
                    <th className="pb-2">Users</th>
                    <th className="pb-2 text-right">Signed Up</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {recentSignups.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 font-bold text-blue-600 hover:underline cursor-pointer">
                        {s.tenant}
                      </td>
                      <td className="py-2.5 text-slate-600">{s.industry}</td>
                      <td className="py-2.5 text-slate-700 font-semibold">{s.plan}</td>
                      <td className="py-2.5 text-slate-700">{s.users}</td>
                      <td className="py-2.5 text-slate-500 text-right">{s.signedUp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 text-center">
            <button
              type="button"
              onClick={() => navigate('/platform/tenants')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              View all tenants <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Upcoming Renewals Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0D1F3D] mb-3">Upcoming Renewals</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="pb-2">Tenant</th>
                    <th className="pb-2">Plan</th>
                    <th className="pb-2">Renewal Date</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {upcomingRenewals.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 font-bold text-slate-800">{r.tenant}</td>
                      <td className="py-2.5 text-slate-600">{r.plan}</td>
                      <td className="py-2.5 text-slate-500">{r.date}</td>
                      <td className="py-2.5 text-right font-bold text-[#0D1F3D]">{r.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 text-center">
            <button
              type="button"
              onClick={() => navigate('/platform/subscriptions')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
            >
              View all renewals <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Tenant Status Overview + Quick Actions */}
        <div className="flex flex-col gap-6">
          {/* Status Progress Bars */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Tenant Status Overview</h3>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Active</span>
                  <span>102 (79.7%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '79.7%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Trial</span>
                  <span>18 (14.1%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '14.1%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Suspended</span>
                  <span>6 (4.7%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: '4.7%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Cancelled</span>
                  <span>2 (1.6%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: '1.6%' }} />
                </div>
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => navigate('/platform/tenants')}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View all tenants <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-2">
            <h4 className="text-xs font-extrabold text-[#0D1F3D] px-2 mb-1 uppercase tracking-wider">
              Quick Actions
            </h4>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate('/platform/tenants/create')}
              className="w-full justify-start gap-2 font-bold shadow-xs py-2"
            >
              <Plus className="h-4 w-4" /> Create Tenant
            </Button>
            <button
              type="button"
              onClick={() => navigate('/platform/tenants')}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-slate-500" /> All Tenants</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 -rotate-90" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/platform/plans')}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2"><Tag className="h-3.5 w-3.5 text-slate-500" /> Manage Plans</span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 -rotate-90" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/platform/tenants/requests')}
              className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5 text-slate-500" /> Tenant Requests
              </span>
              <span className="rounded-full bg-red-500 px-1.5 py-0.2 text-[10px] font-extrabold text-white">8</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Platform Usage, Top Active Tenants, Recent Platform Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Platform Usage Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0D1F3D]">Platform Usage</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-bold text-slate-500">Users</p>
              <p className="text-lg font-extrabold text-[#0D1F3D]">2,845 / 5,000</p>
              <p className="text-[10px] font-bold text-blue-600 mt-1">56.9%</p>
              <div className="h-1.5 w-full rounded-full bg-slate-200 mt-1">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '56.9%' }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-bold text-slate-500">Storage</p>
              <p className="text-lg font-extrabold text-[#0D1F3D]">284.6 GB / 1 TB</p>
              <p className="text-[10px] font-bold text-emerald-600 mt-1">27.8%</p>
              <div className="h-1.5 w-full rounded-full bg-slate-200 mt-1">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '27.8%' }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-bold text-slate-500">AI Credits</p>
              <p className="text-lg font-extrabold text-[#0D1F3D]">45,320 / 100k</p>
              <p className="text-[10px] font-bold text-purple-600 mt-1">45.3%</p>
              <div className="h-1.5 w-full rounded-full bg-slate-200 mt-1">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '45.3%' }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-[11px] font-bold text-slate-500">API Calls</p>
              <p className="text-lg font-extrabold text-[#0D1F3D]">1.2M / 5M</p>
              <p className="text-[10px] font-bold text-amber-600 mt-1">24.0%</p>
              <div className="h-1.5 w-full rounded-full bg-slate-200 mt-1">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '24.0%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Top Active Tenants (Users) Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0D1F3D] mb-3">Top Active Tenants (Users)</h3>
            <div className="space-y-3">
              {topTenants.map((t, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{t.name}</span>
                    <span className="text-[#0D1F3D]">{t.users}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${t.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 text-center">
            <button
              type="button"
              onClick={() => navigate('/platform/tenants')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View all tenants <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Platform Activity Feed */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0D1F3D] mb-3">Recent Platform Activity</h3>
            <div className="space-y-3">
              {recentActivities.map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${act.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 leading-snug">{act.title}</p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">{act.time}</p>
                    </div>
                    {act.amount && (
                      <span className="font-bold text-emerald-600 text-xs">{act.amount}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 text-center">
            <button
              type="button"
              onClick={() => navigate('/platform/audit')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View all activity <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
