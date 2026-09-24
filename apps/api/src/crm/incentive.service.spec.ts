import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmPolicy } from './crm-policy';
import { CrmRepository } from './crm.repository';
import { IncentiveService } from './incentive.service';

const actor: RequestPrincipal = {
  userId: 'admin-user', sessionId: 'session', tenantId: 'tenant-a', membershipId: 'admin-member', tenantRoleCode: 'tenant_admin',
  tenantPermissions: ['crm.incentives.view', 'crm.incentives.manage', 'crm.incentives.approve'], platformPermissions: [], platformRoleCodes: [],
  permissions: ['crm.incentives.view', 'crm.incentives.manage', 'crm.incentives.approve'], dataScope: 'TENANT', contextVersion: 1,
  permissionVersion: { tenant: null, platform: null }, isPlatformOnly: false,
};

describe('IncentiveService', () => {
  const requirePermission = jest.fn();
  const tx = {
    incentiveCalculation: { findMany: jest.fn(), update: jest.fn() },
    incentivePayout: { count: jest.fn(), create: jest.fn() },
    incentiveRule: { count: jest.fn() },
  };
  const repo = {
    run: jest.fn((_actor: RequestPrincipal, _write: boolean, work: (transaction: Prisma.TransactionClient, policy: CrmPolicy) => Promise<unknown>) =>
      work(tx as unknown as Prisma.TransactionClient, {
        scope: { tenantId: actor.tenantId, membershipId: actor.membershipId },
        require: requirePermission,
      } as unknown as CrmPolicy)),
  } as unknown as CrmRepository;
  const service = new IncentiveService(repo);

  beforeEach(() => {
    jest.clearAllMocks();
    tx.incentiveCalculation.findMany.mockResolvedValue([{
      id: '11111111-1111-4111-8111-111111111111',
      membershipId: 'executive-member',
      period: '2026-09',
      totalIncentive: new Prisma.Decimal(7500),
      status: 'PENDING_APPROVAL',
      payout: null,
    }]);
    tx.incentivePayout.count.mockResolvedValue(0);
    tx.incentiveRule.count.mockResolvedValue(0);
    tx.incentiveCalculation.update.mockResolvedValue({});
    tx.incentivePayout.create.mockResolvedValue({});
  });

  it('approves a tenant-scoped calculation and creates its persistent payout', async () => {
    const result = await service.approve(actor, { calculationIds: ['11111111-1111-4111-8111-111111111111'] });

    expect(requirePermission).toHaveBeenCalledWith('crm.incentives.approve');
    expect(tx.incentiveCalculation.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ tenantId: 'tenant-a' }),
    }));
    expect(tx.incentiveCalculation.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ status: 'APPROVED', approvedByMembershipId: 'admin-member' }),
    }));
    expect(tx.incentivePayout.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ tenantId: 'tenant-a', payoutCode: 'PAY-202609-0001', amount: new Prisma.Decimal(7500) }),
    }));
    expect(result).toEqual({ approved: 1 });
  });

  it('does not approve a zero-value calculation', async () => {
    tx.incentiveCalculation.findMany.mockResolvedValue([{
      id: '11111111-1111-4111-8111-111111111111',
      membershipId: 'executive-member',
      period: '2026-09',
      totalIncentive: new Prisma.Decimal(0),
      status: 'PENDING_APPROVAL',
      payout: null,
    }]);

    await expect(service.approve(actor, { calculationIds: ['11111111-1111-4111-8111-111111111111'] }))
      .rejects.toThrow('NO_PAYABLE_INCENTIVES_SELECTED');
    expect(tx.incentiveCalculation.update).not.toHaveBeenCalled();
    expect(tx.incentivePayout.create).not.toHaveBeenCalled();
  });

  it('excludes zero-value rows and reports when no active rules apply', async () => {
    tx.incentiveCalculation.findMany.mockResolvedValue([]);

    const result = await service.list(actor, { period: '2026-09' });

    expect(requirePermission).toHaveBeenCalledWith('crm.incentives.view');
    expect(tx.incentiveCalculation.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ tenantId: 'tenant-a', period: '2026-09', totalIncentive: { gt: 0 } }),
    }));
    expect(result).toEqual({
      calculations: [], payouts: [],
      summary: { total: 0, approved: 0, pending: 0, paid: 0, activeEarners: 0, activeRules: 0 },
    });
  });
});
