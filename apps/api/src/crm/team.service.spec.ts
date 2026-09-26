import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmPolicy } from './crm-policy';
import { CrmRepository } from './crm.repository';
import { TeamService } from './team.service';

const actor: RequestPrincipal = {
  userId: 'user-admin', sessionId: 'session-admin', tenantId: 'tenant-a', membershipId: 'member-admin',
  tenantRoleCode: 'tenant_admin', tenantPermissions: ['crm.teams.view'], platformPermissions: [],
  platformRoleCodes: [], permissions: ['crm.teams.view'], dataScope: 'TENANT', contextVersion: 1,
  permissionVersion: { tenant: null, platform: null }, isPlatformOnly: false,
};

describe('TeamService', () => {
  const requirePermission = jest.fn();
  const tx = {
    tenantSettings: { findUnique: jest.fn() },
    team: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    tenantMembership: { findFirst: jest.fn(), update: jest.fn(), count: jest.fn(), updateMany: jest.fn() },
    salesTarget: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
    territory: { findMany: jest.fn() },
    opportunity: { findMany: jest.fn() },
  };
  const repo = {
    run: jest.fn((_actor: RequestPrincipal, _write: boolean,
      work: (transaction: Prisma.TransactionClient, policy: CrmPolicy) => Promise<unknown>) =>
      work(tx as unknown as Prisma.TransactionClient, {
        scope: { tenantId: actor.tenantId, membershipId: actor.membershipId },
        require: requirePermission,
      } as unknown as CrmPolicy)),
    audit: jest.fn(),
  } as unknown as CrmRepository;
  const service = new TeamService(repo);

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-24T06:00:00.000Z'));
    jest.clearAllMocks();
    tx.tenantSettings.findUnique.mockResolvedValue({ timezone: 'Asia/Kolkata' });
    tx.team.findMany.mockResolvedValue([{
      id: 'team-west', name: 'West Team', code: 'WEST-01', description: null, isActive: true,
      tenantMemberships: [
        { id: 'leader-vikram', employeeCode: 'TL-1002', department: 'Sales', tenantRole: { code: 'team_leader' }, user: { fullName: 'Vikram Singh', employeeCode: 'USR-2', avatarUrl: 'vikram.jpg', role: 'TEAM_LEADER' } },
        { id: 'member-neha', employeeCode: 'FE-1003', department: 'Sales', tenantRole: { code: 'field_executive' }, user: { fullName: 'Neha Patil', employeeCode: 'USR-3', avatarUrl: null, role: 'FIELD_EXECUTIVE' } },
      ],
    }]);
    tx.territory.findMany.mockResolvedValue([{
      name: 'Mumbai West', city: 'Mumbai', regionArea: 'Western Region', state: 'Maharashtra',
      members: [{ membership: { teamId: 'team-west' } }],
      targets: [{ monthlyTarget: 100000, monthlyAchieved: 75000 }],
    }]);
    tx.opportunity.findMany.mockResolvedValue([
      { createdAt: new Date('2026-09-10T00:00:00.000Z'), assignedMembership: { teamId: 'team-west' }, ownerMembership: { teamId: 'team-west' } },
      { createdAt: new Date('2026-08-10T00:00:00.000Z'), assignedMembership: null, ownerMembership: { teamId: 'team-west' } },
    ]);
  });

  afterEach(() => jest.useRealTimers());

  it('returns tenant teams with real leaders, territory targets, and pipeline totals', async () => {
    const result = await service.list(actor, { page: '1', limit: '10' });

    expect(requirePermission).toHaveBeenCalledWith('crm.teams.view');
    expect(tx.team.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { tenantId: 'tenant-a' } }));
    expect(tx.territory.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ tenantId: 'tenant-a', deletedAt: null }),
    }));
    expect(result).toMatchObject({
      total: 1,
      summary: { totalTeams: 1, totalMembers: 2, activeTeams: 1, averageTeamSize: 2, currentDeals: 1, dealChangePercent: 0 },
      items: [{
        id: 'team-west', leaderName: 'Vikram Singh', leaderAvatarUrl: 'vikram.jpg', memberCount: 2,
        region: 'Western Region', monthlyTarget: 100000, achievedAmount: 75000, achievedPercent: 75,
      }],
      distribution: [{ region: 'Western Region', value: 1 }],
    });
  });

  it('creates a tenant team and assigns its selected leader', async () => {
    tx.team.findFirst.mockResolvedValue(null);
    tx.tenantMembership.findFirst.mockResolvedValue({ id: '11111111-1111-4111-8111-111111111111' });
    tx.team.create.mockResolvedValue({ id: 'team-new', name: 'Central Sales', code: 'CENTRAL-01' });
    tx.tenantMembership.update.mockResolvedValue({ id: '11111111-1111-4111-8111-111111111111' });

    const result = await service.create(actor, {
      name: 'Central Sales', code: 'central-01', leaderMembershipId: '11111111-1111-4111-8111-111111111111',
      department: 'Sales', region: 'Central', monthlyTarget: 0, teamType: 'Field Sales', status: 'Active',
      dealAssignment: 'Both Manual & Auto', visibility: 'Private',
    });

    expect(requirePermission).toHaveBeenCalledWith('crm.teams.create');
    expect(tx.team.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ tenantId: 'tenant-a', code: 'CENTRAL-01' }) }));
    expect(tx.tenantMembership.update).toHaveBeenCalledWith({ where: { id: '11111111-1111-4111-8111-111111111111' }, data: { teamId: 'team-new' } });
    expect(result).toEqual({ id: 'team-new', name: 'Central Sales', code: 'CENTRAL-01' });
  });

  it('assigns only active memberships from the current tenant', async () => {
    tx.team.findFirst.mockResolvedValue({ id: 'team-west', leaderMembershipId: null });
    tx.tenantMembership.count.mockResolvedValue(2);
    tx.tenantMembership.updateMany.mockResolvedValue({ count: 2 });
    const membershipIds = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'];

    await service.assignMembers(actor, 'team-west', { membershipIds, designation: 'Field Executive' });

    expect(requirePermission).toHaveBeenCalledWith('crm.teams.assign');
    expect(tx.tenantMembership.count).toHaveBeenCalledWith({ where: { id: { in: membershipIds }, tenantId: 'tenant-a', status: 'ACTIVE' } });
    expect(tx.tenantMembership.updateMany).toHaveBeenCalledWith({
      where: { id: { in: membershipIds }, tenantId: 'tenant-a' },
      data: { teamId: 'team-west', designation: 'Field Executive' },
    });
  });
});
