import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmPolicy } from './crm-policy';
import { CrmRepository } from './crm.repository';
import { TargetService } from './target.service';

const actor: RequestPrincipal = {
  userId: 'admin-user', sessionId: 'session', tenantId: 'tenant-a', membershipId: 'admin-member', tenantRoleCode: 'tenant_admin',
  tenantPermissions: ['crm.targets.view', 'crm.targets.manage'], platformPermissions: [], platformRoleCodes: [],
  permissions: ['crm.targets.view', 'crm.targets.manage'], dataScope: 'TENANT', contextVersion: 1,
  permissionVersion: { tenant: null, platform: null }, isPlatformOnly: false,
};

describe('TargetService', () => {
  const requirePermission = jest.fn();
  const tx = {
    tenantSettings: { findUnique: jest.fn() }, salesTarget: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    team: { findMany: jest.fn(), findFirst: jest.fn() }, tenantMembership: { findMany: jest.fn(), findFirst: jest.fn() },
    opportunity: { findMany: jest.fn() }, leadVisit: { findMany: jest.fn() }, leadDemo: { findMany: jest.fn() },
    incentiveCalculation: { findMany: jest.fn() },
  };
  const repo = { run: jest.fn((_actor: RequestPrincipal, _write: boolean, work: (transaction: Prisma.TransactionClient, policy: CrmPolicy) => Promise<unknown>) => work(tx as unknown as Prisma.TransactionClient, { scope: { tenantId: actor.tenantId, membershipId: actor.membershipId }, require: requirePermission } as unknown as CrmPolicy)) } as unknown as CrmRepository;
  const service = new TargetService(repo);

  beforeEach(() => {
    jest.clearAllMocks();
    tx.tenantSettings.findUnique.mockResolvedValue({ timezone: 'Asia/Kolkata' });
    tx.salesTarget.findMany.mockResolvedValue([{ id: 'target-1', title: 'West revenue', period: '2026-09', metric: 'sales_amount', targetValue: 100000, thresholdPct: 80, teamId: 'team-1', membershipId: null }]);
    tx.team.findMany.mockResolvedValue([{ id: 'team-1', name: 'West Team', code: 'WEST', tenantMemberships: [{ id: 'leader-1', department: 'Sales', designation: 'Manager', tenantRole: { code: 'team_leader' }, user: { fullName: 'Vikram Singh', avatarUrl: 'vikram.jpg', role: 'TEAM_LEADER' } }] }]);
    tx.tenantMembership.findMany.mockResolvedValue([{ id: 'exec-1', employeeCode: 'FE-1', designation: 'Field Executive', teamId: 'team-1', team: { name: 'West Team' }, user: { fullName: 'Asha Rao', avatarUrl: 'asha.jpg', employeeCode: 'USR-1' } }]);
    tx.opportunity.findMany.mockResolvedValue([{ amount: 75000, closedAt: new Date('2026-09-15T08:00:00Z'), updatedAt: new Date('2026-09-15T08:00:00Z'), assignedMembership: { id: 'exec-1', teamId: 'team-1' }, ownerMembership: { id: 'admin-member', teamId: null } }]);
    tx.leadVisit.findMany.mockResolvedValue([]);
    tx.leadDemo.findMany.mockResolvedValue([]);
    tx.incentiveCalculation.findMany.mockResolvedValue([]);
  });

  it('returns calculated team achievement from persisted targets and won opportunities', async () => {
    const result = await service.dashboard(actor, { period: '2026-09', comparePeriod: '2026-08' });
    expect(requirePermission).toHaveBeenCalledWith('crm.targets.view');
    expect(result.summary).toMatchObject({ totalTarget: 100000, achieved: 75000, achievementPercent: 75, activeExecutives: 1 });
    expect(result.teams[0]).toMatchObject({ teamName: 'West Team', teamLeaderName: 'Vikram Singh', targetAmount: 100000, achievedAmount: 75000, status: 'At Risk' });
    expect(result.options.executives[0]).toMatchObject({ value: 'exec-1', label: 'Asha Rao', avatar: 'asha.jpg' });
  });

  it('upserts an existing team target within the tenant', async () => {
    tx.team.findFirst.mockResolvedValue({ id: 'team-1' });
    tx.salesTarget.findFirst.mockResolvedValue({ id: 'target-1' });
    tx.salesTarget.update.mockResolvedValue({ id: 'target-1', period: '2026-09', metric: 'sales_amount', targetValue: 120000, revision: 2 });
    const result = await service.setTarget(actor, { targetType: 'team', scopeId: '11111111-1111-4111-8111-111111111111', title: 'Updated target', period: '2026-09', metric: 'sales_amount', targetValue: 120000, thresholdPct: 80 });
    expect(requirePermission).toHaveBeenCalledWith('crm.targets.manage');
    expect(tx.salesTarget.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'target-1' }, data: expect.objectContaining({ revision: { increment: 1 } }) }));
    expect(result).toMatchObject({ id: 'target-1', targetValue: 120000, revision: 2 });
  });
});
