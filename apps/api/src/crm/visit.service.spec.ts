import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmPolicy } from "./crm-policy";
import { CrmRepository } from "./crm.repository";
import { VisitService } from "./visit.service";

const actor: RequestPrincipal = {
  userId: randomUUID(),
  sessionId: randomUUID(),
  tenantId: randomUUID(),
  membershipId: randomUUID(),
  tenantRoleCode: "field_executive",
  tenantPermissions: ["crm.visits.view"],
  platformPermissions: [],
  platformRoleCodes: [],
  permissions: [],
  dataScope: "ASSIGNED",
  contextVersion: 1,
  permissionVersion: { tenant: null, platform: null },
  isPlatformOnly: false,
};

function setup() {
  const findMany = jest.fn().mockResolvedValue([]);
  const findFirst = jest.fn().mockResolvedValue(null);
  const tx = {
    tenantSettings: {
      findUnique: jest.fn().mockResolvedValue({ timezone: "Asia/Kolkata" }),
    },
    leadVisit: {
      count: jest.fn().mockResolvedValue(0),
      findMany,
      findFirst,
    },
  } as unknown as Prisma.TransactionClient;
  const repo = {
    run: jest.fn(
      (
        principal: RequestPrincipal,
        _write: boolean,
        work: (
          transaction: Prisma.TransactionClient,
          policy: CrmPolicy,
        ) => Promise<unknown>,
      ) => work(tx, new CrmPolicy(principal)),
    ),
  } as unknown as CrmRepository;
  return { findMany, findFirst, service: new VisitService(repo) };
}

describe("VisitService field executive scope", () => {
  it("forces list queries to the current membership", async () => {
    const { findMany, service } = setup();
    await service.list(actor, {
      view: "all",
      executiveMembershipId: randomUUID(),
    });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: actor.tenantId,
          executiveMembershipId: actor.membershipId,
        }),
      }),
    );
  });

  it("returns no detail for a visit outside the current membership", async () => {
    const { findFirst, service } = setup();
    await expect(service.get(actor, randomUUID())).rejects.toMatchObject({
      status: 404,
    });

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: actor.tenantId,
          executiveMembershipId: actor.membershipId,
        }),
      }),
    );
  });
});
