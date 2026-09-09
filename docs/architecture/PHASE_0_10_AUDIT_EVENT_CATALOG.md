# Phase 0.10 audit event catalog

Status: implemented candidate contract, with final validation pending in the implementation report. Physical storage remains `AuditLog`. Frozen `action`, entity fields and Module history lookup remain compatible; broad producer snapshots are narrowed and all returned snapshots redacted. No duplicate AuditEvent table.

## Existing producer and consumer inventory

| Producer / consumer | Current events / data | Current persistence boundary | Planned handling |
| --- | --- | --- | --- |
| AuthService.audit | LOGIN_SUCCESS/FAILURE, OTP_REQUESTED/FAILURE, MEMBERSHIP_SELECTED, LOGOUT, FORGOT_PASSWORD_IGNORED/REQUESTED, PASSWORD_RESET/CHANGED, CHANGE_PASSWORD_FAILURE, PROFILE_UPDATED, AVATAR_UPLOADED, SESSION_REVOKED, ALL_OTHER_SESSIONS_REVOKED | Best-effort independent insert; profile uses selected name/mobile/language, avatar URL, auth reason/identity metadata | Preserve authentication success/failure behavior; centralized redaction and correlation; SYSTEM scope for global identity, not guessed Tenant scope |
| PlatformModulesService.recordAudit | MODULE_UPDATED/ARCHIVED/RESTORED, FEATURE_METADATA_UPDATED/DEPRECATED | Independent best-effort insert after update; broad module snapshots | Preserve action and feature afterJson.moduleId lookup; reduce snapshots to reviewed metadata |
| PlatformModulesService.history | MODULE entity match or MODULE_FEATURE afterJson.moduleId; actor id/name/email | Existing platform.modules.view route | Preserve reader contract, sanitize snapshots on read, no tenant ownership inference |
| PlatformCatalogSyncService.synchronize | PLATFORM_CATALOG_SYNCHRONIZED; registry hash/count/time | Best-effort insert after catalog transaction | Central writer; no feature entitlement changes |
| PlatformPlansService | PLAN_CREATED, PLAN_METADATA_UPDATED, PLAN_DRAFT_CREATED/UPDATED, PLAN_VERSION_PUBLISHED, PLAN_ARCHIVED | Transactions except metadata update followed by independent insert | Same transaction for critical publication; preserve error/retry and publication contracts |
| IndustryService.audit | INDUSTRY_CREATED, INDUSTRY_METADATA_UPDATED, INDUSTRY_DRAFT_CREATED/UPDATED, INDUSTRY_PUBLISHED, INDUSTRY_ARCHIVED | Caller transaction | PLATFORM, same transaction, no commercial grants |
| IndustryAssignmentService.apply | TenantIndustryAssignmentHistory, no AuditLog insert | Caller transaction | Add TENANT audit for assignment/migration; keep existing history unchanged |
| MasterService.audit, MasterSeedService, MasterReconciliationService | master definition/value/override actions, master.seed.apply, master.legacy.reconcile | Caller transaction | Preserve action strings/count assertions; SYSTEM/PLATFORM/TENANT scope from explicit operation authority |
| SubscriptionService, ProvisioningService | SubscriptionChange / TenantProvisioning / invitation acceptance; no AuditLog insert | SubscriptionTransactionService caller transaction | Add scoped audit without replacing history, pins, actor or idempotency authority |
| RolePermissionService | Platform/Tenant permission grant/revoke; no AuditLog insert | Permission + version increment transaction | Audit in same transaction; use authenticated context or explicit SYSTEM command context |
| PlatformRoleService, TenantMembershipService | Role assignment/revoke and membership lifecycle; no AuditLog insert | Some independent writes; foundation supports outer transaction | Narrow transactional audit integration; preserve validation and public method results |

Schema currently has nullable actorUserId/Tenant/membership FKs with SET NULL, action/entity/before/after/IP/userAgent/session/createdAt and individual lookup indexes. No existing audit HTTP controller was found beyond Module history. No data migration may invent ownership from User legacy fields.

## Field authority and security

| Fields | Authority / producer | Scope / consumer | Retention and redaction | Transaction / frozen owner |
| --- | --- | --- | --- | --- |
| id, createdAt, schemaVersion | DB / writer | All / platform query | Operational evidence; legal duration deferred, no automated purge | Insert-only content; historical rows preserved |
| action, eventCode, category, outcome | Compile-time event catalog | Explicit event scope / audit reader | Bounded safe classifications; no arbitrary action registration API | Versioned writer; frozen action strings retained |
| tenantId, tenantMembershipId, actorUserId, actorType | Authenticated principal or explicit trusted command | TENANT requires Tenant; membership must belong to Tenant and actor | Identifiers restricted to authorized audit readers; never metric labels | Membership isolation remains 0.3 authority |
| requestId, correlationId, originRequestId | Server request context / worker origin | All / authorized troubleshooting | Bounded opaque identifiers, not credentials; no invented legacy values | Not commercial idempotency keys |
| entityType, entityId | Event producer | Explicit scope / filtered read | Minimal identifiers, no full entity graph | Same transaction for critical changes |
| beforeJson, afterJson, metadata, redactionVersion | Reviewed event-specific projection then shared redactor | Audit detail only | No raw entities, tokens, headers, signed URLs or provider secrets; recursively bounded | Audit failure aborts critical transaction |
| ip, userAgent, sessionId | Existing trusted auth metadata | Restricted detail | Treat as sensitive personal data; sanitize/bound; never metrics | Legacy compatibility, no raw header capture |

Historical backfill: tenantId present -> TENANT; absent -> LEGACY. Unknown actor -> LEGACY, no synthetic human. New SYSTEM operations must be explicit; PLATFORM is not inferred merely from null Tenant. Preserve legacy payloads physically; sanitize all outward snapshots. New event content updates are rejected. Existing parent FK SET NULL actions may unlink references without changing event content, preserving frozen cleanup behavior; scope remains the historical event scope. Direct identity edits are rejected. Future legally required retention must use a separately reviewed maintenance path, not runtime DELETE endpoints or irreversible blanket database prohibition.

Redaction v1: exact normalized secret-key denylist, recursive plain JSON only, maximum depth 8, 50 array items, 50 keys/object, 2,000 characters/string, 32 KiB total. Reject unsupported values/cycles/oversize structures for durable writes; logs fail safe to fixed redaction error. Strip control characters and credential-bearing strings (Bearer/JWT, connection strings, signed URLs). Do not suppress harmless `moduleCode`, `masterCode`, `industryCode` through a broad `code` match.

Platform query: existing `platform.audit.view`, default 7-day window, maximum 31-day window, cursor `(createdAt,id)`, page <=100; filter Tenant/event/category/outcome/actor/entity/correlation/date. List excludes payloads. Detail applies redactor even for legacy rows. Existing explicit support audit grant is recorded, not silently expanded or revoked; no implicit role-name bypass. Auditor remains read-only. No tenant-wide audit endpoint in this phase.

Critical audit: RBAC changes, Plan publication, Subscription changes, provisioning, Industry publish/migration, Master writes, media lifecycle/delete and manual job retry. Expected request denials, cache hits and routine worker polling belong to logs/metrics, not durable audit spam. Failed transactions cannot leave success audit rows.
