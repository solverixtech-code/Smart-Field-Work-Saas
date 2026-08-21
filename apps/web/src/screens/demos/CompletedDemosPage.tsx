import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Download,
  RefreshCw,
  Filter,
  RotateCcw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  Award,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { mockDemosList } from './demosData';
import { AddDemoModal } from './AddDemoModal';

export default function CompletedDemosPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const completedDemos = mockDemosList.filter((d) => d.status === 'Completed');

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
          <DateRangePicker />

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Completed demos refreshed')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Exporting completed demos...')}
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

      {/* 6 KPI Cards Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Total Completed</span>
            <span className="text-xl font-extrabold text-emerald-600">78</span>
            <span className="text-[10px] text-emerald-600 font-bold block">↑ 14.6% vs previous range</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">54.2%</span>
            <span className="text-[10px] text-slate-400 font-bold block">From completed demos</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Interested Customers</span>
            <span className="text-xl font-extrabold text-purple-600">52</span>
            <span className="text-[10px] text-slate-400 font-bold block">66.7% of completed</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Demo to Sale</span>
            <span className="text-xl font-extrabold text-amber-600">28</span>
            <span className="text-[10px] text-slate-400 font-bold block">35.9% converted</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-teal-50 text-teal-600 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Total Value Generated</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹18,45,000</span>
            <span className="text-[10px] text-slate-400 font-bold block">From converted demos</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Avg. Demo Duration</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">42m 15s</span>
            <span className="text-[10px] text-slate-400 font-bold block">Average time spent</span>
          </div>
        </div>
      </div>

      {/* Main Grid: 9-col Table + 3-col Compact Right Sidebars */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* LEFT 9 COLS TABLE */}
        <div className="space-y-4 lg:col-span-9">
          <div className="rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                    <th className="p-3 whitespace-nowrap min-w-[100px]">Demo ID</th>
                    <th className="p-3 whitespace-nowrap min-w-[140px]">Date & Time</th>
                    <th className="p-3 min-w-[180px]">Business / Lead</th>
                    <th className="p-3 whitespace-nowrap min-w-[160px]">Contact Person</th>
                    <th className="p-3 whitespace-nowrap min-w-[130px]">Demo Type</th>
                    <th className="p-3 whitespace-nowrap min-w-[150px]">Assigned To</th>
                    <th className="p-3 text-center whitespace-nowrap min-w-[100px]">Duration</th>
                    <th className="p-3 text-center whitespace-nowrap min-w-[120px]">Outcome</th>
                    <th className="p-3 text-center whitespace-nowrap min-w-[130px]">Next Action</th>
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
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-[#0D1F3D]">{d.demoId}</span>
                          <span className="rounded-xs bg-emerald-100 text-emerald-800 px-1.5 py-0.2 text-[9px] font-bold">
                            Completed
                          </span>
                        </div>
                      </td>
                      <td className="p-3 font-medium text-slate-700">
                        <div>
                          <span className="font-bold text-slate-800 block">{d.demoDate}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{d.demoTime}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <span className="font-extrabold text-[#0D1F3D] block">{d.businessName}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{d.businessAddress}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <span className="font-extrabold text-[#0D1F3D] block">{d.contactPerson}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{d.phone}</span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="inline-block rounded-xs bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold border border-slate-200 whitespace-nowrap">
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
                      <td className="p-3 text-center font-mono font-bold text-slate-700">
                        {d.durationFormatted || '45m 10s'}
                      </td>
                      <td className="p-3 text-center">
                        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {d.outcome || 'Interested'}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-800">
                        {d.nextAction || 'Follow-up'}
                      </td>
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
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
              <span>Showing 1 to {completedDemos.length} of 78 completed demos</span>
              <div className="flex items-center gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-bold">
                  1
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 3 COLS SIDEBAR */}
        <div className="space-y-3 lg:col-span-3">
          {/* Total Value Generated Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-3 shadow-xs space-y-1 text-xs font-semibold">
            <span className="text-slate-400 font-bold block">Total Value Generated</span>
            <span className="text-xl font-extrabold text-[#0D1F3D] block">₹18,45,000</span>
            <span className="text-[10px] text-slate-500 font-medium block">From 28 converted demos</span>
          </div>

          {/* Completed Demos by Outcome Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-3 shadow-xs space-y-2 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-1.5">
              Completed Demos by Outcome
            </h3>

            <div className="relative py-1 flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full border-4 border-emerald-500 border-t-teal-600 flex flex-col items-center justify-center shadow-xs">
                <span className="text-sm font-extrabold text-[#0D1F3D]">78</span>
                <span className="text-[8px] font-bold text-slate-400">Total</span>
              </div>
            </div>

            <div className="space-y-1 text-[10px] text-slate-700">
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Interested
                </span>
                <span className="font-extrabold">52 (66.7%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-teal-600" /> Demo Done
                </span>
                <span className="font-extrabold">28 (35.9%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddDemoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
