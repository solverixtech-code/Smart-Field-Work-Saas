import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { TenantRoleService } from './tenant-role.service';
import { CreateTenantFoundationDto } from './dto/create-tenant-foundation.dto';
import { TenantQueryDto } from './dto/tenant-query.dto';
import {
  TenantDetailDto,
  TenantSummaryDto,
  PaginatedTenantResponseDto,
} from './dto/tenant-response.dto';
import { TenantStatus, Prisma } from '@prisma/client';

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantRoleService: TenantRoleService,
  ) {}

  /**
   * Transactionally creates a foundation Tenant with normalized settings, branding, address, and built-in roles.
   */
  async createTenantFoundation(input: CreateTenantFoundationDto): Promise<TenantDetailDto> {
    const slug = input.slug.trim().toLowerCase();

    // Check slug uniqueness
    const existingSlug = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException(`Tenant with slug '${slug}' already exists.`);
    }

    // Normalize and check primaryDomain uniqueness if provided
    let primaryDomain: string | undefined = undefined;
    if (input.primaryDomain && input.primaryDomain.trim()) {
      primaryDomain = input.primaryDomain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '');

      const existingDomain = await this.prisma.tenant.findUnique({
        where: { primaryDomain },
      });
      if (existingDomain) {
        throw new ConflictException(`Tenant with primary domain '${primaryDomain}' already exists.`);
      }
    }

    const createdTenant = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug,
          displayName: input.displayName.trim(),
          legalName: input.legalName?.trim() || null,
          primaryDomain: primaryDomain || null,
          websiteUrl: input.websiteUrl?.trim() || null,
          status: input.status || TenantStatus.DRAFT,
          companySizeCode: input.companySizeCode || null,
          description: input.description?.trim() || null,
          activatedAt: input.status === TenantStatus.ACTIVE ? new Date() : null,
        },
      });

      // Settings child
      const settingsInput = input.settings || {};
      await tx.tenantSettings.create({
        data: {
          tenantId: tenant.id,
          timezone: settingsInput.timezone || 'Asia/Kolkata',
          currency: settingsInput.currency || 'INR',
          locale: settingsInput.locale || 'en-IN',
          language: settingsInput.language || 'en',
          dateFormat: settingsInput.dateFormat || 'YYYY-MM-DD',
          weekStartDay: settingsInput.weekStartDay || 'MONDAY',
          financialYearStartMonth: settingsInput.financialYearStartMonth ?? 4,
          configVersion: 1,
        },
      });

      // Branding child
      const brandingInput = input.branding || {};
      await tx.tenantBranding.create({
        data: {
          tenantId: tenant.id,
          shortName: brandingInput.shortName?.trim() || null,
          primaryColor: brandingInput.primaryColor || '#0D1F3D',
          secondaryColor: brandingInput.secondaryColor || null,
          logoUrl: brandingInput.logoUrl || null,
          showLogoOnLogin: brandingInput.showLogoOnLogin ?? false,
        },
      });

      // Address child if provided
      if (input.address) {
        await tx.tenantAddress.create({
          data: {
            tenantId: tenant.id,
            type: input.address.type,
            label: input.address.label?.trim() || null,
            line1: input.address.line1.trim(),
            line2: input.address.line2?.trim() || null,
            city: input.address.city.trim(),
            stateOrRegion: input.address.stateOrRegion?.trim() || null,
            postalCode: input.address.postalCode?.trim() || null,
            countryCode: input.address.countryCode || 'IN',
            isPrimary: input.address.isPrimary ?? true,
          },
        });
      }

      return tenant;
    });

    // Ensure built-in roles instantiated for tenant
    await this.tenantRoleService.ensureBuiltInTenantRoles(createdTenant.id);

    return this.getTenantById(createdTenant.id);
  }

  async getTenants(query: TenantQueryDto): Promise<PaginatedTenantResponseDto> {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.TenantWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { displayName: { contains: term, mode: 'insensitive' } },
        { legalName: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        { primaryDomain: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [query.sortBy || 'createdAt']: query.sortDirection || 'desc' },
        include: {
          _count: {
            select: { memberships: true },
          },
        },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    const data: TenantSummaryDto[] = items.map((t) => ({
      id: t.id,
      slug: t.slug,
      displayName: t.displayName,
      legalName: t.legalName,
      primaryDomain: t.primaryDomain,
      websiteUrl: t.websiteUrl,
      status: t.status,
      companySizeCode: t.companySizeCode,
      membershipCount: t._count.memberships,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTenantById(id: string): Promise<TenantDetailDto> {
    const t = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        addresses: true,
        settings: true,
        branding: true,
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!t) {
      throw new NotFoundException(`Tenant with ID '${id}' not found.`);
    }

    return {
      id: t.id,
      slug: t.slug,
      displayName: t.displayName,
      legalName: t.legalName,
      primaryDomain: t.primaryDomain,
      websiteUrl: t.websiteUrl,
      status: t.status,
      companySizeCode: t.companySizeCode,
      description: t.description,
      membershipCount: t._count.memberships,
      activatedAt: t.activatedAt?.toISOString() || null,
      suspendedAt: t.suspendedAt?.toISOString() || null,
      cancelledAt: t.cancelledAt?.toISOString() || null,
      archivedAt: t.archivedAt?.toISOString() || null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      addresses: t.addresses.map((a) => ({
        id: a.id,
        type: a.type,
        label: a.label,
        line1: a.line1,
        line2: a.line2,
        city: a.city,
        stateOrRegion: a.stateOrRegion,
        postalCode: a.postalCode,
        countryCode: a.countryCode,
        isPrimary: a.isPrimary,
      })),
      settings: t.settings
        ? {
            timezone: t.settings.timezone,
            currency: t.settings.currency,
            locale: t.settings.locale,
            language: t.settings.language,
            dateFormat: t.settings.dateFormat,
            weekStartDay: t.settings.weekStartDay,
            financialYearStartMonth: t.settings.financialYearStartMonth,
            configVersion: t.settings.configVersion,
          }
        : null,
      branding: t.branding
        ? {
            shortName: t.branding.shortName,
            primaryColor: t.branding.primaryColor,
            secondaryColor: t.branding.secondaryColor,
            logoUrl: t.branding.logoUrl,
            showLogoOnLogin: t.branding.showLogoOnLogin,
          }
        : null,
    };
  }

  async updateTenantStatus(id: string, newStatus: TenantStatus): Promise<TenantDetailDto> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID '${id}' not found.`);
    }

    const now = new Date();
    const updateData: Prisma.TenantUpdateInput = { status: newStatus };

    if (newStatus === TenantStatus.ACTIVE && !tenant.activatedAt) {
      updateData.activatedAt = now;
    } else if (newStatus === TenantStatus.SUSPENDED) {
      updateData.suspendedAt = now;
    } else if (newStatus === TenantStatus.CANCELLED) {
      updateData.cancelledAt = now;
    } else if (newStatus === TenantStatus.ARCHIVED) {
      updateData.archivedAt = now;
    }

    await this.prisma.tenant.update({
      where: { id },
      data: updateData,
    });

    return this.getTenantById(id);
  }
}
