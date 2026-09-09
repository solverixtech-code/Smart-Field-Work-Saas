import { ConfigService } from "@nestjs/config";
import { S3StorageProvider } from "./storage-provider";

describe("Private S3 fail-closed configuration", () => {
  const config = {
    MEDIA_ENABLED: true,
    MEDIA_S3_REGION: "ap-south-1",
    MEDIA_S3_BUCKET: "private-test-bucket",
    MEDIA_MAX_BYTES: 1000000,
    MEDIA_MIME_TYPES: "image/png,application/pdf",
    MEDIA_ENCRYPTION: "AES256",
  };
  it("is explicitly disabled without configuration, not a test-storage fallback", async () => {
    const provider = new S3StorageProvider(new ConfigService({}));
    expect(() => provider.configuration()).toThrow("MEDIA_DISABLED");
    expect(await provider.readiness()).toBe("disabled");
  });
  it("accepts a configured safe subset without requiring explicit AWS keys", () => {
    const provider = new S3StorageProvider(new ConfigService(config));
    expect(provider.configuration().mimeTypes).toEqual([
      "image/png",
      "application/pdf",
    ]);
  });
  it.each([
    { MEDIA_S3_REGION: "" },
    { MEDIA_S3_BUCKET: "" },
    { MEDIA_MAX_BYTES: 0 },
    { MEDIA_MAX_BYTES: 104857601 },
    { MEDIA_MIME_TYPES: "" },
    { MEDIA_MIME_TYPES: "text/html" },
    { MEDIA_MIME_TYPES: "image/svg+xml" },
    { MEDIA_ENCRYPTION: "none" },
    { MEDIA_ENCRYPTION: "aws:kms" },
    { MEDIA_S3_PREFIX: "../" },
    { MEDIA_DOWNLOAD_TTL_SECONDS: 301 },
    { MEDIA_UPLOAD_TTL_SECONDS: 901 },
  ])("rejects enabled unsafe configuration %j", (invalid) => {
    const provider = new S3StorageProvider(
      new ConfigService({ ...config, ...invalid }),
    );
    expect(() => provider.configuration()).toThrow(
      "MEDIA_CONFIGURATION_INVALID",
    );
  });

  it("uses the real SDK signer with checksum, content-type, length and conditional-write bindings", async () => {
    const savedAccess = process.env.AWS_ACCESS_KEY_ID;
    const savedSecret = process.env.AWS_SECRET_ACCESS_KEY;
    const savedToken = process.env.AWS_SESSION_TOKEN;
    process.env.AWS_ACCESS_KEY_ID = "AKIATESTONLYNOTREALKEY";
    process.env.AWS_SECRET_ACCESS_KEY =
      "test-only-signing-value-not-a-real-credential";
    delete process.env.AWS_SESSION_TOKEN;
    const provider = new S3StorageProvider(new ConfigService(config));
    try {
      const signed = await provider.upload({
        bucket: config.MEDIA_S3_BUCKET,
        objectKey: "tenants/test/media/test/random",
        displayName: "test.png",
        expectedBytes: 4,
        mimeType: "image/png",
        checksumSha256: Buffer.alloc(32, 1).toString("base64"),
      });
      const url = new URL(signed.url);
      expect(url.protocol).toBe("https:");
      expect(url.searchParams.get("X-Amz-Expires")).toBe("300");
      const bound = url.searchParams.get("X-Amz-SignedHeaders")?.split(";");
      expect(bound).toEqual(
        expect.arrayContaining([
          "content-length",
          "content-type",
          "if-none-match",
          "x-amz-checksum-sha256",
          "x-amz-server-side-encryption",
        ]),
      );
      expect(signed.headers["If-None-Match"]).toBe("*");
      expect(signed.headers["x-amz-checksum-sha256"]).toBe(
        Buffer.alloc(32, 1).toString("base64"),
      );
      expect(signed.headers["x-amz-acl"]).toBeUndefined();
    } finally {
      provider.onModuleDestroy();
      if (savedAccess === undefined) delete process.env.AWS_ACCESS_KEY_ID;
      else process.env.AWS_ACCESS_KEY_ID = savedAccess;
      if (savedSecret === undefined) delete process.env.AWS_SECRET_ACCESS_KEY;
      else process.env.AWS_SECRET_ACCESS_KEY = savedSecret;
      if (savedToken === undefined) delete process.env.AWS_SESSION_TOKEN;
      else process.env.AWS_SESSION_TOKEN = savedToken;
    }
  });
});
