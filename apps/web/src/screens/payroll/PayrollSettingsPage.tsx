import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Settings,
  Calendar,
  Clock,
  Coins,
  ShieldCheck,
  Mail,
  CheckCircle2,
  Save,
  Info,
  SlidersHorizontal,
  DollarSign,
  Percent,
  Lock,
  UserCheck,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function PayrollSettingsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'general' | 'attendance' | 'incentive' | 'statutory' | 'email'
  >('general');

  const [isSaving, setIsSaving] = useState(false);

  // General Settings State
  const [generalSettings, setGeneralSettings] = useState({
    salaryDivisorMode: 'working_26',
    payCycleStartDay: 1,
    lopAutoDeduct: true,
    defaultPfPct: 12,
    defaultEsiPct: 0.75,
    autoFinalizeCutoffDay: 28,
  });

  // Attendance & Shift Penalty State
  const [shiftSettings, setShiftSettings] = useState({
    shiftStartTime: '09:30',
    shiftEndTime: '18:30',
    lateGraceMinutes: 15,
    lateThresholdCount: 3,
    latePenaltyMode: 'half_day',
    earlyLeaveDeduction: true,
  });

  // Incentive Policy State
  const [incentiveSettings, setIncentiveSettings] = useState({
    minDealsToQualify: 3,
    salesIncentivePct: 2.5,
    preSalesIncentivePct: 1.0,
    teamLeaderIncentivePct: 0.5,
    visibilityScopeSales: 'OWN',
    visibilityScopeLeader: 'OWN_AND_TEAM',
  });

  // Statutory Tax & PF State
  const [statutorySettings, setStatutorySettings] = useState({
    employeePfPct: 12,
    employerPfPct: 12,
    pfCapLimit: 1800,
    applyPfCap: true,
    employeeEsiPct: 0.75,
    employerEsiPct: 3.25,
    esiGrossLimit: 21000,
    professionalTaxMonthly: 200,
  });

  // Email Template State
  const [emailSettings, setEmailSettings] = useState({
    senderName: 'Visiblo Payroll Team',
    replyTo: 'payroll@visiblo.com',
    subjectTemplate: 'Official Payslip for {month} {year} — Visiblo Field Executive',
    emailBody: `Dear {employee_name},

Attached is your official payslip for the period {month} {year}.

Summary:
- Net Payable Amount: {net_pay}
- Payment Status: Processed & Disbursed

You can log in to your Visiblo Field Executive portal anytime to view detailed attendance breakdown and download past payslips.

Best regards,
Visiblo Finance & HR Operations Team`,
    autoSendOnFinalize: true,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Payroll Settings & Policy Rules saved successfully!');
    }, 800);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Payroll Settings & Policy Rules</h1>
          <p className="text-xs font-medium text-slate-500">
            Configure salary calculation divisors, attendance loss of pay rules, shift penalties, incentive rates, statutory taxes, and payslip mail templates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/payroll')}
            className="flex items-center gap-2 font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Payroll
          </Button>

          <Button
            variant="accent"
            size="sm"
            isLoading={isSaving}
            onClick={handleSave}
            className="flex items-center gap-2 font-bold shadow-sm"
          >
            <Save className="h-4 w-4" /> Save All Settings
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 bg-white p-2 rounded-2xl shadow-xs">
        {[
          { id: 'general', label: 'General & Pay Cycle', icon: Calendar },
          { id: 'attendance', label: 'Attendance & Shift Penalties', icon: Clock },
          { id: 'incentive', label: 'Incentive Policy & Rules', icon: Coins },
          { id: 'statutory', label: 'Statutory Tax & PF', icon: ShieldCheck },
          { id: 'email', label: 'Payslip Email Templates', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0D1F3D] text-white shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-[#0D1F3D]'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: General & Pay Cycle */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5 text-xs">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">General Payroll Calculation Rules</h3>

              {/* Salary Divisor Days */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Salary Divisor Days Rule *</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { id: 'working_26', label: 'Working Days (26 Days)', desc: 'Exclude standard Sundays / weekly offs' },
                    { id: 'calendar_30', label: 'Standard 30 Days', desc: 'Fixed 30-day divisor for every month' },
                    { id: 'actual_month', label: 'Actual Month Days', desc: 'Uses 28, 30, or 31 days depending on month' },
                  ].map((mode) => (
                    <label
                      key={mode.id}
                      onClick={() => setGeneralSettings({ ...generalSettings, salaryDivisorMode: mode.id })}
                      className={`flex flex-col justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                        generalSettings.salaryDivisorMode === mode.id
                          ? 'border-[#0D1F3D] bg-blue-50/40 ring-1 ring-[#0D1F3D]'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="radio"
                          name="salaryDivisor"
                          checked={generalSettings.salaryDivisorMode === mode.id}
                          onChange={() => {}}
                          className="text-[#0D1F3D]"
                        />
                        <span className="font-extrabold text-[#0D1F3D]">{mode.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{mode.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pay Cycle Start & Cutoff */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Monthly Pay Cycle Start Day</label>
                  <select
                    value={generalSettings.payCycleStartDay}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, payCycleStartDay: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  >
                    <option value={1}>1st of every month (1st - 30th/31st)</option>
                    <option value={25}>25th of previous month (25th - 24th)</option>
                  </select>
                  <p className="text-[10px] text-slate-400 font-medium">Determines attendance & sales incentive evaluation window.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Auto-Finalize Cutoff Day</label>
                  <select
                    value={generalSettings.autoFinalizeCutoffDay}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, autoFinalizeCutoffDay: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  >
                    <option value={25}>25th of month</option>
                    <option value={28}>28th of month</option>
                    <option value={30}>Last day of month</option>
                  </select>
                  <p className="text-[10px] text-slate-400 font-medium">Automatic draft payslip lock date before salary disbursement.</p>
                </div>
              </div>

              {/* LOP Toggle */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">Auto-Deduct Loss of Pay (LOP)</p>
                  <p className="text-[11px] text-slate-500 font-medium">Automatically calculate salary deduction based on unapproved absent days.</p>
                </div>
                <input
                  type="checkbox"
                  checked={generalSettings.lopAutoDeduct}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, lopAutoDeduct: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-[#E20613] focus:ring-[#E20613] cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-blue-900 font-extrabold text-sm">
                <Info className="h-4 w-4 text-blue-600" />
                <span>Formula & Policy Note</span>
              </div>
              <p className="text-slate-600 leading-relaxed font-medium">
                Per-day salary calculation formula:
              </p>
              <div className="rounded-xl bg-white p-3 border border-blue-200/60 font-mono text-[11px] text-[#0D1F3D] font-bold">
                Per Day Salary = (Base Salary + Allowances) ÷ Divisor Days
              </div>
              <p className="text-slate-500 leading-snug">
                Net Pay is derived after applying LOP deduction, late penalties, statutory PF/ESI, and adding approved incentives.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Attendance & Shift Penalties */}
      {activeTab === 'attendance' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5 text-xs">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Shift & Late Arrival Penalty Rules</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Default Shift Start Time</label>
                  <input
                    type="time"
                    value={shiftSettings.shiftStartTime}
                    onChange={(e) => setShiftSettings({ ...shiftSettings, shiftStartTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Default Shift End Time</label>
                  <input
                    type="time"
                    value={shiftSettings.shiftEndTime}
                    onChange={(e) => setShiftSettings({ ...shiftSettings, shiftEndTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Late Arrival Grace Period (Minutes)</label>
                  <select
                    value={shiftSettings.lateGraceMinutes}
                    onChange={(e) => setShiftSettings({ ...shiftSettings, lateGraceMinutes: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  >
                    <option value={10}>10 Minutes Grace</option>
                    <option value={15}>15 Minutes Grace</option>
                    <option value={30}>30 Minutes Grace</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Late Threshold Count</label>
                  <select
                    value={shiftSettings.lateThresholdCount}
                    onChange={(e) => setShiftSettings({ ...shiftSettings, lateThresholdCount: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  >
                    <option value={3}>Every 3 Late Arrivals</option>
                    <option value={4}>Every 4 Late Arrivals</option>
                    <option value={5}>Every 5 Late Arrivals</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="font-bold text-slate-700 block">Penalty for Exceeding Late Threshold</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label
                    onClick={() => setShiftSettings({ ...shiftSettings, latePenaltyMode: 'half_day' })}
                    className={`flex items-center gap-2.5 rounded-xl border p-3.5 cursor-pointer ${
                      shiftSettings.latePenaltyMode === 'half_day'
                        ? 'border-[#0D1F3D] bg-blue-50/40 ring-1 ring-[#0D1F3D]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="latePenalty"
                      checked={shiftSettings.latePenaltyMode === 'half_day'}
                      onChange={() => {}}
                      className="text-[#0D1F3D]"
                    />
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Half Day Loss of Pay</p>
                      <p className="text-[11px] text-slate-500">Deducts 0.5 day per threshold breached</p>
                    </div>
                  </label>

                  <label
                    onClick={() => setShiftSettings({ ...shiftSettings, latePenaltyMode: 'full_day' })}
                    className={`flex items-center gap-2.5 rounded-xl border p-3.5 cursor-pointer ${
                      shiftSettings.latePenaltyMode === 'full_day'
                        ? 'border-[#0D1F3D] bg-blue-50/40 ring-1 ring-[#0D1F3D]'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="latePenalty"
                      checked={shiftSettings.latePenaltyMode === 'full_day'}
                      onChange={() => {}}
                      className="text-[#0D1F3D]"
                    />
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">Full Day Loss of Pay</p>
                      <p className="text-[11px] text-slate-500">Deducts 1.0 full day salary</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span>Shift Rule Warning</span>
              </div>
              <p className="text-amber-800 leading-relaxed font-medium">
                Changes to grace periods or late thresholds apply to un-finalized draft payroll runs. Previous paid payslips will not be retroactively updated.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Incentive Policy & Rules */}
      {activeTab === 'incentive' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5 text-xs">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Monthly Incentive Policy & Rates</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Minimum Deals to Qualify</label>
                  <input
                    type="number"
                    value={incentiveSettings.minDealsToQualify}
                    onChange={(e) => setIncentiveSettings({ ...incentiveSettings, minDealsToQualify: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Executives must close at least this many deals to trigger commission payout.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Field Executive Incentive Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={incentiveSettings.salesIncentivePct}
                    onChange={(e) => setIncentiveSettings({ ...incentiveSettings, salesIncentivePct: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Pre-Sales / Telecaller Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={incentiveSettings.preSalesIncentivePct}
                    onChange={(e) => setIncentiveSettings({ ...incentiveSettings, preSalesIncentivePct: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Team Leader Override Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={incentiveSettings.teamLeaderIncentivePct}
                    onChange={(e) => setIncentiveSettings({ ...incentiveSettings, teamLeaderIncentivePct: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  />
                </div>
              </div>

              {/* Role-Based Incentive Visibility Table */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h4 className="font-extrabold text-[#0D1F3D]">Role-Based Incentive Visibility Scope</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <th className="p-3">Role</th>
                        <th className="p-3">Visibility Scope</th>
                        <th className="p-3">Can Edit Draft</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      <tr>
                        <td className="p-3">Field Executive</td>
                        <td className="p-3 font-bold text-[#0D1F3D]">Own Incentives Only</td>
                        <td className="p-3 text-slate-400">Read Only</td>
                      </tr>
                      <tr>
                        <td className="p-3">Team Leader</td>
                        <td className="p-3 font-bold text-[#0D1F3D]">Own + Team Members</td>
                        <td className="p-3 text-slate-400">Read Only</td>
                      </tr>
                      <tr>
                        <td className="p-3">Admin / Finance Ops</td>
                        <td className="p-3 font-bold text-[#0D1F3D]">All Organization Incentives</td>
                        <td className="p-3 font-extrabold text-emerald-600">Full Edit Rights</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Statutory Tax & PF Rates */}
      {activeTab === 'statutory' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5 text-xs">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Provident Fund (PF) & Statutory Tax Rates</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Employee PF Contribution (%)</label>
                  <input
                    type="number"
                    value={statutorySettings.employeePfPct}
                    onChange={(e) => setStatutorySettings({ ...statutorySettings, employeePfPct: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Employer PF Contribution (%)</label>
                  <input
                    type="number"
                    value={statutorySettings.employerPfPct}
                    onChange={(e) => setStatutorySettings({ ...statutorySettings, employerPfPct: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Monthly PF Cap Limit (₹)</label>
                  <input
                    type="number"
                    value={statutorySettings.pfCapLimit}
                    onChange={(e) => setStatutorySettings({ ...statutorySettings, pfCapLimit: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Professional Tax (PT) Monthly Slab</label>
                  <input
                    type="number"
                    value={statutorySettings.professionalTaxMonthly}
                    onChange={(e) => setStatutorySettings({ ...statutorySettings, professionalTaxMonthly: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Payslip Email Templates */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 text-xs">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Payslip Email Notification Template</h3>

              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sender Name</label>
                  <input
                    type="text"
                    value={emailSettings.senderName}
                    onChange={(e) => setEmailSettings({ ...emailSettings, senderName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-semibold text-[#0D1F3D]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    value={emailSettings.subjectTemplate}
                    onChange={(e) => setEmailSettings({ ...emailSettings, subjectTemplate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 font-semibold text-[#0D1F3D]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Body Content</label>
                  <textarea
                    rows={8}
                    value={emailSettings.emailBody}
                    onChange={(e) => setEmailSettings({ ...emailSettings, emailBody: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-xs font-semibold text-[#0D1F3D] leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-[#0D1F3D]">Auto-Send Email on Payslip Finalization</p>
                  <p className="text-[11px] text-slate-500">Automatically dispatches email with PDF attachment when a payslip is finalized.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailSettings.autoSendOnFinalize}
                  onChange={(e) => setEmailSettings({ ...emailSettings, autoSendOnFinalize: e.target.checked })}
                  className="h-5 w-5 rounded border-slate-300 text-[#E20613] focus:ring-[#E20613] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
