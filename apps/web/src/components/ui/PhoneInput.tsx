import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CountryCode {
  code: string;
  flagUrl: string;
  dial: string;
  name: string;
  length: number;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: 'IN', flagUrl: 'https://flagcdn.com/24x18/in.png', dial: '+91', name: 'India', length: 10 },
  { code: 'US', flagUrl: 'https://flagcdn.com/24x18/us.png', dial: '+1', name: 'United States', length: 10 },
  { code: 'AE', flagUrl: 'https://flagcdn.com/24x18/ae.png', dial: '+971', name: 'United Arab Emirates', length: 9 },
  { code: 'GB', flagUrl: 'https://flagcdn.com/24x18/gb.png', dial: '+44', name: 'United Kingdom', length: 10 },
];

export function CountryFlag({ code, flagUrl }: { code: string; flagUrl?: string }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError && flagUrl) {
    return (
      <img
        src={flagUrl}
        alt={code}
        onError={() => setImgError(true)}
        className="w-5 h-3.5 object-cover rounded-xs border border-slate-200/80 shadow-2xs shrink-0"
      />
    );
  }

  switch (code) {
    case 'IN':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="6.67" fill="#FF9933" />
          <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
          <rect y="13.33" width="30" height="6.67" fill="#138808" />
          <circle cx="15" cy="10" r="2.2" fill="none" stroke="#000080" strokeWidth="0.8" />
        </svg>
      );
    case 'US':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="20" fill="#B22234" />
          <path d="M0 3h30M0 6.2h30M0 9.4h30M0 12.6h30M0 15.8h30M0 19h30" stroke="#FFFFFF" strokeWidth="1.5" />
          <rect width="12" height="10.8" fill="#3C3B6E" />
        </svg>
      );
    case 'AE':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="6.67" fill="#00732F" />
          <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
          <rect y="13.33" width="30" height="6.67" fill="#000000" />
          <rect width="7.5" height="20" fill="#FF0000" />
        </svg>
      );
    case 'GB':
      return (
        <svg className="w-5 h-3.5 rounded-xs border border-slate-200 shrink-0" viewBox="0 0 30 20">
          <rect width="30" height="20" fill="#012169" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.5" />
          <path d="M15 0v20M0 10h30" stroke="#FFFFFF" strokeWidth="5" />
          <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3" />
        </svg>
      );
    default:
      return <span className="text-xs font-bold text-slate-600">{code}</span>;
  }
}

export interface PhoneInputProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  defaultCountryCode?: string;
}

export function PhoneInput({
  id,
  label,
  value = '',
  onChange,
  placeholder = '98765 43210',
  error,
  required,
  disabled = false,
  className = '',
  defaultCountryCode = 'IN',
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    COUNTRY_CODES.find((c) => c.code === defaultCountryCode) || COUNTRY_CODES[0]
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect if incoming value has country code like +91
  let displayDigits = value || '';
  if (displayDigits.startsWith(selectedCountry.dial)) {
    displayDigits = displayDigits.slice(selectedCountry.dial.length).trim();
  } else {
    // Check if it matches any dial code in list
    const matchedCountry = COUNTRY_CODES.find((c) => displayDigits.startsWith(c.dial));
    if (matchedCountry && matchedCountry.code !== selectedCountry.code) {
      setSelectedCountry(matchedCountry);
      displayDigits = displayDigits.slice(matchedCountry.dial.length).trim();
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation keys, backspace, delete, tab
    if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    // Allow copy/paste/select all
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
    // Block non-digit keys strictly
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, selectedCountry.length);
    onChange(digitsOnly);
  };

  return (
    <div className={`w-full space-y-1.5 font-sans relative ${className}`} ref={dropdownRef}>
      {label && (
        <label htmlFor={id} className="block text-xs font-extrabold text-[#0D1F3D]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div
        className={`flex h-10 w-full rounded-md border bg-[#F8FAFC] overflow-hidden transition-all focus-within:border-[#0D1F3D] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#0D1F3D] ${
          error ? 'border-rose-300 focus-within:border-rose-500 focus-within:ring-rose-500' : 'border-slate-200'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-slate-100/90 border-r border-slate-200 px-3 flex items-center text-xs font-extrabold text-[#0D1F3D] gap-1.5 shrink-0 hover:bg-slate-200/80 cursor-pointer transition-colors"
        >
          <CountryFlag code={selectedCountry.code} flagUrl={selectedCountry.flagUrl} />
          <span className="font-bold">{selectedCountry.dial}</span>
          <ChevronDown className={`h-3 w-3 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={selectedCountry.length}
          placeholder={placeholder}
          value={displayDigits}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          className="flex-1 px-3.5 text-xs font-semibold text-[#0D1F3D] bg-transparent placeholder-slate-400 placeholder:font-medium focus:outline-none"
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-[9999] w-64 rounded-md border border-slate-200 bg-white p-1.5 shadow-2xl space-y-0.5 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1.5 border-b border-slate-100 mb-1">
            <p className="text-[10px] font-extrabold text-[#0D1F3D] uppercase tracking-wider">Select Country Code</p>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
            {COUNTRY_CODES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => {
                  setSelectedCountry(c);
                  setIsOpen(false);
                  onChange(displayDigits);
                }}
                className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  selectedCountry.code === c.code
                    ? 'bg-[#0D1F3D] text-white font-extrabold shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CountryFlag code={c.code} flagUrl={c.flagUrl} />
                  <span>{c.name}</span>
                </div>
                <span className="font-mono text-[11px] opacity-90">{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
    </div>
  );
}
