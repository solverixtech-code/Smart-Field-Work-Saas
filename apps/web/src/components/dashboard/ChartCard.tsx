import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  actionText?: string;
  onActionClick?: () => void;
  periodOptions?: string[];
  selectedPeriod?: string;
  onPeriodChange?: (period: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  actionText,
  onActionClick,
  periodOptions = ['This Week', 'This Month', 'This Quarter', 'This Year'],
  selectedPeriod = 'This Month',
  onPeriodChange,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ${className}`}>
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#0B2E6B]">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {periodOptions && onPeriodChange && (
            <div className="relative inline-block">
              <select
                value={selectedPeriod}
                onChange={(e) => onPeriodChange(e.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 pr-8 text-xs font-semibold text-[#0B2E6B] transition-all focus:border-[#00C2A8] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#00C2A8]"
              >
                {periodOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            </div>
          )}

          {actionText && (
            <button
              type="button"
              onClick={onActionClick}
              className="text-xs font-semibold text-[#00C2A8] hover:underline"
            >
              {actionText}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1">{children}</div>
    </div>
  );
};
