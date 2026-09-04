import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { MembershipSelectionResultDto } from './dto/membership-selection-response.dto';
import { TenantMembershipSummaryDto } from './dto/membership-response.dto';
import { TenantMembershipStatus, TenantStatus } from '@prisma/client';

@Injectable()
export class MembershipSelectionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Evaluates active membership selection state for a user.
   */
  async evaluateMembershipSelection(userId: string): Promise<MembershipSelectionResultDto> {
    const activeMemberships = await this.prisma.tenantMembership.findMany({
      where: {
        userId,
        status: TenantMembershipStatus.ACTIVE,
        tenant: {
          status: TenantStatus.ACTIVE,
        },
      },
      include: {
        tenant: true,
        user: true,
        tenantRole: true,
      },
      orderBy: [
        { isPrimary: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    const activeCount = activeMemberships.length;

    const mappedMemberships: TenantMembershipSummaryDto[] = activeMemberships.map((m) => ({
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
    }));

    if (activeCount === 0) {
      return {
        activeMemberships: [],
        activeMembershipCount: 0,
        selectionRequired: false,
        autoSelectableMembershipId: null,
      };
    }

    if (activeCount === 1) {
      return {
        activeMemberships: mappedMemberships,
        activeMembershipCount: 1,
        selectionRequired: false,
        autoSelectableMembershipId: mappedMemberships[0].id,
      };
    }

    // MULTIPLE active memberships -> explicit selection required (isPrimary does NOT override explicit rule)
    return {
      activeMemberships: mappedMemberships,
      activeMembershipCount: activeCount,
      selectionRequired: true,
      autoSelectableMembershipId: null,
    };
  }
}
