import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { X, Gift } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';
import { createIncentiveRule, IncentiveRuleItem, updateIncentiveRule } from './target.api';

interface CreateIncentiveRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRule?: IncentiveRuleItem | null;
  onSaved?: () => void;
}

const monthBounds = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const format = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return { start: format(new Date(year, month, 1)), end: format(new Date(year, month + 1, 0)) };
};

export const CreateIncentiveRuleModal: React.FC<CreateIncentiveRuleModalProps> = ({ isOpen, onClose, initialRule = null, onSaved }) => {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);

  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState<IncentiveRuleItem['ruleType']>('Achievement');
  const [appliesTo, setAppliesTo] = useState<IncentiveRuleItem['appliesTo']>('All Executives');
  const [metric, setMetric] = useState<IncentiveRuleItem['metric']>('Total Sales (Amount)');
  const [payoutRate, setPayoutRate] = useState('500');
  const [startDate, setStartDate] = useState(monthBounds().start);
  const [endDate, setEndDate] = useState(monthBounds().end);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const bounds = monthBounds();
    setRuleName(initialRule?.ruleName ?? '');
    setRuleType(initialRule?.ruleType ?? 'Achievement');
    setAppliesTo(initialRule?.appliesTo ?? 'All Executives');
    setMetric(initialRule?.metric ?? 'Total Sales (Amount)');
    setPayoutRate(String(initialRule?.payoutRate ?? 500));
    setStartDate(initialRule?.startDate ?? bounds.start);
    setEndDate(initialRule?.endDate ?? bounds.end);
  }, [initialRule, isOpen]);

  // Smooth two-stage portal animation setup
  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      toast.error('Please enter a rule name');
      return;
    }
    if (startDate > endDate) { toast.error('Validity end date must be on or after the start date'); return; }
    const amount = Number(payoutRate);
    if (!Number.isFinite(amount) || amount <= 0) { toast.error('Payout amount must be greater than zero'); return; }
    setSaving(true);
    try {
      const input = { name: ruleName.trim(), ruleType, appliesTo, metric, payoutRate: amount, startDate, endDate };
      if (initialRule) await updateIncentiveRule(initialRule.id, input);
      else await createIncentiveRule(input);
      toast.success(`Incentive rule "${ruleName.trim()}" ${initialRule ? 'updated' : 'created'} successfully!`);
      onSaved?.();
      onClose();
    } catch {
      toast.error(`Unable to ${initialRule ? 'update' : 'create'} the incentive rule.`);
    } finally {
      setSaving(false);
    }
  };

  if (!rendered) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-250 ease-out ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity duration-250"
        onClick={onClose}
      />

      {/* Centered Animated Modal Container */}
      <div
        className={`relative w-full max-w-xl rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-4 my-8 z-10 transition-all duration-250 ease-out font-sans text-left ${
          visible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-purple-50 text-purple-600 border border-purple-200/60 shadow-xs">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0D1F3D] leading-tight">{initialRule ? 'Edit Incentive Rule' : 'Create Incentive Rule'}</h2>
              <p className="text-[11px] font-semibold text-slate-400">Configure commission structure & performance payouts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1">
            <label className="text-slate-700 font-bold block">Rule Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Sales Target Achievement Commission"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-[#0D1F3D] placeholder-slate-400 focus:border-purple-600 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Rule Type *"
              value={ruleType}
              onChange={(e) => setRuleType(e.target.value as IncentiveRuleItem['ruleType'])}
              options={[
                { value: 'Achievement', label: 'Achievement (Quota based)' },
                { value: 'Performance', label: 'Performance (Acquisition based)' },
                { value: 'Activity', label: 'Activity (Visits/Demos count)' },
                { value: 'Ranking', label: 'Ranking (Top Performers slab)' },
                { value: 'Retention', label: 'Retention (Renewal %)' },
              ]}
              searchable={false}
            />

            <Select
              label="Applies To *"
              value={appliesTo}
              onChange={(e) => setAppliesTo(e.target.value as IncentiveRuleItem['appliesTo'])}
              options={[
                { value: 'All Executives', label: 'All Sales Executives' },
                { value: 'Field Executives', label: 'Field Executives Only' },
                { value: 'Telecallers', label: 'Telecallers Only' },
                { value: 'Sales Managers', label: 'Sales Managers / TLs' },
              ]}
              searchable={false}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Target Metric *"
              value={metric}
              onChange={(e) => setMetric(e.target.value as IncentiveRuleItem['metric'])}
              options={[
                { value: 'Total Sales (Amount)', label: 'Total Sales Revenue (₹)' },
                { value: 'New Customers (Count)', label: 'New Customers Acquired' },
                { value: 'Total Visits (Count)', label: 'Field Visits Completed' },
                { value: 'Demos (Count)', label: 'Demos Completed' },
                { value: 'Collections (Amount)', label: 'Collections Collected (₹)' },
              ]}
              searchable={false}
            />

            <div className="space-y-1">
              <label className="text-slate-700 font-bold block">Payout Amount (₹) *</label>
              <input
                type="number"
                required
                placeholder="e.g. 500"
                value={payoutRate}
                onChange={(e) => setPayoutRate(e.target.value)}
                className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-[#0D1F3D] focus:border-purple-600 focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DatePicker
              label="Validity Start Date *"
              value={startDate}
              onChange={(d) => setStartDate(d)}
            />
            <DatePicker
              label="Validity End Date *"
              value={endDate}
              onChange={(d) => setEndDate(d)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              variant="accent"
              size="sm"
              className="bg-[#E20613] hover:bg-red-700 text-white font-bold text-xs px-4"
            >
              {saving ? 'Saving...' : 'Save Rule'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
