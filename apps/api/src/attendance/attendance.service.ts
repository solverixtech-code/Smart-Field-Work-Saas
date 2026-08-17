import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { AttendanceStatus, PunchType } from '@prisma/client';

export interface MobilePunchDto {
  latitude: number;
  longitude: number;
  locationName?: string;
  photoUrl?: string;
  deviceId?: string;
  deviceModel?: string;
  remarks?: string;
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async punchIn(userId: string, dto: MobilePunchDto) {
    if (!dto.latitude || !dto.longitude) {
      throw new BadRequestException('GPS latitude and longitude are required for Punch In');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user already punched in today
    let attendance = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (attendance && attendance.punchInTime) {
      throw new BadRequestException('You have already Punched In for today');
    }

    const now = new Date();

    // Get active user shift to calculate late status
    const userShift = await this.prisma.userShift.findFirst({
      where: { userId },
      include: { shift: true },
      orderBy: { startDate: 'desc' },
    });

    let isLate = false;
    let lateMinutes = 0;

    if (userShift?.shift) {
      const [startHour, startMin] = userShift.shift.startTime.split(':').map(Number);
      const shiftStartTime = new Date(today);
      shiftStartTime.setHours(startHour, startMin, 0, 0);
      const graceTime = new Date(shiftStartTime.getTime() + userShift.shift.gracePeriodMinutes * 60000);

      if (now > graceTime) {
        isLate = true;
        lateMinutes = Math.floor((now.getTime() - shiftStartTime.getTime()) / 60000);
      }
    }

    const status: AttendanceStatus = isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

    if (!attendance) {
      attendance = await this.prisma.attendance.create({
        data: {
          userId,
          date: today,
          shiftId: userShift?.shiftId ?? null,
          punchInTime: now,
          status,
          lateMinutes,
          remarks: dto.remarks ?? null,
        },
      });
    } else {
      attendance = await this.prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          punchInTime: now,
          status,
          lateMinutes,
          remarks: dto.remarks ?? attendance.remarks,
        },
      });
    }

    // Create PunchLog audit record
    const punchLog = await this.prisma.punchLog.create({
      data: {
        userId,
        attendanceId: attendance.id,
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

    return {
      message: 'Punched In successfully',
      attendance,
      punchLog,
    };
  }

  async punchOut(userId: string, dto: MobilePunchDto) {
    if (!dto.latitude || !dto.longitude) {
      throw new BadRequestException('GPS latitude and longitude are required for Punch Out');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    if (!attendance || !attendance.punchInTime) {
      throw new BadRequestException('You must Punch In first before Punching Out');
    }

    if (attendance.punchOutTime) {
      throw new BadRequestException('You have already Punched Out for today');
    }

    const now = new Date();
    const workMs = now.getTime() - new Date(attendance.punchInTime).getTime();
    const totalWorkMinutes = Math.floor(workMs / 60000);
    const standardWorkMinutes = 8 * 60; // 8 hours
    const overtimeMinutes = Math.max(0, totalWorkMinutes - standardWorkMinutes);

    let updatedStatus = attendance.status;
    if (totalWorkMinutes < 4 * 60) {
      updatedStatus = AttendanceStatus.HALF_DAY;
    }

    const updatedAttendance = await this.prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        punchOutTime: now,
        totalWorkMinutes,
        overtimeMinutes,
        status: updatedStatus,
        remarks: dto.remarks ?? attendance.remarks,
      },
    });

    const punchLog = await this.prisma.punchLog.create({
      data: {
        userId,
        attendanceId: attendance.id,
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

    return {
      message: 'Punched Out successfully',
      attendance: updatedAttendance,
      punchLog,
    };
  }

  async getTodayAttendanceAdmin() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.attendance.findMany({
      where: { date: today },
      include: {
        user: {
          select: { id: true, fullName: true, employeeCode: true, avatarUrl: true },
        },
        shift: true,
        punchLogs: {
          orderBy: { timestamp: 'asc' },
        },
      },
      orderBy: { punchInTime: 'desc' },
    });
  }

  async getMonthlyAttendanceAdmin(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: { id: true, fullName: true, employeeCode: true },
        },
        shift: true,
      },
      orderBy: [{ userId: 'asc' }, { date: 'asc' }],
    });
  }
}
