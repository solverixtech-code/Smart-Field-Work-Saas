import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  MapPin,
  DollarSign,
  PieChart,
  Radio,
  LogOut,
  User,
  Shield,
  Monitor,
  Bell,
  ChevronRight,
  ChevronLeft,
  Home,
  Users,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store';
import { clearCredentials } from '../store/slices/authSlice';
import { clearStoredRefreshToken } from '../common/authSession';
import { api } from '../common/api';
import { Button } from '../components/ui/Button';
import { Role, getUserRoleLabel } from '@visiblo/shared';

const bigLogo = '/assets/sfw-logo.png';
const smallLogo = '/assets/sfw-icon.png';

interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
  allowed?: Role[];
  badge?: string;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

const navCategories: NavCategory[] = [
  {
    title: 'Main',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        to: '/admin/dashboard',
        allowed: [Role.SUPER_ADMIN, Role.ADMIN],
      },
    ],
  },
  {
    title: 'Sales & Field',
    items: [
      {
        label: 'Field Executives',
        icon: Users,
        to: '/admin/executives',
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.TEAM_LEADER],
        badge: '156 Team',
      },
      {
        label: 'Sales Dashboard',
        icon: TrendingUp,
        to: '/admin/dashboard/sales',
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.TEAM_LEADER],
      },
      {
        label: 'Field Activity',
        icon: MapPin,
        to: '/admin/dashboard/field',
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.TEAM_LEADER],
        badge: 'Live',
      },
      {
        label: 'Conversion Funnel',
        icon: PieChart,
        to: '/admin/dashboard/conversions',
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER],
      },
    ],
  },
  {
    title: 'Financial Management',
    items: [
      {
        label: 'Revenue Dashboard',
        icon: DollarSign,
        to: '/admin/dashboard/revenue',
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE_OPS],
      },
    ],
  },
  {
    title: 'System & Analytics',
    items: [
      {
        label: 'Real-time Activity',
        icon: Radio,
        to: '/admin/dashboard/live',
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.TEAM_LEADER],
      },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'My Profile', icon: User, to: '/admin/profile' },
      { label: 'Security & 2FA', icon: Shield, to: '/admin/profile/security' },
      { label: 'Active Sessions', icon: Monitor, to: '/admin/profile/sessions' },
    ],
  },
];

function getBreadcrumbTrail(pathname: string) {
  const items: { label: string; to: string }[] = [];

  if (pathname === '/admin/executives') {
    items.push({ label: 'Field Operations', to: '/admin/executives' });
    items.push({ label: 'All Field Executives', to: '/admin/executives' });
  } else if (pathname === '/admin/executives/new') {
    items.push({ label: 'Field Executives', to: '/admin/executives' });
    items.push({ label: 'Add New Executive', to: '/admin/executives/new' });
  } else if (pathname.startsWith('/admin/executives/')) {
    items.push({ label: 'Field Executives', to: '/admin/executives' });
    if (pathname.endsWith('/edit')) {
      items.push({ label: 'Rahul Verma (FE-1001)', to: '/admin/executives/FE-1001' });
      items.push({ label: 'Edit Profile', to: pathname });
    } else if (pathname.endsWith('/suspend')) {
      items.push({ label: 'Rahul Verma (FE-1001)', to: '/admin/executives/FE-1001' });
      items.push({ label: 'Access Control', to: pathname });
    } else {
      items.push({ label: 'Executive Profile', to: pathname });
    }
  } else if (pathname === '/admin/dashboard') {
    items.push({ label: 'Dashboard', to: '/admin/dashboard' });
    items.push({ label: 'Executive Overview', to: '/admin/dashboard' });
  } else if (pathname === '/admin/dashboard/sales') {
    items.push({ label: 'Dashboard', to: '/admin/dashboard' });
    items.push({ label: 'Sales Performance', to: '/admin/dashboard/sales' });
  } else if (pathname === '/admin/dashboard/field') {
    items.push({ label: 'Dashboard', to: '/admin/dashboard' });
    items.push({ label: 'Field Activity', to: '/admin/dashboard/field' });
  } else if (pathname === '/admin/dashboard/revenue') {
    items.push({ label: 'Dashboard', to: '/admin/dashboard' });
    items.push({ label: 'Revenue Analytics', to: '/admin/dashboard/revenue' });
  } else if (pathname === '/admin/dashboard/conversions') {
    items.push({ label: 'Dashboard', to: '/admin/dashboard' });
    items.push({ label: 'Conversion Funnel', to: '/admin/dashboard/conversions' });
  } else if (pathname === '/admin/dashboard/live') {
    items.push({ label: 'Dashboard', to: '/admin/dashboard' });
    items.push({ label: 'Live Monitoring', to: '/admin/dashboard/live' });
  } else if (pathname.startsWith('/admin/profile')) {
    items.push({ label: 'Account', to: '/admin/profile' });
    if (pathname === '/admin/profile') {
      items.push({ label: 'My Profile', to: '/admin/profile' });
    } else if (pathname === '/admin/profile/security') {
      items.push({ label: 'Security & 2FA', to: '/admin/profile/security' });
    } else if (pathname === '/admin/profile/sessions') {
      items.push({ label: 'Active Sessions', to: '/admin/profile/sessions' });
    }
  } else {
    items.push({ label: 'Admin', to: '/admin/dashboard' });
    items.push({ label: 'Overview', to: pathname });
  }

  return items;
}

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);

  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch {
      /* swallow */
    }
    clearStoredRefreshToken();
    dispatch(clearCredentials());
    navigate('/admin/login');
  };

  const userRole = (user?.role as Role) || Role.SUPER_ADMIN;
  const showBigLogo = !collapsed || isHovered;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Refined Enterprise White Theme Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white text-slate-700 shadow-xs transition-all duration-300 ease-in-out ${
          showBigLogo ? 'w-[260px]' : 'w-[80px]'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Brand Header */}
        <div className="flex h-20 flex-none items-center justify-between border-b border-slate-100 px-3">
          <NavLink to="/admin/dashboard" className="flex items-center">
            <div className="relative flex h-16 w-[205px] items-center justify-start overflow-hidden">
              <img
                src={bigLogo}
                alt="Smart Field Work Logo"
                className={`absolute transition-opacity duration-300 ease-in-out ${
                  showBigLogo ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ width: '195px', maxHeight: '52px', objectFit: 'contain' }}
              />
              <img
                src={smallLogo}
                alt="Smart Field Work Favicon"
                className={`absolute transition-opacity duration-300 ease-in-out ${
                  showBigLogo ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ width: '56px', height: '56px', objectFit: 'contain' }}
              />
            </div>
          </NavLink>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition duration-200"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <ChevronLeft
              className={`h-5 w-5 transition-transform duration-300 ${
                collapsed ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-200">
          {navCategories.map((cat, idx) => (
            <div key={idx} className="space-y-0.5">
              {showBigLogo && (
                <p className="px-3 text-[11px] font-medium text-slate-400 pt-2 pb-1">
                  {cat.title}
                </p>
              )}
              {cat.items.map((item) => {
                const isAllowed = !item.allowed || item.allowed.includes(userRole);
                const Icon = item.icon;
                const isActive =
                  item.to === '/admin/dashboard' || item.to === '/admin/profile'
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to);

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    title={!showBigLogo ? item.label : undefined}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#0D1F3D] text-white shadow-xs font-semibold'
                        : isAllowed
                          ? 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                          : 'text-slate-400 opacity-50 cursor-not-allowed hover:bg-slate-50'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 transition-colors ${
                        isActive
                          ? 'text-[#E20613]'
                          : isAllowed
                            ? 'text-slate-400 group-hover:text-slate-700'
                            : 'text-slate-300'
                      }`}
                    />

                    {showBigLogo && (
                      <div className="flex flex-1 items-center justify-between overflow-hidden">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#E20613] border border-red-200/60">
                            {item.badge}
                          </span>
                        )}
                        {!isAllowed && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                            Locked
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tooltip on Collapsed Hover */}
                    {!showBigLogo && (
                      <div className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-xl opacity-0 transition-opacity group-hover:opacity-100">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Footer Profile Card in Sidebar */}
        <div className="border-t border-slate-100 p-2.5" ref={sidebarRef}>
          {user && (
            <div className="relative">
              <div
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`flex items-center justify-between rounded-xl p-2 transition-all cursor-pointer ${
                  userMenuOpen ? 'bg-slate-100' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="User Avatar"
                      className="h-8 w-8 rounded-lg object-cover flex-shrink-0 shadow-xs border border-slate-200"
                    />
                  ) : (
                    <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#0D1F3D] text-xs font-semibold text-white shadow-xs">
                      {user.fullName?.charAt(0) ?? user.email.charAt(0).toUpperCase()}
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#E20613] ring-2 ring-white" />
                    </div>
                  )}

                  {showBigLogo && (
                    <div className="flex flex-col truncate">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {user.fullName ?? user.email}
                      </p>
                      <p className="text-[11px] font-medium text-slate-500 truncate">
                        {getUserRoleLabel(userRole)}
                      </p>
                    </div>
                  )}
                </div>

                {showBigLogo && (
                  <ChevronRight
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      userMenuOpen ? 'rotate-90 text-slate-600' : ''
                    }`}
                  />
                )}
              </div>

              {/* User Quick Actions Dropdown Card */}
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl space-y-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-[#0D1F3D] truncate">{user.fullName || user.email}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <NavLink
                    to="/admin/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]"
                  >
                    <User className="h-4 w-4 text-[#E20613]" /> My Profile
                  </NavLink>
                  <NavLink
                    to="/admin/profile/security"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]"
                  >
                    <Shield className="h-4 w-4 text-blue-600" /> Security
                  </NavLink>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={handleLogout}
                    className="flex items-center justify-start gap-2.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold text-xs mt-1"
                  >
                    <LogOut className="h-4 w-4 text-rose-600" /> Sign Out
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
          collapsed ? 'ml-[80px]' : 'ml-[260px]'
        }`}
      >
        {/* Top Header */}
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm">
          {/* Mandatory Left Header Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <NavLink to="/admin/dashboard" className="flex items-center text-slate-400 hover:text-[#0D1F3D] transition-colors">
              <Home className="h-4 w-4" />
            </NavLink>
            {getBreadcrumbTrail(location.pathname).map((crumb, idx, arr) => {
              const isLast = idx === arr.length - 1;
              return (
                <React.Fragment key={crumb.to + idx}>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                  {isLast ? (
                    <span className="font-extrabold text-[#0D1F3D] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-xs">
                      {crumb.label}
                    </span>
                  ) : (
                    <NavLink
                      to={crumb.to}
                      className="hover:text-[#0D1F3D] hover:underline transition-colors font-semibold text-slate-600"
                    >
                      {crumb.label}
                    </NavLink>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E20613]" />
            </button>

            {/* Header User Profile Avatar Card */}
            {user && (
              <div className="relative" ref={headerRef}>
                <div
                  onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-all"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="User Avatar"
                      className="h-9 w-9 rounded-xl object-cover shadow-xs border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0D1F3D] text-xs font-bold text-white shadow-sm">
                      {user.fullName?.charAt(0) ?? user.email.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-[#0D1F3D]">{user.fullName ?? user.email}</p>
                    <p className="text-[11px] font-semibold text-[#E20613]">
                      {getUserRoleLabel(userRole)}
                    </p>
                  </div>
                </div>

                {/* Header User Dropdown Card */}
                {headerMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl space-y-1 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-[#0D1F3D] truncate">{user.fullName || user.email}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <NavLink
                      to="/admin/profile"
                      onClick={() => setHeaderMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]"
                    >
                      <User className="h-4 w-4 text-[#E20613]" /> My Profile
                    </NavLink>
                    <NavLink
                      to="/admin/profile/security"
                      onClick={() => setHeaderMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]"
                    >
                      <Shield className="h-4 w-4 text-blue-600" /> Security
                    </NavLink>
                    <Button
                      variant="ghost"
                      size="sm"
                      fullWidth
                      onClick={handleLogout}
                      className="flex items-center justify-start gap-2.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold text-xs mt-1"
                    >
                      <LogOut className="h-4 w-4 text-rose-600" /> Sign Out
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Main Page Render in Single Unified Shell Container */}
        <main className="flex-1 overflow-y-auto bg-[#F3F5F7]">
          <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
