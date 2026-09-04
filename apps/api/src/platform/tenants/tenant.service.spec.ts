import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantRoleService } from './tenant-role.service';
import { PrismaService } from '../../persistence/prisma.service';
import { seedTenantRoleTemplates } from '../../../prisma/seeds/tenant-role-templates';
import { TenantStatus } from '@prisma/client';

import { verifyTestDatabaseSafety } from '../../test-utils/test-db-safety';

describe('TenantService (Phase 0.2 Foundation)', () => {
  let tenantService: TenantService;
  let prisma: PrismaService;

  beforeEach(async () => {
    verifyTestDatabaseSafety();

    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantService, TenantRoleService, PrismaService],
    }).compile();

    tenantService = module.get<TenantService>(TenantService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clean test data and seed role templates
    await prisma.tenantMembership.deleteMany();
    await prisma.tenantRolePermission.deleteMany();
    await prisma.tenantRole.deleteMany();
    await prisma.tenantAddress.deleteMany();
    await prisma.tenantSettings.deleteMany();
    await prisma.tenantBranding.deleteMany();
    await prisma.tenant.deleteMany();

    await seedTenantRoleTemplates(prisma);
  });

  afterEach(async () => {
    await prisma.tenantMembership.deleteMany();
    await prisma.tenantRolePermission.deleteMany();
    await prisma.tenantRole.deleteMany();
    await prisma.tenantRoleTemplate.deleteMany();
    await prisma.tenantAddress.deleteMany();
    await prisma.tenantSettings.deleteMany();
    await prisma.tenantBranding.deleteMany();
    await prisma.tenant.deleteMany();
  });

  it('should create a foundation tenant with normalized child settings, branding, address and built-in roles', async () => {
    const res = await tenantService.createTenantFoundation({
      slug: 'acme-labs-t1',
      displayName: 'ACME Labs Inc',
      legalName: 'ACME Laboratories Private Limited',
      primaryDomain: 'acme-t1.com',
      websiteUrl: 'https://acme-t1.com',
      companySizeCode: '50-200',
      address: {
        line1: '123 Tech Park',
        city: 'Bengaluru',
        stateOrRegion: 'Karnataka',
        postalCode: '560001',
        countryCode: 'IN',
      },
      branding: {
        primaryColor: '#0D1F3D',
        secondaryColor: '#4F46E5',
      },
      settings: {
        timezone: 'Asia/Kolkata',
        currency: 'INR',
      },
    });

    expect(res.id).toBeDefined();
    expect(res.slug).toBe('acme-labs-t1');
    expect(res.displayName).toBe('ACME Labs Inc');
    expect(res.primaryDomain).toBe('acme-t1.com');
    expect(res.addresses.length).toBe(1);
    expect(res.addresses[0].city).toBe('Bengaluru');
    expect(res.settings?.timezone).toBe('Asia/Kolkata');
    expect(res.branding?.primaryColor).toBe('#0D1F3D');

    // Built-in roles check
    const roles = await prisma.tenantRole.findMany({ where: { tenantId: res.id } });
    expect(roles.length).toBeGreaterThan(0);
  });

  it('should reject duplicate tenant slug with ConflictException', async () => {
    await tenantService.createTenantFoundation({ slug: 'dup-slug-t2', displayName: 'First' });
    await expect(
      tenantService.createTenantFoundation({ slug: 'dup-slug-t2', displayName: 'Second' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should list tenants with pagination and search', async () => {
    await tenantService.createTenantFoundation({ slug: 'search-one-t3', displayName: 'Alpha Pharma' });
    await tenantService.createTenantFoundation({ slug: 'search-two-t3', displayName: 'Beta Solar' });

    const listAll = await tenantService.getTenants({ page: 1, limit: 10 });
    expect(listAll.data.length).toBe(2);

    const searchRes = await tenantService.getTenants({ search: 'Alpha' });
    expect(searchRes.data.length).toBe(1);
    expect(searchRes.data[0].slug).toBe('search-one-t3');
  });

  it('should update tenant lifecycle status', async () => {
    const t = await tenantService.createTenantFoundation({ slug: 'lifecycle-t4', displayName: 'Lifecycle' });
    expect(t.status).toBe(TenantStatus.DRAFT);

    const updated = await tenantService.updateTenantStatus(t.id, TenantStatus.ACTIVE);
    expect(updated.status).toBe(TenantStatus.ACTIVE);
    expect(updated.activatedAt).toBeDefined();
  });

  it('should reject invalid timezone or currency with BadRequestException at domain boundary', async () => {
    await expect(
      tenantService.createTenantFoundation({
        slug: 'invalid-tz',
        displayName: 'Invalid TZ Corp',
        settings: { timezone: 'Mars/Phobos' },
      }),
    ).rejects.toThrow();

    await expect(
      tenantService.createTenantFoundation({
        slug: 'invalid-curr',
        displayName: 'Invalid Currency Corp',
        settings: { currency: 'INVALID_CURRENCY' },
      }),
    ).rejects.toThrow();
  });

  it('should fail foundation creation and rollback transaction if tenant role templates are unseeded', async () => {
    await prisma.tenantRoleTemplate.deleteMany();

    await expect(
      tenantService.createTenantFoundation({
        slug: 'unseeded-roles-t5',
        displayName: 'No Roles Tenant',
      }),
    ).rejects.toThrow('Tenant role templates unavailable');

    const t = await prisma.tenant.findUnique({ where: { slug: 'unseeded-roles-t5' } });
    expect(t).toBeNull();
  });
});
