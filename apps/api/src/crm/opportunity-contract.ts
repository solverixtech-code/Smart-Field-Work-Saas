import { z } from "zod";
import { crmId, revisionCommand } from "./crm-contract";
import { masterPage } from "../platform/masters/master-contract";

export const opportunityPriority = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const opportunityFields = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  amount: z.coerce.number().min(0).max(999999999999.99).optional().default(0),
  stage: z.string().trim().min(1).optional().default("new"),
  stageValueId: crmId.nullable().optional(),
  priority: opportunityPriority.optional().default("MEDIUM"),
  sourceValueId: crmId.nullable().optional(),
  leadId: crmId.nullable().optional(),
  accountId: crmId.nullable().optional(),
  contactId: crmId.nullable().optional(),
  assignedMembershipId: crmId.nullable().optional(),
  ownerMembershipId: crmId.optional(),
  expectedClosingDate: z.coerce.date().nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
});

export const createOpportunity = opportunityFields;

export const updateOpportunity = opportunityFields
  .partial()
  .merge(revisionCommand)
  .strict();

export const updateOpportunityStage = z.object({
  stage: z.string().trim().min(1),
  stageValueId: crmId.nullable().optional(),
  expectedRevision: z.coerce.number().int().min(1),
  lostReason: z.string().trim().max(1000).nullable().optional(),
});

export const opportunityFilters = z.object({
  stage: z.string().optional(),
  stageValueId: crmId.optional(),
  priority: opportunityPriority.optional(),
  assignedMembershipId: crmId.optional(),
  ownerMembershipId: crmId.optional(),
  leadId: crmId.optional(),
  accountId: crmId.optional(),
  contactId: crmId.optional(),
});

export const opportunityQuery = masterPage
  .merge(opportunityFilters)
  .extend({
    sortBy: z.enum(["title", "amount", "createdAt", "updatedAt"]).default("createdAt"),
    sortDirection: z.enum(["asc", "desc"]).default("desc"),
  });
