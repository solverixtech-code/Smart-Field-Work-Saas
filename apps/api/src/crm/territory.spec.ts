import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { CrmPolicy } from "./crm-policy";
import { TerritoryRepository } from "./territory.repository";
import { TerritoryService } from "./territory.service";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import {
  createTerritory,
  updateTerritory,
  territoryQuery,
  assignTerritoryMember,
  assignTerritoryBusiness,
  territoryTargetSchema,
} from "./territory-contract";

describe("Territory strict contracts and validation authority", () => {
  it("validates valid territory creation input", () => {
    const input = {
      name: "Andheri East",
      code: "T001",
      city: "Mumbai",
      regionArea: "Mumbai - Andheri East",
      color: "#2563EB",
      status: "ACTIVE",
      monthlyTarget: 1400000,
      pathPoints: [
        [19.115, 72.852],
        [19.148, 72.855],
        [19.135, 72.853],
      ],
    };
    const parsed = createTerritory.parse(input);
    expect(parsed.name).toBe("Andheri East");
    expect(parsed.code).toBe("T001");
    expect(parsed.pathPoints).toHaveLength(3);
  });

  it("rejects missing name on territory creation", () => {
    expect(createTerritory.safeParse({ code: "T001" }).success).toBe(false);
  });

  it("rejects invalid latitude or longitude in boundary path", () => {
    expect(
      createTerritory.safeParse({
        name: "Invalid Coordinates",
        pathPoints: [[95.0, 72.0]], // lat > 90
      }).success,
    ).toBe(false);

    expect(
      createTerritory.safeParse({
        name: "Invalid Coordinates",
        pathPoints: [[19.0, 195.0]], // lng > 180
      }).success,
    ).toBe(false);
  });

  it("requires expectedRevision on territory update", () => {
    expect(
      updateTerritory.safeParse({
        name: "Updated Name",
      }).success,
    ).toBe(false);

    expect(
      updateTerritory.safeParse({
        expectedRevision: 1,
        name: "Updated Name",
      }).success,
    ).toBe(true);
  });

  it("validates member assignment payload", () => {
    const validId = randomUUID();
    expect(
      assignTerritoryMember.safeParse({
        membershipId: validId,
        role: "FIELD_EXECUTIVE",
      }).success,
    ).toBe(true);

    expect(
      assignTerritoryMember.safeParse({
        membershipId: "invalid-uuid",
      }).success,
    ).toBe(false);
  });

  it("validates business assignment payload", () => {
    const validId = randomUUID();
    expect(
      assignTerritoryBusiness.safeParse({
        accountId: validId,
      }).success,
    ).toBe(true);
  });

  it("validates target schema periods and positive numbers", () => {
    expect(
      territoryTargetSchema.safeParse({
        period: "2026-05",
        monthlyTarget: 1200000,
        monthlyAchieved: 800000,
      }).success,
    ).toBe(true);

    expect(
      territoryTargetSchema.safeParse({
        period: "2026-05",
        monthlyTarget: -500, // Negative target rejected
      }).success,
    ).toBe(false);

    expect(territoryTargetSchema.parse({
      period: "2026-09",
      monthlyTarget: 1000,
      activeBusinessTarget: 30,
      retentionTarget: 85,
    })).toMatchObject({ activeBusinessTarget: 30, retentionTarget: 85 });
    expect(territoryTargetSchema.safeParse({
      period: "2026-09", monthlyTarget: 1000, retentionTarget: 101,
    }).success).toBe(false);
  });

  it("accepts territory notes up to the existing form limit", () => {
    expect(createTerritory.parse({ name: "North", notes: "Saved note" }).notes).toBe("Saved note");
    expect(updateTerritory.safeParse({ expectedRevision: 1, notes: "x".repeat(301) }).success).toBe(false);
  });

  it("bounds territory query pagination", () => {
    expect(territoryQuery.parse({})).toMatchObject({ page: 1, limit: 25 });
    expect(territoryQuery.safeParse({ limit: 101 }).success).toBe(false);
  });
});

describe("Territory member options", () => {
  const actor: RequestPrincipal = {
    userId: randomUUID(),
    sessionId: randomUUID(),
    tenantId: randomUUID(),
    membershipId: randomUUID(),
    tenantRoleCode: "tenant_admin",
    tenantPermissions: ["crm.territories.view"],
    platformPermissions: [],
    platformRoleCodes: [],
    permissions: ["crm.territories.view"],
    dataScope: "TENANT",
    contextVersion: 1,
    permissionVersion: { tenant: null, platform: null },
    isPlatformOnly: false,
  };

  it("lists active tenant members without requiring business assignment permission", async () => {
    const membershipId = randomUUID();
    const count = jest.fn().mockResolvedValue(1);
    const findMany = jest.fn().mockResolvedValue([{
      id: membershipId,
      designation: "Field Executive",
      tenantRole: null,
      user: { fullName: "Actual Member", avatarUrl: null, role: "FIELD_EXECUTIVE" },
    }]);
    const tx = { tenantMembership: { count, findMany } } as unknown as Prisma.TransactionClient;
    const repo = {
      run: jest.fn(async (_principal: RequestPrincipal, _write: boolean, work: (transaction: Prisma.TransactionClient, policy: CrmPolicy) => Promise<unknown>) =>
        work(tx, new CrmPolicy(actor))),
    } as unknown as TerritoryRepository;
    const result = await new TerritoryService(repo).memberOptions(actor, { limit: 25, search: "Actual" });

    expect(count).toHaveBeenCalledWith({ where: {
      tenantId: actor.tenantId,
      status: "ACTIVE",
      user: { status: "ACTIVE", fullName: { contains: "Actual", mode: "insensitive" } },
    } });
    expect(result.items).toEqual([{
      id: membershipId, displayName: "Actual Member", avatarUrl: null, role: "Field Executive",
    }]);
  });

  it("rejects requests without territory view permission", async () => {
    const deniedActor = { ...actor, tenantPermissions: [], permissions: [] };
    const tx = { tenantMembership: { count: jest.fn(), findMany: jest.fn() } } as unknown as Prisma.TransactionClient;
    const repo = {
      run: jest.fn(async (_principal: RequestPrincipal, _write: boolean, work: (transaction: Prisma.TransactionClient, policy: CrmPolicy) => Promise<unknown>) =>
        work(tx, new CrmPolicy(deniedActor))),
    } as unknown as TerritoryRepository;

    await expect(new TerritoryService(repo).memberOptions(deniedActor, {})).rejects.toThrow("CRM_PERMISSION_DENIED");
    expect(tx.tenantMembership.count).not.toHaveBeenCalled();
  });
});
