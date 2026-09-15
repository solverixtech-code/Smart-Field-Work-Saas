import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { DataTable, ColumnDef } from "../../components/ui/DataTable";
import {
  useCrm,
  useCrmQuery,
  useDebouncedSearch,
} from "../../features/crm/CrmContext";
import {
  CrmFailure,
  statuses,
  statusLabel,
} from "../../features/crm/CrmControls";
import { AccountDto, CrmStatus } from "../../features/crm/crm.types";
export default function AllBusinessesPage() {
  const navigate = useNavigate();
  const { can, readOnly } = useCrm();
  const [search, setSearch] = useState("");
  const debounced = useDebouncedSearch(search);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const result = useCrmQuery(
    `accounts:${debounced}:${status}:${page}`,
    (service, signal) =>
      service.accounts(
        {
          page,
          limit: 25,
          search: debounced,
          status: status ? (status as CrmStatus) : undefined,
        },
        signal,
      ),
  );
  const columns: ColumnDef<AccountDto>[] = [
    {
      header: "Business",
      cell: (row) => (
        <Link
          className="font-semibold text-slate-900 underline underline-offset-4 focus:ring-2"
          to={`/admin/businesses/${row.id}`}
        >
          {row.name}
        </Link>
      ),
    },
    { header: "Business type", cell: (row) => row.businessType || "Not set" },
    { header: "City", cell: (row) => row.city || "Not set" },
    { header: "Owner", cell: (row) => row.owner.displayName },
    { header: "Status", cell: (row) => statusLabel(row.status) },
  ];
  if (can("crm.contacts.view"))
    columns.splice(3, 0, {
      header: "Primary contact",
      cell: (row) =>
        row.primaryContact ? (
          <div>
            <p>{row.primaryContact.name}</p>
            <p className="text-slate-600">
              {row.primaryContact.phone || row.primaryContact.email}
            </p>
          </div>
        ) : (
          "Not set"
        ),
    });
  return (
    <div className="space-y-4 pb-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Business database
          </h1>
          <p className="text-sm text-slate-600">
            {result.data
              ? `${result.data.total.toLocaleString()} businesses`
              : "Businesses in your workspace"}
          </p>
        </div>
        {can("crm.businesses.create") && !readOnly && (
          <Button onClick={() => navigate("/admin/businesses/create")}>
            <Plus size={16} className="mr-2" />
            Add business
          </Button>
        )}
      </header>
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2">
        <Input
          id="business-search"
          label="Search businesses"
          maxLength={200}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <Select
          native
          id="business-filter-status"
          label="Status"
          placeholder="All statuses"
          value={status}
          options={statuses}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        />
      </div>
      {result.error ? (
        <CrmFailure error={result.error} retry={result.reload} />
      ) : (
        <DataTable
          columns={columns}
          data={result.data?.items ?? []}
          keyExtractor={(row) => row.id}
          isLoading={result.loading}
          emptyMessage={
            search || status
              ? "No businesses match these filters."
              : "No businesses yet."
          }
          pagination={
            result.data
              ? {
                  currentPage: result.data.page,
                  totalPages: result.data.totalPages,
                  totalEntries: result.data.total,
                  pageSize: result.data.limit,
                  onPageChange: setPage,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}
