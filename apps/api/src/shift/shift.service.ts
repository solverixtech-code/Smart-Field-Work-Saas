import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ShiftRepository } from '../repositories/shift.repository';
import { TenantScope } from '../common/tenancy/tenant-scope';
import { PrismaService } from '../persistence/prisma.service';
import { TenantMembershipStatus } from '@prisma/client';

import { UpdateShiftSwaggerDto } from './dto/shift.dto';

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
  membershipId: string;
  shiftId: string;
  startDate: string;
  endDate?: string;
}

@Injectable()
export class ShiftService {
  constructor(
    private readonly shiftRepository: ShiftRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(scope: TenantScope) {
    return this.shiftRepository.findShifts(scope);
  }

  async findOne(scope: TenantScope, id: string) {
    const shift = await this.prisma.shift.findFirst({
      where: {
        id,
        tenantId: scope.tenantId,
      },
      include: {
        userShifts: {
          where: { tenantId: scope.tenantId },
          include: {
            user: {
              select: { id: true, fullName: true, employeeCode: true, email: true, avatarUrl: true },
            },
            tenantMembership: true,
          },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return shift;
  }

  async create(scope: TenantScope, dto: CreateShiftDto) {
    const existing = await this.prisma.shift.findFirst({
      where: {
        code: dto.code,
        tenantId: scope.tenantId,
      },
    });
    if (existing) {
      throw new BadRequestException(`Shift code ${dto.code} already exists in this tenant`);
    }

    return this.shiftRepository.createShift(scope, {
      name: dto.name,
      code: dto.code,
      startTime: dto.startTime,
      endTime: dto.endTime,
      gracePeriodMinutes: dto.gracePeriodMinutes ?? 15,
      halfDayThresholdHours: dto.halfDayThresholdHours ?? 4.5,
      breakDurationMinutes: dto.breakDurationMinutes ?? 60,
    });
  }

  async update(scope: TenantScope, id: string, dto: UpdateShiftSwaggerDto) {
    const updatePayload: any = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.code !== undefined) updatePayload.code = dto.code;
    if (dto.startTime !== undefined) updatePayload.startTime = dto.startTime;
    if (dto.endTime !== undefined) updatePayload.endTime = dto.endTime;
    if (dto.gracePeriodMinutes !== undefined) updatePayload.gracePeriodMinutes = dto.gracePeriodMinutes;
    if (dto.halfDayThresholdHours !== undefined) updatePayload.halfDayThresholdHours = dto.halfDayThresholdHours;
    if (dto.breakDurationMinutes !== undefined) updatePayload.breakDurationMinutes = dto.breakDurationMinutes;

    return this.shiftRepository.updateShift(scope, id, updatePayload);
  }

  async assignShift(scope: TenantScope, dto: AssignShiftDto) {
    if (!dto.membershipId) {
      throw new BadRequestException('Target membershipId is required');
    }

    return this.shiftRepository.assignShift(
      scope,
      dto.shiftId,
      dto.membershipId,
      new Date(dto.startDate),
      dto.endDate ? new Date(dto.endDate) : undefined,
    );
  }
}
