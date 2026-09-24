import { z } from "zod";
import {
  accountFields,
  contactFields,
  createAccount,
  createLinkedContact,
  crmId,
  revisionCommand,
} from "./crm-contract";
import { masterPage } from "../platform/masters/master-contract";

export const leadStatus = z.enum([
  "OPEN",
  "QUALIFIED",
  "CONVERTED",
  "DISQUALIFIED",
  "DUPLICATE",
]);
export const leadPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const leadFields = accountFields
  .pick({
    name: true,
    website: true,
    addressLine1: true,
    addressLine2: true,
    city: true,
    state: true,
    postalCode: true,
    countryCode: true,
    description: true,
    sourceValueId: true,
  })
  .extend({
    kind: z.enum(["BUSINESS", "INDIVIDUAL"]).optional(),
    businessName: z.string().trim().min(1).max(200).nullable().optional(),
    contactName: z.string().trim().max(200).nullable().optional(),
    phone: contactFields.shape.phone,
    email: contactFields.shape.email,
    priority: leadPriority.optional(),
    accountId: crmId.nullable().optional(),
    contactId: crmId.nullable().optional(),
    estimatedValue: z.coerce.number().min(0).max(999999999999.99).nullable().optional(),
    expectedClosingDate: z.coerce.date().nullable().optional(),
    nextFollowUpAt: z.coerce.date().nullable().optional(),
    nextActionNote: z.string().trim().max(1000).nullable().optional(),
    requirementNote: z.string().trim().max(5000).nullable().optional(),
    disqualificationReason: z.enum(["LOST", "NOT_INTERESTED"]).nullable().optional(),
  })
  .strict();
export const createLead = leadFields
  .extend({
    ownerMembershipId: crmId.optional(),
    assignedMembershipId: crmId.nullable().optional(),
  })
  .strict()
  .refine((v) => Boolean(v.phone || v.email), "Provide phone or email")
  .refine(
    (v) => (v.kind ?? "BUSINESS") !== "INDIVIDUAL" || Boolean(v.contactName),
    "Individual leads require contactName",
  );
export const updateLead = leadFields
  .partial()
  .extend({ status: leadStatus.exclude(["CONVERTED"]).optional() })
  .merge(revisionCommand)
  .strict()
  .refine(
    (v) => Object.keys(v).length > 1,
    "Provide at least one changed field",
  );
export const assignLead = revisionCommand
  .extend({
    ownerMembershipId: crmId.optional(),
    assignedMembershipId: crmId.nullable().optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 1, "Provide an owner or assignee");
export const leadFilters = z
  .object({
    status: leadStatus.optional(),
    priority: leadPriority.optional(),
    sourceValueId: crmId.optional(),
    ownerMembershipId: crmId.optional(),
    assignedMembershipId: crmId.optional(),
    accountId: crmId.optional(),
    hot: z.literal("true").optional(),
    followUp: z.enum(["pending"]).optional(),
    disqualificationReason: z.enum(["LOST", "NOT_INTERESTED"]).optional(),
    unassigned: z.enum(["true", "false"]).optional(),
  })
  .strict();
export const leadQuery = masterPage
  .merge(leadFilters)
  .extend({
    sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
  })
  .strict()
  .refine(
    (v) => (v.page - 1) * v.limit <= 100000,
    "Pagination offset exceeds 100000",
  );
export const conversionCommand = revisionCommand
  .extend({
    idempotencyKey: z.string().trim().min(1).max(100),
    account: z
      .discriminatedUnion("mode", [
        z.object({ mode: z.literal("link"), id: crmId }).strict(),
        z.object({ mode: z.literal("create"), data: createAccount }).strict(),
      ])
      .optional(),
    contact: z
      .discriminatedUnion("mode", [
        z.object({ mode: z.literal("link"), id: crmId }).strict(),
        z
          .object({ mode: z.literal("create"), data: createLinkedContact })
          .strict(),
      ])
      .optional(),
    deal: z
      .object({
        title: z.string().trim().min(1).max(200).optional(),
        amount: z.coerce.number().min(0).optional(),
      })
      .optional(),
  })
  .strict()
  .refine(
    (v) => Boolean(v.account || v.contact),
    "Choose an account or contact",
  )
  .refine(
    (v) => v.account?.mode !== "create" || !v.account.data.primaryContact,
    "Use the conversion contact choice",
  );
export type LeadInput = z.infer<typeof leadFields>;
export type LeadQuery = z.infer<typeof leadQuery>;
export type ConversionCommand = z.infer<typeof conversionCommand>;

export const bulkAssignLead = z
  .object({
    leadIds: z.array(crmId).min(1).max(100),
    assignedMembershipId: crmId.nullable(),
    reason: z.string().trim().min(1).max(500).optional(),
  })
  .strict();

export const csvDuplicatePolicy = z.enum(["SKIP", "REJECT"]);
export const importPreview = z
  .object({
    csv: z.string().min(1).max(1024 * 1024),
    duplicatePolicy: csvDuplicatePolicy.default("SKIP"),
    defaultSourceValueId: crmId.nullable().optional(),
  })
  .strict();
export const importLeads = importPreview.extend({
  confirmed: z.literal(true),
});

export const exportQuery = masterPage
  .merge(leadFilters)
  .extend({
    sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
    maxRows: z.coerce.number().int().min(1).max(1000).default(1000),
  })
  .strict()
  .refine(
    (v) => (v.page - 1) * v.limit <= 100000,
    "Pagination offset exceeds 100000",
  );

export const createLeadNote = z
  .object({ note: z.string().trim().min(1).max(2000) })
  .strict();

export const createLeadVisit = z
  .object({
    location: z.string().trim().min(1).max(500),
    latitude: z.coerce.number().optional(),
    longitude: z.coerce.number().optional(),
    purpose: z.string().trim().min(1).max(500),
    outcome: z.string().trim().max(2000).optional(),
    photos: z.array(z.string().url()).optional().default([]),
    durationMinutes: z.coerce.number().int().min(1).max(1440).default(30),
    status: z.enum(["COMPLETED", "SCHEDULED", "CANCELLED"]).default("COMPLETED"),
    checkInTime: z.coerce.date().optional(),
    checkOutTime: z.coerce.date().nullable().optional(),
  })
  .strict();

export const createLeadFollowUp = z
  .object({
    title: z.string().trim().min(1).max(300),
    type: z.string().trim().max(100).optional(),
    scheduledDate: z.string().trim().min(1).max(50),
    scheduledTime: z.string().trim().min(1).max(50),
    notes: z.string().trim().max(2000).optional(),
    assignedMembershipId: crmId.optional(),
  })
  .strict();

export const updateLeadFollowUp = z
  .object({
    status: z.enum(["Pending", "Completed", "Cancelled"]).optional(),
    title: z.string().trim().min(1).max(300).optional(),
    type: z.string().trim().max(100).optional(),
    scheduledDate: z.string().trim().min(1).max(50).optional(),
    scheduledTime: z.string().trim().min(1).max(50).optional(),
    assignedMembershipId: crmId.optional(),
    notes: z.string().trim().max(2000).optional(),
    replaceNotes: z.string().trim().max(2000).nullable().optional(),
    completionNote: z.string().trim().min(1).max(2000).optional(),
  })
  .strict().refine((value) => Object.keys(value).length > 0, 'Provide at least one follow-up change.');

export const createLeadDemo = z
  .object({
    demoTitle: z.string().trim().min(1).max(300),
    demoDate: z.string().trim().min(1).max(50),
    demoMode: z.string().trim().max(100).default("Virtual Google Meet"),
    attendeesCount: z.coerce.number().int().min(1).max(500).default(3),
    feedbackRating: z.coerce.number().min(1.0).max(5.0).default(5.0),
    keyQuestions: z.string().trim().max(2000).optional(),
    status: z.enum(["COMPLETED", "SCHEDULED"]).default("COMPLETED"),
    conductedByMembershipId: crmId.optional(),
  })
  .strict();

export const createLeadCommunication = z
  .object({
    channel: z.enum(["Call", "Email", "WhatsApp"]),
    direction: z.enum(["Inbound", "Outbound"]).default("Outbound"),
    subject: z.string().trim().min(1).max(300),
    details: z.string().trim().max(2000).optional(),
    timestamp: z.coerce.date().optional(),
  })
  .strict();

export type CreateLeadVisitInput = z.infer<typeof createLeadVisit>;
export type CreateLeadFollowUpInput = z.infer<typeof createLeadFollowUp>;
export type UpdateLeadFollowUpInput = z.infer<typeof updateLeadFollowUp>;
export type CreateLeadDemoInput = z.infer<typeof createLeadDemo>;
export type CreateLeadCommunicationInput = z.infer<typeof createLeadCommunication>;
