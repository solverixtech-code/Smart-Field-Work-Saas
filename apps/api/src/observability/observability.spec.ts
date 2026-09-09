import { randomUUID } from "node:crypto";
import { redact, redactDiagnostic } from "./redaction";
import { requestContext } from "./request-context";
import { MetricsService } from "./metrics.service";

describe("Phase 0.10 bounded diagnostics", () => {
  it.each([
    "password",
    "passwordHash",
    "passwordResetTokenHash",
    "accessToken",
    "refresh_token_hash",
    "OTP",
    "Authorization",
    "Cookie",
    "Set-Cookie",
    "apiKey",
    "secretAccessKey",
    "DATABASE_URL",
    "signedUrl",
    "x-amz-signature",
    "privateKey",
    "credentials",
  ])("redacts nested secret %s", (key) => {
    expect(redact({ safe: [{ [key]: "secret-marker" }] })).toEqual({
      safe: [{ [key]: "[REDACTED]" }],
    });
  });
  it("preserves commercial and Master code metadata", () => {
    expect(
      redact({
        moduleCode: "core_crm",
        masterCode: "customer_type",
        industryCode: "RETAIL",
      }),
    ).toEqual({
      moduleCode: "core_crm",
      masterCode: "customer_type",
      industryCode: "RETAIL",
    });
  });
  it.each([
    "Bearer secret-marker",
    "postgresql://user:password@db/name",
    "https://bucket.invalid/key?X-Amz-Signature=secret-marker",
    "-----BEGIN PRIVATE KEY----- secret-marker",
  ])("redacts credential-bearing strings", (value) => {
    expect(redact({ value })).toEqual({ value: "[REDACTED]" });
  });
  it("rejects cycles, accessors, unsupported objects and aggregate/depth/array limits without invoking getters", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    const accessor = jest.fn();
    const object = Object.defineProperty({}, "password", {
      get: accessor,
      enumerable: true,
    });
    let deep: unknown = null;
    for (let i = 0; i < 10; i++) deep = { nested: deep };
    for (const invalid of [
      circular,
      object,
      new Map(),
      deep,
      Array(51).fill(null),
      Object.fromEntries(
        Array.from({ length: 30 }, (_, index) => [
          String(index),
          "x".repeat(2000),
        ]),
      ),
    ]) {
      expect(() => redact(invalid)).toThrow();
      expect(redactDiagnostic(invalid)).toEqual({ redactionError: true });
    }
    expect(accessor).not.toHaveBeenCalled();
  });
  it("sanitizes control characters and bounds strings", () => {
    expect(redact("a\r\nb\u0000")).toBe("a  b ");
    expect(String(redact("x".repeat(10000))).length).toBe(2000);
  });
  it("isolates simultaneous request contexts, and rejects unsafe caller correlation", async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, async () => {
        const context = requestContext.create(randomUUID());
        return requestContext.run(context, async () => {
          await Promise.resolve();
          expect(requestContext.current()).toEqual(context);
          return requestContext.current()?.requestId;
        });
      }),
    );
    expect(new Set(results).size).toBe(20);
    expect(requestContext.current()).toBeUndefined();
    expect(requestContext.create("header\r\ninjection").correlationId).toMatch(
      /^[0-9a-f-]{36}$/,
    );
    expect(requestContext.create("x".repeat(101)).correlationId).toMatch(
      /^[0-9a-f-]{36}$/,
    );
  });
  it("stores only bounded registry metric labels and returns independent snapshots", () => {
    const metrics = new MetricsService();
    metrics.observe("jobs", {
      operation: "media.delete-object",
      outcome: "success",
    });
    metrics.observe("http_duration_ms", { http: "GET", status: "2xx" }, 25);
    const snapshot = metrics.snapshot();
    expect(snapshot).toHaveLength(2);
    expect(snapshot[1].buckets).toEqual([0, 1, 1, 1, 1, 1]);
    snapshot[1].buckets[0] = 99;
    expect(metrics.snapshot()[1].buckets[0]).toBe(0);
    expect(JSON.stringify(snapshot)).not.toContain("tenantId");
  });
});
