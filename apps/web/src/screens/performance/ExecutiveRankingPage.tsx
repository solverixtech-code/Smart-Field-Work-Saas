import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Award,
  TrendingUp,
  Search,
  Filter,
  Download,
  RotateCcw,
  UserCheck,
  DollarSign,
  Monitor,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DateRangePicker } from '../../components/ui/DateRangePicker';

interface ExecutiveRankItem {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  team: string;
  region: string;
  target: number;
  achieved: number;
  achievementPct: number;
  sales: number;
  collections: number;
  demos: number;
  score: number;
  trend: 'up' | 'down' | 'flat';
}

const mockExecutiveRanks: ExecutiveRankItem[] = [
  { rank: 1, id: 'EMP-1001', name: 'Rohit Sharma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', team: 'West Zone Team', region: 'Mumbai', target: 300000, achieved: 426000, achievementPct: 142, sales: 452300, collections: 385000, demos: 28, score: 952, trend: 'up' },
  { rank: 2, id: 'EMP-1002', name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', team: 'West Zone Team', region: 'Delhi', target: 250000, achieved: 320000, achievementPct: 128, sales: 345600, collections: 290000, demos: 24, score: 886, trend: 'up' },
  { rank: 3, id: 'EMP-1003', name: 'Vijay Patel', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', team: 'Central Zone Team', region: 'Bangalore', target: 200000, achieved: 232000, achievementPct: 116, sales: 254300, collections: 210000, demos: 21, score: 812, trend: 'up' },
  { rank: 4, id: 'EMP-1004', name: 'Amit Jain', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', team: 'Central Zone Team', region: 'Pune', target: 180000, achieved: 184000, achievementPct: 102, sales: 205600, collections: 165000, demos: 18, score: 748, trend: 'flat' },
  { rank: 5, id: 'EMP-1005', name: 'Neha Verma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', team: 'North Zone Team', region: 'Delhi', target: 175000, achieved: 180500, achievementPct: 103, sales: 195300, collections: 160000, demos: 17, score: 721, trend: 'up' },
  { rank: 6, id: 'EMP-1006', name: 'Suresh Patel', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80', team: 'South Zone Team', region: 'Hyderabad', target: 150000, achieved: 141000, achievementPct: 94, sales: 162800, collections: 130000, demos: 16, score: 642, trend: 'down' },
  { rank: 7, id: 'EMP-1007', name: 'Imran Shaikh', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80', team: 'South Zone Team', region: 'Mumbai', target: 150000, achieved: 128000, achievementPct: 85, sales: 140500, collections: 115000, demos: 14, score: 591, trend: 'down' },
  { rank: 8, id: 'EMP-1008', name: 'Komal Verma', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80', team: 'East Zone Team', region: 'Kolkata', target: 125000, achieved: 112000, achievementPct: 90, sales: 128900, collections: 105000, demos: 12, score: 538, trend: 'down' },
];

export const ExecutiveRankingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('May 2025');
  const [selectedTeam, setSelectedTeam] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [activeTab, setActiveTab] = useState<
    'Overall Ranking' | 'Target Achievement' | 'Sales Achieved' | 'Collection Achieved' | 'Demos Conducted'
  >('Overall Ranking');

  const filteredExecutives = useMemo(() => {
    let list = mockExecutiveRanks.filter((exec) => {
      const matchesSearch = exec.name.toLowerCase().includes(searchQuery.toLowerCase()) || exec.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = selectedTeam === 'All' || exec.team === selectedTeam;
      const matchesRegion = selectedRegion === 'All' || exec.region === selectedRegion;
      return matchesSearch && matchesTeam && matchesRegion;
    });

    list = [...list].sort((a, b) => {
      if (activeTab === 'Target Achievement') return b.achievementPct - a.achievementPct;
      if (activeTab === 'Sales Achieved') return b.sales - a.sales;
      if (activeTab === 'Collection Achieved') return b.collections - a.collections;
      if (activeTab === 'Demos Conducted') return b.demos - a.demos;
      return b.score - a.score;
    });

    return list.map((exec, idx) => ({
      ...exec,
      dynamicRank: idx + 1,
    }));
  }, [searchQuery, selectedTeam, selectedRegion, activeTab]);

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    toast.info(`Leaderboard sorted by ${tab}`);
  };

  return (
    <div className="space-y-5 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* STANDARD HEADER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Executive Ranking</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Rank field executives based on weighted performance score and target achievement
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success('Exporting Executive Ranking Report...')}
          className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" /> Export Report
        </Button>
      </div>

      {/* TOP 5 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Executives</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">25</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 2 new this month</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Avg. Target Achievement</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">112%</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 12% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Sales</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">₹ 12,48,500</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 18.4% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Top Performer</span>
          <div className="text-xl font-extrabold text-[#0D1F3D]">Rohit Sharma</div>
          <p className="text-[11px] font-bold text-purple-700">142% of Target</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Target Achieved</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">18 Executives</div>
          <p className="text-[11px] font-bold text-emerald-600">72% of total staff</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-sm border border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-36">
            <Select
              label="Select Period"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              options={[
                { value: 'May 2025', label: 'May 2025' },
                { value: 'April 2025', label: 'April 2025' },
                { value: 'Q2 2025', label: 'Q2 2025' },
              ]}
              searchable={false}
            />
          </div>
          <div className="w-44">
            <Select
              label="Teams"
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              options={[
                { value: 'All', label: 'All Teams' },
                { value: 'West Zone Team', label: 'West Zone Team' },
                { value: 'Central Zone Team', label: 'Central Zone Team' },
                { value: 'North Zone Team', label: 'North Zone Team' },
                { value: 'South Zone Team', label: 'South Zone Team' },
              ]}
              searchable={false}
            />
          </div>
          <div className="relative w-64 pt-5">
            <Search className="absolute left-3 top-8 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search executive name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-sm border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] focus:border-[#0D1F3D] focus:outline-none"
            />
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => { setSearchQuery(''); setSelectedTeam('All'); }}
          className="mt-5 text-slate-600 border-slate-200 font-bold hover:bg-slate-100"
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      {/* UNIFIED SUB-TABS */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none pb-0">
        {(['Overall Ranking', 'Target Achievement', 'Sales Achieved', 'Collection Achieved', 'Demos Conducted'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
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

      {/* 100% FULL-WIDTH LEADERBOARD TABLE */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs w-full space-y-3">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="py-2.5 px-3 text-center">Rank</th>
                <th className="py-2.5 px-3">Executive</th>
                <th className="py-2.5 px-3">Team / Region</th>
                <th className="py-2.5 px-3">Target (₹)</th>
                <th className="py-2.5 px-3">Achieved (₹)</th>
                <th className={`py-2.5 px-3 ${activeTab === 'Target Achievement' ? 'bg-purple-100/80 text-purple-900 font-extrabold' : ''}`}>Achievement %</th>
                <th className={`py-2.5 px-3 ${activeTab === 'Sales Achieved' ? 'bg-purple-100/80 text-purple-900 font-extrabold' : ''}`}>Sales (₹)</th>
                <th className={`py-2.5 px-3 ${activeTab === 'Collection Achieved' ? 'bg-purple-100/80 text-purple-900 font-extrabold' : ''}`}>Collections (₹)</th>
                <th className={`py-2.5 px-3 text-center ${activeTab === 'Demos Conducted' ? 'bg-purple-100/80 text-purple-900 font-extrabold' : ''}`}>Demos</th>
                <th className={`py-2.5 px-3 text-center ${activeTab === 'Overall Ranking' ? 'bg-purple-100/80 text-purple-900 font-extrabold' : ''}`}>Score</th>
                <th className="py-2.5 px-3 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExecutives.map((exec) => (
                <tr key={exec.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-extrabold">
                    {exec.dynamicRank === 1 ? '🥇 1' : exec.dynamicRank === 2 ? '🥈 2' : exec.dynamicRank === 3 ? '🥉 3' : exec.dynamicRank}
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
                  <td className="py-3 px-3 font-mono font-semibold text-slate-600">₹{exec.target.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">₹{exec.achieved.toLocaleString('en-IN')}</td>
                  <td className={`py-3 px-3 ${activeTab === 'Target Achievement' ? 'bg-purple-50/70 font-extrabold' : ''}`}>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
                      exec.achievementPct >= 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {exec.achievementPct}%
                    </span>
                  </td>
                  <td className={`py-3 px-3 font-mono font-extrabold text-blue-700 ${activeTab === 'Sales Achieved' ? 'bg-purple-50/70 font-extrabold' : ''}`}>
                    ₹{exec.sales.toLocaleString('en-IN')}
                  </td>
                  <td className={`py-3 px-3 font-mono font-bold text-emerald-700 ${activeTab === 'Collection Achieved' ? 'bg-purple-50/70 font-extrabold' : ''}`}>
                    ₹{exec.collections.toLocaleString('en-IN')}
                  </td>
                  <td className={`py-3 px-3 text-center font-mono font-bold text-purple-700 ${activeTab === 'Demos Conducted' ? 'bg-purple-50/70 font-extrabold' : ''}`}>
                    {exec.demos}
                  </td>
                  <td className={`py-3 px-3 text-center font-mono font-extrabold text-emerald-600 ${activeTab === 'Overall Ranking' ? 'bg-purple-50/70 font-extrabold' : ''}`}>
                    {exec.score}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {exec.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-emerald-600 inline" />
                    ) : exec.trend === 'down' ? (
                      <ArrowDownRight className="h-4 w-4 text-rose-600 inline" />
                    ) : (
                      <Minus className="h-4 w-4 text-slate-400 inline" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOTTOM ANALYTICS WIDGETS ROW (RULE SECTION 3.2) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Achievement Distribution</h3>
          <div className="flex items-center gap-3">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-6 border-emerald-500 border-r-blue-500 border-b-amber-500 border-l-rose-500">
              <span className="text-[11px] font-extrabold text-[#0D1F3D]">25 Staff</span>
            </div>
            <div className="space-y-1 text-[11px] font-semibold w-full">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> ≥ 120%</span>
                <span className="font-bold text-slate-900">8 (32%)</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-blue-500" /> 100–119%</span>
                <span className="font-bold text-slate-900">10 (40%)</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-amber-500" /> 80–99%</span>
                <span className="font-bold text-slate-900">5 (20%)</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-slate-700"><span className="h-2 w-2 rounded-full bg-rose-500" /> &lt; 80%</span>
                <span className="font-bold text-slate-900">2 (8%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Top 5 by Sales (₹)</h3>
          <div className="space-y-2">
            {mockExecutiveRanks.slice(0, 5).map((exec) => (
              <div key={exec.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold">
                  <span className="text-[#0D1F3D]">{exec.name}</span>
                  <span className="font-mono text-emerald-700">₹{exec.sales.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(exec.sales / 452300) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-blue-200 bg-blue-50/40 p-4 shadow-xs space-y-2">
          <div className="flex items-center gap-2 border-b border-blue-100 pb-1.5">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h4 className="text-xs font-extrabold text-[#0D1F3D]">Leaderboard Insights</h4>
          </div>
          <div className="space-y-1.5 text-xs">
            <p className="font-bold text-[#0D1F3D]">Rohit Sharma ranks #1 with 142% Target Achievement</p>
            <p className="text-[11px] text-slate-600 font-medium">72% of total staff achieved or exceeded monthly quotas in May 2025.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
