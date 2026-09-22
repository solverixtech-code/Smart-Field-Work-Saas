import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Navigation,
  Bike,
  FileText,
  Download,
  Plus,
  Share2,
  ChevronRight,
  ArrowLeft,
  Edit,
  MoreVertical,
  ShieldCheck,
  Maximize2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DatePicker } from '../../components/ui/DatePicker';
import { Input } from '../../components/ui/Input';
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { useCrmQuery } from '../../features/crm/CrmContext';
import { visitApi } from './visit.api';
import { toVisitItem } from './visit-adapter';

export default function VisitDetailsPage() {
  const navigate = useNavigate();
  const { visitId } = useParams();

  const visitQuery = useCrmQuery(
    `visit-details:${visitId ?? 'missing'}`,
    (_service, signal) => {
      if (!visitId) return Promise.reject(new Error('Visit ID is required'));
      return visitApi.get(visitId, signal);
    },
  );
  const visit = React.useMemo(
    () => (visitQuery.data ? toVisitItem(visitQuery.data) : null),
    [visitQuery.data],
  );

  const getExecutiveInitials = (name: string) => {
    if (!name) return 'EX';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Quick Action Modals State
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

  // Reschedule Form State
  const [rescheduleDate, setRescheduleDate] = useState('2026-09-25');
  const [rescheduleTime, setRescheduleTime] = useState('11:30 AM');
  const [rescheduleReason, setRescheduleReason] = useState('Client Request');
  const [rescheduleNotes, setRescheduleNotes] = useState('');

  // Follow-up Form State
  const [followUpType, setFollowUpType] = useState('In-Person Meeting');
  const [followUpDate, setFollowUpDate] = useState('2026-09-28');
  const [followUpTime, setFollowUpTime] = useState('02:00 PM');
  const [followUpPriority, setFollowUpPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [followUpNotes, setFollowUpNotes] = useState('');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-09-26');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  React.useEffect(() => {
    if (visit) setTaskAssignee(visit.executiveName);
  }, [visit]);

  const handleDownloadDoc = (doc: { name: string; size?: string }) => {
    if (!visit) return;
    const fileContent = `VISIBLO SMART FIELD WORK SAAS - DOCUMENT EXPORT
--------------------------------------------------
Document Name: ${doc.name}
Visit ID: ${visit.id}
Business Name: ${visit.businessName}
Location: ${visit.location}
Field Executive: ${visit.executiveName}
Exported Date: ${new Date().toLocaleString()}
Status: Verified & Synced

SUMMARY & DETAILS:
- Customer requirements and discussion notes recorded during visit.
- Geo-verified check-in at ${visit.checkInTime} and check-out at ${visit.checkOutTime}.
- Priority: ${visit.priority}
--------------------------------------------------`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', doc.name.includes('.') ? doc.name : `${doc.name}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${doc.name}`);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visit) return;
    try {
      const localScheduled = JSON.parse(localStorage.getItem('sfw_scheduled_visits') || '[]');
      const updated = localScheduled.map((v: any) => {
        if (v.id === visit.id) {
          return {
            ...v,
            scheduledDateTime: `${rescheduleDate}, ${rescheduleTime}`,
            status: 'Scheduled',
            remarks: rescheduleNotes || v.remarks,
          };
        }
        return v;
      });
      localStorage.setItem('sfw_scheduled_visits', JSON.stringify(updated));
    } catch (err) {}

    toast.success(`Visit rescheduled to ${rescheduleDate} at ${rescheduleTime}`);
    setIsRescheduleOpen(false);
  };

  const handleFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visit) return;
    if (!followUpNotes.trim()) {
      toast.error('Please enter follow-up action notes');
      return;
    }

    try {
      const followUps = JSON.parse(localStorage.getItem('sfw_follow_ups') || '[]');
      const newFollowUp = {
        id: `FLP-${Date.now()}`,
        visitId: visit.id,
        businessName: visit.businessName,
        type: followUpType,
        scheduledDate: followUpDate,
        scheduledTime: followUpTime,
        priority: followUpPriority,
        notes: followUpNotes,
        assignedTo: visit.executiveName,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('sfw_follow_ups', JSON.stringify([newFollowUp, ...followUps]));
    } catch (err) {}

    toast.success(`Follow-up (${followUpType}) scheduled for ${followUpDate}`);
    setFollowUpNotes('');
    setIsFollowUpOpen(false);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visit) return;
    if (!taskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    try {
      const tasks = JSON.parse(localStorage.getItem('sfw_tasks') || '[]');
      const newTask = {
        id: `TSK-${Date.now()}`,
        visitId: visit.id,
        businessName: visit.businessName,
        title: taskTitle,
        dueDate: taskDueDate,
        priority: taskPriority,
        assignee: taskAssignee,
        description: taskDescription,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem('sfw_tasks', JSON.stringify([newTask, ...tasks]));
    } catch (err) {}

    toast.success(`Task "${taskTitle}" assigned to ${taskAssignee}`);
    setTaskTitle('');
    setTaskDescription('');
    setIsTaskOpen(false);
  };

  if (visitQuery.loading) {
    return <p role="status" className="p-6 text-sm text-slate-500">Loading visit details...</p>;
  }

  if (visitQuery.error || !visit) {
    return (
      <div role="alert" className="rounded-sm border border-red-200 bg-red-50 p-5 text-sm text-red-700">
        <p className="font-bold">This visit is unavailable.</p>
        <p className="mt-1">It may not be assigned to you or may no longer exist.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/admin/visits')}>
          Back to visits
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans pb-12">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span onClick={() => navigate('/admin/dashboard')} className="hover:text-[#0D1F3D] cursor-pointer">
              Dashboard
            </span>
            <ChevronRight className="h-3 w-3" />
            <span onClick={() => navigate('/admin/visits')} className="hover:text-[#0D1F3D] cursor-pointer">
              Visit Management
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0D1F3D] font-bold">Visit Details</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/visits')}
              className="p-1 rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-xl font-extrabold text-[#0D1F3D]">
              Visit Details: {visit.displayId || 'Visit'}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold border ${
                visit.status === 'Completed'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : visit.status === 'Scheduled'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {visit.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => toast.success('Sharing visit details link...')}>
            <Share2 className="h-3.5 w-3.5 mr-1" /> Share
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIsRescheduleOpen(true)}>
            <Edit className="h-3.5 w-3.5 mr-1" /> Reschedule
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsFollowUpOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Follow-up
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Business, Executive, Outcomes, Products */}
        <div className="space-y-6 lg:col-span-8">
          {/* Business & Executive Details Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
              {/* Business Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-sm bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center font-extrabold shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-[#0D1F3D]">
                      {visit.businessName}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {visit.businessType} • {visit.businessCategory}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 pl-1 text-slate-600 font-semibold">
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{visit.location}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>Contact: {visit.executivePhone}</span>
                  </p>
                </div>
              </div>

              {/* Executive Info */}
              <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                <div className="flex items-center gap-2.5">
                  {visit.executiveAvatar ? (
                    <img
                      src={visit.executiveAvatar}
                      alt={visit.executiveName}
                      className="h-10 w-10 rounded-full border border-slate-200 object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-[#0D1F3D] text-white flex items-center justify-center text-xs font-extrabold shrink-0 shadow-xs">
                      {getExecutiveInitials(visit.executiveName)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-extrabold text-[#0D1F3D]">
                      {visit.executiveName}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {visit.executiveRole}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600">
                        <Phone className="h-3 w-3 text-slate-400" /> {visit.executivePhone}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visit Details Key-Value Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 bg-slate-50/70 p-3 rounded-sm border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Visit Type</span>
                <span className="font-extrabold text-[#0D1F3D]">{visit.visitType}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Scheduled Slot</span>
                <span className="font-bold text-[#0D1F3D]">{visit.scheduledDateTime}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Duration</span>
                <span className="font-extrabold text-[#0D1F3D]">{visit.duration}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">GPS Verification</span>
                <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified ({visit.distanceFromShop})
                </span>
              </div>
            </div>
          </div>

          {/* Outcome & Requirements Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Visit Outcome & Meeting Summary
            </h3>

            <div className="space-y-3 font-medium text-slate-700">
              <div>
                <span className="text-slate-400 text-[11px] font-bold block">Meeting Purpose</span>
                <p className="font-semibold text-[#0D1F3D]">{visit.purpose}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] font-bold block">Executive Remarks / Key Discussion</span>
                <p className="p-3 bg-slate-50 rounded-sm border border-slate-100 text-slate-800 font-semibold leading-relaxed">
                  "{visit.remarks || visit.notes}"
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-sm bg-emerald-50/60 border border-emerald-100 space-y-1">
                  <span className="text-emerald-800 font-extrabold text-[11px] block">Next Action Step</span>
                  <p className="font-bold text-emerald-950">{visit.nextStep || 'Follow up required'}</p>
                </div>

                <div className="p-3 rounded-sm bg-blue-50/60 border border-blue-100 space-y-1">
                  <span className="text-blue-800 font-extrabold text-[11px] block">Target Follow-up Date</span>
                  <p className="font-bold text-blue-950">{visit.followUpDate || 'Within 3 days'}</p>
                </div>
              </div>
            </div>

            {/* Documents Shared */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-[#0D1F3D]">Documents Shared</h4>
                  <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-bold text-blue-700">
                    {(visit.documentsShared || []).length}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {(visit.documentsShared || []).map((doc: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-red-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[#0D1F3D]">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{doc.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadDoc(doc)}
                      className="p-1.5 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-200 rounded-sm transition-colors cursor-pointer"
                      title={`Download ${doc.name}`}
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Products / Enquiries Discussed Table */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Products / Enquiries Discussed
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold text-slate-600">
                    <th className="py-2.5 px-3">Product / Service</th>
                    <th className="py-2.5 px-3">Discussion</th>
                    <th className="py-2.5 px-3">Client Interest</th>
                    <th className="py-2.5 px-3">Expected Value</th>
                    <th className="py-2.5 px-3">Next Step</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {(visit.productsDiscussed || []).map((p: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/60">
                      <td className="py-3 px-3 font-bold text-[#0D1F3D]">{p.name}</td>
                      <td className="py-3 px-3 text-slate-600">{p.discussion}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`rounded-sm px-2 py-0.5 text-[10px] font-extrabold border ${
                            p.interest === 'High'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : p.interest === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {p.interest}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold text-[#0D1F3D]">{p.expectedValue}</td>
                      <td className="py-3 px-3 text-blue-700 font-bold">{p.nextStep}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Location & Proof, Activity Timeline, Quick Actions */}
        <div className="space-y-6 lg:col-span-4 sticky top-4 self-start">
          {/* Location & Proof Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Location & Proof
            </h3>

            {/* Interactive Location Map */}
            <div className="relative h-56 w-full rounded-sm border border-slate-200 overflow-hidden shadow-xs">
              <InteractiveMap
                mode="prospects"
                heightClassName="h-full"
                compact
                prospects={[
                  {
                    id: visit.id,
                    name: visit.businessName,
                    category: visit.purpose,
                    address: visit.location,
                    status: 'Visited',
                    markerColor: 'green',
                    contactPerson: visit.executiveName,
                    phone: visit.executivePhone,
                    lastVisitTime: visit.actualDateTime || 'Today',
                    lat: 19.115,
                    lng: 72.86,
                    region: visit.routeArea,
                  },
                ]}
              />
            </div>

            {/* Check-in & Check-out Timestamps */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-bold flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-600" /> Check-in Time
                </span>
                <span className="font-extrabold text-[#0D1F3D] flex items-center gap-1">
                  {visit.checkInTime} <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-bold flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-emerald-600" /> Check-out Time
                </span>
                <span className="font-extrabold text-[#0D1F3D] flex items-center gap-1">
                  {visit.checkOutTime} <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </span>
              </div>
            </div>

            {/* Photo Proof Thumbnails */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              {visit.checkInPhoto && (
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold block text-[11px]">Check-in Photo</span>
                  <div
                    onClick={() => setSelectedPhoto(visit.checkInPhoto || null)}
                    className="relative group overflow-hidden rounded-sm border border-slate-200 h-32 cursor-pointer shadow-xs"
                  >
                    <img src={visit.checkInPhoto} alt="Check-in Photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                      <Maximize2 className="h-4 w-4" /> Expand Photo
                    </div>
                  </div>
                </div>
              )}

              {visit.checkOutPhoto && (
                <div className="space-y-1">
                  <span className="text-slate-500 font-bold block text-[11px]">Check-out Photo</span>
                  <div
                    onClick={() => setSelectedPhoto(visit.checkOutPhoto || null)}
                    className="relative group overflow-hidden rounded-sm border border-slate-200 h-32 cursor-pointer shadow-xs"
                  >
                    <img src={visit.checkOutPhoto} alt="Check-out Photo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                      <Maximize2 className="h-4 w-4" /> Expand Photo
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Activity Timeline
            </h3>

            <div className="relative pl-4 space-y-4 border-l-2 border-slate-200">
              <div className="relative">
                <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                <p className="font-bold text-[#0D1F3D]">Visit Completed</p>
                <p className="text-[10px] text-slate-400">Check-out at {visit.checkOutTime}</p>
                <p className="text-[10px] font-semibold text-slate-600">{visit.executiveName}</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-white" />
                <p className="font-bold text-[#0D1F3D]">Check-in</p>
                <p className="text-[10px] text-slate-400">Check-in at {visit.checkInTime}</p>
                <p className="text-[10px] font-semibold text-slate-600">{visit.executiveName}</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-blue-400 ring-4 ring-white" />
                <p className="font-bold text-[#0D1F3D]">Visit Started</p>
                <p className="text-[10px] text-slate-400">En route to location</p>
                <p className="text-[10px] font-semibold text-slate-600">{visit.executiveName}</p>
              </div>

              <div className="relative">
                <span className="absolute -left-[21px] top-0.5 h-3 w-3 rounded-full bg-purple-500 ring-4 ring-white" />
                <p className="font-bold text-[#0D1F3D]">Visit Scheduled</p>
                <p className="text-[10px] text-slate-400">Scheduled for {visit.scheduledDateTime}</p>
                <p className="text-[10px] font-semibold text-slate-600">{visit.createdBy}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-2.5 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Quick Actions
            </h3>

            <div className="space-y-2 font-semibold">
              <button
                onClick={() => setIsRescheduleOpen(true)}
                className="w-full flex items-center justify-between rounded-sm border border-slate-200 bg-slate-50 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-bold text-[#0D1F3D]">Reschedule Visit</p>
                  <p className="text-[10px] text-slate-400">Change date and time</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={() => setIsFollowUpOpen(true)}
                className="w-full flex items-center justify-between rounded-sm border border-slate-200 bg-slate-50 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-bold text-[#0D1F3D]">Add Follow-up</p>
                  <p className="text-[10px] text-slate-400">Create new follow-up</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={() => setIsTaskOpen(true)}
                className="w-full flex items-center justify-between rounded-sm border border-slate-200 bg-slate-50 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-bold text-[#0D1F3D]">Create Task</p>
                  <p className="text-[10px] text-slate-400">Assign task to executive</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Photo Preview Modal */}
      {selectedPhoto && (
        <Modal isOpen={!!selectedPhoto} onClose={() => setSelectedPhoto(null)} maxWidth="max-w-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Location Photo Proof</h3>
              <button onClick={() => setSelectedPhoto(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="rounded-sm overflow-hidden border border-slate-200 max-h-[70vh]">
              <img src={selectedPhoto} alt="Proof" className="w-full h-full object-contain bg-slate-900" />
            </div>
          </div>
        </Modal>
      )}

      {/* Reschedule Visit Modal */}
      <Modal isOpen={isRescheduleOpen} onClose={() => setIsRescheduleOpen(false)} maxWidth="max-w-md">
        <form onSubmit={handleRescheduleSubmit} className="space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Reschedule Field Visit</h3>
              <p className="text-[11px] text-slate-400 font-medium">Update scheduled slot for {visit.businessName}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsRescheduleOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <DatePicker
              label="New Visit Date"
              value={rescheduleDate}
              onChange={(d) => setRescheduleDate(d)}
              required
            />

            <div className="space-y-1 text-left">
              <label className="font-bold text-[#0D1F3D] block text-xs">
                Time Slot <span className="text-red-500">*</span>
              </label>
              <select
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D] shadow-xs focus:border-[#0D1F3D] focus:outline-none"
              >
                <option value="09:00 AM">09:00 AM - 10:00 AM</option>
                <option value="10:30 AM">10:30 AM - 11:30 AM</option>
                <option value="11:30 AM">11:30 AM - 12:30 PM</option>
                <option value="02:00 PM">02:00 PM - 03:00 PM</option>
                <option value="04:00 PM">04:00 PM - 05:00 PM</option>
                <option value="05:30 PM">05:30 PM - 06:30 PM</option>
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="font-bold text-[#0D1F3D] block text-xs">Reason for Rescheduling</label>
              <select
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D] shadow-xs focus:border-[#0D1F3D] focus:outline-none"
              >
                <option value="Client Request">Client Requested New Time</option>
                <option value="Executive Conflict">Executive Schedule Conflict</option>
                <option value="Weather / Transport">Transport / Weather Issue</option>
                <option value="Scope Adjustment">Scope / Demo Preparation Needed</option>
                <option value="Other">Other Reason</option>
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="font-bold text-[#0D1F3D] block text-xs">Remarks / Note</label>
              <textarea
                value={rescheduleNotes}
                onChange={(e) => setRescheduleNotes(e.target.value)}
                placeholder="Add contextual note for the executive..."
                rows={3}
                className="w-full rounded-sm border border-slate-200 bg-white p-2.5 text-xs font-medium text-[#0D1F3D] shadow-xs focus:border-[#0D1F3D] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsRescheduleOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirm Reschedule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Follow-up Modal */}
      <Modal isOpen={isFollowUpOpen} onClose={() => setIsFollowUpOpen(false)} maxWidth="max-w-md">
        <form onSubmit={handleFollowUpSubmit} className="space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Schedule Follow-up</h3>
              <p className="text-[11px] text-slate-400 font-medium">Create next step for {visit.businessName}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsFollowUpOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="space-y-1 text-left">
              <label className="font-bold text-[#0D1F3D] block text-xs">
                Follow-up Activity Type <span className="text-red-500">*</span>
              </label>
              <select
                value={followUpType}
                onChange={(e) => setFollowUpType(e.target.value)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D] shadow-xs focus:border-[#0D1F3D] focus:outline-none"
              >
                <option value="Phone Call">Phone Call</option>
                <option value="In-Person Meeting">In-Person Visit / Meeting</option>
                <option value="Product Demo">Product Demo / Technical Trial</option>
                <option value="Email Proposal">Send Proposal / Quotation Email</option>
                <option value="Contract Renewal">Contract / Commercial Discussion</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <DatePicker
                label="Follow-up Date"
                value={followUpDate}
                onChange={(d) => setFollowUpDate(d)}
                required
              />

              <div className="space-y-1 text-left">
                <label className="font-bold text-[#0D1F3D] block text-xs">Time Slot</label>
                <select
                  value={followUpTime}
                  onChange={(e) => setFollowUpTime(e.target.value)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D] shadow-xs focus:border-[#0D1F3D] focus:outline-none"
                >
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:30 PM">05:30 PM</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <label className="font-bold text-[#0D1F3D] block text-xs">Priority</label>
              <select
                value={followUpPriority}
                onChange={(e) => setFollowUpPriority(e.target.value as any)}
                className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D] shadow-xs focus:border-[#0D1F3D] focus:outline-none"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
            </div>

            <div className="space-y-1 text-left">
              <label className="font-bold text-[#0D1F3D] block text-xs">
                Action Items / Agenda <span className="text-red-500">*</span>
              </label>
              <textarea
                value={followUpNotes}
                onChange={(e) => setFollowUpNotes(e.target.value)}
                placeholder="What needs to be accomplished during this follow-up?"
                rows={3}
                required
                className="w-full rounded-sm border border-slate-200 bg-white p-2.5 text-xs font-medium text-[#0D1F3D] shadow-xs focus:border-[#0D1F3D] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsFollowUpOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Follow-up
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Task Modal */}
      <Modal isOpen={isTaskOpen} onClose={() => setIsTaskOpen(false)} maxWidth="max-w-md">
        <form onSubmit={handleTaskSubmit} className="space-y-4 font-sans text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Assign Executive Task</h3>
              <p className="text-[11px] text-slate-400 font-medium">Task related to visit {visit.id}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsTaskOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <Input
              label="Task Title"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="e.g. Send custom pricing quote & agreement"
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <DatePicker
                label="Due Date"
                value={taskDueDate}
                onChange={(d) => setTaskDueDate(d)}
                required
              />

              <div className="space-y-1 text-left">
                <label className="font-bold text-[#0D1F3D] block text-xs">Priority</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as any)}
                  className="w-full rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D] shadow-xs focus:border-[#0D1F3D] focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <Input
              label="Assigned Executive"
              value={taskAssignee}
              onChange={(e) => setTaskAssignee(e.target.value)}
              required
            />

            <div className="space-y-1 text-left">
              <label className="font-bold text-[#0D1F3D] block text-xs">Task Instructions</label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Provide detailed instructions for executive..."
                rows={3}
                className="w-full rounded-sm border border-slate-200 bg-white p-2.5 text-xs font-medium text-[#0D1F3D] shadow-xs focus:border-[#0D1F3D] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsTaskOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Assign Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
