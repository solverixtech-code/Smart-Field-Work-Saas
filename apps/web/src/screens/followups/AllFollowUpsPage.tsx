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
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Checkbox } from '../../components/ui/Checkbox';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { mockFollowUpsList, FollowUpItem } from './followupsData';
import { AddFollowUpModal } from './AddFollowUpModal';
import { EditFollowUpModal } from './EditFollowUpModal';

export default function AllFollowUpsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [assignedToFilter, setAssignedToFilter] = useState('All');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFollowup, setEditingFollowup] = useState<FollowUpItem | undefined>(undefined);

  const filteredFollowups = mockFollowUpsList.filter((f) => {
    const matchesSearch =
      f.followupId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || f.status === statusFilter;
    const matchesType = typeFilter === 'All' || f.followupType === typeFilter;
    const matchesAssigned = assignedToFilter === 'All' || f.assignedToName === assignedToFilter;

    return matchesSearch && matchesStatus && matchesType && matchesAssigned;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredFollowups.map((f) => f.id));
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
    setTypeFilter('All');
    setAssignedToFilter('All');
    toast.info('Filters reset to default');
  };

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D] flex items-center gap-2">
            All Follow-ups <Calendar className="h-6 w-6 text-red-600" />
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Manage all follow-ups and track their status across the team.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DateRangePicker />

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Exporting follow-ups report...')}
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
            <span className="text-xs font-semibold text-slate-500 block">Total Follow-ups</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">256</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 18.7% vs last 30 days</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Completed</span>
            <span className="text-xl font-extrabold text-emerald-600">98</span>
            <span className="text-xs font-medium text-slate-500 block">38.3% of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Pending</span>
            <span className="text-xl font-extrabold text-amber-600">112</span>
            <span className="text-xs font-medium text-slate-500 block">43.8% of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Overdue</span>
            <span className="text-xl font-extrabold text-red-600">32</span>
            <span className="text-xs font-medium text-slate-500 block">12.5% of total</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition" onClick={() => navigate('/admin/follow-ups/today')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Today's Follow-ups</span>
            <span className="text-xl font-extrabold text-purple-600">28</span>
            <span className="text-xs font-bold text-blue-600 block">View today's list →</span>
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
              placeholder="Search by lead, business, contact, executive..."
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
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
              <option value="Scheduled">Scheduled</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D]"
            >
              <option value="All">Type: All</option>
              <option value="Demo Follow-up">Demo Follow-up</option>
              <option value="Quotation Follow-up">Quotation Follow-up</option>
              <option value="Product Info Follow-up">Product Info Follow-up</option>
              <option value="Payment Follow-up">Payment Follow-up</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={assignedToFilter}
              onChange={(e) => setAssignedToFilter(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0D1F3D]"
            >
              <option value="All">Assigned: All</option>
              <option value="Pooja Yadav">Pooja Yadav</option>
              <option value="Rakesh Patel">Rakesh Patel</option>
              <option value="Neha Sharma">Neha Sharma</option>
              <option value="Arjun Mehta">Arjun Mehta</option>
              <option value="Kiran Jadhav">Kiran Jadhav</option>
            </select>
          </div>

          <div className="lg:col-span-2 flex items-center justify-end gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('More filters opened')}
              className="text-xs font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1"
            >
              <Filter className="h-3.5 w-3.5 text-slate-500" /> Filters
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

      {/* FULL WIDTH DATA TABLE */}
      <div className="rounded-sm border border-slate-200/90 bg-white shadow-xs overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="p-3 w-10 text-center">
                  <Checkbox
                    checked={
                      selectedRows.length === filteredFollowups.length &&
                      filteredFollowups.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="p-3 whitespace-nowrap">Follow-up ID</th>
                <th className="p-3">Lead / Business</th>
                <th className="p-3 whitespace-nowrap">Contact Person</th>
                <th className="p-3 whitespace-nowrap">Follow-up Type</th>
                <th className="p-3 whitespace-nowrap">Assigned To</th>
                <th className="p-3 whitespace-nowrap">Follow-up Date & Time</th>
                <th className="p-3 text-center whitespace-nowrap">Status</th>
                <th className="p-3 text-center whitespace-nowrap">Priority</th>
                <th className="p-3 text-center whitespace-nowrap w-16">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFollowups.map((f) => {
                const isChecked = selectedRows.includes(f.id);
                return (
                  <tr
                    key={f.id}
                    onClick={() => navigate(`/admin/follow-ups/${f.id}`)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isChecked}
                        onChange={() => handleToggleRow(f.id)}
                      />
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
                    <td className="p-3 whitespace-nowrap text-slate-600 font-medium">
                      <div>
                        <span className="font-bold text-slate-800 block">{f.followupDate}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{f.followupTime}</span>
                      </div>
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
                    <td className="p-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <RowActionsMenu
                        items={[
                          {
                            label: 'View Details',
                            icon: Eye,
                            onClick: () => navigate(`/admin/follow-ups/${f.id}`),
                          },
                          {
                            label: 'Edit Follow-up',
                            icon: Edit,
                            onClick: () => {
                              setEditingFollowup(f);
                              setIsEditModalOpen(true);
                            },
                          },
                          {
                            label: 'Mark as Completed',
                            icon: CheckCircle2,
                            onClick: () => toast.success(`Follow-up ${f.followupId} completed!`),
                          },
                          {
                            label: 'Reschedule',
                            icon: Calendar,
                            onClick: () => toast.info('Reschedule modal opened'),
                          },
                          {
                            label: 'Delete',
                            icon: Trash2,
                            danger: true,
                            divider: true,
                            onClick: () => toast.error(`Follow-up ${f.followupId} deleted`),
                          },
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-600">
          <span>Showing 1 to {filteredFollowups.length} of 256 follow-ups</span>
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

      {/* BOTTOM ANALYTICS CARDS (Placed below table on next line) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {/* Follow-ups by Status Donut */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Follow-ups by Status
          </h3>

          <div className="relative py-2 flex flex-col items-center justify-center">
            <div className="h-20 w-20 rounded-full border-4 border-emerald-500 border-t-amber-500 border-r-red-500 border-b-blue-600 flex flex-col items-center justify-center shadow-xs">
              <span className="text-base font-extrabold text-[#0D1F3D]">256</span>
              <span className="text-[9px] font-bold text-slate-400">Total</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Completed
              </span>
              <span className="font-extrabold">98 (38.3%)</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Pending
              </span>
              <span className="font-extrabold">112 (43.8%)</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Overdue
              </span>
              <span className="font-extrabold">32 (12.5%)</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> Scheduled
              </span>
              <span className="font-extrabold">14 (5.4%)</span>
            </div>
          </div>
        </div>

        {/* Follow-ups by Type Donut */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Follow-ups by Type
          </h3>

          <div className="relative py-2 flex flex-col items-center justify-center">
            <div className="h-20 w-20 rounded-full border-4 border-purple-600 border-t-purple-400 border-r-blue-600 border-b-emerald-500 flex flex-col items-center justify-center shadow-xs">
              <span className="text-base font-extrabold text-[#0D1F3D]">256</span>
              <span className="text-[9px] font-bold text-slate-400">Total</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-purple-600" /> Demo Follow-up
              </span>
              <span className="font-extrabold">96 (37.5%)</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-purple-400" /> Quotation Follow-up
              </span>
              <span className="font-extrabold">72 (28.1%)</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-blue-600" /> Product Info Follow-up
              </span>
              <span className="font-extrabold">48 (18.8%)</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Payment Follow-up
              </span>
              <span className="font-extrabold">40 (15.6%)</span>
            </div>
          </div>
        </div>

        {/* Overdue Follow-ups Quick Summary */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Overdue Follow-ups</h3>
            <button
              onClick={() => navigate('/admin/follow-ups/overdue')}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-[#0D1F3D] block">Sharma Medical Store</span>
                <span className="text-[10px] text-slate-500">21 May 2025, 10:30 AM</span>
              </div>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-xs">
                2 days overdue
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-[#0D1F3D] block">Sai Enterprises</span>
                <span className="text-[10px] text-slate-500">24 May 2025, 03:00 PM</span>
              </div>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-xs">
                1 day overdue
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-[#0D1F3D] block">Patel Electronics</span>
                <span className="text-[10px] text-slate-500">19 May 2025, 11:00 AM</span>
              </div>
              <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-xs">
                3 days overdue
              </span>
            </div>
          </div>
        </div>

        {/* Today's Follow-ups Quick Summary */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-extrabold text-[#0D1F3D]">Today's Follow-ups</h3>
            <button
              onClick={() => navigate('/admin/follow-ups/today')}
              className="text-[11px] font-bold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-600">11:00 AM</span>
                <span className="font-extrabold text-[#0D1F3D]">Royal Bakers</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Pooja Yadav</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-600">02:00 PM</span>
                <span className="font-extrabold text-[#0D1F3D]">Metro Supermart</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Rakesh Patel</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-600">04:00 PM</span>
                <span className="font-extrabold text-[#0D1F3D]">Fresh & Green</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Pooja Yadav</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-2 text-center font-extrabold text-[#0D1F3D]">
            Total Today: 28
          </div>
        </div>
      </div>

      <AddFollowUpModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <EditFollowUpModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        followup={editingFollowup}
      />
    </div>
  );
}
