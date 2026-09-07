-- CHECK expressions must reject NULL explicitly (SQL unknown otherwise passes).
ALTER TABLE "IndustryTemplateVersion" ADD CONSTRAINT "IndustryVersion_approval_required"
  CHECK (status <> 'PUBLISHED' OR "approvalReference" IS NOT NULL);
