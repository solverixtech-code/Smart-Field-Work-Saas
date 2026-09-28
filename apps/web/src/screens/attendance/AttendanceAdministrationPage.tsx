import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Clock3,
  Edit3,
  Filter,
  Info,
  Laptop,
  MapPin,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { DatePicker } from "../../components/ui/DatePicker";
import { GoogleMapPicker } from "../../components/ui/GoogleMapPicker";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Select } from "../../components/ui/Select";
import {
  attendanceApi,
  AttendanceAdminDevice,
  AttendanceAdminException,
  AttendanceAdminMembership,
  AttendanceAdminPolicy,
  AttendanceAdminSite,
  AttendanceHolidayRecord,
  AttendanceLeaveRecord,
} from "./attendance.api";

type TabId =
  | "sites"
  | "policy"
  | "holidays"
  | "leaves"
  | "rules"
  | "devices"
  | "exceptions";

interface ConfirmationState {
  title: string;
  message: string;
  successMessage: string;
  action: () => Promise<unknown>;
}

const tabs: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: "sites", label: "Sites & geofences", icon: MapPin },
  { id: "policy", label: "Punch policy", icon: ShieldCheck },
  { id: "holidays", label: "Holidays", icon: CalendarDays },
  { id: "leaves", label: "Approved leave", icon: Clock3 },
  { id: "rules", label: "Employee rules", icon: UserCog },
  { id: "devices", label: "Devices", icon: Laptop },
  { id: "exceptions", label: "Exceptions", icon: AlertTriangle },
];

const defaultPolicy: AttendanceAdminPolicy = {
  enforcementEnabled: false,
  maximumAccuracyMeters: 100,
  maximumLocationAgeSeconds: 120,
  requirePunchInSelfie: true,
  requirePunchOutSelfie: true,
};

const emptySite: Omit<AttendanceAdminSite, "id"> = {
  code: "",
  name: "",
  address: "",
  latitude: 19.076,
  longitude: 72.8777,
  radiusMeters: 100,
  isActive: true,
};

function dateValue(value: string): string {
  return value.slice(0, 10);
}

function personName(membership: {
  user: { fullName: string | null; email: string };
}): string {
  return membership.user.fullName || membership.user.email;
}

function StatusBadge({ value }: { value: string }) {
  const style =
    value === "ACTIVE" || value === "Approved" || value === "Reviewed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : value === "PENDING" || value === "Pending"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-flex rounded-sm border px-2 py-0.5 text-[10px] font-extrabold ${style}`}
    >
      {value}
    </span>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-4 last:border-0">
      <div>
        <p className="text-xs font-extrabold text-[#0D1F3D]">{label}</p>
        <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D1F3D] focus:ring-offset-2 ${checked ? "bg-[#0D1F3D]" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

function EmptyRow({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center px-6 text-center text-xs font-medium text-slate-500">
      {message}
    </div>
  );
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export type HolidayType = "FULL_DAY" | "HALF_DAY" | "OPTIONAL" | "PUBLIC";

export function parseHolidayDetails(name: string): { cleanName: string; type: HolidayType } {
  let type: HolidayType = "FULL_DAY";
  let cleanName = name;

  if (name.includes("[Half Day]") || name.toLowerCase().includes("half day")) {
    type = "HALF_DAY";
    cleanName = name.replace(/\[Half Day\]/gi, "").trim();
  } else if (name.includes("[Optional]") || name.toLowerCase().includes("optional") || name.toLowerCase().includes("restricted")) {
    type = "OPTIONAL";
    cleanName = name.replace(/\[Optional\]/gi, "").trim();
  } else if (name.includes("[Public]") || name.toLowerCase().includes("public") || name.toLowerCase().includes("gazetted")) {
    type = "PUBLIC";
    cleanName = name.replace(/\[Public\]/gi, "").trim();
  }

  return { cleanName, type };
}

const defaultSampleHolidays: AttendanceHolidayRecord[] = [
  { id: "h1", name: "New Year's Day [Public]", date: "2026-01-01" },
  { id: "h2", name: "Republic Day [Public]", date: "2026-01-26" },
  { id: "h3", name: "Maha Shivratri [Optional]", date: "2026-02-15" },
  { id: "h4", name: "Holi [Full Day]", date: "2026-03-04" },
  { id: "h5", name: "Good Friday [Optional]", date: "2026-04-03" },
  { id: "h6", name: "Independence Day [Public]", date: "2026-08-15" },
  { id: "h7", name: "Janmashtami [Optional]", date: "2026-09-04" },
  { id: "h8", name: "Ganesh Chaturthi [Full Day]", date: "2026-09-15" },
  { id: "h9", name: "Anant Chaturdashi [Half Day]", date: "2026-09-28" },
  { id: "h10", name: "Mahatma Gandhi Jayanti [Public]", date: "2026-10-02" },
  { id: "h11", name: "Dussehra [Full Day]", date: "2026-10-20" },
  { id: "h12", name: "Diwali [Full Day]", date: "2026-11-08" },
  { id: "h13", name: "Diwali Padwa [Half Day]", date: "2026-11-09" },
  { id: "h14", name: "Guru Nanak Jayanti [Optional]", date: "2026-11-24" },
  { id: "h15", name: "Christmas Day [Public]", date: "2026-12-25" },
];

export default function AttendanceAdministrationPage() {
  const [activeTab, setActiveTab] = useState<TabId>("sites");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sites, setSites] = useState<AttendanceAdminSite[]>([]);
  const [policy, setPolicy] = useState<AttendanceAdminPolicy>(defaultPolicy);
  const [holidays, setHolidays] = useState<AttendanceHolidayRecord[]>([]);
  const [leaves, setLeaves] = useState<AttendanceLeaveRecord[]>([]);
  const [memberships, setMemberships] = useState<AttendanceAdminMembership[]>(
    [],
  );
  const [devices, setDevices] = useState<AttendanceAdminDevice[]>([]);
  const [exceptions, setExceptions] = useState<AttendanceAdminException[]>([]);
  const [siteEditor, setSiteEditor] = useState<{
    id?: string;
    value: Omit<AttendanceAdminSite, "id">;
  } | null>(null);

  const [calYear, setCalYear] = useState<number>(2026);
  const [calMonth, setCalMonth] = useState<number>(8); // 8 = September
  const [holidayFilter, setHolidayFilter] = useState<string>("ALL");

  const [holidayEditor, setHolidayEditor] = useState<{
    open: boolean;
    editingId?: string;
    name: string;
    type: HolidayType;
    durationMode: "SINGLE" | "RANGE";
    startDate: string;
    endDate: string;
    notes?: string;
  }>({
    open: false,
    name: "",
    type: "FULL_DAY",
    durationMode: "SINGLE",
    startDate: "",
    endDate: "",
    notes: "",
  });
  const [leaveEditor, setLeaveEditor] = useState<{
    id?: string;
    membershipId: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    remarks: string;
  } | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState | null>(
    null,
  );

  const load = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      attendanceApi.admin.sites(),
      attendanceApi.admin.policy(),
      attendanceApi.admin.holidays(),
      attendanceApi.admin.leaves(),
      attendanceApi.admin.memberships(),
      attendanceApi.admin.devices(),
      attendanceApi.admin.exceptions(),
    ]);
    if (results[0].status === "fulfilled") setSites(results[0].value);
    if (results[1].status === "fulfilled" && results[1].value)
      setPolicy(results[1].value);
    if (results[2].status === "fulfilled") setHolidays(results[2].value);
    if (results[3].status === "fulfilled") setLeaves(results[3].value);
    if (results[4].status === "fulfilled") setMemberships(results[4].value);
    if (results[5].status === "fulfilled") setDevices(results[5].value);
    if (results[6].status === "fulfilled") setExceptions(results[6].value);
    if (results.some((result) => result.status === "rejected"))
      toast.error("Some attendance settings could not be loaded");
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const counts = useMemo(
    () => ({
      sites: sites.filter((site) => site.isActive).length,
      holidays: holidays.length,
      leaves: leaves.filter((leave) => leave.status === "APPROVED").length,
      pendingDevices: devices.filter((device) => device.status === "PENDING")
        .length,
      pendingExceptions: exceptions.filter((item) => !item.reviewedAt).length,
    }),
    [devices, exceptions, holidays, leaves, sites],
  );

  const summaryCards: Array<{
    label: string;
    value: number;
    icon: React.ElementType;
  }> = [
    { label: "Active sites", value: counts.sites, icon: Building2 },
    { label: "Holidays", value: counts.holidays, icon: CalendarDays },
    { label: "Approved leave", value: counts.leaves, icon: Clock3 },
    {
      label: "Devices awaiting approval",
      value: counts.pendingDevices,
      icon: Laptop,
    },
    {
      label: "Exceptions to review",
      value: counts.pendingExceptions,
      icon: AlertTriangle,
    },
  ];

  const withSaving = async (work: () => Promise<unknown>, message: string) => {
    setSaving(true);
    try {
      await work();
      toast.success(message);
      await load();
      return true;
    } catch {
      toast.error(
        "The change could not be saved. Check the form and try again.",
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveSite = async () => {
    if (
      !siteEditor ||
      !siteEditor.value.code.trim() ||
      !siteEditor.value.name.trim() ||
      !siteEditor.value.address.trim()
    ) {
      toast.error("Code, site name, and address are required");
      return;
    }
    const saved = await withSaving(
      () => attendanceApi.admin.saveSite(siteEditor.value, siteEditor.id),
      siteEditor.id ? "Office site updated" : "Office site added",
    );
    if (saved) setSiteEditor(null);
  };

  const saveHoliday = async () => {
    if (!holidayEditor.name.trim()) {
      toast.error("Holiday name is required");
      return;
    }

    let nameWithTag = holidayEditor.name.trim();
    if (holidayEditor.type === "HALF_DAY") nameWithTag += " [Half Day]";
    else if (holidayEditor.type === "OPTIONAL") nameWithTag += " [Optional]";
    else if (holidayEditor.type === "PUBLIC") nameWithTag += " [Public]";

    if (holidayEditor.durationMode === "RANGE" && holidayEditor.startDate && holidayEditor.endDate) {
      const start = new Date(holidayEditor.startDate);
      const end = new Date(holidayEditor.endDate);
      if (end < start) {
        toast.error("End date cannot be earlier than start date");
        return;
      }
      const dates: string[] = [];
      const curr = new Date(start);
      while (curr <= end) {
        dates.push(curr.toISOString().slice(0, 10));
        curr.setDate(curr.getDate() + 1);
      }
      const saved = await withSaving(async () => {
        for (const d of dates) {
          await attendanceApi.admin.saveHoliday({ name: nameWithTag, date: d });
        }
      }, `${dates.length} holiday date(s) saved`);
      if (saved) {
        setHolidayEditor({ open: false, name: "", type: "FULL_DAY", durationMode: "SINGLE", startDate: "", endDate: "" });
      }
    } else {
      if (!holidayEditor.startDate) {
        toast.error("Holiday date is required");
        return;
      }
      const saved = await withSaving(
        () => attendanceApi.admin.saveHoliday({ name: nameWithTag, date: holidayEditor.startDate }),
        "Holiday saved"
      );
      if (saved) {
        setHolidayEditor({ open: false, name: "", type: "FULL_DAY", durationMode: "SINGLE", startDate: "", endDate: "" });
      }
    }
  };

  const saveLeave = async () => {
    if (
      !leaveEditor ||
      !leaveEditor.membershipId ||
      !leaveEditor.leaveType.trim() ||
      !leaveEditor.startDate ||
      !leaveEditor.endDate
    ) {
      toast.error("Employee, leave type, and dates are required");
      return;
    }
    const { id, ...body } = leaveEditor;
    const saved = await withSaving(
      () => attendanceApi.admin.saveLeave(body, id),
      id ? "Leave updated" : "Approved leave added",
    );
    if (saved) setLeaveEditor(null);
  };

  return (
    <div className="space-y-5 pb-12 font-sans">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <span>Workforce & Operations</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#0D1F3D]">Attendance administration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0D1F3D]">
            Attendance Administration
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Configure where employees can punch, calendar rules, evidence
            requirements, and review queues.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void load()}
          disabled={loading}
          className="gap-2 rounded-sm"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {summaryCards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-sm border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold text-slate-500">
                {label}
              </p>
              <Icon className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-xl font-extrabold tabular-nums text-[#0D1F3D]">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-sm border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto border-b border-slate-200 bg-slate-50/70 px-3">
          <div
            className="flex min-w-max gap-1"
            role="tablist"
            aria-label="Attendance administration sections"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex h-12 items-center gap-2 border-b-2 px-3 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0D1F3D] ${activeTab === tab.id ? "border-[#E20613] text-[#0D1F3D]" : "border-transparent text-slate-500 hover:text-slate-800"}`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <EmptyRow message="Loading attendance administration…" />
        ) : (
          <div className="p-5 lg:p-6">
            {activeTab === "sites" && (
              <section className="space-y-4" aria-labelledby="sites-heading">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2
                      id="sites-heading"
                      className="text-base font-extrabold text-[#0D1F3D]"
                    >
                      Office sites and punch geofences
                    </h2>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Employees with office-only rules must punch inside one of
                      these boundaries.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="accent"
                    className="gap-2 rounded-sm"
                    onClick={() => setSiteEditor({ value: { ...emptySite } })}
                  >
                    <Plus className="h-4 w-4" /> Add site
                  </Button>
                </div>
                {sites.length === 0 ? (
                  <EmptyRow message="No office sites configured. Add a site before enabling office enforcement." />
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {sites.map((site) => (
                      <article
                        key={site.id}
                        className="flex items-start justify-between gap-4 rounded-sm border border-slate-200 p-4"
                      >
                        <div className="flex min-w-0 gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-600">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-xs font-extrabold text-[#0D1F3D]">
                                {site.name}
                              </h3>
                              <StatusBadge
                                value={site.isActive ? "ACTIVE" : "INACTIVE"}
                              />
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500">
                              {site.code} · {site.radiusMeters} m radius
                            </p>
                            <p className="mt-1 truncate text-[11px] text-slate-600">
                              {site.address}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            aria-label={`Edit ${site.name}`}
                            className="rounded-sm p-2 text-slate-500 hover:bg-slate-100"
                            onClick={() =>
                              setSiteEditor({
                                id: site.id,
                                value: {
                                  code: site.code,
                                  name: site.name,
                                  address: site.address,
                                  latitude: site.latitude,
                                  longitude: site.longitude,
                                  radiusMeters: site.radiusMeters,
                                  isActive: site.isActive,
                                },
                              })
                            }
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${site.name}`}
                            className="rounded-sm p-2 text-rose-500 hover:bg-rose-50"
                            onClick={() =>
                              setConfirmation({
                                title: "Remove office site?",
                                message: `${site.name} will no longer be available for new attendance punches. Historical punch evidence remains unchanged.`,
                                successMessage: "Office site removed",
                                action: () =>
                                  attendanceApi.admin.deleteSite(site.id),
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "policy" && (
              <section
                className="mx-auto max-w-4xl space-y-5"
                aria-labelledby="policy-heading"
              >
                <div>
                  <h2
                    id="policy-heading"
                    className="text-base font-extrabold text-[#0D1F3D]"
                  >
                    Punch evidence and enforcement
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500">
                    These checks apply consistently to every mobile punch in
                    this workspace.
                  </p>
                </div>
                <div className="rounded-sm border border-slate-200 px-5">
                  <Toggle
                    checked={policy.enforcementEnabled}
                    onChange={(value) =>
                      setPolicy({ ...policy, enforcementEnabled: value })
                    }
                    label="Enforce office punch boundaries"
                    description="Office-only employees cannot punch in outside an active office geofence. Enable this after office sites and employee rules are configured."
                  />
                  <Toggle
                    checked={policy.requirePunchInSelfie}
                    onChange={(value) =>
                      setPolicy({ ...policy, requirePunchInSelfie: value })
                    }
                    label="Require punch-in selfie"
                    description="Require a fresh camera capture before starting attendance."
                  />
                  <Toggle
                    checked={policy.requirePunchOutSelfie}
                    onChange={(value) =>
                      setPolicy({ ...policy, requirePunchOutSelfie: value })
                    }
                    label="Require punch-out selfie"
                    description="Require a fresh camera capture before closing attendance."
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    id="accuracy"
                    type="number"
                    label="Maximum GPS accuracy (metres)"
                    min={10}
                    max={1000}
                    value={policy.maximumAccuracyMeters}
                    onChange={(event) =>
                      setPolicy({
                        ...policy,
                        maximumAccuracyMeters: Number(event.target.value),
                      })
                    }
                  />
                  <Input
                    id="location-age"
                    type="number"
                    label="Maximum location age (seconds)"
                    min={15}
                    max={600}
                    value={policy.maximumLocationAgeSeconds}
                    onChange={(event) =>
                      setPolicy({
                        ...policy,
                        maximumLocationAgeSeconds: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="accent"
                    isLoading={saving}
                    onClick={() =>
                      void withSaving(
                        () => attendanceApi.admin.savePolicy(policy),
                        "Attendance policy saved",
                      )
                    }
                    className="rounded-sm"
                  >
                    Save policy
                  </Button>
                </div>
              </section>
            )}

            {activeTab === "holidays" && (() => {
              const effectiveHolidays = holidays.length > 0 ? holidays : defaultSampleHolidays;

              const filteredList = effectiveHolidays.filter((h) => {
                const { type } = parseHolidayDetails(h.name);
                if (holidayFilter === "FULL_DAY") return type === "FULL_DAY";
                if (holidayFilter === "HALF_DAY") return type === "HALF_DAY";
                if (holidayFilter === "OPTIONAL") return type === "OPTIONAL";
                if (holidayFilter === "PUBLIC") return type === "PUBLIC";
                return true;
              });

              const stats = {
                total: effectiveHolidays.length,
                fullDay: effectiveHolidays.filter((h) => parseHolidayDetails(h.name).type === "FULL_DAY").length,
                halfDay: effectiveHolidays.filter((h) => parseHolidayDetails(h.name).type === "HALF_DAY").length,
                optional: effectiveHolidays.filter((h) => parseHolidayDetails(h.name).type === "OPTIONAL").length,
                public: effectiveHolidays.filter((h) => parseHolidayDetails(h.name).type === "PUBLIC").length,
              };

              const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
              const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
              const mondayOffset = (firstDayOfWeek + 6) % 7;

              const getHolidayOnDay = (day: number) => {
                const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                return effectiveHolidays.find((h) => dateValue(h.date) === dateStr);
              };

              const handlePrevMonth = () => {
                if (calMonth === 0) {
                  setCalMonth(11);
                  setCalYear((prev) => prev - 1);
                } else {
                  setCalMonth((prev) => prev - 1);
                }
              };

              const handleNextMonth = () => {
                if (calMonth === 11) {
                  setCalMonth(0);
                  setCalYear((prev) => prev + 1);
                } else {
                  setCalMonth((prev) => prev + 1);
                }
              };

              return (
                <section className="space-y-6 font-sans">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
                      <p className="text-[11px] font-bold text-slate-400">Total Holidays ({calYear})</p>
                      <p className="mt-1 text-2xl font-extrabold text-[#0D1F3D]">{stats.total} Days</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4 shadow-sm">
                      <p className="text-[11px] font-bold text-emerald-700">Full Day Holidays</p>
                      <p className="mt-1 text-2xl font-extrabold text-emerald-800">{stats.fullDay} Days</p>
                    </div>
                    <div className="rounded-2xl border border-purple-200/80 bg-purple-50/60 p-4 shadow-sm">
                      <p className="text-[11px] font-bold text-purple-700">Half Day Holidays</p>
                      <p className="mt-1 text-2xl font-extrabold text-purple-800">{stats.halfDay} Days</p>
                    </div>
                    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4 shadow-sm">
                      <p className="text-[11px] font-bold text-amber-700">Optional / Restricted</p>
                      <p className="mt-1 text-2xl font-extrabold text-amber-800">{stats.optional} Days</p>
                    </div>
                    <div className="rounded-2xl border border-blue-200/80 bg-blue-50/60 p-4 shadow-sm">
                      <p className="text-[11px] font-bold text-blue-700">Public Holidays</p>
                      <p className="mt-1 text-2xl font-extrabold text-blue-800">{stats.public} Days</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-[#E20613]" />
                        <div>
                          <h3 className="text-lg font-extrabold text-[#0D1F3D]">
                            Attendance & Holiday Calendar - {MONTH_NAMES[calMonth]} {calYear}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">
                            Manage workspace holidays, half days, and scheduled office closures.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="rounded-lg p-1 text-slate-600 hover:bg-white hover:shadow-xs transition"
                            title="Previous Month"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          <div className="px-3 text-xs font-extrabold text-[#0D1F3D]">
                            {MONTH_NAMES[calMonth]} {calYear}
                          </div>

                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="rounded-lg p-1 text-slate-600 hover:bg-white hover:shadow-xs transition"
                            title="Next Month"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>

                        <Button
                          size="sm"
                          variant="accent"
                          className="gap-2 font-bold shadow-xs"
                          onClick={() =>
                            setHolidayEditor({
                              open: true,
                              name: "",
                              type: "FULL_DAY",
                              durationMode: "SINGLE",
                              startDate: `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`,
                              endDate: `${calYear}-${String(calMonth + 1).padStart(2, "0")}-01`,
                            })
                          }
                        >
                          <Plus className="h-4 w-4" /> Add Holiday
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                      <span className="text-slate-400 font-bold mr-1 flex items-center gap-1">
                        <Filter className="h-3.5 w-3.5" /> Filter:
                      </span>
                      {[
                        { id: "ALL", label: `All (${effectiveHolidays.length})` },
                        { id: "FULL_DAY", label: `Full Day (${stats.fullDay})` },
                        { id: "HALF_DAY", label: `Half Day (${stats.halfDay})` },
                        { id: "OPTIONAL", label: `Optional (${stats.optional})` },
                        { id: "PUBLIC", label: `Public (${stats.public})` },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setHolidayFilter(tab.id)}
                          className={`rounded-full px-3 py-1 text-xs transition ${
                            holidayFilter === tab.id
                              ? "bg-[#0D1F3D] text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-slate-500 py-2 border-b border-slate-100 bg-slate-50/60 rounded-xl">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((dayName) => (
                        <span key={dayName}>{dayName}</span>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2.5">
                      {Array.from({ length: mondayOffset }, (_, idx) => (
                        <div key={`offset-${idx}`} className="h-24 rounded-xl border border-slate-100 bg-slate-50/30" />
                      ))}

                      {Array.from({ length: daysInMonth }, (_, idx) => {
                        const dayNum = idx + 1;
                        const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                        const holidayItem = getHolidayOnDay(dayNum);
                        const details = holidayItem ? parseHolidayDetails(holidayItem.name) : null;

                        const badgeStyle = details
                          ? details.type === "HALF_DAY"
                            ? "bg-purple-100 text-purple-800 border-purple-200"
                            : details.type === "OPTIONAL"
                            ? "bg-amber-100 text-amber-800 border-amber-200"
                            : details.type === "PUBLIC"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-emerald-100 text-emerald-800 border-emerald-200"
                          : "";

                        const typeLabel = details
                          ? details.type === "HALF_DAY"
                            ? "Half Day"
                            : details.type === "OPTIONAL"
                            ? "Optional"
                            : details.type === "PUBLIC"
                            ? "Public"
                            : "Full Day"
                          : "";

                        return (
                          <div
                            key={dayNum}
                            onClick={() => {
                              if (holidayItem && details) {
                                setHolidayEditor({
                                  open: true,
                                  editingId: holidayItem.id,
                                  name: details.cleanName,
                                  type: details.type,
                                  durationMode: "SINGLE",
                                  startDate: dateValue(holidayItem.date),
                                  endDate: dateValue(holidayItem.date),
                                });
                              } else {
                                setHolidayEditor({
                                  open: true,
                                  name: "",
                                  type: "FULL_DAY",
                                  durationMode: "SINGLE",
                                  startDate: dateStr,
                                  endDate: dateStr,
                                });
                              }
                            }}
                            className={`group relative h-24 rounded-xl border p-2 flex flex-col justify-between transition cursor-pointer ${
                              holidayItem
                                ? "border-slate-300 bg-white hover:shadow-md hover:border-[#0D1F3D]"
                                : "border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-[#0D1F3D]">{dayNum}</span>
                              {holidayItem && (
                                <span className={`rounded-md border px-1.5 py-0.5 text-[9px] font-extrabold ${badgeStyle}`}>
                                  {typeLabel}
                                </span>
                              )}
                            </div>

                            {holidayItem ? (
                              <div className="space-y-0.5 mt-1">
                                <p className="text-[11px] font-extrabold text-[#0D1F3D] line-clamp-2 leading-tight">
                                  {details?.cleanName}
                                </p>
                                <p className="text-[9px] font-semibold text-slate-400">
                                  {typeLabel} Holiday
                                </p>
                              </div>
                            ) : (
                              <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-bold text-[#E20613] flex items-center gap-1">
                                <Plus className="h-3 w-3" /> Add
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-5 text-xs font-bold pt-4 border-t border-slate-100 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" /> 🟢 Full Day Holiday
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-purple-500" /> 🟣 Half Day Holiday
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-amber-500" /> 🟡 Optional / Restricted
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-3 w-3 rounded-full bg-blue-500" /> 🔵 Public / Gazetted
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
                          <Tag className="h-4 w-4 text-[#E20613]" /> Upcoming Workspace Holidays
                        </h3>
                        <span className="text-xs font-bold text-slate-400">
                          {filteredList.length} Scheduled
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-100">
                        <table className="w-full text-left text-xs font-semibold">
                          <thead className="bg-slate-50/80 text-[11px] font-extrabold text-slate-600 uppercase border-b border-slate-100">
                            <tr>
                              <th className="px-4 py-3">Holiday Name</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Day of Week</th>
                              <th className="px-4 py-3">Type</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredList.map((h) => {
                              const d = new Date(h.date);
                              const details = parseHolidayDetails(h.name);
                              const dayOfWeek = d.toLocaleDateString("en-IN", { weekday: "long" });
                              const badgeStyle =
                                details.type === "HALF_DAY"
                                  ? "bg-purple-100 text-purple-800 border-purple-200"
                                  : details.type === "OPTIONAL"
                                  ? "bg-amber-100 text-amber-800 border-amber-200"
                                  : details.type === "PUBLIC"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-emerald-100 text-emerald-800 border-emerald-200";

                              return (
                                <tr key={h.id} className="hover:bg-slate-50 transition">
                                  <td className="px-4 py-3 font-extrabold text-[#0D1F3D]">
                                    {details.cleanName}
                                  </td>
                                  <td className="px-4 py-3 font-bold text-slate-600">
                                    {d.toLocaleDateString("en-IN", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </td>
                                  <td className="px-4 py-3 text-slate-500 font-medium">{dayOfWeek}</td>
                                  <td className="px-4 py-3">
                                    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${badgeStyle}`}>
                                      {details.type.replace("_", " ")}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right space-x-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setHolidayEditor({
                                          open: true,
                                          editingId: h.id,
                                          name: details.cleanName,
                                          type: details.type,
                                          durationMode: "SINGLE",
                                          startDate: dateValue(h.date),
                                          endDate: dateValue(h.date),
                                        })
                                      }
                                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
                                    >
                                      <Edit3 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setConfirmation({
                                          title: "Remove holiday?",
                                          message: `${details.cleanName} will no longer be marked as a holiday.`,
                                          successMessage: "Holiday removed",
                                          action: () => attendanceApi.admin.deleteHoliday(h.id),
                                        })
                                      }
                                      className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-4 space-y-4">
                      <h3 className="text-base font-extrabold text-[#0D1F3D] flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" /> Holiday Policy Guidelines
                      </h3>
                      <div className="space-y-3 text-xs font-medium text-slate-600">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                          <p className="font-extrabold text-[#0D1F3D]">Full Day Holidays</p>
                          <p className="text-[11px] text-slate-500">
                            Automatic absence finalization is skipped. Field executives are not required to log attendance punches.
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                          <p className="font-extrabold text-[#0D1F3D]">Half Day Holidays</p>
                          <p className="text-[11px] text-slate-500">
                            Executives punch in for 4 hours of working time. Attendance is marked as Half Day upon punch out.
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1">
                          <p className="font-extrabold text-[#0D1F3D]">Optional / Restricted</p>
                          <p className="text-[11px] text-slate-500">
                            Employees can choose up to 2 optional holidays per calendar year subject to manager approval.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              );
            })()}

            {activeTab === "leaves" && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-[#0D1F3D]">
                      Approved employee leave
                    </h2>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Approved periods take precedence over automatic absence
                      finalization.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="accent"
                    className="gap-2 rounded-sm"
                    onClick={() =>
                      setLeaveEditor({
                        membershipId: "",
                        leaveType: "",
                        startDate: "",
                        endDate: "",
                        remarks: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4" /> Add leave
                  </Button>
                </div>
                {leaves.length === 0 ? (
                  <EmptyRow message="No approved leave records found." />
                ) : (
                  <div className="overflow-x-auto rounded-sm border border-slate-200">
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Employee</th>
                          <th className="px-4 py-3">Leave type</th>
                          <th className="px-4 py-3">Period</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaves.map((leave) => (
                          <tr
                            key={leave.id}
                            className="border-t border-slate-100"
                          >
                            <td className="px-4 py-3">
                              <p className="font-bold text-[#0D1F3D]">
                                {personName(leave.membership)}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {leave.membership.employeeCode ||
                                  "No employee code"}
                              </p>
                            </td>
                            <td className="px-4 py-3 font-semibold text-slate-700">
                              {leave.leaveType}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {dateValue(leave.startDate)} –{" "}
                              {dateValue(leave.endDate)}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge value="Approved" />
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                aria-label="Edit leave"
                                className="rounded-sm p-2 text-slate-500 hover:bg-slate-100"
                                onClick={() =>
                                  setLeaveEditor({
                                    id: leave.id,
                                    membershipId: leave.membershipId,
                                    leaveType: leave.leaveType,
                                    startDate: dateValue(leave.startDate),
                                    endDate: dateValue(leave.endDate),
                                    remarks: leave.remarks || "",
                                  })
                                }
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                aria-label="Delete leave"
                                className="rounded-sm p-2 text-rose-500 hover:bg-rose-50"
                                onClick={() =>
                                  setConfirmation({
                                    title: "Remove approved leave?",
                                    message: `The approved ${leave.leaveType.toLowerCase()} record for ${personName(leave.membership)} will be removed.`,
                                    successMessage: "Leave removed",
                                    action: () =>
                                      attendanceApi.admin.deleteLeave(leave.id),
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {activeTab === "rules" && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#0D1F3D]">
                    Employee mobility rules
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Choose whether each employee must use an office site or may
                    punch from field locations.
                  </p>
                </div>
                {memberships.length === 0 ? (
                  <EmptyRow message="No active employees found." />
                ) : (
                  <div className="overflow-x-auto rounded-sm border border-slate-200">
                    <table className="w-full min-w-[720px] text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Employee</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Punch location rule</th>
                          <th className="px-4 py-3">Effective behavior</th>
                        </tr>
                      </thead>
                      <tbody>
                        {memberships.map((membership) => {
                          const mode =
                            membership.attendanceOverride?.mobilityMode ||
                            "INHERIT";
                          const roleIsField = membership.tenantRole?.code
                            .toLowerCase()
                            .includes("executive");
                          return (
                            <tr
                              key={membership.id}
                              className="border-t border-slate-100"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  {membership.user.avatarUrl ? (
                                    <img
                                      src={membership.user.avatarUrl}
                                      alt=""
                                      className="h-8 w-8 rounded-sm object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 text-[10px] font-bold text-slate-600">
                                      {personName(membership)
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-[#0D1F3D]">
                                      {personName(membership)}
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                      {membership.employeeCode ||
                                        membership.user.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600">
                                {membership.tenantRole?.name ||
                                  membership.designation ||
                                  "Employee"}
                              </td>
                              <td className="w-64 px-4 py-3">
                                <Select
                                  native
                                  searchable={false}
                                  value={mode}
                                  options={[
                                    {
                                      value: "INHERIT",
                                      label: "Use role default",
                                    },
                                    {
                                      value: "OFFICE_ONLY",
                                      label: "Office only",
                                    },
                                    {
                                      value: "FIELD_REMOTE",
                                      label: "Field remote",
                                    },
                                  ]}
                                  onChange={(event) =>
                                    void withSaving(
                                      () =>
                                        event.target.value === "INHERIT"
                                          ? attendanceApi.admin.deleteOverride(
                                              membership.id,
                                            )
                                          : attendanceApi.admin.setOverride(
                                              membership.id,
                                              event.target.value as
                                                "OFFICE_ONLY" | "FIELD_REMOTE",
                                            ),
                                      "Employee rule updated",
                                    )
                                  }
                                />
                              </td>
                              <td className="px-4 py-3 text-[11px] font-semibold text-slate-600">
                                {mode === "OFFICE_ONLY" ||
                                (mode === "INHERIT" && !roleIsField)
                                  ? "Must punch inside an office"
                                  : "May punch from field locations"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {activeTab === "devices" && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#0D1F3D]">
                    Enrolled browser installations
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Approve replacement installations or revoke access from
                    devices that should no longer punch.
                  </p>
                </div>
                {devices.length === 0 ? (
                  <EmptyRow message="No employee devices have been enrolled." />
                ) : (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {devices.map((device) => (
                      <article
                        key={device.id}
                        className="flex items-start justify-between gap-4 rounded-sm border border-slate-200 p-4"
                      >
                        <div className="flex min-w-0 gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                            <Laptop className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-xs font-extrabold text-[#0D1F3D]">
                                {personName(device.membership)}
                              </h3>
                              <StatusBadge value={device.status} />
                            </div>
                            <p className="mt-1 text-[11px] text-slate-600">
                              {device.label ||
                                device.platform ||
                                "Browser installation"}
                            </p>
                            <p className="mt-1 truncate text-[10px] text-slate-400">
                              Last seen{" "}
                              {new Date(device.lastSeenAt).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          {device.status !== "ACTIVE" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1 rounded-sm text-emerald-700"
                              onClick={() =>
                                void withSaving(
                                  () =>
                                    attendanceApi.admin.setDeviceStatus(
                                      device.id,
                                      "ACTIVE",
                                    ),
                                  "Device approved",
                                )
                              }
                            >
                              <Check className="h-3.5 w-3.5" /> Approve
                            </Button>
                          ) : null}
                          {device.status !== "REVOKED" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-sm text-rose-600"
                              onClick={() =>
                                void withSaving(
                                  () =>
                                    attendanceApi.admin.setDeviceStatus(
                                      device.id,
                                      "REVOKED",
                                    ),
                                  "Device revoked",
                                )
                              }
                            >
                              Revoke
                            </Button>
                          ) : null}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "exceptions" && (
              <section className="space-y-4">
                <div>
                  <h2 className="text-base font-extrabold text-[#0D1F3D]">
                    Attendance exceptions
                  </h2>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Review outside-geofence punch-outs and punches that conflict
                    with calendar records.
                  </p>
                </div>
                {exceptions.length === 0 ? (
                  <EmptyRow message="No attendance exceptions require review." />
                ) : (
                  <div className="overflow-x-auto rounded-sm border border-slate-200">
                    <table className="w-full min-w-[760px] text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Employee</th>
                          <th className="px-4 py-3">Exception</th>
                          <th className="px-4 py-3">Recorded</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {exceptions.map((exception) => (
                          <tr
                            key={exception.id}
                            className="border-t border-slate-100"
                          >
                            <td className="px-4 py-3">
                              <p className="font-bold text-[#0D1F3D]">
                                {personName(exception.membership)}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {exception.membership.employeeCode ||
                                  exception.membership.user.email}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-semibold text-slate-700">
                                {exception.type === "OUTSIDE_GEOFENCE_PUNCH_OUT"
                                  ? "Outside geofence punch-out"
                                  : "Calendar conflict"}
                              </p>
                              {exception.punchLog?.locationName ? (
                                <p className="mt-1 text-[10px] text-slate-400">
                                  {exception.punchLog.locationName}
                                </p>
                              ) : null}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {new Date(exception.createdAt).toLocaleString(
                                "en-IN",
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge
                                value={
                                  exception.reviewedAt ? "Reviewed" : "Pending"
                                }
                              />
                            </td>
                            <td className="px-4 py-3 text-right">
                              {!exception.reviewedAt ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 rounded-sm"
                                  onClick={() =>
                                    void withSaving(
                                      () =>
                                        attendanceApi.admin.reviewException(
                                          exception.id,
                                        ),
                                      "Exception marked as reviewed",
                                    )
                                  }
                                >
                                  <Check className="h-3.5 w-3.5" /> Mark
                                  reviewed
                                </Button>
                              ) : (
                                <span className="text-[11px] text-slate-400">
                                  Completed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(siteEditor)}
        onClose={() => setSiteEditor(null)}
        title={siteEditor?.id ? "Edit office site" : "Add office site"}
        maxWidth="max-w-4xl"
      >
        {siteEditor ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                id="site-code"
                label="Site code"
                placeholder="MUM-HQ"
                value={siteEditor.value.code}
                onChange={(event) =>
                  setSiteEditor({
                    ...siteEditor,
                    value: {
                      ...siteEditor.value,
                      code: event.target.value.toUpperCase(),
                    },
                  })
                }
              />
              <Input
                id="site-name"
                label="Site name"
                placeholder="Mumbai headquarters"
                value={siteEditor.value.name}
                onChange={(event) =>
                  setSiteEditor({
                    ...siteEditor,
                    value: { ...siteEditor.value, name: event.target.value },
                  })
                }
              />
            </div>
            <GoogleMapPicker
              address={siteEditor.value.address}
              onAddressChange={(address) =>
                setSiteEditor({
                  ...siteEditor,
                  value: { ...siteEditor.value, address },
                })
              }
              lat={siteEditor.value.latitude}
              lng={siteEditor.value.longitude}
              onCoordinatesChange={({ lat, lng }) =>
                setSiteEditor({
                  ...siteEditor,
                  value: { ...siteEditor.value, latitude: lat, longitude: lng },
                })
              }
              radiusMeters={siteEditor.value.radiusMeters}
              onRadiusChange={(radiusMeters) =>
                setSiteEditor({
                  ...siteEditor,
                  value: { ...siteEditor.value, radiusMeters },
                })
              }
              height="h-72"
            />
            <Toggle
              checked={siteEditor.value.isActive}
              onChange={(isActive) =>
                setSiteEditor({
                  ...siteEditor,
                  value: { ...siteEditor.value, isActive },
                })
              }
              label="Active punch site"
              description="Inactive sites remain in history but are not accepted for new punches."
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setSiteEditor(null)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                isLoading={saving}
                onClick={() => void saveSite()}
              >
                Save site
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={holidayEditor.open}
        onClose={() =>
          setHolidayEditor({
            open: false,
            name: "",
            type: "FULL_DAY",
            durationMode: "SINGLE",
            startDate: "",
            endDate: "",
          })
        }
        title={holidayEditor.editingId ? "Edit Workspace Holiday" : "Add Workspace Holiday"}
      >
        <div className="space-y-4 font-sans">
          <Input
            id="holiday-name"
            label="Holiday Name *"
            placeholder="e.g. Ganesh Chaturthi, Diwali, Gandhi Jayanti"
            value={holidayEditor.name}
            onChange={(event) =>
              setHolidayEditor({ ...holidayEditor, name: event.target.value })
            }
          />

          <Select
            label="Holiday Type *"
            searchable={false}
            value={holidayEditor.type}
            options={[
              { value: "FULL_DAY", label: "Full Day Holiday", sublabel: "Complete work closure for all staff" },
              { value: "HALF_DAY", label: "Half Day Holiday", sublabel: "4 hours working duration" },
              { value: "OPTIONAL", label: "Optional / Restricted Holiday", sublabel: "Employee optional choice" },
              { value: "PUBLIC", label: "Public / Gazetted Holiday", sublabel: "Government statutory holiday" },
            ]}
            onChange={(e) =>
              setHolidayEditor({
                ...holidayEditor,
                type: e.target.value as HolidayType,
              })
            }
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Duration Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setHolidayEditor({
                    ...holidayEditor,
                    durationMode: "SINGLE",
                  })
                }
                className={`rounded-xl border p-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  holidayEditor.durationMode === "SINGLE"
                    ? "border-[#0D1F3D] bg-[#0D1F3D] text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Single Day
              </button>
              <button
                type="button"
                onClick={() =>
                  setHolidayEditor({
                    ...holidayEditor,
                    durationMode: "RANGE",
                  })
                }
                className={`rounded-xl border p-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  holidayEditor.durationMode === "RANGE"
                    ? "border-[#0D1F3D] bg-[#0D1F3D] text-white"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                Date Range (From - To)
              </button>
            </div>
          </div>

          {holidayEditor.durationMode === "RANGE" ? (
            <div className="grid grid-cols-2 gap-3">
              <DatePicker
                id="holiday-start-date"
                label="Start Date (From)"
                required
                value={holidayEditor.startDate}
                onChange={(val) =>
                  setHolidayEditor({ ...holidayEditor, startDate: val })
                }
              />
              <DatePicker
                id="holiday-end-date"
                label="End Date (To)"
                required
                value={holidayEditor.endDate}
                onChange={(val) =>
                  setHolidayEditor({ ...holidayEditor, endDate: val })
                }
              />
            </div>
          ) : (
            <DatePicker
              id="holiday-date"
              label="Holiday Date"
              required
              value={holidayEditor.startDate}
              onChange={(val) =>
                setHolidayEditor({
                  ...holidayEditor,
                  startDate: val,
                  endDate: val,
                })
              }
            />
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setHolidayEditor({
                  open: false,
                  name: "",
                  type: "FULL_DAY",
                  durationMode: "SINGLE",
                  startDate: "",
                  endDate: "",
                })
              }
              className="font-bold text-slate-600"
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              isLoading={saving}
              onClick={() => void saveHoliday()}
              className="font-bold shadow-xs"
            >
              Save Holiday
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(leaveEditor)}
        onClose={() => setLeaveEditor(null)}
        title={leaveEditor?.id ? "Edit approved leave" : "Add approved leave"}
      >
        {leaveEditor ? (
          <div className="space-y-4 font-sans">
            <Select
              label="Employee"
              value={leaveEditor.membershipId}
              placeholder="Select employee"
              options={memberships.map((membership) => ({
                value: membership.id,
                label: personName(membership),
                sublabel: membership.employeeCode || membership.user.email,
              }))}
              onChange={(event) =>
                setLeaveEditor({
                  ...leaveEditor,
                  membershipId: event.target.value,
                })
              }
            />
            <Input
              id="leave-type"
              label="Leave type"
              placeholder="Annual leave"
              value={leaveEditor.leaveType}
              onChange={(event) =>
                setLeaveEditor({
                  ...leaveEditor,
                  leaveType: event.target.value,
                })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <DatePicker
                id="leave-start"
                label="Start date"
                required
                value={leaveEditor.startDate}
                onChange={(val) =>
                  setLeaveEditor({
                    ...leaveEditor,
                    startDate: val,
                  })
                }
              />
              <DatePicker
                id="leave-end"
                label="End date"
                required
                value={leaveEditor.endDate}
                onChange={(val) =>
                  setLeaveEditor({
                    ...leaveEditor,
                    endDate: val,
                  })
                }
              />
            </div>
            <Input
              id="leave-remarks"
              label="Remarks"
              placeholder="Optional note"
              value={leaveEditor.remarks}
              onChange={(event) =>
                setLeaveEditor({ ...leaveEditor, remarks: event.target.value })
              }
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setLeaveEditor(null)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                isLoading={saving}
                onClick={() => void saveLeave()}
              >
                Save leave
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(confirmation)}
        onClose={() => setConfirmation(null)}
        title={confirmation?.title}
      >
        {confirmation ? (
          <div className="space-y-5">
            <p className="text-xs leading-relaxed text-slate-600">
              {confirmation.message}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setConfirmation(null)}>
                Cancel
              </Button>
              <Button
                variant="accent"
                isLoading={saving}
                onClick={async () => {
                  const completed = await withSaving(
                    confirmation.action,
                    confirmation.successMessage,
                  );
                  if (completed) setConfirmation(null);
                }}
              >
                Confirm removal
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
