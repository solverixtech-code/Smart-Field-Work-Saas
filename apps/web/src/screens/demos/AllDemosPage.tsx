import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Search,
  Plus,
  Download,
  Upload,
  Filter,
  RotateCcw,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Monitor,
  CheckCircle2,
  Calendar,
  Clock,
  XCircle,
  TrendingUp,
  SlidersHorizontal,
  Eye,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { mockDemosList, DemoItem } from './demosData';
import { AddDemoModal } from './AddDemoModal';

export default function AllDemosPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [demoTypeFilter, setDemoTypeFilter] = useState('All');
  const [assignedToFilter, setAssignedToFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredDemos = mockDemosList.filter((d) => {
    const matchesSearch =
      d.demoId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || d.status === statusFilter;
    const matchesType = demoTypeFilter === 'All' || d.demoType === demoTypeFilter;
    const matchesAssigned = assignedToFilter === 'All' || d.assignedToName === assignedToFilter;

    return matchesSearch && matchesStatus && matchesType && matchesAssigned;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredDemos.map((d) => d.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleToggleRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setDemoTypeFilter('All');
    setAssignedToFilter('All');
    setSourceFilter('All');
    toast.info('Filters reset to default');
  };

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">All Demos</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            View, track and manage all product demos across the organization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Exporting demos report...')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Import Demos template...')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Upload className="h-3.5 w-3.5" /> Import
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
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Total Demos</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">128</span>
            <span className="text-[10px] text-emerald-600 font-bold block">↑ 18.4% vs last month</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Completed Demos</span>
            <span className="text-xl font-extrabold text-emerald-600">78</span>
            <span className="text-[10px] text-slate-400 font-bold block">60.9% of total demos</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Scheduled Demos</span>
            <span className="text-xl font-extrabold text-purple-600">32</span>
            <span className="text-[10px] text-slate-400 font-bold block">Upcoming demos</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">In Progress</span>
            <span className="text-xl font-extrabold text-amber-600">12</span>
            <span className="text-[10px] text-slate-400 font-bold block">Active demos</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Cancelled / No-show</span>
            <span className="text-xl font-extrabold text-red-600">6</span>
            <span className="text-[10px] text-slate-400 font-bold block">4.7% of total demos</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-sky-50 text-sky-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Conversion Rate</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">47.6%</span>
            <span className="text-[10px] text-slate-400 font-bold block">From demo to sale</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-sm border border-slate-200/90 bg-white p-3 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-center">
          <div className="relative lg:col-span-4">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by demo ID, business name, lead name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D]"
            >
              <option value="All">Status: All</option>
              <option value="Completed">Completed</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <DateRangePicker />
          </div>

          <div className="lg:col-span-2">
            <select
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D]"
            >
              <option value="All">Assigned: All</option>
              <option value="Arjun Mehta">Arjun Mehta</option>
              <option value="Neha Sharma">Neha Sharma</option>
              <option value="Pooja Yadav">Pooja Yadav</option>
              <option value="Rakesh Patel">Rakesh Patel</option>
              <option value="Kiran Jadhav">Kiran Jadhav</option>
            </select>
          </div>

          <div className="lg:col-span-2 flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Filters drawer opened')}
              className="text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" /> More Filters
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="text-xs font-bold text-slate-500 hover:text-slate-900"
              title="Reset Filters"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: 9-col Table + 3-col Compact Right Sidebars */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* LEFT COLUMN (9 COLS TABLE FOR MAXIMUM READABILITY) */}
        <div className="space-y-4 lg:col-span-9">
          <div className="rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                    <th className="p-3 w-10 text-center">
                      <Checkbox
                        checked={
                          selectedRows.length === filteredDemos.length &&
                          filteredDemos.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-3 whitespace-nowrap min-w-[100px]">Demo ID</th>
                    <th className="p-3 min-w-[180px]">Business / Lead</th>
                    <th className="p-3 whitespace-nowrap min-w-[160px]">Contact Person</th>
                    <th className="p-3 whitespace-nowrap min-w-[130px]">Demo Type</th>
                    <th className="p-3 whitespace-nowrap min-w-[150px]">Assigned To</th>
                    <th className="p-3 whitespace-nowrap min-w-[140px]">Demo Date & Time</th>
                    <th className="p-3 text-center whitespace-nowrap min-w-[110px]">Status</th>
                    <th className="p-3 text-center whitespace-nowrap min-w-[120px]">Outcome</th>
                    <th className="p-3 text-center whitespace-nowrap min-w-[130px]">Next Action</th>
                    <th className="p-3 text-center whitespace-nowrap w-16">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDemos.map((d) => {
                    const isChecked = selectedRows.includes(d.id);
                    return (
                      <tr
                        key={d.id}
                        onClick={() => navigate(`/admin/demos/${d.id}`)}
                        className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={isChecked}
                            onChange={() => handleToggleRow(d.id)}
                          />
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-extrabold text-[#0D1F3D]">{d.demoId}</span>
                            {d.badge && (
                              <span
                                className={`rounded-xs px-1.5 py-0.2 text-[9px] font-bold ${
                                  d.badge === 'Hot'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {d.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div>
                            <span className="font-extrabold text-[#0D1F3D] block">{d.businessName}</span>
                            <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{d.businessAddress}</span>
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
                            <div>
                              <span className="font-bold text-[#0D1F3D] block leading-tight">{d.assignedToName}</span>
                              <span className="text-[9px] text-slate-400 font-medium">{d.assignedToRole}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">
                          <div>
                            <span className="font-bold text-slate-800 block">{d.demoDate}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{d.demoTime}</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                              d.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : d.status === 'Scheduled'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : d.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {d.outcome && d.outcome !== 'Pending' ? (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                                d.outcome === 'Interested'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : d.outcome === 'Demo Done'
                                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {d.outcome}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {d.nextAction && d.nextAction !== '—' ? (
                            <div>
                              <span className="font-bold text-[#0D1F3D] block">{d.nextAction}</span>
                              {d.nextActionDate && (
                                <span className="text-[9px] text-slate-400">{d.nextActionDate}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
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
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-600">
              <span>Showing 1 to {filteredDemos.length} of 128 demos</span>
              <div className="flex items-center gap-1">
                <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0D1F3D] text-white font-bold">
                  1
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-700">
                  2
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (3 COLS SIDEBAR) */}
        <div className="space-y-3 lg:col-span-3">
          {/* Demo Status Distribution Donut Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-3 shadow-xs space-y-2 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-1.5">
              Demo Status Distribution
            </h3>

            <div className="relative py-1 flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full border-4 border-emerald-500 border-t-blue-600 border-r-amber-500 border-b-red-500 flex flex-col items-center justify-center shadow-xs">
                <span className="text-sm font-extrabold text-[#0D1F3D]">128</span>
                <span className="text-[8px] font-bold text-slate-400">Total</span>
              </div>
            </div>

            <div className="space-y-1 text-[10px] text-slate-700">
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Completed
                </span>
                <span className="font-extrabold">78 (60.9%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" /> Scheduled
                </span>
                <span className="font-extrabold">32 (25.0%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> In Progress
                </span>
                <span className="font-extrabold">12 (9.4%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Cancelled
                </span>
                <span className="font-extrabold">6 (4.7%)</span>
              </div>
            </div>
          </div>

          {/* Demos by Type Donut Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-3 shadow-xs space-y-2 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-1.5">
              Demos by Type
            </h3>

            <div className="relative py-1 flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full border-4 border-purple-600 border-t-amber-500 border-r-indigo-600 flex flex-col items-center justify-center shadow-xs">
                <span className="text-sm font-extrabold text-[#0D1F3D]">128</span>
                <span className="text-[8px] font-bold text-slate-400">Total</span>
              </div>
            </div>

            <div className="space-y-1 text-[10px] text-slate-700">
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-purple-600" /> Product Demo
                </span>
                <span className="font-extrabold">68 (53.1%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Live Demo
                </span>
                <span className="font-extrabold">32 (25.0%)</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" /> Online Demo
                </span>
                <span className="font-extrabold">28 (21.9%)</span>
              </div>
            </div>
          </div>

          {/* Top Executives by Demos List */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-3 shadow-xs space-y-2 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-1.5">
              Top Executives by Demos
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0D1F3D]">1. Arjun Mehta</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                  </div>
                  <span className="font-mono font-bold text-slate-800">28</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0D1F3D]">2. Neha Sharma</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[75%]" />
                  </div>
                  <span className="font-mono font-bold text-slate-800">24</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0D1F3D]">3. Pooja Yadav</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[65%]" />
                  </div>
                  <span className="font-mono font-bold text-slate-800">20</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0D1F3D]">4. Rakesh Patel</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[55%]" />
                  </div>
                  <span className="font-mono font-bold text-slate-800">18</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[#0D1F3D]">5. Kiran Jadhav</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[50%]" />
                  </div>
                  <span className="font-mono font-bold text-slate-800">16</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin/demos/conversions')}
              className="text-xs font-bold text-blue-600 hover:underline block text-center w-full pt-1 cursor-pointer"
            >
              View Full Conversion Report →
            </button>
          </div>
        </div>
      </div>

      {/* Add Demo Modal */}
      <AddDemoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
