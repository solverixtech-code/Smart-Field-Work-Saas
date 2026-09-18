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

    // Define canonical modules in order matching the reference screen
    const canonicalModules = [
      {
        moduleKey: 'lead_management',
        moduleName: 'Lead Management',
        icon: 'Target',
        actions: [
          { action: 'view', label: 'View', code: 'crm.leads.view', granted: grantedCodes.has('crm.leads.view') },
          { action: 'create', label: 'Create', code: 'crm.leads.create', granted: grantedCodes.has('crm.leads.create') },
          { action: 'update', label: 'Update', code: 'crm.leads.update', granted: grantedCodes.has('crm.leads.update') },
          { action: 'delete', label: 'Delete', code: 'crm.leads.delete', granted: grantedCodes.has('crm.leads.delete') },
          { action: 'assign', label: 'Assign', code: 'crm.leads.assign', granted: grantedCodes.has('crm.leads.assign') },
          { action: 'convert', label: 'Convert', code: 'crm.leads.convert', granted: grantedCodes.has('crm.leads.convert') },
          { action: 'import', label: 'Import', code: 'crm.leads.import', granted: grantedCodes.has('crm.leads.import') },
          { action: 'export', label: 'Export', code: 'crm.leads.export', granted: grantedCodes.has('crm.leads.export') },
        ],
        scopes: [
          { scope: 'own', label: 'Own', code: 'crm.leads.access.own', granted: grantedCodes.has('crm.leads.access.own') },
          { scope: 'assigned', label: 'Assigned', code: 'crm.leads.access.assigned', granted: grantedCodes.has('crm.leads.access.assigned') },
          { scope: 'tenant', label: 'Tenant', code: 'crm.leads.access.tenant', granted: grantedCodes.has('crm.leads.access.tenant') },
        ],
      },
      {
        moduleKey: 'businesses_contacts',
        moduleName: 'Businesses & Contacts',
        icon: 'Building2',
        actions: [
          { action: 'view', label: 'View', code: 'crm.businesses.view', granted: grantedCodes.has('crm.businesses.view') },
          { action: 'create', label: 'Create', code: 'crm.businesses.create', granted: grantedCodes.has('crm.businesses.create') },
          { action: 'update', label: 'Update', code: 'crm.businesses.update', granted: grantedCodes.has('crm.businesses.update') },
          { action: 'delete', label: 'Delete', code: 'crm.businesses.delete', granted: grantedCodes.has('crm.businesses.delete') },
          { action: 'assign', label: 'Assign', code: 'crm.businesses.assign', granted: grantedCodes.has('crm.businesses.assign') },
        ],
        scopes: [
          { scope: 'own', label: 'Own', code: 'crm.businesses.access.own', granted: grantedCodes.has('crm.businesses.access.own') },
          { scope: 'tenant', label: 'Tenant', code: 'crm.businesses.access.tenant', granted: grantedCodes.has('crm.businesses.access.tenant') },
        ],
      },
      {
        moduleKey: 'teams',
        moduleName: 'Teams',
        icon: 'Users',
        actions: [
          { action: 'view', label: 'View', code: 'crm.teams.view', granted: grantedCodes.has('crm.teams.view') },
          { action: 'create', label: 'Create', code: 'crm.teams.create', granted: grantedCodes.has('crm.teams.create') },
          { action: 'update', label: 'Update', code: 'crm.teams.update', granted: grantedCodes.has('crm.teams.update') },
          { action: 'assign', label: 'Assign Members', code: 'crm.teams.assign', granted: grantedCodes.has('crm.teams.assign') },
        ],
        scopes: [],
      },
      {
        moduleKey: 'reports',
        moduleName: 'Reports',
        icon: 'BarChart3',
        actions: [
          { action: 'dashboard', label: 'View Dashboards', code: 'crm.dashboard.view', granted: grantedCodes.has('crm.dashboard.view') },
          { action: 'reports', label: 'Export Reports', code: 'crm.reports.view', granted: grantedCodes.has('crm.reports.view') },
        ],
        scopes: [],
      },
      {
        moduleKey: 'platform_billing',
        moduleName: 'Platform / Billing',
        icon: 'Sliders',
        actions: [
          { action: 'settings', label: 'Manage Settings', code: 'system.settings.manage', granted: grantedCodes.has('system.settings.manage') },
          { action: 'roles', label: 'Manage Roles', code: 'tenant.roles.manage', granted: grantedCodes.has('tenant.roles.manage') },
          { action: 'masters', label: 'Audit Logs', code: 'system.masters.manage', granted: grantedCodes.has('system.masters.manage') },
        ],
        scopes: [],
      },
      {
        moduleKey: 'attendance_shifts',
        moduleName: 'Attendance & Shifts',
        icon: 'Clock',
        actions: [
          { action: 'view_shifts', label: 'View Shifts', code: 'workforce.shifts.view', granted: grantedCodes.has('workforce.shifts.view') },
          { action: 'create_shifts', label: 'Create Shifts', code: 'workforce.shifts.create', granted: grantedCodes.has('workforce.shifts.create') },
          { action: 'self_punch', label: 'Self Punch', code: 'attendance.self.punch', granted: grantedCodes.has('attendance.self.punch') },
          { action: 'monitoring', label: 'Monitor Punches', code: 'attendance.monitoring.view', granted: grantedCodes.has('attendance.monitoring.view') },
        ],
        scopes: [],
      },
      {
        moduleKey: 'payroll',
        moduleName: 'Payroll',
        icon: 'CreditCard',
        actions: [
          { action: 'view', label: 'View Payslips', code: 'payroll.payslips.view', granted: grantedCodes.has('payroll.payslips.view') },
          { action: 'manage', label: 'Manage Structure', code: 'payroll.salary_structure.manage', granted: grantedCodes.has('payroll.salary_structure.manage') },
          { action: 'generate', label: 'Run Payroll', code: 'payroll.runs.generate', granted: grantedCodes.has('payroll.runs.generate') },
        ],
        scopes: [],
      },
    ];

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
      permissionModules: canonicalModules,
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
 * Format permission action name into clean title case for UI, providing context
 * to prevent duplicate ambiguous "View" or "Manage" labels.
 */
function formatPermissionActionLabel(
  p: { code: string | null; moduleKey: string; action: string; description: string | null },
  moduleGroupKey: string,
): string {
  const code = p.code || `${p.moduleKey}.${p.action}`;

  // Direct code-level mappings matching Visiblo's Moodboard & Reference UI
  switch (code) {
    // Lead Management
    case 'crm.leads.view': return 'View';
    case 'crm.leads.create': return 'Create';
    case 'crm.leads.update': return 'Update';
    case 'crm.leads.delete': return 'Delete';
    case 'crm.leads.assign': return 'Assign';
    case 'crm.leads.convert': return 'Convert';
    case 'crm.leads.import': return 'Import';
    case 'crm.leads.export': return 'Export';
    case 'crm.leads.manage': return 'Lead Pipelines';

    // Businesses & Contacts
    case 'crm.businesses.view': return 'View';
    case 'crm.businesses.create': return 'Create';
    case 'crm.businesses.update': return 'Update';
    case 'crm.businesses.delete': return 'Delete';
    case 'crm.businesses.assign': return 'Assign';
    case 'crm.contacts.view': return 'View Contacts';
    case 'crm.contacts.create': return 'Create Contacts';
    case 'crm.contacts.update': return 'Update Contacts';
    case 'crm.contacts.delete': return 'Delete Contacts';
    case 'crm.contacts.assign': return 'Assign Contacts';

    // Territories
    case 'crm.territories.view': return 'View';
    case 'crm.territories.create': return 'Create';
    case 'crm.territories.update': return 'Update';
    case 'crm.territories.delete': return 'Delete';
    case 'crm.territories.assign': return 'Assign Manager';

    // Teams & Executives
    case 'crm.teams.view': return 'View';
    case 'crm.teams.create': return 'Create';
    case 'crm.teams.update': return 'Update';
    case 'crm.teams.assign': return 'Assign Members';
    case 'crm.executives.view': return 'View Executives';

    // Reports & Analytics
    case 'crm.reports.view': return 'View Reports';
    case 'crm.dashboard.view': return 'View Dashboards';
    case 'crm.performance.view': return 'View Performance';
    case 'crm.pipeline.view': return 'View Pipeline';
    case 'crm.incentives.view': return 'View Incentives';
    case 'crm.targets.view': return 'View Targets';
    case 'crm.categories.view': return 'View Categories';
    case 'crm.customers.view': return 'View Customers';
    case 'crm.demos.view': return 'View Demos';
    case 'crm.followups.view': return 'View Follow-ups';
    case 'crm.visits.view': return 'View Visits';
    case 'crm.map.view': return 'View Maps';
    case 'crm.notifications.view': return 'View Alerts';
    case 'crm.notifications.create': return 'Create Alerts';
    case 'crm.notifications.manage': return 'Manage Alerts';

    // Attendance & Shifts
    case 'workforce.shifts.view': return 'View Shifts';
    case 'workforce.shifts.create': return 'Create Shifts';
    case 'workforce.shifts.update': return 'Update Shifts';
    case 'workforce.shifts.assign': return 'Assign Shifts';
    case 'attendance.self.punch': return 'Self Punch';
    case 'attendance.monitoring.view': return 'Monitor Punches';

    // Payroll
    case 'payroll.payslips.view': return 'View Payslips';
    case 'payroll.salary_structure.view': return 'View Structure';
    case 'payroll.salary_structure.manage': return 'Manage Structure';
    case 'payroll.runs.generate': return 'Run Payroll';
    case 'payroll.payslips.pay': return 'Pay Invoices';

    // Platform / Workspace Settings
    case 'system.settings.manage': return 'Workspace Settings';
    case 'system.masters.view': return 'View Masters';
    case 'system.masters.manage': return 'Manage Masters';
    case 'tenant.roles.view': return 'View Roles';
    case 'tenant.roles.manage': return 'Manage Roles';
    case 'system.media.view': return 'View Media';
    case 'system.media.manage': return 'Manage Media';

    default:
      if (p.action === 'view') return `View ${formatWord(p.moduleKey.replace(/^crm_|^system_/, ''))}`;
      if (p.action === 'manage') return `Manage ${formatWord(p.moduleKey.replace(/^crm_|^system_/, ''))}`;
      return formatWord(p.action);
  }
}

function formatWord(str: string): string {
  return str
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
