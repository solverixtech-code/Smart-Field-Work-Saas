import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmPolicy } from "./crm-policy";
import { CrmRepository } from "./crm.repository";
import { FollowUpService } from "./follow-up.service";
import { requireFollowUpWrite } from "./lead-policy";

const actor: RequestPrincipal = {
  userId: randomUUID(),
  sessionId: randomUUID(),
  tenantId: randomUUID(),
  membershipId: randomUUID(),
  tenantRoleCode: "field_executive",
  tenantPermissions: [
    "crm.leads.view",
    "crm.leads.access.assigned",
    "crm.followups.view",
    "crm.followups.manage",
  ],
  platformPermissions: [],
  platformRoleCodes: [],
  permissions: [],
  dataScope: "ASSIGNED",
  contextVersion: 1,
  permissionVersion: { tenant: null, platform: null },
  isPlatformOnly: false,
};

describe("field executive follow-up access", () => {
  it("allows follow-up management without granting lead updates", () => {
    expect(() => requireFollowUpWrite(new CrmPolicy(actor))).not.toThrow();
    expect(() =>
      requireFollowUpWrite(
        new CrmPolicy({
          ...actor,
          tenantPermissions: actor.tenantPermissions.filter(
            (code) => code !== "crm.followups.manage",
          ),
        }),
      ),
    ).toThrow();
    expect(() =>
      requireFollowUpWrite(
        new CrmPolicy({
          ...actor,
          tenantPermissions: [
            "crm.leads.view",
            "crm.leads.access.assigned",
            "crm.leads.update",
          ],
        }),
      ),
    ).not.toThrow();
  });

  it("limits list and detail reads to the executive's own follow-ups on assigned leads", async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const findFirst = jest.fn().mockResolvedValue(null);
    const tx = {
      tenantSettings: { findUnique: jest.fn().mockResolvedValue({ timezone: "Asia/Kolkata" }) },
      leadFollowUp: {
        count: jest.fn().mockResolvedValue(0),
        findMany,
        findFirst,
      },
    } as unknown as Prisma.TransactionClient;
    const repo = {
      run: jest.fn((principal: RequestPrincipal, _write: boolean, work: (transaction: Prisma.TransactionClient, policy: CrmPolicy) => Promise<unknown>) =>
        work(tx, new CrmPolicy(principal))),
    } as unknown as CrmRepository;
    const service = new FollowUpService(repo);

    await service.list(actor, { view: "all" });
    expect(findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        tenantId: actor.tenantId,
        assignedMembershipId: actor.membershipId,
        lead: { is: expect.objectContaining({ assignedMembershipId: actor.membershipId }) },
      }),
    }));

    await expect(service.get(actor, randomUUID())).rejects.toMatchObject({ status: 404 });
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        assignedMembershipId: actor.membershipId,
        lead: { is: expect.objectContaining({ assignedMembershipId: actor.membershipId }) },
      }),
    }));
  });
});
