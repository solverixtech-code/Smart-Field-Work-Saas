import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  MapPin,
  DollarSign,
  PieChart,
  Radio,
} from 'lucide-react';
import { Role } from '@visiblo/shared';

export interface DashboardTabItem {
  label: string;
  to: string;
  icon: React.ElementType;
  allowedRoles: Role[];
}

const dashboardTabs: DashboardTabItem[] = [
  {
    label: 'Executive Overview',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [Role.SUPER_ADMIN, Role.ADMIN],
  },
  {
    label: 'Sales Performance',
    to: '/admin/dashboard/sales',
    icon: TrendingUp,
    allowedRoles: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.TEAM_LEADER],
  },
  {
    label: 'Field Activity',
    to: '/admin/dashboard/field',
    icon: MapPin,
    allowedRoles: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.TEAM_LEADER],
  },
  {
    label: 'Revenue & Finance',
    to: '/admin/dashboard/revenue',
    icon: DollarSign,
    allowedRoles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE_OPS],
  },
  {
    label: 'Conversion Funnel',
    to: '/admin/dashboard/conversions',
    icon: PieChart,
    allowedRoles: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER],
  },
  {
    label: 'Real-time Activity',
    to: '/admin/dashboard/live',
    icon: Radio,
    allowedRoles: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.TEAM_LEADER],
  },
];

interface DashboardTabsProps {
  currentRole?: Role;
}

export const DashboardTabs: React.FC<DashboardTabsProps> = ({ currentRole }) => {
  const visibleTabs = dashboardTabs.filter(
    (tab) => !currentRole || tab.allowedRoles.includes(currentRole),
  );

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/admin/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-sm px-3.5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#0B2E6B] text-white shadow-sm shadow-[#0B2E6B]/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-[#0B2E6B]'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
};
