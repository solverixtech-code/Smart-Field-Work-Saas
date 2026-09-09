# Phase 0.10 audit, media, jobs and observability implementation

Status: **IN PROGRESS - owner approved the narrow prerequisite correction. NOT READY TO FREEZE.**

## Current implementation checkpoint (2026-09-08)

This section is current. The prerequisite report below is historical, not the current implementation inventory.

Working branch: `feat/phase-0.10-audit-media-jobs`. HEAD is the separate CORS correction `aa5474d8caffa2b3c7376e21673fc81c5400da6c`; the Phase 0.10 implementation remains uncommitted. Main was fetched and verified at frozen `82f6522a4ee0acdf05b7be81a0ecfc04efcc79d1`. No Phase 0.10 push, PR, merge or final candidate CI exists yet.

### Added and reused

- Reused Prisma/PersistenceModule, existing JWT/principal/membership/permission/subscription guards, Tenant foundation and role seeding, normalized payload hashing, existing Nest logging, AWS S3 SDK, and existing AuditLog physical storage. No new queue vendor or frontend implementation.
- Added central scoped/redacting audit writer and platform query API; wired Auth, catalog, Plan, Industry, Master, subscription/provisioning and RBAC/membership producers. Critical events use their business transaction. Frozen best-effort authentication/catalog handling remains best-effort. Plan publication pinning/retries and all commercial rules remain unchanged.
- Added private MediaAsset, strict signed S3 PUT/GET, trusted HEAD completion, guarded Tenant API, transactional delete intent and job, and S3 readiness. Explicit MIME subset/size/encryption configuration is required when enabled. Production uses the AWS credential chain; only tests inject RecordingStorage. Added SDK presigner as the one storage helper dependency. Legacy URL fields are not imported or reinterpreted.
- Added BackgroundJob/Attempt, database-unique idempotency, bounded SKIP LOCKED claims, leases, UTC database clock, fenced success/failure, retry/dead/manual-retry contracts, a media deletion handler and separate `worker:jobs` entrypoint. Existing M6 ProvisioningEvent/Attempt rows and APIs remain separate.
- Added AsyncLocalStorage request/correlation context, structured/redacted logger transport, bounded metrics, observation-only runtime/guard/provisioning instrumentation, and one `/health/ready` endpoint. Removed OTP/reset-link and raw provider-error contents from legacy log messages without changing delivery behavior.
- Added four append-only migration drafts: M9.2 audit/media/job persistence, M9.3 reference/intent integrity, M9.4 UTC queue defaults, M9.5 claim/attempt integrity. All 29 frozen migrations are unchanged. M10 remains reserved for legacy contraction.

### Validation evidence and remaining checks

| Check | Observed result |
| --- | --- |
| Separate CORS correction | 18 new regressions passed; origin allowlist preserved. Phase 0.10 subsequently adds correlation request/exposed response headers. |
| Last complete unit run | **274 tests / 19 suites PASS** before the latest worker-loop, SDK-signing and legacy-log test additions |
| Last complete E2E run | **151 tests / 9 suites PASS**, including all frozen 141 assertions and the initial 10 new integrated tests |
| Latest focused Phase 0.10 run | **11 tests PASS**, including populated upgrade rehearsal from the frozen 29-migration chain; subsequent final-hardening edits still need rerun |
| Upgrade rehearsal | Preserved 2 historical audit rows: 1 deterministic TENANT and 1 LEGACY; both unknown actors remain LEGACY and no correlation is invented. Historical payloads remain physically unchanged; query reads redact them. |
| Integrated proof | Tenant A private upload/HEAD/download; Tenant B known-ID rejection before storage; enqueue rollback; 20 equal enqueues -> 1 job; unequal replay conflict; crash after S3 deletion -> expired attempt plus successful retry; stale acknowledgment denied; 20 distinct claims; permanent corrupt ownership rejected; dead job reasoned retry authorized and concurrent retry conflicts. |
| PostgreSQL timezone | Local test server is Asia/Calcutta. New claim comparisons/fences use explicit UTC; an additional independent non-UTC connection regression is added but awaits rerun. |
| Current TypeScript/build/install | API TypeScript passed before latest hardening. Clean `npm ci` failed with EPERM on this checkout's running Vite/esbuild binary and partially removed dependencies. Awaiting permission to stop only that helper and finish reinstall. Final API/Web builds, typechecks and focused lint remain pending. |
| Exact candidate/merged-main CI | NOT RUN; no freeze claim |
| Real AWS / IAM / public access / encryption | NOT VERIFIED; deployment gate |

The initial E2E failures were implementation regressions, not waived tests: large seed audit snapshots were replaced with bounded summary counts; the audit trigger now preserves existing FK SET NULL parent-reference cleanup while protecting event content; an omitted Industry import event was registered; trusted independent command actors are not overwritten by ambient diagnostic context. The concurrency proof found UTC-versus-session-timezone lease drift, which was corrected. No frozen test assertions were removed, skipped or weakened.

### Query-plan probe

`apps/api/test/fixtures/operations-query-plans.sql` refuses non-test database names, inserts 20,000 audit and 20,000 job fixtures inside one transaction, runs ANALYZE/EXPLAIN, and **rolls all fixtures back**. On local PostgreSQL 18, a 1%-selective Tenant/date query used `AuditLog_tenantId_createdAt_id_idx` (0.122 ms execution); the event/date query used `AuditLog_eventCode_createdAt_id_idx` (0.077 ms). The due-job query used BitmapOr of `BackgroundJob_status_availableAt_id_idx` and `BackgroundJob_expired_lease`, returning 20 rows (1.682 ms including locking). These are synthetic local measurements, not production percentile/SLA claims.

The first probe used volatile `clock_timestamp()` in the due-job range predicate and scanned the table. The candidate now uses UTC `statement_timestamp()` for indexable claim eligibility and UTC `clock_timestamp()` for live acknowledgment fences. A dense 50%-Tenant fixture legitimately favored the existing createdAt index; no forced-index settings or new index spray were used.

### Operational and release boundaries

- New audit content is append-only. Existing parent deletion may null only its FK references through nested FK actions; direct reference edits and content edits are rejected. Explicit audit deletion remains a separately reviewed retention/maintenance operation; no retention duration or automated purge is invented.
- `media.delete-object` is at-least-once, never external exactly-once. Deletion eligibility waits past upload-URL expiry plus a conservative minute; bucket lifecycle/orphan review and real S3 race behavior remain deployment concerns, not a guarantee that externally writable buckets can never recreate objects. Tenant download remains gated on READY.
- Permission additions: `system.media.view/manage`, `platform.operations.jobs.view/retry`. Existing explicit `platform.audit.view` grants are retained, including the pre-existing support grant; no role-name bypass. Support/billing receive no new job-retry permission. Auditor is view-only.
- `npm run worker:jobs` starts a separate built worker process. It does not start an API polling timer. Claim batch <=20; normal loop processes one bounded handler at a time; handler timeout 20 seconds, lease 60 seconds, maximum 5 attempts per retry budget, shutdown hard bound 30 seconds. Provider cancellation uses AbortSignal; unacknowledged work recovers by lease.
- Default audit/job query window 7 days, maximum 31 days, cursor pagination and maximum page 100; audit lists omit payloads. Job detail includes at most 50 recent attempts with an explicit older-attempts-omitted flag.
- Remaining: finish dependency reinstall; rerun all latest tests/typechecks/builds/lint; complete final security/contract/diff review; publish candidate PR and obtain exact-candidate green CI; merge only under supplied authority; verify exact merged-main CI. **DO NOT FREEZE 0.10. DO NOT START 0.11.**

## Approved continuation (2026-09-08)

The owner's `continue` follows the request for a separate narrow CORS correction. Corrective commit `aa5474d8caffa2b3c7376e21673fc81c5400da6c` on `feat/phase-0.10-audit-media-jobs` enforces the existing origin checks; it does not redefine local/private origin policy, authentication or route responses. Unapproved origins receive no CORS headers. No-Origin clients remain supported. Eighteen new real Nest HTTP-adapter regressions pass; all 235 unit tests in 17 suites pass, and API TypeScript passes. The initial npm/Jest launch exited with Windows status 3221226505 before test output; direct Node execution with a bounded heap succeeded. No assertion was weakened. No push or candidate CI has run yet.

The prerequisite findings below are historical. The stop is lifted for this correction and Phase 0.10 review resumes. The four companion catalogs distinguish proposed contracts from implemented/verified behavior. All unimplemented release gates remain open; production S3 readiness remains a deployment gate, never a CI claim.

Date: 2026-09-08. This is a prerequisite findings report, not a completed design or release certificate.

## Baseline and authority

| Item | Verified result |
| --- | --- |
| Repository | solverixtech-code/Smart-Field-Work-Saas |
| Checkout | C:\Users\MY PC\OneDrive\Desktop\Smart-Field-Work-Saas |
| Approved frozen Phase 0.9 / PRE_PHASE_0_10_SHA | `82f6522a4ee0acdf05b7be81a0ecfc04efcc79d1` |
| Fetched origin/main / local starting HEAD | Exact match to that SHA |
| Starting worktree | Clean |
| Dedicated branch created | `feat/phase-0.10-audit-media-jobs` |
| Exact frozen CI | [34198730159](https://github.com/solverixtech-code/Smart-Field-Work-Saas/actions/runs/34198730159), completed SUCCESS, exact head verified through GitHub API |
| Frozen migration count | 29, also counted in the checkout |
| Frozen unit baseline | 217 tests / 16 suites |
| Frozen E2E baseline | 141 tests / 8 suites |
| New Phase 0.10 commit / PR / candidate CI | None / none / not run |

The owner freezes 0.1-0.9 and authorizes only 0.10. Phase 0.11 remains unauthorized. Historical pending-freeze statements in earlier reports are not current authorization. No Truroot or E: checkout was modified. No production database, secret configuration or S3 bucket was inspected or changed.

## Explicit stop condition

The request requires stopping if a frozen-phase correctness defect unrelated to Phase 0.10 is discovered (condition 24). The required `main.ts` inventory reconfirmed the existing CORS allowlist bypass on the exact frozen baseline:

- `apps/api/src/main.ts:27` configures CORS.
- Lines 40-44 accept configured/local origins.
- **Line 47 also calls `callback(null, true)` when an origin fails every allowed-origin check.**
- Line 49 enables credentials.

This is already described historically by risk R-023 and the backend conversion matrix. It is not a regression introduced by Phase 0.9 or this task. Current source and a read-only executable probe confirm it remains present; the historical risk entry is not treated as proof of a completed fix or acceptance.

## Read-only reproduction

Parsed the actual origin callback from `main.ts` with the installed TypeScript parser, transpiled that callback only, and invoked it through the installed `cors` middleware. The diagnostic supplied `FRONTEND_URL=https://approved.example`; it did not boot the application, change files or contact either example origin.

| Request Origin | Actual Access-Control-Allow-Origin | Actual Access-Control-Allow-Credentials |
| --- | --- | --- |
| `https://approved.example` | `https://approved.example` | `true` |
| `https://unapproved.example` | `https://unapproved.example` | `true` |

Thus the rejected-origin branch does not reject origins. This establishes the middleware policy defect, not a claim that authentication was bypassed or production data was exfiltrated. Browser exploitability additionally depends on credentials, cookie policy and deployment conditions, which were not tested here.

## Historical direction request (resolved by continuation above)

Authorize a separate narrow frozen-bootstrap CORS correction, preserving approved origins and non-browser behavior and adding negative origin regressions, before resuming Phase 0.10. Alternatively the owner must explicitly disposition/defer this known baseline defect and lift the stop for this task. Neither correction nor acceptance is inferred from permission to implement audit/media/jobs.

No CORS, authentication, authorization, runtime, commercial or domain code has been changed. No speculative CORS policy was selected.

## Review completed before the stop

Read the governing execution plan, architecture decisions, backend conversion matrix, risk register and frozen 0.6-0.9 reports/source matrix. Initial repository search located:

- AuditLog writes in Auth, Module/catalog, Plan, Industry and Master services, plus Module history reads. Their complete transactional/redaction inventory remains unfinished.
- Existing ProvisioningEvent/ProvisioningAttempt authority, which must not be converted to a new generic queue.
- Nest Logger/console usage, bootstrap filters/guards and a root welcome controller rather than a dedicated readiness contract.
- Existing AWS S3 helper and legacy avatar, PunchLog.photoUrl and TenantBranding URL consumers. No ownership migration is authorized.
- Frozen runtime epochs/cache and the complete 29-migration chain, which must stay synchronous and unchanged except permitted observation seams.

This inventory is preliminary, not an approved Audit/Media/Job/observability contract. The four detailed event/job/media/observability catalogs have **not** been created: the explicit stop occurred before their required review/design stage. No placeholder contracts or invented ownership policies were added.

## Implementation and validation status

| Area | Phase 0.10 result |
| --- | --- |
| AuditEvent semantics / writer / redactor / query API | NOT IMPLEMENTED / NOT RUN |
| MediaAsset / private signing / completion / delete | NOT IMPLEMENTED / NOT RUN |
| BackgroundJob / attempts / registry / worker / leases / retries | NOT IMPLEMENTED / NOT RUN |
| Request context / structured logging / metrics / readiness | NOT IMPLEMENTED / NOT RUN |
| New migrations / historical backfill counts / EXPLAIN | NOT CREATED / NOT RUN |
| Security / concurrency / integrated exit proof | NOT RUN |
| New install / typechecks / builds / unit / E2E / focused lint | NOT RUN; no application code changed |
| Exact Phase 0.10 candidate / merged-main CI | NOT RUN; no candidate exists |
| Real AWS bucket / IAM / encryption / public-access readiness | NOT VERIFIED; remains deployment gate |

Baseline green CI does not certify any Phase 0.10 implementation. No old test was removed, skipped or weakened. Historical migrations remain untouched; conceptual M10 remains reserved for later legacy contraction. Future 0.10 migrations must be append-only M9 continuations.

## Changes made by this prerequisite pass

Added this report. Added status-only owner authorization notes to the Phase 0.9 report and execution plan, preserving their historical evidence. Created the requested feature branch at the frozen baseline. No application/schema/migration edit, commit, push, PR, merge, dependency change, production operation or governance change.

## Remaining issues and decision

P0 remaining work: all unimplemented Phase 0.10 release criteria. The reproduced CORS defect is corrected in the separate commit recorded above.

P1/deployment: production storage/security/configuration, mappings, backups and rehearsal remain unverified. The frozen 35 dependency audit findings are historical evidence, not reassessed by this pass.

P2: existing bundle warning; no frontend changes.

**0.1-0.9 FROZEN. 0.10 IN PROGRESS / NOT READY TO FREEZE.**

**DO NOT FREEZE PHASE 0.10. DO NOT START PHASE 0.11.**
