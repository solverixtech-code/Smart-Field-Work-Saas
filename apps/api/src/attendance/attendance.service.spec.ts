import {
  AttendanceLocationKind,
  AttendanceStatus,
  PunchType,
} from "@prisma/client";
import { MediaService } from "../media/media.service";
import { PrismaService } from "../persistence/prisma.service";
import { AttendanceRepository } from "../repositories/attendance.repository";
import { AttendanceService } from "./attendance.service";

describe("AttendanceService monitoring", () => {
  const prisma = {
    tenantSettings: { findUnique: jest.fn() },
    tenantMembership: { findFirst: jest.fn() },
    punchLog: { findMany: jest.fn(), count: jest.fn() },
    attendance: { findMany: jest.fn() },
  };
  const service = new AttendanceService(
    {} as AttendanceRepository,
    prisma as unknown as PrismaService,
    {} as MediaService,
  );
  const scope = {
    tenantId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    membershipId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    userId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    dataScope: "ASSIGNED_TEAM",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.tenantSettings.findUnique.mockResolvedValue({
      timezone: "Asia/Kolkata",
    });
    prisma.tenantMembership.findFirst.mockResolvedValue({ teamId: "team-1" });
    prisma.punchLog.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prisma.attendance.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prisma.punchLog.count.mockResolvedValue(0);
  });

  it("returns a stable zero summary and scopes managers to their team", async () => {
    const result = await service.monitoring(scope, {
      startDate: "2026-09-28",
      endDate: "2026-09-28",
      limit: 50,
    });

    expect(result.summary).toEqual({
      onFieldPunched: 0,
      officeCheckedIn: 0,
      lateArrivals: 0,
      absences: 0,
      totalPunches: 0,
      onTimePercent: 0,
      onTimeChangePercent: 0,
    });
    expect(prisma.punchLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantMembership: { teamId: "team-1" },
        }),
      }),
    );
  });

  it("derives KPI values from persisted classifications and attendance status", async () => {
    prisma.punchLog.findMany
      .mockReset()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { locationKind: AttendanceLocationKind.FIELD_REMOTE },
        { locationKind: AttendanceLocationKind.ASSIGNED_VISIT },
        { locationKind: AttendanceLocationKind.OFFICE },
      ]);
    prisma.attendance.findMany
      .mockReset()
      .mockResolvedValueOnce([
        {
          id: "1",
          status: AttendanceStatus.LATE,
          punchInTime: new Date(),
          lateMinutes: 12,
        },
        {
          id: "2",
          status: AttendanceStatus.ABSENT,
          punchInTime: null,
          lateMinutes: 0,
        },
      ])
      .mockResolvedValueOnce([]);
    prisma.punchLog.count.mockResolvedValue(3);

    const result = await service.monitoring(
      { ...scope, dataScope: "ALL" },
      {
        startDate: "2026-09-28",
        endDate: "2026-09-28",
        limit: 50,
      },
    );

    expect(result.summary).toMatchObject({
      onFieldPunched: 2,
      officeCheckedIn: 1,
      lateArrivals: 1,
      absences: 1,
      totalPunches: 3,
    });
    expect(PunchType.PUNCH_IN).toBe("PUNCH_IN");
  });
});
