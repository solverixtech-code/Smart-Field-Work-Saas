# Phase 0.5 — Plan & Immutable PlanVersion Commercial Engine Architecture & Implementation Document

This document provides the canonical architectural specification, database immutability mechanics, security guard ordering, DTO contracts, and frontend service cutover details for **Phase 0.5: Plan + Immutable PlanVersion Commercial Backend** in the **Visiblo Smart Field Work** SaaS platform.

---

## 1. Primary Goal & Authority Hierarchy

Phase 0.5 replaces browser-stored `localStorage` pricing (`sfw_plans_catalog_v1`) with a server-authoritative, platform-global commercial Plan aggregate (`Plan` → `PlanVersion` → `PlanPricing`, `PlanLimit`, `PlanModule`, `PlanCommercialRule`).

```
Platform Admin
      ↓
Draft PlanVersion (Integer version v1, v2, ...)
      ↓
PlanPublicationPolicyService Validation (Pricing, Limits, Required Modules, Dependency Closure)
      ↓
Atomic Transaction & Publish
      ↓
IMMUTABLE PlanVersion (PostgreSQL Database Triggers block UPDATE & DELETE)
      ↓
Future TenantSubscription (Pins immutable planVersionId)
```

---

## 2. Database Models & Schema Design (Migration M5)

### A. Entity Ownership & Invariants
1. **`Plan`**: Stable product commercial identity. Code is uppercase, normalized (`STARTER`, `GROWTH`, etc.), and immutable post-creation.
2. **`PlanVersion`**: Versioned commercial snapshot (`version: Int`). Monotonically increasing per Plan (`@@unique([planId, version])`).
   - Single Active Draft Invariant: Enforced at the PostgreSQL level via partial unique index:
     `CREATE UNIQUE INDEX "PlanVersion_planId_draft_key" ON "PlanVersion"("planId") WHERE status = 'DRAFT';`
3. **`PlanPricing`**: Money precision normalized using `Decimal(18,2)` (NEVER binary floating-point Float). Keyed by `(planVersionId, billingCycle)`.
4. **`PlanLimit`**: Typed limits (`INTEGER`, `DECIMAL`, `BOOLEAN`) registered in `PLAN_LIMIT_REGISTRY`. Keyed by `(planVersionId, limitCode)`.
5. **`PlanModule`**: Canonical commercial module grants. Keyed by `(planVersionId, moduleId)`.
6. **`PlanCommercialRule`**: Commercial snapshot rules JSON (`schemaVersion: 1`).

---

## 3. Database Immutability Enforcers (PostgreSQL Triggers)

Service-level checks are reinforced at the PostgreSQL engine level. Direct SQL or ORM updates/deletions on published rows are rejected:

1. **`enforce_plan_version_immutability`**:
   - Executes `BEFORE UPDATE OR DELETE ON "PlanVersion"`.
   - Allows transition `DRAFT` -> `PUBLISHED`.
   - Raises PostgreSQL exception if `OLD.status = 'PUBLISHED'` or `OLD.publishedAt IS NOT NULL`.

2. **`enforce_plan_child_immutability`**:
   - Executes `BEFORE INSERT OR UPDATE OR DELETE` on `PlanPricing`, `PlanLimit`, `PlanModule`, and `PlanCommercialRule`.
   - Looks up parent `PlanVersion.status`. If `PUBLISHED`, raises exception.
   - On `UPDATE`, verifies `OLD.planVersionId` and `NEW.planVersionId` to prevent moving rows out of published versions.

---

## 4. API Endpoints & Frozen RBAC Security Matrix

All endpoints reside in `PlatformPlansModule` (`apps/api/src/platform/plans/`) and are guarded by `@UseGuards(JwtAuthGuard, RequestPrincipalGuard, PermissionsGuard)`:

| HTTP Method | Route Endpoint | Required Platform Permission | Action & Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/platform/plans` | `platform.plans.view` | Lists all platform plans with current published & draft version summaries |
| `GET` | `/platform/plans/:planId` | `platform.plans.view` | Retrieves detailed plan aggregate & version history |
| `POST` | `/platform/plans` | `platform.plans.create` | Atomically creates new Plan identity + `v1` DRAFT version snapshot |
| `PATCH` | `/platform/plans/:planId` | `platform.plans.update` | Updates stable plan metadata (name, description, visibility, color) |
| `GET` | `/platform/plans/:planId/versions` | `platform.plans.view` | Retrieves full integer version history with derived display status |
| `POST` | `/platform/plans/:planId/versions/draft` | `platform.plans.update` | Clones current published version into a new `v(N+1)` DRAFT. Fails with 409 if a draft exists |
| `PATCH` | `/platform/plans/:planId/versions/:versionId` | `platform.plans.update` | Modifies active DRAFT version pricing, limits, modules, or rules. Fails with 409 if version is published |
| `POST` | `/platform/plans/:planId/versions/:versionId/publish` | `platform.plans.publish` | Executes publication policy validation and atomic publish transaction |
| `POST` | `/platform/plans/:planId/archive` | `platform.plans.archive` | Transitions Plan status to `ARCHIVED` without mutating published versions |

### Adversarial Security Rules:
- Legacy users with `User.role = SUPER_ADMIN` but lacking explicit `PlatformUserRoleAssignment` return **`403 Forbidden`**.
- Platform endpoints do NOT require `TenantMembership` or `tenantId`.

---

## 5. Web Frontend Cutover

* **Service Refactor**: `apps/web/src/features/platform/catalog/plans/services/plan.service.ts` is refactored from `localStorage` (`sfw_plans_catalog_v1`) to call REST endpoints (`GET /platform/plans`, `POST /platform/plans`, etc.) via `common/api`.
* **Enum & Money Adapters**: Conversion helpers translate backend enum codes (`PER_USER`, `ACTIVE`, `PUBLIC`, `EXCLUSIVE`) to UI presentation labels and parse precise Decimal string responses.
* **Component Stability**: Layout and UI pages (`PlansPricingPage.tsx`, `CreatePlanWizardPage.tsx`, `PlanDetailsPage.tsx`) remain unchanged while delegating commercial authority to NestJS.
