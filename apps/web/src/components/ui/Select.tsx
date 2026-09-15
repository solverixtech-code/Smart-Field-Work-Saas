import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  avatar?: string;
  sublabel?: string;
  badge?: {
    text: string;
    variant?: 'purple' | 'blue' | 'emerald' | 'amber' | 'slate';
  };
}

const getOptionBadgeAndCleanLabel = (opt?: SelectOption) => {
  if (!opt) return { badge: null, cleanLabel: '' };
  if (opt.badge) {
    return { badge: opt.badge, cleanLabel: opt.label };
  }
  if (opt.label.startsWith('[LEAD]')) {
    return {
      badge: { text: 'LEAD', variant: 'purple' as const },
      cleanLabel: opt.label.replace('[LEAD]', '').trim(),
    };
  }
  if (opt.label.startsWith('[BUSINESS]')) {
    return {
      badge: { text: 'BUSINESS', variant: 'blue' as const },
      cleanLabel: opt.label.replace('[BUSINESS]', '').trim(),
    };
  }
  return { badge: null, cleanLabel: opt.label };
};

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
  searchable?: boolean;
  native?: boolean;
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
      searchable = true,
      native = false,
      children,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [internalValue, setInternalValue] = useState(propValue || defaultValue || '');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
      if (!searchQuery.trim()) return parsedOptions;
      return parsedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim()),
      );
    }, [parsedOptions, searchQuery]);

    // Find active selected label
    const selectedOption = parsedOptions.find((opt) => String(opt.value) === String(currentValue));
    const selectedParsed = getOptionBadgeAndCleanLabel(selectedOption);

    // Auto-focus search input when dropdown opens
    useEffect(() => {
      if (isOpen) {
        setSearchQuery('');
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }, [isOpen]);

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
      setSearchQuery('');

      if (onChange) {
        // Create synthetic event payload matching standard select onChange handler
        const event = {
          target: { value: val, name: name || id || '' },
        };
        onChange(event as any);
      }
    };

    if (native) return <div className="w-full space-y-1.5">
      {label && <label htmlFor={id} className="block text-xs font-semibold text-slate-700">{label}</label>}
      <select id={id} name={name} value={currentValue} disabled={disabled} onChange={onChange} aria-invalid={Boolean(error)}
        className={`h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-60 ${className}`}>
        <option value="">{placeholder}</option>
        {parsedOptions.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    </div>;
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
          className={`w-full flex items-center justify-between rounded-sm border bg-white py-2.5 text-xs font-semibold text-[#0D1F3D] transition-all cursor-pointer h-10 shrink-0 ${
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

          <div className="flex items-center gap-2 truncate text-left">
            {selectedOption?.avatar && (
              <img
                src={selectedOption.avatar}
                alt=""
                className="h-5 w-5 rounded-full object-cover shrink-0 border border-slate-200"
              />
            )}
            {selectedParsed.badge && (
              <span
                className={`rounded-xs px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase shrink-0 border ${
                  selectedParsed.badge.variant === 'purple'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : selectedParsed.badge.variant === 'blue'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {selectedParsed.badge.text}
              </span>
            )}
            <span
              className={`truncate ${
                !selectedOption ? 'text-slate-400 font-medium' : 'text-[#0D1F3D] font-bold'
              }`}
            >
              {selectedOption ? selectedParsed.cleanLabel : placeholder}
            </span>
          </div>

          <ChevronDown
            className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#0D1F3D]' : ''
            }`}
          />
        </button>

        {/* Custom Dropdown Popover Listbox with Search Bar */}
        {isOpen && !disabled && (
          <div className="absolute left-0 top-full mt-1 z-50 w-full min-w-[200px] rounded-sm border border-slate-200/90 bg-white p-1.5 shadow-xl animate-dropdown max-h-64 flex flex-col space-y-1 text-left">
            {/* Search Bar on top of the dropdown card */}
            {searchable && (
              <div className="relative p-1 border-b border-slate-100 mb-0.5">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search options..."
                  className="w-full rounded-sm border border-slate-200 bg-slate-50/80 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="overflow-y-auto custom-scrollbar flex-1 space-y-0.5 max-h-48">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(currentValue);
                  const parsed = getOptionBadgeAndCleanLabel(opt);
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
                      <div className="flex items-center gap-2.5 truncate">
                        {opt.avatar && (
                          <img
                            src={opt.avatar}
                            alt=""
                            className="h-6 w-6 rounded-full object-cover shrink-0 border border-slate-200"
                          />
                        )}
                        <div className="truncate text-left flex flex-col justify-center">
                          <div className="flex items-center gap-2 truncate">
                            {parsed.badge && (
                              <span
                                className={`rounded-xs px-1.5 py-0.2 text-[9px] font-extrabold tracking-wide uppercase shrink-0 border ${
                                  parsed.badge.variant === 'purple'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : parsed.badge.variant === 'blue'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                {parsed.badge.text}
                              </span>
                            )}
                            <span className="truncate font-bold text-[#0D1F3D]">{parsed.cleanLabel}</span>
                          </div>
                          {opt.sublabel && (
                            <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                              {opt.sublabel}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#0D1F3D] shrink-0 ml-2" />}
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-3 text-xs text-slate-400 font-medium text-center">
                  No matching options found
                </div>
              )}
            </div>
          </div>
        )}

        {error && <p className="text-[11px] font-medium text-rose-500">{error}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';
