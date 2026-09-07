# Phase 0.6 subscription and provisioning implementation

Status: **IMPLEMENTED — final release verification in progress; not frozen.**

## Current implementation report — 2026-09-07

Canonical checkout: `C:\Users\MY PC\OneDrive\Desktop\Smart-Field-Work-Saas`.
Repository: `solverixtech-code/Smart-Field-Work-Saas`.
Pre-Phase-0.6 baseline: `bd5832225d91f96e9a4f0aa06eb7540b248c4208`.
Implementation continues the approved classification-only Industry boundary. No IndustryTemplateVersion, domain backend, payment provider, scheduler, subscription UI, or general delivery worker is included.

The sections below **Historical prerequisite report** are archived evidence. Their statements about missing migrations, unchanged HEAD, blocked Industry approval and unimplemented services describe the original audit, not the current checkout.

### Implementation and reuse

`platform/subscriptions` now contains the subscription command service, commercial eligibility policy, transaction helper, provisioning orchestrator, durable event claim/acknowledgment service, reconciliation service, and thin platform/invitation controllers. Existing `TenantService`, `TenantMembershipService`, built-in role initialization, `MODULE_REGISTRY`, Prisma persistence, request-principal guards, and scope-separated permissions are reused.

Frozen integration changes are limited to optional outer transaction support in Tenant/membership creation, correcting the interrupted Tenant helper, leaving invited memberships' joinedAt empty until acceptance, registering the new module, and appending SubscriptionAccessGuard after Tenant membership/RBAC guards. No authority is derived from User.role or request-body tenant IDs. Existing unmapped Tenants retain the explicit legacy compatibility behavior.

### Persistence and atomicity

- One `TenantSubscription` per Tenant; explicit published PlanVersion, billing cycle, seats, immutable original startedAt, period/trial/grace/cancellation timestamps and optimistic revision.
- `SubscriptionChange` preserves actor, reason, correlation, from/to versions and statuses, normalized request and immutable replay result. Every subscription revision requires its exact applied history. Applied command revisions are unique. Scheduled intents may resolve once; applied history cannot be rewritten or deleted.
- `TenantProvisioning` is the database-unique idempotency receipt. Its Tenant, owner membership and Subscription are linked with same-Tenant composite foreign keys. Acceptance is the only allowed receipt mutation.
- `ProvisioningEvent` stores two logical intents: OWNER_INVITATION and TENANT_INITIALIZED. Intent identity is immutable; retries create `ProvisioningAttempt` rows against the same event. Actor references are protected foreign keys. No passwords/reset tokens enter receipts or events.
- Invited, active and suspended memberships occupy seats. Database triggers serialize membership capacity changes with subscription commands, preventing a membership writer from racing a downgrade. Unmapped legacy Tenants are exempt until reconciliation.

Provisioning performs owner identity lookup/create, Tenant settings/branding/address/roles, Industry assignment, independent invited tenant_admin membership, Subscription, initial history and both event intents in one transaction. Existing active Users are reused by normalized email; ambiguous or inactive matches fail. Their credentials, profile and other memberships remain unchanged. A new global User gets an unexposed random Argon2 password hash; existing authentication/password recovery remains responsible for establishing credentials. Provisioning activates the Tenant but does not activate or select the invited membership.

### Concurrency and replay

Database-unique keys plus transaction-scoped advisory locks serialize absent-row provisioning, owner email reuse, subscription commands and event attempts across API processes. Commercial updates also lock the subscription row and require expectedRevision. Four bounded transaction attempts handle unique/serialization conflicts; exhausted contention returns a retryable error. Deferred constraints are explicitly checked before commit so an integrity failure cannot be reported as success by the transaction driver.

The hash includes normalized material input and the authenticated actor; requestId is correlation only. Equal successful replay returns the stored result even after later lifecycle changes; a different payload or actor conflicts. Failed transactions leave no receipt and can be retried. Subscription scheduling consumes a revision and writes both an applied scheduling command and a separate scheduled intent; only the explicit APPLY_DUE command changes the pin.

### Lifecycle and access matrix

| State | Reads | Writes | Allowed explicit commands |
| --- | --- | --- | --- |
| ACTIVE | Yes | Yes | CHANGE_PLAN, PAST_DUE, SUSPEND, CANCEL, APPLY_DUE |
| Unexpired TRIALING | Yes | Yes | ACTIVATE, immediate CHANGE_PLAN, PAST_DUE, SUSPEND, CANCEL |
| Expired TRIALING | Pinned accessAfterExpiry | No | ACTIVATE, PAST_DUE, SUSPEND, CANCEL, APPLY_DUE |
| PAST_DUE | Pinned accessAfterExpiry | No | ACTIVATE, GRACE, SUSPEND, CANCEL |
| Unexpired GRACE | Yes | Yes | ACTIVATE, PAST_DUE, SUSPEND, CANCEL |
| Expired GRACE | Pinned accessAfterExpiry | No | ACTIVATE, PAST_DUE, SUSPEND, CANCEL, APPLY_DUE |
| SUSPENDED | No | No | RESUME, CANCEL |
| CANCELLED | No | No | Terminal; equal command replay only |
| No Subscription | Frozen legacy behavior | Frozen legacy behavior | Explicit mapping required |

`accessAfterExpiry=READ_ONLY` allows reads; BLOCKED denies them. Membership, Tenant lifecycle and RBAC checks run first; platform roles do not bypass tenant access. Time is evaluated on every guarded request, so expired trial/grace access does not rely on a scheduler. Unknown rule schema, policy values or malformed commercial rules fail closed.

RESUME restores the suspended state and existing dates, never a fresh trial. ACTIVATE is an authorized commercial confirmation/recovery, not proof of payment. GRACE is available once per payment period from PAST_DUE using the pinned gracePeriodDays. Cancellation requires cancellationAllowed and elapsed minimumCommitmentMonths, measured from immutable subscription startedAt; pending Plan changes are cancelled atomically.

APPLY_DUE processes expired trials according to autoConvertAfterTrial, expired grace into PAST_DUE, and an ended active period according to autoRenew. Renewal advances one recorded billing period per command. With autoRenew disabled it enters PAST_DUE. No automatic payment collection occurs. Month/year arithmetic clamps to the last valid UTC calendar day.

### Plan changes and eligibility

Eligibility requires an ACTIVE Plan, exact PUBLISHED version, supported commercial rules, valid registered Module relations/dependencies, explicit available pricing cycle, audience availability, min/max/increment seats and trial limits. Industry classification never grants Modules. Read subscription metadata derives moduleCodes from the pinned version; Phase 0.9 runtime composition remains deferred.

Because frozen Plans have no authoritative tier rank, direction uses comparable same-currency recurring Decimal pricing, seats, included Modules and limits. Mixed, equal-but-different, or incomparable capability changes require both allowUpgrade and allowDowngrade. Custom-contract pricing changes are rejected pending a separate approved comparison contract. Downgrades respect original minimum commitment and occupied memberships. This is conservative validation, not a new Plan tier hierarchy.

IMMEDIATE changes record and apply the exact target atomically and start its period at command time; no invoices/proration calculations are performed. NEXT_BILLING_CYCLE changes preserve the current pin until the stored boundary. Scheduling requires ACTIVE status; trial must first be explicitly activated. One scheduled intent is allowed. APPLY_DUE revalidates the target and capacity; unavailable target or insufficient seats leaves the intent intact for operator resolution. Cancellation terminates it. Suspension postpones application; resume does not erase it.

### API and authorization

All platform routes use JwtAuthGuard -> RequestPrincipalGuard -> PermissionsGuard. Mutation inputs are validated by strict Zod command schemas; nested Tenant input reuses the existing validated foundation DTO. History and event lists are paginated (default 25, maximum 100). Responses do not expose credentials.

| Endpoint | Permission / ownership |
| --- | --- |
| POST /platform/tenants/provision | platform.tenants.provision |
| GET /platform/industry-classifications | platform.tenants.view |
| GET /platform/tenants/:tenantId/subscription | platform.subscriptions.view |
| GET /platform/tenants/:tenantId/subscription/history | platform.subscriptions.view |
| POST /platform/tenants/:tenantId/subscription/commands | platform.subscriptions.manage |
| GET /platform/provisioning/events | platform.tenants.provision |
| POST /platform/provisioning/events/:id/claim | platform.tenants.provision |
| POST /platform/provisioning/events/:id/acknowledge | platform.tenants.provision |
| POST /invitations/:id/accept | Authenticated exact invited global User; no selected membership required |

Provision body: `{ idempotencyKey, tenant: { slug, displayName, ...foundationFields }, owner: { email, fullName }, industryCode, planVersionId, billingCycle, seatQuantity, trial?, requestId? }`.

Command body: `{ idempotencyKey, expectedRevision, reason, action, requestId? }`. CHANGE_PLAN additionally requires `{ planVersionId, billingCycle, seatQuantity }`. Actions are CHANGE_PLAN, ACTIVATE, PAST_DUE, GRACE, SUSPEND, RESUME, CANCEL and APPLY_DUE. Paths use Tenant IDs only in platform-authorized APIs; operational Tenant scope remains server-selected membership.

Event claim body: `{ attemptKey }`. A claim leases an event for five minutes and returns its stable eventId, owner recipient, Tenant and provisioning references. Equal in-flight claim replay reuses the lease. Acknowledgment body: `{ leaseToken, status: "COMPLETED" }` or `{ leaseToken, status: "FAILED", errorCode }`. Error codes are bounded safe identifiers, not provider error dumps. Expired attempts are recorded as LEASE_EXPIRED when reclaimed. Stale/competing acknowledgments fail; equal completed acknowledgment replay succeeds.

Delivery is outside the transaction. The external consumer must use eventId for provider deduplication. Durable intent and acknowledgment replay do not guarantee exactly-once external delivery. No provider delivery or real email has been tested or claimed.

### Migrations and explicit legacy reconciliation

Append-only migrations: M6 `20260907140000_m6_subscription_provisioning`; M6.1 `20260907160000_m6_1_subscription_command_integrity`; M6.2 `20260907180000_m6_2_seat_and_intent_integrity`; M6.3 `20260907190000_m6_3_history_transition_proof`. Earlier migrations are unchanged. M6.1 deliberately stops if old SubscriptionChange rows already exist without receipts: an operator must resolve that data instead of fabricating replay history.

From apps/api, run `npm run db:reconcile:subscriptions -- mapping.json actorUserId --dry-run`, review mappingHash/results, then `npm run db:reconcile:subscriptions -- mapping.json actorUserId --apply mappingHash`. Actor must be active and have platform.subscriptions.view for dry run or platform.subscriptions.manage for apply.

The JSON array supplies tenantId, industryCode, exact planVersionId, billingCycle, seatQuantity, ISO startedAt and reason for each Tenant (maximum 100 per atomic batch). Mapping must describe an ACTIVE legacy Tenant. Duplicate/unknown/ineligible mappings, conflicting existing pins, insufficient seats or changed reviewed hashes abort. Equal repeated mappings report ALREADY_MAPPED. No Plan is automatically selected or published. This limited command does not infer historical suspended/cancelled state; those records require an approved state-aware mapping extension.

No production mapping or production migration was applied in this implementation. The reconciliation path is verified against explicit test mappings. Operational rollout must inventory remaining legacy Tenants and supply approved mappings before retiring the compatibility boundary.

### Validation and release gate

Validation is being rerun on the final candidate. Initial runs passed all 69 unit tests and 67 E2E tests, API and Web TypeScript, API/Web builds, Prisma generation and the complete migration chain. Expanded integrity tests and exact-SHA GitHub CI are pending final verification. No existing tests are muted or skipped in the full suite.

Release requires green final checks and GitHub Actions on the actual final SHA. This document does not certify production mapping, external email delivery or payment handling. Do not begin Phase 0.7.

### Rollback / forward fix

Take a normal database backup before deployment. Apply all migrations using prisma migrate deploy, generate the client, synchronize RBAC and deploy API code together. Do not use db push or modify an applied migration. On failure, investigate the failed migration/constraint and forward-fix with a new migration; never delete subscription history to make migration pass. Do not roll back to an API without subscription enforcement once subscribed Tenants are live; disable provisioning and tenant writes during recovery if needed. Commercial cancellation is explicit and audited, not record deletion.

## Historical prerequisite report

## Approved continuation

The user authorized proceeding with implementation after the prerequisite report. Phase 0.6 may add a minimal non-versioned Industry classification and Tenant assignment, using the existing stable industry codes. It cannot implement IndustryTemplateVersion or grant Modules. The prerequisite report below is historical evidence, not the current implementation status.

Implementation contract: one Subscription per Tenant, explicit published PlanVersion and billing cycle, optimistic revision checks, append-only change history, database idempotency, transactional provisioning with independent invited owner membership, and durable invitation intent. Scheduled Plan changes use the frozen NEXT_BILLING_CYCLE rule and an explicit apply-due command; no scheduler is introduced. Industry catalog codes are seeded as classification only. Existing Tenant foundation validation and role creation will accept an outer transaction without changing their default behavior.

Access matrix: ACTIVE and unexpired TRIALING allow reads/writes; PAST_DUE and expired trial follow the pinned accessAfterExpiry policy; unexpired GRACE allows reads/writes; expired GRACE follows accessAfterExpiry; SUSPENDED and CANCELLED deny tenant operations. Missing Subscription denotes a legacy Tenant awaiting explicit reconciliation, preserving frozen operational behavior until mapped. All new provisioned Tenants have a Subscription atomically. Tenant/membership/RBAC checks still apply first. This compatibility boundary is explicit migration debt, never implicit Plan assignment.

Owner invitations persist intent only; no email is sent inside the transaction. An authenticated matching owner accepts their invitation. Narrow event claim/acknowledgment/retry APIs use a stable logical event ID for external deduplication. General delivery workers/provider integration remain deferred; external exactly-once delivery cannot be claimed without a provider deduplication contract.

Audit date: 2026-09-07. This is a prerequisite report, not a completed implementation specification or release approval. Phase 0.1–0.5 remain frozen per the supplied instruction; their completion is not independently certified by this report.

## Repository baseline

| Item | Verified result |
| --- | --- |
| Repository | `solverixtech-code/Smart-Field-Work-Saas` |
| Audited checkout | `C:\Users\MY PC\OneDrive\Desktop\Smart-Field-Work-Saas` |
| Branch | `main` |
| Pre-Phase-0.6 SHA | `bd5832225d91f96e9a4f0aa06eb7540b248c4208` |
| Supplied Phase 0.5 freeze candidate | Same SHA |
| Remote comparison | Fetched `origin/main`; fast-forwarded the clean local checkout to the supplied freeze candidate |
| Post-freeze differences | None at audit time |
| Application/schema/migration changes in this task | None |
| New commit or PR | None; this report is an uncommitted documentation addition |

The IDE environment points at a separate Truroot CRM checkout. That checkout is not the target of this implementation and was not modified.

## Blocking Industry dependency

The brief requires an existing, approved Industry assignment to participate in the provisioning transaction. It also says to stop when meeting that requirement would require Phase 0.7 implementation.

The actual baseline has no backend Industry representation to reuse:

| Evidence | Finding |
| --- | --- |
| `apps/api/prisma/schema.prisma`, `Tenant` (line 597) | No industry ID, industry code, or assignment relation on the Tenant aggregate |
| Entire Prisma schema and historical migration directory | No Industry, IndustryTemplate, or TenantIndustryAssignment model/table |
| `apps/api/src/platform/tenants/dto/create-tenant-foundation.dto.ts` | No Industry input contract |
| `apps/api/src/platform/tenants/tenant.service.ts`, `createTenantFoundation` | Creates Tenant, settings, branding, optional address, and built-in roles; no Industry assignment |
| `apps/api/src`, `packages/shared/src` | No implemented Industry assignment service or shared backend contract; Industry permission metadata does not supply persistence |
| `apps/web/src/features/platform/tenants/types/platform.types.ts`, `IndustryConfig` | Frontend display/configuration type with `id`, `code`, `label`, `category`, `description`, and `defaultModules` |
| `apps/web/src/features/platform/tenants/fixtures/platform.fixtures.ts`, `PLATFORM_INDUSTRIES` | 25 static frontend entries, including IDs such as `ind_pharma` |
| `apps/web/src/features/platform/tenants/services/tenant.service.ts`, `FixtureTenantService.createTenant` | Copies Industry labels/codes from fixtures into an in-memory Tenant object |
| `docs/architecture/PHASE_0_EXECUTION_PLAN.md` | 0.6 expects Industry assignment, while 0.7/M7 owns persistent Industry Templates and assignment |

Persisting the frontend fixture shape, adding an arbitrary Industry string, or omitting Industry silently would choose a new contract. None is an existing backend integration.

**Decision required before implementation:** approve a minimal, non-versioned Industry classification/assignment contract for 0.6, provide an existing approved backend contract missing from this checkout, or explicitly defer Industry assignment from the 0.6 gate. A minimal classification contract would need a stable code authority, validation rules, assignment storage, and a later migration path. It must not grant Modules or introduce IndustryTemplateVersion. This report does not approve or implement any of these alternatives.

## Exact baseline CI evidence

GitHub Actions run [34092919009](https://github.com/solverixtech-code/Smart-Field-Work-Saas/actions/runs/34092919009) ran on the exact audited SHA and concluded **failure**.

| Gate | Baseline CI result |
| --- | --- |
| `npm ci` | PASS |
| Prisma schema validation | PASS |
| Complete historical migration deployment, including M5/M5.1/M5.2 | PASS |
| Prisma client generation | PASS |
| RBAC synchronization | PASS |
| API TypeScript | PASS |
| Web TypeScript | PASS |
| API build | PASS |
| Web build | PASS |
| API unit suites | 9 passed / 10 total |
| API unit tests | 55 passed / 56 total |
| API E2E | SKIPPED after unit failure; not verified |
| Phase 0.6 migration/tests/concurrency | NOT IMPLEMENTED / NOT RUN |

The failing test is `src/app.bootstrap.spec.ts`, the AppModule bootstrap smoke test. Its error is:

```text
Config validation error: "JWT_ACCESS_SECRET" is required. "JWT_REFRESH_SECRET" is required
```

`.github/workflows/ci.yml` sets `JWT_SECRET`, whereas `apps/api/src/config/environment-variables.ts` requires `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`, each at least 32 characters long. The bootstrap test imports AppModule, whose ConfigModule validates those variables. The observed failure is CI environment wiring; it is not evidence of a Phase 0.6 regression.

The narrow repair is to supply the two required, distinct test-only values in CI before test/module import, preserving the production validation and existing test assertions. Re-run the complete pipeline afterward; the currently skipped E2E suite cannot be presumed green. No CI change was made after the explicit prerequisite stop condition was established.

These are live GitHub results, not locally repeated build/test claims.

## Confirmed integration starting points

- Frozen 0.2 supplies global User identity, independent TenantMemberships, normalized Tenant children, and built-in Tenant roles. Provisioning must reuse these rules. `createTenantFoundation` currently owns its transaction; combining it with subscription writes will require a small transaction-aware integration interface with regression tests, not nested independent commits.
- Frozen platform Tenant routes use `JwtAuthGuard -> RequestPrincipalGuard -> PermissionsGuard` under `/platform/tenants`.
- Existing permissions include `platform.subscriptions.view` and `platform.subscriptions.manage`. Their use and the existing provisioning permission must be mapped against individual commands before writing new controllers. No new permission vocabulary has been introduced.
- Frozen 0.5 supplies Plan, published immutable PlanVersion, Decimal pricing, limits, Module relations, and commercial rules. A subscription must pin an explicit eligible published version; the Plan's current-version pointer cannot rewrite that pin.
- No backend TenantSubscription, SubscriptionChange, provisioning event, or outbox model exists at this baseline. Their absence is expected Phase 0.6 work, distinct from the missing required Industry prerequisite.
- The canonical Plan review still labels candidate seed Plans pending commercial approval. It does not establish a production Tenant-to-PlanVersion mapping. No production database was inspected and no claim is made that a suitable published version or approved mapping exists there.

## Implementation work pending the decision

The following remain unimplemented and unverified. They must be specified against the frozen contracts after the Industry boundary is resolved:

1. Subscription aggregate, immutable PlanVersion pin, explicit SubscriptionChange history, and authoritative lifecycle/access matrix covering trial, active, past due, grace, suspended, and cancelled behavior.
2. Atomic provisioning of Tenant, global owner identity/reuse, independent owner membership, core children, approved Industry assignment, Subscription, and durable event intents.
3. Database-unique idempotency authority with normalized payload hash; equal replay returns the same result, unequal replay conflicts. Bounded transaction retry and revision/locking protect concurrent provisioning and commercial state changes.
4. One logical invitation/default-initialization event per command, with retry attempts recorded against that event. External delivery stays outside the transaction. A provider acknowledgment/deduplication contract is required before claiming exactly-once external delivery; an outbox alone cannot prove it.
5. Thin platform API commands with frozen server authorization, safe error semantics, and explicit actor/correlation history. Any tenant API derives ownership from selected membership.
6. Append-only M6 migration and an explicit, idempotent Tenant-to-published-PlanVersion reconciliation command. Missing/ambiguous mapping must fail; no default or automatic publication is permitted. Existing migrations remain unchanged.
7. Unit, PostgreSQL, API, direct-database integrity, replay, failure/resume, and concurrency tests. Include 20 identical concurrent provision commands, competing Plan changes, cancellation versus change, and suspension versus activation.
8. Full clean migration chain and CI-equivalent validation, followed by GitHub Actions on the actual final SHA. Only a proven release may mark 0.6 completed/frozen.

No state/access behavior in this section is an implemented or approved replacement for the existing commercial rules. A complete state matrix, endpoint contract, migration name, backfill results, rollback/forward-fix procedure, and test results remain required implementation deliverables.

## Release gate

| Area | Status |
| --- | --- |
| TenantSubscription / SubscriptionChange / provisioning persistence | INCOMPLETE |
| Existing Tenant PlanVersion pinning | INCOMPLETE; no mapping applied |
| Lifecycle/access policy / pinning / atomicity | NOT IMPLEMENTED / NOT TESTED |
| Owner reuse / Industry assignment / invite intent | NOT IMPLEMENTED / BLOCKED |
| Idempotency / concurrency / retry / database integrity | NOT IMPLEMENTED / NOT TESTED |
| Duplicate-resource counts | UNKNOWN; no provisioning test ran |
| Phase 0.6 security tests | NOT RUN |
| M6 / reconciliation | NOT CREATED / NOT RUN |
| Frozen 0.1, 0.2, 0.3, 0.4, 0.5 files modified by this task | NO |
| New file | This prerequisite report only |
| Remaining P0 blockers | Approved Industry assignment boundary; failing baseline bootstrap CI and unverified E2E; all unimplemented Phase 0.6 release criteria |
| Additional P1 blockers | Not assessed; prerequisite audit stopped before full implementation audit |
| Deferred | 0.7–0.12, product domains, subscription UI, payment providers, general worker platform |
| Phase 0.6 | BLOCKED |
| Final decision | **DO NOT START PHASE 0.7** |

No commit, push, PR, application migration, production seed, or freeze status update was performed. The starting and current HEAD remain `bd5832225d91f96e9a4f0aa06eb7540b248c4208`.
