import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  id?: string;
  label?: string;
  value?: string; // YYYY-MM-DD
  onChange?: (dateStr: string) => void;
  required?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return 'Select Date';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()].substring(0, 3);
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  label,
  value = '2025-05-20',
  onChange,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initialDate = new Date(selectedDate || Date.now());
  const [currentMonth, setCurrentMonth] = useState(
    isNaN(initialDate.getTime()) ? 4 : initialDate.getMonth()
  );
  const [currentYear, setCurrentYear] = useState(
    isNaN(initialDate.getTime()) ? 2025 : initialDate.getFullYear()
  );

  useEffect(() => {
    setSelectedDate(value);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (match) {
      setCurrentYear(Number(match[1]));
      setCurrentMonth(Number(match[2]) - 1);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const handleSelectDay = (day: number) => {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const formatted = `${currentYear}-${mStr}-${dStr}`;
    setSelectedDate(formatted);
    onChange?.(formatted);
    setIsOpen(false);
  };

  return (
    <div className="space-y-1 text-left font-sans" ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="font-bold text-slate-700 block text-xs">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0D1F3D] shadow-xs hover:border-[#0D1F3D] focus:outline-none transition-colors"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-red-600 shrink-0" />
            <span className="font-mono">{formatDateDisplay(selectedDate)}</span>
          </div>
          <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full mt-1.5 z-[9999] w-72 rounded-sm border border-slate-200 bg-white p-3 shadow-2xl space-y-3">
            {/* Header with Month Navigation */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <button
                type="button"
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
                className="p-1 rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="text-xs font-extrabold text-[#0D1F3D]">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>

              <button
                type="button"
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
                className="p-1 rounded-sm text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <span key={d} className="text-slate-400 py-1">{d}</span>
              ))}

              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <span key={`pad-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const mStr = String(currentMonth + 1).padStart(2, '0');
                const dStr = String(day).padStart(2, '0');
                const dateStr = `${currentYear}-${mStr}-${dStr}`;
                const isSelected = selectedDate === dateStr;

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-7 w-7 rounded-sm text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
