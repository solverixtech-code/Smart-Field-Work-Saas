import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Puzzle, Boxes, GitBranch } from 'lucide-react';

export function ModuleSectionNavigation() {
  const location = useLocation();

  const tabs = [
    {
      label: 'Modules',
      to: '/platform/modules',
      icon: Puzzle,
      exact: true,
    },
    {
      label: 'Feature Registry',
      to: '/platform/modules/features',
      icon: Boxes,
      exact: false,
    },
    {
      label: 'Dependency Map',
      to: '/platform/modules/dependencies',
      icon: GitBranch,
      exact: false,
    },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3 font-sans">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.exact
          ? location.pathname === tab.to
          : location.pathname.startsWith(tab.to);

        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={`flex items-center gap-2 rounded-sm px-4 py-2 text-xs transition-all cursor-pointer ${
              isActive
                ? 'bg-[#0D1F3D] text-white font-extrabold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:text-[#0D1F3D]'
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
