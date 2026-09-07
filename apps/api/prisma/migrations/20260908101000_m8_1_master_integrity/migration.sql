-- Additive Master invariants. No historical migration, M7 JSON, or commercial FK is rewritten.
ALTER TABLE "MasterDefinition" ADD CONSTRAINT "MasterDefinition_contract_check" CHECK (
  code IN ('designation','contact_role','leave_type','followup_type','followup_outcome','demo_type',
    'task_activity_type','lead_source','lost_reason','visit_type','visit_reason','expense_category',
    'business_type','incentive_type','allowance_type','deduction_type','skill_set','document_type',
    'deal_priority','competitor_brand','demo_failure_reason','visit_objective','target_metric_type','target_type')
  AND "valueType" = 'LABEL' AND "metadataSchema" = 'NONE' AND revision > 0 AND "displayOrder" >= 0
  AND length(trim(name)) BETWEEN 1 AND 200 AND length(trim(description)) BETWEEN 1 AND 2000
  AND ("moduleCode" IS NULL OR "moduleCode" IN ('core_crm','field_visits','attendance','payroll','demo_scheduler','order_management','whatsapp_automation','ai_copilot'))
  AND (code NOT IN ('target_metric_type','target_type') OR
    (NOT "allowTenantCreate" AND NOT "allowTenantEdit" AND NOT "allowTenantDeactivate" AND NOT "allowIndustryDefaults" AND "systemValuePolicy" = 'LOCKED_IDENTITY'))
);
ALTER TABLE "MasterValue" ADD CONSTRAINT "MasterValue_scope_check" CHECK (
  (source = 'SYSTEM' AND "tenantId" IS NULL AND "industryTemplateVersionId" IS NULL)
  OR (source = 'INDUSTRY' AND "tenantId" IS NULL AND "industryTemplateVersionId" IS NOT NULL)
  OR (source = 'TENANT' AND "tenantId" IS NOT NULL AND "industryTemplateVersionId" IS NULL)
);
ALTER TABLE "MasterValue" ADD CONSTRAINT "MasterValue_label_check" CHECK (
  code ~ '^[A-Z][A-Z0-9_]{1,63}$' AND length(trim(name)) BETWEEN 1 AND 200
  AND (description IS NULL OR length(description) <= 2000)
  AND ("displayColor" IS NULL OR "displayColor" ~ '^#[0-9a-fA-F]{6}$') AND "sortOrder" >= 0 AND revision > 0
);
ALTER TABLE "MasterValueOverride" ADD CONSTRAINT "MasterOverride_scope_check" CHECK (
  (scope = 'INDUSTRY' AND "tenantId" IS NULL AND "industryTemplateVersionId" IS NOT NULL)
  OR (scope = 'TENANT' AND "tenantId" IS NOT NULL AND "industryTemplateVersionId" IS NULL)
);
ALTER TABLE "MasterValueOverride" ADD CONSTRAINT "MasterOverride_label_check" CHECK (
  ("displayName" IS NULL OR length(trim("displayName")) BETWEEN 1 AND 200)
  AND ("displayColor" IS NULL OR "displayColor" ~ '^#[0-9a-fA-F]{6}$')
  AND ("sortOrder" IS NULL OR "sortOrder" >= 0) AND revision > 0
);
CREATE UNIQUE INDEX "MasterValue_system_code" ON "MasterValue" ("definitionId", code) WHERE source = 'SYSTEM';
CREATE UNIQUE INDEX "MasterValue_industry_code" ON "MasterValue" ("industryTemplateVersionId", "definitionId", code) WHERE source = 'INDUSTRY';
CREATE UNIQUE INDEX "MasterValue_tenant_code" ON "MasterValue" ("tenantId", "definitionId", code) WHERE source = 'TENANT';
CREATE UNIQUE INDEX "MasterOverride_industry_identity" ON "MasterValueOverride" ("industryTemplateVersionId", "inheritedMasterValueId") WHERE scope = 'INDUSTRY';
CREATE UNIQUE INDEX "MasterOverride_tenant_identity" ON "MasterValueOverride" ("tenantId", "inheritedMasterValueId") WHERE scope = 'TENANT';

CREATE FUNCTION m8_definition_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'MASTER_IDENTITY_RETAINED' USING ERRCODE = '23514'; END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.revision <> 1 THEN RAISE EXCEPTION 'MASTER_INITIAL_REVISION' USING ERRCODE = '23514'; END IF;
  ELSIF NEW.id <> OLD.id OR NEW.code <> OLD.code OR NEW."createdAt" <> OLD."createdAt" OR NEW.revision <> OLD.revision + 1 THEN
    RAISE EXCEPTION 'MASTER_IDENTITY_OR_REVISION' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "M8_definition_guard" BEFORE INSERT OR UPDATE OR DELETE ON "MasterDefinition" FOR EACH ROW EXECUTE FUNCTION m8_definition_guard();

-- Same Industry parent/version locks as frozen M7 publication. Reload after acquiring them.
CREATE FUNCTION m8_lock_draft(version_id text) RETURNS void LANGUAGE plpgsql AS $$
DECLARE parent_status "IndustryTemplateStatus"; version_status "IndustryTemplateVersionStatus";
BEGIN
  SELECT t.status INTO parent_status FROM "IndustryTemplate" t JOIN "IndustryTemplateVersion" v ON v."industryTemplateId"=t.id
    WHERE v.id=version_id FOR UPDATE OF t;
  SELECT status INTO version_status FROM "IndustryTemplateVersion" WHERE id=version_id FOR UPDATE;
  IF version_status IS DISTINCT FROM 'DRAFT' OR parent_status = 'ARCHIVED' THEN
    RAISE EXCEPTION 'MASTER_INDUSTRY_VERSION_IMMUTABLE' USING ERRCODE = '23514';
  END IF;
END $$;
CREATE FUNCTION m8_lock_tenant(tenant_id text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(hashtextextended('industry-assignment:' || tenant_id, 0));
  PERFORM id FROM "Tenant" WHERE id=tenant_id FOR UPDATE;
END $$;

CREATE FUNCTION m8_value_guard() RETURNS trigger LANGUAGE plpgsql AS $$
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
  IF d."systemValuePolicy"='LOCKED_IDENTITY' AND TG_OP='INSERT' AND NOT (
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
CREATE TRIGGER "M8_value_guard" BEFORE INSERT OR UPDATE OR DELETE ON "MasterValue" FOR EACH ROW EXECUTE FUNCTION m8_value_guard();

CREATE FUNCTION m8_override_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE row_data "MasterValueOverride"; inherited record; d record; pin text;
BEGIN
  IF TG_OP='DELETE' THEN row_data:=OLD; ELSE row_data:=NEW; END IF;
  IF TG_OP='UPDATE' AND (NEW.id<>OLD.id OR NEW."inheritedMasterValueId"<>OLD."inheritedMasterValueId" OR NEW.scope<>OLD.scope
    OR NEW."tenantId" IS DISTINCT FROM OLD."tenantId" OR NEW."industryTemplateVersionId" IS DISTINCT FROM OLD."industryTemplateVersionId"
    OR NEW."createdAt"<>OLD."createdAt" OR NEW."createdByUserId" IS DISTINCT FROM OLD."createdByUserId" OR NEW.revision<>OLD.revision+1) THEN
    RAISE EXCEPTION 'MASTER_OVERRIDE_IDENTITY_OR_REVISION' USING ERRCODE='23514';
  END IF;
  IF TG_OP='INSERT' AND NEW.revision<>1 THEN RAISE EXCEPTION 'MASTER_INITIAL_REVISION' USING ERRCODE='23514'; END IF;
  IF row_data.scope='INDUSTRY' THEN PERFORM m8_lock_draft(row_data."industryTemplateVersionId");
  ELSE
    PERFORM m8_lock_tenant(row_data."tenantId");
    SELECT "industryTemplateVersionId" INTO pin FROM "TenantIndustryTemplateAssignment" WHERE "tenantId"=row_data."tenantId";
  END IF;
  SELECT id, "definitionId", source, "industryTemplateVersionId" INTO inherited FROM "MasterValue" WHERE id=row_data."inheritedMasterValueId";
  SELECT id, status, "systemValuePolicy", "allowIndustryDefaults", "allowTenantEdit", "allowTenantDeactivate"
    INTO d FROM "MasterDefinition" WHERE id=inherited."definitionId" FOR UPDATE;
  IF inherited.id IS NULL OR inherited.source='TENANT' OR (inherited.source='INDUSTRY' AND
    (row_data.scope<>'TENANT' OR inherited."industryTemplateVersionId" IS DISTINCT FROM pin)) THEN
    RAISE EXCEPTION 'MASTER_OVERRIDE_ANCESTRY' USING ERRCODE='23514';
  END IF;
  -- Removing a Tenant override always restores inheritance, including after policy tightening.
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  IF d.status<>'ACTIVE' OR d."systemValuePolicy"='LOCKED_IDENTITY' THEN RAISE EXCEPTION 'MASTER_OVERRIDE_POLICY' USING ERRCODE='23514'; END IF;
  IF row_data.scope='INDUSTRY' AND NOT d."allowIndustryDefaults" THEN RAISE EXCEPTION 'MASTER_INDUSTRY_POLICY' USING ERRCODE='23514'; END IF;
  IF row_data.scope='TENANT' THEN
    IF NOT d."allowTenantEdit" AND (row_data."displayName" IS NOT NULL OR row_data."displayColor" IS NOT NULL OR row_data."sortOrder" IS NOT NULL) THEN
      RAISE EXCEPTION 'MASTER_TENANT_EDIT_POLICY' USING ERRCODE='23514';
    END IF;
    IF NOT d."allowTenantDeactivate" AND (row_data."isHidden" OR EXISTS (SELECT 1 FROM "MasterValueOverride" o WHERE o."inheritedMasterValueId"=inherited.id AND o.scope='INDUSTRY' AND o."industryTemplateVersionId"=pin AND o."isHidden")) THEN
      RAISE EXCEPTION 'MASTER_TENANT_HIDE_POLICY' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "M8_override_guard" BEFORE INSERT OR UPDATE OR DELETE ON "MasterValueOverride" FOR EACH ROW EXECUTE FUNCTION m8_override_guard();

-- Runs after M7's BEFORE guard (trigger name ordering); does not replace frozen migration semantics.
CREATE FUNCTION m8_assignment_compatibility() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM m8_lock_tenant(NEW."tenantId");
  -- Lock definitions canonically. System/child writers use the same rows before collision checks.
  PERFORM id FROM "MasterDefinition" ORDER BY id FOR UPDATE;
  IF EXISTS (SELECT 1 FROM "MasterValueOverride" o JOIN "MasterValue" v ON v.id=o."inheritedMasterValueId"
    WHERE o.scope='TENANT' AND o."tenantId"=NEW."tenantId" AND v.source='INDUSTRY'
    AND v."industryTemplateVersionId"<>NEW."industryTemplateVersionId") THEN
    RAISE EXCEPTION 'MASTER_OVERRIDE_RECONCILIATION_REQUIRED' USING ERRCODE='23514';
  END IF;
  IF EXISTS (SELECT 1 FROM "MasterValue" t JOIN "MasterValue" i ON i."definitionId"=t."definitionId" AND i.code=t.code
    WHERE t.source='TENANT' AND t."tenantId"=NEW."tenantId" AND i.source='INDUSTRY' AND i."industryTemplateVersionId"=NEW."industryTemplateVersionId") THEN
    RAISE EXCEPTION 'MASTER_INHERITED_CODE_COLLISION' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER "M8_assignment_compatibility" BEFORE INSERT OR UPDATE ON "TenantIndustryTemplateAssignment" FOR EACH ROW EXECUTE FUNCTION m8_assignment_compatibility();
