import React from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Target,
  DollarSign,
  Flame,
  Calendar,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { LeadItem } from '../leadsData';

interface TabProps {
  lead: LeadItem;
}

export function LeadOverviewTab({ lead }: TabProps) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
      {/* Left 8 Cols: Primary Information Cards */}
      <div className="space-y-3 lg:col-span-8">
        {/* Company & Contact Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span>Company & Primary Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Company Name</span>
              <p className="text-sm font-extrabold text-[#0D1F3D]">{lead.companyName}</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Contact Person</span>
              <p className="text-sm font-bold text-slate-900">{lead.contactPerson} ({lead.designation})</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Official Email</span>
              <p className="font-bold text-blue-600 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5" /> {lead.email}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Phone Number</span>
              <p className="font-bold text-[#0D1F3D] flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-[#E20613]" /> {lead.phone}
              </p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Industry Sector</span>
              <p className="font-bold text-slate-800">{lead.industry}</p>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Lead Source</span>
              <p className="font-bold text-slate-800">{lead.leadSource}</p>
            </div>
          </div>
        </div>

        {/* Requirements & Pain Points Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" />
            <span>Requirement Notes & Scope</span>
          </h3>
          <div className="rounded-xl bg-slate-50/70 p-4 border border-slate-100 font-semibold text-slate-700 leading-relaxed">
            {lead.requirementNotes}
          </div>
        </div>
      </div>

      {/* Right 4 Cols: Executive Assignment & Territory Card */}
      <div className="space-y-3 lg:col-span-4">
        {/* Executive Assignment Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" />
            <span>Assigned Sales Representative</span>
          </h3>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <img
              src={lead.assignedExecutiveAvatar}
              alt={lead.assignedExecutive}
              className="h-10 w-10 rounded-full object-cover border-2 border-white ring-1 ring-slate-200"
            />
            <div>
              <p className="font-extrabold text-[#0D1F3D] text-sm">{lead.assignedExecutive}</p>
              <p className="text-[11px] font-semibold text-[#E20613]">{lead.assignedExecutiveCode} • Field Executive</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 font-semibold text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Team Leader:</span>
              <span className="font-bold text-[#0D1F3D]">{lead.assignedLeader}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Territory:</span>
              <span className="font-bold text-slate-800">{lead.territory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Region:</span>
              <span className="font-bold text-slate-800">{lead.region}</span>
            </div>
          </div>
        </div>

        {/* Lead Score Breakdown */}
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-blue-900">Lead Health Score</span>
            <span className="rounded-full bg-[#0D1F3D] text-white px-2.5 py-0.5 font-extrabold text-xs">
              {lead.score} / 100
            </span>
          </div>
          <div className="h-2.5 w-full bg-blue-200/60 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${lead.score}%` }} />
          </div>
          <p className="text-slate-600 font-medium leading-relaxed">
            High qualification score. Client has active budget approval and target decision deadline.
          </p>
        </div>
      </div>
    </div>
  );
}
