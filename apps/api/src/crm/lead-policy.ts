import { ForbiddenException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { CrmPolicy } from "./crm-policy";

export function isFieldExecutive(p: CrmPolicy): boolean {
  return ["field_executive", "sales_executive", "executive"].includes(
    p.principal.tenantRoleCode?.toLowerCase() ?? "",
  );
}

export function requireLead(p: CrmPolicy, action: string) {
  p.require(`crm.leads.${action}`);
  if (
    !["own", "assigned", "tenant"].some((scope) =>
      p.has(`crm.leads.access.${scope}`),
    )
  )
    throw new ForbiddenException("CRM_SCOPE_REQUIRED");
}

export function requireFollowUpWrite(p: CrmPolicy) {
  requireLead(p, "view");
  if (!p.has("crm.followups.manage") && !p.has("crm.leads.update"))
    throw new ForbiddenException("CRM_PERMISSION_DENIED");
}

export function leadScope(p: CrmPolicy): Prisma.LeadWhereInput {
  if (isFieldExecutive(p)) {
    if (!p.has("crm.leads.access.assigned"))
      throw new ForbiddenException("CRM_SCOPE_REQUIRED");
    return {
      tenantId: p.scope.tenantId,
      deletedAt: null,
      assignedMembershipId: p.scope.membershipId,
    };
  }
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
