import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  Target,
  Users,
  Award,
  CheckCircle2,
  PieChart,
  ShoppingBag,
  Zap,
  DollarSign,
  Clock,
  MapPin,
  Check,
  AlertCircle,
  FileText,
  Activity,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import {
  DateRangePicker,
  DateRange,
} from "../../components/ui/DateRangePicker";
import { Select } from "../../components/ui/Select";
import { MapKpiCard } from "../../components/maps/MapKpiCard";
import {
  mockTerritoriesList,
  mockTerritoryExecutives,
} from "./territoriesData";

export default function TerritoryPerformancePage() {
  const { territoryId } = useParams();
  const navigate = useNavigate();

  // Tab State
  const [activeSubTab, setActiveSubTab] = useState("Overview");

  // Date Range State
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    label: "01 May 2025 - 20 May 2025",
    startDate: "2025-05-01",
    endDate: "2025-05-20",
  });

  // Compare Filter State
  const [compareFilter, setCompareFilter] = useState("none");

  const territory =
    mockTerritoriesList.find(
      (t) => t.id === territoryId || t.code === territoryId,
    ) || mockTerritoriesList[0];

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
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">
                Territory Performance
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                • {territory.status}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Track and analyze overall performance of {territory.name}{" "}
              territory
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Actual Reusable DateRangePicker Component */}
            <DateRangePicker
              value={selectedDateRange}
              onChange={(range) => setSelectedDateRange(range)}
            />

            {/* Actual Reusable Select Component */}
            <div className="w-48">
              <Select
                value={compareFilter}
                onChange={(e) => setCompareFilter(e.target.value)}
                options={[
                  { value: "none", label: "Compare: None" },
                  { value: "previous-month", label: "vs Previous Month" },
                  { value: "previous-year", label: "vs Previous Year" },
                ]}
                searchable={false}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Exporting Performance Report...")}
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
            <span className="font-extrabold text-[#0D1F3D]">
              {territory.managerName}
            </span>
            <span className="text-[10px] text-slate-400 font-bold">
              ({territory.managerRole})
            </span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 block">Team Size</span>
            <span className="font-extrabold text-[#0D1F3D]">14 Executives</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 block">
              Coverage Area
            </span>
            <span className="font-extrabold text-slate-700">
              {territory.areaKm2} km²
            </span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 block">
              Total Businesses
            </span>
            <span className="font-extrabold text-[#0D1F3D]">168</span>
          </div>

          <div className="border-l border-slate-200 pl-4">
            <span className="text-[10px] text-slate-400 block">
              Active Businesses
            </span>
            <span className="font-extrabold text-emerald-600">142</span>
          </div>
        </div>
      </div>

      {/* Sub-tabs Navigation Bar */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none pb-0.5">
        {[
          "Overview",
          "Leads & Visits",
          "Sales & Revenue",
          "Collections",
          "Demos & Conversions",
          "Performance by Executive",
          "Targets vs Achievement",
          "Trends",
          "Activities",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-3 py-2 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeSubTab === tab
                ? "border-red-600 text-red-600 bg-white"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* DYNAMIC SUB-TAB CONTENT VIEWS */}
      {activeSubTab === "Overview" && (
        <div className="space-y-4">
          {/* Top Metrics Cards */}
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

          {/* Analytics Dashboard Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Visits Trend */}
                <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-extrabold text-[#0D1F3D]">
                      Visits Trend
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Daily
                    </span>
                  </div>
                  <div className="h-40 w-full flex items-end justify-between gap-1 pt-4 px-2 bg-slate-50/50 rounded-sm">
                    {[
                      12, 18, 22, 16, 25, 20, 28, 24, 19, 30, 26, 32, 28, 22,
                      18,
                    ].map((val, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
                        <div
                          className="w-full bg-emerald-500 rounded-t-xs hover:bg-emerald-600 transition-all"
                          style={{ height: `${val * 3.5}px` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
                      Completed
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-red-500" />{" "}
                      Missed
                    </span>
                  </div>
                </div>

                {/* Revenue Trend */}
                <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-extrabold text-[#0D1F3D]">
                      Revenue Trend (₹)
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Daily
                    </span>
                  </div>
                  <div className="h-40 w-full flex items-end justify-between gap-1 pt-4 px-2 bg-blue-50/20 rounded-sm border border-blue-100">
                    {[
                      45, 65, 80, 50, 95, 70, 110, 85, 60, 130, 90, 120, 100,
                      75, 55,
                    ].map((val, i) => (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center gap-1"
                      >
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
                            <span className="font-extrabold text-[#0D1F3D]">
                              {exec.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 text-center font-bold">
                          {exec.visitsCount}
                        </td>
                        <td className="py-2.5 text-center font-bold">
                          {Math.floor(exec.visitsCount * 0.6)}
                        </td>
                        <td className="py-2.5 text-center font-bold">
                          {Math.floor(exec.visitsCount * 0.25)}
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold">
                          {exec.revenueFormatted}
                        </td>
                        <td className="py-2.5 text-center font-extrabold text-emerald-600">
                          {exec.performancePercentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 lg:col-span-4">
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
        </div>
      )}

      {/* TAB 2: LEADS & VISITS SCREEN */}
      {activeSubTab === "Leads & Visits" && (
        <div className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Total Visits Logged
              </span>
              <span className="text-xl font-extrabold text-[#0D1F3D]">176</span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Completed Visits
              </span>
              <span className="text-xl font-extrabold text-emerald-600">
                142
              </span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Missed / Unverified
              </span>
              <span className="text-xl font-extrabold text-red-600">34</span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Lead Conversion Rate
              </span>
              <span className="text-xl font-extrabold text-purple-600">
                28.6%
              </span>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Recent Visits Roster in {territory.name}
            </h3>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                  <th className="p-2.5">Date & Time</th>
                  <th className="p-2.5">Executive</th>
                  <th className="p-2.5">Business Name</th>
                  <th className="p-2.5">Purpose</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {
                    time: "20 May, 10:30 AM",
                    exec: "Arjun Mehta",
                    business: "Sai Enterprises",
                    purpose: "Product Demo",
                    status: "Completed",
                    ver: "GPS Verified",
                  },
                  {
                    time: "20 May, 11:45 AM",
                    exec: "Neha Sharma",
                    business: "Sharma Medical",
                    purpose: "Payment Collection",
                    status: "Completed",
                    ver: "GPS Verified",
                  },
                  {
                    time: "20 May, 02:15 PM",
                    exec: "Pooja Yadav",
                    business: "Marol Electronics",
                    purpose: "Lead Follow-up",
                    status: "Completed",
                    ver: "GPS Verified",
                  },
                  {
                    time: "19 May, 04:30 PM",
                    exec: "Rahul Verma",
                    business: "Apex Traders",
                    purpose: "Store Onboarding",
                    status: "Missed",
                    ver: "Unverified",
                  },
                ].map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-500">{v.time}</td>
                    <td className="p-2.5 font-extrabold text-[#0D1F3D]">
                      {v.exec}
                    </td>
                    <td className="p-2.5">{v.business}</td>
                    <td className="p-2.5 text-slate-600">{v.purpose}</td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${v.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                      >
                        • {v.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-center text-slate-500 font-mono text-[10px]">
                      {v.ver}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SALES & REVENUE SCREEN */}
      {activeSubTab === "Sales & Revenue" && (
        <div className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Total Revenue
              </span>
              <span className="text-xl font-extrabold text-emerald-600">
                ₹ 14,00,000
              </span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Deals Closed
              </span>
              <span className="text-xl font-extrabold text-[#0D1F3D]">28</span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Avg. Deal Value
              </span>
              <span className="text-xl font-extrabold text-blue-600">
                ₹ 50,000
              </span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Target Achievement
              </span>
              <span className="text-xl font-extrabold text-amber-600">
                106%
              </span>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Recent Sales & Deals Closed
            </h3>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                  <th className="p-2.5">Deal ID</th>
                  <th className="p-2.5">Business Name</th>
                  <th className="p-2.5">Executive</th>
                  <th className="p-2.5">Product / Package</th>
                  <th className="p-2.5 text-right">Amount (₹)</th>
                  <th className="p-2.5 text-center">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {
                    id: "DEAL-901",
                    name: "Sai Enterprises",
                    exec: "Arjun Mehta",
                    pkg: "Enterprise POS",
                    amount: "₹ 2,48,000",
                    method: "UPI / Bank",
                  },
                  {
                    id: "DEAL-902",
                    name: "Sharma Medical",
                    exec: "Neha Sharma",
                    pkg: "Pharma Pro Plan",
                    amount: "₹ 1,96,000",
                    method: "Cheque",
                  },
                  {
                    id: "DEAL-903",
                    name: "Marol Electronics",
                    exec: "Pooja Yadav",
                    pkg: "Retail Starter",
                    amount: "₹ 1,58,000",
                    method: "Online Transfer",
                  },
                  {
                    id: "DEAL-904",
                    name: "Apex Traders",
                    exec: "Rahul Verma",
                    pkg: "ERP Sync Pack",
                    amount: "₹ 1,20,000",
                    method: "UPI",
                  },
                ].map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-500">{d.id}</td>
                    <td className="p-2.5 font-extrabold text-[#0D1F3D]">
                      {d.name}
                    </td>
                    <td className="p-2.5">{d.exec}</td>
                    <td className="p-2.5 text-slate-600">{d.pkg}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                      {d.amount}
                    </td>
                    <td className="p-2.5 text-center text-slate-500 font-mono text-[10px]">
                      {d.method}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COLLECTIONS SCREEN */}
      {activeSubTab === "Collections" && (
        <div className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Total Billed
              </span>
              <span className="text-xl font-extrabold text-[#0D1F3D]">
                ₹ 15,20,000
              </span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Collected
              </span>
              <span className="text-xl font-extrabold text-emerald-600">
                ₹ 14,00,000
              </span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Outstanding
              </span>
              <span className="text-xl font-extrabold text-amber-600">
                ₹ 1,20,000
              </span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Collection Efficiency
              </span>
              <span className="text-xl font-extrabold text-blue-600">
                92.1%
              </span>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Payment Collections & Invoices
            </h3>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                  <th className="p-2.5">Invoice #</th>
                  <th className="p-2.5">Business Name</th>
                  <th className="p-2.5">Due Date</th>
                  <th className="p-2.5 text-right">Amount (₹)</th>
                  <th className="p-2.5 text-center">Status</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  {
                    inv: "INV-2025-081",
                    name: "Sai Enterprises",
                    due: "15 May 2025",
                    amount: "₹ 2,48,000",
                    status: "Paid",
                  },
                  {
                    inv: "INV-2025-082",
                    name: "Sharma Medical",
                    due: "18 May 2025",
                    amount: "₹ 1,96,000",
                    status: "Paid",
                  },
                  {
                    inv: "INV-2025-083",
                    name: "Marol Supermarket",
                    due: "22 May 2025",
                    amount: "₹ 85,000",
                    status: "Pending",
                  },
                  {
                    inv: "INV-2025-084",
                    name: "Metro Clinic",
                    due: "10 May 2025",
                    amount: "₹ 35,000",
                    status: "Overdue",
                  },
                ].map((row) => (
                  <tr key={row.inv} className="hover:bg-slate-50">
                    <td className="p-2.5 font-mono text-slate-500">
                      {row.inv}
                    </td>
                    <td className="p-2.5 font-extrabold text-[#0D1F3D]">
                      {row.name}
                    </td>
                    <td className="p-2.5 font-mono text-slate-600">
                      {row.due}
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold">
                      {row.amount}
                    </td>
                    <td className="p-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.status === "Paid" ? "bg-emerald-50 text-emerald-700" : row.status === "Pending" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}
                      >
                        • {row.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toast.info(`Reminder sent for ${row.inv}`)
                        }
                        className="text-[10px] py-0.5 px-2"
                      >
                        Send Reminder
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: DEMOS & CONVERSIONS SCREEN */}
      {activeSubTab === "Demos & Conversions" && (
        <div className="space-y-4 text-xs font-semibold">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Demos Scheduled
              </span>
              <span className="text-xl font-extrabold text-[#0D1F3D]">45</span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Demos Conducted
              </span>
              <span className="text-xl font-extrabold text-emerald-600">
                36
              </span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Deals Converted
              </span>
              <span className="text-xl font-extrabold text-purple-600">28</span>
            </div>
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
              <span className="text-[10px] text-slate-400 block">
                Demo Win Rate
              </span>
              <span className="text-xl font-extrabold text-amber-600">
                77.7%
              </span>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Executive Demo Conversion Performance
            </h3>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                  <th className="p-2.5">Executive</th>
                  <th className="p-2.5 text-center">Demos Conducted</th>
                  <th className="p-2.5 text-center">Deals Closed</th>
                  <th className="p-2.5 text-center">Demo Conversion %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: "Arjun Mehta", demos: 12, closed: 10, rate: "83.3%" },
                  { name: "Neha Sharma", demos: 10, closed: 8, rate: "80.0%" },
                  { name: "Pooja Yadav", demos: 8, closed: 6, rate: "75.0%" },
                  { name: "Rahul Verma", demos: 6, closed: 4, rate: "66.7%" },
                ].map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50">
                    <td className="p-2.5 font-extrabold text-[#0D1F3D]">
                      {row.name}
                    </td>
                    <td className="p-2.5 text-center font-bold">{row.demos}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-600">
                      {row.closed}
                    </td>
                    <td className="p-2.5 text-center font-extrabold text-blue-600">
                      {row.rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: PERFORMANCE BY EXECUTIVE SCREEN */}
      {activeSubTab === "Performance by Executive" && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Territory Executive Leaderboard ({mockTerritoryExecutives.length}{" "}
            Members)
          </h3>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 text-[11px]">
                <th className="p-3">Executive</th>
                <th className="p-3">Team</th>
                <th className="p-3 text-center">Visits</th>
                <th className="p-3 text-center">New Leads</th>
                <th className="p-3 text-right">Revenue (₹)</th>
                <th className="p-3 text-center">Target Achievement</th>
                <th className="p-3 text-center">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockTerritoryExecutives.map((exec) => (
                <tr key={exec.id} className="hover:bg-slate-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={exec.avatar}
                        alt={exec.name}
                        className="h-7 w-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <span className="font-extrabold text-[#0D1F3D] block">
                          {exec.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {exec.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-slate-600">{exec.team}</td>
                  <td className="p-3 text-center font-bold">
                    {exec.visitsCount}
                  </td>
                  <td className="p-3 text-center font-bold">
                    {Math.floor(exec.visitsCount * 0.6)}
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">
                    {exec.revenueFormatted}
                  </td>
                  <td className="p-3 text-center font-extrabold text-blue-600">
                    {exec.performancePercentage}%
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${exec.performancePercentage >= 95 ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}
                    >
                      {exec.performancePercentage >= 95
                        ? "⭐ Top Performer"
                        : "On Track"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 7: TARGETS VS ACHIEVEMENT SCREEN */}
      {activeSubTab === "Targets vs Achievement" && (
        <div className="space-y-4 text-xs font-semibold">
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Territory Targets Breakdown (May 2025)
            </h3>

            <div className="space-y-3">
              {mockTerritoryExecutives.map((exec) => (
                <div
                  key={exec.id}
                  className="space-y-1 border-b border-slate-100 pb-3"
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-[#0D1F3D]">
                      {exec.name}
                    </span>
                    <span className="font-mono text-slate-600">
                      {exec.revenueFormatted} / ₹ 2,50,000 (
                      {exec.performancePercentage}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${exec.performancePercentage >= 90 ? "bg-emerald-500" : "bg-blue-600"}`}
                      style={{
                        width: `${Math.min(exec.performancePercentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: TRENDS SCREEN */}
      {activeSubTab === "Trends" && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-4 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Historical Growth Trends (Dec 2024 - May 2025)
          </h3>

          <div className="h-48 w-full flex items-end justify-between gap-3 pt-6 px-4 bg-slate-50/50 rounded-sm">
            {[
              { month: "Dec 2024", rev: 8.5 },
              { month: "Jan 2025", rev: 9.8 },
              { month: "Feb 2025", rev: 11.2 },
              { month: "Mar 2025", rev: 12.0 },
              { month: "Apr 2025", rev: 13.1 },
              { month: "May 2025", rev: 14.0 },
            ].map((m) => (
              <div
                key={m.month}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-[10px] font-bold text-slate-600">
                  ₹ {m.rev}L
                </span>
                <div
                  className="w-full bg-indigo-600 rounded-t-xs hover:bg-indigo-700 transition-all"
                  style={{ height: `${m.rev * 9}px` }}
                />
                <span className="text-[10px] text-slate-400 font-bold mt-1">
                  {m.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: ACTIVITIES STREAM SCREEN */}
      {activeSubTab === "Activities" && (
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Real-Time Activity Feed in {territory.name}
          </h3>

          <div className="space-y-3">
            {[
              {
                time: "10 mins ago",
                title: "Deal Closed",
                desc: "Arjun Mehta closed ₹ 45,000 order with Sai Enterprises",
                icon: ShoppingBag,
                color: "text-emerald-600 bg-emerald-50",
              },
              {
                time: "35 mins ago",
                title: "Visit Completed",
                desc: "Neha Sharma completed visit at Sharma Medical (GPS Verified)",
                icon: CheckCircle2,
                color: "text-blue-600 bg-blue-50",
              },
              {
                time: "1 hour ago",
                title: "New Lead Added",
                desc: "Pooja Yadav added Marol Electronics as new prospect",
                icon: Users,
                color: "text-purple-600 bg-purple-50",
              },
              {
                time: "2 hours ago",
                title: "Boundary Updated",
                desc: "Vikram Singh updated Andheri East boundary polygon",
                icon: MapPin,
                color: "text-amber-600 bg-amber-50",
              },
            ].map((act, idx) => {
              const Icon = act.icon;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2.5 rounded-sm hover:bg-slate-50"
                >
                  <div className={`p-2 rounded-full shrink-0 ${act.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-extrabold text-[#0D1F3D]">
                        {act.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {act.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-normal mt-0.5">
                      {act.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Key Insights Banner */}
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
