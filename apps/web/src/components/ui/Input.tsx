import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-[#0B2E6B]">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={`h-10 w-full rounded-sm border bg-[#F8FAFC] text-xs font-semibold text-[#0D1F3D] transition-all placeholder:text-slate-400 focus:border-[#0D1F3D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D1F3D] ${
              leftIcon ? 'pl-9' : 'px-3.5'
            } ${rightIcon ? 'pr-9' : 'pr-3.5'} ${
              error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : 'border-slate-200'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
