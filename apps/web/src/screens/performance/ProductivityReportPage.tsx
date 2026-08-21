import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Zap,
  Award,
  TrendingUp,
  Download,
  ChevronRight,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ExecutiveProductivityItem {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  team: string;
  region: string;
  attendancePct: number;
  productiveHoursPerDay: string;
  leadsPerDay: number;
  demosPerDay: number;
  tasksCompleted: number;
  productivityScore: number;
}

const mockProductivityData: ExecutiveProductivityItem[] = [
  { rank: 1, id: 'EMP-1001', name: 'Rohit Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', team: 'West Zone', region: 'Mumbai', attendancePct: 96, productiveHoursPerDay: '7h 48m', leadsPerDay: 32.4, demosPerDay: 4.2, tasksCompleted: 186, productivityScore: 92.6 },
  { rank: 2, id: 'EMP-1002', name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', team: 'West Zone', region: 'Delhi', attendancePct: 94, productiveHoursPerDay: '7h 12m', leadsPerDay: 28.1, demosPerDay: 3.6, tasksCompleted: 162, productivityScore: 88.3 },
  { rank: 3, id: 'EMP-1003', name: 'Vijay Patel', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', team: 'Central Zone', region: 'Bangalore', attendancePct: 92, productiveHoursPerDay: '6h 58m', leadsPerDay: 25.7, demosPerDay: 3.2, tasksCompleted: 148, productivityScore: 83.7 },
  { rank: 4, id: 'EMP-1004', name: 'Amit Jain', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', team: 'Central Zone', region: 'Pune', attendancePct: 90, productiveHoursPerDay: '6h 35m', leadsPerDay: 23.4, demosPerDay: 2.8, tasksCompleted: 139, productivityScore: 78.9 },
  { rank: 5, id: 'EMP-1005', name: 'Neha Verma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', team: 'North Zone', region: 'Delhi', attendancePct: 89, productiveHoursPerDay: '6h 22m', leadsPerDay: 22.1, demosPerDay: 2.6, tasksCompleted: 131, productivityScore: 76.2 },
];

export const ProductivityReportPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* STANDARD HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Productivity Report</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Track activity, field time utilization, output efficiency, and composite productivity score
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success('Exporting Productivity Report...')}
          className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" /> Export Report
        </Button>
      </div>

      {/* TOP 6 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Executives</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">125</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 8 vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Working Days</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">26 / 31</div>
          <p className="text-[11px] font-bold text-emerald-600">83.9% of total days</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Working Hours</span>
          <div className="text-xl font-extrabold text-[#0D1F3D]">2,487h 32m</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 9.6% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Avg. Daily Output</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">23.6</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 11.8% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Avg. Productive Hours</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">6h 45m</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 8.3% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Productivity Score</span>
          <div className="text-2xl font-extrabold text-emerald-600">81.4 / 100</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 7.5 pts vs. Apr 2025</p>
        </div>
      </div>

      {/* 100% FULL-WIDTH PRODUCTIVITY TABLE */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs w-full space-y-3">
        <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Executive Productivity Summary</h3>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="py-2.5 px-3 text-center">Rank</th>
                <th className="py-2.5 px-3">Executive</th>
                <th className="py-2.5 px-3">Team / Region</th>
                <th className="py-2.5 px-3 text-center">Attendance %</th>
                <th className="py-2.5 px-3 text-center">Productive Hours / Day</th>
                <th className="py-2.5 px-3 text-center">Leads / Day</th>
                <th className="py-2.5 px-3 text-center">Demos / Day</th>
                <th className="py-2.5 px-3 text-center">Tasks Done</th>
                <th className="py-2.5 px-3 text-center">Productivity Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockProductivityData.map((exec) => (
                <tr key={exec.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-extrabold">
                    {exec.rank === 1 ? '🥇 1' : exec.rank === 2 ? '🥈 2' : exec.rank === 3 ? '🥉 3' : exec.rank}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img src={exec.avatar} alt={exec.name} className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                      <div>
                        <span className="font-extrabold text-[#0D1F3D] block">{exec.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{exec.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <div>
                      <span className="font-bold text-slate-800 block">{exec.team}</span>
                      <span className="text-[10px] text-slate-400">{exec.region}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">{exec.attendancePct}%</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">{exec.productiveHoursPerDay}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">{exec.leadsPerDay}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-purple-700">{exec.demosPerDay}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">{exec.tasksCompleted}</td>
                  <td className="py-3 px-3 text-center font-mono font-extrabold text-emerald-600">{exec.productivityScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM ANALYTICS WIDGETS ROW (RULE SECTION 3.2) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 pt-2">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Time Utilization</h3>
          <div className="flex items-center justify-between">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-6 border-emerald-500 border-r-blue-500 border-b-amber-500 border-l-purple-500">
              <span className="text-[11px] font-extrabold text-[#0D1F3D]">2,487h</span>
            </div>
            <div className="space-y-1.5 text-[11px] font-semibold w-full">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Productive Field Work</span>
                <span className="font-bold text-slate-900">1,482h (59.6%)</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-blue-500" /> Travel / Commute</span>
                <span className="font-bold text-slate-900">512h (20.6%)</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-amber-500" /> Meetings / Demos</span>
                <span className="font-bold text-slate-900">276h (11.1%)</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-purple-500" /> Training & Breaks</span>
                <span className="font-bold text-slate-900">215h (8.7%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-blue-200 bg-blue-50/40 p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 border-b border-blue-100 pb-1.5">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h4 className="text-xs font-extrabold text-[#0D1F3D]">Productivity AI Insights</h4>
          </div>
          <div className="space-y-1.5 text-xs">
            <p className="font-bold text-[#0D1F3D]">Productive hours increased by 8.3% compared to last month.</p>
            <p className="text-[11px] text-slate-600 font-medium">West Zone team shows highest productivity score (86.7). Overall field time efficiency reached 81.4 pts in May 2025.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
