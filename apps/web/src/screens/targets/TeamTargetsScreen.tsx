import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Target,
  Trophy,
  Users,
  Percent,
  DollarSign,
  Gift,
  CreditCard,
  Plus,
  Download,
  Filter,
  MoreVertical,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { mockTeamTargets, TeamTargetItem } from './targetsData';
import { SetTargetModal } from './SetTargetModal';

export default function TeamTargetsScreen() {
  const navigate = useNavigate();

  // Filters State
  const [selectedMonth, setSelectedMonth] = useState('May 2025');
  const [isSetTargetModalOpen, setIsSetTargetModalOpen] = useState(false);

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER BAR */}
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
          <span className="text-[#0D1F3D] font-bold">Team Targets</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1F3D]">Team Targets</h1>
            <p className="text-xs font-normal text-slate-500">
              Track team-wise targets, achievements and performance across branches.
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

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Exporting team targets report...')}
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
              <Plus className="h-4 w-4" /> Create Team Target
            </Button>
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS (6 CARDS) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Teams</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">24</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">▲ 2 vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">On Track</span>
            <span className="text-xl font-extrabold text-emerald-600">12 (50.0%)</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">▲ 3 vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">At Risk</span>
            <span className="text-xl font-extrabold text-amber-600">7 (29.2%)</span>
            <span className="text-xs font-semibold text-red-600 block mt-0.5">▼ 1 vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Behind</span>
            <span className="text-xl font-extrabold text-red-600">5 (20.8%)</span>
            <span className="text-xs font-semibold text-red-600 block mt-0.5">▼ 2 vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-red-50 text-red-600 border border-red-100 shrink-0">
            <XCircle className="h-5 w-5" />
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
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN: TEAM TARGETS OVERVIEW TABLE (8 COLS) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Team Targets Overview</h3>
              <span className="text-xs font-semibold text-slate-500">Showing 1 to {mockTeamTargets.length} of 24 teams</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold text-slate-700">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-extrabold text-[#0D1F3D]">
                    <th className="py-2.5 px-3">Team / Branch</th>
                    <th className="py-2.5 px-3">Team Manager</th>
                    <th className="py-2.5 px-3">Target (₹)</th>
                    <th className="py-2.5 px-3">Achieved (₹)</th>
                    <th className="py-2.5 px-3">Achievement %</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Executives</th>
                    <th className="py-2.5 px-3">Incentive (₹)</th>
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
                        <div className="space-y-1 w-24">
                          <span className="font-extrabold text-[#0D1F3D] text-[11px]">{tt.achievementPct}%</span>
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
                      <td className="py-3 px-3 font-bold text-slate-700">{tt.executivesCount}</td>
                      <td className="py-3 px-3 font-mono text-emerald-600 font-bold">₹{tt.incentiveEarned.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-center">
                        <RowActionsMenu
                          items={[
                            { label: 'Edit Team Target', onClick: () => setIsSetTargetModalOpen(true) },
                            { label: 'View Team Members', onClick: () => navigate('/admin/targets/executives') },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: WIDGETS & LEADERBOARD (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          {/* TOP PERFORMING TEAMS LEADERBOARD */}
          <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0D1F3D]">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Top Performing Teams</span>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                This Month
              </span>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between p-2 rounded-md bg-emerald-50/50 border border-emerald-200/60">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#0D1F3D]">1. West Zone</span>
                  <span className="text-[10px] text-slate-400 font-semibold">(Mumbai)</span>
                </div>
                <span className="font-black text-emerald-600">75.0%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#0D1F3D]">2. Central Zone</span>
                  <span className="text-[10px] text-slate-400 font-semibold">(Mumbai)</span>
                </div>
                <span className="font-black text-amber-600">66.2%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#0D1F3D]">3. South Zone</span>
                  <span className="text-[10px] text-slate-400 font-semibold">(Bangalore)</span>
                </div>
                <span className="font-black text-amber-600">61.7%</span>
              </div>
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
