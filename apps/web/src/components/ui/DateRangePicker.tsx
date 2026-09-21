import React, { useState, useRef, useEffect, useLayoutEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon, ChevronDown, Check, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const parseDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};
const createPresets = (today: Date): DateRange[] => {
  const day = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterday = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1);
  const sevenDaysAgo = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 6);
  const thirtyDaysAgo = new Date(day.getFullYear(), day.getMonth(), day.getDate() - 29);
  const monthStart = new Date(day.getFullYear(), day.getMonth(), 1);
  const previousMonthStart = new Date(day.getFullYear(), day.getMonth() - 1, 1);
  const previousMonthEnd = new Date(day.getFullYear(), day.getMonth(), 0);
  return [
    { label: 'Today', startDate: dateKey(day), endDate: dateKey(day) },
    { label: 'Yesterday', startDate: dateKey(yesterday), endDate: dateKey(yesterday) },
    { label: 'Last 7 days', startDate: dateKey(sevenDaysAgo), endDate: dateKey(day) },
    { label: 'Last 30 days', startDate: dateKey(thirtyDaysAgo), endDate: dateKey(day) },
    { label: 'This month', startDate: dateKey(monthStart), endDate: dateKey(day) },
    { label: 'Last month', startDate: dateKey(previousMonthStart), endDate: dateKey(previousMonthEnd) },
  ];
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDateLabel(startStr: string, endStr: string): string {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
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
  const [presets] = useState(() => createPresets(new Date()));
  const [selectedRange, setSelectedRange] = useState<DateRange>(
    value || presets[4],
  );
  const displayedRange = value ?? selectedRange;

  // Custom date selection state
  const [customStart, setCustomStart] = useState(displayedRange.startDate);
  const [customEnd, setCustomEnd] = useState(displayedRange.endDate);
  const [currentMonth, setCurrentMonth] = useState(() => parseDate(displayedRange.startDate).getMonth());
  const [currentYear, setCurrentYear] = useState(() => parseDate(displayedRange.startDate).getFullYear());

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();
  const [position, setPosition] = useState({ top: 0, left: 0, width: 320 });

  useLayoutEffect(() => {
    if (!isOpen) return;
    const updatePosition = () => {
      const trigger = triggerRef.current?.getBoundingClientRect();
      if (!trigger) return;
      const width = Math.min(320, window.innerWidth - 16);
      const height = dropdownRef.current?.offsetHeight ?? 390;
      const left = Math.max(8, Math.min(trigger.right - width, window.innerWidth - width - 8));
      const below = trigger.bottom + 8;
      const top = below + height > window.innerHeight - 8 && trigger.top > height + 8
        ? trigger.top - height - 8
        : Math.min(below, Math.max(8, window.innerHeight - height - 8));
      setPosition({ top, left, width });
    };
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, mode]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node) && !triggerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setMode('presets');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setMode('presets');
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const handleSelectPreset = (preset: DateRange) => {
    setSelectedRange(preset);
    onChange?.(preset);
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    if (!customStart || !customEnd) return;
    let s = customStart;
    let e = customEnd;
    if (parseDate(s) > parseDate(e)) {
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
      if (parseDate(clickedDate) < parseDate(customStart)) {
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
    const target = parseDate(dateStr);
    return target >= parseDate(customStart) && target <= parseDate(customEnd);
  };

  return (
    <div className="relative inline-block font-sans">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!isOpen) {
            setCustomStart(displayedRange.startDate);
            setCustomEnd(displayedRange.endDate);
            const start = parseDate(displayedRange.startDate);
            setCurrentMonth(start.getMonth());
            setCurrentYear(start.getFullYear());
          }
          setIsOpen(!isOpen);
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        className="flex items-center gap-2.5 rounded-sm border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0D1F3D] shadow-xs transition-all hover:bg-slate-50 focus:border-[#E20613] focus:outline-none"
      >
        <CalendarIcon className="h-4 w-4 text-[#E20613]" />
        <span>{displayedRange.label}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div
          id={popoverId}
          ref={dropdownRef}
          role="dialog"
          aria-label="Select date range"
          className="fixed z-[1000] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 shadow-xl"
          style={{ top: position.top, left: position.left, width: position.width, maxHeight: 'calc(100vh - 16px)' }}
        >
          {mode === 'presets' ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-500">
                  Select Date Range
                </span>
                <button
                  type="button"
                  onClick={() => setMode('custom')}
                  className="flex items-center gap-1 text-xs font-bold text-[#E20613] hover:underline cursor-pointer"
                >
                  <SlidersHorizontal className="h-3 w-3" /> Custom Calendar
                </button>
              </div>

              <div className="space-y-0.5 pt-1">
                {presets.map((preset) => {
                  const isSelected = displayedRange.startDate === preset.startDate && displayedRange.endDate === preset.endDate;
                  return (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => handleSelectPreset(preset)}
                      className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
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
                  type="button"
                  onClick={() => setMode('custom')}
                  className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-xs font-bold text-[#E20613] bg-red-50/60 hover:bg-red-100/80 transition-all mt-1 cursor-pointer"
                >
                  <span>Custom Date Range...</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Custom Interactive Calendar Picker (No Native Input Tags) */
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <button
                  type="button"
                  onClick={() => setMode('presets')}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Back to Presets
                </button>
                <span className="text-xs font-extrabold text-[#0D1F3D]">Custom Calendar</span>
              </div>

              {/* Clean Date Display Cards (No Native Input Tags) */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Start Date</label>
                  <div className="w-full rounded-sm border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-bold text-[#0D1F3D]">
                    {customStart ? formatDateLabel(customStart, customStart) : 'Select Start'}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">End Date</label>
                  <div className="w-full rounded-sm border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-bold text-[#0D1F3D]">
                    {customEnd ? formatDateLabel(customEnd, customEnd) : 'Select End'}
                  </div>
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between px-1 border-t border-slate-100 pt-2">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => {
                    if (currentMonth === 0) {
                      setCurrentMonth(11);
                      setCurrentYear(currentYear - 1);
                    } else {
                      setCurrentMonth(currentMonth - 1);
                    }
                  }}
                  className="p-1 rounded-sm text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-extrabold text-[#0D1F3D]">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => {
                    if (currentMonth === 11) {
                      setCurrentMonth(0);
                      setCurrentYear(currentYear + 1);
                    } else {
                      setCurrentMonth(currentMonth + 1);
                    }
                  }}
                  className="p-1 rounded-sm text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Interactive Calendar Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d} className="text-xs font-bold text-slate-700 py-1">{d}</span>
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
                      type="button"
                      key={day}
                      aria-label={`${day} ${MONTH_NAMES[currentMonth]} ${currentYear}`}
                      onClick={() => handleDayClick(day)}
                      className={`h-7 w-7 rounded-sm text-xs font-bold transition-all cursor-pointer ${
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
                  type="button"
                  onClick={() => setMode('presets')}
                  className="rounded-sm px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApplyCustom}
                  className="rounded-sm bg-[#E20613] px-4 py-1.5 text-xs font-extrabold text-white shadow-xs hover:bg-[#c4040f] cursor-pointer"
                >
                  Apply Range
                </button>
              </div>
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
};
