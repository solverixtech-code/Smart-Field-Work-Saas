import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { CrmPolicy } from './crm-policy';
import { CrmRepository } from './crm.repository';
import { CrmService } from './crm.service';

const actor: RequestPrincipal = {
  userId: randomUUID(),
  sessionId: randomUUID(),
  tenantId: randomUUID(),
  membershipId: randomUUID(),
  tenantRoleCode: 'tenant_admin',
  tenantPermissions: ['crm.executives.view'],
  platformPermissions: [],
  platformRoleCodes: [],
  permissions: ['crm.executives.view'],
  dataScope: 'TENANT',
  contextVersion: 1,
  permissionVersion: { tenant: null, platform: null },
  isPlatformOnly: false,
};

describe('CRM employee profile', () => {
  const membershipId = randomUUID();
  const findFirst = jest.fn();
  const leads = jest.fn();
  const opportunities = jest.fn();
  const visits = jest.fn();
  const attendances = jest.fn();
  const territories = jest.fn();
  const communications = jest.fn();
  const histories = jest.fn();
  const tx = {
    tenantMembership: { findFirst },
    lead: { findMany: leads },
    opportunity: { findMany: opportunities },
    leadVisit: { findMany: visits },
    attendance: { findMany: attendances },
    territoryMember: { findMany: territories },
    leadCommunication: { findMany: communications },
    leadHistory: { findMany: histories },
  } as unknown as Prisma.TransactionClient;
  const repo = {
    run: jest.fn((principal: RequestPrincipal, _write: boolean, work: (transaction: Prisma.TransactionClient, policy: CrmPolicy) => Promise<unknown>) =>
      work(tx, new CrmPolicy(principal))),
  } as unknown as CrmRepository;
  const service = new CrmService(repo);

  beforeEach(() => {
    jest.clearAllMocks();
    leads.mockResolvedValue([]);
    opportunities.mockResolvedValue([]);
    visits.mockResolvedValue([]);
    attendances.mockResolvedValue([]);
    territories.mockResolvedValue([]);
    communications.mockResolvedValue([]);
    histories.mockResolvedValue([]);
  });

  it('returns the requested tenant employee and their stored profile image', async () => {
    findFirst.mockResolvedValue({
      id: membershipId,
      status: 'ACTIVE',
      employeeCode: 'FE-1002',
      designation: null,
      department: 'Sales',
      joinedAt: null,
      tenantRole: { name: 'Field Executive', code: 'field_executive' },
      team: { name: 'West Team', tenantId: actor.tenantId },
      managerMembership: null,
      user: {
        fullName: 'Vikram Singh',
        avatarUrl: 'https://example.test/vikram.jpg',
        role: 'FIELD_EXECUTIVE',
        email: 'vikram@example.test',
        mobile: null,
        employeeCode: 'USR-1002',
        officeAddress: 'Andheri East, Mumbai',
        joinedAt: new Date('2026-09-01T00:00:00.000Z'),
      },
    });

    await expect(service.getLeadAssigneeProfile(actor, membershipId)).resolves.toMatchObject({
      id: membershipId,
      displayName: 'Vikram Singh',
      avatarUrl: 'https://example.test/vikram.jpg',
      role: 'Field Executive',
      teamName: 'West Team',
    });
    expect(findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: membershipId, tenantId: actor.tenantId },
    }));
  });

  it('requires executive visibility and hides missing tenant employees', async () => {
    await expect(service.getLeadAssigneeProfile({ ...actor, tenantPermissions: [] }, membershipId))
      .rejects.toMatchObject({ status: 403 });
    expect(findFirst).not.toHaveBeenCalled();

    findFirst.mockResolvedValue(null);
    await expect(service.getLeadAssigneeProfile(actor, membershipId))
      .rejects.toMatchObject({ status: 404 });
  });
});
