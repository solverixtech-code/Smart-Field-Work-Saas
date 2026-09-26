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

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="pb-2 font-bold">Lead Name</th>
                <th className="pb-2 font-bold">Company</th>
                <th className="pb-2 font-bold">Priority</th>
                <th className="pb-2 font-bold">Last Contact</th>
                <th className="pb-2 font-bold text-center">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 font-bold text-[#0D1F3D] text-xs">{item.leadName}</td>
                  <td className="py-2.5 text-slate-500 font-medium text-xs">{item.company}</td>
                  <td className="py-2.5">
                    {item.priority === 'High' && (
                      <span className="bg-red-50 text-red-600 font-extrabold text-[10px] px-2 py-0.5 rounded border border-red-200">
                        High
                      </span>
                    )}
                    {item.priority === 'Medium' && (
                      <span className="bg-amber-50 text-amber-600 font-extrabold text-[10px] px-2 py-0.5 rounded border border-amber-200">
                        Medium
                      </span>
                    )}
                    {item.priority === 'Low' && (
                      <span className="bg-blue-50 text-blue-600 font-extrabold text-[10px] px-2 py-0.5 rounded border border-blue-200">
                        Low
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 text-slate-400 font-medium text-[11px]">{item.lastContact}</td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Call Button */}
                      <button
                        type="button"
                        onClick={() => onStartCall?.(item)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                        title="Start Call"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>

                      {/* WhatsApp Button */}
                      <button
                        type="button"
                        onClick={() => onOpenWhatsApp?.(item.phone)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-2xs"
                        title="Open WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Add Note Button */}
                      <button
                        type="button"
                        onClick={() => onAddNote?.(item)}
                        className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white transition-all shadow-2xs"
                        title="Add Note"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
