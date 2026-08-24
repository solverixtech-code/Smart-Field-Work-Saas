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
  Settings,
  User as UserIcon,
  PauseCircle,
  ChevronDown,
  Mail,
  Phone,
  Check,
  X,
  MessageSquare,
  Bot,
  HardDrive
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MOCK_CUSTOMERS, MOCK_INVOICES } from './customersData';

export default function SubscriptionDetailsPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    'Overview' | 'Billing' | 'Addons' | 'Invoices' | 'Transactions' | 'ChangeHistory' | 'Activity'
  >('Overview');

  const customer = MOCK_CUSTOMERS.find((c) => c.id === customerId) || MOCK_CUSTOMERS[0];

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
            <span className="text-blue-600 font-bold">Subscription Details</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Subscription Details</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View and manage customer subscription information.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Change PlanModal')}
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <Layers className="h-3.5 w-3.5 text-slate-500" /> Change Plan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Pause Subscription')}
            className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <PauseCircle className="h-3.5 w-3.5 text-slate-500" /> Pause Subscription
          </Button>
          <div className="relative inline-block text-left">
            <Button
              variant="accent"
              size="sm"
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 text-xs shadow-xs"
            >
              More Actions <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
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
                Active
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
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Customer Type</span>
            <span className="text-slate-800 block">Business</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">Joined On</span>
            <span className="text-slate-800 block">📅 20 Apr 2025</span>
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

      {/* NAVIGATION TABS (UNDERLINE STYLE MATCHING REFERENCE) */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-semibold">
        {[
          { id: 'Overview', label: 'Subscription Overview' },
          { id: 'Billing', label: 'Billing & Payment' },
          { id: 'Addons', label: 'Usage (Add-ons)' },
          { id: 'Invoices', label: 'Invoices' },
          { id: 'Transactions', label: 'Transactions' },
          { id: 'ChangeHistory', label: 'Change History' },
          { id: 'Activity', label: 'Activity Log' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2.5 transition-colors border-b-2 font-bold ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: SUBSCRIPTION OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-4">
          {/* ROW 1: CURRENT PLAN (3 Cols), SUBSCRIPTION STATUS (4 Cols), USAGE SUMMARY (5 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* CURRENT PLAN CARD */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0D1F3D]">Current Plan</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-sm bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#0D1F3D]">{customer.planName}</h4>
                  <p className="text-xs text-slate-500">Ideal for growing field sales teams</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Price</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    ₹{customer.mrr.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">/ mo</span>
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Billing / Month</span>
                  <span className="font-semibold text-slate-800">Monthly</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Start Date</span>
                  <span className="font-semibold text-slate-800">22 May 2025</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Next Renewal</span>
                  <span className="font-bold text-blue-600 block">22 Jun 2025</span>
                  <span className="text-[10px] text-blue-500 font-medium block">(31 days left)</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 pt-1">
                <CheckCircle2 className="h-4 w-4" /> Auto Renew Enabled
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('View Plan Details')}
                className="w-full bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-xs"
              >
                View Plan Details
              </Button>
            </div>

            {/* SUBSCRIPTION STATUS CARD */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4 flex flex-col justify-between space-y-3">
              <h3 className="text-sm font-bold text-[#0D1F3D]">Subscription Status</h3>
              <div className="space-y-2 text-xs font-medium text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Status</span>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Active
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Status Since</span>
                  <span className="font-semibold text-slate-800">22 May 2025 10:24 AM</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">End Date</span>
                  <span className="font-semibold text-slate-800">22 Jun 2025</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Renewal Type</span>
                  <span className="font-semibold text-slate-800">Auto Renew</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Cancellation Date</span>
                  <span className="text-slate-400">—</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500">Cancelled By</span>
                  <span className="text-slate-400">—</span>
                </div>
                <div className="flex justify-between pt-0.5">
                  <span className="text-slate-500">Pause Status</span>
                  <span className="px-2 py-0.2 rounded-sm bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                    Not Paused
                  </span>
                </div>
              </div>
            </div>

            {/* USAGE SUMMARY CARD */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0D1F3D]">Usage Summary</h3>
                  <span className="text-[10px] text-slate-400 font-medium">Monthly usage under your plan</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert('View Usage')}
                  className="bg-white border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-[11px] h-7 px-2.5"
                >
                  View Usage
                </Button>
              </div>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-blue-600" /> Active Executives
                    </span>
                    <span>
                      18 / 25 <span className="text-slate-400 font-normal text-[10px] ml-1.5">72%</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '72%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-blue-600" /> Businesses
                    </span>
                    <span>
                      142 / 250 <span className="text-slate-400 font-normal text-[10px] ml-1.5">57%</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '57%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <UserIcon className="h-3.5 w-3.5 text-blue-600" /> Leads
                    </span>
                    <span>
                      1,248 / 2,000 <span className="text-slate-400 font-normal text-[10px] ml-1.5">62%</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="h-3.5 w-3.5 text-blue-600" /> Storage Used
                    </span>
                    <span>
                      3.2 GB / 10 GB <span className="text-slate-400 font-normal text-[10px] ml-1.5">32%</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '32%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: PLAN & FEATURE SUMMARY (3 Cols), ADD-ONS (3 Cols), PAYMENT INFO (3 Cols), NEXT RENEWAL (3 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
            {/* PLAN & FEATURE SUMMARY */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 flex flex-col justify-between space-y-3">
              <h3 className="text-sm font-bold text-[#0D1F3D]">Plan & Feature Summary</h3>
              <div className="space-y-1.5 text-xs font-medium text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Active Executives</span>
                  <span className="font-bold text-slate-800">25</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Businesses</span>
                  <span className="font-bold text-slate-800">250</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Monthly Leads</span>
                  <span className="font-bold text-slate-800">2,000</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Mobile App Access</span>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> GPS Tracking</span>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Lead Automation</span>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Reports & Analytics</span>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1.5"><X className="h-3.5 w-3.5 text-slate-300" /> API Access</span>
                  <span>—</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Storage</span>
                  <span className="font-bold text-slate-800">10 GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> Support</span>
                  <span className="font-bold text-slate-800">Priority</span>
                </div>
              </div>
            </div>

            {/* ADD-ONS & EXTRA USAGE CARD */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 flex flex-col justify-between space-y-4">
              <h3 className="text-sm font-bold text-[#0D1F3D]">Add-ons & Extra Usage</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-sm bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <MessageSquare className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">WhatsApp Integration</span>
                      <span className="text-[10px] text-slate-500">2 Numbers</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-xs">₹500 <span className="text-[9px] text-slate-400 font-normal">/ Mo</span></span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-sm bg-blue-500 text-white flex items-center justify-center shrink-0">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">AI Lead Scoring</span>
                      <span className="text-[10px] text-slate-500">1,000 Leads</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-xs">₹999 <span className="text-[9px] text-slate-400 font-normal">/ Mo</span></span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-200/60">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-sm bg-purple-500 text-white flex items-center justify-center shrink-0">
                      <HardDrive className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 block text-xs">Extra Storage</span>
                      <span className="text-[10px] text-slate-500">5 GB</span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 text-xs">₹250 <span className="text-[9px] text-slate-400 font-normal">/ Mo</span></span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="font-bold text-slate-700">Total Add-ons</span>
                <span className="font-mono font-bold text-slate-900 text-sm">₹1,749 <span className="text-[10px] text-slate-400 font-normal">/ Month</span></span>
              </div>
            </div>

            {/* PAYMENT INFORMATION CARD */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 flex flex-col justify-between space-y-4">
              <h3 className="text-sm font-bold text-[#0D1F3D]">Payment Information</h3>
              <div className="space-y-2 text-xs font-medium text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="font-bold text-slate-800">Razorpay (UPI)</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Customer Name</span>
                  <span className="font-bold text-slate-800">Rahul Kumar</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Billing Email</span>
                  <span className="font-semibold text-slate-800">rahul@gmail.com</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Billing Phone</span>
                  <span className="font-mono font-semibold text-slate-800">+91 98765 43210</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GSTIN</span>
                  <span className="font-mono font-bold text-slate-800">27ABCDE1234F1Z5</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('Update Payment Method')}
                className="w-full bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-xs"
              >
                Update Payment Method
              </Button>
            </div>

            {/* NEXT RENEWAL CARD */}
            <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-sm bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block font-semibold">Next Renewal</span>
                  <span className="font-bold text-[#0D1F3D] text-sm block">22 Jun 2025</span>
                  <span className="text-[10px] text-blue-600 font-semibold block">(31 days left)</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-medium text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount</span>
                  <span className="font-mono font-bold text-slate-800">₹2,999</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Add-ons</span>
                  <span className="font-mono font-bold text-slate-800">₹1,749</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-slate-100">
                  <span className="text-slate-500">GST (18%)</span>
                  <span className="font-mono font-bold text-slate-800">₹854.64</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-sm bg-emerald-50/80 border border-emerald-200/80">
                  <span className="font-bold text-emerald-800 text-xs">Total Payable</span>
                  <span className="font-mono font-bold text-emerald-700 text-sm">₹5,602.64</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => alert('View Invoice Preview')}
                className="w-full bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-xs"
              >
                View Invoice Preview
              </Button>
            </div>
          </div>

          {/* ROW 3: BOTTOM AUTO-RENEWAL BANNER */}
          <div className="rounded-sm border border-slate-200 bg-slate-50/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0D1F3D]">Auto Renewal is enabled</h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  Your subscription will be automatically renewed on 22 Jun 2025 using your default payment method.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => alert('Manage Auto Renewal')}
              className="bg-white border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-xs"
            >
              Manage Auto Renewal
            </Button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INVOICES & PAYMENTS */}
      {activeTab === 'Invoices' && (
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#0D1F3D]">Invoice History</h3>
          <div className="overflow-x-auto rounded-sm border border-slate-200">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-[#0D1F3D]">
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
              <tbody className="divide-y divide-slate-100 font-medium">
                {MOCK_INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{inv.invoiceNo}</td>
                    <td className="py-3 px-4 text-slate-700">{inv.invoiceDate}</td>
                    <td className="py-3 px-4 font-bold text-[#0D1F3D]">{inv.planName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0D1F3D]">₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{inv.paymentMethod}</td>
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

      {/* OTHER TABS */}
      {activeTab !== 'Overview' && activeTab !== 'Invoices' && (
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs text-xs font-medium text-slate-600">
          Content for <span className="font-bold text-[#0D1F3D]">{activeTab}</span> tab.
        </div>
      )}
    </div>
  );
}
