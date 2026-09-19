import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'sonner';
import {
  CreditCard,
  Plus,
  RefreshCw,
  CheckCircle2,
  Download,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DataTable, ColumnDef } from '../../components/ui/DataTable';
import { BusinessItem, mockSubscription } from './businessesData';

interface HistoryItem {
  subscriptionId: string;
  planName: string;
  billingCycle: string;
  amountInclTax: number;
  status: 'Active' | 'Cancelled';
  startDate: string;
  endDate: string;
  paymentMethod: string;
}

export default function BusinessSubscriptionPage() {
  const context = useOutletContext<any>();
  const business = context?.business || context || {};
  const [subscription] = useState(mockSubscription);

  const columns: ColumnDef<HistoryItem>[] = [
    {
      header: 'Subscription ID',
      cell: (h) => <span className="font-mono font-bold text-[#0D1F3D]">{h.subscriptionId}</span>,
    },
    {
      header: 'Plan',
      cell: (h) => (
        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200">
          {h.planName}
        </span>
      ),
    },
    {
      header: 'Billing Cycle',
      accessorKey: 'billingCycle',
    },
    {
      header: 'Amount (Incl. Tax)',
      align: 'right',
      cell: (h) => <span className="font-bold text-[#0D1F3D]">₹ {h.amountInclTax.toLocaleString()}</span>,
    },
    {
      header: 'Status',
      align: 'center',
      cell: (h) => (
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold border ${h.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {h.status}
        </span>
      ),
    },
    {
      header: 'Start Date',
      accessorKey: 'startDate',
      className: 'text-slate-500',
    },
    {
      header: 'End Date',
      accessorKey: 'endDate',
      className: 'text-slate-500',
    },
    {
      header: 'Payment Method',
      accessorKey: 'paymentMethod',
      className: 'font-mono text-[11px] text-slate-600',
    },
    {
      header: 'Actions',
      align: 'right',
      cell: (h) => (
        <button onClick={() => toast.info(`Viewing details for ${h.subscriptionId}`)} className="p-1 text-slate-500 hover:text-[#0D1F3D]">
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans">
      {/* Sub Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0D1F3D] flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-purple-600" /> Business Subscription
          </h2>
          <p className="text-xs text-slate-500">View and manage subscription details, SaaS billing, and AI credits for this business.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Opening Plan Change modal...')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" /> Change Plan
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.info('Opening Add Subscription modal...')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white"
          >
            <Plus className="h-4 w-4" /> Add Subscription
          </Button>
        </div>
      </div>

      {/* Subscription Banner Summary */}
      <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5 text-xs font-semibold text-slate-600">
          <div>
            <span className="text-slate-400 text-[11px] block">Customer Since</span>
            <span className="text-[#0D1F3D] font-bold">May 15, 2024</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Total Subscriptions</span>
            <span className="text-[#0D1F3D] font-extrabold text-sm">2</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Active Subscriptions</span>
            <span className="text-emerald-700 font-extrabold text-sm">1</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Cancelled Subscriptions</span>
            <span className="text-red-700 font-extrabold text-sm">1</span>
          </div>
          <div>
            <span className="text-slate-400 text-[11px] block">Status</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active Plan
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Plan Details & Usage (Left 8 Cols) + Sidebar Billing Info (Right 4 Cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left Column (8 Cols) */}
        <div className="space-y-4 lg:col-span-8">
          {/* Current Subscription Card */}
          <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#0D1F3D] border-b border-slate-100 pb-2">Current Subscription</h3>

            <div className="flex flex-wrap items-start gap-4">
              <div className="rounded-md bg-purple-50 p-4 border border-purple-100 flex-1 min-w-[200px] space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-purple-900">{subscription.planName}</h4>
                  <span className="rounded-md bg-purple-200/60 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                    {subscription.planBadge}
                  </span>
                </div>
                <p className="text-xs text-purple-700 font-medium">Ideal for growing businesses to boost visibility and manage customer engagement.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600 flex-1 min-w-[240px]">
                <div>
                  <span className="text-slate-400 text-[11px] block">Subscription ID</span>
                  <span className="font-mono text-[#0D1F3D] font-bold">{subscription.subscriptionId}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Status</span>
                  <span className="text-emerald-600 font-bold">Active</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Billing Cycle</span>
                  <span className="text-[#0D1F3D] font-bold">{subscription.billingCycle}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Start Date</span>
                  <span className="text-[#0D1F3D] font-bold">{subscription.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Next Billing Date</span>
                  <span className="text-emerald-700 font-bold">{subscription.nextBillingDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Amount (Incl. Tax)</span>
                  <span className="text-[#0D1F3D] font-extrabold">₹ {subscription.amountInclTax.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Auto Renewal Alert */}
            <div className="rounded-md bg-blue-50/70 border border-blue-100 p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
              <div className="flex items-center gap-2 text-blue-900">
                <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                <span>Auto-renewal is enabled. Next renewal on {subscription.nextBillingDate}. You will be charged ₹ {subscription.amountInclTax.toLocaleString()} (incl. tax).</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info('Managing auto renewal...')} className="text-xs font-bold bg-white text-blue-800 border-blue-200 h-7">
                Manage Auto-renewal
              </Button>
            </div>
          </div>

          {/* Included Features & Usage Overview */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#0D1F3D]">Included Features ({subscription.planName})</h4>
              <div className="space-y-2 text-xs font-semibold text-slate-700">
                {subscription.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-[#0D1F3D]">Usage Overview</h4>
              <div className="space-y-3 text-xs font-semibold">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>AI Post Credits</span>
                    <span className="font-bold text-[#0D1F3D]">{subscription.usage.aiPostCredits.used} / {subscription.usage.aiPostCredits.total} (32%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '32%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Review Replies</span>
                    <span className="font-bold text-[#0D1F3D]">{subscription.usage.reviewReplies.used} / {subscription.usage.reviewReplies.total} (23%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '23%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-700">
                    <span>Team Members</span>
                    <span className="font-bold text-[#0D1F3D]">{subscription.usage.teamMembers.used} / {subscription.usage.teamMembers.total} (40%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription History DataTable */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Subscription History</h3>
            <DataTable
              columns={columns}
              data={subscription.history as HistoryItem[]}
              keyExtractor={(h) => h.subscriptionId}
              density="relaxed"
            />
          </div>
        </div>

        {/* Right Column (4 Cols) Sidebar */}
        <div className="space-y-4 lg:col-span-4">
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Subscription Status</h3>
            <div className="rounded-md bg-emerald-50 p-3 border border-emerald-100 flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-extrabold text-sm">Active</p>
                <p className="text-[11px] text-emerald-700">Your subscription is active and in good standing.</p>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Next Billing</h3>
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <span className="text-slate-500">Next Billing Date</span>
              <span className="font-bold text-[#0D1F3D]">{subscription.nextBillingDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Amount (Incl. Tax)</span>
              <span className="font-extrabold text-[#0D1F3D]">₹ {subscription.amountInclTax.toLocaleString()}</span>
            </div>
            <Button variant="outline" size="sm" fullWidth onClick={() => toast.info('Viewing Invoices...')} className="text-xs font-bold border-slate-200">
              View Invoices
            </Button>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Payment Summary</h3>
            <div className="space-y-1.5 border-b border-slate-100 pb-2 text-slate-600">
              <div className="flex justify-between"><span>Subtotal (Excl. Tax)</span><span>₹ {subscription.amountExclTax.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>CGST (9%)</span><span>₹ 990</span></div>
              <div className="flex justify-between"><span>SGST (9%)</span><span>₹ 990</span></div>
            </div>
            <div className="flex justify-between font-extrabold text-[#0D1F3D] text-sm">
              <span>Total (Incl. Tax)</span>
              <span>₹ {subscription.amountInclTax.toLocaleString()}</span>
            </div>
            <Button variant="outline" size="sm" fullWidth onClick={() => toast.success('Downloading invoice PDF...')} className="text-xs font-bold border-slate-200 flex items-center justify-center gap-1.5">
              <Download className="h-4 w-4" /> Download Invoice
            </Button>
          </div>

          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2 text-xs font-semibold">
            <h3 className="text-xs font-bold text-[#0D1F3D]">Quick Actions</h3>
            <button onClick={() => toast.info('Opening Change Plan dialog...')} className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2 text-left font-bold text-[#0D1F3D] hover:bg-slate-100">
              <span>Change Plan</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <button onClick={() => toast.info('Opening Payment History...')} className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2 text-left font-bold text-[#0D1F3D] hover:bg-slate-100">
              <span>Payment History</span>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <button onClick={() => toast.error('Initiating Cancellation request...')} className="w-full flex items-center justify-between rounded-md border border-red-100 bg-red-50/50 p-2 text-left font-bold text-red-600 hover:bg-red-100/50">
              <span>Cancel Subscription</span>
              <ChevronRight className="h-3.5 w-3.5 text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
