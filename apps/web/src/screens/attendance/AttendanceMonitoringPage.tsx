import React, { useState } from 'react';
import {
  MapPin,
  Clock,
  UserCheck,
  UserX,
  AlertTriangle,
  Camera,
  Globe,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Smartphone,
  Eye,
} from 'lucide-react';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { Button } from '../../components/ui/Button';

const todayPunches = [
  {
    id: 'PUNCH-1001',
    user: 'Rahul Verma',
    empId: 'FE-1001',
    type: 'PUNCH_IN',
    time: '09:01 AM',
    location: 'Andheri West Metro Station, Mumbai',
    lat: 19.1197,
    lng: 72.8464,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    device: 'Samsung Galaxy S23 (Mobile App)',
    status: 'On Time',
  },
  {
    id: 'PUNCH-1002',
    user: 'Priya Mehta',
    empId: 'FE-1002',
    type: 'PUNCH_IN',
    time: '09:03 AM',
    location: 'Bandra West Linking Road, Mumbai',
    lat: 19.0596,
    lng: 72.8295,
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    device: 'iPhone 15 Pro (Mobile App)',
    status: 'On Time',
  },
  {
    id: 'PUNCH-1003',
    user: 'Sanjay Yadav',
    empId: 'FE-1003',
    type: 'PUNCH_IN',
    time: '09:18 AM',
    location: 'BKC Commercial Hub, Mumbai',
    lat: 19.0657,
    lng: 72.8687,
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    device: 'OnePlus 12 (Mobile App)',
    status: 'Late (18 mins)',
  },
  {
    id: 'PUNCH-1004',
    user: 'Arun Kumar',
    empId: 'FE-1005',
    type: 'PUNCH_IN',
    time: '08:58 AM',
    location: 'Navi Mumbai Station Complex',
    lat: 19.033,
    lng: 73.0297,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    device: 'Google Pixel 8 (Mobile App)',
    status: 'On Time',
  },
  {
    id: 'PUNCH-1005',
    user: 'Vikram Joshi',
    empId: 'FE-1008',
    type: 'PUNCH_IN',
    time: '09:22 AM',
    location: 'Kalyan Station West',
    lat: 19.2437,
    lng: 73.1355,
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    device: 'Xiaomi 14 (Mobile App)',
    status: 'Late (22 mins)',
  },
];

export default function AttendanceMonitoringPage() {
  const [selectedPunch, setSelectedPunch] = useState(todayPunches[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPhotoModal, setShowPhotoModal] = useState<string | null>(null);

  const googleMapUrl = `https://maps.google.com/maps?q=${selectedPunch.lat},${selectedPunch.lng}&z=14&ie=UTF8&iwloc=&output=embed`;

  const filteredPunches = todayPunches.filter(
    (p) =>
      p.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Attendance & Mobile GPS Punches</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-600">
              <Smartphone className="h-3.5 w-3.5" /> Mobile Punch Only
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Real-time GPS coordinates, selfie photo verification, and device ID logging for field punches.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0D1F3D] shadow-xs">
            📅 {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* 6 Top Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          title="On Field Punched"
          value="96"
          subValue="61.5% of team"
          icon={MapPin}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Office Checked In"
          value="32"
          subValue="20.5% of team"
          icon={UserCheck}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Late Arrivals"
          value="8"
          subValue="5.1% late"
          icon={Clock}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Absences"
          value="5"
          subValue="3.2% absent"
          icon={UserX}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Total Punches Today"
          value="248"
          subValue="In + Out logs"
          icon={Smartphone}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="On Time %"
          value="91.5%"
          change="+3.2%"
          changeType="positive"
          timeframe="vs last week"
          icon={CheckCircle2}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
      </div>

      {/* Main Grid: Live Mobile Punch Feed Table + Live GPS Map Embed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Live GPS Mobile Punch Log Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Live Mobile Punch Stream (Today)</h3>

            <div className="relative w-60">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff, code, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase">
                  <th className="px-3.5 py-3">Executive</th>
                  <th className="px-3.5 py-3">Punch Type</th>
                  <th className="px-3.5 py-3">Time</th>
                  <th className="px-3.5 py-3">GPS Location</th>
                  <th className="px-3.5 py-3">Status</th>
                  <th className="px-3.5 py-3 text-right">Photo & Map</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPunches.map((p) => {
                  const isSelected = selectedPunch.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPunch(p)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-red-50/60 font-bold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2">
                          <img src={p.photoUrl} alt={p.user} className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                          <div>
                            <p className="font-extrabold text-[#0D1F3D]">{p.user}</p>
                            <p className="text-[10px] text-slate-400">{p.empId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                          {p.type}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 font-extrabold text-[#E20613]">{p.time}</td>
                      <td className="px-3.5 py-3">
                        <div>
                          <p className="font-extrabold text-[#0D1F3D] text-[11px] truncate max-w-[180px]">{p.location}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.lat}, {p.lng}</p>
                        </div>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-extrabold ${
                          p.status === 'On Time' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPhotoModal(p.photoUrl);
                          }}
                          title="View Selfie Photo Verification"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Camera className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Interactive Live GPS Punch Location Map & Verification */}
        <div className="space-y-6 lg:col-span-5">
          {/* Live GPS Map Container */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#E20613]" />
                  <h3 className="text-base font-extrabold text-[#0D1F3D]">Punch Location Map</h3>
                </div>
                <p className="text-xs text-slate-500">Selected Executive: {selectedPunch.user} ({selectedPunch.empId})</p>
              </div>

              <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-[#0D1F3D]">
                {selectedPunch.time}
              </span>
            </div>

            {/* Actual Google Map Embed */}
            <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
              <iframe
                title="GPS Punch Location Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src={googleMapUrl}
                className="h-full w-full border-0"
              />
            </div>

            {/* Punch Verification Metadata Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between text-[#0D1F3D]">
                <span className="text-slate-500">Device ID:</span>
                <span className="font-mono text-[11px]">{selectedPunch.device}</span>
              </div>
              <div className="flex items-center justify-between text-[#0D1F3D]">
                <span className="text-slate-500">GPS Coordinates:</span>
                <span className="font-mono text-[11px] text-[#E20613]">{selectedPunch.lat}, {selectedPunch.lng}</span>
              </div>
              <div className="flex items-center justify-between text-[#0D1F3D]">
                <span className="text-slate-500">Geofence Status:</span>
                <span className="font-extrabold text-emerald-600">✓ Verified Within Store Radius</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Selfie Photo Verification Dialog Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="relative max-w-sm w-full rounded-2xl bg-white p-5 shadow-2xl space-y-3 text-center">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Selfie Photo Verification</h3>
              <button onClick={() => setShowPhotoModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            <img src={showPhotoModal} alt="Punch Selfie" className="h-64 w-full rounded-xl object-cover border border-slate-200 shadow-sm" />
            <p className="text-xs font-extrabold text-[#0D1F3D]">GPS Verified Mobile Punch In</p>
            <Button variant="outline" size="sm" fullWidth onClick={() => setShowPhotoModal(null)}>
              Close Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
