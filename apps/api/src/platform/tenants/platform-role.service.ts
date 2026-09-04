import {
  Injectable,
  Logger,
  NotFoundException,
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
    return this.prisma.platformUserRoleAssignment.findMany({
      where: {
        userId,
        status: PlatformAssignmentStatus.ACTIVE,
      },
      include: {
        platformRole: true,
      },
    });
  }
}
