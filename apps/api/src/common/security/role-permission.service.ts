import { auditEvents } from '../../audit/audit-event-writer';
import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { PermissionScope, PrismaClient } from '@prisma/client';

@Injectable()
export class RolePermissionService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaClient) {}

  /**
   * Grants a PLATFORM-scoped permission to a PlatformRole.
   * Transactionally increments PlatformRole.permissionsVersion.
   */
  async grantPlatformPermission(
    platformRoleId: string,
    permissionCode: string,
  ) {
    const role = await this.prisma.platformRole.findUnique({
      where: { id: platformRoleId },
    });

    if (!role || !role.isActive) {
      throw new NotFoundException(`Platform role '${platformRoleId}' not found or inactive.`);
    }

    const permission = await this.prisma.permission.findFirst({
      where: { code: permissionCode, isActive: true },
    });

    if (!permission) {
      throw new NotFoundException(`Permission '${permissionCode}' not found or inactive.`);
    }

    if (permission.scope !== PermissionScope.PLATFORM) {
      throw new BadRequestException(
        `Cannot grant permission '${permissionCode}' with scope '${permission.scope}' to a PlatformRole. Only PLATFORM scoped permissions are allowed.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.platformRolePermission.findUnique({
        where: {
          platformRoleId_permissionId: {
            platformRoleId,
            permissionId: permission.id,
          },
        },
      });

      if (!existing) {
        await tx.platformRolePermission.create({
          data: {
            platformRoleId,
            permissionId: permission.id,
          },
        });
      }

      const updatedRole = await tx.platformRole.update({
        where: { id: platformRoleId },
        data: {
          permissionsVersion: { increment: 1 },
        },
      });

      await auditEvents.write(tx, { action: 'rbac.platform.grant', scope: 'PLATFORM', entityType: 'PlatformRole', entityId: platformRoleId,
        metadata: { permissionCode, permissionsVersion: updatedRole.permissionsVersion } });
      return {
        platformRoleId,
        permissionCode,
        granted: true,
        permissionsVersion: updatedRole.permissionsVersion,
      };
    });
  }

  /**
   * Revokes a permission from a PlatformRole.
   * Transactionally increments PlatformRole.permissionsVersion.
   */
  async revokePlatformPermission(
    platformRoleId: string,
    permissionCode: string,
  ) {
    const role = await this.prisma.platformRole.findUnique({
      where: { id: platformRoleId },
    });

    if (!role) {
      throw new NotFoundException(`Platform role '${platformRoleId}' not found.`);
    }

    const permission = await this.prisma.permission.findFirst({
      where: { code: permissionCode },
    });

    if (!permission) {
      throw new NotFoundException(`Permission '${permissionCode}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.platformRolePermission.findUnique({
        where: {
          platformRoleId_permissionId: {
            platformRoleId,
            permissionId: permission.id,
          },
        },
      });

      if (existing) {
        await tx.platformRolePermission.delete({
          where: {
            platformRoleId_permissionId: {
              platformRoleId,
              permissionId: permission.id,
            },
          },
        });
      }

      const updatedRole = await tx.platformRole.update({
        where: { id: platformRoleId },
        data: {
          permissionsVersion: { increment: 1 },
        },
      });

      await auditEvents.write(tx, { action: 'rbac.platform.revoke', scope: 'PLATFORM', entityType: 'PlatformRole', entityId: platformRoleId,
        metadata: { permissionCode, permissionsVersion: updatedRole.permissionsVersion } });
      return {
        platformRoleId,
        permissionCode,
        revoked: true,
        permissionsVersion: updatedRole.permissionsVersion,
      };
    });
  }

  /**
   * Grants a TENANT-scoped permission to a TenantRole.
   * Enforces strict tenant ownership check and scope boundary.
   * Transactionally increments TenantRole.permissionsVersion.
   */
  async grantTenantPermission(
    tenantId: string,
    tenantRoleId: string,
    permissionCode: string,
    onlyIfMissing = false,
  ) {
    const role = await this.prisma.tenantRole.findUnique({
      where: { id: tenantRoleId },
    });

    if (!role || !role.isActive) {
      throw new NotFoundException(`Tenant role '${tenantRoleId}' not found or inactive.`);
    }

    if (role.tenantId !== tenantId) {
      throw new NotFoundException(`Tenant role '${tenantRoleId}' not found.`);
    }

    const permission = await this.prisma.permission.findFirst({
      where: { code: permissionCode, isActive: true },
    });

    if (!permission) {
      throw new NotFoundException(`Permission '${permissionCode}' not found or inactive.`);
    }

    if (permission.scope !== PermissionScope.TENANT) {
      throw new BadRequestException(
        `Cannot grant permission '${permissionCode}' with scope '${permission.scope}' to a TenantRole. Only TENANT scoped permissions are allowed.`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      if (onlyIfMissing) {
        const locked = await tx.$queryRaw<Array<{id:string}>>`SELECT id FROM "TenantRole" WHERE id=${tenantRoleId} AND "tenantId"=${tenantId} AND "isActive"=true FOR UPDATE`;
        if (!locked.length) throw new NotFoundException('Tenant role not found or inactive.');
      }
      const existing = await tx.tenantRolePermission.findUnique({
        where: {
          tenantRoleId_permissionId: {
            tenantRoleId,
            permissionId: permission.id,
          },
        },
      });

      if (existing && onlyIfMissing) {
        return {tenantId,tenantRoleId,permissionCode,granted:true,permissionsVersion:role.permissionsVersion,changed:false};
      }
      if (!existing) {
        await tx.tenantRolePermission.create({
          data: {
            tenantRoleId,
            permissionId: permission.id,
          },
        });
      }

      const updatedRole = await tx.tenantRole.update({
        where: { id: tenantRoleId },
        data: {
          permissionsVersion: { increment: 1 },
        },
      });

      await auditEvents.write(tx, { action: 'rbac.tenant.grant', scope: 'TENANT', tenantId, entityType: 'TenantRole', entityId: tenantRoleId,
        metadata: { permissionCode, permissionsVersion: updatedRole.permissionsVersion } });
      return {
        tenantId,
        tenantRoleId,
        permissionCode,
        granted: true,
        changed: true,
        permissionsVersion: updatedRole.permissionsVersion,
      };
    });
  }

  /**
   * Revokes a permission from a TenantRole.
   * Enforces strict tenant ownership check.
   * Transactionally increments TenantRole.permissionsVersion.
   */
  async revokeTenantPermission(
    tenantId: string,
    tenantRoleId: string,
    permissionCode: string,
  ) {
    const role = await this.prisma.tenantRole.findUnique({
      where: { id: tenantRoleId },
    });

    if (!role) {
      throw new NotFoundException(`Tenant role '${tenantRoleId}' not found.`);
    }

    if (role.tenantId !== tenantId) {
      throw new NotFoundException(`Tenant role '${tenantRoleId}' not found.`);
    }

    const permission = await this.prisma.permission.findFirst({
      where: { code: permissionCode },
    });

    if (!permission) {
      throw new NotFoundException(`Permission '${permissionCode}' not found.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.tenantRolePermission.findUnique({
        where: {
          tenantRoleId_permissionId: {
            tenantRoleId,
            permissionId: permission.id,
          },
        },
      });

      if (existing) {
        await tx.tenantRolePermission.delete({
          where: {
            tenantRoleId_permissionId: {
              tenantRoleId,
              permissionId: permission.id,
            },
          },
        });
      }

      const updatedRole = await tx.tenantRole.update({
        where: { id: tenantRoleId },
        data: {
          permissionsVersion: { increment: 1 },
        },
      });

      await auditEvents.write(tx, { action: 'rbac.tenant.revoke', scope: 'TENANT', tenantId, entityType: 'TenantRole', entityId: tenantRoleId,
        metadata: { permissionCode, permissionsVersion: updatedRole.permissionsVersion } });
      return {
        tenantId,
        tenantRoleId,
        permissionCode,
        revoked: true,
        permissionsVersion: updatedRole.permissionsVersion,
      };
    });
  }
}
