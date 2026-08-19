import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ShieldAlert,
  MapPin,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  X,
  FileSpreadsheet,
  Download,
  ChevronRight,
  Info,
  Calendar,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { mockGpsExceptions } from './visitsData';

export default function GpsExceptionDetailsPage() {
  const navigate = useNavigate();
  const { exceptionId } = useParams();

  const req = mockGpsExceptions.find((r) => r.id === exceptionId) || mockGpsExceptions[0];
  const [managerNotes, setManagerNotes] = useState('');

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
            <span onClick={() => navigate('/admin/visits/gps-exceptions')} className="hover:text-[#0D1F3D] cursor-pointer">
              GPS Exception Requests
            </span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0D1F3D] font-bold">{req.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0D1F3D]">GPS Exception Details</h1>
            <span className="rounded-sm bg-amber-50 px-2.5 py-0.5 text-xs font-extrabold text-amber-700 border border-amber-200">
              {req.status}
            </span>
          </div>
          <p className="text-xs font-normal text-slate-500">
            Review the GPS exception request and take appropriate action.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/visits/gps-exceptions')}
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-100 rounded-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to List
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.error(`Request ${req.id} rejected.`)}
            className="flex items-center gap-1.5 font-bold text-red-600 border-red-200 hover:bg-red-50 rounded-sm"
          >
            <X className="h-4 w-4" /> Reject Request
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.success(`Request ${req.id} approved.`)}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
          >
            <Check className="h-4 w-4" /> Approve Request
          </Button>
        </div>
      </div>

      {/* Top Summary Pill Strip */}
      <div className="rounded-sm border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-xs font-semibold">
          <div className="flex items-center gap-2.5">
            <div className="rounded-sm bg-amber-50 p-2 text-amber-600 border border-amber-100">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-medium">Request ID</span>
              <span className="font-extrabold text-[#E20613] font-mono text-sm">{req.id}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block font-medium">Status</span>
            <span className="rounded-sm bg-amber-50 px-2 py-0.5 text-xs font-extrabold text-amber-700 border border-amber-200 inline-block mt-0.5">
              {req.status}
            </span>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block font-medium">Requested At</span>
            <span className="font-bold text-[#0D1F3D] block mt-0.5">{req.requestedAt}</span>
          </div>

          <div className="flex items-center gap-2">
            <img src={req.executiveAvatar} alt="" className="h-7 w-7 rounded-full object-cover border border-slate-200" />
            <div>
              <span className="text-slate-400 text-[10px] block font-medium">Requested By</span>
              <span className="font-bold text-[#0D1F3D]">{req.executiveName}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-[10px] block font-medium">Team / Manager</span>
            <span className="font-bold text-[#0D1F3D] block mt-0.5">{req.teamManager}</span>
          </div>
        </div>
      </div>

      {/* Main Layout Grid: Left Details (8 Cols) + Right Overview Map & Notes (4 Cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Visit Info, Exception Info, Dual Location Grid, Timeline */}
        <div className="space-y-6 lg:col-span-8">
          {/* Visit / Business Information Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
              Visit / Business Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 font-semibold">
              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Business Name</span>
                <span className="font-extrabold text-[#0D1F3D] text-sm block mt-0.5">{req.businessName}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Visit Type</span>
                <span className="font-bold text-slate-800 block mt-0.5">Check-in</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Executive</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <img src={req.executiveAvatar} alt="" className="h-5 w-5 rounded-full object-cover" />
                  <span className="font-bold text-[#0D1F3D]">{req.executiveName}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Check-in Type</span>
                <span className="font-bold text-slate-800 block mt-0.5">Manual</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Business Category</span>
                <span className="font-bold text-slate-800 block mt-0.5">Health & Fitness</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Scheduled Time</span>
                <span className="font-bold text-slate-800 block mt-0.5">{req.scheduledTime}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Location Captured At</span>
                <span className="font-bold text-slate-800 block mt-0.5">{req.requestedAt}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">App Version</span>
                <span className="font-mono text-slate-600 block mt-0.5">2.4.1 (Android)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-start gap-2">
              <MapPin className="h-4 w-4 text-[#E20613] shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Business Address</span>
                <span className="font-bold text-[#0D1F3D]">{req.businessAddress}</span>
              </div>
            </div>
          </div>

          {/* Exception Information Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 text-xs font-semibold">
            <h2 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
              Exception Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Exception Type</span>
                <span className="rounded-sm bg-orange-50 px-2.5 py-0.5 text-xs font-extrabold text-orange-700 border border-orange-200 inline-block mt-1">
                  {req.exceptionType}
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[10.5px] block font-medium">Exception Raised At</span>
                <span className="font-bold text-[#0D1F3D] block mt-1">{req.requestedAt}</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-slate-400 text-[10.5px] block font-medium mb-1">Reason Category</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-sm border border-slate-200 inline-block">
                {req.reasonCategory}
              </span>
            </div>

            <div>
              <span className="text-slate-400 text-[10.5px] block font-medium mb-1">Detailed Reason (Executive)</span>
              <p className="text-slate-700 font-semibold bg-slate-50 p-3 rounded-sm border border-slate-200">
                {req.detailedReason}
              </p>
            </div>

            {req.proofAttachment && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 text-[10.5px] block font-medium mb-1.5">Attachment / Proof</span>
                <div className="flex items-center gap-3 p-2.5 rounded-sm bg-slate-50 border border-slate-200 max-w-sm">
                  <img src={req.proofAttachment} alt="Proof" className="h-10 w-10 rounded-sm object-cover border border-slate-200" />
                  <div className="flex-1">
                    <p className="font-bold text-[#0D1F3D] text-xs">Office New Location.jpg</p>
                    <p className="text-[10px] text-slate-400">1.2 MB</p>
                  </div>
                  <button onClick={() => toast.success('Downloading proof attachment...')} className="p-1.5 text-slate-500 hover:text-[#0D1F3D]">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Exception Details Dual Location Grid */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-3">
              Exception Location Details
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Expected Location Box */}
              <div className="rounded-sm border border-blue-200 bg-blue-50/40 p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
                  <span className="h-3 w-3 rounded-full bg-blue-600 shrink-0" />
                  <h3 className="font-extrabold text-[#0D1F3D]">Expected Location (Business Address)</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                  <div>
                    <span className="text-slate-400 block font-medium">Latitude</span>
                    <span className="font-mono font-bold text-slate-800">{req.expectedLatitude}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Longitude</span>
                    <span className="font-mono font-bold text-slate-800">{req.expectedLongitude}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10.5px] block font-medium">Address</span>
                  <p className="font-bold text-[#0D1F3D] mt-0.5">{req.businessName}, {req.businessAddress}</p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-bold">
                  <span className="text-slate-500">Allowed Radius</span>
                  <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded-sm">{req.allowedRadiusMeters} meters</span>
                </div>

                {/* Map Circle Simulation */}
                <div className="relative h-44 w-full rounded-sm border border-blue-200 overflow-hidden">
                  <iframe
                    title="Expected Map"
                    src={`https://maps.google.com/maps?q=${req.expectedLatitude},${req.expectedLongitude}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0"
                  />
                  <div className="absolute bottom-2 right-2 rounded-sm bg-blue-600 px-2 py-1 text-[10px] font-extrabold text-white shadow-xs">
                    100m radius
                  </div>
                </div>
              </div>

              {/* Actual Location Box */}
              <div className="rounded-sm border border-red-200 bg-red-50/40 p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-red-100 pb-2">
                  <span className="h-3 w-3 rounded-full bg-red-600 shrink-0" />
                  <h3 className="font-extrabold text-[#0D1F3D]">Actual Location (Captured)</h3>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold">
                  <div>
                    <span className="text-slate-400 block font-medium">Latitude</span>
                    <span className="font-mono font-bold text-slate-800">{req.actualLatitude}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Longitude</span>
                    <span className="font-mono font-bold text-slate-800">{req.actualLongitude}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10.5px] block font-medium">Address</span>
                  <p className="font-bold text-[#0D1F3D] mt-0.5">New Link Road, Andheri East, Mumbai, Maharashtra 400069</p>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] font-bold">
                  <span className="text-slate-500">Distance from Expected</span>
                  <span className="text-red-700 bg-red-100 px-2 py-0.5 rounded-sm">{req.capturedDistanceMeters} meters away</span>
                </div>

                {/* Map Circle Simulation */}
                <div className="relative h-44 w-full rounded-sm border border-red-200 overflow-hidden">
                  <iframe
                    title="Actual Map"
                    src={`https://maps.google.com/maps?q=${req.actualLatitude},${req.actualLongitude}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full border-0"
                  />
                  <div className="absolute bottom-2 right-2 rounded-sm bg-red-600 px-2 py-1 text-[10px] font-extrabold text-white shadow-xs">
                    350m away
                  </div>
                </div>
              </div>
            </div>

            {/* Red Alert Banner */}
            <div className="flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Check-in recorded outside the allowed radius of {req.allowedRadiusMeters} meters. Distance captured is {req.capturedDistanceMeters} meters away.</span>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Timeline
            </h3>

            <div className="space-y-3 font-semibold">
              <div className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">1</span>
                  <div>
                    <p className="font-bold text-[#0D1F3D]">Exception Raised</p>
                    <p className="text-[10px] text-slate-400">{req.executiveName} raised an exception request</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{req.requestedAt}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">2</span>
                  <div>
                    <p className="font-bold text-[#0D1F3D]">Location Captured</p>
                    <p className="text-[10px] text-slate-400">Check-in captured outside allowed radius</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{req.requestedAt}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-sm bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold">3</span>
                  <div>
                    <p className="font-bold text-[#0D1F3D]">Visit Started</p>
                    <p className="text-[10px] text-slate-400">Visit started as per schedule</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{req.scheduledTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Location Map Overview, Request Notes, Manager Notes, Audit History */}
        <div className="space-y-6 lg:col-span-4 sticky top-4 self-start">
          {/* Location Map Overview Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Location Map Overview
            </h3>

            <div className="relative h-60 w-full rounded-sm border border-slate-200 overflow-hidden shadow-xs">
              <iframe
                title="Location Map Overview"
                src={`https://maps.google.com/maps?q=${req.expectedLatitude},${req.expectedLongitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
              />
            </div>

            <div className="space-y-2 text-[11px] font-semibold">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-600 shrink-0" />
                <span className="text-slate-600">Expected Location ({req.allowedRadiusMeters}m radius)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-600 shrink-0" />
                <span className="text-slate-600">Actual Location ({req.capturedDistanceMeters}m away)</span>
              </div>
            </div>
          </div>

          {/* Request Notes Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Request Notes
            </h3>
            <p className="text-slate-700 font-medium italic bg-slate-50 p-3 rounded-sm border border-slate-100">
              "{req.notesByExecutive}"
            </p>
            <p className="text-[10px] text-slate-400 font-bold text-right">— {req.executiveName}, {req.requestedAt}</p>
          </div>

          {/* Manager / Admin Notes Card */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Manager / Admin Notes</h3>
              <span className="text-[10px] text-slate-400 font-medium">{managerNotes.length}/500</span>
            </div>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Add your approval notes or comments here..."
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-white p-3 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>

          {/* Request Audit History */}
          <div className="rounded-sm border border-slate-200/80 bg-white p-5 shadow-xs space-y-4 text-xs">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Request History
            </h3>

            <div className="space-y-3 font-semibold">
              <div className="border-l-2 border-slate-200 pl-3 space-y-0.5">
                <p className="font-bold text-[#0D1F3D]">Exception Raised</p>
                <p className="text-[10px] text-slate-400">By {req.executiveName} ({req.executiveRole})</p>
                <p className="text-[10px] text-slate-500">{req.requestedAt}</p>
              </div>

              <div className="border-l-2 border-slate-200 pl-3 space-y-0.5">
                <p className="font-bold text-amber-700">Auto Flagged</p>
                <p className="text-[10px] text-slate-400">System flagged as outside allowed radius</p>
                <p className="text-[10px] text-slate-500">{req.requestedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
