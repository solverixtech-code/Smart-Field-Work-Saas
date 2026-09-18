import { randomUUID } from "crypto";
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
  });

  it("bounds territory query pagination", () => {
    expect(territoryQuery.parse({})).toMatchObject({ page: 1, limit: 25 });
    expect(territoryQuery.safeParse({ limit: 101 }).success).toBe(false);
  });
});
