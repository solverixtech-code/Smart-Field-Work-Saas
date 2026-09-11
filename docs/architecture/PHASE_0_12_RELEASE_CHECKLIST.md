# Phase 0.12 Release & Production Deployment Checklist

## Executive Summary
This document provides the mandatory step-by-step procedures, environment verifications, deployment sequence, smoke tests, rollback triggers, and explicit external pre-production infrastructure requirements for releasing Phase 0 to production for the **Visiblo Smart Field Work** SaaS platform.

---

## 1. Pre-Deployment Phase & External Requirements

### A. Repository Verification
- [x] **Approved Release SHA**: Verified candidate SHA on `main`.
- [x] **CI Pipeline**: 100% green build and test suite run (Candidate & Merged Main).
- [x] **Immutability Audit**: 33 Prisma migrations verified (0 historical edits).

### B. External Infrastructure Requirements (EXTERNAL / Pre-Production)
*These items cannot be verified inside repository CI and must be signed off by Operations prior to production deployment:*
- [ ] **EXTERNAL: Production Database Backup/Restore**: Verified point-in-time PostgreSQL backup image created (`pg_dump -Fc ...`).
- [ ] **EXTERNAL: Secret Validation**: `JWT_SECRET` & `JWT_REFRESH_SECRET` generated with high-entropy (>64 characters).
- [ ] **EXTERNAL: DATABASE_URL SSL**: `DATABASE_URL` configured with `sslmode=require` or higher.
- [ ] **EXTERNAL: CORS Allowlist**: `CORS_ORIGIN` restricted to production domain origins (no wildcards).
- [ ] **EXTERNAL: S3 / Object Storage Security**: Bucket policies, IAM roles, KMS encryption, and private-by-default access enforced.
- [ ] **EXTERNAL: Worker Process Configuration**: Dedicated background job worker container/service scaled and configured.
- [ ] **EXTERNAL: Production Readiness Health Probes**: Edge proxies configured to check `/api/v1/health` and `/api/v1/readiness`.

---

## 2. Deployment Execution Sequence

### Step 1: Database Migration Deployment
Run database schema updates using the production deployment tool:
```bash
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```
*Expected output: `33 migrations found in prisma/migrations. No pending migrations to apply.`*

### Step 2: System RBAC Synchronization
Run idempotent system role and permission synchronization:
```bash
cd apps/api && npm run db:sync:rbac
```
*Expected output: `[RBAC Sync] Completed successfully.`*

### Step 3: Application Server Deployment (API & Workers)
1. Deploy updated API container/process.
2. Deploy background job worker service (`WorkerLoopService`).
3. Verify process startup logs for zero uncaught exceptions.

### Step 4: Web Frontend Deployment
1. Build production static bundle (`cd apps/web && npm run build`).
2. Deploy assets to static hosting/CDN.
3. Purge edge cache for index HTML file.

---

## 3. Post-Deployment Verification & Smoke Tests

### A. Health & Readiness Checks
- [ ] Call `GET /api/v1/health` -> Expect `HTTP 200 OK` (`{"status": "ok"}`)
- [ ] Call `GET /api/v1/readiness` -> Expect `HTTP 200 OK` (`{"status": "ready", "database": "connected"}`)

### B. Functional Smoke Test Sequence
1. **Platform Admin Login**: Authenticate as Platform Super Admin.
2. **Tenant Navigation**: Inspect Tenant List, Plan List, and Industry Catalog.
3. **Tenant Switch Rehearsal**: Switch context between Tenant A and Tenant B, verifying cache invalidation and isolated RequestPrincipal.
4. **Audit Trail Verification**: Verify audit log record created for login action.
5. **Background Job Execution**: Verify background job outbox claims and executes without failure.

---

## 4. Abort & Emergency Rollback Triggers

Immediately halt deployment and execute emergency rollback if any of the following occur:
1. `prisma migrate deploy` fails due to schema lock or unresolvable migration conflict.
2. API container fails readiness probe (`GET /api/v1/readiness` returns non-200) after 3 retries.
3. Elevated HTTP 5xx error rate (> 0.5% over 5 minutes) detected on edge proxies.
4. Cross-tenant data leakage or security isolation check failure detected during post-deploy smoke tests.
