# Phase 0.5 — Canonical Plan Commercial Review & Import Analysis

This document provides a commercial audit and validation analysis of the four candidate platform Plans (`STARTER`, `GROWTH`, `PROFESSIONAL`, `ENTERPRISE`) from the frontend fixtures against the canonical platform module registry and Phase 0.5 commercial validation rules.

---

## 1. Executive Summary

| Candidate Plan Code | Candidate Name | Pricing Model | Monthly Rate | Annual Rate (mo eq) | Min Seats | Default Seats | Max Seats | Storage Allowance | Modules Included | Status / Approval Gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`STARTER`** | Starter Sales Suite | `PER_USER` | ₹499 / mo | ₹399 / mo | 5 | 15 | 20 | 10 GB | `core_crm`, `field_visits` | **PENDING COMMERCIAL APPROVAL** |
| **`GROWTH`** | Growth Field Suite | `PER_USER` | ₹899 / mo | ₹749 / mo | 3 | 25 | 100 | 50 GB | `core_crm`, `field_visits`, `attendance` | **PENDING COMMERCIAL APPROVAL** |
| **`PROFESSIONAL`** | Professional Field Suite | `PER_USER` | ₹1,199 / mo | ₹999 / mo | 5 | 50 | 250 | 100 GB | `core_crm`, `field_visits`, `demo_scheduler`, `order_management`, `attendance` | **PENDING COMMERCIAL APPROVAL** |
| **`ENTERPRISE`** | Enterprise Custom Suite | `CUSTOM_CONTRACT` | Custom | Custom | 10 | 100 | Unlimited | 500 GB | All 8 Modules (`core_crm`, `field_visits`, `attendance`, `payroll`, `demo_scheduler`, `order_management`, `whatsapp_automation`, `ai_copilot`) | **PENDING COMMERCIAL APPROVAL** |

---

## 2. Plan Commercial Deep-Dive & Module Dependency Audit

### A. `STARTER` (Starter Sales Suite)
- **Code**: `STARTER`
- **Visibility**: `PUBLIC`
- **Pricing**:
  - Currency: `INR`
  - Model: `PER_USER`
  - Monthly: ₹499 / seat / month
  - Annual: ₹399 / seat / month (Billed annually at ₹4,788 / seat / year)
  - Tax Mode: `EXCLUSIVE` (18% GST applicable)
- **Limits**:
  - Minimum Seats: `5`
  - Default Seat Limit: `15`
  - Maximum Seats: `20`
  - Storage: `10 GB`
  - Data Retention: `90 days`
- **Modules**: `core_crm`, `field_visits`
- **Dependency Closure Check**:
  - `field_visits` → requires `core_crm` (Present ✅)
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

Candidate commercial plans remain `PENDING COMMERCIAL APPROVAL`.
Import/seeding executes through publication policy validation:

```bash
npx ts-node prisma/seed-plans.ts
```

* **Version Allocation**: Imported candidate plans are created as **Integer Version 1 (`v1`)** in `DRAFT` status until explicitly approved and published through publication policy validation.
