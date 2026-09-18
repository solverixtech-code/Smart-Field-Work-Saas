import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { DataTable, ColumnDef } from "../../components/ui/DataTable";
import { RowActionsMenu } from "../../components/ui/RowActionsMenu";
import { Modal } from "../../components/ui/Modal";
import { ContactDto } from "../../features/crm/crm.types";
import { ContactForm } from "../../features/crm/CrmForms";
import { CrmFailure, statusLabel } from "../../features/crm/CrmControls";
import { Search, X, UserPlus, Edit, Star, Trash2, ShieldAlert } from "lucide-react";
import {
  useCrm,
  useCrmQuery,
  useCrmMutation,
  useDebouncedSearch,
} from "../../features/crm/CrmContext";

export default function BusinessContactsPage() {
  const context = useOutletContext<any>();
  const business = context?.business || context || {};
  const reloadBusiness = context?.reload;
  const businessId = business?.id || "BUS-10058242";
  const { can, readOnly } = useCrm();
  const mutation = useCrmMutation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debounced = useDebouncedSearch(search);
  const [editing, setEditing] = useState<ContactDto | "new" | null>(null);
  const [removing, setRemoving] = useState<ContactDto | null>(null);

  const result = useCrmQuery(
    `contacts:${businessId}:${page}:${debounced}`,
    (service, signal) =>
      service.contacts(
        businessId,
        { page, limit: 25, search: debounced },
        signal,
      ),
  );

  const writable = can("crm.businesses.update") && !readOnly;

  function refresh() {
    setRemoving(null);
    setEditing(null);
    mutation.clearError();
    result.reload();
    reloadBusiness?.();
  }

  async function primary(contactId: string | null) {
    const saved = await mutation.run((service, signal) =>
      service.primary(businessId, contactId, business.revision, signal),
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
      header: "Contact Details",
      cell: (c) => (
        <div className="flex items-center gap-3 py-0.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-extrabold text-xs shrink-0 border border-blue-200/60 shadow-2xs">
            {c.name ? c.name.substring(0, 2).toUpperCase() : "CT"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0D1F3D] text-xs">{c.name}</span>
              {c.isPrimary && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 border border-blue-200/60">
                  <Star className="h-3 w-3 fill-blue-600 text-blue-600" /> Primary
                </span>
              )}
            </div>
            {c.role && (
              <p className="text-[11px] text-slate-500 font-medium">
                {c.role}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      header: "Phone Number",
      cell: (c) => (
        <span className="font-mono text-xs font-bold text-slate-800">
          {c.phone || "Not set"}
        </span>
      ),
    },
    {
      header: "Email Address",
      cell: (c) => (
        <span className="text-xs font-medium text-slate-600">
          {c.email || "Not set"}
        </span>
      ),
    },
    {
      header: "Role / Designation",
      cell: (c) => (
        <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200/60">
          {c.role || "Not set"}
        </span>
      ),
    },
    {
      header: "Status",
      align: "center",
      cell: (c) => (
        <span
          className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-bold border ${
            c.status === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}
        >
          {statusLabel(c.status)}
        </span>
      ),
    },
    {
      header: "Actions",
      align: "right",
      cell: (c) => (
        <RowActionsMenu
          items={[
            ...(writable && can("crm.contacts.update")
              ? [
                  {
                    label: "Edit Contact",
                    icon: Edit,
                    onClick: () => setEditing(c),
                  },
                  ...(c.status === "ACTIVE"
                    ? [
                        {
                          label: c.isPrimary ? "Remove Primary Badge" : "Make Primary Contact",
                          icon: Star,
                          onClick: () => primary(c.isPrimary ? null : c.id),
                        },
                      ]
                    : []),
                ]
              : []),
            ...(writable && can("crm.contacts.delete")
              ? [
                  {
                    label: "Delete Contact",
                    icon: Trash2,
                    danger: true,
                    divider: true,
                    onClick: () => setRemoving(c),
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4 font-sans pb-10">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0D1F3D]">
            Business Contacts{result.data ? ` (${result.data.total})` : ""}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Manage key stakeholders, owners, and contact persons for this business account.
          </p>
        </div>

        {writable && can("crm.contacts.create") && (
          <Button
            onClick={() => setEditing("new")}
            className="flex items-center gap-1.5 font-bold shadow-xs bg-[#0D1F3D] hover:bg-slate-800 text-white rounded-lg px-4 py-2"
          >
            <UserPlus className="h-4 w-4" /> Add Contact
          </Button>
        )}
      </div>

      {/* Global Error Alerts */}
      {mutation.error && <CrmFailure error={mutation.error} retry={refresh} />}

      {/* Search & Filter Bar */}
      <div className="rounded-lg border border-slate-200/80 bg-white p-3.5 shadow-2xs">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            id="contact-search"
            aria-label="Search contacts"
            placeholder="Search contacts by name, role, email or phone number..."
            maxLength={200}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-slate-200 bg-slate-50/60 pl-10 pr-9 py-2.5 text-xs font-semibold text-[#0D1F3D] placeholder:text-slate-400 placeholder:font-medium focus:border-[#0D1F3D] focus:bg-white focus:outline-none transition-all shadow-2xs"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main DataTable Container */}
      {result.error ? (
        <CrmFailure error={result.error} retry={result.reload} />
      ) : (
        <DataTable
          columns={columns}
          data={result.data?.items ?? []}
          keyExtractor={(c) => c.id}
          isLoading={result.loading}
          density="relaxed"
          emptyMessage="No contacts found for this business account."
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

      {/* Add / Edit Contact Modal Popup */}
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Add New Business Contact" : "Edit Contact Details"}
        maxWidth="max-w-xl"
      >
        {editing && (
          <ContactForm
            key={editing === "new" ? "new" : editing.id}
            accountId={businessId}
            initial={editing === "new" ? undefined : editing}
            onCancel={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              refresh();
            }}
          />
        )}
      </Modal>

      {/* Delete Contact Confirmation Modal */}
      <Modal
        isOpen={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title="Delete Contact"
        maxWidth="max-w-md"
      >
        {removing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
              <ShieldAlert className="h-5 w-5 shrink-0 text-red-600" />
              <p>Are you sure you want to delete <strong>{removing.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRemoving(null)}
                className="border-slate-200 text-slate-700 font-bold"
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                isLoading={mutation.pending}
                disabled={Boolean(mutation.error?.conflict)}
                onClick={remove}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
