import React from 'react';
import { DollarSign, Plus, CheckCircle2, Download, CreditCard } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { mockLeadPayments } from '../leadsData';

export function LeadPaymentsTab() {
  const totalPaid = mockLeadPayments.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span>Lead Payment History & Advance Ledger</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Track token advances, milestone invoices, UPI/NEFT transaction references, and payment status.
          </p>
        </div>

        <Button variant="accent" size="sm" className="font-bold flex items-center gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" /> Record Payment Received
        </Button>
      </div>

      {/* Summary Box */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        <div>
          <span className="text-slate-500 block">Total Advance Collected</span>
          <span className="text-xl font-extrabold text-emerald-700">₹{totalPaid.toLocaleString()}</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block">Ledger Status</span>
          <span className="rounded-md bg-emerald-100 text-emerald-800 px-2.5 py-0.5 font-extrabold text-[11px]">
            Fully Verified
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs font-semibold">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <th className="p-3">Invoice No</th>
              <th className="p-3">Type</th>
              <th className="p-3">Payment Mode</th>
              <th className="p-3">Txn Reference</th>
              <th className="p-3">Date</th>
              <th className="p-3">Amount (₹)</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
            {mockLeadPayments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-bold text-[#0D1F3D]">{p.invoiceNo}</td>
                <td className="p-3">{p.paymentType}</td>
                <td className="p-3">{p.paymentMode}</td>
                <td className="p-3 font-mono text-slate-500">{p.txnRef}</td>
                <td className="p-3">{p.paymentDate}</td>
                <td className="p-3 font-extrabold text-emerald-600">₹{p.amount.toLocaleString()}</td>
                <td className="p-3">
                  <span className="rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 text-[10px] font-extrabold">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
