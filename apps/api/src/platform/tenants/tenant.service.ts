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
    // 1. Validate displayName invariant
    if (!input.displayName || !input.displayName.trim()) {
      throw new BadRequestException('displayName is required and cannot be empty.');
    }

    const slug = input.slug.trim().toLowerCase();

    // 2. Canonical slug format invariant: lowercase alphanumeric with single hyphens
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new BadRequestException(
        `Invalid slug format '${slug}'. Slug must be lowercase URL-safe kebab-case (e.g. 'abc-pharma').`,
      );
    }

    // Check slug uniqueness
    const existingSlug = await this.prisma.tenant.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException(`Tenant with slug '${slug}' already exists.`);
    }

    // 3. Normalize and validate primaryDomain hostname format & uniqueness if provided
    let primaryDomain: string | undefined = undefined;
    if (input.primaryDomain && input.primaryDomain.trim()) {
      primaryDomain = input.primaryDomain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '');

      const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
      if (!domainRegex.test(primaryDomain)) {
        throw new BadRequestException(`Invalid primaryDomain hostname format '${primaryDomain}'.`);
      }

      const existingDomain = await this.prisma.tenant.findUnique({
        where: { primaryDomain },
      });
      if (existingDomain) {
        throw new ConflictException(`Tenant with primary domain '${primaryDomain}' already exists.`);
      }
    }

    // 4. Validate settings invariants (timezone, currency, financialYearStartMonth)
    const timezone = input.settings?.timezone || 'Asia/Kolkata';
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch {
      throw new BadRequestException(`Invalid IANA timezone '${timezone}'.`);
    }

    const currency = (input.settings?.currency || 'INR').trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new BadRequestException(`Invalid ISO-4217 currency code '${currency}'.`);
    }

    if (input.settings?.financialYearStartMonth !== undefined) {
      const m = input.settings.financialYearStartMonth;
      if (!Number.isInteger(m) || m < 1 || m > 12) {
        throw new BadRequestException(`financialYearStartMonth must be an integer between 1 and 12.`);
      }
    }

    // 5. Validate countryCode invariant if address provided
    let countryCode = 'IN';
    if (input.address?.countryCode) {
      countryCode = input.address.countryCode.trim().toUpperCase();
      if (!/^[A-Z]{2}$/.test(countryCode)) {
        throw new BadRequestException(`Invalid ISO-3166-1 alpha-2 country code '${countryCode}'.`);
      }
    }

    // 6. Validate branding colors if supplied
    if (input.branding?.primaryColor && !/^#[0-9A-Fa-f]{6}$/.test(input.branding.primaryColor)) {
      throw new BadRequestException(`Invalid primaryColor hex code '${input.branding.primaryColor}'.`);
    }
    if (input.branding?.secondaryColor && !/^#[0-9A-Fa-f]{6}$/.test(input.branding.secondaryColor)) {
      throw new BadRequestException(`Invalid secondaryColor hex code '${input.branding.secondaryColor}'.`);
    }

    // Single atomic transaction creating Tenant + Settings + Branding + Address + Built-in Roles
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
          timezone: timezone,
          currency: currency,
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
            countryCode: countryCode,
            isPrimary: input.address.isPrimary ?? true,
          },
        });
      }

      // Ensure built-in roles are instantiated WITHIN the transaction
      await this.tenantRoleService.ensureBuiltInTenantRoles(tenant.id, tx);

      return tenant;
    });

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

    const sortField = query.sortBy || 'createdAt';
    const sortDirection = query.sortDirection || 'desc';

    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortField]: sortDirection },
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

    // Enforce Tenant Lifecycle Transition Policy
    this.validateTenantStatusTransition(tenant.status, newStatus);

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

  private validateTenantStatusTransition(current: TenantStatus, target: TenantStatus): void {
    if (current === target) return;

    const allowedTransitions: Record<TenantStatus, TenantStatus[]> = {
      [TenantStatus.DRAFT]: [TenantStatus.ACTIVE, TenantStatus.CANCELLED, TenantStatus.ARCHIVED],
      [TenantStatus.ACTIVE]: [TenantStatus.SUSPENDED, TenantStatus.CANCELLED, TenantStatus.ARCHIVED],
      [TenantStatus.SUSPENDED]: [TenantStatus.ACTIVE, TenantStatus.CANCELLED, TenantStatus.ARCHIVED],
      [TenantStatus.CANCELLED]: [TenantStatus.ARCHIVED],
      [TenantStatus.ARCHIVED]: [], // Terminal
    };

    const allowed = allowedTransitions[current] || [];
    if (!allowed.includes(target)) {
      throw new BadRequestException(
        `Invalid tenant status transition from '${current}' to '${target}'.`,
      );
    }
  }
}
