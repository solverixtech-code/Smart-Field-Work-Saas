import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { TenantScope } from '../common/tenancy/tenant-scope';
import { Attendance, PunchLog, AttendanceStatus, PunchType } from '@prisma/client';

export interface PunchInputDto {
  latitude: number;
  longitude: number;
  locationName?: string;
  photoUrl?: string;
  deviceId?: string;
  deviceModel?: string;
  remarks?: string;
}

export const SAFE_USER_SELECT = {
  id: true,
  fullName: true,
  employeeCode: true,
  email: true,
  avatarUrl: true,
};

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private validateCoordinates(lat: number, lng: number) {
    if (typeof lat !== 'number' || !Number.isFinite(lat) || lat < -90 || lat > 90) {
      throw new BadRequestException('Latitude must be a valid number between -90 and 90');
    }
    if (typeof lng !== 'number' || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      throw new BadRequestException('Longitude must be a valid number between -180 and 180');
    }
  }

  async punchIn(scope: TenantScope, dto: PunchInputDto): Promise<{ attendance: Attendance; punchLog: PunchLog }> {
    this.validateCoordinates(dto.latitude, dto.longitude);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayDate = new Date(todayStr);

    return this.prisma.$transaction(async (tx) => {
      let attendance = await tx.attendance.findFirst({
        where: {
          tenantId: scope.tenantId,
          tenantMembershipId: scope.membershipId,
          date: todayDate,
        },
      });

      if (attendance && attendance.punchInTime) {
        throw new BadRequestException('You have already Punched In for today');
      }

      // Check user's assigned shift to calculate late status & grace period
      const userShift = await tx.userShift.findFirst({
        where: {
          tenantId: scope.tenantId,
          tenantMembershipId: scope.membershipId,
        },
        include: { shift: true },
        orderBy: { startDate: 'desc' },
      });

      let isLate = false;
      let lateMinutes = 0;

      if (userShift?.shift) {
        const [startHour, startMin] = userShift.shift.startTime.split(':').map(Number);
        const shiftStartTime = new Date(todayDate);
        shiftStartTime.setHours(startHour, startMin, 0, 0);
        const graceTime = new Date(shiftStartTime.getTime() + userShift.shift.gracePeriodMinutes * 60000);

        if (now > graceTime) {
          isLate = true;
          lateMinutes = Math.floor((now.getTime() - shiftStartTime.getTime()) / 60000);
        }
      }

      const status: AttendanceStatus = isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

      if (!attendance) {
        attendance = await tx.attendance.create({
          data: {
            tenant: { connect: { id: scope.tenantId } },
            tenantMembership: { connect: { id: scope.membershipId } },
            user: { connect: { id: scope.userId } },
            date: todayDate,
            shift: userShift?.shiftId ? { connect: { id: userShift.shiftId } } : undefined,
            status,
            punchInTime: now,
            lateMinutes,
            remarks: dto.remarks ?? null,
          },
        });
      } else {
        attendance = await tx.attendance.update({
          where: { id: attendance.id },
          data: {
            punchInTime: now,
            status,
            lateMinutes,
            remarks: dto.remarks ?? attendance.remarks,
          },
        });
      }

      const punchLog = await tx.punchLog.create({
        data: {
          tenant: { connect: { id: scope.tenantId } },
          tenantMembership: { connect: { id: scope.membershipId } },
          user: { connect: { id: scope.userId } },
          attendance: { connect: { id: attendance.id } },
          type: PunchType.PUNCH_IN,
          timestamp: now,
          latitude: dto.latitude,
          longitude: dto.longitude,
          locationName: dto.locationName ?? null,
          photoUrl: dto.photoUrl ?? null,
          deviceId: dto.deviceId ?? null,
          deviceModel: dto.deviceModel ?? null,
        },
      });

      return { attendance, punchLog };
    });
  }

  async punchOut(scope: TenantScope, dto: PunchInputDto): Promise<{ attendance: Attendance; punchLog: PunchLog }> {
    this.validateCoordinates(dto.latitude, dto.longitude);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const todayDate = new Date(todayStr);

    return this.prisma.$transaction(async (tx) => {
      const attendance = await tx.attendance.findFirst({
        where: {
          tenantId: scope.tenantId,
          tenantMembershipId: scope.membershipId,
          date: todayDate,
        },
      });

      if (!attendance || !attendance.punchInTime) {
        throw new BadRequestException('You must Punch In first before Punching Out');
      }

      if (attendance.punchOutTime) {
        throw new BadRequestException('You have already Punched Out for today');
      }

      const workMs = now.getTime() - new Date(attendance.punchInTime).getTime();
      const totalWorkMinutes = Math.floor(workMs / 60000);
      const standardWorkMinutes = 8 * 60; // 8 hours
      const overtimeMinutes = Math.max(0, totalWorkMinutes - standardWorkMinutes);

      let updatedStatus = attendance.status;
      if (totalWorkMinutes < 4 * 60) {
        updatedStatus = AttendanceStatus.HALF_DAY;
      }

      const updatedAttendance = await tx.attendance.update({
        where: { id: attendance.id },
        data: {
          punchOutTime: now,
          totalWorkMinutes,
          overtimeMinutes,
          status: updatedStatus,
          remarks: dto.remarks ?? attendance.remarks,
        },
      });

      const punchLog = await tx.punchLog.create({
        data: {
          tenant: { connect: { id: scope.tenantId } },
          tenantMembership: { connect: { id: scope.membershipId } },
          user: { connect: { id: scope.userId } },
          attendance: { connect: { id: attendance.id } },
          type: PunchType.PUNCH_OUT,
          timestamp: now,
          latitude: dto.latitude,
          longitude: dto.longitude,
          locationName: dto.locationName ?? null,
          photoUrl: dto.photoUrl ?? null,
          deviceId: dto.deviceId ?? null,
          deviceModel: dto.deviceModel ?? null,
        },
      });

      return { attendance: updatedAttendance, punchLog };
    });
  }

  async getTodayAttendance(scope: TenantScope): Promise<Attendance[]> {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDate = new Date(todayStr);

    return this.prisma.attendance.findMany({
      where: {
        tenantId: scope.tenantId,
        date: todayDate,
      },
      include: {
        user: { select: SAFE_USER_SELECT },
        tenantMembership: true,
        punchLogs: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMonthlyAttendance(scope: TenantScope, month: number, year: number): Promise<Attendance[]> {
    if (isNaN(month) || month < 1 || month > 12) {
      throw new BadRequestException('Month must be an integer between 1 and 12');
    }
    if (isNaN(year) || year < 2000 || year > 2100) {
      throw new BadRequestException('Year must be a valid four-digit year');
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    return this.prisma.attendance.findMany({
      where: {
        tenantId: scope.tenantId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: { select: SAFE_USER_SELECT },
        tenantMembership: true,
        punchLogs: true,
      },
      orderBy: { date: 'asc' },
    });
  }
}
