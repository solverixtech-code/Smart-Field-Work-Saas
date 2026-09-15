import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Checkbox } from "../../components/ui/Checkbox";
import {
  AccountDto,
  AccountInput,
  ContactInput,
  ContactDto,
  CrmStatus,
} from "./crm.types";
import { useCrm, useCrmMutation } from "./CrmContext";
import { CrmFailure, CrmLookup, statuses } from "./CrmControls";

export function ContactFields({
  value,
  onChange,
  current,
}: {
  value: ContactInput;
  onChange: (v: ContactInput) => void;
  current?: ContactDto;
}) {
  const { can } = useCrm();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input
        id="contact-name"
        label="Contact name"
        required
        maxLength={200}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
      />
      <Input
        id="contact-phone"
        label="Phone (with country code)"
        type="tel"
        maxLength={30}
        placeholder="+919876543210"
        value={value.phone ?? ""}
        onChange={(e) => onChange({ ...value, phone: e.target.value || null })}
      />
      <Input
        id="contact-email"
        label="Email"
        type="email"
        maxLength={254}
        value={value.email ?? ""}
        onChange={(e) => onChange({ ...value, email: e.target.value || null })}
      />
      <Select
        native
        id="contact-status"
        label="Status"
        value={value.status ?? "ACTIVE"}
        options={statuses}
        onChange={(e) => {
          if (e.target.value)
            onChange({ ...value, status: e.target.value as CrmStatus });
        }}
      />
      {can("system.masters.view") && (
        <CrmLookup
          id="contact-role"
          label="Contact role"
          kind="contact_role"
          value={value.roleValueId}
          currentLabel={current?.role}
          onChange={(roleValueId) =>
            onChange({ ...value, roleValueId: roleValueId || null })
          }
        />
      )}
      <p className="text-sm text-slate-600 sm:col-span-2">
        Provide at least a phone number or email address.
      </p>
    </div>
  );
}
const textFields = [
  ["name", "Business name", 200],
  ["categoryLabel", "Category", 200],
  ["addressLine1", "Address line 1", 200],
  ["addressLine2", "Address line 2", 200],
  ["city", "City", 100],
  ["state", "State", 100],
  ["postalCode", "Postal code", 20],
  ["countryCode", "Country code (two uppercase letters)", 2],
  ["website", "Website", 2048],
  ["gstin", "GSTIN", 15],
] as const;
function editableAccount(row?: AccountDto): AccountInput {
  return {
    name: row?.name ?? "",
    businessTypeValueId: row?.businessTypeValueId,
    sourceValueId: row?.sourceValueId,
    categoryLabel: row?.categoryLabel,
    status: row?.status ?? "ACTIVE",
    ownerMembershipId: row?.ownerMembershipId,
    addressLine1: row?.addressLine1,
    addressLine2: row?.addressLine2,
    city: row?.city,
    state: row?.state,
    postalCode: row?.postalCode,
    countryCode: row?.countryCode,
    website: row?.website,
    gstin: row?.gstin,
    establishedYear: row?.establishedYear,
    description: row?.description,
  };
}
export function AccountForm({ initial }: { initial?: AccountDto }) {
  const navigate = useNavigate();
  const { can, readOnly } = useCrm();
  const mutation = useCrmMutation();
  const reload = useCrmMutation();
  const [draft, setDraft] = useState(() => editableAccount(initial));
  const [current, setCurrent] = useState(initial);
  const [revision, setRevision] = useState(initial?.revision ?? 1);
  const [reviewed, setReviewed] = useState(false);
  const [includePrimary, setIncludePrimary] = useState(false);
  const [primary, setPrimary] = useState<ContactInput>({
    name: "",
    status: "ACTIVE",
  });
  const allowed =
    can(initial ? "crm.businesses.update" : "crm.businesses.create") &&
    !readOnly;
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!allowed || mutation.pending || (mutation.error?.conflict && !reviewed))
      return;
    const result = await mutation.run((service, signal) =>
      initial
        ? service.updateAccount(
            initial.id,
            { ...draft, expectedRevision: revision },
            signal,
          )
        : service.createAccount(
            {
              ...draft,
              ...(includePrimary ? { primaryContact: primary } : {}),
            },
            signal,
          ),
    );
    if (result) navigate(`/admin/businesses/${result.id}`);
    else setReviewed(false);
  }
  async function refresh() {
    if (!initial) return;
    const row = await reload.run((service, signal) =>
      service.account(initial.id, signal),
    );
    if (row) {
      setCurrent(row);
      setRevision(row.revision);
      setReviewed(true);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">
          {initial ? "Edit business" : "Add business"}
        </h1>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            navigate(
              initial ? `/admin/businesses/${initial.id}` : "/admin/businesses",
            )
          }
        >
          Cancel
        </Button>
      </div>
      {!allowed && (
        <p role="alert" className="text-sm text-slate-700">
          You have read-only access to this form.
        </p>
      )}
      {mutation.error && <CrmFailure error={mutation.error} />}
      {mutation.error?.conflict && initial && (
        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            isLoading={reload.pending}
            onClick={refresh}
          >
            Reload current revision
          </Button>
          {reviewed && (
            <details
              open
              className="rounded-lg border border-slate-200 p-4 text-sm"
            >
              <summary>
                Current saved values (revision {revision}) - your edits remain
                below
              </summary>
              <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[
                  ...textFields.map(
                    ([key, label]) => [label, current?.[key]] as const,
                  ),
                  ["Business type", current?.businessType],
                  ["Source", current?.source],
                  ["Owner", current?.owner.displayName],
                  ["Status", current?.status],
                  ["Established year", current?.establishedYear],
                  ["Description", current?.description],
                ].map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-slate-600">{key}</dt>
                    <dd className="break-words">{value ?? "Not set"}</dd>
                  </div>
                ))}
              </dl>
            </details>
          )}
        </div>
      )}
      {reload.error && <CrmFailure error={reload.error} />}
      <fieldset disabled={!allowed || mutation.pending} className="space-y-5">
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold">Business information</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {textFields.map(([key, label, maxLength]) => (
              <Input
                key={key}
                id={`business-${key}`}
                label={label}
                maxLength={maxLength}
                required={key === "name"}
                type={key === "website" ? "url" : "text"}
                value={draft[key] ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    [key]: e.target.value || (key === "name" ? "" : null),
                  })
                }
              />
            ))}
            <Input
              id="business-year"
              label="Established year"
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              value={draft.establishedYear ?? ""}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  establishedYear: e.target.value
                    ? Number(e.target.value)
                    : null,
                })
              }
            />
            <Select
              native
              id="business-status"
              label="Status"
              options={statuses}
              value={draft.status}
              onChange={(e) => {
                if (e.target.value)
                  setDraft({ ...draft, status: e.target.value as CrmStatus });
              }}
            />
            {can("system.masters.view") && (
              <>
                <CrmLookup
                  id="business-type"
                  label="Business type"
                  kind="business_type"
                  value={draft.businessTypeValueId}
                  currentLabel={current?.businessType}
                  onChange={(id) =>
                    setDraft({ ...draft, businessTypeValueId: id || null })
                  }
                />
                <CrmLookup
                  id="business-source"
                  label="Source"
                  kind="lead_source"
                  value={draft.sourceValueId}
                  currentLabel={current?.source}
                  onChange={(id) =>
                    setDraft({ ...draft, sourceValueId: id || null })
                  }
                />
              </>
            )}
            {can("crm.businesses.assign") ? (
              <CrmLookup
                id="business-owner"
                label="Owner"
                kind="owner"
                value={draft.ownerMembershipId}
                currentLabel={current?.owner.displayName}
                onChange={(id) =>
                  setDraft({ ...draft, ownerMembershipId: id || undefined })
                }
              />
            ) : (
              <p className="text-sm text-slate-600">
                Owner: {current?.owner.displayName ?? "Your membership"}
              </p>
            )}
            <div className="md:col-span-2">
              <Textarea
                id="business-description"
                label="Description"
                maxLength={2000}
                rows={4}
                value={draft.description ?? ""}
                onChange={(e) =>
                  setDraft({ ...draft, description: e.target.value || null })
                }
              />
            </div>
          </div>
        </section>
        {!initial && can("crm.contacts.create") && (
          <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
            <Checkbox
              id="include-primary"
              label="Add a primary contact"
              checked={includePrimary}
              onChange={setIncludePrimary}
            />
            {includePrimary && (
              <ContactFields value={primary} onChange={setPrimary} />
            )}
          </section>
        )}
        <Button
          type="submit"
          isLoading={mutation.pending}
          disabled={Boolean(mutation.error?.conflict && !reviewed)}
        >
          {reviewed
            ? "Submit reviewed changes"
            : initial
              ? "Save business"
              : "Create business"}
        </Button>
      </fieldset>
    </form>
  );
}
export function ContactForm({
  accountId,
  initial,
  onSaved,
  onCancel,
}: {
  accountId: string;
  initial?: ContactDto;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { readOnly, can } = useCrm();
  const mutation = useCrmMutation();
  const reload = useCrmMutation();
  const [revision, setRevision] = useState(initial?.revision ?? 1);
  const [reviewed, setReviewed] = useState(false);
  const [current, setCurrent] = useState(initial);
  const [draft, setDraft] = useState<ContactInput>({
    name: initial?.name ?? "",
    phone: initial?.phone,
    email: initial?.email,
    roleValueId: initial?.roleValueId,
    status: initial?.status ?? "ACTIVE",
  });
  const allowed =
    !readOnly &&
    can("crm.businesses.update") &&
    can(initial ? "crm.contacts.update" : "crm.contacts.create");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!allowed || (mutation.error?.conflict && !reviewed)) return;
    const result = await mutation.run((service, signal) =>
      initial
        ? service.updateContact(
            initial.id,
            { ...draft, expectedRevision: revision },
            signal,
          )
        : service.createContact(accountId, draft, signal),
    );
    if (result) onSaved();
    else setReviewed(false);
  }
  async function refresh() {
    if (!initial) return;
    const row = await reload.run((service, signal) =>
      service.contact(initial.id, signal),
    );
    if (row && row.accountId === accountId) {
      setCurrent(row);
      setRevision(row.revision);
      setReviewed(true);
    }
  }
  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-5"
    >
      <h2 className="text-lg font-semibold">
        {initial ? "Edit contact" : "Add contact"}
      </h2>
      {mutation.error && <CrmFailure error={mutation.error} />}
      {reload.error && <CrmFailure error={reload.error} />}
      {mutation.error?.conflict && initial && (
        <>
          <Button
            type="button"
            variant="outline"
            isLoading={reload.pending}
            onClick={refresh}
          >
            Reload current revision
          </Button>
          {reviewed && (
            <p className="text-sm">
              Current saved contact: {current?.name},{" "}
              {current?.phone || "no phone"}, {current?.email || "no email"},{" "}
              {current?.status}, {current?.role || "no role"}. Revision{" "}
              {revision}. Your edits are retained below.
            </p>
          )}
        </>
      )}
      <fieldset disabled={!allowed || mutation.pending} className="space-y-4">
        <ContactFields value={draft} onChange={setDraft} current={current} />
        <div className="flex gap-3">
          <Button
            type="submit"
            isLoading={mutation.pending}
            disabled={Boolean(mutation.error?.conflict && !reviewed)}
          >
            {reviewed
              ? "Submit reviewed changes"
              : initial
                ? "Save contact"
                : "Create contact"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
