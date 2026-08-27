import React, { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  ChevronLeft,
  LogOut,
  Bell,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  ChevronDown,
  HelpCircle,
  Calendar,
  Download,
  Headphones,
  UserCheck,
  Tag,
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

const bigLogo = "/assets/sfw-logo.png";
const smallLogo = "/assets/sfw-icon.png";

interface NavItem {
  label: string;
  icon: React.ElementType;
  to: string;
  badge?: string;
  badgeColor?: string;
  permission: PlatformPermission;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function PlatformShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<PlatformRole>(
    "PLATFORM_SUPER_ADMIN",
  );

  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { role, setRole, hasPlatformPermission } =
    usePlatformPermissions(activeRole);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
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

  const navGroups: NavGroup[] = [
    {
      title: "PLATFORM OVERVIEW",
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
      title: "TENANT MANAGEMENT",
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
          badgeColor: "bg-red-500 text-white",
          permission: "platform.tenants.view",
        },
      ],
    },
    {
      title: "PLATFORM MANAGEMENT",
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
      title: "BILLING & FINANCE",
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

  const showBigLogo = !collapsed || isHovered;

  // Breadcrumbs helper
  const getBreadcrumbs = () => {
    const p = location.pathname;
    if (p === "/platform/dashboard") {
      return [{ label: "Dashboard", to: "/platform/dashboard" }];
    }
    if (p === "/platform/tenants") {
      return [
        { label: "Dashboard", to: "/platform/dashboard" },
        { label: "Tenants", to: "/platform/tenants" },
      ];
    }
    if (p === "/platform/tenants/create") {
      return [
        { label: "Dashboard", to: "/platform/dashboard" },
        { label: "Tenants", to: "/platform/tenants" },
        { label: "Create Tenant", to: "/platform/tenants/create" },
      ];
    }
    if (p.startsWith("/platform/tenants/")) {
      return [
        { label: "Dashboard", to: "/platform/dashboard" },
        { label: "Tenants", to: "/platform/tenants" },
        { label: "Tenant Details", to: p },
      ];
    }
    if (p === "/platform/plans") {
      return [
        { label: "Dashboard", to: "/platform/dashboard" },
        { label: "Plans & Pricing", to: "/platform/plans" },
      ];
    }
    if (p === "/platform/audit") {
      return [
        { label: "Dashboard", to: "/platform/dashboard" },
        { label: "Audit Logs", to: "/platform/audit" },
      ];
    }
    return [
      { label: "Dashboard", to: "/platform/dashboard" },
      { label: "Platform Console", to: p },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Dark Navy Enterprise Platform Console Sidebar (Matching Platform Dashboard.png) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-[#1E293B] bg-[#0A1931] text-slate-300 shadow-xl transition-all duration-300 ease-in-out overflow-x-hidden ${
          showBigLogo ? "w-[280px]" : "w-[80px]"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Brand Header */}
        <div
          className={`flex h-20 flex-none items-center border-b border-[#1E293B] transition-all duration-300 ${
            showBigLogo ? "justify-between px-4" : "justify-center px-2"
          }`}
        >
          {showBigLogo ? (
            <>
              <NavLink to="/platform/dashboard" className="flex flex-col">
                <img
                  src={bigLogo}
                  alt="Smart Field Work SaaS Platform"
                  style={{
                    width: "210px",
                    maxHeight: "48px",
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)",
                  }}
                />
                <span className="text-[10px] font-bold tracking-widest text-slate-400 pl-1 -mt-1 uppercase">
                  SaaS Platform
                </span>
              </NavLink>
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#1E293B] hover:text-white transition duration-200"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center p-1 rounded-lg hover:bg-[#1E293B] transition duration-200"
              title="Expand Sidebar"
            >
              <img
                src={smallLogo}
                alt="Smart Field Work Favicon"
                style={{ width: "50px", height: "50px", objectFit: "contain" }}
              />
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav
          className={`flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden px-3 py-4 ${
            showBigLogo
              ? "scrollbar-thin scrollbar-thumb-slate-700"
              : "scrollbar-none"
          }`}
        >
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              {showBigLogo && (
                <p className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 pt-2 pb-1 uppercase">
                  {group.title}
                </p>
              )}
              {group.items.map((item) => {
                const isAllowed = hasPlatformPermission(item.permission);
                const Icon = item.icon;
                const isActive =
                  location.pathname === item.to ||
                  (item.to !== "/platform/dashboard" &&
                    location.pathname.startsWith(item.to));

                if (!isAllowed) return null;

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive: linkActive }) => {
                      const active = linkActive || isActive;
                      return `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                        active
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "text-slate-300 hover:bg-[#1E293B] hover:text-white"
                      } ${!showBigLogo ? "justify-center px-0" : ""}`;
                    }}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {showBigLogo && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {showBigLogo && item.badge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ${
                          item.badgeColor ?? "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom Section: Need Help Card & Copyright */}
        {showBigLogo && (
          <div className="p-3 border-t border-[#1E293B] space-y-3">
            <div className="rounded-2xl border border-slate-700/50 bg-[#112240] p-3 text-center">
              <p className="text-xs font-bold text-white">Need Help?</p>
              <p className="text-[11px] text-slate-400 mb-2">
                Contact our platform support team
              </p>
              <button
                type="button"
                onClick={() => navigate("/platform/support")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-bold text-white transition shadow-xs"
              >
                <Headphones className="h-3.5 w-3.5" /> Contact Support
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center font-medium">
              © 2025 Smart Field Work SaaS
            </p>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          showBigLogo ? "pl-[280px]" : "pl-[80px]"
        }`}
      >
        {/* Top Header Bar (Matching Platform Dashboard.png) */}
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur-md">
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            {breadcrumbs.map((b, idx) => (
              <React.Fragment key={b.to}>
                {idx > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                )}
                <NavLink
                  to={b.to}
                  className={`hover:text-[#0D1F3D] transition ${
                    idx === breadcrumbs.length - 1
                      ? "font-bold text-[#0D1F3D]"
                      : ""
                  }`}
                >
                  {b.label}
                </NavLink>
              </React.Fragment>
            ))}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            {/* Global Search Bar */}
            <div className="relative hidden md:block w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by tenant, user, plan..."
                className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-12 text-xs text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded bg-slate-200/60 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                Ctrl + K
              </kbd>
            </div>

            {/* Test Role Switcher Dropdown */}
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/70 px-2.5 py-1 text-xs text-amber-900">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span className="font-semibold text-[11px] text-amber-900 hidden sm:inline">
                Role:
              </span>
              <select
                value={activeRole}
                onChange={(e) =>
                  handleRoleChange(e.target.value as PlatformRole)
                }
                className="bg-transparent text-xs font-bold text-amber-900 focus:outline-none cursor-pointer"
              >
                <option value="PLATFORM_SUPER_ADMIN">Super Admin (Full)</option>
                <option value="PLATFORM_OPERATIONS_ADMIN">
                  Operations Admin
                </option>
                <option value="PLATFORM_ONBOARDING">Onboarding Admin</option>
                <option value="PLATFORM_SUPPORT">Support Agent</option>
                <option value="PLATFORM_BILLING">Billing Admin</option>
                <option value="PLATFORM_AUDITOR">Auditor</option>
              </select>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-xs">
                12
              </span>
            </button>

            {/* Help Button */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
              title="Help & Documentation"
            >
              <HelpCircle className="h-4.5 w-4.5" />
            </button>

            {/* User Profile Avatar Popover */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 pr-2.5 hover:bg-slate-50 transition"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                  {user?.fullName ? user.fullName[0] : "S"}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-[#0D1F3D] leading-none">
                    {user?.fullName || "Super Admin"}
                  </p>
                  <p className="text-[10px] text-slate-500 leading-none mt-0.5">
                    Platform Super Admin
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-[#0D1F3D]">
                      {user?.fullName || "Super Admin"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {user?.email || "platform.admin@smartfieldwork.com"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/admin/dashboard");
                    }}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition"
                  >
                    <UserCheck className="h-4 w-4" /> Exit to Tenant CRM →
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition mt-1"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
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
