import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmPolicy } from './crm-policy';
import { CrmRepository } from './crm.repository';
import { DemoService } from './demo.service';

const actor: RequestPrincipal = {
  userId: 'admin-user', sessionId: 'session', tenantId: 'tenant-a', membershipId: 'admin-member', tenantRoleCode: 'tenant_admin',
  tenantPermissions: ['crm.demos.view', 'crm.demos.manage'], platformPermissions: [], platformRoleCodes: [],
  permissions: ['crm.demos.view', 'crm.demos.manage'], dataScope: 'TENANT', contextVersion: 1,
  permissionVersion: { tenant: null, platform: null }, isPlatformOnly: false,
};

describe('DemoService', () => {
  const requirePermission = jest.fn();
  const tx = {
    $queryRaw: jest.fn(),
    lead: { findFirst: jest.fn() },
    leadDemo: { count: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
    tenantMembership: { findFirst: jest.fn() },
    leadHistory: { create: jest.fn() },
  };
  const policy = {
    scope: { tenantId: actor.tenantId, membershipId: actor.membershipId },
    principal: actor,
    require: requirePermission,
  } as unknown as CrmPolicy;
  const repo = {
    run: jest.fn((_actor: RequestPrincipal, _write: boolean, work: (transaction: Prisma.TransactionClient, currentPolicy: CrmPolicy) => Promise<unknown>) => work(tx as unknown as Prisma.TransactionClient, policy)),
  } as unknown as CrmRepository;
  const service = new DemoService(repo);

  beforeEach(() => {
    jest.clearAllMocks();
    tx.lead.findFirst.mockResolvedValue({ id: '11111111-1111-4111-8111-111111111111', businessName: 'Acme', name: 'Acme Lead' });
    tx.tenantMembership.findFirst.mockResolvedValue({ id: '22222222-2222-4222-8222-222222222222', designation: 'Field Executive', tenantRole: { name: 'Field Executive' }, team: { name: 'West' }, user: { fullName: 'Asha Rao', avatarUrl: 'asha.jpg' } });
    tx.leadDemo.count.mockResolvedValue(0);
    tx.$queryRaw.mockResolvedValue([{ pg_advisory_xact_lock: '' }]);
    tx.leadDemo.findFirst.mockResolvedValue(null);
    tx.leadDemo.create.mockResolvedValue({ id: 'demo-1', demoCode: 'DEM-0001', status: 'SCHEDULED' });
    tx.leadHistory.create.mockResolvedValue({});
  });

  it('creates one tenant-owned scheduled demo and records lead history', async () => {
    const result = await service.create(actor, {
      leadId: '11111111-1111-4111-8111-111111111111',
      conductedByMembershipId: '22222222-2222-4222-8222-222222222222',
      demoTitle: 'Field CRM demo', demoDate: '2026-09-30', demoTime: '14:30',
      demoType: 'Product Demo', demoMode: 'In-Person', attendeesCount: 2,
    });

    expect(requirePermission).toHaveBeenCalledWith('crm.demos.manage');
    expect(tx.$queryRaw).toHaveBeenCalledTimes(1);
    expect(tx.leadDemo.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tenantId: 'tenant-a', demoCode: 'DEM-0001', demoTime: '2:30 PM', status: 'SCHEDULED', outcome: 'PENDING' }),
    }));
    expect(tx.leadHistory.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ eventType: 'demo_scheduled', leadId: '11111111-1111-4111-8111-111111111111' }) }));
    expect(result).toMatchObject({ id: 'demo-1', status: 'SCHEDULED' });
  });

  it('rejects unsupported lifecycle values before opening a transaction', async () => {
    await expect(service.create(actor, {
      leadId: '11111111-1111-4111-8111-111111111111', demoTitle: 'Demo', demoDate: '2026-09-30', demoTime: '14:30', demoType: 'Webinar',
    })).rejects.toThrow();
    expect(repo.run).not.toHaveBeenCalled();
  });

  it('rejects an inverted report date range before opening a transaction', async () => {
    await expect(service.conversionReport(actor, {
      from: '2026-09-30',
      to: '2026-09-01',
    })).rejects.toThrow('Start date must be on or before end date.');
    expect(repo.run).not.toHaveBeenCalled();
  });
});
