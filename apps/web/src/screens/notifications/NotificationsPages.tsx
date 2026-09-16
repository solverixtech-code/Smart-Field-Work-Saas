import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  notificationApi,
  type CampaignRecord,
  type NotificationOverview,
  type PushTokenRecord,
  type NotificationTemplate,
} from "../../features/notifications/notification.api";
import {
  AlertCircle,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Eye,
  Flag,
  Gift,
  Megaphone,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  Smartphone,
  Users,
  Volume2,
  XCircle,
  Filter,
  Search,
  Sparkles,
  Shield,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  Check,
  Calendar,
  Clock,
  Layers,
  MessageSquare,
  Mail,
  Info,
  Radio,
  FileText,
} from "lucide-react";
import {
  Button,
  Checkbox,
  DataTable,
  Input,
  Select,
  type ColumnDef,
} from "../../components/ui";
import { DateRangePicker } from "../../components/ui/DateRangePicker";

type PageKind = "center" | "create" | "push" | "alerts" | "templates";
type NoticeType =
  "Announcement" | "Alert" | "Reminder" | "Promotion" | "Update" | "Other";

interface NotificationRow {
  id: string;
  title: string;
  description: string;
  type: NoticeType;
  audience: string;
  channel: string;
  status:
    | "Sent"
    | "Scheduled"
    | "Failed"
    | "Active"
    | "Disabled"
    | "Pending"
    | "Acknowledged"
    | "Resolved";
  created: string;
  delivery: string;
  icon: React.ElementType;
  tone: string;
}

const notificationRows: NotificationRow[] = [
  {
    id: "NOT-1001",
    title: "Plan Renewal Reminder",
    description: "Hi {{name}}, your plan will expire on {{date}}...",
    type: "Reminder",
    audience: "All Customers (2,145 Users)",
    channel: "WhatsApp · Email",
    status: "Sent",
    created: "22 May 2025 · 10:30 AM",
    delivery: "1,892 (88.2%)",
    icon: Send,
    tone: "rose",
  },
  {
    id: "NOT-1002",
    title: "Discount Offer – 20% Off",
    description: "Exclusive offer for your active plan...",
    type: "Promotion",
    audience: "Active Customers (1,532 Users)",
    channel: "WhatsApp · Email",
    status: "Sent",
    created: "21 May 2025 · 04:15 PM",
    delivery: "1,401 (91.5%)",
    icon: Gift,
    tone: "emerald",
  },
  {
    id: "NOT-1003",
    title: "Field Visit Assigned",
    description: "You have been assigned a new visit today...",
    type: "Alert",
    audience: "Field Executives (320 Users)",
    channel: "In-App · WhatsApp",
    status: "Sent",
    created: "21 May 2025 · 11:00 AM",
    delivery: "312 (97.5%)",
    icon: CalendarClock,
    tone: "blue",
  },
  {
    id: "NOT-1004",
    title: "New Feature Released",
    description: "We are excited to introduce a new feature...",
    type: "Announcement",
    audience: "All Customers (2,145 Users)",
    channel: "Email · In-App",
    status: "Sent",
    created: "20 May 2025 · 03:30 PM",
    delivery: "1,723 (80.3%)",
    icon: Megaphone,
    tone: "violet",
  },
  {
    id: "NOT-1005",
    title: "Payment Failed Alert",
    description: "We could not process your payment for this plan...",
    type: "Alert",
    audience: "Customers (85 Users)",
    channel: "Email · WhatsApp",
    status: "Failed",
    created: "20 May 2025 · 09:20 AM",
    delivery: "12 (14.1%)",
    icon: AlertCircle,
    tone: "rose",
  },
  {
    id: "NOT-1006",
    title: "Monthly Target Update",
    description: "Your monthly target has been updated...",
    type: "Update",
    audience: "Sales Executives (150 Users)",
    channel: "WhatsApp",
    status: "Sent",
    created: "19 May 2025 · 10:45 AM",
    delivery: "147 (98.0%)",
    icon: CheckCircle2,
    tone: "emerald",
  },
  {
    id: "NOT-1007",
    title: "Incentive Announcement",
    description: "Great news! New incentive scheme is live...",
    type: "Announcement",
    audience: "Sales Executives (150 Users)",
    channel: "Email · WhatsApp",
    status: "Sent",
    created: "18 May 2025 · 05:00 PM",
    delivery: "138 (92.0%)",
    icon: Sparkles,
    tone: "violet",
  },
  {
    id: "NOT-1008",
    title: "Survey Request",
    description: "We value your feedback. Please take 2 mins...",
    type: "Other",
    audience: "Active Customers (1,200 Users)",
    channel: "Email",
    status: "Scheduled",
    created: "23 May 2025 · 09:00 AM",
    delivery: "—",
    icon: FileText,
    tone: "cyan",
  },
];

const executiveSelectOptions = [
  {
    value: "all_executives",
    label: "All Field Executives",
    sublabel: "326 Active Field Sales Reps",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop&q=80",
  },
  {
    value: "rahul_verma",
    label: "Rahul Verma",
    sublabel: "FE-1001 • Mumbai North Zone",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  },
  {
    value: "priya_mehta",
    label: "Priya Mehta",
    sublabel: "FE-1002 • Western Suburbs Zone",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  },
  {
    value: "sanjay_yadav",
    label: "Sanjay Yadav",
    sublabel: "TL-1003 • Eastern Suburbs (Team Leader)",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  },
  {
    value: "karan_patil",
    label: "Karan Patil",
    sublabel: "FE-1009 • Thane Team",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    value: "neha_deshpande",
    label: "Neha Deshpande",
    sublabel: "FE-1014 • Pune Team",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
  },
];

const customerSelectOptions = [
  {
    value: "all_customers",
    label: "All Active Customers",
    sublabel: "2,145 Total Subscribed Stores",
    avatar:
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150",
  },
  {
    value: "apex_electronics",
    label: "Apex Electronics",
    sublabel: "B2B Merchant • Bandra West, Mumbai",
    avatar:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=150",
  },
  {
    value: "metro_retail",
    label: "Metro Retail Stores",
    sublabel: "Retail Chain • Andheri East, Mumbai",
    avatar:
      "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=150",
  },
  {
    value: "vanguard_pharma",
    label: "Vanguard Pharmacy",
    sublabel: "Healthcare Supplier • Dadar, Mumbai",
    avatar: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=150",
  },
];

const teamTerritorySelectOptions = [
  {
    value: "mumbai_west",
    label: "Mumbai West Zone",
    sublabel: "24 Executives • Territory Pool",
  },
  {
    value: "mumbai_north",
    label: "Mumbai North Zone",
    sublabel: "18 Executives • Territory Pool",
  },
  {
    value: "pune_central",
    label: "Pune Central Zone",
    sublabel: "12 Executives • Territory Pool",
  },
  {
    value: "thane_team",
    label: "Thane Sales Team",
    sublabel: "15 Executives • Team Pool",
  },
];

const statCards = [
  {
    label: "Total Sent",
    value: "1,248",
    change: "↑ 18.6%",
    subtext: "vs last 30 days",
    icon: Send,
    color: "text-rose-600 bg-rose-50",
  },
  {
    label: "Delivered",
    value: "1,089",
    change: "↑ 14.2%",
    percent: "87.3%",
    subtext: "vs last 30 days",
    icon: CheckCircle2,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Opened",
    value: "623",
    change: "↑ 12.7%",
    percent: "57.2%",
    subtext: "vs last 30 days",
    icon: Eye,
    color: "text-amber-600 bg-amber-50",
  },
  {
    label: "Clicked",
    value: "248",
    change: "↑ 9.7%",
    percent: "22.8%",
    subtext: "vs last 30 days",
    icon: Bell,
    color: "text-blue-600 bg-blue-50",
  },
  {
    label: "Failed",
    value: "42",
    change: "↓ 2.3%",
    percent: "3.4%",
    subtext: "vs last 30 days",
    icon: XCircle,
    color: "text-rose-600 bg-rose-50",
  },
];

const typeStyles: Record<NoticeType, string> = {
  Announcement: "bg-violet-50 text-violet-700 border-violet-200",
  Alert: "bg-rose-50 text-rose-700 border-rose-200",
  Reminder: "bg-blue-50 text-blue-700 border-blue-200",
  Promotion: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Update: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Other: "bg-slate-100 text-slate-700 border-slate-200",
};

function PageHeader({
  title,
  description,
  kind,
}: {
  title: string;
  description: string;
  kind: PageKind;
}) {
  const navigate = useNavigate();

  const actions =
    kind === "center" ? (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/notifications/push")}
          className="gap-2 font-bold shadow-xs"
        >
          <Send className="h-3.5 w-3.5" /> Push Notification
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/notifications/create")}
          className="gap-2 font-bold shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Create Notification
        </Button>
        <Button
          variant="accent"
          size="sm"
          onClick={() => navigate("/admin/notifications/executives")}
          className="gap-2 font-bold shadow-xs"
        >
          <Bell className="h-3.5 w-3.5" /> Executive Alerts
        </Button>
      </>
    ) : kind === "templates" ? (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Template import wizard opened.")}
          className="font-bold shadow-xs"
        >
          Import Template
        </Button>
        <Button
          variant="accent"
          size="sm"
          onClick={() => navigate("/admin/notifications/create")}
          className="gap-2 font-bold shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Create Template
        </Button>
      </>
    ) : kind === "alerts" ? (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info("Alert settings panel opened.")}
          className="font-bold shadow-xs"
        >
          Alert Settings
        </Button>
        <Button
          variant="accent"
          size="sm"
          onClick={() => navigate("/admin/notifications/create")}
          className="gap-2 font-bold shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" /> Create Executive Alert
        </Button>
      </>
    ) : kind === "push" ? (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/admin/notifications")}
          className="font-bold shadow-xs"
        >
          ← Notification Center
        </Button>
        <Button
          variant="accent"
          size="sm"
          onClick={() => toast.success("New push notification draft created.")}
          className="gap-2 font-bold shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" /> New Push Notification
        </Button>
      </>
    ) : (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.success("Notification saved as draft.")}
          className="font-bold shadow-xs"
        >
          Save as Draft
        </Button>
        <Button
          variant="accent"
          size="sm"
          onClick={() =>
            toast.success("Notification submitted for final delivery!")
          }
          className="gap-2 font-bold shadow-xs"
        >
          <Send className="h-3.5 w-3.5" /> Review & Send
        </Button>
      </>
    );

  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-3">
      <div>
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <button
            onClick={() => navigate("/admin/notifications")}
            className="hover:text-[#0D1F3D] cursor-pointer"
          >
            Notifications
          </button>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-[#0D1F3D] font-bold">{title}</span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#0D1F3D] tracking-tight">
          {title}
        </h1>
        <p className="mt-0.5 text-xs font-medium text-slate-500">
          {description}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">{actions}</div>
    </div>
  );
}

function Stats({
  alert = false,
  template = false,
  overview,
}: {
  alert?: boolean;
  template?: boolean;
  overview?: NotificationOverview | null;
}) {
  const defaultCards = overview
    ? [
        {
          label: "Total Sent",
          value: overview.sentCampaigns.toLocaleString(),
          change: "↑ Live",
          percent: `${overview.deliverySuccessRate}%`,
          subtext: "broadcast campaigns",
          icon: Send,
          color: "text-emerald-600 bg-emerald-50",
        },
        {
          label: "Delivery Rate",
          value: `${overview.deliverySuccessRate}%`,
          change: "↑ High",
          percent: "",
          subtext: overview.simulationMode ? "Dual simulation mode" : "FCM cloud verified",
          icon: CheckCircle2,
          color: "text-blue-600 bg-blue-50",
        },
        {
          label: "Active Push Devices",
          value: overview.activePushDevices.toLocaleString(),
          change: "↑ Active",
          percent: "",
          subtext: "registered tokens",
          icon: Smartphone,
          color: "text-purple-600 bg-purple-50",
        },
        {
          label: "Scheduled",
          value: overview.scheduledCampaigns.toLocaleString(),
          change: "↑ Pending",
          percent: "",
          subtext: "upcoming delivery",
          icon: CalendarClock,
          color: "text-amber-600 bg-amber-50",
        },
        {
          label: "FCM Mode",
          value: overview.simulationMode ? "Simulation" : "Connected",
          change: overview.simulationMode ? "Dry Run" : "Cloud FCM",
          percent: "",
          subtext: overview.simulationMode ? "Ready for prod keys" : "Firebase Admin SDK",
          icon: Radio,
          color: overview.simulationMode ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50",
        },
      ]
    : statCards;

  const cards = alert
    ? [
        {
          label: "Total Alerts",
          value: "156",
          change: "↑ 18.6%",
          percent: "",
          subtext: "vs last 30 days",
          icon: Bell,
          color: "text-rose-600 bg-rose-50",
        },
        {
          label: "Critical Alerts",
          value: "28",
          change: "↑ 27.3%",
          percent: "",
          subtext: "vs last 30 days",
          icon: AlertCircle,
          color: "text-rose-600 bg-rose-50",
        },
        {
          label: "Pending Alerts",
          value: "42",
          change: "↑ 14.2%",
          percent: "",
          subtext: "vs last 30 days",
          icon: CalendarClock,
          color: "text-amber-600 bg-amber-50",
        },
        {
          label: "Acknowledged",
          value: "72",
          change: "↑ 16.8%",
          percent: "",
          subtext: "vs last 30 days",
          icon: CheckCircle2,
          color: "text-emerald-600 bg-emerald-50",
        },
        {
          label: "Resolved",
          value: "42",
          change: "↑ 12.5%",
          percent: "",
          subtext: "vs last 30 days",
          icon: ClipboardCopy,
          color: "text-violet-600 bg-violet-50",
        },
      ]
    : template
      ? [
          {
            label: "Total Templates",
            value: "126",
            change: "↑ 18.6%",
            percent: "",
            subtext: "vs last 30 days",
            icon: ClipboardCopy,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Active Templates",
            value: "98",
            change: "↑ 16.2%",
            percent: "",
            subtext: "vs last 30 days",
            icon: Send,
            color: "text-emerald-600 bg-emerald-50",
          },
          {
            label: "Scheduled Templates",
            value: "14",
            change: "↑ 12.5%",
            percent: "",
            subtext: "vs last 30 days",
            icon: CalendarClock,
            color: "text-amber-600 bg-amber-50",
          },
          {
            label: "Archived Templates",
            value: "14",
            change: "↑ 9.3%",
            percent: "",
            subtext: "vs last 30 days",
            icon: ClipboardCopy,
            color: "text-violet-600 bg-violet-50",
          },
          {
            label: "Disabled Templates",
            value: "6",
            change: "↓ 4.1%",
            percent: "",
            subtext: "vs last 30 days",
            icon: XCircle,
            color: "text-rose-600 bg-rose-50",
          },
        ]
      : defaultCards;

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map(
        ({ label, value, change, percent, subtext, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${color}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-extrabold text-[#0D1F3D]">
                    {value}
                  </p>
                  {percent && (
                    <span className="text-xs font-bold text-slate-600">
                      ({percent})
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="mt-2.5 text-[11px] font-semibold text-emerald-600">
              {change}{" "}
              <span className="text-slate-400 font-normal">{subtext}</span>
            </p>
          </div>
        ),
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: NotificationRow["status"] }) {
  const style =
    status === "Failed"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : status === "Scheduled" || status === "Pending"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : status === "Resolved"
          ? "bg-violet-50 text-violet-700 border-violet-200"
          : status === "Disabled"
            ? "bg-slate-100 text-slate-600 border-slate-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-extrabold ${style}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function FilterBar({
  mode = "center",
}: {
  mode?: "center" | "alerts" | "templates";
}) {
  const [search, setSearch] = useState("");
  const [selectedExec, setSelectedExec] = useState("all_executives");

  return (
    <div className="rounded-sm border border-slate-200 bg-white p-3.5 shadow-xs space-y-3">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              mode === "alerts"
                ? "Search by alert title or description..."
                : mode === "templates"
                  ? "Search by template name or keyword..."
                  : "Search by title, message, or audience..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-sm border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
          />
        </div>

        <Select
          value="all"
          onChange={() => {}}
          options={[
            { value: "all", label: "All Types" },
            { value: "announcement", label: "Announcement" },
            { value: "alert", label: "Alert" },
            { value: "reminder", label: "Reminder" },
            { value: "promotion", label: "Promotion" },
          ]}
          searchable={true}
          placeholder="Filter Type..."
        />

        <Select
          value={selectedExec}
          onChange={(e) => setSelectedExec(e.target.value)}
          options={executiveSelectOptions}
          searchable={true}
          placeholder="Select Executive / Role..."
        />

        <Select
          value="all"
          onChange={() => {}}
          options={[
            { value: "all", label: "All Status" },
            { value: "sent", label: "Sent" },
            { value: "scheduled", label: "Scheduled" },
            { value: "failed", label: "Failed" },
          ]}
          searchable={true}
          placeholder="Filter Status..."
        />

        <Select
          value="all"
          onChange={() => {}}
          options={[
            { value: "all", label: "All Channels" },
            { value: "whatsapp", label: "WhatsApp" },
            { value: "email", label: "Email" },
            { value: "inapp", label: "In-App" },
          ]}
          searchable={true}
          placeholder="Filter Channel..."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-2.5">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="font-bold text-slate-500">Date Range:</span>
          {/* REUSABLE DATE RANGE PICKER COMPONENT */}
          <DateRangePicker />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.info("Filters cleared")}
            className="font-bold"
          >
            Clear Filters
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => toast.success("Filters applied")}
            className="font-bold shadow-xs"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}

// SCREEN 163: NOTIFICATION CENTER (/admin/notifications)
export function NotificationCenterPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "sent" | "scheduled" | "drafts" | "failed"
  >("all");
  const [overview, setOverview] = useState<NotificationOverview | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [ov, camps] = await Promise.all([
          notificationApi.getOverview(),
          notificationApi.listCampaigns(),
        ]);
        setOverview(ov);
        setCampaigns(camps.data);
      } catch {
        // Fallback gracefully
      }
    }
    loadData();
  }, []);

  const allRows: NotificationRow[] = useMemo(() => {
    if (campaigns.length > 0) {
      const liveRows: NotificationRow[] = campaigns.map((c) => ({
        id: `NOT-${c.id.slice(0, 6).toUpperCase()}`,
        title: c.title,
        description: c.body,
        type: (c.type === "ANNOUNCEMENT"
          ? "Announcement"
          : c.type === "EMERGENCY_ALERT" || c.type === "ALERT"
            ? "Alert"
            : c.type === "REMINDER"
              ? "Reminder"
              : c.type === "PROMOTION"
                ? "Promotion"
                : "Update") as NoticeType,
        audience:
          c.targetAudience === "ALL_EXECUTIVES"
            ? `All Field Executives (${c.totalRecipients || 1} Users)`
            : c.targetAudience,
        channel: c.channels.join(" · "),
        status: (c.status === "SENT"
          ? "Sent"
          : c.status === "SCHEDULED"
            ? "Scheduled"
            : c.status === "FAILED"
              ? "Failed"
              : "Active") as any,
        created: new Date(c.createdAt).toLocaleString([], {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        delivery: `${c.successCount} (${
          c.totalRecipients > 0
            ? Math.round((c.successCount / c.totalRecipients) * 100)
            : 100
        }%)`,
        icon: c.type.includes("ALERT") ? AlertCircle : Send,
        tone: c.type.includes("ALERT") ? "rose" : "emerald",
      }));
      return [...liveRows, ...notificationRows];
    }
    return notificationRows;
  }, [campaigns]);

  const filteredRows = useMemo(() => {
    if (activeTab === "sent")
      return allRows.filter((r) => r.status === "Sent");
    if (activeTab === "scheduled")
      return allRows.filter((r) => r.status === "Scheduled");
    if (activeTab === "failed")
      return allRows.filter((r) => r.status === "Failed");
    if (activeTab === "drafts")
      return allRows.filter((r) => r.type === "Other");
    return allRows;
  }, [activeTab, allRows]);

  const columns: ColumnDef<NotificationRow>[] = [
    {
      header: "Title & Message",
      cell: (row) => {
        const Icon = row.icon;
        return (
          <div className="flex items-center gap-3 min-w-[220px]">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${
                row.tone === "emerald"
                  ? "bg-emerald-50 text-emerald-600"
                  : row.tone === "blue"
                    ? "bg-blue-50 text-blue-600"
                    : row.tone === "violet"
                      ? "bg-purple-50 text-purple-600"
                      : "bg-rose-50 text-rose-600"
              }`}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div>
              <p className="font-extrabold text-[#0D1F3D] text-xs">
                {row.title}
              </p>
              <p className="text-[11px] font-medium text-slate-500 truncate max-w-[240px] mt-0.5">
                {row.description}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Type",
      cell: (row) => (
        <span
          className={`inline-flex rounded-sm border px-2 py-0.5 text-[10px] font-extrabold ${typeStyles[row.type]}`}
        >
          {row.type}
        </span>
      ),
    },
    {
      header: "Audience",
      cell: (row) => (
        <div>
          <p className="font-extrabold text-[#0D1F3D] text-xs">
            {row.audience}
          </p>
        </div>
      ),
    },
    {
      header: "Channel",
      cell: (row) => (
        <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-sm">
          {row.channel}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Sent / Scheduled",
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.created}
        </span>
      ),
    },
    {
      header: "Delivery",
      cell: (row) => (
        <span className="font-mono font-extrabold text-[#0D1F3D] text-xs">
          {row.delivery}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => toast.info(`Viewing details for ${row.title}`)}
            className="rounded-sm p-1.5 text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D] cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => toast.info(`More options for ${row.title}`)}
            className="rounded-sm p-1.5 text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D] cursor-pointer"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const tabs = [
    { id: "all", label: "All Notifications", count: 1248 },
    { id: "sent", label: "Sent", count: 1089 },
    { id: "scheduled", label: "Scheduled", count: 117 },
    { id: "drafts", label: "Drafts", count: 18 },
    { id: "failed", label: "Failed", count: 42 },
  ] as const;

  return (
    <div className="space-y-4 font-sans pb-12">
      <PageHeader
        kind="center"
        title="Notification Center"
        description="Manage all system notifications, announcements and communication history."
      />

      <Stats overview={overview} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Main Left Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          <FilterBar mode="center" />

          {/* SYSTEM CONSISTENT SUB TABS NAVBAR */}
          <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 pt-1.5 rounded-sm shadow-xs overflow-x-auto custom-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-indigo-600 text-indigo-700 bg-slate-50/80 rounded-t-sm"
                      : "border-transparent text-slate-500 hover:text-[#0D1F3D] hover:border-slate-300"
                  }`}
                >
                  <span>
                    {tab.label} ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>

          <div className="">
            <DataTable
              columns={columns}
              data={filteredRows}
              keyExtractor={(row) => row.id}
              density="compact"
            />
          </div>
        </div>

        {/* Right Sidebar Widgets (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Donut Overview */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Notification Overview
            </h3>
            <div className="flex items-center gap-4 pt-1">
              <div className="h-28 w-28 shrink-0 rounded-full border-[10px] border-purple-500 border-t-blue-500 border-r-emerald-500 border-b-amber-500 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-xl font-extrabold text-[#0D1F3D]">
                  1,248
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Total
                </span>
              </div>
              <div className="space-y-1.5 text-xs font-bold w-full">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />{" "}
                    Reminder
                  </span>
                  <span className="font-mono text-[#0D1F3D]">35.3% (440)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />{" "}
                    Alert
                  </span>
                  <span className="font-mono text-[#0D1F3D]">24.1% (300)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />{" "}
                    Promotion
                  </span>
                  <span className="font-mono text-[#0D1F3D]">18.3% (228)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />{" "}
                    Announcement
                  </span>
                  <span className="font-mono text-[#0D1F3D]">12.8% (160)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Channel Wise Delivery */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Channel Wise Delivery
            </h3>
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">WhatsApp</span>
                  <span className="text-emerald-600 font-mono">
                    812 (89.9%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: "89.9%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">Email</span>
                  <span className="text-purple-600 font-mono">358 (78.0%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-purple-600 rounded-full"
                    style={{ width: "78.0%" }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-slate-700">In-App Push</span>
                  <span className="text-blue-600 font-mono">198 (92.5%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: "92.5%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Performing */}
          <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Top Performing Notifications
            </h3>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-slate-100">
                <span className="font-extrabold text-[#0D1F3D]">
                  Plan Renewal Reminder
                </span>
                <span className="text-emerald-700 font-mono font-extrabold">
                  62.4% Open
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-slate-100">
                <span className="font-extrabold text-[#0D1F3D]">
                  Discount Offer – 20% Off
                </span>
                <span className="text-emerald-700 font-mono font-extrabold">
                  58.7% Open
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-sm bg-slate-50 border border-slate-100">
                <span className="font-extrabold text-[#0D1F3D]">
                  New Feature Released
                </span>
                <span className="text-emerald-700 font-mono font-extrabold">
                  55.1% Open
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SCREEN 164: CREATE NOTIFICATION (/admin/notifications/create)
export function CreateNotificationPage() {
  const navigate = useNavigate();
  const [noticeType, setNoticeType] = useState<NoticeType>("Announcement");
  const [selectedExec, setSelectedExec] = useState("rahul_verma");
  const [selectedCustomer, setSelectedCustomer] = useState("apex_electronics");
  const [selectedTeam, setSelectedTeam] = useState("mumbai_west");

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [scheduleDate, setScheduleDate] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "PUSH",
    "IN_APP",
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleBroadcast = async () => {
    if (!title.trim()) {
      toast.error("Please enter a notification title.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter the notification message body.");
      return;
    }

    try {
      setSubmitting(true);
      await notificationApi.createCampaign({
        title,
        body: message,
        channels: selectedChannels,
        category:
          noticeType === "Announcement"
            ? "ANNOUNCEMENT"
            : noticeType === "Alert"
              ? "ALERT"
              : noticeType === "Reminder"
                ? "REMINDER"
                : noticeType === "Promotion"
                  ? "PROMOTION"
                  : "SYSTEM_UPDATE",
        priority: "NORMAL",
        audienceType: "ALL_EXECUTIVES",
        scheduledAt: !sendNow && scheduleDate ? scheduleDate : undefined,
      });

      toast.success("Notification broadcast dispatched successfully!");
      navigate("/admin/notifications");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to dispatch notification.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 font-sans pb-12">
      <PageHeader
        kind="create"
        title="Create Notification"
        description="Send updates, alerts and announcements to the right audience."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Main Compose Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Stepper Bar */}
          <div className="flex items-center justify-between rounded-sm border border-slate-200 bg-white p-4 shadow-xs text-xs font-bold">
            <span className="text-[#E20613] flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-red-100 text-[#E20613] flex items-center justify-center text-[10px]">
                1
              </span>{" "}
              Compose
            </span>
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">
                2
              </span>{" "}
              Audience
            </span>
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">
                3
              </span>{" "}
              Delivery
            </span>
            <span className="text-slate-400 flex items-center gap-1.5">
              <span className="h-5 w-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px]">
                4
              </span>{" "}
              Review
            </span>
          </div>

          {/* Type Selector Grid */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              Notification Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(
                [
                  "Announcement",
                  "Alert",
                  "Reminder",
                  "Promotion",
                  "Update",
                  "Other",
                ] as NoticeType[]
              ).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setNoticeType(t)}
                  className={`p-3 rounded-sm border text-left transition-all cursor-pointer ${
                    noticeType === t
                      ? "border-[#E20613] bg-red-50/50 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <p className="text-xs font-extrabold text-[#0D1F3D]">{t}</p>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 leading-tight">
                    {t === "Announcement"
                      ? "General updates"
                      : t === "Alert"
                        ? "Important alerts"
                        : "Scheduled reminders"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Audience Selection */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              Audience Target Selection
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Select
                label="Send To *"
                value="all"
                options={[
                  { value: "all", label: "All Platform Users" },
                  { value: "custom", label: "Custom Targeted Audience" },
                ]}
                searchable={true}
              />
              <Select
                label="Executive Target *"
                value={selectedExec}
                onChange={(e) => setSelectedExec(e.target.value)}
                options={executiveSelectOptions}
                searchable={true}
                placeholder="Search executive..."
              />
              <Select
                label="Customer / Merchant *"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                options={customerSelectOptions}
                searchable={true}
                placeholder="Search merchant..."
              />
              <Select
                label="Teams / Territories *"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                options={teamTerritorySelectOptions}
                searchable={true}
                placeholder="Search territory..."
              />
            </div>
          </div>

          {/* Message Content */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              Message Content
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Title *"
                placeholder="Enter notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Input
                label="Short Description (Optional)"
                placeholder="Enter short description"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Message *
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message here..."
                className="w-full rounded-sm border border-slate-200 bg-slate-50/50 p-3 text-xs font-semibold text-[#0D1F3D] placeholder-slate-400 focus:border-[#E20613] focus:bg-white focus:outline-none"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-medium pt-1">
                <span>
                  Use merge fields to personalize. Example:{" "}
                  <code>&#123;name&#125;</code>,{" "}
                  <code>&#123;expiry_date&#125;</code>
                </span>
                <span>{message.length} / 5000</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage((m) => m + " {{name}}")}
                className="font-bold"
              >
                + Add Merge Field
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage((m) => m + " 😊")}
                className="font-bold"
              >
                😊 Add Emoji
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Media attachment opened")}
                className="font-bold"
              >
                📎 Add Media
              </Button>
            </div>
          </div>

          {/* Delivery Settings */}
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              Delivery Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setSendNow(true)}
                className={`p-3 rounded-sm border text-left font-bold text-xs cursor-pointer ${
                  sendNow
                    ? "border-[#E20613] bg-red-50/50 text-[#0D1F3D]"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                Send Immediately
              </button>
              <button
                type="button"
                onClick={() => setSendNow(false)}
                className={`p-3 rounded-sm border text-left font-bold text-xs cursor-pointer ${
                  !sendNow
                    ? "border-[#E20613] bg-red-50/50 text-[#0D1F3D]"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                Schedule For Later
              </button>
              <Input
                label="Schedule Date"
                type="date"
                defaultValue="2025-05-22"
              />
              <Select
                label="Priority"
                options={[
                  { value: "high", label: "High Priority" },
                  { value: "normal", label: "Normal" },
                ]}
                searchable={true}
              />
            </div>
          </div>
        </div>

        {/* Live Preview Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Live Mobile Preview
            </h3>

            {/* Light Enterprise Mobile Preview Box */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold border-b border-slate-200/80 pb-2">
                <span>10:30 AM</span>
                <span className="font-semibold text-slate-400">
                  Smart Field Work
                </span>
              </div>
              <div className="bg-white rounded-xl p-3.5 space-y-1.5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <img
                    src="/assets/sfw-logo.png"
                    alt="Smart Field Work"
                    className="h-5 w-auto object-contain"
                  />
                </div>
                <h4 className="text-xs font-extrabold text-[#0D1F3D]">
                  {title || "Notification Title"}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {message ||
                    "This is how your notification message will appear on customer mobile screens."}
                </p>
                <span className="text-[10px] font-extrabold text-[#E20613] hover:underline cursor-pointer pt-1 flex items-center gap-0.5">
                  View Details <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3 text-xs font-semibold">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Notification Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Type</span>
                <span className="font-bold text-[#0D1F3D]">{noticeType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Recipients</span>
                <span className="font-bold text-emerald-600 font-mono">
                  1,892 Users
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Delivery</span>
                <span className="font-bold text-blue-600">
                  {sendNow ? "Immediately" : "Scheduled"}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Channels</span>
                <span className="font-bold text-slate-700">
                  {selectedChannels.join(", ")}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="accent"
                size="sm"
                fullWidth
                disabled={submitting}
                onClick={handleBroadcast}
                className="font-bold shadow-xs py-2.5"
              >
                <Send className="h-4 w-4 mr-1.5" />
                {submitting ? "Broadcasting..." : "Dispatch Broadcast Now"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// SCREEN 165: PUSH NOTIFICATIONS (/admin/notifications/push)
export function PushNotificationsPage() {
  const [platform, setPlatform] = useState<"android" | "ios" | "both">("both");
  const [selectedExec, setSelectedExec] = useState("rahul_verma");
  const [pushTitle, setPushTitle] = useState("Shift Route Update");
  const [pushMessage, setPushMessage] = useState(
    "Hi Rahul, your afternoon visit sequence in Western Zone has been updated with 2 high-priority leads."
  );
  const [actionUrl, setActionUrl] = useState("/admin/visits/today");
  const [sendingPush, setSendingPush] = useState(false);
  const [overview, setOverview] = useState<NotificationOverview | null>(null);
  const [tokensData, setTokensData] = useState<PushTokenRecord[]>([]);
  const [tokensLoading, setTokensLoading] = useState(false);

  const loadPushData = async () => {
    try {
      setTokensLoading(true);
      const [ov, tokensRes] = await Promise.all([
        notificationApi.getOverview(),
        notificationApi.getPushTokens(),
      ]);
      setOverview(ov);
      setTokensData(tokensRes.tokens);
    } catch {
      // Fallback
    } finally {
      setTokensLoading(false);
    }
  };

  useEffect(() => {
    loadPushData();
  }, []);

  const handleSendTestPush = async () => {
    if (!pushTitle.trim()) {
      toast.error("Please enter a push notification title.");
      return;
    }
    if (!pushMessage.trim()) {
      toast.error("Please enter a push notification message.");
      return;
    }

    try {
      setSendingPush(true);
      const res = await notificationApi.sendTestPush({
        title: pushTitle,
        body: pushMessage,
        actionUrl: actionUrl || undefined,
      });

      toast.success(
        `Push dispatched! ${res.successCount} delivered (${
          res.simulationMode ? "Dual Simulation Mode" : "Firebase Cloud Messaging"
        }).`
      );
      loadPushData();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to dispatch test push."
      );
    } finally {
      setSendingPush(false);
    }
  };

  const handleRegisterDemoDevice = async () => {
    try {
      const simToken = `fcm_${Math.random().toString(36).slice(2, 12)}_${Date.now()}`;
      await notificationApi.registerDeviceToken({
        token: simToken,
        platform: "ANDROID",
        deviceModel: "Google Pixel 8 Pro",
        appVersion: "2.4.0",
      });
      toast.success("Test device token registered successfully!");
      loadPushData();
    } catch (err: any) {
      toast.error("Could not register device token.");
    }
  };

  const tokenColumns: ColumnDef<PushTokenRecord>[] = [
    {
      header: "Device / Model",
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 text-slate-700 font-bold">
            <Smartphone className="h-4 w-4" />
          </span>
          <div>
            <p className="font-extrabold text-[#0D1F3D] text-xs">
              {row.deviceModel || "Mobile Device"}
            </p>
            <p className="text-[10px] text-slate-500">v{row.appVersion || "1.0.0"}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Platform",
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-extrabold ${
            row.platform === "ANDROID"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : row.platform === "IOS"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-purple-50 text-purple-700 border-purple-200"
          }`}
        >
          {row.platform}
        </span>
      ),
    },
    {
      header: "FCM Push Token",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-sm">
            {row.maskedToken}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(row.token);
              toast.info("FCM Token copied to clipboard");
            }}
            title="Copy full token"
            className="p-1 text-slate-400 hover:text-[#0D1F3D] cursor-pointer"
          >
            <ClipboardCopy className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
    {
      header: "Executive / User",
      cell: (row) => (
        <div>
          <p className="font-extrabold text-[#0D1F3D] text-xs">
            {row.user?.name || "Workspace Member"}
          </p>
          <p className="text-[10px] text-slate-500">{row.user?.email || "—"}</p>
        </div>
      ),
    },
    {
      header: "Last Seen",
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-600">
          {new Date(row.lastSeenAt).toLocaleString([], {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 rounded-sm border px-2 py-0.5 text-[10px] font-extrabold ${
            row.isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-500 border-slate-200"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {row.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans pb-12">
      <PageHeader
        kind="push"
        title="Push Notifications & FCM Tokens"
        description="Dispatch instant push notifications to mobile app users and monitor active FCM device tokens."
      />

      <Stats overview={overview} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Push Form (8 Cols) */}
        <div className="lg:col-span-8 rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-4 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              Dispatch Live Push Notification
            </h3>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-700 border border-emerald-200">
              <Radio className="h-3 w-3 animate-pulse text-emerald-600" />
              FCM Push Engine Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Target Field Executive *"
              value={selectedExec}
              onChange={(e) => setSelectedExec(e.target.value)}
              options={executiveSelectOptions}
              searchable={true}
              placeholder="Search field executive..."
            />

            <div className="space-y-1">
              <label className="font-bold text-[#0D1F3D] block">
                Platform Target *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["android", "ios", "both"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`p-2.5 rounded-sm border font-bold text-xs capitalize transition-all cursor-pointer ${
                      platform === p
                        ? "border-[#E20613] bg-red-50/50 text-[#0D1F3D]"
                        : "border-slate-200 text-slate-600 bg-white"
                    }`}
                  >
                    {p === "both" ? "Both" : p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Input
            label="Title *"
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
            placeholder="Notification title..."
          />

          <div className="space-y-1">
            <label className="font-bold text-[#0D1F3D] block">Message *</label>
            <textarea
              rows={3}
              value={pushMessage}
              onChange={(e) => setPushMessage(e.target.value)}
              placeholder="Message body..."
              className="w-full rounded-sm border border-slate-200 bg-slate-50/60 p-3 font-semibold text-[#0D1F3D] focus:border-[#E20613] focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Deep Link / Route"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              placeholder="/admin/visits/today"
            />
            <div className="space-y-1">
              <label className="font-bold text-[#0D1F3D] block">
                Simulation & Dev Actions
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegisterDemoDevice}
                className="w-full font-bold"
              >
                + Register Demo Device Token
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <p className="text-[11px] text-slate-500 font-medium">
              Push notification payload will be multicast to active device tokens.
            </p>
            <Button
              variant="accent"
              size="sm"
              disabled={sendingPush}
              onClick={handleSendTestPush}
              className="font-bold shadow-xs"
            >
              <Send className="h-4 w-4 mr-1.5" />
              {sendingPush ? "Delivering..." : "Send Push Notification Now"}
            </Button>
          </div>
        </div>

        {/* Right Phone Mockup Preview (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-sm border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-extrabold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Phone Lockscreen Preview
            </h3>

            {/* Light Enterprise Mobile Notification Preview */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3 shadow-xs">
              <div className="text-center text-[10px] text-slate-500 font-mono font-bold">
                10:30 AM • Mon, 22 May
              </div>
              <div className="bg-white rounded-xl p-3.5 space-y-1.5 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-[10px] pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <img
                      src="/assets/sfw-logo.png"
                      alt="SFW Push"
                      className="h-4.5 w-auto object-contain"
                    />
                  </div>
                  <span className="text-slate-400 font-mono">now</span>
                </div>
                <h4 className="text-xs font-extrabold text-[#0D1F3D]">
                  {pushTitle || "Push Notification"}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  {pushMessage || "Push message body will appear on executive screen."}
                </p>
                <span className="text-[10px] font-extrabold text-[#E20613] hover:underline cursor-pointer pt-1 flex items-center gap-0.5">
                  View in App <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Device Push Tokens Table */}
      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-[#0D1F3D]">
              Registered FCM Push Devices & Mobile Tokens
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time register of active Android, iOS, and Web push tokens receiving broadcasts.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadPushData}
            className="font-bold text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Refresh Devices
          </Button>
        </div>

        {tokensLoading ? (
          <div className="p-8 text-center text-xs font-semibold text-slate-400">
            Loading active device tokens...
          </div>
        ) : tokensData.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Smartphone className="h-8 w-8 mx-auto text-slate-300" />
            <p className="text-xs font-bold text-[#0D1F3D]">No device tokens registered yet</p>
            <p className="text-[11px] text-slate-500">
              When field executives log into the Android/iOS app or accept Web Push, their tokens appear here.
            </p>
            <Button
              variant="accent"
              size="sm"
              onClick={handleRegisterDemoDevice}
              className="mt-2 text-xs font-bold"
            >
              + Register Demo Device Token Now
            </Button>
          </div>
        ) : (
          <DataTable
            columns={tokenColumns}
            data={tokensData}
            keyExtractor={(row) => row.id}
            density="compact"
          />
        )}
      </div>
    </div>
  );
}

// SCREEN 166: EXECUTIVE ALERTS (/admin/notifications/executives)
export function ExecutiveAlertsPage() {
  const [activeTab, setActiveTab] = useState<
    "all" | "critical" | "pending" | "acknowledged" | "resolved"
  >("all");

  const alertRows = useMemo(() => {
    const base = [
      {
        id: "ALT-1001",
        title: "Sales Target at Risk",
        description: "Team Mumbai West is 35% behind the monthly target.",
        type: "Alert" as NoticeType,
        audience: "Amit Verma (Sales Manager)",
        channel: "WhatsApp · Push",
        status: "Pending" as const,
        created: "22 May 2025 · 10:30 AM",
        delivery: "Critical",
        icon: AlertCircle,
        tone: "rose",
      },
      {
        id: "ALT-1002",
        title: "Executive Inactive",
        description: "Rahul Kumar has been inactive for 2 days.",
        type: "Alert" as NoticeType,
        audience: "Rahul Kumar (Field Executive)",
        channel: "WhatsApp · Push",
        status: "Pending" as const,
        created: "22 May 2025 · 09:15 AM",
        delivery: "High",
        icon: AlertCircle,
        tone: "rose",
      },
      {
        id: "ALT-1003",
        title: "High Pending Payments",
        description: "5 payment leads are pending for more than 7 days.",
        type: "Alert" as NoticeType,
        audience: "Neha Patel (Sales Manager)",
        channel: "Email · WhatsApp",
        status: "Pending" as const,
        created: "22 May 2025 · 08:45 AM",
        delivery: "High",
        icon: AlertCircle,
        tone: "rose",
      },
      {
        id: "ALT-1004",
        title: "Visit Verification Failed",
        description: "3 visits failed GPS verification yesterday.",
        type: "Alert" as NoticeType,
        audience: "Suresh Tiwari (Area Manager)",
        channel: "In-App",
        status: "Acknowledged" as const,
        created: "21 May 2025 · 07:30 PM",
        delivery: "Medium",
        icon: CalendarClock,
        tone: "amber",
      },
      {
        id: "ALT-1005",
        title: "Top Performer",
        description: "Vikram Bansal achieved 120% of monthly target.",
        type: "Announcement" as NoticeType,
        audience: "Vikram Bansal (Field Executive)",
        channel: "In-App",
        status: "Resolved" as const,
        created: "21 May 2025 · 06:20 PM",
        delivery: "Low",
        icon: CheckCircle2,
        tone: "emerald",
      },
    ];

    if (activeTab === "critical")
      return base.filter((r) => r.delivery === "Critical");
    if (activeTab === "pending")
      return base.filter((r) => r.status === "Pending");
    if (activeTab === "acknowledged")
      return base.filter((r) => r.status === "Acknowledged");
    if (activeTab === "resolved")
      return base.filter((r) => r.status === "Resolved");
    return base;
  }, [activeTab]);

  const alertColumns: ColumnDef<NotificationRow>[] = [
    {
      header: "Alert Title",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-600 font-extrabold">
            ⚠️
          </span>
          <div>
            <p className="font-extrabold text-[#0D1F3D] text-xs">{row.title}</p>
            <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
              {row.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      cell: () => (
        <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-sm text-[10px] font-extrabold">
          Critical Alert
        </span>
      ),
    },
    {
      header: "Urgency",
      cell: (row) => (
        <span
          className={`font-extrabold px-2 py-0.5 rounded-sm text-[10px] ${
            row.delivery === "Critical"
              ? "bg-red-600 text-white"
              : row.delivery === "High"
                ? "bg-amber-500 text-white"
                : "bg-blue-600 text-white"
          }`}
        >
          {row.delivery.toUpperCase()}
        </span>
      ),
    },
    {
      header: "Executive / Role",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <img
            src={executiveSelectOptions[1].avatar}
            alt=""
            className="h-6 w-6 rounded-full object-cover border border-slate-200"
          />
          <div>
            <p className="font-extrabold text-[#0D1F3D] text-xs">
              {row.audience}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      align: "right",
      cell: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast.info(`Resolving alert: ${row.title}`)}
          className="text-[10px] font-bold py-1"
        >
          Acknowledge
        </Button>
      ),
    },
  ];

  const alertTabs = [
    { id: "all", label: "All Alerts", count: 156 },
    { id: "critical", label: "Critical", count: 28 },
    { id: "pending", label: "Pending", count: 42 },
    { id: "acknowledged", label: "Acknowledged", count: 72 },
    { id: "resolved", label: "Resolved", count: 42 },
  ] as const;

  return (
    <div className="space-y-4 font-sans pb-12">
      <PageHeader
        kind="alerts"
        title="Executive Alerts"
        description="Critical alerts and important notifications for executives and managers."
      />

      <Stats alert />

      <FilterBar mode="alerts" />

      {/* SYSTEM CONSISTENT SUB TABS NAVBAR */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 pt-1.5 rounded-sm shadow-xs overflow-x-auto custom-scrollbar">
        {alertTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-indigo-600 text-indigo-700 bg-slate-50/80 rounded-t-sm"
                  : "border-transparent text-slate-500 hover:text-[#0D1F3D] hover:border-slate-300"
              }`}
            >
              <span>
                {tab.label} ({tab.count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable
          columns={alertColumns}
          data={alertRows}
          keyExtractor={(row) => row.id}
          density="compact"
        />
      </div>
    </div>
  );
}

// SCREEN 167: NOTIFICATION TEMPLATES (/admin/notifications/templates)
export function NotificationTemplatesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    | "all"
    | "announcements"
    | "alerts"
    | "reminders"
    | "promotions"
    | "updates"
    | "other"
  >("all");
  const [realTemplates, setRealTemplates] = useState<NotificationTemplate[]>([]);

  const loadTemplates = async () => {
    try {
      const list = await notificationApi.listTemplates();
      setRealTemplates(list);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const allTemplates: NotificationRow[] = useMemo(() => {
    if (realTemplates.length > 0) {
      const live = realTemplates.map((t) => ({
        id: t.id,
        title: t.name,
        description: t.body,
        type: (t.category.toUpperCase().includes("ALERT")
          ? "Alert"
          : t.category.toUpperCase().includes("REMIND")
            ? "Reminder"
            : t.category.toUpperCase().includes("PROMO")
              ? "Promotion"
              : "Announcement") as NoticeType,
        audience: "Field Executives",
        channel: t.channels.join(" · "),
        status: (t.isActive ? "Active" : "Disabled") as any,
        created: new Date(t.createdAt).toLocaleDateString(),
        delivery: "Template",
        icon: FileText,
        tone: "purple",
      }));
      return live;
    }
    return notificationRows;
  }, [realTemplates]);

  const templateRows = useMemo(() => {
    if (activeTab === "announcements")
      return allTemplates.filter((r) => r.type === "Announcement");
    if (activeTab === "alerts")
      return allTemplates.filter((r) => r.type === "Alert");
    if (activeTab === "reminders")
      return allTemplates.filter((r) => r.type === "Reminder");
    if (activeTab === "promotions")
      return allTemplates.filter((r) => r.type === "Promotion");
    if (activeTab === "updates")
      return allTemplates.filter((r) => r.type === "Update");
    if (activeTab === "other")
      return allTemplates.filter((r) => r.type === "Other");
    return allTemplates;
  }, [activeTab, allTemplates]);

  const templateColumns: ColumnDef<NotificationRow>[] = [
    {
      header: "Template Name",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-50 text-purple-600 font-extrabold">
            📋
          </span>
          <div>
            <p className="font-extrabold text-[#0D1F3D] text-xs">{row.title}</p>
            <p className="text-[10px] text-slate-500">{row.description}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Type",
      cell: (row) => (
        <span
          className={`inline-flex rounded-sm border px-2 py-0.5 text-[10px] font-extrabold ${typeStyles[row.type]}`}
        >
          {row.type}
        </span>
      ),
    },
    {
      header: "Channel",
      cell: (row) => (
        <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-sm">
          {row.channel}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      align: "right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => toast.info(`Editing template ${row.title}`)}
            className="p-1 text-slate-600 hover:text-[#0D1F3D] cursor-pointer"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => toast.info(`Duplicating template ${row.title}`)}
            className="p-1 text-slate-600 hover:text-[#0D1F3D] cursor-pointer"
          >
            <ClipboardCopy className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const templateTabs = [
    { id: "all", label: "All Templates", count: 126 },
    { id: "announcements", label: "Announcements", count: 28 },
    { id: "alerts", label: "Alerts", count: 32 },
    { id: "reminders", label: "Reminders", count: 24 },
    { id: "promotions", label: "Promotions", count: 18 },
    { id: "updates", label: "Updates", count: 16 },
    { id: "other", label: "Other", count: 8 },
  ] as const;

  return (
    <div className="space-y-4 font-sans pb-12">
      <PageHeader
        kind="templates"
        title="Notification Templates"
        description="Create, manage and reuse templates for notifications across all channels."
      />

      <Stats template />

      <FilterBar mode="templates" />

      {/* SYSTEM CONSISTENT SUB TABS NAVBAR */}
      <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-2 pt-1.5 rounded-sm shadow-xs overflow-x-auto custom-scrollbar">
        {templateTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? "border-indigo-600 text-indigo-700 bg-slate-50/80 rounded-t-sm"
                  : "border-transparent text-slate-500 hover:text-[#0D1F3D] hover:border-slate-300"
              }`}
            >
              <span>
                {tab.label} ({tab.count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-sm border border-slate-200 bg-white p-4 shadow-xs">
        <DataTable
          columns={templateColumns}
          data={templateRows}
          keyExtractor={(row) => row.id}
          density="compact"
        />
      </div>
    </div>
  );
}
