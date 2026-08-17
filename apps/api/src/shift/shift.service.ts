import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';

export interface CreateShiftDto {
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes?: number;
  halfDayThresholdHours?: number;
  breakDurationMinutes?: number;
}

export interface AssignShiftDto {
  userId: string;
  shiftId: string;
  startDate: string;
  endDate?: string;
}

@Injectable()
export class ShiftService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.shift.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { userShifts: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        userShifts: {
          include: {
            user: {
              select: { id: true, fullName: true, employeeCode: true, email: true },
            },
          },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return shift;
  }

  async create(dto: CreateShiftDto) {
    const existing = await this.prisma.shift.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new BadRequestException(`Shift code ${dto.code} already exists`);
    }

    return this.prisma.shift.create({
      data: {
        name: dto.name,
        code: dto.code,
        startTime: dto.startTime,
        endTime: dto.endTime,
        gracePeriodMinutes: dto.gracePeriodMinutes ?? 15,
        halfDayThresholdHours: dto.halfDayThresholdHours ?? 4.5,
        breakDurationMinutes: dto.breakDurationMinutes ?? 60,
      },
    });
  }

  async update(id: string, dto: Partial<CreateShiftDto>) {
    await this.findOne(id);
    return this.prisma.shift.update({
      where: { id },
      data: dto,
    });
  }

  async assignShift(dto: AssignShiftDto) {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new NotFoundException(`User ${dto.userId} not found`);

    const shift = await this.prisma.shift.findUnique({ where: { id: dto.shiftId } });
    if (!shift) throw new NotFoundException(`Shift ${dto.shiftId} not found`);

    return this.prisma.userShift.create({
      data: {
        userId: dto.userId,
        shiftId: dto.shiftId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }
}
