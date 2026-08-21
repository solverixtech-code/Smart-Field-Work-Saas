import React, { useState } from 'react';
import { toast } from 'sonner';
import { X, Target, Users, Building2, Calendar, DollarSign, Award } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';

interface SetTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetTargetModal: React.FC<SetTargetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [targetType, setTargetType] = useState<'team' | 'individual'>('team');
  const [targetTitle, setTargetTitle] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedExecutive, setSelectedExecutive] = useState('');
  const [timePeriod, setTimePeriod] = useState('May 2025');
  const [metric, setMetric] = useState('sales_amount');
  const [targetValue, setTargetValue] = useState('');
  const [thresholdPct, setThresholdPct] = useState('80');
  const [notes, setNotes] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTitle.trim()) {
      toast.error('Please enter a target title');
      return;
    }
    toast.success(`Target "${targetTitle}" created successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-md bg-white p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 border border-slate-200 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-600 border border-red-100 font-bold">
              <Target className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0D1F3D]">Set New Target</h3>
              <p className="text-[11px] font-semibold text-slate-400">Configure monthly or quarterly performance quotas</p>
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
          {/* Target Type Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-700 font-bold block">Target Type *</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                onClick={() => setTargetType('team')}
                className={`flex items-center gap-2.5 rounded-md border p-3 cursor-pointer transition-all ${
                  targetType === 'team'
                    ? 'border-purple-600 bg-purple-50/30 text-purple-900 ring-1 ring-purple-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Building2 className={`h-4 w-4 ${targetType === 'team' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="font-bold">Team Target</span>
              </label>

              <label
                onClick={() => setTargetType('individual')}
                className={`flex items-center gap-2.5 rounded-md border p-3 cursor-pointer transition-all ${
                  targetType === 'individual'
                    ? 'border-purple-600 bg-purple-50/30 text-purple-900 ring-1 ring-purple-600'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Users className={`h-4 w-4 ${targetType === 'individual' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="font-bold">Individual Executive</span>
              </label>
            </div>
          </div>

          {/* Target Name */}
          <div className="space-y-1">
            <label className="text-slate-700 font-bold block">Target Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Q2 Revenue Drive - West Zone"
              value={targetTitle}
              onChange={(e) => setTargetTitle(e.target.value)}
              className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-[#0D1F3D] placeholder-slate-400 focus:border-purple-600 focus:outline-none"
            />
          </div>

          {/* Conditional Dropdown for Team vs Executive */}
          <div className="grid grid-cols-2 gap-3">
            {targetType === 'team' ? (
              <Select
                label="Assign Team *"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                options={[
                  { value: '', label: 'Select Team' },
                  { value: 'west', label: 'West Zone (Mumbai)' },
                  { value: 'central', label: 'Central Zone (Mumbai)' },
                  { value: 'north', label: 'North Zone (Delhi)' },
                  { value: 'south', label: 'South Zone (Bangalore)' },
                ]}
                searchable={false}
              />
            ) : (
              <Select
                label="Assign Executive *"
                value={selectedExecutive}
                onChange={(e) => setSelectedExecutive(e.target.value)}
                options={[
                  { value: '', label: 'Select Executive' },
                  { value: 'rahul', label: 'Rahul Gupta (West Zone)' },
                  { value: 'priya', label: 'Priya Sharma (West Zone)' },
                  { value: 'vijay', label: 'Vijay Patel (Central Zone)' },
                  { value: 'neha', label: 'Neha Sharma (North Zone)' },
                ]}
                searchable={false}
              />
            )}

            <Select
              label="Target Period *"
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              options={[
                { value: 'May 2025', label: 'May 2025' },
                { value: 'June 2025', label: 'June 2025' },
                { value: 'Q2 2025', label: 'Q2 2025' },
                { value: 'Annual 2025-26', label: 'Annual 2025-26' },
              ]}
              searchable={false}
            />
          </div>

          {/* Metric & Target Value */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Target Metric *"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              options={[
                { value: 'sales_amount', label: 'Sales Revenue (₹)' },
                { value: 'demos_count', label: 'Demos Completed' },
                { value: 'visits_count', label: 'Field Visits Completed' },
                { value: 'collections_amount', label: 'Collections Collected (₹)' },
              ]}
              searchable={false}
            />

            <div className="space-y-1">
              <label className="text-slate-700 font-bold block">Target Value *</label>
              <input
                type="number"
                required
                placeholder="e.g. 150000"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-[#0D1F3D] placeholder-slate-400 focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Threshold & Notes */}
          <div className="space-y-1">
            <label className="text-slate-700 font-bold block">Minimum Achievement Threshold (%)</label>
            <input
              type="number"
              value={thresholdPct}
              onChange={(e) => setThresholdPct(e.target.value)}
              className="w-full rounded-md border border-slate-200 p-2 text-xs text-[#0D1F3D] focus:border-purple-600 focus:outline-none"
            />
          </div>

          {/* Buttons */}
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
              Save Target
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
