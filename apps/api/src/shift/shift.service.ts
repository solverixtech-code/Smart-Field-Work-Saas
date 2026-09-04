import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ShiftRepository } from '../repositories/shift.repository';
import { TenantScope } from '../common/tenancy/tenant-scope';
import { PrismaService } from '../persistence/prisma.service';
import { TenantMembershipStatus } from '@prisma/client';

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
  membershipId?: string;
  userId?: string;
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
          include: {
            user: {
              select: { id: true, fullName: true, employeeCode: true, email: true },
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

  async update(scope: TenantScope, id: string, dto: Partial<CreateShiftDto>) {
    return this.shiftRepository.updateShift(scope, id, dto);
  }

  async assignShift(scope: TenantScope, dto: AssignShiftDto) {
    let targetMembershipId = dto.membershipId;

    if (!targetMembershipId && dto.userId) {
      const mem = await this.prisma.tenantMembership.findFirst({
        where: {
          userId: dto.userId,
          tenantId: scope.tenantId,
          status: TenantMembershipStatus.ACTIVE,
        },
      });
      if (mem) {
        targetMembershipId = mem.id;
      }
    }

    if (!targetMembershipId) {
      throw new BadRequestException('Target membershipId or valid user within tenant is required');
    }

    return this.shiftRepository.assignShift(
      scope,
      dto.shiftId,
      targetMembershipId,
      new Date(dto.startDate),
      dto.endDate ? new Date(dto.endDate) : undefined,
    );
  }
}
