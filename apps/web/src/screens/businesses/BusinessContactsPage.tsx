import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { DataTable, ColumnDef } from "../../components/ui/DataTable";
import { BusinessContext } from "./BusinessLayoutWrapper";
import { ContactDto } from "../../features/crm/crm.types";
import { ContactForm } from "../../features/crm/CrmForms";
import { CrmFailure, statusLabel } from "../../features/crm/CrmControls";
import {
  useCrm,
  useCrmQuery,
  useCrmMutation,
  useDebouncedSearch,
} from "../../features/crm/CrmContext";
export default function BusinessContactsPage() {
  const { business, reload: reloadBusiness } =
    useOutletContext<BusinessContext>();
  const { can, readOnly } = useCrm();
  const mutation = useCrmMutation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebouncedSearch(search);
  const [editing, setEditing] = useState<ContactDto | "new" | null>(null);
  const [removing, setRemoving] = useState<ContactDto | null>(null);
  const result = useCrmQuery(
    `contacts:${business.id}:${page}:${debounced}`,
    (service, signal) =>
      service.contacts(
        business.id,
        { page, limit: 25, search: debounced },
        signal,
      ),
  );
  const writable = can("crm.businesses.update") && !readOnly;
  function refresh() {
    setRemoving(null);
    mutation.clearError();
    result.reload();
    reloadBusiness?.();
  }
  async function primary(contactId: string | null) {
    const saved = await mutation.run((service, signal) =>
      service.primary(business.id, contactId, business.revision, signal),
    );
    if (saved) refresh();
  }
  async function remove() {
    if (!removing) return;
    const deleted = await mutation.run(async (service, signal) => {
      await service.deleteContact(removing.id, removing.revision, signal);
      return true;
    });
    if (deleted) refresh();
  }
  const columns: ColumnDef<ContactDto>[] = [
    {
      header: "Contact",
      cell: (c) => (
        <div>
          <p className="font-semibold">{c.name}</p>
          {c.isPrimary && <p className="text-slate-600">Primary contact</p>}
        </div>
      ),
    },
    { header: "Phone", cell: (c) => c.phone || "Not set" },
    { header: "Email", cell: (c) => c.email || "Not set" },
    { header: "Role", cell: (c) => c.role || "Not set" },
    { header: "Status", cell: (c) => statusLabel(c.status) },
    {
      header: "Actions",
      cell: (c) => (
        <div className="flex flex-wrap gap-2">
          {writable && can("crm.contacts.update") && (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(c)}>
                Edit
              </Button>
              {c.status === "ACTIVE" && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={
                    mutation.pending || Boolean(mutation.error?.conflict)
                  }
                  onClick={() => primary(c.isPrimary ? null : c.id)}
                >
                  {c.isPrimary ? "Clear primary" : "Make primary"}
                </Button>
              )}
            </>
          )}
          {writable && can("crm.contacts.delete") && (
            <Button size="sm" variant="outline" onClick={() => setRemoving(c)}>
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Contacts{result.data ? ` (${result.data.total})` : ""}
        </h2>
        {writable && can("crm.contacts.create") && (
          <Button onClick={() => setEditing("new")}>Add contact</Button>
        )}
      </div>
      {editing && (
        <ContactForm
          key={editing === "new" ? "new" : editing.id}
          accountId={business.id}
          initial={editing === "new" ? undefined : editing}
          onCancel={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            refresh();
          }}
        />
      )}
      {mutation.error && <CrmFailure error={mutation.error} retry={refresh} />}
      {removing && (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <p>Delete {removing.name}? This contact cannot be restored.</p>
          <div className="flex gap-2">
            <Button
              isLoading={mutation.pending}
              disabled={Boolean(mutation.error?.conflict)}
              onClick={remove}
            >
              Confirm deletion
            </Button>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      <Input
        id="contact-search"
        label="Search contacts"
        maxLength={200}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      {result.error ? (
        <CrmFailure error={result.error} retry={result.reload} />
      ) : (
        <DataTable
          columns={columns}
          data={result.data?.items ?? []}
          keyExtractor={(c) => c.id}
          isLoading={result.loading}
          emptyMessage="No contacts found for this business."
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
