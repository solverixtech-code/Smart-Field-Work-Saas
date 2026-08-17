import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

const PRESETS: DateRange[] = [
  { label: '14 May 2025 - 20 May 2025', startDate: '2025-05-14', endDate: '2025-05-20' },
  { label: 'Today (20 May 2025)', startDate: '2025-05-20', endDate: '2025-05-20' },
  { label: 'Yesterday (19 May 2025)', startDate: '2025-05-19', endDate: '2025-05-19' },
  { label: 'Last 7 Days', startDate: '2025-05-14', endDate: '2025-05-20' },
  { label: 'Last 30 Days', startDate: '2025-04-20', endDate: '2025-05-20' },
  { label: 'This Month (May 2025)', startDate: '2025-05-01', endDate: '2025-05-31' },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDateLabel(startStr: string, endStr: string): string {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return `${startStr} - ${endStr}`;

  const startDay = start.getDate();
  const startMonth = MONTH_NAMES[start.getMonth()].substring(0, 3);
  const startYear = start.getFullYear();

  const endDay = end.getDate();
  const endMonth = MONTH_NAMES[end.getMonth()].substring(0, 3);
  const endYear = end.getFullYear();

  if (startYear === endYear && startMonth === endMonth && startDay === endDay) {
    return `${startDay} ${startMonth} ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`;
  }
  return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'presets' | 'custom'>('presets');
  const [selectedRange, setSelectedRange] = useState<DateRange>(
    value || PRESETS[0],
  );

  // Custom date selection state
  const [customStart, setCustomStart] = useState('2025-05-14');
  const [customEnd, setCustomEnd] = useState('2025-05-20');
  const [currentMonth, setCurrentMonth] = useState(4); // 0-indexed: 4 = May
  const [currentYear, setCurrentYear] = useState(2025);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setMode('presets');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectPreset = (preset: DateRange) => {
    setSelectedRange(preset);
    onChange?.(preset);
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    let s = customStart;
    let e = customEnd;
    if (new Date(s) > new Date(e)) {
      [s, e] = [e, s];
    }
    const newRange: DateRange = {
      startDate: s,
      endDate: e,
      label: formatDateLabel(s, e),
    };
    setSelectedRange(newRange);
    onChange?.(newRange);
    setIsOpen(false);
    setMode('presets');
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handleDayClick = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const clickedDate = `${currentYear}-${monthStr}-${dayStr}`;

    if (!customStart || (customStart && customEnd)) {
      setCustomStart(clickedDate);
      setCustomEnd('');
    } else {
      if (new Date(clickedDate) < new Date(customStart)) {
        setCustomEnd(customStart);
        setCustomStart(clickedDate);
      } else {
        setCustomEnd(clickedDate);
      }
    }
  };

  const isDaySelected = (day: number) => {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
    return dateStr === customStart || dateStr === customEnd;
  };

  const isDayInRange = (day: number) => {
    if (!customStart || !customEnd) return false;
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
    const target = new Date(dateStr);
    return target >= new Date(customStart) && target <= new Date(customEnd);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0D1F3D] shadow-xs transition-all hover:bg-slate-50 focus:border-[#E20613] focus:outline-none focus:ring-1 focus:ring-[#E20613]"
      >
        <CalendarIcon className="h-4 w-4 text-[#E20613]" />
        <span>📅 {selectedRange.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
          {mode === 'presets' ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 pb-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Select Date Range
                </span>
                <button
                  onClick={() => setMode('custom')}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#E20613] hover:underline"
                >
                  <SlidersHorizontal className="h-3 w-3" /> Custom Calendar
                </button>
              </div>

              <div className="space-y-0.5 pt-1">
                {PRESETS.map((preset) => {
                  const isSelected = selectedRange.startDate === preset.startDate && selectedRange.endDate === preset.endDate;
                  return (
                    <button
                      key={preset.label}
                      onClick={() => handleSelectPreset(preset)}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#0D1F3D] text-white'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]'
                      }`}
                    >
                      <span>{preset.label}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#E20613]" />}
                    </button>
                  );
                })}

                <button
                  onClick={() => setMode('custom')}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-[#E20613] bg-red-50/60 hover:bg-red-100/80 transition-all mt-1"
                >
                  <span>Custom Date Range...</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Custom Interactive Calendar Picker */
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <button
                  onClick={() => setMode('presets')}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back to Presets
                </button>
                <span className="text-xs font-extrabold text-[#0D1F3D]">Custom Calendar</span>
              </div>

              {/* Start & End Date Inputs */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-xs font-bold text-[#0D1F3D] focus:outline-none"
                  />
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between px-1">
                <button
                  onClick={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-[#0D1F3D]">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <button
                  onClick={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(currentYear + 1);
                    } else {
                      setCurrentMonth(currentMonth + 1);
                    }
                  }}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Interactive Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d} className="text-slate-400 py-1">{d}</span>
                ))}

                {/* Empty cells for padding */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <span key={`empty-${i}`} />
                ))}

                {/* Calendar Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const selected = isDaySelected(day);
                  const inRange = isDayInRange(day);

                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                        selected
                          ? 'bg-[#E20613] text-white shadow-xs'
                          : inRange
                            ? 'bg-red-50 text-[#E20613]'
                            : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setMode('presets')}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyCustom}
                  className="rounded-lg bg-[#E20613] px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#c4040f]"
                >
                  Apply Range
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
