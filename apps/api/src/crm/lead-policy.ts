import { ForbiddenException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CrmPolicy } from "./crm-policy";

export function requireLead(p: CrmPolicy, action: string) {
  p.require(`crm.leads.${action}`);
  if (
    !["own", "assigned", "tenant"].some((scope) =>
      p.has(`crm.leads.access.${scope}`),
    )
  )
    throw new ForbiddenException("CRM_SCOPE_REQUIRED");
}
export function leadScope(p: CrmPolicy): Prisma.LeadWhereInput {
  const or: Prisma.LeadWhereInput[] = [];
  if (p.has("crm.leads.access.own"))
    or.push({ ownerMembershipId: p.scope.membershipId });
  if (p.has("crm.leads.access.assigned"))
    or.push({ assignedMembershipId: p.scope.membershipId });
  if (!p.has("crm.leads.access.tenant") && !or.length)
    throw new ForbiddenException("CRM_SCOPE_REQUIRED");
  return {
    tenantId: p.scope.tenantId,
    deletedAt: null,
    ...(p.has("crm.leads.access.tenant") ? {} : { OR: or }),
  };
}
