# Phase 0.3 & 0.3.1 — Scoped RequestPrincipal & Tenant Enforcement Architecture

## Executive Summary
This document specifies the authoritative runtime tenant security boundary for the Visiblo Smart Field Work SaaS platform. Cross-tenant access is structurally prevented across all HTTP API paths, services, and PostgreSQL queries.

---

## 1. Security Architecture Chain

```
LOGIN / REFRESH
       ↓
UserSession (id, selectedMembershipId, contextVersion, status)
       ↓
Selected TenantMembership (status: ACTIVE)
       ↓
JWT Claims: sub (userId), sid (sessionId), mid (selectedMembershipId), ctxv (contextVersion), tokenUse ("access" / "refresh")
       ↓
JwtAuthGuard (validates signature & expiration)
       ↓
RequestPrincipalGuard (live DB verification of User, Session, contextVersion, Membership, and Tenant status)
       ↓
RequestPrincipal (strongly typed runtime context attached to request.principal)
       ↓
MembershipContextGuard (requires active non-null tenantId & membershipId)
       ↓
TenantScope (immutable value object created via TenantScopeFactory.fromPrincipal)
       ↓
Tenant-scoped Repositories (ShiftRepository, AttendanceRepository, PayrollRepository)
       ↓
PostgreSQL Query (where: { tenantId: scope.tenantId })
```

---

## 2. Key Security Principles

1. **Zero Client Authority Over `tenantId`**:
   - `tenantId` is never read from `req.body`, `req.query`, `req.params`, `X-Tenant-ID`, `X-Workspace-ID`, or user input.
   - The browser/mobile client selects only `membershipId` via `POST /auth/memberships/select`. The server derives `tenantId` from the verified active membership.

2. **Session-Bound Context & `contextVersion` Protection**:
   - Every active `UserSession` maintains an integer `contextVersion`.
   - When a user switches memberships via `POST /auth/memberships/select`, `contextVersion` is incremented and tokens are rotated.
   - Old access tokens with outdated `ctxv` values fail `RequestPrincipalGuard` resolution immediately.

3. **Strict `sid` Session Binding**:
   - Membership selection requires a valid, active `sid` claim in the authenticated JWT.
   - Tokens without `sid` or with invalid/revoked `sid` claims cannot select memberships or acquire tenant context.

4. **OTP Verification Security**:
   - Dev/test OTP bypass (`000000`) is disabled in production (`NODE_ENV === 'production'`).
   - In non-production environments, bypass is strictly restricted to calls with a valid existing `challengeToken`. Fallback to arbitrary DB challenges is prohibited.

5. **Sensitive Metadata Redaction**:
   - Database queries in Attendance, Shift, and Payroll domains use explicit safe selects (`id`, `fullName`, `employeeCode`, `email`, `avatarUrl`). `passwordHash`, reset tokens, and OTP hashes are never included.

6. **Tenant-Aware Unique Constraints**:
   - `Shift`: `@@unique([tenantId, code])`
   - `Attendance`: `@@unique([tenantId, tenantMembershipId, date])`
   - `SalaryStructure`: `@@unique([tenantId, tenantMembershipId])`
   - `PayrollPeriod`: `@@unique([tenantId, month, year])`
   - `Payslip`: `@@unique([tenantMembershipId, payrollPeriodId])`

---

## 3. Verification & Compliance
- **Unit & Security Test Suite**: 51/51 passing tests ([tenant-isolation.spec.ts](file:///e:/Visiblo/Visiblo%20Field%20Executive/apps/api/src/platform/tenants/tenant-isolation.spec.ts)).
- **Nest API Build**: 0 compilation errors.
- **Web Frontend Build**: 0 Vite compilation errors.
- **Completion Gate**: Phase 0.3 & 0.3.1 Security Completion **PASSED & FROZEN**.
