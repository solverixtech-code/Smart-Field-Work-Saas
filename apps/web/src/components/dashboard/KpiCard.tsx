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
  timeframe,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconTextColor = 'text-blue-600',
  subValue,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition-all hover:shadow-md min-w-0">
      {/* Circular Left Icon Badge */}
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${iconBgColor} ${iconTextColor}`}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Right Column Content */}
      <div className="flex flex-1 flex-col justify-between min-w-0 overflow-hidden">
        {/* Title + 3 dots */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[11px] font-extrabold text-slate-500 truncate" title={title}>
            {title}
          </span>
          <button
            type="button"
            className="flex-shrink-0 text-slate-300 hover:text-slate-500 transition-colors"
            title="Options"
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Value */}
        <h3 className="text-xl font-extrabold tracking-tight text-[#0D1F3D] leading-snug my-0.5 truncate">
          {value}
        </h3>

        {/* Trend / Subtext */}
        {(change || subValue || timeframe) && (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold truncate">
            {change && (
              <span
                className={`font-extrabold flex-shrink-0 ${
                  changeType === 'positive'
                    ? 'text-emerald-600'
                    : changeType === 'negative'
                      ? 'text-[#E20613]'
                      : 'text-slate-600'
                }`}
              >
                ↑ {change}
              </span>
            )}
            {timeframe && <span className="text-slate-400 font-medium truncate">{timeframe}</span>}
            {subValue && <span className="text-slate-600 font-bold truncate">{subValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
