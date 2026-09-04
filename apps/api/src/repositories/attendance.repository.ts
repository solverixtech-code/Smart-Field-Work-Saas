import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

      if (!attendance) {
        attendance = await tx.attendance.create({
          data: {
            tenant: { connect: { id: scope.tenantId } },
            tenantMembership: { connect: { id: scope.membershipId } },
            user: { connect: { id: scope.userId } },
            date: todayDate,
            status: AttendanceStatus.PRESENT,
            punchInTime: now,
            remarks: dto.remarks ?? null,
          },
        });
      } else if (!attendance.punchInTime) {
        attendance = await tx.attendance.update({
          where: { id: attendance.id },
          data: {
            punchInTime: now,
            status: AttendanceStatus.PRESENT,
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
      let attendance = await tx.attendance.findFirst({
        where: {
          tenantId: scope.tenantId,
          tenantMembershipId: scope.membershipId,
          date: todayDate,
        },
      });

      if (!attendance) {
        attendance = await tx.attendance.create({
          data: {
            tenant: { connect: { id: scope.tenantId } },
            tenantMembership: { connect: { id: scope.membershipId } },
            user: { connect: { id: scope.userId } },
            date: todayDate,
            status: AttendanceStatus.PRESENT,
            punchOutTime: now,
            remarks: dto.remarks ?? null,
          },
        });
      } else {
        const punchIn = attendance.punchInTime ?? now;
        const workMinutes = Math.max(0, Math.floor((now.getTime() - punchIn.getTime()) / 60000));

        attendance = await tx.attendance.update({
          where: { id: attendance.id },
          data: {
            punchOutTime: now,
            totalWorkMinutes: workMinutes,
          },
        });
      }

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

      return { attendance, punchLog };
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
        user: true,
        tenantMembership: true,
        punchLogs: true,
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
        user: true,
        tenantMembership: true,
        punchLogs: true,
      },
      orderBy: { date: 'asc' },
    });
  }
}
