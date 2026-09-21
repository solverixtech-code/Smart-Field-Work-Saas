import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftAddon?: React.ReactNode;
  allowLetters?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      label,
      error,
      leftIcon,
      rightIcon,
      leftAddon,
      type,
      id,
      onChange,
      onKeyDown,
      allowLetters = true,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === 'tel') {
        // Strip letters and non-numeric characters except digits, spaces, plus and hyphen
        e.target.value = e.target.value.replace(/[^\d\s+-]/g, '');
      } else if (type === 'number' && !allowLetters) {
        e.target.value = e.target.value.replace(/[^\d.]/g, '');
      }
      onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (type === 'tel' || (type === 'number' && !allowLetters)) {
        // Prevent typing alphabetic characters A-Z / a-z except control shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Backspace, Tab, Enter, Arrows)
        if (
          e.key.length === 1 &&
          /[a-zA-Z]/.test(e.key) &&
          !e.ctrlKey &&
          !e.metaKey
        ) {
          e.preventDefault();
        }
      }
      onKeyDown?.(e);
    };

    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && (
          <label htmlFor={id} className="block text-xs font-extrabold text-[#0D1F3D]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftAddon && (
            <div className="flex h-10 items-center justify-center rounded-l-md border border-r-0 border-slate-200 bg-slate-100 px-3 text-xs font-extrabold text-[#0D1F3D] shrink-0">
              {leftAddon}
            </div>
          )}
          <div className="relative w-full">
            {leftIcon && (
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                {leftIcon}
              </div>
            )}
            <input
              id={id}
              ref={ref}
              type={type}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className={`h-10 w-full bg-[#F8FAFC] text-xs font-semibold text-[#0D1F3D] transition-all placeholder:text-slate-400 placeholder:font-medium focus:border-[#0D1F3D] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0D1F3D] ${
                leftAddon
                  ? 'rounded-r-md border border-slate-200'
                  : 'rounded-md border border-slate-200'
              } ${leftIcon ? 'pl-9' : 'px-3.5'} ${rightIcon ? 'pr-9' : 'pr-3.5'} ${
                error ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : ''
              } ${className}`}
              {...props}
            />
            {rightIcon && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                {rightIcon}
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

