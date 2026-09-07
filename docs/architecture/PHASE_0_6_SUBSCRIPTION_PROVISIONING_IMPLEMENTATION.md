# Phase 0.6 subscription and provisioning implementation

Status: **IN PROGRESS — prerequisite scope approved; release gates pending.**

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
