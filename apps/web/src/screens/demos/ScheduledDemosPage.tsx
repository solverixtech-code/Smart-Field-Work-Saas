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
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { mockDemosList } from './demosData';
import { AddDemoModal } from './AddDemoModal';

export default function ScheduledDemosPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [demoTypeFilter, setDemoTypeFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const scheduledDemos = mockDemosList.filter(
    (d) => d.status === 'Scheduled' || d.status === 'In Progress'
  );

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] flex items-center gap-2">
            Scheduled Demos <span className="text-lg">📅</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            View and manage all upcoming scheduled product demos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Schedule refreshed')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Exporting scheduled demos...')}
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

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Total Scheduled</span>
            <span className="text-xl font-extrabold text-purple-600">32</span>
            <span className="text-[10px] text-emerald-600 font-bold block">↑ 6.7% vs yesterday</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Today</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">8</span>
            <span className="text-[10px] text-slate-400 font-bold block">25.0% of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">This Week</span>
            <span className="text-xl font-extrabold text-amber-600">18</span>
            <span className="text-[10px] text-slate-400 font-bold block">56.2% of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">This Month</span>
            <span className="text-xl font-extrabold text-indigo-600">32</span>
            <span className="text-[10px] text-slate-400 font-bold block">100% of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Confirmed</span>
            <span className="text-xl font-extrabold text-emerald-600">24</span>
            <span className="text-[10px] text-slate-400 font-bold block">75.0% of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-orange-50 text-orange-600 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Pending Confirmation</span>
            <span className="text-xl font-extrabold text-orange-600">8</span>
            <span className="text-[10px] text-slate-400 font-bold block">25.0% of total</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT 8 COLS TABLE */}
        <div className="space-y-4 lg:col-span-8">
          <div className="rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                    <th className="p-3">Demo ID</th>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Business / Lead</th>
                    <th className="p-3">Contact Person</th>
                    <th className="p-3">Demo Type</th>
                    <th className="p-3">Assigned To</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Source</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scheduledDemos.map((d) => (
                    <tr
                      key={d.id}
                      onClick={() => navigate(`/admin/demos/${d.id}`)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-extrabold text-[#0D1F3D]">{d.demoId}</span>
                          <span className="rounded-xs bg-blue-100 text-blue-800 px-1 py-0.2 text-[9px] font-bold">
                            Today
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
                      <td className="p-3">
                        <span className="rounded-xs bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold border border-slate-200">
                          {d.demoType}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={d.assignedToAvatar}
                            alt={d.assignedToName}
                            className="h-6 w-6 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                          <span>{d.assignedToName}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Confirmed
                        </span>
                      </td>
                      <td className="p-3 text-center text-slate-600 font-medium">
                        {d.leadSource || 'Website'}
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
              <span>Showing 1 to {scheduledDemos.length} of 32 scheduled demos</span>
              <div className="flex items-center gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-bold">
                  1
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT 4 COLS SIDEBAR */}
        <div className="space-y-4 lg:col-span-4">
          {/* Scheduled Demos by Status Donut Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Scheduled Demos by Status
            </h3>

            <div className="relative py-2 flex flex-col items-center justify-center">
              <div className="h-24 w-24 rounded-full border-8 border-emerald-500 border-t-amber-500 flex flex-col items-center justify-center shadow-inner">
                <span className="text-lg font-extrabold text-[#0D1F3D]">32</span>
                <span className="text-[9px] font-bold text-slate-400">Total</span>
              </div>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Confirmed
                </span>
                <span className="font-extrabold">24 (75.0%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Pending Confirmation
                </span>
                <span className="font-extrabold">8 (25.0%)</span>
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
