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
  tenantPermissions: ["crm.visits.view", "crm.visits.schedule"],
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
  const create = jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: randomUUID(), ...data }));
  const tx = {
    tenantSettings: {
      findUnique: jest.fn().mockResolvedValue({ timezone: "Asia/Kolkata" }),
    },
    leadVisit: {
      count: jest.fn().mockResolvedValue(0),
      findMany,
      findFirst,
      create,
    },
    tenantMembership: {
      findFirst: jest.fn().mockResolvedValue({
        id: actor.membershipId,
        designation: "Field Executive",
        tenantRole: { name: "Field Executive" },
        team: { name: "West Team" },
        user: { fullName: "Vikram Singh", avatarUrl: null },
      }),
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
    audit: jest.fn().mockResolvedValue(undefined),
  } as unknown as CrmRepository;
  return { create, findMany, findFirst, service: new VisitService(repo) };
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

  it("prevents a field executive from scheduling for another membership", async () => {
    const { service } = setup();
    await expect(service.create(actor, {
      targetType: "QUICK_ADDRESS",
      targetName: "New merchant",
      location: "Andheri East, Mumbai",
      geofenceRadiusMeters: 100,
      visitType: "Sales Visit",
      purpose: "Product discussion",
      scheduledDate: "2099-09-23",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      priority: "High",
      recurrence: "None",
      executiveMembershipId: randomUUID(),
      travelMode: "Bike",
      allowManualCheckIn: false,
      checklist: [],
    })).rejects.toMatchObject({ status: 403 });
  });

  it("does not let a field executive schedule an account they cannot view", async () => {
    const { service } = setup();
    await expect(service.create(actor, {
      targetType: "ACCOUNT",
      targetId: randomUUID(),
      targetName: "Restricted account",
      location: "Andheri East, Mumbai",
      geofenceRadiusMeters: 100,
      visitType: "Sales Visit",
      purpose: "Product discussion",
      scheduledDate: "2099-09-23",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      priority: "High",
      recurrence: "None",
      executiveMembershipId: actor.membershipId,
      travelMode: "Bike",
      allowManualCheckIn: false,
      checklist: [],
    })).rejects.toMatchObject({ status: 403 });
  });

  it("persists a quick-address visit for the current field executive", async () => {
    const { create, service } = setup();
    const result = await service.create(actor, {
      targetType: "QUICK_ADDRESS",
      targetName: "New merchant",
      contactName: "Rohan Sharma",
      location: "Andheri East, Mumbai",
      latitude: 19.1197,
      longitude: 72.8697,
      geofenceRadiusMeters: 100,
      visitType: "Sales Visit",
      purpose: "Product discussion",
      scheduledDate: "2099-09-23",
      startTime: "10:00 AM",
      endTime: "11:00 AM",
      priority: "High",
      recurrence: "None",
      executiveMembershipId: actor.membershipId,
      routeArea: "Andheri East Route",
      travelMode: "Bike",
      allowManualCheckIn: false,
      instructions: "Carry the product brochure",
      checklist: ["Confirm contact availability"],
    });

    expect(create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        tenantId: actor.tenantId,
        targetType: "QUICK_ADDRESS",
        targetName: "New merchant",
        executiveMembershipId: actor.membershipId,
        createdByMembershipId: actor.membershipId,
        status: "SCHEDULED",
        durationMinutes: 60,
      }),
    }));
    expect(result).toEqual(expect.objectContaining({ targetName: "New merchant" }));
  });
});
