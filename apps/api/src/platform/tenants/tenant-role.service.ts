import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { TenantRole, Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class TenantRoleService {
  private readonly logger = new Logger(TenantRoleService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Instantiates or ensures built-in tenant-local TenantRole records for a given tenant.
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

    for (const tpl of templates) {
      const existing = await db.tenantRole.findUnique({
        where: {
          tenantId_code: {
            tenantId,
            code: tpl.code,
          },
        },
      });

      if (existing) {
        // Preserve existing tenant role display customizations
        tenantRoles.push(existing);
      } else {
        const created = await db.tenantRole.create({
          data: {
            tenantId,
            templateId: tpl.id,
            code: tpl.code,
            name: tpl.name,
            description: tpl.description,
            isSystem: true,
            isActive: true,
          },
        });
        tenantRoles.push(created);
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
