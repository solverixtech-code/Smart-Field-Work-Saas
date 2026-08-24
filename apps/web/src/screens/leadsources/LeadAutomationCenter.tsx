import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Sparkles,
  Facebook,
  Search,
  MessageSquare,
  Globe,
  Plus,
  CheckCircle2,
  Users,
  Clock,
  TrendingUp,
  Settings,
  ChevronRight,
  UserCheck,
  Zap,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { Button } from '../../components/ui/Button';

const multiChannelTrendData = [
  { day: '12 May', Meta: 110, Google: 45, WhatsApp: 32, Website: 14 },
  { day: '13 May', Meta: 125, Google: 52, WhatsApp: 36, Website: 16 },
  { day: '14 May', Meta: 142, Google: 64, WhatsApp: 40, Website: 18 },
  { day: '15 May', Meta: 138, Google: 58, WhatsApp: 42, Website: 19 },
  { day: '16 May', Meta: 130, Google: 62, WhatsApp: 38, Website: 21 },
  { day: '17 May', Meta: 152, Google: 70, WhatsApp: 45, Website: 22 },
];

export default function LeadAutomationCenter() {
  const navigate = useNavigate();
  const [isAutomationOn, setIsAutomationOn] = useState(true);

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Lead Automation</span>
          <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-xs ml-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> AI
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Lead Automation Center</h1>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Connect your lead channels and let SFW automatically capture, assign and track every lead.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-2 rounded-sm border border-slate-200 shadow-xs">
            <span className="text-xs font-extrabold text-[#0D1F3D]">Automation is {isAutomationOn ? 'ON' : 'OFF'}</span>
            <button
              type="button"
              onClick={() => {
                setIsAutomationOn(!isAutomationOn);
                toast.success(`Lead Automation turned ${!isAutomationOn ? 'ON' : 'OFF'}`);
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isAutomationOn ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isAutomationOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* CONNECTED LEAD CHANNELS ROW CARDS */}
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-[#0D1F3D]">Connected Lead Channels</h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
              4 / 4 Connected
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/leads/integrations')}
            className="bg-white text-indigo-700 border-indigo-200 font-bold hover:bg-indigo-50 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Connect New Channel
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Meta Leads */}
          <div className="rounded-sm border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-sm bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Facebook className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-[#0D1F3D] text-xs block">Meta Leads</span>
                  <span className="text-[10px] text-slate-400 font-medium">Facebook & Instagram</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected • Last lead: 2 min ago
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Leads Today</span>
                <span className="font-extrabold text-[#0D1F3D]">136</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">This Week</span>
                <span className="font-extrabold text-[#0D1F3D]">1,248</span>
              </div>
              <button
                onClick={() => navigate('/admin/leads/integrations/meta/connect')}
                className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Manage ⚙️
              </button>
            </div>
          </div>

          {/* Google Ads */}
          <div className="rounded-sm border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-sm bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-[#0D1F3D] text-xs block">Google Ads</span>
                  <span className="text-[10px] text-slate-400 font-medium">Search Lead Forms</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected • Last lead: 5 min ago
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Leads Today</span>
                <span className="font-extrabold text-[#0D1F3D]">84</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">This Week</span>
                <span className="font-extrabold text-[#0D1F3D]">723</span>
              </div>
              <button
                onClick={() => navigate('/admin/leads/integrations/google/connect')}
                className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Manage ⚙️
              </button>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="rounded-sm border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-sm bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-[#0D1F3D] text-xs block">WhatsApp</span>
                  <span className="text-[10px] text-slate-400 font-medium">WhatsApp API</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected • Last lead: 1 min ago
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Leads Today</span>
                <span className="font-extrabold text-[#0D1F3D]">57</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">This Week</span>
                <span className="font-extrabold text-[#0D1F3D]">432</span>
              </div>
              <button
                onClick={() => navigate('/admin/leads/integrations/whatsapp/connect')}
                className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Manage ⚙️
              </button>
            </div>
          </div>

          {/* Website */}
          <div className="rounded-sm border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-sm bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <span className="font-extrabold text-[#0D1F3D] text-xs block">Website</span>
                  <span className="text-[10px] text-slate-400 font-medium">SFW Web Widget</span>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Connected • Last lead: just now
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Leads Today</span>
                <span className="font-extrabold text-[#0D1F3D]">29</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">This Week</span>
                <span className="font-extrabold text-[#0D1F3D]">215</span>
              </div>
              <button
                onClick={() => navigate('/admin/leads/automation/settings')}
                className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Manage ⚙️
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-sm bg-emerald-50/70 border border-emerald-100 p-3 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>All your lead channels are connected and running smoothly. New leads are captured in real-time and auto-assigned to your team.</span>
          </div>
          <button
            onClick={() => navigate('/admin/leads/automation/settings')}
            className="text-indigo-700 font-extrabold hover:underline"
          >
            View Automation Settings →
          </button>
        </div>
      </div>

      {/* 5 OVERVIEW KPI CARDS */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Leads</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">2,618</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 24.6% vs last week</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">New Leads</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">2,306</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 22.1% vs last week</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Assigned Leads</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">2,148</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 25.3% vs last week</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Follow-up Pending</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">367</span>
            <span className="text-xs font-semibold text-amber-600 block">↑ 8.7% vs last week</span>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-teal-50 text-teal-600 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Converted Leads</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">187</span>
            <span className="text-xs font-semibold text-emerald-600 block">↑ 31.4% vs last week</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID: TREND & LEADERBOARD (8 COLS) + LIVE ACTIVITY (4 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Multi-channel Leads Trend Line Chart */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Leads Trend (All Channels)</h3>
              <select className="rounded-sm border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-bold text-[#0D1F3D]">
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <div className="h-52 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={multiChannelTrendData}>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0D1F3D',
                      borderRadius: '4px',
                      color: '#FFF',
                      fontSize: '10px',
                      fontWeight: 'bold',
                    }}
                  />
                  <Line type="monotone" dataKey="Meta" name="Meta" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="Google" name="Google Ads" stroke="#10B981" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="WhatsApp" name="WhatsApp" stroke="#8B5CF6" strokeWidth={2.5} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="Website" name="Website" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Totals Bar */}
            <div className="grid grid-cols-5 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
              <div className="bg-slate-50 p-2 rounded-sm border border-slate-200">
                <span className="text-[10px] font-medium text-slate-400 block">Total Leads</span>
                <span className="font-extrabold text-[#0D1F3D]">2,618</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-sm border border-slate-200">
                <span className="text-[10px] font-medium text-blue-600 block">Meta</span>
                <span className="font-extrabold text-[#0D1F3D]">1,248</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-sm border border-slate-200">
                <span className="text-[10px] font-medium text-emerald-600 block">Google Ads</span>
                <span className="font-extrabold text-[#0D1F3D]">723</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-sm border border-slate-200">
                <span className="text-[10px] font-medium text-purple-600 block">WhatsApp</span>
                <span className="font-extrabold text-[#0D1F3D]">432</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-sm border border-slate-200">
                <span className="text-[10px] font-medium text-amber-600 block">Website</span>
                <span className="font-extrabold text-[#0D1F3D]">215</span>
              </div>
            </div>
          </div>

          {/* Top Assigned Executives Leaderboard */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Top Assigned Executives</h3>
              <button onClick={() => navigate('/admin/performance/executives')} className="text-[11px] font-bold text-indigo-600 hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="Amit Verma" className="h-6 w-6 rounded-full object-cover" />
                  <span className="font-extrabold text-[#0D1F3D]">Amit Verma</span>
                </div>
                <div className="flex items-center gap-2 w-1/2 justify-end">
                  <div className="h-1.5 w-32 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[100%]" />
                  </div>
                  <span className="font-mono font-extrabold text-[#0D1F3D]">287 Leads</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Neha Patel" className="h-6 w-6 rounded-full object-cover" />
                  <span className="font-extrabold text-[#0D1F3D]">Neha Patel</span>
                </div>
                <div className="flex items-center gap-2 w-1/2 justify-end">
                  <div className="h-1.5 w-32 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[89%]" />
                  </div>
                  <span className="font-mono font-extrabold text-[#0D1F3D]">256 Leads</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Ravi Singh" className="h-6 w-6 rounded-full object-cover" />
                  <span className="font-extrabold text-[#0D1F3D]">Ravi Singh</span>
                </div>
                <div className="flex items-center gap-2 w-1/2 justify-end">
                  <div className="h-1.5 w-32 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full w-[80%]" />
                  </div>
                  <span className="font-mono font-extrabold text-[#0D1F3D]">231 Leads</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate('/admin/performance/executives')}
                className="bg-white text-indigo-700 border-indigo-200 font-bold hover:bg-indigo-50"
              >
                View Full Leaderboard
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Lead Activity Feed Card */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold text-[#0D1F3D]">Live Lead Activity</h3>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-700 font-bold">Live</span>
              </div>
              <button
                onClick={() => navigate('/admin/leads/automation/activity')}
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                View all live activity →
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5 p-2 rounded-sm bg-slate-50/70 border border-slate-100">
                <div className="h-7 w-7 rounded-sm bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Facebook className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0D1F3D]">New lead from Meta Lead Ads</span>
                    <span className="text-[10px] text-slate-400 font-medium">2 min ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">Rahul Verma | 98765 43210</p>
                  <span className="text-[9px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-xs mt-1 inline-block">
                    New Lead
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-sm bg-slate-50/70 border border-slate-100">
                <div className="h-7 w-7 rounded-sm bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Search className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0D1F3D]">New lead from Google Ads</span>
                    <span className="text-[10px] text-slate-400 font-medium">5 min ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">Neha Gupta | 96548 76543</p>
                  <span className="text-[9px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-xs mt-1 inline-block">
                    New Lead
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-sm bg-slate-50/70 border border-slate-100">
                <div className="h-7 w-7 rounded-sm bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-[#0D1F3D]">New WhatsApp enquiry</span>
                    <span className="text-[10px] text-slate-400 font-medium">6 min ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium">+91 77383 93938</p>
                  <span className="text-[9px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-xs mt-1 inline-block">
                    New Lead
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Automation Summary Status Card */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Automation Summary
            </h3>

            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Real-time Sync</span>
                <span className="font-extrabold text-emerald-600 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Enabled
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Auto Assignment</span>
                <span className="font-extrabold text-emerald-600 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Enabled
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Duplicate Protection</span>
                <span className="font-extrabold text-emerald-600 flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Enabled
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Working Hours</span>
                <span className="font-bold text-slate-800 text-[11px]">09:00 AM - 08:00 PM</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="font-medium">Default Assignment</span>
                <span className="font-bold text-indigo-700 text-[11px]">Smart Auto Assignment</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => navigate('/admin/leads/automation/settings')}
                className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                <Settings className="h-3.5 w-3.5" /> View Automation Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
