import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { PermissionCacheService } from './permission-cache.service';
import { PlatformAssignmentStatus, PermissionScope, Prisma } from '@prisma/client';

@Injectable()
export class EffectivePermissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: PermissionCacheService,
  ) {}

  /**
   * Resolve effective PLATFORM permissions for a user.
   * Scope = PLATFORM only. Platform roles cannot grant Tenant permissions.
   */
  async resolvePlatformPermissions(userId: string): Promise<string[]> {
    if (!userId) return [];

    const now = new Date();

    // 1. Fetch active assignments to build versioned cache key
    const assignments = await this.prisma.platformUserRoleAssignment.findMany({
      where: {
        userId,
        status: PlatformAssignmentStatus.ACTIVE,
        platformRole: { isActive: true },
        OR: [
          { validFrom: null, validUntil: null },
          { validFrom: { lte: now }, validUntil: null },
          { validFrom: null, validUntil: { gte: now } },
          { validFrom: { lte: now }, validUntil: { gte: now } },
        ],
      },
      include: {
        platformRole: {
          select: {
            id: true,
            code: true,
            permissionsVersion: true,
          },
        },
      },
    });

    if (assignments.length === 0) {
      return [];
    }

    // Version key incorporates role IDs and permissionsVersion
    const versionKey = assignments
      .map((a) => `${a.platformRole.id}_v${a.platformRole.permissionsVersion}`)
      .sort()
      .join(':');

    const cacheKey = `rbac:platform:${userId}:${versionKey}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Query PlatformRolePermission join
    const roleIds = assignments.map((a) => a.platformRoleId);
    const dbPermissions = await this.prisma.platformRolePermission.findMany({
      where: {
        platformRoleId: { in: roleIds },
        permission: {
          isActive: true,
          scope: PermissionScope.PLATFORM,
        },
      },
      include: {
        permission: true,
      },
    });

    const permissionCodes = Array.from(
      new Set(
        dbPermissions.map((rp) =>
          rp.permission.code
            ? rp.permission.code
            : `${rp.permission.moduleKey}.${rp.permission.action}`,
        ),
      ),
    ).sort();

    this.cache.set(cacheKey, permissionCodes);
    return permissionCodes;
  }

  /**
   * Resolve effective TENANT permissions for a selected membership.
   * Scope = TENANT only. Tenant roles cannot grant Platform permissions.
   */
  async resolveTenantPermissions(
    tenantId: string | null,
    membershipId: string | null,
    transaction?: Prisma.TransactionClient,
  ): Promise<string[]> {
    if (!tenantId || !membershipId) return [];

    // 1. Load active membership & role
    const db = transaction ?? this.prisma;
    const membership = await db.tenantMembership.findUnique({
      where: { id: membershipId },
      include: {
        tenantRole: {
          select: {
            id: true,
            code: true,
            isActive: true,
            permissionsVersion: true,
          },
        },
      },
    });

    if (
      !membership ||
      membership.tenantId !== tenantId ||
      membership.status !== 'ACTIVE' ||
      !membership.tenantRole ||
      !membership.tenantRole.isActive
    ) {
      return [];
    }

    const role = membership.tenantRole;
    const cacheKey = `rbac:tenant:${tenantId}:${membershipId}:${role.id}:v${role.permissionsVersion}`;

    // Runtime composition supplies one authoritative snapshot. Never use an
    // independently populated permission cache inside that transaction.
    const cached = transaction ? null : this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Query TenantRolePermission join
    const dbPermissions = await db.tenantRolePermission.findMany({
      where: {
        tenantRoleId: role.id,
        permission: {
          isActive: true,
          scope: PermissionScope.TENANT,
        },
      },
      include: {
        permission: true,
      },
    });

    const permissionCodes = Array.from(
      new Set(
        dbPermissions.map((rp) =>
          rp.permission.code
            ? rp.permission.code
            : `${rp.permission.moduleKey}.${rp.permission.action}`,
        ),
      ),
    ).sort();

    if (!transaction) this.cache.set(cacheKey, permissionCodes);
    return permissionCodes;
  }
}
