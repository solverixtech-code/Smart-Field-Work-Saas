import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MapKpiCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export const MapKpiCard: React.FC<MapKpiCardProps> = ({
  title,
  value,
  subValue,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconTextColor = 'text-blue-600',
  change,
  changeType = 'positive',
}) => {
  return (
    <div className="flex items-center gap-3 rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs transition-all hover:shadow-md min-w-0">
      <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-sm ${iconBgColor} ${iconTextColor}`}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex flex-1 flex-col justify-between min-w-0 overflow-hidden text-left">
        <span className="text-[11px] font-extrabold text-slate-500 truncate" title={title}>
          {title}
        </span>

        <h3 className="text-xl font-extrabold tracking-tight text-[#0D1F3D] leading-snug my-0.5 truncate">
          {value}
        </h3>

        {(subValue || change) && (
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
                ▲ {change}
              </span>
            )}
            {subValue && <span className="text-slate-500 font-bold truncate">{subValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
