import { Prisma } from "@prisma/client";
import { ownerSelect } from "./crm-select";

export const opportunitySelect = {
  id: true,
  tenantId: true,
  dealCode: true,
  title: true,
  amount: true,
  stageValueId: true,
  stage: true,
  priority: true,
  sourceValueId: true,
  leadId: true,
  accountId: true,
  contactId: true,
  assignedMembershipId: true,
  ownerMembershipId: true,
  expectedClosingDate: true,
  closedAt: true,
  lostReason: true,
  description: true,
  revision: true,
  createdAt: true,
  updatedAt: true,
  ownerMembership: { select: ownerSelect },
  assignedMembership: { select: ownerSelect },
  account: {
    select: {
      id: true,
      name: true,
      categoryLabel: true,
      addressLine1: true,
      city: true,
    },
  },
  contact: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  lead: {
    select: {
      id: true,
      leadCode: true,
      name: true,
      businessName: true,
      contactName: true,
      phone: true,
      email: true,
    },
  },
  stageValue: {
    select: {
      id: true,
      code: true,
      name: true,
      displayColor: true,
      sortOrder: true,
    },
  },
} satisfies Prisma.OpportunitySelect;

export type OpportunityRow = Prisma.OpportunityGetPayload<{ select: typeof opportunitySelect }>;
