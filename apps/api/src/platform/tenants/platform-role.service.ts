import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { PlatformAssignmentStatus } from '@prisma/client';

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
      return this.prisma.platformUserRoleAssignment.update({
        where: { id: existing.id },
        data: {
          status: PlatformAssignmentStatus.ACTIVE,
          validFrom: input.validFrom || null,
          validUntil: input.validUntil || null,
          assignedByUserId: input.assignedByUserId || null,
        },
      });
    }

    return this.prisma.platformUserRoleAssignment.create({
      data: {
        userId: input.userId,
        platformRoleId: role.id,
        status: PlatformAssignmentStatus.ACTIVE,
        validFrom: input.validFrom || null,
        validUntil: input.validUntil || null,
        assignedByUserId: input.assignedByUserId || null,
      },
    });
  }

  async revokePlatformRole(assignmentId: string) {
    const assignment = await this.prisma.platformUserRoleAssignment.findUnique({
      where: { id: assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException(`PlatformUserRoleAssignment '${assignmentId}' not found.`);
    }

    return this.prisma.platformUserRoleAssignment.update({
      where: { id: assignmentId },
      data: { status: PlatformAssignmentStatus.REVOKED },
    });
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
