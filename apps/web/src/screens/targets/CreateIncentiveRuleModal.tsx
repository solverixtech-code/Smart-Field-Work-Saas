import React, { useState } from 'react';
import { toast } from 'sonner';
import { X, Gift, Plus, Calendar, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { DatePicker } from '../../components/ui/DatePicker';

interface CreateIncentiveRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateIncentiveRuleModal: React.FC<CreateIncentiveRuleModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [ruleName, setRuleName] = useState('');
  const [ruleType, setRuleType] = useState('Achievement');
  const [appliesTo, setAppliesTo] = useState('All Executives');
  const [metric, setMetric] = useState('Total Sales (Amount)');
  const [payoutRate, setPayoutRate] = useState('500');
  const [perUnit, setPerUnit] = useState('10000');
  const [startDate, setStartDate] = useState('2025-05-01');
  const [endDate, setEndDate] = useState('2025-05-31');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) {
      toast.error('Please enter a rule name');
      return;
    }
    toast.success(`Incentive rule "${ruleName}" created successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-md bg-white p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200 text-left">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-50 text-purple-600 border border-purple-100 font-bold">
              <Gift className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Create Incentive Rule</h3>
              <p className="text-[11px] font-semibold text-slate-400">Configure commission structure & performance payouts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
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
              onChange={(e) => setRuleType(e.target.value)}
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
              onChange={(e) => setAppliesTo(e.target.value)}
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
              onChange={(e) => setMetric(e.target.value)}
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
              variant="accent"
              size="sm"
              className="bg-[#E20613] hover:bg-red-700 text-white font-bold text-xs px-4"
            >
              Save Rule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
