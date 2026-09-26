import React from 'react';
import { CalendarDays, CheckCircle2, Clock, Coffee, Utensils, Phone, Lightbulb } from 'lucide-react';
import { DayPlanSlot } from '../telecaller.api';

interface SmartCallingPlanCardProps {
  dayPlan: DayPlanSlot[];
  bestConnectingTime: string;
}

export const SmartCallingPlanCard: React.FC<SmartCallingPlanCardProps> = ({ dayPlan, bestConnectingTime }) => {
  const totalPlannedCalls = dayPlan.reduce((acc, slot) => acc + (slot.plannedCalls || 0), 0);

  const renderIcon = (type?: string) => {
    switch (type) {
      case 'kickoff':
        return <Lightbulb className="w-3.5 h-3.5 text-blue-600" />;
      case 'break':
        return <Coffee className="w-3.5 h-3.5 text-amber-600" />;
      case 'lunch':
        return <Utensils className="w-3.5 h-3.5 text-orange-600" />;
      case 'calls':
      case 'followup':
      case 'demo':
      case 'pending':
        return <Phone className="w-3.5 h-3.5 text-indigo-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between h-full min-h-[460px]">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-extrabold text-[#0D1F3D]">Today's Smart Calling Plan</h2>
          </div>
          <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Your Day Plan
          </span>
        </div>

        {/* Time Slots List */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
          {dayPlan.map((slot) => (
            <div
              key={slot.id}
              className={`p-2.5 rounded-xl border transition-all ${
                slot.status === 'In Progress'
                  ? 'bg-red-50/40 border-red-200 shadow-2xs'
                  : slot.status === 'Completed'
                  ? 'bg-slate-50/60 border-slate-100'
                  : 'bg-white border-slate-100 hover:border-slate-200'
              }`}
            >
              {/* Top Row: Time Slot & Status Badge */}
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    {slot.timeSlot}
                  </span>
                  {slot.plannedCalls !== undefined && (
                    <span className="text-[10px] font-semibold text-slate-500">
                      • {slot.plannedCalls} Calls ({slot.doneCalls || 0} Done)
                    </span>
                  )}
                  {slot.plannedCalls === undefined && (
                    <span className="text-[10px] font-semibold text-slate-500">• {slot.durationMins} mins</span>
                  )}
                </div>

                {/* Status Badge */}
                <div>
                  {slot.status === 'Completed' && (
                    <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  )}
                  {slot.status === 'In Progress' && (
                    <span className="bg-red-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md animate-pulse shadow-2xs">
                      In Progress
                    </span>
                  )}
                  {slot.status === 'Upcoming' && (
                    <span className="bg-slate-100 text-slate-600 font-semibold text-[10px] px-2 py-0.5 rounded-md border border-slate-200">
                      Upcoming
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Icon + Title */}
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-slate-100 flex items-center justify-center shrink-0">
                  {renderIcon(slot.iconType)}
                </div>
                <span className="font-bold text-[#0D1F3D] text-xs truncate" title={slot.title}>
                  {slot.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-600 font-medium bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
        <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
          💡 Best time to connect: <strong className="text-emerald-700 font-bold">{bestConnectingTime}</strong>
        </span>
        <span className="font-bold text-[#0D1F3D]">Total Planned Calls: <strong className="font-mono font-black text-red-600">{totalPlannedCalls}</strong></span>
      </div>
    </div>
  );
};
