import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmPolicy } from './crm-policy';
import { CrmRepository } from './crm.repository';
import { MapService } from './map.service';

const actor: RequestPrincipal = {
  userId: 'admin-user', sessionId: 'session', tenantId: 'tenant-a', membershipId: 'admin-member', tenantRoleCode: 'tenant_admin',
  tenantPermissions: ['crm.map.view'], platformPermissions: [], platformRoleCodes: [], permissions: ['crm.map.view'],
  dataScope: 'TENANT', contextVersion: 1, permissionVersion: { tenant: null, platform: null }, isPlatformOnly: false,
};

describe('MapService', () => {
  const requirePermission = jest.fn();
  const tx = {
    tenantSettings: { findUnique: jest.fn() },
    tenantMembership: { findMany: jest.fn(), findFirst: jest.fn() },
    leadVisit: { findMany: jest.fn() },
    punchLog: { findMany: jest.fn() },
    territory: { findMany: jest.fn() },
    opportunity: { findMany: jest.fn() },
  };
  const repo = {
    run: jest.fn((_actor: RequestPrincipal, _write: boolean, work: (transaction: Prisma.TransactionClient, policy: CrmPolicy) => Promise<unknown>) =>
      work(tx as unknown as Prisma.TransactionClient, { scope: { tenantId: 'tenant-a', membershipId: 'admin-member' }, require: requirePermission } as unknown as CrmPolicy)),
  } as unknown as CrmRepository;
  const service = new MapService(repo);

  beforeEach(() => {
    jest.clearAllMocks();
    tx.tenantSettings.findUnique.mockResolvedValue({ timezone: 'Asia/Kolkata' });
    tx.tenantMembership.findMany.mockResolvedValue([{
      id: 'exec-1', employeeCode: 'FE-1', team: { name: 'West' },
      user: { fullName: 'Asha Rao', avatarUrl: null, mobile: '9000000000' },
    }]);
    tx.leadVisit.findMany.mockResolvedValue([{
      id: 'visit-1', leadId: 'lead-1', accountId: null, targetType: 'LEAD', targetName: 'Asha Stores',
      contactName: 'Asha', contactPhone: '9000000000', executiveMembershipId: 'exec-1', executiveName: 'Asha Rao', executiveAvatar: null,
      checkInTime: new Date('2026-09-24T05:00:00Z'), checkOutTime: null, durationMinutes: 30,
      location: 'Andheri East', latitude: 19.1, longitude: 72.8, status: 'IN_PROGRESS', outcome: null, routeArea: 'West',
      lead: { status: 'OPEN', priority: 'HIGH', territory: { name: 'Andheri' } }, account: null,
    }]);
    tx.punchLog.findMany.mockResolvedValue([{
      id: 'punch-1', tenantMembershipId: 'exec-1', type: 'PUNCH_IN', timestamp: new Date('2026-09-24T04:00:00Z'),
      latitude: 19.09, longitude: 72.79, locationName: 'Depot',
    }]);
    tx.territory.findMany.mockResolvedValue([{
      id: 'territory-1', code: 'WEST', name: 'Andheri', color: '#2563EB', regionArea: 'West', city: 'Mumbai',
      boundaryPoints: [{ latitude: 19, longitude: 72 }, { latitude: 20, longitude: 72 }, { latitude: 20, longitude: 73 }],
      _count: { members: 1 }, targets: [{ monthlyTarget: 100000, monthlyAchieved: 75000 }],
    }]);
    tx.opportunity.findMany.mockResolvedValue([]);
    tx.tenantMembership.findFirst.mockResolvedValue({ id: 'exec-1', employeeCode: 'FE-1', user: { fullName: 'Asha Rao', avatarUrl: null } });
  });

  it('returns tenant-scoped persisted locations and territory performance', async () => {
    const result = await service.snapshot(actor, { startDate: '2026-09-24', endDate: '2026-09-24' });
    expect(requirePermission).toHaveBeenCalledWith('crm.map.view');
    expect(tx.leadVisit.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tenantId: 'tenant-a' }) }));
    expect(result.summary).toMatchObject({ totalExecutives: 1, activeExecutives: 1, onField: 1, visits: 1, territories: 1, territoryAchievement: 75 });
    expect(result.executives[0]).toMatchObject({ id: 'exec-1', currentLocation: 'Andheri East', batteryLevel: null });
    expect(result.prospects[0]).toMatchObject({ name: 'Asha Stores', detailPath: '/admin/leads/lead-1' });
  });

  it('builds route distance from recorded attendance and visit coordinates', async () => {
    const result = await service.route(actor, 'exec-1', { date: '2026-09-24' });
    expect(tx.tenantMembership.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: 'exec-1', tenantId: 'tenant-a' }) }));
    expect(result.stops).toHaveLength(2);
    expect(result.totalDistanceKm).toBeGreaterThan(0);
    expect(result.totalVisitsCompleted).toBe(0);
  });
});
