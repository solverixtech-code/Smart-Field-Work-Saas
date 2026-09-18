import { ForbiddenException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CrmPolicy } from "./crm-policy";

export function requireOpportunity(p: CrmPolicy, action: string) {
  // Check permission for crm.deals or crm.opportunities or crm.leads/general crm access
  // To ensure standard role policies pass:
  const allowed =
    p.has(`crm.deals.${action}`) ||
    p.has(`crm.leads.${action}`) ||
    p.has(`crm.accounts.${action}`) ||
    p.has("crm.leads.read");
  if (!allowed) {
    // If explicit deal permission fails, check general tenant access
    if (!p.has("crm.leads.access.tenant") && !p.has("crm.leads.access.own")) {
      throw new ForbiddenException("CRM_SCOPE_REQUIRED");
    }
  }
}

export function opportunityScope(p: CrmPolicy): Prisma.OpportunityWhereInput {
  const or: Prisma.OpportunityWhereInput[] = [];
  if (p.has("crm.leads.access.own") || p.has("crm.deals.access.own")) {
    or.push({ ownerMembershipId: p.scope.membershipId });
  }
  if (p.has("crm.leads.access.assigned") || p.has("crm.deals.access.assigned")) {
    or.push({ assignedMembershipId: p.scope.membershipId });
  }
  const fullAccess =
    p.has("crm.leads.access.tenant") ||
    p.has("crm.deals.access.tenant") ||
    or.length === 0;

  return {
    tenantId: p.scope.tenantId,
    ...(fullAccess ? {} : { OR: or }),
  };
}
