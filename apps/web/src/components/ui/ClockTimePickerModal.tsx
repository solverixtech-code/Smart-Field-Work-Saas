import React, { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { Check, ChevronDown, Clock, X } from 'lucide-react';
import { Button } from './Button';

export interface ClockTimePickerModalProps {
  value: string;
  onChange: (value: string) => void;
  options?: string[];
  disabled?: boolean;
  placeholder?: string;
  allowClear?: boolean;
  label?: string;
  className?: string;
  widthClassName?: string;
}

type ClockMode = 'hour' | 'minute';
type Period = 'AM' | 'PM';

const CLOCK_DIAL_SIZE = 192;
const CLOCK_CENTER = CLOCK_DIAL_SIZE / 2;
const HOUR_MARKER_RADIUS = 68;
const MINUTE_MARKER_RADIUS = 76;
const hourLabelOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const minuteLabelOptions = Array.from({ length: 12 }, (_, index) => index * 5);
const clampHour = (hour: number) => Math.min(Math.max(hour, 1), 12);
const clampMinute = (minute: number) => Math.min(Math.max(minute, 0), 59);

const parseTimeParts = (timeStr?: string) => {
  const match = timeStr?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) {
    return { hour: 9, minute: 0, period: 'AM' as Period };
  }

  const hourRaw = Number.parseInt(match[1], 10);
  let period: Period = (match[3] ? match[3].toUpperCase() : 'AM') as Period;
  let hour = hourRaw;

  if (!match[3]) {
    if (hourRaw === 0) {
      hour = 12;
      period = 'AM';
    } else if (hourRaw > 12) {
      hour = hourRaw - 12;
      period = 'PM';
    } else if (hourRaw === 12) {
      period = 'PM';
    }
  }

  return {
    hour: clampHour(hour),
    minute: clampMinute(Number.parseInt(match[2], 10)),
    period,
  };
};

const formatTimeParts = (hour: number, minute: number, period: Period) => {
  const normalizedHour = hour < 1 ? 12 : hour > 12 ? ((hour - 1) % 12) + 1 : hour;
  const normalizedMinute = clampMinute(minute);
  return `${normalizedHour.toString().padStart(2, '0')}:${normalizedMinute
    .toString()
    .padStart(2, '0')} ${period}`;
};

const parseEditableNumber = (value: string) => Number.parseInt(value.replace(/\D/g, ''), 10);

const getDialPosition = (angle: number, radius: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    left: `${CLOCK_CENTER + Math.cos(radians) * radius}px`,
    top: `${CLOCK_CENTER + Math.sin(radians) * radius}px`,
  };
};

const getHourAngle = (hour: number, minute: number) => ((hour % 12) + minute / 60) * 30;
const getMinuteAngle = (minute: number) => minute * 6;
const normalizeAngle = (angle: number) => ((angle % 360) + 360) % 360;
const angleToHour = (angle: number) => {
  const hour = Math.round(normalizeAngle(angle) / 30) % 12;
  return hour === 0 ? 12 : hour;
};
const angleToMinute = (angle: number) => {
  const minute = Math.round(normalizeAngle(angle) / 6) % 60;
  return minute === 60 ? 0 : minute;
};
const getAngleFromPointer = (clientX: number, clientY: number, rect: DOMRect) => {
  const x = clientX - (rect.left + rect.width / 2);
  const y = clientY - (rect.top + rect.height / 2);
  return normalizeAngle((Math.atan2(y, x) * 180) / Math.PI + 90);
};

const DEFAULT_TIME_OPTIONS = [
  '08:00 AM',
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
];

export function ClockTimePickerModal({
  value,
  onChange,
  options = DEFAULT_TIME_OPTIONS,
  disabled = false,
  placeholder = 'Select time',
  allowClear = false,
  label,
  className = '',
  widthClassName = 'w-full',
}: ClockTimePickerModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ClockMode>('hour');
  const [draggingMode, setDraggingMode] = useState<ClockMode | null>(null);
  const dialRef = useRef<HTMLDivElement | null>(null);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  const selectedTime = parseTimeParts(value || options[0] || '09:00 AM');
  const [editingField, setEditingField] = useState<ClockMode | null>(null);
  const [hourInput, setHourInput] = useState(() => selectedTime.hour.toString().padStart(2, '0'));
  const [minuteInput, setMinuteInput] = useState(() => selectedTime.minute.toString().padStart(2, '0'));

  const quickTimes = useMemo(() => {
    const preferred = ['09:00 AM', '11:00 AM', '12:00 PM', '06:00 PM'];
    const available = preferred.filter((time) => options.includes(time));
    return available.length ? available : options.slice(0, 4);
  }, [options]);

  const commit = (hour: number, minute: number, period: Period) => {
    onChange(formatTimeParts(hour, minute, period));
  };

  useEffect(() => {
    if (editingField !== 'hour') {
      setHourInput(selectedTime.hour.toString().padStart(2, '0'));
    }
    if (editingField !== 'minute') {
      setMinuteInput(selectedTime.minute.toString().padStart(2, '0'));
    }
  }, [editingField, selectedTime.hour, selectedTime.minute]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const closePicker = () => {
    setOpen(false);
    setMode('hour');
    setDraggingMode(null);
    setEditingField(null);
  };

  const updateHourInput = (nextValue: string) => {
    const sanitizedValue = nextValue.replace(/\D/g, '').slice(0, 2);
    const nextHour = parseEditableNumber(sanitizedValue);
    setHourInput(
      Number.isNaN(nextHour) ? sanitizedValue : clampHour(nextHour).toString().padStart(2, '0'),
    );
    if (Number.isNaN(nextHour)) {
      return;
    }
    commit(clampHour(nextHour), selectedTime.minute, selectedTime.period);
  };

  const updateMinuteInput = (nextValue: string) => {
    const sanitizedValue = nextValue.replace(/\D/g, '').slice(0, 2);
    if (sanitizedValue === '') {
      setMinuteInput('');
      return;
    }

    const nextMinute = parseEditableNumber(sanitizedValue);
    if (Number.isNaN(nextMinute)) {
      setMinuteInput(sanitizedValue);
      return;
    }

    if (nextMinute > 59) {
      return;
    }

    setMinuteInput(sanitizedValue);
    commit(selectedTime.hour, nextMinute, selectedTime.period);
  };

  const updateFromPointer = (clientX: number, clientY: number, activeMode: ClockMode) => {
    const rect = dialRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const angle = getAngleFromPointer(clientX, clientY, rect);
    if (activeMode === 'hour') {
      commit(angleToHour(angle), selectedTime.minute, selectedTime.period);
      return;
    }

    commit(selectedTime.hour, angleToMinute(angle), selectedTime.period);
  };

  const handleDialPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (disabled) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingMode(mode);
    updateFromPointer(event.clientX, event.clientY, mode);
  };

  const handleDialPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingMode) {
      return;
    }

    event.preventDefault();
    updateFromPointer(event.clientX, event.clientY, draggingMode);
  };

  const handleDialPointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (draggingMode === 'hour') {
      setMode('minute');
    }
    setDraggingMode(null);
  };

  return (
    <div className={`relative font-sans text-xs ${widthClassName} ${className}`}>
      {label && <label className="font-bold text-slate-700 block mb-1">{label}</label>}

      {/* Time Input Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={`w-full flex items-center justify-between rounded-sm border bg-white px-3.5 py-2.5 text-xs font-semibold transition-all cursor-pointer shadow-xs ${
          open
            ? 'border-[#0D1F3D] ring-1 ring-[#0D1F3D]'
            : 'border-slate-200 hover:border-slate-300'
        } ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''}`}
      >
        <span className="flex items-center gap-2 truncate">
          <Clock className="h-4 w-4 text-[#0D1F3D] shrink-0" />
          <span className={value ? 'text-[#0D1F3D] font-bold' : 'text-slate-400 font-medium'}>
            {value || placeholder}
          </span>
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
      </button>

      {/* Center Screen Centered Modal Dialog Overlay */}
      {open && !disabled && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn"
          onClick={(e) => {
            if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
              closePicker();
            }
          }}
        >
          <div
            ref={modalContentRef}
            className="relative w-full max-w-[340px] rounded-sm border border-slate-200 bg-white p-4 shadow-2xl animate-dropdown space-y-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Dialog Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-sm font-extrabold text-[#0D1F3D]">Clock Time Picker</h3>
                <p className="text-[11px] text-slate-500 font-medium">Select hour & minute</p>
              </div>
              <button
                type="button"
                onClick={closePicker}
                className="rounded-sm p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Digital Time Display & AM/PM Toggle */}
            <div className="rounded-sm border border-slate-200 bg-slate-50/90 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editingField === 'hour' ? hourInput : selectedTime.hour.toString().padStart(2, '0')}
                    maxLength={2}
                    className={`h-10 w-11 rounded-sm border-0 bg-transparent text-center text-2xl font-extrabold leading-none text-[#0D1F3D] outline-none transition-colors ${
                      mode === 'hour' ? 'bg-blue-100/80 text-[#0D1F3D] ring-2 ring-[#0D1F3D]' : 'hover:bg-slate-200/60'
                    }`}
                    onChange={(e) => updateHourInput(e.target.value)}
                    onFocus={(e) => {
                      setMode('hour');
                      setEditingField('hour');
                      e.currentTarget.select();
                    }}
                    onBlur={() => setEditingField(null)}
                  />
                  <span className="text-2xl font-extrabold text-slate-400">:</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editingField === 'minute' ? minuteInput : selectedTime.minute.toString().padStart(2, '0')}
                    maxLength={2}
                    className={`h-10 w-11 rounded-sm border-0 bg-transparent text-center text-2xl font-extrabold leading-none text-[#0D1F3D] outline-none transition-colors ${
                      mode === 'minute' ? 'bg-blue-100/80 text-[#0D1F3D] ring-2 ring-[#0D1F3D]' : 'hover:bg-slate-200/60'
                    }`}
                    onChange={(e) => updateMinuteInput(e.target.value)}
                    onFocus={(e) => {
                      setMode('minute');
                      setEditingField('minute');
                      e.currentTarget.select();
                    }}
                    onBlur={() => setEditingField(null)}
                  />
                </div>

                {/* AM / PM Toggle Buttons */}
                <div className="grid grid-cols-2 gap-1 rounded-sm border border-slate-200 bg-white p-1">
                  {(['AM', 'PM'] as const).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => commit(selectedTime.hour, selectedTime.minute, period)}
                      className={`h-8 px-3 text-xs font-extrabold rounded-sm transition-all cursor-pointer ${
                        selectedTime.period === period
                          ? 'bg-[#0D1F3D] text-white shadow-xs'
                          : 'text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hour / Minute Mode Switcher */}
            <div className="grid grid-cols-2 gap-2">
              {(['hour', 'minute'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setMode(tab)}
                  className={`py-1.5 text-xs font-bold rounded-sm border transition-all cursor-pointer ${
                    mode === tab
                      ? 'border-[#0D1F3D] bg-blue-50 text-[#0D1F3D]'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tab === 'hour' ? 'Hour' : 'Minute'}
                </button>
              ))}
            </div>

            {/* Interactive Dial */}
            <div className="rounded-sm border border-slate-200 bg-slate-50/50 p-3">
              <div
                ref={dialRef}
                className="relative mx-auto h-[192px] w-[192px] touch-none select-none rounded-full border border-slate-200 bg-white shadow-xs cursor-pointer"
                onPointerDown={handleDialPointerDown}
                onPointerMove={handleDialPointerMove}
                onPointerUp={handleDialPointerEnd}
                onPointerCancel={handleDialPointerEnd}
              >
                <div className="absolute inset-[16px] rounded-full border border-dashed border-slate-200" />
                <div className="absolute inset-[34px] rounded-full border border-slate-100" />

                {/* Minute Markers */}
                {minuteLabelOptions.map((minute) => {
                  const active = mode === 'minute' && selectedTime.minute === minute;
                  return (
                    <button
                      key={`minute-${minute}`}
                      type="button"
                      className={`absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full p-0 text-[10.5px] font-extrabold transition-all cursor-pointer ${
                        mode === 'minute'
                          ? active
                            ? 'bg-[#E20613] text-white shadow-md scale-110'
                            : 'text-slate-500 hover:bg-slate-100'
                          : 'pointer-events-none opacity-0'
                      }`}
                      style={getDialPosition(getMinuteAngle(minute), MINUTE_MARKER_RADIUS)}
                      onClick={() => commit(selectedTime.hour, minute, selectedTime.period)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </button>
                  );
                })}

                {/* Hour Markers */}
                {hourLabelOptions.map((hour) => {
                  const active = mode === 'hour' && selectedTime.hour === hour;
                  return (
                    <button
                      key={`hour-${hour}`}
                      type="button"
                      className={`absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full p-0 text-xs font-extrabold transition-all cursor-pointer ${
                        mode === 'hour'
                          ? active
                            ? 'bg-[#0D1F3D] text-white shadow-md scale-110'
                            : 'text-slate-700 hover:bg-slate-100'
                          : 'pointer-events-none opacity-0'
                      }`}
                      style={getDialPosition(hour * 30, HOUR_MARKER_RADIUS)}
                      onClick={() => {
                        commit(hour, selectedTime.minute, selectedTime.period);
                        setMode('minute');
                      }}
                    >
                      {hour}
                    </button>
                  );
                })}

                {/* Hour Hand Pointer */}
                <div
                  className={`absolute left-1/2 top-1/2 w-[3.5px] origin-bottom rounded-full bg-[#0D1F3D] ${
                    draggingMode ? '' : 'transition-transform duration-200'
                  }`}
                  style={{
                    height: '48px',
                    transform: `translateX(-50%) translateY(-100%) rotate(${getHourAngle(
                      selectedTime.hour,
                      selectedTime.minute,
                    )}deg)`,
                  }}
                />

                {/* Minute Hand Pointer */}
                <div
                  className={`absolute left-1/2 top-1/2 w-[2.5px] origin-bottom rounded-full bg-[#E20613] ${
                    draggingMode ? '' : 'transition-transform duration-200'
                  }`}
                  style={{
                    height: '66px',
                    transform: `translateX(-50%) translateY(-100%) rotate(${getMinuteAngle(
                      selectedTime.minute,
                    )}deg)`,
                  }}
                />

                {/* Center Dot */}
                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#0D1F3D]" />
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-1.5">
              <p className="text-[10.5px] font-extrabold text-slate-500">Quick Presets</p>
              <div className="flex flex-wrap gap-1.5">
                {quickTimes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onChange(t);
                      closePicker();
                    }}
                    className={`flex items-center gap-1 rounded-sm px-2.5 py-1 text-xs font-bold border transition-all cursor-pointer ${
                      value === t
                        ? 'border-[#0D1F3D] bg-[#0D1F3D] text-white shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {t}
                    {value === t && <Check className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Dialog Action Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              {allowClear && value ? (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors"
                >
                  Clear
                </button>
              ) : <div />}

              <Button
                type="button"
                variant="accent"
                size="sm"
                onClick={closePicker}
                className="h-8 px-4 text-xs font-bold bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-sm"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
