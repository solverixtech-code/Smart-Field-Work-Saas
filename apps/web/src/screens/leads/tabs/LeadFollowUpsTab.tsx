import { Clock, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function LeadFollowUpsTab() {
  return (
    <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Scheduled Follow-ups & Reminders</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Lead basics currently persist the next follow-up date and next action note on the lead record.
          </p>
        </div>

        <Button variant="accent" size="sm" disabled className="font-bold flex items-center gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" /> Add New Follow-up
        </Button>
      </div>

      <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 shadow-xs">
          <Clock className="h-5 w-5 text-slate-500" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-[#0D1F3D]">Advanced follow-up workflow is not connected yet</h4>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Use the lead edit form to set Next follow-up and Next action. The full reminder workflow will use real scheduled records when that module is added.
          </p>
        </div>
      </div>
    </div>
  );
}
