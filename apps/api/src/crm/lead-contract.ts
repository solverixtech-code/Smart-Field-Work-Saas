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
    contactName: z.string().trim().max(200).nullable().optional(),
    phone: contactFields.shape.phone,
    email: contactFields.shape.email,
    priority: leadPriority.optional(),
    accountId: crmId.nullable().optional(),
    contactId: crmId.nullable().optional(),
  })
  .strict();
export const createLead = leadFields
  .extend({
    ownerMembershipId: crmId.optional(),
    assignedMembershipId: crmId.nullable().optional(),
  })
  .strict();
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
