import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Target,
  Trophy,
  Users,
  Percent,
  Gift,
  CreditCard,
  Plus,
  Download,
  Filter,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Edit,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { mockTeamTargets, TeamTargetItem } from './targetsData';
import { SetTargetModal } from './SetTargetModal';

export default function TargetDashboardPage() {
  const navigate = useNavigate();

  // Filters State
  const [selectedMonth, setSelectedMonth] = useState('May 2025');
  const [compareMonth, setCompareMonth] = useState('April 2025');
  const [activeTab, setActiveTab] = useState<'Overview' | 'Team Performance' | 'Individual Performance' | 'Incentives Overview'>('Overview');
  const [isSetTargetModalOpen, setIsSetTargetModalOpen] = useState(false);

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & PAGE HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/targets')}>
            Targets & Incentives
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Target Dashboard</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1F3D]">Target Dashboard</h1>
            <p className="text-xs font-normal text-slate-500">
              Track targets, achievements and incentives across teams and individuals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {/* Time Period Select */}
            <div className="w-36">
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={[
                  { value: 'May 2025', label: 'May 2025' },
                  { value: 'April 2025', label: 'April 2025' },
                  { value: 'March 2025', label: 'March 2025' },
                ]}
                searchable={false}
              />
            </div>

            {/* Compare With Select */}
            <div className="w-36">
              <Select
                value={compareMonth}
                onChange={(e) => setCompareMonth(e.target.value)}
                options={[
                  { value: 'April 2025', label: 'Vs April 2025' },
                  { value: 'March 2025', label: 'Vs March 2025' },
                ]}
                searchable={false}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Filters dialog opened')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Filter className="h-3.5 w-3.5" /> Filters
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Exporting target report...')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" /> Export
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={() => setIsSetTargetModalOpen(true)}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md px-4 py-2"
            >
              <Plus className="h-4 w-4" /> Set New Target
            </Button>
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS (6 CARDS) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Target (Month)</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 8,75,000</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">▲ 18.6% vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Target className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Achieved (Month)</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 6,12,450</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">▲ 16.3% vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <Trophy className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Achievement %</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">69.9%</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">▲ 4.2% vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Executives</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">48</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">▲ 6 vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Incentive Earned</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 1,24,350</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">▲ 22.8% vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-cyan-50 text-cyan-600 border border-cyan-100 shrink-0">
            <Gift className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Incentive Paid</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 75,250</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">▲ 15.4% vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 border border-red-100 shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-0 text-xs font-bold">
        {(['Overview', 'Team Performance', 'Individual Performance', 'Incentives Overview'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => {
              setActiveTab(tab);
              if (tab === 'Team Performance') navigate('/admin/targets/teams');
              else if (tab === 'Individual Performance') navigate('/admin/targets/executives');
              else if (tab === 'Incentives Overview') navigate('/admin/incentives');
            }}
            className={`px-4 py-2.5 border-b-2 transition cursor-pointer ${
              activeTab === tab
                ? 'border-purple-600 text-purple-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 100% FULL-WIDTH MAIN DATA TABLE (VISIBLO_DESIGN_SYSTEM.md SECTION 3) */}
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">Team Target Summary</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/targets/teams')}
            className="text-xs font-bold text-slate-700"
          >
            View All Team Targets →
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700 whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-extrabold text-[#0D1F3D]">
                <th className="py-2.5 px-3">Team / Branch</th>
                <th className="py-2.5 px-3">Team Manager</th>
                <th className="py-2.5 px-3">Target (₹)</th>
                <th className="py-2.5 px-3">Achieved (₹)</th>
                <th className="py-2.5 px-3">Achievement %</th>
                <th className="py-2.5 px-3">Executives</th>
                <th className="py-2.5 px-3">Incentive (₹)</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {mockTeamTargets.map((tt) => (
                <tr key={tt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div>
                      <span className="font-extrabold text-[#0D1F3D] block">{tt.teamName}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{tt.branch}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <img src={tt.teamLeaderAvatar} alt="" className="h-6 w-6 rounded-full object-cover border border-slate-200" />
                      <div>
                        <span className="font-bold text-[#0D1F3D] block text-xs">{tt.teamLeaderName}</span>
                        <span className="text-[9px] text-slate-400 font-semibold block">Sales Manager</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-800">₹{tt.targetAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-mono text-slate-800">₹{tt.achievedAmount.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <div className="space-y-1 w-28">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-[#0D1F3D]">{tt.achievementPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            tt.achievementPct >= 70
                              ? 'bg-emerald-500'
                              : tt.achievementPct >= 55
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(tt.achievementPct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-700">{tt.executivesCount}</td>
                  <td className="py-3 px-3 font-mono text-emerald-600 font-bold">₹{tt.incentiveEarned.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                        tt.status === 'On Track'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : tt.status === 'At Risk'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}
                    >
                      {tt.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <RowActionsMenu
                      items={[
                        { label: 'View Team Targets', icon: Eye, onClick: () => navigate('/admin/targets/teams') },
                        { label: 'Edit Target Quota', icon: Edit, onClick: () => setIsSetTargetModalOpen(true) },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM ROW ANALYTICS WIDGETS (VISIBLO_DESIGN_SYSTEM.md SECTION 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {/* CARD 1: TOP ACHIEVERS LEADERBOARD */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0D1F3D]">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Top Achievers</span>
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
              This Month
            </span>
          </div>

          <div className="space-y-2 text-xs font-semibold">
            <div className="flex items-center justify-between p-2 rounded-md bg-amber-50/50 border border-amber-200/60">
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-black">
                  1
                </span>
                <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" alt="" className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block">Rahul Gupta</span>
                  <span className="text-[10px] text-slate-500 font-semibold">West Zone</span>
                </div>
              </div>
              <span className="font-black text-emerald-600 text-sm">128.5%</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-300 text-slate-700 text-[10px] font-black">
                  2
                </span>
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="" className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block">Priya Sharma</span>
                  <span className="text-[10px] text-slate-500 font-semibold">West Zone</span>
                </div>
              </div>
              <span className="font-black text-emerald-600 text-sm">112.3%</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-white text-[10px] font-black">
                  3
                </span>
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="" className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                <div>
                  <span className="font-extrabold text-[#0D1F3D] block">Vijay Patel</span>
                  <span className="text-[10px] text-slate-500 font-semibold">Central Zone</span>
                </div>
              </div>
              <span className="font-black text-emerald-600 text-sm">105.7%</span>
            </div>
          </div>
        </div>

        {/* CARD 2: ACHIEVEMENT STATUS DISTRIBUTION */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Achievement Status Distribution
          </h3>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold pt-1">
            <div className="rounded-md bg-emerald-50 p-2.5 border border-emerald-200/60">
              <span className="text-emerald-700 block text-xl font-black">12</span>
              <span className="text-[10px] text-emerald-600 font-semibold">On Track</span>
            </div>

            <div className="rounded-md bg-amber-50 p-2.5 border border-amber-200/60">
              <span className="text-amber-700 block text-xl font-black">7</span>
              <span className="text-[10px] text-amber-600 font-semibold">At Risk</span>
            </div>

            <div className="rounded-md bg-red-50 p-2.5 border border-red-200/60">
              <span className="text-red-700 block text-xl font-black">5</span>
              <span className="text-[10px] text-red-600 font-semibold">Behind</span>
            </div>
          </div>
        </div>

        {/* CARD 3: PERFORMANCE METRICS SUMMARY */}
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
            Performance Highlights
          </h3>

          <div className="space-y-2 text-xs font-semibold">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Company Target Achievement</span>
              <span className="font-extrabold text-[#0D1F3D]">69.9% <span className="text-[10px] text-emerald-600">▲ 4.2%</span></span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-600">Total Incentive Earned</span>
              <span className="font-extrabold text-[#0D1F3D]">₹ 1,24,350</span>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-2">
              <span className="text-slate-600">Disbursed Payouts</span>
              <span className="font-extrabold text-[#0D1F3D]">₹ 75,250</span>
            </div>
          </div>
        </div>
      </div>

      {/* SET NEW TARGET MODAL */}
      <SetTargetModal
        isOpen={isSetTargetModalOpen}
        onClose={() => setIsSetTargetModalOpen(false)}
      />
    </div>
  );
}
