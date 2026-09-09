import { Injectable } from "@nestjs/common";

export const METRIC_LABELS = {
  http: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS", "OTHER"],
  status: ["1xx", "2xx", "3xx", "4xx", "5xx"],
  route: [
    "/tenant/runtime/bootstrap",
    "/tenant/media/assets/upload-intent",
    "/tenant/media/assets/:id/complete",
    "/tenant/media/assets/:id/download-url",
    "/tenant/media/assets/:id",
    "/platform/audit",
    "/platform/audit/:id",
    "/platform/operations/jobs",
    "/platform/operations/jobs/:id",
    "/platform/operations/jobs/:id/retry",
    "/health/ready",
    "other",
  ],
  outcome: [
    "success",
    "failure",
    "denied",
    "retry",
    "dead",
    "claimed",
    "lease_lost",
  ],
  cache: ["hit", "miss", "invalid", "expired", "retry", "failure"],
  operation: [
    "upload_intent",
    "complete",
    "download",
    "delete",
    "media.delete-object",
    "provision",
    "owner",
    "tenant",
    "membership",
    "subscription",
    "receipt",
    "membership_denied",
    "permission_denied",
    "subscription_denied",
  ],
} as const;
type Labels = Partial<{
  [K in keyof typeof METRIC_LABELS]: (typeof METRIC_LABELS)[K][number];
}>;
type MetricName =
  | "http_requests"
  | "http_duration_ms"
  | "runtime_cache"
  | "tenant_denials"
  | "provisioning"
  | "media"
  | "jobs"
  | "job_duration_ms";
@Injectable()
export class MetricsService {
  private readonly values = new Map<
    string,
    { count: number; sum: number; buckets: number[] }
  >();
  observe(name: MetricName, labels: Labels, value = 1): void {
    if (!Number.isFinite(value) || value < 0) return;
    for (const [key, label] of Object.entries(labels)) {
      const allowed: readonly string[] | undefined =
        METRIC_LABELS[key as keyof typeof METRIC_LABELS];
      if (!allowed?.includes(label)) return;
    }
    const key =
      name +
      JSON.stringify(
        Object.entries(labels).sort(([a], [b]) => a.localeCompare(b)),
      );
    let entry = this.values.get(key);
    if (!entry) {
      if (this.values.size >= 1024) return;
      entry = { count: 0, sum: 0, buckets: [0, 0, 0, 0, 0, 0] };
      this.values.set(key, entry);
    }
    entry.count++;
    entry.sum += value;
    [10, 50, 100, 500, 1000, Infinity].forEach((limit, index) => {
      if (value <= limit) entry.buckets[index]++;
    });
  }
  snapshot() {
    return [...this.values].map(([key, value]) => ({
      key,
      ...value,
      buckets: [...value.buckets],
    }));
  }
}
