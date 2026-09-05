# Phase 0.4 — Frontend RBAC Parity Matrix

## Overview
This document maps legacy role-based UI gates (`allowedRoles: Role[]`, `user.role` comparisons, email elevation heuristics) to canonical server-issued permission codes (`authorization.platform.permissions` and `authorization.tenant.permissions`).

---

## 1. Platform Console Navigation Parity

| Page / Component | Legacy Gate | Canonical Permission Code | Default Platform Roles Granted | Backend Enforcement Status |
| :--- | :--- | :--- | :--- | :--- |
| **Platform Dashboard** | `PLATFORM_SUPER_ADMIN`, email matching | `platform.dashboard.view` | All Platform Roles | **`ENFORCED`** |
| **All Tenants List** | `PLATFORM_SUPER_ADMIN`, `PLATFORM_SUPPORT` | `platform.tenants.view` | Super Admin, Operations Admin, Onboarding, Support, Billing, Auditor | **`ENFORCED`** (`GET /platform/tenants`) |
| **Create Tenant** | `PLATFORM_SUPER_ADMIN` | `platform.tenants.create` | Super Admin, Operations Admin, Onboarding | **`ENFORCED`** (`POST /platform/tenants`) |
| **Edit / Suspend Tenant** | `PLATFORM_SUPER_ADMIN` | `platform.tenants.suspend` | Super Admin, Operations Admin | **`ENFORCED`** (`PATCH /platform/tenants/:id`) |
| **Plans & Pricing** | `PLATFORM_SUPER_ADMIN` | `platform.plans.view` | Super Admin, Operations Admin, Support | **`ENFORCED`** (`GET /platform/plans`) |
| **Publish Plan** | `PLATFORM_SUPER_ADMIN` | `platform.plans.publish` | Super Admin | **`ENFORCED`** (`POST /platform/plans/:id/publish`) |
| **Modules & Features** | `PLATFORM_SUPER_ADMIN` | `platform.modules.view` | Super Admin, Operations Admin, Support | **`ENFORCED`** (`GET /platform/modules`) |
| **Edit / Archive Module**| `PLATFORM_SUPER_ADMIN` | `platform.modules.update` | Super Admin, Operations Admin | **`ENFORCED`** (`PATCH /platform/modules/:id`) |
| **Industries** | `PLATFORM_SUPER_ADMIN` | `platform.industries.view` | Super Admin, Operations Admin, Onboarding, Support | **`ENFORCED`** (`GET /platform/industries`) |
| **Platform Users** | `PLATFORM_SUPER_ADMIN` | `platform.users.view` | Super Admin, Operations Admin, Support | **`ENFORCED`** (`GET /platform/users`) |
| **Roles & Permissions** | `PLATFORM_SUPER_ADMIN` | `platform.roles.view` | Super Admin, Operations Admin | **`ENFORCED`** (`GET /platform/roles`) |
| **Audit Logs** | `PLATFORM_SUPER_ADMIN` | `platform.audit.view` | Super Admin, Operations Admin, Support, Auditor | **`ENFORCED`** (`GET /platform/audit`) |
| **Subscriptions** | `PLATFORM_SUPER_ADMIN` | `platform.subscriptions.manage` | Super Admin, Billing | **`ENFORCED`** (`GET /platform/subscriptions`) |

---

## 2. Tenant Workspace Navigation Parity

| Page / Component | Legacy Gate | Canonical Permission Code | Default Tenant Roles Granted | Backend Enforcement Status |
| :--- | :--- | :--- | :--- | :--- |
| **Workspace Dashboard** | `SUPER_ADMIN`, `ADMIN` | `crm.dashboard.view` | tenant_admin, sales_manager, team_leader, field_executive, finance_ops, support | **`DEFERRED TO CRM DOMAIN`** |
| **Sales Pipeline** | `SALES_MANAGER`, `TEAM_LEADER` | `crm.pipeline.view` | tenant_admin, sales_manager, team_leader | **`DEFERRED TO CRM DOMAIN`** |
| **Leads Management** | `SALES_MANAGER`, `TEAM_LEADER` | `crm.leads.view` | tenant_admin, sales_manager, team_leader, field_executive | **`DEFERRED TO CRM DOMAIN`** |
| **Shifts & Schedule** | `SALES_MANAGER`, `TEAM_LEADER` | `workforce.shifts.view` | tenant_admin, sales_manager, team_leader, support | **`ENFORCED`** (`GET /shifts`) |
| **Shift Assignment** | `ADMIN`, `SALES_MANAGER` | `workforce.shifts.assign` | tenant_admin, sales_manager, team_leader | **`ENFORCED`** (`POST /shifts/assign`) |
| **Self Punch In/Out** | All Active Users | `attendance.self.punch` | tenant_admin, sales_manager, team_leader, field_executive, finance_ops | **`ENFORCED`** (`POST /attendance/punch-in`) |
| **Attendance Monitoring**| `ADMIN`, `SALES_MANAGER` | `attendance.monitoring.view` | tenant_admin, sales_manager, team_leader, support | **`ENFORCED`** (`GET /attendance/admin/today`) |
| **Salary Configuration** | `ADMIN`, `FINANCE_OPS` | `payroll.salary_structure.manage` | tenant_admin, finance_ops | **`ENFORCED`** (`POST /payroll/salary-structure`) |
| **Generate Payroll Run** | `ADMIN`, `FINANCE_OPS` | `payroll.runs.generate` | tenant_admin, finance_ops | **`ENFORCED`** (`POST /payroll/generate`) |
| **List Payslips** | `ADMIN`, `FINANCE_OPS` | `payroll.payslips.view` | tenant_admin, finance_ops | **`ENFORCED`** (`GET /payroll/payslips`) |
| **Mark Payslip Paid** | `ADMIN`, `FINANCE_OPS` | `payroll.payslips.pay` | tenant_admin, finance_ops | **`ENFORCED`** (`POST /payroll/payslips/:id/pay`) |
| **System Masters** | `ADMIN`, `FINANCE_OPS`, `SUPPORT` | `system.masters.view` | tenant_admin, sales_manager, team_leader, finance_ops, support | **`ENFORCED IN 0.8`** |
| **Workspace Settings** | `SUPER_ADMIN`, `ADMIN` | `system.settings.manage` | tenant_admin | **`ENFORCED IN 0.9`** |
