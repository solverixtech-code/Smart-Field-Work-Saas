import React, { useState } from 'react';
import { CheckSquare, Trophy } from 'lucide-react';
import { Checkbox } from '../../../components/ui/Checkbox';
import { DayChecklistItem } from '../telecaller.api';

interface DayChecklistCardProps {
  initialChecklist: DayChecklistItem[];
}

export const DayChecklistCard: React.FC<DayChecklistCardProps> = ({ initialChecklist }) => {
  const [items, setItems] = useState<DayChecklistItem[]>(initialChecklist);

  const completedCount = items.filter((i) => i.completed).length;
  const totalCount = items.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs flex flex-col justify-between h-full min-h-[300px]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-red-600" />
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">Day Completion Checklist</h3>
          </div>
          <span className="text-xs font-black text-slate-600 font-mono">
            {completedCount} / {totalCount}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-red-600 h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Checkbox Items List */}
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Checkbox
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
              />
              <span
                className={`text-xs font-semibold ${
                  item.completed ? 'line-through text-slate-400 font-normal' : 'text-[#0D1F3D]'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Motivation Banner */}
      <div className="mt-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 text-center text-xs font-extrabold text-emerald-900 flex items-center justify-center gap-1.5">
        <Trophy className="w-4 h-4 text-emerald-600" />
        <span>Complete all tasks to finish your day strong!</span>
      </div>
    </div>
  );
};
