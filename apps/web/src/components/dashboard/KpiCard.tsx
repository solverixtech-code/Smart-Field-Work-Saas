import React from 'react';
import { MoreVertical, LucideIcon } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  timeframe?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
  subValue?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  change,
  changeType = 'positive',
  timeframe = 'from last week',
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconTextColor = 'text-blue-600',
  subValue,
}) => {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      {/* Circular Left Icon Badge */}
      <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${iconBgColor} ${iconTextColor}`}>
        <Icon className="h-6 w-6" />
      </div>

      {/* Right Column Content */}
      <div className="flex flex-1 flex-col justify-between overflow-hidden">
        {/* Title + 3 dots */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-semibold text-slate-500 truncate">{title}</span>
          <button
            type="button"
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            title="Options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>

        {/* Value */}
        <h3 className="text-2xl font-extrabold tracking-tight text-[#0B2E6B] leading-snug my-0.5">
          {value}
        </h3>

        {/* Trend / Subtext */}
        {(change || subValue) && (
          <div className="flex items-center gap-1 text-[11px] font-semibold">
            {change && (
              <span
                className={`font-bold ${
                  changeType === 'positive'
                    ? 'text-emerald-600'
                    : changeType === 'negative'
                      ? 'text-rose-600'
                      : 'text-slate-600'
                }`}
              >
                ↑ {change}
              </span>
            )}
            {timeframe && <span className="text-slate-400 font-medium">{timeframe}</span>}
            {subValue && <span className="text-slate-600 font-semibold">{subValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
