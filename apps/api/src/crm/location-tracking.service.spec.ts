import { Prisma } from '@prisma/client';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { JobService } from '../jobs/job.service';
import { CrmPolicy } from './crm-policy';
import { CrmRepository } from './crm.repository';
import { LocationTrackingService } from './location-tracking.service';

const actor: RequestPrincipal = {
  userId: 'user-1', sessionId: 'session-1', tenantId: 'tenant-a', membershipId: 'member-1', tenantRoleCode: 'field_executive',
  tenantPermissions: ['crm.location.track'], platformPermissions: [], platformRoleCodes: [], permissions: ['crm.location.track'],
  dataScope: 'OWN', contextVersion: 1, permissionVersion: { tenant: null, platform: null }, isPlatformOnly: false,
};

describe('LocationTrackingService', () => {
  const requirePermission = jest.fn();
  const tx = {
    attendance: { findFirst: jest.fn(), findMany: jest.fn() },
    tenantSettings: { findUnique: jest.fn() },
    executiveLocationSample: { findMany: jest.fn(), findFirst: jest.fn(), createMany: jest.fn() },
    tenantSubscription: { findUnique: jest.fn() },
  };
  const repo = {
    run: jest.fn((_actor: RequestPrincipal, _write: boolean, work: (transaction: Prisma.TransactionClient, policy: CrmPolicy) => Promise<unknown>) =>
      work(tx as unknown as Prisma.TransactionClient, { scope: { tenantId: 'tenant-a', membershipId: 'member-1' }, require: requirePermission } as unknown as CrmPolicy)),
  } as unknown as CrmRepository;
  const jobs = { enqueue: jest.fn().mockResolvedValue({ id: 'job-1' }) } as unknown as JobService;
  const service = new LocationTrackingService(repo, jobs);

  beforeEach(() => {
    jest.clearAllMocks();
    tx.executiveLocationSample.findMany.mockResolvedValue([]);
    tx.tenantSettings.findUnique.mockResolvedValue({ timezone: 'Asia/Kolkata' });
    tx.executiveLocationSample.findFirst.mockResolvedValue(null);
    tx.executiveLocationSample.createMany.mockResolvedValue({ count: 2 });
    tx.tenantSubscription.findUnique.mockResolvedValue({ planVersion: { limits: [{ integerValue: 90, isUnlimited: false }] } });
  });

  it('reports an active self tracking session', async () => {
    tx.attendance.findFirst.mockResolvedValue({ id: 'attendance-1', punchInTime: new Date(), punchOutTime: null });
    await expect(service.session(actor)).resolves.toMatchObject({ active: true, sampleIntervalSeconds: 30, movementThresholdMeters: 10 });
    expect(requirePermission).toHaveBeenCalledWith('crm.location.track');
  });

  it('accepts offline samples inside a completed attendance interval and flags low accuracy', async () => {
    const capturedAt = new Date(Date.now() - 60_000);
    tx.attendance.findMany.mockResolvedValue([{
      date: new Date(`${new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(capturedAt)}T00:00:00Z`),
      punchInTime: new Date(capturedAt.getTime() - 60_000),
      punchOutTime: new Date(capturedAt.getTime() + 60_000),
    }]);
    const result = await service.ingest(actor, { samples: [
      { clientSampleId: '11111111-1111-4111-8111-111111111111', capturedAt: capturedAt.toISOString(), latitude: 19.1, longitude: 72.8, accuracyMeters: 8, source: 'WEB' },
      { clientSampleId: '22222222-2222-4222-8222-222222222222', capturedAt: new Date(capturedAt.getTime() + 30_000).toISOString(), latitude: 19.1001, longitude: 72.8001, accuracyMeters: 150, source: 'WEB' },
    ] });
    expect(result).toMatchObject({ accepted: 2, unusable: 1, duplicates: 0, rejected: 0 });
    expect(tx.executiveLocationSample.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.arrayContaining([expect.objectContaining({ clientSampleId: '22222222-2222-4222-8222-222222222222', isUsable: false, qualityReason: 'LOW_ACCURACY' })]),
    }));
    expect(jobs.enqueue).toHaveBeenCalledWith(expect.anything(), 'gps.retention-cleanup', { tenantId: 'tenant-a', retentionDays: 90 }, expect.stringMatching(/^gps-retention:/));
  });

  it('acknowledges duplicates and rejects samples outside attendance', async () => {
    const capturedAt = new Date(Date.now() - 60_000);
    tx.attendance.findMany.mockResolvedValue([]);
    tx.executiveLocationSample.findMany.mockResolvedValue([{ clientSampleId: '11111111-1111-4111-8111-111111111111' }]);
    const result = await service.ingest(actor, { samples: [
      { clientSampleId: '11111111-1111-4111-8111-111111111111', capturedAt: capturedAt.toISOString(), latitude: 19.1, longitude: 72.8, source: 'WEB' },
      { clientSampleId: '22222222-2222-4222-8222-222222222222', capturedAt: capturedAt.toISOString(), latitude: 19.2, longitude: 72.9, source: 'WEB' },
    ] });
    expect(result).toMatchObject({ accepted: 0, duplicates: 1, rejected: 1 });
    expect(result.rejectedIds).toEqual(['22222222-2222-4222-8222-222222222222']);
  });

  it('stores stationary noise for audit and rejects future samples without rejecting the batch', async () => {
    const capturedAt = new Date(Date.now() - 60_000);
    tx.attendance.findMany.mockResolvedValue([{
      date: new Date(`${new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(capturedAt)}T00:00:00Z`),
      punchInTime: new Date(capturedAt.getTime() - 60_000),
      punchOutTime: new Date(capturedAt.getTime() + 60_000),
    }]);
    tx.executiveLocationSample.findFirst.mockResolvedValue({
      latitude: 19.1,
      longitude: 72.8,
      capturedAt: new Date(capturedAt.getTime() - 30_000),
    });
    const futureId = '33333333-3333-4333-8333-333333333333';
    const result = await service.ingest(actor, { samples: [
      { clientSampleId: '22222222-2222-4222-8222-222222222222', capturedAt: capturedAt.toISOString(), latitude: 19.100001, longitude: 72.800001, accuracyMeters: 8, source: 'WEB' },
      { clientSampleId: futureId, capturedAt: new Date(Date.now() + 6 * 60_000).toISOString(), latitude: 19.2, longitude: 72.9, accuracyMeters: 8, source: 'WEB' },
    ] });

    expect(result).toMatchObject({ accepted: 1, unusable: 1, rejected: 1 });
    expect(result.rejectedIds).toEqual([futureId]);
    expect(tx.executiveLocationSample.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: [expect.objectContaining({ isUsable: false, qualityReason: 'STATIONARY_NOISE' })],
    }));
  });

  it('does not enqueue retention cleanup for an unlimited plan', async () => {
    const capturedAt = new Date(Date.now() - 60_000);
    tx.attendance.findMany.mockResolvedValue([{
      date: new Date(`${new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(capturedAt)}T00:00:00Z`),
      punchInTime: new Date(capturedAt.getTime() - 60_000),
      punchOutTime: new Date(capturedAt.getTime() + 60_000),
    }]);
    tx.tenantSubscription.findUnique.mockResolvedValue({ planVersion: { limits: [{ integerValue: null, isUnlimited: true }] } });

    await service.ingest(actor, { samples: [{
      clientSampleId: '44444444-4444-4444-8444-444444444444',
      capturedAt: capturedAt.toISOString(),
      latitude: 19.1,
      longitude: 72.8,
      source: 'WEB',
    }] });

    expect(jobs.enqueue).not.toHaveBeenCalled();
  });

  it('rejects a malformed coordinate by ID while ingesting valid samples from the same batch', async () => {
    const capturedAt = new Date(Date.now() - 60_000);
    tx.attendance.findMany.mockResolvedValue([{
      date: new Date(`${new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(capturedAt)}T00:00:00Z`),
      punchInTime: new Date(capturedAt.getTime() - 60_000),
      punchOutTime: new Date(capturedAt.getTime() + 60_000),
    }]);
    const invalidId = '55555555-5555-4555-8555-555555555555';

    const result = await service.ingest(actor, { samples: [
      { clientSampleId: invalidId, capturedAt: capturedAt.toISOString(), latitude: 200, longitude: 72.8, source: 'MOBILE' },
      { clientSampleId: '66666666-6666-4666-8666-666666666666', capturedAt: capturedAt.toISOString(), latitude: 19.1, longitude: 72.8, source: 'MOBILE' },
    ] });

    expect(result).toMatchObject({ accepted: 1, rejected: 1 });
    expect(result.rejectedIds).toEqual([invalidId]);
    expect(tx.executiveLocationSample.createMany).toHaveBeenCalledWith(expect.objectContaining({
      data: [expect.objectContaining({ clientSampleId: '66666666-6666-4666-8666-666666666666' })],
    }));
  });
});
