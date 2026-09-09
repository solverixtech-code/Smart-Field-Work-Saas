# Phase 0.9 runtime configuration implementation

Current owner status (2026-09-08): **0.1-0.9 FROZEN** at merged-main `82f6522a4ee0acdf05b7be81a0ecfc04efcc79d1`; [exact-main CI 34198730159](https://github.com/solverixtech-code/Smart-Field-Work-Saas/actions/runs/34198730159) SUCCESS (29 migrations, 217 unit tests / 16 suites, 141 E2E / 8 suites). Phase 0.10 is separately authorized; its [prerequisite report](PHASE_0_10_AUDIT_MEDIA_JOBS_IMPLEMENTATION.md) records a stop before implementation. All pre-merge status/evidence below is preserved as historical, not current freeze status.

Status: **IMPLEMENTED - local release checks PASS; PR and exact merged-main CI pending. NOT FROZEN.**

This is the **pre-merge candidate record**. The final immutable candidate/merged-main SHAs and their completed Actions results are recorded in the release-evidence comment on [PR #5](https://github.com/solverixtech-code/Smart-Field-Work-Saas/pull/5), after both runs finish. Pending statements here describe this commit's recording time, not a later verified release.

## Authorization and baseline

Date: 2026-09-08. Repository: solverixtech-code/Smart-Field-Work-Saas.
Checkout: `C:\Users\MY PC\OneDrive\Desktop\Smart-Field-Work-Saas`.
Baseline/main: `5c4d445f7c831569e0f8e409636c3472647bd453`.
Branch: `feat/phase-0.9-runtime-config`. No direct main push, unrelated UI edit, or Truroot/E: change.

Owner freezes 0.1-0.8 at that SHA. Baseline exact-main Actions [34132282769](https://github.com/solverixtech-code/Smart-Field-Work-Saas/actions/runs/34132282769) succeeded: 27 migrations, 168 unit tests/15 suites, 104 E2E tests/7 suites.

The prerequisite audit stopped because M7 has no Industry scalar-settings authority and concrete TenantSettings cannot encode inheritance. After the explicit deferral question, the owner's "proceed with the implementation" approved the empty Industry scalar layer continuation. This implementation report supersedes the prerequisite-only report.

## Approved contract and exclusions

- Industry scalar settings remain empty. The nonempty persisted scalar-setting v1/v2 proof is **explicitly deferred**, requiring a separately approved versioned settings/inheritance contract. Frozen empty terminology/masterDefaults JSON is untouched. Actual normalized Industry **Master values** retain their persisted v1/v2 proof.
- Seven concrete TenantSettings values are explicit overrides, even when equal to defaults. Only a missing entire settings row uses existing TenantSettingsInputDto defaults, without writing a row. NULL/malformed/unknown objects and arrays are invalid, not inheritance.
- No frozen TenantSettings update HTTP command exists. M9 adds no competing settings API; direct Prisma mutations prove the existing persistence path and its concurrent invalidation. A settings-update HTTP proof is not claimed.
- BLOCKED commercial access stays **HTTP 403**, not a minimal-200 exception. Legacy missing Subscription stays LEGACY_UNMAPPED, without commercial Modules or guessed mappings; only unbound Masters remain available.
- No frontend/domain, Phase 0.10, worker, Redis, payment, production mapping, dependency or governance changes.

## Runtime endpoint and strict payload

`GET /tenant/runtime/bootstrap`, no query selectors. Uses unchanged TenantAuthenticated: JwtAuthGuard -> RequestPrincipalGuard -> MembershipContextGuard -> SubscriptionAccessGuard. No new permission vocabulary. Existing `/auth/authorization` is unchanged.

| Field                            | Contract                                                                                |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| schemaVersion / configVersion    | Schema 1 / opaque cfg1_ canonical dependency hash                                       |
| generatedAt / nextRevalidationAt | Nonsemantic response time / next future trial or grace boundary                         |
| principal / tenant               | Exact selected userId, membershipId, tenantId; Tenant id, displayName and ACTIVE status |
| access                           | FULL or READ_ONLY; SUBSCRIBED or LEGACY_UNMAPPED; status and exact PlanVersion pin      |
| modules                          | Pinned Plan Modules intersect canonical and DB ACTIVE/BETA; source PLAN_VERSION         |
| industry                         | Exact published assignment templateId/versionId/version, or null                        |
| settings / settingsProvenance    | Seven approved scalar fields / SYSTEM or TENANT                                         |
| permissions                      | Sorted unique TENANT permission codes; never platform union                             |
| masters                          | MANIFEST, canRead/canManage, at most 24 effective definitions; no full value preload    |

Values and historical lookup stay on frozen Master endpoints. Missing master-view permission gives an empty manifest; READ_ONLY removes canManage without redefining stored RBAC grants. Clients still need server authorization for every operation.

Timezone uses Intl validation; currency is three uppercase characters; financial month is integer 1-12. Existing locale/language/dateFormat/weekStartDay string meanings remain (bounded to 1-200), with no invented product allowlist. Defaults are reused from the foundation DTO: Asia/Kolkata, INR, en-IN, en, YYYY-MM-DD, MONDAY, 4.

Strict Zod plus OpenAPI reject unknown output fields. No secrets, billing rules, raw grants, epoch counters, providers, reconciliation hashes or frontend routes/components appear. Cache-Control is private/no-cache/max-age=0, Vary Authorization/Cookie. **Weak semantic ETag** is necessary because generatedAt varies. Matching If-None-Match returns 304 only after current DB/time checks. Errors: input400; auth/session401; membership/commercial403; invalid source, size or unstable composition503.

## Reuse, additions and frozen touches

Reused: principal/guards, EffectivePermissionService, EffectiveMasterService select/filter, registry, subscriptionAccess/readRules, exact Plan/Industry pins, TenantSettingsInputDto defaults, payloadHash, existing Plan serialization classifier.

Added: RuntimeModule/controller, strict contract/OpenAPI, composer, clock, bounded cache, RuntimeConfigEpoch, append-only M9/M9.1, focused unit/PostgreSQL tests.

Minimal frozen integration:

- M1: shared readEffectiveModules extracts M8's existing commercial intersection. Registry semantics unchanged; recommendations/dependencies cannot grant.
- M2: inverse Tenant schema relation only; foundation unchanged.
- M3: no guard/session change; runtime rechecks live context and fails closed on foreign-Tenant role corruption.
- M4: optional TransactionClient read seam bypasses its independently cached permissions only inside the runtime snapshot; ordinary paths unchanged.
- M5/M6: read existing rules/revision/pin and error classifier; no commercial mutation change.
- M7: inverse IndustryTemplateVersion schema relation only; frozen snapshot/publication unchanged.
- M8: shared Module read and additive definitionsInSnapshot with identical select/order/filter/take24.
- AppModule registers RuntimeModule; status-only freeze/authorization documentation updated.

No incumbent test assertion or historical migration changed. No new dependency or frontend file.

## Version and invalidation authority

The [source matrix](PHASE_0_9_RUNTIME_CONFIG_SOURCE_MATRIX.md) maps every semantic field. Unit tests require all semantic top-level schema keys to declare dependencies and match OpenAPI.

Vector: schema/code revision (including foundation defaults and canonical Module lifecycle), User/membership/Tenant/session/context identity, scoped epoch IDs and BIGINT versions, Subscription ID/revision/exact pin/access, exact Industry assignment ID/revision/version, accessMode and nextBoundary. generatedAt is excluded. Master value payloads are not loaded/hashed.

M9 initializes SYSTEM plus one epoch per existing Tenant and Industry version. New parents initialize transactionally. Unique owner keys, partial SYSTEM uniqueness, scope CHECK, FKs and monotonic +1 guard enforce integrity. Identity is an incarnation UUID: legitimate parent deletion/cascade remains possible, but same-UUID recreation gets a new epoch identity and cannot revive old keys. Live-owner delete/reset/reparent fails.

| Write authority                                                                                                                           | Scope                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| PlatformModule, Permission, MasterDefinition; SYSTEM MasterValue/Override                                                                 | SYSTEM                                                   |
| Tenant, TenantSettings, TenantMembership, TenantRole, TenantRolePermission, TenantIndustryTemplateAssignment; TENANT MasterValue/Override | Selected/old/new TENANT                                  |
| IndustryTemplateVersion; INDUSTRY MasterValue/Override                                                                                    | Exact INDUSTRY version                                   |
| Subscription                                                                                                                              | Existing enforced revision/pin, plus time-derived access |
| User/session                                                                                                                              | Live availability/context check in both snapshots        |

Triggers cover direct SQL/Prisma and service writes. Old/new scopes are deduplicated and sorted per row. No all-Tenant fanout. Source mutation and counter increment share the transaction; bump failure rolls back the source write. M9.1 rejects TRUNCATE, which bypasses row triggers. Normal scoped DELETE keeps frozen semantics. Administrators disabling triggers are outside application guarantees.

Lock order remains source/aggregate locks before epoch row updates. No new advisory read locks or nested independent commits. Multi-row writers with opposite lock order may receive PostgreSQL serialization/deadlock aborts and must retry whole transactions; existing transactional services retain their retry contracts.

## Consistency and cache

Each attempt uses a read-only REPEATABLE READ snapshot to recheck membership/User/Tenant/role ownership/session, pins and epochs. Cache lookup uses only that complete version; on a miss permissions/settings/Master manifest are composed in the same snapshot. A second independent read-only REPEATABLE READ snapshot rechecks complete authority and context. Compare versions and current clock before insertion/return; retry from scratch at most three times, then safe503.

The second snapshot is the linearization point. A commit after that point may legitimately take effect on the next request; this is not a claim of locking until network delivery. An old snapshot is never relabeled with a new version. Session changes can return401/403. Trial/grace transitions need no row mutation and cannot survive a cache/ETag boundary. GET never APPLY_DUE, renews, repins, provisions or seeds.

Cache: process-local, at most256 entries, validated/cloned payloads <=128KiB, 60-second sliding retention capped by commercial boundary. Key spells out Tenant/membership/User and configVersion (which includes session context). Corrupt/foreign entries discarded; deterministic oldest-insertion eviction. Old physical keys cannot match current authority. Cache insertion failure returns the fresh authoritative result. Independent instances reread the same DB vector; no shared Redis or invalidation broadcast required.

No single-flight/distributed lock was introduced. Ten concurrent cold reads prove deterministic correctness, not 100-request latency/coalescing. Any future optimization must retain authority checks.

## Migration and decisive PostgreSQL proof

Migrations:

- `20260908110000_m9_runtime_configuration`
- `20260908111000_m9_1_runtime_truncate_safety`

Suite deploys all27 unchanged baseline migrations, creates an existing Tenant and Industry version, then deploys all29. Backfill verifies exactly3 initial epoch rows at1 (SYSTEM plus both owners), matching live-owner counts, and unchanged epochs after repeat deploy. Test-only generated schemas are safety checked and removed. No production DB touched.

Persisted decisive scenario: Plan P1 permits CRM/visits; exact Industry v1 contributes INDUSTRY_SOURCE_A. System referral/inbound/field sources and Tenant source coexist; Tenant renames REFERRAL and hides INBOUND; historical hidden lookup remains non-selectable. Publishing v2 with INDUSTRY_SOURCE_B leaves v1's pin/configVersion unchanged. Explicit migration changes both pin/version and effective values. Plan removal of visits removes Module and visit Master manifest/API access despite Industry recommendations; stored definitions survive. Nonempty scalar Industry proof remains approved deferral, not a simulated pass.

Regressions cover direct settings/grant/Permission/Module/Master writes, real session switching, known-UUID/client-selector isolation, foreign roles, old ETags, legacy/blocked access, time-only trial/grace expiry, epoch rollback/corruption, stale/poisoned entries, independent caches, typed driver retries, repeated churn503, ten-way cold reads, twenty concurrent epoch writers without lost increments, same-Tenant different-role caches and role deactivation, and settings/RBAC/Plan/Industry/System-Master/Tenant-Master/Module changes during composition.

## Performance

Local PostgreSQL18 representative request: **49 cold / 41 warm SQL statements**, including frozen guard/principal reads and both authority checks; **9,322 bytes**. Recorded sample: **55.26ms cold / 20.15ms warm**. Development samples, not production percentiles or zero-query cache claims.

E2E budget <=60cold/<=50warm, representative payload<32KiB. Hard payload128KiB; <=24definitions, registry-bounded Modules, <=1000unique permissions. Structurally valid oversized payload rejected by unit test. One bounded definition query; no per-Master-value reads. Existing owner/unique indexes reused; no speculative performance index or production EXPLAIN claim.

## Build, tests and release gates

| Gate                                                                                | Local result                                                  |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| npm ci                                                                              | PASS                                                          |
| Prisma validate / full migrate deploy / generate / RBAC sync                        | PASS                                                          |
| API TypeScript / Web TypeScript                                                     | PASS / PASS                                                   |
| API build / Web build                                                               | PASS / PASS                                                   |
| Unit tests / suites                                                                 | **217/217, 16/16 PASS** (baseline168/15; runtime49 new tests) |
| E2E tests / suites                                                                  | **141/141, 8/8 PASS** (baseline104/7; runtime37 new tests)    |
| Upgrade/backfill/replay, DB integrity, security, cache, time and concurrency proofs | PASS                                                          |
| Candidate PR CI / exact merged-main CI                                              | PENDING / PENDING                                             |

All incumbent Plan/security/commercial/Master suites pass unchanged with M9 installed. npm reports35 inherited dependency vulnerabilities (3low,16moderate,16high); dependency/lockfile unchanged. Web retains a6.53MB minified bundle warning. No automatic audit fix, frontend/browser/mobile or production QA.

## Deployment and recovery

After release gates: backup, review migration write locks, full migrate deploy, verify one SYSTEM and one epoch per live Tenant/Industry version with positive counters, generate client, deploy API, smoke selected-member/oldETag/blocked/legacy behavior. Migration engine supplies replay authority; never manually rerun raw M9 SQL. Cache warmup optional.

Prefer forward fix; API rollback keeps additive M9 state/triggers. Existing suites demonstrate frozen services still work with M9; actual production rollback rehearsal/lock duration remains a deployment gate. Never reset epochs, disable guards/triggers or rewrite historical commercial/Industry data. TRUNCATE-based maintenance needs a separately reviewed compatible procedure.

Production data-quality checks against strict settings validation and explicit reviewed Subscription/Industry/Master mappings, backups and deployment smoke tests remain deployment-only gates. None were guessed/applied.

## Deferred, remaining issues and decision

0.10: AuditEvent/observability, MediaAsset, Outbox/Job/workers, durable async optimizations.
0.11: frontend runtime consumption, query cache/navigation, Master frontend conversion.
0.12: production-shaped full migration/browser rehearsal.

P0 release: candidate PR CI and exact merged-main CI pending.
P1 deployment: reviewed legacy mappings and production rehearsal; branch protection/governance unchanged.
P2 maintenance: inherited dependency audit and bundle warning.

**0.1-0.8 FROZEN. 0.9 IMPLEMENTED, NOT FROZEN. DO NOT START PHASE 0.10.**
