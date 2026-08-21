import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  Award,
  TrendingUp,
  Download,
  ChevronRight,
  Eye,
  Building2,
  DollarSign,
  Monitor,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

interface TeamRankItem {
  rank: number;
  id: string;
  teamName: string;
  managerName: string;
  managerAvatar: string;
  region: string;
  membersCount: number;
  target: number;
  achieved: number;
  achievementPct: number;
  sales: number;
  collections: number;
}

const mockTeamRanks: TeamRankItem[] = [
  { rank: 1, id: 'TEAM-1', teamName: 'West Zone Team', managerName: 'Rohit Sharma', managerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', region: 'Mumbai', membersCount: 8, target: 300000, achieved: 426000, achievementPct: 142, sales: 452300, collections: 385000 },
  { rank: 2, id: 'TEAM-2', teamName: 'Central Zone Team', managerName: 'Vijay Patel', managerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', region: 'Bangalore', membersCount: 7, target: 250000, achieved: 320000, achievementPct: 128, sales: 345600, collections: 290000 },
  { rank: 3, id: 'TEAM-3', teamName: 'North Zone Team', managerName: 'Priya Sharma', managerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', region: 'Delhi', membersCount: 6, target: 200000, achieved: 232000, achievementPct: 116, sales: 254300, collections: 210000 },
  { rank: 4, id: 'TEAM-4', teamName: 'South Zone Team', managerName: 'Imran Shaikh', managerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80', region: 'Hyderabad', membersCount: 6, target: 180000, achieved: 184000, achievementPct: 102, sales: 205600, collections: 165000 },
  { rank: 5, id: 'TEAM-5', teamName: 'East Zone Team', managerName: 'Komal Verma', managerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80', region: 'Kolkata', membersCount: 5, target: 175000, achieved: 180500, achievementPct: 103, sales: 195300, collections: 160000 },
  { rank: 6, id: 'TEAM-6', teamName: 'Pune Zone Team', managerName: 'Amit Jain', managerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', region: 'Pune', membersCount: 5, target: 150000, achieved: 141000, achievementPct: 94, sales: 162800, collections: 130000 },
];

export const TeamRankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('May 2025');
  const [activeTab, setActiveTab] = useState('Overall Ranking');

  return (
    <div className="space-y-5 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* STANDARD HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Team Ranking</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Compare sales performance, collection efficiency, and revenue target achievement across teams
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success('Exporting Team Ranking Report...')}
          className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" /> Export Report
        </Button>
      </div>

      {/* TOP 5 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Teams</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">12</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 2 new this month</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Sales (₹)</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">₹ 12,48,500</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 18.4% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Target Achievement</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">124%</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 16.0% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Leads Generated</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">1,840</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 14.2% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Demos Conducted</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">268</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 11.6% vs. Apr 2025</p>
        </div>
      </div>

      {/* UNIFIED SUB-TABS */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none pb-0">
        {['Overall Ranking', 'Sales', 'Target Achievement', 'Collections', 'Demos', 'Leads', 'Growth Trend'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 border-b-2 font-extrabold transition-all whitespace-nowrap cursor-pointer text-xs ${
              activeTab === tab
                ? 'border-purple-600 text-purple-700 bg-transparent'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 100% FULL-WIDTH TEAM LEADERBOARD TABLE */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs w-full space-y-3">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="py-2.5 px-3 text-center">Rank</th>
                <th className="py-2.5 px-3">Team / Manager</th>
                <th className="py-2.5 px-3">Region</th>
                <th className="py-2.5 px-3 text-center">Members</th>
                <th className="py-2.5 px-3">Target (₹)</th>
                <th className="py-2.5 px-3">Achieved (₹)</th>
                <th className="py-2.5 px-3">Achievement %</th>
                <th className="py-2.5 px-3">Sales (₹)</th>
                <th className="py-2.5 px-3">Collections (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockTeamRanks.map((team) => (
                <tr key={team.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-extrabold">
                    {team.rank === 1 ? '🥇 1' : team.rank === 2 ? '🥈 2' : team.rank === 3 ? '🥉 3' : team.rank}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <img src={team.managerAvatar} alt={team.managerName} className="h-7 w-7 rounded-full object-cover border border-slate-200" />
                      <div>
                        <span className="font-extrabold text-[#0D1F3D] block">{team.teamName}</span>
                        <span className="text-[10px] text-slate-400">Lead: {team.managerName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-bold">{team.region}</td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">{team.membersCount}</td>
                  <td className="py-3 px-3 font-mono font-semibold text-slate-600">₹{team.target.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">₹{team.achieved.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
                      team.achievementPct >= 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {team.achievementPct}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-extrabold text-blue-700">₹{team.sales.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700">₹{team.collections.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM ANALYTICS WIDGETS ROW (RULE SECTION 3.2) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Team Performance Overview</h3>
          <div className="flex items-center gap-3">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-6 border-emerald-500 border-r-blue-500 border-b-amber-500 border-l-rose-500">
              <span className="text-[11px] font-extrabold text-[#0D1F3D]">12 Teams</span>
            </div>
            <div className="space-y-1 text-[11px] font-semibold w-full">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Excellent (120%+)</span>
                <span className="font-bold text-slate-900">3 (25%)</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-blue-500" /> Good (100–120%)</span>
                <span className="font-bold text-slate-900">5 (42%)</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-amber-500" /> Average (80–100%)</span>
                <span className="font-bold text-slate-900">3 (25%)</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-rose-500" /> Below 80%</span>
                <span className="font-bold text-slate-900">1 (8%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Top 5 Teams by Sales (₹)</h3>
          <div className="space-y-2">
            {mockTeamRanks.slice(0, 5).map((team) => (
              <div key={team.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-[#0D1F3D]">{team.teamName}</span>
                  <span className="font-mono text-emerald-700">₹{team.sales.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(team.sales / 452300) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-purple-200 bg-purple-50/40 p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 border-b border-purple-100 pb-1.5">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <h4 className="text-xs font-extrabold text-[#0D1F3D]">Team Insights</h4>
          </div>
          <div className="space-y-1.5 text-xs">
            <p className="font-bold text-[#0D1F3D]">West Zone Team leads with 128% Target Achievement</p>
            <p className="text-[11px] text-slate-600 font-medium">Top 3 teams contributed 67% of total revenue in May 2025.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
