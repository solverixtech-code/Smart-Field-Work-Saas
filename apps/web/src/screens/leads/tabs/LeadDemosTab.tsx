import { Video, Star, Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function LeadDemosTab() {
  return (
    <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <Video className="h-4 w-4 text-indigo-600" />
            <span>Product Walkthrough & Demo History</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Demo scheduling and feedback capture remain part of the adjacent activity workflow. No sample demos are displayed.
          </p>
        </div>

        <Button variant="accent" size="sm" disabled className="font-bold flex items-center gap-1.5 shadow-xs">
          Schedule Product Demo
        </Button>
      </div>

      <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 shadow-xs">
          <Video className="h-5 w-5 text-slate-500" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-[#0D1F3D]">No demo records yet</h4>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Real demo sessions, attendees, and feedback ratings will show here after the demo module is connected.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-[11px] font-bold text-slate-600">
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-amber-100 bg-amber-50 px-2.5 py-1 text-amber-700">
            <Star className="h-3.5 w-3.5" /> Feedback ratings
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-blue-100 bg-blue-50 px-2.5 py-1 text-blue-700">
            <Users className="h-3.5 w-3.5" /> Attendee tracking
          </span>
        </div>
      </div>
    </div>
  );
}
