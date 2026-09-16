# Phase 1.2 preflight repair

## Observed main

- Remote main: `96a92e91d6c7ff483e9593ebfbfb4facaf27453d` (fetched before edits).
- CI run `34977132723`: failed at Web Frontend Unit Tests, verified through the GitHub API.
- Repair branch: `fix/phase-1.1-business-api-regression`.

## Repairs

The Business list had replaced the Phase 1.1 authenticated Account service with fixtures and invented totals. It now uses `CrmBoundary -> useCrmQuery -> CrmService -> crmApi`, preserving the five KPI cards, filter toolbar, full-width table, status badges, portal row menus, status chart, source panel, and quick actions.

Status totals come from three bounded, independently authorized server queries with `limit=1`. The workspace total is their sum, never the displayed page length. These separate reads can observe concurrent changes at slightly different instants; they are dashboard indicators, not a transactional report. Monthly and source analytics retain neutral unavailable states. Import/export controls remain visible and disabled. Master filters reuse a compact form of `CrmLookup`; missing master definitions produce an unavailable selection without invented IDs.

The complete integration run also exposed two pre-existing commercial policy regressions from commits `8e3fe25` and `ca626ef`: draft auto-publication/Plan alias resolution and trial-seat bypass. Restored the previously frozen `SubscriptionPolicyService.select` rules: require an explicit published version of an active Plan, reject disabled trials, and enforce pinned trial-seat limits. Existing tests remain intact, with added assertions for disabled trials, rejected Plan IDs/codes, and unchanged draft status after rejection. No commercial migrations or frozen architecture documents were edited.

## Verification evidence

- Web TypeScript and production build passed; 31 frontend tests passed.
- Initial API unit run: 305 passed.
- Initial PostgreSQL run: 193 passed, 2 failed in subscription provisioning, identifying the policy regressions above.
- Final API verification after the policy repair is recorded in the Phase 1.2 implementation report before the Lead gate is opened.
- Existing Prisma schema validation, client generation, 34-migration test database deployment, and RBAC sync executed successfully.
- Browser selection and discovery returned no connected browser. No browser, responsive screenshot, or keyboard QA is claimed.
- CI defines no lint step; successful builds/tests do not constitute lint evidence.

No Phase 1.2 schema or API code may begin until the complete repaired baseline suite is green.
