import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RefreshCw,
  Calendar,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Clock,
  Send,
  ShieldCheck,
  Bell,
  Check,
  CreditCard
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MOCK_CUSTOMERS, MOCK_INVOICES, MOCK_RENEWAL_REMINDERS } from './customersData';
import { toast } from 'sonner';

export default function RenewalStatusPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [autoRenew, setAutoRenew] = useState(true);

  const customer = MOCK_CUSTOMERS.find((c) => c.id === customerId) || MOCK_CUSTOMERS[0];

  const handleSendReminder = () => {
    toast.success(`Renewal reminder sent to ${customer.name} via WhatsApp & Email!`);
  };

  return (
    <div className="space-y-4 font-sans text-slate-800 text-left pb-12">
      {/* BREADCRUMBS & TOP BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
            <span>&gt;</span>
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/admin/customers/field-sales')}>Converted Customers</span>
            <span>&gt;</span>
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate(`/admin/customers/${customer.id}`)}>{customer.name}</span>
            <span>&gt;</span>
            <span className="text-[#0D1F3D] font-extrabold">Renewal Status</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Renewal Status & Schedule</h1>
          <p className="text-xs font-normal text-slate-600 mt-0.5">
            Track renewal schedule, auto-renewal settings, and renewal history for this customer.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendReminder}
            className="bg-white border-slate-200 text-indigo-700 hover:bg-indigo-50 font-semibold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Send className="h-3.5 w-3.5" /> Send Renewal Reminder
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              setAutoRenew(!autoRenew);
              toast.success(`Auto-renewal ${!autoRenew ? 'enabled' : 'disabled'}!`);
            }}
            className="bg-[#E20613] hover:bg-red-700 text-white font-semibold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Update Auto-Renewal
          </Button>
        </div>
      </div>

      {/* HEADER CUSTOMER PROFILE SUMMARY */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={
              customer.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=0D1F3D&color=fff`
            }
            alt={customer.name}
            className="h-14 w-14 rounded-full object-cover border-2 border-slate-200 shadow-sm"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#0D1F3D]">{customer.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                Active Customer
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 block">{customer.businessName} • {customer.mobile}</span>
            <span className="text-[11px] font-mono text-slate-400 block font-semibold">
              ID: {customer.customerCode}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-slate-500 block text-[11px]">Current Plan</span>
            <span className="font-extrabold text-[#0D1F3D] block text-sm">{customer.planName}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-slate-500 block text-[11px]">Next Renewal</span>
            <span className="font-mono font-extrabold text-[#0D1F3D] block text-sm">{customer.nextRenewalDate}</span>
            <span className="text-[10px] font-bold text-emerald-600 block">({customer.daysLeft} days left)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-slate-500 block text-[11px]">Renewal Amount</span>
            <span className="font-mono font-extrabold text-emerald-700 block text-sm">₹{customer.mrr.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* RENEWAL KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* CARD 1 */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Next Renewal Date</span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-mono font-bold text-[#0D1F3D]">{customer.nextRenewalDate}</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              31 Days Left
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 block">Renewal Amount: ₹{customer.mrr.toLocaleString('en-IN')}</span>
        </div>

        {/* CARD 2 */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Renewal Status</span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-emerald-600">Scheduled</span>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              Upcoming
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 block">Payment Method: Razorpay (UPI)</span>
        </div>

        {/* CARD 3 */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Billing Cycle</span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-[#0D1F3D]">Monthly</span>
            <span className="text-xs font-bold text-slate-600">31 Days</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 block">Cycle Start: 22 May 2025</span>
        </div>

        {/* CARD 4 */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Renewal Risk Assessment</span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-bold text-emerald-600">Low Risk</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Score: 15 / 100
            </span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 block">Customer active & payments up to date</span>
        </div>
      </div>

      {/* TIMELINE & RENEWAL HISTORY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* RENEWAL TIMELINE */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Renewal Timeline</h3>
          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs font-medium">
            <div className="flex items-start gap-4 relative z-10">
              <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0D1F3D]">Payment Successful</span>
                  <span className="text-[10px] font-mono text-slate-500">22 May 2025 10:24 AM</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">Payment of ₹{customer.mrr.toLocaleString('en-IN')} received successfully.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="h-7 w-7 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0D1F3D]">Next Renewal Scheduled</span>
                  <span className="text-[10px] font-mono text-slate-500">22 May 2025 10:25 AM</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">Next renewal scheduled on {customer.nextRenewalDate}.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 relative z-10">
              <div className="h-7 w-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0D1F3D]">Renewal Reminder (1) Scheduled</span>
                  <span className="text-[10px] font-mono text-slate-500">15 Jun 2025 10:00 AM</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">First reminder will be sent 7 days before renewal date.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RENEWAL HISTORY TABLE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Renewal & Invoice History</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-[#0D1F3D]">
                <tr>
                  <th className="py-3 px-3">Invoice No</th>
                  <th className="py-3 px-3">Invoice Date</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600">{inv.invoiceNo}</td>
                    <td className="py-3 px-3 text-slate-700">{inv.invoiceDate}</td>
                    <td className="py-3 px-3 font-extrabold text-[#0D1F3D]">{inv.planName}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#0D1F3D]">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RENEWAL REMINDERS & AUTO-RENEWAL SETTINGS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* REMINDERS SCHEDULE */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Automated Renewal Reminders Schedule</h3>
          <div className="space-y-3 text-xs font-medium text-slate-700">
            {MOCK_RENEWAL_REMINDERS.map((rem) => (
              <div key={rem.id} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between">
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block">{rem.name}</span>
                  <span className="text-[11px] text-slate-500 block">{rem.remarks}</span>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[10px] border border-blue-200 block mb-1">
                    {rem.status}
                  </span>
                  <span className="text-[10px] font-mono text-slate-600 block">{rem.triggerDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AUTO-RENEWAL SETTINGS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Auto-Renewal Settings</h3>
          <div className="space-y-3 text-xs font-medium text-slate-700">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Auto-Renew Status:</span>
              <span className="font-extrabold text-emerald-600">Enabled</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-extrabold text-[#0D1F3D]">{customer.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Retry Attempts on Failure:</span>
              <span className="font-bold text-slate-800">3 Retries (Every 24 Hours)</span>
            </div>
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info('Auto-renewal settings updated')}
                className="w-full bg-white border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
              >
                Update Auto-Renewal Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
