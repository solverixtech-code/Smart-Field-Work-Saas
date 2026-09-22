import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Eye,
  Plus,
  RotateCcw,
  Search,
  Users,
} from "lucide-react";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Checkbox } from "../../components/ui/Checkbox";
import {
  DateRangePicker,
  type DateRange,
} from "../../components/ui/DateRangePicker";
import { RowActionsMenu } from "../../components/ui/RowActionsMenu";
import { Select } from "../../components/ui/Select";
import {
  useCrm,
  useCrmQuery,
  useDebouncedSearch,
} from "../../features/crm/CrmContext";
import {
  followUpApi,
  type FollowUpRecord,
  type FollowUpView,
} from "../../features/crm/follow-up.api";
import { leadApi } from "../../features/crm/lead.api";
import { leadLabel } from "../../features/crm/lead.types";
import { FollowUpFormModal } from "./FollowUpFormModal";

const views: Array<{
  id: FollowUpView;
  label: string;
  description: string;
  path: string;
}> = [
  {
    id: "all",
    label: "All follow-ups",
    description: "Manage all follow-ups and track their status across the team.",
    path: "/admin/follow-ups",
  },
  {
    id: "today",
    label: "Today's follow-ups",
    description: "Review every follow-up scheduled for today.",
    path: "/admin/follow-ups/today",
  },
  {
    id: "upcoming",
    label: "Upcoming follow-ups",
    description: "Plan the follow-ups scheduled after today.",
    path: "/admin/follow-ups/upcoming",
  },
  {
    id: "overdue",
    label: "Overdue follow-ups",
    description: "Prioritise pending follow-ups that are past their due date.",
    path: "/admin/follow-ups/overdue",
  },
  {
    id: "completed",
    label: "Completed follow-ups",
    description: "Review follow-ups completed by you and your team.",
    path: "/admin/follow-ups/completed",
  },
];

const todayKey = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
};

const initialDateRange = (): DateRange => ({
  startDate: todayKey(),
  endDate: todayKey(),
  label: "Date range",
});

const csvCell = (value: string | null | undefined) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;

function exportVisibleFollowUps(items: FollowUpRecord[]) {
  if (items.length === 0) {
    toast.info("There are no follow-ups to export.");
    return;
  }
  const rows = [
    [
      "Lead code",
      "Lead or business",
      "Contact",
      "Purpose",
      "Assigned to",
      "Scheduled date",
      "Scheduled time",
      "Status",
      "Priority",
    ],
    ...items.map((item) => [
      item.lead.leadCode,
      item.lead.businessName || item.lead.name,
      item.lead.contactName || "",
      item.title,
      item.assignedMembership?.user.fullName || item.assignedToName,
      item.scheduledDate,
      item.scheduledTime,
      item.status,
      leadLabel(item.lead.priority),
    ]),
  ];
  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(
    new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `follow-ups-${todayKey()}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function displayDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

function displayTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;
  const date = new Date(2000, 0, 1, hours, minutes);
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function visibleStatus(item: FollowUpRecord, today: string) {
  if (item.status === "Pending" && item.scheduledDate < today) return "Overdue";
  return item.status;
}

export default function FollowUpsListPage({ view }: { view: FollowUpView }) {
  const navigate = useNavigate();
  const { can, readOnly } = useCrm();
  const canManage = can("crm.followups.manage") || can("crm.leads.update");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUpRecord>();
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [assignedMembershipId, setAssignedMembershipId] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const owners = useCrmQuery("follow-up-filter-owners", async (_, signal) =>
    can("crm.leads.assign")
      ? leadApi.owners({ limit: 100 }, signal)
      : { items: [], total: 0, page: 1, limit: 100, totalPages: 0 },
  );
  const result = useCrmQuery(
    `follow-ups:${view}:${page}:${debouncedSearch}:${dateFrom}:${dateTo}:${assignedMembershipId}`,
    (_, signal) =>
      followUpApi.list(
        {
          view,
          page,
          limit: 25,
          search: debouncedSearch || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          assignedMembershipId: assignedMembershipId || undefined,
        },
        signal,
      ),
  );
  const current = views.find((item) => item.id === view) ?? views[0];
  const items = result.data?.items ?? [];
  const summary = result.loading ? undefined : result.data?.summary;
  const allVisibleSelected =
    items.length > 0 && items.every((item) => selectedRows.includes(item.id));
  const statusOptions = useMemo(
    () => views.map((item) => ({ value: item.id, label: item.label })),
    [],
  );

  useEffect(() => {
    setSelectedRows([]);
  }, [view, page, debouncedSearch, dateFrom, dateTo, assignedMembershipId]);

  const resetFilters = () => {
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setDateRange(initialDateRange());
    setAssignedMembershipId("");
    setPage(1);
  };

  return (
    <div className="min-h-screen space-y-4 bg-slate-50/50 p-1 pb-16 text-left font-sans sm:p-2">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-[#0D1F3D]">
            {current.label} <CalendarDays className="h-6 w-6 text-red-600" />
          </h1>
          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {current.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={(range) => {
              setDateRange(range);
              setDateFrom(range.startDate);
              setDateTo(range.endDate);
              setPage(1);
            }}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportVisibleFollowUps(items)}
            className="gap-1.5 border-slate-200 bg-white font-bold text-slate-700 shadow-xs"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          {canManage && can("crm.leads.view") && !readOnly && (
            <Button
              variant="accent"
              size="sm"
              onClick={() => setAddOpen(true)}
              className="gap-1.5 font-bold shadow-xs"
            >
              <Plus className="h-4 w-4" /> Add follow-up
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard label="Total follow-ups" value={result.data?.total} icon={CalendarDays} tone="blue" detail={view === "all" ? "Matching current filters" : current.label} />
        <MetricCard label="Completed" value={summary?.completed} icon={CheckCircle2} tone="emerald" detail="Across accessible leads" />
        <MetricCard label="Pending" value={summary?.pending} icon={CalendarDays} tone="amber" detail="Awaiting action" />
        <MetricCard label="Overdue" value={summary?.overdue} icon={AlertTriangle} tone="red" detail="Past scheduled date" onClick={() => navigate("/admin/follow-ups/overdue")} />
        <MetricCard label="Today's follow-ups" value={summary?.today} icon={Users} tone="purple" detail="View today's list" onClick={() => navigate("/admin/follow-ups/today")} />
      </div>

      <div className="space-y-3 rounded-sm border border-slate-200/90 bg-white p-3 shadow-xs">
        <div className="grid grid-cols-1 items-end gap-2.5 sm:grid-cols-2 lg:grid-cols-12">
          <div className="relative lg:col-span-5">
            <label htmlFor="follow-up-search" className="sr-only">Search follow-ups</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              id="follow-up-search"
              type="search"
              placeholder="Search by lead, business, contact or purpose..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs font-semibold text-slate-800 placeholder:font-medium placeholder:text-slate-400 focus:border-[#0D1F3D] focus:outline-none focus:ring-1 focus:ring-[#0D1F3D]"
            />
          </div>
          <div className="lg:col-span-3">
            <Select
              value={view}
              searchable={false}
              options={statusOptions}
              onChange={(event) => {
                const target = views.find((item) => item.id === event.target.value);
                if (target) navigate(target.path);
              }}
            />
          </div>
          {can("crm.leads.assign") && (
            <div className="lg:col-span-3">
              <Select
                value={assignedMembershipId}
                placeholder="Assigned: Everyone"
                searchable
                options={owners.data?.items.map((owner) => ({
                  value: owner.id,
                  label: owner.displayName,
                  avatar: owner.avatarUrl ?? undefined,
                  sublabel: owner.role ?? undefined,
                }))}
                onChange={(event) => {
                  setAssignedMembershipId(event.target.value);
                  setPage(1);
                }}
              />
            </div>
          )}
          <div className="flex justify-end lg:col-span-1">
            <Button type="button" variant="ghost" size="sm" onClick={resetFilters} aria-label="Reset filters" title="Reset filters" className="text-slate-500">
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-sm border border-slate-200/90 bg-white shadow-xs">
        {result.error && (
          <div role="alert" className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            <p>{result.error.message}</p>
            <Button type="button" variant="outline" size="sm" onClick={result.reload} className="mt-3">Reload</Button>
          </div>
        )}
        {result.loading && <p role="status" className="py-16 text-center text-sm font-medium text-slate-500">Loading follow-ups...</p>}
        {!result.loading && !result.error && items.length === 0 && (
          <div className="px-6 py-16 text-center">
            <CalendarDays className="mx-auto h-9 w-9 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-[#0D1F3D]">No follow-ups found</p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {search || dateFrom || dateTo || assignedMembershipId
                ? "Try clearing or changing the current filters."
                : `There are no ${view === "all" ? "" : `${view} `}follow-ups to show.`}
            </p>
          </div>
        )}
        {!result.loading && !result.error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
                  <th scope="col" className="w-10 p-3 text-center">
                    <Checkbox aria-label="Select all visible follow-ups" checked={allVisibleSelected} onChange={(checked) => setSelectedRows(checked ? items.map((item) => item.id) : [])} />
                  </th>
                  <th scope="col" className="p-3 whitespace-nowrap">Follow-up</th>
                  <th scope="col" className="p-3">Lead / business</th>
                  <th scope="col" className="p-3 whitespace-nowrap">Contact person</th>
                  <th scope="col" className="p-3 whitespace-nowrap">Assigned to</th>
                  <th scope="col" className="p-3 whitespace-nowrap">Date &amp; time</th>
                  <th scope="col" className="p-3 text-center whitespace-nowrap">Status</th>
                  <th scope="col" className="p-3 text-center whitespace-nowrap">Priority</th>
                  <th scope="col" className="w-16 p-3 text-center whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const status = visibleStatus(item, result.data?.today ?? todayKey());
                  const assigneeName = item.assignedMembership?.user.fullName || item.assignedToName || "Unassigned";
                  return (
                    <tr key={item.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="p-3 text-center">
                        <Checkbox
                          aria-label={`Select ${item.title}`}
                          checked={selectedRows.includes(item.id)}
                          onChange={(checked) => setSelectedRows((currentRows) => checked ? [...new Set([...currentRows, item.id])] : currentRows.filter((id) => id !== item.id))}
                        />
                      </td>
                      <td className="p-3">
                        <Link to={`/admin/follow-ups/${item.id}`} className="block max-w-56 font-extrabold text-[#0D1F3D] hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
                          {item.title}
                        </Link>
                        <span className="mt-0.5 block text-[10px] font-medium text-slate-500">{item.lead.leadCode}</span>
                      </td>
                      <td className="p-3">
                        <Link to={`/admin/leads/${item.leadId}`} className="font-extrabold text-[#0D1F3D] hover:underline">
                          {item.lead.businessName || item.lead.name}
                        </Link>
                        <span className="block max-w-56 truncate text-[10px] font-medium text-slate-500">
                          {[item.lead.addressLine1, item.lead.city].filter(Boolean).join(", ") || "Address not available"}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="block font-extrabold text-[#0D1F3D]">{item.lead.contactName || "Not available"}</span>
                        <span className="block text-[10px] font-mono text-slate-500">{item.lead.phone || "Phone not available"}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {item.assignedMembershipId ? (
                          <Link to={`/admin/employees/${item.assignedMembershipId}`} aria-label={`View ${assigneeName}'s profile`} className="group flex items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D1F3D]">
                            <Avatar name={assigneeName} src={item.assignedMembership?.user.avatarUrl} sizeClassName="h-7 w-7" className="group-hover:ring-2 group-hover:ring-purple-600" />
                            <div>
                              <span className="block font-bold leading-tight text-[#0D1F3D] group-hover:text-purple-600 group-hover:underline">{assigneeName}</span>
                              <span className="block text-[9px] font-medium text-slate-500">{item.assignedMembership?.team?.name || "Field executive"}</span>
                            </div>
                          </Link>
                        ) : <span className="text-slate-500">Unassigned</span>}
                      </td>
                      <td className="p-3 whitespace-nowrap text-slate-600">
                        <span className="block font-bold text-slate-800">{displayDate(item.scheduledDate)}</span>
                        <span className="block text-[10px] font-mono text-slate-500">{displayTime(item.scheduledTime)}</span>
                      </td>
                      <td className="p-3 text-center whitespace-nowrap"><StatusBadge status={status} /></td>
                      <td className="p-3 text-center whitespace-nowrap"><PriorityBadge priority={leadLabel(item.lead.priority)} /></td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <RowActionsMenu items={[
                          { label: "View details", icon: Eye, onClick: () => navigate(`/admin/follow-ups/${item.id}`) },
                          ...(canManage && !readOnly ? [{ label: "Edit follow-up", icon: Edit, onClick: () => setEditingFollowUp(item) }] : []),
                        ]} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!result.loading && !result.error && result.data && result.data.total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs font-semibold text-slate-600">
            <span>
              Showing {(page - 1) * result.data.limit + 1} to {Math.min(page * result.data.limit, result.data.total)} of {result.data.total} follow-ups
              {selectedRows.length > 0 ? ` · ${selectedRows.length} selected` : ""}
            </span>
            <div className="flex items-center gap-1">
              <button type="button" disabled={page <= 1} onClick={() => setPage((currentPage) => currentPage - 1)} aria-label="Previous page" className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500 disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="flex h-7 min-w-7 items-center justify-center rounded-sm bg-[#0D1F3D] px-2 font-bold text-white">{page}</span>
              <button type="button" disabled={page >= result.data.totalPages} onClick={() => setPage((currentPage) => currentPage + 1)} aria-label="Next page" className="flex h-7 w-7 items-center justify-center rounded-sm border border-slate-200 bg-white text-slate-500 disabled:cursor-not-allowed disabled:opacity-40">
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <FollowUpFormModal isOpen={addOpen} onClose={() => setAddOpen(false)} onSuccess={result.reload} />
      <FollowUpFormModal isOpen={Boolean(editingFollowUp)} onClose={() => setEditingFollowUp(undefined)} onSuccess={result.reload} followUp={editingFollowUp} />
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: number | undefined;
  icon: typeof CalendarDays;
  tone: "blue" | "emerald" | "amber" | "red" | "purple";
  detail: string;
  onClick?: () => void;
}

function MetricCard({ label, value, icon: Icon, tone, detail, onClick }: MetricCardProps) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600",
  };
  const content = <><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm ${tones[tone]}`}><Icon className="h-5 w-5" /></span><span><span className="block text-xs font-semibold text-slate-500">{label}</span><span className="block text-xl font-extrabold text-[#0D1F3D]">{value ?? "—"}</span><span className="block text-[10px] font-medium text-slate-500">{detail}</span></span></>;
  return onClick ? (
    <button type="button" onClick={onClick} className="flex items-center gap-3 rounded-sm border border-slate-200/80 bg-white p-3.5 text-left shadow-xs transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0D1F3D]">{content}</button>
  ) : <div className="flex items-center gap-3 rounded-sm border border-slate-200/80 bg-white p-3.5 shadow-xs">{content}</div>;
}

function StatusBadge({ status }: { status: string }) {
  const style = status === "Completed" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : status === "Overdue" ? "border-red-200 bg-red-50 text-red-700" : status === "Cancelled" ? "border-slate-200 bg-slate-100 text-slate-700" : "border-amber-200 bg-amber-50 text-amber-700";
  return <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${style}`}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  const style = priority === "Urgent" || priority === "High" ? "border-red-200 bg-red-50 text-red-700" : priority === "Medium" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-slate-200 bg-slate-100 text-slate-700";
  return <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${style}`}>{priority}</span>;
}
