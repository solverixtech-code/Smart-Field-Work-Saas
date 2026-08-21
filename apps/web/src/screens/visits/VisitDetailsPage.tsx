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
import { InteractiveMap } from '../../components/maps/InteractiveMap';
import { mockVisits } from './visitsData';

export default function VisitDetailsPage() {
  const navigate = useNavigate();
  const { visitId } = useParams();

  const visit = mockVisits.find((v) => v.id === visitId) || mockVisits[0];

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

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
            <span onClick={() => navigate('/admin/visits')} className="hover:text-[#0D1F3D] cursor-pointer">
              All Visits
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0D1F3D] font-bold">Visit Details</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0D1F3D]">Visit Details</h1>
            <span className="rounded-sm bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-600 border border-emerald-200">
              {visit.status}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-500 font-mono">Visit ID: {visit.id}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info(`Editing visit ${visit.id}`)}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-sm"
          >
            <Edit className="h-4 w-4" /> Edit Visit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info('More options for visit')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-sm"
          >
            <MoreVertical className="h-4 w-4" /> More Actions
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => navigate('/admin/visits')}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to All Visits
          </Button>
        </div>
      </div>

      {/* Main Layout Grid: Left Details (8 Cols) + Right Proof & Timeline (4 Cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Overview, Executive, Route, Outcome, Notes, Products */}
        <div className="space-y-6 lg:col-span-8">
          {/* Visit Overview Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 text-xs">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-[#0D1F3D]">Visit Overview</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" /> Business Name
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-[#0D1F3D] block">{visit.businessName}</span>
                    <button
                      onClick={() => navigate(`/admin/businesses/${visit.businessId}`)}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      View Business →
                    </button>
                  </div>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> Location
                  </span>
                  <div className="text-right max-w-[200px]">
                    <span className="font-bold text-[#0D1F3D] block">{visit.location}</span>
                    <span className="text-[10px] font-bold text-blue-600 cursor-pointer hover:underline">
                      View on Map
                    </span>
                  </div>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Visit Type</span>
                  <span className="rounded-sm bg-blue-50 px-2 py-0.5 font-bold text-blue-700 border border-blue-100">
                    {visit.visitType}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Purpose</span>
                  <span className="font-bold text-[#0D1F3D]">{visit.purpose}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Scheduled Date & Time</span>
                  <span className="font-bold text-[#0D1F3D]">{visit.scheduledDateTime}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Actual Date & Time</span>
                  <span className="font-bold text-[#0D1F3D]">{visit.actualDateTime || '-'}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Duration</span>
                  <span className="font-bold text-[#0D1F3D]">{visit.duration || '-'}</span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Status</span>
                  <span className="rounded-sm bg-emerald-50 px-2 py-0.5 font-extrabold text-emerald-600 border border-emerald-200">
                    {visit.status}
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Check-in</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    {visit.checkInTime} <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </span>
                </div>

                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500 font-medium">Check-out</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    {visit.checkOutTime} <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Executive & Route Information Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Executive Info Card */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs">
              <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                Executive Information
              </h3>

              <div className="flex items-center gap-3">
                <img
                  src={visit.executiveAvatar}
                  alt={visit.executiveName}
                  className="h-12 w-12 rounded-full object-cover border-2 border-slate-200 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-[#0D1F3D]">{visit.executiveName}</p>
                    <span className="rounded-sm bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                      {visit.executiveRole}
                    </span>
                  </div>
                  <p className="text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-slate-400" /> {visit.executivePhone}
                  </p>
                  <p className="text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-slate-400" /> {visit.executiveEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Route Info Card */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
              <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
                Route Information
              </h3>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-slate-400" /> Route / Area
                </span>
                <span className="font-bold text-[#0D1F3D]">{visit.routeArea}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium flex items-center gap-1.5">
                  <Bike className="h-3.5 w-3.5 text-slate-400" /> Travel Mode
                </span>
                <span className="font-bold text-[#0D1F3D]">{visit.travelMode}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Distance Traveled</span>
                <span className="font-bold text-[#0D1F3D]">{visit.distanceTraveled}</span>
              </div>

              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Check-in Location</span>
                <span className="font-bold text-emerald-700">{visit.businessName}</span>
              </div>
            </div>
          </div>

          {/* Visit Outcome Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Visit Outcome
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Outcome</span>
                <span className="inline-block rounded-sm bg-emerald-50 px-2 py-0.5 text-xs font-extrabold text-emerald-700 border border-emerald-200 mt-1">
                  {visit.outcome}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Next Step</span>
                <span className="text-[#0D1F3D] font-bold block mt-1">{visit.nextStep}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Follow-up Date</span>
                <span className="text-[#0D1F3D] font-bold block mt-1">{visit.followUpDate}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block font-medium">Priority</span>
                <span className="inline-block rounded-sm bg-amber-50 px-2 py-0.5 text-xs font-extrabold text-amber-700 border border-amber-200 mt-1">
                  {visit.priority}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 text-[11px] block font-medium mb-1">Remarks</span>
              <p className="text-slate-700 font-semibold bg-slate-50 p-2.5 rounded-sm border border-slate-200">
                {visit.remarks}
              </p>
            </div>
          </div>

          {/* Visit Notes Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Visit Notes
            </h3>
            <p className="text-slate-700 font-medium leading-relaxed bg-slate-50/70 p-3 rounded-sm border border-slate-100">
              {visit.notes}
            </p>
          </div>

          {/* Tasks & Documents Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Tasks Created */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-[#0D1F3D]">Tasks Created</h4>
                  <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-bold text-blue-700">
                    {visit.tasksCreated.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {visit.tasksCreated.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-100">
                    <div>
                      <p className="font-bold text-[#0D1F3D]">{t.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Due: {t.dueDate}</p>
                    </div>
                    <span className="rounded-sm bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 border border-amber-200">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Shared */}
            <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-[#0D1F3D]">Documents Shared</h4>
                  <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-bold text-blue-700">
                    {visit.documentsShared.length}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {visit.documentsShared.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-red-500 shrink-0" />
                      <div>
                        <p className="font-bold text-[#0D1F3D]">{doc.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{doc.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toast.success(`Downloading ${doc.name}...`)}
                      className="p-1 text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-200 rounded-sm"
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
                  {visit.productsDiscussed.map((p, idx) => (
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
                onClick={() => toast.info('Reschedule Visit Modal...')}
                className="w-full flex items-center justify-between rounded-sm border border-slate-200 bg-slate-50 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-bold text-[#0D1F3D]">Reschedule Visit</p>
                  <p className="text-[10px] text-slate-400">Change date and time</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={() => toast.info('Add Follow-up Modal...')}
                className="w-full flex items-center justify-between rounded-sm border border-slate-200 bg-slate-50 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-bold text-[#0D1F3D]">Add Follow-up</p>
                  <p className="text-[10px] text-slate-400">Create new follow-up</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>

              <button
                onClick={() => toast.info('Create Task Modal...')}
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
    </div>
  );
}
