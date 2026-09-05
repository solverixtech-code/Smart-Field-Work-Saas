# Phase 0.4 — Scoped RBAC Architecture & Implementation Document

## Overview
This document details the complete design, backend authority, guard stack ordering, permission resolution, scope boundaries, versioning invalidation strategy, and frontend authorization lifecycle for **Phase 0.4: Scoped Request Principal & Server-Authorized RBAC** in the **Visiblo Smart Field Work** SaaS platform.

---

## 1. Core Principles & Non-Negotiables

1. **Backend is Authoritative**:
   - The frontend never performs security checks. UI visibility (`PermissionGate`, `PermissionRoute`) is strictly for UX optimization based on server-issued permission lists returned by `GET /auth/authorization`.
   - Hidden buttons or missing menu options are never considered a security boundary.

2. **Explicit Scope Separation**:
   - Permission Scope: `PLATFORM` vs `TENANT`.
   - `PLATFORM` permissions grant access to SaaS administration resources (`/platform/*`).
   - `TENANT` permissions grant access to tenant workspace domain resources (`/shifts`, `/attendance`, `/payroll`).
   - A `PlatformRole` can ONLY be granted `PLATFORM`-scoped permissions.
   - A `TenantRole` can ONLY be granted `TENANT`-scoped permissions.

3. **No Legacy Role Bypasses**:
   - Legacy `User.role` values (`SUPER_ADMIN`, `ADMIN`, etc.) or `@smartfieldwork.com` email heuristics provide **zero** default permissions.
   - All access decisions evaluate `RequestPrincipal`'s `platformPermissions` and `tenantPermissions` resolved from `PlatformUserRoleAssignment` and `TenantMembership`.

---

## 2. Guard Stack Ordering

### Tenant Endpoints Guard Order
Tenant domain controllers (`ShiftController`, `AttendanceController`, `PayrollController`) use `@TenantAuthorized()` composite decorator which guarantees strict, deterministic execution order:

```
JwtAuthGuard
    ↓ (Authenticates JWT token)
RequestPrincipalGuard
    ↓ (Resolves RequestPrincipal from DB & Redis cache)
MembershipContextGuard
    ↓ (Validates active tenantId & membershipId context)
PermissionsGuard
    ↓ (Checks request.principal.tenantPermissions for @RequirePermissions)
Controller Action Execution
```

### Platform Endpoints Guard Order
Platform console controllers (`PlatformTenantsController`, `PlatformModulesController`) use `@PlatformAuthorized()`:

```
JwtAuthGuard
    ↓ (Authenticates JWT token)
RequestPrincipalGuard
    ↓ (Resolves RequestPrincipal from DB & Redis cache)
PlatformAccessGuard / PermissionsGuard
    ↓ (Checks request.principal.platformPermissions)
Controller Action Execution
```

---

## 3. Dynamic Cache Invalidation & Versioning

1. **Cache Structure**:
   - User permissions are cached in Redis with versioned keys:
     - Platform permissions: `user:perm:platform:<userId>:v<version>`
     - Tenant permissions: `user:perm:tenant:<tenantId>:<membershipId>:v<version>`
   - Cache TTL: 5 minutes with immediate transactional invalidation on grant/revoke.

2. **Transactional Version Bumping**:
   - Every permission grant or revoke operation (`RolePermissionService`, `sync-rbac`) transactionally increments `PlatformRole.permissionsVersion` or `TenantRole.permissionsVersion`.
   - The `permissionVersion` string returned in `GET /auth/authorization` (e.g. `t_sales_manager:v2`) automatically changes when permissions are modified, instantly invalidating stale client states.

3. **Customized Tenant Role Protection**:
   - `sync-rbac` checks `TenantRole.permissionsVersion`.
   - If a tenant role has `permissionsVersion > 1` (customized state), `sync-rbac` never overwrites or re-adds default grants that were intentionally removed.

---

## 4. Frontend Authorization Lifecycle

1. **State Store (`authorizationSlice`)**:
   - Stores server-issued `platform` and `tenant` permissions.
   - Dispatches `fetchAuthorizationBootstrap()` on application init / route change.

2. **State Reset Targets**:
   - `clearAuthorization()` is dispatched on:
     - User Logout (`handleLogout`)
     - Credential Clearing (`clearCredentials`)
     - Membership Selection / Tenant Switch (`POST /auth/memberships/select`)
   - Guarantees zero authorization data leakage across different user sessions or tenant switches.

3. **Routing**:
   - All protected routes in `AppRouter.tsx` consume `<PermissionRoute permission="<code-[#]">` />`.
   - Dead `allowedRoles` array props have been completely eliminated.

---

## 5. Verification Matrix

| Component / Test | Status | Command / Method |
| :--- | :--- | :--- |
| **Prisma Schema & Migration** | ✅ Passed | `npx prisma validate && npx prisma migrate status` |
| **RBAC Sync Script** | ✅ Passed | `npm run db:sync:rbac` |
| **Nest API Unit Tests** | ✅ Passed | `npm test -- --runInBand` |
| **Nest API E2E Suite** | ✅ Passed | `npm run test:e2e` |
| **React Web Build** | ✅ Passed | `npm run build` in `apps/web` |
