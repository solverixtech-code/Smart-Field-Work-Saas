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

const bigLogo = "/assets/sfw-logo.png";
const smallLogo = "/assets/sfw-icon.png";

interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
  badge?: string;
  permission: PlatformPermission;
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
        icon: LayoutDashboard,
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
        icon: PlusCircle,
        to: "/platform/tenants/create",
        permission: "platform.tenants.create",
      },
      {
        label: "Tenant Onboarding",
        icon: Sparkles,
        to: "/platform/tenants/onboarding",
        permission: "platform.tenants.view",
      },
      {
        label: "Tenant Requests",
        icon: ClipboardList,
        to: "/platform/tenants/requests",
        badge: "8",
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
        icon: Layers,
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
        icon: Shield,
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
        icon: PieChart,
        to: "/platform/reports",
        permission: "platform.dashboard.view",
      },
    ],
  },
];

export default function PlatformShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
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
      return [{ label: "Executive Overview", to: "/platform/dashboard" }];
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
                const isAllowed = hasPlatformPermission(item.permission);
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
                    navigate("/admin/dashboard");
                  }}
                  className="w-full flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
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

      {/* Main Content Area (100% Identical to AppShell.tsx) */}
      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
          collapsed ? "ml-[80px]" : "ml-[295px]"
        }`}
      >
        {/* Top Header (100% Identical to AppShell.tsx Header & Breadcrumbs) */}
        <header className="flex h-20 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm">
          {/* Mandatory Left Header Breadcrumb Navigation */}
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
          <div className="flex items-center gap-3">
            {/* Global Search Bar */}
            <div className="relative hidden md:block w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by tenant, user, plan..."
                className="h-9 w-full rounded-sm border border-slate-200 bg-slate-50 pl-9 pr-12 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-slate-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                Ctrl + K
              </kbd>
            </div>

            {/* Test Role Switcher Dropdown */}
            <div className="flex items-center gap-1.5 rounded-sm border border-amber-200 bg-amber-50/80 px-2.5 py-1.5 text-xs text-amber-900 shadow-xs">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="font-bold text-[11px] text-amber-900 hidden sm:inline">
                Role:
              </span>
              <select
                value={activeRole}
                onChange={(e) => handleRoleChange(e.target.value as PlatformRole)}
                className="bg-transparent text-xs font-bold text-amber-900 focus:outline-none cursor-pointer"
              >
                <option value="PLATFORM_SUPER_ADMIN">Super Admin (Full)</option>
                <option value="PLATFORM_OPERATIONS_ADMIN">Operations Admin</option>
                <option value="PLATFORM_ONBOARDING">Onboarding Admin</option>
                <option value="PLATFORM_SUPPORT">Support Agent</option>
                <option value="PLATFORM_BILLING">Billing Admin</option>
                <option value="PLATFORM_AUDITOR">Auditor</option>
              </select>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E20613] text-[9px] font-bold text-white shadow-xs">
                12
              </span>
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
