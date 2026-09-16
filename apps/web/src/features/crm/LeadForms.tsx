import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, User, Save, ArrowLeft, UserCheck } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { ContactFields } from "./CrmForms";
import { CrmFailure, CrmLookup } from "./CrmControls";
import {
  useCrm,
  useCrmQuery,
  useCrmMutation,
  useDebouncedSearch,
} from "./CrmContext";
import type { ContactInput } from "./crm.types";
import {
  LeadDto,
  LeadInput,
  LeadConversion,
  leadLabel,
  leadStatuses,
  leadPriorities,
} from "./lead.types";

const toDateTimeLocal = (value?: string | null) =>
  value ? new Date(value).toISOString().slice(0, 16) : "";
const fromDateTimeLocal = (value: string) =>
  value ? new Date(value).toISOString() : null;

function editable(row?: LeadDto): LeadInput {
  return {
    name: row?.name ?? "",
    kind: row?.kind ?? "BUSINESS",
    businessName: row?.businessName,
    contactName: row?.contactName,
    phone: row?.phone,
    email: row?.email,
    website: row?.website,
    addressLine1: row?.addressLine1,
    addressLine2: row?.addressLine2,
    city: row?.city,
    state: row?.state,
    postalCode: row?.postalCode,
    countryCode: row?.countryCode,
    description: row?.description,
    sourceValueId: row?.sourceValueId,
    priority: row?.priority ?? "MEDIUM",
    accountId: row?.accountId,
    contactId: row?.contactId,
    estimatedValue: row?.estimatedValue,
    expectedClosingDate: row?.expectedClosingDate,
    nextFollowUpAt: row?.nextFollowUpAt,
    nextActionNote: row?.nextActionNote,
    requirementNote: row?.requirementNote,
    disqualificationReason: row?.disqualificationReason,
  };
}
export function LeadDeferred({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <Card variant="panel" className="space-y-3">
      <h2 className="text-sm font-bold text-[#0D1F3D]">{title}</h2>
      <p className="text-xs text-slate-500">
        {children ?? "Unavailable in this phase."}
      </p>
    </Card>
  );
}
export function LeadRecordLookup({
  kind,
  id,
  value,
  onChange,
  accountId = null,
  disabled = false,
}: {
  kind: "account" | "contact";
  id: string;
  value?: string | null;
  onChange: (id: string) => void;
  accountId?: string | null;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState(""),
    [page, setPage] = useState(1);
  const q = useDebouncedSearch(search);
  const result = useCrmQuery(
    JSON.stringify(["lead-link", kind, accountId, q, page]),
    async (service, signal) => {
      if (kind === "account") {
        const response = await service.accounts(
          { search: q, page, limit: 25, status: "ACTIVE" },
          signal,
        );
        return {
          ...response,
          items: response.items.map((r) => ({
            id: r.id,
            name: r.name,
            summary: [
              r.businessType,
              r.addressLine1,
              r.city,
              r.primaryContact?.name,
              r.primaryContact?.role,
              r.primaryContact?.phone,
            ]
              .filter(Boolean)
              .join(" / "),
          })),
        };
      }
      const response = await service.contacts(
        accountId,
        {
          search: q,
          page,
          limit: 25,
          status: "ACTIVE",
          ...(accountId === null ? { standalone: "true" as const } : {}),
        },
        signal,
      );
      return {
        ...response,
        items: response.items.map((r) => ({
          id: r.id,
          name: r.name,
          summary: [r.phone, r.email, r.role].filter(Boolean).join(" / "),
        })),
      };
    },
  );
  const selected = result.data?.items.find((r) => r.id === value);
  return (
    <div className="space-y-2">
      <Input
        id={id + "-search"}
        label={"Search " + kind}
        value={search}
        maxLength={200}
        disabled={disabled}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
      />
      <Select
        id={id}
        searchable
        label={kind === "account" ? "Linked Business" : "Linked Contact"}
        value={value ?? ""}
        disabled={disabled || result.loading}
        options={[
          { value: "", label: "No selection" },
          ...(value && !selected
            ? [{ value, label: "Current linked record" }]
            : []),
          ...(result.data?.items.map((r) => ({
            value: r.id,
            label: r.name,
            sublabel: r.summary,
          })) ?? []),
        ]}
        onChange={(e) => onChange(e.target.value)}
      />
      {selected && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
          <strong>{selected.name}</strong>
          <p>{selected.summary || "Additional details not set"}</p>
        </div>
      )}
      {result.error &&
        (result.error.status === 404 ? (
          <p className="text-xs text-slate-500">
            No selectable records available.
          </p>
        ) : (
          <CrmFailure error={result.error} retry={result.reload} />
        ))}
      {result.data && result.data.totalPages > 1 && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous options
          </Button>
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
}
export function LeadForm({ initial }: { initial?: LeadDto }) {
  const { can, readOnly } = useCrm();
  const navigate = useNavigate();
  const mutation = useCrmMutation();
  const reload = useCrmMutation();

  const [draft, setDraft] = useState(() => editable(initial));
  const [revision, setRevision] = useState(initial?.revision ?? 1);
  const [status, setStatus] = useState(initial?.status ?? "OPEN");
  const [owner, setOwner] = useState("");
  const [assigned, setAssigned] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [current, setCurrent] = useState<LeadDto>();
  const [tagInput, setTagInput] = useState("");

  const presetTags = ["POS Terminal", "Field App", "Enterprise License", "Fleet Tracking", "Medical Rep Mapping"];

  const blocked =
    mutation.pending ||
    readOnly ||
    !can("crm.leads." + (initial ? "update" : "create")) ||
    Boolean(
      initial &&
      !["OPEN", "QUALIFIED"].includes(current?.status ?? initial.status),
    ) ||
    Boolean(mutation.error?.conflict && !reviewed);

  const set = <K extends keyof LeadInput>(key: K, value: LeadInput[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    const currentNote = draft.requirementNote || "";
    if (currentNote.includes(`[Tag: ${trimmed}]`)) return;
    const newNote = currentNote ? `${currentNote}, [Tag: ${trimmed}]` : `[Tag: ${trimmed}]`;
    set("requirementNote", newNote);
    setTagInput("");
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (blocked) return;
    setReviewed(false);
    const saved = await mutation.run((service, signal) =>
      initial
        ? service.leads.update(
            initial.id,
            {
              ...draft,
              expectedRevision: revision,
              status: status === "CONVERTED" ? undefined : status,
            },
            signal,
          )
        : service.leads.create(
            {
              ...draft,
              ownerMembershipId: owner || undefined,
              assignedMembershipId: assigned || undefined,
            },
            signal,
          ),
    );
    if (saved) navigate("/admin/leads/" + saved.id);
  }

  return (
    <div className="space-y-4 font-sans pb-16">
      {/* Top Action Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/leads")}
            className="text-slate-600 hover:text-[#0D1F3D] mb-1 font-semibold"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to All Leads
          </Button>
          <h1 className="text-2xl font-bold text-[#0D1F3D]">
            {initial ? "Edit Lead Information" : "Create New Lead"}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {initial
              ? "Update commercial details, contact information, and assignment."
              : "Enter lead details, contact person, and initial requirements."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/leads")}
            className="font-semibold text-slate-700 border-slate-200"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="lead-form"
            disabled={blocked}
            isLoading={mutation.pending}
            className="font-bold bg-[#0D1F3D] hover:bg-slate-800 text-white shadow-xs"
          >
            <Save className="mr-2 h-4 w-4" />
            {initial ? "Save Changes" : "Save Lead"}
          </Button>
        </div>
      </header>

      {mutation.error && <CrmFailure error={mutation.error} />}
      {mutation.error?.conflict && initial && (
        <Card variant="panel" className="border-amber-200 bg-amber-50/50">
          <p className="text-xs font-semibold text-amber-900">
            Record was modified concurrently. Review changes before re-submitting.
          </p>
          <Button
            variant="outline"
            size="sm"
            disabled={reload.pending}
            onClick={async () => {
              const latest = await reload.run((s, signal) =>
                s.leads.get(initial.id, signal),
              );
              if (latest) {
                setCurrent(latest);
                setRevision(latest.revision);
                setReviewed(true);
              }
            }}
            className="mt-2"
          >
            Reload latest version
          </Button>
        </Card>
      )}

      <form id="lead-form" onSubmit={submit}>
        <fieldset
          disabled={mutation.pending || readOnly}
          className="grid grid-cols-1 gap-4 lg:grid-cols-12"
        >
          {/* LEFT MAIN COLUMN (8 COLS) */}
          <div className="space-y-4 lg:col-span-8">
            {/* Card 1: Lead Type Selection */}
            <Card variant="panel" className="space-y-3">
              <label className="text-xs font-bold text-[#0D1F3D] block">
                Lead Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
                <div
                  onClick={() => set("kind", "BUSINESS")}
                  className={`flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
                    draft.kind === "BUSINESS"
                      ? "border-[#0D1F3D] bg-blue-50/30 ring-1 ring-[#0D1F3D]"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      draft.kind === "BUSINESS"
                        ? "border-[#0D1F3D] bg-[#0D1F3D]"
                        : "border-slate-300"
                    }`}
                  >
                    {draft.kind === "BUSINESS" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <Building2
                    className={`h-4 w-4 ${
                      draft.kind === "BUSINESS" ? "text-[#0D1F3D]" : "text-slate-400"
                    }`}
                  />
                  <span
                    className={`font-bold ${
                      draft.kind === "BUSINESS" ? "text-[#0D1F3D]" : "text-slate-700"
                    }`}
                  >
                    Business / Company
                  </span>
                </div>

                <div
                  onClick={() => set("kind", "INDIVIDUAL")}
                  className={`flex items-center gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
                    draft.kind === "INDIVIDUAL"
                      ? "border-[#0D1F3D] bg-blue-50/30 ring-1 ring-[#0D1F3D]"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                      draft.kind === "INDIVIDUAL"
                        ? "border-[#0D1F3D] bg-[#0D1F3D]"
                        : "border-slate-300"
                    }`}
                  >
                    {draft.kind === "INDIVIDUAL" && (
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <User
                    className={`h-4 w-4 ${
                      draft.kind === "INDIVIDUAL" ? "text-[#0D1F3D]" : "text-slate-400"
                    }`}
                  />
                  <span
                    className={`font-bold ${
                      draft.kind === "INDIVIDUAL" ? "text-[#0D1F3D]" : "text-slate-700"
                    }`}
                  >
                    Individual / Person
                  </span>
                </div>
              </div>
            </Card>

            {/* Card 2: Basic Information */}
            <Card variant="panel" className="space-y-4">
              <h2 className="text-sm font-bold text-[#0D1F3D]">Basic Information</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="lead-name"
                  label={draft.kind === "BUSINESS" ? "Business Name *" : "Full Name *"}
                  placeholder={draft.kind === "BUSINESS" ? "e.g. Acme Retail Pvt Ltd" : "e.g. Vikram Malhotra"}
                  maxLength={200}
                  required
                  value={draft.name}
                  onChange={(e) => {
                    set("name", e.target.value);
                    if (draft.kind === "BUSINESS") set("businessName", e.target.value || null);
                  }}
                />

                <Input
                  id="lead-contact-name"
                  label="Contact Person Name *"
                  placeholder="e.g. Rohan Sharma"
                  maxLength={200}
                  value={draft.contactName ?? ""}
                  onChange={(e) => set("contactName", e.target.value || null)}
                />

                {/* Mobile Number with +91 Prefix Mask */}
                <div className="space-y-1.5">
                  <label htmlFor="lead-phone" className="block text-[#0D1F3D] font-bold text-xs font-sans">
                    Mobile Number *
                  </label>
                  <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:border-[#0D1F3D] shadow-xs">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 border-r border-slate-200 text-slate-700 font-bold text-xs shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      id="lead-phone"
                      type="tel"
                      placeholder="98765 43210"
                      maxLength={30}
                      value={draft.phone ?? ""}
                      onChange={(e) => set("phone", e.target.value || null)}
                      className="w-full px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <Input
                  id="lead-email"
                  label="Email Address"
                  type="email"
                  placeholder="e.g. contact@business.com"
                  maxLength={254}
                  value={draft.email ?? ""}
                  onChange={(e) => set("email", e.target.value || null)}
                />

                <div className="sm:col-span-2">
                  <Input
                    id="lead-website"
                    label="Website URL"
                    type="url"
                    placeholder="https://www.example.com"
                    maxLength={2048}
                    value={draft.website ?? ""}
                    onChange={(e) => set("website", e.target.value || null)}
                  />
                </div>
              </div>
            </Card>

            {/* Card 3: Lead Details & Commercials */}
            <Card variant="panel" className="space-y-4">
              <h2 className="text-sm font-bold text-[#0D1F3D]">Lead Details & Commercials</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {can("system.masters.view") && (
                  <CrmLookup
                    id="lead-form-source"
                    label="Lead Source"
                    kind="lead_source"
                    value={draft.sourceValueId}
                    currentLabel={initial?.source}
                    onChange={(id) => set("sourceValueId", id || null)}
                  />
                )}

                <Select
                  native
                  id="lead-form-priority"
                  label="Priority Level"
                  value={draft.priority}
                  options={leadPriorities}
                  onChange={(e) => {
                    const option = leadPriorities.find((o) => o.value === e.target.value);
                    if (option) set("priority", option.value);
                  }}
                />

                <Select
                  native
                  id="lead-form-status"
                  label="Lifecycle Status"
                  value={status}
                  disabled={!initial}
                  options={leadStatuses.filter((o) => o.value !== "CONVERTED")}
                  onChange={(e) => {
                    const option = leadStatuses.find((o) => o.value === e.target.value);
                    if (option) setStatus(option.value);
                  }}
                />

                {status === "DISQUALIFIED" && (
                  <Select
                    native
                    id="lead-disqualification-reason"
                    label="Disqualification Reason"
                    value={draft.disqualificationReason ?? ""}
                    options={[
                      { value: "LOST", label: "Lost Opportunity" },
                      { value: "NOT_INTERESTED", label: "Not Interested" },
                    ]}
                    onChange={(e) =>
                      set(
                        "disqualificationReason",
                        e.target.value ? (e.target.value as "LOST" | "NOT_INTERESTED") : null,
                      )
                    }
                  />
                )}

                <Input
                  id="lead-estimated-value"
                  label="Estimated Value (₹)"
                  type="number"
                  min="0"
                  placeholder="e.g. 500000"
                  value={draft.estimatedValue ?? ""}
                  onChange={(e) =>
                    set("estimatedValue", e.target.value ? Number(e.target.value) : null)
                  }
                />

                <Input
                  id="lead-expected-closing-date"
                  label="Expected Closing Date"
                  type="date"
                  value={draft.expectedClosingDate?.slice(0, 10) ?? ""}
                  onChange={(e) =>
                    set(
                      "expectedClosingDate",
                      e.target.value ? new Date(e.target.value + "T00:00:00").toISOString() : null,
                    )
                  }
                />
              </div>
            </Card>

            {/* Card 4: Address & Location Details */}
            <Card variant="panel" className="space-y-4">
              <h2 className="text-sm font-bold text-[#0D1F3D]">Address & Location Details</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="lead-address1"
                  label="Address Line 1"
                  placeholder="Building, street, plot number"
                  maxLength={200}
                  value={draft.addressLine1 ?? ""}
                  onChange={(e) => set("addressLine1", e.target.value || null)}
                />

                <Input
                  id="lead-address2"
                  label="Address Line 2"
                  placeholder="Area, landmark"
                  maxLength={200}
                  value={draft.addressLine2 ?? ""}
                  onChange={(e) => set("addressLine2", e.target.value || null)}
                />

                <Input
                  id="lead-city"
                  label="City"
                  placeholder="e.g. Mumbai"
                  maxLength={100}
                  value={draft.city ?? ""}
                  onChange={(e) => set("city", e.target.value || null)}
                />

                <Input
                  id="lead-state"
                  label="State"
                  placeholder="e.g. Maharashtra"
                  maxLength={100}
                  value={draft.state ?? ""}
                  onChange={(e) => set("state", e.target.value || null)}
                />

                <Input
                  id="lead-postal-code"
                  label="Postal Code"
                  placeholder="e.g. 400001"
                  maxLength={20}
                  value={draft.postalCode ?? ""}
                  onChange={(e) => set("postalCode", e.target.value || null)}
                />

                <Input
                  id="lead-country"
                  label="Country Code"
                  placeholder="IN"
                  maxLength={2}
                  value={draft.countryCode ?? "IN"}
                  onChange={(e) => set("countryCode", e.target.value.toUpperCase() || null)}
                />
              </div>
            </Card>

            {/* Card 5: Requirement Tags */}
            <Card variant="panel" className="space-y-4">
              <h2 className="text-sm font-bold text-[#0D1F3D]">Requirement & Product Tags</h2>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="lead-tags-input"
                    placeholder="Type requirement tag and press Add"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addTag(tagInput)}
                    className="font-bold shrink-0 self-end h-10 border-slate-200"
                  >
                    Add Tag
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs font-semibold text-slate-500 mr-1">Quick Presets:</span>
                  {presetTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addTag(t)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-[#0D1F3D] hover:text-white transition-colors"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT SIDEBAR COLUMN (4 COLS) */}
          <div className="space-y-4 lg:col-span-4">
            {/* Card 1: Assign & Ownership */}
            <Card variant="panel" className="space-y-4">
              <h2 className="text-sm font-bold text-[#0D1F3D]">Assign & Ownership</h2>
              {initial ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
                  <p className="font-bold text-slate-800">Owner: {initial.owner.displayName}</p>
                  <p className="text-slate-600">Assigned: {initial.assignee?.displayName ?? "Unassigned"}</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full font-bold"
                    onClick={() => navigate("/admin/leads/" + initial.id + "/assignment")}
                  >
                    Manage Assignment
                  </Button>
                </div>
              ) : can("crm.leads.assign") ? (
                <div className="space-y-3">
                  <CrmLookup
                    id="lead-owner"
                    label="Lead Owner"
                    kind="lead-owner"
                    emptyLabel="Your membership"
                    value={owner}
                    onChange={setOwner}
                  />
                  <CrmLookup
                    id="lead-assignee"
                    label="Assigned Executive"
                    kind="lead-owner"
                    emptyLabel="Unassigned"
                    value={assigned}
                    onChange={setAssigned}
                  />
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  You will own this lead. Executive assignment is governed by tenant permissions.
                </p>
              )}
            </Card>

            {/* Card 2: Linked Business / Contact */}
            <Card variant="panel" className="space-y-4">
              <h2 className="text-sm font-bold text-[#0D1F3D]">Account & Contact Links</h2>
              {can("crm.businesses.view") && (
                <LeadRecordLookup
                  kind="account"
                  id="lead-account"
                  value={draft.accountId}
                  onChange={(id) => {
                    set("accountId", id || null);
                    set("contactId", null);
                  }}
                />
              )}
              {can("crm.contacts.view") && (
                <LeadRecordLookup
                  key={draft.accountId ?? "standalone"}
                  kind="contact"
                  id="lead-contact"
                  accountId={draft.accountId ?? null}
                  value={draft.contactId}
                  onChange={(id) => set("contactId", id || null)}
                />
              )}
            </Card>

            {/* Card 3: Follow-up & Next Action */}
            <Card variant="panel" className="space-y-4">
              <h2 className="text-sm font-bold text-[#0D1F3D]">Follow-up & Next Action</h2>
              <Input
                id="lead-next-follow-up"
                label="Next Follow-up Date & Time"
                type="datetime-local"
                value={toDateTimeLocal(draft.nextFollowUpAt)}
                onChange={(e) => set("nextFollowUpAt", fromDateTimeLocal(e.target.value))}
              />
              <Textarea
                id="lead-next-action"
                label="Next Action / Note"
                placeholder="What is the next action or follow-up plan?"
                maxLength={1000}
                value={draft.nextActionNote ?? ""}
                onChange={(e) => set("nextActionNote", e.target.value || null)}
              />
            </Card>

            {/* Card 4: Additional Information */}
            <Card variant="panel" className="space-y-4">
              <h2 className="text-sm font-bold text-[#0D1F3D]">Additional Information</h2>
              <Textarea
                id="lead-description"
                label="Lead Description"
                placeholder="Enter background context or company description..."
                maxLength={2000}
                value={draft.description ?? ""}
                onChange={(e) => set("description", e.target.value || null)}
              />
              <Textarea
                id="lead-requirement-note"
                label="Requirement Notes"
                placeholder="Specific commercial or technical requirements..."
                maxLength={5000}
                value={draft.requirementNote ?? ""}
                onChange={(e) => set("requirementNote", e.target.value || null)}
              />
            </Card>

            {/* Card 5: Attachments Dropzone */}
            <Card variant="panel" className="space-y-3">
              <h2 className="text-sm font-bold text-[#0D1F3D]">Attachments</h2>
              <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center space-y-2">
                <p className="text-xs text-slate-600 font-semibold">
                  Drag & drop files here or browse
                </p>
                <input
                  type="file"
                  multiple
                  id="lead-file-upload"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) {
                      const fileNames = files.map((f) => f.name).join(", ");
                      const currentDesc = draft.description || "";
                      set(
                        "description",
                        currentDesc
                          ? `${currentDesc}\n[Attached: ${fileNames}]`
                          : `[Attached: ${fileNames}]`,
                      );
                    }
                  }}
                />
                <label
                  htmlFor="lead-file-upload"
                  className="cursor-pointer inline-block text-xs font-bold text-[#0D1F3D] hover:underline"
                >
                  Choose Files
                </label>
                <p className="text-[10px] text-slate-400 font-normal">
                  Supports: PDF, PNG, JPG, DOCX (Max 10MB)
                </p>
              </div>
            </Card>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
export function LeadAssignment({
  lead,
  onSaved,
}: {
  lead: LeadDto;
  onSaved: () => void;
}) {
  const { can, readOnly } = useCrm(),
    mutation = useCrmMutation(),
    reload = useCrmMutation();
  const [owner, setOwner] = useState(lead.ownerMembershipId),
    [assigned, setAssigned] = useState(lead.assignedMembershipId ?? ""),
    [revision, setRevision] = useState(lead.revision),
    [reviewed, setReviewed] = useState(false),
    [current, setCurrent] = useState<LeadDto>();
  const disabled =
    readOnly ||
    mutation.pending ||
    !can("crm.leads.assign") ||
    !["OPEN", "QUALIFIED"].includes(lead.status) ||
    Boolean(mutation.error?.conflict && !reviewed);
  return (
    <Card variant="panel" className="space-y-6">
      <h2 className="flex items-center gap-2 text-base font-bold text-[#0D1F3D]">
        <UserCheck className="h-4 w-4 text-purple-600" />
        Lead Assignment & Reassignment
      </h2>
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
        <p>Owner: {lead.owner.displayName}</p>
        <p>Assigned Executive: {lead.assignee?.displayName ?? "Unassigned"}</p>
      </div>
      {mutation.error && <CrmFailure error={mutation.error} />}{" "}
      {mutation.error?.conflict && (
        <>
          <Button
            variant="outline"
            disabled={reload.pending}
            onClick={async () => {
              const latest = await reload.run((s, signal) =>
                s.leads.get(lead.id, signal),
              );
              if (latest) {
                setCurrent(latest);
                setRevision(latest.revision);
                setReviewed(true);
              }
            }}
          >
            Reload current revision
          </Button>
          {current && (
            <p className="text-xs">
              Current owner: {current.owner.displayName}. Current assignee:{" "}
              {current.assignee?.displayName ?? "Unassigned"}. Your selections
              are retained.
            </p>
          )}
        </>
      )}
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (disabled) return;
          setReviewed(false);
          const saved = await mutation.run((s, signal) =>
            s.leads.assign(
              lead.id,
              {
                expectedRevision: revision,
                ownerMembershipId: owner || undefined,
                assignedMembershipId: assigned || null,
              },
              signal,
            ),
          );
          if (saved) onSaved();
        }}
      >
        {can("crm.leads.assign") && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <CrmLookup
              id="assignment-owner"
              label="Owner"
              kind="lead-owner"
              emptyLabel="Keep current owner"
              currentLabel={lead.owner.displayName}
              value={owner}
              onChange={setOwner}
            />
            <CrmLookup
              id="assignment-member"
              label="Assigned executive"
              kind="lead-owner"
              emptyLabel="Unassigned"
              currentLabel={lead.assignee?.displayName}
              value={assigned}
              onChange={setAssigned}
            />
          </div>
        )}
        <p className="text-xs text-slate-500">
          A transfer may remove your access. Team scope, auto-routing and bulk
          assignment are unavailable.
        </p>
        <Button type="submit" disabled={disabled} isLoading={mutation.pending}>
          Save Assignment
        </Button>
      </form>
    </Card>
  );
}
export function LeadConversionModal({
  lead,
  onClose,
  onSaved,
}: {
  lead: LeadDto;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { can, readOnly } = useCrm(),
    mutation = useCrmMutation();
  const [accountMode, setAccountMode] = useState<"create" | "link">(
      lead.accountId ? "link" : "create",
    ),
    [contactMode, setContactMode] = useState<"none" | "create" | "link">(
      lead.kind === "INDIVIDUAL" ? "create" : "none",
    );
  const [accountId, setAccountId] = useState(lead.accountId ?? ""),
    [contactId, setContactId] = useState(lead.contactId ?? ""),
    [accountName, setAccountName] = useState(lead.name),
    [person, setPerson] = useState<ContactInput>({
      name: lead.contactName || lead.name,
      phone: lead.phone,
      email: lead.email,
    });
  const [key, setKey] = useState(() => crypto.randomUUID()),
    [submitted, setSubmitted] = useState<LeadConversion>(),
    [revision, setRevision] = useState(lead.revision);
  const recheck = useCrmMutation();
  const business = lead.kind === "BUSINESS",
    disabled =
      readOnly ||
      mutation.pending ||
      !can("crm.leads.convert") ||
      lead.status !== "QUALIFIED";
  const body: LeadConversion = {
    expectedRevision: revision,
    idempotencyKey: key,
    ...(business
      ? {
          account:
            accountMode === "create"
              ? { mode: "create" as const, data: { name: accountName } }
              : { mode: "link" as const, id: accountId },
        }
      : {}),
    ...(contactMode === "none"
      ? {}
      : {
          contact:
            contactMode === "create"
              ? { mode: "create" as const, data: person }
              : { mode: "link" as const, id: contactId },
        }),
  };
  return (
    <Modal
      isOpen
      onClose={() => {
        if (!mutation.pending) onClose();
      }}
      title="Convert Lead"
      maxWidth="max-w-3xl"
    >
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (disabled) return;
          const command = submitted ?? body;
          setSubmitted(command);
          const result = await mutation.run((s, signal) =>
            s.leads.convert(lead.id, command, signal),
          );
          if (result) onSaved();
        }}
      >
        <p className="text-sm text-slate-600">
          Create or link{" "}
          {business
            ? "a business and optionally a contact"
            : "an individual contact"}
          . This records an immutable conversion. Opportunity creation is
          unavailable.
        </p>
        {mutation.error && <CrmFailure error={mutation.error} />}{" "}
        {mutation.error && (
          <Button
            type="button"
            variant="outline"
            disabled={recheck.pending}
            onClick={async () => {
              const current = await recheck.run((s, signal) =>
                s.leads.get(lead.id, signal),
              );
              if (current?.status === "CONVERTED") {
                onSaved();
                return;
              }
              if (current) {
                setRevision(current.revision);
                setSubmitted(undefined);
                setKey(crypto.randomUUID());
                mutation.clearError();
              }
            }}
          >
            Reload current revision and review choices
          </Button>
        )}
        {recheck.error && <CrmFailure error={recheck.error} />}
        <fieldset
          disabled={Boolean(submitted) || disabled}
          className="space-y-4"
        >
          {business && (
            <>
              <Select
                native
                id="convert-account-mode"
                label="Business"
                value={accountMode}
                options={[
                  { value: "create", label: "Create Business" },
                  { value: "link", label: "Link Existing Business" },
                ]}
                onChange={(e) => {
                  if (
                    e.target.value === "create" ||
                    e.target.value === "link"
                  ) {
                    setAccountMode(e.target.value);
                    if (e.target.value === "create" && contactMode === "link")
                      setContactMode("none");
                    setContactId("");
                  }
                }}
              />
              {accountMode === "create" ? (
                <Input
                  id="convert-account-name"
                  label="Business Name"
                  required
                  value={accountName}
                  maxLength={200}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              ) : (
                <LeadRecordLookup
                  kind="account"
                  id="convert-account"
                  value={accountId}
                  onChange={(id) => {
                    setAccountId(id);
                    setContactId("");
                  }}
                />
              )}
            </>
          )}
          <Select
            native
            id="convert-contact-mode"
            label="Contact"
            value={contactMode}
            options={[
              ...(business ? [{ value: "none", label: "No Contact" }] : []),
              { value: "create", label: "Create Contact" },
              ...(business && accountMode === "create"
                ? []
                : [{ value: "link", label: "Link Existing Contact" }]),
            ]}
            onChange={(e) => {
              if (
                e.target.value === "none" ||
                e.target.value === "create" ||
                e.target.value === "link"
              )
                setContactMode(e.target.value);
            }}
          />
          {contactMode === "create" && (
            <ContactFields value={person} onChange={setPerson} />
          )}{" "}
          {contactMode === "link" && (
            <LeadRecordLookup
              kind="contact"
              id="convert-contact"
              accountId={business ? accountId : null}
              value={contactId}
              onChange={setContactId}
            />
          )}
        </fieldset>
        <p className="text-xs text-slate-500">
          After an uncertain response, retrying unchanged choices uses the same
          command identity. Reload before changing choices.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={mutation.pending}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={disabled}
            isLoading={mutation.pending}
          >
            {submitted ? "Retry Same Conversion" : "Convert Lead"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
