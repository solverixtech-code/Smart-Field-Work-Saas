import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  TriangleAlert,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import {
  useCrm,
  useCrmQuery,
  useDebouncedSearch,
} from "../../features/crm/CrmContext";
import {
  followUpApi,
  type FollowUpView,
} from "../../features/crm/follow-up.api";
import { leadApi } from "../../features/crm/lead.api";
import { FollowUpFormModal } from "./FollowUpFormModal";

const views: Array<{ id: FollowUpView; label: string; path: string }> = [
  { id: "all", label: "All follow-ups", path: "/admin/follow-ups" },
  { id: "today", label: "Today", path: "/admin/follow-ups/today" },
  { id: "upcoming", label: "Upcoming", path: "/admin/follow-ups/upcoming" },
  { id: "overdue", label: "Overdue", path: "/admin/follow-ups/overdue" },
  { id: "completed", label: "Completed", path: "/admin/follow-ups/completed" },
];

export default function FollowUpsListPage({ view }: { view: FollowUpView }) {
  const { can, readOnly } = useCrm();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedSearch(search);
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [assignedMembershipId, setAssignedMembershipId] = useState("");
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
  const summary = result.loading ? undefined : result.data?.summary;
  const current = views.find((item) => item.id === view) ?? views[0];

  return (
    <div className="min-h-screen space-y-4 bg-slate-50/50 p-2 pb-16 text-left font-sans">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-[#0D1F3D]">
            {current.label} <CalendarDays className="h-6 w-6 text-red-600" />
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Schedule and track actions linked to your leads.
          </p>
        </div>
        {can("crm.leads.update") && can("crm.leads.view") && !readOnly && (
          <Button variant="accent" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add follow-up
          </Button>
        )}
      </div>

      <nav aria-label="Follow-up views" className="flex flex-wrap gap-2">
        {views.map((item) => (
          <Link
            key={item.id}
            to={item.path}
            className={`rounded-lg border px-3 py-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 ${item.id === view ? "border-[#0D1F3D] bg-[#0D1F3D] text-white" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {summary && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Pending", value: summary.pending, icon: Clock3 },
            { label: "Due today", value: summary.today, icon: CalendarDays },
            { label: "Overdue", value: summary.overdue, icon: TriangleAlert },
            {
              label: "Completed",
              value: summary.completed,
              icon: CheckCircle2,
            },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <Icon className="h-5 w-5 text-slate-500" />
              <div>
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                <p className="text-xl font-extrabold text-[#0D1F3D]">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 max-w-md">
          <Input
            id="follow-up-search"
            aria-label="Search follow-ups"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search lead, code, contact or purpose"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="w-40">
            <Input
              id="follow-up-from"
              label="From date"
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-40">
            <Input
              id="follow-up-to"
              label="To date"
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
            />
          </div>
          {can("crm.leads.assign") && (
            <div className="w-52">
              <Select
                label="Assigned to"
                value={assignedMembershipId}
                onChange={(event) => {
                  setAssignedMembershipId(event.target.value);
                  setPage(1);
                }}
                options={[
                  { value: "", label: "Everyone" },
                  ...(owners.data?.items.map((owner) => ({
                    value: owner.id,
                    label: owner.displayName,
                  })) ?? []),
                ]}
              />
            </div>
          )}
          {(dateFrom || dateTo || assignedMembershipId || search) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDateFrom("");
                setDateTo("");
                setAssignedMembershipId("");
                setSearch("");
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
        {result.error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {result.error.message}{" "}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={result.reload}
            >
              Reload
            </Button>
          </div>
        )}
        {result.loading && (
          <p role="status" className="py-10 text-center text-sm text-slate-500">
            Loading follow-ups...
          </p>
        )}
        {!result.loading &&
          !result.error &&
          result.data?.items.length === 0 && (
            <p className="py-12 text-center text-sm text-slate-500">
              No {view === "all" ? "" : `${view} `}follow-ups found.
            </p>
          )}
        {!result.loading &&
          !result.error &&
          Boolean(result.data?.items.length) && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600">
                  <tr>
                    <th scope="col" className="p-3">
                      Follow-up
                    </th>
                    <th scope="col" className="p-3">
                      Lead
                    </th>
                    <th scope="col" className="p-3">
                      Assigned to
                    </th>
                    <th scope="col" className="p-3">
                      Schedule
                    </th>
                    <th scope="col" className="p-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.data?.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="p-3">
                        <Link
                          className="font-bold text-[#0D1F3D] underline-offset-2 hover:underline"
                          to={`/admin/follow-ups/${item.id}`}
                        >
                          {item.title}
                        </Link>
                      </td>
                      <td className="p-3">
                        {can("crm.leads.view") ? (
                          <Link
                            className="text-slate-700 hover:underline"
                            to={`/admin/leads/${item.leadId}`}
                          >
                            {item.lead.businessName || item.lead.name}
                          </Link>
                        ) : (
                          <span className="text-slate-700">
                            {item.lead.businessName || item.lead.name}
                          </span>
                        )}
                        <span className="block text-xs text-slate-500">
                          {item.lead.leadCode}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700">
                        {item.assignedMembership?.user.fullName ||
                          item.assignedToName}
                      </td>
                      <td className="p-3 text-slate-700">
                        {item.scheduledDate} · {item.scheduledTime}
                      </td>
                      <td className="p-3 text-slate-700">{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        {!result.loading &&
          !result.error &&
          result.data &&
          result.data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
              <span>
                Page {page} of {result.data.totalPages} · {result.data.total}{" "}
                records
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= result.data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
      </div>
      <FollowUpFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={result.reload}
      />
    </div>
  );
}
