import React from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  FileText,
  Edit,
  Phone,
  Mail,
  Globe,
  Upload,
  Plus,
  ChevronRight,
  User,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Clock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { BusinessItem } from './businessesData';

export default function BusinessDetailsPage() {
  const business = useOutletContext<BusinessItem>();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* LEFT COLUMN (8 COLS) */}
      <div className="space-y-4 lg:col-span-8">
        {/* Business Information Card */}
        <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#E20613]" /> Business Information
            </h3>
            <button
              onClick={() => navigate(`/admin/businesses/${business.id}/edit`)}
              className="text-xs font-bold text-[#0D1F3D] hover:text-[#E20613] cursor-pointer"
            >
              Edit
            </button>
          </div>

          <div className="flex flex-wrap items-start gap-5">
            {/* Logo box */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt={business.name}
                  className="h-24 w-24 rounded-md object-cover border-2 border-slate-200 shadow-xs"
                />
              ) : (
                <div className={`flex h-24 w-24 items-center justify-center rounded-md font-bold text-2xl ${business.logoBg}`}>
                  {business.logoText}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => toast.info('Uploading new logo...')} className="text-xs font-bold h-7">
                Change Logo
              </Button>
            </div>

            {/* Fields Grid */}
            <div className="grid flex-1 grid-cols-1 gap-3.5 sm:grid-cols-3 text-xs font-semibold">
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Business Name</span>
                <span className="text-[#0D1F3D] font-bold">{business.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Business Type</span>
                <span className="text-[#0D1F3D] font-bold">{business.businessType}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">GSTIN</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  {business.gstin} <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Business Email</span>
                <a href={`mailto:${business.email}`} className="text-blue-600 font-bold hover:underline">
                  {business.email}
                </a>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Business Phone</span>
                <a href={`tel:${business.phone}`} className="text-[#0D1F3D] font-bold">
                  {business.phone}
                </a>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Website</span>
                <a href={business.website} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                  {business.website}
                </a>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Established Year</span>
                <span className="text-[#0D1F3D] font-bold">{business.establishedYear}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">No. of Employees</span>
                <span className="text-[#0D1F3D] font-bold">{business.employees}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Annual Revenue</span>
                <span className="text-[#0D1F3D] font-bold">{business.annualRevenue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Address & Embedded Map Card */}
        <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#E20613]" /> Location & Address
            </h3>
            <button onClick={() => navigate(`/admin/businesses/${business.id}/edit`)} className="text-xs font-bold text-[#0D1F3D] hover:text-[#E20613] cursor-pointer">
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-center">
            {/* Address fields */}
            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Shop / Building No.</span>
                <span className="text-[#0D1F3D] font-bold">12, 1st Floor</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Area / Locality</span>
                <span className="text-[#0D1F3D] font-bold">Orion Mall, Dr. C. H. Street</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">City</span>
                <span className="text-[#0D1F3D] font-bold">{business.city}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">Pincode</span>
                <span className="text-[#0D1F3D] font-bold font-mono">400001</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400">State</span>
                <span className="text-[#0D1F3D] font-bold">Maharashtra</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Country</span>
                <span className="text-[#0D1F3D] font-bold">India</span>
              </div>
            </div>

            {/* Interactive Location Map */}
            <div className="relative h-48 w-full rounded-md border border-slate-200 overflow-hidden shadow-xs">
              <InteractiveMap
                mode="prospects"
                heightClassName="h-full"
                compact
                prospects={[
                  {
                    id: business.id,
                    name: business.name,
                    category: business.businessType,
                    address: business.fullAddress,
                    status: 'Visited',
                    markerColor: 'green',
                    contactPerson: business.assignedToName,
                    phone: business.phone,
                    lastVisitTime: 'Today',
                    lat: 19.115,
                    lng: 72.86,
                    region: business.city,
                  },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Business Description & Categories */}
        <div className="rounded-md border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-[#0D1F3D] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#E20613]" /> Business Description
            </h3>
            <button onClick={() => navigate(`/admin/businesses/${business.id}/edit`)} className="text-xs font-bold text-[#0D1F3D] hover:text-[#E20613] cursor-pointer">
              Edit
            </button>
          </div>

          <p className="text-xs font-medium text-slate-600 leading-relaxed">{business.description}</p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 pt-2 border-t border-slate-100 text-xs font-semibold">
            <div>
              <span className="text-slate-400 text-[11px] block font-medium mb-1">Categories</span>
              <div className="flex flex-wrap gap-1">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">Gym</span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">Fitness Center</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-medium mb-1">Service Areas</span>
              <span className="text-[#0D1F3D] font-bold block">{business.serviceAreas.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-medium mb-1">Languages</span>
              <span className="text-[#0D1F3D] font-bold block">{business.languages.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block font-medium mb-1">Business Hours</span>
              <span className="text-emerald-700 font-bold block text-[11px]">{business.businessHours}</span>
            </div>
          </div>
        </div>

        {/* Notes & Documents Summary Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Notes Preview */}
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0D1F3D]">Notes (5)</h4>
              <button onClick={() => toast.info('Viewing all 5 notes...')} className="text-[11px] font-bold text-blue-600 hover:underline">
                View All Notes →
              </button>
            </div>
            <div className="rounded-md bg-slate-50 p-3 border border-slate-100 text-xs space-y-1">
              <p className="font-semibold text-slate-700">High potential business. Interested in digital marketing & review management.</p>
              <p className="text-[10px] text-slate-400">Added by Vikram Patil on May 16, 2025</p>
            </div>
          </div>

          {/* Documents Preview */}
          <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0D1F3D]">Documents (8)</h4>
              <button onClick={() => toast.info('Viewing all documents...')} className="text-[11px] font-bold text-blue-600 hover:underline">
                View All Documents →
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
              <div className="flex items-center gap-1.5 rounded-md bg-slate-50 p-2 border border-slate-200 text-xs shrink-0">
                <FileSpreadsheet className="h-4 w-4 text-red-500" />
                <div>
                  <p className="font-bold text-[11px] text-[#0D1F3D]">Business Registration.pdf</p>
                  <p className="text-[9px] text-slate-400">245 KB</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-md bg-slate-50 p-2 border border-slate-200 text-xs shrink-0">
                <FileSpreadsheet className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-bold text-[11px] text-[#0D1F3D]">Trade License.jpg</p>
                  <p className="text-[9px] text-slate-400">556 KB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN (4 COLS) */}
      <div className="space-y-4 lg:col-span-4">
        {/* Business Summary Card */}
        <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
          <h3 className="text-xs font-bold text-[#0D1F3D] border-b border-slate-100 pb-2">Business Summary</h3>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Status</span>
            <span className="font-bold text-emerald-600 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Source</span>
            <span className="font-bold text-[#0D1F3D]">{business.source}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Assigned To</span>
            <div className="flex items-center gap-1.5">
              <img src={business.assignedToAvatar} alt="" className="h-5 w-5 rounded-full object-cover" />
              <span className="font-bold text-[#0D1F3D]">{business.assignedToName}</span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Created By</span>
            <span className="font-bold text-[#0D1F3D]">{business.assignedToName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Last Updated By</span>
            <span className="font-bold text-[#0D1F3D]">Neha Gupta</span>
          </div>
        </div>

        {/* Lead Overview Card */}
        <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-[#0D1F3D]">Lead Overview</h3>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md bg-blue-50 p-2.5 border border-blue-100">
              <span className="text-[10px] text-slate-500 block font-medium">Total Leads</span>
              <span className="text-base font-extrabold text-blue-700">{business.totalLeads}</span>
            </div>
            <div className="rounded-md bg-emerald-50 p-2.5 border border-emerald-100">
              <span className="text-[10px] text-slate-500 block font-medium">Active Leads</span>
              <span className="text-base font-extrabold text-emerald-700">{business.activeLeads}</span>
            </div>
            <div className="rounded-md bg-purple-50 p-2.5 border border-purple-100">
              <span className="text-[10px] text-slate-500 block font-medium">Converted</span>
              <span className="text-base font-extrabold text-purple-700">{business.convertedLeads}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-md bg-emerald-50 p-2 border border-emerald-100">
              <span className="text-[10px] text-slate-500 block">Won Leads</span>
              <span className="text-sm font-bold text-emerald-700">{business.wonLeads}</span>
            </div>
            <div className="rounded-md bg-red-50 p-2 border border-red-100">
              <span className="text-[10px] text-slate-500 block">Lost Leads</span>
              <span className="text-sm font-bold text-red-700">{business.lostLeads}</span>
            </div>
            <div className="rounded-md bg-amber-50 p-2 border border-amber-100">
              <span className="text-[10px] text-slate-500 block">Follow-ups</span>
              <span className="text-sm font-bold text-amber-700">{business.followUpLeads}</span>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={() => navigate(`/admin/leads?businessId=${business.id}`)}
            className="text-xs font-bold flex items-center justify-center gap-1 text-[#0D1F3D] border-slate-200"
          >
            View Lead Insights →
          </Button>
        </div>

        {/* Quick Actions Card */}
        <div className="rounded-md border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-[#0D1F3D]">Quick Actions</h3>

          <div className="space-y-2 text-xs font-semibold">
            <button
              onClick={() => toast.info('Adding new contact...')}
              className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2.5 hover:bg-slate-100 text-left transition-colors"
            >
              <div>
                <p className="font-bold text-[#0D1F3D]">Add New Contact</p>
                <p className="text-[10px] text-slate-400">Add a new contact for this business</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => toast.info('Opening Add Note modal...')}
              className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2.5 hover:bg-slate-100 text-left transition-colors"
            >
              <div>
                <p className="font-bold text-[#0D1F3D]">Add Note</p>
                <p className="text-[10px] text-slate-400">Add internal note</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => toast.info('Opening Document upload...')}
              className="w-full flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 p-2.5 hover:bg-slate-100 text-left transition-colors"
            >
              <div>
                <p className="font-bold text-[#0D1F3D]">Upload Document</p>
                <p className="text-[10px] text-slate-400">Upload related documents</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
