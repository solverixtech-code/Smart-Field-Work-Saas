import React from 'react';
import { Video, Plus, Star, Users } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { mockLeadDemos } from '../leadsData';

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
            Recorded demo sessions, client feedback ratings, attendee counts, and key technical questions asked.
          </p>
        </div>

        <Button variant="accent" size="sm" className="font-bold flex items-center gap-1.5 shadow-xs">
          <Plus className="h-4 w-4" /> Schedule Product Demo
        </Button>
      </div>

      <div className="space-y-4">
        {mockLeadDemos.map((demo) => (
          <div key={demo.id} className="rounded-sm border border-slate-200 bg-slate-50/60 p-5 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div>
                <h4 className="font-extrabold text-[#0D1F3D] text-sm">{demo.demoTitle}</h4>
                <p className="text-slate-500 text-[11px] font-medium">{demo.demoDate} • {demo.demoMode}</p>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {demo.feedbackRating} / 5 Rating
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-semibold text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Conducted By</span>
                <div className="flex items-center gap-2 mt-1">
                  <img src={demo.conductedByAvatar} alt={demo.conductedBy} className="h-6 w-6 rounded-full object-cover border" />
                  <span className="font-bold text-[#0D1F3D]">{demo.conductedBy}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block">Client Attendees</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-1">
                  <Users className="h-3.5 w-3.5 text-blue-600" /> {demo.attendeesCount} Key Decision Makers
                </span>
              </div>
            </div>

            <div className="p-3 rounded-sm bg-white border border-slate-200/80 text-slate-700">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Client Questions & Feedback</span>
              <p className="font-medium leading-relaxed mt-0.5">{demo.keyQuestions}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
