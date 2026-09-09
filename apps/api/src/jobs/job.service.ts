import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { PrismaService } from "../persistence/prisma.service";
import { payloadHash } from "../platform/subscriptions/subscription-contract";
import { auditEvents } from "../audit/audit-event-writer";
import { requestContext } from "../observability/request-context";
import { MetricsService } from "../observability/metrics.service";

export const mediaDeletePayload = z
  .object({ assetId: z.string().uuid(), tenantId: z.string().uuid() })
  .strict();
const registry = { "media.delete-object": mediaDeletePayload } as const;
export type JobType = keyof typeof registry;
export const JOB_LEASE_MS = 60000;
export const JOB_TIMEOUT_MS = 20000;
export class PermanentJobError extends Error {
  constructor(
    readonly code:
      "MEDIA_SCOPE_MISMATCH" | "MEDIA_STATE_INVALID" | "JOB_PAYLOAD_INVALID",
  ) {
    super(code);
  }
}
const clearedLease = { workerId: null, leaseToken: null, leaseExpiresAt: null };
const claimSelect = { id: true, type: true, tenantId: true, actorUserId: true, membershipId: true,
  originRequestId: true, correlationId: true, payload: true, leaseToken: true, leaseExpiresAt: true,
  status: true, attemptCount: true, retryUntilAttempt: true } satisfies Prisma.BackgroundJobSelect;
export type ClaimedJob = Prisma.BackgroundJobGetPayload<{ select: typeof claimSelect }>;

@Injectable()
export class JobService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
  ) {}
  async enqueue(
    tx: Prisma.TransactionClient,
    type: JobType,
    raw: unknown,
    key: string,
    availableAt?: Date,
  ) {
    const payload = registry[type].parse(raw);
    z.string().min(1).max(200).parse(key);
    const hash = payloadHash({ type, payload });
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`job:${payload.tenantId}:${type}:${key}`},0))::text`;
    const old = await tx.backgroundJob.findFirst({
      where: { tenantId: payload.tenantId, type, idempotencyKey: key },
      select: { id: true, payloadHash: true },
    });
    if (old) {
      if (old.payloadHash !== hash)
        throw new ConflictException("JOB_IDEMPOTENCY_CONFLICT");
      return { id: old.id };
    }
    const context = requestContext.current();
    return tx.backgroundJob.create({
      data: {
        type,
        tenantId: payload.tenantId,
        payload,
        idempotencyKey: key,
        payloadHash: hash,
        availableAt,
        correlationId: context?.correlationId ?? randomUUID(),
        originRequestId: context?.requestId,
        actorUserId: context?.actorUserId,
        membershipId:
          context?.tenantId === payload.tenantId ? context.membershipId : null,
      },
      select: { id: true },
    });
  }
  async claim(workerId: string, limit = 1): Promise<ClaimedJob[]> {
    z.string().uuid().parse(workerId);
    z.number().int().min(1).max(20).parse(limit);
    const claimed = await this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "BackgroundJob" WHERE
          (status='PENDING' AND "availableAt"<=(statement_timestamp() AT TIME ZONE 'UTC')) OR
          (status='RUNNING' AND "leaseExpiresAt"<=(statement_timestamp() AT TIME ZONE 'UTC'))
        ORDER BY "availableAt",id LIMIT ${limit} FOR UPDATE SKIP LOCKED`;
      const [{ now }] = await tx.$queryRaw<
        Array<{ now: Date }>
      >`SELECT (clock_timestamp() AT TIME ZONE 'UTC') AS now`;
      const results: ClaimedJob[] = [];
      const selected = await tx.backgroundJob.findMany({ where: { id: { in: rows.map((row) => row.id) } }, select: claimSelect });
      for (const job of selected) {
        const id = job.id;
        if (job.status === "RUNNING" && job.leaseToken)
          await tx.backgroundJobAttempt.update({
            where: { leaseToken: job.leaseToken },
            data: {
              status: "LEASE_EXPIRED",
              errorCode: "LEASE_EXPIRED",
              finishedAt: now,
            },
          });
        if (job.attemptCount >= job.retryUntilAttempt) {
          await tx.backgroundJob.update({
            where: { id },
            data: {
              ...clearedLease,
              status: "DEAD",
              deadAt: now,
              lastErrorCode: "ATTEMPTS_EXHAUSTED",
              revision: { increment: 1 },
            },
          });
          continue;
        }
        const leaseToken = randomUUID();
        const updated = await tx.backgroundJob.update({
          where: { id },
          data: {
            status: "RUNNING",
            workerId,
            leaseToken,
            leaseExpiresAt: new Date(now.getTime() + JOB_LEASE_MS),
            attemptCount: { increment: 1 },
            revision: { increment: 1 },
            lastErrorCode: null,
          },
          select: claimSelect,
        });
        await tx.backgroundJobAttempt.create({
          data: {
            jobId: id,
            number: updated.attemptCount,
            leaseToken,
            workerId,
            startedAt: now,
          },
        });
        results.push(updated);
      }
      return results;
    });
    for (let index = 0; index < claimed.length; index++)
      this.metrics.observe("jobs", {
        operation: "media.delete-object",
        outcome: "claimed",
      });
    return claimed;
  }
  private async fenced(
    tx: Prisma.TransactionClient,
    id: string,
    token: string,
  ) {
    const matches = await tx.$queryRaw<
      Array<{ id: string }>
    >`SELECT id FROM "BackgroundJob" WHERE id=${id} AND status='RUNNING' AND "leaseToken"=${token} AND "leaseExpiresAt">(clock_timestamp() AT TIME ZONE 'UTC') FOR UPDATE`;
    if (!matches.length) throw new ConflictException("JOB_LEASE_LOST");
    return tx.backgroundJob.findUniqueOrThrow({ where: { id }, select: { attemptCount: true, retryUntilAttempt: true } });
  }
  async succeed(
    job: ClaimedJob,
    work: (tx: Prisma.TransactionClient) => Promise<void>,
  ) {
    if (!job.leaseToken) throw new ConflictException("JOB_LEASE_LOST");
    const token = job.leaseToken;
    await this.prisma.$transaction(async (tx) => {
      await this.fenced(tx, job.id, token);
      await work(tx);
      // Fence again after handler DB work, including time consumed by locks/audit.
      const changed =
        await tx.$executeRaw`UPDATE "BackgroundJob" SET status='SUCCEEDED', "completedAt"=(clock_timestamp() AT TIME ZONE 'UTC'), "workerId"=NULL,"leaseToken"=NULL,"leaseExpiresAt"=NULL,"revision"="revision"+1,"updatedAt"=(clock_timestamp() AT TIME ZONE 'UTC') WHERE id=${job.id} AND "leaseToken"=${token} AND "leaseExpiresAt">(clock_timestamp() AT TIME ZONE 'UTC')`;
      if (changed !== 1) throw new ConflictException("JOB_LEASE_LOST");
      await tx.backgroundJobAttempt.update({
        where: { leaseToken: token },
        data: { status: "SUCCEEDED", finishedAt: (await tx.$queryRaw<Array<{ now: Date }>>`SELECT (clock_timestamp() AT TIME ZONE 'UTC') AS now`)[0].now },
      });
    });
    this.metrics.observe("jobs", {
      operation: "media.delete-object",
      outcome: "success",
    });
  }
  async fail(job: ClaimedJob, error: unknown) {
    if (!job.leaseToken) throw new ConflictException("JOB_LEASE_LOST");
    const token = job.leaseToken;
    const dead = await this.prisma.$transaction(async (tx) => {
      const current = await this.fenced(tx, job.id, token);
      const permanent = error instanceof PermanentJobError;
      const terminal =
        permanent || current.attemptCount >= current.retryUntilAttempt;
      const code = permanent ? error.code : "HANDLER_FAILED";
      const [{ now }] = await tx.$queryRaw<
        Array<{ now: Date }>
      >`SELECT (clock_timestamp() AT TIME ZONE 'UTC') AS now`;
      await tx.backgroundJobAttempt.update({
        where: { leaseToken: token },
        data: { status: "FAILED", errorCode: code, finishedAt: now },
      });
      const delaySeconds = Math.min(300, 2 ** Math.min(current.attemptCount, 8));
      const changed = await tx.$executeRaw`UPDATE "BackgroundJob" SET
        status=${terminal ? 'DEAD' : 'PENDING'}, "deadAt"=CASE WHEN ${terminal} THEN (clock_timestamp() AT TIME ZONE 'UTC') ELSE NULL END,
        "availableAt"=(clock_timestamp() AT TIME ZONE 'UTC')+make_interval(secs=>${delaySeconds}),
        "workerId"=NULL,"leaseToken"=NULL,"leaseExpiresAt"=NULL,"lastErrorCode"=${code},"revision"="revision"+1,"updatedAt"=(clock_timestamp() AT TIME ZONE 'UTC')
        WHERE id=${job.id} AND status='RUNNING' AND "leaseToken"=${token} AND "leaseExpiresAt">(clock_timestamp() AT TIME ZONE 'UTC')`;
      if (changed !== 1) throw new ConflictException('JOB_LEASE_LOST');
      return terminal;
    });
    this.metrics.observe("jobs", {
      operation: "media.delete-object",
      outcome: dead ? "dead" : "retry",
    });
  }
  async retry(id: string, input: unknown, actorUserId: string) {
    z.string().uuid().parse(id);
    const { expectedRevision, reason } = z
      .object({
        expectedRevision: z.number().int().positive(),
        reason: z.string().trim().min(1).max(500),
      })
      .strict()
      .parse(input);
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "BackgroundJob" WHERE id=${id} FOR UPDATE`;
      const job = await tx.backgroundJob.findUnique({ where: { id }, select: { id: true, status: true, revision: true, attemptCount: true, maxAttempts: true } });
      if (!job) throw new NotFoundException("Job not found");
      if (job.status !== "DEAD" || job.revision !== expectedRevision)
        throw new ConflictException("JOB_RETRY_CONFLICT");
      await auditEvents.write(tx, {
        action: "job.manual.retry",
        scope: "PLATFORM",
        actorUserId,
        entityType: "BackgroundJob",
        entityId: id,
        metadata: { reason, attemptCount: job.attemptCount },
      });
      return tx.backgroundJob.update({
        where: { id },
        data: {
          status: "PENDING",
          deadAt: null,
          lastErrorCode: null,
          availableAt: new Date(),
          retryUntilAttempt: job.attemptCount + job.maxAttempts,
          revision: { increment: 1 },
        },
        select: { id: true, status: true, revision: true },
      });
    });
  }
}
