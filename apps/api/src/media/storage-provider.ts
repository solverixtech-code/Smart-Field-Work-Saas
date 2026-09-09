import {
  Injectable,
  OnModuleDestroy,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  HeadBucketCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";

export const safeMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;
const configSchema = z
  .object({
    region: z.string().regex(/^[a-z]{2}(?:-[a-z]+)+-\d$/),
    bucket: z
      .string()
      .min(3)
      .max(63)
      .regex(/^[a-z0-9][a-z0-9.-]+[a-z0-9]$/),
    prefix: z
      .string()
      .regex(/^(?:[a-zA-Z0-9_-]+\/)*$/)
      .max(200),
    maxBytes: z.coerce.number().int().min(1).max(104857600),
    mimeTypes: z.array(z.enum(safeMimeTypes)).min(1).max(4),
    uploadTtl: z.coerce.number().int().min(30).max(900),
    downloadTtl: z.coerce.number().int().min(10).max(300),
    encryption: z.enum(["AES256", "aws:kms"]),
    kmsKeyId: z.string().min(1).max(2048).optional(),
  })
  .refine(
    (v) => v.encryption !== "aws:kms" || Boolean(v.kmsKeyId),
    "KMS key required",
  );
export type MediaConfiguration = z.infer<typeof configSchema>;
export interface StoredObject {
  readonly bucket: string;
  readonly objectKey: string;
  readonly expectedBytes: number;
  readonly mimeType: string;
  readonly checksumSha256: string;
  readonly displayName: string;
}
export interface ObjectObservation {
  bytes: number | undefined;
  mimeType: string | undefined;
  checksum: string | undefined;
  etag: string | undefined;
}
export abstract class StorageProvider {
  abstract configuration(): MediaConfiguration;
  abstract upload(
    object: StoredObject,
  ): Promise<{ url: string; headers: Record<string, string> }>;
  abstract head(
    object: StoredObject,
    signal?: AbortSignal,
  ): Promise<ObjectObservation>;
  abstract download(object: StoredObject): Promise<string>;
  abstract delete(object: StoredObject, signal: AbortSignal): Promise<void>;
  abstract readiness(): Promise<"disabled" | "ready">;
}

@Injectable()
export class S3StorageProvider
  extends StorageProvider
  implements OnModuleDestroy
{
  private client?: S3Client;
  private settings?: MediaConfiguration;
  constructor(private readonly config: ConfigService) {
    super();
  }
  configuration(): MediaConfiguration {
    if (
      this.config.get("MEDIA_ENABLED") !== true &&
      this.config.get("MEDIA_ENABLED") !== "true"
    )
      throw new ServiceUnavailableException("MEDIA_DISABLED");
    if (this.settings) return this.settings;
    const parsed = configSchema.safeParse({
      region: this.config.get("MEDIA_S3_REGION"),
      bucket: this.config.get("MEDIA_S3_BUCKET"),
      prefix: this.config.get("MEDIA_S3_PREFIX") ?? "",
      maxBytes: this.config.get("MEDIA_MAX_BYTES"),
      mimeTypes: String(this.config.get("MEDIA_MIME_TYPES") ?? "")
        .split(",")
        .map((v) => v.trim()),
      uploadTtl: this.config.get("MEDIA_UPLOAD_TTL_SECONDS") ?? 300,
      downloadTtl: this.config.get("MEDIA_DOWNLOAD_TTL_SECONDS") ?? 60,
      encryption: this.config.get("MEDIA_ENCRYPTION"),
      kmsKeyId: this.config.get("MEDIA_KMS_KEY_ID"),
    });
    if (!parsed.success)
      throw new ServiceUnavailableException("MEDIA_CONFIGURATION_INVALID");
    this.settings = parsed.data;
    return this.settings;
  }
  private sdk(): S3Client {
    const settings = this.configuration();
    // AWS default credential provider chain: environment, workload role, shared profile.
    return (this.client ??= new S3Client({
      region: settings.region,
      maxAttempts: 2,
    }));
  }
  async upload(object: StoredObject) {
    const config = this.configuration();
    const command = new PutObjectCommand({
      Bucket: object.bucket,
      Key: object.objectKey,
      ContentLength: object.expectedBytes,
      ContentType: object.mimeType,
      ChecksumSHA256: object.checksumSha256,
      IfNoneMatch: "*",
      ServerSideEncryption: config.encryption,
      SSEKMSKeyId: config.kmsKeyId,
    });
    const url = await getSignedUrl(this.sdk(), command, {
      expiresIn: config.uploadTtl,
      signableHeaders: new Set([
        "content-type",
        "content-length",
        "if-none-match",
      ]),
      unhoistableHeaders: new Set([
        "x-amz-checksum-sha256",
        "x-amz-server-side-encryption",
        "x-amz-server-side-encryption-aws-kms-key-id",
      ]),
    });
    return {
      url,
      headers: {
        "Content-Type": object.mimeType,
        "Content-Length": String(object.expectedBytes),
        "If-None-Match": "*",
        "x-amz-checksum-sha256": object.checksumSha256,
        "x-amz-server-side-encryption": config.encryption,
        ...(config.kmsKeyId
          ? { "x-amz-server-side-encryption-aws-kms-key-id": config.kmsKeyId }
          : {}),
      },
    };
  }
  async head(
    object: StoredObject,
    signal = AbortSignal.timeout(10000),
  ): Promise<ObjectObservation> {
    const head = await this.sdk().send(
      new HeadObjectCommand({
        Bucket: object.bucket,
        Key: object.objectKey,
        ChecksumMode: "ENABLED",
      }),
      { abortSignal: signal },
    );
    return {
      bytes: head.ContentLength,
      mimeType: head.ContentType,
      checksum: head.ChecksumSHA256,
      etag: head.ETag,
    };
  }
  download(object: StoredObject): Promise<string> {
    const filename = object.displayName.replace(/[^a-zA-Z0-9._ -]/g, "_");
    return getSignedUrl(
      this.sdk(),
      new GetObjectCommand({
        Bucket: object.bucket,
        Key: object.objectKey,
        ResponseContentDisposition: `attachment; filename="${filename}"`,
        ResponseContentType: object.mimeType,
      }),
      { expiresIn: this.configuration().downloadTtl },
    );
  }
  async delete(object: StoredObject, signal: AbortSignal): Promise<void> {
    await this.sdk().send(
      new DeleteObjectCommand({ Bucket: object.bucket, Key: object.objectKey }),
      { abortSignal: signal },
    );
  }
  async readiness(): Promise<"disabled" | "ready"> {
    if (
      this.config.get("MEDIA_ENABLED") !== true &&
      this.config.get("MEDIA_ENABLED") !== "true"
    )
      return "disabled";
    await this.sdk().send(
      new HeadBucketCommand({ Bucket: this.configuration().bucket }),
      { abortSignal: AbortSignal.timeout(5000) },
    );
    return "ready";
  }
  onModuleDestroy(): void {
    this.client?.destroy();
  }
}
