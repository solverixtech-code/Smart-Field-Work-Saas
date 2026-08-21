import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Tag,
  Award,
  TrendingUp,
  Download,
  ChevronRight,
  Eye,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface CategoryRankItem {
  rank: number;
  id: string;
  categoryName: string;
  type: string;
  sales: number;
  target: number;
  achievementPct: number;
  demos: number;
  leads: number;
  collections: number;
}

const mockCategoryRanks: CategoryRankItem[] = [
  { rank: 1, id: 'CAT-1', categoryName: 'AI Website Builder', type: 'Subscription Plan', sales: 521000, target: 365000, achievementPct: 142, demos: 48, leads: 156, collections: 385000 },
  { rank: 2, id: 'CAT-2', categoryName: 'VisibloAI Enterprise Platform', type: 'Subscription Plan', sales: 410000, target: 340000, achievementPct: 121, demos: 36, leads: 128, collections: 290000 },
  { rank: 3, id: 'CAT-3', categoryName: 'SFW (Field App Licenses)', type: 'Subscription Plan', sales: 215000, target: 180000, achievementPct: 119, demos: 26, leads: 96, collections: 210000 },
  { rank: 4, id: 'CAT-4', categoryName: 'WhatsApp AI CRM Bot', type: 'Subscription Plan', sales: 165000, target: 160000, achievementPct: 103, demos: 18, leads: 72, collections: 160000 },
  { rank: 5, id: 'CAT-5', categoryName: 'Mobile Repair POS CRM', type: 'Subscription Plan', sales: 105000, target: 140000, achievementPct: 89, demos: 14, leads: 58, collections: 115000 },
  { rank: 6, id: 'CAT-6', categoryName: 'Real Estate Lead CRM', type: 'Subscription Plan', sales: 85000, target: 120000, achievementPct: 71, demos: 10, leads: 36, collections: 95000 },
];

export const CategoryPerformancePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Performance Overview');

  return (
    <div className="space-y-5 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB HEADER */}
      <div className="space-y-2 border-b border-slate-200/80 pb-3.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <span>Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span>Performance</span>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-extrabold text-[#0D1F3D]">Category Performance</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0D1F3D]">Category Performance</h1>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 text-teal-600 border border-teal-200">
                <Tag className="h-4 w-4" />
              </span>
            </div>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Analyze sales output, target achievement, and collections across product & service category lines
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success('Exporting Category Performance Report...')}
            className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 shadow-xs flex items-center gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </Button>
        </div>
      </div>

      {/* TOP 5 KPI SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Categories</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">12</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 2 new this month</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Total Sales</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">₹ 12,48,500</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 18.4% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Target Achieved</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">124%</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 16.0% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Avg. Achievement</span>
          <div className="text-2xl font-extrabold text-[#0D1F3D]">112%</div>
          <p className="text-[11px] font-bold text-emerald-600">↑ 8.2% vs. Apr 2025</p>
        </div>

        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-1.5">
          <span className="text-xs font-semibold text-slate-600">Top Category</span>
          <div className="text-xl font-extrabold text-[#0D1F3D]">AI Website</div>
          <p className="text-[11px] font-bold text-purple-700">142% of Target</p>
        </div>
      </div>

      {/* UNIFIED SUB-TABS */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs font-bold scrollbar-none pb-0">
        {['Performance Overview', 'Sales', 'Targets vs Achievement', 'Demos & Leads', 'Collections'].map((tab) => (
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

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Category Leaderboard Table (8 Cols) */}
        <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs lg:col-span-8 space-y-3">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse whitespace-nowrap text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                  <th className="py-2.5 px-3 text-center">Rank</th>
                  <th className="py-2.5 px-3">Category Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Total Sales (₹)</th>
                  <th className="py-2.5 px-3">Target (₹)</th>
                  <th className="py-2.5 px-3">Achievement %</th>
                  <th className="py-2.5 px-3 text-center">Demos</th>
                  <th className="py-2.5 px-3 text-center">Leads</th>
                  <th className="py-2.5 px-3">Collections (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mockCategoryRanks.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center font-extrabold">
                      {cat.rank === 1 ? '🥇 1' : cat.rank === 2 ? '🥈 2' : cat.rank === 3 ? '🥉 3' : cat.rank}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-[#0D1F3D] block">{cat.categoryName}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-bold">{cat.type}</td>
                    <td className="py-3 px-3 font-mono font-extrabold text-blue-700">₹{cat.sales.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-600">₹{cat.target.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
                        cat.achievementPct >= 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {cat.achievementPct}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-purple-700">{cat.demos}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">{cat.leads}</td>
                    <td className="py-3 px-3 font-mono font-bold text-emerald-700">₹{cat.collections.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebars (4 Cols) */}
        <div className="space-y-4 lg:col-span-4 flex flex-col justify-between">
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Sales by Category</h3>
            <div className="flex items-center justify-between">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-8 border-blue-600 border-r-teal-500 border-b-amber-500 border-l-purple-500">
                <span className="text-xs font-extrabold text-[#0D1F3D]">₹12.48L</span>
              </div>
              <div className="space-y-1.5 text-xs font-semibold">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full bg-blue-600" /> AI Website</span>
                  <span className="font-bold text-slate-900">41.7% (₹5.21L)</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full bg-teal-500" /> VisibloAI Platform</span>
                  <span className="font-bold text-slate-900">32.8% (₹4.10L)</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full bg-amber-500" /> SFW Field App</span>
                  <span className="font-bold text-slate-900">17.2% (₹2.15L)</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-slate-700"><span className="h-2 w-2 rounded-full bg-purple-500" /> WhatsApp CRM</span>
                  <span className="font-bold text-slate-900">8.3% (₹1.02L)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">Top 5 Categories by Sales (₹)</h3>
            <div className="space-y-2">
              {mockCategoryRanks.slice(0, 5).map((cat) => (
                <div key={cat.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-[#0D1F3D]">{cat.categoryName}</span>
                    <span className="font-mono text-emerald-700">₹{cat.sales.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(cat.sales / 521000) * 100}%` }} />
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
