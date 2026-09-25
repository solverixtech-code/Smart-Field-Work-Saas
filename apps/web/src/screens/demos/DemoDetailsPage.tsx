import React, { useEffect, useState } from 'react';
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
  Star,
  Tag,
  Send,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { DemoItem } from './demosData';
import { EditDemoModal } from './EditDemoModal';
import { demoApi, toDemoItem } from './demo.api';

export default function DemoDetailsPage() {
  const { demoId } = useParams();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [demo, setDemo] = useState<DemoItem | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!demoId) return;
    const controller = new AbortController();
    demoApi.get(demoId, controller.signal).then((record) => setDemo(toDemoItem(record))).catch((error: unknown) => {
      if (!controller.signal.aborted) toast.error(error instanceof Error ? error.message : 'Unable to load demo');
    });
    return () => controller.abort();
  }, [demoId, revision]);

  const updateDemo = async (changes: Parameters<typeof demoApi.update>[1], message: string) => {
    if (!demo) return;
    try {
      await demoApi.update(demo.id, changes, new AbortController().signal);
      toast.success(message);
      setRevision((value) => value + 1);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to update demo');
    }
  };

  const cloneDemo = async () => {
    if (!demo?.leadId || !demo.assignedToMembershipId || !demo.demoDateIso) return;
    try {
      await demoApi.create({ leadId: demo.leadId, conductedByMembershipId: demo.assignedToMembershipId, demoTitle: demo.productService, productService: demo.productService, demoDate: demo.demoDateIso, demoTime: demo.demoTime, demoType: demo.demoType, demoMode: demo.demoMode || (demo.demoType === 'Online Demo' ? 'Virtual' : 'In-Person'), attendeesCount: demo.attendeesCount || 1, keyQuestions: demo.notesSummary }, new AbortController().signal);
      toast.success('Demo cloned successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to clone demo');
    }
  };

  const removeDemo = async () => {
    if (!demo) return;
    try {
      await demoApi.remove(demo.id, new AbortController().signal);
      toast.success(`Demo ${demo.demoId} deleted`);
      navigate('/admin/demos');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete demo');
    }
  };

  const formatActivityTime = (value: string) => new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

  const formatActivityDate = (value: string) => new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));

  if (!demo) return <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left text-xs font-semibold text-slate-500">Loading demo details...</div>;

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => navigate('/admin/demos')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Demos
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

          <Button
            variant="outline"
            size="sm"
            onClick={cloneDemo}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
          >
            <Copy className="h-3.5 w-3.5" /> Clone Demo
          </Button>

          <RowActionsMenu
            triggerClassName="rounded-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            triggerIcon={ChevronDown}
            items={[
              {
                label: 'Edit Product Demo',
                icon: Edit,
                onClick: () => setIsEditModalOpen(true),
              },
              {
                label: 'Mark as Completed',
                icon: CheckCircle2,
                onClick: () => updateDemo({ status: 'COMPLETED', outcome: demo.outcome === 'Pending' ? 'DEMO_DONE' : undefined }, `Demo ${demo.demoId} marked as completed!`),
              },
              {
                label: 'Reschedule Demo',
                icon: Calendar,
                onClick: () => setIsEditModalOpen(true),
              },
              {
                label: 'Call Client',
                icon: Phone,
                onClick: () => { window.location.href = `tel:${demo.phone}`; },
              },
              {
                label: 'Send Proposal',
                icon: FileText,
                onClick: () => updateDemo({ outcome: 'PROPOSAL', nextAction: 'Proposal follow-up' }, `Proposal recorded for ${demo.demoId}`),
              },
              {
                label: 'Delete Demo',
                icon: Edit,
                danger: true,
                divider: true,
                onClick: removeDemo,
              },
            ]}
          />
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
            <span className="text-[11px] font-semibold text-slate-500 block">Demo ID</span>
            <span className="text-sm font-extrabold text-[#0D1F3D]">{demo.demoId}</span>
            <span className="text-[11px] font-bold text-blue-600 block">{demo.demoType}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Status</span>
          <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold inline-block mt-0.5">
            {demo.status}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">{demo.status === 'Completed' ? `Completed on ${demo.demoDate}` : `Scheduled for ${demo.demoDate}`}</span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Demo Date & Time</span>
          <span className="font-extrabold text-[#0D1F3D] block">{demo.demoDate}, {demo.demoTime}</span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Duration</span>
          <span className="font-extrabold text-slate-800 block">{demo.durationFormatted || 'Not recorded'}</span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Outcome</span>
          <span className="rounded-full bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 text-[10px] font-bold inline-block mt-0.5">
            {demo.outcome || 'Pending'}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block">Next Action</span>
          <span className="font-extrabold text-[#0D1F3D] block">{demo.nextAction || 'Not scheduled'}</span>
          <span className="text-[11px] text-slate-500 font-medium block">{demo.nextActionDate || 'Not scheduled'}</span>
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
                  <span className="text-[11px] font-medium text-slate-500 block">{demo.leadStage || 'Lead'}</span>
                  <span className="text-[11px] text-slate-500 block">{demo.businessAddress}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Lead Source</span>
                <span className="font-extrabold text-slate-800">{demo.leadSource || 'Not recorded'}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Lead Stage</span>
                <span className="font-extrabold text-blue-600">{demo.leadStage || 'Not recorded'}</span>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Lead Score</span>
                <div className="flex items-center gap-1 text-amber-500 font-extrabold">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{demo.leadScore || 0}/5</span>
                </div>
              </div>
            </div>

            {/* Contact Person & Assigned To Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
              {/* Contact Person */}
              <div className="rounded-sm border border-slate-200/70 p-3.5 bg-slate-50/40 space-y-2">
                <span className="text-xs font-extrabold text-slate-700 block">Contact Person</span>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-[#0D1F3D] block">{demo.contactPerson}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{demo.contactRole}</span>
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
                  onClick={() => navigate(`/admin/leads/${demo.leadId}`)}
                  className="text-xs font-bold text-blue-600 hover:underline block pt-1 cursor-pointer"
                >
                  View Full Contact Details →
                </button>
              </div>

              {/* Assigned To Executive */}
              <div className="rounded-sm border border-slate-200/70 p-3.5 bg-slate-50/40 space-y-2">
                <span className="text-xs font-extrabold text-slate-700 block">Assigned To</span>
                <div className="flex items-center gap-2">
                  <img
                    src={demo.assignedToAvatar}
                    alt={demo.assignedToName}
                    className="h-7 w-7 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-extrabold text-[#0D1F3D] block">{demo.assignedToName}</span>
                    <span className="text-[11px] text-slate-500 font-medium">{demo.assignedToRole}</span>
                  </div>
                </div>
                <div className="space-y-1 pt-1 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {demo.assignedToPhone || 'Not provided'}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {demo.assignedToEmail || 'Not provided'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/executives/${demo.assignedToMembershipId}`)}
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
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Demo Type</span>
                <span className="font-extrabold text-[#0D1F3D]">{demo.demoType}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Product / Service</span>
                <span className="font-extrabold text-blue-600">{demo.productService}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Source</span>
                <span className="font-extrabold text-slate-800">{demo.leadSource || 'Not recorded'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Demo Location</span>
                <span className="font-extrabold text-slate-800">📍 {demo.demoMode || 'Not recorded'}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Attendees</span>
                <span className="font-mono font-bold text-slate-800">{demo.attendeesCount}</span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">Reminder Sent</span>
                <span className="text-slate-600 font-bold">Not recorded</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">Notes</span>
              <p className="text-[11px] text-slate-800 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-sm border border-slate-200/60">
                {demo.notesSummary || 'No notes recorded.'}
              </p>
            </div>
          </div>

          {/* Card 3: Attachments */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">
                Attachments (0)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2 p-3 rounded-sm border border-slate-200 bg-slate-50/50 text-slate-500 font-medium">
                No attachments uploaded for this demo.
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
              {(demo.activities || []).slice(0, 3).map((activity, index) => (
                <div key={activity.id} className="relative pl-4">
                  <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full ${index === 0 ? 'bg-emerald-600' : index === 1 ? 'bg-purple-600' : 'bg-blue-600'} border-2 border-white text-white flex items-center justify-center text-[8px] font-bold`}>
                    ✓
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0D1F3D]">{activity.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono font-medium">{formatActivityTime(activity.createdAt)}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">{activity.description}</p>
                  <span className="text-[10px] text-slate-500 font-medium">{formatActivityDate(activity.createdAt)}</span>
                </div>
              ))}
              {!demo.activities?.length && (
                <div className="relative pl-4 text-[11px] text-slate-500 font-medium">No activity recorded for this demo.</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate(`/admin/leads/${demo.leadId}/timeline`)}
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
                <span className="text-slate-600 font-medium">Total Duration :</span>
                <span className="font-extrabold text-slate-800">{demo.durationFormatted || '0m'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Outcome :</span>
                <span className="font-extrabold text-emerald-600">{demo.outcome || 'Pending'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Interest Level :</span>
                <span className="font-bold text-amber-500">{demo.leadScore || 0}/5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">Value Discussed :</span>
                <span className="font-extrabold text-[#0D1F3D]">{demo.revenueFormatted || '₹0'}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 font-extrabold">
                <span className="text-slate-700">Probability :</span>
                <span className="text-emerald-600">{demo.probabilityPercentage || 0}%</span>
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

      <EditDemoModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        demo={demo}
        onSuccess={() => setRevision((value) => value + 1)}
      />
    </div>
  );
}
