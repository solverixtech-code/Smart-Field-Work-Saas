-- Add deal_stage to MasterDefinition contract check constraint
ALTER TABLE "MasterDefinition" DROP CONSTRAINT IF EXISTS "MasterDefinition_contract_check";

ALTER TABLE "MasterDefinition" ADD CONSTRAINT "MasterDefinition_contract_check" CHECK (
  code IN ('designation','contact_role','leave_type','followup_type','followup_outcome','demo_type',
    'task_activity_type','lead_source','lost_reason','visit_type','visit_reason','expense_category',
    'business_type','incentive_type','allowance_type','deduction_type','skill_set','document_type',
    'deal_priority','competitor_brand','demo_failure_reason','visit_objective','target_metric_type','target_type',
    'deal_stage')
  AND "valueType" = 'LABEL' AND "metadataSchema" = 'NONE' AND revision > 0 AND "displayOrder" >= 0
  AND length(trim(name)) BETWEEN 1 AND 200 AND length(trim(description)) BETWEEN 1 AND 2000
  AND ("moduleCode" IS NULL OR "moduleCode" IN ('core_crm','field_visits','attendance','payroll','demo_scheduler','order_management','whatsapp_automation','ai_copilot'))
  AND (code NOT IN ('target_metric_type','target_type') OR
    (NOT "allowTenantCreate" AND NOT "allowTenantEdit" AND NOT "allowTenantDeactivate" AND NOT "allowIndustryDefaults" AND "systemValuePolicy" = 'LOCKED_IDENTITY'))
);
