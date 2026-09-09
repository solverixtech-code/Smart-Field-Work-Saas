import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { PrismaService } from "../persistence/prisma.service";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { auditEvents } from "../audit/audit-event-writer";
import { JobService } from "../jobs/job.service";
import { MetricsService } from "../observability/metrics.service";
import { StorageProvider, safeMimeTypes } from "./storage-provider";

export const mediaSelect = {
  id: true,
  tenantId: true,
  creatorUserId: true,
  creatorMembershipId: true,
  provider: true,
  bucket: true,
  objectKey: true,
  displayName: true,
  expectedBytes: true,
  mimeType: true,
  checksumSha256: true,
  status: true,
  uploadExpiresAt: true,
  revision: true,
  completedAt: true,
} satisfies Prisma.MediaAssetSelect;
const intentSchema = z
  .object({
    displayName: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .regex(/^[^\u0000-\u001f\u007f/\\]+$/),
    mimeType: z.enum(safeMimeTypes),
    expectedBytes: z.number().int().positive().max(104857600),
    checksumSha256: z
      .string()
      .regex(/^[A-Za-z0-9+/]{43}=$/)
      .refine((v) => Buffer.from(v, "base64").toString("base64") === v),
  })
  .strict();

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageProvider,
    private readonly jobs: JobService,
    private readonly metrics: MetricsService,
  ) {}
  private scope(principal: RequestPrincipal) {
    if (!principal.tenantId || !principal.membershipId)
      throw new ForbiddenException("Selected Tenant membership required");
    return {
      tenantId: principal.tenantId,
      membershipId: principal.membershipId,
      userId: principal.userId,
    };
  }
  private async asset(principal: RequestPrincipal, id: string) {
    z.string().uuid().parse(id);
    const { tenantId } = this.scope(principal);
    const asset = await this.prisma.mediaAsset.findFirst({
      where: { id, tenantId },
      select: mediaSelect,
    });
    if (!asset) throw new NotFoundException("Media asset not found");
    return asset;
  }
  async intent(principal: RequestPrincipal, raw: unknown) {
    const scope = this.scope(principal);
    const input = intentSchema.parse(raw);
    const config = this.storage.configuration();
    z.number().max(config.maxBytes).parse(input.expectedBytes);
    z.literal(true).parse(config.mimeTypes.includes(input.mimeType));
    const id = randomUUID();
    const asset = await this.prisma.$transaction(async (tx) => {
      const member = await tx.tenantMembership.findFirst({
        where: {
          id: scope.membershipId,
          tenantId: scope.tenantId,
          userId: scope.userId,
          status: "ACTIVE",
        },
        select: { id: true },
      });
      if (!member) throw new ForbiddenException("Active membership required");
      const created = await tx.mediaAsset.create({
        data: {
          ...input,
          id,
          tenantId: scope.tenantId,
          creatorUserId: scope.userId,
          creatorMembershipId: scope.membershipId,
          bucket: config.bucket,
          objectKey: `${config.prefix}tenants/${scope.tenantId}/media/${id}/${randomUUID()}`,
          uploadExpiresAt: new Date(Date.now() + config.uploadTtl * 1000),
        },
        select: mediaSelect,
      });
      await auditEvents.write(tx, {
        action: "media.upload.intent",
        scope: "TENANT",
        tenantId: scope.tenantId,
        actorUserId: scope.userId,
        tenantMembershipId: scope.membershipId,
        entityType: "MediaAsset",
        entityId: id,
        metadata: {
          mimeType: input.mimeType,
          expectedBytes: input.expectedBytes,
        },
      });
      return created;
    });
    try {
      const upload = await this.storage.upload(asset);
      this.metrics.observe("media", {
        operation: "upload_intent",
        outcome: "success",
      });
      return {
        id,
        status: asset.status,
        uploadExpiresAt: asset.uploadExpiresAt,
        upload,
      };
    } catch {
      this.metrics.observe("media", {
        operation: "upload_intent",
        outcome: "failure",
      });
      await this.prisma.$transaction(async (tx) => {
        const changed = await tx.mediaAsset.updateMany({
          where: { id, tenantId: scope.tenantId, status: "UPLOAD_PENDING" },
          data: { status: "FAILED", revision: { increment: 1 } },
        });
        if (changed.count)
          await auditEvents.write(tx, {
            action: "media.upload.failed",
            scope: "TENANT",
            tenantId: scope.tenantId,
            actorUserId: scope.userId,
            tenantMembershipId: scope.membershipId,
            outcome: "FAILURE",
            entityType: "MediaAsset",
            entityId: id,
          });
      });
      throw new ServiceUnavailableException("MEDIA_SIGNING_UNAVAILABLE");
    }
  }
  async complete(principal: RequestPrincipal, id: string, raw: unknown) {
    z.object({}).strict().parse(raw);
    const asset = await this.asset(principal, id);
    if (!["UPLOAD_PENDING", "READY"].includes(asset.status))
      throw new ConflictException("MEDIA_NOT_COMPLETABLE");
    if (
      asset.status === "UPLOAD_PENDING" &&
      asset.uploadExpiresAt.getTime() <= Date.now()
    )
      throw new ConflictException("MEDIA_UPLOAD_EXPIRED");
    let observed;
    try {
      observed = await this.storage.head(asset);
    } catch {
      this.metrics.observe("media", {
        operation: "complete",
        outcome: "failure",
      });
      throw new ServiceUnavailableException("MEDIA_OBJECT_UNAVAILABLE");
    }
    if (
      observed.bytes !== asset.expectedBytes ||
      observed.mimeType !== asset.mimeType ||
      observed.checksum !== asset.checksumSha256
    )
      throw new ConflictException("MEDIA_OBJECT_MISMATCH");
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "MediaAsset" WHERE id=${id} AND "tenantId"=${asset.tenantId} FOR UPDATE`;
      const current = await tx.mediaAsset.findFirstOrThrow({
        where: { id, tenantId: asset.tenantId },
        select: mediaSelect,
      });
      if (current.status === "READY")
        return { id, status: current.status, revision: current.revision };
      if (
        current.status !== "UPLOAD_PENDING" ||
        current.revision !== asset.revision
      )
        throw new ConflictException("MEDIA_STATE_CHANGED");
      await auditEvents.write(tx, {
        action: "media.upload.completed",
        scope: "TENANT",
        tenantId: asset.tenantId,
        actorUserId: principal.userId,
        tenantMembershipId: principal.membershipId,
        entityType: "MediaAsset",
        entityId: id,
      });
      return tx.mediaAsset.update({
        where: { id },
        data: {
          status: "READY",
          completedAt: new Date(),
          etag: observed.etag,
          revision: { increment: 1 },
        },
        select: { id: true, status: true, revision: true },
      });
    });
    this.metrics.observe("media", {
      operation: "complete",
      outcome: "success",
    });
    return result;
  }
  async download(principal: RequestPrincipal, id: string) {
    const asset = await this.asset(principal, id);
    if (asset.status !== "READY")
      throw new ConflictException("MEDIA_NOT_READY");
    try {
      const url = await this.storage.download(asset);
      this.metrics.observe("media", {
        operation: "download",
        outcome: "success",
      });
      return {
        id,
        url,
        expiresInSeconds: this.storage.configuration().downloadTtl,
      };
    } catch {
      this.metrics.observe("media", {
        operation: "download",
        outcome: "failure",
      });
      throw new ServiceUnavailableException("MEDIA_SIGNING_UNAVAILABLE");
    }
  }
  async remove(principal: RequestPrincipal, id: string) {
    const { tenantId } = this.scope(principal);
    z.string().uuid().parse(id);
    const result = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "MediaAsset" WHERE id=${id} AND "tenantId"=${tenantId} FOR UPDATE`;
      const asset = await tx.mediaAsset.findFirst({
        where: { id, tenantId },
        select: mediaSelect,
      });
      if (!asset) throw new NotFoundException("Media asset not found");
      if (asset.status === "DELETED") return { id, status: asset.status };
      if (asset.status !== "DELETE_PENDING") {
        await tx.mediaAsset.update({
          where: { id },
          data: { status: "DELETE_PENDING", revision: { increment: 1 } },
        });
        await auditEvents.write(tx, {
          action: "media.delete.requested",
          scope: "TENANT",
          tenantId,
          actorUserId: principal.userId,
          tenantMembershipId: principal.membershipId,
          entityType: "MediaAsset",
          entityId: id,
        });
      }
      // Do not make the object key reusable while its upload URL is still valid.
      const job = await this.jobs.enqueue(
        tx,
        "media.delete-object",
        { assetId: id, tenantId },
        `media-delete:${id}`,
        new Date(Math.max(Date.now(), asset.uploadExpiresAt.getTime() + 60000)),
      );
      return { id, status: "DELETE_PENDING", jobId: job.id };
    });
    this.metrics.observe("media", { operation: "delete", outcome: "success" });
    return result;
  }
}
