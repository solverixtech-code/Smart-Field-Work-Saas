import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, checked, onChange, id, disabled, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <label
        htmlFor={inputId}
        className={`inline-flex items-center gap-2.5 select-none cursor-pointer group ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
            {...props}
          />
          <div
            className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-150 group-focus-within:ring-2 group-focus-within:ring-[#00C2A8] group-focus-within:ring-offset-1 ${
              checked
                ? 'border-[#0B2E6B] bg-[#0B2E6B] text-white shadow-sm shadow-[#0B2E6B]/20'
                : 'border-slate-300 bg-white group-hover:border-[#0B2E6B] group-hover:bg-slate-50'
            }`}
          >
            <Check
              className={`h-3 w-3 stroke-[3] text-white transition-all duration-150 ${
                checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
              }`}
            />
          </div>
        </div>
        {label && (
          <span className="text-xs font-medium leading-none text-slate-600 transition-colors group-hover:text-slate-900">
            {label}
          </span>
        )}
      </label>
    );
  },
);

Checkbox.displayName = 'Checkbox';
