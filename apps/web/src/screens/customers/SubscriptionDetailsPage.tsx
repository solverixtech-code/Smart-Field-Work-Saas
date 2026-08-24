import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  User as UserIcon,
  Phone,
  Mail,
  ExternalLink,
  Layers,
  RefreshCw,
  Award
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MOCK_CUSTOMERS } from './customersData';

export default function SubscriptionDetailsPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();

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
            <span className="text-blue-600 font-bold">Field Deal Summary</span>
          </nav>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Field Sales Deal & Contract Terms</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View field rep sales attribution, closed deal contract terms, and renewal schedule for this converted customer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/businesses/bus-001/subscription`)}
            className="bg-white border-blue-200 text-blue-600 hover:bg-blue-50 font-bold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Business SaaS Billing & AI Credits
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate(`/admin/customers/${customer.id}/renewal`)}
            className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Renewal Visit Status
          </Button>
        </div>
      </div>

      {/* HEADER CUSTOMER PROFILE BANNER CARD WITH FIELD SALES ATTRIBUTION */}
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
                Active Converted Deal
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#0D1F3D] mt-0.5">{customer.name}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 font-medium mt-0.5">
              <span className="font-bold text-slate-800">{customer.businessName}</span>
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

        {/* FIELD SALES REP ATTRIBUTION BOX */}
        <div className="flex items-center gap-3 p-3 rounded-sm bg-slate-50 border border-slate-200">
          <img
            src={customer.convertedByAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.convertedByName)}&background=2563EB&color=fff`}
            alt={customer.convertedByName}
            className="h-10 w-10 rounded-full object-cover border border-slate-200 cursor-pointer hover:opacity-80"
            onClick={() => navigate(`/admin/executives/${customer.convertedById || 'exec-001'}`)}
          />
          <div className="text-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-0.5">Converted By Executive</span>
            <span
              onClick={() => navigate(`/admin/executives/${customer.convertedById || 'exec-001'}`)}
              className="font-extrabold text-[#0D1F3D] hover:text-blue-600 cursor-pointer hover:underline block"
            >
              {customer.convertedByName}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Field Visit Conversion</span>
          </div>
        </div>
      </div>

      {/* DEAL TERMS & CONTRACT SUMMARY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        {/* CONTRACT PLAN CARD */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Closed Plan & Package</h3>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
              Contract Terms
            </span>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-sm bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#0D1F3D]">{customer.planName}</h4>
              <p className="text-xs text-slate-500">Field sales package agreement</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Closed Monthly MRR</span>
              <span className="font-mono font-bold text-emerald-700 text-base">
                ₹{customer.mrr.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Total Revenue Paid</span>
              <span className="font-mono font-bold text-slate-900 text-base">
                ₹{customer.totalPaid.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* RENEWAL TIMELINE SUMMARY */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0D1F3D]">Contract Renewal Schedule</h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
              On Track
            </span>
          </div>

          <div className="space-y-2 text-xs font-medium text-slate-700">
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Contract Start Date</span>
              <span className="font-semibold text-slate-800">{customer.convertedOn}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Next Renewal Date</span>
              <span className="font-bold text-blue-600">{customer.nextRenewalDate}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-1.5">
              <span className="text-slate-500">Days Remaining</span>
              <span className="font-bold text-emerald-600">{customer.daysLeft} Days</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-slate-500">Auto Renewal</span>
              <span className="font-bold text-emerald-700">Enabled (Razorpay UPI)</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/customers/${customer.id}/renewal`)}
            className="w-full bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100 text-xs"
          >
            Manage Field Renewal Visit & Reminders
          </Button>
        </div>

        {/* DIRECT MASTER SHORTCUT TO BUSINESS SAAS SUBSCRIPTION */}
        <div className="rounded-sm border border-blue-200 bg-blue-50/50 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 text-blue-900">
            <Award className="h-5 w-5 text-blue-600 shrink-0" />
            <h3 className="text-sm font-bold">Master Business Account Link</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            To view detailed SaaS platform quotas, AI credit usage, tax invoices, and payment method settings for <strong className="text-slate-900">{customer.businessName}</strong>, visit the Business SaaS Subscription page.
          </p>

          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate(`/admin/businesses/bus-001/subscription`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 text-xs shadow-xs"
          >
            <ExternalLink className="h-4 w-4" /> Go To Business SaaS Subscription
          </Button>
        </div>
      </div>
    </div>
  );
}
