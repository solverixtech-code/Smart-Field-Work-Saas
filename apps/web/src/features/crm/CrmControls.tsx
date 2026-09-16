import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { CrmError } from "./crm.state";
import { useCrmQuery, useDebouncedSearch } from "./CrmContext";
import { MasterCode } from "./crm.types";
const fieldLabels: Record<string, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  status: "Status",
  businessTypeValueId: "Business type",
  sourceValueId: "Source",
  roleValueId: "Contact role",
  ownerMembershipId: "Owner",
  categoryLabel: "Category",
  addressLine1: "Address line 1",
  addressLine2: "Address line 2",
  city: "City",
  state: "State",
  postalCode: "Postal code",
  countryCode: "Country code",
  website: "Website",
  gstin: "GSTIN",
  establishedYear: "Established year",
  description: "Description",
  expectedRevision: "Record version",
  primaryContact: "Primary contact",
};
export function CrmFailure({
  error,
  retry,
}: {
  error: CrmError;
  retry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
    >
      <p>{error.message}</p>
      {error.details?.length ? (
        <ul className="list-disc space-y-1 pl-5">
          {error.details.map((detail, index) => (
            <li key={index}>
              {fieldLabels[detail.field.split(".").at(-1) ?? ""] ?? "Form"}:{" "}
              {detail.message}
            </li>
          ))}
        </ul>
      ) : null}
      {retry && (
        <Button type="button" variant="outline" onClick={retry}>
          Reload
        </Button>
      )}
    </div>
  );
}
export const statuses = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "BLOCKED", label: "Blocked" },
];
export const statusLabel = (status: string) =>
  statuses.find((s) => s.value === status)?.label ?? status;
export function CrmLookup({
  id,
  label,
  kind,
  value,
  currentLabel,
  onChange,
  disabled = false,
  compact = false,
  emptyLabel,
}: {
  id: string;
  label: string;
  kind: MasterCode | "owner" | "lead-owner";
  value?: string | null;
  currentLabel?: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
  compact?: boolean;
  emptyLabel?: string;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useDebouncedSearch(search);
  const result = useCrmQuery(
    `${kind}:${query}:${page}`,
    async (service, signal) => {
      if (kind === "owner" || kind === "lead-owner") {
        const response = await (
          kind === "lead-owner" ? service.leads.owners : service.owners
        )({ search: query, page, limit: 25 }, signal);
        return {
          ...response,
          items: response.items.map((r) => ({
            value: r.id,
            label: r.displayName,
            avatar: r.avatarUrl ?? undefined,
            avatarFallback: kind === "lead-owner",
            sublabel: r.role ?? undefined,
          })),
        };
      }
      const response = await service.masters(
        kind,
        { search: query, page, limit: 25 },
        signal,
      );
      return {
        ...response,
        items: response.items
          .filter((r) => r.selectable)
          .map((r) => ({ value: r.id, label: r.name })),
      };
    },
  );
  const options = result.data?.items ?? [];
  const selected =
    value && !options.some((o) => o.value === value)
      ? [
          {
            value,
            label:
              currentLabel || "Current selection (reload options to verify)",
          },
        ]
      : [];
  const controls = (
    <div className="space-y-2">
      <Input
        id={`${id}-search`}
        label={`Search ${label.toLowerCase()}`}
        value={search}
        disabled={disabled}
        maxLength={200}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      <Select
        native
        id={id}
        label={label}
        value={value ?? ""}
        options={[
          ...(kind === "lead-owner"
            ? [{ value: "", label: emptyLabel ?? "Unassigned" }]
            : []),
          ...selected,
          ...options,
        ]}
        disabled={disabled || result.loading}
        placeholder={
          result.loading
            ? "Loading options..."
            : kind === "owner"
              ? currentLabel
                ? `Keep ${currentLabel}`
                : "Your membership"
              : "No selection"
        }
        onChange={(e) => onChange(e.target.value)}
      />
      {result.error &&
        (result.error.status === 404 ? (
          <p className="text-xs text-slate-500">
            {label} options are unavailable.
          </p>
        ) : (
          <CrmFailure error={result.error} retry={result.reload} />
        ))}
      {result.data && result.data.totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous options
          </Button>
          <span className="text-xs">
            {page} / {result.data.totalPages}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page >= result.data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next options
          </Button>
        </div>
      )}
    </div>
  );
  return compact ? (
    <details className="relative rounded-lg border border-slate-200 bg-white p-2.5">
      <summary className="cursor-pointer text-xs font-semibold text-slate-700">
        {label}
        {value ? " (filtered)" : ""}
      </summary>
      <div className="absolute left-0 top-full z-20 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        {controls}
      </div>
    </details>
  ) : (
    controls
  );
}
