import { MapPin, Camera, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function LeadVisitsTab() {
  return (
    <div className="rounded-sm border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <MapPin className="h-4 w-4 text-rose-600" />
            <span>Field Executive Geotagged Visit Logs</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Visit scheduling, GPS check-ins, and site photos belong to the field activity workflow. This tab shows no sample visits.
          </p>
        </div>

        <Button variant="accent" size="sm" disabled className="font-bold flex items-center gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" /> Schedule New Visit
        </Button>
      </div>

      <div className="rounded-sm border border-dashed border-slate-300 bg-slate-50/70 p-6 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 shadow-xs">
          <MapPin className="h-5 w-5 text-slate-500" />
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-[#0D1F3D]">No visit logs yet</h4>
          <p className="mt-1 text-xs font-medium text-slate-500">
            Real geotagged check-ins, outcomes, and photos will appear after the visit module is connected.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-sm border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
          <Camera className="h-3.5 w-3.5" /> Geotagged photos planned
        </span>
      </div>
    </div>
  );
}
