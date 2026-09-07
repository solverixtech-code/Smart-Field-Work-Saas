-- Presentation locking is independent of extension flags on ordinary definitions.
-- Only the two owner-approved closed target catalogs restrict the code vocabulary.
CREATE OR REPLACE FUNCTION m8_value_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE d record; pin text;
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.source = 'INDUSTRY' THEN PERFORM m8_lock_draft(OLD."industryTemplateVersionId"); END IF;
    RAISE EXCEPTION 'MASTER_VALUE_RETAINED' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'UPDATE' AND (NEW.id <> OLD.id OR NEW."definitionId" <> OLD."definitionId" OR NEW.code <> OLD.code
    OR NEW.source <> OLD.source OR NEW."tenantId" IS DISTINCT FROM OLD."tenantId"
    OR NEW."industryTemplateVersionId" IS DISTINCT FROM OLD."industryTemplateVersionId"
    OR NEW."createdAt" <> OLD."createdAt" OR NEW."createdByUserId" IS DISTINCT FROM OLD."createdByUserId"
    OR NEW.revision <> OLD.revision + 1) THEN
    RAISE EXCEPTION 'MASTER_IDENTITY_OR_REVISION' USING ERRCODE = '23514';
  END IF;
  IF TG_OP = 'INSERT' AND NEW.revision <> 1 THEN RAISE EXCEPTION 'MASTER_INITIAL_REVISION' USING ERRCODE = '23514'; END IF;
  IF NEW.source = 'TENANT' THEN
    PERFORM m8_lock_tenant(NEW."tenantId");
    SELECT "industryTemplateVersionId" INTO pin FROM "TenantIndustryTemplateAssignment" WHERE "tenantId"=NEW."tenantId";
  ELSIF NEW.source = 'INDUSTRY' THEN PERFORM m8_lock_draft(NEW."industryTemplateVersionId"); END IF;
  -- Symmetric lock for System/Industry/Tenant insertion and reverse collisions, across API and SQL.
  SELECT id, code, status, "allowIndustryDefaults", "allowTenantCreate", "allowTenantEdit", "allowTenantDeactivate", "systemValuePolicy"
    INTO d FROM "MasterDefinition" WHERE id=NEW."definitionId" FOR UPDATE;
  IF d.id IS NULL OR d.status <> 'ACTIVE' THEN RAISE EXCEPTION 'MASTER_DEFINITION_UNAVAILABLE' USING ERRCODE = '23514'; END IF;
  IF NEW.source = 'INDUSTRY' AND NOT d."allowIndustryDefaults" THEN RAISE EXCEPTION 'MASTER_INDUSTRY_POLICY' USING ERRCODE = '23514'; END IF;
  IF NEW.source = 'TENANT' THEN
    IF TG_OP = 'INSERT' AND NOT d."allowTenantCreate" THEN RAISE EXCEPTION 'MASTER_TENANT_CREATE_POLICY' USING ERRCODE = '23514'; END IF;
    IF TG_OP = 'UPDATE' THEN
      IF NOT d."allowTenantEdit" AND (NEW.name <> OLD.name OR NEW.description IS DISTINCT FROM OLD.description OR NEW."displayColor" IS DISTINCT FROM OLD."displayColor" OR NEW."sortOrder" <> OLD."sortOrder") THEN
        RAISE EXCEPTION 'MASTER_TENANT_EDIT_POLICY' USING ERRCODE = '23514';
      END IF;
      IF NOT d."allowTenantDeactivate" AND NEW."isActive" <> OLD."isActive" THEN RAISE EXCEPTION 'MASTER_TENANT_HIDE_POLICY' USING ERRCODE = '23514'; END IF;
    END IF;
  END IF;
  IF d.code IN ('target_metric_type','target_type') AND TG_OP='INSERT' AND NOT (
    (d.code='target_metric_type' AND NEW.code IN ('VISITS_COUNT','DEMOS_COUNT'))
    OR (d.code='target_type' AND NEW.code IN ('TEAM_SCOPE','INDIVIDUAL_SCOPE','TERRITORY_SCOPE'))
  ) THEN RAISE EXCEPTION 'MASTER_CLOSED_CATALOG' USING ERRCODE = '23514'; END IF;
  IF EXISTS (SELECT 1 FROM "MasterValue" v WHERE v.id<>NEW.id AND v."definitionId"=NEW."definitionId" AND v.code=NEW.code AND (
    NEW.source='SYSTEM' OR v.source='SYSTEM'
    OR (NEW.source='TENANT' AND v.source='INDUSTRY' AND v."industryTemplateVersionId"=pin)
    OR (NEW.source='INDUSTRY' AND v.source='TENANT' AND EXISTS (SELECT 1 FROM "TenantIndustryTemplateAssignment" a WHERE a."tenantId"=v."tenantId" AND a."industryTemplateVersionId"=NEW."industryTemplateVersionId"))
  )) THEN RAISE EXCEPTION 'MASTER_INHERITED_CODE_COLLISION' USING ERRCODE = '23514'; END IF;
  RETURN NEW;
END $$;

