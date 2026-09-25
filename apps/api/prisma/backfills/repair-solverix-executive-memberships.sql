-- Repair the duplicated development sales cohort without deleting historical users.
-- The Solverix cohort is canonical; legacy Visiblo sales memberships have no CRM activity.
BEGIN;

UPDATE "TenantMembership" AS membership
SET "employeeCode" = COALESCE(membership."employeeCode", "User"."employeeCode"),
    "designation" = COALESCE(membership."designation", role."name"),
    "department" = COALESCE(
      membership."department",
      CASE WHEN role."code" IN ('sales_manager', 'team_leader', 'field_executive') THEN 'Sales' END
    ),
    "updatedAt" = CURRENT_TIMESTAMP
FROM "User", "TenantRole" AS role
WHERE membership."userId" = "User"."id"
  AND membership."tenantRoleId" = role."id"
  AND membership."status" = 'ACTIVE'
  AND (
    membership."employeeCode" IS NULL
    OR membership."designation" IS NULL
    OR (
      role."code" IN ('sales_manager', 'team_leader', 'field_executive')
      AND membership."department" IS NULL
    )
  );

UPDATE "TenantMembership" AS membership
SET "status" = 'DEACTIVATED',
    "deactivatedAt" = CURRENT_TIMESTAMP,
    "updatedAt" = CURRENT_TIMESTAMP
FROM "User"
WHERE membership."userId" = "User"."id"
  AND membership."tenantId" = '13e8650b-cf97-453d-8676-60d770d403dc'
  AND "User"."email" IN (
    'ravi.kumar@visibloai.com',
    'sneha.iyer@visibloai.com',
    'vikram.singh@visibloai.com',
    'rahul.sharma@visibloai.com',
    'deepak.patel@visibloai.com'
  )
  AND membership."status" = 'ACTIVE';

COMMIT;
