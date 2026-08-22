import React, { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  MapPin,
  DollarSign,
  PieChart,
  Radio,
  LogOut,
  User,
  UserPlus,
  Globe,
  Shield,
  Monitor,
  Bell,
  ChevronRight,
  ChevronLeft,
  Home,
  Users,
  UserCheck,
  Gift,
  Clock,
  Smartphone,
  CreditCard,
  Building2,
  SlidersHorizontal,
  Target,
  ShieldAlert,
  Calendar,
  Layers,
  RotateCcw,
  CheckCircle2,
  Tag,
  Award,
  Zap,
  Plus,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../store";
import { clearCredentials } from "../store/slices/authSlice";
import { clearStoredRefreshToken } from "../common/authSession";
import { api } from "../common/api";
import { Button } from "../components/ui/Button";
import { Role, getUserRoleLabel } from "@visiblo/shared";

const bigLogo = "/assets/sfw-logo.png";
const smallLogo = "/assets/sfw-icon.png";

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
    title: "Main",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        to: "/admin/dashboard",
        allowed: [Role.SUPER_ADMIN, Role.ADMIN],
      },
    ],
  },
  {
    title: "Sales & Field",
    items: [
      {
        label: "Sales Pipeline",
        icon: TrendingUp,
        to: "/admin/sales/pipeline",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "₹2.46 Cr",
      },
      {
        label: "Leads Management",
        icon: UserPlus,
        to: "/admin/leads",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "1,250 Leads",
      },
      {
        label: "Businesses",
        icon: Building2,
        to: "/admin/businesses",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "5.8k Stores",
      },
      {
        label: "Territories",
        icon: Globe,
        to: "/admin/territories",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "12 Active",
      },
    ],
  },
  {
    title: "Targets & Incentives",
    items: [
      {
        label: "Target Dashboard",
        icon: Target,
        to: "/admin/targets",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "69.9%",
      },
      {
        label: "Team Targets",
        icon: Users,
        to: "/admin/targets/teams",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "24 Teams",
      },
      {
        label: "Executive Targets",
        icon: UserCheck,
        to: "/admin/targets/executives",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "48 Staff",
      },
      {
        label: "Incentive Rules",
        icon: Gift,
        to: "/admin/incentives/rules",
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER],
        badge: "18 Rules",
      },
      {
        label: "Incentives & Payouts",
        icon: CreditCard,
        to: "/admin/incentives",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.FINANCE_OPS,
        ],
        badge: "₹1.24L",
      },
    ],
  },
  {
    title: "Sales Performance",
    items: [
      {
        label: "Sales Performance",
        icon: TrendingUp,
        to: "/admin/performance",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "Hub",
      },
      {
        label: "Executive Ranking",
        icon: Award,
        to: "/admin/performance/executives",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "Top 25",
      },
      {
        label: "Team Ranking",
        icon: Users,
        to: "/admin/performance/teams",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "12 Teams",
      },
      {
        label: "Territory Ranking",
        icon: Globe,
        to: "/admin/performance/territories",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "18 Zones",
      },
      {
        label: "Category Performance",
        icon: Tag,
        to: "/admin/performance/categories",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
      },
      {
        label: "Conversion Funnel",
        icon: Target,
        to: "/admin/performance/funnel",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "Funnel",
      },
      {
        label: "Productivity Report",
        icon: Zap,
        to: "/admin/performance/productivity",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "81.4 Score",
      },
    ],
  },
  {
    title: "Business Categories",
    items: [
      {
        label: "All Categories",
        icon: Layers,
        to: "/admin/categories",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "156 Total",
      },
      {
        label: "Add Category",
        icon: Plus,
        to: "/admin/categories/create",
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER],
      },
      {
        label: "Category Performance",
        icon: Tag,
        to: "/admin/performance/categories",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
      },
    ],
  },
  {
    title: "Demo Management",
    items: [
      {
        label: "All Demos",
        icon: Monitor,
        to: "/admin/demos",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "128 Demos",
      },
      {
        label: "Demos Today",
        icon: Clock,
        to: "/admin/demos/today",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "22 Today",
      },
      {
        label: "Scheduled Demos",
        icon: Calendar,
        to: "/admin/demos/scheduled",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "32 Upcoming",
      },
      {
        label: "Demo Completed",
        icon: CheckCircle2,
        to: "/admin/demos/completed",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "78 Done",
      },
      {
        label: "Demo Conversions",
        icon: TrendingUp,
        to: "/admin/demos/conversions",
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER],
      },
    ],
  },
  {
    title: "Follow-up Management",
    items: [
      {
        label: "All Follow-ups",
        icon: RotateCcw,
        to: "/admin/follow-ups",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "256 Total",
      },
      {
        label: "Today's Follow-ups",
        icon: Clock,
        to: "/admin/follow-ups/today",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "28 Today",
      },
      {
        label: "Upcoming Follow-ups",
        icon: Calendar,
        to: "/admin/follow-ups/upcoming",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "64 Next",
      },
      {
        label: "Overdue Follow-ups",
        icon: ShieldAlert,
        to: "/admin/follow-ups/overdue",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "32 Overdue",
      },
      {
        label: "Completed Follow-ups",
        icon: CheckCircle2,
        to: "/admin/follow-ups/completed",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "98 Done",
      },
    ],
  },
  {
    title: "Visit Management",
    items: [
      {
        label: "Visit Management",
        icon: MapPin,
        to: "/admin/visits",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "128 Visits",
      },
      {
        label: "GPS Exceptions",
        icon: ShieldAlert,
        to: "/admin/visits/gps-exceptions",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "18 Pending",
      },
    ],
  },
  {
    title: "Live Tracking & Maps",
    items: [
      {
        label: "Live Field Map",
        icon: Radio,
        to: "/admin/map/live",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "28 Live",
      },
      {
        label: "Executive Locations",
        icon: MapPin,
        to: "/admin/map/executives",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
      },
      {
        label: "Business Prospect Map",
        icon: Building2,
        to: "/admin/map/businesses",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "248 Pins",
      },
      {
        label: "Visit Heatmap",
        icon: PieChart,
        to: "/admin/map/visits",
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER],
      },
      {
        label: "Sales Heatmap",
        icon: TrendingUp,
        to: "/admin/map/sales",
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER],
      },
      {
        label: "Territory Map",
        icon: Globe,
        to: "/admin/map/territories",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
      },
      {
        label: "Route Playback",
        icon: Clock,
        to: "/admin/map/routes/FE-1009",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
      },
    ],
  },
  {
    title: "Teams & Operations",
    items: [
      {
        label: "Sales Teams",
        icon: Building2,
        to: "/admin/teams",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "8 Teams",
      },
      {
        label: "Field Executives",
        icon: Users,
        to: "/admin/executives",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "156 Team",
      },
      {
        label: "Sales Dashboard",
        icon: TrendingUp,
        to: "/admin/dashboard/sales",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
      },
      {
        label: "Field Activity",
        icon: MapPin,
        to: "/admin/dashboard/field",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "Live",
      },
      {
        label: "Conversion Funnel",
        icon: PieChart,
        to: "/admin/dashboard/conversions",
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER],
      },
    ],
  },
  {
    title: "Workforce & Operations",
    items: [
      {
        label: "Shifts & Schedule",
        icon: Clock,
        to: "/admin/shifts",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
      },
      {
        label: "Attendance & Punches",
        icon: Smartphone,
        to: "/admin/attendance",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
        badge: "Live",
      },
    ],
  },
  {
    title: "Payroll & Finance",
    items: [
      {
        label: "Payroll & Payslips",
        icon: CreditCard,
        to: "/admin/payroll",
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE_OPS],
      },
      {
        label: "Revenue Dashboard",
        icon: DollarSign,
        to: "/admin/dashboard/revenue",
        allowed: [Role.SUPER_ADMIN, Role.ADMIN, Role.FINANCE_OPS],
      },
    ],
  },
  {
    title: "System & Masters",
    items: [
      {
        label: "System Masters",
        icon: SlidersHorizontal,
        to: "/admin/masters",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
          Role.FINANCE_OPS,
          Role.SUPPORT,
        ],
        badge: "40 Masters",
      },
      {
        label: "Real-time Activity",
        icon: Radio,
        to: "/admin/dashboard/live",
        allowed: [
          Role.SUPER_ADMIN,
          Role.ADMIN,
          Role.SALES_MANAGER,
          Role.TEAM_LEADER,
        ],
      },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "My Profile", icon: User, to: "/admin/profile" },
      { label: "Security & 2FA", icon: Shield, to: "/admin/profile/security" },
      {
        label: "Active Sessions",
        icon: Monitor,
        to: "/admin/profile/sessions",
      },
    ],
  },
];

function getBreadcrumbTrail(pathname: string) {
  const items: { label: string; to: string }[] = [];

  if (pathname === "/admin/demos") {
    items.push({ label: "Demo Management", to: "/admin/demos" });
    items.push({ label: "All Demos", to: "/admin/demos" });
  } else if (pathname === "/admin/demos/today") {
    items.push({ label: "Demo Management", to: "/admin/demos" });
    items.push({ label: "Demos Today", to: "/admin/demos/today" });
  } else if (pathname === "/admin/demos/scheduled") {
    items.push({ label: "Demo Management", to: "/admin/demos" });
    items.push({ label: "Scheduled Demos", to: "/admin/demos/scheduled" });
  } else if (pathname === "/admin/demos/completed") {
    items.push({ label: "Demo Management", to: "/admin/demos" });
    items.push({ label: "Demo Completed", to: "/admin/demos/completed" });
  } else if (pathname === "/admin/demos/conversions") {
    items.push({ label: "Demo Management", to: "/admin/demos" });
    items.push({
      label: "Demo Conversion Report",
      to: "/admin/demos/conversions",
    });
  } else if (pathname.startsWith("/admin/demos/")) {
    items.push({ label: "Demo Management", to: "/admin/demos" });
    items.push({ label: "Demo Details (DEM-1285)", to: pathname });
  } else if (pathname === "/admin/follow-ups") {
    items.push({ label: "Follow-up Management", to: "/admin/follow-ups" });
    items.push({ label: "All Follow-ups", to: "/admin/follow-ups" });
  } else if (pathname === "/admin/follow-ups/today") {
    items.push({ label: "Follow-up Management", to: "/admin/follow-ups" });
    items.push({ label: "Today's Follow-ups", to: "/admin/follow-ups/today" });
  } else if (pathname === "/admin/follow-ups/upcoming") {
    items.push({ label: "Follow-up Management", to: "/admin/follow-ups" });
    items.push({
      label: "Upcoming Follow-ups",
      to: "/admin/follow-ups/upcoming",
    });
  } else if (pathname === "/admin/follow-ups/overdue") {
    items.push({ label: "Follow-up Management", to: "/admin/follow-ups" });
    items.push({
      label: "Overdue Follow-ups",
      to: "/admin/follow-ups/overdue",
    });
  } else if (pathname === "/admin/follow-ups/completed") {
    items.push({ label: "Follow-up Management", to: "/admin/follow-ups" });
    items.push({
      label: "Completed Follow-ups",
      to: "/admin/follow-ups/completed",
    });
  } else if (pathname.startsWith("/admin/follow-ups/")) {
    items.push({ label: "Follow-up Management", to: "/admin/follow-ups" });
    items.push({ label: "Follow-up Details (FU-2556)", to: pathname });
  } else if (pathname === "/admin/teams") {
    items.push({ label: "Teams & Hierarchy", to: "/admin/teams" });
    items.push({ label: "Sales Teams", to: "/admin/teams" });
  } else if (pathname === "/admin/teams/create") {
    items.push({ label: "Teams & Hierarchy", to: "/admin/teams" });
    items.push({ label: "Create Team", to: "/admin/teams/create" });
  } else if (pathname === "/admin/teams/targets") {
    items.push({ label: "Teams & Hierarchy", to: "/admin/teams" });
    items.push({
      label: "All Teams Target Overview",
      to: "/admin/teams/targets",
    });
  } else if (pathname.startsWith("/admin/teams/")) {
    items.push({ label: "Teams & Hierarchy", to: "/admin/teams" });
    items.push({ label: "Mumbai North Team", to: "/admin/teams/MN-001" });
    if (pathname.endsWith("/leader")) {
      items.push({ label: "Assign Team Leader", to: pathname });
    } else if (pathname.endsWith("/members")) {
      items.push({ label: "Team Members", to: pathname });
    } else if (pathname.endsWith("/performance")) {
      items.push({ label: "Team Performance", to: pathname });
    } else if (pathname.endsWith("/targets")) {
      items.push({ label: "Team Targets", to: pathname });
    }
  } else if (pathname === "/admin/territories") {
    items.push({ label: "Territory Management", to: "/admin/territories" });
    items.push({ label: "Territories", to: "/admin/territories" });
  } else if (pathname === "/admin/territories/create") {
    items.push({ label: "Territory Management", to: "/admin/territories" });
    items.push({ label: "Create Territory", to: "/admin/territories/create" });
  } else if (pathname.startsWith("/admin/territories/")) {
    items.push({ label: "Territory Management", to: "/admin/territories" });
    items.push({
      label: "Andheri East (T001)",
      to: "/admin/territories/TERR-1001",
    });
    if (pathname.endsWith("/edit")) {
      items.push({ label: "Edit Territory", to: pathname });
    } else if (pathname.endsWith("/executives")) {
      items.push({ label: "Assign Executives", to: pathname });
    } else if (pathname.endsWith("/businesses")) {
      items.push({ label: "Territory Businesses", to: pathname });
    } else if (pathname.endsWith("/performance")) {
      items.push({ label: "Territory Performance", to: pathname });
    } else if (pathname.endsWith("/map")) {
      items.push({ label: "Territory Map", to: pathname });
    }
  } else if (pathname === "/admin/businesses") {
    items.push({ label: "Businesses & Data", to: "/admin/businesses" });
    items.push({ label: "All Businesses", to: "/admin/businesses" });
  } else if (pathname.startsWith("/admin/businesses/")) {
    items.push({ label: "Businesses & Data", to: "/admin/businesses" });
    items.push({ label: "FitZone Gym", to: "/admin/businesses/BUS-10058242" });
    if (pathname.endsWith("/contacts")) {
      items.push({ label: "Business Contacts", to: pathname });
    } else if (pathname.endsWith("/google-profile")) {
      items.push({ label: "Google Business Profile", to: pathname });
    } else if (pathname.endsWith("/sales-history")) {
      items.push({ label: "Sales History", to: pathname });
    } else if (pathname.endsWith("/visits")) {
      items.push({ label: "Visit History", to: pathname });
    } else if (pathname.endsWith("/subscription")) {
      items.push({ label: "Business Subscription", to: pathname });
    }
  } else if (pathname === "/admin/executives") {
    items.push({ label: "Field Operations", to: "/admin/executives" });
    items.push({ label: "All Field Executives", to: "/admin/executives" });
  } else if (pathname === "/admin/executives/new") {
    items.push({ label: "Field Executives", to: "/admin/executives" });
    items.push({ label: "Add New Executive", to: "/admin/executives/new" });
  } else if (pathname.startsWith("/admin/executives/")) {
    items.push({ label: "Field Executives", to: "/admin/executives" });
    if (pathname.endsWith("/edit")) {
      items.push({
        label: "Rahul Verma (FE-1001)",
        to: "/admin/executives/FE-1001",
      });
      items.push({ label: "Edit Profile", to: pathname });
    } else if (pathname.endsWith("/suspend")) {
      items.push({
        label: "Rahul Verma (FE-1001)",
        to: "/admin/executives/FE-1001",
      });
      items.push({ label: "Access Control", to: pathname });
    } else {
      items.push({ label: "Executive Profile", to: pathname });
    }
  } else if (pathname === "/admin/shifts") {
    items.push({ label: "Workforce & Operations", to: "/admin/shifts" });
    items.push({ label: "Shift Management & Rostering", to: "/admin/shifts" });
  } else if (pathname === "/admin/attendance") {
    items.push({ label: "Workforce & Operations", to: "/admin/attendance" });
    items.push({
      label: "Attendance & Mobile GPS Punches",
      to: "/admin/attendance",
    });
  } else if (pathname === "/admin/payroll") {
    items.push({ label: "Payroll & Finance", to: "/admin/payroll" });
    items.push({ label: "Payroll & Payslip Management", to: "/admin/payroll" });
  } else if (pathname === "/admin/dashboard") {
    items.push({ label: "Dashboard", to: "/admin/dashboard" });
    items.push({ label: "Executive Overview", to: "/admin/dashboard" });
  } else if (pathname === "/admin/dashboard/sales") {
    items.push({ label: "Dashboard", to: "/admin/dashboard" });
    items.push({ label: "Sales Performance", to: "/admin/dashboard/sales" });
  } else if (pathname === "/admin/dashboard/field") {
    items.push({ label: "Dashboard", to: "/admin/dashboard" });
    items.push({ label: "Field Activity", to: "/admin/dashboard/field" });
  } else if (pathname === "/admin/dashboard/revenue") {
    items.push({ label: "Dashboard", to: "/admin/dashboard" });
    items.push({ label: "Revenue Analytics", to: "/admin/dashboard/revenue" });
  } else if (pathname === "/admin/dashboard/conversions") {
    items.push({ label: "Dashboard", to: "/admin/dashboard" });
    items.push({
      label: "Conversion Funnel",
      to: "/admin/dashboard/conversions",
    });
  } else if (pathname === "/admin/dashboard/live") {
    items.push({ label: "Dashboard", to: "/admin/dashboard" });
    items.push({ label: "Live Monitoring", to: "/admin/dashboard/live" });
  } else if (pathname.startsWith("/admin/profile")) {
    items.push({ label: "Account", to: "/admin/profile" });
    if (pathname === "/admin/profile") {
      items.push({ label: "My Profile", to: "/admin/profile" });
    } else if (pathname === "/admin/profile/security") {
      items.push({ label: "Security & 2FA", to: "/admin/profile/security" });
    } else if (pathname === "/admin/profile/sessions") {
      items.push({ label: "Active Sessions", to: "/admin/profile/sessions" });
    }
  } else {
    items.push({ label: "Admin", to: "/admin/dashboard" });
    items.push({ label: "Overview", to: pathname });
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
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setHeaderMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const userRole = (user?.role as Role) || Role.SUPER_ADMIN;
  const showBigLogo = !collapsed || isHovered;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Refined Enterprise White Theme Sidebar */}
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
              <NavLink to="/admin/dashboard" className="flex items-center">
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
          {navCategories.map((cat, idx) => (
            <div key={idx} className="space-y-0.5">
              {showBigLogo && (
                <p className="px-3 text-[11px] font-medium text-slate-400 pt-2 pb-1">
                  {cat.title}
                </p>
              )}
              {cat.items.map((item) => {
                const isAllowed =
                  !item.allowed || item.allowed.includes(userRole);
                const Icon = item.icon;
                const isActive = (() => {
                  if (item.to === "/admin/demos") {
                    return (
                      location.pathname === "/admin/demos" ||
                      (location.pathname.startsWith("/admin/demos/") &&
                        ![
                          "/admin/demos/today",
                          "/admin/demos/scheduled",
                          "/admin/demos/completed",
                          "/admin/demos/conversions",
                        ].includes(location.pathname))
                    );
                  }
                  if (item.to === "/admin/follow-ups") {
                    return (
                      location.pathname === "/admin/follow-ups" ||
                      (location.pathname.startsWith("/admin/follow-ups/") &&
                        ![
                          "/admin/follow-ups/today",
                          "/admin/follow-ups/upcoming",
                          "/admin/follow-ups/overdue",
                          "/admin/follow-ups/completed",
                        ].includes(location.pathname))
                    );
                  }
                  if (item.to === "/admin/visits") {
                    return (
                      location.pathname === "/admin/visits" ||
                      (location.pathname.startsWith("/admin/visits/") &&
                        !location.pathname.startsWith(
                          "/admin/visits/gps-exceptions",
                        ))
                    );
                  }
                  if (item.to === "/admin/targets") {
                    return (
                      location.pathname === "/admin/targets" ||
                      location.pathname === "/admin/targets/create"
                    );
                  }
                  if (item.to === "/admin/targets/teams") {
                    return location.pathname === "/admin/targets/teams";
                  }
                  if (item.to === "/admin/targets/executives") {
                    return location.pathname === "/admin/targets/executives";
                  }
                  if (item.to === "/admin/incentives/rules") {
                    return location.pathname === "/admin/incentives/rules";
                  }
                  if (item.to === "/admin/incentives") {
                    return (
                      location.pathname === "/admin/incentives" ||
                      location.pathname === "/admin/incentives/approvals" ||
                      location.pathname === "/admin/incentives/payouts" ||
                      (location.pathname.startsWith("/admin/incentives/") &&
                        !location.pathname.startsWith(
                          "/admin/incentives/rules",
                        ))
                    );
                  }
                  if (item.to.startsWith("/admin/performance")) {
                    return location.pathname === item.to;
                  }
                  if (
                    [
                      "/admin/dashboard",
                      "/admin/profile",
                      "/admin/teams",
                      "/admin/territories",
                      "/admin/leads",
                      "/admin/businesses",
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

        {/* User Footer Profile Card in Sidebar */}
        <div
          className="border-t border-slate-100 p-2.5 relative z-20 flex-shrink-0"
          ref={sidebarRef}
        >
          {user && (
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
                  className={`flex items-center gap-2.5 ${showBigLogo ? "overflow-hidden" : "justify-center"}`}
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="User Avatar"
                      className="h-8 w-8 rounded-sm object-cover flex-shrink-0 shadow-xs border border-slate-200"
                    />
                  ) : (
                    <div className="relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm bg-[#0D1F3D] text-xs font-semibold text-white shadow-xs">
                      {user.fullName?.charAt(0) ??
                        user.email.charAt(0).toUpperCase()}
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
                      userMenuOpen ? "-rotate-90 text-slate-600" : ""
                    }`}
                  />
                )}
              </div>

              {/* User Quick Actions Dropdown Card popping upwards */}
              {userMenuOpen && (
                <div
                  className={`absolute bottom-full mb-2 rounded-sm border border-slate-200 bg-white p-2 shadow-2xl space-y-1 z-[100] ${
                    showBigLogo ? "left-0 right-0 w-full" : "left-0 w-56"
                  }`}
                >
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-[#0D1F3D] truncate">
                      {user.fullName || user.email}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                  <NavLink
                    to="/admin/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors"
                  >
                    <User className="h-4 w-4 text-[#E20613]" /> My Profile
                  </NavLink>
                  <NavLink
                    to="/admin/profile/security"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors"
                  >
                    <Shield className="h-4 w-4 text-blue-600" /> Security & 2FA
                  </NavLink>
                  <NavLink
                    to="/admin/profile/sessions"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors"
                  >
                    <Monitor className="h-4 w-4 text-purple-600" /> Active
                    Sessions
                  </NavLink>
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
          )}
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
          {/* Mandatory Left Header Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <NavLink
              to="/admin/dashboard"
              className="flex items-center text-slate-400 hover:text-[#0D1F3D] transition-colors"
            >
              <Home className="h-4 w-4" />
            </NavLink>
            {getBreadcrumbTrail(location.pathname).map((crumb, idx, arr) => {
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

          <div className="flex items-center gap-4">
            <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-sm border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100">
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E20613]" />
            </button>

            {/* Header User Profile Avatar Card */}
            {user && (
              <div className="relative" ref={headerRef}>
                <div
                  onClick={() => setHeaderMenuOpen(!headerMenuOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-sm cursor-pointer hover:bg-slate-100/80 transition-all"
                >
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="User Avatar"
                      className="h-9 w-9 rounded-sm object-cover shadow-xs border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#0D1F3D] text-xs font-bold text-white shadow-sm">
                      {user.fullName?.charAt(0) ??
                        user.email.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-[#0D1F3D]">
                      {user.fullName ?? user.email}
                    </p>
                    <p className="text-[11px] font-semibold text-[#E20613]">
                      {getUserRoleLabel(userRole)}
                    </p>
                  </div>
                </div>

                {/* Header User Dropdown Card */}
                {headerMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-sm border border-slate-200 bg-white p-2 shadow-2xl space-y-1 z-50">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-[#0D1F3D] truncate">
                        {user.fullName || user.email}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <NavLink
                      to="/admin/profile"
                      onClick={() => setHeaderMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]"
                    >
                      <User className="h-4 w-4 text-[#E20613]" /> My Profile
                    </NavLink>
                    <NavLink
                      to="/admin/profile/security"
                      onClick={() => setHeaderMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-sm px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0D1F3D]"
                    >
                      <Shield className="h-4 w-4 text-blue-600" /> Security
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
            )}
          </div>
        </header>

        {/* Main Page Render in Single Unified Shell Container */}
        <main className="flex-1 overflow-y-auto bg-[#F3F5F7]">
          <div className="mx-auto w-full max-w-[1720px] p-6 lg:p-8 space-y-6 font-sans">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
