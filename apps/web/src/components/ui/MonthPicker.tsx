import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface MonthPickerProps {
  id?: string;
  label?: string;
  value: string; // YYYY-MM
  compareValue?: string; // YYYY-MM
  onChange: (selectedMonth: string, compareMonth?: string) => void;
  showComparison?: boolean;
  disabled?: boolean;
  className?: string;
}

const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_FULL_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatPeriodLabel(periodStr: string): string {
  if (!periodStr) return 'Select Month';
  const [yearStr, monthStr] = periodStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return periodStr;
  return `${MONTH_FULL_NAMES[month - 1]} ${year}`;
}

function formatPeriodShort(periodStr: string): string {
  if (!periodStr) return '';
  const [yearStr, monthStr] = periodStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return periodStr;
  return `${MONTH_SHORT_NAMES[month - 1]} ${year}`;
}

function shiftPeriodStr(periodStr: string, offset: number): string {
  const [yearStr, monthStr] = periodStr.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) return periodStr;
  month += offset;
  while (month > 12) {
    month -= 12;
    year += 1;
  }
  while (month < 1) {
    month += 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
  id,
  label,
  value,
  compareValue,
  onChange,
  showComparison = false,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [yearStr, monthStr] = value.split('-');
  const initialYear = parseInt(yearStr, 10) || new Date().getFullYear();
  const initialMonth = parseInt(monthStr, 10) || (new Date().getMonth() + 1);

  const [activeYear, setActiveYear] = useState(initialYear);
  const [tempSelected, setTempSelected] = useState(value);
  const [tempCompareMode, setTempCompareMode] = useState<'prev_month' | 'same_month_prev_year' | 'custom'>(
    compareValue === shiftPeriodStr(value, -12) ? 'same_month_prev_year' : 'prev_month'
  );
  const [tempCustomCompare, setTempCustomCompare] = useState(compareValue || shiftPeriodStr(value, -1));

  useEffect(() => {
    setTempSelected(value);
    const [yStr] = value.split('-');
    const parsedY = parseInt(yStr, 10);
    if (!isNaN(parsedY)) setActiveYear(parsedY);
  }, [value]);

  useEffect(() => {
    if (compareValue) {
      if (compareValue === shiftPeriodStr(value, -12)) {
        setTempCompareMode('same_month_prev_year');
      } else if (compareValue === shiftPeriodStr(value, -1)) {
        setTempCompareMode('prev_month');
      } else {
        setTempCompareMode('custom');
        setTempCustomCompare(compareValue);
      }
    }
  }, [compareValue, value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleApply = () => {
    let finalCompare: string | undefined = undefined;
    if (showComparison) {
      if (tempCompareMode === 'prev_month') {
        finalCompare = shiftPeriodStr(tempSelected, -1);
      } else if (tempCompareMode === 'same_month_prev_year') {
        finalCompare = shiftPeriodStr(tempSelected, -12);
      } else {
        finalCompare = tempCustomCompare;
      }
    }
    onChange(tempSelected, finalCompare);
    setIsOpen(false);
  };

  const computeCompareLabel = (): string => {
    if (!compareValue) return '';
    if (compareValue === shiftPeriodStr(value, -1)) {
      return `vs ${formatPeriodShort(compareValue)}`;
    }
    if (compareValue === shiftPeriodStr(value, -12)) {
      return `vs ${formatPeriodShort(compareValue)}`;
    }
    return `vs ${formatPeriodShort(compareValue)}`;
  };

  return (
    <div className={`relative inline-block text-left font-sans ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-500 block mb-1">
          {label}
        </label>
      )}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="h-10 min-h-[40px] px-3 bg-white border border-slate-200 rounded-md flex items-center justify-between gap-2 text-xs font-semibold text-[#0D1F3D] hover:border-slate-300 shadow-xs transition-colors focus:outline-none focus:border-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-[#E20613] shrink-0" />
          <span>{formatPeriodLabel(value)}</span>
          {showComparison && compareValue && (
            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[11px] font-bold border border-purple-100">
              {computeCompareLabel()}
            </span>
          )}
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 z-50 w-80 rounded-md border border-slate-200 bg-white p-4 shadow-xl space-y-4 text-xs font-medium text-slate-700">
          {/* Header & Year Selector */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="font-extrabold text-[#0D1F3D] text-xs">
              {showComparison ? 'Target Period & Comparison' : 'Select Target Month'}
            </span>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
              <button
                type="button"
                onClick={() => setActiveYear(activeYear - 1)}
                className="p-1 rounded text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-200 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="font-extrabold text-[#0D1F3D] px-1">{activeYear}</span>
              <button
                type="button"
                onClick={() => setActiveYear(activeYear + 1)}
                className="p-1 rounded text-slate-500 hover:text-[#0D1F3D] hover:bg-slate-200 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Month Selection Grid */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Target Month</span>
            <div className="grid grid-cols-4 gap-1.5">
              {MONTH_SHORT_NAMES.map((mName, idx) => {
                const monthNum = idx + 1;
                const mStr = `${activeYear}-${String(monthNum).padStart(2, '0')}`;
                const isSelected = tempSelected === mStr;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={() => setTempSelected(mStr)}
                    className={`py-2 px-1 rounded text-xs font-bold transition-all text-center ${
                      isSelected
                        ? 'bg-[#0D1F3D] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-purple-700 border border-slate-100'
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comparison Baseline Section */}
          {showComparison && (
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Compare Baseline Against</span>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 hover:text-[#0D1F3D]">
                  <input
                    type="radio"
                    name="compareMode"
                    checked={tempCompareMode === 'prev_month'}
                    onChange={() => setTempCompareMode('prev_month')}
                    className="accent-purple-600"
                  />
                  <span>Previous Month <span className="text-slate-400 font-normal">({formatPeriodShort(shiftPeriodStr(tempSelected, -1))})</span></span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 hover:text-[#0D1F3D]">
                  <input
                    type="radio"
                    name="compareMode"
                    checked={tempCompareMode === 'same_month_prev_year'}
                    onChange={() => setTempCompareMode('same_month_prev_year')}
                    className="accent-purple-600"
                  />
                  <span>Same Month Last Year <span className="text-slate-400 font-normal">({formatPeriodShort(shiftPeriodStr(tempSelected, -12))})</span></span>
                </label>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 text-xs font-bold bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-md shadow-xs transition-colors flex items-center gap-1"
            >
              <Check className="h-3.5 w-3.5 text-emerald-400" /> Apply Period
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
