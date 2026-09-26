import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { FollowUpCommitment } from '../telecaller.api';

interface FollowUpCommitmentsCardProps {
  commitments: FollowUpCommitment[];
  onSelectCommitment?: (item: FollowUpCommitment) => void;
}

export const FollowUpCommitmentsCard: React.FC<FollowUpCommitmentsCardProps> = ({
  commitments,
  onSelectCommitment,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between h-full min-h-[460px]">
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Today's Follow-up Commitments</h3>
            <span className="bg-red-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
              {commitments.length}
            </span>
          </div>
          <button type="button" className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors">
            View All
          </button>
        </div>

        {/* Commitments List */}
        <div className="space-y-2.5">
          {commitments.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectCommitment?.(item)}
              className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-red-600 text-xs w-16 text-right">
                  {item.time}
                </span>
                <div>
                  <h4 className="font-bold text-xs text-[#0D1F3D]">{item.leadName}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{item.topic}</p>
                </div>
              </div>

              <div>
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
          <span>View All Follow-ups</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
