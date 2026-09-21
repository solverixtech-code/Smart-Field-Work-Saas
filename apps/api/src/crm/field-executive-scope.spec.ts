import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmPolicy } from "./crm-policy";
import { leadScope, requireLead } from "./lead-policy";
import { opportunityScope, requireOpportunity } from "./opportunity-policy";
import { OpportunityService } from "./opportunity.service";
import { CrmRepository } from "./crm.repository";

const actor: RequestPrincipal = {
  userId: "user-a", sessionId: "session-a", platformRoleCodes: [], platformPermissions: [],
  tenantId: "tenant-a", membershipId: "member-a", tenantRoleCode: "field_executive",
  tenantPermissions: [
    "crm.leads.view", "crm.pipeline.view", "crm.leads.access.assigned", "crm.leads.access.own", "crm.leads.access.tenant",
  ],
  dataScope: "own", permissions: [], contextVersion: 1,
  permissionVersion: { platform: null, tenant: null }, isPlatformOnly: false,
};

describe("field executive CRM record scope", () => {
  it("shows only assigned leads even when broader grants are present", () => {
    const policy = new CrmPolicy(actor);
    requireLead(policy, "view");
    expect(leadScope(policy)).toEqual({
      tenantId: "tenant-a", deletedAt: null, assignedMembershipId: "member-a",
    });
  });

  it("shows only deals linked to assigned, undeleted leads", () => {
    const policy = new CrmPolicy(actor);
    requireOpportunity(policy, "read");
    expect(opportunityScope(policy)).toEqual({
      tenantId: "tenant-a",
      lead: { is: { tenantId: "tenant-a", deletedAt: null, assignedMembershipId: "member-a" } },
    });
  });

  it("requires the assigned scope grant for field executive data", () => {
    const policy = new CrmPolicy({ ...actor, tenantPermissions: ["crm.leads.view"] });
    expect(() => leadScope(policy)).toThrow(ForbiddenException);
    expect(() => opportunityScope(policy)).toThrow(ForbiddenException);
  });

  it("requires pipeline permission for reading and an operation grant for writes", () => {
    const policy = new CrmPolicy({ ...actor, tenantPermissions: ["crm.leads.access.assigned"] });
    expect(() => requireOpportunity(policy, "read")).toThrow(ForbiddenException);
    expect(() => requireOpportunity(policy, "update")).toThrow(ForbiddenException);
    expect(() => requireOpportunity(new CrmPolicy(actor), "read")).not.toThrow();
  });

  it("cannot create a deal without a lead assigned to the executive", async () => {
    const policy = new CrmPolicy({
      ...actor, tenantPermissions: [...actor.tenantPermissions, "crm.leads.create"],
    });
    const tx = { lead: { findFirst: jest.fn().mockResolvedValue(null) } };
    const repo = {
      run: (_principal: RequestPrincipal, _write: boolean,
        work: (transaction: Prisma.TransactionClient, authorization: CrmPolicy) => Promise<unknown>) =>
        work(tx as unknown as Prisma.TransactionClient, policy),
    };
    const service = new OpportunityService(repo as unknown as CrmRepository);
    const creator = { ...actor, tenantPermissions: [...actor.tenantPermissions, "crm.leads.create"] };
    await expect(service.create(creator, { title: "Unlinked deal" })).rejects.toThrow(ForbiddenException);
    await expect(service.create(creator, {
      title: "Another member's lead", leadId: "4a843e48-0e57-49ca-8fc8-ffda0e05f567",
    })).rejects.toThrow(NotFoundException);
    expect(tx.lead.findFirst).toHaveBeenCalledWith({
      where: { AND: [leadScope(policy), { id: "4a843e48-0e57-49ca-8fc8-ffda0e05f567" }] },
      select: { id: true },
    });
  });

  it("cannot detach or relink an assigned deal to another member's lead", async () => {
    const editor = { ...actor, tenantPermissions: [...actor.tenantPermissions, "crm.leads.update"] };
    const policy = new CrmPolicy(editor);
    const tx = {
      opportunity: { findFirst: jest.fn().mockResolvedValue({ revision: 1, leadId: "lead-a" }) },
      lead: { findFirst: jest.fn().mockResolvedValue(null) },
    };
    const repo = {
      run: (_principal: RequestPrincipal, _write: boolean,
        work: (transaction: Prisma.TransactionClient, authorization: CrmPolicy) => Promise<unknown>) =>
        work(tx as unknown as Prisma.TransactionClient, policy),
    };
    const service = new OpportunityService(repo as unknown as CrmRepository);
    const dealId = "e3bb0c7c-247a-4a70-abab-1ab688ba04f6";
    await expect(service.update(editor, dealId, { expectedRevision: 1, leadId: null }))
      .rejects.toThrow(ForbiddenException);
    await expect(service.update(editor, dealId, {
      expectedRevision: 1, leadId: "4a843e48-0e57-49ca-8fc8-ffda0e05f567",
    })).rejects.toThrow(NotFoundException);
  });
});
