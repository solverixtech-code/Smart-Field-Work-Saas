# Phase 1.1 Account and Contact implementation report

## Review boundary

- Baseline: `13869eddabebd4be9a3d6954ae0ee3e07d962a9d` (Phase 1.0 merged-main CI `34956630369`).
- Branch: `feat/phase-1.1-account-contact`.
- Candidate SHA, PR number and exact candidate CI are recorded in the delivery message and PR metadata; they cannot be self-embedded in the commit that contains this report.
- Neither frozen Phase 1.0 architecture document nor any frozen Phase 0 migration was edited.
- This change does not authorize merging, freezing Phase 1.1, or starting Phase 1.2.

## Implementation and reuse

The existing Business list, create/edit, details and account-specific Contacts screens now persist Account/Contact records through the authenticated API. Empty results, real totals, inaccessible IDs, validation failures and conflicts are explicit. No converted page imports business/contact fixtures or chooses a first-record fallback.

Backend reuse: TenantAuthorized, CurrentPrincipal, RequirePermissions, TenantScopeFactory, effective tenant permissions, readEffectiveModules, PrismaService, EffectiveMasterService, masterPage, AuditEventWriter and RolePermissionService. Controllers only delegate to the CRM service. The repository owns shared scoped selects, batched projections, transactions and sanitized persistence errors.

Frontend reuse: common authenticated transport, Redux authorization, RuntimeBootstrapContext, Button, Input, Checkbox, Select and DataTable. Added a native Select variant for accessible bounded lookups, reusable Textarea, CRM service interface/API implementation, request lifetime boundary, form/error/lookup components and contact editing form. JSDOM is a test-only dependency for real React DOM interaction tests.

A narrow runtime bootstrap fix rejects old Tenant responses and removes the switch handler's reload through its previous membership closure. CRM requests are aborted on context changes, and their results remain unusable even when a transport ignores abort. StrictMode lifecycle behavior is covered.

## Data and transaction rules

One forward-only migration:

`apps/api/prisma/migrations/20260915110000_phase_1_1_account_contact/migration.sql`

- Adds Account, Contact and CrmRecordStatus; revisions start at 1.
- Uses same-Tenant composite Account/Contact/membership keys and Restrict relations.
- Enforces positive revisions, immutable Tenant/link identity, standalone-versus-linked ownership and primary validity in SQL.
- Partial unique index permits at most one undeleted primary Contact per Account.
- SQL guards prevent deleting a Business with live Contacts or deleting/deactivating its primary Contact.
- Shared SYSTEM/INDUSTRY Master references use definition/source integrity checks; Tenant Master references must belong to the same Tenant.
- Extends the existing AuditLog category check by adding CRM; the other frozen audit rules remain intact.
- SQL rejects physical Account/Contact deletion; all removal uses soft deletion. No Phase 0 CRM data backfill, duplicate merge or restore endpoint.

Mutation writes use atomic scoped revision predicates and increments. Linked commands lock Account before Contact. Primary switching demotes/promotes under the Account lock, increments affected revisions and writes audits in the same transaction. The existing Master Tenant lock precedes other locks, avoiding a shared-lock upgrade deadlock discovered by the concurrency tests. This serializes CRM writes per Tenant while validating effective Master choices; it is an intentional first-slice throughput trade-off.

Reads use consistent snapshots, bounded pages (25 default, 100 maximum, offset ceiling 100000), stable sorting and batched labels/primary projections. Names, phones and emails are not unique. Contact phone is normalized to international format; Contact creation requires phone or email. All request schemas are strict allowlists.

## Permissions and rollout

Preserved `crm.businesses.view`.

| Resource / moduleKey | Added literal permission suffixes |
| --- | --- |
| `crm.businesses` / `crm_businesses` | `create`, `update`, `delete`, `assign`, `access.own`, `access.tenant` |
| `crm.contacts` / `crm_contacts` | `view`, `create`, `update`, `delete`, `assign`, `access.own`, `access.tenant` |

There are 13 additions, with unique moduleKey/action identities. Only tenant_admin receives the new defaults. No new defaults go to sales_manager, team_leader, field_executive, support or finance_ops.

`db:sync:rbac` includes `syncCrmAdministratorGrants`: it adds missing approved grants to active built-in tenant_admin roles, including versioned roles that ordinary synchronization skips. It uses the reviewed grant/version/audit service with an optional locked, idempotent grant path. It does not replace role grants or customize other roles. Repeated synchronization is covered by PostgreSQL tests.

Every operation requires effective core_crm on the server plus exact tenant action/scope permissions. OWN constrains Account owner and standalone Contact owner. Linked Contacts inherit the visible Account scope and require corresponding Account access. An explicit assign grant permits transferring an owned record; subsequent OWN access is lost. Platform grants, role labels and legacy User dataScope do not confer access.

## API endpoint matrix

All paths below begin with `/tenant/crm`. `B` means `crm.businesses`; `C` means `crm.contacts`. Every operation also enforces the applicable explicit scope and core_crm entitlement.

| Method | Path | Action permissions | Success |
| --- | --- | --- | --- |
| GET | `/accounts` | B.view | 200, bounded page |
| GET | `/accounts/:accountId` | B.view | 200 |
| POST | `/accounts` | B.create; C.create for nested primary; B.assign for another owner | 201 |
| PATCH | `/accounts/:accountId` | B.update; B.assign for changed owner | 200 |
| DELETE | `/accounts/:accountId` | B.delete | 204 |
| GET | `/contacts` | C.view; visible Account for linked rows | 200, bounded page |
| GET | `/contacts/:contactId` | C.view | 200 |
| GET | `/accounts/:accountId/contacts` | B.view and C.view | 200, bounded page |
| POST | `/contacts` | C.create; B.update for linked; C.assign for another standalone owner | 201 |
| POST | `/accounts/:accountId/contacts` | B.update and C.create | 201 |
| PATCH | `/contacts/:contactId` | C.update; B.update for linked; C.assign for changed standalone owner | 200 |
| DELETE | `/contacts/:contactId` | C.delete; B.update for linked | 204 |
| PATCH | `/accounts/:accountId/primary-contact` | B.update and C.update | 200, account and at most two changed Contacts |
| GET | `/owner-options` | B.assign OR C.assign, plus corresponding scope | 200, bounded id/displayName page |

Errors retain Nest envelopes: 400 validation, 401 authentication/stale context, 403 access, 404 missing/deleted/foreign/out-of-scope, 409 conflicts, 422 unavailable selection, 429 throttling and sanitized 5xx. No API 412 was introduced. CRM validation errors exclude request URLs, unknown property names and submitted enum values. The frontend displays sanitized field details, retains edits on 409/defensive 412, loads current values/revision and requires deliberate resubmission. Uncertain creates are never automatically retried.

## Audit

Category CRM registers nine transactional events:

- `account.created`, `account.updated`, `account.deleted`
- `account.owner.changed`, `account.primary_contact.changed`
- `contact.created`, `contact.updated`, `contact.deleted`, `contact.owner.changed`

The metadata type permits operational IDs, revision numbers, status and changed field names. Names, email, phone, address, GSTIN, description and request bodies are not supplied to AuditEventWriter. Audit failure rolls back record creation. Contact PII and primary summaries are omitted when read permission/scope does not permit them.

## Verification evidence

| Gate | Evidence |
| --- | --- |
| Prisma validation / generation | Passed locally |
| Migration deploy / RBAC sync | Passed on local test PostgreSQL; final CI repeats both |
| API and web TypeScript | Passed locally |
| API and web production builds | Passed locally; final CI repeats both |
| API unit | 305 tests, 22 suites; 26 new CRM contract/policy cases |
| API PostgreSQL | 195 tests, 14 suites; CRM HTTP/SQL: 22/22; migration/hash proof: 2/2 |
| Web | 30 tests, 4 files; 16 CRM DOM/transport-state tests and one real runtime-context race regression |
| Fresh migration | CRM HTTP suite deploys all 34 migrations into a fresh isolated schema |
| Exact Phase 0 upgrade | All 33 original migrations deployed first, Tenant/User/role/membership inserted, then only migration 34 deployed; relationship and migration checksums preserved |
| Frozen hash proof | Manifest pins all 33 SQL SHA-256 hashes to the exact baseline, normalizing only CRLF/LF for Windows/Linux portability |
| UI mechanical inspection | Impeccable detector completed without primary findings on converted targets |
| Real browser QA | Not run: the available browser runtime reported no browser connections. No screenshot, mobile viewport or real keyboard/browser success is claimed |
| ESLint | Not claimed: existing CI does not run ESLint; no new ESLint step was added |

The PostgreSQL tests cover foreign reads/writes/references, mismatched primary child, inactive owners, OWN/TENANT/no-scope/platform authority, effective module denial, Master type/selectability/history, duplicate data, revision races, primary-switch races, live-child/primary constraints, composite FKs, soft-delete visibility, bounded pagination, transactional audit rollback and grant replay. The new subscribed-module denial test changes only the isolated test schema's catalog state and restores it; it does not weaken the required-module publication rule.

DOM tests cover loading completion, real empty/totals, 400/401/403/404/409/412/422/429/500, no fixtures on failure, retained edits and explicit resubmission, uncertain create behavior, StrictMode and old Tenant response/mutation rejection. The separate runtime test drives the real Redux/context path through a membership change.

## Exclusions and operational notes

Lead, Opportunity, Pipeline, Activity/Notes, Territory, Team scope, routing, bulk actions, import/export, jobs, media and Phase 1.2 are excluded. Editable deferred fields (territory/team, logo/attachments, turnover, employee bands, tags, languages, working hours and communication schedule) were removed. Google profile, visits, subscription and sales-history tabs cannot render prototype data for a converted Business; direct URLs show an unavailable section.

No production deployment or database migration is performed by opening this PR. Standard deployment must apply the new migration before exposing the new API and run db:sync:rbac. Browser visual, responsive and real keyboard review remains a documented owner-review limitation. Existing large web bundle and test-library deprecation warnings remain visible; build success is not a claim that these warnings were resolved.

## Changed files

The following list is the implementation file inventory; the PR diff is authoritative for exact contents.
- `apps/api/prisma/migrations/20260915110000_phase_1_1_account_contact/migration.sql`
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/sync-crm-grants.ts`
- `apps/api/prisma/sync-rbac.ts`
- `apps/api/src/app.module.ts`
- `apps/api/src/audit/audit-event-writer.ts`
- `apps/api/src/common/security/permission-registry.ts`
- `apps/api/src/common/security/role-permission.service.ts`
- `apps/api/src/crm/crm.controller.ts`
- `apps/api/src/crm/crm.module.ts`
- `apps/api/src/crm/crm.repository.ts`
- `apps/api/src/crm/crm.service.ts`
- `apps/api/src/crm/crm.spec.ts`
- `apps/api/src/crm/crm-contract.ts`
- `apps/api/src/crm/crm-policy.ts`
- `apps/api/src/crm/crm-select.ts`
- `apps/api/src/crm/crm-validation.filter.ts`
- `apps/api/src/platform/masters/effective-master.service.ts`
- `apps/api/test/crm.e2e-spec.ts`
- `apps/api/test/crm-migration-upgrade.e2e-spec.ts`
- `apps/api/test/fixtures/phase-0-migration-hashes.json`
- `apps/web/package.json`
- `apps/web/src/AppRouter.tsx`
- `apps/web/src/components/ui/Select.tsx`
- `apps/web/src/components/ui/Textarea.tsx`
- `apps/web/src/features/crm/crm.api.ts`
- `apps/web/src/features/crm/crm.state.ts`
- `apps/web/src/features/crm/crm.test.tsx`
- `apps/web/src/features/crm/crm.types.ts`
- `apps/web/src/features/crm/CrmContext.tsx`
- `apps/web/src/features/crm/CrmControls.tsx`
- `apps/web/src/features/crm/CrmForms.tsx`
- `apps/web/src/features/runtime/context/RuntimeBootstrapContext.tsx`
- `apps/web/src/features/runtime/context/runtime-switch.test.tsx`
- `apps/web/src/screens/businesses/AddBusinessPage.tsx`
- `apps/web/src/screens/businesses/AllBusinessesPage.tsx`
- `apps/web/src/screens/businesses/BusinessContactsPage.tsx`
- `apps/web/src/screens/businesses/BusinessDetailsPage.tsx`
- `apps/web/src/screens/businesses/BusinessLayoutWrapper.tsx`
- `docs/architecture/PHASE_1_1_ACCOUNT_CONTACT_IMPLEMENTATION.md`
- `package-lock.json`
