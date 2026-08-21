import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ChevronDown,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  Download,
  Edit,
  RotateCcw,
  Smartphone,
  Check,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { getFollowUpById, mockFollowUpsList } from './followupsData';
import { EditFollowUpModal } from './EditFollowUpModal';

export default function FollowUpDetailsPage() {
  const { followupId } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const followup = getFollowUpById(followupId || '') || mockFollowUpsList[5]; // Fallback to Fresh & Green

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => navigate('/admin/follow-ups')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to List
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditModalOpen(true)}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Edit className="h-3.5 w-3.5" /> Edit
          </Button>

          <RowActionsMenu
            triggerClassName="rounded-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            triggerIcon={ChevronDown}
            items={[
              {
                label: 'Edit Follow-up',
                icon: Edit,
                onClick: () => setIsEditModalOpen(true),
              },
              {
                label: 'Mark as Completed',
                icon: CheckCircle2,
                onClick: () => toast.success(`Follow-up ${followup.followupId} marked as completed!`),
              },
              {
                label: 'Reschedule Follow-up',
                icon: Calendar,
                onClick: () => toast.info('Reschedule modal opened'),
              },
              {
                label: 'Call Contact Person',
                icon: Phone,
                onClick: () => toast.info(`Calling ${followup.phone}...`),
              },
              {
                label: 'Send Email',
                icon: Mail,
                onClick: () => toast.info(`Sending email to ${followup.email}...`),
              },
              {
                label: 'Delete Follow-up',
                icon: Edit,
                danger: true,
                divider: true,
                onClick: () => {
                  toast.error(`Follow-up ${followup.followupId} deleted`);
                  navigate('/admin/follow-ups');
                },
              },
            ]}
          />
        </div>
      </div>

      {/* Header Title */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Follow-up Details</h1>
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-0.5 text-xs font-bold">
              {followup.status}
            </span>
          </div>
          <p className="text-xs font-extrabold text-slate-400 font-mono mt-0.5">
            {followup.followupId}
          </p>
        </div>
      </div>

      {/* Top Summary Card Strip */}
      <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 text-xs font-semibold">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Follow-up ID</span>
            <span className="text-sm font-extrabold text-[#0D1F3D]">{followup.followupId}</span>
            <span className="text-[10px] text-slate-500 font-medium block">Created {followup.createdOn}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Follow-up Type</span>
          <span className="font-extrabold text-[#0D1F3D] block">{followup.followupType}</span>
          <span className="text-[10px] text-amber-600 font-bold block mt-0.5">Priority: {followup.priority}</span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Outcome</span>
          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold inline-block mt-0.5">
            {followup.outcome || 'Interested'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium block mt-1">Result: {followup.result || 'Quotation Sent'}</span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Scheduled Date & Time</span>
          <span className="font-extrabold text-[#0D1F3D] block">{followup.followupDate}, {followup.followupTime}</span>
          <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Completed {followup.completedOn || followup.followupDate}</span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Assigned To</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <img
              src={followup.assignedToAvatar}
              alt={followup.assignedToName}
              className="h-5 w-5 rounded-full object-cover border border-slate-200"
            />
            <span className="font-extrabold text-[#0D1F3D]">{followup.assignedToName}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium block">Lead Source: {followup.leadSource || 'Walk-in'}</span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* LEFT COLUMN (8 COLS DETAILS) */}
        <div className="space-y-4 lg:col-span-8">
          {/* Card 1: Lead / Business Information */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-slate-400" /> Lead / Business Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-sm bg-red-50 text-red-600 border border-red-200/60 font-extrabold text-base flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Business Name</span>
                  <h4 className="font-extrabold text-sm text-[#0D1F3D]">{followup.businessName}</h4>
                  <span className="text-[11px] font-medium text-slate-500 block">{followup.businessType}</span>
                  <span className="text-[11px] text-slate-500 block mt-1">{followup.businessAddress}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Lead ID</span>
                  <span className="font-mono font-extrabold text-[#0D1F3D]">{followup.leadId}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Mobile</span>
                  <span className="font-mono font-bold text-slate-800 flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" /> {followup.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Email</span>
                  <span className="font-mono font-bold text-blue-600 flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-400" /> {followup.email}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Contact Person</span>
                  <span className="font-extrabold text-[#0D1F3D]">{followup.contactPerson}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Designation</span>
                  <span className="font-bold text-slate-700">{followup.contactRole}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block">Contact Number</span>
                  <span className="font-mono font-bold text-slate-800">{followup.phone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Follow-up Details */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" /> Follow-up Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Follow-up Purpose</span>
                  <p className="text-xs text-slate-800 font-semibold bg-slate-50 p-2.5 rounded-sm border border-slate-200/60">
                    {followup.purpose || 'To share quotation and discuss requirements'}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Discussion Summary</span>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-sm border border-slate-200/60">
                    {followup.discussionSummary || 'Shared detailed quotation. Discussed pricing and delivery. Customer is interested and requested some customizations.'}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Next Steps</span>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-sm border border-slate-200/60">
                    {followup.nextSteps || 'Follow up after 2 days to confirm requirements and finalize the order.'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50/50 p-3.5 rounded-sm border border-slate-200/70">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-slate-500">Outcome</span>
                  <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                    {followup.outcome || 'Interested'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-slate-500">Result</span>
                  <span className="rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 text-[10px] font-bold">
                    {followup.result || 'Quotation Sent'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-slate-500">Days Overdue</span>
                  <span className="font-mono font-bold text-slate-800">{followup.daysOverdue ?? 0}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-semibold text-slate-500">Reminder Set</span>
                  <span className="font-bold text-emerald-600">Yes</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-200/60 pt-2">
                  <span className="text-[11px] font-semibold text-slate-500">Reminder Date</span>
                  <span className="font-mono font-bold text-[#0D1F3D]">21 May 2025, 12:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Attachments */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">
                Attachments ({followup.attachments?.length || 2})
              </h3>
              <button
                type="button"
                onClick={() => toast.info('Upload file opened')}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                + Upload File
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(followup.attachments || [
                { name: 'Quotation_FreshGreen.pdf', size: '245 KB', type: 'PDF' },
                { name: 'Product_Price_List.xlsx', size: '180 KB', type: 'XLSX' },
              ]).map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-sm border border-slate-200 bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-sm text-white flex items-center justify-center font-bold text-[10px] ${file.type === 'PDF' ? 'bg-red-600' : 'bg-emerald-600'}`}>
                      {file.type}
                    </div>
                    <div>
                      <span className="font-bold text-[#0D1F3D] block">{file.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{file.size} • Uploaded on 19 May 2025</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success(`Downloading ${file.name}`)}
                    className="p-1 text-slate-400 hover:text-slate-800 cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Notes */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Notes
            </h3>

            <p className="text-xs text-slate-800 font-medium leading-relaxed bg-slate-50 p-3 rounded-sm border border-slate-200/60">
              Customer liked the offer. Need to confirm the customization for packaging. Asked for 2 days time to finalize. Follow up on 21 May 2025.
            </p>
            <span className="text-[10px] text-slate-500 font-medium block">Added on 19 May 2025, 03:30 PM • By Pooja Yadav</span>
          </div>

          {/* Footer Metadata Strip */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs font-semibold text-slate-600">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Created By</span>
              <span className="font-bold text-[#0D1F3D]">{followup.assignedToName}</span>
              <span className="text-[10px] text-slate-400 block">Field Executive</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Device</span>
              <span className="font-bold text-[#0D1F3D]">Android 14</span>
              <span className="text-[10px] text-slate-400 block">SFW App v2.4.1</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Location</span>
              <span className="font-mono font-bold text-slate-800">19.1136° N, 72.8697° E</span>
              <span className="text-[10px] text-slate-400 block">Mumbai, Maharashtra</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">Last Sync</span>
              <span className="font-bold text-emerald-600">19 May 2025, 03:32 PM</span>
              <span className="text-[10px] text-slate-400 block">Synced Successfully</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (4 COLS SIDEBAR) */}
        <div className="space-y-4 lg:col-span-4">
          {/* Card 1: Timeline */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Timeline
            </h3>

            <div className="space-y-4 pl-2 relative border-l-2 border-slate-200">
              {(followup.timeline || [
                { title: 'Follow-up Created', time: '12:00 PM', date: '19 May 2025', author: 'Pooja Yadav', type: 'created' },
                { title: 'Scheduled', time: '12:00 PM', date: '19 May 2025', type: 'scheduled' },
                { title: 'Follow-up Completed', time: '03:30 PM', date: '19 May 2025', author: 'Pooja Yadav', type: 'completed' },
                { title: 'Outcome: Interested', time: '03:30 PM', date: '19 May 2025', type: 'outcome' },
                { title: 'Result: Quotation Sent', time: '03:30 PM', date: '19 May 2025', type: 'result' },
              ]).map((t, idx) => (
                <div key={idx} className="relative pl-4">
                  <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center text-[8px] font-bold">
                    ✓
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0D1F3D]">{t.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{t.time}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium block">{t.date} {t.author && `• By ${t.author}`}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => toast.info('Full timeline view opened')}
              className="text-xs font-bold text-blue-600 hover:underline block text-center w-full pt-1 cursor-pointer"
            >
              View Full Timeline →
            </button>
          </div>

          {/* Card 2: Next Follow-up */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Next Follow-up
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Scheduled Date & Time</span>
                <span className="font-extrabold text-[#0D1F3D]">21 May 2025, 12:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Follow-up Type</span>
                <span className="font-bold text-slate-800">Quotation Follow-up</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Assigned To</span>
                <span className="font-bold text-slate-800">{followup.assignedToName}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 items-center">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                  Pending
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Related Information */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Related Information
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Lead Details</span>
                <button
                  onClick={() => navigate('/admin/leads')}
                  className="font-mono font-bold text-blue-600 hover:underline"
                >
                  {followup.leadId} →
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Business Details</span>
                <button
                  onClick={() => navigate('/admin/businesses')}
                  className="font-mono font-bold text-blue-600 hover:underline"
                >
                  BD-12556 →
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">All Follow-ups for this Lead</span>
                <button
                  onClick={() => navigate('/admin/follow-ups')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  View →
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">All Visits for this Business</span>
                <button
                  onClick={() => navigate('/admin/visits')}
                  className="font-bold text-blue-600 hover:underline"
                >
                  View →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EditFollowUpModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        followup={followup}
      />
    </div>
  );
}
