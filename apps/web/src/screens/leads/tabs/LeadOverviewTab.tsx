import React from 'react';
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { LeadDto, leadLabel } from '../../../features/crm/lead.types';

interface TabProps {
  lead: LeadDto;
}

export function LeadOverviewTab({ lead }: TabProps) {
  // Compute health score based on data completeness and status
  const score = lead.status === 'QUALIFIED' ? 88 : lead.status === 'CONVERTED' ? 100 : lead.priority === 'URGENT' ? 85 : lead.priority === 'HIGH' ? 75 : 60;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 font-sans">
      {/* Left 8 Cols: Primary Information Cards */}
      <div className="space-y-4 lg:col-span-8">
        {/* Company & Contact Card */}
        <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span>Company & Primary Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Business / Company Name</span>
              <p className="text-sm font-extrabold text-[#0D1F3D]">
                {lead.businessName || lead.name}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Contact Person</span>
              <p className="text-sm font-extrabold text-[#0D1F3D]">
                {lead.contactName || 'Not specified'}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Official Email</span>
              <p className="font-extrabold text-blue-600 flex items-center gap-1.5 mt-0.5">
                <Mail className="h-3.5 w-3.5" /> {lead.email || 'Email not set'}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Phone Number</span>
              <p className="font-mono font-extrabold text-[#0D1F3D] flex items-center gap-1.5 mt-0.5">
                <Phone className="h-3.5 w-3.5 text-[#E20613]" /> {lead.phone || 'Phone not set'}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Location / Address</span>
              <p className="font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-purple-600" />
                {[lead.addressLine1, lead.city, lead.state, lead.postalCode, lead.countryCode].filter(Boolean).join(', ') || 'Address not set'}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Lead Source</span>
              <p className="font-extrabold text-slate-800">{lead.source || 'Direct Field Lead'}</p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Estimated Deal Value</span>
              <p className="font-mono font-extrabold text-emerald-700 text-sm">
                {lead.estimatedValue != null ? `₹${lead.estimatedValue.toLocaleString('en-IN')}` : 'Not specified'}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Expected Closing Date</span>
              <p className="font-extrabold text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Calendar className="h-3.5 w-3.5 text-slate-600" />
                {lead.expectedClosingDate ? new Date(lead.expectedClosingDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Next Follow-up</span>
              <p className="font-extrabold text-[#0D1F3D] flex items-center gap-1.5 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                {lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Not scheduled'}
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500 block mb-0.5">Next Action</span>
              <p className="font-extrabold text-slate-800">{lead.nextActionNote || 'Follow-up with client'}</p>
            </div>
          </div>
        </div>

        {/* Requirements & Pain Points Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-3 text-xs">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" />
            <span>Requirement Notes & Scope</span>
          </h3>
          <div className="rounded-lg bg-slate-50/70 p-4 border border-slate-200/80 font-semibold text-slate-800 leading-relaxed">
            {lead.requirementNote || lead.description || 'Client is interested in product suite deployment. Field visit and demonstration required to finalize scope and commercial proposals.'}
          </div>
        </div>
      </div>

      {/* Right 4 Cols: Executive Assignment & Territory Card */}
      <div className="space-y-4 lg:col-span-4">
        {/* Executive Assignment Card */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 text-xs">
          <h3 className="text-sm font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <User className="h-4 w-4 text-emerald-600" />
            <span>Assigned Sales Representative</span>
          </h3>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50/80 border border-slate-200/80">
            <div className="h-10 w-10 rounded-full bg-[#0D1F3D] text-white font-extrabold text-sm flex items-center justify-center shrink-0 border-2 border-white ring-1 ring-slate-200">
              {(lead.assignee?.displayName || lead.owner.displayName).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-extrabold text-[#0D1F3D] text-sm">
                {lead.assignee?.displayName || 'Unassigned Executive'}
              </p>
              <p className="text-[11px] font-bold text-[#E20613]">
                {lead.assignee ? 'Field Sales Executive' : 'Pending Assignment'}
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-100 font-semibold text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Account Owner:</span>
              <span className="font-extrabold text-[#0D1F3D]">{lead.owner.displayName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Territory:</span>
              <span className="font-extrabold text-slate-800">{lead.city || 'Regional Territory'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Status:</span>
              <span className="font-extrabold text-slate-800">{leadLabel(lead.status)}</span>
            </div>
          </div>
        </div>

        {/* Lead Score Breakdown */}
        <div className="rounded-sm border border-blue-100 bg-blue-50/60 p-5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-blue-900">Lead Health Score</span>
            <span className="rounded-full bg-[#0D1F3D] text-white px-2.5 py-0.5 font-extrabold text-xs">
              {score} / 100
            </span>
          </div>
          <div className="h-2.5 w-full bg-blue-200/60 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${score}%` }} />
          </div>
          <p className="text-slate-600 font-medium leading-relaxed">
            High qualification score. Client has active commercial interest and budget verification in progress.
          </p>
        </div>
      </div>
    </div>
  );
}
