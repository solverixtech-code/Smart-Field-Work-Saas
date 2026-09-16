# Phase 1.2 — Lead vertical slice and manual assignment

## Baseline and review boundary

- Repository: `solverixtech-code/Smart-Field-Work-Saas`.
- Observed and re-fetched main: `96a92e91d6c7ff483e9593ebfbfb4facaf27453d`.
- Corrected Phase 1.1 baseline: `fdc23b72120c256a40f888d28e0e83928e276021`.
- Preflight CI: [34979790008 — success](https://github.com/solverixtech-code/Smart-Field-Work-Saas/actions/runs/34979790008), verified before Lead implementation began and rechecked before candidate publication.
- Branch: `feat/phase-1.2-lead-manual-assignment`, created from the corrected baseline.
- The main-targeted PR includes the unmerged preflight repair. See [preflight report](PHASE_1_2_PREFLIGHT.md) for the Business fixture regression and restored frozen subscription policy.
- Development and verification use the isolated worktree `C:\Users\MY PC\.codex\worktrees\smart-field-phase-1-2`. The original IDE checkout was preserved.
- Candidate SHA and CI attestation are recorded below. No merge or Phase 1.3 work is authorized by this candidate.

## Persistence and invariants

New migration: `20260915160000_phase_1_2_lead_manual_assignment/migration.sql`.
No historical SQL file changed. The new Phase 1.1 hash fixture freezes all 34 predecessor migrations; the existing 33-migration fixture remains intact.

`Lead` holds the tenant, kind, descriptive/contact/address fields, effective Lead source reference, canonical lifecycle, independent priority, owner, optional assignee, current Account/Contact links, revision, timestamps and membership provenance. `LeadConversionCommand` holds one immutable conversion per Lead: command identity, normalized payload hash, resulting revision, target references and actor/time. There is no Opportunity relation.

Same-tenant composite foreign keys cover owner, assignee, current and converted targets, conversion actor, provenance and command/Lead relationship. Revision must be positive. SQL triggers reject tenant/provenance mutation, hard deletion, updates to converted or deleted Leads, invalid lifecycle transitions, inconsistent Contact/Account links and invalid Master references. A converted Lead must have a matching command with the same target IDs, actor, time and revision; deferred constraints validate the final transaction state. Command updates/deletes are rejected. Referenced live or converted targets cannot be soft-deleted.

Indexes support tenant/deleted/created ordering, owner and assignee scopes, status/priority filtering, and current/converted target reference guards. Search is bounded to 200 characters; pages to 100 rows and offset to 100,000. Source aggregates return at most eight groups. This is not an unbounded browser-side export.

### Lifecycle

| Current state            | Allowed action                                                 |
| ------------------------ | -------------------------------------------------------------- |
| OPEN                     | Edit, assign, qualify, disqualify, mark duplicate, soft-delete |
| QUALIFIED                | Edit, assign, convert, disqualify, mark duplicate, soft-delete |
| DISQUALIFIED / DUPLICATE | Read or soft-delete; no reopening or reassignment              |
| CONVERTED                | Read or authorized replay of its exact conversion; immutable   |

Priority is LOW/MEDIUM/HIGH/URGENT. Assignment and priority never masquerade as lifecycle. BUSINESS conversion requires an Account and optionally a Contact belonging to it. INDIVIDUAL conversion requires a standalone Contact and no Account.

## Authorization

Every request uses the authenticated selected membership. The reused CRM transaction runner rechecks active membership/tenant, current effective tenant permissions, pinned `core_crm` entitlement and write restrictions. Browser tenant IDs, platform grants, role labels, legacy team fields and `User.dataScope` are not record authority.

| Permission                  | Meaning                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------- |
| `crm.leads.view`            | List, counts and detail                                                                           |
| `crm.leads.create`          | Create within a granted resulting record scope                                                    |
| `crm.leads.update`          | Edit fields and allowed lifecycle transitions                                                     |
| `crm.leads.delete`          | Soft-delete an eligible Lead                                                                      |
| `crm.leads.assign`          | Change owner/assignee; list eligible memberships; required for non-self owner or initial assignee |
| `crm.leads.convert`         | Execute/replay conversion, subject to target permissions                                          |
| `crm.leads.access.own`      | `ownerMembershipId` is the selected membership                                                    |
| `crm.leads.access.assigned` | `assignedMembershipId` is the selected membership                                                 |
| `crm.leads.access.tenant`   | All undeleted Leads in the selected tenant                                                        |
| `crm.leads.manage`          | Preserved registry identity; no wildcard authority                                                |

An action AND at least one explicit scope are required. Multiple scopes form a union beneath tenant isolation. No scope returns 403; an inaccessible individual UUID returns 404. Owner/assignee targets must be active same-tenant memberships of active users. Assignment returns an ID/revision receipt because a successful transfer can intentionally remove the caller's visibility.

Registry version is `1.2.0`. Existing view/create/manage identities are preserved. The existing idempotent RBAC sync adds explicit CRM grants only to active built-in system tenant administrators, including versioned roles; it does not modify custom role policies. Non-administrator roles require deliberate grants before using this slice.

## Endpoint matrix

All paths below are relative to `/tenant/crm/leads` and require selected tenant membership plus `core_crm`.

| Method / path           | Exact action | Result / concurrency                                                                               |
| ----------------------- | ------------ | -------------------------------------------------------------------------------------------------- |
| GET `/`                 | view         | Scoped paginated list; search/status/priority/source/owner/assignee/Account/hot/unassigned filters |
| GET `/counts`           | view         | Scoped total, lifecycle/priority counts, unassigned count, top eight sources                       |
| GET `/owner-options`    | assign       | Paginated active memberships with display name, avatar and designation                             |
| GET `/:id`              | view         | Detail or 404                                                                                      |
| POST `/`                | create       | 201, revision 1; assign additionally required when applicable                                      |
| PATCH `/:id`            | update       | 200; required `expectedRevision`                                                                   |
| PATCH `/:id/assignment` | assign       | 200 receipt; required `expectedRevision`                                                           |
| POST `/:id/conversion`  | convert      | 201 receipt, including exact authorized replay                                                     |
| DELETE `/:id`           | delete       | 204; body contains `expectedRevision`                                                              |

All commands use strict Zod allowlists and the existing sanitized CRM validation filter. Stale mutation returns 409 `CRM_STALE_REVISION`; invalid relationships/inactive targets return 422. Invalid/foreign choices never fall back to an arbitrary record. An additive `standalone=true` filter on the existing Contact collection makes individual Lead lookup pagination/counts accurate. It cannot be combined with an Account filter or the nested Account Contact route.

## Atomic conversion

The reused CRM runner takes the existing tenant serialization lock before membership/master/record locks. The service then locks the tenant-scoped Lead, checks exact conversion/scope and target permissions, and checks the stored command before normal first-execution revision validation.

For first execution, it requires QUALIFIED and the expected revision, resolves create-or-link choices, validates target relationships, creates targets through extracted transaction-aware existing Account/Contact internals, updates the Lead using CAS, inserts the immutable command and writes `lead.converted` in the same transaction. Existing Account/Contact creation audits also remain transactional. Any failure rolls back every write.

| Target choice             | Additional authority                                               |
| ------------------------- | ------------------------------------------------------------------ |
| Link Account              | Business view and current Business record scope                    |
| Create Account            | Business create, view and scope; assign if selecting another owner |
| Link Contact              | Contact view and current Contact/parent record scope               |
| Create standalone Contact | Contact create, view and scope                                     |
| Create linked Contact     | Contact create/view/scope AND Business update/view/scope           |

Same key and normalized payload replay the stored result only after current membership, entitlement, action, scope and target access are revalidated. A different key or changed payload returns 409. A revoked permission or lost record scope denies replay. Target status is revalidated too: deactivation can make replay unavailable. Opportunity input is rejected by the strict contract.

## Frontend and reuse

Production data follows `Page -> CrmBoundary/useCrmQuery/useCrmMutation -> CrmService.leads -> leadApi -> common authenticated API client`. No direct transport, fixture fallback, browser persistence or first-record fallback exists in the converted routes. The tenant/membership/permission/token session key remounts forms, aborts old requests and ignores late results.

Reused primitives: Button, Input, Select, Textarea, Card, DataTable, KpiCard, CrmFailure, CrmLookup, ContactFields, Modal and RowActionsMenu. Card gains an optional panel variant; the existing default is preserved. CrmLookup gains bounded Lead owner options and selectable record summaries. Shared Modal provides a portal, dialog labeling and focus management. Shared RowActionsMenu provides a portal, arrow-key navigation, Escape and focus restoration. Select supports avatar fallback and keyboard-accessible choices.

New feature components are `LeadForm`, `LeadRecordLookup`, `LeadAssignment`, `LeadConversionModal` and `LeadDeferred`; each centralizes behavior shared by the converted flows. Create/edit retain the established two-column section layout. Detail keeps its summary, tabs and owner/assignment panels. The list keeps five KPI cards, category navigation, filters, full-width table, badges, actions and analytics panels. Workspace totals come from aggregate queries, never the current page.

| UI route                          | Backed behavior                                                 |
| --------------------------------- | --------------------------------------------------------------- |
| `/admin/leads`                    | Scoped list and aggregates                                      |
| `/admin/leads/unassigned`         | Null assignee filter                                            |
| `/admin/leads/hot`                | HIGH or URGENT priority                                         |
| `/admin/leads/converted`          | CONVERTED lifecycle                                             |
| `/admin/leads/not-interested`     | DISQUALIFIED lifecycle                                          |
| `/admin/leads/duplicates`         | DUPLICATE lifecycle                                             |
| `/admin/leads/follow-up`          | Preserved shell, truthful scheduler-unavailable state           |
| `/admin/leads/lost`               | Preserved shell, truthful Opportunity-outcome-unavailable state |
| `/admin/leads/create`             | Persisted create                                                |
| `/admin/leads/:leadId/edit`       | Real detail plus CAS edit                                       |
| `/admin/leads/:leadId`            | Real detail, conversion and soft-delete dialogs                 |
| `/admin/leads/:leadId/assignment` | Manual owner/assignee changes                                   |

400/409/412/422 failures retain entered values. Conflicts require explicit reload/review before resubmission. A reload does not overwrite the user's draft. Conversion retains its exact key and payload after an uncertain response; choosing to reload resets the command only after checking current state. Unknown or inaccessible IDs display the actual not-found state.

Import/export/bulk assignment stay visible but disabled or route to an explicit unavailable panel. Value, scoring, territory/team, tags, attachments, follow-ups, visits, demos, payments, communications and product activity sections remain truthful unavailable states. No future backend is implemented and no simulated success is reported. Unconverted source/integration and sales prototype routes are outside this package.

## Verification and limitations

Fresh validation uses PostgreSQL test database `visiblo_crm_test`, with an isolated candidate schema and randomized integration/upgrade schemas. No production data migration or development tenant seed is part of this work.

- Prisma validation and client generation passed.
- Fresh deployment applied all 35 migrations; system RBAC sync passed.
- API TypeScript/build and web TypeScript/build passed.
- API unit suite: 305 tests passed.
- Frontend suite: 52 tests passed, including loading and 400/401/403/404/409/412/422/429/500 states, rich empty UI, no fixture fallback, tenant races, retained edits, portal menu/dialog behavior and same-command retries.
- CRM integration covers tenant A/B isolation, exact permissions/scopes/union, foreign IDs, missing entitlement, membership validation, lifecycle/CAS/assignment races, conversion races and replay conflicts, immutable SQL history, search/count pagination and transactional rollback on Account/Contact/Lead audit failures.
- Upgrade rehearsal retains both populated Phase 0 -> Phase 1.1 and populated Phase 1.1 -> Phase 1.2 paths, checking historical hashes and surviving relationships/data.
- Full default-timeout local integration run: 214/218 passed; four existing subscription-provisioning tests exceeded Jest's five-second default. Both CRM suites passed (47 tests including migration/hash proofs). The longer-timeout rerun and unchanged-timeout CI results are recorded in the attestation below.

Known limits: browser discovery returned no connected browser, so no visual, responsive screenshot or real-browser keyboard QA is claimed. DOM interaction tests are not browser QA. An attempted ESLint invocation failed because no ESLint configuration exists; the existing CI workflow has no lint command. Existing Vite bundle-size and JSDOM chart-size warnings remain. No capacity/load benchmark is claimed; CRM writes intentionally retain existing tenant serialization. Converted Leads/commands cannot be deleted or reassigned, and target deletion is blocked while referenced. Source charts show only the top eight groups, and unavailable future-domain metrics display no fabricated numbers.

## Candidate attestation

- Implementation candidate SHA: `67be614624bed065e39c587a9071c8b00d8b6e8c`.
- Review PR: [#18](https://github.com/solverixtech-code/Smart-Field-Work-Saas/pull/18), targeting main, unmerged.
- Local full integration rerun: **218/218 passed**, 14 suites, with command-line `--testTimeout=30000` (95.368 seconds). No test timeout or CI workflow file was changed.
- Candidate CI run: [35062568054](https://github.com/solverixtech-code/Smart-Field-Work-Saas/actions/runs/35062568054). **SUCCESS** on the exact implementation SHA, job `104685800050`: 305 API unit tests, 218 PostgreSQL integration tests, 52 frontend tests, both TypeScript checks/builds, fresh migration deployment, Prisma validation/generation and RBAC sync. CI used its unchanged timeout configuration.
- This attestation is a documentation-only follow-up to the implementation SHA. The PR records the exact final documentation commit and its independent CI result, avoiding a self-referential commit hash inside this file.
