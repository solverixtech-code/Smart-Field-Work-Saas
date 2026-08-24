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
  CreditCard,
  ChevronDown,
  User as UserIcon,
  Phone,
  Mail,
  MessageSquare,
  Smartphone,
  Eye
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
      {/* BREADCRUMBS & PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
              Customers & Subscriptions
            </span>
            <span>&gt;</span>
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/admin/customers/field-sales')}>
              Converted Customers
            </span>
            <span>&gt;</span>
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate(`/admin/customers/${customer.id}`)}>
              {customer.name}
            </span>
            <span>&gt;</span>
            <span className="text-blue-600 font-bold">Renewal Status</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Renewal Status</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track renewal schedule, auto-renewal settings, and renewal history for this customer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendReminder}
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Send className="h-3.5 w-3.5 text-slate-500" /> Send Renewal Reminder
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAutoRenew(!autoRenew);
              toast.success(`Auto-renewal ${!autoRenew ? 'enabled' : 'disabled'}!`);
            }}
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" /> Update Auto-Renewal
          </Button>
          <Button
            variant="accent"
            size="sm"
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 text-xs shadow-xs"
          >
            More Actions <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* HEADER CUSTOMER PROFILE BANNER CARD */}
      <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-200 shrink-0">
            {customer.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Active Customer
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0D1F3D] mt-0.5">{customer.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium mt-0.5">
              <span>{customer.businessName}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <Phone className="h-3 w-3 text-slate-400" /> {customer.mobile}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-slate-400" /> {customer.email}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8 text-xs font-semibold border-l border-slate-200 pl-6">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Customer ID</span>
            <span className="font-mono text-slate-800 font-bold block">{customer.customerCode}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Account</span>
            <span className="text-slate-800 block">SFW Mumbai (India)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Current Plan</span>
            <span className="text-slate-800 font-bold block">{customer.planName} (Monthly)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Next Renewal</span>
            <span className="font-bold text-blue-600 block">{customer.nextRenewalDate}</span>
            <span className="text-[10px] text-blue-500 font-medium block">(31 days left)</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/customers/${customer.id}`)}
            className="bg-white border-slate-200 text-blue-600 hover:bg-blue-50 font-bold flex items-center gap-1.5 text-xs shadow-xs ml-2"
          >
            <UserIcon className="h-3.5 w-3.5" /> View Customer Profile
          </Button>
        </div>
      </div>

      {/* RENEWAL KPI CARDS GRID (5 CARDS MATCHING REFERENCE UI) */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-stretch">
        {/* CARD 1: NEXT RENEWAL */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-emerald-600" /> Next Renewal
            </span>
          </div>
          <div>
            <span className="text-base font-bold text-[#0D1F3D] block">{customer.nextRenewalDate}</span>
            <span className="inline-block px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 mt-1">
              31 Days Left
            </span>
          </div>
          <div className="flex justify-between text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">Renewal Amount</span>
            <span className="font-mono font-bold text-slate-900">₹2,999</span>
          </div>
          <div className="p-2 rounded-sm bg-emerald-50/80 border border-emerald-200 text-[10px] text-emerald-800 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block">Auto-renewal is enabled</span>
              <span className="text-slate-600 font-normal">Subscription will be renewed automatically.</span>
            </div>
          </div>
        </div>

        {/* CARD 2: RENEWAL STATUS */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Renewal Status</span>
            <span className="px-2 py-0.2 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
              Upcoming
            </span>
          </div>
          <div className="space-y-1 text-xs font-medium text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Status</span>
              <span className="font-bold text-slate-900">Scheduled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Auto-Renewal</span>
              <span className="px-1.5 rounded-sm bg-emerald-50 text-emerald-700 text-[10px] font-bold">Enabled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Renewal Type</span>
              <span className="font-semibold text-slate-800">Auto</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-semibold text-slate-800">Razorpay (UPI)</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">Last Payment</span>
              <span className="font-semibold text-slate-800">22 May 2025</span>
            </div>
          </div>
        </div>

        {/* CARD 3: BILLING CYCLE */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between space-y-2">
          <span className="text-xs font-bold text-slate-700 block">Billing Cycle</span>
          <div className="space-y-1 text-xs font-medium text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Monthly</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Billing Day</span>
              <span className="font-bold text-slate-900">22nd</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cycle Start</span>
              <span className="font-semibold text-slate-800">22 May 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Cycle End</span>
              <span className="font-semibold text-slate-800">22 Jun 2025</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px]">
              <span className="text-slate-500">Total Billing Days</span>
              <span className="font-bold text-slate-900">31 Days</span>
            </div>
          </div>
        </div>

        {/* CARD 4: PLAN & AMOUNT */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-bold text-slate-700">Plan & Amount</span>
          </div>
          <div className="space-y-1 text-xs font-medium text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Plan Name</span>
              <span className="font-bold text-slate-900">Pro Plan</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Plan Price</span>
              <span className="font-mono font-bold text-slate-800">₹2,999 / month</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Add-ons</span>
              <span className="font-mono font-bold text-slate-800">₹1,749 / month</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-100">
              <span className="font-bold text-blue-800">Total Payable</span>
              <span className="font-mono font-bold text-blue-700">₹4,748 / month</span>
            </div>
          </div>
        </div>

        {/* CARD 5: RENEWAL RISK */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-rose-500" /> Renewal Risk
            </span>
            <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              Low Risk
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Customer is active and payments are up to date.
          </p>
          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-slate-500 text-[11px]">Risk Score</span>
            <span className="px-2 py-0.2 rounded-sm bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
              15 / 100
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            <span>Last Activity</span>
            <span className="font-bold text-slate-700">22 May 2025</span>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:underline text-center block pt-1">
            View Risk Details
          </button>
        </div>
      </div>

      {/* TIMELINE & RENEWAL HISTORY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* RENEWAL TIMELINE (5 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-[#0D1F3D]">Renewal Timeline</h3>
          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs font-medium">
            <div className="flex items-start gap-3 relative z-10">
              <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div className="flex-1 bg-slate-50 p-2.5 rounded-sm border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0D1F3D]">Payment Successful</span>
                  <span className="text-[10px] text-slate-400">22 May 2025 10:24 AM</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">Payment of ₹4,748 received successfully.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 relative z-10">
              <div className="h-7 w-7 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="flex-1 bg-slate-50 p-2.5 rounded-sm border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0D1F3D]">Subscription Activated</span>
                  <span className="text-[10px] text-slate-400">22 May 2025 10:24 AM</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">Pro Plan (Monthly) activated.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 relative z-10">
              <div className="h-7 w-7 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex-1 bg-slate-50 p-2.5 rounded-sm border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0D1F3D]">Next Renewal Scheduled</span>
                  <span className="text-[10px] text-slate-400">22 May 2025 10:25 AM</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">Next renewal scheduled on 22 Jun 2025.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 relative z-10">
              <div className="h-7 w-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1 bg-slate-50 p-2.5 rounded-sm border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0D1F3D]">Renewal Reminder (1)</span>
                  <span className="text-[10px] text-slate-400">15 Jun 2025 10:00 AM</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">First reminder will be sent on 17 Jun 2025.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RENEWAL HISTORY TABLE (7 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-[#0D1F3D]">Renewal History</h3>
          <div className="overflow-x-auto rounded-sm border border-slate-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-[#0D1F3D]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Invoice No.</th>
                  <th className="py-2.5 px-3">Invoice Date</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {MOCK_INVOICES.map((inv, idx) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">{inv.invoiceNo}</td>
                    <td className="py-2.5 px-3 text-slate-700">{inv.invoiceDate}</td>
                    <td className="py-2.5 px-3 font-bold text-[#0D1F3D]">{inv.planName}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-[#0D1F3D]">₹4,748</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">{inv.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-center">
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: RENEWAL REMINDERS TABLE (8 Cols) + AUTO-RENEWAL SETTINGS (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* RENEWAL REMINDERS TABLE */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold text-[#0D1F3D]">Renewal Reminders</h3>
          <div className="overflow-x-auto rounded-sm border border-slate-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-[#0D1F3D]">
                <tr>
                  <th className="py-2.5 px-3">Reminder</th>
                  <th className="py-2.5 px-3">Trigger Date</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Sent On</th>
                  <th className="py-2.5 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-800">Reminder 1 (7 days before)</td>
                  <td className="py-2.5 px-3 text-slate-700">17 Jun 2025</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Mail className="h-3.5 w-3.5" />
                      <Smartphone className="h-3.5 w-3.5" />
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                      Scheduled
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-slate-600">Will be sent 7 days before renewal date</td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-800">Reminder 2 (1 day before)</td>
                  <td className="py-2.5 px-3 text-slate-700">21 Jun 2025</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Mail className="h-3.5 w-3.5" />
                      <Smartphone className="h-3.5 w-3.5" />
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                      Scheduled
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-slate-600">Will be sent 1 day before renewal date</td>
                </tr>

                <tr className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-bold text-slate-800">Renewal Day Notification</td>
                  <td className="py-2.5 px-3 text-slate-700">22 Jun 2025</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <Mail className="h-3.5 w-3.5" />
                      <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                      Scheduled
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">—</td>
                  <td className="py-2.5 px-3 text-slate-600">Will be sent on renewal day after payment</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* AUTO-RENEWAL SETTINGS CARD */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4 flex flex-col justify-between space-y-3">
          <h3 className="text-sm font-bold text-[#0D1F3D]">Auto-Renewal Settings</h3>
          <div className="space-y-2 text-xs font-medium text-slate-700">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Status</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Enabled
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-bold text-slate-800">Razorpay (UPI)</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Failure Action</span>
              <span className="font-semibold text-slate-800">Retry 3 times, then notify</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Retry Attempts</span>
              <span className="font-bold text-slate-800">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Auto-Renewal Since</span>
              <span className="font-semibold text-slate-800">22 Jan 2025</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Update Settings')}
            className="w-full bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-xs"
          >
            Update Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
