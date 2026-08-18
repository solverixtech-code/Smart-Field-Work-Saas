import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Monitor,
  Smartphone,
  Laptop,
  RefreshCw,
  ShieldCheck,
  MapPin,
  Clock,
  AlertTriangle,
  LogOut,
  Trash2,
  Key,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface Session {
  id: string;
  device: string;
  subDevice: string;
  location: string;
  ip: string;
  lastActive: string;
  status: 'Current Session' | 'Active' | 'Inactive';
  icon: any;
}

const initialSessions: Session[] = [
  {
    id: 's-1',
    device: 'Windows 11 • Chrome 124',
    subDevice: 'This Device',
    location: 'Mumbai, India',
    ip: '103.211.45.67',
    lastActive: 'Just now',
    status: 'Current Session',
    icon: Monitor,
  },
  {
    id: 's-2',
    device: 'Android 14 • Chrome Mobile',
    subDevice: 'Samsung Galaxy S23',
    location: 'Mumbai, India',
    ip: '103.211.45.68',
    lastActive: '15 May 2025, 10:30 AM',
    status: 'Active',
    icon: Smartphone,
  },
  {
    id: 's-3',
    device: 'macOS • Safari 17',
    subDevice: 'MacBook Air',
    location: 'Pune, India',
    ip: '49.37.142.21',
    lastActive: '14 May 2025, 08:15 PM',
    status: 'Active',
    icon: Laptop,
  },
  {
    id: 's-4',
    device: 'iOS 17 • Safari',
    subDevice: 'iPhone 13',
    location: 'Bengaluru, India',
    ip: '106.51.198.34',
    lastActive: '12 May 2025, 06:40 PM',
    status: 'Inactive',
    icon: Smartphone,
  },
];

export default function ActiveSessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>(initialSessions);

  const handleLogoutSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleLogoutAllOther = () => {
    setSessions((prev) => prev.filter((s) => s.status === 'Current Session'));
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Active Sessions</h1>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mt-1">
          <span className="cursor-pointer hover:text-[#0D1F3D]" onClick={() => navigate('/admin/dashboard')}>Dashboard</span>
          <span>&gt;</span>
          <span className="cursor-pointer hover:text-[#0D1F3D]" onClick={() => navigate('/admin/profile')}>My Profile</span>
          <span>&gt;</span>
          <span className="text-[#E20613] font-bold">Active Sessions</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left 8 Columns: Active Sessions Table & Overview Card */}
        <div className="space-y-6 lg:col-span-8">
          {/* Header Summary Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#0D1F3D]">Manage Your Active Sessions</h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  These are the devices and locations where you are currently signed in to your account.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs border-l border-slate-100 pl-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Monitor className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-lg font-extrabold text-[#0D1F3D]">3</span>
                  <p className="text-[10px] text-slate-400 font-semibold">Active Sessions <br />(Including this device)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-lg font-extrabold text-[#0D1F3D]">1</span>
                  <p className="text-[10px] text-slate-400 font-semibold">Trusted Devices <br />(Remembered)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Active Sessions List Container */}
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden space-y-4">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0D1F3D]">Your Active Sessions</h3>
              <button
                onClick={() => alert('Refreshing active sessions...')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0D1F3D] hover:text-[#E20613] transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            <div className="overflow-x-auto custom-scrollbar px-5 pb-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-500 pb-3">
                    <th className="pb-3 whitespace-nowrap min-w-[200px]">Device & Browser</th>
                    <th className="pb-3 whitespace-nowrap min-w-[160px]">Location / IP Address</th>
                    <th className="pb-3 whitespace-nowrap min-w-[140px]">Last Active</th>
                    <th className="pb-3 whitespace-nowrap min-w-[100px]">Status</th>
                    <th className="pb-3 text-right whitespace-nowrap min-w-[90px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sessions.map((s) => {
                    const IconComp = s.icon;
                    return (
                      <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                              <IconComp className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-extrabold text-[#0D1F3D]">{s.device}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{s.subDevice}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <div>
                              <p className="font-semibold text-slate-900">{s.location}</p>
                              <p className="text-[10px] font-mono text-slate-400 font-medium">{s.ip}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 font-semibold text-slate-700 whitespace-nowrap">
                          {s.lastActive}
                        </td>

                        <td className="py-4 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-extrabold border ${
                              s.status === 'Current Session'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : s.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>

                        <td className="py-4 text-right whitespace-nowrap">
                          {s.status === 'Current Session' ? (
                            <span className="text-xs font-semibold text-slate-400 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
                              Current
                            </span>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleLogoutSession(s.id)}
                              className="font-bold border-red-200 text-[#E20613] hover:bg-red-50 text-xs gap-1 py-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Logout
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Alert Warning Banner */}
            <div className="p-4 bg-red-50/60 border-t border-red-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs text-red-900 font-semibold">
                <AlertTriangle className="h-4 w-4 text-[#E20613] shrink-0" />
                <span>If you notice any suspicious activity, please logout of that session immediately.</span>
              </div>
              <Button
                variant="accent"
                size="sm"
                onClick={handleLogoutAllOther}
                className="flex items-center gap-2 font-bold shadow-xs text-xs py-2"
              >
                <LogOut className="h-4 w-4" /> Logout From All Other Sessions
              </Button>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Security Tips Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:col-span-4 space-y-6">
          <h3 className="text-base font-extrabold text-[#0D1F3D]">Security Tips</h3>

          <div className="space-y-6">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#E20613] border border-red-100">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0D1F3D]">Keep Your Account Secure</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                  Always logout from devices that you don't use.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 border-t border-slate-100 pt-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0D1F3D]">Use Trusted Devices</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                  You can mark your personal devices as trusted.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 border-t border-slate-100 pt-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0D1F3D]">Enable 2FA</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                  Two-factor authentication adds an extra layer of security.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 border-t border-slate-100 pt-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#0D1F3D]">Regularly Review Sessions</h4>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-relaxed">
                  Review your active sessions periodically for safety.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
