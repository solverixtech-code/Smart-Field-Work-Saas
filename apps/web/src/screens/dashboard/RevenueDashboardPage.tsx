import React, { useState } from 'react';
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Download,
  CheckCircle2,
  Building2,
  ArrowUpRight,
  Receipt,
  RotateCcw,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';

const revenueVsCollectionsData = [
  { date: 'May 12', revenue: 1600000, collections: 1200000 },
  { date: 'May 13', revenue: 2000000, collections: 1500000 },
  { date: 'May 14', revenue: 1900000, collections: 1450000 },
  { date: 'May 15', revenue: 2300000, collections: 1800000 },
  { date: 'May 16', revenue: 2100000, collections: 1750000 },
  { date: 'May 17', revenue: 1800000, collections: 1400000 },
  { date: 'May 18', revenue: 2150000, collections: 1780000 },
];

const revenueByPlanData = [
  { name: 'Enterprise', value: 985600, pct: '39.6%', color: '#2563EB' },
  { name: 'Professional', value: 645200, pct: '26.0%', color: '#10B981' },
  { name: 'Growth', value: 425800, pct: '17.1%', color: '#F59E0B' },
  { name: 'Starter', value: 215400, pct: '8.7%', color: '#8B5CF6' },
  { name: 'Free / Trial', value: 113600, pct: '4.6%', color: '#64748B' },
];

const invoicesOverviewData = [
  { name: 'Paid', value: 210, pct: '56.5%', color: '#10B981' },
  { name: 'Partially Paid', value: 68, pct: '18.3%', color: '#2563EB' },
  { name: 'Pending', value: 62, pct: '16.7%', color: '#F59E0B' },
  { name: 'Overdue', value: 22, pct: '5.9%', color: '#E20613' },
  { name: 'Cancelled', value: 10, pct: '2.6%', color: '#64748B' },
];

const monthlyRevenueThisYear = [
  { month: 'Jan', revenue: 1200000 },
  { month: 'Feb', revenue: 1400000 },
  { month: 'Mar', revenue: 1550000 },
  { month: 'Apr', revenue: 1850000 },
  { month: 'May', revenue: 2485600 },
  { month: 'Jun', revenue: 1650000 },
  { month: 'Jul', revenue: 1900000 },
  { month: 'Aug', revenue: 1500000 },
  { month: 'Sep', revenue: 1750000 },
  { month: 'Oct', revenue: 2100000 },
  { month: 'Nov', revenue: 2250000 },
  { month: 'Dec', revenue: 2600000 },
];

const revenueByBusinessData = [
  { name: 'Reliance Fresh', revenue: '₹3,65,400', collections: '₹3,32,100', outstanding: '₹33,300', rate: '90.9%' },
  { name: 'Shree Traders', revenue: '₹2,85,600', collections: '₹2,56,400', outstanding: '₹29,200', rate: '89.8%' },
  { name: 'Sai Super Market', revenue: '₹2,45,200', collections: '₹2,21,600', outstanding: '₹23,600', rate: '90.4%' },
  { name: 'Galaxy Retail', revenue: '₹2,15,300', collections: '₹1,92,800', outstanding: '₹22,500', rate: '89.6%' },
  { name: 'Sharma Enterprises', revenue: '₹1,85,400', collections: '₹1,67,800', outstanding: '₹17,600', rate: '90.5%' },
];

const recentTransactions = [
  { inv: 'INV-2025-0372', client: 'Reliance Fresh', amount: '₹24,800', status: 'Paid', date: '18 May 2025' },
  { inv: 'INV-2025-0371', client: 'Shree Traders', amount: '₹18,600', status: 'Paid', date: '18 May 2025' },
  { inv: 'INV-2025-0370', client: 'Sai Super Market', amount: '₹12,400', status: 'Partial', date: '18 May 2025' },
  { inv: 'INV-2025-0369', client: 'Galaxy Retail', amount: '₹9,800', status: 'Overdue', date: '17 May 2025' },
];

export default function RevenueDashboardPage() {
  const [selectedBusiness, setSelectedBusiness] = useState('All Businesses');

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Revenue Dashboard</h1>
          <p className="text-xs font-normal text-slate-600 mt-0.5">
            Overview of revenue, collections and financial performance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D]">
            <option>May 12 – May 18, 2025</option>
          </select>

          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0D1F3D]"
          >
            <option>All Businesses</option>
            <option>Reliance Fresh</option>
            <option>Shree Traders</option>
            <option>Sai Super Market</option>
          </select>

          <Button
            variant="accent"
            size="sm"
            onClick={() => alert('Exporting Financial Report...')}
            className="flex items-center gap-2 font-semibold shadow-xs"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* 6 TOP KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total Revenue"
          value="₹24,85,600"
          change="+18.6%"
          changeType="positive"
          timeframe="vs last week"
          icon={DollarSign}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-700"
        />
        <KpiCard
          title="Total Collections"
          value="₹22,45,200"
          change="+16.3%"
          changeType="positive"
          timeframe="vs last week"
          icon={CreditCard}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
        <KpiCard
          title="Invoices Generated"
          value="372"
          change="+12.7%"
          changeType="positive"
          timeframe="vs last week"
          icon={Receipt}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-700"
        />
        <KpiCard
          title="Refunds Issued"
          value="₹48,600"
          change="+8.4%"
          changeType="negative"
          timeframe="vs last week"
          icon={RotateCcw}
          iconBgColor="bg-red-50"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Outstanding Amount"
          value="₹2,40,400"
          change="-6.2%"
          changeType="positive"
          timeframe="vs last week"
          icon={DollarSign}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-700"
        />
        <KpiCard
          title="Collection Rate"
          value="90.3%"
          change="+2.4%"
          changeType="positive"
          timeframe="vs last week"
          icon={Percent}
          iconBgColor="bg-teal-50"
          iconTextColor="text-teal-700"
        />
      </div>

      {/* MIDDLE SECTION: Revenue Trend + Revenue by Plan + Revenue Summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Revenue Trend Line Chart (5 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0D1F3D]">Revenue Trend</h3>
            <select className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#0D1F3D]">
              <option>This Week</option>
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-600"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Revenue</span>
            <span className="flex items-center gap-1.5 text-emerald-600"><span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Collections</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueVsCollectionsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 100000}L`} />
                <Tooltip
                  position={{ y: -15 }}
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                  formatter={(val: any, name: any) => [`₹${Number(val || 0).toLocaleString()}`, name]}
                />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="collections" name="Collections" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Plan Donut Chart (4 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4 space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-[#0D1F3D]">Revenue by Plan</h3>

          <div className="flex flex-col items-center">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByPlanData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {revenueByPlanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any) => [`₹${Number(val || 0).toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-sm font-extrabold text-[#0D1F3D]">₹24,85,600</span>
                <span className="text-[10px] font-semibold text-slate-500">Total Revenue</span>
              </div>
            </div>

            <div className="w-full space-y-1.5 text-xs font-semibold text-slate-700 mt-2">
              {revenueByPlanData.map((p) => (
                <div key={p.name} className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </span>
                  <span className="font-bold text-[#0D1F3D]">₹{p.value.toLocaleString()} ({p.pct})</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View Detailed Report <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Revenue Summary (3 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-[#0D1F3D]">Revenue Summary</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between font-medium text-slate-600"><span>MRR (Monthly Recurring Revenue)</span><span className="font-bold text-[#0D1F3D]">₹21,30,400</span></div>
            <div className="flex justify-between font-medium text-slate-600"><span>ARR (Annual Recurring Revenue)</span><span className="font-bold text-[#0D1F3D]">₹2,55,64,800</span></div>
            <div className="flex justify-between font-medium text-slate-600"><span>One-time Revenue</span><span className="font-bold text-slate-800">₹3,55,200</span></div>
            <div className="flex justify-between font-medium text-slate-600"><span>Average Revenue / Customer</span><span className="font-bold text-slate-800">₹2,850</span></div>
            <div className="flex justify-between font-medium text-slate-600"><span>New Revenue (This Week)</span><span className="font-bold text-emerald-600">₹3,25,600</span></div>
            <div className="flex justify-between font-medium text-slate-600"><span>Churned Revenue (This Week)</span><span className="font-bold text-[#E20613]">₹45,200</span></div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View Full Report <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Revenue by Business + Invoices Overview + Monthly Revenue */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Revenue by Business (5 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0D1F3D]">Revenue by Business</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-800">
                  <th className="py-2.5 px-3">Business Name</th>
                  <th className="py-2.5 px-3 text-right">Revenue (₹)</th>
                  <th className="py-2.5 px-3 text-right">Collections (₹)</th>
                  <th className="py-2.5 px-3 text-right">Outstanding (₹)</th>
                  <th className="py-2.5 px-3 text-center">Collection Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {revenueByBusinessData.map((b) => (
                  <tr key={b.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#0D1F3D]">{b.name}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{b.revenue}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">{b.collections}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{b.outstanding}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{b.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View Business Report <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Invoices Overview Donut (3 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0D1F3D]">Invoices Overview</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={invoicesOverviewData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {invoicesOverviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                    formatter={(val: any) => [`${val} Invoices`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-[#0D1F3D]">372</span>
                <span className="text-[10px] font-semibold text-slate-500">Total Invoices</span>
              </div>
            </div>

            <div className="w-full space-y-1 text-[11px] font-semibold text-slate-700 mt-2">
              {invoicesOverviewData.map((i) => (
                <div key={i.name} className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: i.color }} />
                    {i.name}
                  </span>
                  <span className="font-bold text-[#0D1F3D]">{i.value} ({i.pct})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Revenue (This Year) Bar Chart (4 Cols) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0D1F3D]">Monthly Revenue (This Year)</h3>
            <select className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#0D1F3D]">
              <option>This Year</option>
            </select>
          </div>

          <div className="h-56 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenueThisYear} margin={{ top: 20, right: 10, left: 10, bottom: 0 }} barCategoryGap="12%" barSize={16}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'rgba(13, 31, 61, 0.04)' }}
                  position={{ y: -15 }}
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '12px', border: 'none' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                  formatter={(val: any) => [`₹${Number(val || 0).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {monthlyRevenueThisYear.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#2563EB' : '#93C5FD'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View Monthly Report <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
