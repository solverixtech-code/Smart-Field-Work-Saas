import React, { useEffect, useState } from 'react';
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
  Search,
  Edit,
  Play,
  Pause,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { RowActionsMenu } from '../../components/ui/RowActionsMenu';
import { CreateIncentiveRuleModal } from './CreateIncentiveRuleModal';
import { currentPeriod, getIncentiveRules, getIncentives, IncentiveRuleItem, updateIncentiveRuleStatus } from './target.api';
import { extractErrorMessage } from '../../common/api';

export default function IncentiveRulesPage() {
  const navigate = useNavigate();

  const [rules, setRules] = useState<IncentiveRuleItem[]>([]);
  const [payout, setPayout] = useState(0);
  const [activeTab, setActiveTab] = useState<'All Rules' | 'Active Rules' | 'Paused Rules' | 'Inactive Rules'>('All Rules');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IncentiveRuleItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(null);
    Promise.all([
      getIncentiveRules({}, controller.signal),
      getIncentives(currentPeriod(), {}, controller.signal),
    ]).then(([rulesResponse, incentivesResponse]) => {
      setRules(rulesResponse.data.items);
      setPayout(incentivesResponse.data.summary.total);
    }).catch((requestError: unknown) => {
      if (!controller.signal.aborted) setError(extractErrorMessage(requestError, 'Unable to load incentive rules.'));
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reloadToken]);

  const count = (status: IncentiveRuleItem['status']) => rules.filter((rule) => rule.status === status).length;
  const statusValue = (status: IncentiveRuleItem['status']) => `${count(status)} (${rules.length ? ((count(status) / rules.length) * 100).toFixed(1) : '0.0'}%)`;

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

  const toggleRuleStatus = async (rule: IncentiveRuleItem) => {
    const newStatus = rule.status === 'Active' ? 'Paused' : 'Active';
    try {
      await updateIncentiveRuleStatus(rule.id, newStatus === 'Active' ? 'ACTIVE' : 'PAUSED');
      setRules((previous) => previous.map((item) => item.id === rule.id ? { ...item, status: newStatus } : item));
      toast.success(`Rule "${rule.ruleName}" status updated to ${newStatus}`);
    } catch (requestError: unknown) {
      toast.error(extractErrorMessage(requestError, 'Unable to update the rule status.'));
    }
  };

  const exportRules = () => {
    if (!filteredRules.length) { toast.info('No incentive rules to export.'); return; }
    const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [['Rule name', 'Type', 'Applies to', 'Metric', 'Payout rate', 'Start date', 'End date', 'Status'], ...filteredRules.map((rule) => [rule.ruleName, rule.ruleType, rule.appliesTo, rule.metric, rule.payoutRate, rule.startDate, rule.endDate, rule.status])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(escape).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'incentive-rules.csv'; link.click(); URL.revokeObjectURL(url);
    toast.success('Incentive rules exported.');
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
              onClick={exportRules}
              className="bg-white text-slate-700 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" /> Export
            </Button>

            <Button
              variant="accent"
              size="sm"
              onClick={() => { setEditingRule(null); setIsRuleModalOpen(true); }}
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
            <span className="text-xl font-extrabold text-[#0D1F3D]">{rules.length}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Configured rules</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <Gift className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Active Rules</span>
            <span className="text-xl font-extrabold text-emerald-600">{statusValue('Active')}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Live commission rules</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Paused Rules</span>
            <span className="text-xl font-extrabold text-amber-600">{statusValue('Paused')}</span>
            <span className="text-xs font-semibold text-amber-600 block mt-0.5">Temporarily on hold</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <PauseCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Inactive Rules</span>
            <span className="text-xl font-extrabold text-slate-500">{statusValue('Inactive')}</span>
            <span className="text-xs font-semibold text-slate-400 block mt-0.5">Expired rules</span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Payout (This Month)</span>
            <span className="text-xl font-extrabold text-[#0D1F3D]">₹ {payout.toLocaleString('en-IN')}</span>
            <span className="text-xs font-semibold text-emerald-600 block mt-0.5">Current month earnings</span>
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
              {loading && <tr><td colSpan={8} className="py-8 text-center text-slate-500">Loading incentive rules...</td></tr>}
              {!loading && error && <tr><td colSpan={8} className="py-8 text-center text-red-600">{error}</td></tr>}
              {!loading && !error && filteredRules.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-slate-500">No incentive rules found.</td></tr>}
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
                        onClick={() => void toggleRuleStatus(rule)}
                        className="p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-purple-700 cursor-pointer"
                        title={rule.status === 'Active' ? 'Pause Rule' : 'Activate Rule'}
                      >
                        {rule.status === 'Active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <RowActionsMenu
                        items={[
                          { label: 'Edit Incentive Rule', icon: Edit, onClick: () => { setEditingRule(rule); setIsRuleModalOpen(true); } },
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
        onClose={() => { setIsRuleModalOpen(false); setEditingRule(null); }}
        initialRule={editingRule}
        onSaved={() => setReloadToken((token) => token + 1)}
      />
    </div>
  );
}
