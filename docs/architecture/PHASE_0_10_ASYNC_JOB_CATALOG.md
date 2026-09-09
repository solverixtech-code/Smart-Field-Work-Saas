# Phase 0.10 async job catalog

Status: implemented candidate contract; integrated worker proof has passed locally, with latest hardening and release checks pending in the implementation report.

Existing async inventory: ProvisioningEvent and ProvisioningAttempt are M6-specific durable invitation/initialization intents. ProvisioningEventService claims using subscription transaction advisory locks, a five-minute lease and stable event ID; authenticated claim/finish APIs own attempt history. No scheduler/provider delivery worker exists. Plan serialization retries use bounded delay only. No generic queue, AsyncLocalStorage or background job runtime was found. Do not convert provisioning rows or claim exactly-once delivery.

| Field group | Authority / producer | Scope / consumer | Retention / redaction | Transaction / frozen owner |
| --- | --- | --- | --- | --- |
| id, type, schemaVersion, payload | Static typed registry / internal enqueue | Tenant for media.delete-object; nullable only for declared SYSTEM types / worker | Payload minimal IDs, no secrets, signed URLs, executable code or arbitrary handler paths; operational retention deferred | Insert in caller transaction; no public enqueue endpoint |
| tenantId, actorUserId, membershipId, originRequestId, correlationId | Validated command/request context | Worker revalidates persisted ownership / authorized operations query | Sensitive identifiers; safe detail only, never metric labels | Does not authorize by itself; membership and asset ownership checked |
| idempotencyKey, payloadHash | Producer and normalized SHA-256 | Tenant + type; separate SYSTEM uniqueness | Internal, not exposed in list | Partial unique indexes distinguish null-Tenant SYSTEM keys; unequal replay conflicts |
| status, availableAt, attemptCount, maxAttempts, revision | DB-time claim / fenced completion | PENDING, RUNNING, SUCCEEDED, DEAD | Counts/timestamps retained with job | PostgreSQL SKIP LOCKED, bounded batches; no network work in claim transaction |
| workerId, leaseToken, leaseExpiresAt | Worker-generated execution identity and DB time | RUNNING claim only | Lease token excluded from ordinary API/audit | Stale token cannot acknowledge after expiry/reclaim |
| attempt number/token/start/end/outcome/errorCode | Claim and finish transactions | Per job / authorized job detail | Safe bounded error code/message only; attempts never reset on manual retry | Unique job+attempt; expired attempts finalized before reclaim |

Production registry starts with `media.delete-object`, payload `{assetId, tenantId}`. Reload MediaAsset, require matching Tenant and DELETE_PENDING (DELETED is idempotent success). S3 deletion of the immutable key is repeatable. S3 success and database commit cannot be atomic: crash after deletion causes repeat deletion. Finish asset status, job result and audit atomically under an unexpired token fence. Corrupt ownership is permanent failure before S3 access. Test-only failure handler cannot register in production configuration.

Worker is a separate Nest application context/entrypoint, not an API-process timer. Claim <=20 jobs using DB time and row locks; commit before side effects. Short handler timeout 20 seconds with propagated AbortSignal and 60-second lease. Retry at bounded exponential delays, max attempts 5, then DEAD. No long jobs without future heartbeat contract. SIGTERM stops new claims, allows bounded in-flight work, closes providers and exits; unreconciled work recovers by lease expiry.

Manual retry: DEAD only, reason required, expected revision, platform.operations.jobs.retry, retain attempts, clear current error/lease, reschedule PENDING and audit in same transaction. Fresh attempts are an explicit bounded retry budget, not a history reset. View permission separately `platform.operations.jobs.view`; operations admin and super admin manage, Auditor view only; support/billing receive no new retry grant. List/detail cursor and bounded date filters, no payload mutation.

Exit proof: two workers, 20 claims, expired lease fencing, cross-Tenant corruption, transient/permanent failures, dead/retry history, enqueue rollback, crash after S3 deletion, bounded shutdown; existing provisioning event tests unchanged. At-least-once only. No broker, general provider delivery, cancellation API or automatic retention scheduler.
