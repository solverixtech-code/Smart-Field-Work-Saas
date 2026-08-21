import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  TrendingUp,
  DollarSign,
  Monitor,
  MapPin,
  PieChart,
  Users,
  Calendar,
  Filter,
  Download,
  Award,
  ShoppingBag,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Target,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DateRangePicker, DateRange } from '../../components/ui/DateRangePicker';

interface TeamPerformanceSummary {
  id: string;
  teamName: string;
  region: string;
  activeExec: string;
  visits: number;
  demos: number;
  sales: number;
  collections: number;
  target: number;
  achievementPct: number;
  growthVsAprPct: number;
}

const mockTeamSummaries: TeamPerformanceSummary[] = [
  { id: '1', teamName: 'West Zone - Mumbai', region: 'Mumbai', activeExec: '28 / 32', visits: 742, demos: 108, sales: 876200, collections: 645300, target: 750000, achievementPct: 117, growthVsAprPct: 28.4 },
  { id: '2', teamName: 'Central Zone - Mumbai', region: 'Mumbai', activeExec: '24 / 28', visits: 614, demos: 84, sales: 635400, collections: 482100, target: 600000, achievementPct: 106, growthVsAprPct: 16.7 },
  { id: '3', teamName: 'South Zone - Mumbai', region: 'Mumbai', activeExec: '20 / 24', visits: 508, demos: 61, sales: 512300, collections: 391200, target: 500000, achievementPct: 102, growthVsAprPct: 12.5 },
  { id: '4', teamName: 'North Zone - Delhi', region: 'Delhi', activeExec: '18 / 22', visits: 394, demos: 46, sales: 328600, collections: 246300, target: 350000, achievementPct: 94, growthVsAprPct: 8.3 },
  { id: '5', teamName: 'East Zone - Kolkata', region: 'Kolkata', activeExec: '14 / 18', visits: 260, demos: 27, sales: 124000, collections: 80400, target: 150000, achievementPct: 83, growthVsAprPct: 3.6 },
];

export const SalesPerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: '2025-05-01', endDate: '2025-05-31', label: '01 May 2025 - 31 May 2025' });
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const handleExport = () => {
    toast.success('Exporting Sales Performance Report (PDF/Excel)...');
  };

  return (
    <div className="space-y-5 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* HEADER & BREADCRUMB */}
      <div className="space-y-2 border-b border-slate-200/80 pb-3.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span>Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span>Performance</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-extrabold text-[#0D1F3D]">Sales Performance</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Sales Performance</h1>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-[#E20613] border border-red-200">
                <TrendingUp className="h-4 w-4" />
              </span>
            </div>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Track overall sales performance across teams, executives, and revenue targets
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => toast.info('Filters panel opened')}
              className="bg-[#E20613] hover:bg-[#C00410] text-white font-bold shadow-xs flex items-center gap-1.5"
            >
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end text-[11px] font-medium text-slate-500 pt-0.5">
          <span>Data as on: 31 May 2025, 11:30 AM</span>
        </div>
      </div>

      {/* TOP 6 KPI METRIC CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Sales</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#0D1F3D]">₹ 24,76,500</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
              <ArrowUpRight className="h-3 w-3" /> 22.8% vs. Apr 2025
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Collections</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#0D1F3D]">₹ 18,45,300</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
              <ArrowUpRight className="h-3 w-3" /> 18.6% vs. Apr 2025
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Demos</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber-50 text-amber-600 border border-amber-100">
              <Monitor className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#0D1F3D]">356</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
              <ArrowUpRight className="h-3 w-3" /> 14.7% vs. Apr 2025
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Visits</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#0D1F3D]">2,842</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
              <ArrowUpRight className="h-3 w-3" /> 16.3% vs. Apr 2025
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Conversion Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-teal-50 text-teal-600 border border-teal-100">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#0D1F3D]">12.53%</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
              <ArrowUpRight className="h-3 w-3" /> 2.1% vs. Apr 2025
            </div>
          </div>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Active Executives</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-rose-50 text-rose-600 border border-rose-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-xl font-extrabold text-[#0D1F3D]">128 / 156</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-0.5">
              82.1% Active Staff
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID ROW */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Sales Trend Area Line Chart */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div>
              <h3 className="text-xs font-extrabold text-[#0D1F3D]">Sales Trend</h3>
              <p className="text-[11px] font-medium text-slate-500">Daily timeline tracking Sales (₹) vs Collections (₹) vs Target (₹)</p>
            </div>
            <div className="flex items-center gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-xs text-[11px] font-bold capitalize transition cursor-pointer ${
                    timeframe === tf
                      ? 'bg-[#0D1F3D] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-end gap-5 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Total Sales (₹)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Total Collections (₹)
              </span>
              <span className="flex items-center gap-1.5 text-purple-600">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> Target (₹)
              </span>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="h-56 w-full relative pt-2">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 500 160">
                {/* Gridlines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" />

                {/* Target Line */}
                <path d="M0,50 Q125,45 250,55 T500,40" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="3 3" />

                {/* Sales Line & Area */}
                <path d="M0,80 Q125,30 250,60 T500,25" fill="none" stroke="#2563eb" strokeWidth="3" />
                <circle cx="125" cy="30" r="4" fill="#2563eb" />
                <circle cx="250" cy="60" r="4" fill="#2563eb" />
                <circle cx="375" cy="35" r="4" fill="#2563eb" />
                <circle cx="500" cy="25" r="4" fill="#2563eb" />

                {/* Collections Line */}
                <path d="M0,120 Q125,90 250,110 T500,85" fill="none" stroke="#10b981" strokeWidth="2.5" />
                <circle cx="125" cy="90" r="3.5" fill="#10b981" />
                <circle cx="250" cy="110" r="3.5" fill="#10b981" />
                <circle cx="375" cy="95" r="3.5" fill="#10b981" />
                <circle cx="500" cy="85" r="3.5" fill="#10b981" />
              </svg>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 pt-2">
                <span>01 May</span>
                <span>06 May</span>
                <span>11 May</span>
                <span>16 May</span>
                <span>21 May</span>
                <span>26 May</span>
                <span>31 May</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Stack: Sales by Team & Funnel */}
        <div className="space-y-4 lg:col-span-4 flex flex-col justify-between">
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Sales by Team</h3>
            <div className="flex items-center justify-between">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border-8 border-blue-600 border-r-emerald-500 border-b-amber-500 border-l-purple-500">
                <div className="text-center">
                  <span className="text-xs font-extrabold text-[#0D1F3D] block">₹24.76L</span>
                  <span className="text-[9px] text-slate-400 font-bold">Total Sales</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs font-semibold">
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full bg-blue-600" /> West Zone</span>
                  <span className="font-mono font-bold text-[#0D1F3D]">₹ 8.76L (35.4%)</span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Central Zone</span>
                  <span className="font-mono font-bold text-[#0D1F3D]">₹ 6.35L (25.7%)</span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full bg-amber-500" /> South Zone</span>
                  <span className="font-mono font-bold text-[#0D1F3D]">₹ 5.12L (20.7%)</span>
                </div>
                <div className="flex items-center gap-2 justify-between">
                  <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full bg-purple-500" /> North Zone</span>
                  <span className="font-mono font-bold text-[#0D1F3D]">₹ 3.28L (13.3%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Funnel Breakdown Widget */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Sales Funnel</h3>
            <div className="space-y-2 text-xs font-semibold">
              {[
                { stage: 'Total Leads', count: 3950, pct: '100%', color: 'bg-blue-600' },
                { stage: 'Contacted', count: 2842, pct: '71.9%', color: 'bg-teal-500' },
                { stage: 'Interested', count: 1024, pct: '36.1%', color: 'bg-amber-500' },
                { stage: 'Demo Done', count: 356, pct: '12.5%', color: 'bg-purple-600' },
                { stage: 'Proposal Sent', count: 198, pct: '7.0%', color: 'bg-rose-500' },
                { stage: 'Closed Won', count: 156, pct: '5.5%', color: 'bg-emerald-600' },
              ].map((item) => (
                <div key={item.stage} className="flex items-center justify-between p-1.5 rounded-xs bg-slate-50 border border-slate-200/60">
                  <span className="text-slate-700 flex items-center gap-1.5">
                    <span className={`h-2 w-2 rounded-full ${item.color}`} /> {item.stage}
                  </span>
                  <span className="font-mono font-bold text-[#0D1F3D]">{item.count.toLocaleString('en-IN')} <span className="text-slate-400 font-normal">({item.pct})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 100% FULL-WIDTH MAIN DATA TABLE */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Team Performance Overview</h3>
            <p className="text-[11px] font-medium text-slate-500">Comprehensive team performance metrics, achievement %, and month-on-month growth</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/performance/teams')}
            className="text-xs font-bold text-slate-700 bg-white border-slate-200 hover:bg-slate-50 shadow-xs"
          >
            View Team Rankings →
          </Button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap text-xs font-semibold">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                <th className="py-2.5 px-3">Team / Branch</th>
                <th className="py-2.5 px-3">Active Exec</th>
                <th className="py-2.5 px-3">Visits</th>
                <th className="py-2.5 px-3">Demos</th>
                <th className="py-2.5 px-3">Sales (₹)</th>
                <th className="py-2.5 px-3">Collections (₹)</th>
                <th className="py-2.5 px-3">Target (₹)</th>
                <th className="py-2.5 px-3">Achievement %</th>
                <th className="py-2.5 px-3">Growth (vs Apr)</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockTeamSummaries.map((team) => (
                <tr key={team.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-[#0D1F3D] block">{team.teamName}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">{team.activeExec}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-700">{team.visits}</td>
                  <td className="py-3 px-3 font-mono font-bold text-purple-700">{team.demos}</td>
                  <td className="py-3 px-3 font-mono font-extrabold text-[#0D1F3D]">₹{team.sales.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-700">₹{team.collections.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-600">₹{team.target.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-extrabold text-xs ${team.achievementPct >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {team.achievementPct}%
                      </span>
                      <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${team.achievementPct >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(team.achievementPct, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-600">
                    +{team.growthVsAprPct}%
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => navigate(`/admin/performance/teams`)}
                      className="p-1 text-slate-400 hover:text-slate-800 transition cursor-pointer"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI KEY INSIGHTS BANNER */}
      <div className="rounded-sm border border-blue-200 bg-blue-50/40 p-4 shadow-xs space-y-3">
        <div className="flex items-center gap-2 border-b border-blue-100 pb-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <h4 className="text-xs font-extrabold text-[#0D1F3D]">Automated AI Key Insights</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-semibold">
          <div className="rounded-sm bg-white p-3 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Best Conversion Rate</span>
            <p className="font-extrabold text-[#0D1F3D]">West Zone (14.5%)</p>
            <p className="text-[11px] text-emerald-600 font-bold">↑ 2.8% vs Apr</p>
          </div>
          <div className="rounded-sm bg-white p-3 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Highest Avg Order Value</span>
            <p className="font-extrabold text-[#0D1F3D]">Rahul Gupta (₹ 15,420)</p>
            <p className="text-[11px] text-emerald-600 font-bold">↑ 10.2% vs Apr</p>
          </div>
          <div className="rounded-sm bg-white p-3 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Most Productive Executive</span>
            <p className="font-extrabold text-[#0D1F3D]">Rahul Gupta (28.6 Visits/Day)</p>
            <p className="text-[11px] text-emerald-600 font-bold">↑ 12.4% vs Apr</p>
          </div>
          <div className="rounded-sm bg-white p-3 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Top Collection Efficiency</span>
            <p className="font-extrabold text-[#0D1F3D]">Priya Sharma (92.5%)</p>
            <p className="text-[11px] text-emerald-600 font-bold">↑ 5.6% vs Apr</p>
          </div>
        </div>
      </div>
    </div>
  );
};
