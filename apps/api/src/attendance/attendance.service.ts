import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  AttendanceDeviceStatus,
  AttendanceGeofenceResult,
  AttendanceLocationKind,
  AttendanceMobilityMode,
  AttendanceStatus,
  Prisma,
  PunchType,
} from "@prisma/client";
import { auditEvents } from "../audit/audit-event-writer";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { TenantScope } from "../common/tenancy/tenant-scope";
import { parseFollowUpSchedule } from "../crm/follow-up-schedule";
import { MediaService } from "../media/media.service";
import { PrismaService } from "../persistence/prisma.service";
import {
  AttendanceRepository,
  PunchInputDto,
} from "../repositories/attendance.repository";
import {
  attendancePolicyInput,
  attendanceSiteInput,
  holidayInput,
  installation,
  leaveInput,
  monitoringQuery,
  overrideInput,
  punchCommand,
} from "./attendance-contract";

const DEFAULT_TIMEZONE = "Asia/Kolkata";
const DEFAULT_POLICY = {
  enforcementEnabled: false,
  maximumAccuracyMeters: 100,
  maximumLocationAgeSeconds: 120,
  requirePunchInSelfie: true,
  requirePunchOutSelfie: true,
} as const;

type PunchKind = "PUNCH_IN" | "PUNCH_OUT";

function localDateKey(value: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function nextDateKey(value: string): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function previousDateKey(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function dateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function distanceMeters(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
): number {
  const radius = 6_371_000;
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const lat = radians(second.latitude - first.latitude);
  const lng = radians(second.longitude - first.longitude);
  const a =
    Math.sin(lat / 2) ** 2 +
    Math.cos(radians(first.latitude)) *
      Math.cos(radians(second.latitude)) *
      Math.sin(lng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function durationMinutes(startTime: string, endTime: string): number {
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  let duration = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (duration <= 0) duration += 24 * 60;
  return duration;
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
  ) {}

  async punchIn(scope: TenantScope, dto: PunchInputDto) {
    const result = await this.attendanceRepository.punchIn(scope, dto);
    return {
      message: "Punched In successfully",
      attendance: result.attendance,
      punchLog: result.punchLog,
    };
  }

  async punchOut(scope: TenantScope, dto: PunchInputDto) {
    const result = await this.attendanceRepository.punchOut(scope, dto);
    return {
      message: "Punched Out successfully",
      attendance: result.attendance,
      punchLog: result.punchLog,
    };
  }

  getTodayAttendanceAdmin(scope: TenantScope) {
    return this.attendanceRepository.getTodayAttendance(scope);
  }

  getMonthlyAttendanceAdmin(scope: TenantScope, month: number, year: number) {
    return this.attendanceRepository.getMonthlyAttendance(scope, month, year);
  }

  private async timezone(tenantId: string): Promise<string> {
    const settings = await this.prisma.tenantSettings.findUnique({
      where: { tenantId },
      select: { timezone: true },
    });
    return settings?.timezone ?? DEFAULT_TIMEZONE;
  }

  private assertPrincipal(principal: RequestPrincipal): {
    tenantId: string;
    membershipId: string;
  } {
    if (!principal.tenantId || !principal.membershipId) {
      throw new ForbiddenException("Active tenant membership required");
    }
    return {
      tenantId: principal.tenantId,
      membershipId: principal.membershipId,
    };
  }

  async enrollDevice(principal: RequestPrincipal, raw: unknown) {
    const { tenantId, membershipId } = this.assertPrincipal(principal);
    const input = installation.parse(raw);
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.tenantMembership.findFirst({
        where: {
          id: membershipId,
          tenantId,
          userId: principal.userId,
          status: "ACTIVE",
        },
        select: { id: true },
      });
      if (!member) throw new ForbiddenException("Active membership required");

      const existing = await tx.attendanceDevice.findUnique({
        where: {
          tenantId_membershipId_installationId: {
            tenantId,
            membershipId,
            installationId: input.installationId,
          },
        },
      });
      if (existing) {
        return tx.attendanceDevice.update({
          where: { id: existing.id },
          data: {
            label: input.label,
            platform: input.platform,
            userAgent: input.userAgent,
            lastSeenAt: new Date(),
          },
        });
      }

      const activeCount = await tx.attendanceDevice.count({
        where: {
          tenantId,
          membershipId,
          status: AttendanceDeviceStatus.ACTIVE,
        },
      });
      const status =
        activeCount === 0
          ? AttendanceDeviceStatus.ACTIVE
          : AttendanceDeviceStatus.PENDING;
      const created = await tx.attendanceDevice.create({
        data: {
          tenantId,
          membershipId,
          installationId: input.installationId,
          status,
          label: input.label,
          platform: input.platform,
          userAgent: input.userAgent,
          approvedAt:
            status === AttendanceDeviceStatus.ACTIVE ? new Date() : null,
        },
      });
      await auditEvents.write(tx, {
        action: "attendance.device.enrolled",
        scope: "TENANT",
        tenantId,
        actorUserId: principal.userId,
        tenantMembershipId: membershipId,
        entityType: "AttendanceDevice",
        entityId: created.id,
        metadata: { status },
      });
      return created;
    });
  }

  async selfContext(principal: RequestPrincipal, installationId?: string) {
    const { tenantId, membershipId } = this.assertPrincipal(principal);
    const timezone = await this.timezone(tenantId);
    const today = localDateKey(new Date(), timezone);
    const [member, policy, current, device, sites] = await Promise.all([
      this.prisma.tenantMembership.findFirst({
        where: {
          id: membershipId,
          tenantId,
          userId: principal.userId,
          status: "ACTIVE",
        },
        select: {
          id: true,
          employeeCode: true,
          designation: true,
          tenantRole: { select: { code: true, name: true } },
          attendanceOverride: { select: { mobilityMode: true } },
          userShifts: {
            where: {
              startDate: { lte: dateOnly(today) },
              OR: [{ endDate: null }, { endDate: { gte: dateOnly(today) } }],
            },
            orderBy: { startDate: "desc" },
            take: 1,
            include: { shift: true },
          },
        },
      }),
      this.prisma.attendancePolicy.findUnique({ where: { tenantId } }),
      this.prisma.attendance.findFirst({
        where: {
          tenantId,
          tenantMembershipId: membershipId,
          date: dateOnly(today),
        },
        select: {
          id: true,
          status: true,
          punchInTime: true,
          punchOutTime: true,
        },
      }),
      installationId
        ? this.prisma.attendanceDevice.findUnique({
            where: {
              tenantId_membershipId_installationId: {
                tenantId,
                membershipId,
                installationId,
              },
            },
          })
        : null,
      this.prisma.attendanceSite.findMany({
        where: { tenantId, isActive: true },
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          radiusMeters: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);
    if (!member) throw new ForbiddenException("Active membership required");
    const roleCode = member.tenantRole?.code.toLowerCase() ?? "";
    const mobilityMode =
      member.attendanceOverride?.mobilityMode !==
        AttendanceMobilityMode.INHERIT &&
      member.attendanceOverride?.mobilityMode
        ? member.attendanceOverride.mobilityMode
        : roleCode.includes("executive")
          ? AttendanceMobilityMode.FIELD_REMOTE
          : AttendanceMobilityMode.OFFICE_ONLY;
    return {
      timezone,
      localDate: today,
      attendance: current,
      effectiveShift: member.userShifts[0]?.shift ?? null,
      device,
      policy: policy ?? DEFAULT_POLICY,
      mobilityMode,
      sites,
      permittedAction: !current?.punchInTime
        ? "PUNCH_IN"
        : !current.punchOutTime
          ? "PUNCH_OUT"
          : "COMPLETED",
    };
  }

  async selfieIntent(principal: RequestPrincipal, raw: unknown) {
    const value = raw as Record<string, unknown>;
    const mimeType = typeof value?.mimeType === "string" ? value.mimeType : "";
    const bytes =
      typeof value?.expectedBytes === "number" ? value.expectedBytes : 0;
    if (!["image/jpeg", "image/png", "image/webp"].includes(mimeType)) {
      throw new BadRequestException(
        "Attendance selfies must be JPEG, PNG, or WebP",
      );
    }
    if (bytes <= 0 || bytes > 5 * 1024 * 1024) {
      throw new BadRequestException(
        "Attendance selfies must be no larger than 5 MB",
      );
    }
    return this.media.intent(principal, raw);
  }

  selfieComplete(principal: RequestPrincipal, id: string, raw: unknown) {
    return this.media.complete(principal, id, raw);
  }

  async mobilePunch(
    principal: RequestPrincipal,
    type: PunchKind,
    raw: unknown,
  ) {
    const { tenantId, membershipId } = this.assertPrincipal(principal);
    try {
      const input = punchCommand.parse(raw);
      const capturedAt = new Date(input.capturedAt);
      const now = new Date();
      if (capturedAt.getTime() > now.getTime() + 5 * 60_000) {
        throw new BadRequestException("Location capture time is in the future");
      }

      const timezone = await this.timezone(tenantId);
      const localDate = localDateKey(capturedAt, timezone);
      const date = dateOnly(localDate);

      return await this.prisma.$transaction(async (tx) => {
        const duplicate = await tx.punchLog.findFirst({
          where: {
            tenantId,
            tenantMembershipId: membershipId,
            clientCommandId: input.clientCommandId,
          },
          include: { attendance: true },
        });
        if (duplicate) {
          return {
            message:
              duplicate.type === PunchType.PUNCH_IN
                ? "Punched In successfully"
                : "Punched Out successfully",
            attendance: duplicate.attendance,
            punchLog: duplicate,
            duplicate: true,
          };
        }

        const [
          member,
          policyRow,
          device,
          asset,
          sites,
          userShift,
          leave,
          holiday,
        ] = await Promise.all([
          tx.tenantMembership.findFirst({
            where: {
              id: membershipId,
              tenantId,
              userId: principal.userId,
              status: "ACTIVE",
            },
            select: {
              id: true,
              tenantRole: { select: { code: true } },
              attendanceOverride: { select: { mobilityMode: true } },
            },
          }),
          tx.attendancePolicy.findUnique({ where: { tenantId } }),
          tx.attendanceDevice.findUnique({
            where: {
              tenantId_membershipId_installationId: {
                tenantId,
                membershipId,
                installationId: input.installationId,
              },
            },
          }),
          tx.mediaAsset.findFirst({
            where: {
              id: input.selfieAssetId,
              tenantId,
              creatorMembershipId: membershipId,
              status: "READY",
              completedAt: { gte: new Date(now.getTime() - 10 * 60_000) },
              mimeType: { in: ["image/jpeg", "image/png", "image/webp"] },
              expectedBytes: { lte: 5 * 1024 * 1024 },
            },
            select: { id: true },
          }),
          tx.attendanceSite.findMany({ where: { tenantId, isActive: true } }),
          tx.userShift.findFirst({
            where: {
              tenantId,
              tenantMembershipId: membershipId,
              startDate: { lte: date },
              OR: [{ endDate: null }, { endDate: { gte: date } }],
            },
            orderBy: { startDate: "desc" },
            include: { shift: true },
          }),
          tx.attendanceLeave.findFirst({
            where: {
              tenantId,
              membershipId,
              status: "APPROVED",
              startDate: { lte: date },
              endDate: { gte: date },
            },
          }),
          tx.attendanceHoliday.findUnique({
            where: { tenantId_date: { tenantId, date } },
          }),
        ]);
        if (!member) throw new ForbiddenException("Active membership required");
        if (!device || device.status !== AttendanceDeviceStatus.ACTIVE) {
          throw new ForbiddenException(
            device?.status === AttendanceDeviceStatus.PENDING
              ? "This browser installation is awaiting administrator approval"
              : "An active enrolled browser installation is required",
          );
        }
        if (!asset)
          throw new BadRequestException(
            "A fresh, ready selfie owned by this employee is required",
          );

        const policy = policyRow ?? DEFAULT_POLICY;
        if (input.accuracyMeters > policy.maximumAccuracyMeters) {
          throw new BadRequestException(
            `GPS accuracy must be within ${policy.maximumAccuracyMeters} metres`,
          );
        }
        const ageSeconds =
          Math.abs(now.getTime() - capturedAt.getTime()) / 1000;
        if (ageSeconds > policy.maximumLocationAgeSeconds) {
          throw new BadRequestException(
            "Capture a current GPS position and try again",
          );
        }

        const point = { latitude: input.latitude, longitude: input.longitude };
        const siteDistances = sites
          .map((site) => ({ site, distance: distanceMeters(point, site) }))
          .sort((a, b) => a.distance - b.distance);
        const matchedSite = siteDistances.find(
          ({ site, distance }) => distance <= site.radiusMeters,
        );

        const dayStart = parseFollowUpSchedule(localDate, "12:00 AM", timezone);
        const dayEnd = parseFollowUpSchedule(
          nextDateKey(localDate),
          "12:00 AM",
          timezone,
        );
        const visits = await tx.leadVisit.findMany({
          where: {
            tenantId,
            executiveMembershipId: membershipId,
            status: {
              in: ["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"],
            },
            checkInTime: { gte: dayStart, lt: dayEnd },
            latitude: { not: null },
            longitude: { not: null },
          },
          select: {
            id: true,
            latitude: true,
            longitude: true,
            geofenceRadiusMeters: true,
            location: true,
          },
        });
        const visitDistances = visits
          .flatMap((visit) =>
            visit.latitude == null || visit.longitude == null
              ? []
              : [
                  {
                    visit,
                    distance: distanceMeters(point, {
                      latitude: visit.latitude,
                      longitude: visit.longitude,
                    }),
                  },
                ],
          )
          .sort((a, b) => a.distance - b.distance);
        const matchedVisit = visitDistances.find(
          ({ visit, distance }) => distance <= visit.geofenceRadiusMeters,
        );

        const overrideMode = member.attendanceOverride?.mobilityMode;
        const roleCode = member.tenantRole?.code.toLowerCase() ?? "";
        const mobilityMode =
          overrideMode && overrideMode !== AttendanceMobilityMode.INHERIT
            ? overrideMode
            : roleCode.includes("executive")
              ? AttendanceMobilityMode.FIELD_REMOTE
              : AttendanceMobilityMode.OFFICE_ONLY;

        let locationKind: AttendanceLocationKind;
        let geofenceResult: AttendanceGeofenceResult;
        let exceptionCode: string | null = null;
        if (matchedSite) {
          locationKind = AttendanceLocationKind.OFFICE;
          geofenceResult = AttendanceGeofenceResult.INSIDE;
        } else if (
          mobilityMode === AttendanceMobilityMode.FIELD_REMOTE &&
          matchedVisit
        ) {
          locationKind = AttendanceLocationKind.ASSIGNED_VISIT;
          geofenceResult = AttendanceGeofenceResult.INSIDE;
        } else if (mobilityMode === AttendanceMobilityMode.FIELD_REMOTE) {
          locationKind = AttendanceLocationKind.FIELD_REMOTE;
          geofenceResult = AttendanceGeofenceResult.OUTSIDE_ALLOWED;
        } else if (type === "PUNCH_IN" && policy.enforcementEnabled) {
          const distance = siteDistances[0]?.distance;
          throw new ForbiddenException(
            distance == null
              ? "No active office site is configured for attendance punching"
              : `Punch in is outside the nearest office by ${Math.round(distance)} metres`,
          );
        } else {
          locationKind = AttendanceLocationKind.FIELD_REMOTE;
          geofenceResult = AttendanceGeofenceResult.OUTSIDE_EXCEPTION;
          exceptionCode =
            type === "PUNCH_OUT" ? "OUTSIDE_GEOFENCE_PUNCH_OUT" : null;
        }

        let attendance = await tx.attendance.findFirst({
          where: { tenantId, tenantMembershipId: membershipId, date },
        });
        if (type === "PUNCH_IN" && attendance?.punchInTime) {
          throw new ConflictException(
            "You have already punched in for this attendance date",
          );
        }
        if (type === "PUNCH_OUT" && !attendance?.punchInTime) {
          throw new ConflictException("You must punch in before punching out");
        }
        if (type === "PUNCH_OUT" && attendance?.punchOutTime) {
          throw new ConflictException(
            "You have already punched out for this attendance date",
          );
        }

        let status: AttendanceStatus = AttendanceStatus.PRESENT;
        let lateMinutes = 0;
        if (type === "PUNCH_IN" && userShift?.shift) {
          const shiftStart = parseFollowUpSchedule(
            localDate,
            userShift.shift.startTime,
            timezone,
          );
          lateMinutes = Math.max(
            0,
            Math.floor((capturedAt.getTime() - shiftStart.getTime()) / 60_000),
          );
          if (lateMinutes > userShift.shift.gracePeriodMinutes)
            status = AttendanceStatus.LATE;
        }

        if (!attendance) {
          attendance = await tx.attendance.create({
            data: {
              tenantId,
              tenantMembershipId: membershipId,
              userId: principal.userId,
              date,
              shiftId: userShift?.shiftId,
              status,
              punchInTime: type === "PUNCH_IN" ? capturedAt : null,
              lateMinutes,
              remarks: input.remarks,
            },
          });
        } else if (type === "PUNCH_IN") {
          attendance = await tx.attendance.update({
            where: { id: attendance.id },
            data: {
              punchInTime: capturedAt,
              status,
              lateMinutes,
              shiftId: userShift?.shiftId,
              remarks: input.remarks,
            },
          });
        } else {
          const worked = Math.max(
            0,
            Math.floor(
              (capturedAt.getTime() - attendance.punchInTime!.getTime()) /
                60_000,
            ),
          );
          const scheduled = userShift?.shift
            ? durationMinutes(
                userShift.shift.startTime,
                userShift.shift.endTime,
              ) - userShift.shift.breakDurationMinutes
            : 8 * 60;
          const halfDay = userShift?.shift
            ? Math.round(userShift.shift.halfDayThresholdHours * 60)
            : Math.round(scheduled / 2);
          attendance = await tx.attendance.update({
            where: { id: attendance.id },
            data: {
              punchOutTime: capturedAt,
              totalWorkMinutes: worked,
              overtimeMinutes: Math.max(0, worked - scheduled),
              status:
                worked < halfDay
                  ? AttendanceStatus.HALF_DAY
                  : attendance.status,
              remarks: input.remarks ?? attendance.remarks,
            },
          });
        }

        const nearest = matchedSite
          ? {
              distance: matchedSite.distance,
              radius: matchedSite.site.radiusMeters,
            }
          : matchedVisit
            ? {
                distance: matchedVisit.distance,
                radius: matchedVisit.visit.geofenceRadiusMeters,
              }
            : siteDistances[0]
              ? {
                  distance: siteDistances[0].distance,
                  radius: siteDistances[0].site.radiusMeters,
                }
              : null;
        const punchLog = await tx.punchLog.create({
          data: {
            tenantId,
            tenantMembershipId: membershipId,
            userId: principal.userId,
            attendanceId: attendance.id,
            type:
              type === "PUNCH_IN" ? PunchType.PUNCH_IN : PunchType.PUNCH_OUT,
            timestamp: now,
            capturedAt,
            latitude: input.latitude,
            longitude: input.longitude,
            accuracyMeters: input.accuracyMeters,
            locationName:
              input.locationName ??
              matchedSite?.site.address ??
              matchedVisit?.visit.location,
            selfieAssetId: asset.id,
            installationId: input.installationId,
            attendanceDeviceId: device.id,
            deviceId: input.installationId,
            deviceModel: input.label ?? input.platform,
            locationKind,
            geofenceResult,
            attendanceSiteId: matchedSite?.site.id,
            visitId: matchedVisit?.visit.id,
            geofenceDistanceMeters: nearest?.distance,
            geofenceRadiusMeters: nearest?.radius,
            evidenceStatus: "CAPTURED",
            exceptionCode,
          },
        });

        if (exceptionCode) {
          await tx.attendanceException.create({
            data: {
              tenantId,
              membershipId,
              punchLogId: punchLog.id,
              type: "OUTSIDE_GEOFENCE_PUNCH_OUT",
              details: { distanceMeters: nearest?.distance ?? null },
            },
          });
        }
        if (leave || holiday) {
          await tx.attendanceException.create({
            data: {
              tenantId,
              membershipId,
              punchLogId: punchLog.id,
              type: "CALENDAR_CONFLICT",
              details: {
                leaveId: leave?.id ?? null,
                holidayId: holiday?.id ?? null,
              },
            },
          });
        }
        await tx.attendanceDevice.update({
          where: { id: device.id },
          data: { lastSeenAt: now },
        });
        await auditEvents.write(tx, {
          action:
            type === "PUNCH_IN"
              ? "attendance.punch.in"
              : "attendance.punch.out",
          scope: "TENANT",
          tenantId,
          actorUserId: principal.userId,
          tenantMembershipId: membershipId,
          entityType: "PunchLog",
          entityId: punchLog.id,
          metadata: { locationKind, geofenceResult, exceptionCode },
        });
        return {
          message:
            type === "PUNCH_IN"
              ? "Punched In successfully"
              : "Punched Out successfully",
          attendance,
          punchLog,
          duplicate: false,
        };
      });
    } catch (error) {
      await this.prisma.$transaction((tx) =>
        auditEvents.write(tx, {
          action: "attendance.punch.rejected",
          scope: "TENANT",
          tenantId,
          actorUserId: principal.userId,
          tenantMembershipId: membershipId,
          outcome: "DENIED",
          entityType: "PunchAttempt",
          metadata: {
            type,
            reason: error instanceof Error ? error.name : "UNKNOWN_ERROR",
          },
        }),
      );
      throw error;
    }
  }

  async monitoring(scope: TenantScope, raw: unknown) {
    const query = monitoringQuery.parse(raw);
    if (query.startDate > query.endDate)
      throw new BadRequestException("Start date must not be after end date");
    const timezone = await this.timezone(scope.tenantId);
    const start = parseFollowUpSchedule(query.startDate, "12:00 AM", timezone);
    const end = parseFollowUpSchedule(
      nextDateKey(query.endDate),
      "12:00 AM",
      timezone,
    );
    const days =
      Math.round(
        (dateOnly(query.endDate).getTime() -
          dateOnly(query.startDate).getTime()) /
          86_400_000,
      ) + 1;
    const previousStartKey = previousDateKey(query.startDate, days);
    const previousEndKey = previousDateKey(query.startDate, 1);
    const previousStart = parseFollowUpSchedule(
      previousStartKey,
      "12:00 AM",
      timezone,
    );
    const previousEnd = parseFollowUpSchedule(
      nextDateKey(previousEndKey),
      "12:00 AM",
      timezone,
    );

    const actor = await this.prisma.tenantMembership.findFirst({
      where: { id: scope.membershipId, tenantId: scope.tenantId },
      select: { teamId: true },
    });
    const memberScope: Prisma.TenantMembershipWhereInput =
      scope.dataScope === "ALL"
        ? {}
        : actor?.teamId
          ? { teamId: actor.teamId }
          : { id: scope.membershipId };
    const searchWhere: Prisma.PunchLogWhereInput = query.search
      ? {
          OR: [
            {
              user: {
                fullName: { contains: query.search, mode: "insensitive" },
              },
            },
            {
              tenantMembership: {
                employeeCode: { contains: query.search, mode: "insensitive" },
              },
            },
            { locationName: { contains: query.search, mode: "insensitive" } },
          ],
        }
      : {};
    const basePunchWhere: Prisma.PunchLogWhereInput = {
      tenantId: scope.tenantId,
      timestamp: { gte: start, lt: end },
      tenantMembership: memberScope,
      ...searchWhere,
    };
    const attendanceWhere: Prisma.AttendanceWhereInput = {
      tenantId: scope.tenantId,
      date: { gte: dateOnly(query.startDate), lte: dateOnly(query.endDate) },
      tenantMembership: memberScope,
    };
    const [rows, allPunchIns, attendances, previousAttendances, totalPunches] =
      await Promise.all([
        this.prisma.punchLog.findMany({
          where: basePunchWhere,
          take: query.limit + 1,
          ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
          orderBy: [{ timestamp: "desc" }, { id: "desc" }],
          include: {
            user: { select: { fullName: true, email: true, avatarUrl: true } },
            tenantMembership: { select: { employeeCode: true } },
            attendanceDevice: {
              select: {
                id: true,
                installationId: true,
                label: true,
                platform: true,
                status: true,
              },
            },
            attendanceSite: { select: { name: true } },
            exceptions: { select: { id: true, type: true, reviewedAt: true } },
            attendance: { select: { status: true, lateMinutes: true } },
          },
        }),
        this.prisma.punchLog.findMany({
          where: { ...basePunchWhere, type: PunchType.PUNCH_IN },
          select: { locationKind: true },
        }),
        this.prisma.attendance.findMany({
          where: attendanceWhere,
          select: {
            id: true,
            status: true,
            punchInTime: true,
            lateMinutes: true,
          },
        }),
        this.prisma.attendance.findMany({
          where: {
            tenantId: scope.tenantId,
            date: {
              gte: dateOnly(previousStartKey),
              lte: dateOnly(previousEndKey),
            },
            tenantMembership: memberScope,
          },
          select: { status: true, punchInTime: true, lateMinutes: true },
        }),
        this.prisma.punchLog.count({ where: basePunchWhere }),
      ]);
    const hasMore = rows.length > query.limit;
    const page = hasMore ? rows.slice(0, query.limit) : rows;
    const attended = attendances.filter((item) => item.punchInTime);
    const onTime = attended.filter((item) => item.lateMinutes === 0).length;
    const onTimePercent = attended.length
      ? (onTime / attended.length) * 100
      : 0;
    const previousAttended = previousAttendances.filter(
      (item) => item.punchInTime,
    );
    const previousOnTime = previousAttended.filter(
      (item) => item.lateMinutes === 0,
    ).length;
    const previousPercent = previousAttended.length
      ? (previousOnTime / previousAttended.length) * 100
      : 0;
    return {
      timezone,
      range: { startDate: query.startDate, endDate: query.endDate },
      summary: {
        onFieldPunched: allPunchIns.filter(
          (item) =>
            item.locationKind === AttendanceLocationKind.FIELD_REMOTE ||
            item.locationKind === AttendanceLocationKind.ASSIGNED_VISIT,
        ).length,
        officeCheckedIn: allPunchIns.filter(
          (item) => item.locationKind === AttendanceLocationKind.OFFICE,
        ).length,
        lateArrivals: attendances.filter(
          (item) =>
            item.status === AttendanceStatus.LATE || item.lateMinutes > 0,
        ).length,
        absences: attendances.filter(
          (item) => item.status === AttendanceStatus.ABSENT,
        ).length,
        totalPunches,
        onTimePercent: Number(onTimePercent.toFixed(1)),
        onTimeChangePercent: Number(
          (onTimePercent - previousPercent).toFixed(1),
        ),
      },
      records: page.map((row) => ({
        id: row.id,
        membershipId: row.tenantMembershipId,
        employeeName: row.user.fullName ?? row.user.email,
        employeeCode: row.tenantMembership?.employeeCode ?? "—",
        avatarUrl: row.user.avatarUrl,
        type: row.type,
        timestamp: row.timestamp,
        capturedAt: row.capturedAt,
        latitude: row.latitude,
        longitude: row.longitude,
        accuracyMeters: row.accuracyMeters,
        locationName: row.locationName,
        locationKind: row.locationKind,
        geofenceResult: row.geofenceResult,
        geofenceDistanceMeters: row.geofenceDistanceMeters,
        geofenceRadiusMeters: row.geofenceRadiusMeters,
        siteName: row.attendanceSite?.name ?? null,
        device: row.attendanceDevice,
        evidenceStatus: row.evidenceStatus,
        hasSelfie: Boolean(row.selfieAssetId),
        status: row.attendance?.status ?? null,
        lateMinutes: row.attendance?.lateMinutes ?? 0,
        exceptionCode: row.exceptionCode,
        exceptions: row.exceptions,
      })),
      nextCursor: hasMore ? (page[page.length - 1]?.id ?? null) : null,
    };
  }

  async selfiePreview(principal: RequestPrincipal, punchId: string) {
    const { tenantId } = this.assertPrincipal(principal);
    const punch = await this.prisma.punchLog.findFirst({
      where: { id: punchId, tenantId },
      select: { selfieAssetId: true },
    });
    if (!punch?.selfieAssetId)
      throw new NotFoundException("Punch selfie not found");
    const result = await this.media.download(principal, punch.selfieAssetId);
    await this.prisma.$transaction((tx) =>
      auditEvents.write(tx, {
        action: "attendance.selfie.previewed",
        scope: "TENANT",
        tenantId,
        actorUserId: principal.userId,
        tenantMembershipId: principal.membershipId,
        entityType: "PunchLog",
        entityId: punchId,
      }),
    );
    return result;
  }

  listSites(scope: TenantScope) {
    return this.prisma.attendanceSite.findMany({
      where: { tenantId: scope.tenantId },
      orderBy: [{ isActive: "desc" }, { name: "asc" }],
    });
  }

  getPolicy(scope: TenantScope) {
    return this.prisma.attendancePolicy.findUnique({
      where: { tenantId: scope.tenantId },
    });
  }

  createSite(scope: TenantScope, raw: unknown) {
    const input = attendanceSiteInput.parse(raw);
    return this.prisma.$transaction(async (tx) => {
      const site = await tx.attendanceSite.create({
        data: { tenantId: scope.tenantId, ...input },
      });
      await auditEvents.write(tx, {
        action: "attendance.site.created",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceSite",
        entityId: site.id,
      });
      return site;
    });
  }

  updateSite(scope: TenantScope, siteId: string, raw: unknown) {
    const input = attendanceSiteInput.parse(raw);
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.attendanceSite.findFirst({
        where: { id: siteId, tenantId: scope.tenantId },
      });
      if (!existing) throw new NotFoundException("Attendance site not found");
      const site = await tx.attendanceSite.update({
        where: { id: siteId },
        data: input,
      });
      await auditEvents.write(tx, {
        action: "attendance.site.changed",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceSite",
        entityId: site.id,
        beforeJson: existing,
        afterJson: input,
      });
      return site;
    });
  }

  async deleteSite(scope: TenantScope, siteId: string) {
    return this.prisma.$transaction(async (tx) => {
      const site = await tx.attendanceSite.findFirst({
        where: { id: siteId, tenantId: scope.tenantId },
      });
      if (!site) throw new NotFoundException("Attendance site not found");
      await tx.attendanceSite.delete({ where: { id: siteId } });
      await auditEvents.write(tx, {
        action: "attendance.site.deleted",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceSite",
        entityId: siteId,
        beforeJson: site,
      });
      return { id: siteId, deleted: true };
    });
  }

  updatePolicy(scope: TenantScope, raw: unknown) {
    const input = attendancePolicyInput.parse(raw);
    return this.prisma.$transaction(async (tx) => {
      const policy = await tx.attendancePolicy.upsert({
        where: { tenantId: scope.tenantId },
        create: { tenantId: scope.tenantId, ...input },
        update: input,
      });
      await auditEvents.write(tx, {
        action: "attendance.policy.changed",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendancePolicy",
        entityId: policy.id,
        afterJson: input,
      });
      return policy;
    });
  }

  setOverride(scope: TenantScope, membershipId: string, raw: unknown) {
    const input = overrideInput.parse(raw);
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.tenantMembership.findFirst({
        where: { id: membershipId, tenantId: scope.tenantId },
        select: { id: true },
      });
      if (!membership) throw new NotFoundException("Employee not found");
      const override = await tx.attendanceMembershipOverride.upsert({
        where: {
          tenantId_membershipId: { tenantId: scope.tenantId, membershipId },
        },
        create: { tenantId: scope.tenantId, membershipId, ...input },
        update: input,
      });
      await auditEvents.write(tx, {
        action: "attendance.override.changed",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceMembershipOverride",
        entityId: override.id,
        afterJson: input,
      });
      return override;
    });
  }

  listOverrides(scope: TenantScope) {
    return this.prisma.attendanceMembershipOverride.findMany({
      where: { tenantId: scope.tenantId },
      include: {
        membership: {
          select: {
            employeeCode: true,
            user: { select: { fullName: true, email: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  listAttendanceMemberships(scope: TenantScope) {
    return this.prisma.tenantMembership.findMany({
      where: { tenantId: scope.tenantId, status: "ACTIVE" },
      select: {
        id: true,
        employeeCode: true,
        designation: true,
        user: { select: { fullName: true, email: true, avatarUrl: true } },
        tenantRole: { select: { name: true, code: true } },
        attendanceOverride: { select: { mobilityMode: true } },
      },
      orderBy: [{ user: { fullName: "asc" } }, { employeeCode: "asc" }],
    });
  }

  async deleteOverride(scope: TenantScope, membershipId: string) {
    return this.prisma.$transaction(async (tx) => {
      const override = await tx.attendanceMembershipOverride.findUnique({
        where: {
          tenantId_membershipId: { tenantId: scope.tenantId, membershipId },
        },
      });
      if (!override)
        throw new NotFoundException("Attendance override not found");
      await tx.attendanceMembershipOverride.delete({
        where: { id: override.id },
      });
      await auditEvents.write(tx, {
        action: "attendance.override.deleted",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceMembershipOverride",
        entityId: override.id,
        beforeJson: override,
      });
      return { membershipId, deleted: true };
    });
  }

  createHoliday(scope: TenantScope, raw: unknown) {
    const input = holidayInput.parse(raw);
    return this.prisma.$transaction(async (tx) => {
      const holiday = await tx.attendanceHoliday.upsert({
        where: {
          tenantId_date: {
            tenantId: scope.tenantId,
            date: dateOnly(input.date),
          },
        },
        create: {
          tenantId: scope.tenantId,
          date: dateOnly(input.date),
          name: input.name,
        },
        update: { name: input.name },
      });
      await auditEvents.write(tx, {
        action: "attendance.holiday.changed",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceHoliday",
        entityId: holiday.id,
        afterJson: input,
      });
      return holiday;
    });
  }

  listHolidays(scope: TenantScope) {
    return this.prisma.attendanceHoliday.findMany({
      where: { tenantId: scope.tenantId },
      orderBy: { date: "desc" },
    });
  }

  async deleteHoliday(scope: TenantScope, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const holiday = await tx.attendanceHoliday.findFirst({
        where: { id, tenantId: scope.tenantId },
      });
      if (!holiday) throw new NotFoundException("Attendance holiday not found");
      await tx.attendanceHoliday.delete({ where: { id } });
      await auditEvents.write(tx, {
        action: "attendance.holiday.deleted",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceHoliday",
        entityId: id,
      });
      return { id, deleted: true };
    });
  }

  createLeave(scope: TenantScope, raw: unknown) {
    const input = leaveInput.parse(raw);
    if (input.startDate > input.endDate)
      throw new BadRequestException(
        "Leave start date must not be after end date",
      );
    return this.prisma.$transaction(async (tx) => {
      const membership = await tx.tenantMembership.findFirst({
        where: { id: input.membershipId, tenantId: scope.tenantId },
        select: { id: true },
      });
      if (!membership) throw new NotFoundException("Employee not found");
      const leave = await tx.attendanceLeave.create({
        data: {
          tenantId: scope.tenantId,
          membershipId: input.membershipId,
          leaveType: input.leaveType,
          startDate: dateOnly(input.startDate),
          endDate: dateOnly(input.endDate),
          remarks: input.remarks,
        },
      });
      await auditEvents.write(tx, {
        action: "attendance.leave.created",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceLeave",
        entityId: leave.id,
      });
      return leave;
    });
  }

  updateLeave(scope: TenantScope, leaveId: string, raw: unknown) {
    const input = leaveInput.parse(raw);
    if (input.startDate > input.endDate)
      throw new BadRequestException(
        "Leave start date must not be after end date",
      );
    return this.prisma.$transaction(async (tx) => {
      const [leave, membership] = await Promise.all([
        tx.attendanceLeave.findFirst({
          where: { id: leaveId, tenantId: scope.tenantId },
        }),
        tx.tenantMembership.findFirst({
          where: { id: input.membershipId, tenantId: scope.tenantId },
          select: { id: true },
        }),
      ]);
      if (!leave) throw new NotFoundException("Attendance leave not found");
      if (!membership) throw new NotFoundException("Employee not found");
      const updated = await tx.attendanceLeave.update({
        where: { id: leaveId },
        data: {
          membershipId: input.membershipId,
          leaveType: input.leaveType,
          startDate: dateOnly(input.startDate),
          endDate: dateOnly(input.endDate),
          remarks: input.remarks,
        },
      });
      await auditEvents.write(tx, {
        action: "attendance.leave.changed",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceLeave",
        entityId: leaveId,
        beforeJson: leave,
        afterJson: input,
      });
      return updated;
    });
  }

  async deleteLeave(scope: TenantScope, leaveId: string) {
    return this.prisma.$transaction(async (tx) => {
      const leave = await tx.attendanceLeave.findFirst({
        where: { id: leaveId, tenantId: scope.tenantId },
      });
      if (!leave) throw new NotFoundException("Attendance leave not found");
      await tx.attendanceLeave.delete({ where: { id: leaveId } });
      await auditEvents.write(tx, {
        action: "attendance.leave.deleted",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceLeave",
        entityId: leaveId,
        beforeJson: leave,
      });
      return { id: leaveId, deleted: true };
    });
  }

  listLeaves(scope: TenantScope) {
    return this.prisma.attendanceLeave.findMany({
      where: { tenantId: scope.tenantId },
      include: {
        membership: {
          select: {
            employeeCode: true,
            user: { select: { fullName: true, email: true } },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });
  }

  listDevices(scope: TenantScope) {
    return this.prisma.attendanceDevice.findMany({
      where: { tenantId: scope.tenantId },
      include: {
        membership: {
          select: {
            employeeCode: true,
            user: { select: { fullName: true, email: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  listExceptions(scope: TenantScope) {
    return this.prisma.attendanceException.findMany({
      where: { tenantId: scope.tenantId },
      include: {
        membership: {
          select: {
            employeeCode: true,
            user: { select: { fullName: true, email: true } },
          },
        },
        punchLog: true,
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  }

  async reviewException(scope: TenantScope, id: string) {
    return this.prisma.$transaction(async (tx) => {
      const exception = await tx.attendanceException.findFirst({
        where: { id, tenantId: scope.tenantId },
      });
      if (!exception)
        throw new NotFoundException("Attendance exception not found");
      const updated = await tx.attendanceException.update({
        where: { id },
        data: { reviewedAt: new Date() },
      });
      await auditEvents.write(tx, {
        action: "attendance.exception.reviewed",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceException",
        entityId: id,
      });
      return updated;
    });
  }

  async setDeviceStatus(scope: TenantScope, deviceId: string, raw: unknown) {
    const value = raw as Record<string, unknown>;
    const status = value.status;
    if (status !== "ACTIVE" && status !== "REVOKED") {
      throw new BadRequestException("Device status must be ACTIVE or REVOKED");
    }
    return this.prisma.$transaction(async (tx) => {
      const device = await tx.attendanceDevice.findFirst({
        where: { id: deviceId, tenantId: scope.tenantId },
      });
      if (!device) throw new NotFoundException("Attendance device not found");
      if (status === "ACTIVE") {
        await tx.attendanceDevice.updateMany({
          where: {
            tenantId: scope.tenantId,
            membershipId: device.membershipId,
            status: "ACTIVE",
            id: { not: device.id },
          },
          data: { status: "REVOKED", revokedAt: new Date() },
        });
      }
      const updated = await tx.attendanceDevice.update({
        where: { id: device.id },
        data:
          status === "ACTIVE"
            ? { status, approvedAt: new Date(), revokedAt: null }
            : { status, revokedAt: new Date() },
      });
      await auditEvents.write(tx, {
        action: "attendance.device.status.changed",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "AttendanceDevice",
        entityId: device.id,
        afterJson: { status },
      });
      return updated;
    });
  }
}
