import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../../components/ui/Input";
import {
  useCrm,
  useCrmQuery,
  useDebouncedSearch,
} from "../../features/crm/CrmContext";
import {
  CrmFailure,
  CrmLookup,
  statuses,
  statusLabel,
} from "../../features/crm/CrmControls";
import type { AccountDto, CrmStatus } from "../../features/crm/crm.types";
import {
  Building2,
  Plus,
  Search,
  Download,
  Upload,
  Eye,
  Edit,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  UserPlus,
  ChevronRight,
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { KpiCard } from "../../components/dashboard/KpiCard";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { DataTable, ColumnDef } from "../../components/ui/DataTable";
import { RowActionsMenu } from "../../components/ui/RowActionsMenu";

export default function AllBusinessesPage() {
  const navigate = useNavigate();
  const { can, readOnly } = useCrm();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const search = useDebouncedSearch(searchTerm);
  const city = useDebouncedSearch(cityFilter);
  const result = useCrmQuery(
    JSON.stringify([
      "accounts",
      search,
      city,
      typeFilter,
      sourceFilter,
      statusFilter,
      currentPage,
    ]),
    (service, signal) =>
      service.accounts(
        {
          page: currentPage,
          limit: 25,
          search,
          city: city || undefined,
          businessTypeValueId: typeFilter || undefined,
          sourceValueId: sourceFilter || undefined,
          status: statusFilter ? (statusFilter as CrmStatus) : undefined,
        },
        signal,
      ),
  );
  // Existing bounded list endpoints expose scoped totals; never count a page as the workspace.
  const counts = useCrmQuery(
    "account-status-counts",
    async (service, signal) => {
      const [active, inactive, blocked] = await Promise.all(
        (["ACTIVE", "INACTIVE", "BLOCKED"] as const).map((status) =>
          service
            .accounts({ page: 1, limit: 1, status }, signal)
            .then((page) => page.total),
        ),
      );
      return { active, inactive, blocked, total: active + inactive + blocked };
    },
  );
  const statusDistributionData = counts.data
    ? [
        { name: "Active", value: counts.data.active, color: "#10B981" },
        { name: "Inactive", value: counts.data.inactive, color: "#F59E0B" },
        { name: "Blocked", value: counts.data.blocked, color: "#E20613" },
      ]
    : [];
  const metric = (value?: number) =>
    value === undefined ? "—" : value.toLocaleString();
  const metricHint = counts.loading
    ? "Loading..."
    : counts.error
      ? "—"
      : "Within your access";
  const canCreate = can("crm.businesses.create") && !readOnly;
  const columns: ColumnDef<AccountDto>[] = [
    {
      header: "Business Details",
      cell: (b) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-blue-700 font-bold text-xs shrink-0">
            {b.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/businesses/" + b.id)}
              className="font-bold text-[#0D1F3D]"
            >
              {b.name}
            </Button>
            <p className="text-xs text-slate-500 whitespace-nowrap">
              {[b.city, b.state].filter(Boolean).join(", ") ||
                "Location not set"}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Business Type",
      cell: (b) => (
        <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 border border-blue-100">
          {b.businessType || "Not set"}
        </span>
      ),
    },
    {
      header: "Contact Person",
      cell: (b) =>
        can("crm.contacts.view") ? (
          <div>
            <p className="font-bold text-[#0D1F3D]">
              {b.primaryContact?.name || "Not set"}
            </p>
            <p className="text-xs text-slate-500">{b.primaryContact?.role}</p>
          </div>
        ) : (
          "Unavailable"
        ),
    },
    {
      header: "Contact Info",
      cell: (b) =>
        can("crm.contacts.view") ? (
          <div>
            <p className="font-semibold text-slate-800">
              {b.primaryContact?.phone || "Not set"}
            </p>
            <p className="text-xs text-slate-500">{b.primaryContact?.email}</p>
          </div>
        ) : (
          "Unavailable"
        ),
    },
    { header: "Source", cell: (b) => b.source || "Not set" },
    {
      header: "Owner",
      cell: (b) => (
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
            <UserPlus className="h-3.5 w-3.5" />
          </div>
          <p className="font-semibold text-[#0D1F3D]">{b.owner.displayName}</p>
        </div>
      ),
    },
    {
      header: "Status",
      align: "center",
      cell: (b) => (
        <span
          className={
            "inline-block rounded-md px-2 py-0.5 text-xs font-bold border " +
            (b.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : b.status === "INACTIVE"
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-red-50 text-red-600 border-red-200")
          }
        >
          {statusLabel(b.status)}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (b) => (
        <RowActionsMenu
          items={[
            {
              label: "View Details",
              icon: Eye,
              onClick: () => navigate("/admin/businesses/" + b.id),
            },
            ...(can("crm.businesses.update") && !readOnly
              ? [
                  {
                    label: "Edit Business",
                    icon: Edit,
                    onClick: () =>
                      navigate("/admin/businesses/" + b.id + "/edit"),
                  },
                ]
              : []),
            ...(can("crm.contacts.view")
              ? [
                  {
                    label: "Contacts",
                    icon: UserPlus,
                    onClick: () =>
                      navigate("/admin/businesses/" + b.id + "/contacts"),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];
  return (
    <div className="space-y-3 font-sans pb-10">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">All Businesses</h1>
          <p className="text-xs font-normal text-slate-500">
            {result.data
              ? result.data.total.toLocaleString() +
                " businesses match your filters."
              : "Manage business accounts in your workspace."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            disabled
            title="Export is not available in this phase"
            className="flex items-center gap-1.5 font-bold border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export
          </Button>
          <Button
            variant="accent"
            size="sm"
            disabled={!canCreate}
            onClick={() => navigate("/admin/businesses/create")}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-lg"
          >
            <Plus className="h-4 w-4" /> Add Business
          </Button>
        </div>
      </div>

      {/* 5 Top Metric KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 sm:grid-cols-3">
        <KpiCard
          title="Total Businesses"
          value={metric(counts.data?.total)}
          subValue={metricHint}
          icon={Building2}
          iconBgColor="bg-[#0D1F3D]/10"
          iconTextColor="text-[#0D1F3D]"
        />
        <KpiCard
          title="Active Businesses"
          value={metric(counts.data?.active)}
          subValue={metricHint}
          icon={CheckCircle2}
          iconBgColor="bg-emerald-500/10"
          iconTextColor="text-emerald-600"
        />
        <KpiCard
          title="Inactive Businesses"
          value={metric(counts.data?.inactive)}
          subValue={metricHint}
          icon={AlertCircle}
          iconBgColor="bg-amber-500/10"
          iconTextColor="text-amber-600"
        />
        <KpiCard
          title="Blocked Businesses"
          value={metric(counts.data?.blocked)}
          subValue={metricHint}
          icon={XCircle}
          iconBgColor="bg-red-500/10"
          iconTextColor="text-[#E20613]"
        />
        <KpiCard
          title="New This Month"
          value="Unavailable"
          subValue="Monthly analytics unavailable"
          icon={RefreshCw}
          iconBgColor="bg-purple-500/10"
          iconTextColor="text-purple-600"
        />
      </div>

      {/* Toolbar & Filters */}
      <div className="rounded-lg border border-slate-200/80 bg-white p-3.5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 text-xs font-semibold items-end">
          <div className="xl:col-span-2">
            <Input
              id="business-search"
              aria-label="Search businesses"
              placeholder="Search business, city, contact name or phone..."
              leftIcon={<Search className="h-4 w-4" />}
              maxLength={200}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          {can("system.masters.view") ? (
            <CrmLookup
              id="business-filter-type"
              label="Business type"
              showLabel={false}
              placeholder="All business types"
              kind="business_type"
              value={typeFilter}
              onChange={(id) => {
                setTypeFilter(id);
                setCurrentPage(1);
              }}
            />
          ) : (
            <Select
              disabled
              placeholder="Unavailable"
              options={[]}
            />
          )}
          <Input
            id="business-filter-city"
            aria-label="City (exact match)"
            placeholder="City (exact match)"
            maxLength={100}
            value={cityFilter}
            onChange={(e) => {
              setCityFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          {can("system.masters.view") ? (
            <CrmLookup
              id="business-filter-source"
              label="Source"
              showLabel={false}
              placeholder="All sources"
              kind="lead_source"
              value={sourceFilter}
              onChange={(id) => {
                setSourceFilter(id);
                setCurrentPage(1);
              }}
            />
          ) : (
            <Select
              disabled
              placeholder="Unavailable"
              options={[]}
            />
          )}
          <Select
            id="business-filter-status"
            placeholder="All Statuses"
            value={statusFilter}
            options={statuses}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("");
                setCityFilter("");
                setSourceFilter("");
                setStatusFilter("");
                setCurrentPage(1);
              }}
              className="w-full text-slate-600 border-slate-200 hover:bg-slate-50 text-xs font-bold rounded-lg h-10"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Full Width DataTable Container */}
      <div className="space-y-3">
        {result.error ? (
          <CrmFailure error={result.error} retry={result.reload} />
        ) : (
          <DataTable
            columns={columns}
            data={result.data?.items ?? []}
            keyExtractor={(b) => b.id}
            isLoading={result.loading}
            density="relaxed"
            emptyMessage={
              searchTerm ||
              typeFilter ||
              cityFilter ||
              sourceFilter ||
              statusFilter
                ? "No businesses match these filters."
                : "No businesses yet."
            }
            pagination={{
              currentPage: result.data?.page ?? currentPage,
              totalPages: result.data?.totalPages ?? 1,
              totalEntries: result.data?.total ?? 0,
              pageSize: result.data?.limit ?? 25,
              onPageChange: setCurrentPage,
            }}
          />
        )}
      </div>

      {/* 3 Inspection & Analytics Cards Side-by-Side After the Table */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 pt-2">
        {/* Card 1: Businesses by Status (4 Cols) */}
        <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Businesses by Status</span>
              <span className="font-bold text-slate-400 text-[11px]">
                Total: {metric(counts.data?.total)}
              </span>
            </h3>

            <div className="flex items-center justify-center pt-2">
              <div className="h-40 w-40">
                {counts.data && counts.data.total > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {statusDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [`${val} Businesses`, "Count"]}
                        contentStyle={{
                          backgroundColor: "#0D1F3D",
                          color: "#fff",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="flex h-full items-center justify-center text-center text-slate-500">
                    {counts.loading
                      ? "Loading status counts..."
                      : counts.error
                        ? "Status counts unavailable"
                        : "No businesses yet"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
            {statusDistributionData.map((s) => (
              <div key={s.name} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-bold">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </span>
                <span className="font-extrabold text-[#0D1F3D]">
                  {s.value.toLocaleString()}{" "}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Businesses by Source (5 Cols) */}
        <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#0D1F3D] border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Businesses by Source</span>
              <span className="font-bold text-slate-400 text-[11px]">
                Analytics unavailable
              </span>
            </h3>

            <div className="space-y-2.5 text-xs font-semibold pt-2">
              <div className="flex min-h-40 items-center justify-center rounded-lg bg-slate-50 px-4 text-center text-slate-500">
                Source distribution is not available yet. Filter by source to
                see matching businesses.
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Quick Actions (3 Cols) */}
        <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-xs space-y-3 text-xs lg:col-span-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-[#0D1F3D] border-b border-slate-100 pb-2">
              Quick Actions
            </h3>
            <p className="text-[11px] text-slate-500 pt-1 font-medium">
              Perform quick merchant operations and bulk imports.
            </p>
          </div>

          <div className="space-y-2 text-xs font-semibold pt-1">
            <Button
              variant="outline"
              disabled={!canCreate}
              onClick={() => navigate("/admin/businesses/create")}
              className="w-full flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">Add New Business</p>
                  <p className="text-[10px] text-slate-400">
                    Manually add a new merchant
                  </p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </Button>

            <Button
              variant="outline"
              disabled
              title="Import is not available in this phase"
              className="w-full flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">Import Businesses</p>
                  <p className="text-[10px] text-slate-400">
                    Import unavailable in this phase
                  </p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </Button>

            <Button
              variant="outline"
              disabled
              title="Export is not available in this phase"
              className="w-full flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 hover:bg-slate-100 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald-600" />
                <div>
                  <p className="font-bold text-[#0D1F3D]">Export Businesses</p>
                  <p className="text-[10px] text-slate-400">
                    Export unavailable in this phase
                  </p>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
