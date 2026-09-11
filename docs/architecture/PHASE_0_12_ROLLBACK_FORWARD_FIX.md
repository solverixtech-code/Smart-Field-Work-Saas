# Phase 0.12 Rollback Strategy & Forward-Fix Protocol

## Executive Summary
This document specifies the rollback procedures, forward-fix protocols, and N-1 application compatibility guidelines for Phase 0 releases of the **Visiblo Smart Field Work** SaaS platform.

This revision updates previous assumptions by analyzing the actual migration history, distinguishing schema-neutral documentation/rehearsal releases from historical structural schema modifications.

---

## 1. Migration History Analysis & Compatibility Model

### A. Real Historical Schema Changes
While the majority of Phase 0 migrations are additive (new tables, columns, indexes, or nullable fields), historical migration `20260903120000_remove_module_pricing_add_feature_registry_metadata` executed destructive column drops:
```sql
ALTER TABLE "PlatformModule" DROP COLUMN "isAddon";
ALTER TABLE "PlatformModule" DROP COLUMN "monthlyPrice";
```
- **Implication**: Historical application versions (prior to Phase 0.10) that rely on `PlatformModule.isAddon` or `PlatformModule.monthlyPrice` cannot run against the current database schema without code compatibility layers. Universal database-level N-1 compatibility is therefore NOT claimed across historical structural boundaries.

### B. Phase 0.12 Deployment Specifics
- The Phase 0.12 release itself contains **zero schema modifications** and zero database migrations.
- **Current Deployment Rollback**: Redeploying application binaries from Phase 0.12 back to Phase 0.11 baseline (`7d78999a3d352ef2124a36bcb401b5d2dd914091`) is 100% database-compatible because no database schema changes occurred in Phase 0.12.

---

## 2. Compatibility Matrix (Application N / Schema N)

| Subsystem | N-1 Application Compatibility | Notes / Constraints |
| :--- | :--- | :--- |
| **API Application** | **Compatible** for Phase 0.11 -> 0.12 | Additive tables allow N-1 binaries to read/write current schema |
| **Worker Subsystem** | **Compatible** for Phase 0.11 -> 0.12 | Outbox job schema (`BackgroundJob`) remains backward-compatible |
| **Web Frontend** | **Compatible** | SPA static assets are content-hashed; edge cache purges seamlessly |
| **Historical Schema** | **Incompatible** across `20260903120000` | Legacy `PlatformModule` columns dropped in earlier phase |

---

## 3. Emergency Rollback & Forward-Fix Protocol

### Strategy A: Application Binary Rollback (Phase 0.12 Deployment)
1. **Trigger**: P0 application runtime bug detected in Phase 0.12 release.
2. **Action**: Redeploy API, Worker, and Web container images to Phase 0.11 SHA (`7d78999a3d352ef2124a36bcb401b5d2dd914091`).
3. **Database Action**: None required. Schema remains unchanged.
4. **Recovery Time**: < 2 minutes.

### Strategy B: Full Database Restore (Data Corruption / Structural Defect)
1. **Trigger**: Catastrophic database corruption or unresolvable data integrity breach.
2. **Action**: Stop API and worker process traffic immediately.
3. **Database Action**: Restore PostgreSQL database from pre-deployment snapshot (`pg_restore`).
4. **Application Action**: Roll back application binaries to pre-deployment release SHA.

### Strategy C: Forward-Fix Protocol (Preferred for Minor Defects)
1. **Trigger**: Non-catastrophic edge case, UI defect, or minor logic bug.
2. **Policy**: Do NOT perform down-migrations or database restores.
3. **Action**: Create a forward fix patch, commit to a hotfix branch, run full CI validation, and deploy forward as Version N+1.
