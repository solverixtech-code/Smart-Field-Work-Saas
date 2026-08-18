import React from 'react';
import { MapPin, Clock, CheckCircle2, Camera, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { mockLeadVisits } from '../leadsData';

export function LeadVisitsTab() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
            <MapPin className="h-4 w-4 text-rose-600" />
            <span>Field Executive Geotagged Visit Logs</span>
          </h3>
          <p className="text-xs font-medium text-slate-500">
            GPS verified check-ins, site meeting outcomes, and geotagged client office photos.
          </p>
        </div>

        <Button variant="accent" size="sm" className="font-bold flex items-center gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" /> Schedule New Visit
        </Button>
      </div>

      <div className="space-y-4">
        {mockLeadVisits.map((visit) => (
          <div key={visit.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={visit.executiveAvatar}
                  alt={visit.executiveName}
                  className="h-8 w-8 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <p className="font-extrabold text-[#0D1F3D] text-sm">{visit.executiveName}</p>
                  <p className="text-[10px] text-slate-500 font-medium">Checked in at: {visit.checkInTime}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-0.5 font-extrabold text-[10px]">
                  {visit.status}
                </span>
                <span className="rounded-md bg-slate-100 text-slate-700 px-2 py-0.5 font-bold text-[10px]">
                  ⏱️ {visit.durationMinutes} Mins
                </span>
              </div>
            </div>

            <div className="space-y-2 font-semibold text-slate-700">
              <p className="flex items-center gap-1.5 text-slate-600 font-bold">
                <MapPin className="h-3.5 w-3.5 text-rose-600" /> {visit.location}
              </p>
              <div className="p-3 rounded-lg bg-white border border-slate-200/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Purpose & Outcome</span>
                <p className="text-slate-800 leading-relaxed font-bold">{visit.purpose}</p>
                <p className="text-slate-600 leading-snug">{visit.outcome}</p>
              </div>
            </div>

            {/* Site Photos */}
            {visit.photos.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5 text-blue-600" /> Geotagged Site Photos ({visit.photos.length})
                </span>
                <div className="flex items-center gap-3">
                  {visit.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt="Site Visit"
                      className="h-20 w-28 rounded-lg object-cover border border-slate-200 shadow-xs hover:opacity-95 transition-opacity"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
