import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  options?: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { value: string; name?: string } } | React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  leftIcon?: React.ReactNode;
  id?: string;
  name?: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      className = '',
      label,
      error,
      options: passedOptions,
      value: propValue,
      defaultValue,
      onChange,
      placeholder = 'Select option',
      leftIcon,
      id,
      name,
      disabled = false,
      children,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(propValue || defaultValue || '');
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync external controlled value if provided
    const currentValue = propValue !== undefined ? propValue : internalValue;

    // Convert children <option> tags to SelectOption if options prop is not explicitly passed
    const parsedOptions: SelectOption[] = React.useMemo(() => {
      if (passedOptions && passedOptions.length > 0) return passedOptions;

      const opts: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === 'option') {
          const val = child.props.value !== undefined ? String(child.props.value) : '';
          const lbl = String(child.props.children || val);
          opts.push({ value: val, label: lbl });
        }
      });
      return opts;
    }, [passedOptions, children]);

    // Find active selected label
    const selectedOption = parsedOptions.find((opt) => String(opt.value) === String(currentValue));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (val: string) => {
      if (disabled) return;
      setInternalValue(val);
      setIsOpen(false);

      if (onChange) {
        // Create synthetic event payload matching standard select onChange handler
        const event = {
          target: { value: val, name: name || id || '' },
        };
        onChange(event as any);
      }
    };

    return (
      <div ref={containerRef} className="w-full space-y-1 relative font-sans text-xs">
        {label && (
          <label htmlFor={id} className="font-bold text-slate-700 text-xs block">
            {label}
          </label>
        )}

        {/* Custom Select Trigger Button */}
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between rounded-sm border bg-white py-2.5 text-xs font-semibold text-[#0D1F3D] transition-all cursor-pointer ${
            leftIcon ? 'pl-10 pr-9' : 'px-3.5'
          } ${
            error
              ? 'border-rose-300 focus:border-rose-500'
              : isOpen
              ? 'border-[#0D1F3D] ring-1 ring-[#0D1F3D]'
              : 'border-slate-200 hover:border-slate-300'
          } ${disabled ? 'bg-slate-50 cursor-not-allowed opacity-60' : ''} ${className}`}
        >
          {leftIcon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <span className={`truncate text-left ${!selectedOption ? 'text-slate-400 font-medium' : 'text-[#0D1F3D] font-bold'}`}>
            {displayLabel}
          </span>

          <ChevronDown
            className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#0D1F3D]' : ''
            }`}
          />
        </button>

        {/* Custom Dropdown Popover Listbox */}
        {isOpen && !disabled && (
          <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-[180px] rounded-sm border border-slate-200/90 bg-white p-1 shadow-xl animate-dropdown max-h-60 overflow-y-auto custom-scrollbar space-y-0.5 text-left">
            {parsedOptions.length > 0 ? (
              parsedOptions.map((opt) => {
                const isSelected = String(opt.value) === String(currentValue);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-100 text-[#0D1F3D] font-extrabold'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#0D1F3D]'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#0D1F3D] shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-xs text-slate-400 font-medium text-center">
                No options available
              </div>
            )}
          </div>
        )}

        {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
