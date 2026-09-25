import { z } from "zod";
import { crmId } from "./crm-contract";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const time = z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$|^(?:0?[1-9]|1[0-2]):[0-5]\d\s?(?:AM|PM)$/i);
const optionalText = (max: number) =>
  z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(max).optional(),
  );

export const demoStatuses = [
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "RESCHEDULED",
  "NO_SHOW",
  "CANCELLED",
] as const;

export const demoOutcomes = [
  "PENDING",
  "INTERESTED",
  "FOLLOW_UP",
  "PROPOSAL",
  "TRIAL",
  "CONVERTED",
  "NOT_INTERESTED",
  "RESCHEDULED",
  "NO_SHOW",
  "DEMO_DONE",
  "QUOTATION_SENT",
] as const;

export const demoListQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  view: z.enum(["all", "today", "scheduled", "completed"]).default("all"),
  search: optionalText(200),
  status: z.enum(demoStatuses).optional(),
  demoType: optionalText(100),
  executiveMembershipId: crmId.optional(),
  from: date.optional(),
  to: date.optional(),
}).strict().refine((value) => !value.from || !value.to || value.from <= value.to, {
  message: "Start date must be on or before end date.",
});

export const demoReportQuery = z.object({
  from: date.optional(),
  to: date.optional(),
}).strict().refine((value) => !value.from || !value.to || value.from <= value.to, {
  message: "Start date must be on or before end date.",
});

export const createDemo = z.object({
  leadId: crmId,
  demoTitle: z.string().trim().min(1).max(300),
  demoDate: date,
  demoTime: time,
  demoType: z.enum(["Product Demo", "Live Demo", "Online Demo", "POC / Pilot"]),
  demoMode: z.string().trim().min(1).max(100).default("In-Person"),
  productService: optionalText(300),
  attendeesCount: z.coerce.number().int().min(1).max(500).default(1),
  keyQuestions: optionalText(2000),
  conductedByMembershipId: crmId.optional(),
}).strict();

export const updateDemo = z.object({
  demoTitle: z.string().trim().min(1).max(300).optional(),
  demoDate: date.optional(),
  demoTime: time.optional(),
  demoType: z.enum(["Product Demo", "Live Demo", "Online Demo", "POC / Pilot"]).optional(),
  demoMode: z.string().trim().min(1).max(100).optional(),
  productService: optionalText(300),
  attendeesCount: z.coerce.number().int().min(1).max(500).optional(),
  feedbackRating: z.coerce.number().min(0).max(5).optional(),
  keyQuestions: optionalText(2000),
  conductedByMembershipId: crmId.optional(),
  status: z.enum(demoStatuses).optional(),
  outcome: z.enum(demoOutcomes).optional(),
  nextAction: optionalText(200),
  nextActionDate: date.optional(),
  durationMinutes: z.coerce.number().int().min(0).max(1440).optional(),
  probabilityPercentage: z.coerce.number().int().min(0).max(100).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one demo change.");

export type CreateDemoInput = z.infer<typeof createDemo>;
export type UpdateDemoInput = z.infer<typeof updateDemo>;
