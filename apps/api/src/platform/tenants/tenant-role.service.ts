import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { TenantRole, Prisma, PrismaClient } from '@prisma/client';
import { DEFAULT_TENANT_ROLE_GRANTS } from '../../common/security/permission-registry';

@Injectable()
export class TenantRoleService {
  private readonly logger = new Logger(TenantRoleService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Instantiates or ensures built-in tenant-local TenantRole records for a given tenant,
   * including bootstrapping default RBAC permission grants.
   * Supports execution within a Prisma transaction.
   * Throws InternalServerErrorException if system role templates are unseeded, rolling back the transaction.
   */
  async ensureBuiltInTenantRoles(
    tenantId: string,
    tx?: Prisma.TransactionClient | PrismaClient,
  ): Promise<TenantRole[]> {
    const db = tx || this.prisma;
    const templates = await db.tenantRoleTemplate.findMany({
      where: { isActive: true },
    });

    if (!templates || templates.length === 0) {
      throw new InternalServerErrorException(
        'Tenant role templates unavailable. Run production system seed before Tenant provisioning.',
      );
    }

    const tenantRoles: TenantRole[] = [];

    // Load active TENANT permissions for grant bootstrapping
    const activeTenantPermissions = await db.permission.findMany({
      where: { scope: 'TENANT', isActive: true },
    });
    const permMap = new Map(activeTenantPermissions.map((p) => [p.code, p]));

    for (const tpl of templates) {
      let tenantRole = await db.tenantRole.findUnique({
        where: {
          tenantId_code: {
            tenantId,
            code: tpl.code,
          },
        },
      });

      if (!tenantRole) {
        tenantRole = await db.tenantRole.create({
          data: {
            tenantId,
            templateId: tpl.id,
            code: tpl.code,
            name: tpl.name,
            description: tpl.description,
            isSystem: true,
            isActive: true,
            permissionsVersion: 1,
          },
        });
      }
      tenantRoles.push(tenantRole);

      // Bootstrap default RBAC grants if un-customized (permissionsVersion <= 1)
      if (tenantRole.permissionsVersion <= 1) {
        const defaultGrants = DEFAULT_TENANT_ROLE_GRANTS[tpl.code] || [];
        let newGrantsCreated = 0;

        for (const pCode of defaultGrants) {
          const perm = permMap.get(pCode);
          if (!perm) continue;

          const existingGrant = await db.tenantRolePermission.findUnique({
            where: {
              tenantRoleId_permissionId: {
                tenantRoleId: tenantRole.id,
                permissionId: perm.id,
              },
            },
          });

          if (!existingGrant) {
            await db.tenantRolePermission.create({
              data: {
                tenantRoleId: tenantRole.id,
                permissionId: perm.id,
              },
            });
            newGrantsCreated++;
          }
        }
      }
    }

    return tenantRoles;
  }

  async getRolesByTenantId(tenantId: string): Promise<TenantRole[]> {
    return this.prisma.tenantRole.findMany({
      where: { tenantId, isActive: true },
      orderBy: { code: 'asc' },
    });
  }

  async getRoleByTenantAndCode(tenantId: string, code: string): Promise<TenantRole | null> {
    return this.prisma.tenantRole.findUnique({
      where: {
        tenantId_code: { tenantId, code },
      },
    });
  }
}
