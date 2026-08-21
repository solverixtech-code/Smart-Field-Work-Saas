import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Globe,
  Award,
  TrendingUp,
  Download,
  ChevronRight,
  Eye,
  MapPin,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

interface TerritoryRankItem {
  rank: number;
  id: string;
  territoryName: string;
  managerName: string;
  managerAvatar: string;
  region: string;
  executivesCount: number;
  target: number;
  sales: number;
  achievementPct: number;
  leads: number;
  demos: number;
  conversionsPct: number;
}

const mockTerritoryRanks: TerritoryRankItem[] = [
  { rank: 1, id: 'TERR-1', territoryName: 'West Zone', managerName: 'Rohit Sharma', managerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', region: 'Mumbai', executivesCount: 18, target: 300000, sales: 426000, achievementPct: 142, leads: 1248, demos: 256, conversionsPct: 9.2 },
  { rank: 2, id: 'TERR-2', territoryName: 'Central Zone', managerName: 'Vijay Patel', managerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', region: 'Pune', executivesCount: 16, target: 250000, sales: 320000, achievementPct: 128, leads: 1102, demos: 224, conversionsPct: 8.6 },
  { rank: 3, id: 'TERR-3', territoryName: 'North Zone', managerName: 'Priya Sharma', managerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', region: 'Delhi', executivesCount: 14, target: 200000, sales: 232000, achievementPct: 116, leads: 968, demos: 198, conversionsPct: 8.1 },
  { rank: 4, id: 'TERR-4', territoryName: 'South Zone', managerName: 'Suresh Patel', managerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', region: 'Hyderabad', executivesCount: 14, target: 180000, sales: 184000, achievementPct: 102, leads: 876, demos: 162, conversionsPct: 7.5 },
  { rank: 5, id: 'TERR-5', territoryName: 'East Zone', managerName: 'Komal Verma', managerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80', region: 'Kolkata', executivesCount: 12, target: 150000, sales: 141000, achievementPct: 94, leads: 744, demos: 142, conversionsPct: 6.9 },
  { rank: 6, id: 'TERR-6', territoryName: 'Ahmedabad Zone', managerName: 'Amit Jain', managerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', region: 'Ahmedabad', executivesCount: 10, target: 125000, sales: 112000, achievementPct: 90, leads: 632, demos: 128, conversionsPct: 6.7 },
];

export const TerritoryRankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('May 2025');

  return (
    <div className="space-y-5 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* STANDARD HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Territory Ranking</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Compare geographic territory performance, target achievement %, and conversion yield
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success('Exporting Territory Ranking Report...')}
          className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" /> Export Report
        </Button>
      </div>

      {/* TOP 5 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Territories</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">18</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 2 new this month</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Avg. Target Achievement</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">112%</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 14.6% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Sales</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">₹ 12,48,500</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 18.4% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Executives</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">126</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 8 vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Top Territory</span>
          <div className="text-xl font-extrabold text-[#0D1F3D]">West Zone</div>
          <p className="text-[11px] font-bold text-purple-700">142% of target</p>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Territory Leaderboard Table (8 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-8 space-y-3">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                  <th className="py-2.5 px-3 text-center">Rank</th>
                  <th className="py-2.5 px-3">Territory / Region</th>
                  <th className="py-2.5 px-3">Manager</th>
                  <th className="py-2.5 px-3 text-center">Execs</th>
                  <th className="py-2.5 px-3">Target (₹)</th>
                  <th className="py-2.5 px-3">Sales (₹)</th>
                  <th className="py-2.5 px-3">Achievement %</th>
                  <th className="py-2.5 px-3 text-center">Leads</th>
                  <th className="py-2.5 px-3 text-center">Demos</th>
                  <th className="py-2.5 px-3 text-center">Conversions %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockTerritoryRanks.map((terr) => (
                  <tr key={terr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center font-extrabold">
                      {terr.rank === 1 ? '🥇 1' : terr.rank === 2 ? '🥈 2' : terr.rank === 3 ? '🥉 3' : terr.rank}
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <span className="font-extrabold text-[#0D1F3D] block">{terr.territoryName}</span>
                        <span className="text-[10px] text-slate-400">{terr.region}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img src={terr.managerAvatar} alt={terr.managerName} className="h-6 w-6 rounded-full object-cover border border-slate-200" />
                        <span className="font-bold text-slate-800">{terr.managerName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">{terr.executivesCount}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-600">₹{terr.target.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono font-extrabold text-blue-700">₹{terr.sales.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
                        terr.achievementPct >= 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {terr.achievementPct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">{terr.leads}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-purple-700">{terr.demos}</td>
                    <td className="py-3 px-3 text-center font-mono font-extrabold text-teal-700">{terr.conversionsPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebars (4 Cols) */}
        <div className="space-y-4 lg:col-span-4 flex flex-col justify-between">
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Target Achievement Distribution</h3>
            <div className="flex items-center justify-between">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-8 border-emerald-500 border-r-blue-500 border-b-amber-500 border-l-rose-500">
                <span className="text-xs font-extrabold text-[#0D1F3D]">18 Zones</span>
              </div>
              <div className="space-y-1 text-xs font-semibold">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> 120% and above</span>
                  <span className="font-bold text-slate-900">5 (27.8%)</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-blue-500" /> 100% - 119%</span>
                  <span className="font-bold text-slate-900">6 (33.3%)</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-amber-500" /> 80% - 99%</span>
                  <span className="font-bold text-slate-900">4 (22.2%)</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-rose-500" /> Below 80%</span>
                  <span className="font-bold text-slate-900">3 (16.7%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Top 5 Territories by Sales (₹)</h3>
            <div className="space-y-2">
              {mockTerritoryRanks.slice(0, 5).map((terr) => (
                <div key={terr.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-[#0D1F3D]">{terr.territoryName}</span>
                    <span className="font-mono text-emerald-700">₹{terr.sales.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(terr.sales / 426000) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
