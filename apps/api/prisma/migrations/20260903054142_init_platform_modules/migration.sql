-- CreateEnum
CREATE TYPE "PlatformModuleCategory" AS ENUM ('CORE', 'SALES', 'FIELD_OPS', 'AUTOMATION', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "PlatformModuleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'BETA', 'DEPRECATED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ModuleFeatureStatus" AS ENUM ('ACTIVE', 'BETA', 'DEPRECATED');

-- CreateTable
CREATE TABLE "PlatformModule" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "PlatformModuleCategory" NOT NULL DEFAULT 'CORE',
    "status" "PlatformModuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "isAddon" BOOLEAN NOT NULL DEFAULT false,
    "monthlyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "requiredBySystem" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleFeature" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "ModuleFeatureStatus" NOT NULL DEFAULT 'ACTIVE',
    "platformSupport" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleDependency" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "dependsOnModuleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModuleDependency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformModule_code_key" ON "PlatformModule"("code");

-- CreateIndex
CREATE INDEX "PlatformModule_status_idx" ON "PlatformModule"("status");

-- CreateIndex
CREATE INDEX "PlatformModule_category_idx" ON "PlatformModule"("category");

-- CreateIndex
CREATE INDEX "PlatformModule_displayOrder_idx" ON "PlatformModule"("displayOrder");

-- CreateIndex
CREATE INDEX "ModuleFeature_moduleId_idx" ON "ModuleFeature"("moduleId");

-- CreateIndex
CREATE INDEX "ModuleFeature_status_idx" ON "ModuleFeature"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleFeature_moduleId_code_key" ON "ModuleFeature"("moduleId", "code");

-- CreateIndex
CREATE INDEX "ModuleDependency_moduleId_idx" ON "ModuleDependency"("moduleId");

-- CreateIndex
CREATE INDEX "ModuleDependency_dependsOnModuleId_idx" ON "ModuleDependency"("dependsOnModuleId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleDependency_moduleId_dependsOnModuleId_key" ON "ModuleDependency"("moduleId", "dependsOnModuleId");

-- AddForeignKey
ALTER TABLE "ModuleFeature" ADD CONSTRAINT "ModuleFeature_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "PlatformModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleDependency" ADD CONSTRAINT "ModuleDependency_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "PlatformModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleDependency" ADD CONSTRAINT "ModuleDependency_dependsOnModuleId_fkey" FOREIGN KEY ("dependsOnModuleId") REFERENCES "PlatformModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
