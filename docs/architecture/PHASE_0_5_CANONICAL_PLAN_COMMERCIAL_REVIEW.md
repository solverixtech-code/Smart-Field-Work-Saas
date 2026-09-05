# Phase 0.5 — Canonical Plan Commercial Review & Import Analysis

This document provides a commercial audit and validation analysis of the four candidate platform Plans (`STARTER`, `GROWTH`, `PROFESSIONAL`, `ENTERPRISE`) from the frontend fixtures against the canonical platform module registry and Phase 0.5 commercial validation rules.

---

## 1. Executive Summary

| Candidate Plan Code | Candidate Name | Pricing Model | Monthly Rate | Annual Rate (mo eq) | Min Seats | Default Seats | Max Seats | Storage Allowance | Modules Included | Status / Approval Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`STARTER`** | Starter Sales Suite | `PER_USER` | ₹599 / mo | ₹499 / mo | 1 | 5 | 25 | 10 GB | `core_crm`, `attendance` | **APPROVED** |
| **`GROWTH`** | Growth Field Suite | `PER_USER` | ₹899 / mo | ₹749 / mo | 3 | 25 | 100 | 50 GB | `core_crm`, `field_visits`, `attendance` | **APPROVED** |
| **`PROFESSIONAL`** | Professional Field Suite | `PER_USER` | ₹1,199 / mo | ₹999 / mo | 5 | 50 | 250 | 100 GB | `core_crm`, `field_visits`, `demo_scheduler`, `order_management`, `attendance` | **APPROVED** |
| **`ENTERPRISE`** | Enterprise Custom Suite | `CUSTOM_CONTRACT` | Custom | Custom | 10 | 100 | Unlimited | 500 GB | All 8 Modules (`core_crm`, `field_visits`, `attendance`, `payroll`, `demo_scheduler`, `order_management`, `whatsapp_automation`, `ai_copilot`) | **APPROVED (Requires BETA Flag for `ai_copilot`)** |

---

## 2. Plan Commercial Deep-Dive & Module Dependency Audit

### A. `STARTER` (Starter Sales Suite)
- **Code**: `STARTER`
- **Visibility**: `PUBLIC`
- **Pricing**:
  - Currency: `INR`
  - Model: `PER_USER`
  - Monthly: ₹599 / seat / month
  - Annual: ₹499 / seat / month (Billed annually at ₹5,988 / seat / year)
  - Tax Mode: `EXCLUSIVE` (18% GST applicable)
- **Limits**:
  - Minimum Seats: `1`
  - Default Seat Limit: `5`
  - Maximum Seats: `25`
  - Storage: `10 GB`
  - Data Retention: `90 days`
- **Modules**: `core_crm`, `attendance`
- **Dependency Closure Check**:
  - `attendance` has no required prerequisites.
  - System-required `core_crm` is present.
  - **Result**: ✅ **CLOSED & VALID**

---

### B. `GROWTH` (Growth Field Suite)
- **Code**: `GROWTH`
- **Visibility**: `PUBLIC`
- **Pricing**:
  - Currency: `INR`
  - Model: `PER_USER`
  - Monthly: ₹899 / seat / month
  - Annual: ₹749 / seat / month (Billed annually at ₹8,988 / seat / year)
  - Tax Mode: `EXCLUSIVE`
- **Limits**:
  - Minimum Seats: `3`
  - Default Seat Limit: `25`
  - Maximum Seats: `100`
  - Storage: `50 GB`
  - Data Retention: `180 days`
- **Modules**: `core_crm`, `field_visits`, `attendance`
- **Dependency Closure Check**:
  - `field_visits` → requires `core_crm` (Present ✅)
  - `attendance` (Present ✅)
  - System-required `core_crm` (Present ✅)
  - **Result**: ✅ **CLOSED & VALID**

---

### C. `PROFESSIONAL` (Professional Field Suite)
- **Code**: `PROFESSIONAL`
- **Visibility**: `PUBLIC`
- **Pricing**:
  - Currency: `INR`
  - Model: `PER_USER`
  - Monthly: ₹1,199 / seat / month
  - Annual: ₹999 / seat / month (Billed annually at ₹11,988 / seat / year)
  - Tax Mode: `EXCLUSIVE`
- **Limits**:
  - Minimum Seats: `5`
  - Default Seat Limit: `50`
  - Maximum Seats: `250`
  - Storage: `100 GB`
  - Data Retention: `365 days`
- **Modules**: `core_crm`, `field_visits`, `demo_scheduler`, `order_management`, `attendance`
- **Dependency Closure Check**:
  - `field_visits` → requires `core_crm` (Present ✅)
  - `demo_scheduler` → requires `core_crm` (Present ✅)
  - `order_management` → requires `core_crm` (Present ✅)
  - `attendance` (Present ✅)
  - **Result**: ✅ **CLOSED & VALID**

---

### D. `ENTERPRISE` (Enterprise Custom Suite)
- **Code**: `ENTERPRISE`
- **Visibility**: `PUBLIC`
- **Pricing**:
  - Currency: `INR`
  - Model: `CUSTOM_CONTRACT`
  - Monthly / Annual: Custom negotiated rate
  - Tax Mode: `EXCLUSIVE`
- **Limits**:
  - Minimum Seats: `10`
  - Default Seat Limit: `100`
  - Maximum Seats: `isUnlimited = true`
  - Storage: `500 GB`
  - Data Retention: `730 days` (2 Years)
- **Modules**: `core_crm`, `field_visits`, `attendance`, `payroll`, `demo_scheduler`, `order_management`, `whatsapp_automation`, `ai_copilot`
- **Dependency Closure Check**:
  - `payroll` → requires `attendance` (Present ✅)
  - `field_visits`, `demo_scheduler`, `order_management`, `ai_copilot`, `whatsapp_automation` → require `core_crm` (Present ✅)
  - **BETA Lifecycle Audit**: `ai_copilot` is registered with `status = BETA` in the platform module catalog. When publishing `ENTERPRISE` version 1, `allowBetaModules: true` flag MUST be supplied in the publication payload.
  - **Result**: ✅ **CLOSED & VALID (With BETA Acknowledgement)**

---

## 3. Commercial Import Mechanism

Reviewed commercial plans are imported using the idempotent Nest/Prisma database seed utility:

```bash
npx ts-node prisma/seed-plans.ts
```

* **Version Allocation**: Imported plans are created as **Integer Version 1 (`v1`)**.
* **Publication Timestamp**: Set dynamically to the actual `now()` timestamp at import time. Fake fractional historical dates (`v0.8`, `v0.9`, `v1.0`) from browser fixtures are strictly discarded.
