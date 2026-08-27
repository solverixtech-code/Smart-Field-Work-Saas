import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Sparkles,
  ClipboardList,
  Layers,
  Sliders,
  Globe,
  Users,
  Shield,
  FileText,
  CreditCard,
  Receipt,
  ArrowRightLeft,
  PieChart,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { usePlatformPermissions } from '../features/platform/tenants/hooks/usePlatformPermissions';
import { PlatformRole } from '../features/platform/tenants/types/platform.types';

export default function PlatformShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeRole, setActiveRole] = useState<PlatformRole>('PLATFORM_SUPER_ADMIN');
  const { role, setRole, canCreateTenant, hasPlatformPermission } = usePlatformPermissions(activeRole);

  const handleRoleChange = (newRole: PlatformRole) => {
    setActiveRole(newRole);
    setRole(newRole);
  };

  const navGroups = [
    {
      title: 'Platform Overview',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, to: '/platform/dashboard', permission: 'platform.dashboard.view' as const },
      ],
    },
    {
      title: 'Tenant Management',
      items: [
        { label: 'All Tenants', icon: Building2, to: '/platform/tenants', badge: '5 Tenants', permission: 'platform.tenants.view' as const },
        { label: 'Create Tenant', icon: PlusCircle, to: '/platform/tenants/create', badge: 'Wizard', permission: 'platform.tenants.create' as const },
        { label: 'Tenant Onboarding', icon: Sparkles, to: '/platform/tenants/onboarding', permission: 'platform.tenants.view' as const },
        { label: 'Tenant Requests', icon: ClipboardList, to: '/platform/tenants/requests', badge: '3 Pending', permission: 'platform.tenants.view' as const },
      ],
    },
    {
      title: 'Platform Management',
      items: [
        { label: 'Plans & Pricing', icon: Layers, to: '/platform/plans', permission: 'platform.tenants.view' as const },
        { label: 'Modules & Features', icon: Sliders, to: '/platform/modules', permission: 'platform.tenants.modules.manage' as const },
        { label: 'Industries', icon: Globe, to: '/platform/industries', badge: '25+ Listed', permission: 'platform.tenants.view' as const },
        { label: 'Platform Users', icon: Users, to: '/platform/users', permission: 'platform.users.manage' as const },
        { label: 'Roles & Permissions', icon: Shield, to: '/platform/roles', permission: 'platform.users.manage' as const },
        { label: 'Audit Logs', icon: FileText, to: '/platform/audit', permission: 'platform.audit.view' as const },
      ],
    },
    {
      title: 'Billing & Finance',
      items: [
        { label: 'Subscriptions', icon: CreditCard, to: '/platform/subscriptions', permission: 'platform.subscriptions.view' as const },
        { label: 'Invoices', icon: Receipt, to: '/platform/invoices', permission: 'platform.billing.view' as const },
        { label: 'Transactions', icon: ArrowRightLeft, to: '/platform/transactions', permission: 'platform.billing.view' as const },
        { label: 'Reports', icon: PieChart, to: '/platform/reports', permission: 'platform.billing.view' as const },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900 antialiased overflow-hidden">
      {/* Platform Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-[#0A1324] text-white flex flex-col justify-between shadow-xl">
        <div>
          {/* Header Branding */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-md bg-[#E20613] flex items-center justify-center font-extrabold text-white text-sm shadow-sm">
                SF
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-tight leading-none">Smart Field Work</h2>
                <span className="inline-flex items-center gap-1 mt-1 rounded-sm bg-indigo-950 px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-300 border border-indigo-800/80">
                  <Shield className="h-2.5 w-2.5" /> PLATFORM CONSOLE
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  {group.title}
                </p>
                {group.items.map((item) => {
                  const isAllowed = hasPlatformPermission(item.permission);
                  const isActive = location.pathname === item.to || (item.to !== '/platform/dashboard' && location.pathname.startsWith(item.to + '/'));
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={isAllowed ? item.to : '#'}
                      onClick={(e) => {
                        if (!isAllowed) e.preventDefault();
                      }}
                      className={`flex items-center justify-between rounded-sm px-3 py-2 text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#E20613] text-white shadow-xs'
                          : isAllowed
                          ? 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                          : 'text-slate-500 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-sm ${
                          isActive ? 'bg-white text-[#E20613]' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Platform User Profile Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#070D1A]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-extrabold text-white text-xs">
                PA
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">Platform Admin</p>
                <p className="text-[10px] text-slate-400 truncate">{activeRole.replace('PLATFORM_', '')}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              title="Switch to Tenant CRM"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">Platform Context:</span>
            <span className="bg-slate-100 text-[#0D1F3D] font-extrabold px-2.5 py-1 rounded-sm text-xs border border-slate-200 flex items-center gap-1.5">
              🌐 Smart Field Work Multi-Tenant SaaS Engine
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Switcher Simulator for UI Testing */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Test Role:</span>
              <select
                value={activeRole}
                onChange={(e) => handleRoleChange(e.target.value as PlatformRole)}
                className="rounded-sm border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-[#0D1F3D] focus:border-[#E20613] focus:outline-none"
              >
                <option value="PLATFORM_SUPER_ADMIN">SUPER ADMIN (Full Access)</option>
                <option value="PLATFORM_OPERATIONS_ADMIN">OPERATIONS ADMIN</option>
                <option value="PLATFORM_ONBOARDING">ONBOARDING ADMIN</option>
                <option value="PLATFORM_SUPPORT">SUPPORT AGENT (No Create)</option>
                <option value="PLATFORM_BILLING">BILLING ADMIN</option>
                <option value="PLATFORM_AUDITOR">AUDITOR (Read Only)</option>
              </select>
            </div>

            <button
              onClick={() => navigate('/admin/dashboard')}
              className="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-sm hover:bg-indigo-100 transition-all cursor-pointer flex items-center gap-1"
            >
              Exit to Tenant CRM →
            </button>
          </div>
        </header>

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/60">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
