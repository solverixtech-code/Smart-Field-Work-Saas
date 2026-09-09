# Phase 0.10 observability matrix

Status: implemented candidate contract with latest validation pending; not evidence of deployed telemetry or an external metrics exporter.

Inventory: Nest Logger in Prisma/Redis/Auth/Email/Sms/Storage, Tenant/membership/role/backfill, Module/catalog services, ZodExceptionFilter and main; seed/reconciliation CLIs use console. No shared structured request logger, AsyncLocalStorage or metrics service exists. Bootstrap has a Zod-only filter and root welcome route, not a readiness contract. RequestPrincipalGuard attaches the resolved principal; MembershipContextGuard checks selected membership. Some frozen command DTOs carry client requestId as history metadata; it must not become authoritative request identity.

| Signal / fields | Authority / producer | Scope / consumer | Retention / redaction | Transaction / frozen owner |
| --- | --- | --- | --- | --- |
| requestId, correlationId | Middleware: server UUID, bounded validated X-Correlation-Id or server UUID | Request / response header and operational logs | Opaque identifiers; header never trusted for Tenant/actor | AsyncLocalStorage; separate from commercial idempotency |
| actorUserId, tenantId, membershipId | Resolved principal after guards | Request / structured logs, audit writer | Sensitive IDs, no metrics labels | Observation only, no principal authority change |
| originRequestId, executionId, correlationId | Enqueue context and new worker execution | Job / log and audit correlation | No secrets in payload or context | Retain origin, create fresh worker identity |
| event, level, time, safe error code | Structured logger and recursive shared redactor | Operational troubleshooting | No bodies/cookies/auth headers by default; control characters removed; size bound | Log failure cannot turn committed business success into failure |
| HTTP count and duration | Middleware response finish | Fixed methods, matched route template, status class | No raw URL, Tenant/User/entity/request IDs | Guard failures included without exposing headers |
| runtime cache hit/miss/invalid/expired, retry/failure | Runtime observation seams | Bounded outcome/reason | No cache keys, DTOs or IDs | Preserve M9 epochs, keys, ETags, synchronous invalidation and clock boundaries |
| Tenant denial count | Membership/subscription/permission guard observation | Bounded reason enum | No durable audit for every 403 | Frozen access matrix unchanged |
| provisioning step/outcome/duration | Provisioning service observation | Fixed step names and outcomes | No owner emails, payloads or hashes | Retried transaction attempts distinguished from final outcome |
| job claim/success/retry/dead/lease loss/duration | Claim/worker/finish | Registered type and outcome only | No job/token/worker/Tenant ID labels | Metrics do not acknowledge jobs or alter leases |
| media intent/complete/download/delete/provider failure | Media service / adapter | Fixed operation/outcome | No bucket/key/URL/checksum in metrics/logs | No network calls inside business transactions |

MetricsService is a small in-process, testable bounded-cardinality port (counter and histogram). No third-party telemetry vendor, unbounded labels, percentile SLA or persistent telemetry backend is claimed. Exporter deployment deferred. Logger uses existing Nest logging infrastructure and shared redactor; malformed input becomes a fixed safe marker. Errors shown to clients retain approved error semantics and never include unexpected stack/provider details.

Readiness is one database + enabled-media diagnostic contract. The worker is a separate process with bounded shutdown/lease recovery; absence of an exporter is not a false healthy job worker claim. No production request bodies or secret environment dumps are collected. Operational retention is a deployment policy, not an automatic deletion implementation.
