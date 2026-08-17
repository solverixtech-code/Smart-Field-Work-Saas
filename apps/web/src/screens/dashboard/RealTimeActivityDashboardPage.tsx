import React from 'react';
import {
  Users,
  Activity,
  Eye,
  Zap,
  AlertCircle,
  CheckCircle2,
  Globe,
  Clock,
  Filter,
} from 'lucide-react';
import { useAppSelector } from '../../store';
import { Role } from '@visiblo/shared';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
export default function RealTimeActivityDashboardPage() {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0B2E6B]">Real-time Activity</h1>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" /> Live
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Monitor all system activities and important events as they happen.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0B2E6B] shadow-sm">
            🕒 12:45:30 PM IST
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-sm">
            Auto refresh: 5s
          </div>
          <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#0B2E6B] shadow-sm hover:bg-slate-50">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>
      </div>

      {/* 6 Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <KpiCard
          title="Active Users"
          value="128"
          subValue="Online Now"
          icon={Users}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="Active Sessions"
          value="156"
          subValue="Live Sessions"
          icon={Activity}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Page Views (Live)"
          value="342"
          subValue="Per Minute"
          icon={Eye}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Events (Today)"
          value="1,842"
          subValue="Total Events"
          icon={Zap}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Errors (Today)"
          value="3"
          subValue="Total Errors"
          icon={AlertCircle}
          iconBgColor="bg-rose-500/10"
          iconTextColor="text-rose-600"
        />
        <KpiCard
          title="System Status"
          value="Healthy"
          subValue="All Systems OK"
          icon={CheckCircle2}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-[#00C2A8]"
        />
      </div>

      {/* Middle Row: Live Visitors Map & Live Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Live Visitors Map Widget */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-7">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B2E6B]">Live Visitors on Map</h3>
            <span className="text-xs font-semibold text-[#00C2A8]">Global Traffic</span>
          </div>

          <div className="relative h-72 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-900 p-4">
            <div className="absolute inset-0 bg-[radial-gradient(#00C2A8_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            <div className="relative z-10 flex h-full flex-col justify-between text-white">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-xs font-bold text-[#00C2A8]">
                  <Globe className="h-4 w-4" /> Global Real-time Traffic
                </div>
                <div className="rounded-lg bg-white/10 p-3 text-xs backdrop-blur-md space-y-1">
                  <p className="font-bold text-[#00C2A8]">Visitors by Region</p>
                  <p>🇮🇳 India: <span className="font-bold">78</span></p>
                  <p>🇺🇸 United States: <span className="font-bold">24</span></p>
                  <p>🇦🇪 UAE: <span className="font-bold">12</span></p>
                  <p>🇬🇧 United Kingdom: <span className="font-bold">8</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Activity Feed Stream */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0B2E6B]">Live Activity Feed</h3>
            <button className="text-xs font-semibold text-[#00C2A8] hover:underline">View All</button>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { time: '12:45:28 PM', title: 'New deal created', detail: 'Rahul Verma created a new deal "VisibloAI Pro Plan"', tag: 'Deal' },
              { time: '12:45:26 PM', title: 'Payment received', detail: '₹24,999 received from Sharma Enterprises', tag: 'Payment' },
              { time: '12:45:24 PM', title: 'New lead added', detail: 'Priya Mehta added a new lead "Tech Solutions"', tag: 'Lead' },
              { time: '12:45:22 PM', title: 'User logged in', detail: 'Amit Sharma logged in from Mumbai, India', tag: 'Auth' },
              { time: '12:45:20 PM', title: 'Subscription activated', detail: 'VisibloAI Basic Plan activated for Digital Minds', tag: 'Subscription' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                <Clock className="h-4 w-4 text-[#00C2A8] flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-[#0B2E6B]">{item.title}</p>
                    <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-600">{item.detail}</p>
                </div>
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                  {item.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Active Pages, Live Users, Event Graph, System Resources */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Top Active Pages */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="mb-4 text-base font-bold text-[#0B2E6B]">Top Active Pages</h3>
          <div className="space-y-3 text-xs font-semibold text-slate-700">
            {[
              { path: '/app/dashboard', count: 48, pct: '18.7%' },
              { path: '/app/deals', count: 32, pct: '12.5%' },
              { path: '/app/customers', count: 28, pct: '10.9%' },
              { path: '/app/subscriptions', count: 22, pct: '8.6%' },
            ].map((p) => (
              <div key={p.path} className="flex justify-between items-center rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                <span className="font-mono text-[11px] text-blue-600">{p.path}</span>
                <span className="font-bold text-[#0B2E6B]">{p.count} ({p.pct})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Live Users */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-3">
          <h3 className="mb-4 text-base font-bold text-[#0B2E6B]">Live Active Users</h3>
          <div className="space-y-3 text-xs font-semibold">
            {[
              { name: 'Rahul Verma', area: 'Mumbai', page: '/app/deals' },
              { name: 'Priya Mehta', area: 'Delhi', page: '/app/customers' },
              { name: 'Sanjay Yadav', area: 'Bangalore', page: '/app/dashboard' },
              { name: 'Kavita Singh', area: 'Pune', page: '/app/reports' },
            ].map((u) => (
              <div key={u.name} className="flex justify-between items-center rounded-xl border border-slate-100 bg-slate-50/60 p-2.5">
                <div>
                  <p className="font-bold text-[#0B2E6B]">{u.name}</p>
                  <p className="text-[10px] text-slate-400">{u.area} • {u.page}</p>
                </div>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            ))}
          </div>
        </div>

        {/* System Resources */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-6">
          <h3 className="mb-4 text-base font-bold text-[#0B2E6B]">System Resources</h3>
          <div className="space-y-4 text-xs font-semibold">
            {[
              { label: 'CPU Usage', val: '28%', pct: 28, color: 'bg-emerald-500' },
              { label: 'Memory Usage', val: '46%', pct: 46, color: 'bg-blue-600' },
              { label: 'Disk Usage', val: '35%', pct: 35, color: 'bg-amber-500' },
              { label: 'Database Load', val: '22%', pct: 22, color: 'bg-purple-500' },
              { label: 'API Response Time', val: '128ms', pct: 15, color: 'bg-teal-500' },
            ].map((r) => (
              <div key={r.label} className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#0B2E6B]">{r.label}</span>
                  <span className="font-bold text-slate-700">{r.val}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
