import React, { useState } from 'react';
import { Clock, Calendar, Users, Plus, Edit, CheckCircle2, ShieldAlert, AlertCircle, ArrowRight } from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';

const mockShifts = [
  { id: 'SHIFT-1', name: 'General Shift', code: 'GEN-01', start: '09:00 AM', end: '06:00 PM', grace: '15 mins', halfDay: '4.5 hrs', break: '60 mins', staffCount: 112, status: 'Active', color: 'border-l-blue-600' },
  { id: 'SHIFT-2', name: 'Morning Shift', code: 'MOR-01', start: '07:00 AM', end: '04:00 PM', grace: '15 mins', halfDay: '4.5 hrs', break: '45 mins', staffCount: 24, status: 'Active', color: 'border-l-emerald-500' },
  { id: 'SHIFT-3', name: 'Night Shift', code: 'NIG-01', start: '10:00 PM', end: '07:00 AM', grace: '20 mins', halfDay: '4.5 hrs', break: '60 mins', staffCount: 12, status: 'Active', color: 'border-l-purple-600' },
  { id: 'SHIFT-4', name: 'Weekend Support', code: 'WND-01', start: '10:00 AM', end: '05:00 PM', grace: '10 mins', halfDay: '3.5 hrs', break: '30 mins', staffCount: 8, status: 'Active', color: 'border-l-amber-500' },
];

const mockAssignments = [
  { id: 'FE-1001', name: 'Rahul Verma', team: 'Mumbai North Team', shift: 'General Shift (09:00 AM - 06:00 PM)', startDate: '12 Apr 2024', status: 'Assigned' },
  { id: 'FE-1002', name: 'Priya Mehta', team: 'Mumbai West Team', shift: 'General Shift (09:00 AM - 06:00 PM)', startDate: '18 Apr 2024', status: 'Assigned' },
  { id: 'FE-1003', name: 'Sanjay Yadav', team: 'Mumbai East Team', shift: 'Morning Shift (07:00 AM - 04:00 PM)', startDate: '02 May 2024', status: 'Assigned' },
  { id: 'FE-1004', name: 'Kavita Singh', team: 'Thane Central', shift: 'General Shift (09:00 AM - 06:00 PM)', startDate: '10 Mar 2024', status: 'Assigned' },
  { id: 'FE-1005', name: 'Arun Kumar', team: 'Navi Mumbai Hub', shift: 'Night Shift (10:00 PM - 07:00 AM)', startDate: '25 Apr 2024', status: 'Assigned' },
];

export default function ShiftManagementPage() {
  const [shifts, setShifts] = useState(mockShifts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newShift, setNewShift] = useState({ name: '', code: '', start: '09:00', end: '18:00', grace: '15' });

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShift.name || !newShift.code) return;
    const created = {
      id: `SHIFT-${shifts.length + 1}`,
      name: newShift.name,
      code: newShift.code,
      start: newShift.start,
      end: newShift.end,
      grace: `${newShift.grace} mins`,
      halfDay: '4.5 hrs',
      break: '60 mins',
      staffCount: 0,
      status: 'Active',
      color: 'border-l-red-600',
    };
    setShifts([...shifts, created]);
    setShowAddModal(false);
    setNewShift({ name: '', code: '', start: '09:00', end: '18:00', grace: '15' });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Shift Management & Rostering</h1>
          <p className="text-xs font-medium text-slate-500">
            Configure work shifts, grace periods, overtime rules, and assign shifts to field staff.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 font-bold shadow-sm"
        >
          <Plus className="h-4 w-4" /> Create Shift Template
        </Button>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Active Shift Templates"
          value="4 Shifts"
          subValue="100% active"
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

      {/* Main Grid: Shift Templates Cards + Executive Shift Assignments Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Shift Templates Cards */}
        <div className="space-y-4 lg:col-span-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Shift Templates ({shifts.length})</h3>
            <span className="text-xs font-bold text-slate-400">Default & Custom Rules</span>
          </div>

          <div className="space-y-3">
            {shifts.map((shift) => (
              <div
                key={shift.id}
                className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm border-l-4 ${shift.color} space-y-3 hover:shadow-md transition-all`}
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
                      ⏱ {shift.start} - {shift.end}
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600">
                    {shift.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-slate-600 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-medium">Grace Period</span>
                    <span className="font-extrabold text-[#0D1F3D]">{shift.grace}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Half Day Threshold</span>
                    <span className="font-extrabold text-[#0D1F3D]">{shift.halfDay}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Break Time</span>
                    <span className="font-extrabold text-[#0D1F3D]">{shift.break}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs font-bold">
                  <span className="text-slate-500">{shift.staffCount} Executives Assigned</span>
                  <button type="button" onClick={() => alert(`Editing ${shift.name}`)} className="text-[#E20613] hover:underline flex items-center gap-1">
                    <Edit className="h-3.5 w-3.5" /> Edit Rules
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
            <span className="text-xs font-bold text-[#E20613]">Live Assignments</span>
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

      {/* Add Shift Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Create Shift Template</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="text-slate-600 block mb-1 font-bold">Shift Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Afternoon Shift"
                  value={newShift.name}
                  onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-bold">Shift Code *</label>
                <input
                  type="text"
                  placeholder="e.g. AFT-01"
                  value={newShift.code}
                  onChange={(e) => setNewShift({ ...newShift, code: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">Start Time *</label>
                  <input
                    type="text"
                    placeholder="02:00 PM"
                    value={newShift.start}
                    onChange={(e) => setNewShift({ ...newShift, start: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1 font-bold">End Time *</label>
                  <input
                    type="text"
                    placeholder="11:00 PM"
                    value={newShift.end}
                    onChange={(e) => setNewShift({ ...newShift, end: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-bold">Grace Period (Minutes)</label>
                <input
                  type="text"
                  placeholder="15"
                  value={newShift.grace}
                  onChange={(e) => setNewShift({ ...newShift, grace: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-bold text-[#0D1F3D] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="accent" size="sm" className="font-bold">
                  Save Shift
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
