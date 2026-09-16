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
  showLabel = true,
  kind,
  value,
  currentLabel,
  onChange,
  disabled = false,
  placeholder,
}: {
  id: string;
  label: string;
  showLabel?: boolean;
  kind: MasterCode | "owner";
  value?: string | null;
  currentLabel?: string | null;
  onChange: (id: string) => void;
  disabled?: boolean;
  compact?: boolean;
  placeholder?: string;
}) {
  const [search] = useState("");
  const query = useDebouncedSearch(search);
  const result = useCrmQuery(
    `${kind}:${query}:1`,
    async (service, signal) => {
      if (kind === "owner") {
        const response = await service.owners(
          { search: query, page: 1, limit: 50 },
          signal,
        );
        return {
          ...response,
          items: response.items.map((r) => ({
            value: r.id,
            label: r.displayName,
          })),
        };
      }
      const response = await service.masters(
        kind,
        { search: query, page: 1, limit: 50 },
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
            label: currentLabel || "Current selection",
          },
        ]
      : [];

  return (
    <Select
      id={id}
      label={showLabel ? label : undefined}
      value={value ?? ""}
      options={[...selected, ...options]}
      disabled={disabled || result.loading}
      searchable={true}
      placeholder={
        placeholder ??
        (result.loading
          ? "Loading options..."
          : kind === "owner"
            ? currentLabel
              ? `Keep ${currentLabel}`
              : "Select owner"
            : `All ${label.toLowerCase()}s`)
      }
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
