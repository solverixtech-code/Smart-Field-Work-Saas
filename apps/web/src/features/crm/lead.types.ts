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
  businessName?: string | null;
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
  estimatedValue?: number | null;
  expectedClosingDate?: string | null;
  nextFollowUpAt?: string | null;
  nextActionNote?: string | null;
  requirementNote?: string | null;
  disqualificationReason?: "LOST" | "NOT_INTERESTED" | null;
}
export interface LeadDto extends LeadInput {
  id: string;
  tenantId: string;
  leadCode: string;
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
  followUp?: "pending";
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  priority?: LeadPriority;
  sourceValueId?: string;
  ownerMembershipId?: string;
  assignedMembershipId?: string;
  accountId?: string;
  disqualificationReason?: "LOST" | "NOT_INTERESTED";
  unassigned?: "true" | "false";
}
export interface LeadCounts {
  total: number;
  unassigned: number;
  pendingFollowUps: number;
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
export interface LeadHistoryItem {
  id: string;
  eventType: string;
  message: string;
  note?: string | null;
  metadata?: unknown;
  createdAt: string;
  actor: OwnerOption;
}
export interface LeadImportPreview {
  totalRows: number;
  readyRows: number;
  duplicateRows: number;
  rejectedRows: number;
  rows: Array<{
    rowNumber: number;
    status: "READY" | "DUPLICATE" | "REJECTED";
    errors: string[];
  }>;
}
export interface LeadImportResult extends LeadImportPreview {
  created: number;
  skipped: number;
  rejected: number;
  createdIds: string[];
}
export interface LeadVisitDto {
  id: string;
  leadId: string;
  executiveName: string;
  executiveAvatar?: string | null;
  checkInTime: string;
  checkOutTime?: string | null;
  durationMinutes: number;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  purpose: string;
  outcome?: string | null;
  photos: string[];
  status: 'COMPLETED' | 'SCHEDULED' | 'CANCELLED';
  createdAt: string;
}

export interface LeadFollowUpDto {
  id: string;
  leadId: string;
  assignedToName: string;
  title: string;
  scheduledDate: string;
  scheduledTime: string;
  notes?: string | null;
  status: 'Pending' | 'Completed' | 'Cancelled';
  completedAt?: string | null;
  createdAt: string;
}

export interface LeadDemoDto {
  id: string;
  leadId: string;
  conductedByName: string;
  conductedByAvatar?: string | null;
  demoTitle: string;
  demoDate: string;
  demoMode: string;
  attendeesCount: number;
  feedbackRating: number;
  keyQuestions?: string | null;
  status: 'COMPLETED' | 'SCHEDULED';
  createdAt: string;
}

export interface LeadCommunicationDto {
  id: string;
  leadId: string;
  loggedByName: string;
  loggedByAvatar?: string | null;
  channel: 'Call' | 'Email' | 'WhatsApp';
  direction: 'Inbound' | 'Outbound';
  subject: string;
  details?: string | null;
  timestamp: string;
  createdAt: string;
}

export interface LeadApi {
  list(query: LeadQuery, signal: AbortSignal): Promise<Page<LeadDto>>;
  counts(query: LeadQuery, signal: AbortSignal): Promise<LeadCounts>;
  summary(query: LeadQuery, signal: AbortSignal): Promise<LeadCounts>;
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
  bulkAssign(
    body: {
      leadIds: string[];
      assignedMembershipId: string | null;
      reason?: string;
    },
    signal: AbortSignal,
  ): Promise<{
    mode: "atomic";
    requested: number;
    assigned: number;
    results: Array<{ id: string; revision: number }>;
  }>;
  importPreview(
    body: {
      csv: string;
      duplicatePolicy: "SKIP" | "REJECT";
      defaultSourceValueId?: string | null;
    },
    signal: AbortSignal,
  ): Promise<LeadImportPreview>;
  importLeads(
    body: {
      csv: string;
      duplicatePolicy: "SKIP" | "REJECT";
      defaultSourceValueId?: string | null;
      confirmed: true;
    },
    signal: AbortSignal,
  ): Promise<LeadImportResult>;
  exportCsv(query: LeadQuery & { maxRows?: number }, signal: AbortSignal): Promise<Blob>;
  history(id: string, signal: AbortSignal): Promise<{ items: LeadHistoryItem[] }>;
  addNote(
    id: string,
    body: { note: string },
    signal: AbortSignal,
  ): Promise<{ id: string; createdAt: string }>;
  visits(id: string, signal?: AbortSignal): Promise<LeadVisitDto[]>;
  createVisit(id: string, body: Partial<LeadVisitDto>, signal?: AbortSignal): Promise<LeadVisitDto>;
  followUps(id: string, signal?: AbortSignal): Promise<LeadFollowUpDto[]>;
  createFollowUp(id: string, body: Partial<LeadFollowUpDto>, signal?: AbortSignal): Promise<LeadFollowUpDto>;
  updateFollowUp(id: string, followUpId: string, body: { status: string; notes?: string }, signal?: AbortSignal): Promise<LeadFollowUpDto>;
  demos(id: string, signal?: AbortSignal): Promise<LeadDemoDto[]>;
  createDemo(id: string, body: Partial<LeadDemoDto>, signal?: AbortSignal): Promise<LeadDemoDto>;
  communications(id: string, signal?: AbortSignal): Promise<LeadCommunicationDto[]>;
  createCommunication(id: string, body: Partial<LeadCommunicationDto>, signal?: AbortSignal): Promise<LeadCommunicationDto>;
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
