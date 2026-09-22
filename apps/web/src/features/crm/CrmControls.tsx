import React, { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { CrmError } from "./crm.state";
import { useCrmQuery, useDebouncedSearch } from "./CrmContext";
import { MasterCode, OwnerOption } from "./crm.types";

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
  showLabel = true,
  kind,
  value,
  currentLabel,
  onChange,
  disabled = false,
  emptyLabel,
  placeholder,
}: {
  id: string;
  label: string;
  showLabel?: boolean;
  kind: MasterCode | "owner" | "lead-owner";
  value?: string | null;
  currentLabel?: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
  compact?: boolean;
  emptyLabel?: string;
  placeholder?: string;
}) {
  const [search] = useState("");
  const [page] = useState(1);
  const query = useDebouncedSearch(search);
  const result = useCrmQuery(
    `${kind}:${query}:${page}`,
    async (service, signal) => {
      if (kind === "owner" || kind === "lead-owner") {
        const ownerFn = kind === "lead-owner" && service.leads?.owners ? service.leads.owners : service.owners;
        const response = await ownerFn({ search: query, page, limit: 25 }, signal);
        return {
          ...response,
          items: response.items.map((r: OwnerOption) => ({
            value: r.id,
            label:
              kind === "lead-owner" && (r.employeeCode || r.email)
                ? `${r.displayName} (${r.employeeCode || r.email})`
                : r.displayName,
            avatar: r.avatarUrl ?? undefined,
            sublabel: [r.role, ...(kind === "lead-owner" ? [r.email] : [])]
              .filter(Boolean)
              .join(" · "),
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
          .filter((r: { selectable: boolean }) => r.selectable)
          .map((r: { id: string; name: string }) => ({ value: r.id, label: r.name })),
      };
    },
  );
  const options = result.data?.items ?? [];
  const selected =
    value && !options.some((o: { value: string }) => o.value === value)
      ? [
          {
            value,
            label: currentLabel || "Current selection",
          },
        ]
      : [];
  const selectPlaceholder =
    placeholder ??
    (result.loading
      ? "Loading options..."
      : kind === "owner" || kind === "lead-owner"
        ? currentLabel
          ? `Keep ${currentLabel}`
          : "Your membership"
        : `All ${label.toLowerCase()}s`);

  return (
    <div className="w-full">
      <Select
        id={id}
        label={showLabel ? label : undefined}
        value={value ?? ""}
        options={[
          ...(kind === "lead-owner"
            ? [{ value: "", label: emptyLabel ?? "Unassigned" }]
            : []),
          ...selected,
          ...options,
        ]}
        disabled={disabled || result.loading}
        placeholder={selectPlaceholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
