import React from 'react';
import { PhoneCall, FileText, Calendar, PlusCircle, Download, Edit3, Zap } from 'lucide-react';

interface TelecallerQuickActionsProps {
  onStartCalling?: () => void;
  onOpenScript?: () => void;
  onScheduleDemo?: () => void;
  onAddFollowUp?: () => void;
  onDownloadReport?: () => void;
  onAddNote?: () => void;
}

export const TelecallerQuickActions: React.FC<TelecallerQuickActionsProps> = ({
  onStartCalling,
  onOpenScript,
  onScheduleDemo,
  onAddFollowUp,
  onDownloadReport,
  onAddNote,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between h-full min-h-[300px]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-red-600 fill-red-500" />
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Quick Actions</h3>
          </div>
        </div>

        {/* 6 Quick Action Grid Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Start Calling */}
          <button
            type="button"
            onClick={onStartCalling}
            className="p-3 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200/80 flex items-center gap-2.5 transition-all shadow-2xs text-left group"
          >
            <div className="p-2 rounded-lg bg-white group-hover:bg-white/20 text-red-600 group-hover:text-white transition-colors">
              <PhoneCall className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs">Start Calling</span>
          </button>

          {/* 2. Open Script */}
          <button
            type="button"
            onClick={onOpenScript}
            className="p-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200/80 flex items-center gap-2.5 transition-all shadow-2xs text-left group"
          >
            <div className="p-2 rounded-lg bg-white group-hover:bg-white/20 text-emerald-600 group-hover:text-white transition-colors">
              <FileText className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs">Open Script</span>
          </button>

          {/* 3. Schedule Demo */}
          <button
            type="button"
            onClick={onScheduleDemo}
            className="p-3 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200/80 flex items-center gap-2.5 transition-all shadow-2xs text-left group"
          >
            <div className="p-2 rounded-lg bg-white group-hover:bg-white/20 text-purple-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs">Schedule Demo</span>
          </button>

          {/* 4. Add Follow-up */}
          <button
            type="button"
            onClick={onAddFollowUp}
            className="p-3 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white border border-amber-200/80 flex items-center gap-2.5 transition-all shadow-2xs text-left group"
          >
            <div className="p-2 rounded-lg bg-white group-hover:bg-white/20 text-amber-600 group-hover:text-white transition-colors">
              <PlusCircle className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs">Add Follow-up</span>
          </button>

          {/* 5. Download Report */}
          <button
            type="button"
            onClick={onDownloadReport}
            className="p-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200/80 flex items-center gap-2.5 transition-all shadow-2xs text-left group"
          >
            <div className="p-2 rounded-lg bg-white group-hover:bg-white/20 text-blue-600 group-hover:text-white transition-colors">
              <Download className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs">Download Report</span>
          </button>

          {/* 6. Add Note */}
          <button
            type="button"
            onClick={onAddNote}
            className="p-3 rounded-xl bg-slate-50 hover:bg-slate-800 text-slate-700 hover:text-white border border-slate-200 flex items-center gap-2.5 transition-all shadow-2xs text-left group"
          >
            <div className="p-2 rounded-lg bg-white group-hover:bg-white/20 text-slate-600 group-hover:text-white transition-colors">
              <Edit3 className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-xs">Add Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};
