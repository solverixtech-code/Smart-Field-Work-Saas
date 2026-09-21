import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { CrmPolicy } from "./crm-policy";
import { CrmRepository } from "./crm.repository";
import { FieldDashboardService } from "./field-dashboard.service";

const actor: RequestPrincipal = {
  userId: "user-a", sessionId: "session-a", platformRoleCodes: [], platformPermissions: [],
  tenantId: "tenant-a", membershipId: "member-a", tenantRoleCode: "field_executive",
  tenantPermissions: ["crm.dashboard.view", "crm.visits.checkin"], dataScope: "own",
  permissions: [], contextVersion: 1, permissionVersion: { platform: null, tenant: null }, isPlatformOnly: false,
};

function setup() {
  const tx = {
    tenantSettings: { findUnique: jest.fn().mockResolvedValue({ timezone: "Asia/Kolkata" }) },
    leadVisit: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(1),
      findFirst: jest.fn().mockResolvedValue(null),
      updateMany: jest.fn(),
    },
    leadFollowUp: { count: jest.fn().mockResolvedValue(4) },
    leadDemo: { count: jest.fn().mockResolvedValueOnce(3).mockResolvedValueOnce(2) },
    territoryMember: { findMany: jest.fn().mockResolvedValue([
      { territory: { name: "West", targets: [{ monthlyTarget: 200, monthlyAchieved: 80 }] } },
    ]) },
    attendance: { findFirst: jest.fn().mockResolvedValue(null) },
    userShift: { findFirst: jest.fn().mockResolvedValue(null) },
    punchLog: { findMany: jest.fn().mockResolvedValue([]) },
    tenantMembership: { findFirst: jest.fn().mockResolvedValue({ user: { fullName: "Vikram Singh", avatarUrl: null } }) },
  };
  const policy = {
    scope: { tenantId: "tenant-a", membershipId: "member-a" }, require: jest.fn(),
  };
  const repo = {
    run: jest.fn(async (_principal: RequestPrincipal, _write: boolean,
      work: (transaction: Prisma.TransactionClient, authorization: CrmPolicy) => Promise<unknown>) =>
      work(tx as unknown as Prisma.TransactionClient, policy as unknown as CrmPolicy)),
  };
  return { tx, policy, repo, service: new FieldDashboardService(repo as unknown as CrmRepository) };
}

describe("FieldDashboardService", () => {
  it("returns only the current membership's records inside the workspace date range", async () => {
    const { tx, policy, service } = setup();
    const data = await service.get(actor, { startDate: "2026-09-21", endDate: "2026-09-21" });
    expect(policy.require).toHaveBeenCalledWith("crm.dashboard.view");
    expect(tx.leadVisit.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        tenantId: "tenant-a", executiveMembershipId: "member-a",
        checkInTime: { gte: new Date("2026-09-20T18:30:00.000Z"), lt: new Date("2026-09-21T18:30:00.000Z") },
      }),
    }));
    expect(tx.leadFollowUp.count).toHaveBeenCalledWith({ where: expect.objectContaining({
      tenantId: "tenant-a", assignedMembershipId: "member-a", status: "Pending",
    }) });
    expect(tx.punchLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ tenantId: "tenant-a", tenantMembershipId: "member-a" }),
    }));
    expect(tx.attendance.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ date: new Date("2026-09-21T00:00:00.000Z") }),
    }));
    expect(data.summary).toEqual(expect.objectContaining({ visitCount: 2, followUpsDue: 4,
      target: { amount: 200, achieved: 80, percentage: 40 } }));
  });

  it("cannot check in to a visit outside the current membership", async () => {
    const { tx, service } = setup();
    await expect(service.checkIn(actor, "4a843e48-0e57-49ca-8fc8-ffda0e05f567")).rejects.toThrow(NotFoundException);
    expect(tx.leadVisit.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ tenantId: "tenant-a", executiveMembershipId: "member-a" }),
    }));
    expect(tx.leadVisit.updateMany).not.toHaveBeenCalled();
  });

  it("rejects ranges longer than 92 calendar days", async () => {
    const { tx, service } = setup();
    await expect(service.get(actor, { startDate: "2026-06-01", endDate: "2026-09-01" }))
      .rejects.toThrow(BadRequestException);
    expect(tx.leadVisit.findMany).not.toHaveBeenCalled();
  });
});
