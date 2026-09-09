import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { PlatformAssignmentStatus, PlatformUserRoleAssignment, Prisma } from '@prisma/client';
import { auditEvents } from '../../audit/audit-event-writer';

export interface AssignPlatformRoleInput {
  userId: string;
  roleCode: string;
  assignedByUserId?: string;
  validFrom?: Date;
  validUntil?: Date;
}

@Injectable()
export class PlatformRoleService {
  private readonly logger = new Logger(PlatformRoleService.name);

  constructor(private readonly prisma: PrismaService) {}

  private auditedAssignment(work: (tx: Prisma.TransactionClient) => Promise<PlatformUserRoleAssignment>, actorUserId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const result = await work(tx);
      await auditEvents.write(tx, { action: 'rbac.platform.assignment', scope: 'PLATFORM', actorUserId,
        entityType: 'PlatformUserRoleAssignment', entityId: result.id,
        afterJson: { userId: result.userId, platformRoleId: result.platformRoleId, status: result.status } });
      return result;
    });
  }

  async assignPlatformRole(input: AssignPlatformRoleInput) {
    const user = await this.prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID '${input.userId}' not found.`);
    }

    const role = await this.prisma.platformRole.findUnique({ where: { code: input.roleCode } });
    if (!role) {
      throw new NotFoundException(`PlatformRole with code '${input.roleCode}' not found.`);
    }
    if (!role.isActive) {
      throw new BadRequestException(`PlatformRole '${input.roleCode}' is inactive and cannot be assigned.`);
    }

    if (input.validFrom && input.validUntil && input.validUntil <= input.validFrom) {
      throw new BadRequestException('validUntil must be greater than validFrom.');
    }

    if (input.assignedByUserId) {
      const assigner = await this.prisma.user.findUnique({ where: { id: input.assignedByUserId } });
      if (!assigner) {
        throw new NotFoundException(`Assigned-by User with ID '${input.assignedByUserId}' not found.`);
      }
    }

    const existing = await this.prisma.platformUserRoleAssignment.findUnique({
      where: {
        userId_platformRoleId: {
          userId: input.userId,
          platformRoleId: role.id,
        },
      },
    });

    if (existing) {
      if (existing.status === PlatformAssignmentStatus.ACTIVE) {
        return existing;
      }
      return this.auditedAssignment((tx) => tx.platformUserRoleAssignment.update({
        where: { id: existing.id },
        data: {
          status: PlatformAssignmentStatus.ACTIVE,
          validFrom: input.validFrom || null,
          validUntil: input.validUntil || null,
          assignedByUserId: input.assignedByUserId || null,
        },
      }), input.assignedByUserId);
    }

    return this.auditedAssignment((tx) => tx.platformUserRoleAssignment.create({
      data: {
        userId: input.userId,
        platformRoleId: role.id,
        status: PlatformAssignmentStatus.ACTIVE,
        validFrom: input.validFrom || null,
        validUntil: input.validUntil || null,
        assignedByUserId: input.assignedByUserId || null,
      },
    }), input.assignedByUserId);
  }

  async revokePlatformRole(assignmentId: string) {
    const assignment = await this.prisma.platformUserRoleAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException(`PlatformUserRoleAssignment '${assignmentId}' not found.`);
    }

    return this.auditedAssignment((tx) => tx.platformUserRoleAssignment.update({
      where: { id: assignmentId },
      data: { status: PlatformAssignmentStatus.REVOKED },
    }));
  }

  async getUserPlatformRoles(userId: string) {
    const assignments = await this.prisma.platformUserRoleAssignment.findMany({
      where: {
        userId,
        status: PlatformAssignmentStatus.ACTIVE,
      },
      include: {
        platformRole: true,
      },
    });

    const now = new Date();
    return assignments.filter((a) => {
      if (!a.platformRole || !a.platformRole.isActive) {
        return false;
      }
      if (a.validFrom && a.validFrom > now) {
        return false;
      }
      if (a.validUntil && a.validUntil < now) {
        return false;
      }
      return true;
    });
  }
}
