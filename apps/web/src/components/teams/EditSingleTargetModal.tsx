import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Edit3, X, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { api, extractErrorMessage } from '../../common/api';

interface EditSingleTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId?: string;
  period?: string;
  metricItem?: { id: string; backendMetric: string; metric: string; target: string; targetValue: number; sub?: string } | null;
  onTargetUpdated?: () => void;
}

export const EditSingleTargetModal: React.FC<EditSingleTargetModalProps> = ({
  isOpen,
  onClose,
  teamId,
  period,
  metricItem,
  onTargetUpdated,
}) => {
  const [targetValue, setTargetValue] = useState('');

  useEffect(() => {
    if (metricItem) {
      setTargetValue(String(metricItem.targetValue));
    }
  }, [metricItem]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricItem || !teamId || !period) return;
    try {
      await api.post('/tenant/crm/targets', {
        targetType: 'team', scopeId: teamId, period, metric: metricItem.backendMetric,
        targetValue: Number(targetValue), thresholdPct: 80, title: metricItem.metric,
      });
      toast.success(`Updated ${metricItem.metric} target to ${targetValue}`);
      onTargetUpdated?.();
      onClose();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, 'Unable to update the target.'));
    }
  };

  if (!metricItem) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <Edit3 className="h-5 w-5 text-[#E20613]" />
          <div>
            <h3 className="text-base font-extrabold text-[#0D1F3D]">Edit Target: {metricItem.metric}</h3>
            <p className="text-xs text-slate-500">{metricItem.sub}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 py-2">
        <div className="space-y-1 text-xs">
          <label className="font-bold text-slate-700 block">Monthly Target Value *</label>
          <input
            type="text"
            required
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-extrabold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} className="font-bold">
            Cancel
          </Button>
          <Button variant="accent" size="sm" type="submit" className="font-bold">
            Save Target
          </Button>
        </div>
      </form>
    </Modal>
  );
};
