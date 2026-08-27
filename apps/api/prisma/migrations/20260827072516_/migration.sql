-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'PLATFORM_SUPER_ADMIN';
ALTER TYPE "Role" ADD VALUE 'PLATFORM_OPERATIONS_ADMIN';
ALTER TYPE "Role" ADD VALUE 'PLATFORM_ONBOARDING';
ALTER TYPE "Role" ADD VALUE 'PLATFORM_SUPPORT';
ALTER TYPE "Role" ADD VALUE 'PLATFORM_BILLING';
ALTER TYPE "Role" ADD VALUE 'PLATFORM_AUDITOR';
