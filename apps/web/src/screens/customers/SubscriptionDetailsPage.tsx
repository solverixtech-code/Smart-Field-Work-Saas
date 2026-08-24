import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  FileText,
  Clock,
  Download,
  AlertCircle,
  ExternalLink,
  Layers,
  Settings
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MOCK_CUSTOMERS, MOCK_INVOICES } from './customersData';

export default function SubscriptionDetailsPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Invoices' | 'Activity'>('Overview');

  const customer = MOCK_CUSTOMERS.find((c) => c.id === customerId) || MOCK_CUSTOMERS[0];

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800 text-left">
      {/* BREADCRUMBS & TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
            <span>&gt;</span>
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate('/admin/customers/field-sales')}>Converted Customers</span>
            <span>&gt;</span>
            <span className="hover:text-slate-800 cursor-pointer" onClick={() => navigate(`/admin/customers/${customer.id}`)}>{customer.name}</span>
            <span>&gt;</span>
            <span className="text-[#0D1F3D] font-extrabold">Subscription Details</span>
          </nav>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Subscription Details</h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            View and manage customer subscription information.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/customers/${customer.id}/renewal`)}
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1.5 text-xs shadow-xs"
          >
            Manage Auto-Renewal
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => alert('Change Plan Modal triggered')}
            className="bg-[#E20613] hover:bg-red-700 text-white font-extrabold flex items-center gap-1.5 text-xs shadow-md"
          >
            Change Plan
          </Button>
        </div>
      </div>

      {/* HEADER CUSTOMER BANNER CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                {customer.status}
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-500 block">{customer.businessName} • {customer.mobile}</span>
            <span className="text-[11px] font-mono text-slate-400 block font-semibold">
              ID: {customer.customerCode}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/customers/${customer.id}`)}
            className="bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-xs"
          >
            View Customer Profile
          </Button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-extrabold">
        {['Overview', 'Invoices', 'Activity'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-[#0D1F3D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'Overview' && 'Subscription Overview'}
            {tab === 'Invoices' && 'Invoices & Payments'}
            {tab === 'Activity' && 'Activity Log'}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* GRID ROW 1: CURRENT PLAN, STATUS, & USAGE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CARD 1: CURRENT PLAN */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0D1F3D] uppercase tracking-wider">Current Plan</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold">
                  Active
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-[#0D1F3D]">{customer.planName}</h3>
                <p className="text-xs font-medium text-slate-500">Ideal for growing field sales teams</p>
              </div>
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Price</span>
                  <span className="font-mono font-extrabold text-[#0D1F3D] text-sm">₹{customer.mrr.toLocaleString('en-IN')} / mo</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Next Renewal</span>
                  <span className="font-mono font-bold text-slate-800">{customer.nextRenewalDate}</span>
                </div>
              </div>
            </div>

            {/* CARD 2: SUBSCRIPTION STATUS */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <span className="text-xs font-extrabold text-[#0D1F3D] uppercase tracking-wider block">Subscription Status</span>
              <div className="space-y-2.5 text-xs font-medium text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-extrabold text-emerald-600">Active</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Renewal Type:</span>
                  <span className="font-bold text-slate-800">Auto Renew ({customer.paymentMethod})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Auto Renewal Enabled:</span>
                  <span className="font-bold text-emerald-600">Yes</span>
                </div>
              </div>
            </div>

            {/* CARD 3: USAGE SUMMARY */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <span className="text-xs font-extrabold text-[#0D1F3D] uppercase tracking-wider block">Usage Summary</span>
              <div className="space-y-3 text-xs font-medium text-slate-700">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Active Executives</span>
                    <span>18 / 25</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Monthly Leads Ingestion</span>
                    <span>1,248 / 2,000</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GRID ROW 2: PLAN FEATURES & PAYMENT INFO */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PLAN FEATURES */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Plan Feature Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Max 25 Field Executives</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>2,000 Monthly Leads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Mobile App Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>GPS Tracking & Routes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Lead Automation & Meta Ads</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp Business API</span>
                </div>
              </div>
            </div>

            {/* PAYMENT INFORMATION */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Payment Information</h3>
              <div className="space-y-2 text-xs font-medium text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-extrabold text-[#0D1F3D]">{customer.paymentMethod}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Billing Contact:</span>
                  <span className="font-semibold text-slate-800">{customer.name} ({customer.email})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GSTIN Tax Ref:</span>
                  <span className="font-mono font-bold text-slate-800">{customer.gstin || '27ABCDE1234F1Z5'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INVOICES */}
      {activeTab === 'Invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Invoice History</h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 font-extrabold text-[#0D1F3D]">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Invoice Date</th>
                  <th className="py-3 px-4">Plan Name</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{inv.invoiceDate}</td>
                    <td className="py-3 px-4 font-extrabold text-[#0D1F3D]">{inv.planName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0D1F3D]">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{inv.paymentMethod}</td>
                    <td className="py-3 px-4 text-center">
                      <Button variant="outline" size="sm" onClick={() => alert(`Downloading ${inv.invoiceNo}`)} className="bg-white text-xs border-slate-200 font-bold">
                        <Download className="h-3.5 w-3.5" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ACTIVITY */}
      {activeTab === 'Activity' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs font-medium text-slate-700">
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Subscription Audit Activity Log</h3>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0D1F3D] block">Subscription Auto-Renewed Successfully</span>
                <span className="text-[11px] text-slate-500">Payment of ₹2,999 processed via Razorpay (UPI)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">22 May 2025 10:24 AM</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#0D1F3D] block">Lead Limit Upgraded</span>
                <span className="text-[11px] text-slate-500">Increased monthly lead ingestion limit to 2,000</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500">22 Apr 2025 09:15 AM</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
