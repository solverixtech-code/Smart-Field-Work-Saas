-- Module commercial pricing is owned by Plans, never by capability modules.
ALTER TABLE "PlatformModule" DROP COLUMN "isAddon";
ALTER TABLE "PlatformModule" DROP COLUMN "monthlyPrice";
ALTER TABLE "PlatformModule" ADD COLUMN "internalNotes" TEXT;

-- Features are code-owned capabilities with immutable implementation keys.
ALTER TABLE "ModuleFeature" ADD COLUMN "implementationKey" TEXT;
ALTER TABLE "ModuleFeature" ADD COLUMN "supportsWeb" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ModuleFeature" ADD COLUMN "supportsMobile" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ModuleFeature" ADD COLUMN "supportsApi" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ModuleFeature" ADD COLUMN "supportsOffline" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ModuleFeature" ADD COLUMN "internalNotes" TEXT;

UPDATE "ModuleFeature" feature
SET "implementationKey" = module."code" || '.' || feature."code"
FROM "PlatformModule" module
WHERE feature."moduleId" = module."id";

ALTER TABLE "ModuleFeature" ALTER COLUMN "implementationKey" SET NOT NULL;
CREATE UNIQUE INDEX "ModuleFeature_implementationKey_key" ON "ModuleFeature"("implementationKey");
