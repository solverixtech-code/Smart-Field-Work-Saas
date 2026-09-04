import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { CreateMembershipDto, UpdateMembershipProfileDto } from './dto/create-membership.dto';
import { TenantMembershipSummaryDto } from './dto/membership-response.dto';
import { TenantMembershipStatus } from '@prisma/client';

const ALLOWED_MEMBERSHIP_TRANSITIONS: Record<TenantMembershipStatus, TenantMembershipStatus[]> = {
  [TenantMembershipStatus.INVITED]: [TenantMembershipStatus.ACTIVE, TenantMembershipStatus.DEACTIVATED],
  [TenantMembershipStatus.ACTIVE]: [TenantMembershipStatus.SUSPENDED, TenantMembershipStatus.DEACTIVATED],
  [TenantMembershipStatus.SUSPENDED]: [TenantMembershipStatus.ACTIVE, TenantMembershipStatus.DEACTIVATED],
  [TenantMembershipStatus.DEACTIVATED]: [TenantMembershipStatus.ACTIVE],
};

@Injectable()
export class TenantMembershipService {
  private readonly logger = new Logger(TenantMembershipService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createMembership(input: CreateMembershipDto): Promise<TenantMembershipSummaryDto> {
    // 1. Verify Tenant exists & status allows membership creation
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: input.tenantId },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${input.tenantId}' not found.`);
    }
    if (tenant.status === 'CANCELLED' || tenant.status === 'ARCHIVED') {
      throw new BadRequestException(
        `Cannot create membership in tenant with status '${tenant.status}'.`,
      );
    }

    // 2. Verify User exists
    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID '${input.userId}' not found.`);
    }

    // 3. Verify TenantRole if supplied belongs to the SAME tenant
    if (input.tenantRoleId) {
      const role = await this.prisma.tenantRole.findUnique({
        where: { id: input.tenantRoleId },
      });
      if (!role) {
        throw new NotFoundException(`TenantRole with ID '${input.tenantRoleId}' not found.`);
      }
      if (role.tenantId !== input.tenantId) {
        throw new BadRequestException(
          `TenantRole '${role.id}' belongs to tenant '${role.tenantId}', not target tenant '${input.tenantId}'.`,
        );
      }
    }

    // 4. Verify Manager Membership if supplied belongs to the SAME tenant
    if (input.managerMembershipId) {
      const mgr = await this.prisma.tenantMembership.findUnique({
        where: { id: input.managerMembershipId },
      });
      if (!mgr) {
        throw new NotFoundException(
          `Manager membership with ID '${input.managerMembershipId}' not found.`,
        );
      }
      if (mgr.tenantId !== input.tenantId) {
        throw new BadRequestException(
          `Manager membership '${mgr.id}' belongs to tenant '${mgr.tenantId}', not target tenant '${input.tenantId}'.`,
        );
      }
    }

    // 5. Verify Employee Code uniqueness within tenant if supplied
    if (input.employeeCode && input.employeeCode.trim()) {
      const empCode = input.employeeCode.trim();
      const existingEmpCode = await this.prisma.tenantMembership.findFirst({
        where: {
          tenantId: input.tenantId,
          employeeCode: empCode,
          userId: { not: input.userId },
        },
      });
      if (existingEmpCode) {
        throw new ConflictException(
          `Employee code '${empCode}' is already assigned to another membership in tenant '${input.tenantId}'.`,
        );
      }
    }

    // 6. Check existing membership row (@@unique([tenantId, userId]))
    const existingMembership = await this.prisma.tenantMembership.findUnique({
      where: {
        tenantId_userId: {
          tenantId: input.tenantId,
          userId: input.userId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException(
        `User '${input.userId}' already has a membership in tenant '${input.tenantId}'. Use update, status transition, or reactivation methods.`,
      );
    }

    const now = new Date();

    // Create new membership record
    const created = await this.prisma.tenantMembership.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        tenantRoleId: input.tenantRoleId || null,
        status: input.status || TenantMembershipStatus.ACTIVE,
        isPrimary: input.isPrimary ?? false,
        employeeCode: input.employeeCode?.trim() || null,
        designation: input.designation?.trim() || null,
        department: input.department?.trim() || null,
        dataScope: input.dataScope || 'ALL',
        teamId: input.teamId || null,
        managerMembershipId: input.managerMembershipId || null,
        invitedByUserId: input.invitedByUserId || null,
        joinedAt: now,
        activatedAt: input.status === TenantMembershipStatus.ACTIVE ? now : null,
      },
      include: {
        user: true,
        tenant: true,
        tenantRole: true,
      },
    });

    return this.mapToSummaryDto(created);
  }

  async updateMembershipProfile(
    id: string,
    input: UpdateMembershipProfileDto,
  ): Promise<TenantMembershipSummaryDto> {
    const existing = await this.prisma.tenantMembership.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`TenantMembership with ID '${id}' not found.`);
    }

    if (input.managerMembershipId) {
      const mgr = await this.prisma.tenantMembership.findUnique({
        where: { id: input.managerMembershipId },
      });
      if (!mgr) {
        throw new NotFoundException(`Manager membership with ID '${input.managerMembershipId}' not found.`);
      }
      if (mgr.tenantId !== existing.tenantId) {
        throw new BadRequestException(
          `Manager membership '${mgr.id}' belongs to tenant '${mgr.tenantId}', not target tenant '${existing.tenantId}'.`,
        );
      }
    }

    if (input.employeeCode && input.employeeCode.trim()) {
      const empCode = input.employeeCode.trim();
      const existingEmpCode = await this.prisma.tenantMembership.findFirst({
        where: {
          tenantId: existing.tenantId,
          employeeCode: empCode,
          id: { not: existing.id },
        },
      });
      if (existingEmpCode) {
        throw new ConflictException(
          `Employee code '${empCode}' is already assigned to another membership in tenant '${existing.tenantId}'.`,
        );
      }
    }

    const updated = await this.prisma.tenantMembership.update({
      where: { id },
      data: {
        employeeCode: input.employeeCode !== undefined ? input.employeeCode.trim() : existing.employeeCode,
        designation: input.designation !== undefined ? input.designation.trim() : existing.designation,
        department: input.department !== undefined ? input.department.trim() : existing.department,
        dataScope: input.dataScope ?? existing.dataScope,
        teamId: input.teamId !== undefined ? input.teamId : existing.teamId,
        managerMembershipId: input.managerMembershipId !== undefined ? input.managerMembershipId : existing.managerMembershipId,
        isPrimary: input.isPrimary ?? existing.isPrimary,
      },
      include: {
        user: true,
        tenant: true,
        tenantRole: true,
      },
    });

    return this.mapToSummaryDto(updated);
  }

  async changeMembershipRole(
    id: string,
    tenantRoleId: string,
  ): Promise<TenantMembershipSummaryDto> {
    const existing = await this.prisma.tenantMembership.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`TenantMembership with ID '${id}' not found.`);
    }

    const role = await this.prisma.tenantRole.findUnique({
      where: { id: tenantRoleId },
    });
    if (!role) {
      throw new NotFoundException(`TenantRole with ID '${tenantRoleId}' not found.`);
    }
    if (role.tenantId !== existing.tenantId) {
      throw new BadRequestException(
        `TenantRole '${role.id}' belongs to tenant '${role.tenantId}', not target tenant '${existing.tenantId}'.`,
      );
    }

    const updated = await this.prisma.tenantMembership.update({
      where: { id },
      data: { tenantRoleId },
      include: {
        user: true,
        tenant: true,
        tenantRole: true,
      },
    });

    return this.mapToSummaryDto(updated);
  }

  async transitionMembershipStatus(
    id: string,
    newStatus: TenantMembershipStatus,
  ): Promise<TenantMembershipSummaryDto> {
    const existing = await this.prisma.tenantMembership.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`TenantMembership with ID '${id}' not found.`);
    }

    if (existing.status === newStatus) {
      const full = await this.prisma.tenantMembership.findUnique({
        where: { id },
        include: { user: true, tenant: true, tenantRole: true },
      });
      return this.mapToSummaryDto(full!);
    }

    const allowed = ALLOWED_MEMBERSHIP_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from '${existing.status}' to '${newStatus}'.`,
      );
    }

    const now = new Date();
    const updateData: any = { status: newStatus };

    if (newStatus === TenantMembershipStatus.ACTIVE) {
      if (!existing.activatedAt) {
        updateData.activatedAt = now;
      }
      updateData.deactivatedAt = null;
    } else if (newStatus === TenantMembershipStatus.DEACTIVATED) {
      updateData.deactivatedAt = now;
    }

    const updated = await this.prisma.tenantMembership.update({
      where: { id },
      data: updateData,
      include: {
        user: true,
        tenant: true,
        tenantRole: true,
      },
    });

    return this.mapToSummaryDto(updated);
  }

  async reactivateMembership(id: string): Promise<TenantMembershipSummaryDto> {
    return this.transitionMembershipStatus(id, TenantMembershipStatus.ACTIVE);
  }

  async getMembershipsByTenantId(tenantId: string): Promise<TenantMembershipSummaryDto[]> {
    const list = await this.prisma.tenantMembership.findMany({
      where: { tenantId },
      include: {
        user: true,
        tenant: true,
        tenantRole: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((m) => this.mapToSummaryDto(m));
  }

  async getMembershipsByUserId(userId: string): Promise<TenantMembershipSummaryDto[]> {
    const list = await this.prisma.tenantMembership.findMany({
      where: { userId },
      include: {
        user: true,
        tenant: true,
        tenantRole: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((m) => this.mapToSummaryDto(m));
  }

  async updateMembershipStatus(
    id: string,
    newStatus: TenantMembershipStatus,
  ): Promise<TenantMembershipSummaryDto> {
    return this.transitionMembershipStatus(id, newStatus);
  }

  private mapToSummaryDto(m: any): TenantMembershipSummaryDto {
    return {
      id: m.id,
      tenantId: m.tenantId,
      tenantDisplayName: m.tenant?.displayName,
      tenantSlug: m.tenant?.slug,
      userId: m.userId,
      user: m.user
        ? {
            id: m.user.id,
            fullName: m.user.fullName,
            email: m.user.email,
            avatarUrl: m.user.avatarUrl,
          }
        : undefined,
      status: m.status,
      isPrimary: m.isPrimary,
      employeeCode: m.employeeCode,
      designation: m.designation,
      department: m.department,
      dataScope: m.dataScope,
      teamId: m.teamId,
      managerMembershipId: m.managerMembershipId,
      tenantRole: m.tenantRole
        ? {
            id: m.tenantRole.id,
            code: m.tenantRole.code,
            name: m.tenantRole.name,
          }
        : null,
      invitedAt: m.invitedAt?.toISOString() || null,
      joinedAt: m.joinedAt?.toISOString() || null,
      activatedAt: m.activatedAt?.toISOString() || null,
      deactivatedAt: m.deactivatedAt?.toISOString() || null,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    };
  }
}
