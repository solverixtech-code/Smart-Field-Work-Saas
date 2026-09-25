import { api } from "../../common/api";
import type { DemoItem } from "./demosData";

export type DemoView = "all" | "today" | "scheduled" | "completed";

export interface DemoRecord {
  id: string;
  demoCode: string | null;
  leadId: string;
  conductedByMembershipId: string;
  conductedByName: string;
  conductedByAvatar: string | null;
  demoTitle: string;
  demoDate: string;
  demoTime: string;
  demoType: DemoItem["demoType"];
  demoMode: string;
  productService: string | null;
  attendeesCount: number;
  feedbackRating: number;
  keyQuestions: string | null;
  outcome: string;
  nextAction: string | null;
  nextActionDate: string | null;
  durationMinutes: number | null;
  probabilityPercentage: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  activities?: Array<{ id: string; eventType: string; message: string; note: string | null; createdAt: string }>;
  conductedByMembership: {
    employeeCode: string | null;
    designation: string | null;
    tenantRole: { name: string } | null;
    team: { name: string } | null;
    user: { fullName: string; avatarUrl: string | null; email: string; mobile: string | null };
  };
  lead: {
    id: string;
    leadCode: string;
    name: string;
    businessName: string | null;
    contactName: string | null;
    phone: string | null;
    email: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    estimatedValue: string | number | null;
    priority: string;
    status: string;
    convertedAt: string | null;
    sourceValue: { name: string } | null;
    opportunity: { amount: string | number; stage: string } | null;
  };
}

export interface DemoSummary {
  all: number;
  today: number;
  scheduled: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  converted: number;
}

export interface DemoPage {
  items: DemoRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  today: string;
  summary: DemoSummary;
}

export interface DemoListParams {
  view: DemoView;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  demoType?: string;
  executiveMembershipId?: string;
  from?: string;
  to?: string;
}

export interface DemoLeadOption {
  id: string;
  leadCode: string;
  displayName: string;
  name: string;
  businessName: string | null;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
}

export interface DemoExecutiveOption {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
  team: string | null;
}

export interface DemoOptions {
  leads: DemoLeadOption[];
  executives: DemoExecutiveOption[];
}

export interface DemoMutationInput {
  leadId?: string;
  demoTitle?: string;
  demoDate?: string;
  demoTime?: string;
  demoType?: DemoItem["demoType"];
  demoMode?: string;
  productService?: string;
  attendeesCount?: number;
  keyQuestions?: string;
  conductedByMembershipId?: string;
  status?: string;
  outcome?: string;
  nextAction?: string;
  nextActionDate?: string;
  durationMinutes?: number;
  probabilityPercentage?: number;
}

export interface DemoConversionReport {
  summary: { total: number; completed: number; interested: number; proposals: number; converted: number; conversionRate: number; valueConverted: number; averageDaysToClose: number };
  leaderboard: Array<{ name: string; demos: number; converted: number; revenue: number; conversionRate: number }>;
  sources: Array<{ source: string; demos: number; converted: number; conversionRate: number }>;
}

const statusLabels: Record<string, DemoItem["status"]> = {
  SCHEDULED: "Scheduled",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  RESCHEDULED: "Rescheduled",
  NO_SHOW: "No Show",
  CANCELLED: "Cancelled",
};

const outcomeLabels: Record<string, NonNullable<DemoItem["outcome"]>> = {
  PENDING: "Pending",
  INTERESTED: "Interested",
  FOLLOW_UP: "Follow-up",
  PROPOSAL: "Proposal",
  TRIAL: "Trial",
  CONVERTED: "Converted",
  NOT_INTERESTED: "Not Interested",
  RESCHEDULED: "Rescheduled",
  NO_SHOW: "No Show",
  DEMO_DONE: "Demo Done",
  QUOTATION_SENT: "Quotation Sent",
};

const formatDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(year, month - 1, day));
};

const formatCurrency = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export function toDemoItem(record: DemoRecord): DemoItem {
  const address = [record.lead.addressLine1, record.lead.addressLine2, record.lead.city, record.lead.state, record.lead.postalCode].filter(Boolean).join(", ");
  const revenue = Number(record.lead.opportunity?.amount ?? record.lead.estimatedValue ?? 0);
  const nextDate = record.nextActionDate ? formatDate(record.nextActionDate) : undefined;
  return {
    id: record.id,
    leadId: record.leadId,
    assignedToMembershipId: record.conductedByMembershipId,
    demoId: record.demoCode ?? `DEM-${record.id.slice(0, 6).toUpperCase()}`,
    badge: record.lead.priority === "URGENT" ? "Hot" : undefined,
    businessName: record.lead.businessName || record.lead.name,
    businessAddress: address || "Address not provided",
    contactPerson: record.lead.contactName || record.lead.name,
    contactRole: "Contact",
    phone: record.lead.phone || "—",
    email: record.lead.email || "—",
    demoType: record.demoType,
    productService: record.productService || record.demoTitle,
    assignedToName: record.conductedByMembership.user.fullName || record.conductedByName,
    assignedToAvatar: record.conductedByMembership.user.avatarUrl || record.conductedByAvatar || "",
    assignedToRole: record.conductedByMembership.designation || record.conductedByMembership.tenantRole?.name || "Field Executive",
    assignedToPhone: record.conductedByMembership.user.mobile || undefined,
    assignedToEmail: record.conductedByMembership.user.email,
    assignedToEmployeeCode: record.conductedByMembership.employeeCode || undefined,
    demoDate: formatDate(record.demoDate),
    demoDateIso: record.demoDate,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    activities: record.activities?.map((activity) => ({ id: activity.id, title: activity.eventType.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()), description: activity.note || activity.message, createdAt: activity.createdAt })),
    demoTime: record.demoTime,
    demoMode: record.demoMode,
    status: statusLabels[record.status] ?? "Scheduled",
    outcome: outcomeLabels[record.outcome] ?? "Pending",
    nextAction: record.nextAction || undefined,
    nextActionDate: nextDate,
    durationMinutes: record.durationMinutes ?? undefined,
    durationFormatted: record.durationMinutes == null ? undefined : `${record.durationMinutes}m`,
    revenueValue: revenue,
    revenueFormatted: formatCurrency(revenue),
    conversionPotential: record.probabilityPercentage != null && record.probabilityPercentage >= 70 ? "High" : record.probabilityPercentage != null && record.probabilityPercentage >= 40 ? "Medium" : "Low",
    probabilityPercentage: record.probabilityPercentage ?? 0,
    leadSource: record.lead.sourceValue?.name || "Direct",
    leadStage: record.lead.status === "CONVERTED" ? "Closed Won" : record.lead.opportunity?.stage === "negotiation" ? "Negotiation" : "Evaluation",
    leadScore: record.feedbackRating,
    attendeesCount: record.attendeesCount,
    notesSummary: record.keyQuestions || undefined,
  };
}

const root = "/tenant/crm/demos";

export const demoApi = {
  list: async (params: DemoListParams, signal: AbortSignal): Promise<DemoPage> => (await api.get(root, { params, signal })).data,
  get: async (id: string, signal: AbortSignal): Promise<DemoRecord> => (await api.get(`${root}/${id}`, { signal })).data,
  options: async (signal: AbortSignal): Promise<DemoOptions> => (await api.get(`${root}/options`, { signal })).data,
  create: async (body: DemoMutationInput, signal: AbortSignal): Promise<DemoRecord> => (await api.post(root, body, { signal })).data,
  update: async (id: string, body: DemoMutationInput, signal: AbortSignal): Promise<DemoRecord> => (await api.patch(`${root}/${id}`, body, { signal })).data,
  remove: async (id: string, signal: AbortSignal): Promise<void> => { await api.delete(`${root}/${id}`, { signal }); },
  conversionReport: async (params: { from?: string; to?: string }, signal: AbortSignal): Promise<DemoConversionReport> => (await api.get(`${root}/conversion-report`, { params, signal })).data,
};

export function exportDemosCsv(items: DemoItem[], filename: string) {
  const rows = [['Demo ID', 'Business', 'Contact', 'Type', 'Executive', 'Date', 'Time', 'Status', 'Outcome'], ...items.map((demo) => [demo.demoId, demo.businessName, demo.contactPerson, demo.demoType, demo.assignedToName, demo.demoDate, demo.demoTime, demo.status, demo.outcome || ''])];
  downloadCsv(rows, filename);
}

export function exportDemoConversionCsv(report: DemoConversionReport, filename: string) {
  const rows: Array<Array<string | number>> = [
    ['Metric', 'Value'],
    ['Total demos', report.summary.total],
    ['Completed', report.summary.completed],
    ['Interested', report.summary.interested],
    ['Proposals', report.summary.proposals],
    ['Converted', report.summary.converted],
    ['Conversion rate', `${report.summary.conversionRate}%`],
    ['Value converted', report.summary.valueConverted],
    ['Average days to close', report.summary.averageDaysToClose],
    [],
    ['Executive', 'Demos', 'Converted', 'Conversion rate', 'Revenue'],
    ...report.leaderboard.map((row) => [row.name, row.demos, row.converted, `${row.conversionRate}%`, row.revenue]),
    [],
    ['Source', 'Demos', 'Converted', 'Conversion rate'],
    ...report.sources.map((row) => [row.source, row.demos, row.converted, `${row.conversionRate}%`]),
  ];
  downloadCsv(rows, filename);
}

function downloadCsv(rows: Array<Array<string | number>>, filename: string) {
  const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
