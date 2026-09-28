-- Repair environments where the dynamic user profile migration was recorded
-- before its columns were applied. This migration is safe on correct databases.
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "dateOfBirth" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "officeAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
