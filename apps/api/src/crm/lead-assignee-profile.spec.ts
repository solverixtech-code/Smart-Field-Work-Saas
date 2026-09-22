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
  tenantPermissions: ['crm.leads.view', 'crm.leads.access.tenant'],
  platformPermissions: [],
  platformRoleCodes: [],
  permissions: ['crm.leads.view', 'crm.leads.access.tenant'],
  dataScope: 'TENANT',
  contextVersion: 1,
  permissionVersion: { tenant: null, platform: null },
  isPlatformOnly: false,
};

describe('CRM employee profile', () => {
  const membershipId = randomUUID();
  const findFirst = jest.fn();
  const visibleLead = jest.fn();
  const tx = {
    tenantMembership: { findFirst },
    lead: { findFirst: visibleLead },
  } as unknown as Prisma.TransactionClient;
  const repo = {
    run: jest.fn((principal: RequestPrincipal, _write: boolean, work: (transaction: Prisma.TransactionClient, policy: CrmPolicy) => Promise<unknown>) =>
      work(tx, new CrmPolicy(principal))),
  } as unknown as CrmRepository;
  const service = new CrmService(repo);

  beforeEach(() => {
    jest.clearAllMocks();
    visibleLead.mockResolvedValue({ id: randomUUID() });
  });

  it('returns the requested tenant employee and their stored profile image', async () => {
    findFirst.mockResolvedValue({
      id: membershipId,
      status: 'ACTIVE',
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
    expect(visibleLead).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        AND: [
          { tenantId: actor.tenantId, deletedAt: null },
          { assignedMembershipId: membershipId },
        ],
      },
    }));
  });

  it('requires lead visibility and hides employees outside visible assignments', async () => {
    await expect(service.getLeadAssigneeProfile({ ...actor, tenantPermissions: [] }, membershipId))
      .rejects.toMatchObject({ status: 403 });
    expect(findFirst).not.toHaveBeenCalled();

    visibleLead.mockResolvedValue(null);
    await expect(service.getLeadAssigneeProfile(actor, membershipId))
      .rejects.toMatchObject({ status: 404 });
    expect(findFirst).not.toHaveBeenCalled();

    visibleLead.mockResolvedValue({ id: randomUUID() });
    findFirst.mockResolvedValue(null);
    await expect(service.getLeadAssigneeProfile(actor, membershipId))
      .rejects.toMatchObject({ status: 404 });
  });
});
