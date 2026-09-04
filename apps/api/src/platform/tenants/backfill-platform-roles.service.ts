import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { PlatformRoleService } from './platform-role.service';
import { Role } from '@prisma/client';

export interface BackfillReport {
  usersScanned: number;
  explicitPlatformUsers: number;
  platformAssignmentsCreated: number;
  existingAssignmentsPreserved: number;
  legacyTenantUsersDeferred: number;
}

const EXPLICIT_PLATFORM_ROLES: Role[] = [
  Role.PLATFORM_SUPER_ADMIN,
  Role.PLATFORM_OPERATIONS_ADMIN,
  Role.PLATFORM_ONBOARDING,
  Role.PLATFORM_SUPPORT,
  Role.PLATFORM_BILLING,
  Role.PLATFORM_AUDITOR,
];

@Injectable()
export class BackfillPlatformRolesService {
  private readonly logger = new Logger(BackfillPlatformRolesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly platformRoleService: PlatformRoleService,
  ) {}

  /**
   * Deterministically backfills PlatformUserRoleAssignment records for explicit platform role users.
   */
  async backfillPlatformRoles(): Promise<BackfillReport> {
    const users = await this.prisma.user.findMany();

    let usersScanned = 0;
    let explicitPlatformUsers = 0;
    let platformAssignmentsCreated = 0;
    let existingAssignmentsPreserved = 0;
    let legacyTenantUsersDeferred = 0;

    for (const user of users) {
      usersScanned++;

      if (EXPLICIT_PLATFORM_ROLES.includes(user.role)) {
        explicitPlatformUsers++;
        const roleCode = user.role.toString();

        const role = await this.prisma.platformRole.findUnique({
          where: { code: roleCode },
        });

        if (!role) {
          this.logger.warn(`PlatformRole with code '${roleCode}' not found during backfill.`);
          continue;
        }

        const existingAssignment = await this.prisma.platformUserRoleAssignment.findUnique({
          where: {
            userId_platformRoleId: {
              userId: user.id,
              platformRoleId: role.id,
            },
          },
        });

        if (existingAssignment) {
          existingAssignmentsPreserved++;
        } else {
          await this.platformRoleService.assignPlatformRole({
            userId: user.id,
            roleCode,
          });
          platformAssignmentsCreated++;
        }
      } else {
        legacyTenantUsersDeferred++;
      }
    }

    const report: BackfillReport = {
      usersScanned,
      explicitPlatformUsers,
      platformAssignmentsCreated,
      existingAssignmentsPreserved,
      legacyTenantUsersDeferred,
    };

    this.logger.log(
      `Backfill complete. Scanned: ${usersScanned}, Explicit Platform: ${explicitPlatformUsers}, Created: ${platformAssignmentsCreated}, Preserved: ${existingAssignmentsPreserved}, Deferred: ${legacyTenantUsersDeferred}`,
    );

    return report;
  }
}
