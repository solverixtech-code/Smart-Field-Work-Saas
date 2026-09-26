import React from 'react';
import { ListOrdered, PhoneCall, MessageSquare, FileText, ArrowRight } from 'lucide-react';
import { PriorityQueueItem } from '../telecaller.api';

interface PriorityCallQueueCardProps {
  queue: PriorityQueueItem[];
  onStartCall?: (lead: PriorityQueueItem) => void;
  onOpenWhatsApp?: (phone: string) => void;
  onAddNote?: (lead: PriorityQueueItem) => void;
}

export const PriorityCallQueueCard: React.FC<PriorityCallQueueCardProps> = ({
  queue,
  onStartCall,
  onOpenWhatsApp,
  onAddNote,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between h-full min-h-[460px]">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Priority Call Queue</h3>
            <span className="bg-red-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {queue.length}
            </span>
          </div>
          <button type="button" className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors">
            View All
          </button>
        </div>

        {/* Responsive Queue Item Cards List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto overflow-x-hidden custom-scrollbar pr-1">
          {queue.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50 transition-all flex items-center justify-between gap-2 shadow-2xs"
            >
              {/* Left Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-xs text-[#0D1F3D] truncate">{item.leadName}</h4>
                  <span
                    className={`px-1.5 py-0.2 font-extrabold text-[9px] rounded border shrink-0 ${
                      item.priority === 'High'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : item.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {item.company} • <span className="text-slate-400">{item.lastContact}</span>
                </p>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onStartCall?.(item)}
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                  title="Start Call"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenWhatsApp?.(item.phone)}
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                  title="Open WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onAddNote?.(item)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white transition-all shadow-2xs"
                  title="Add Note"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Link */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <button
          type="button"
          className="text-xs font-extrabold text-slate-600 hover:text-red-600 flex items-center justify-center gap-1 w-full transition-colors"
        >
          <span>View Full Queue</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
