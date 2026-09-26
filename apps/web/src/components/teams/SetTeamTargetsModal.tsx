import React, { useState } from 'react';
import { toast } from 'sonner';
import { Target, X, DollarSign, Trophy, Users, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api, extractErrorMessage } from '../../common/api';

interface SetTeamTargetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string;
  period?: string;
  teamName?: string;
  onTargetsSaved?: () => void;
}

export const SetTeamTargetsModal: React.FC<SetTeamTargetsModalProps> = ({
  isOpen,
  onClose,
  teamId,
  period,
  teamName = 'Team',
  onTargetsSaved,
}) => {
  const [revenueTarget, setRevenueTarget] = useState('1500000');
  const [dealsTarget, setDealsTarget] = useState('60');
  const [visitsTarget, setVisitsTarget] = useState('300');
  const [leadsTarget, setLeadsTarget] = useState('1500');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numRevenue = Number(revenueTarget) || 0;
  const numDeals = Number(dealsTarget) || 0;
  const numLeads = Number(leadsTarget) || 0;

  const computedAvgDealValue = numDeals > 0 ? Math.round(numRevenue / numDeals) : 0;
  const computedWinRate = (numLeads > 0 && numDeals > 0) ? Math.round((numDeals / numLeads) * 1000) / 10 : 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !period) return;
    setIsSubmitting(true);

    const targets = [
      { metric: 'sales_amount', value: numRevenue, title: `${teamName} monthly revenue` },
      { metric: 'deals_count', value: numDeals, title: `${teamName} monthly deals` },
      { metric: 'visits_count', value: Number(visitsTarget) || 0, title: `${teamName} monthly field visits` },
      { metric: 'leads_count', value: numLeads, title: `${teamName} monthly leads` },
      { metric: 'win_rate', value: computedWinRate, title: `${teamName} target win rate` },
      { metric: 'average_deal_value', value: computedAvgDealValue, title: `${teamName} average deal value` },
    ];

    try {
      await Promise.all(targets.map((target) => api.post('/tenant/crm/targets', {
        targetType: 'team', scopeId: teamId, period, metric: target.metric, targetValue: target.value,
        thresholdPct: 80, title: target.title,
      })));
      toast.success(`Targets updated for ${teamName}!`);
      onTargetsSaved?.();
      onClose();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Unable to save team targets.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#E20613] border border-red-100 shadow-xs">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-[#0D1F3D]">Set Monthly Team Targets</h3>
            <p className="text-xs text-slate-500 font-medium">
              Configure quotas and field activity targets for <span className="font-bold text-[#0D1F3D]">{teamName}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Modal Form Body */}
      <form onSubmit={handleSave} className="space-y-5 py-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
          {/* Revenue Target */}
          <div className="space-y-1 sm:col-span-1">
            <label className="font-bold text-slate-700 block flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Revenue Target (Monthly ₹) *
            </label>
            <input
              type="number"
              required
              value={revenueTarget}
              onChange={(e) => setRevenueTarget(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
              placeholder="e.g. 1500000"
            />
          </div>

          {/* Deals Won Target */}
          <div className="space-y-1 sm:col-span-1">
            <label className="font-bold text-slate-700 block flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-500" /> Deals Won Target *
            </label>
            <input
              type="number"
              required
              value={dealsTarget}
              onChange={(e) => setDealsTarget(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
              placeholder="e.g. 60"
            />
          </div>

          {/* Field Visits Target */}
          <div className="space-y-1 sm:col-span-1">
            <label className="font-bold text-slate-700 block flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#E20613]" /> Field Visits Target *
            </label>
            <input
              type="number"
              required
              value={visitsTarget}
              onChange={(e) => setVisitsTarget(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
              placeholder="e.g. 300"
            />
          </div>

          {/* Leads Target */}
          <div className="space-y-1 sm:col-span-1">
            <label className="font-bold text-slate-700 block flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-blue-600" /> Leads Target *
            </label>
            <input
              type="number"
              required
              value={leadsTarget}
              onChange={(e) => setLeadsTarget(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
              placeholder="e.g. 1500"
            />
          </div>
        </div>

        {/* Live Auto-Calculated Unit Economics Preview */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#0D1F3D]">
            <TrendingUp className="h-4 w-4 text-emerald-600" /> Auto-Calculated Quota Metrics
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white border border-slate-200/80 rounded-lg p-2.5">
              <span className="text-[11px] font-semibold text-slate-500 block">Avg. Deal Value</span>
              <span className="text-sm font-mono font-extrabold text-emerald-600">
                ₹{computedAvgDealValue.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-slate-400">/ deal</span>
              </span>
            </div>
            <div className="bg-white border border-slate-200/80 rounded-lg p-2.5">
              <span className="text-[11px] font-semibold text-slate-500 block">Implied Win Rate</span>
              <span className="text-sm font-mono font-extrabold text-blue-600">
                {computedWinRate}% <span className="text-[10px] font-normal text-slate-400">(Deals ÷ Leads)</span>
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 flex items-center gap-2.5 text-xs text-blue-900 font-semibold">
          <Sparkles className="h-4 w-4 text-blue-600 shrink-0" />
          <span>New targets will automatically distribute across active team members based on their experience level.</span>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button variant="outline" size="sm" type="button" onClick={onClose} className="font-bold">
            Cancel
          </Button>
          <Button
            variant="accent"
            size="sm"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 font-bold shadow-xs"
          >
            {isSubmitting ? 'Saving Targets...' : 'Save Team Targets'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
