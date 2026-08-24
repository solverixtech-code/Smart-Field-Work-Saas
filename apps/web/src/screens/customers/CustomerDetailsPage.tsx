import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  User as UserIcon,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  RefreshCw,
  Edit,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MOCK_CUSTOMERS } from './customersData';

export default function CustomerDetailsPage() {
  const { customerId } = useParams();
  const navigate = useNavigate();

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
            <span className="text-[#0D1F3D] font-extrabold">{customer.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">{customer.name}</h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                customer.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {customer.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/customers/${customer.id}/subscription`)}
            className="bg-white border-slate-200 text-indigo-700 hover:bg-indigo-50 font-bold flex items-center gap-1.5 text-xs shadow-xs"
          >
            <CreditCard className="h-4 w-4" /> Subscription Details
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate(`/admin/customers/${customer.id}/renewal`)}
            className="bg-[#E20613] hover:bg-red-700 text-white font-extrabold flex items-center gap-1.5 text-xs shadow-md"
          >
            <RefreshCw className="h-4 w-4" /> Renewal Status
          </Button>
        </div>
      </div>

      {/* HEADER SUMMARY CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <img
              src={
                customer.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(customer.name)}&background=0D1F3D&color=fff`
              }
              alt={customer.name}
              className="h-16 w-16 rounded-full object-cover border-2 border-slate-200 shadow-sm"
            />
            <div>
              <h2 className="text-xl font-extrabold text-[#0D1F3D]">{customer.name}</h2>
              <span className="text-xs font-bold text-slate-500 block">{customer.businessName}</span>
              <span className="text-[11px] font-mono text-slate-400 block font-semibold mt-0.5">
                ID: {customer.customerCode}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 font-medium block text-[11px]">Current Plan</span>
              <span className="font-extrabold text-[#0D1F3D] block text-sm">{customer.planName}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 font-medium block text-[11px]">Active MRR</span>
              <span className="font-extrabold text-emerald-700 block text-sm">₹{customer.mrr.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 font-medium block text-[11px]">Total Paid</span>
              <span className="font-extrabold text-indigo-700 block text-sm">₹{customer.totalPaid.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="text-slate-500 font-medium block text-[11px]">Next Renewal</span>
              <span className="font-mono font-extrabold text-[#0D1F3D] block text-sm">{customer.nextRenewalDate}</span>
            </div>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          {/* BUSINESS INFO CARD */}
          <div className="p-5 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="font-extrabold text-[#0D1F3D] text-sm flex items-center gap-2">
              <Building className="h-4 w-4 text-[#E20613]" /> Connected Business Details
            </h3>
            <div className="space-y-2 font-medium text-slate-700">
              <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                <span className="text-slate-500">Business Name:</span>
                <span className="font-extrabold text-[#0D1F3D]">{customer.businessName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                <span className="text-slate-500">Mobile Number:</span>
                <span className="font-mono font-bold text-slate-800">{customer.mobile}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                <span className="text-slate-500">Email Address:</span>
                <span className="font-semibold text-slate-800">{customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GSTIN Tax Ref:</span>
                <span className="font-mono font-bold text-slate-800">{customer.gstin || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* FIELD SALES CONVERSION CARD */}
          <div className="p-5 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3">
            <h3 className="font-extrabold text-[#0D1F3D] text-sm flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-emerald-600" /> Field Sales Conversion Summary
            </h3>
            <div className="space-y-2 font-medium text-slate-700">
              <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                <span className="text-slate-500">Converted By Executive:</span>
                <span className="font-extrabold text-[#0D1F3D]">{customer.convertedByName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                <span className="text-slate-500">Executive Role / Zone:</span>
                <span className="font-semibold text-slate-700">{customer.convertedByRole}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/50 pb-1.5">
                <span className="text-slate-500">Conversion Timestamp:</span>
                <span className="font-semibold text-slate-800">{customer.convertedOn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Method:</span>
                <span className="font-bold text-indigo-700">{customer.paymentMethod}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
