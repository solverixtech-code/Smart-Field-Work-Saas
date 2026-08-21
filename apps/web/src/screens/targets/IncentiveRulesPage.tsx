import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Gift,
  CheckCircle2,
  PauseCircle,
  XCircle,
  CreditCard,
  Plus,
  Download,
  Filter,
  Search,
  ChevronRight,
  Edit,
  Play,
  Pause,
  Award,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { mockIncentiveRules, IncentiveRuleItem } from './targetsData';
import { CreateIncentiveRuleModal } from './CreateIncentiveRuleModal';

export default function IncentiveRulesPage() {
  const navigate = useNavigate();

  const [rules, setRules] = useState<IncentiveRuleItem[]>(mockIncentiveRules);
  const [activeTab, setActiveTab] = useState<'All Rules' | 'Active Rules' | 'Paused Rules' | 'Inactive Rules'>('All Rules');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      !searchQuery.trim() ||
      r.ruleName.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      r.metric.toLowerCase().includes(searchQuery.toLowerCase().trim());

    let matchesTab = true;
    if (activeTab === 'Active Rules') matchesTab = r.status === 'Active';
    else if (activeTab === 'Paused Rules') matchesTab = r.status === 'Paused';
    else if (activeTab === 'Inactive Rules') matchesTab = r.status === 'Inactive';

    return matchesSearch && matchesTab;
  });

  const toggleRuleStatus = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const newStatus = r.status === 'Active' ? 'Paused' : 'Active';
          toast.success(`Rule "${r.ruleName}" status updated to ${newStatus}`);
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  return (
    <div className="space-y-4 font-sans pb-16 bg-slate-50/50 min-h-screen p-1 sm:p-2 text-left">
      {/* BREADCRUMB & HEADER BAR */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <span>/</span>
          <span className="hover:text-purple-600 cursor-pointer" onClick={() => navigate('/admin/incentives')}>
            Incentives
          </span>
          <span>/</span>
          <span className="text-[#0D1F3D] font-bold">Incentive Rules</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl font-bold text-[#0D1F3D]">Incentive Rules</h1>
            <p className="text-xs font-normal text-slate-500">
              Create and manage incentive rules and commission structures for your sales team.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Exporting rules...')}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" /> Export
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={() => setIsRuleModalOpen(true)}
              className="flex items-center gap-1.5 font-bold shadow-xs bg-[#E20613] hover:bg-red-700 text-white rounded-md px-4 py-2"
            >
              <Plus className="h-4 w-4" /> Create New Rule
            </Button>
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS (5 CARDS) */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Rules</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">18</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">▲ 2 vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Gift className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Rules</span>
            <span className="text-xl font-extrabold text-emerald-600">14 (77.8%)</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Live commission rules</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Paused Rules</span>
            <span className="text-xl font-extrabold text-amber-600">3 (16.7%)</span>
            <span className="text-xs font-semibold text-amber-600 block mt-0.5">Temporarily on hold</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <PauseCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Inactive Rules</span>
            <span className="text-xl font-extrabold text-slate-500">1 (5.5%)</span>
            <span className="text-xs font-semibold text-slate-400 block mt-0.5">Expired rules</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Payout (This Month)</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ 1,24,350</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">▲ 22.8% vs last month</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-blue-600 border border-blue-100 shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* RULES TABLE & FILTER TOOLBAR */}
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold">
            {(['All Rules', 'Active Rules', 'Paused Rules', 'Inactive Rules'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                  activeTab === tab
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rule name or metric..."
              className="w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-purple-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-extrabold text-[#0D1F3D]">
                <th className="py-2.5 px-3">Rule Name</th>
                <th className="py-2.5 px-3">Rule Type</th>
                <th className="py-2.5 px-3">Applies To</th>
                <th className="py-2.5 px-3">Metric</th>
                <th className="py-2.5 px-3">Payout Structure</th>
                <th className="py-2.5 px-3">Validity Period</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-extrabold text-[#0D1F3D] block">{rule.ruleName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                        rule.ruleType === 'Achievement'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : rule.ruleType === 'Performance'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rule.ruleType === 'Activity'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : rule.ruleType === 'Ranking'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {rule.ruleType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-700">{rule.appliesTo}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{rule.metric}</td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{rule.payoutStructure}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{rule.validityPeriod}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                        rule.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : rule.status === 'Paused'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {rule.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleRuleStatus(rule.id)}
                        className="p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-purple-700 cursor-pointer"
                        title={rule.status === 'Active' ? 'Pause Rule' : 'Activate Rule'}
                      >
                        {rule.status === 'Active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <RowActionsMenu
                        items={[
                          { label: 'Edit Incentive Rule', icon: Edit, onClick: () => setIsRuleModalOpen(true) },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateIncentiveRuleModal
        isOpen={isRuleModalOpen}
        onClose={() => setIsRuleModalOpen(false)}
      />
    </div>
  );
}
