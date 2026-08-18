import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
  leftIcon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, children, leftIcon, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1">
        {label && (
          <label htmlFor={id} className="font-bold text-slate-700 text-xs block">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <select
            id={id}
            ref={ref}
            className={`w-full appearance-none rounded-md border bg-white py-2.5 text-xs font-semibold text-[#0D1F3D] transition-all cursor-pointer placeholder:text-slate-400 focus:border-purple-600 focus:outline-none ${
              leftIcon ? 'pl-10 pr-9' : 'pl-3.5 pr-9'
            } ${
              error ? 'border-rose-300 focus:border-rose-500' : 'border-slate-200'
            } ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>

          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
