import React from 'react';
import { DatePicker } from '../../../components/ui/DatePicker';

interface TelecallerHeaderProps {
  telecallerName: string;
  selectedDate: string;
  onDateChange: (newDate: string) => void;
}

export const TelecallerHeader: React.FC<TelecallerHeaderProps> = ({
  telecallerName,
  selectedDate,
  onDateChange,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0D1F3D]">
          {telecallerName} - My Telecaller Dashboard
        </h1>
        <p className="text-xs font-medium text-slate-600 mt-0.5">
          Follow your smart day plan, hit your call target, and maximize conversions.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-48">
          <DatePicker
            value={selectedDate}
            onChange={onDateChange}
          />
        </div>
      </div>
    </div>
  );
};
