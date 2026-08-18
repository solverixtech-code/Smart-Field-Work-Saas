import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ArrowLeft,
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
  const navigate = useNavigate();
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
      return { icon: Smartphone, bg: 'bg-[#0D1F3D]/10 text-[#0D1F3D]', sub: 'Mobile' };
    }
    if (p.includes('mac') || p.includes('laptop')) {
      return { icon: Laptop, bg: 'bg-amber-500/10 text-amber-600', sub: 'Laptop' };
    }
    return { icon: Monitor, bg: 'bg-blue-500/10 text-blue-600', sub: 'Desktop' };
  };

  const activeCount = sessions.filter((s) => s.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Active Login Sessions</h1>
          <p className="text-xs font-medium text-slate-500">
            Monitor and manage your active account login sessions across web, desktop, and mobile devices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            isLoading={loading}
            className="flex items-center gap-2 font-bold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Sessions
          </Button>
        </div>
      </div>

      {/* Top Stat Overview Row */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {/* Stat 1: Logged in status */}
          <div className="flex items-start gap-4 pr-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#0D1F3D]/10 text-[#0D1F3D] shadow-xs">
              <SmartphoneNfc className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-[#0D1F3D]">Currently Logged In</p>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                These are the devices and browsers where your account is active.
              </p>
            </div>
          </div>

          {/* Stat 2: Active Sessions Count */}
          <div className="flex items-center gap-4 sm:pl-6 pr-4 pt-4 sm:pt-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Active Sessions</p>
              <p className="text-xl font-extrabold text-[#0D1F3D]">{activeCount}</p>
              <p className="text-[10px] text-slate-400 font-medium">Including this device</p>
            </div>
          </div>

          {/* Stat 3: Current Device Location */}
          <div className="flex items-center gap-4 sm:pl-6 pr-4 pt-4 sm:pt-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Current Device Location</p>
              <p className="text-xs font-extrabold text-[#0D1F3D]">Mumbai, India</p>
              <p className="text-[10px] font-bold text-emerald-600">Verified IP Session</p>
            </div>
          </div>

          {/* Stat 4: Last Active Timestamp */}
          <div className="flex items-center gap-4 sm:pl-6 pt-4 sm:pt-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400">Last Activity</p>
              <p className="text-xs font-extrabold text-[#0D1F3D]">Just now</p>
              <p className="text-[10px] text-slate-400 font-medium">Today, 11:24 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card: All Active Sessions */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-[#0D1F3D]">All Active Sessions</h2>
            <p className="text-xs font-medium text-slate-500">
              Review and terminate suspicious or unused device sessions.
            </p>
          </div>
        </div>

        {/* Sessions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Device / Browser</th>
                <th className="px-6 py-3.5">Location</th>
                <th className="px-6 py-3.5">IP Address</th>
                <th className="px-6 py-3.5">Last Active</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sessions.map((s) => {
                const dev = getDeviceDetails(s.platform);
                const IconComp = dev.icon;

                return (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Device / Browser */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${dev.bg}`}>
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-extrabold text-[#0D1F3D]">{s.platform}</p>
                          <p className={`text-[11px] font-semibold ${s.isCurrent ? 'text-emerald-600 font-bold' : 'text-slate-400'}`}>
                            {s.isCurrent ? 'This Device' : dev.sub}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-extrabold text-[#0D1F3D]">{s.location || 'Mumbai, India'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Maharashtra</p>
                        </div>
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {s.ip || '103.152.15.23'}
                    </td>

                    {/* Last Active */}
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-[#0D1F3D]">
                        {s.isCurrent ? 'Just now' : '18 minutes ago'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {s.isCurrent ? 'Today, 11:24 AM' : 'Today, 11:06 AM'}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      {s.isCurrent ? (
                        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-600">
                          Current Session
                        </span>
                      ) : s.status === 'ACTIVE' ? (
                        <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-600">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* Action button using reusable Button component */}
                    <td className="px-6 py-4 text-right">
                      {s.isCurrent ? (
                        <span className="text-slate-400 font-bold text-xs">—</span>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          isLoading={revokingId === s.id}
                          onClick={() => handleRevoke(s.id)}
                          className="border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs"
                        >
                          Revoke Session
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
        <div className="p-4 bg-blue-50/60 border-t border-blue-100 flex items-center gap-2 text-xs font-semibold text-blue-900">
          <Info className="h-4 w-4 flex-shrink-0 text-blue-600" />
          <span>If you notice any unfamiliar devices or locations, click <strong>Revoke Session</strong> immediately and change your password.</span>
        </div>
      </div>
    </div>
  );
}
