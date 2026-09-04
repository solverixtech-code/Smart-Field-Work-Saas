import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../persistence/prisma.service';
import { TenantScope } from '../common/tenancy/tenant-scope';
import { Prisma, Shift, UserShift, TenantMembershipStatus } from '@prisma/client';

@Injectable()
export class ShiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findShifts(scope: TenantScope): Promise<Shift[]> {
    return this.prisma.shift.findMany({
      where: { tenantId: scope.tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findShiftById(scope: TenantScope, id: string): Promise<Shift> {
    const shift = await this.prisma.shift.findFirst({
      where: {
        id,
        tenantId: scope.tenantId,
      },
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return shift;
  }

  async createShift(
    scope: TenantScope,
    data: Omit<Prisma.ShiftCreateInput, 'tenant'>,
  ): Promise<Shift> {
    return this.prisma.shift.create({
      data: {
        ...data,
        tenant: { connect: { id: scope.tenantId } },
      },
    });
  }

  async updateShift(
    scope: TenantScope,
    id: string,
    data: Prisma.ShiftUpdateInput,
  ): Promise<Shift> {
    await this.findShiftById(scope, id);

    return this.prisma.shift.update({
      where: { id },
      data,
    });
  }

  async assignShift(
    scope: TenantScope,
    shiftId: string,
    targetMembershipId: string,
    startDate: Date,
    endDate?: Date,
  ): Promise<UserShift> {
    // 1. Verify Shift belongs to current Tenant
    await this.findShiftById(scope, shiftId);

    // 2. Verify target Membership belongs to current Tenant and is ACTIVE
    const membership = await this.prisma.tenantMembership.findFirst({
      where: {
        id: targetMembershipId,
        tenantId: scope.tenantId,
        status: TenantMembershipStatus.ACTIVE,
      },
    });

    if (!membership) {
      throw new BadRequestException(
        `Target membership ${targetMembershipId} not found or inactive in current workspace`,
      );
    }

    // 3. Create UserShift with tenant & tenantMembership context
    return this.prisma.userShift.create({
      data: {
        tenant: { connect: { id: scope.tenantId } },
        tenantMembership: { connect: { id: membership.id } },
        user: { connect: { id: membership.userId } },
        shift: { connect: { id: shiftId } },
        startDate,
        endDate: endDate ?? null,
      },
    });
  }
}
