import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CurrentPrincipal } from '../../common/decorators/current-principal.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { TenantAuthorized } from '../../common/decorators/tenant-authorized.decorator';
import { RequestPrincipal } from '../../common/security/request-principal.interface';
import { PrismaService } from '../../persistence/prisma.service';
import { TenantRoleService } from './tenant-role.service';
import { PermissionScope } from '@prisma/client';
import { auditEvents } from '../../audit/audit-event-writer';

interface CreateRoleDto {
  name: string;
  code?: string;
  description?: string;
  baseRoleId?: string;
}

interface UpdateRoleDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

interface UpdatePermissionsDto {
  permissionCodes: string[];
}

interface DuplicateRoleDto {
  name?: string;
  code?: string;
  description?: string;
}

@Controller('tenant/roles')
@TenantAuthorized()
export class TenantRolesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantRoleService: TenantRoleService,
  ) {}

  /**
   * List all roles for the current tenant workspace with statistics and filter support
   */
  @Get('')
  @RequirePermissions('tenant.roles.view')
  async listRoles(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Query('q') query?: string,
    @Query('status') status?: string,
  ) {
    const tenantId = principal.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    // Ensure built-in roles exist for tenant
    await this.tenantRoleService.ensureBuiltInTenantRoles(tenantId);

    const roles = await this.prisma.tenantRole.findMany({
      where: {
        tenantId,
      },
      include: {
        template: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            permissions: true,
            memberships: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: [
        { isSystem: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    // Compute stats
    const totalActiveRoles = roles.filter((r) => r.isActive).length;
    const totalCustomRoles = roles.filter((r) => !r.isSystem).length;
    const fromTemplatesCount = totalActiveRoles - totalCustomRoles;
    const syncedPermissionsCount = await this.prisma.permission.count({
      where: {
        scope: PermissionScope.TENANT,
        isActive: true,
      },
    });

    const totalUsersAssigned = await this.prisma.tenantMembership.count({
      where: {
        tenantId,
        status: 'ACTIVE',
        tenantRoleId: { not: null },
      },
    });

    // Map role items
    const roleItems = roles.map((r) => {
      let roleStatus: 'default' | 'synced' | 'customized' = 'synced';
      if (r.code === 'tenant_admin') {
        roleStatus = 'default';
      } else if (!r.isSystem) {
        roleStatus = 'customized';
      } else {
        roleStatus = 'synced';
      }

      return {
        id: r.id,
        code: r.code,
        name: r.name,
        description: r.description || '',
        isSystem: r.isSystem,
        isActive: r.isActive,
        permissionsVersion: r.permissionsVersion,
        userCount: r._count.memberships,
        permissionCount: r._count.permissions,
        status: roleStatus,
        templateVersion: r.template ? 'v3' : 'custom',
        updatedAt: r.updatedAt.toISOString(),
      };
    });

    // Apply filters
    let filtered = roleItems;
    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (query && query.trim()) {
      const qLower = query.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(qLower) ||
          r.code.toLowerCase().includes(qLower) ||
          r.description.toLowerCase().includes(qLower),
      );
    }

    return {
      roles: filtered,
      stats: {
        activeRoles: totalActiveRoles,
        syncedPermissions: syncedPermissionsCount,
        customRoles: totalCustomRoles,
        usersAssigned: totalUsersAssigned,
        breakdown: `${totalCustomRoles} custom roles • ${totalActiveRoles - totalCustomRoles} from templates`,
      },
      counts: {
        all: roleItems.length,
        synced: roleItems.filter((r) => r.status === 'synced').length,
        customized: roleItems.filter((r) => r.status === 'customized').length,
        default: roleItems.filter((r) => r.status === 'default').length,
      },
    };
  }

  /**
   * Get single role details with permission matrix groups and assigned users
   */
  @Get(':id')
  @RequirePermissions('tenant.roles.view')
  async getRole(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param('id') id: string,
  ) {
    const tenantId = principal.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const role = await this.prisma.tenantRole.findUnique({
      where: { id },
      include: {
        template: true,
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role || role.tenantId !== tenantId) {
      throw new NotFoundException(`Tenant role '${id}' not found`);
    }

    // Determine granted permission codes
    const grantedCodes = new Set(
      role.permissions
        .filter((rp) => rp.permission.isActive)
        .map((rp) => rp.permission.code || `${rp.permission.moduleKey}.${rp.permission.action}`),
    );

    // If tenant_admin, grant all active tenant permissions
    if (role.code === 'tenant_admin') {
      const allTenantPerms = await this.prisma.permission.findMany({
        where: { scope: PermissionScope.TENANT, isActive: true },
      });
      for (const p of allTenantPerms) {
        if (p.code) grantedCodes.add(p.code);
      }
    }

    // Load all active TENANT permissions to construct module matrix
    const allPermissions = await this.prisma.permission.findMany({
      where: {
        scope: PermissionScope.TENANT,
        isActive: true,
      },
      orderBy: [
        { moduleKey: 'asc' },
        { action: 'asc' },
      ],
    });

    // Group permissions into modules
    const modulesMap = new Map<string, {
      moduleKey: string;
      moduleName: string;
      icon: string;
      actions: Array<{ action: string; label: string; code: string; granted: boolean }>;
      scopes: Array<{ scope: string; label: string; code: string; granted: boolean }>;
    }>();

    // Module categorization helper
    const getModuleMeta = (moduleKey: string) => {
      switch (moduleKey) {
        case 'crm_leads':
          return { key: 'lead_management', name: 'Lead Management', icon: 'Target' };
        case 'crm_businesses':
        case 'crm_contacts':
          return { key: 'businesses_contacts', name: 'Businesses & Contacts', icon: 'Building2' };
        case 'crm_territories':
          return { key: 'territories', name: 'Territories', icon: 'Globe' };
        case 'crm_teams':
        case 'crm_executives':
          return { key: 'teams', name: 'Teams', icon: 'Users' };
        case 'crm_reports':
        case 'crm_dashboard':
        case 'crm_performance':
        case 'crm_pipeline':
        case 'crm_incentives':
        case 'crm_targets':
          return { key: 'reports', name: 'Reports', icon: 'BarChart3' };
        case 'workforce_shifts':
        case 'attendance_monitoring':
        case 'attendance_self':
          return { key: 'attendance_shifts', name: 'Attendance & Shifts', icon: 'Clock' };
        case 'payroll_salary':
        case 'payroll_runs':
        case 'payroll_payslips':
          return { key: 'payroll', name: 'Payroll', icon: 'CreditCard' };
        case 'system':
        case 'system_masters':
        case 'system_settings':
        case 'tenant_roles':
        default:
          return { key: 'platform_billing', name: 'Platform / Billing', icon: 'Sliders' };
      }
    };

    for (const p of allPermissions) {
      const code = p.code || `${p.moduleKey}.${p.action}`;
      const isScope = p.action.startsWith('access.');
      const meta = getModuleMeta(p.moduleKey);

      if (!modulesMap.has(meta.key)) {
        modulesMap.set(meta.key, {
          moduleKey: meta.key,
          moduleName: meta.name,
          icon: meta.icon,
          actions: [],
          scopes: [],
        });
      }

      const mod = modulesMap.get(meta.key)!;
      const isGranted = grantedCodes.has(code);

      if (isScope) {
        const scopeType = p.action.replace('access.', '');
        const label = scopeType.charAt(0).toUpperCase() + scopeType.slice(1);
        if (!mod.scopes.some((s) => s.scope === scopeType)) {
          mod.scopes.push({
            scope: scopeType,
            label,
            code,
            granted: isGranted,
          });
        }
      } else {
        const actionLabel = formatActionLabel(p.action);
        if (!mod.actions.some((a) => a.action === p.action && a.code === code)) {
          mod.actions.push({
            action: p.action,
            label: actionLabel,
            code,
            granted: isGranted,
          });
        }
      }
    }

    // Load assigned users for this role
    const memberships = await this.prisma.tenantMembership.findMany({
      where: {
        tenantId,
        tenantRoleId: role.id,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            status: true,
            joinedAt: true,
            team: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const assignedUsers = memberships.map((m) => ({
      membershipId: m.id,
      userId: m.user.id,
      name: m.user.fullName,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      team: m.user.team?.name || 'General Operations',
      role: role.name,
      status: m.status === 'ACTIVE' ? 'Active' : 'Inactive',
      addedOn: m.createdAt.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    }));

    let roleStatus: 'default' | 'synced' | 'customized' = 'synced';
    if (role.code === 'tenant_admin') {
      roleStatus = 'default';
    } else if (!role.isSystem || role.permissionsVersion > 1) {
      roleStatus = 'customized';
    }

    return {
      role: {
        id: role.id,
        code: role.code,
        name: role.name,
        description: role.description || '',
        isSystem: role.isSystem,
        isActive: role.isActive,
        permissionsVersion: role.permissionsVersion,
        status: roleStatus,
        scope: 'Tenant',
        moduleEntitlement: 'core_crm enabled',
        templateVersion: role.template ? 'v3' : 'custom',
        lastUpdated: role.updatedAt.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      },
      grantedPermissions: Array.from(grantedCodes),
      permissionModules: Array.from(modulesMap.values()),
      assignedUsers,
    };
  }

  /**
   * Create a new custom tenant role with optional cloning from a base role
   */
  @Post('')
  @RequirePermissions('tenant.roles.manage')
  async createRole(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Body() body: CreateRoleDto,
  ) {
    const tenantId = principal.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    if (!body.name || !body.name.trim()) {
      throw new BadRequestException('Role name is required');
    }

    const code = (body.code && body.code.trim())
      ? body.code.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      : body.name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Check duplicate code
    const existing = await this.prisma.tenantRole.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(`Role with code '${code}' already exists in this workspace.`);
    }

    return this.prisma.$transaction(async (tx) => {
      const newRole = await tx.tenantRole.create({
        data: {
          tenantId,
          code,
          name: body.name.trim(),
          description: body.description?.trim() || `Custom role for ${body.name.trim()}`,
          isSystem: false,
          isActive: true,
          permissionsVersion: 1,
        },
      });

      // If baseRoleId provided, copy permission grants
      if (body.baseRoleId) {
        const basePermissions = await tx.tenantRolePermission.findMany({
          where: { tenantRoleId: body.baseRoleId },
        });

        if (basePermissions.length > 0) {
          await tx.tenantRolePermission.createMany({
            data: basePermissions.map((bp) => ({
              tenantRoleId: newRole.id,
              permissionId: bp.permissionId,
            })),
          });
        }
      }

      await auditEvents.write(tx, {
        action: 'rbac.tenant.role.create',
        scope: 'TENANT',
        tenantId,
        entityType: 'TenantRole',
        entityId: newRole.id,
        metadata: { code: newRole.code, name: newRole.name },
      });

      return newRole;
    });
  }

  /**
   * Update role metadata (name, description, active status)
   */
  @Patch(':id')
  @RequirePermissions('tenant.roles.manage')
  async updateRole(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
  ) {
    const tenantId = principal.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const role = await this.prisma.tenantRole.findUnique({ where: { id } });
    if (!role || role.tenantId !== tenantId) {
      throw new NotFoundException(`Tenant role '${id}' not found`);
    }

    const updated = await this.prisma.tenantRole.update({
      where: { id },
      data: {
        name: body.name?.trim() ?? role.name,
        description: body.description?.trim() ?? role.description,
        isActive: body.isActive !== undefined ? body.isActive : role.isActive,
      },
    });

    return updated;
  }

  /**
   * Update permission grants for a role transactionally
   */
  @Put(':id/permissions')
  @RequirePermissions('tenant.roles.manage')
  async updatePermissions(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param('id') id: string,
    @Body() body: UpdatePermissionsDto,
  ) {
    const tenantId = principal.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const role = await this.prisma.tenantRole.findUnique({ where: { id } });
    if (!role || role.tenantId !== tenantId) {
      throw new NotFoundException(`Tenant role '${id}' not found`);
    }

    const permissionCodes = body.permissionCodes || [];

    // Find all active TENANT permissions matching the given codes
    const activeTenantPerms = await this.prisma.permission.findMany({
      where: {
        scope: PermissionScope.TENANT,
        isActive: true,
        OR: [
          { code: { in: permissionCodes } },
        ],
      },
    });

    return this.prisma.$transaction(async (tx) => {
      // 1. Delete all existing grants for this role
      await tx.tenantRolePermission.deleteMany({
        where: { tenantRoleId: id },
      });

      // 2. Insert new grants
      if (activeTenantPerms.length > 0) {
        await tx.tenantRolePermission.createMany({
          data: activeTenantPerms.map((p) => ({
            tenantRoleId: id,
            permissionId: p.id,
          })),
        });
      }

      // 3. Increment permissionsVersion to invalidate runtime cache
      const updatedRole = await tx.tenantRole.update({
        where: { id },
        data: {
          permissionsVersion: { increment: 1 },
        },
      });

      await auditEvents.write(tx, {
        action: 'rbac.tenant.permissions.update',
        scope: 'TENANT',
        tenantId,
        entityType: 'TenantRole',
        entityId: id,
        metadata: {
          permissionsVersion: updatedRole.permissionsVersion,
          grantCount: activeTenantPerms.length,
        },
      });

      return {
        success: true,
        permissionsVersion: updatedRole.permissionsVersion,
        grantedCount: activeTenantPerms.length,
      };
    });
  }

  /**
   * Duplicate a role with all its granted permissions into a new custom role
   */
  @Post(':id/duplicate')
  @RequirePermissions('tenant.roles.manage')
  async duplicateRole(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param('id') id: string,
    @Body() body: DuplicateRoleDto,
  ) {
    const tenantId = principal.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const sourceRole = await this.prisma.tenantRole.findUnique({
      where: { id },
      include: {
        permissions: true,
      },
    });

    if (!sourceRole || sourceRole.tenantId !== tenantId) {
      throw new NotFoundException(`Tenant role '${id}' not found`);
    }

    const duplicateName = body.name?.trim() || `${sourceRole.name} (Copy)`;
    const duplicateCode = (body.code && body.code.trim())
      ? body.code.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_')
      : `${sourceRole.code}_copy_${Date.now().toString(36).slice(-4)}`;

    return this.prisma.$transaction(async (tx) => {
      const clonedRole = await tx.tenantRole.create({
        data: {
          tenantId,
          code: duplicateCode,
          name: duplicateName,
          description: body.description?.trim() || `Cloned from ${sourceRole.name}`,
          isSystem: false,
          isActive: true,
          permissionsVersion: 1,
        },
      });

      if (sourceRole.permissions.length > 0) {
        await tx.tenantRolePermission.createMany({
          data: sourceRole.permissions.map((p) => ({
            tenantRoleId: clonedRole.id,
            permissionId: p.permissionId,
          })),
        });
      }

      await auditEvents.write(tx, {
        action: 'rbac.tenant.role.duplicate',
        scope: 'TENANT',
        tenantId,
        entityType: 'TenantRole',
        entityId: clonedRole.id,
        metadata: {
          sourceRoleId: sourceRole.id,
          newCode: clonedRole.code,
        },
      });

      return clonedRole;
    });
  }

  /**
   * Sync system role templates into tenant roles
   */
  @Post('sync')
  @RequirePermissions('tenant.roles.manage')
  async syncTemplates(@CurrentPrincipal() principal: RequestPrincipal) {
    const tenantId = principal.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    await this.tenantRoleService.ensureBuiltInTenantRoles(tenantId);
    return {
      success: true,
      message: 'Role templates successfully synchronized for workspace.',
    };
  }

  /**
   * Delete a custom role (only if non-system and has 0 active memberships)
   */
  @Delete(':id')
  @RequirePermissions('tenant.roles.manage')
  async deleteRole(
    @CurrentPrincipal() principal: RequestPrincipal,
    @Param('id') id: string,
  ) {
    const tenantId = principal.tenantId;
    if (!tenantId) {
      throw new ForbiddenException('Tenant context required');
    }

    const role = await this.prisma.tenantRole.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            memberships: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    });

    if (!role || role.tenantId !== tenantId) {
      throw new NotFoundException(`Tenant role '${id}' not found`);
    }

    if (role.isSystem) {
      throw new BadRequestException('Built-in system roles cannot be deleted.');
    }

    if (role._count.memberships > 0) {
      throw new BadRequestException(
        `Cannot delete role '${role.name}' because ${role._count.memberships} active user(s) are currently assigned to it. Reassign users before deleting.`,
      );
    }

    await this.prisma.tenantRole.delete({ where: { id } });
    return { success: true, message: `Role '${role.name}' deleted successfully.` };
  }
}

/**
 * Format permission action name into clean title case for UI
 */
function formatActionLabel(action: string): string {
  switch (action) {
    case 'view': return 'View';
    case 'create': return 'Create';
    case 'update': return 'Update';
    case 'delete': return 'Delete';
    case 'assign': return 'Assign';
    case 'convert': return 'Convert';
    case 'import': return 'Import';
    case 'export': return 'Export';
    case 'manage': return 'Manage';
    case 'punch': return 'Self Punch';
    case 'generate': return 'Run Payroll';
    case 'pay': return 'Pay Invoices';
    default:
      return action
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
  }
}
