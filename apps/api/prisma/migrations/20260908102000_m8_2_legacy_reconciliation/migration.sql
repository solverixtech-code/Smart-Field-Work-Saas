-- Retain legacy data; mapping never derives ownership from isSystemDefault.
CREATE TABLE "MasterLegacyReconciliation" (
  "legacyRecordId" TEXT PRIMARY KEY REFERENCES "MasterRecord"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  "masterValueId" TEXT NOT NULL REFERENCES "MasterValue"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  "mappingHash" TEXT NOT NULL CHECK ("mappingHash" ~ '^[a-f0-9]{64}$'),
  "actorUserId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "MasterLegacyReconciliation_masterValueId_key" ON "MasterLegacyReconciliation"("masterValueId");
CREATE FUNCTION m8_legacy_mapping_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'MASTER_LEGACY_MAPPING_IMMUTABLE' USING ERRCODE='23514';
END $$;
CREATE TRIGGER "M8_legacy_mapping_immutable" BEFORE UPDATE OR DELETE ON "MasterLegacyReconciliation" FOR EACH ROW EXECUTE FUNCTION m8_legacy_mapping_immutable();
