import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { TenantRole } from '@prisma/client';

@Injectable()
export class TenantRoleService {
  private readonly logger = new Logger(TenantRoleService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Instantiates or ensures built-in tenant-local TenantRole records for a given tenant.
   */
  async ensureBuiltInTenantRoles(tenantId: string): Promise<TenantRole[]> {
    const templates = await this.prisma.tenantRoleTemplate.findMany({
      where: { isActive: true },
    });

    const tenantRoles: TenantRole[] = [];

    for (const tpl of templates) {
      const role = await this.prisma.tenantRole.upsert({
        where: {
          tenantId_code: {
            tenantId,
            code: tpl.code,
          },
        },
        update: {
          name: tpl.name,
          description: tpl.description,
        },
        create: {
          tenantId,
          templateId: tpl.id,
          code: tpl.code,
          name: tpl.name,
          description: tpl.description,
          isSystem: true,
          isActive: true,
        },
      });
      tenantRoles.push(role);
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
