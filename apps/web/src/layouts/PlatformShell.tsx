import React, { useState, useRef, useEffect, useMemo } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Sparkles,
  ClipboardList,
  Layers,
  Globe,
  Users,
  Shield,
  FileText,
  CreditCard,
  Receipt,
  ArrowRightLeft,
  PieChart,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Bell,
  Search,
  ShieldAlert,
  Tag,
  Home,
  UserCheck,
  User,
  Monitor,
  Check,
  UserPlus,
  Compass,
  MessageSquare,
  Puzzle,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { usePlatformPermissions } from "../features/platform/tenants/hooks/usePlatformPermissions";
import {
  PlatformPermission,
  PlatformRole,
} from "../features/platform/tenants/types/platform.types";
import { useAppDispatch, useAppSelector } from "../store";
import { clearCredentials } from "../store/slices/authSlice";
import { clearStoredRefreshToken } from "../common/authSession";
import { api } from "../common/api";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";

const bigLogo = "/assets/sfw-logo.png";
const smallLogo = "/assets/sfw-icon.png";

interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
  badge?: string;
  permission?: PlatformPermission;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

const NAV_CATEGORIES: NavCategory[] = [
  {
    title: "Main Overview",
    items: [
      {
        label: "Dashboard",
        icon: Home,
        to: "/platform/dashboard",
        permission: "platform.dashboard.view",
      },
    ],
  },
  {
    title: "Tenant Management",
    items: [
      {
        label: "All Tenants",
        icon: Building2,
        to: "/platform/tenants",
        permission: "platform.tenants.view",
      },
      {
        label: "Create Tenant",
        icon: UserPlus,
        to: "/platform/tenants/create",
        permission: "platform.tenants.create",
      },
      {
        label: "Tenant Onboarding",
        icon: Compass,
        to: "/platform/tenants/onboarding",
        permission: "platform.tenants.view",
      },
      {
        label: "Tenant Requests",
        icon: MessageSquare,
        to: "/platform/tenants/requests",
        badge: "3",
        permission: "platform.tenants.view",
      },
    ],
  },
  {
    title: "Platform Management",
    items: [
      {
        label: "Plans & Pricing",
        icon: Tag,
        to: "/platform/plans",
        permission: "platform.plans.view",
      },
      {
        label: "Modules & Features",
        icon: Puzzle,
        to: "/platform/modules",
        permission: "platform.modules.view",
      },
      {
        label: "Industries",
        icon: Globe,
        to: "/platform/industries",
        permission: "platform.industries.view",
      },
      {
        label: "Platform Users",
        icon: Users,
        to: "/platform/users",
        permission: "platform.users.view",
      },
      {
        label: "Roles & Permissions",
        icon: ShieldCheck,
        to: "/platform/roles",
        permission: "platform.roles.view",
      },
      {
        label: "Audit Logs",
        icon: FileText,
        to: "/platform/audit",
        permission: "platform.audit.view",
      },
    ],
  },
  {
    title: "Billing & Finance",
    items: [
      {
        label: "Subscriptions",
        icon: CreditCard,
        to: "/platform/subscriptions",
        permission: "platform.subscriptions.manage",
      },
      {
        label: "Invoices",
        icon: Receipt,
        to: "/platform/invoices",
        permission: "platform.subscriptions.manage",
      },
      {
        label: "Transactions",
        icon: ArrowRightLeft,
        to: "/platform/transactions",
        permission: "platform.subscriptions.manage",
      },
      {
        label: "Reports",
        icon: BarChart3,
        to: "/platform/reports",
        permission: "platform.dashboard.view",
      },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "My Profile", icon: User, to: "/platform/profile" },
      { label: "Security & 2FA", icon: ShieldCheck, to: "/platform/profile/security" },
      { label: "Active Sessions", icon: Monitor, to: "/platform/profile/sessions" },
    ],
  },
];

export default function PlatformShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [activeRole, setActiveRole] = useState<PlatformRole>(
    "PLATFORM_SUPER_ADMIN"
  );

  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { role, setRole, hasPlatformPermission } =
    usePlatformPermissions(activeRole);

  const sidebarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setHeaderMenuOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRoleChange = (newRole: PlatformRole) => {
    setActiveRole(newRole);
    setRole(newRole);
  };

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {});
    } catch {
      /* swallow */
    }
    clearStoredRefreshToken();
    dispatch(clearCredentials());
    navigate("/admin/login");
  };

  const showBigLogo = !collapsed || isHovered;

  // Breadcrumbs helper matching AppShell.tsx exact style
  const breadcrumbs = useMemo(() => {
    const p = location.pathname;
    if (p === "/platform/dashboard") {
      return [{ label: "Platform Console", to: "/platform/dashboard" }, { label: "Executive Dashboard", to: "/platform/dashboard" }];
    }
    if (p === "/platform/tenants") {
      return [
        { label: "Tenant Management", to: "/platform/tenants" },
        { label: "All Tenants", to: "/platform/tenants" },
      ];
    }
    if (p === "/platform/tenants/create") {
      return [
        { label: "Tenant Management", to: "/platform/tenants" },
        { label: "Create Tenant Wizard", to: "/platform/tenants/create" },
      ];
    }
    if (p.startsWith("/platform/tenants/")) {
      return [
        { label: "Tenant Management", to: "/platform/tenants" },
        { label: "Tenant Workspace Details", to: p },
      ];
    }
    if (p === "/platform/plans") {
      return [
        { label: "Platform Management", to: "/platform/plans" },
        { label: "Plans & Pricing", to: "/platform/plans" },
      ];
    }
    if (p === "/platform/audit") {
      return [
        { label: "Platform Management", to: "/platform/audit" },
        { label: "Audit Logs", to: "/platform/audit" },
      ];
    }
    if (p === "/platform/profile") {
      return [
        { label: "Account", to: "/platform/profile" },
        { label: "My Profile", to: "/platform/profile" },
      ];
    }
    if (p === "/platform/profile/security") {
      return [
        { label: "Account", to: "/platform/profile" },
        { label: "Security & 2FA", to: "/platform/profile/security" },
      ];
    }
    if (p === "/platform/profile/sessions") {
      return [
        { label: "Account", to: "/platform/profile" },
        { label: "Active Sessions", to: "/platform/profile/sessions" },
      ];
    }
    return [
      { label: "Platform Console", to: "/platform/dashboard" },
      { label: "Overview", to: p },
    ];
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* 100% Identical Sidebar Architecture to AppShell.tsx */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white text-slate-700 shadow-xs transition-all duration-300 ease-in-out overflow-x-hidden ${
          showBigLogo ? "w-[295px]" : "w-[80px]"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Brand Header */}
        <div
          className={`flex h-20 flex-none items-center border-b border-slate-100 transition-all duration-300 ${
            showBigLogo ? "justify-between px-4" : "justify-center px-2"
          }`}
        >
          {showBigLogo ? (
            <>
              <NavLink to="/platform/dashboard" className="flex items-center">
                <img
                  src={bigLogo}
                  alt="Smart Field Work Logo"
                  style={{
                    width: "240px",
                    maxHeight: "64px",
                    objectFit: "contain",
                  }}
                />
              </NavLink>
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition duration-200"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center p-1 rounded-lg hover:bg-slate-100 transition duration-200"
              title="Expand Sidebar"
            >
              <img
                src={smallLogo}
                alt="Smart Field Work Favicon"
                style={{ width: "60px", height: "60px", objectFit: "contain" }}
              />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav
          className={`flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden px-2.5 py-4 ${
            showBigLogo
              ? "scrollbar-thin scrollbar-thumb-slate-200"
              : "scrollbar-none"
          }`}
        >
          {NAV_CATEGORIES.map((cat, idx) => (
            <div key={idx} className="space-y-0.5">
              {showBigLogo && (
                <p className="px-3 text-[11px] font-medium text-slate-400 pt-2 pb-1">
                  {cat.title}
                </p>
              )}
              {cat.items.map((item) => {
                const isAllowed = !item.permission || hasPlatformPermission(item.permission);
                const Icon = item.icon;

                // Strict active matching (Exact same logic as AppShell.tsx)
                const isActive = (() => {
                  if (
                    [
                      "/platform/dashboard",
                      "/platform/tenants",
                      "/platform/plans",
                      "/platform/modules",
                      "/platform/industries",
                      "/platform/users",
                      "/platform/roles",
                      "/platform/audit",
                      "/platform/subscriptions",
                      "/platform/invoices",
                      "/platform/transactions",
                      "/platform/reports",
                      "/platform/profile",
                      "/platform/profile/security",
                      "/platform/profile/sessions",
                    ].includes(item.to)
                  ) {
                    return location.pathname === item.to;
                  }
                  return (
                    location.pathname === item.to ||
                    location.pathname.startsWith(item.to + "/")
                  );
                })();

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={(e) => {
                      if (!isAllowed) {
                        e.preventDefault();
                      }
                    }}
                    title={!showBigLogo ? item.label : undefined}
                    className={`group relative flex items-center rounded-sm py-2 text-[13px] font-medium transition-all duration-150 ${
                      showBigLogo
                        ? "px-3 gap-3 justify-start"
                        : "w-11 mx-auto justify-center px-0"
                    } ${
                      isActive
                        ? "bg-[#0D1F3D] text-white shadow-xs font-semibold"
                        : isAllowed
                        ? "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                        : "text-slate-400 opacity-50 cursor-not-allowed hover:bg-slate-50"
                    }`}
                  >
                    <Icon
                      className={`h-4.5 w-4.5 flex-shrink-0 transition-colors ${
                        isActive
                          ? "text-white"
                          : isAllowed
                          ? "text-slate-400 group-hover:text-slate-700"
                          : "text-slate-300"
                      }`}
                    />

                    {showBigLogo && (
                      <div className="flex flex-1 items-center justify-between min-w-0">
                        <span className="whitespace-nowrap font-medium">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`ml-2 shrink-0 whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[10px] font-extrabold transition-colors ${
                              isActive
                                ? "bg-[#E20613] text-white border border-[#E20613]"
                                : "bg-red-50 text-[#E20613] border border-red-200/60"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {!isAllowed && (
                          <span className="ml-2 shrink-0 whitespace-nowrap rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                            Locked
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tooltip on Collapsed Hover */}
                    {!showBigLogo && (
                      <div className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-sm bg-slate-900 px-2.5 py-1 text-xs font-medium text-white shadow-xl opacity-0 transition-opacity group-hover:opacity-100">
                        {item.label}
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Footer Profile Card in Sidebar (100% Identical to AppShell.tsx) */}
        <div
          className="border-t border-slate-100 p-2.5 relative z-20 flex-shrink-0"
          ref={sidebarRef}
        >
          <div className="relative">
            <div
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className={`flex items-center rounded-sm p-2 transition-all cursor-pointer ${
                showBigLogo ? "justify-between" : "justify-center"
              } ${
                userMenuOpen
                  ? "bg-slate-100 ring-1 ring-slate-200"
                  : "hover:bg-slate-50"
              }`}
            >
              <div
                className={`flex items-center gap-2.5 ${
                  showBigLogo ? "overflow-hidden" : "justify-center"
                }`}
              >
                <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-[#0D1F3D] text-xs font-semibold text-white shadow-xs">
                  {user?.fullName?.charAt(0) ?? "S"}
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#E20613] ring-2 ring-white" />
                </div>

                {showBigLogo && (
                  <div className="flex flex-col truncate">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      {user?.fullName || "Super Admin"}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 truncate">
                      Platform Super Admin
                    </p>
                  </div>
                )}
              </div>

              {showBigLogo && (
                <ChevronRight
                  className={`h-4 w-4 text-slate-400 transition-transform ${
                    userMenuOpen ? "-rotate-90 text-slate-600" : ""
                  }`}
                />
              )}
            </div>

            {/* User Quick Actions Dropdown Card popping upwards (Identical to AppShell.tsx) */}
            {userMenuOpen && (
              <div
                className={`absolute bottom-full mb-2 rounded-sm border border-slate-200 bg-white p-2 shadow-2xl space-y-1 z-[100] ${
                  showBigLogo ? "left-0 right-0 w-full" : "left-0 w-56"
                }`}
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-[#0D1F3D] truncate">
                    {user?.fullName || "Super Admin"}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user?.email || "platform.admin@smartfieldwork.com"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/platform/profile");
                  }}
                  className="w-full flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]"
                >
                  <User className="h-4 w-4 text-[#E20613]" /> My Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/platform/profile/security");
                  }}
                  className="w-full flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]"
                >
                  <Shield className="h-4 w-4 text-blue-600" /> Security & 2FA
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate("/admin/dashboard");
                  }}
                  className="w-full flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors border-t border-slate-100 pt-2"
                >
                  <UserCheck className="h-4 w-4 text-blue-600" /> Exit to Tenant CRM →
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={handleLogout}
                  className="flex items-center justify-start gap-2.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold text-xs mt-1 rounded-sm border-t border-slate-100 pt-2"
                >
                  <LogOut className="h-4 w-4 text-rose-600" /> Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
          collapsed ? "ml-[80px]" : "ml-[295px]"
        }`}
      >
        {/* Top Header */}
        <header className="flex h-20 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm">
          {/* Left Header Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <NavLink
              to="/platform/dashboard"
              className="flex items-center text-slate-400 hover:text-[#0D1F3D] transition-colors"
            >
              <Home className="h-4 w-4" />
            </NavLink>
            {breadcrumbs.map((crumb, idx, arr) => {
              const isLast = idx === arr.length - 1;
              return (
                <React.Fragment key={crumb.to + idx}>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                  {isLast ? (
                    <span className="font-extrabold text-[#0D1F3D] bg-slate-100 px-2.5 py-1 rounded-sm border border-slate-200/60 shadow-xs">
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

          {/* Right Header Controls */}
          <div className="flex items-center gap-4">
            {/* Custom Role Selector Popover Pill (Matching User Mockup 100%) */}
            <div className="relative" ref={roleRef}>
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-1.5 text-xs text-amber-900 shadow-xs hover:bg-amber-100/80 transition-all cursor-pointer font-semibold"
              >
                <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
                <span className="font-bold text-amber-900">Role:</span>
                <span className="font-bold text-amber-950">
                  {activeRole === 'PLATFORM_SUPER_ADMIN'
                    ? 'Super Admin (Full)'
                    : activeRole === 'PLATFORM_OPERATIONS_ADMIN'
                    ? 'Operations Admin'
                    : activeRole === 'PLATFORM_ONBOARDING'
                    ? 'Onboarding Admin'
                    : activeRole === 'PLATFORM_SUPPORT'
                    ? 'Support Agent'
                    : activeRole === 'PLATFORM_BILLING'
                    ? 'Billing Admin'
                    : 'Auditor'}
                </span>
                <ChevronRight className={`h-3.5 w-3.5 text-amber-700 shrink-0 transition-transform ${roleMenuOpen ? 'rotate-90' : 'rotate-90'}`} />
              </button>

              {roleMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-60 rounded-sm border border-slate-200 bg-white p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 space-y-1 text-left">
                  <div className="px-2 py-1 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <p className="text-xs font-extrabold text-[#0D1F3D]">Select Active Role</p>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">Test Mode</span>
                  </div>

                  {/* Search Bar inside Role Dropdown */}
                  <div className="relative mb-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={roleSearchQuery}
                      onChange={(e) => setRoleSearchQuery(e.target.value)}
                      placeholder="Search active role..."
                      className="w-full rounded-sm border border-slate-200 bg-slate-50/80 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#0D1F3D] focus:bg-white focus:outline-none"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-0.5 custom-scrollbar">
                    {[
                      { value: 'PLATFORM_SUPER_ADMIN', label: 'Super Admin (Full)' },
                      { value: 'PLATFORM_OPERATIONS_ADMIN', label: 'Operations Admin' },
                      { value: 'PLATFORM_ONBOARDING', label: 'Onboarding Admin' },
                      { value: 'PLATFORM_SUPPORT', label: 'Support Agent' },
                      { value: 'PLATFORM_BILLING', label: 'Billing Admin' },
                      { value: 'PLATFORM_AUDITOR', label: 'Auditor' },
                    ]
                      .filter((r) => r.label.toLowerCase().includes(roleSearchQuery.toLowerCase().trim()))
                      .map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => {
                            handleRoleChange(r.value as PlatformRole);
                            setRoleMenuOpen(false);
                            setRoleSearchQuery('');
                          }}
                          className={`flex w-full items-center justify-between rounded-sm px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                            activeRole === r.value
                              ? 'bg-[#0D1F3D] text-white font-extrabold shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]'
                          }`}
                        >
                          <span>{r.label}</span>
                          {activeRole === r.value && <Check className="h-3.5 w-3.5 text-white" />}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notification Bell Icon */}
            <button
              type="button"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E20613]" />
            </button>

            {/* Header User Profile Avatar Card & Dropdown */}
            <div className="relative" ref={headerRef}>
              <div
                onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                className="flex items-center gap-2.5 p-1 rounded-sm cursor-pointer hover:bg-slate-100/80 transition-all"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#0D1F3D] text-xs font-bold text-white shadow-sm">
                  {user?.fullName?.charAt(0) ?? "S"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-[#0D1F3D]">
                    {user?.fullName || "Super Admin"}
                  </p>
                  <p className="text-[11px] font-semibold text-[#E20613]">
                    Platform Super Admin
                  </p>
                </div>
              </div>

              {headerMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-sm border border-slate-200 bg-white p-2 shadow-2xl space-y-1 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-[#0D1F3D] truncate">
                      {user?.fullName || "Super Admin"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user?.email || "platform.admin@smartfieldwork.com"}
                    </p>
                  </div>
                  <NavLink
                    to="/platform/profile"
                    onClick={() => setHeaderMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]"
                  >
                    <User className="h-4 w-4 text-[#E20613]" /> My Profile
                  </NavLink>
                  <NavLink
                    to="/admin/dashboard"
                    onClick={() => setHeaderMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]"
                  >
                    <UserCheck className="h-4 w-4 text-blue-600" /> Exit to Tenant CRM →
                  </NavLink>
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={handleLogout}
                    className="flex items-center justify-start gap-2.5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold text-xs mt-1 rounded-sm"
                  >
                    <LogOut className="h-4 w-4 text-rose-600" /> Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Page Render */}
        <main className="flex-1 overflow-y-auto bg-[#F3F5F7]">
          <div className="mx-auto w-full max-w-[1720px] p-6 lg:p-8 space-y-6 font-sans">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
