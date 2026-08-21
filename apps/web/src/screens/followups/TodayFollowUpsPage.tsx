import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Download,
  RefreshCw,
  MoreVertical,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { mockFollowUpsList } from './followupsData';
import { AddFollowUpModal } from './AddFollowUpModal';

export default function TodayFollowUpsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const todayFollowups = mockFollowUpsList.filter((f) => {
    const matchesSearch =
      f.followupId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] flex items-center gap-2">
            Today's Follow-ups <Calendar className="h-6 w-6 text-red-600" />
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            All follow-ups scheduled for today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-[#0D1F3D] shadow-xs">
            <option value="2025-05-20">20 May 2025 (Today)</option>
            <option value="2025-05-21">21 May 2025 (Tomorrow)</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Today follow-ups refreshed')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Exporting today follow-ups...')}
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
            <Plus className="h-4 w-4" /> Add Follow-up
          </Button>
        </div>
      </div>

      {/* 5 Top KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Today</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">28</span>
            <span className="text-xs font-medium text-slate-500 block">100% of today's follow-ups</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Completed</span>
            <span className="text-xl font-extrabold text-emerald-600">12</span>
            <span className="text-xs font-medium text-slate-500 block">42.9% of today</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Pending</span>
            <span className="text-xl font-extrabold text-amber-600">10</span>
            <span className="text-xs font-medium text-slate-500 block">35.7% of today</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Overdue</span>
            <span className="text-xl font-extrabold text-red-600">4</span>
            <span className="text-xs font-medium text-slate-500 block">14.3% of today</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Upcoming</span>
            <span className="text-xl font-extrabold text-purple-600">2</span>
            <span className="text-xs font-medium text-slate-500 block">7.1% of today</span>
          </div>
        </div>
      </div>

      {/* FULL WIDTH DATA TABLE */}
      <div className="rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="p-3 whitespace-nowrap">Time ↑</th>
                <th className="p-3 whitespace-nowrap">Follow-up ID</th>
                <th className="p-3">Lead / Business</th>
                <th className="p-3 whitespace-nowrap">Contact Person</th>
                <th className="p-3 whitespace-nowrap">Follow-up Type</th>
                <th className="p-3 whitespace-nowrap">Assigned To</th>
                <th className="p-3 text-center whitespace-nowrap">Priority</th>
                <th className="p-3 text-center whitespace-nowrap">Status</th>
                <th className="p-3 text-center whitespace-nowrap w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayFollowups.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => navigate(`/admin/follow-ups/${f.id}`)}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                    {f.followupTime}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-mono font-extrabold text-[#0D1F3D]">{f.followupId}</span>
                  </td>
                  <td className="p-3">
                    <div>
                      <span className="font-extrabold text-[#0D1F3D] block">{f.businessName}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{f.businessAddress}</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div>
                      <span className="font-extrabold text-[#0D1F3D] block">{f.contactPerson}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{f.phone}</span>
                    </div>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 rounded-xs bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-bold border border-slate-200">
                      {f.followupType}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <img
                        src={f.assignedToAvatar}
                        alt={f.assignedToName}
                        className="h-6 w-6 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-[#0D1F3D] block leading-tight">{f.assignedToName}</span>
                        <span className="text-[9px] text-slate-500 font-medium">{f.assignedToRole}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        f.priority === 'High'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : f.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {f.priority}
                    </span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        f.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : f.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : f.status === 'Overdue'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/admin/follow-ups/${f.id}`)}
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
          <span>Showing 1 to {todayFollowups.length} of 28 today's follow-ups</span>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-bold">
              1
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ANALYTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        {/* Today's Follow-ups by Status Donut */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Today's Follow-ups by Status
          </h3>

          <div className="relative py-2 flex flex-col items-center justify-center">
            <div className="h-20 w-20 rounded-full border-4 border-emerald-500 border-t-amber-500 border-r-red-500 border-b-blue-600 flex flex-col items-center justify-center shadow-xs">
              <span className="text-base font-extrabold text-[#0D1F3D]">28</span>
              <span className="text-[9px] font-bold text-slate-400">Total</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
              </span>
              <span className="font-extrabold">12 (42.9%)</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Pending
              </span>
              <span className="font-extrabold">10 (35.7%)</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Overdue
              </span>
              <span className="font-extrabold">4 (14.3%)</span>
            </div>
          </div>
        </div>

        {/* Top Executives Today */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Top Executives Today
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#0D1F3D]">1. Pooja Yadav</span>
              <span className="font-mono font-bold text-emerald-600">7 (25.0%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#0D1F3D]">2. Neha Sharma</span>
              <span className="font-mono font-bold text-emerald-600">6 (21.4%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[#0D1F3D]">3. Rakesh Patel</span>
              <span className="font-mono font-bold text-emerald-600">5 (17.9%)</span>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Quick Actions
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => toast.info('Opening Follow-up Calendar')}
              className="p-3 rounded-sm border border-slate-200 bg-slate-50 hover:bg-slate-100 font-bold text-[#0D1F3D] flex flex-col items-center gap-1"
            >
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>Calendar</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-3 rounded-sm border border-red-200 bg-red-50 hover:bg-red-100 font-bold text-red-700 flex flex-col items-center gap-1"
            >
              <Plus className="h-4 w-4 text-red-600" />
              <span>Add Follow-up</span>
            </button>
          </div>
        </div>
      </div>

      <AddFollowUpModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
