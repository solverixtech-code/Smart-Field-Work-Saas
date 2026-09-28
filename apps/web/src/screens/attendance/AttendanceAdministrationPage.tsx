import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Edit3,
  Laptop,
  MapPin,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Trash2,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
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
  const [holidayEditor, setHolidayEditor] = useState({
    open: false,
    editing: false,
    name: "",
    date: "",
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
    if (!holidayEditor.name.trim() || !holidayEditor.date) {
      toast.error("Holiday name and date are required");
      return;
    }
    const saved = await withSaving(
      () =>
        attendanceApi.admin.saveHoliday({
          name: holidayEditor.name,
          date: holidayEditor.date,
        }),
      "Holiday saved",
    );
    if (saved)
      setHolidayEditor({ open: false, editing: false, name: "", date: "" });
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

            {activeTab === "holidays" && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-extrabold text-[#0D1F3D]">
                      Holiday calendar
                    </h2>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Scheduled employees receive Holiday status when they have
                      no punch on these dates.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="accent"
                    className="gap-2 rounded-sm"
                    onClick={() =>
                      setHolidayEditor({
                        open: true,
                        editing: false,
                        name: "",
                        date: "",
                      })
                    }
                  >
                    <Plus className="h-4 w-4" /> Add holiday
                  </Button>
                </div>
                {holidays.length === 0 ? (
                  <EmptyRow message="No holidays have been configured." />
                ) : (
                  <div className="overflow-hidden rounded-sm border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[11px] text-slate-600">
                        <tr>
                          <th className="px-4 py-3">Holiday</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {holidays.map((holiday) => (
                          <tr
                            key={holiday.id}
                            className="border-t border-slate-100"
                          >
                            <td className="px-4 py-3 font-bold text-[#0D1F3D]">
                              {holiday.name}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {new Date(holiday.date).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                aria-label={`Edit ${holiday.name}`}
                                className="rounded-sm p-2 text-slate-500 hover:bg-slate-100"
                                onClick={() =>
                                  setHolidayEditor({
                                    open: true,
                                    editing: true,
                                    name: holiday.name,
                                    date: dateValue(holiday.date),
                                  })
                                }
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                aria-label={`Delete ${holiday.name}`}
                                className="rounded-sm p-2 text-rose-500 hover:bg-rose-50"
                                onClick={() =>
                                  setConfirmation({
                                    title: "Remove holiday?",
                                    message: `${holiday.name} will no longer be used when attendance is finalized for this date.`,
                                    successMessage: "Holiday removed",
                                    action: () =>
                                      attendanceApi.admin.deleteHoliday(
                                        holiday.id,
                                      ),
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
            editing: false,
            name: "",
            date: "",
          })
        }
        title={holidayEditor.editing ? "Edit holiday" : "Add holiday"}
      >
        <div className="space-y-4">
          <Input
            id="holiday-name"
            label="Holiday name"
            placeholder="Diwali"
            value={holidayEditor.name}
            onChange={(event) =>
              setHolidayEditor({ ...holidayEditor, name: event.target.value })
            }
          />
          <Input
            id="holiday-date"
            type="date"
            label="Date"
            value={holidayEditor.date}
            disabled={holidayEditor.editing}
            onChange={(event) =>
              setHolidayEditor({ ...holidayEditor, date: event.target.value })
            }
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() =>
                setHolidayEditor({
                  open: false,
                  editing: false,
                  name: "",
                  date: "",
                })
              }
            >
              Cancel
            </Button>
            <Button
              variant="accent"
              isLoading={saving}
              onClick={() => void saveHoliday()}
            >
              Save holiday
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
          <div className="space-y-4">
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
              <Input
                id="leave-start"
                type="date"
                label="Start date"
                value={leaveEditor.startDate}
                onChange={(event) =>
                  setLeaveEditor({
                    ...leaveEditor,
                    startDate: event.target.value,
                  })
                }
              />
              <Input
                id="leave-end"
                type="date"
                label="End date"
                value={leaveEditor.endDate}
                onChange={(event) =>
                  setLeaveEditor({
                    ...leaveEditor,
                    endDate: event.target.value,
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
