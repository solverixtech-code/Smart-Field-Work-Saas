import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Target,
  UserPlus,
  Search,
  Download,
  Upload,
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Eye,
  Edit,
  UserCheck,
} from "lucide-react";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Card } from "../../components/ui/Card";
import { DataTable, ColumnDef } from "../../components/ui/DataTable";
import { RowActionsMenu } from "../../components/ui/RowActionsMenu";
import {
  useCrm,
  useCrmMutation,
  useCrmQuery,
  useDebouncedSearch,
} from "../../features/crm/CrmContext";
import { CrmFailure, CrmLookup } from "../../features/crm/CrmControls";
import { useAppSelector } from "../../store";
import {
  LeadDto,
  LeadPriority,
  LeadStatus,
  LeadQuery,
  leadLabel,
  leadStatuses,
  leadPriorities,
} from "../../features/crm/lead.types";
type Category =
  | "all"
  | "unassigned"
  | "hot"
  | "follow-up"
  | "converted"
  | "lost"
  | "not-interested"
  | "duplicates";
export default function AllLeadsPage({
  viewMode = "all",
}: {
  viewMode?: Category;
}) {
  const navigate = useNavigate(),
    location = useLocation();
  const { can, readOnly } = useCrm();
  const roleCode = useAppSelector((state) => state.authorization.tenant?.roleCode);
  const isFieldExecutive = ['field_executive', 'sales_executive', 'executive'].includes(roleCode?.toLowerCase() ?? '');
  const mutation = useCrmMutation();
  const [search, setSearch] = useState(""),
    [priority, setPriority] = useState(""),
    [status, setStatus] = useState(""),
    [source, setSource] = useState(""),
    [selectedIds, setSelectedIds] = useState<string[]>([]),
    [page, setPage] = useState(1);
  const query = useDebouncedSearch(search);
  useEffect(() => setPage(1), [location.pathname]);
  const filters: LeadQuery = {
    search: query,
    priority: priority ? (priority as LeadPriority) : undefined,
    status: status ? (status as LeadStatus) : undefined,
    sourceValueId: source || undefined,
  };
  const category: LeadQuery =
    viewMode === "unassigned"
      ? { unassigned: "true" }
      : viewMode === "hot"
        ? { hot: "true" }
        : viewMode === "follow-up"
          ? { followUp: "pending" }
        : viewMode === "converted"
          ? { status: "CONVERTED" }
          : viewMode === "lost"
            ? { status: "DISQUALIFIED", disqualificationReason: "LOST" }
          : viewMode === "not-interested"
            ? { status: "DISQUALIFIED", disqualificationReason: "NOT_INTERESTED" }
            : viewMode === "duplicates"
              ? { status: "DUPLICATE" }
              : {};
  const result = useCrmQuery(
    JSON.stringify(["leads", viewMode, filters, page]),
    (service, signal) =>
      service.leads.list({ ...filters, ...category, page, limit: 25 }, signal),
  );
  const counts = useCrmQuery(
    JSON.stringify(["lead-workspace-counts", viewMode, filters]),
    (service, signal) =>
      service.leads.summary({ ...filters, ...category }, signal),
  );
  const updateStatus = async (
    lead: LeadDto,
    status: Exclude<LeadStatus, "CONVERTED">,
    disqualificationReason?: "LOST" | "NOT_INTERESTED" | null,
  ) => {
    const saved = await mutation.run((service, signal) =>
      service.leads.update(
        lead.id,
        { expectedRevision: lead.revision, status, disqualificationReason },
        signal,
      ),
    );
    if (saved) {
      result.reload();
      counts.reload();
    }
  };
  const metric = (n?: number) => (n === undefined ? "—" : n.toLocaleString());
  const byStatus = (s: LeadStatus) =>
    counts.data
      ? (counts.data.lifecycle.find((r) => r.status === s)?.count ?? 0)
      : undefined;
  const hot = counts.data
    ? counts.data.priorities
        .filter((r) => r.priority === "HIGH" || r.priority === "URGENT")
        .reduce((n, r) => n + r.count, 0)
    : undefined;
  const tabs = [
    { id: "all", label: isFieldExecutive ? "My Leads" : "All Leads", count: counts.data?.total, icon: Target },
    { id: "hot", label: "Hot Leads", count: hot, icon: Flame },
    { id: "follow-up", label: "Follow-ups", icon: Clock },
    ...(!isFieldExecutive ? [{
      id: "unassigned",
      label: "Unassigned",
      count: counts.data?.unassigned,
      icon: UserPlus,
    }] : []),
    {
      id: "converted",
      label: "Converted",
      count: byStatus("CONVERTED"),
      icon: CheckCircle2,
    },
    { id: "lost", label: "Lost Leads", count: byStatus("DISQUALIFIED"), icon: XCircle },
    {
      id: "not-interested",
      label: "Disqualified",
      count: byStatus("DISQUALIFIED"),
      icon: AlertCircle,
    },
    {
      id: "duplicates",
      label: "Duplicates",
      count: byStatus("DUPLICATE"),
      icon: Copy,
    },
  ];
  const columns: ColumnDef<LeadDto>[] = [
    {
      header: "Lead / Company",
      cell: (l) => (
        <div>
          <button
            onClick={() => navigate("/admin/leads/" + l.id)}
            className="font-extrabold text-[#0D1F3D] hover:text-[#E20613] hover:underline block text-left"
          >
            {l.name}
          </button>
          <span className="text-[10px] font-mono text-slate-400">
            {l.leadCode} • {l.source || "Direct Field Lead"}
          </span>
        </div>
      ),
    },
    {
      header: "Contact Person",
      cell: (l) => (
        <div>
          <p className="font-bold text-slate-900">
            {l.contactName || "Not specified"}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            {l.phone || l.email || "Contact details not set"}
          </p>
        </div>
      ),
    },
    {
      header: "Stage & Priority",
      cell: (l) => (
        <div className="flex items-center gap-1.5">
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold border ${
              l.status === "CONVERTED"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : l.status === "QUALIFIED"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : l.status === "DISQUALIFIED"
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            {leadLabel(l.status)}
          </span>
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white ${
              l.priority === "URGENT" || l.priority === "HIGH"
                ? "bg-[#E20613]"
                : l.priority === "MEDIUM"
                  ? "bg-amber-500"
                  : "bg-slate-700"
            }`}
          >
            {leadLabel(l.priority)}
          </span>
        </div>
      ),
    },
    {
      header: "Estimated Value (₹)",
      cell: (l) =>
        l.estimatedValue == null ? (
          <span className="text-xs text-slate-400 font-medium">Not set</span>
        ) : (
          <div>
            <p className="font-extrabold text-[#0D1F3D]">
              ₹{l.estimatedValue.toLocaleString("en-IN")}
            </p>
            <span className="text-[10px] text-slate-400 font-medium">
              Priority: {leadLabel(l.priority)}
            </span>
          </div>
        ),
    },
    {
      header: "Assigned Executive",
      cell: (l) => (
        <div className="flex items-center gap-2">
          {l.assignee?.displayName ? (
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
              alt={l.assignee.displayName}
              className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-[#0D1F3D] text-white font-bold text-[10px] flex items-center justify-center shrink-0 border border-slate-200">
              {(l.assignee?.displayName || l.owner.displayName)
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-bold text-slate-900 text-xs">
              {l.assignee?.displayName || "Unassigned"}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              Owner: {l.owner.displayName}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Region & Territory",
      cell: (l) => (
        <div>
          <p className="font-bold text-slate-800">
            {[l.city, l.state].filter(Boolean).join(", ") || "City not set"}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            {l.countryCode || "IN"} Territory
          </p>
        </div>
      ),
    },
    {
      header: "Next Follow-up",
      cell: (l) =>
        l.nextFollowUpAt ? (
          <div>
            <p className="font-bold text-slate-900 text-xs">
              {new Date(l.nextFollowUpAt).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              {l.nextActionNote || "Scheduled follow-up"}
            </p>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">
            Not scheduled
          </span>
        ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (l) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => navigate("/admin/leads/" + l.id)}
            title="View Lead Details"
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D] transition-colors border border-slate-200 shadow-xs cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>
          <RowActionsMenu
            items={[
              {
                label: "View Details",
                icon: Eye,
                onClick: () => navigate("/admin/leads/" + l.id),
              },
              {
                label: "Activity Timeline",
                icon: Clock,
                onClick: () => navigate("/admin/leads/" + l.id + "/timeline"),
              },
              ...(can("crm.leads.update") &&
              !readOnly &&
              ["OPEN", "QUALIFIED"].includes(l.status)
                ? [
                    {
                      label: "Edit Lead Info",
                      icon: Edit,
                      onClick: () => navigate("/admin/leads/" + l.id + "/edit"),
                    },
                  ]
                : []),
              ...(can("crm.leads.assign") &&
              !readOnly &&
              ["OPEN", "QUALIFIED"].includes(l.status)
                ? [
                    {
                      label: "Assign Lead",
                      icon: UserCheck,
                      onClick: () =>
                        navigate("/admin/leads/" + l.id + "/assignment"),
                    },
                  ]
                : []),
              ...(can("crm.leads.update") &&
              !readOnly &&
              l.status === "OPEN"
                ? [
                    {
                      label: "Mark Qualified",
                      icon: CheckCircle2,
                      onClick: () => updateStatus(l, "QUALIFIED"),
                    },
                  ]
                : []),
              ...(can("crm.leads.convert") &&
              !readOnly &&
              l.status === "QUALIFIED"
                ? [
                    {
                      label: "Convert Lead",
                      icon: CheckCircle2,
                      onClick: () => navigate("/admin/leads/" + l.id),
                    },
                  ]
                : []),
              ...(can("crm.leads.update") &&
              !readOnly &&
              ["OPEN", "QUALIFIED"].includes(l.status)
                ? [
                    {
                      label: "Disqualify",
                      icon: XCircle,
                      onClick: () => updateStatus(l, "DISQUALIFIED", "LOST"),
                    },
                    {
                      label: "Mark Duplicate",
                      icon: Copy,
                      onClick: () => updateStatus(l, "DUPLICATE"),
                    },
                  ]
                : []),
            ]}
          />
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-3 font-sans pb-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">{isFieldExecutive ? 'My Leads' : 'All Leads'}</h1>
          <p className="text-xs text-slate-500">
            {isFieldExecutive ? 'Leads assigned to you in this workspace.' : 'Manage and track incoming leads within your access.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {!isFieldExecutive && <Button
            variant="outline"
            size="sm"
            disabled={readOnly || !can("crm.leads.import")}
            onClick={() => navigate("/admin/leads/import")}
          >
            <Upload className="mr-1.5 h-4 w-4 text-blue-600" />
            Import Leads
          </Button>}
          {!isFieldExecutive && <Button
            variant="outline"
            size="sm"
            disabled={readOnly || !can("crm.leads.export")}
            onClick={() => navigate("/admin/leads/export")}
          >
            <Download className="mr-1.5 h-4 w-4 text-emerald-600" />
            Export Data
          </Button>}
          {!isFieldExecutive && <Button
            variant="outline"
            size="sm"
            disabled={readOnly || !can("crm.leads.assign")}
            onClick={() => navigate("/admin/leads/bulk-assign")}
          >
            <UserCheck className="mr-1.5 h-4 w-4" />
            Bulk Assign
          </Button>}
          <Button
            variant="accent"
            size="sm"
            disabled={readOnly || !can("crm.leads.create")}
            onClick={() => navigate("/admin/leads/create")}
          >
            <UserPlus className="mr-1.5 h-4 w-4" />
            Add New Lead
          </Button>
        </div>
      </header>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:grid-cols-3">
        <KpiCard
          title="Total Leads"
          value={metric(result.data?.total ?? counts.data?.total)}
          subValue={
            viewMode !== "all" || query || priority || status || source
              ? "Filtered leads count"
              : "Within your access"
          }
          icon={Target}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Hot High Priority"
          value={metric(hot)}
          subValue="High and urgent priority"
          icon={Flame}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="Pending Follow-ups"
          value={metric(counts.data?.pendingFollowUps)}
          subValue="Due follow-ups"
          icon={Clock}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        {!isFieldExecutive && <KpiCard
          title="Unassigned Leads"
          value={metric(counts.data?.unassigned)}
          subValue="Needs executive"
          icon={AlertCircle}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />}
        <KpiCard
          title="Converted"
          value={metric(byStatus("CONVERTED"))}
          subValue="Account / contact conversion"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
      </div>
      <nav
        aria-label="Lead categories"
        className="flex overflow-x-auto gap-1 border-b border-slate-200 bg-white p-1.5 rounded-lg shadow-xs scrollbar-none"
      >
        {tabs.map((tab) => {
          const isActive = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                navigate("/admin/leads" + (tab.id === "all" ? "" : "/" + tab.id))
              }
              className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#0D1F3D] text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-[#0D1F3D]"
              }`}
            >
              <tab.icon className={`h-3.5 w-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 xl:grid-cols-6 rounded-lg border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="min-w-0 sm:col-span-2">
          <Input
            id="lead-search"
            aria-label="Search leads"
            placeholder="Search company, contact, lead ID, phone..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            maxLength={200}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {!isFieldExecutive && <Select
          id="lead-region"
          placeholder="All Regions"
          options={[
            { value: "all", label: "All Regions" },
            { value: "mumbai_north", label: "North Mumbai" },
            { value: "mumbai_west", label: "Western Suburbs" },
            { value: "mumbai_east", label: "Eastern Suburbs" },
            { value: "thane", label: "Thane & Navi Mumbai" },
            { value: "pune", label: "Pune" },
          ]}
        />}
        <Select
          id="lead-priority"
          placeholder="All Priorities"
          options={leadPriorities}
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
        />
        <Select
          id="lead-status"
          placeholder="All Lifecycle States"
          disabled={Boolean(category.status)}
          options={leadStatuses}
          value={category.status || status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        />
        {can("system.masters.view") && (
          <CrmLookup
            compact
            showLabel={false}
            id="lead-source"
            label="Source"
            kind="lead_source"
            value={source}
            placeholder="All Sources"
            onChange={(id) => {
              setSource(id);
              setPage(1);
            }}
          />
        )}
      </div>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#0D1F3D] bg-[#0D1F3D] px-4 py-2.5 text-white shadow-md animate-fadeIn">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-mono">
              {selectedIds.length}
            </span>
            <span>Leads Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="text-white/80 hover:text-white hover:bg-white/10 text-xs font-semibold"
            >
              Deselect All
            </Button>
            {can("crm.leads.assign") && !readOnly && (
              <Button
                size="sm"
                onClick={() => navigate("/admin/leads/bulk-assign")}
                className="bg-white text-[#0D1F3D] hover:bg-slate-100 text-xs font-bold shadow-xs"
              >
                <UserCheck className="mr-1.5 h-3.5 w-3.5" />
                Bulk Assign ({selectedIds.length})
              </Button>
            )}
            {can("crm.leads.export") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/leads/export")}
                className="border-white/30 text-white hover:bg-white/10 text-xs font-bold"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export Selected
              </Button>
            )}
          </div>
        </div>
      )}
      {result.error ? (
        <CrmFailure error={result.error} retry={result.reload} />
      ) : (
        <DataTable
          columns={columns}
          data={result.data?.items ?? []}
          keyExtractor={(l) => l.id}
          selectable={!isFieldExecutive}
          selectedIds={selectedIds}
          onSelectAll={(e) =>
            setSelectedIds(
              e.target.checked ? (result.data?.items ?? []).map((l) => l.id) : []
            )
          }
          onSelectOne={(id) =>
            setSelectedIds((prev) =>
              prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            )
          }
          isLoading={result.loading}
          density="relaxed"
          emptyMessage={
            query || priority || status || source || viewMode !== "all"
              ? "No leads match these filters."
              : "No leads yet."
          }
          pagination={{
            currentPage: result.data?.page ?? page,
            totalPages: result.data?.totalPages ?? 1,
            totalEntries: result.data?.total ?? 0,
            pageSize: result.data?.limit ?? 25,
            onPageChange: setPage,
          }}
        />
      )}
      <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
        <Card variant="panel">
          <h2 className="text-sm font-bold text-[#0D1F3D]">
            Leads by Lifecycle
          </h2>
          <div className="space-y-3 pt-4">
            {leadStatuses.map((s) => (
              <div key={s.value} className="flex justify-between text-xs">
                <span>{s.label}</span>
                <strong>{metric(byStatus(s.value))}</strong>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="panel">
          <h2 className="text-sm font-bold text-[#0D1F3D]">Top Lead Sources</h2>
          <div className="space-y-3 pt-4">
            {counts.data?.sources.map((s) => (
              <div key={s.id ?? "none"}>
                <div className="flex justify-between text-xs">
                  <span>{s.name}</span>
                  <strong>{s.count}</strong>
                </div>
                <progress
                  className="h-2 w-full"
                  value={s.count}
                  max={Math.max(counts.data?.total ?? 0, 1)}
                  aria-label={s.name}
                />
              </div>
            ))}
            {!counts.data?.sources.length && (
              <p className="text-xs text-slate-500">
                {counts.loading
                  ? "Loading analytics..."
                  : counts.error
                    ? "Analytics unavailable"
                    : "No source data yet."}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
