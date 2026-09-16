import { DollarSign, Plus, CreditCard } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function LeadPaymentsTab() {
  return (
    <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span>Lead Payment History & Advance Ledger</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Payment collection and ledger reconciliation are outside the current Lead Management backend.
          </p>
        </div>

        <Button variant="accent" size="sm" disabled className="font-bold flex items-center gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" /> Record Payment Received
        </Button>
      </div>

      <div className="rounded-sm border border-emerald-100 bg-emerald-50/40 p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
        <div>
          <span className="text-slate-500 block">Total Advance Collected</span>
          <span className="text-xl font-extrabold text-emerald-700">?0</span>
        </div>
        <div className="text-right">
          <span className="text-slate-500 block">Ledger Status</span>
          <span className="rounded-sm bg-white text-slate-700 px-2.5 py-0.5 font-extrabold text-[11px] border border-slate-200">
            No ledger entries
          </span>
        </div>
      </div>

      <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 shadow-xs">
          <CreditCard className="h-5 w-5 text-slate-500" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-[#0D1F3D]">No payment ledger entries yet</h4>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Real payment receipts and invoices will appear here once the payment ledger module is available.
          </p>
        </div>
      </div>
    </div>
  );
}
