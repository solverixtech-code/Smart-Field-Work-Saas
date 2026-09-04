import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantRoleService } from './tenant-role.service';
import { PrismaService } from '../../persistence/prisma.service';
import { TenantStatus } from '@prisma/client';

describe('TenantService (Phase 0.2 Foundation)', () => {
  let tenantService: TenantService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TenantService, TenantRoleService, PrismaService],
    }).compile();

    tenantService = module.get<TenantService>(TenantService);
    prisma = module.get<PrismaService>(PrismaService);
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
      slug: 'acme-labs',
      displayName: 'ACME Labs Inc',
      legalName: 'ACME Laboratories Private Limited',
      primaryDomain: 'acme.com',
      websiteUrl: 'https://acme.com',
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
    expect(res.slug).toBe('acme-labs');
    expect(res.displayName).toBe('ACME Labs Inc');
    expect(res.primaryDomain).toBe('acme.com');
    expect(res.addresses.length).toBe(1);
    expect(res.addresses[0].city).toBe('Bengaluru');
    expect(res.settings?.timezone).toBe('Asia/Kolkata');
    expect(res.branding?.primaryColor).toBe('#0D1F3D');

    // Built-in roles check
    const roles = await prisma.tenantRole.findMany({ where: { tenantId: res.id } });
    expect(roles.length).toBeGreaterThan(0);
  });

  it('should reject duplicate tenant slug with ConflictException', async () => {
    await tenantService.createTenantFoundation({ slug: 'dup-slug', displayName: 'First' });
    await expect(
      tenantService.createTenantFoundation({ slug: 'dup-slug', displayName: 'Second' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should list tenants with pagination and search', async () => {
    await tenantService.createTenantFoundation({ slug: 'search-one', displayName: 'Alpha Pharma' });
    await tenantService.createTenantFoundation({ slug: 'search-two', displayName: 'Beta Solar' });

    const listAll = await tenantService.getTenants({ page: 1, limit: 10 });
    expect(listAll.data.length).toBe(2);

    const searchRes = await tenantService.getTenants({ search: 'Alpha' });
    expect(searchRes.data.length).toBe(1);
    expect(searchRes.data[0].slug).toBe('search-one');
  });

  it('should update tenant lifecycle status', async () => {
    const t = await tenantService.createTenantFoundation({ slug: 'lifecycle-t', displayName: 'Lifecycle' });
    expect(t.status).toBe(TenantStatus.DRAFT);

    const updated = await tenantService.updateTenantStatus(t.id, TenantStatus.ACTIVE);
    expect(updated.status).toBe(TenantStatus.ACTIVE);
    expect(updated.activatedAt).toBeDefined();
  });
});
