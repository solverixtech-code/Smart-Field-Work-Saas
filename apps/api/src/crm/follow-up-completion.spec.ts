import { randomUUID } from 'node:crypto';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { JobService } from '../jobs/job.service';
import { CrmPolicy } from './crm-policy';
import { CrmRepository } from './crm.repository';
import { CrmService } from './crm.service';
import { LeadService } from './lead.service';

describe('follow-up completion workflow', () => {
  const tenantId = randomUUID();
  const membershipId = randomUUID();
  const leadId = randomUUID();
  const followUpId = randomUUID();
  const actor: RequestPrincipal = {
    userId: randomUUID(),
    sessionId: randomUUID(),
    tenantId,
    membershipId,
    tenantRoleCode: 'tenant_admin',
    tenantPermissions: [
      'crm.leads.view',
      'crm.leads.access.tenant',
      'crm.followups.manage',
    ],
    platformPermissions: [],
    platformRoleCodes: [],
    permissions: [],
    dataScope: 'ALL',
    contextVersion: 1,
    permissionVersion: { tenant: null, platform: null },
    isPlatformOnly: false,
  };

  const update = jest.fn();
  const deletePendingFollowUpPushes = jest.fn();
  const enqueue = jest.fn();
  const tx = {
    $queryRaw: jest.fn().mockResolvedValue([]),
    tenantSettings: {
      findUnique: jest.fn().mockResolvedValue({ timezone: 'Asia/Kolkata' }),
    },
    lead: {
      findFirst: jest.fn().mockResolvedValue({ id: leadId, status: 'OPEN' }),
      update: jest.fn().mockResolvedValue({ id: leadId }),
    },
    leadFollowUp: {
      findFirst: jest.fn().mockResolvedValue({
        id: followUpId,
        tenantId,
        leadId,
        assignedMembershipId: membershipId,
        assignedToName: 'Field Executive',
        title: 'Proposal review',
        scheduledDate: '2026-09-24',
        scheduledTime: '10:30 AM',
        notes: null,
        status: 'Pending',
        completedAt: null,
        completionNote: null,
        completedByMembershipId: null,
      }),
      findMany: jest.fn().mockResolvedValue([]),
      update,
    },
    leadHistory: { create: jest.fn().mockResolvedValue({ id: randomUUID() }) },
  } as unknown as Prisma.TransactionClient;
  const repo = {
    run: jest.fn(
      (
        principal: RequestPrincipal,
        _write: boolean,
        work: (
          transaction: Prisma.TransactionClient,
          policy: CrmPolicy,
        ) => Promise<unknown>,
      ) => work(tx, new CrmPolicy(principal)),
    ),
  } as unknown as CrmRepository;
  const jobs = {
    deletePendingFollowUpPushes,
    enqueue,
  } as unknown as JobService;
  const service = new LeadService(repo, {} as CrmService, jobs);

  beforeEach(() => {
    jest.clearAllMocks();
    update.mockImplementation(({ data }) =>
      Promise.resolve({
        id: followUpId,
        tenantId,
        updatedAt: new Date('2026-09-24T06:00:00.000Z'),
        scheduledDate: '2026-09-24',
        scheduledTime: '10:30 AM',
        ...data,
      }),
    );
    deletePendingFollowUpPushes.mockResolvedValue({ count: 1 });
    enqueue.mockResolvedValue({ id: randomUUID() });
  });

  it('requires an outcome before completing a follow-up', async () => {
    await expect(
      service.updateFollowUp(actor, leadId, followUpId, {
        status: 'Completed',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(deletePendingFollowUpPushes).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('attributes completion, removes pending reminders, and queues a completion push', async () => {
    await service.updateFollowUp(actor, leadId, followUpId, {
      status: 'Completed',
      completionNote: 'Customer approved the proposal.',
    });

    expect(deletePendingFollowUpPushes).toHaveBeenCalledWith(
      tx,
      tenantId,
      followUpId,
    );
    expect(update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        status: 'Completed',
        completionNote: 'Customer approved the proposal.',
        completedByMembershipId: membershipId,
        completedAt: expect.any(Date),
      }),
    }));
    expect(enqueue).toHaveBeenCalledWith(
      tx,
      'followup.push',
      expect.objectContaining({
        tenantId,
        followUpId,
        trigger: 'completed',
      }),
      expect.stringContaining(':completed'),
    );
    expect(deletePendingFollowUpPushes.mock.invocationCallOrder[0])
      .toBeLessThan(enqueue.mock.invocationCallOrder[0]);
  });
});
