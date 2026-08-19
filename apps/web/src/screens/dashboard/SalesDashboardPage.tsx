import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  DollarSign,
  Briefcase,
  TrendingUp,
  Award,
  Download,
  Target,
  ArrowUpRight,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { KpiCard } from '../../components/dashboard/KpiCard';
import { DateRangePicker } from '../../components/ui/DateRangePicker';
import { Button } from '../../components/ui/Button';

const salesTrendComparisonData = [
  { date: 'May 12', thisWeek: 42, lastWeek: 28 },
  { date: 'May 13', thisWeek: 60, lastWeek: 38 },
  { date: 'May 14', thisWeek: 58, lastWeek: 38 },
  { date: 'May 15', thisWeek: 68, lastWeek: 44 },
  { date: 'May 16', thisWeek: 62, lastWeek: 41 },
  { date: 'May 17', thisWeek: 40, lastWeek: 25 },
  { date: 'May 18', thisWeek: 66, lastWeek: 40 },
];

const salesBySourceData = [
  { name: 'Website', pct: '32.1%', count: 219, value: 219, color: '#2563EB' },
  { name: 'Referral', pct: '24.3%', count: 166, value: 166, color: '#10B981' },
  { name: 'Walk-In', pct: '18.5%', count: 126, value: 126, color: '#E20613' },
  { name: 'Meta Ads', pct: '12.6%', count: 86, value: 86, color: '#F59E0B' },
  { name: 'Google Ads', pct: '7.3%', count: 50, value: 50, color: '#8B5CF6' },
  { name: 'Others', pct: '5.2%', count: 35, value: 35, color: '#64748B' },
];

const teamPerformanceData = [
  { team: 'Central Mumbai', leader: 'Amit Verma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', target: '₹8,00,000', achieved: '₹6,85,400', pct: 85.7, deals: 42, conversion: '19.6%' },
  { team: 'Western Suburbs', leader: 'Neha Singh', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', target: '₹7,00,000', achieved: '₹5,95,200', pct: 85.0, deals: 32, conversion: '17.4%' },
  { team: 'Navi Mumbai', leader: 'Vikram Patil', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', target: '₹6,00,000', achieved: '₹4,75,300', pct: 79.2, deals: 26, conversion: '16.8%' },
  { team: 'Thane & Beyond', leader: 'Prakash Yadav', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', target: '₹5,00,000', achieved: '₹3,74,100', pct: 74.8, deals: 18, conversion: '15.2%' },
];

const topSalesExecs = [
  { name: 'Amit Verma', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80', sales: '₹5,24,000', deals: 28, conversion: '21.7%' },
  { name: 'Neha Singh', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80', sales: '₹4,85,600', deals: 25, conversion: '20.5%' },
  { name: 'Vikram Patil', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80', sales: '₹4,21,300', deals: 22, conversion: '18.9%' },
  { name: 'Prakash Yadav', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80', sales: '₹3,68,200', deals: 20, conversion: '17.1%' },
  { name: 'Anita Kumari', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80', sales: '₹2,86,500', deals: 16, conversion: '16.3%' },
];

export default function SalesDashboardPage() {
  const [selectedTeam, setSelectedTeam] = useState('All Teams');

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">Sales Dashboard</h1>
          <p className="text-xs font-normal text-slate-600 mt-0.5">
            Track your sales performance and team activities in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker />

          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#0D1F3D]"
          >
            <option>All Teams</option>
            <option>Central Mumbai</option>
            <option>Western Suburbs</option>
            <option>Navi Mumbai</option>
          </select>

          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.success('Exporting Sales Report...')}
            className="flex items-center gap-2 font-semibold shadow-xs"
          >
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>
      </div>

      {/* 6 TOP KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          title="Total Sales"
          value="₹24,85,600"
          change="+18.6%"
          changeType="positive"
          timeframe="vs last week"
          icon={DollarSign}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-700"
        />
        <KpiCard
          title="Sales Target"
          value="₹30,00,000"
          subValue="82.9% Achieved"
          icon={Target}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-700"
        />
        <KpiCard
          title="Deals Closed"
          value="128 Deals"
          change="+15.2%"
          changeType="positive"
          timeframe="vs last week"
          icon={Briefcase}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-700"
        />
        <KpiCard
          title="Conversion Rate"
          value="18.6%"
          change="+2.4%"
          changeType="positive"
          timeframe="vs last week"
          icon={Award}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-700"
        />
        <KpiCard
          title="Avg. Deal Value"
          value="₹1,94,200"
          change="+10.7%"
          changeType="positive"
          timeframe="vs last week"
          icon={TrendingUp}
          iconBgColor="bg-red-50"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Sales Activities"
          value="542"
          change="+12.3%"
          changeType="positive"
          timeframe="vs last week"
          icon={Activity}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-700"
        />
      </div>

      {/* MIDDLE SECTION: Sales Trend + Sales by Stage Funnel + Sales by Source */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Sales Trend Line Chart (5 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0D1F3D]">Sales Trend</h3>
            <select className="rounded-sm border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#0D1F3D]">
              <option>This Week</option>
            </select>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-blue-600"><span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> This Week</span>
            <span className="flex items-center gap-1.5 text-slate-500"><span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Last Week</span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesTrendComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  position={{ y: -15 }}
                  wrapperStyle={{ zIndex: 100 }}
                  contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                  labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                  itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="thisWeek" name="This Week" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="lastWeek" name="Last Week" stroke="#94A3B8" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Stage Funnel Diagram (4 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4 space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-[#0D1F3D]">Sales by Stage</h3>

          <div className="space-y-2 pt-1 text-xs">
            {[
              { stage: 'New Lead (536)', deals: '236', val: '₹8,45,000', color: 'bg-blue-600' },
              { stage: 'Qualified (354)', deals: '156', val: '₹6,25,400', color: 'bg-emerald-600' },
              { stage: 'Proposal (198)', deals: '98', val: '₹4,85,600', color: 'bg-amber-500' },
              { stage: 'Negotiation (112)', deals: '64', val: '₹3,25,800', color: 'bg-purple-600' },
              { stage: 'Won (128)', deals: '128', val: '₹24,85,600', color: 'bg-red-600' },
            ].map((f) => (
              <div key={f.stage} className="flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50 p-2.5 font-semibold text-slate-800">
                <span className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${f.color}`} />
                  {f.stage}
                </span>
                <span className="text-slate-500 font-medium">{f.deals} deals</span>
                <span className="font-bold text-[#0D1F3D]">{f.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Source Donut Chart (3 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0D1F3D]">Sales by Source</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
          </div>

          <div className="flex flex-col items-center">
            <div className="h-44 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesBySourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {salesBySourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    position={{ y: -15 }}
                    wrapperStyle={{ zIndex: 100 }}
                    contentStyle={{ backgroundColor: '#0D1F3D', borderRadius: '4px', border: 'none' }}
                    labelStyle={{ color: '#E20613', fontWeight: 700, fontSize: '12px' }}
                    itemStyle={{ color: '#FFFFFF', fontWeight: 600, fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold text-[#0D1F3D]">682</span>
                <span className="text-[10px] font-semibold text-slate-500">Total Leads</span>
              </div>
            </div>

            <div className="w-full space-y-1.5 text-xs font-semibold text-slate-700 mt-2">
              {salesBySourceData.map((s) => (
                <div key={s.name} className="flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                  <span className="font-bold text-[#0D1F3D]">{s.pct} ({s.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Team Performance + Top Performing Executives + Target Gauge */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        {/* Team Performance Table (5 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5 space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-[#0D1F3D]">Team Performance</h3>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-800">
                  <th className="py-2.5 px-3">Team</th>
                  <th className="py-2.5 px-3">Team Leader</th>
                  <th className="py-2.5 px-3 text-right">Target</th>
                  <th className="py-2.5 px-3 text-right">Achieved</th>
                  <th className="py-2.5 px-3 text-center">Achievement %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {teamPerformanceData.map((t) => (
                  <tr key={t.team} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-[#0D1F3D]">{t.team}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img src={t.avatar} alt={t.leader} className="h-6 w-6 rounded-full object-cover shrink-0" />
                        <span>{t.leader}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-600">{t.target}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">{t.achieved}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold text-emerald-700">{t.pct}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View Full Team Report <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Top Performing Executives (4 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#0D1F3D]">Top Performing Executives</h3>
            <button className="text-xs font-bold text-[#E20613] hover:underline">View All</button>
          </div>

          <div className="space-y-3 font-semibold text-xs">
            {topSalesExecs.map((exec) => (
              <div key={exec.name} className="flex items-center justify-between rounded-sm border border-slate-100 bg-slate-50 p-2.5">
                <div className="flex items-center gap-2.5">
                  <img src={exec.avatar} alt={exec.name} className="h-7 w-7 rounded-full object-cover shrink-0 border border-slate-200" />
                  <div>
                    <p className="font-bold text-[#0D1F3D]">{exec.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{exec.deals} Deals • {exec.conversion} Conv.</p>
                  </div>
                </div>
                <span className="font-extrabold text-[#0D1F3D]">{exec.sales}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View All Executives <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Sales Target Overview Gauge (3 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs lg:col-span-3 space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-bold text-[#0D1F3D]">Sales Target Overview</h3>

          <div className="flex flex-col items-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#E2E8F0" strokeWidth="4" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke="#10B981" strokeWidth="4" strokeDasharray="83, 100" />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-2xl font-extrabold text-[#0D1F3D]">82.9%</span>
                <span className="text-[10px] font-semibold text-slate-500">Overall Achievement</span>
              </div>
            </div>

            <p className="mt-3 text-xs font-extrabold text-[#0D1F3D]">₹24,85,600 / ₹30,00,000</p>
          </div>

          <div className="pt-2 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-[#E20613] hover:underline inline-flex items-center gap-1">
              View Target Details <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
