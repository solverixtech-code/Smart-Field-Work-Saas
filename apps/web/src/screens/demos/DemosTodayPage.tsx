import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Plus,
  Download,
  RefreshCw,
  MoreVertical,
  Monitor,
  CheckCircle2,
  Calendar,
  Clock,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { AddDemoModal } from './AddDemoModal';
import { exportDemosCsv } from './demo.api';
import { useDemoList } from './useDemoList';

export default function DemosTodayPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [demoTypeFilter, setDemoTypeFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { demos, data, refresh } = useDemoList('today');

  const filteredDemos = demos.filter((d) => {
    const matchesSearch =
      d.demoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.businessName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesType = demoTypeFilter === 'All' || d.demoType === demoTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });
  const completedCount = demos.filter((demo) => demo.status === 'Completed').length;
  const interestedCount = demos.filter((demo) => ['Interested', 'Follow-up', 'Proposal', 'Trial', 'Converted'].includes(demo.outcome || '')).length;
  const convertedCount = demos.filter((demo) => demo.outcome === 'Converted').length;
  const totalToday = data?.summary.today ?? 0;
  const percentage = (value: number) => totalToday ? `${((value / totalToday) * 100).toFixed(1)}%` : '0.0%';

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] flex items-center gap-2">
            Demos Today <span className="text-lg">📅</span>
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Overview of all product demos scheduled for today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select className="rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-[#0D1F3D] shadow-xs">
            <option value={data?.today}>{data?.today || 'Today'} (Today)</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { refresh(); toast.success('Demos refreshed'); }}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => { exportDemosCsv(filteredDemos, 'demos-today.csv'); toast.success('Today demos exported'); }}
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

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Demos Today</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{data?.summary.today ?? 0}</span>
            <span className="text-xs font-semibold text-emerald-600 block">Live daily total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Completed</span>
            <span className="text-xl font-extrabold text-emerald-600">{completedCount}</span>
            <span className="text-xs font-medium text-slate-500 block">{percentage(completedCount)} of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">In Progress</span>
            <span className="text-xl font-extrabold text-amber-600">{filteredDemos.filter((demo) => demo.status === 'In Progress').length}</span>
            <span className="text-xs font-medium text-slate-500 block">{percentage(filteredDemos.filter((demo) => demo.status === 'In Progress').length)} of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Upcoming</span>
            <span className="text-xl font-extrabold text-purple-600">{filteredDemos.filter((demo) => ['Scheduled', 'Confirmed', 'Rescheduled'].includes(demo.status)).length}</span>
            <span className="text-xs font-medium text-slate-500 block">{percentage(filteredDemos.filter((demo) => ['Scheduled', 'Confirmed', 'Rescheduled'].includes(demo.status)).length)} of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Cancelled / No-show</span>
            <span className="text-xl font-extrabold text-red-600">{filteredDemos.filter((demo) => ['Cancelled', 'No Show'].includes(demo.status)).length}</span>
            <span className="text-xs font-medium text-slate-500 block">{percentage(filteredDemos.filter((demo) => ['Cancelled', 'No Show'].includes(demo.status)).length)} of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-sky-50 text-sky-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">{data?.summary.completed ? `${((data.summary.converted / data.summary.completed) * 100).toFixed(1)}%` : '0.0%'}</span>
            <span className="text-xs font-medium text-slate-500 block">From completed demos</span>
          </div>
        </div>
      </div>

      {/* FULL WIDTH DATA TABLE */}
      <div className="rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="p-3 whitespace-nowrap">Demo ID</th>
                <th className="p-3 whitespace-nowrap">Time</th>
                <th className="p-3">Business / Lead</th>
                <th className="p-3 whitespace-nowrap">Contact Person</th>
                <th className="p-3 whitespace-nowrap">Demo Type</th>
                <th className="p-3 whitespace-nowrap">Assigned To</th>
                <th className="p-3 text-center whitespace-nowrap">Status</th>
                <th className="p-3 text-center whitespace-nowrap">Outcome</th>
                <th className="p-3 text-center whitespace-nowrap w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDemos.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => navigate(`/admin/demos/${d.id}`)}
                  className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                >
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-extrabold text-[#0D1F3D]">{d.demoId}</span>
                      {d.badge && (
                        <span className="rounded-xs bg-blue-100 text-blue-800 px-1 py-0.2 text-[9px] font-bold">
                          {d.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-700 whitespace-nowrap">{d.demoTime}</td>
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
                  <td className="p-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                        d.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : d.status === 'Scheduled' || d.status === 'In Progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-center whitespace-nowrap">
                    {d.outcome && d.outcome !== 'Pending' ? (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {d.outcome}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-mono">—</span>
                    )}
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
          <span>Showing 1 to {filteredDemos.length} of {data?.total ?? 0} demos scheduled today</span>
          <div className="flex items-center gap-1">
            <button className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-bold">
              1
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM ANALYTICS CARDS (Placed on next line below table) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 pt-2">
        {/* Today's Conversion Funnel Visual */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Today's Conversion Funnel
          </h3>

          <div className="space-y-2 text-xs pt-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Total Demos</span>
              <span className="font-extrabold text-[#0D1F3D]">{demos.length}</span>
            </div>
            <div className="h-3 w-full rounded-sm bg-blue-600 shadow-inner" />

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500 font-medium">Completed Demos</span>
              <span className="font-extrabold text-emerald-600">{completedCount}</span>
            </div>
            <div className="h-3 w-3/4 mx-auto rounded-sm bg-emerald-500 shadow-inner" />

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500 font-medium">Interested</span>
              <span className="font-extrabold text-amber-600">{interestedCount}</span>
            </div>
            <div className="h-3 w-1/2 mx-auto rounded-sm bg-amber-500 shadow-inner" />

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500 font-medium">Demo Done</span>
              <span className="font-extrabold text-purple-600">{convertedCount}</span>
            </div>
            <div className="h-3 w-1/3 mx-auto rounded-sm bg-purple-600 shadow-inner" />

            <div className="flex items-center justify-between border-t border-slate-100 pt-2 font-extrabold">
              <span className="text-[#0D1F3D]">Conversion Rate</span>
              <span className="text-emerald-600 text-sm">{completedCount ? `${((convertedCount / completedCount) * 100).toFixed(1)}%` : '0.0%'}</span>
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
