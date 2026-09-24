import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmPolicy } from './crm-policy';
import { CrmRepository } from './crm.repository';
import { CrmService } from './crm.service';

const actor: RequestPrincipal = {
  userId: 'user-admin', sessionId: 'session-admin', tenantId: 'tenant-a', membershipId: 'member-admin',
  tenantRoleCode: 'tenant_admin', tenantPermissions: ['crm.executives.view'], platformPermissions: [],
  platformRoleCodes: [], permissions: ['crm.executives.view'], dataScope: 'TENANT', contextVersion: 1,
  permissionVersion: { tenant: null, platform: null }, isPlatformOnly: false,
};

describe('CRM executive directory', () => {
  const requirePermission = jest.fn();
  const tx = {
    tenantSettings: { findUnique: jest.fn() },
    tenantMembership: { findMany: jest.fn() },
    leadVisit: { findMany: jest.fn() },
    lead: { findMany: jest.fn() },
    attendance: { findMany: jest.fn() },
  };
  const repo = {
    run: jest.fn((_principal: RequestPrincipal, _write: boolean,
      work: (transaction: Prisma.TransactionClient, policy: CrmPolicy) => Promise<unknown>) =>
      work(tx as unknown as Prisma.TransactionClient, {
        scope: { tenantId: actor.tenantId, membershipId: actor.membershipId },
        require: requirePermission,
      } as unknown as CrmPolicy)),
  } as unknown as CrmRepository;
  const service = new CrmService(repo);

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-09-24T06:00:00.000Z'));
    jest.clearAllMocks();
    tx.tenantSettings.findUnique.mockResolvedValue({ timezone: 'Asia/Kolkata' });
    tx.tenantMembership.findMany.mockResolvedValue([
      {
        id: 'member-vikram', status: 'ACTIVE', employeeCode: 'FE-1002', joinedAt: new Date('2026-09-05T00:00:00.000Z'),
        createdAt: new Date('2026-09-05T00:00:00.000Z'), team: { name: 'West Team' },
        user: { fullName: 'Vikram Singh', email: 'vikram@example.test', mobile: '+919876543210', avatarUrl: 'vikram.jpg', employeeCode: 'USR-2', joinedAt: new Date('2026-09-05T00:00:00.000Z'), status: 'ACTIVE' },
        territoryMemberships: [{ territory: { name: 'West', city: 'Mumbai', regionArea: null, state: 'Maharashtra' } }],
      },
      {
        id: 'member-neha', status: 'DEACTIVATED', employeeCode: null, joinedAt: new Date('2026-08-01T00:00:00.000Z'),
        createdAt: new Date('2026-08-01T00:00:00.000Z'), team: null,
        user: { fullName: 'Neha Patil', email: 'neha@example.test', mobile: null, avatarUrl: null, employeeCode: 'USR-3', joinedAt: new Date('2026-08-01T00:00:00.000Z'), status: 'ACTIVE' },
        territoryMemberships: [],
      },
    ]);
    tx.leadVisit.findMany.mockResolvedValue([{ executiveMembershipId: 'member-vikram', status: 'IN_PROGRESS' }]);
    tx.lead.findMany
      .mockResolvedValueOnce([{ assignedMembershipId: 'member-vikram' }])
      .mockResolvedValueOnce([{ assignedMembershipId: 'member-vikram' }, { assignedMembershipId: 'member-vikram' }]);
    tx.attendance.findMany.mockResolvedValue([]);
  });

  afterEach(() => jest.useRealTimers());

  it('returns tenant-scoped live directory data without exposing membership UUIDs as employee IDs', async () => {
    const result = await service.listExecutives(actor, { page: '1', limit: '10', region: 'Mumbai' });

    expect(requirePermission).toHaveBeenCalledWith('crm.executives.view');
    expect(tx.tenantMembership.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ tenantId: 'tenant-a' }),
    }));
    expect(tx.leadVisit.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        tenantId: 'tenant-a',
        checkInTime: { gte: new Date('2026-09-23T18:30:00.000Z'), lt: new Date('2026-09-24T18:30:00.000Z') },
      }),
    }));
    expect(result).toMatchObject({
      total: 1,
      summary: { total: 2, onField: 1, inactive: 1, newThisMonth: 1 },
      regions: ['Mumbai', 'Not assigned'],
      items: [{ membershipId: 'member-vikram', employeeCode: 'FE-1002', status: 'On Field', visitsToday: 1, leadsToday: 1 }],
      topPerformers: [{ membershipId: 'member-vikram', name: 'Vikram Singh', leads: 2 }],
    });
  });
});
