import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { X, Target, Users, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { extractErrorMessage } from '../../common/api';
import { ExecutiveTargetSummary, setSalesTarget, TargetMetric, TargetOption, TeamTargetSummary } from './target.api';

interface SetTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  period?: string;
  teamOptions?: TargetOption[];
  executiveOptions?: TargetOption[];
  initialTeam?: TeamTargetSummary | null;
  initialExecutive?: ExecutiveTargetSummary | null;
}

export function SetTargetModal({ isOpen, onClose, onSaved, period = '', teamOptions = [], executiveOptions = [], initialTeam = null, initialExecutive = null }: SetTargetModalProps) {
  const [rendered, setRendered] = useState(false);
  const [visible, setVisible] = useState(false);
  const [targetType, setTargetType] = useState<'team' | 'individual'>('team');
  const [targetTitle, setTargetTitle] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedExecutive, setSelectedExecutive] = useState('');
  const [timePeriod, setTimePeriod] = useState(period);
  const [metric, setMetric] = useState<TargetMetric>('sales_amount');
  const [targetValue, setTargetValue] = useState('');
  const [thresholdPct, setThresholdPct] = useState('80');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRendered(true);
      const frame = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
    const timer = setTimeout(() => setRendered(false), 250);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    setTargetType(initialExecutive ? 'individual' : 'team');
    setTargetTitle(initialTeam?.title ?? (initialExecutive ? `${initialExecutive.executiveName} revenue target` : ''));
    setSelectedTeam(initialTeam?.teamId ?? '');
    setSelectedExecutive(initialExecutive?.id ?? '');
    setTimePeriod(period);
    setMetric('sales_amount');
    setTargetValue(initialTeam ? String(initialTeam.targetAmount) : initialExecutive ? String(initialExecutive.salesTarget) : '');
    setThresholdPct(String(initialTeam?.thresholdPct ?? 80));
  }, [initialExecutive, initialTeam, isOpen, period]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    const scopeId = targetType === 'team' ? selectedTeam : selectedExecutive;
    if (!targetTitle.trim()) { toast.error('Please enter a target title'); return; }
    if (!scopeId) { toast.error(targetType === 'team' ? 'Please select a team' : 'Please select an executive'); return; }
    if (!timePeriod || Number(targetValue) <= 0) { toast.error('Please enter a valid target period and value'); return; }
    setSaving(true);
    try {
      await setSalesTarget({ targetType, scopeId, title: targetTitle.trim(), period: timePeriod, metric, targetValue: Number(targetValue), thresholdPct: Number(thresholdPct) });
      toast.success(`Target "${targetTitle}" saved successfully.`);
      onSaved?.();
      if (!onSaved) onClose();
    } catch (error) {
      toast.error(extractErrorMessage(error, 'Unable to save target.'));
    } finally {
      setSaving(false);
    }
  };

  if (!rendered) return null;
  const periodText = period ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${period}-01T00:00:00.000Z`)) : 'Select period';

  return createPortal(
    <div className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto transition-opacity duration-250 ease-out ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity duration-250" onClick={onClose} />
      <div className={`relative w-full max-w-xl min-h-[560px] flex flex-col justify-between rounded-sm border border-slate-200 bg-white p-6 shadow-2xl space-y-4 my-8 z-10 transition-all duration-250 ease-out font-sans text-left ${visible ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'}`}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 shrink-0">
          <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-sm bg-red-50 text-red-600 border border-red-200/60 shadow-xs"><Target className="h-5 w-5" /></div><div><h2 className="text-base font-extrabold text-[#0D1F3D] leading-tight">Set New Target</h2><p className="text-xs font-medium text-slate-600">Configure monthly or quarterly performance quotas</p></div></div>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
          <div className="space-y-1.5"><label className="text-slate-700 font-bold block">Target Type *</label><div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setTargetType('team')} className={`flex items-center gap-2.5 rounded-md border p-3 cursor-pointer transition-all ${targetType === 'team' ? 'border-purple-600 bg-purple-50/30 text-purple-900 ring-1 ring-purple-600' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}><Building2 className={`h-4 w-4 ${targetType === 'team' ? 'text-purple-600' : 'text-slate-400'}`} /><span className="font-bold">Team Target</span></button>
            <button type="button" onClick={() => setTargetType('individual')} className={`flex items-center gap-2.5 rounded-md border p-3 cursor-pointer transition-all ${targetType === 'individual' ? 'border-purple-600 bg-purple-50/30 text-purple-900 ring-1 ring-purple-600' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}><Users className={`h-4 w-4 ${targetType === 'individual' ? 'text-purple-600' : 'text-slate-400'}`} /><span className="font-bold">Individual Executive</span></button>
          </div></div>

          <div className="space-y-1"><label htmlFor="target-title" className="text-slate-700 font-bold block">Target Title *</label><input id="target-title" type="text" required placeholder="e.g. Q2 Revenue Drive - West Zone" value={targetTitle} onChange={(event) => setTargetTitle(event.target.value)} className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-[#0D1F3D] placeholder-slate-400 focus:border-purple-600 focus:outline-none" /></div>

          <div className="grid grid-cols-2 gap-3">
            {targetType === 'team'
              ? <Select label="Assign Team *" value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)} options={[{ value: '', label: 'Select Team' }, ...teamOptions]} searchable />
              : <Select label="Assign Executive *" value={selectedExecutive} onChange={(event) => setSelectedExecutive(event.target.value)} options={[{ value: '', label: 'Select Executive' }, ...executiveOptions]} searchable />}
            <Select label="Target Period *" value={timePeriod} onChange={(event) => setTimePeriod(event.target.value)} options={[{ value: period, label: periodText }]} searchable={false} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select label="Target Metric *" value={metric} onChange={(event) => setMetric(event.target.value as TargetMetric)} options={[{ value: 'sales_amount', label: 'Sales Revenue (₹)' }, { value: 'demos_count', label: 'Demos Completed' }, { value: 'visits_count', label: 'Field Visits Completed' }, { value: 'collections_amount', label: 'Collections Collected (₹)' }]} searchable={false} />
            <div className="space-y-1"><label htmlFor="target-value" className="text-slate-700 font-bold block">Target Value *</label><input id="target-value" type="number" min="0.01" step="0.01" required placeholder="e.g. 150000" value={targetValue} onChange={(event) => setTargetValue(event.target.value)} className="w-full rounded-md border border-slate-200 p-2.5 text-xs text-[#0D1F3D] placeholder-slate-400 focus:border-purple-600 focus:outline-none" /></div>
          </div>

          <div className="space-y-1"><label htmlFor="target-threshold" className="text-slate-700 font-bold block">Minimum Achievement Threshold (%)</label><input id="target-threshold" type="number" min="0" max="100" value={thresholdPct} onChange={(event) => setThresholdPct(event.target.value)} className="w-full rounded-md border border-slate-200 p-2 text-xs text-[#0D1F3D] focus:border-purple-600 focus:outline-none" /></div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3"><Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">Cancel</Button><Button type="submit" variant="accent" size="sm" disabled={saving} className="bg-[#E20613] hover:bg-red-700 text-white font-bold text-xs px-4">{saving ? 'Saving...' : 'Save Target'}</Button></div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
