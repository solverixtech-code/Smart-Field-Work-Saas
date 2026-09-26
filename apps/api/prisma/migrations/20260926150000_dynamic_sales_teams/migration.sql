ALTER TABLE "Team"
  ADD COLUMN "department" TEXT NOT NULL DEFAULT 'Sales',
  ADD COLUMN "region" TEXT,
  ADD COLUMN "teamType" TEXT NOT NULL DEFAULT 'Field Sales',
  ADD COLUMN "dealAssignment" TEXT NOT NULL DEFAULT 'Both Manual & Auto',
  ADD COLUMN "visibility" TEXT NOT NULL DEFAULT 'Private',
  ADD COLUMN "leaderMembershipId" TEXT;

CREATE INDEX "Team_leaderMembershipId_idx" ON "Team"("leaderMembershipId");

ALTER TABLE "Team"
  ADD CONSTRAINT "Team_leaderMembershipId_fkey"
  FOREIGN KEY ("leaderMembershipId") REFERENCES "TenantMembership"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
