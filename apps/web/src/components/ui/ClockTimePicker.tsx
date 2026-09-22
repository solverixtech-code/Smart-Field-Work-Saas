import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface ClockTimePickerProps {
  id?: string;
  label?: string;
  value?: string; // e.g. "11:30 AM" or "14:30"
  onChange?: (formattedTime: string) => void;
  required?: boolean;
}

export const ClockTimePicker: React.FC<ClockTimePickerProps> = ({
  id,
  label = 'Time',
  value = '11:00 AM',
  onChange,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse hours, minutes, ampm from value
  const parseTime = (valStr: string) => {
    let h = 11;
    let m = 0;
    let period = 'AM';

    if (valStr) {
      const match = valStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let rawH = parseInt(match[1], 10);
        m = parseInt(match[2], 10);
        if (match[3]) {
          period = match[3].toUpperCase();
          h = rawH;
        } else {
          if (rawH >= 12) {
            period = 'PM';
            h = rawH === 12 ? 12 : rawH - 12;
          } else {
            period = 'AM';
            h = rawH === 0 ? 12 : rawH;
          }
        }
      }
    }
    return { hour: h, minute: m, period };
  };

  const initialParsed = parseTime(value);
  const [selectedHour, setSelectedHour] = useState(initialParsed.hour);
  const [selectedMinute, setSelectedMinute] = useState(initialParsed.minute);
  const [selectedPeriod, setSelectedPeriod] = useState(initialParsed.period);

  useEffect(() => {
    const p = parseTime(value);
    setSelectedHour(p.hour);
    setSelectedMinute(p.minute);
    setSelectedPeriod(p.period);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const updateTime = (h: number, m: number, p: string) => {
    setSelectedHour(h);
    setSelectedMinute(m);
    setSelectedPeriod(p);

    const formattedH = h < 10 ? `0${h}` : `${h}`;
    const formattedM = m < 10 ? `0${m}` : `${m}`;
    const result = `${formattedH}:${formattedM} ${p}`;
    onChange?.(result);
  };

  const handleHourChange = (delta: number) => {
    let nextH = selectedHour + delta;
    if (nextH > 12) nextH = 1;
    if (nextH < 1) nextH = 12;
    updateTime(nextH, selectedMinute, selectedPeriod);
  };

  const handleMinuteChange = (delta: number) => {
    let nextM = selectedMinute + delta;
    if (nextM >= 60) nextM = 0;
    if (nextM < 0) nextM = 45;
    updateTime(selectedHour, nextM, selectedPeriod);
  };

  const togglePeriod = () => {
    const nextP = selectedPeriod === 'AM' ? 'PM' : 'AM';
    updateTime(selectedHour, selectedMinute, nextP);
  };

  const displayString = `${selectedHour < 10 ? '0' + selectedHour : selectedHour}:${
    selectedMinute < 10 ? '0' + selectedMinute : selectedMinute
  } ${selectedPeriod}`;

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="font-bold text-slate-700 block text-xs">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between rounded-sm border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:border-[#0D1F3D] focus:outline-none shadow-xs hover:bg-slate-50 transition cursor-pointer"
      >
        <span className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {displayString}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-[999999] w-64 rounded-sm border border-slate-200 bg-white p-3.5 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150 font-sans text-xs">
          <div className="flex items-center justify-between text-slate-500 font-extrabold text-[11px] border-b border-slate-100 pb-1.5">
            <span>CLOCK TIME PICKER</span>
            <span className="font-mono text-slate-800 text-xs font-bold">{displayString}</span>
          </div>

          <div className="flex items-center justify-center gap-3 py-2 bg-slate-50 rounded-sm border border-slate-100">
            {/* Hours Selector */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleHourChange(1)}
                className="p-1 rounded-sm text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <span className="font-mono text-lg font-extrabold text-[#0D1F3D] my-1 w-8 text-center">
                {selectedHour < 10 ? `0${selectedHour}` : selectedHour}
              </span>
              <button
                type="button"
                onClick={() => handleHourChange(-1)}
                className="p-1 rounded-sm text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5">HOURS</span>
            </div>

            <span className="font-mono text-xl font-bold text-slate-400 pb-4">:</span>

            {/* Minutes Selector */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleMinuteChange(15)}
                className="p-1 rounded-sm text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <span className="font-mono text-lg font-extrabold text-[#0D1F3D] my-1 w-8 text-center">
                {selectedMinute < 10 ? `0${selectedMinute}` : selectedMinute}
              </span>
              <button
                type="button"
                onClick={() => handleMinuteChange(-15)}
                className="p-1 rounded-sm text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5">MINUTES</span>
            </div>

            {/* AM / PM Toggle */}
            <div className="flex flex-col items-center justify-center pl-2 border-l border-slate-200">
              <button
                type="button"
                onClick={togglePeriod}
                className="px-2.5 py-1.5 rounded-sm bg-[#0D1F3D] text-white font-extrabold text-xs shadow-xs hover:bg-slate-800 transition cursor-pointer"
              >
                {selectedPeriod}
              </button>
              <span className="text-[9px] font-bold text-slate-400 mt-1">PERIOD</span>
            </div>
          </div>

          {/* Preset Quick Time Buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {['09:00 AM', '11:00 AM', '02:30 PM', '05:00 PM'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  const p = parseTime(preset);
                  updateTime(p.hour, p.minute, p.period);
                }}
                className="py-1 px-1 rounded-xs bg-slate-100 hover:bg-slate-200 text-[10px] font-mono font-bold text-slate-700 text-center transition cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-1.5 bg-[#0D1F3D] text-white text-xs font-bold rounded-sm hover:bg-slate-800 transition cursor-pointer text-center"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
