-- TRUNCATE does not execute row invalidation triggers. Reject it on runtime
-- authority tables; explicit scoped DELETE retains normal frozen row semantics.
CREATE FUNCTION m9_reject_truncate() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'RUNTIME_TRUNCATE_UNSUPPORTED' USING ERRCODE='23514'; END $$;
CREATE TRIGGER m9_epoch_no_truncate BEFORE TRUNCATE ON "RuntimeConfigEpoch" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_module_no_truncate BEFORE TRUNCATE ON "PlatformModule" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_permission_no_truncate BEFORE TRUNCATE ON "Permission" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_tenant_no_truncate BEFORE TRUNCATE ON "Tenant" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_settings_no_truncate BEFORE TRUNCATE ON "TenantSettings" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_membership_no_truncate BEFORE TRUNCATE ON "TenantMembership" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_role_no_truncate BEFORE TRUNCATE ON "TenantRole" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_grant_no_truncate BEFORE TRUNCATE ON "TenantRolePermission" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_assignment_no_truncate BEFORE TRUNCATE ON "TenantIndustryTemplateAssignment" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_industry_no_truncate BEFORE TRUNCATE ON "IndustryTemplateVersion" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_master_definition_no_truncate BEFORE TRUNCATE ON "MasterDefinition" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_master_value_no_truncate BEFORE TRUNCATE ON "MasterValue" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
CREATE TRIGGER m9_master_override_no_truncate BEFORE TRUNCATE ON "MasterValueOverride" FOR EACH STATEMENT EXECUTE FUNCTION m9_reject_truncate();
