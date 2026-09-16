import React from 'react';
import { Clock, Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { mockLeadFollowUps } from '../leadsData';
import { toast } from 'sonner';

export function LeadFollowUpsTab() {
  return (
    <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-xs space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Scheduled Follow-ups & Reminders</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Set upcoming call schedules, proposal review meetings, and automated reminder alerts.
          </p>
        </div>

        <Button
          variant="accent"
          size="sm"
          onClick={() => toast.info('Schedule Follow-up modal opened')}
          className="font-bold flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" /> Add New Follow-up
        </Button>
      </div>

      <div className="space-y-3">
        {mockLeadFollowUps.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-slate-200 bg-slate-50/60 p-4 text-xs font-semibold">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#0D1F3D] text-sm">{item.title}</span>
                <span className={`rounded-sm px-2 py-0.5 text-[10px] font-extrabold border ${
                  item.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                }`}>
                  {item.status}
                </span>
              </div>
              <p className="text-slate-500">Scheduled: {item.scheduledDate} at {item.scheduledTime} • Assigned to {item.assignedTo}</p>
              {item.notes && <p className="text-slate-700 font-normal italic mt-1">"{item.notes}"</p>}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success(`Follow-up "${item.title}" marked as completed`)}
              className="font-bold"
            >
              Mark Complete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
