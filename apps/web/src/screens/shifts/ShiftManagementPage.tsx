import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  Users,
  Plus,
  Edit,
  CheckCircle2,
  AlertCircle,
  Activity,
  Info,
  Check,
  CalendarRange,
  X,
} from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button, Modal } from '../../components/ui';

export type ShiftTemplate = {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  workingDays: number[];
  lateGraceMinutes: number;
  lateThresholdCount: number;
  latePenaltyStatus: string;
  isActive: boolean;
  staffCount: number;
};

const DEFAULT_SHIFT_WORKING_DAYS = [1, 2, 3, 4, 5, 6]; // Mon - Sat

const shiftWeekDays = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const shiftTimeOptions = [
  '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM',
  '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
  '09:00 PM', '10:00 PM',
];

const initialShifts: ShiftTemplate[] = [
  {
    id: 'SHIFT-1',
    name: 'General Shift',
    code: 'GEN-01',
    startTime: '09:30 AM',
    endTime: '06:30 PM',
    workingDays: [1, 2, 3, 4, 5, 6],
    lateGraceMinutes: 15,
    lateThresholdCount: 3,
    latePenaltyStatus: 'Half Day',
    isActive: true,
    staffCount: 112,
  },
  {
    id: 'SHIFT-2',
    name: 'Morning Shift',
    code: 'MOR-01',
    startTime: '07:00 AM',
    endTime: '04:00 PM',
    workingDays: [1, 2, 3, 4, 5, 6],
    lateGraceMinutes: 15,
    lateThresholdCount: 3,
    latePenaltyStatus: 'Half Day',
    isActive: true,
    staffCount: 24,
  },
  {
    id: 'SHIFT-3',
    name: 'Night Shift',
    code: 'NIG-01',
    startTime: '10:00 PM',
    endTime: '07:00 AM',
    workingDays: [1, 2, 3, 4, 5],
    lateGraceMinutes: 20,
    lateThresholdCount: 2,
    latePenaltyStatus: 'Absent',
    isActive: true,
    staffCount: 12,
  },
  {
    id: 'SHIFT-4',
    name: 'Weekend Support',
    code: 'WND-01',
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    workingDays: [0, 6],
    lateGraceMinutes: 10,
    lateThresholdCount: 3,
    latePenaltyStatus: 'Half Day',
    isActive: true,
    staffCount: 8,
  },
];

const mockAssignments = [
  { id: 'FE-1001', name: 'Rahul Verma', team: 'Mumbai North Team', shift: 'General Shift (09:30 AM - 06:30 PM)', startDate: '12 Apr 2024', status: 'Assigned' },
  { id: 'FE-1002', name: 'Priya Mehta', team: 'Mumbai West Team', shift: 'General Shift (09:30 AM - 06:30 PM)', startDate: '18 Apr 2024', status: 'Assigned' },
  { id: 'FE-1003', name: 'Sanjay Yadav', team: 'Mumbai East Team', shift: 'Morning Shift (07:00 AM - 04:00 PM)', startDate: '02 May 2024', status: 'Assigned' },
  { id: 'FE-1004', name: 'Kavita Singh', team: 'Thane Central', shift: 'General Shift (09:30 AM - 06:30 PM)', startDate: '10 Mar 2024', status: 'Assigned' },
  { id: 'FE-1005', name: 'Arun Kumar', team: 'Navi Mumbai Hub', shift: 'Night Shift (10:00 PM - 07:00 AM)', startDate: '25 Apr 2024', status: 'Assigned' },
];

const formatWorkingDays = (days?: number[]) => {
  const selectedDays = days?.length ? days : DEFAULT_SHIFT_WORKING_DAYS;
  return shiftWeekDays
    .filter((day) => selectedDays.includes(day.value))
    .map((day) => day.label)
    .join(', ');
};

export default function ShiftManagementPage() {
  const [shifts, setShifts] = useState<ShiftTemplate[]>(initialShifts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftTemplate | null>(null);

  const [form, setForm] = useState({
    name: '',
    code: '',
    startTime: '09:30 AM',
    endTime: '06:30 PM',
    lateGraceMinutes: 15,
    lateThresholdCount: 3,
    latePenaltyStatus: 'Half Day',
    workingDays: DEFAULT_SHIFT_WORKING_DAYS,
    isActive: true,
  });

  const handleOpenCreate = () => {
    setEditingShift(null);
    setForm({
      name: '',
      code: '',
      startTime: '09:30 AM',
      endTime: '06:30 PM',
      lateGraceMinutes: 15,
      lateThresholdCount: 3,
      latePenaltyStatus: 'Half Day',
      workingDays: DEFAULT_SHIFT_WORKING_DAYS,
      isActive: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (shift: ShiftTemplate) => {
    setEditingShift(shift);
    setForm({
      name: shift.name,
      code: shift.code,
      startTime: shift.startTime,
      endTime: shift.endTime,
      lateGraceMinutes: shift.lateGraceMinutes,
      lateThresholdCount: shift.lateThresholdCount,
      latePenaltyStatus: shift.latePenaltyStatus,
      workingDays: shift.workingDays,
      isActive: shift.isActive,
    });
    setShowAddModal(true);
  };

  const handleSaveShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingShift) {
      setShifts((prev) =>
        prev.map((s) =>
          s.id === editingShift.id
            ? {
                ...s,
                name: form.name,
                code: form.code || s.code,
                startTime: form.startTime,
                endTime: form.endTime,
                lateGraceMinutes: form.lateGraceMinutes,
                lateThresholdCount: form.lateThresholdCount,
                latePenaltyStatus: form.latePenaltyStatus,
                workingDays: form.workingDays,
                isActive: form.isActive,
              }
            : s,
        ),
      );
    } else {
      const created: ShiftTemplate = {
        id: `SHIFT-${shifts.length + 1}`,
        name: form.name,
        code: form.code || `SHF-0${shifts.length + 1}`,
        startTime: form.startTime,
        endTime: form.endTime,
        lateGraceMinutes: form.lateGraceMinutes,
        lateThresholdCount: form.lateThresholdCount,
        latePenaltyStatus: form.latePenaltyStatus,
        workingDays: form.workingDays,
        isActive: form.isActive,
        staffCount: 0,
      };
      setShifts([...shifts, created]);
    }

    setShowAddModal(false);
  };

  const previewPenalty =
    form.latePenaltyStatus === 'Half Day'
      ? 'mark as half day'
      : form.latePenaltyStatus === 'Absent'
      ? 'mark as absent'
      : 'keep as present';

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Shift Management & Rostering</h1>
          <p className="text-xs font-medium text-slate-500">
            Define working days, punch timing, grace windows, and late penalty rules for employee assignments.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 font-bold shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create Shift Template
        </Button>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Shift Templates"
          value={`${shifts.filter((s) => s.isActive).length} Shifts`}
          subValue="100% configured"
          icon={Clock}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Assigned Executives"
          value="156 Staff"
          subValue="All assigned"
          icon={Users}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Shift Coverage"
          value="96.2%"
          change="+2.4%"
          changeType="positive"
          timeframe="vs last month"
          icon={CheckCircle2}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Shift Exceptions"
          value="3 Pending"
          subValue="Swap requests"
          icon={AlertCircle}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
      </div>

      {/* Main Grid: Shift Templates Cards + Executive Shift Roster Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Configured Shifts */}
        <div className="space-y-4 lg:col-span-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Configured Shifts ({shifts.length})</h3>
            <span className="text-xs font-bold text-slate-400">TrueRoot HR Shift Engine</span>
          </div>

          <div className="space-y-3">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-3 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-[#0D1F3D]">{shift.name}</h4>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600">
                        {shift.code}
                      </span>
                    </div>
                    <p className="text-xs font-extrabold text-[#E20613] mt-0.5">
                      ⏱ {shift.startTime} to {shift.endTime}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                      shift.isActive
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {shift.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-600">
                  <span className="font-bold text-[#0D1F3D]">Working days:</span> {formatWorkingDays(shift.workingDays)}
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-[11px] font-bold">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    Grace {shift.lateGraceMinutes} mins
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    {shift.lateThresholdCount} lates threshold
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
                    Penalty: {shift.latePenaltyStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-bold">
                  <span className="text-slate-400">{shift.staffCount} Staff Assigned</span>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(shift)}
                    className="text-[#E20613] hover:underline flex items-center gap-1 font-bold"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit Shift Rules
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Executive Shift Roster Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Executive Shift Roster</h3>
            <span className="text-xs font-bold text-[#E20613]">Live Roster</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase">
                  <th className="px-3.5 py-3">Executive</th>
                  <th className="px-3.5 py-3">Assigned Shift</th>
                  <th className="px-3.5 py-3">Effective Date</th>
                  <th className="px-3.5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {mockAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="px-3.5 py-3">
                      <div>
                        <p className="font-extrabold text-[#0D1F3D]">{a.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{a.id} • {a.team}</p>
                      </div>
                    </td>
                    <td className="px-3.5 py-3 font-extrabold text-[#E20613]">{a.shift}</td>
                    <td className="px-3.5 py-3 text-slate-500 font-medium">{a.startDate}</td>
                    <td className="px-3.5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Reassign shift for ${a.name}`)}
                        className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-[#0D1F3D]"
                      >
                        Reassign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* TrueRoot Shift Creation / Edit Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="max-w-lg">
        {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#0D1F3D]">
                  <Clock className="h-5 w-5 text-[#E20613]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0D1F3D]">
                    {editingShift ? 'Edit Shift Template' : 'Create Shift Template'}
                  </h3>
                  <p className="text-xs text-slate-500">Define working days, timing window, and late arrival rules.</p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveShift} className="space-y-4 text-xs font-semibold">
              {/* TrueRoot Live Rule Preview Box */}
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3.5 space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                  <Activity className="h-3.5 w-3.5 text-blue-700" /> Live Rule Preview
                </div>
                <p className="text-xs font-bold text-[#0D1F3D]">
                  {form.name.trim() || 'New Shift'} • {form.startTime} to {form.endTime}
                </p>
                <p className="text-[11px] font-medium leading-relaxed text-slate-600">
                  Allow {form.lateGraceMinutes} minutes grace after start time. On the{' '}
                  <span className="font-bold text-[#0D1F3D]">{form.lateThresholdCount}th</span> late punch in a month, {previewPenalty}.
                </p>
              </div>

              {/* Shift Name & Code Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Shift Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. General Shift"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Shift Code *</label>
                  <input
                    type="text"
                    placeholder="e.g. GEN-01"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                  />
                </div>
              </div>

              {/* Start & End Time Clock Dropdowns */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Start Time *</label>
                  <select
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                  >
                    {shiftTimeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">End Time *</label>
                  <select
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                  >
                    {shiftTimeOptions.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Working Days Buttons */}
              <div className="space-y-1.5">
                <label className="text-slate-600 block font-bold">Working Days</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {shiftWeekDays.map((day) => {
                    const isSelected = form.workingDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() =>
                          setForm((current) => {
                            const nextDays = isSelected
                              ? current.workingDays.filter((v) => v !== day.value)
                              : [...current.workingDays, day.value];
                            return {
                              ...current,
                              workingDays: nextDays.length
                                ? nextDays.sort((a, b) => a - b)
                                : current.workingDays,
                            };
                          })
                        }
                        className={`h-9 rounded-xl border text-xs font-bold transition-colors ${
                          isSelected
                            ? 'border-[#0D1F3D] bg-[#0D1F3D] text-white'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grace Minutes & Late Threshold Count */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Grace Period (Mins)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.lateGraceMinutes}
                    onChange={(e) => setForm({ ...form, lateGraceMinutes: Number(e.target.value || 0) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Late Threshold (Count)</label>
                  <input
                    type="number"
                    min="1"
                    value={form.lateThresholdCount}
                    onChange={(e) => setForm({ ...form, lateThresholdCount: Number(e.target.value || 1) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                  />
                </div>
              </div>

              {/* Late Penalty Status Dropdown */}
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Late Penalty Status</label>
                <select
                  value={form.latePenaltyStatus}
                  onChange={(e) => setForm({ ...form, latePenaltyStatus: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                >
                  <option value="Half Day">Half Day (Penalty)</option>
                  <option value="Absent">Absent (Penalty)</option>
                  <option value="Present">Present Only (No Penalty)</option>
                </select>
              </div>

              {/* Active Toggle Checkbox */}
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-[#0D1F3D] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#E20613]"
                />
                <span>Shift is active and available for executive assignment</span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="accent" size="sm" className="font-bold">
                  {editingShift ? 'Update Shift' : 'Create Shift'}
                </Button>
              </div>
            </form>
      </Modal>
    </div>
  );
}
