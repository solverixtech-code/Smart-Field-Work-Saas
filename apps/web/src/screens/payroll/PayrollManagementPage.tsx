import React, { useState } from 'react';
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
} from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';

const mockPayslips = [
  {
    id: 'PAY-2025-05-101',
    user: 'Rahul Verma',
    empId: 'FE-1001',
    designation: 'Field Executive',
    base: 30000,
    hra: 12000,
    conveyance: 2000,
    allowances: 3000,
    gross: 47000,
    pf: 3600,
    esi: 0,
    tds: 1500,
    absencePenalty: 1000,
    totalDeductions: 6100,
    netPay: 40900,
    presentDays: 26,
    absentDays: 2,
    lateDays: 2,
    overtimeHours: 6.5,
    status: 'Paid',
    paidDate: '20 May 2025',
    txnRef: 'TXN-98451234',
  },
  {
    id: 'PAY-2025-05-102',
    user: 'Priya Mehta',
    empId: 'FE-1002',
    designation: 'Field Executive',
    base: 32000,
    hra: 12800,
    conveyance: 2000,
    allowances: 3500,
    gross: 50300,
    pf: 3840,
    esi: 0,
    tds: 1800,
    absencePenalty: 0,
    totalDeductions: 5640,
    netPay: 44660,
    presentDays: 28,
    absentDays: 0,
    lateDays: 1,
    overtimeHours: 4.0,
    status: 'Paid',
    paidDate: '20 May 2025',
    txnRef: 'TXN-98451235',
  },
  {
    id: 'PAY-2025-05-103',
    user: 'Sanjay Yadav',
    empId: 'FE-1003',
    designation: 'Team Leader',
    base: 45000,
    hra: 18000,
    conveyance: 2500,
    allowances: 5000,
    gross: 70500,
    pf: 5400,
    esi: 0,
    tds: 3500,
    absencePenalty: 0,
    totalDeductions: 8900,
    netPay: 61600,
    presentDays: 28,
    absentDays: 0,
    lateDays: 0,
    overtimeHours: 12.0,
    status: 'Pending',
    paidDate: '-',
    txnRef: '-',
  },
  {
    id: 'PAY-2025-05-104',
    user: 'Kavita Singh',
    empId: 'FE-1004',
    designation: 'Field Executive',
    base: 28000,
    hra: 11200,
    conveyance: 2000,
    allowances: 2500,
    gross: 43700,
    pf: 3360,
    esi: 0,
    tds: 1000,
    absencePenalty: 2800,
    totalDeductions: 7160,
    netPay: 36540,
    presentDays: 22,
    absentDays: 4,
    lateDays: 3,
    overtimeHours: 0.0,
    status: 'Pending',
    paidDate: '-',
    txnRef: '-',
  },
  {
    id: 'PAY-2025-05-105',
    user: 'Arun Kumar',
    empId: 'FE-1005',
    designation: 'Field Executive',
    base: 35000,
    hra: 14000,
    conveyance: 2000,
    allowances: 4000,
    gross: 55000,
    pf: 4200,
    esi: 0,
    tds: 2000,
    absencePenalty: 0,
    totalDeductions: 6200,
    netPay: 48800,
    presentDays: 27,
    absentDays: 1,
    lateDays: 1,
    overtimeHours: 8.5,
    status: 'Paid',
    paidDate: '20 May 2025',
    txnRef: 'TXN-98451239',
  },
];

export default function PayrollManagementPage() {
  const [payslips, setPayslips] = useState(mockPayslips);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedPayslipModal, setSelectedPayslipModal] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const filteredPayslips = payslips.filter((p) => {
    const matchesSearch =
      p.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleMarkPaid = (id: string) => {
    setPayslips((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'Paid',
              paidDate: new Date().toLocaleDateString('en-GB'),
              txnRef: `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
            }
          : p,
      ),
    );
  };

  const handleRunPayroll = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      alert('Monthly Payroll for May 2025 has been processed and payslips generated!');
    }, 1200);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Payroll & Payslip Management</h1>
          <p className="text-xs font-medium text-slate-500">
            Process monthly salaries, manage allowances & deductions, auto-calculate attendance penalties, and issue payslips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Exporting Payroll Summary...')}
            className="flex items-center gap-2 border-slate-200 text-slate-700 hover:bg-slate-100 font-bold"
          >
            <Download className="h-4 w-4 text-[#0D1F3D]" /> Export Summary
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={handleRunPayroll}
            disabled={processing}
            className="flex items-center gap-2 font-bold shadow-sm"
          >
            <CreditCard className="h-4 w-4" /> {processing ? 'Processing...' : 'Run Monthly Payroll'}
          </Button>
        </div>
      </div>

      {/* 5 Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Gross Payroll (May 2025)"
          value="₹54,60,000"
          change="+12%"
          changeType="positive"
          timeframe="vs last month"
          icon={IndianRupee}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Net Disbursed"
          value="₹48,20,000"
          change="+10%"
          changeType="positive"
          timeframe="vs last month"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Total Deductions"
          value="₹6,40,000"
          subValue="PF + ESI + TDS + Absences"
          icon={IndianRupee}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Payslips Generated"
          value="156 Staff"
          subValue="100% completed"
          icon={FileText}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Pending Payments"
          value="12 Staff"
          subValue="Awaiting approval"
          icon={AlertCircle}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#0D1F3D]">
            <Calendar className="h-4 w-4 text-[#E20613]" />
            <span>Payroll Month:</span>
          </div>
          <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none">
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
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase">
                <th className="px-4 py-3.5">Executive</th>
                <th className="px-4 py-3.5">Gross CTC</th>
                <th className="px-4 py-3.5">Allowances</th>
                <th className="px-4 py-3.5">Deductions</th>
                <th className="px-4 py-3.5">Attendance Summary</th>
                <th className="px-4 py-3.5">Net Salary</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredPayslips.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div>
                      <p className="font-extrabold text-[#0D1F3D]">{p.user}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{p.empId} • {p.designation}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-bold text-[#0D1F3D]">₹{p.gross.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-emerald-600 font-bold">
                    +₹{(p.hra + p.conveyance + p.allowances).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-[#E20613] font-bold">
                    -₹{p.totalDeductions.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-[11px] font-medium space-y-0.5">
                      <p><span className="font-bold text-emerald-600">{p.presentDays} Days Present</span> • <span className="font-bold text-[#E20613]">{p.absentDays} Absent</span></p>
                      <p className="text-slate-400">{p.lateDays} Late • {p.overtimeHours}h OT</p>
                    </div>
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
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayslipModal(p)}
                        className="!px-2.5 !py-1 text-xs font-bold flex items-center gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-[#E20613]" /> View Payslip
                      </Button>

                      {p.status === 'Pending' && (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleMarkPaid(p.id)}
                          className="!px-2.5 !py-1 text-xs font-bold"
                        >
                          Mark Paid
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

      {/* Printable Payslip Statement Modal */}
      {selectedPayslipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-6 text-slate-800 font-sans my-8">
            {/* Payslip Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <img src="/assets/sfw-logo.png" alt="SFW Logo" className="h-10 w-auto object-contain" />
                <div>
                  <h3 className="text-base font-extrabold text-[#0D1F3D]">Smart Field Work (SFW) SaaS</h3>
                  <p className="text-xs text-slate-500 font-medium">Bandra-Kurla Complex, Mumbai, Maharashtra 400051</p>
                </div>
              </div>
              <div className="text-right">
                <span className="rounded-lg bg-[#0D1F3D] px-3 py-1 text-xs font-extrabold text-white">
                  PAYSLIP - MAY 2025
                </span>
                <p className="text-[11px] text-slate-400 font-mono mt-1">{selectedPayslipModal.id}</p>
              </div>
            </div>

            {/* Employee Details Grid */}
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs font-semibold">
              <div>
                <span className="text-slate-400 block font-medium">Employee Name</span>
                <span className="font-extrabold text-[#0D1F3D]">{selectedPayslipModal.user}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Employee ID</span>
                <span className="font-extrabold text-[#0D1F3D]">{selectedPayslipModal.empId}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Designation</span>
                <span className="font-bold text-slate-700">{selectedPayslipModal.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Bank A/C Ref</span>
                <span className="font-mono text-slate-700">HDFC-XXXX-9842</span>
              </div>
            </div>

            {/* Attendance Days Breakdown */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-extrabold">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <p className="text-[10px] text-slate-400">Total Days</p>
                <p className="text-sm text-[#0D1F3D] mt-0.5">30</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-800">
                <p className="text-[10px] text-emerald-600">Present</p>
                <p className="text-sm mt-0.5">{selectedPayslipModal.presentDays}</p>
              </div>
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-red-800">
                <p className="text-[10px] text-red-600">Absent</p>
                <p className="text-sm mt-0.5">{selectedPayslipModal.absentDays}</p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-2.5 text-purple-800">
                <p className="text-[10px] text-purple-600">Overtime</p>
                <p className="text-sm mt-0.5">{selectedPayslipModal.overtimeHours} hrs</p>
              </div>
            </div>

            {/* Salary Breakdown Table */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-emerald-700 border-b border-slate-200 pb-1">Earnings</h4>
                <div className="space-y-1.5 font-semibold text-slate-700">
                  <div className="flex justify-between"><span>Basic Salary</span><span>₹{selectedPayslipModal.base.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>HRA</span><span>₹{selectedPayslipModal.hra.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Conveyance</span><span>₹{selectedPayslipModal.conveyance.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Special Allowance</span><span>₹{selectedPayslipModal.allowances.toLocaleString()}</span></div>
                  <div className="flex justify-between font-extrabold text-[#0D1F3D] pt-1 border-t border-slate-200">
                    <span>Gross Earnings</span><span>₹{selectedPayslipModal.gross.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-[#E20613] border-b border-slate-200 pb-1">Deductions</h4>
                <div className="space-y-1.5 font-semibold text-slate-700">
                  <div className="flex justify-between"><span>Provident Fund (PF)</span><span>₹{selectedPayslipModal.pf.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>TDS / Income Tax</span><span>₹{selectedPayslipModal.tds.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Absence Deductions</span><span>₹{selectedPayslipModal.absencePenalty.toLocaleString()}</span></div>
                  <div className="flex justify-between font-extrabold text-[#E20613] pt-1 border-t border-slate-200">
                    <span>Total Deductions</span><span>₹{selectedPayslipModal.totalDeductions.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay Card */}
            <div className="flex items-center justify-between rounded-xl bg-[#0D1F3D] p-4 text-white">
              <div>
                <p className="text-xs font-bold text-slate-300 uppercase">Net Payable Amount</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Payment Status: <span className="text-emerald-400 font-bold">{selectedPayslipModal.status}</span></p>
              </div>
              <span className="text-2xl font-extrabold text-[#E20613]">
                ₹{selectedPayslipModal.netPay.toLocaleString()}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setSelectedPayslipModal(null)}>
                Close
              </Button>
              <Button variant="accent" size="sm" onClick={() => window.print()} className="flex items-center gap-2 font-bold">
                <Printer className="h-4 w-4" /> Print / Save PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
