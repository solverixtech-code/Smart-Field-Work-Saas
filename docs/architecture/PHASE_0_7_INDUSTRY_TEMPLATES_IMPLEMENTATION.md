# Phase 0.7 Industry Templates implementation

Status: **BACKEND CANDIDATE VALIDATED LOCALLY / NOT FROZEN — product snapshot contract and reviewed release remain gates.**

## Baseline verification

| Item | Verified result |
| --- | --- |
| Repository | solverixtech-code/Smart-Field-Work-Saas |
| Checkout | C:\Users\MY PC\OneDrive\Desktop\Smart-Field-Work-Saas |
| Approved frozen baseline | dfafcb928ad6c907d54508953b703bef504d4ddb |
| Fetched origin/main / PRE-PHASE-0.7 SHA | dfafcb928ad6c907d54508953b703bef504d4ddb |
| Differences from approved baseline | None; no post-baseline files to reconcile |
| Starting worktree | Clean |
| Dedicated branch | feat/phase-0.7-industry-templates |
| Baseline CI | [34105107769](https://github.com/solverixtech-code/Smart-Field-Work-Saas/actions/runs/34105107769), completed success on exact baseline SHA |
| Unreviewed 0.7/0.8/0.9 implementation | None found in baseline |
| Production data inspected/mapped | None |

Phase 0.7 is authorized. Phase 0.1–0.6 remain frozen. Phase 0.8/0.9 and domain work are not authorized. The completed [fixture review](PHASE_0_7_INDUSTRY_FIXTURE_REVIEW.md) is the current implementation prerequisite, not a release certificate.

## Implementation status

The user authorized continuing the implementation after the prerequisite review. The independent backend capabilities are now implemented in the confirmed Smart-Field-Work-Saas checkout, on the dedicated branch above. The unrelated Truroot CRM checkout was not modified.

### Implemented capabilities

- Stable classification-backed identity and revision-checked metadata with lifecycle AuditLog entries.
- One DRAFT per template, monotonically allocated versions, explicit revision checks, publication approval reference and immutable PUBLISHED snapshots.
- Version/Module recommendation relations, checked against the developer registry inside publication; no commercial grants.
- One exact-version assignment per Tenant. Initial assignment requires matching existing classification and an active template's explicitly published version. Publication never moves existing pins.
- Explicit same-template migration with expectedRevision, reason, actor, optional requestId and append-only from/to-version evidence. Cross-template reclassification is rejected.
- Archive preserves historical assignment reads, but blocks new assignments and publication.
- Protected platform lifecycle/assignment APIs and selected-membership tenant read.
- Reviewed, hash-gated DRAFT import of all 25 fixtures; explicit mapping reconciliation with dry-run, atomic apply and equal replay.
- Unit, isolated PostgreSQL, API, direct-integrity and concurrency regressions.

No frontend screens, final Master Engine, runtime resolver, entitlement engine, subscription changes, generic worker platform or domain features were added.

### Snapshot boundary — still a release gate

SchemaVersion 1 currently accepts **only** `terminology: {}` and `masterDefaults: []`. Unknown keys, nonempty defaults, other schema versions and commercial fields are rejected by strict API validation; PostgreSQL also enforces the empty snapshot boundary. This enables independent lifecycle/assignment verification without invented product values. It is **not** completion of the nonempty terminology/Master-default requirement or an assertion that the user waived its exit tests.

Full freeze requires approved terminology keys and Master-default code/value definitions with reviewed v1/v2 examples, or an explicit scope decision deferring those exit criteria. Nonempty support needs a reviewed versioned validator and append-only M7 migration, never a rewrite of published snapshots. No production candidate has been published.

### Reuse and frozen-file touch inventory

| Facility/file | Reuse or additive change |
| --- | --- |
| PrismaService / PersistenceModule | Existing database access, unchanged |
| SubscriptionTransactionService | Reused retries, advisory locks and pre-COMMIT deferred-constraint validation; frozen implementation unchanged |
| subscription-contract.ts | Reused normalized payload hashing and JSON serialization, unchanged |
| Module registry/projections | Eligibility authority reused; no new Modules or grants |
| Tenant.industryCode / M6 provisioning and reconciliation | Unchanged; M7 assignment is explicit and separate |
| RequestPrincipal / tenant/platform guards | Unchanged; selected membership and subscription access remain enforced |
| AuditLog | Existing lifecycle audit reused; M7-specific immutable assignment evidence added separately |
| schema.prisma | Additive M7 models/enums and inverse relations only |
| app.module.ts | Registers PlatformIndustriesModule |
| common/security/permission-registry.ts | Adds only platform.industries.manage, included in the existing super-admin all-platform grant; no unrelated role grant broadened |
| package.json | Adds explicit Industry import/reconciliation CLI |
| PHASE_0_EXECUTION_PLAN.md | Status-only authorization/progress updates |

All pre-M7 migrations and frozen subscription/provisioning/Plan services are untouched. No `.env` file or new dependency was added.

### Locking and integrity

Services reuse transaction advisory locks for Industry identity, template, and Tenant assignment, then lock aggregate rows. Publication reloads the complete snapshot and recommendations under the template/version locks, validates and publishes in one transaction. Candidate import and reconciliation serialize their respective batches; mappings use canonical Tenant ordering.

Database triggers enforce retained identities/versions, one draft, monotonic numbers, same-parent PUBLISHED pointers, and published parent/child immutability including INSERT/UPDATE/DELETE/reparent paths. Direct child writes and publication lock the same parent. Assignment guards lock the Tenant/target template, verify classification and same-template migration, and require matching transition evidence before commit. Evidence is append-only and cannot be fabricated independently. A narrow Tenant trigger prevents changing classification after a pin exists.

Append-only migrations:

1. `20260908000000_m7_industry_templates`: persistence, indexes and FKs.
2. `20260908001000_m7_1_industry_integrity`: lifecycle, snapshots, published children, assignment/evidence and classification guards.
3. `20260908002000_m7_2_publication_approval`: explicit non-NULL approval enforcement; SQL CHECK unknown must not pass as approval.

### Implemented API contract

Platform routes use JwtAuthGuard -> RequestPrincipalGuard -> PermissionsGuard. GET requires platform.industries.view; mutations require platform.industries.manage.

| Method | Path | Contract |
| --- | --- | --- |
| GET / POST | /platform/industries | Paginated list / existing classification code, name, category, description |
| GET / PATCH | /platform/industries/:id | Metadata / full metadata, expectedRevision, reason |
| GET | /platform/industries/:id/versions | Paginated version history |
| POST | /platform/industries/:id/versions/draft | Template expectedRevision, reason; clone previous snapshot without publishing |
| GET / PATCH | /platform/industries/:id/versions/:versionId | Exact snapshot / version expectedRevision, reason, schemaVersion, terminology, masterDefaults, recommendedModuleCodes |
| POST | /platform/industries/:id/versions/:versionId/publish | Version expectedRevision, reason, approvalReference |
| POST | /platform/industries/:id/archive | Template expectedRevision, reason |
| GET / POST | /platform/tenants/:tenantId/industry-template | Platform read / initial exact industryTemplateVersionId, reason, optional requestId |
| POST | /platform/tenants/:tenantId/industry-template/migrate | Exact target, expected assignment revision, reason, optional requestId |
| GET | /platform/tenants/:tenantId/industry-template/history | Paginated transition history |
| GET | /tenant/industry-template | Exact selected-membership pin, or null if unassigned; no caller-controlled Tenant selector |

Lists default to page 1 / limit 25, maximum 100. UUIDs, normalized codes, bounded strings, strict fields and integer revisions are validated. Validation/absence/conflict return 400/404/409; authentication/authorization retain frozen 401/403 behavior. Tenant reads retain TenantAuthenticated subscription enforcement. Recommendations are advisory snapshots, not effective runtime configuration.

### Import and reconciliation runbook

Run from apps/api with configured environment and an ACTIVE platform actor. Dry-run requires Industry view; apply requires Industry manage. Neither production nor development startup automatically invokes these commands.

```powershell
npm.cmd run db:reconcile:industries -- --candidates ACTOR_USER_ID --dry-run
npm.cmd run db:reconcile:industries -- --candidates ACTOR_USER_ID --apply REVIEWED_SOURCE_HASH
npm.cmd run db:reconcile:industries -- mapping.json ACTOR_USER_ID --dry-run
npm.cmd run db:reconcile:industries -- mapping.json ACTOR_USER_ID --apply REVIEWED_MAPPING_HASH
```

Mapping file: array of `{tenantId, industryTemplateVersionId, reason, requestId?}`. Unknown resources, duplicate Tenant entries, DRAFT/archived targets, mismatched classifications and conflicting pins fail atomically. Equal mappings return ALREADY_MAPPED without new history. There is no latest/default lookup, auto-publication flag, implicit migration or Module creation.

Candidate source retains reviewed fixture ID/hash provenance, verified against all 25 frontend source entries by AST comparison. Known historical aliases are normalized; unknown or duplicate canonical Module codes fail. Equal import replay never overwrites edited drafts; changed provenance requires manual review. All candidates stay DRAFT until ordinary separately approved publication.

### Current verification evidence

| Gate | Result |
| --- | --- |
| Baseline exact-SHA CI | PASS, linked above |
| Prisma validation/client generation/API TypeScript | PASS locally before final validation |
| Full migration chain | PASS in fresh test database and suite-owned schemas through M7.2 |
| New unit tests | 5/5 PASS |
| New PostgreSQL/API tests | 13/13 PASS |
| Draft import | 25 drafts, 69 recommendation rows, zero published; equal replay no duplicates |
| Version pin/migration | PASS; v2 recommendation publication leaves v1 pin until explicit migration |
| Nonempty terminology/default migration | NOT IMPLEMENTED; approved definitions missing |
| Direct database integrity | PASS: published parent/child edits, deletes, inserts, reparenting, forged/missing history and reclassification rejected |
| Concurrency | PASS: 10 competing drafts, edit/publish, competing migrations, both direct child/publication lock orders |
| Commercial isolation | PASS with real provisioned Tenant: subscription row, seats, Plan Modules, revision, history and RBAC grants unchanged |
| Security | PASS: platform denial, strict inputs, selected Tenant isolation, inactive membership and suspended subscription denial |
| Clean npm ci | PASS after user-approved stop of the exact local esbuild helper; 972 packages installed |
| API/Web TypeScript and builds | PASS |
| All unit tests | 74/74 PASS across 12 suites |
| All E2E tests | 90/90 PASS across 6 suites; all 77 incumbent cases retained |
| Focused lint | No explicit any or unused-variable errors in new files; no repository ESLint config exists |
| Candidate PR | [Draft PR #2](https://github.com/solverixtech-code/Smart-Field-Work-Saas/pull/2); candidate Actions verification in progress |
| Merged-main CI | NOT APPLICABLE: unmerged draft; no M7 freeze certificate |

Tests deploy the entire migration history into uniquely named suite-owned schemas and remove only those schemas afterward. No production mapping, seed or publication was executed. Incumbent Phase 0.6 tests are unchanged.

### Deployment, recovery and release

Deploy via the full prisma migrate deploy chain, synchronize RBAC, and review/import candidates explicitly. Production publication and exact Tenant mappings are separate deployment gates. Test counts are not production reconciliation evidence.

Take a database backup before deployment. Before M7 adoption an application rollback may retain the additive tables. Once assignments/versions exist, use a forward-fix migration; never drop evidence, disable triggers or edit old migrations. A pre-M7 database restore would lose later history and needs an explicit recovery decision.

Remaining P0 release gates: approved nonempty snapshot contract (or explicit deferral), complete validation, reviewed PR and exact merged-main GitHub Actions success. No production readiness or full completion is claimed.

**Phase 0.1–0.6: FROZEN. Phase 0.7: IN PROGRESS / NOT FROZEN. Phase 0.8: DO NOT START.**

After the decision: implement the M7 aggregate and publication/assignment/reconciliation paths, add dedicated deterministic test factories and full unit/PostgreSQL/HTTP regressions, run all gates, push/open the dedicated PR, and verify candidate plus merged final-main CI before recording the Phase 0.7 freeze. Database failures use a forward-fix migration; never delete historical pins or rewrite applied migrations.
## Non-gating environment findings

The clean install reports 35 dependency vulnerabilities (3 low, 16 moderate, 16 high). No dependency versions or lockfile were changed. Web build retains its existing large-bundle warning. No unrelated dependency or frontend refactor was attempted. Windows Vite/esbuild held a binary during the first npm ci; only that identified helper was stopped with explicit user approval. Restart the local development server when needed.
