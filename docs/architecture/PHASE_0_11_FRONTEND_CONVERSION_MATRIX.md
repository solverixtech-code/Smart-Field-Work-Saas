# Phase 0.11 Frontend Foundation Conversion Matrix

**Status:** AUTHORIZED AUDIT & CONVERSION INVENTORY  
**Starting Baseline SHA:** `87ce77738965b1fd9d4b653cbec0dd6201cd306a`  
**Working Branch:** `feat/phase-0.11-frontend-foundation`  
**Phase Authority:** Phase 0.1–0.10 FROZEN; Phase 0.11 AUTHORIZED; Phase 0.12 NOT AUTHORIZED.

---

## 1. Executive Summary & Canonical Conversion Contract

Phase 0.11 converts the existing foundation frontend from demo fixtures, mock state, and client-side authority into a truthful consumer of the authoritative backend frozen in Phases 0.1–0.10.

### The Canonical Frontend Architecture Chain
```
PAGE (composition, routing, layout)
  ↓
HOOK / CONTEXT (data-fetching, mutation, invalidation, presentational state)
  ↓
SERVICE INTERFACE / FEATURE SERVICE (endpoint calls, DTO/view-model mapping)
  ↓
API SERVICE / SHARED HTTP CLIENT (axios instance, session/refresh interceptors)
  ↓
AUTHORITATIVE BACKEND (NestJS controllers, guards, business logic, PostgreSQL)
```

### Strict Binding Principles
1. **Zero Client-Side Domain Authority:** The browser never calculates effective modules, merges master precedence, computes permissions from email/role, or evaluates plan pricing.
2. **Authoritative Backend Contracts:** Endpoints, request bodies, pagination, and revisions are dictated by existing frozen NestJS controllers.
3. **Tenant Cache Isolation:** Tenant switching MUST invalidate and clear all tenant-scoped data in frontend memory.
4. **No Production Fixture Fallbacks:** An empty database renders an empty UI; `try API catch return fixtureData` is strictly prohibited.
5. **Preserved UI/UX:** Preserves the Visiblo design system, responsive layouts, routes, and components without redesign.

---

## 2. Comprehensive Surface Conversion Matrix

| Ref | Domain / Area | Route | Component / Page | Existing Data Source | Backend API Contract | Required Phase 0.11 Action | Files Changed / To Change | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A1** | Modules | `/platform/modules` | `ModulesFeaturesPage.tsx` | `module.service.ts` | `GET /platform/modules`, `GET /platform/modules/summary` | Verify API-backed data, remove fixture fallback, ensure pagination & status filters | `apps/web/src/screens/platform/modules/ModulesFeaturesPage.tsx` | AUDITED |
| **A2** | Modules | `/platform/modules/features` | `FeatureRegistryPage.tsx` | `module.service.ts` | `GET /platform/modules/features` | Bind search, moduleCode, platform, and status query filters to API | `apps/web/src/screens/platform/modules/FeatureRegistryPage.tsx` | AUDITED |
| **A3** | Modules | `/platform/modules/dependencies`| `DependencyMapPage.tsx` | `module.service.ts` | `GET /platform/modules/dependency-graph` | Display dependency nodes from server; verify prerequisite edges | `apps/web/src/screens/platform/modules/DependencyMapPage.tsx` | AUDITED |
| **A4** | Modules | `/platform/modules/:moduleId` | `ModuleDetailPage.tsx` | `module.service.ts` | `GET /platform/modules/:id`, `GET /platform/modules/:id/history` | Render server module detail & audit history; keep registry fields read-only | `apps/web/src/screens/platform/modules/ModuleDetailPage.tsx` | AUDITED |
| **A5** | Modules | `/platform/modules/:moduleId/edit` | `EditModulePage.tsx` | `module.service.ts` | `PATCH /platform/modules/:id` | Update metadata only (displayName, description, displayOrder); block code edits | `apps/web/src/screens/platform/modules/EditModulePage.tsx` | AUDITED |
| **B1** | Plans | `/platform/plans` | `PlansPricingPage.tsx` | `usePlans.ts` / `plan.service.ts` | `GET /platform/plans` | Verify real API plans list; replace local metrics calculation with server stats | `apps/web/src/screens/platform/PlansPricingPage.tsx`, `usePlans.ts` | AUDITED |
| **B2** | Plans | `/platform/plans/create` | `CreatePlanWizardPage.tsx` | `PlanCreationContext.tsx` | `POST /platform/plans` | Authoritative single-draft creation; validate modules against API registry | `apps/web/src/screens/platform/CreatePlanWizardPage.tsx`, `PlanCreationContext.tsx` | AUDITED |
| **B3** | Plans | `/platform/plans/:planId` | `PlanDetailsPage.tsx` | `plan.service.ts` | `GET /platform/plans/:id`, `GET /platform/plans/:id/versions` | Render plan version hierarchy; mark PUBLISHED versions as read-only | `apps/web/src/screens/platform/PlanDetailsPage.tsx` | AUDITED |
| **B4** | Plans | Publish Draft | Modal in `PlanDetailsPage.tsx` | `plan.service.ts` | `POST /platform/plans/:id/versions/:vId/publish` | Submit exact versionId, handle 409 conflict, refetch authoritative plan aggregate | `apps/web/src/screens/platform/PlanDetailsPage.tsx`, `plan.service.ts` | AUDITED |
| **C1** | Tenants | `/platform/tenants` | `AllTenantsPage.tsx` | `FixtureTenantService` (`MOCK_TENANTS`) | `GET /platform/tenants` | **CRITICAL**: Discard `FixtureTenantService`; connect to real `GET /platform/tenants` with pagination & search | `apps/web/src/screens/platform/AllTenantsPage.tsx`, `tenant.service.ts` | AUDITED |
| **C2** | Tenants | `/platform/tenants/create` | `CreateTenantWizardPage.tsx` | `TenantCreationContext.tsx` / Fixtures | `POST /platform/tenants/provision` | **CRITICAL**: Replace manual client writes with authoritative `provision` command; load industries & plans from API | `apps/web/src/screens/platform/CreateTenantWizardPage.tsx`, `TenantCreationContext.tsx` | AUDITED |
| **C3** | Tenants | `/platform/tenants/:tenantId` | `TenantDetailsPage.tsx` | `FixtureTenantService` / Fixtures | `GET /platform/tenants/:id`, `GET /platform/tenants/:id/subscription` | Load tenant entity, subscription status, and exact plan version from backend | `apps/web/src/screens/platform/TenantDetailsPage.tsx` | AUDITED |
| **D1** | Memberships | `/platform/tenants/:tenantId/users` | `TenantUsersPage.tsx` | `FixtureTenantMembershipService` | `GET /platform/tenants/:id/memberships` | **CRITICAL**: Connect to real backend membership service; eliminate mock user array | `apps/web/src/screens/platform/TenantUsersPage.tsx`, `tenant-membership.service.ts` | AUDITED |
| **E1** | Settings | `/admin/settings/workspace` | `WorkspaceSettingsPage.tsx` | `FixtureWorkspaceSettingsService` | `GET /tenant/runtime/bootstrap`, `TenantSettingsDto` | Map supported branding & localization to server; classify unsupported domain settings as deferred | `apps/web/src/screens/admin/settings/WorkspaceSettingsPage.tsx`, `workspace-settings.service.ts` | AUDITED |
| **F1** | Effective Modules | `/platform/tenants/:tenantId/modules` | `TenantModulesPage.tsx` | `PLATFORM_MODULES` fixture | `GET /tenant/runtime/bootstrap` / `tenant.service` | **CRITICAL**: Render effective modules & provenance from runtime authority; remove client toggle bypass | `apps/web/src/screens/platform/TenantModulesPage.tsx` | AUDITED |
| **G1** | Industries | `/platform/industries` | `PlatformPlaceholderPage.tsx` | None (Placeholder) | `GET /platform/industries` | **CRITICAL**: Implement real Industry management UI (list, version history, recommendations, publish) | `apps/web/src/screens/platform/industries/` (NEW), `AppRouter.tsx` | AUDITED |
| **G2** | Industries | Tenant Industry Pin | `TenantDetailsPage.tsx` | Static label | `GET /platform/tenants/:tenantId/industry-template` | Display exact pinned `industryTemplateVersionId`; advisory-only module display | `apps/web/src/screens/platform/TenantDetailsPage.tsx` | AUDITED |
| **H1** | Platform RBAC | `/platform/roles` | `PlatformPlaceholderPage.tsx` | None (Placeholder) | `GET /auth/authorization` / `PlatformRoleService` | Connect to backend RBAC authority; document platform-role listing API gap if unexposed | `apps/web/src/screens/platform/roles/` (NEW), `AppRouter.tsx` | AUDITED |
| **I1** | Tenant RBAC | Tenant Role Management | Built into Tenant Settings/Shell | Legacy User.role | `tenant.permissions`, `PlatformAccessGuard` | Guard actions with server-issued permissions; no `SUPER_ADMIN` email checks | `apps/web/src/layouts/AppShell.tsx`, `PermissionRoute.tsx` | AUDITED |
| **J1** | Masters | `/admin/masters` | `MasterManagementPage.tsx` | `systemMastersData.ts` (58 KB mock) | `GET /tenant/masters`, `GET /tenant/masters/:code/values` | **CRITICAL**: Connect to `TenantMasterController` API; render effective values and provenance (SYSTEM/INDUSTRY/TENANT) | `apps/web/src/screens/admin/masters/MasterManagementPage.tsx`, `master.service.ts` | AUDITED |
| **K1** | Audit | `/platform/audit` | `AuditLogsPage.tsx` | `MOCK_AUDIT_LOGS` | `GET /platform/audit`, `GET /platform/audit/:id` | **CRITICAL**: Replace static mock table with API-backed audit query; filter by actor, action, date range | `apps/web/src/screens/platform/AuditLogsPage.tsx`, `audit.service.ts` | AUDITED |
| **L1** | Runtime Bootstrap | Core App Init | Not currently consumed | `GET /tenant/runtime/bootstrap` | **CRITICAL**: Implement `RuntimeBootstrapContext` & hook; consume schemaVersion 1, configVersion, modules, permissions | `apps/web/src/features/platform/runtime/` (NEW), `AppShell.tsx` | AUDITED |
| **M1** | Navigation Visibility | Sidebar & App Shell | `AppShell.tsx`, `PlatformShell.tsx` | `usePlatformPermissions` / static lists | Server permissions + effective modules | Hide inaccessible links dynamically based on bootstrap without breaking direct API protection | `apps/web/src/layouts/AppShell.tsx`, `PlatformShell.tsx` | AUDITED |

---

## 3. Authority Leaks Inventory & Classification

All occurrences of authority leaks discovered across `apps/web/src` are classified below according to the seven canonical categories:

1. `REMOVE IN 0.11`
2. `REPLACE WITH API`
3. `SAFE PRESENTATIONAL CONSTANT`
4. `DEVELOPMENT/TEST ONLY`
5. `DOMAIN-DEFERRED`
6. `PHASE 0.12 HARDENING`
7. `OUT OF SCOPE`

### Audit Findings:
| File Path | Leak Description | Classification | Action in Phase 0.11 |
| :--- | :--- | :--- | :--- |
| `features/platform/tenants/services/tenant.service.ts` | `FixtureTenantService` storing in-memory `MOCK_TENANTS` array | **REPLACE WITH API** (2) | Rewrite service to consume `GET /platform/tenants`, `GET /platform/tenants/:id` |
| `features/platform/tenants/services/tenant-membership.service.ts` | `FixtureTenantMembershipService` with hardcoded members array | **REPLACE WITH API** (2) | Rewrite service to consume `GET /platform/tenants/:id/memberships` |
| `features/platform/tenants/fixtures/platform.fixtures.ts` | `MOCK_TENANTS`, `MOCK_TENANT_USERS`, `MOCK_AUDIT_LOGS` | **REMOVE IN 0.11** (1) | Remove production dependency on these mock arrays |
| `screens/platform/AuditLogsPage.tsx` | Direct render of `MOCK_AUDIT_LOGS` | **REPLACE WITH API** (2) | Wire to `GET /platform/audit` |
| `screens/admin/masters/systemMastersData.ts` | 58 KB static fixture data used as state | **REPLACE WITH API** (2) | De-authorize as runtime store; fetch from `/tenant/masters` |
| `features/platform/tenants/services/workspace-settings.service.ts` | `FixtureWorkspaceSettingsService` holding in-memory Map | **REPLACE WITH API** / **DOMAIN-DEFERRED** (2/5) | Bind supported settings to bootstrap; mark unsupported as deferred |
| `screens/platform/PlatformPlaceholderPage.tsx` | Placeholder page for `/platform/industries` | **REPLACE WITH API** (2) | Implement real Industry Template list, version history & publish |
| `screens/platform/PlatformPlaceholderPage.tsx` | Placeholder page for `/platform/roles` | **REPLACE WITH API** (2) | Connect to platform role assignments & permission registry |
| `screens/platform/TenantModulesPage.tsx` | Local toggle switch bypassing subscription | **REMOVE IN 0.11** (1) | Remove client bypass; display effective status from runtime bootstrap |
| `common/authSession.ts` | Session token storage in localStorage/cookies | **SAFE PRESENTATIONAL CONSTANT** (3) | Retain existing auth session management |
| `test/industry-templates.e2e-spec.ts` | Test fixtures and seed payloads | **DEVELOPMENT/TEST ONLY** (4) | Retain for test suite integrity |
| `screens/leads/`, `screens/visits/`, `screens/payroll/` | Domain-specific CRM screens | **OUT OF SCOPE** (7) | Strictly preserved; domain backend remains unauthorized |

---

## 4. Backend API Contract Mapping

| Frontend Domain | Target API Endpoint | HTTP Method | Required Backend Permission | Request Payload / Params | Response Model |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Modules List** | `/platform/modules` | `GET` | `platform.modules.view` | `ModuleQueryDto` (search, category, status, page, limit) | `PaginatedModulesResponse` |
| **Modules Summary** | `/platform/modules/summary` | `GET` | `platform.modules.view` | None | `{ totalModules, activeModules, registeredFeatures, catalogHealth }` |
| **Dependency Graph**| `/platform/modules/dependency-graph` | `GET` | `platform.modules.view` | None | `ModuleDependencyNode[]` |
| **Feature Registry**| `/platform/modules/features` | `GET` | `platform.modules.view` | `search`, `moduleCode`, `status`, `platform` | `PaginatedFeaturesResponse` |
| **Plans List** | `/platform/plans` | `GET` | `platform.plans.view` | `status`, `visibility`, `search`, `page`, `limit` | `PlanResponseDto[]` |
| **Plan Create** | `/platform/plans` | `POST` | `platform.plans.create` | `CreatePlanDto` | `PlanResponseDto` |
| **Plan Version Publish** | `/platform/plans/:id/versions/:vId/publish` | `POST` | `platform.plans.publish` | `PublishPlanDto` (`allowBetaModules`) | `PlanResponseDto` |
| **Tenants List** | `/platform/tenants` | `GET` | `platform.tenants.view` | `TenantQueryDto` (search, status, industryCode, page, limit) | `PaginatedTenantResponseDto` |
| **Tenant Provision**| `/platform/tenants/provision` | `POST` | `platform.tenants.provision` | `ProvisionTenantInput` (idempotencyKey, tenant, owner, plan) | `ProvisioningResult` |
| **Tenant Detail** | `/platform/tenants/:id` | `GET` | `platform.tenants.view` | None | `TenantDetailDto` |
| **Tenant Memberships**| `/platform/tenants/:id/memberships` | `GET` | `platform.tenants.view` | None | `TenantMembershipSummaryDto[]` |
| **Industries List**| `/platform/industries` | `GET` | `platform.industries.view` | `industryPage` (search, page, limit) | `PaginatedIndustriesResponse` |
| **Industry Detail**| `/platform/industries/:id` | `GET` | `platform.industries.view` | None | `IndustryTemplateDetail` |
| **Industry Versions**| `/platform/industries/:id/versions` | `GET` | `platform.industries.view` | None | `IndustryTemplateVersion[]` |
| **Industry Publish**| `/platform/industries/:id/versions/:vId/publish` | `POST` | `platform.industries.manage` | `{ expectedRevision, reason, approvalReference }` | `IndustryTemplateVersion` |
| **Master Definitions**| `/tenant/masters` | `GET` | `system.masters.view` | None | `EffectiveMasterDefinition[]` |
| **Effective Values**| `/tenant/masters/:code/values` | `GET` | `system.masters.view` | `page`, `limit`, `search` | `EffectiveMasterValue[]` |
| **Audit Logs List** | `/platform/audit` | `GET` | `platform.audit.view` | `AuditQueryDto` (scope, action, actorId, tenantId, from, to) | `PaginatedAuditEventsResponse` |
| **Runtime Bootstrap**| `/tenant/runtime/bootstrap` | `GET` | Selected Membership Required | None (Header: `If-None-Match: W/"<configVersion>"`) | `RuntimeBootstrapDto (v1)` |

---

## 5. Concurrency, Revisions & Error State Strategy

Every converted page must handle all state outcomes intentionally without unhandled blank screens or silent overwrites:

| HTTP Status | Semantic Meaning | Frontend Handling & UX Strategy |
| :--- | :--- | :--- |
| **401 Unauthorized** | Expired or invalid session | Common API client intercepts; triggers `/auth/refresh`. If refresh fails, redirect to `/admin/login`. |
| **403 Forbidden** | Missing required permission or membership | Render intentional `PermissionDeniedState` card with clear message and required permission code. |
| **404 Not Found** | Resource missing or deleted | Render `ResourceNotFoundState` with back link; do not crash component tree. |
| **409 Conflict** | Business constraint violation (e.g. active version exists, duplicate slug) | Display toast error with exact server conflict message; prevent retry without form changes. |
| **412 Precondition Failed** | Stale revision/version concurrency collision | Alert user that underlying data was modified by another operator; provide `Reload Latest` action. |
| **422 Unprocessable** | Semantic validation failure | Map validation errors directly to corresponding form inputs; highlight offending fields. |
| **5xx / Network** | Server error or network dropout | Render recoverable `ErrorState` with an explicit `Retry` button. |

---

## 6. Implementation Action Plan by Work Package

1. **Work Package A (Modules)**:
   - Verify `module.service.ts` API integration against `/platform/modules`.
   - Ensure zero production fallback to `CANONICAL_PLATFORM_MODULES`.
   - Keep registry-owned fields read-only in UI.

2. **Work Package B (Plans)**:
   - Audit `CreatePlanWizardPage.tsx` and `PlanDetailsPage.tsx` for real API calls.
   - Enforce read-only UI for published versions.
   - Preserve decimal string precision for money values.

3. **Work Package C (Tenants & Memberships)**:
   - Replace `FixtureTenantService` with API-backed service (`GET /platform/tenants`, `GET /platform/tenants/:id`).
   - Wire `CreateTenantWizardPage.tsx` to `POST /platform/tenants/provision` with idempotency token.
   - Replace `FixtureTenantMembershipService` with real `GET /platform/tenants/:id/memberships`.

4. **Work Package D (Industries)**:
   - Build `/platform/industries` management screen (list templates, version history, module recommendations, publish draft).
   - Display exact pinned `industryTemplateVersionId` on tenant details.

5. **Work Package E & F (RBAC)**:
   - Build `/platform/roles` using backend RBAC grants and platform roles.
   - Enforce permission visibility on navigation.

6. **Work Package G (Masters)**:
   - Convert `MasterManagementPage.tsx` from `systemMastersData.ts` to `/tenant/masters` and `/tenant/masters/:code/values`.
   - Render provenance labels (`SYSTEM`, `INDUSTRY`, `TENANT`).

7. **Work Package H (Audit)**:
   - Convert `AuditLogsPage.tsx` to query `/platform/audit`.
   - Include date range, actor, action, and tenant filters.

8. **Work Package I (Runtime Bootstrap & Navigation)**:
   - Implement `RuntimeBootstrapContext` consuming `/tenant/runtime/bootstrap`.
   - Invalidate tenant cache on tenant switch.
   - Bind `AppShell.tsx` and `PlatformShell.tsx` navigation to server permissions and effective modules.
