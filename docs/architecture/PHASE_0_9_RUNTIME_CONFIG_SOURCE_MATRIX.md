# Phase 0.9 runtime configuration source matrix

Status: **Implemented contract; local proofs PASS; PR/exact-main release validation pending.**
Date2026-09-08. Baseline `5c4d445f7c831569e0f8e409636c3472647bd453`; branch `feat/phase-0.9-runtime-config`.
See [implementation report](PHASE_0_9_RUNTIME_CONFIGURATION_IMPLEMENTATION.md).

## Consumers and approved boundary

Existing AppShell/authorizationSlice uses /auth/authorization; workspace settings and MasterManagementPage still use frontend previews. No frontend/mobile conversion. TenantBranding excluded: startup logo is an application asset.

Owner approved empty Industry scalar layer after the prerequisite stop. Concrete TenantSettings remain explicit choices; equal-to-default is not inheritance. Only absent whole row uses foundation defaults. Nonempty scalar v1/v2 proof deferred; real normalized Industry Master v1/v2 proof retained. No existing settings update HTTP command; direct persistence tests prove invalidation without inventing one.

## Field authority and dependency matrix

S=SYSTEM epoch; T=selected TENANT epoch; I=exact pinned INDUSTRY version epoch. Each includes immutable incarnation ID and BIGINT version. C=explicit schema/code revision plus reused defaults and registry lifecycle. All epochs commit with their source. User/session availability is read in both snapshots.

| Public field                                         | Owner / precedence                                         | Dependency                                        | Invalidation / security / fallback                                                                 |
| ---------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| schemaVersion                                        | M9 schema1                                                 | C/schema                                          | Unsupported shape fails closed                                                                     |
| configVersion                                        | Canonical server hash                                      | All vector dimensions                             | No client authority; generatedAt excluded                                                          |
| principal.userId                                     | M2/M3 authenticated User                                   | ID + active check                                 | Inactive/deleted User denied                                                                       |
| principal.membershipId/tenantId                      | Exact selected ACTIVE membership/Tenant                    | IDs,T,session/context                             | State/role/dataScope changes T; foreign role denied; no client selector                            |
| tenant.id/displayName/status                         | Selected Tenant                                            | T                                                 | Parent writes bump; inactive denied                                                                |
| access.mode/mapping/subscriptionStatus/planVersionId | M6 Subscription -> exact immutable M5 PlanVersion          | Subscription ID/revision/pin/computed access      | Frozen matrix; legacy unmapped; BLOCKED403                                                         |
| nextRevalidationAt                                   | Future trial/grace boundary                                | Subscription,boundary/access                      | Clock-only expiry; GET never applies scheduled changes                                             |
| modules[].code/status/source                         | Pinned Plan Modules intersect registry + DB ACTIVE/BETA    | Subscription,C,S                                  | Lifecycle/sync changes S; recommendations/dependencies never grant; legacy[]                       |
| industry.templateId/versionId/version                | M7 exact published assignment                              | Assignment ID/revision/versionId,T,I              | Explicit assign/migrate; v2 publication does not change v1 I; absent null                          |
| settings.timezone                                    | TenantSettings; fallback Asia/Kolkata                      | T,C                                               | Intl validation; absent whole row only                                                             |
| settings.currency                                    | TenantSettings; fallback INR                               | T,C                                               | Three uppercase characters; no billing rule                                                        |
| settings.locale/language                             | TenantSettings; fallback en-IN/en                          | T,C                                               | Existing strings bounded1-200; no fixture allowlist                                                |
| settings.dateFormat/weekStartDay                     | TenantSettings; fallback YYYY-MM-DD/MONDAY                 | T,C                                               | Existing strings bounded1-200; no deep merge                                                       |
| settings.financialYearStartMonth                     | TenantSettings; fallback4                                  | T,C                                               | Integer1-12; not fiscal policy engine                                                              |
| settingsProvenance                                   | Actual SYSTEM or TENANT layer                              | T,C                                               | Equal defaults remain explicit; invalid503                                                         |
| permissions[]                                        | M4 EffectivePermissionService, TENANT only                 | T,S,membership                                    | Grant/role writes T; Permission metadata S; snapshot bypasses independent cache; no platform union |
| masters.strategy/canRead/canManage/definitions       | M8 effective definitions + permission/commercial reduction | C,S,T,I,assignment,Subscription,membership,access | Bounded manifest, no values preload; no view=>[]; READ_ONLY=>cannot manage                         |
| generatedAt                                          | Response clock                                             | Excluded                                          | Informational; weak semantic ETag                                                                  |

Internal vector includes schema,C,userId,membershipId,tenantId,sessionId,contextVersion,epochs,Subscription,exactIndustryAssignment,accessMode,nextBoundary. Cache key additionally spells out Tenant/membership/User.

## Write-owner coverage

| Authority                                    | Durable dependency                                            |
| -------------------------------------------- | ------------------------------------------------------------- |
| PlatformModule, Permission, MasterDefinition | S on insert/update/delete                                     |
| Tenant / TenantSettings                      | T; parent initialize, updates and child removal/provenance    |
| TenantMembership                             | Old/new T for state/role/dataScope/identity                   |
| TenantRole / TenantRolePermission            | Owning old/new T incl direct grants and cascade               |
| TenantSubscription                           | Existing enforced revision/pin, recomputed time access        |
| TenantIndustryTemplateAssignment             | Old/new T plus existing assignment revision                   |
| IndustryTemplateVersion                      | Exact I, initialized on creation, bumped on draft/publication |
| MasterValue / MasterValueOverride            | SYSTEM=>S; INDUSTRY=>exactI; TENANT=>T, old/new scope         |
| UserSession / User                           | Live revocation/context/active checks, not cached authority   |

M9.1 rejects unversioned TRUNCATE on epoch and trigger-owned authorities. Scope uniqueness/FKs/+1 guard prevent live epoch reset/delete. Legitimate parent cascade remains, with new incarnation on recreation. Source locks precede epoch locks; old/new scopes sorted per row; multi-row writers retain whole-transaction retry obligations. Reads take no write locks.

## Consistency, bounds and proof

Read-only REPEATABLE READ composition plus independent authority snapshot on both cold/warm paths. Second snapshot is the linearization point; a later commit can affect next request. Clock checked before return/cache insertion. Changed vector retries from scratch, max3 then503.

Cache256 entries,60seconds capped by commercial boundary,128KiB payload,24definitions,registry-bounded Modules,1000sorted unique permissions. Validated clones, corrupt/foreign discard, independent process-local caches. No shared Redis or single-flight claim.

Unit coverage maps every semantic top-level schema key and OpenAPI field. PostgreSQL tests cover direct writes, rollback-on-bump-failure, selected-context/known-UUID isolation, oldETags, bounded churn, time-only expiry, exact Industry v1/v2, independent caches and all composition mutation races. Query budget<=60cold/<=50warm; representative49/41 including frozen guards.

## Exclusions and deployment debt

No branding inheritance, fixture timeFormat/numberFormat/preferences/security policy, secrets, raw rules/grants, domain settings, browser routes/components, TenantModule entitlement or nonempty Industry scalar authority. No NULL inheritance/clear sentinel.

Unrelated frozen permission-cache behavior is not redesigned. Production mappings/data checks/rollback rehearsal are deployment gates, not guessed or applied. Phase0.10 remains blocked.
