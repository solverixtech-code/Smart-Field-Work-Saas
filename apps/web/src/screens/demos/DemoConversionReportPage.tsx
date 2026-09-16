import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  Award,
  CheckCircle2,
  PieChart,
  Users,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { KpiCard } from '../../components/dashboard/KpiCard';

export default function DemoConversionReportPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] flex items-center gap-2">
            Demo Conversion Report <TrendingUp className="h-6 w-6 text-emerald-600" />
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Analyze demo-to-sale conversion rates, executive performance, and deal pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DateRangePicker />

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Exporting conversion analytics report...')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </Button>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          title="Total Demos"
          value="128"
          subValue="Conducted this period"
          icon={CheckCircle2}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Demos Converted"
          value="61"
          subValue="Closed deals won"
          icon={Award}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Conversion Rate"
          value="47.6%"
          subValue="Demo to sale ratio"
          icon={TrendingUp}
          iconBgColor="bg-indigo-500/10"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Value Converted"
          value="₹48,20,000"
          subValue="Total deal revenue"
          icon={DollarSign}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
        <KpiCard
          title="Avg Days to Close"
          value="6.4 Days"
          subValue="Demo to closure"
          icon={PieChart}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Conversion Funnel Section */}
      <div className="rounded-sm border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
        <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
          Demo Conversion Funnel Analysis
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3.5 rounded-sm bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">1. Total Demos</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">128</span>
            <span className="text-[10px] text-slate-400 font-normal block">100% initial pool</span>
          </div>

          <div className="p-3.5 rounded-sm bg-blue-50 border border-blue-200 space-y-1">
            <span className="text-[10px] text-blue-600 font-bold block uppercase">2. Completed Demos</span>
            <span className="text-xl font-extrabold text-blue-700">78</span>
            <span className="text-[10px] text-blue-600 font-normal block">60.9% completion</span>
          </div>

          <div className="p-3.5 rounded-sm bg-purple-50 border border-purple-200 space-y-1">
            <span className="text-[10px] text-purple-600 font-bold block uppercase">3. Interested Leads</span>
            <span className="text-xl font-extrabold text-purple-700">52</span>
            <span className="text-[10px] text-purple-600 font-normal block">66.7% of completed</span>
          </div>

          <div className="p-3.5 rounded-sm bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-[10px] text-amber-600 font-bold block uppercase">4. Proposals Sent</span>
            <span className="text-xl font-extrabold text-amber-700">38</span>
            <span className="text-[10px] text-amber-600 font-normal block">73.0% of interested</span>
          </div>

          <div className="p-3.5 rounded-sm bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-[10px] text-emerald-600 font-bold block uppercase">5. Deals Closed Won</span>
            <span className="text-xl font-extrabold text-emerald-700">61</span>
            <span className="text-[10px] text-emerald-600 font-normal block">47.6% net rate</span>
          </div>
        </div>
      </div>

      {/* Executive Conversion Leaderboard Table */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-sm border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Executive Conversion Leaderboard
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                  <th className="p-3">Executive</th>
                  <th className="p-3 text-center">Demos Conducted</th>
                  <th className="p-3 text-center">Demos Converted</th>
                  <th className="p-3 text-center">Conversion Rate</th>
                  <th className="p-3 text-right">Revenue Converted (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-[#0D1F3D]">Arjun Mehta</td>
                  <td className="p-3 text-center font-mono font-bold">28</td>
                  <td className="p-3 text-center font-mono font-bold text-emerald-600">17</td>
                  <td className="p-3 text-center">
                    <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                      60.7%
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">₹ 14,80,000</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-[#0D1F3D]">Neha Sharma</td>
                  <td className="p-3 text-center font-mono font-bold">24</td>
                  <td className="p-3 text-center font-mono font-bold text-emerald-600">13</td>
                  <td className="p-3 text-center">
                    <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                      54.1%
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">₹ 11,20,000</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-[#0D1F3D]">Pooja Yadav</td>
                  <td className="p-3 text-center font-mono font-bold">20</td>
                  <td className="p-3 text-center font-mono font-bold text-emerald-600">10</td>
                  <td className="p-3 text-center">
                    <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold border border-emerald-200">
                      50.0%
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">₹ 9,40,000</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-[#0D1F3D]">Rakesh Patel</td>
                  <td className="p-3 text-center font-mono font-bold">18</td>
                  <td className="p-3 text-center font-mono font-bold text-emerald-600">8</td>
                  <td className="p-3 text-center">
                    <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-bold border border-amber-200">
                      44.4%
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">₹ 7,50,000</td>
                </tr>
                <tr className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-[#0D1F3D]">Kiran Jadhav</td>
                  <td className="p-3 text-center font-mono font-bold">16</td>
                  <td className="p-3 text-center font-mono font-bold text-emerald-600">6</td>
                  <td className="p-3 text-center">
                    <span className="rounded-full bg-amber-50 text-amber-700 px-2 py-0.5 text-[10px] font-bold border border-amber-200">
                      37.5%
                    </span>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">₹ 5,30,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT 4 COLS BREAKDOWN */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Conversion Rate by Lead Source
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Referral</span>
                <span className="font-extrabold text-emerald-600">62.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Website</span>
                <span className="font-extrabold text-blue-600">48.0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Google Ads</span>
                <span className="font-extrabold text-amber-600">41.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Walk-in / Trade Show</span>
                <span className="font-extrabold text-slate-700">35.0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
