import React from 'react';
import {
  Clock,
  CheckCircle2,
  FileText,
  MapPin,
  Video,
  DollarSign,
  User,
  Plus,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { mockLeadTimelineEvents } from '../leadsData';

export function LeadTimelineTab() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Chronological Lead Interaction Timeline</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Real-time activity audit trail of visits, stage changes, demos, proposals, and payments.
          </p>
        </div>

        <Button variant="outline" size="sm" className="font-bold flex items-center gap-1.5">
          <Plus className="h-4 w-4 text-[#0D1F3D]" /> Log Note / Activity
        </Button>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {mockLeadTimelineEvents.map((evt) => (
          <div key={evt.id} className="relative group">
            {/* Timeline Circle Bullet Icon */}
            <div className="absolute -left-[30px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-[#0D1F3D] text-[#0D1F3D] shadow-xs">
              {evt.type === 'stage_change' && <FileText className="h-3 w-3 text-blue-600" />}
              {evt.type === 'demo' && <Video className="h-3 w-3 text-purple-600" />}
              {evt.type === 'visit' && <MapPin className="h-3 w-3 text-rose-600" />}
              {evt.type === 'payment' && <DollarSign className="h-3 w-3 text-emerald-600" />}
            </div>

            {/* Event Box */}
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-2 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="font-extrabold text-[#0D1F3D] text-sm">{evt.title}</h4>
                <span className="text-[11px] font-bold text-slate-400">{evt.timestamp}</span>
              </div>

              <p className="font-semibold text-slate-700 leading-relaxed">{evt.description}</p>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <img
                  src={evt.actorAvatar}
                  alt={evt.actorName}
                  className="h-5 w-5 rounded-full object-cover border border-slate-200"
                />
                <span className="font-bold text-slate-800 text-[11px]">{evt.actorName}</span>
                <span className="text-[10px] text-slate-400">({evt.actorRole})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
