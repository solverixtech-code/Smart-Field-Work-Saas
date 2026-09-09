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
  PermanentJobError,
} from "./job.service";

@Injectable()
export class JobWorkerService {
  readonly workerId = randomUUID();
  constructor(
    private readonly jobs: JobService,
    private readonly prisma: PrismaService,
    private readonly storage: StorageProvider,
    private readonly metrics: MetricsService,
    private readonly logger: StructuredLogger,
  ) {}
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
            type: "media.delete-object",
          });
        } catch (error) {
          try {
            await this.jobs.fail(job, error);
          } catch {
            this.metrics.observe("jobs", {
              operation: "media.delete-object",
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
            { operation: "media.delete-object" },
            performance.now() - start,
          );
        }
      },
    );
  }
}
