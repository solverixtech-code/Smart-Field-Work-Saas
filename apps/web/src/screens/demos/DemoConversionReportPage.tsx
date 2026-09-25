import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  TrendingUp,
  Download,
  DollarSign,
  Award,
  CheckCircle2,
  PieChart,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { DateRange, DateRangePicker } from "../../components/ui/DateRangePicker";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { demoApi, DemoConversionReport, exportDemoConversionCsv } from "./demo.api";

export default function DemoConversionReportPage() {
  const [report, setReport] = useState<DemoConversionReport | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const key = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { startDate: key(new Date(today.getFullYear(), today.getMonth(), 1)), endDate: key(today), label: 'This month' };
  });

  useEffect(() => {
    const controller = new AbortController();
    demoApi.conversionReport({ from: dateRange.startDate, to: dateRange.endDate }, controller.signal).then(setReport).catch((error: unknown) => {
      if (!controller.signal.aborted) toast.error(error instanceof Error ? error.message : 'Unable to load conversion report');
    });
    return () => controller.abort();
  }, [dateRange.endDate, dateRange.startDate]);

  const summary = report?.summary ?? { total: 0, completed: 0, interested: 0, proposals: 0, converted: 0, conversionRate: 0, valueConverted: 0, averageDaysToClose: 0 };
  const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const rate = (value: number, total: number) => total ? `${((value / total) * 100).toFixed(1)}%` : '0.0%';

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] flex items-center gap-2">
            Demo Conversion Report{" "}
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Analyze demo-to-sale conversion rates, executive performance, and
            deal pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!report) return;
              exportDemoConversionCsv(report, `demo-conversion-${dateRange.startDate}-${dateRange.endDate}.csv`);
              toast.success("Conversion report exported");
            }}
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
          value={String(summary.total)}
          subValue="Conducted this period"
          icon={CheckCircle2}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Demos Converted"
          value={String(summary.converted)}
          subValue="Closed deals won"
          icon={Award}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Conversion Rate"
          value={`${summary.conversionRate}%`}
          subValue="Demo to sale ratio"
          icon={TrendingUp}
          iconBgColor="bg-indigo-500/10"
          iconTextColor="text-indigo-600"
        />
        <KpiCard
          title="Value Converted"
          value={currency.format(summary.valueConverted)}
          subValue="Total deal revenue"
          icon={DollarSign}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
        <KpiCard
          title="Avg Days to Close"
          value={`${summary.averageDaysToClose} Days`}
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
            <span className="text-[10px] text-slate-400 block uppercase">
              1. Total Demos
            </span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{summary.total}</span>
            <span className="text-[10px] text-slate-400 font-normal block">
              100% initial pool
            </span>
          </div>

          <div className="p-3.5 rounded-sm bg-blue-50 border border-blue-200 space-y-1">
            <span className="text-[10px] text-blue-600 font-bold block uppercase">
              2. Completed Demos
            </span>
            <span className="text-xl font-extrabold text-blue-700">{summary.completed}</span>
            <span className="text-[10px] text-blue-600 font-normal block">
              {rate(summary.completed, summary.total)} completion
            </span>
          </div>

          <div className="p-3.5 rounded-sm bg-purple-50 border border-purple-200 space-y-1">
            <span className="text-[10px] text-purple-600 font-bold block uppercase">
              3. Interested Leads
            </span>
            <span className="text-xl font-extrabold text-purple-700">{summary.interested}</span>
            <span className="text-[10px] text-purple-600 font-normal block">
              {rate(summary.interested, summary.completed)} of completed
            </span>
          </div>

          <div className="p-3.5 rounded-sm bg-amber-50 border border-amber-200 space-y-1">
            <span className="text-[10px] text-amber-600 font-bold block uppercase">
              4. Proposals Sent
            </span>
            <span className="text-xl font-extrabold text-amber-700">{summary.proposals}</span>
            <span className="text-[10px] text-amber-600 font-normal block">
              {rate(summary.proposals, summary.interested)} of interested
            </span>
          </div>

          <div className="p-3.5 rounded-sm bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="text-[10px] text-emerald-600 font-bold block uppercase">
              5. Deals Closed Won
            </span>
            <span className="text-xl font-extrabold text-emerald-700">{summary.converted}</span>
            <span className="text-[10px] text-emerald-600 font-normal block">
              {summary.conversionRate}% net rate
            </span>
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
                {(report?.leaderboard ?? []).map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-[#0D1F3D]">{row.name}</td>
                    <td className="p-3 text-center font-mono font-bold">{row.demos}</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-600">{row.converted}</td>
                    <td className="p-3 text-center">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${row.conversionRate >= 50 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {row.conversionRate}%
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">{currency.format(row.revenue)}</td>
                  </tr>
                ))}
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
              {(report?.sources ?? []).map((source) => (
                <div key={source.source} className="flex justify-between">
                  <span className="text-slate-600 font-medium">{source.source}</span>
                  <span className="font-extrabold text-emerald-600">{source.conversionRate}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
