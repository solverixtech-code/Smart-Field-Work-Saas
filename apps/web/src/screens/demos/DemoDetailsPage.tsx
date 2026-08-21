import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit,
  Copy,
  ChevronDown,
  Monitor,
  CheckCircle2,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Download,
  Star,
  Tag,
  Plus,
  Send,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { getDemoById, mockDemosList, DemoItem } from './demosData';

export default function DemoDetailsPage() {
  const { demoId } = useParams();
  const navigate = useNavigate();

  const demo = getDemoById(demoId || '') || mockDemosList[2]; // Fallback to Royal Bakers demo

  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => navigate('/admin/demos')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Demos
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('Edit Demo opened')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Demo cloned successfully')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Copy className="h-3.5 w-3.5" /> Clone Demo
          </Button>

          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.info('More actions dropdown')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
          >
            More Actions <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Header Title Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Demo Details</h1>
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 text-xs font-bold">
              {demo.status}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            View complete information and activity history for this demo.
          </p>
        </div>
      </div>

      {/* Top Demo Summary Card Strip */}
      <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 text-xs font-semibold">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <Monitor className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block">Demo ID</span>
            <span className="text-sm font-extrabold text-[#0D1F3D]">{demo.demoId}</span>
            <span className="text-[10px] text-blue-600 font-bold block">{demo.demoType}</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold block">Status</span>
          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold inline-block mt-0.5">
            {demo.status}
          </span>
          <span className="text-[10px] text-slate-400 font-normal block mt-1">Completed On {demo.demoDate}</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold block">Demo Date & Time</span>
          <span className="font-extrabold text-[#0D1F3D] block">{demo.demoDate}, {demo.demoTime}</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold block">Duration</span>
          <span className="font-extrabold text-slate-800 block">{demo.durationFormatted || '52m 05s'}</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold block">Outcome</span>
          <span className="rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 text-[10px] font-bold inline-block mt-0.5">
            {demo.outcome || 'Demo Done'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold block">Next Action</span>
          <span className="font-extrabold text-[#0D1F3D] block">{demo.nextAction || 'Send Proposal'}</span>
          <span className="text-[10px] text-slate-400 font-normal block">{demo.nextActionDate || '20 May 2025'}</span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT COLUMN (8 COLS DETAILS) */}
        <div className="space-y-4 lg:col-span-8">
          {/* Card 1: Business / Lead Details */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Business / Lead Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
              <div className="sm:col-span-2 flex items-center gap-3">
                <div className="h-10 w-10 rounded-sm bg-teal-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0">
                  {demo.businessName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#0D1F3D]">{demo.businessName}</h4>
                  <span className="text-[11px] text-slate-500 block">Bakery & Confectionery</span>
                  <span className="text-[10px] text-slate-400 block">{demo.businessAddress}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Lead Source</span>
                <span className="font-bold text-slate-800">{demo.leadSource || 'Referral'}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Lead Stage</span>
                <span className="font-bold text-blue-600">{demo.leadStage || 'Interested'}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Lead Score</span>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{demo.leadScore || 4.5}/5</span>
                </div>
              </div>
            </div>

            {/* Contact Person & Assigned To Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              {/* Contact Person */}
              <div className="rounded-sm border border-slate-200/70 p-3.5 bg-slate-50/40 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contact Person</span>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[#0D1F3D] block">{demo.contactPerson}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{demo.contactRole}</span>
                  </div>
                </div>
                <div className="space-y-1 pt-1 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {demo.phone}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {demo.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.info('Full contact details modal opened')}
                  className="text-xs font-bold text-blue-600 hover:underline block pt-1 cursor-pointer"
                >
                  View Full Contact Details →
                </button>
              </div>

              {/* Assigned To Executive */}
              <div className="rounded-sm border border-slate-200/70 p-3.5 bg-slate-50/40 space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Assigned To</span>
                <div className="flex items-center gap-2">
                  <img
                    src={demo.assignedToAvatar}
                    alt={demo.assignedToName}
                    className="h-7 w-7 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-extrabold text-[#0D1F3D] block">{demo.assignedToName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{demo.assignedToRole}</span>
                  </div>
                </div>
                <div className="space-y-1 pt-1 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> +91 98674 51230
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> pooja.yadav@sfw.com
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/executives/FE-1001`)}
                  className="text-xs font-bold text-blue-600 hover:underline block pt-1 cursor-pointer"
                >
                  View Executive Profile →
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Demo Information */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Demo Information
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Demo Type</span>
                <span className="font-bold text-[#0D1F3D]">{demo.demoType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Product / Service</span>
                <span className="font-bold text-blue-600">{demo.productService}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Source</span>
                <span className="font-bold text-slate-800">{demo.leadSource || 'Referral'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Demo Location</span>
                <span className="font-bold text-slate-800">📍 Customer Place</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Attendees</span>
                <span className="font-mono font-bold text-slate-800">{demo.attendeesCount || 2}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Reminder Sent</span>
                <span className="text-emerald-600 font-bold">✓ Yes ({demo.demoDate})</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Notes</span>
              <p className="text-[11px] text-slate-700 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-sm border border-slate-200/60">
                {demo.notesSummary || 'Customer showed interest in Review Management and AI Website. Discussed pricing and implementation timeline.'}
              </p>
            </div>
          </div>

          {/* Card 3: Attachments */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">
                Attachments (2)
              </h3>
              <button
                type="button"
                onClick={() => toast.info('File upload opened')}
                className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Upload File
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-sm border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-sm bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                    PDF
                  </div>
                  <div>
                    <span className="font-bold text-[#0D1F3D] block">Presentation_RoyalBakers.pdf</span>
                    <span className="text-[10px] text-slate-400">2.4 MB • PDF</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success('Downloading Presentation_RoyalBakers.pdf')}
                  className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-sm border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-sm bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                    PDF
                  </div>
                  <div>
                    <span className="font-bold text-[#0D1F3D] block">Features_Overview.pdf</span>
                    <span className="text-[10px] text-slate-400">1.6 MB • PDF</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success('Downloading Features_Overview.pdf')}
                  className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS SIDEBAR) */}
        <div className="space-y-4 lg:col-span-4">
          {/* Card 4: Demo Activity Timeline */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Demo Activity Timeline
            </h3>

            <div className="space-y-4 pl-2 relative border-l-2 border-slate-200">
              <div className="relative pl-4">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center text-[8px] font-bold">
                  ✓
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0D1F3D]">Demo Completed</span>
                  <span className="text-[10px] text-slate-400 font-mono">04:22 PM</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Demo marked as completed with outcome</p>
                <span className="text-[9px] text-slate-400 font-normal">19 May 2025</span>
              </div>

              <div className="relative pl-4">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-purple-600 border-2 border-white text-white flex items-center justify-center text-[8px] font-bold">
                  ⚡
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0D1F3D]">Outcome Updated</span>
                  <span className="text-[10px] text-slate-400 font-mono">04:21 PM</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Outcome changed to Demo Done</p>
                <span className="text-[9px] text-slate-400 font-normal">19 May 2025</span>
              </div>

              <div className="relative pl-4">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-600 border-2 border-white text-white flex items-center justify-center text-[8px] font-bold">
                  📄
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-[#0D1F3D]">Presentation Shared</span>
                  <span className="text-[10px] text-slate-400 font-mono">03:55 PM</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Product presentation shared with customer</p>
                <span className="text-[9px] text-slate-400 font-normal">19 May 2025</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toast.info('Full timeline expanded')}
              className="text-xs font-bold text-blue-600 hover:underline block text-center w-full pt-1 cursor-pointer"
            >
              View All Timeline →
            </button>
          </div>

          {/* Card 5: Demo Summary Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Demo Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Duration :</span>
                <span className="font-bold text-slate-800">52m 05s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Outcome :</span>
                <span className="font-bold text-emerald-600">{demo.outcome || 'Demo Done'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interest Level :</span>
                <span className="font-bold text-amber-500">⭐⭐⭐⭐☆ 4.5/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Value Discussed :</span>
                <span className="font-bold text-[#0D1F3D]">₹18,45,000</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-extrabold">
                <span className="text-slate-700">Probability :</span>
                <span className="text-emerald-600">{demo.probabilityPercentage || 80}%</span>
              </div>
            </div>
          </div>

          {/* Card 6: Tags */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Tags
            </h3>

            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                Interested
              </span>
              <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold">
                High Potential
              </span>
              <span className="rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold">
                Review Management
              </span>
              <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold">
                AI Website
              </span>
              <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold">
                Local SEO
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
