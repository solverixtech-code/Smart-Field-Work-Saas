import type {
  AccountInput,
  ContactInput,
  OwnerOption,
  Page,
} from "./crm.types";
export type LeadStatus =
  "OPEN" | "QUALIFIED" | "CONVERTED" | "DISQUALIFIED" | "DUPLICATE";
export type LeadPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export interface LeadInput {
  name: string;
  kind?: "BUSINESS" | "INDIVIDUAL";
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  description?: string | null;
  sourceValueId?: string | null;
  priority?: LeadPriority;
  accountId?: string | null;
  contactId?: string | null;
}
export interface LeadDto extends LeadInput {
  id: string;
  tenantId: string;
  kind: "BUSINESS" | "INDIVIDUAL";
  status: LeadStatus;
  priority: LeadPriority;
  revision: number;
  ownerMembershipId: string;
  assignedMembershipId: string | null;
  owner: OwnerOption;
  assignee: OwnerOption | null;
  source: string | null;
  accountId: string | null;
  contactId: string | null;
  convertedAccountId: string | null;
  convertedContactId: string | null;
  convertedAt: string | null;
  convertedByMembershipId: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface LeadQuery {
  hot?: "true";
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  sourceValueId?: string;
  ownerMembershipId?: string;
  assignedMembershipId?: string;
  accountId?: string;
  unassigned?: "true" | "false";
}
export interface LeadCounts {
  total: number;
  unassigned: number;
  lifecycle: Array<{ status: LeadStatus; count: number }>;
  priorities: Array<{ priority: LeadPriority; count: number }>;
  sources: Array<{ id: string | null; name: string; count: number }>;
}
export interface LeadConversion {
  expectedRevision: number;
  idempotencyKey: string;
  account?:
    { mode: "link"; id: string } | { mode: "create"; data: AccountInput };
  contact?:
    { mode: "link"; id: string } | { mode: "create"; data: ContactInput };
}
export interface LeadApi {
  list(query: LeadQuery, signal: AbortSignal): Promise<Page<LeadDto>>;
  counts(query: LeadQuery, signal: AbortSignal): Promise<LeadCounts>;
  get(id: string, signal: AbortSignal): Promise<LeadDto>;
  create(
    body: LeadInput & {
      ownerMembershipId?: string;
      assignedMembershipId?: string | null;
    },
    signal: AbortSignal,
  ): Promise<LeadDto>;
  update(
    id: string,
    body: Partial<LeadInput> & {
      expectedRevision: number;
      status?: Exclude<LeadStatus, "CONVERTED">;
    },
    signal: AbortSignal,
  ): Promise<LeadDto>;
  assign(
    id: string,
    body: {
      expectedRevision: number;
      ownerMembershipId?: string;
      assignedMembershipId?: string | null;
    },
    signal: AbortSignal,
  ): Promise<{ id: string; revision: number }>;
  remove(id: string, revision: number, signal: AbortSignal): Promise<void>;
  convert(
    id: string,
    body: LeadConversion,
    signal: AbortSignal,
  ): Promise<{
    leadId: string;
    revision: number;
    accountId: string | null;
    contactId: string | null;
    convertedAt: string;
  }>;
  owners(query: LeadQuery, signal: AbortSignal): Promise<Page<OwnerOption>>;
}
export const leadStatuses: Array<{ value: LeadStatus; label: string }> = [
  { value: "OPEN", label: "Open" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "CONVERTED", label: "Converted" },
  { value: "DISQUALIFIED", label: "Disqualified" },
  { value: "DUPLICATE", label: "Duplicate" },
];
export const leadPriorities: Array<{ value: LeadPriority; label: string }> = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];
export const leadLabel = (status: string) =>
  [...leadStatuses, ...leadPriorities].find((o) => o.value === status)?.label ??
  status;
