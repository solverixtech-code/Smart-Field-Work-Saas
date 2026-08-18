import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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
  Calculator,
  CircleDollarSign,
  TrendingUp,
  TrendingDown,
  User,
  History,
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
  pendingIncentiveItems: IncentiveItem[];
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
  status: 'Paid' | 'Finalized' | 'Draft';
  paidDate: string;
  txnRef: string;
  overrideReason?: string;
}

const mockPayrollRecords: PayrollRecord[] = [
  {
    id: 'PAY-2025-05-101',
    user: 'Rahul Verma',
    empId: 'KM-EMP-98421',
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
      { id: 'inc-1', title: 'Closed Won Deal Commission', amount: 3000, customerName: 'Rohan Sharma', projectName: 'Skyline Towers' },
      { id: 'inc-2', title: 'Target Milestone Bonus', amount: 1500, customerName: 'Vikas Shah', projectName: 'Ocean Heights' },
    ],
    pendingIncentiveItems: [],
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
    empId: 'KM-EMP-98422',
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
      { id: 'inc-3', title: 'High Value Closed Won Bonus', amount: 6000, customerName: 'Sunil Patil', projectName: 'Green Park Villas' },
    ],
    pendingIncentiveItems: [
      { id: 'inc-p1', title: 'Quarterly Sales Qualifier Bonus', amount: 2500, customerName: 'Pending Approval', projectName: 'Green Park Villas' },
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
    empId: 'KM-EMP-98423',
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
    pendingIncentiveItems: [],
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
    status: 'Finalized',
    paidDate: '-',
    txnRef: '-',
  },
  {
    id: 'PAY-2025-05-104',
    user: 'Kavita Singh',
    empId: 'KM-EMP-98424',
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
    pendingIncentiveItems: [
      { id: 'inc-p2', title: 'Site Visit Bonus', amount: 800, customerName: 'Ramesh Sen', projectName: 'Palm Crest' },
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
    empId: 'KM-EMP-98425',
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
    pendingIncentiveItems: [],
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
    if (record.status === 'Finalized' || record.status === 'Paid') {
      setProcessModalMode('preview');
    } else {
      setProcessModalMode('edit');
    }
  };

  const handleRunPayrollSubmit = () => {
    setIsProcessingRun(true);
    setTimeout(() => {
      setIsProcessingRun(false);
      setRunPayrollModalOpen(false);
      toast.success(`Payroll is ready for processing for ${selectedMonth}`);
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
      toast.error('Please provide an override reason for changing amounts.');
      return;
    }

    const updated = {
      ...processModalEntry,
      incentives: newInc,
      pf: newPf,
      netPay: newNet,
      overrideReason: processOverrideReason,
    };

    setRecords((prev) =>
      prev.map((r) => (r.id === processModalEntry.id ? updated : r)),
    );
    setProcessModalEntry(null);
    toast.success(`Draft payslip amendments saved for ${processModalEntry.user}`);
  };

  const handleFinalizePayslip = () => {
    if (!processModalEntry) return;
    const finalizedRecord: PayrollRecord = {
      ...processModalEntry,
      status: 'Finalized',
    };
    setRecords((prev) =>
      prev.map((r) => (r.id === processModalEntry.id ? finalizedRecord : r)),
    );
    setProcessModalEntry(finalizedRecord);
    setProcessModalMode('preview');
    toast.success(`Finalized payslip for ${processModalEntry.user}`);
  };

  const handleMarkPaid = (recordId: string, userName: string) => {
    const updatedRecord = records.find((r) => r.id === recordId);
    setRecords((prev) =>
      prev.map((r) =>
        r.id === recordId
          ? {
              ...r,
              status: 'Paid',
              paidDate: new Date().toLocaleDateString('en-GB'),
              txnRef: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
            }
          : r,
      ),
    );
    if (processModalEntry?.id === recordId) {
      setProcessModalEntry((prev) =>
        prev
          ? {
              ...prev,
              status: 'Paid',
              paidDate: new Date().toLocaleDateString('en-GB'),
              txnRef: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
            }
          : null,
      );
      setProcessModalMode('preview');
    }
    toast.success(`Marked as paid for ${userName}`);
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
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Payroll Management</h1>
          <p className="text-xs font-medium text-slate-500">
            Institutional salary disbursement, incentives, and net payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/payroll/settings')}
            className="flex items-center gap-2 font-bold"
          >
            <Settings className="h-4 w-4 text-slate-500" /> Settings
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting Payroll Summary...')}
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
            <CreditCard className="h-4 w-4" /> Run Payroll
          </Button>
        </div>
      </div>

      {/* 4 Top Stat Cards matching Trueroot */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Net Payout"
          value={`₹${totalPayout.toLocaleString()}`}
          subValue="+2.4% Trend"
          icon={IndianRupee}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Incentives"
          value={`₹${totalIncentives.toLocaleString()}`}
          subValue="+5.1% Growth"
          icon={CircleDollarSign}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Deductions"
          value={`₹${totalDeductions.toLocaleString()}`}
          subValue="Tax & PF"
          icon={TrendingDown}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Progress"
          value={`${paidCount}/${records.length}`}
          subValue={paidCount === records.length ? 'All Processed' : 'Pending rows'}
          icon={RefreshCw}
          iconBgColor="bg-red-50"
          iconTextColor="text-[#E20613]"
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
              placeholder="Search by name, email or ID..."
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
            <option value="Draft">Draft</option>
            <option value="Finalized">Finalized</option>
            <option value="Paid">Paid</option>
          </select>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-bold text-slate-600">
                <th className="px-4 py-3.5">Employee</th>
                <th className="px-4 py-3.5">Position</th>
                <th className="px-4 py-3.5">Base Salary</th>
                <th className="px-4 py-3.5">Attendance</th>
                <th className="px-4 py-3.5">Incentive</th>
                <th className="px-4 py-3.5">Deductions</th>
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
                        <p className="text-[10px] text-slate-400 font-mono">{p.empId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-600">{p.designation}</td>
                  <td className="px-4 py-3.5 font-bold text-[#0D1F3D]">₹{p.gross.toLocaleString()}</td>
                  <td className="px-4 py-3.5">
                    <span className="font-bold text-slate-700">{p.payableDays}d</span>
                    <p className="text-[10px] text-slate-400 font-medium">Payable {p.payableDays}d · Divisor {p.salaryDivisorDays}d</p>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-600">
                    +₹{p.incentives.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-[#E20613] font-bold">
                    -₹{p.totalDeductions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-base font-extrabold text-[#0D1F3D]">
                    ₹{p.netPay.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-extrabold border ${
                      p.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : p.status === 'Finalized'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.status === 'Draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenProcessModal(p)}
                          className="!px-2.5 !py-1 text-xs font-bold flex items-center gap-1.5"
                        >
                          <Send className="h-3.5 w-3.5 text-[#0D1F3D]" /> Process Draft
                        </Button>
                      )}

                      {p.status === 'Finalized' && (
                        <>
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => handleMarkPaid(p.id, p.user)}
                            className="!px-2.5 !py-1 text-xs font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Paid
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenProcessModal(p)}
                            className="!px-2.5 !py-1 text-xs font-bold flex items-center gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5 text-slate-500" /> View Payslip
                          </Button>
                        </>
                      )}

                      {p.status === 'Paid' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenProcessModal(p)}
                          className="!px-2.5 !py-1 text-xs font-bold flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500" /> View Payslip
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRUEROOT MODAL 1: Run Monthly Payroll Modal */}
      <Modal isOpen={runPayrollModalOpen} onClose={() => setRunPayrollModalOpen(false)} maxWidth="max-w-md">
        <div className="space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-extrabold text-[#0D1F3D]">Run Payroll</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Finalize calculations and prepare payslips for the selected period.</p>
            </div>
            <button onClick={() => setRunPayrollModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Month</label>
                <select
                  value={selectedMonth.split(' ')[0]}
                  onChange={(e) => setSelectedMonth(`${e.target.value} ${selectedMonth.split(' ')[1]}`)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-[#0D1F3D]"
                >
                  <option value="May">May</option>
                  <option value="April">April</option>
                  <option value="March">March</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Year</label>
                <select
                  value={selectedMonth.split(' ')[1]}
                  onChange={(e) => setSelectedMonth(`${selectedMonth.split(' ')[0]} ${e.target.value}`)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-[#0D1F3D]"
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Payroll Scope</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRunPayrollScope('all');
                      setSelectedEmployeeScope('');
                    }}
                    className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition-all ${
                      runPayrollScope === 'all' ? 'border-[#0D1F3D] bg-[#0D1F3D] text-white' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    All Employees
                  </button>
                  <button
                    type="button"
                    onClick={() => setRunPayrollScope('employee')}
                    className={`rounded-xl border px-3 py-2 text-xs font-extrabold transition-all ${
                      runPayrollScope === 'employee' ? 'border-[#0D1F3D] bg-[#0D1F3D] text-white' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    Specific Employee
                  </button>
                </div>
              </div>

              {/* Constant Height Reserved Container Slot */}
              <div className="min-h-[64px] flex flex-col justify-center">
                {runPayrollScope === 'employee' ? (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Employee *</label>
                    <select
                      value={selectedEmployeeScope}
                      onChange={(e) => setSelectedEmployeeScope(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-bold text-[#0D1F3D]"
                    >
                      <option value="">Select Employee Staff...</option>
                      <option value="Rahul Verma">Rahul Verma (KM-EMP-98421)</option>
                      <option value="Priya Mehta">Priya Mehta (KM-EMP-98422)</option>
                      <option value="Sanjay Yadav">Sanjay Yadav (KM-EMP-98423)</option>
                      <option value="Kavita Singh">Kavita Singh (KM-EMP-98424)</option>
                      <option value="Arun Kumar">Arun Kumar (KM-EMP-98425)</option>
                    </select>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-2.5 text-xs text-slate-500 font-semibold flex items-center justify-between">
                    <span>Target: All 5 active roster employees</span>
                    <span className="text-[10px] font-bold rounded bg-slate-200 px-2 py-0.5">All Staff</span>
                  </div>
                )}
              </div>

              <label className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] font-semibold text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rerunExisting}
                  onChange={(e) => setRerunExisting(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-amber-300 text-[#E20613]"
                />
                <span>Run again and recalculate existing Draft/Finalized rows. Paid rows are protected and will be skipped.</span>
              </label>
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
              className="font-bold shadow-xs px-6"
            >
              {rerunExisting ? 'Run Payroll Again' : 'Run Payroll'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* TRUEROOT MODAL 2: Process Payroll Entry Modal matching Trueroot DialogContent */}
      <Modal isOpen={!!processModalEntry} onClose={() => setProcessModalEntry(null)} maxWidth="max-w-4xl">
        {processModalEntry && (
          <div className="space-y-3 font-sans text-xs">
            {/* Trueroot Process Header Bar */}
            <div className="flex items-start gap-3 border-b border-slate-100 bg-[#FCF6F6] -mx-6 -mt-6 p-4 rounded-t-2xl">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-white text-[#0D1F3D] shadow-xs">
                <Calculator className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-extrabold text-[#0D1F3D]">Process payroll entry</h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  Amend the draft, preview the payslip, then finalize only when the numbers are correct.
                </p>
              </div>
              <button onClick={() => setProcessModalEntry(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Trueroot Employee Identity Card */}
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
              <img src={processModalEntry.avatar} alt={processModalEntry.user} className="h-9 w-9 rounded-full object-cover border border-slate-200" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-extrabold text-[#0D1F3D]">{processModalEntry.user}</p>
                <p className="text-[10px] font-mono text-slate-400">{processModalEntry.empId} • {processModalEntry.designation}</p>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-bold">Current Status</span>
                <span className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-extrabold border ${
                  processModalEntry.status === 'Paid'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : processModalEntry.status === 'Finalized'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {processModalEntry.status}
                </span>
              </div>
            </div>

            {/* Trueroot 6 Attendance Stat Pills */}
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-6 text-center">
              {[
                { label: 'Present', val: `${processModalEntry.presentDays}d`, cls: 'text-emerald-600' },
                { label: 'Absent', val: `${processModalEntry.absentDays}d`, cls: 'text-[#E20613]' },
                { label: 'Holiday', val: `${processModalEntry.holidayDays}d`, cls: 'text-blue-600' },
                { label: 'Leave', val: `${processModalEntry.leaveDays}d`, cls: 'text-amber-600' },
                { label: 'Payable', val: `${processModalEntry.payableDays}d`, cls: 'text-[#0D1F3D]' },
                { label: 'Divisor', val: `${processModalEntry.salaryDivisorDays}d`, cls: 'text-slate-600' },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-slate-50/80 p-1.5 border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-500">{s.label}</p>
                  <p className={`mt-0.5 text-xs font-extrabold ${s.cls}`}>{s.val}</p>
                </div>
              ))}
            </div>

            {/* Step Switch Bar for Draft Mode */}
            {processModalEntry.status === 'Draft' && (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                {[
                  { id: 'edit', label: '1. Amend draft' },
                  { id: 'preview', label: '2. Preview payslip' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProcessModalMode(item.id as any)}
                    className={`h-7 rounded-lg px-3 text-[11px] font-bold transition-all ${
                      processModalMode === item.id ? 'bg-white text-[#0D1F3D] shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <p className="ml-auto text-[10px] font-medium text-slate-500 px-2">Drafts can be saved without generating the payslip.</p>
              </div>
            )}

            {/* MAIN EDIT / PREVIEW CONTENT SLOT - FIXED CONSTANT HEIGHT */}
            <div className="h-[460px] overflow-y-auto pr-1">
              {processModalMode === 'edit' ? (
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                  {/* Left Side Input & Incentive Cards */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1">
                        <p className="text-[10px] font-semibold text-slate-500">Incentive Amount (₹)</p>
                        <input
                          type="number"
                          value={processIncentiveInput}
                          onChange={(e) => setProcessIncentiveInput(e.target.value)}
                          disabled={processModalEntry.status === 'Paid'}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-blue-600 focus:outline-none"
                        />
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1">
                        <p className="text-[10px] font-semibold text-slate-500">PF Amount (₹)</p>
                        <input
                          type="number"
                          value={processPfInput}
                          onChange={(e) => setProcessPfInput(e.target.value)}
                          disabled={processModalEntry.status === 'Paid'}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-[#E20613] focus:outline-none"
                        />
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1">
                        <p className="text-[10px] font-semibold text-slate-500">Calculated Base (₹)</p>
                        <input
                          type="number"
                          value={processCalculatedBaseInput}
                          onChange={(e) => setProcessCalculatedBaseInput(e.target.value)}
                          disabled={processModalEntry.status === 'Paid'}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-[#0D1F3D] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Included vs Pending Incentives Dual Box */}
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {/* Included in this payslip */}
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-2.5 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-extrabold text-emerald-900 text-xs">Included in this payslip</p>
                            <p className="text-[9px] text-emerald-700 font-medium">Approved closed won incentives.</p>
                          </div>
                          <span className="font-extrabold text-emerald-800 text-[11px]">
                            +₹{processModalEntry.incentiveItems.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {processModalEntry.incentiveItems.length > 0 ? (
                            processModalEntry.incentiveItems.map((item) => (
                              <div key={item.id} className="rounded-lg border border-emerald-100 bg-white p-1.5 flex justify-between items-center text-[11px]">
                                <div>
                                  <p className="font-bold text-[#0D1F3D]">{item.title}</p>
                                  <p className="text-[9px] text-slate-400 font-medium">{item.customerName} • {item.projectName}</p>
                                </div>
                                <span className="font-extrabold text-emerald-700">+₹{item.amount.toLocaleString()}</span>
                              </div>
                            ))
                          ) : (
                            <p className="rounded-lg border border-dashed border-emerald-200 bg-white p-2 text-[10px] text-emerald-700 font-medium">
                              No approved incentives included.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Promised, not paid yet */}
                      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-2.5 space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-extrabold text-amber-900 text-xs">Promised, not paid yet</p>
                            <p className="text-[9px] text-amber-700 font-medium">Pending incentives stay out of payroll.</p>
                          </div>
                          <span className="font-extrabold text-amber-800 text-[11px]">
                            ₹{processModalEntry.pendingIncentiveItems.reduce((a, b) => a + b.amount, 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {processModalEntry.pendingIncentiveItems.length > 0 ? (
                            processModalEntry.pendingIncentiveItems.map((item) => (
                              <div key={item.id} className="rounded-lg border border-amber-100 bg-white p-1.5 flex justify-between items-center text-[11px]">
                                <div>
                                  <p className="font-bold text-[#0D1F3D]">{item.title}</p>
                                  <p className="text-[9px] text-slate-400 font-medium">{item.customerName} • {item.projectName}</p>
                                </div>
                                <span className="font-extrabold text-amber-800">₹{item.amount.toLocaleString()}</span>
                              </div>
                            ))
                          ) : (
                            <p className="rounded-lg border border-dashed border-amber-200 bg-white p-2 text-[10px] text-amber-700 font-medium">
                              No pending promised incentives.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Override Reason */}
                    <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-1">
                      <label className="font-bold text-slate-700 block text-[11px]">Override reason</label>
                      <textarea
                        rows={2}
                        value={processOverrideReason}
                        onChange={(e) => setProcessOverrideReason(e.target.value)}
                        placeholder="Required only if you change incentive, PF, or calculated salary."
                        disabled={processModalEntry.status === 'Paid'}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-[#0D1F3D]"
                      />
                    </div>
                  </div>

                  {/* Right Trueroot Sidebar */}
                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 space-y-0.5">
                      <p className="text-[9px] font-bold text-blue-700 uppercase">Net Payable Amount</p>
                      <p className="text-xl font-extrabold text-[#0D1F3D]">
                        ₹{(Number(processCalculatedBaseInput || 0) + Number(processIncentiveInput || 0) - Number(processPfInput || 0) - processModalEntry.tds).toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2 text-[11px] font-semibold text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Original Net Payable</span>
                        <span className="font-extrabold text-[#0D1F3D]">₹{processModalEntry.netPay.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">PF Amount</span>
                        <span className="font-bold text-[#E20613]">-₹{Number(processPfInput || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Current Status</span>
                        <span className="font-bold text-[#0D1F3D]">{processModalEntry.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Salary Divisor</span>
                        <span className="font-bold text-[#0D1F3D]">{processModalEntry.salaryDivisorDays} Days</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-[11px] text-amber-900 space-y-0.5">
                      <p className="font-extrabold">Next action</p>
                      <p className="text-[10px] font-medium leading-snug">
                        {processModalEntry.status === 'Draft' && 'This will finalize the payslip and lock the amounts. Manual edits will no longer be possible.'}
                        {processModalEntry.status === 'Finalized' && 'This will mark the payroll as paid.'}
                        {processModalEntry.status === 'Paid' && 'This payroll entry is marked as paid.'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* MODE 2: CLEAN SINGLE-BORDER PAYSLIP PDF PREVIEW */
                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs space-y-0 text-xs">
                  {/* Header with Smart Field Work Logo */}
                  <div className="border-b-2 border-[#0D1F3D] bg-white px-5 py-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <img
                          src="/assets/sfw-logo.png"
                          alt="Smart Field Work"
                          className="h-8 w-auto object-contain"
                        />
                        <p className="mt-1 text-[10px] font-semibold text-slate-500">
                          Smart Field Work • Institutional Payroll Statement
                        </p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-[10px] font-bold text-[#0D1F3D] uppercase tracking-wider">
                          {processModalEntry.status === 'Paid' ? 'Official Disbursed Payslip' : processModalEntry.status === 'Finalized' ? 'Finalized Payslip' : 'Draft Preview'}
                        </p>
                        <h3 className="mt-0.5 text-lg font-extrabold tracking-tight text-[#0D1F3D]">
                          Payslip for {selectedMonth}
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400">Ref: {processModalEntry.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 text-xs">
                    {/* Employee Details vs Payroll Details Cards */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Employee Details Table */}
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5">
                          <h4 className="font-extrabold text-[#0D1F3D] text-[11px]">Employee Details</h4>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 text-[11px]">
                          <div className="p-2">
                            <p className="text-[9px] font-semibold text-slate-400">Employee Name</p>
                            <p className="font-extrabold text-[#0D1F3D]">{processModalEntry.user}</p>
                          </div>
                          <div className="p-2">
                            <p className="text-[9px] font-semibold text-slate-400">Employee Code</p>
                            <p className="font-extrabold text-[#0D1F3D]">{processModalEntry.empId}</p>
                          </div>
                          <div className="p-2">
                            <p className="text-[9px] font-semibold text-slate-400">Designation</p>
                            <p className="font-bold text-slate-700">{processModalEntry.designation}</p>
                          </div>
                          <div className="p-2">
                            <p className="text-[9px] font-semibold text-slate-400">Department / Team</p>
                            <p className="font-bold text-slate-700">{processModalEntry.teamName}</p>
                          </div>
                        </div>
                      </div>

                      {/* Payroll Details Table */}
                      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="border-b border-slate-200 bg-slate-50 px-3 py-1.5">
                          <h4 className="font-extrabold text-[#0D1F3D] text-[11px]">Payroll Details</h4>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-y divide-slate-100 text-[11px]">
                          <div className="p-2">
                            <p className="text-[9px] font-semibold text-slate-400">Pay Period</p>
                            <p className="font-extrabold text-[#0D1F3D]">{selectedMonth}</p>
                          </div>
                          <div className="p-2">
                            <p className="text-[9px] font-semibold text-slate-400">Payable Days</p>
                            <p className="font-extrabold text-[#0D1F3D]">{processModalEntry.payableDays} Days</p>
                          </div>
                          <div className="p-2">
                            <p className="text-[9px] font-semibold text-slate-400">Salary Divisor</p>
                            <p className="font-bold text-slate-700">{processModalEntry.salaryDivisorDays} Days</p>
                          </div>
                          <div className="p-2">
                            <p className="text-[9px] font-semibold text-slate-400">Payslip Status</p>
                            <p className="font-bold text-emerald-700">{processModalEntry.status}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Earnings vs Deductions Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white text-[11px]">
                      <div className="grid grid-cols-2 bg-[#0D1F3D] text-white font-extrabold px-3 py-1.5">
                        <div>Earnings</div>
                        <div>Deductions</div>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-200">
                        {/* Earnings Column */}
                        <div className="space-y-0 divide-y divide-slate-100">
                          <div className="flex justify-between p-2">
                            <span className="font-semibold text-slate-700">Basic Salary & Allowances</span>
                            <span className="font-bold text-[#0D1F3D]">₹{Number(processCalculatedBaseInput || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between p-2">
                            <span className="font-semibold text-slate-700">Approved Closed Won Incentives</span>
                            <span className="font-bold text-emerald-600">+₹{Number(processIncentiveInput || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-emerald-50 text-emerald-900 font-extrabold">
                            <span>Total Earnings</span>
                            <span>₹{(Number(processCalculatedBaseInput || 0) + Number(processIncentiveInput || 0)).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Deductions Column */}
                        <div className="space-y-0 divide-y divide-slate-100">
                          <div className="flex justify-between p-2">
                            <span className="font-semibold text-slate-700">PF Amount</span>
                            <span className="font-bold text-[#E20613]">₹{Number(processPfInput || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between p-2">
                            <span className="font-semibold text-slate-700">TDS / Income Tax</span>
                            <span className="font-bold text-[#E20613]">₹{processModalEntry.tds.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-rose-50 text-rose-900 font-extrabold">
                            <span>Total Deductions</span>
                            <span>₹{(Number(processPfInput || 0) + processModalEntry.tds).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Payable Highlight Banner */}
                      <div className="flex items-center justify-between border-t border-blue-200 bg-blue-50/70 p-3">
                        <div>
                          <p className="text-[10px] font-bold text-blue-900 uppercase">NET PAYABLE AMOUNT</p>
                          <p className="text-[10px] font-medium text-blue-700 mt-0.5">Total earnings minus attendance and statutory deductions.</p>
                        </div>
                        <span className="text-2xl font-extrabold text-[#0D1F3D]">
                          ₹{(Number(processCalculatedBaseInput || 0) + Number(processIncentiveInput || 0) - Number(processPfInput || 0) - processModalEntry.tds).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Attendance Summary */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                      <div>
                        <h4 className="font-extrabold text-[#0D1F3D] text-[11px]">Attendance Summary</h4>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center font-extrabold text-[11px]">
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-1.5 text-emerald-800">
                          <p className="text-[9px]">Present</p>
                          <p className="mt-0.5">{processModalEntry.presentDays} Days</p>
                        </div>
                        <div className="rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-800">
                          <p className="text-[9px]">Absent / LOP</p>
                          <p className="mt-0.5">{processModalEntry.absentDays} Days</p>
                        </div>
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-blue-800">
                          <p className="text-[9px]">Holiday</p>
                          <p className="mt-0.5">{processModalEntry.holidayDays} Days</p>
                        </div>
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-1.5 text-amber-800">
                          <p className="text-[9px]">Leave</p>
                          <p className="mt-0.5">{processModalEntry.leaveDays} Days</p>
                        </div>
                      </div>
                    </div>

                    {/* Override Reason Callout */}
                    {processOverrideReason && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900 space-y-0.5">
                        <p className="font-extrabold">Amendment Override Reason</p>
                        <p className="font-medium leading-relaxed">{processOverrideReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setProcessModalEntry(null)}>
                Cancel
              </Button>

              {processModalEntry.status === 'Draft' && (
                <>
                  <Button variant="outline" size="sm" onClick={handleSaveDraft} className="font-bold">
                    Save Draft
                  </Button>
                  <Button variant="accent" size="sm" onClick={handleFinalizePayslip} className="font-bold shadow-xs flex items-center gap-1">
                    <Check className="h-4 w-4" /> Finalize
                  </Button>
                </>
              )}

              {processModalEntry.status === 'Finalized' && (
                <>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => handleMarkPaid(processModalEntry.id, processModalEntry.user)}
                    className="font-bold shadow-xs flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Mark as Paid
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.print()} className="font-bold flex items-center gap-1">
                    <Printer className="h-4 w-4" /> Print PDF
                  </Button>
                </>
              )}

              {processModalEntry.status === 'Paid' && (
                <Button variant="accent" size="sm" onClick={() => window.print()} className="font-bold shadow-xs flex items-center gap-1">
                  <Printer className="h-4 w-4" /> Print PDF
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
