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
    leadVisit: { findMany: jest.fn(), count: jest.fn() },
    leadDemo: { findMany: jest.fn() },
    punchLog: { findMany: jest.fn() },
    executiveLocationSample: { findMany: jest.fn(), count: jest.fn() },
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
      id: 'exec-1', employeeCode: 'FE-1', designation: 'Field Executive', team: { name: 'West' }, territoryMemberships: [],
      user: { fullName: 'Asha Rao', avatarUrl: null, mobile: '9000000000' },
    }]);
    tx.leadVisit.findMany.mockResolvedValue([{
      id: 'visit-1', leadId: 'lead-1', accountId: null, targetType: 'LEAD', targetName: 'Asha Stores',
      contactName: 'Asha', contactPhone: '9000000000', executiveMembershipId: 'exec-1', executiveName: 'Asha Rao', executiveAvatar: null,
      checkInTime: new Date('2026-09-24T05:00:00Z'), checkOutTime: null, durationMinutes: 30,
      location: 'Andheri East', latitude: 19.1, longitude: 72.8, status: 'IN_PROGRESS', outcome: null, routeArea: 'West',
      createdAt: new Date('2026-09-01T05:00:00Z'),
      lead: {
        status: 'OPEN', priority: 'HIGH', createdAt: new Date('2026-09-01T05:00:00Z'), convertedAt: null,
        assignedMembershipId: 'exec-1', territory: { name: 'Andheri' },
      },
      account: null,
    }]);
    tx.punchLog.findMany.mockResolvedValue([{
      id: 'punch-1', tenantMembershipId: 'exec-1', type: 'PUNCH_IN', timestamp: new Date('2026-09-24T04:00:00Z'),
      latitude: 19.09, longitude: 72.79, locationName: 'Depot',
    }]);
    tx.executiveLocationSample.findMany.mockResolvedValue([
      { id: 'gps-1', membershipId: 'exec-1', capturedAt: new Date('2026-09-24T04:00:00Z'), latitude: 19.09, longitude: 72.79, accuracyMeters: 8, speedKmh: 0, headingDegrees: 90, batteryPercentage: 80 },
      { id: 'gps-2', membershipId: 'exec-1', capturedAt: new Date('2026-09-24T05:00:00Z'), latitude: 19.1, longitude: 72.8, accuracyMeters: 7, speedKmh: 20, headingDegrees: 95, batteryPercentage: 78 },
    ]);
    tx.executiveLocationSample.count.mockResolvedValue(1);
    tx.territory.findMany.mockResolvedValue([{
      id: 'territory-1', code: 'WEST', name: 'Andheri', color: '#2563EB', regionArea: 'West', city: 'Mumbai',
      boundaryPoints: [{ latitude: 19, longitude: 72 }, { latitude: 20, longitude: 72 }, { latitude: 20, longitude: 73 }],
      _count: { members: 1 }, targets: [{ monthlyTarget: 100000, monthlyAchieved: 75000 }],
    }]);
    tx.opportunity.findMany.mockResolvedValue([]);
    tx.leadVisit.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    tx.leadDemo.findMany.mockResolvedValue([{ conductedByMembershipId: 'exec-1' }]);
    tx.tenantMembership.findFirst.mockResolvedValue({ id: 'exec-1', employeeCode: 'FE-1', user: { fullName: 'Asha Rao', avatarUrl: null } });
  });

  it('returns tenant-scoped persisted locations and territory performance', async () => {
    const result = await service.snapshot(actor, { startDate: '2026-09-24', endDate: '2026-09-24' });
    expect(requirePermission).toHaveBeenCalledWith('crm.map.view');
    expect(tx.leadVisit.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        tenantId: 'tenant-a',
        AND: expect.arrayContaining([
          { OR: [{ leadId: null }, { lead: { is: { deletedAt: null } } }] },
          { OR: [{ accountId: null }, { account: { is: { deletedAt: null } } }] },
        ]),
      }),
    }));
    expect(result.summary).toMatchObject({ totalExecutives: 1, activeExecutives: 1, onField: 1, visits: 1, todayVisits: 1, todayCompletedVisits: 0, geofenceAlerts: 0, territories: 1, territoryAchievement: 75 });
    expect(result.executives[0]).toMatchObject({ id: 'exec-1', currentLocation: 'Andheri East', designation: 'Field Executive', batteryLevel: 78, speedKmh: 20, demoCompletedToday: true });
    expect(result.prospects[0]).toMatchObject({
      name: 'Asha Stores', detailPath: '/admin/leads/lead-1', status: 'New Prospect',
      assigned: true, visitedInRange: true, hot: true, convertedThisMonth: false,
    });
  });

  it('builds route distance and coverage from recorded GPS samples', async () => {
    const result = await service.route(actor, 'exec-1', { date: '2026-09-24' });
    expect(tx.tenantMembership.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: 'exec-1', tenantId: 'tenant-a' }) }));
    expect(result.stops).toHaveLength(2);
    expect(result.totalDistanceKm).toBeGreaterThan(0);
    expect(result.trackPoints).toHaveLength(2);
    expect(result.trackPoints[0].nearestEvent).toMatchObject({ type: 'start' });
    expect(result.trackPoints[1].nearestEvent).toMatchObject({ type: 'visit', visitId: 'visit-1' });
    expect(result.usableSampleCount).toBe(2);
    expect(result.rejectedSampleCount).toBe(1);
    expect(result.totalVisitsCompleted).toBe(0);
  });

  it('renders at most 5,000 points while retaining endpoints, sharp turns, and event-adjacent samples', async () => {
    const startedAt = Date.parse('2026-09-24T04:00:00Z');
    const samples = Array.from({ length: 6001 }, (_, index) => ({
      id: `gps-${index}`,
      membershipId: 'exec-1',
      capturedAt: new Date(startedAt + index * 1000),
      latitude: 19.09 + Math.min(index, 3333) * 0.00001,
      longitude: 72.79 + Math.max(0, index - 3333) * 0.00001,
      accuracyMeters: 8,
      speedKmh: 20,
      headingDegrees: null,
    }));
    tx.executiveLocationSample.findMany.mockResolvedValue(samples);

    const result = await service.route(actor, 'exec-1', { date: '2026-09-24' });

    expect(result.usableSampleCount).toBe(6001);
    expect(result.trackPoints.length).toBeLessThanOrEqual(5000);
    expect(result.trackPoints.length).toBeGreaterThan(4900);
    expect(result.trackPoints[0].id).toBe('gps-0');
    expect(result.trackPoints.at(-1)?.id).toBe('gps-6000');
    expect(result.trackPoints.some((point) => point.id === 'gps-3333')).toBe(true);
    expect(result.trackPoints.some((point) => point.id === 'gps-3600')).toBe(true);
    expect(tx.executiveLocationSample.findMany).toHaveBeenCalledWith(expect.not.objectContaining({ take: expect.anything() }));
  });
});
