# Phase 0.12 Rollback Strategy & Forward-Fix Protocol

## Executive Summary
This document specifies the rollback procedures, forward-fix protocols, and N-1 application compatibility guidelines for Phase 0 releases of the **Visiblo Smart Field Work** SaaS platform.

Because database migrations in Phase 0 are strictly additive, application rollback to version N-1 is supported without requiring immediate database restoration for zero-downtime operations.

---

## 1. Migration Compatibility Model

### A. Non-Destructive Additive Policy
- All 33 migrations in Phase 0 are **additive only** (new tables, columns, indexes, or nullable fields).
- No migration drops tables, renames existing production columns, or removes constraints in a breaking manner.
- **Implication**: Previous application version (N-1) can run safely against the current schema version (N) without failing due to missing columns or unhandled mandatory constraints.

### B. Application Compatibility Window (N / N-1)
- **API Server**: Version N-1 API instances can coexist with Version N database schema.
- **Worker Processes**: Version N-1 outbox workers process background jobs alongside Version N workers during rolling updates.
- **Frontend Assets**: Frontend SPA static assets are cached with immutable content hashes; old clients gracefully receive HTTP 400/403 errors if attempting deprecated endpoints rather than crashing.

---

## 2. Emergency Rollback Strategy

If a critical P0 runtime defect is detected post-deployment:

### Option 1: Fast Application Rollback (Preferred)
1. **Action**: Revert API and Web container image tags to previous release SHA (Version N-1).
2. **Database State**: Leave database schema intact (Version N). Additive tables and columns remain idle and ignored by Version N-1 code.
3. **Recovery Time**: < 2 minutes (Container deployment time).

### Option 2: Full Database & Application Point-in-Time Restore (High Severity Only)
*Use only if data corruption occurred or destructive database operations were executed.*
1. **Action**: Stop API server and worker containers to freeze database writes.
2. **Database Restore**: Restore PostgreSQL database from Pre-Deployment snapshot (`pg_restore`).
3. **Application Rollback**: Redeploy API, Worker, and Web containers to Version N-1 SHA.
4. **Post-Restore Verification**: Verify tenant data integrity and resume background worker loops.

---

## 3. Forward-Fix Protocol

For non-catastrophic edge cases or bug fixes identified in production:
1. **Policy**: Do NOT perform down-migrations or database restores for minor fixes.
2. **Forward Migration**: Append a new forward migration file (`202609..._fix_name`) to fix schema defects.
3. **Code Patch**: Deploy a patch release commit (Version N+1) following standard CI/CD deployment channels.
