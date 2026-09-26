import { Injectable } from "@nestjs/common";
import { ClaimedJob } from './job.service';
import { randomUUID } from "node:crypto";
import { PrismaService } from "../persistence/prisma.service";
import { StorageProvider } from "../media/storage-provider";
import { mediaSelect } from "../media/media.service";
import { auditEvents } from "../audit/audit-event-writer";
import { MetricsService } from "../observability/metrics.service";
import { StructuredLogger } from "../observability/structured-logger.service";
import { requestContext } from "../observability/request-context";
import {
  JobService,
  JOB_TIMEOUT_MS,
  mediaDeletePayload,
  followUpPushPayload,
  gpsRetentionCleanupPayload,
  jobMetricOperation,
  PermanentJobError,
} from "./job.service";
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationSettingsService } from '../notifications/notification-settings.service';

@Injectable()
export class JobWorkerService {
  readonly workerId = randomUUID();
  constructor(
    private readonly jobs: JobService,
    private readonly prisma: PrismaService,
    private readonly storage: StorageProvider,
    private readonly metrics: MetricsService,
    private readonly logger: StructuredLogger,
    private readonly notifications: NotificationsService,
    private readonly notificationSettings: NotificationSettingsService,
  ) {}

  private async deliverFollowUpPush(job: ClaimedJob) {
    const payload = followUpPushPayload.safeParse(job.payload);
    if (!payload.success || payload.data.tenantId !== job.tenantId) {
      throw new PermanentJobError('JOB_PAYLOAD_INVALID');
    }
    const followUp = await this.prisma.leadFollowUp.findFirst({
      where: {
        id: payload.data.followUpId,
        tenantId: payload.data.tenantId,
        status: payload.data.trigger === 'completed' ? 'Completed' : 'Pending',
        updatedAt: new Date(payload.data.expectedUpdatedAt),
        lead: { deletedAt: null },
      },
      select: {
        id: true, assignedMembershipId: true, title: true,
        scheduledDate: true, scheduledTime: true,
        lead: { select: { name: true, businessName: true } },
      },
    });
    const enabled = await this.notificationSettings.isFollowUpPushEnabled(payload.data.trigger);
    if (followUp && enabled) {
      const leadName = followUp.lead.businessName || followUp.lead.name;
      await this.notifications.sendFollowUpPush({
        tenantId: payload.data.tenantId,
        followUpId: followUp.id,
        membershipId: followUp.assignedMembershipId,
        actorUserId: job.actorUserId,
        sourceKey: `${payload.data.tenantId}:${followUp.id}:${payload.data.expectedUpdatedAt}:${payload.data.trigger}`,
        title: payload.data.trigger === 'due'
          ? 'Follow-up due'
          : payload.data.trigger === 'completed'
            ? 'Follow-up completed'
            : 'Follow-up assigned',
        body: payload.data.trigger === 'due'
          ? `${followUp.title} for ${leadName} is due now.`
          : payload.data.trigger === 'completed'
            ? `${followUp.title} for ${leadName} was completed.`
            : `${followUp.title} for ${leadName} is scheduled for ${followUp.scheduledDate} at ${followUp.scheduledTime}.`,
      });
    }
    await this.jobs.succeed(job, async () => {});
  }
  async tick(): Promise<boolean> {
    const [job] = await this.jobs.claim(this.workerId);
    if (!job) return false;
    await this.execute(job);
    return true;
  }
  async execute(job: ClaimedJob): Promise<void> {
    return requestContext.run(
      {
        requestId: randomUUID(),
        correlationId: job.correlationId,
        originRequestId: job.originRequestId ?? undefined,
        actorUserId: job.actorUserId ?? undefined,
        tenantId: job.tenantId ?? undefined,
        membershipId: job.membershipId ?? undefined,
      },
      async () => {
        const start = performance.now();
        try {
          if (job.type === 'gps.retention-cleanup') {
            const parsed = gpsRetentionCleanupPayload.safeParse(job.payload);
            if (!parsed.success || parsed.data.tenantId !== job.tenantId) {
              throw new PermanentJobError('JOB_PAYLOAD_INVALID');
            }
            const cutoff = new Date(Date.now() - parsed.data.retentionDays * 86_400_000);
            await this.jobs.succeed(job, async (tx) => {
              await tx.executiveLocationSample.deleteMany({
                where: { tenantId: parsed.data.tenantId, capturedAt: { lt: cutoff } },
              });
            });
            this.logger.write('job.succeeded', { jobId: job.id, type: job.type });
            return;
          }
          if (job.type === 'followup.push') {
            await this.deliverFollowUpPush(job);
            this.logger.write('job.succeeded', { jobId: job.id, type: job.type });
            return;
          }
          const parsed = mediaDeletePayload.safeParse(job.payload);
          if (job.type !== "media.delete-object" || !parsed.success)
            throw new PermanentJobError("JOB_PAYLOAD_INVALID");
          if (parsed.data.tenantId !== job.tenantId)
            throw new PermanentJobError("MEDIA_SCOPE_MISMATCH");
          const asset = await this.prisma.mediaAsset.findFirst({
            where: { id: parsed.data.assetId, tenantId: parsed.data.tenantId },
            select: mediaSelect,
          });
          if (!asset) throw new PermanentJobError("MEDIA_SCOPE_MISMATCH");
          if (!["DELETE_PENDING", "DELETED"].includes(asset.status))
            throw new PermanentJobError("MEDIA_STATE_INVALID");
          if (asset.status !== "DELETED")
            await this.storage.delete(
              asset,
              AbortSignal.timeout(JOB_TIMEOUT_MS),
            );
          await this.jobs.succeed(job, async (tx) => {
            const updated = await tx.mediaAsset.updateMany({
              where: {
                id: asset.id,
                tenantId: asset.tenantId,
                status: "DELETE_PENDING",
              },
              data: {
                status: "DELETED",
                deletedAt: new Date(),
                revision: { increment: 1 },
              },
            });
            if (updated.count)
              await auditEvents.write(tx, {
                action: "media.deleted",
                scope: "TENANT",
                tenantId: asset.tenantId,
                actorUserId: job.actorUserId,
                tenantMembershipId: job.membershipId,
                entityType: "MediaAsset",
                entityId: asset.id,
                metadata: { jobId: job.id },
              });
          });
          this.logger.write("job.succeeded", {
            jobId: job.id,
            type: job.type,
          });
        } catch (error) {
          try {
            await this.jobs.fail(job, error);
          } catch {
            this.metrics.observe("jobs", {
              operation: jobMetricOperation(job.type),
              outcome: "lease_lost",
            });
          }
          this.logger.write(
            "job.failed",
            {
              jobId: job.id,
              errorCode:
                error instanceof PermanentJobError
                  ? error.code
                  : "HANDLER_FAILED",
            },
            "warn",
          );
        } finally {
          this.metrics.observe(
            "job_duration_ms",
            { operation: jobMetricOperation(job.type) },
            performance.now() - start,
          );
        }
      },
    );
  }
}
