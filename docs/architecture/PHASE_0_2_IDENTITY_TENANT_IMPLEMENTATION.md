# Phase 0.2 & 0.2.1 — Identity, Tenant and Membership Implementation

## Overview

Phase 0.2 & Phase 0.2.1 establish the multi-tenant identity and workspace foundation for **Smart Field Work SaaS**.
This implementation transitions the platform from a legacy single-workspace model to a true multi-tenant SaaS architecture where **Global User Identity** is separated from **Tenant Memberships**, **Tenant Roles**, and **Platform Roles**.

---

## 1. Architectural Boundaries

```
                 ┌───────────────────────────┐
                 │       GLOBAL USER         │
                 │   (email, password, OTP)  │
                 └─────────────┬─────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌───────────────┐                             ┌─────────────────┐
│ PLATFORM ROLE │                             │ TENANT WORKSPACE│
│ ASSIGNMENTS   │                             │    (Tenant A)   │
└───────────────┘                             └────────┬────────┘
                                                       │
                                              ┌────────┴────────┐
                                              ▼                 ▼
                                      ┌──────────────┐  ┌──────────────┐
                                      │  MEMBERSHIP  │  │ TENANT ROLE  │
                                      │ (PH-204, team│  │(sales_mgr)   │
                                      │  mgr, scope) │  └──────────────┘
                                      └──────────────┘
```

---

## 2. Key Components Delivered

### 2.1 Schema & Models
- `Tenant`: Primary workspace aggregate (`id`, `slug`, `displayName`, `legalName`, `primaryDomain`, `status`, `companySizeCode`, `description`, lifecycle timestamps).
- `TenantAddress`, `TenantSettings`, `TenantBranding`: Normalized child entities for address details, regional configuration (timezone, currency, locale), and visual branding.
- `TenantMembership`: Composite join model `(tenantId, userId)` representing a user's scoped presence in a tenant. Captures tenant-local `employeeCode`, `designation`, `department`, `dataScope`, `teamId`, and `managerMembershipId`.
- `TenantRoleTemplate` & `TenantRole`: Templates (`super_admin`, `admin`, `sales_manager`, `team_leader`, `field_executive`, `back_office_executive`) instantiated per tenant.
- `PlatformRole` & `PlatformUserRoleAssignment`: Platform-wide administrative role grants (`super_admin`, `support_engineer`, `billing_admin`, `auditor`).

### 2.2 Security Wiring & Modules (`AuthSecurityModule`)
- Extracted global `@Global()` `AuthSecurityModule` exporting `JwtModule` and `JwtAuthGuard`.
- Prevents circular dependency between `AuthModule` and `PlatformTenantsModule`.
- Verified via automated Nest application bootstrap test (`app.bootstrap.spec.ts`).

### 2.3 Transactional Foundation Creation
- `TenantService.createTenantFoundation()` creates `Tenant`, `TenantSettings`, `TenantBranding`, `TenantAddress`, and built-in `TenantRole` entries within a single atomic `prisma.$transaction`.
- Built-in role instantiation is executed inside the same transaction pass via `TenantRoleService.ensureBuiltInTenantRoles(tenantId, tx)`.

### 2.4 Explicit Membership Split Semantics & Lifecycle Policies
- `createMembership()` strictly creates a new membership and rejects existing `(tenantId, userId)` records with `ConflictException`.
- `updateMembershipProfile()` handles profile attribute updates (`employeeCode`, `designation`, `department`, `dataScope`, `teamId`, `managerMembershipId`, `isPrimary`).
- `changeMembershipRole()` verifies and updates tenant role assignment.
- `transitionMembershipStatus()` enforces explicit state machine policies (`INVITED` ➔ `ACTIVE`/`DEACTIVATED`, `ACTIVE` ➔ `SUSPENDED`/`DEACTIVATED`, `SUSPENDED` ➔ `ACTIVE`/`DEACTIVATED`, `DEACTIVATED` ➔ `ACTIVE`).
- Timestamps (`activatedAt`, `deactivatedAt`) are updated accurately (only setting `activatedAt` when status transitions to `ACTIVE`).

### 2.5 Identity Compatibility Service (`IdentityCompatibilityService`)
- Resolves effective identity context for legacy flows and multi-tenant flows.
- Guarantees `roleCode` is resolved to a string role code (e.g. `'sales_manager'`), never a raw UUID.
- Exposes explicit, non-ambiguous fields: `tenantRoleCode`, `managerMembershipId`, and `legacyManagerUserId`.

### 2.6 Platform Role Validity Rules (`PlatformRoleService`)
- Enforces `PlatformRole.isActive` verification upon assignment.
- Validates `validUntil > validFrom` interval logic.
- Verifies assigner user existence (`assignedByUserId`).
- `getUserPlatformRoles()` filters active roles based on current timestamp `now` (`validFrom <= now <= validUntil`).

### 2.7 Invariant Validation & Whitelisting
- Domain invariants (`slug` URL-safe kebab-case regex `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, `primaryDomain` normalization, hex color `/^#[0-9A-Fa-f]{6}$/`) are enforced at the service boundary.
- `TenantQueryDto` uses `TenantSortField` and `SortDirection` enums with `@IsEnum()` validation.

### 2.8 Database Safety Shield in Integration Tests
- Integration tests in `tenant-membership.service.spec.ts`, `tenant.service.spec.ts`, and `platform-role.service.spec.ts` incorporate a `verifyTestDatabaseSafety()` check ensuring tests execute against dedicated test environments.

---

## 3. Mandatory Test Coverage

1. **One User Two Tenants**: Verified that a single User can hold independent memberships in Tenant A (`sales_manager`, `PH-204`) and Tenant B (`field_executive`, `SOL-813`), and suspending Tenant B leaves Tenant A unaffected.
2. **Employee Code Tenant Isolation**: Verified that the same employee code (e.g. `EMP-001`) can exist concurrently in different tenants for distinct users, while duplicate employee codes within the same tenant are rejected.
3. **Cross-Tenant Manager Assignment Rejection**: Verified that assigning a manager membership from Tenant B to a member in Tenant A is rejected with `BadRequestException`.
4. **Cross-Tenant Role Assignment Rejection**: Verified that assigning a TenantRole from Tenant B to a member in Tenant A is rejected with `BadRequestException`.
5. **Membership Selection Rules**: Verified evaluation of 0, 1, and >1 active memberships for auto-selection vs explicit tenant prompt.
6. **User Status vs Membership Status**: Verified that suspending a membership in Tenant A revokes access to Tenant A while Tenant B remains accessible.

---

## 4. Phase 0.3 Blockers (Kept Open)

As specified by the architecture design:
- **R-001 / R-002 / R-003 / R-004** remain **OPEN** as explicit blockers for Phase 0.3 (Scoped RequestPrincipal and Operational Tenant Repository Enforcement).
