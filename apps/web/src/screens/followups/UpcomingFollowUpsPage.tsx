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
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { mockFollowUpsList } from './followupsData';
import { AddFollowUpModal } from './AddFollowUpModal';

export default function UpcomingFollowUpsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const upcomingFollowups = mockFollowUpsList.filter(
    (f) => f.status === 'Scheduled' || f.status === 'Pending'
  );

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] flex items-center gap-2">
            Upcoming Follow-ups <Calendar className="h-6 w-6 text-purple-600" />
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Overview of all future scheduled follow-up tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Upcoming list refreshed')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Exporting upcoming follow-ups...')}
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
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Upcoming</span>
            <span className="text-xl font-extrabold text-purple-600">64</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 12.5% vs previous week</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">This Week</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">38</span>
            <span className="text-xs font-medium text-slate-500 block">59.3% of upcoming</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Next Week</span>
            <span className="text-xl font-extrabold text-amber-600">18</span>
            <span className="text-xs font-medium text-slate-500 block">28.1% of upcoming</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-indigo-50 text-indigo-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">This Month</span>
            <span className="text-xl font-extrabold text-indigo-600">64</span>
            <span className="text-xs font-medium text-slate-500 block">100% of upcoming</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 shrink-0">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">High Priority</span>
            <span className="text-xl font-extrabold text-red-600">24</span>
            <span className="text-xs font-medium text-slate-500 block">37.5% of upcoming</span>
          </div>
        </div>
      </div>

      {/* FULL WIDTH DATA TABLE */}
      <div className="rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="p-3 whitespace-nowrap">Follow-up ID</th>
                <th className="p-3 whitespace-nowrap">Scheduled Date & Time</th>
                <th className="p-3">Business / Lead</th>
                <th className="p-3 whitespace-nowrap">Contact Person</th>
                <th className="p-3 whitespace-nowrap">Follow-up Type</th>
                <th className="p-3 whitespace-nowrap">Assigned To</th>
                <th className="p-3 text-center whitespace-nowrap">Priority</th>
                <th className="p-3 text-center whitespace-nowrap">Status</th>
                <th className="p-3 text-center whitespace-nowrap w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {upcomingFollowups.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => navigate(`/admin/follow-ups/${f.id}`)}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-mono font-extrabold text-[#0D1F3D]">{f.followupId}</span>
                  </td>
                  <td className="p-3 font-medium text-slate-700 whitespace-nowrap">
                    <div>
                      <span className="font-bold text-slate-800 block">{f.followupDate}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{f.followupTime}</span>
                    </div>
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
                      <span>{f.assignedToName}</span>
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
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Scheduled
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
          <span>Showing 1 to {upcomingFollowups.length} of 64 upcoming follow-ups</span>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-bold">
              1
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
