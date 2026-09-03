# Phase 0 entity ownership matrix

## Ownership rules

1. Platform-global records never receive `tenantId` merely for uniformity.
2. Tenant operational/configuration records always carry `tenantId`, even when a relation could imply it. This supports mandatory filters, compound uniqueness, indexing, audit evidence, and defense in depth.
3. Identity credentials are global. Access and employment are membership-scoped.
4. Developer registry fields are changed in code; safe admin metadata is persisted.
5. Commercial access comes from a Subscription pinned to an immutable Plan Version.
6. Industry configuration and Master inheritance cannot override commercial access.
7. Money uses `Decimal` plus ISO currency; timestamps use UTC; tenant locale/timezone control display and business-day boundaries.

## Foundation entity matrix

| Entity | Purpose | Scope | Immutable identity | Versioned/mutable data | Relations and audit requirements |
|---|---|---|---|---|---|
| `User` | Global sign-in identity | Platform global | `id`; normalized login identities once verified | name, avatar, security state | Has Sessions, platform role assignments, many TenantMemberships. Audit credential/security changes. |
| `PlatformRole` | Platform console role definition | Platform global | `code` for built-ins | name, description, active state | Many permissions and assignments. Audit grants/revokes. |
| `PlatformRolePermission` | Grants `platform.*` actions | Platform global | role + permission | none except archival | Audit every change. |
| `PlatformUserRoleAssignment` | Assigns platform access to a User | Platform global | user + role | status, validity | No tenant implication. Audit grant/revoke and actor. |
| `Tenant` | Customer/workspace identity and lifecycle | Platform-managed, tenant root | `id`, canonical `slug` after activation | display/legal/contact/lifecycle fields | Owns memberships, settings, branding, subscriptions, usage, data. All lifecycle changes audited. |
| `TenantMembership` | Connects one User to one Tenant | Tenant | `id`, tenantId, userId | roleId, status, isPrimary, invited/joined/activated/deactivated timestamps | Unique active `(tenantId,userId)`; supports one User in many Tenants. Audit invitation, role, status. |
| `TenantRole` | Built-in or tenant-defined authorization role | Tenant, with optional system template | `id`, tenantId, code | name, description, active state | Many membership assignments and permission grants. Audit edits. |
| `TenantRolePermission` | Grants domain actions | Tenant | tenantRoleId + permissionId | none except archival | Permission definition is global; grant is tenant-owned. |
| `PermissionDefinition` | Stable action vocabulary | Platform global/developer-owned | `code`, `scope`, domain/action | description, status from code | Codes: `platform.*` or domain actions such as `crm.leads.view`; never commercial Modules. |
| `Plan` | Stable commercial product identity | Platform global | `id`, `code` | name, visibility, lifecycle, currentVersionId | Owns immutable versions. Audit create/archive/visibility. |
| `PlanVersion` | Published commercial snapshot | Platform global | `id`, planId, monotonically increasing integer version | Draft editable until publish; immutable after `publishedAt` | Owns pricing, limits, modules, rules. Subscriptions pin to it. Audit draft/publish; never update published rows. |
| `PlanPricing` | Billing-cycle prices in a version | Platform global/version child | planVersionId + billingCycle/currency | Immutable after publish | Decimal base/seat/flat/setup/minimum; tax/proration semantics. |
| `PlanLimit` | Typed limits in a version | Platform global/version child | planVersionId + limitCode | Immutable after publish | Prefer typed code/value/unit rows for extensibility; validate known codes. |
| `PlanModule` | Commercial Module inclusion | Platform global/version child | planVersionId + moduleId | Immutable after publish | Module-level only. Validate dependency closure and Module lifecycle at publish. |
| `PlanCommercialRule` | Trial/change/cancellation policy | Platform global/version child | planVersionId | Immutable JSON/value object after publish | JSON is acceptable because it is version-snapshotted and schema-validated, not independently queried heavily. |
| `TenantSubscription` | Tenant's commercial lifecycle | Tenant | `id`, tenantId | pinned planVersionId, status, billing cycle, seats, trial/period/cancel/grace timestamps | One current subscription enforced transactionally; audit every state/version change. |
| `SubscriptionChange` | Scheduled/applied upgrade/downgrade trail | Tenant | `id`, subscriptionId | from/to versions, effective timing, status | Idempotent command key; audit request/apply/failure. |
| `IndustryTemplate` | Stable industry identity | Platform global | `id`, `code` | name, category, lifecycle, currentVersionId | Owns immutable versions. Industry is configuration, not a code fork. |
| `IndustryTemplateVersion` | Published industry configuration snapshot | Platform global | template + integer version | Draft until publish, then immutable | Terminology, default Masters, recommendations, dashboards/workflows/forms as schema-validated children/JSON. |
| `IndustryModuleRecommendation` | Suggests useful Modules | Platform global/version child | version + moduleId | priority/reason before publish | Does not grant commercial access. |
| `TenantIndustryAssignment` | Pins tenant to an industry version | Tenant | tenantId | industryTemplateVersionId, effective dates | Explicitly migrate to new template versions. Audit. |
| `TenantSettings` | Operational/localization/security overrides | Tenant | tenantId | structured validated settings and `configVersion` | Split sensitive security policy where access differs. Audit before/after safe fields. |
| `TenantBranding` | Logo/theme/login branding | Tenant | tenantId | approved token values and MediaAsset relations | Never store arbitrary executable CSS. Audit. |
| `TenantUsageSnapshot` | Periodic metering/observability snapshot | Tenant | tenantId + capturedAt/period | counters only through collector | Append-only; never commercial authority by itself. |
| `TenantProvisioningEvent` | Provisioning workflow state/history | Tenant | event ID/idempotency key | step, status, safe payload, error code, retry count | Append-only timeline; no secrets. |
| `MasterDefinition` | Defines a configurable value set and policy | Platform global/developer/system-owned | `code` | name, moduleCode, data type, allowed tenant operations, lifecycle | Audit definition changes; tenant admins cannot edit definitions. |
| `MasterValue` | System, industry, or tenant value | Scope determined by source | definitionId + source owner + code | name, description, color, sort, metadata, active state | Exactly one source owner: SYSTEM, IndustryTemplateVersion, or Tenant. Audit edits. |
| `MasterValueOverride` | Tenant/industry rename, reorder, hide of inherited value | Industry or tenant | scope owner + inherited value | display name/color/sort/hidden | Does not change stable code or source row. Audit. |
| `PlatformModule` | Capability package synchronized from code | Platform global/developer-owned | `code` | Registry owns name/description/category/dependencies/required flag; DB may hold notes | No pricing. PlanVersion includes Modules. Audit metadata/lifecycle controls. |
| `ModuleFeature` | Coded capability within Module | Platform global/developer-owned | module + code + implementationKey | Registry owns support flags; admin notes may be mutable | No independent commercial entitlement. |
| `ModuleDependency` | Module prerequisite graph | Platform global/developer-owned | module + prerequisite | code registry only | Validate acyclic closure. |
| `RuntimeConfigVersion` | Monotonic invalidation/version marker | Tenant | tenantId | integer/hash and cause | Increment transactionally after subscription, industry, settings, role, or Master change. |
| `AuditEvent` | Append-only security/business evidence | Platform or tenant | id, timestamp | none; retention/archival only | Fields below. |
| `MediaAsset` | Object-store metadata and ownership | Platform or tenant | id, objectKey, owner scope | scan/status/retention metadata | Private by default. Audit access-sensitive mutations and deletion. |
| `OutboxEvent` | Durable async work request | Platform or tenant | id/eventId | state, attempts, availableAt, processedAt | Written in same DB transaction as source mutation. |
| `BackgroundJob` | Durable execution/retry record when needed | Platform or tenant | id/idempotency key | status, attempt count, safe result/error | Prefer simple DB-backed worker first; Redis queue only when throughput warrants it. |

## Tenant field inventory and normalized destination

The inventory combines `Tenant`, `TenantCreateFormState`, tenant detail editing, and workspace settings. Secrets such as `adminPassword` are command inputs only and are never Tenant columns.

| Category | Current visual/input fields | Proposed owner |
|---|---|---|
| IDENTITY | id, draftTenantId, slug, companyName, domain, website, companySize, description, status | Tenant; draft state is Tenant lifecycle, not a second ID |
| LEGAL | legalEntityName, taxId/GST, PAN, yearsInBusiness, businessModel | Tenant legal profile or TenantSettings financial section |
| ADDRESS | addressLine1, addressLine2, city, state, pincode, country, operatingCountries, branchCount | TenantAddress plus tenant profile metadata |
| INDUSTRY | industryId/code/label | TenantIndustryAssignment; labels are joined DTO fields, not duplicated authority |
| LOCALE | timezone, currency, preferredLanguage, dateFormat, timeFormat, weekStartDay, financialYearStart, numberFormat | TenantSettings.localization/financial, validated codes |
| SUBSCRIPTION | planId/name, provisioningType, billingCycle, seats/license count, storageLimit, subscriptionStart, trial duration/policy/dates, billing contact, payment collection, invoice dates/method | TenantSubscription and billing contact/profile; joined names are DTO fields |
| PROVISIONING | isDraft, tenantStatus, subscriptionStatus, provisioning type, invitation choice, provisioning events | Tenant lifecycle, TenantSubscription lifecycle, TenantProvisioningEvent |
| ADMIN USER | name, email, phone, designation, department, language, timezone, communication email, username, password, send invite | ProvisionTenant command creates/links User + owner Membership. Password is hashed immediately and not logged. |
| USAGE | usersUsed, storageUsedGb, apiRequestsUsed, MRR | UsageSnapshot; MRR is billing/reporting projection, not freely editable Tenant state |
| CONFIGURATION | inherited/enabled modules, landing page, notifications, map/table preferences, session/security rules | Effective Modules derived from Subscription; other values in TenantSettings and role policies |
| BRANDING | logoUrl, primary/secondary color, theme, logoInLogin, shortName | TenantBranding and MediaAsset |
| AUDIT | createdAt/updatedAt, createdBy, workspaceId/configVersion, account notes | Entity timestamps, AuditEvent, RuntimeConfigVersion; notes in explicit support-note entity if needed |

## Tenant model boundaries

Recommended `Tenant` core fields:

```text
id, slug, legalName, displayName, primaryDomain, websiteUrl,
status, companySizeCode, createdAt, updatedAt, activatedAt,
suspendedAt, cancelledAt, archivedAt
```

Do not put plan price, enabled Modules, admin credentials, usage counters, arbitrary settings, or industry display labels into this row.

Recommended `TenantMembership` fields:

```text
id, tenantId, userId, tenantRoleId, status, isPrimary,
invitedByUserId, invitedAt, joinedAt, activatedAt, deactivatedAt,
createdAt, updatedAt
```

Membership status is independent per Tenant. Deactivating Membership A cannot disable Membership B. A global User security suspension is a separate identity action.

## Plan versioning contract

| Event | Required behavior |
|---|---|
| Save draft | Mutate only an unpublished PlanVersion draft. |
| Publish | Validate pricing, limit types, Module dependency closure, lifecycle, and unique next integer version; publish atomically and make immutable. |
| New tenant | Subscribe to the current eligible published PlanVersion. |
| Existing tenant when plan changes | Remains pinned to its original PlanVersion. No silent price, Module, or limit change. |
| Upgrade/downgrade | Create SubscriptionChange to an explicit target PlanVersion and apply immediately or next cycle per validated policy. |
| Price change | Requires a new PlanVersion. Existing tenant migration is explicit and auditable. |
| Module change | Requires a new PlanVersion. Resolver recomputes only after a subscription version change. |
| Archive Plan | Blocks new subscriptions; does not invalidate existing pinned subscriptions. |
| Correct published mistake | Publish a corrected version; never edit the historical version. |

## Subscription state model

Minimum fields:

```text
id, tenantId, planId, planVersionId, status,
billingCycle, seatQuantity, currency,
startDate, trialStart, trialEnd,
currentPeriodStart, currentPeriodEnd,
cancelAtPeriodEnd, cancelledAt, graceEndsAt,
createdAt, updatedAt
```

Suggested states: `PENDING`, `TRIALING`, `ACTIVE`, `PAST_DUE`, `GRACE`, `SUSPENDED`, `CANCELLED`, `EXPIRED`. Transitions belong in a service/state policy, never arbitrary DTO updates.

## Authoritative Module resolution

```text
TenantSubscription (eligible state)
  -> pinned PlanVersion
  -> PlanModule rows
  -> active/non-archived PlatformModule registry records
  -> dependency closure validation
  -> EffectiveTenantModules
```

Tenant or Industry records cannot add commercially unavailable Modules. A future explicit contract override, if ever required, must be a separately audited commercial mechanism, not an editable `enabledModuleCodes` array.

## Runtime configuration contract

`TenantRuntimeConfigService.resolve(principal)` accepts an authenticated principal, not a request `tenantId`. It loads the following in bounded queries and returns a stable bootstrap DTO:

```ts
interface TenantRuntimeBootstrapDto {
  configVersion: string;
  generatedAt: string;
  tenant: { id: string; slug: string; displayName: string; status: string };
  membership: { id: string; roleCode: string; status: string };
  locale: { timezone: string; currency: string; language: string; dateFormat: string };
  branding: { logoUrl?: string; primaryColor?: string; secondaryColor?: string };
  subscription: { status: string; planCode: string; planVersion: number; graceEndsAt?: string };
  modules: Array<{ code: string; status: string }>;
  permissions: string[];
  terminology: Record<string, string>;
  masters: Record<string, Array<{ code: string; name: string; color?: string }>>;
  featureConfiguration: Record<string, unknown>;
}
```

Rules:

- Module list is filtered first by commercial subscription.
- Permissions can reduce actions inside an available Module, never grant an unavailable Module.
- Master categories are omitted when their `moduleCode` is unavailable.
- DTO is schema-versioned. Mobile and web use the same semantic contract; mobile may request a compact/delta representation later.
- Cache key: `tenant-runtime:{tenantId}:{membershipId}:{configVersion}`. Cache is an optimization, not authority.
- Increment `RuntimeConfigVersion` and evict affected keys after subscription, plan migration, industry assignment, settings, role/permission, Master, or branding changes.
- Short TTL (for example 5 minutes) is defense in depth; state-changing endpoints still check current subscription/membership state.

## Request principal and route behavior

```ts
interface RequestPrincipal {
  userId: string;
  sessionId: string;
  platformRoleCodes: string[];
  tenantId?: string;
  membershipId?: string;
  tenantRoleCode?: string;
  permissions: string[];
}
```

| Route type | Principal rule |
|---|---|
| `/platform/*` | Requires an active platform role assignment and `platform.*` permission. No tenant is implied. |
| Tenant web route | Requires an active membership selected from server-verified membership claims/session context. Repository receives required tenant scope. |
| Mobile route | Same membership and tenancy rule; installation/device metadata is additional context, not tenant authority. |
| Platform support access to tenant | Requires explicit time-bounded grant/reason, elevated permission, visible banner, and audit events. Never inferred from email domain. |

The access token should use short-lived claims (`sub`, session ID, selected membership ID, token version). The backend reloads/validates membership and roles for sensitive operations; it does not trust a large stale permission array indefinitely.

## Tenant query guarantee

Preferred V1 pattern: request-scoped `TenantDb`/repository facade whose constructor requires a resolved tenant context. Feature services cannot receive unrestricted Prisma directly for tenant-owned models.

```text
JWT/session -> MembershipContextGuard -> PermissionGuard
-> TenantScopedService -> TenantRepository(tenantId required)
-> Prisma query with tenantId predicate -> response DTO
```

Rules:

- No tenant-domain controller accepts `tenantId` as authorization input.
- Find/update/delete use compound identity (`id` plus `tenantId`) and return `404` outside scope.
- Nested writes validate that every referenced row belongs to the same tenant.
- `$transaction` receives a scoped transaction facade.
- Raw SQL is exceptional, code-reviewed, and requires an explicit tenant predicate test.
- Add database Row Level Security later only as defense in depth after application scoping is stable; it is not required for V1.

## Index and uniqueness strategy

Every high-volume tenant table starts indexes with `tenantId` for its primary access patterns, for example:

```text
Lead:        (tenantId, status, updatedAt), (tenantId, assignedMembershipId, status)
Account:     unique (tenantId, externalCode); (tenantId, normalizedName)
Visit:       (tenantId, scheduledAt), (tenantId, executiveMembershipId, scheduledAt)
Attendance:  unique (tenantId, membershipId, date)
PunchLog:    (tenantId, membershipId, timestamp)
MasterValue: unique (tenantId, definitionId, code) where tenantId is non-null
AuditEvent:  (tenantId, createdAt), (tenantId, entityType, entityId, createdAt)
```

Platform-global uniqueness remains global for Module, Feature, Plan, Permission, and Industry codes. Tenant-owned names/codes are unique only within tenant unless the domain explicitly allows duplicates. Use partial unique indexes for current active Subscription and nullable source scopes where Prisma cannot express the constraint directly; document raw SQL in the new migration.

## Audit event fields and retention

Minimum fields:

```text
id, occurredAt, scope(PLATFORM|TENANT), tenantId?, actorUserId?,
membershipId?, sessionId?, requestId, correlationId?, action,
entityType, entityId?, beforeJson?, afterJson?, ip, userAgent,
source(WEB|MOBILE|API|JOB), outcome, reasonCode?
```

Redact passwords, tokens, OTPs, secrets, provider credentials, full payment details, and sensitive file URLs. Use allow-listed diffs. Audit rows are append-only to the application; corrections create new events. Retain security/commercial audit longer than routine operational telemetry and archive by policy, never generic hard delete.

## Archival policy

- Reference/configuration entities: `isActive` or lifecycle status; stable codes remain reserved.
- Commercial/identity records: explicit status plus timestamps (`archivedAt`, `deactivatedAt`, etc.).
- Transactions, subscriptions, audit, attendance, payroll: never generic soft-delete; use reversal/cancellation/correction events and legal retention.
- Physical deletion is limited to expired ephemeral challenges/sessions, superseded unreferenced drafts, and media after retention/legal-hold checks.

## File/media strategy

Object key format:

```text
tenants/{tenantId}/{domain}/{entityId}/{assetId}/{sanitizedFilename}
platform/{domain}/{entityId}/{assetId}/{sanitizedFilename}
```

`MediaAsset` records owner scope, tenantId, uploader, entity relation, object key, MIME type, byte size, checksum, scan status, visibility, retention/legal hold, and timestamps. Buckets are private; clients receive short-lived signed URLs after authorization. Upload uses presigned or streamed flows with type/size limits, checksum, quarantine/scan, and finalization. Deleting a business row never directly deletes a shared object inside the same request; enqueue an idempotent cleanup after retention checks.

## Background job strategy

For V1 keep the modular monolith. Use a PostgreSQL outbox written with the business transaction and one separately runnable worker process. Job handlers require `tenantId`, actor/system context, schema-versioned payloads, idempotency keys, bounded retries with backoff, dead-letter visibility, and structured logs. Use Redis for cache/rate limiting now; adopt BullMQ or equivalent only when real scheduling/throughput needs justify another moving part. Suitable later jobs include invitation delivery, configuration cache warming, imports/exports, PDF generation, provider sync, notification fan-out, usage aggregation, and media cleanup.
