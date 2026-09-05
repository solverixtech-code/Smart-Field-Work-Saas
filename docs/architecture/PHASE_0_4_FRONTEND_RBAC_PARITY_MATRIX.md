# Phase 0.4 — Frontend RBAC Parity Matrix

## Overview
This document maps legacy role-based UI gates (`allowedRoles: Role[]`, `user.role` comparisons, email elevation heuristics) to canonical server-issued permission codes (`authorization.platform.permissions` and `authorization.tenant.permissions`).

---

## 1. Platform Console Navigation Parity

| Page / Component | Legacy Gate | Canonical Permission Code | Default Platform Roles Granted | Backend Enforcement Status |
| :--- | :--- | :--- | :--- | :--- |
| **Platform Dashboard** | `PLATFORM_SUPER_ADMIN`, email matching | `platform.dashboard.view` | All Platform Roles | **`IMPLEMENTED + ENFORCED`** (`GET /platform/tenants`) |
| **All Tenants List** | `PLATFORM_SUPER_ADMIN`, `PLATFORM_SUPPORT` | `platform.tenants.view` | Super Admin, Operations Admin, Onboarding, Support, Billing, Auditor | **`IMPLEMENTED + ENFORCED`** (`GET /platform/tenants`) |
| **Create Tenant** | `PLATFORM_SUPER_ADMIN` | `platform.tenants.create` | Super Admin, Operations Admin, Onboarding | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Edit / Suspend Tenant** | `PLATFORM_SUPER_ADMIN` | `platform.tenants.suspend` | Super Admin, Operations Admin | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Plans & Pricing** | `PLATFORM_SUPER_ADMIN` | `platform.plans.view` | Super Admin, Operations Admin, Support | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Publish Plan** | `PLATFORM_SUPER_ADMIN` | `platform.plans.publish` | Super Admin | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Modules & Features** | `PLATFORM_SUPER_ADMIN` | `platform.modules.view` | Super Admin, Operations Admin, Support | **`IMPLEMENTED + ENFORCED`** (`GET /platform/modules`) |
| **Edit / Archive Module**| `PLATFORM_SUPER_ADMIN` | `platform.modules.update` | Super Admin, Operations Admin | **`IMPLEMENTED + ENFORCED`** (`PATCH /platform/modules/:id`) |
| **Industries** | `PLATFORM_SUPER_ADMIN` | `platform.industries.view` | Super Admin, Operations Admin, Onboarding, Support | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Platform Users** | `PLATFORM_SUPER_ADMIN` | `platform.users.view` | Super Admin, Operations Admin, Support | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Roles & Permissions** | `PLATFORM_SUPER_ADMIN` | `platform.roles.view` | Super Admin, Operations Admin | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Audit Logs** | `PLATFORM_SUPER_ADMIN` | `platform.audit.view` | Super Admin, Operations Admin, Support, Auditor | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Subscriptions** | `PLATFORM_SUPER_ADMIN` | `platform.subscriptions.manage` | Super Admin, Billing | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |

---

## 2. Tenant Workspace Navigation Parity

| Page / Component | Legacy Gate | Canonical Permission Code | Default Tenant Roles Granted | Backend Enforcement Status |
| :--- | :--- | :--- | :--- | :--- |
| **Workspace Dashboard** | `SUPER_ADMIN`, `ADMIN` | `crm.dashboard.view` | tenant_admin, sales_manager, team_leader, field_executive, finance_ops, support | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Sales Pipeline** | `SALES_MANAGER`, `TEAM_LEADER` | `crm.pipeline.view` | tenant_admin, sales_manager, team_leader | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Leads Management** | `SALES_MANAGER`, `TEAM_LEADER` | `crm.leads.view` | tenant_admin, sales_manager, team_leader, field_executive | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Shifts & Schedule** | `SALES_MANAGER`, `TEAM_LEADER` | `workforce.shifts.view` | tenant_admin, sales_manager, team_leader, support | **`IMPLEMENTED + ENFORCED`** (`GET /shifts`) |
| **Shift Assignment** | `ADMIN`, `SALES_MANAGER` | `workforce.shifts.assign` | tenant_admin, sales_manager, team_leader | **`IMPLEMENTED + ENFORCED`** (`POST /shifts/assign`) |
| **Self Punch In/Out** | All Active Users | `attendance.self.punch` | tenant_admin, sales_manager, team_leader, field_executive, finance_ops | **`IMPLEMENTED + ENFORCED`** (`POST /attendance/punch-in`) |
| **Attendance Monitoring**| `ADMIN`, `SALES_MANAGER` | `attendance.monitoring.view` | tenant_admin, sales_manager, team_leader, support | **`IMPLEMENTED + ENFORCED`** (`GET /attendance/admin/today`) |
| **Salary Configuration** | `ADMIN`, `FINANCE_OPS` | `payroll.salary_structure.manage` | tenant_admin, finance_ops | **`IMPLEMENTED + ENFORCED`** (`POST /payroll/salary-structure`) |
| **Generate Payroll Run** | `ADMIN`, `FINANCE_OPS` | `payroll.runs.generate` | tenant_admin, finance_ops | **`IMPLEMENTED + ENFORCED`** (`POST /payroll/generate`) |
| **List Payslips** | `ADMIN`, `FINANCE_OPS` | `payroll.payslips.view` | tenant_admin, finance_ops | **`IMPLEMENTED + ENFORCED`** (`GET /payroll/payslips`) |
| **Mark Payslip Paid** | `ADMIN`, `FINANCE_OPS` | `payroll.payslips.pay` | tenant_admin, finance_ops | **`IMPLEMENTED + ENFORCED`** (`POST /payroll/payslips/:id/pay`) |
| **System Masters** | `ADMIN`, `FINANCE_OPS`, `SUPPORT` | `system.masters.view` | tenant_admin, sales_manager, team_leader, finance_ops, support | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
| **Workspace Settings** | `SUPER_ADMIN`, `ADMIN` | `system.settings.manage` | tenant_admin | **`FRONTEND/FIXTURE ONLY — BACKEND DEFERRED`** |
