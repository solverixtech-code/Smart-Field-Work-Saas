import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  FileText,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  CreditCard,
  Building2,
  Calendar,
  Send,
  Settings,
  RefreshCw,
  Edit,
  Eye,
  X,
  Info,
  Check,
  UserCheck,
} from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button, Modal } from '../../components/ui';

interface IncentiveItem {
  id: string;
  title: string;
  amount: number;
  customerName?: string;
  projectName?: string;
}

interface PayrollRecord {
  id: string;
  user: string;
  empId: string;
  avatar: string;
  designation: string;
  teamName: string;
  base: number;
  hra: number;
  conveyance: number;
  allowances: number;
  gross: number;
  pf: number;
  esi: number;
  tds: number;
  absencePenalty: number;
  incentives: number;
  incentiveItems: IncentiveItem[];
  totalDeductions: number;
  netPay: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  holidayDays: number;
  leaveDays: number;
  payableDays: number;
  salaryDivisorDays: number;
  overtimeHours: number;
  status: 'Paid' | 'Draft';
  paidDate: string;
  txnRef: string;
  overrideReason?: string;
}

const mockPayrollRecords: PayrollRecord[] = [
  {
    id: 'PAY-2025-05-101',
    user: 'Rahul Verma',
    empId: 'FE-1001',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    designation: 'Field Executive',
    teamName: 'Mumbai North Team',
    base: 30000,
    hra: 12000,
    conveyance: 2000,
    allowances: 3000,
    gross: 47000,
    pf: 3600,
    esi: 0,
    tds: 1500,
    absencePenalty: 1000,
    incentives: 4500,
    incentiveItems: [
      { id: 'inc-1', title: 'Booking Incentive', amount: 3000, customerName: 'Rohan Sharma', projectName: 'Skyline Towers' },
      { id: 'inc-2', title: 'Target Milestone Bonus', amount: 1500, customerName: 'Vikas Shah', projectName: 'Ocean Heights' },
    ],
    totalDeductions: 6100,
    netPay: 45400,
    presentDays: 26,
    absentDays: 2,
    lateDays: 2,
    holidayDays: 2,
    leaveDays: 0,
    payableDays: 28,
    salaryDivisorDays: 30,
    overtimeHours: 6.5,
    status: 'Paid',
    paidDate: '20 May 2025',
    txnRef: 'TXN-98451234',
  },
  {
    id: 'PAY-2025-05-102',
    user: 'Priya Mehta',
    empId: 'FE-1002',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    designation: 'Senior Executive',
    teamName: 'Mumbai North Team',
    base: 32000,
    hra: 12800,
    conveyance: 2000,
    allowances: 3500,
    gross: 50300,
    pf: 3840,
    esi: 0,
    tds: 1800,
    absencePenalty: 0,
    incentives: 6000,
    incentiveItems: [
      { id: 'inc-3', title: 'High Value Booking Bonus', amount: 6000, customerName: 'Sunil Patil', projectName: 'Green Park Villas' },
    ],
    totalDeductions: 5640,
    netPay: 50660,
    presentDays: 28,
    absentDays: 0,
    lateDays: 1,
    holidayDays: 2,
    leaveDays: 0,
    payableDays: 30,
    salaryDivisorDays: 30,
    overtimeHours: 4.0,
    status: 'Paid',
    paidDate: '20 May 2025',
    txnRef: 'TXN-98451235',
  },
  {
    id: 'PAY-2025-05-103',
    user: 'Sanjay Yadav',
    empId: 'FE-1003',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    designation: 'Team Leader',
    teamName: 'Mumbai North Team',
    base: 45000,
    hra: 18000,
    conveyance: 2500,
    allowances: 5000,
    gross: 70500,
    pf: 5400,
    esi: 0,
    tds: 3500,
    absencePenalty: 0,
    incentives: 7500,
    incentiveItems: [
      { id: 'inc-4', title: 'Team Target Commission (0.5%)', amount: 7500, customerName: 'North Region Team', projectName: 'All Projects' },
    ],
    totalDeductions: 8900,
    netPay: 69100,
    presentDays: 28,
    absentDays: 0,
    lateDays: 0,
    holidayDays: 2,
    leaveDays: 0,
    payableDays: 30,
    salaryDivisorDays: 30,
    overtimeHours: 12.0,
    status: 'Draft',
    paidDate: '-',
    txnRef: '-',
  },
  {
    id: 'PAY-2025-05-104',
    user: 'Kavita Singh',
    empId: 'FE-1004',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    designation: 'Field Executive',
    teamName: 'Western Suburbs Team',
    base: 28000,
    hra: 11200,
    conveyance: 2000,
    allowances: 2500,
    gross: 43700,
    pf: 3360,
    esi: 0,
    tds: 1000,
    absencePenalty: 2800,
    incentives: 1500,
    incentiveItems: [
      { id: 'inc-5', title: 'Follow-up Conversion Bonus', amount: 1500, customerName: 'Amit Deshmukh', projectName: 'Palm Crest' },
    ],
    totalDeductions: 7160,
    netPay: 38040,
    presentDays: 22,
    absentDays: 4,
    lateDays: 3,
    holidayDays: 2,
    leaveDays: 2,
    payableDays: 26,
    salaryDivisorDays: 30,
    overtimeHours: 0.0,
    status: 'Draft',
    paidDate: '-',
    txnRef: '-',
  },
  {
    id: 'PAY-2025-05-105',
    user: 'Arun Kumar',
    empId: 'FE-1005',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    designation: 'Field Executive',
    teamName: 'Thane Team',
    base: 35000,
    hra: 14000,
    conveyance: 2000,
    allowances: 4000,
    gross: 55000,
    pf: 4200,
    esi: 0,
    tds: 2000,
    absencePenalty: 0,
    incentives: 3000,
    incentiveItems: [
      { id: 'inc-6', title: 'Site Visit Closure Bonus', amount: 3000, customerName: 'Meena Kulkarni', projectName: 'Solitaire Bay' },
    ],
    totalDeductions: 6200,
    netPay: 51800,
    presentDays: 27,
    absentDays: 1,
    lateDays: 1,
    holidayDays: 2,
    leaveDays: 0,
    payableDays: 29,
    salaryDivisorDays: 30,
    overtimeHours: 8.5,
    status: 'Paid',
    paidDate: '20 May 2025',
    txnRef: 'TXN-98451239',
  },
];

export default function PayrollManagementPage() {
  const navigate = useNavigate();

  const [records, setRecords] = useState<PayrollRecord[]>(mockPayrollRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('May 2025');

  // Trueroot "Run Payroll" Modal State
  const [runPayrollModalOpen, setRunPayrollModalOpen] = useState(false);
  const [runPayrollScope, setRunPayrollScope] = useState<'all' | 'employee'>('all');
  const [selectedEmployeeScope, setSelectedEmployeeScope] = useState('');
  const [rerunExisting, setRerunExisting] = useState(false);
  const [isProcessingRun, setIsProcessingRun] = useState(false);

  // Trueroot "Process / Edit / Preview Payslip" Drawer Modal State
  const [processModalEntry, setProcessModalEntry] = useState<PayrollRecord | null>(null);
  const [processModalMode, setProcessModalMode] = useState<'edit' | 'preview'>('edit');
  const [processIncentiveInput, setProcessIncentiveInput] = useState('');
  const [processPfInput, setProcessPfInput] = useState('');
  const [processCalculatedBaseInput, setProcessCalculatedBaseInput] = useState('');
  const [processOverrideReason, setProcessOverrideReason] = useState('');

  const filteredRecords = records.filter((p) => {
    const matchesSearch =
      p.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenProcessModal = (record: PayrollRecord) => {
    setProcessModalEntry(record);
    setProcessIncentiveInput(String(record.incentives));
    setProcessPfInput(String(record.pf));
    setProcessCalculatedBaseInput(String(record.gross - record.absencePenalty));
    setProcessOverrideReason(record.overrideReason || '');
    setProcessModalMode('edit');
  };

  const handleRunPayrollSubmit = () => {
    setIsProcessingRun(true);
    setTimeout(() => {
      setIsProcessingRun(false);
      setRunPayrollModalOpen(false);
      alert(`Payroll for ${selectedMonth} ran successfully! Generated draft payslips.`);
    }, 1000);
  };

  const handleSaveDraft = () => {
    if (!processModalEntry) return;
    const newInc = Number(processIncentiveInput || 0);
    const newPf = Number(processPfInput || 0);
    const newBase = Number(processCalculatedBaseInput || 0);
    const newNet = newBase + newInc - newPf - processModalEntry.tds;

    if (
      (newInc !== processModalEntry.incentives || newPf !== processModalEntry.pf) &&
      !processOverrideReason.trim()
    ) {
      alert('Please provide an override reason for changing amounts.');
      return;
    }

    setRecords((prev) =>
      prev.map((r) =>
        r.id === processModalEntry.id
          ? {
              ...r,
              incentives: newInc,
              pf: newPf,
              netPay: newNet,
              overrideReason: processOverrideReason,
            }
          : r,
      ),
    );
    setProcessModalEntry(null);
    alert(`Draft payslip updated for ${processModalEntry.user}`);
  };

  const handleFinalizePayslip = () => {
    if (!processModalEntry) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === processModalEntry.id
          ? {
              ...r,
              status: 'Paid',
              paidDate: new Date().toLocaleDateString('en-GB'),
              txnRef: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
            }
          : r,
      ),
    );
    setProcessModalEntry(null);
    alert(`Payslip finalized and email notification sent for ${processModalEntry.user}!`);
  };

  // Stats calculation
  const totalPayout = records.reduce((acc, curr) => acc + curr.netPay, 0);
  const totalIncentives = records.reduce((acc, curr) => acc + curr.incentives, 0);
  const totalDeductions = records.reduce((acc, curr) => acc + curr.totalDeductions, 0);
  const paidCount = records.filter((r) => r.status === 'Paid').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Payroll & Payslip Management</h1>
          <p className="text-xs font-medium text-slate-500">
            Process monthly salaries, manage allowances & deductions, auto-calculate attendance penalties, and issue official payslips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/payroll/settings')}
            className="flex items-center gap-2 font-bold"
          >
            <Settings className="h-4 w-4 text-slate-500" /> Payroll Settings
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Exporting Payroll Summary...')}
            className="flex items-center gap-2 border-slate-200 text-slate-700 font-bold"
          >
            <Download className="h-4 w-4 text-[#0D1F3D]" /> Export Summary
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={() => setRunPayrollModalOpen(true)}
            className="flex items-center gap-2 font-bold shadow-sm"
          >
            <CreditCard className="h-4 w-4" /> Run Monthly Payroll
          </Button>
        </div>
      </div>

      {/* 4 Top Stat Cards matching Trueroot */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Net Payout"
          value={`₹${totalPayout.toLocaleString()}`}
          subValue="+2.4% vs last month"
          icon={IndianRupee}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Approved Incentives"
          value={`₹${totalIncentives.toLocaleString()}`}
          subValue="Booking commissions"
          icon={CreditCard}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Total Deductions"
          value={`₹${totalDeductions.toLocaleString()}`}
          subValue="PF + LOP Penalties"
          icon={AlertCircle}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Processing Progress"
          value={`${paidCount}/${records.length}`}
          subValue={paidCount === records.length ? 'All Finalized' : 'Pending rows'}
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#0D1F3D]">
            <Calendar className="h-4 w-4 text-[#E20613]" />
            <span>Payroll Period:</span>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none"
          >
            <option>May 2025</option>
            <option>April 2025</option>
            <option>March 2025</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search executive, ID, payslip..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Finalized & Paid</option>
            <option value="Draft">Draft Pending</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-600">
                <th className="px-4 py-3.5">Executive Staff</th>
                <th className="px-4 py-3.5">Payable / Divisor</th>
                <th className="px-4 py-3.5">Basic + HRA</th>
                <th className="px-4 py-3.5">Incentives</th>
                <th className="px-4 py-3.5">Deductions (PF/LOP)</th>
                <th className="px-4 py-3.5">Net Payable</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRecords.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} alt={p.user} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                      <div>
                        <p className="font-extrabold text-[#0D1F3D]">{p.user}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{p.empId} • {p.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-700">{p.payableDays} / {p.salaryDivisorDays} Days</span>
                    <p className="text-[10px] text-slate-400 font-medium">{p.presentDays} Present • {p.absentDays} LOP</p>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-[#0D1F3D]">₹{p.gross.toLocaleString()}</td>
                  <td className="px-4 py-3.5 font-bold text-blue-600">
                    +₹{p.incentives.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-[#E20613] font-bold">
                    -₹{p.totalDeductions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-base font-extrabold text-[#0D1F3D]">
                    ₹{p.netPay.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-extrabold ${
                      p.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenProcessModal(p)}
                      className="!px-2.5 !py-1 text-xs font-bold flex items-center gap-1.5 ml-auto"
                    >
                      {p.status === 'Draft' ? <Edit className="h-3.5 w-3.5 text-[#E20613]" /> : <Eye className="h-3.5 w-3.5 text-slate-500" />}
                      {p.status === 'Draft' ? 'Process / Amend' : 'View Payslip'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRUEROOT MODAL 1: Run Monthly Payroll Modal */}
      <Modal isOpen={runPayrollModalOpen} onClose={() => setRunPayrollModalOpen(false)} maxWidth="max-w-lg">
        <div className="space-y-4 font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Run Monthly Payroll</h3>
            <button onClick={() => setRunPayrollModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Pay Period</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-[#0D1F3D]"
              >
                <option value="May 2025">May 2025</option>
                <option value="April 2025">April 2025</option>
                <option value="March 2025">March 2025</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Payroll Scope</label>
              <div className="grid grid-cols-2 gap-2">
                <label
                  onClick={() => setRunPayrollScope('all')}
                  className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer ${
                    runPayrollScope === 'all' ? 'border-[#0D1F3D] bg-blue-50/40 font-bold text-[#0D1F3D]' : 'border-slate-200'
                  }`}
                >
                  <input type="radio" checked={runPayrollScope === 'all'} onChange={() => {}} className="text-[#0D1F3D]" />
                  <span>All Staff</span>
                </label>
                <label
                  onClick={() => setRunPayrollScope('employee')}
                  className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer ${
                    runPayrollScope === 'employee' ? 'border-[#0D1F3D] bg-blue-50/40 font-bold text-[#0D1F3D]' : 'border-slate-200'
                  }`}
                >
                  <input type="radio" checked={runPayrollScope === 'employee'} onChange={() => {}} className="text-[#0D1F3D]" />
                  <span>Specific Executive</span>
                </label>
              </div>
            </div>

            {/* Executive Selection Slot - Constant Height Container */}
            <div className="space-y-1 min-h-[68px] transition-all">
              <label className="font-bold text-slate-700 block">
                Select Executive Staff {runPayrollScope === 'employee' ? '*' : <span className="text-slate-400 font-normal">(All Active Roster)</span>}
              </label>
              {runPayrollScope === 'employee' ? (
                <select
                  value={selectedEmployeeScope}
                  onChange={(e) => setSelectedEmployeeScope(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-[#0D1F3D] focus:outline-none focus:border-[#0D1F3D] cursor-pointer"
                >
                  <option value="">Select Executive Staff...</option>
                  <option value="Rahul Verma">Rahul Verma (FE-1001)</option>
                  <option value="Priya Mehta">Priya Mehta (FE-1002)</option>
                  <option value="Sanjay Yadav">Sanjay Yadav (FE-1003)</option>
                  <option value="Kavita Singh">Kavita Singh (FE-1004)</option>
                  <option value="Arun Kumar">Arun Kumar (FE-1005)</option>
                </select>
              ) : (
                <div className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 text-xs font-semibold text-slate-400 flex items-center justify-between cursor-not-allowed">
                  <span>Applies to all active executives (5 staff members)</span>
                  <span className="text-[10px] rounded bg-slate-200/80 px-2 py-0.5 font-bold text-slate-500">All Staff</span>
                </div>
              )}
              <p className="text-[10px] text-slate-400 font-medium">
                {runPayrollScope === 'employee' ? 'Targeted payroll run for selected executive only.' : 'Payroll will be calculated for all active employees.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rerunExisting}
                  onChange={(e) => setRerunExisting(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#E20613]"
                />
                <span className="font-bold text-slate-700">Rerun existing payroll for this period</span>
              </label>
              <p className="text-[10px] text-slate-400 ml-6 mt-0.5">Recalculates draft rows. Already finalized paid payslips will be skipped.</p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 flex items-center gap-2 text-blue-900 font-semibold">
              <Info className="h-4 w-4 flex-shrink-0 text-blue-600" />
              <span>Running payroll automatically fetches attendance present days and approved booking incentives.</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setRunPayrollModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              isLoading={isProcessingRun}
              onClick={handleRunPayrollSubmit}
              className="font-bold shadow-xs"
            >
              Run Payroll
            </Button>
          </div>
        </div>
      </Modal>

      {/* TRUEROOT MODAL 2: Process / Amend Draft & Official Payslip PDF Preview Drawer Modal */}
      <Modal isOpen={!!processModalEntry} onClose={() => setProcessModalEntry(null)} maxWidth="max-w-4xl">
        {processModalEntry && (
          <div className="space-y-4 font-sans text-xs">
            {/* Modal Navigation Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0D1F3D]">
                  {processModalMode === 'edit' ? `Process Draft Payslip — ${processModalEntry.user}` : `Payslip PDF Preview — ${processModalEntry.user}`}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{processModalEntry.id} • {selectedMonth}</p>
              </div>

              {/* Mode Switch Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl font-bold">
                <button
                  onClick={() => setProcessModalMode('edit')}
                  className={`px-3 py-1 rounded-lg transition-all ${processModalMode === 'edit' ? 'bg-white text-[#0D1F3D] shadow-xs' : 'text-slate-500'}`}
                >
                  Edit Draft
                </button>
                <button
                  onClick={() => setProcessModalMode('preview')}
                  className={`px-3 py-1 rounded-lg transition-all ${processModalMode === 'preview' ? 'bg-white text-[#0D1F3D] shadow-xs' : 'text-slate-500'}`}
                >
                  PDF Payslip Preview
                </button>
              </div>
            </div>

            {/* MODE 1: EDIT DRAFT FORM */}
            {processModalMode === 'edit' && (
              <div className="space-y-4">
                {/* Executive Info Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                  <div className="flex items-center gap-3">
                    <img src={processModalEntry.avatar} alt={processModalEntry.user} className="h-10 w-10 rounded-full object-cover border border-slate-200" />
                    <div>
                      <p className="text-sm font-extrabold text-[#0D1F3D]">{processModalEntry.user}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{processModalEntry.empId} • {processModalEntry.designation} • {processModalEntry.teamName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold">Payable Days</span>
                    <span className="font-extrabold text-[#0D1F3D]">{processModalEntry.payableDays} / {processModalEntry.salaryDivisorDays} Days</span>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Base Salary + Allowances (₹)</label>
                    <input
                      type="number"
                      value={processCalculatedBaseInput}
                      onChange={(e) => setProcessCalculatedBaseInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-[#0D1F3D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Approved Incentives (₹)</label>
                    <input
                      type="number"
                      value={processIncentiveInput}
                      onChange={(e) => setProcessIncentiveInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">PF Amount Deduction (₹)</label>
                    <input
                      type="number"
                      value={processPfInput}
                      onChange={(e) => setProcessPfInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-[#E20613]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">TDS Tax Deduction (₹)</label>
                    <input
                      type="number"
                      disabled
                      value={processModalEntry.tds}
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 p-2.5 font-bold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Booking Incentive Items Breakdown */}
                {processModalEntry.incentiveItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <h4 className="font-extrabold text-[#0D1F3D]">Included Deal Booking Incentives</h4>
                    <div className="space-y-1.5">
                      {processModalEntry.incentiveItems.map((inc) => (
                        <div key={inc.id} className="flex justify-between items-center bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                          <div>
                            <p className="font-bold text-[#0D1F3D]">{inc.title}</p>
                            <p className="text-[10px] text-slate-500 font-medium">{inc.customerName} • {inc.projectName}</p>
                          </div>
                          <span className="font-extrabold text-blue-700">+₹{inc.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Override Reason */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <label className="font-bold text-slate-700 block">Amendment / Override Reason <span className="text-slate-400 font-normal">(Required if modifying amounts)</span></label>
                  <textarea
                    rows={2}
                    placeholder="Enter reason for modifying incentives or deductions..."
                    value={processOverrideReason}
                    onChange={(e) => setProcessOverrideReason(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-medium text-[#0D1F3D]"
                  />
                </div>

                {/* Net Payable Highlight Banner */}
                <div className="flex items-center justify-between rounded-xl bg-[#0D1F3D] p-4 text-white">
                  <div>
                    <p className="text-[10px] text-slate-300 uppercase font-bold">Calculated Net Payable Amount</p>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Base + Incentives − Deductions</p>
                  </div>
                  <span className="text-2xl font-extrabold text-[#E20613]">
                    ₹{(Number(processCalculatedBaseInput || 0) + Number(processIncentiveInput || 0) - Number(processPfInput || 0) - processModalEntry.tds).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* MODE 2: FULL OFFICIAL PAYSLIP PDF PREVIEW */}
            {processModalMode === 'preview' && (
              <div className="space-y-4">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex flex-wrap items-center justify-between border-b-2 border-[#0D1F3D] pb-4 gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-[#0D1F3D]">Visiblo Field Executive</h2>
                      <p className="text-xs text-slate-500 font-medium">SaaS Field Operations & Sales Management</p>
                    </div>
                    <div className="text-right">
                      <span className="rounded-lg bg-[#0D1F3D] px-3 py-1 text-xs font-extrabold text-white">
                        PAYSLIP — {selectedMonth.toUpperCase()}
                      </span>
                      <p className="text-[11px] text-slate-400 font-mono mt-1">{processModalEntry.id}</p>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Employee Name</span>
                      <span className="font-extrabold text-[#0D1F3D]">{processModalEntry.user}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Employee ID</span>
                      <span className="font-extrabold text-[#0D1F3D]">{processModalEntry.empId}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Designation</span>
                      <span className="font-bold text-slate-700">{processModalEntry.designation}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Team Name</span>
                      <span className="font-bold text-slate-700">{processModalEntry.teamName}</span>
                    </div>
                  </div>

                  {/* Earnings vs Deductions Table */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-emerald-700 border-b border-slate-200 pb-1">Earnings</h4>
                      <div className="space-y-1.5 font-semibold text-slate-700">
                        <div className="flex justify-between"><span>Basic & Allowances</span><span>₹{processModalEntry.gross.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Approved Incentives</span><span>+₹{Number(processIncentiveInput || 0).toLocaleString()}</span></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-extrabold text-[#E20613] border-b border-slate-200 pb-1">Deductions</h4>
                      <div className="space-y-1.5 font-semibold text-slate-700">
                        <div className="flex justify-between"><span>PF Amount</span><span>-₹{Number(processPfInput || 0).toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>TDS / Income Tax</span><span>-₹{processModalEntry.tds.toLocaleString()}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Summary Cards */}
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-extrabold">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-2.5 text-emerald-800">
                      <p className="text-[10px]">Present</p>
                      <p className="text-sm mt-0.5">{processModalEntry.presentDays}</p>
                    </div>
                    <div className="rounded-xl border border-red-100 bg-red-50 p-2.5 text-red-800">
                      <p className="text-[10px]">Absent / LOP</p>
                      <p className="text-sm mt-0.5">{processModalEntry.absentDays}</p>
                    </div>
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-2.5 text-blue-800">
                      <p className="text-[10px]">Holidays</p>
                      <p className="text-sm mt-0.5">{processModalEntry.holidayDays}</p>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50 p-2.5 text-amber-800">
                      <p className="text-[10px]">Leaves</p>
                      <p className="text-sm mt-0.5">{processModalEntry.leaveDays}</p>
                    </div>
                  </div>

                  {/* Net Payable Highlight */}
                  <div className="flex items-center justify-between rounded-xl bg-[#0D1F3D] p-4 text-white">
                    <div>
                      <p className="text-[10px] font-bold text-slate-300 uppercase">Net Payable Amount</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Status: <span className="text-emerald-400 font-bold">{processModalEntry.status}</span></p>
                    </div>
                    <span className="text-2xl font-extrabold text-[#E20613]">
                      ₹{(Number(processCalculatedBaseInput || 0) + Number(processIncentiveInput || 0) - Number(processPfInput || 0) - processModalEntry.tds).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setProcessModalEntry(null)}>
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                {processModalEntry.status === 'Draft' && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleSaveDraft} className="font-bold">
                      Save Draft
                    </Button>
                    <Button variant="accent" size="sm" onClick={handleFinalizePayslip} className="font-bold shadow-xs flex items-center gap-1">
                      <Check className="h-4 w-4" /> Finalize & Disburse
                    </Button>
                  </>
                )}
                {processModalEntry.status === 'Paid' && (
                  <Button variant="accent" size="sm" onClick={() => window.print()} className="font-bold shadow-xs flex items-center gap-1">
                    <Printer className="h-4 w-4" /> Print / Save PDF
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
