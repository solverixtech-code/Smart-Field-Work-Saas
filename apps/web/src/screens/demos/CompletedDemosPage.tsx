import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus,
  Download,
  RefreshCw,
  MoreVertical,
  CheckCircle2,
  TrendingUp,
  Award,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DateRange, DateRangePicker } from '../../components/ui/DateRangePicker';
import { AddDemoModal } from './AddDemoModal';
import { exportDemosCsv } from './demo.api';
import { useDemoList } from './useDemoList';

export default function CompletedDemosPage() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const key = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return { startDate: key(new Date(today.getFullYear(), today.getMonth(), 1)), endDate: key(today), label: 'This month' };
  });
  const { demos: completedDemos, data, refresh } = useDemoList('completed', { from: dateRange.startDate, to: dateRange.endDate });
  const converted = completedDemos.filter((demo) => demo.outcome === 'Converted');
  const interested = completedDemos.filter((demo) => ['Interested', 'Follow-up', 'Proposal', 'Trial', 'Converted'].includes(demo.outcome || ''));
  const totalValue = converted.reduce((sum, demo) => sum + (demo.revenueValue || 0), 0);
  const averageDuration = completedDemos.length ? Math.round(completedDemos.reduce((sum, demo) => sum + (demo.durationMinutes || 0), 0) / completedDemos.length) : 0;
  const topConverted = Object.entries(converted.reduce<Record<string, number>>((counts, demo) => {
    counts[demo.assignedToName] = (counts[demo.assignedToName] || 0) + 1;
    return counts;
  }, {})).sort((left, right) => right[1] - left[1]).slice(0, 3);
  const completedPercentage = (value: number) => completedDemos.length ? `${((value / completedDemos.length) * 100).toFixed(1)}%` : '0.0%';

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] flex items-center gap-2">
            Demo Completed <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            View and manage all completed product demos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => { refresh(); toast.success('Completed demos refreshed'); }}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { exportDemosCsv(completedDemos, 'completed-demos.csv'); toast.success('Completed demos exported'); }}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Demo
          </Button>
        </div>
      </div>

      {/* 6 Top KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Completed</span>
            <span className="text-xl font-extrabold text-emerald-600">{data?.total ?? 0}</span>
            <span className="text-xs font-semibold text-emerald-600 block">Live completed total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{completedDemos.length ? `${((converted.length / completedDemos.length) * 100).toFixed(1)}%` : '0.0%'}</span>
            <span className="text-xs font-medium text-slate-500 block">From completed demos</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Interested Customers</span>
            <span className="text-xl font-extrabold text-purple-600">{interested.length}</span>
            <span className="text-xs font-medium text-slate-500 block">{completedPercentage(interested.length)} of completed</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Demo to Sale</span>
            <span className="text-xl font-extrabold text-amber-600">{converted.length}</span>
            <span className="text-xs font-medium text-slate-500 block">{completedPercentage(converted.length)} converted</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-teal-50 text-teal-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Value Generated</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalValue)}</span>
            <span className="text-xs font-medium text-slate-500 block">From converted demos</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Avg. Demo Duration</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{averageDuration}m</span>
            <span className="text-xs font-medium text-slate-500 block">Average time spent</span>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH DATA TABLE (100% width, no side-by-side squeezing) */}
      <div className="rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="p-3 whitespace-nowrap">Demo ID</th>
                <th className="p-3 whitespace-nowrap">Date & Time</th>
                <th className="p-3">Business / Lead</th>
                <th className="p-3 whitespace-nowrap">Contact Person</th>
                <th className="p-3 whitespace-nowrap">Demo Type</th>
                <th className="p-3 whitespace-nowrap">Assigned To</th>
                <th className="p-3 text-center whitespace-nowrap">Duration</th>
                <th className="p-3 text-center whitespace-nowrap">Outcome</th>
                <th className="p-3 text-center whitespace-nowrap">Next Action</th>
                <th className="p-3 text-center whitespace-nowrap w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedDemos.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => navigate(`/admin/demos/${d.id}`)}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-extrabold text-[#0D1F3D]">{d.demoId}</span>
                      <span className="rounded-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9px] font-bold">
                        Completed
                      </span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap font-medium text-slate-700">
                    <div>
                      <span className="font-bold text-slate-800 block">{d.demoDate}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{d.demoTime}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <span className="font-extrabold text-[#0D1F3D] block">{d.businessName}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{d.businessAddress}</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div>
                      <span className="font-extrabold text-[#0D1F3D] block">{d.contactPerson}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{d.phone}</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="inline-block rounded-xs bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold border border-slate-200">
                      {d.demoType}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={d.assignedToAvatar}
                        alt={d.assignedToName}
                        className="h-6 w-6 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <span>{d.assignedToName}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono font-bold text-slate-700 whitespace-nowrap">
                    {d.durationFormatted || 'Not recorded'}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {d.outcome || 'Pending'}
                    </span>
                  </td>
                  <td className="p-3 text-center font-bold text-slate-800 whitespace-nowrap">
                    {d.nextAction || 'Not scheduled'}
                  </td>
                  <td className="p-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/admin/demos/${d.id}`)}
                      className="p-1 rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-600">
          <span>Showing 1 to {completedDemos.length} of {data?.total ?? 0} completed demos</span>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-bold">
              1
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ANALYTICS CARDS (Placed on the next line below table so table is never squeezed!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {/* Total Value Generated Card */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
          <span className="text-xs font-semibold text-slate-500 block">Total Value Generated</span>
          <span className="text-2xl font-extrabold text-[#0D1F3D] block">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalValue)}</span>
          <span className="text-xs font-medium text-slate-500 block">From {converted.length} converted demos</span>
        </div>

        {/* Completed Demos by Outcome Card */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Completed Demos by Outcome
          </h3>

          <div className="relative py-2 flex flex-col items-center justify-center">
            <div className="h-20 w-20 rounded-full border-4 border-emerald-500 border-t-teal-600 flex flex-col items-center justify-center shadow-xs">
              <span className="text-base font-extrabold text-[#0D1F3D]">{completedDemos.length}</span>
              <span className="text-[9px] font-bold text-slate-400">Total</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Interested
              </span>
              <span className="font-extrabold">{interested.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-teal-600" /> Demo Done
              </span>
              <span className="font-extrabold">{converted.length}</span>
            </div>
          </div>
        </div>

        {/* Top Converting Executives Summary Card */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Top Converting Executives
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#0D1F3D]">{topConverted[0]?.[0] || '—'}</span>
              <span className="font-mono font-bold text-emerald-600">{topConverted[0]?.[1] || 0} Converted</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#0D1F3D]">{topConverted[1]?.[0] || '—'}</span>
              <span className="font-mono font-bold text-emerald-600">{topConverted[1]?.[1] || 0} Converted</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#0D1F3D]">{topConverted[2]?.[0] || '—'}</span>
              <span className="font-mono font-bold text-emerald-600">{topConverted[2]?.[1] || 0} Converted</span>
            </div>
          </div>
        </div>
      </div>

      <AddDemoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
