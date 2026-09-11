# Phase 0.12 Release & Production Deployment Checklist

## Executive Summary
This document provides the mandatory step-by-step procedures, environment verifications, deployment sequence, smoke tests, and rollback triggers for releasing Phase 0 to production for the **Visiblo Smart Field Work** SaaS platform.

---

## 1. Pre-Deployment Phase

### A. Code & Governance Verification
- [x] **Release Commit SHA**: Approved candidate SHA on `main`.
- [x] **CI Pipeline**: 100% green build and test suite run.
- [x] **Immutability Check**: 33 Prisma migrations verified (0 historical edits).

### B. Environment & Infrastructure Readiness
- [ ] **PostgreSQL Backup**: Complete binary dump of production database created (`pg_dump -Fc ...`).
- [ ] **Environment Secret Validation**:
  - `DATABASE_URL` (SSL mode enabled)
  - `JWT_SECRET` & `JWT_REFRESH_SECRET` (Minimum 64-char high-entropy string)
  - `CORS_ORIGIN` (Strict white-listed production domains, no wildcard `*`)
  - `S3_BUCKET`, `S3_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
  - `NODE_ENV=production`

---

## 2. Deployment Execution Sequence

### Step 1: Database Migration Deployment
Run database schema updates using the production deployment tool:
```bash
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```
*Expected output: `All migrations have been successfully applied.`*

### Step 2: Seed & System RBAC Synchronization
Run idempotent system role and permission synchronization:
```bash
cd apps/api && npm run db:sync:rbac
```
*Expected output: `RBAC synchronization complete. System roles & permissions verified.`*

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
