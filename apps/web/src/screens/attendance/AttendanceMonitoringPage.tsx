import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  Search,
  Smartphone,
  UserCheck,
  UserX,
} from "lucide-react";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { InteractiveMap } from "../../components/maps/InteractiveMap";
import { Button, Modal } from "../../components/ui";
import {
  DateRange,
  DateRangePicker,
} from "../../components/ui/DateRangePicker";
import {
  AttendanceMonitoringResponse,
  AttendancePunchRecord,
  attendanceApi,
} from "./attendance.api";

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const initialDate = dateKey(new Date());
const initialRange: DateRange = {
  label: "Today",
  startDate: initialDate,
  endDate: initialDate,
};
const emptySummary: AttendanceMonitoringResponse["summary"] = {
  onFieldPunched: 0,
  officeCheckedIn: 0,
  lateArrivals: 0,
  absences: 0,
  totalPunches: 0,
  onTimePercent: 0,
  onTimeChangePercent: 0,
};

function statusLabel(record: AttendancePunchRecord): string {
  if (record.exceptionCode) return "Exception";
  if (record.status === "LATE" || record.lateMinutes > 0)
    return `Late (${record.lateMinutes} mins)`;
  return record.type === "PUNCH_IN" ? "On Time" : "Punched Out";
}

function geofenceLabel(record: AttendancePunchRecord): string {
  if (record.geofenceResult === "OUTSIDE_EXCEPTION")
    return "Outside office · exception recorded";
  if (record.locationKind === "OFFICE")
    return record.siteName
      ? `Inside ${record.siteName}`
      : "Inside office geofence";
  if (record.locationKind === "ASSIGNED_VISIT")
    return "Inside assigned visit geofence";
  if (record.locationKind === "FIELD_REMOTE")
    return "Approved remote field location";
  return "Location classification unavailable";
}

export default function AttendanceMonitoringPage() {
  const [range, setRange] = useState<DateRange>(initialRange);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState<AttendanceMonitoringResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(searchTerm.trim()),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const load = useCallback(
    async (silent = false) => {
      const id = ++requestId.current;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const response = await attendanceApi.monitoring({
          startDate: range.startDate,
          endDate: range.endDate,
          search: debouncedSearch || undefined,
          limit: 100,
        });
        if (id !== requestId.current) return;
        setData(response);
        setSelectedId((current) =>
          response.records.some((row) => row.id === current)
            ? current
            : (response.records[0]?.id ?? null),
        );
      } catch {
        if (id === requestId.current)
          setError("Unable to load attendance monitoring data.");
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [range.startDate, range.endDate, debouncedSearch],
  );

  useEffect(() => {
    void load();
    const includesToday =
      range.startDate <= initialDate && range.endDate >= initialDate;
    if (!includesToday) return;
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void load(true);
    }, 15_000);
    const onFocus = () =>
      document.visibilityState === "visible" && void load(true);
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [load, range.startDate, range.endDate]);

  const loadMore = async () => {
    if (!data?.nextCursor) return;
    setLoadingMore(true);
    try {
      const next = await attendanceApi.monitoring({
        startDate: range.startDate,
        endDate: range.endDate,
        search: debouncedSearch || undefined,
        cursor: data.nextCursor,
        limit: 100,
      });
      setData({ ...next, records: [...data.records, ...next.records] });
    } finally {
      setLoadingMore(false);
    }
  };

  const selectedPunch =
    data?.records.find((record) => record.id === selectedId) ?? null;
  const summary = data?.summary ?? emptySummary;

  const openSelfie = async (record: AttendancePunchRecord) => {
    if (!record.hasSelfie) return;
    setPhotoLoading(true);
    try {
      const preview = await attendanceApi.selfiePreview(record.id);
      setPhotoUrl(preview.url);
    } catch {
      setError("Unable to load the secure selfie preview.");
    } finally {
      setPhotoLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-[#0D1F3D]">
              Attendance & Mobile GPS Punches
            </h1>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-600">
              <Smartphone className="h-3.5 w-3.5" /> Mobile Punch Only
            </span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Real-time GPS coordinates, secure selfie evidence, and enrolled
            browser logging for field punches.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker value={range} onChange={setRange} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard
          title="On Field Punched"
          value={String(summary.onFieldPunched)}
          subValue="Remote + assigned visits"
          icon={MapPin}
          iconBgColor="bg-blue-500/10"
          iconTextColor="text-blue-600"
        />
        <KpiCard
          title="Office Checked In"
          value={String(summary.officeCheckedIn)}
          subValue="Inside office sites"
          icon={UserCheck}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Late Arrivals"
          value={String(summary.lateArrivals)}
          subValue="Beyond shift grace"
          icon={Clock}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Absences"
          value={String(summary.absences)}
          subValue="Finalized absences"
          icon={UserX}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Total Punches"
          value={String(summary.totalPunches)}
          subValue="In + Out logs"
          icon={Smartphone}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
        <KpiCard
          title="On Time %"
          value={`${summary.onTimePercent.toFixed(1)}%`}
          change={`${summary.onTimeChangePercent >= 0 ? "+" : ""}${summary.onTimeChangePercent.toFixed(1)}%`}
          changeType={
            summary.onTimeChangePercent >= 0 ? "positive" : "negative"
          }
          timeframe="vs preceding period"
          icon={CheckCircle2}
          iconBgColor="bg-teal-500/10"
          iconTextColor="text-teal-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-extrabold text-[#0D1F3D]">
              Live Mobile Punch Stream (Today)
            </h3>
            <div className="relative w-60">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                aria-label="Search attendance punches"
                type="search"
                placeholder="Search staff, code, location..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs font-semibold text-[#0D1F3D] focus:outline-none"
              />
            </div>
          </div>

          <div className="min-h-[420px] overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase">
                  <th className="px-3.5 py-3">Executive</th>
                  <th className="px-3.5 py-3">Punch Type</th>
                  <th className="px-3.5 py-3">Time</th>
                  <th className="px-3.5 py-3">GPS Location</th>
                  <th className="px-3.5 py-3">Status</th>
                  <th className="px-3.5 py-3 text-right">Photo & Map</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {!loading &&
                  data?.records.map((record) => {
                    const selected = selectedId === record.id;
                    const label = statusLabel(record);
                    return (
                      <tr
                        key={record.id}
                        onClick={() => setSelectedId(record.id)}
                        className={`cursor-pointer transition-colors ${selected ? "bg-red-50/60 font-bold" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-2">
                            {record.avatarUrl ? (
                              <img
                                src={record.avatarUrl}
                                alt=""
                                className="h-7 w-7 rounded-full object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[10px] font-bold">
                                {record.employeeName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-extrabold text-[#0D1F3D]">
                                {record.employeeName}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {record.employeeCode}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-3">
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700">
                            {record.type}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 font-extrabold text-[#E20613]">
                          {new Intl.DateTimeFormat("en-IN", {
                            timeStyle: "short",
                            timeZone: data.timezone,
                          }).format(
                            new Date(record.capturedAt ?? record.timestamp),
                          )}
                        </td>
                        <td className="px-3.5 py-3">
                          <div>
                            <p className="font-extrabold text-[#0D1F3D] text-[11px] truncate max-w-[180px]">
                              {record.locationName ??
                                record.locationKind?.replace(/_/g, " ") ??
                                "GPS location"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {record.latitude.toFixed(5)},{" "}
                              {record.longitude.toFixed(5)}
                            </p>
                          </div>
                        </td>
                        <td className="px-3.5 py-3">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-extrabold border ${label === "On Time" || label === "Punched Out" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"}`}
                          >
                            {label}
                          </span>
                        </td>
                        <td className="px-3.5 py-3 text-right">
                          <button
                            type="button"
                            disabled={!record.hasSelfie || photoLoading}
                            onClick={(event) => {
                              event.stopPropagation();
                              void openSelfie(record);
                            }}
                            title="View selfie evidence"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:text-slate-300"
                          >
                            <Camera className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            {loading && (
              <div className="flex h-72 items-center justify-center text-xs font-semibold text-slate-500">
                Loading attendance punches...
              </div>
            )}
            {!loading && error && (
              <div className="flex h-72 items-center justify-center text-xs font-semibold text-red-600">
                {error}
              </div>
            )}
            {!loading && !error && data?.records.length === 0 && (
              <div className="flex h-72 items-center justify-center text-xs font-semibold text-slate-500">
                No accepted punches in this date range.
              </div>
            )}
            {data?.nextCursor && (
              <div className="flex justify-center pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-[#E20613]" />
                  <h3 className="text-base font-extrabold text-[#0D1F3D]">
                    Punch Location Map
                  </h3>
                </div>
                <p className="text-xs text-slate-500">
                  Selected Executive:{" "}
                  {selectedPunch
                    ? `${selectedPunch.employeeName} (${selectedPunch.employeeCode})`
                    : "No punch selected"}
                </p>
              </div>
              {selectedPunch && (
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-[#0D1F3D]">
                  {new Intl.DateTimeFormat("en-IN", {
                    timeStyle: "short",
                    timeZone: data?.timezone,
                  }).format(
                    new Date(
                      selectedPunch.capturedAt ?? selectedPunch.timestamp,
                    ),
                  )}
                </span>
              )}
            </div>
            <div className="relative h-64 w-full overflow-hidden rounded-xl border border-slate-200 shadow-inner">
              {selectedPunch ? (
                <InteractiveMap
                  mode="prospects"
                  heightClassName="h-full"
                  compact
                  prospects={[
                    {
                      id: selectedPunch.id,
                      name: selectedPunch.employeeName,
                      category: selectedPunch.employeeCode,
                      address: selectedPunch.locationName ?? "GPS location",
                      status: "Visited",
                      markerColor: "green",
                      contactPerson: selectedPunch.employeeName,
                      phone: "",
                      lastVisitTime: "",
                      lat: selectedPunch.latitude,
                      lng: selectedPunch.longitude,
                      region: selectedPunch.locationName ?? "GPS location",
                    },
                  ]}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs font-semibold text-slate-500">
                  Select a punch to view its persisted GPS coordinates.
                </div>
              )}
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between text-[#0D1F3D]">
                <span className="text-slate-500">Device:</span>
                <span className="font-mono text-[11px]">
                  {selectedPunch?.device
                    ? (selectedPunch.device.label ??
                      selectedPunch.device.platform ??
                      selectedPunch.device.installationId)
                    : "Not recorded"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#0D1F3D]">
                <span className="text-slate-500">GPS Coordinates:</span>
                <span className="font-mono text-[11px] text-[#E20613]">
                  {selectedPunch
                    ? `${selectedPunch.latitude.toFixed(5)}, ${selectedPunch.longitude.toFixed(5)}`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[#0D1F3D]">
                <span className="text-slate-500">Location Status:</span>
                <span
                  className={`font-extrabold ${selectedPunch?.geofenceResult === "OUTSIDE_EXCEPTION" ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {selectedPunch ? geofenceLabel(selectedPunch) : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={Boolean(photoUrl)}
        onClose={() => setPhotoUrl(null)}
        maxWidth="max-w-sm"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-extrabold text-[#0D1F3D]">
            Selfie Photo Verification
          </h3>
          <button
            type="button"
            aria-label="Close selfie preview"
            onClick={() => setPhotoUrl(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ×
          </button>
        </div>
        {photoUrl && (
          <img
            src={photoUrl}
            alt="Punch selfie evidence"
            className="h-64 w-full rounded-xl object-cover border border-slate-200 shadow-sm"
          />
        )}
        <p className="text-xs font-extrabold text-[#0D1F3D]">
          Secure attendance selfie evidence
        </p>
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => setPhotoUrl(null)}
        >
          Close Preview
        </Button>
      </Modal>
    </div>
  );
}
