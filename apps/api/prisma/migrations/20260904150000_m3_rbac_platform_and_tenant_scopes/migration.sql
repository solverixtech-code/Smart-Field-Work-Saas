-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('PLATFORM', 'TENANT');

-- AlterTable Permission
ALTER TABLE "Permission" ADD COLUMN "code" TEXT,
ADD COLUMN "scope" "PermissionScope",
ADD COLUMN "domain" TEXT,
ADD COLUMN "resource" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "registryVersion" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");
CREATE INDEX "Permission_scope_idx" ON "Permission"("scope");

-- AlterTable PlatformRole
ALTER TABLE "PlatformRole" ADD COLUMN "permissionsVersion" INTEGER NOT NULL DEFAULT 1;

-- CreateTable PlatformRolePermission
CREATE TABLE "PlatformRolePermission" (
    "id" TEXT NOT NULL,
    "platformRoleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlatformRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformRolePermission_platformRoleId_idx" ON "PlatformRolePermission"("platformRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformRolePermission_platformRoleId_permissionId_key" ON "PlatformRolePermission"("platformRoleId", "permissionId");

-- AddForeignKey
ALTER TABLE "PlatformRolePermission" ADD CONSTRAINT "PlatformRolePermission_platformRoleId_fkey" FOREIGN KEY ("platformRoleId") REFERENCES "PlatformRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformRolePermission" ADD CONSTRAINT "PlatformRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
