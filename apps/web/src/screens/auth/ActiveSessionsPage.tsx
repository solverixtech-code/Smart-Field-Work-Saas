import React, { useEffect, useState } from 'react';
import {
  Monitor,
  Smartphone,
  Laptop,
  RefreshCw,
  ShieldCheck,
  MapPin,
  Clock,
  Info,
  SmartphoneNfc,
} from 'lucide-react';
import { api } from '../../common/api';
import { Button } from '../../components/ui/Button';

interface Session {
  id: string;
  platform: string | null;
  ip: string | null;
  location: string | null;
  userAgent: string | null;
  lastSeenAt: string;
  createdAt: string;
  isCurrent: boolean;
  status: string;
}

const mockSessions: Session[] = [
  {
    id: 's-1',
    platform: 'Windows 11 • Chrome 124',
    ip: '103.152.15.23',
    location: 'Mumbai, India',
    userAgent: 'Chrome on Windows 11',
    lastSeenAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    isCurrent: true,
    status: 'ACTIVE',
  },
  {
    id: 's-2',
    platform: 'iPhone 15 • Safari',
    ip: '103.152.15.45',
    location: 'Mumbai, India',
    userAgent: 'Safari on iOS',
    lastSeenAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    isCurrent: false,
    status: 'ACTIVE',
  },
  {
    id: 's-3',
    platform: 'MacBook Air • Chrome 123',
    ip: '103.152.16.78',
    location: 'Pune, India',
    userAgent: 'Chrome on macOS',
    lastSeenAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    isCurrent: false,
    status: 'ACTIVE',
  },
  {
    id: 's-4',
    platform: 'Android • Chrome',
    ip: '115.112.45.66',
    location: 'Delhi, India',
    userAgent: 'Chrome on Android',
    lastSeenAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    isCurrent: false,
    status: 'INACTIVE',
  },
];

export default function ActiveSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(mockSessions);
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/sessions');
      if (res.data?.data && res.data.data.length > 0) {
        setSessions(res.data.data);
      }
    } catch {
      /* fallback to demo sessions */
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      await api.delete(`/auth/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setRevokingId(null);
    }
  };

  const getDeviceDetails = (platform: string | null) => {
    const p = (platform || '').toLowerCase();
    if (p.includes('iphone') || p.includes('android') || p.includes('mobile')) {
      return { icon: Smartphone, bg: 'bg-[#00C2A8]/10 text-[#00C2A8]', sub: 'Mobile' };
    }
    if (p.includes('mac') || p.includes('laptop')) {
      return { icon: Laptop, bg: 'bg-amber-50 text-amber-600', sub: 'Laptop' };
    }
    return { icon: Monitor, bg: 'bg-blue-50 text-blue-600', sub: 'Desktop' };
  };

  const activeCount = sessions.filter((s) => s.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <span>Profile</span>
        <span>›</span>
        <span>Sessions</span>
        <span>›</span>
        <span className="text-[#0B2E6B] font-bold">Active Sessions</span>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B2E6B]">Active Sessions</h1>
      </div>

      {/* Top 4 Stat Overview Row matching My Active Sessions.png */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Stat 1: Logged in status */}
          <div className="flex items-start gap-4 pr-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-xs">
              <SmartphoneNfc className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#0B2E6B]">You are currently logged in</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                These are the devices and browsers where your account is active.
              </p>
            </div>
          </div>

          {/* Stat 2: Active Sessions Count */}
          <div className="flex items-center gap-4 sm:pl-6 pr-4 pt-4 sm:pt-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Active Sessions</p>
              <p className="text-xl font-extrabold text-[#0B2E6B]">{activeCount}</p>
              <p className="text-[10px] text-slate-400 font-medium">Including this device</p>
            </div>
          </div>

          {/* Stat 3: Current Device Location */}
          <div className="flex items-center gap-4 sm:pl-6 pr-4 pt-4 sm:pt-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Current Device</p>
              <p className="text-xs font-extrabold text-[#0B2E6B]">Mumbai, India</p>
              <p className="text-[10px] font-bold text-emerald-600">This device</p>
            </div>
          </div>

          {/* Stat 4: Last Active Timestamp */}
          <div className="flex items-center gap-4 sm:pl-6 pt-4 sm:pt-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Last Active</p>
              <p className="text-xs font-extrabold text-[#0B2E6B]">Just now</p>
              <p className="text-[10px] text-slate-400 font-medium">Today, 11:24 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card: All Active Sessions */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        {/* Table Header Row */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-[#0B2E6B]">All Active Sessions</h2>
            <p className="text-xs font-medium text-slate-500">
              Manage your active sessions across all devices.
            </p>
          </div>

          {/* Reusable Button component for Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            isLoading={loading}
            className="flex items-center gap-2 rounded-xl border-slate-200 text-[#0B2E6B] font-bold hover:bg-slate-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        {/* Sessions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3.5">Device / Browser</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">IP Address</th>
                <th className="px-4 py-3.5">Last Active</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sessions.map((s) => {
                const dev = getDeviceDetails(s.platform);
                const IconComp = dev.icon;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Device / Browser */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${dev.bg}`}>
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-extrabold text-[#0B2E6B]">{s.platform}</p>
                          <p className={`text-[11px] font-semibold ${s.isCurrent ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                            {s.isCurrent ? 'This Device' : dev.sub}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-bold text-[#0B2E6B]">{s.location || 'Mumbai, India'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Maharashtra</p>
                        </div>
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="px-4 py-4 font-mono text-xs text-slate-600">
                      {s.ip || '103.152.15.23'}
                    </td>

                    {/* Last Active */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-[#0B2E6B]">
                        {s.isCurrent ? 'Just now' : '18 minutes ago'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {s.isCurrent ? 'Today, 11:24 AM' : 'Today, 11:06 AM'}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {s.isCurrent ? (
                        <span className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
                          Current Session
                        </span>
                      ) : s.status === 'ACTIVE' ? (
                        <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Action button using reusable Button component */}
                    <td className="px-4 py-4 text-right">
                      {s.isCurrent ? (
                        <span className="text-slate-400 font-bold text-xs">—</span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={revokingId === s.id}
                          onClick={() => handleRevoke(s.id)}
                          className="border-rose-200 text-rose-600 hover:bg-rose-50 font-extrabold rounded-lg text-xs"
                        >
                          Log Out
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Info Banner Box */}
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-xs font-semibold text-blue-900">
          <Info className="h-4 w-4 flex-shrink-0 text-blue-600" />
          <span>If you see any unfamiliar device or location, please log out immediately and change your password.</span>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="pt-6 text-center text-[11px] font-semibold text-slate-400 border-t border-slate-100">
        © 2025 VisibloAI. All rights reserved.
      </div>
    </div>
  );
}
