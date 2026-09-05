-- AlterTable PlanPricing
ALTER TABLE "PlanPricing" ADD COLUMN IF NOT EXISTS "model" "PricingModel" NOT NULL DEFAULT 'PER_USER';

-- Trigger to protect Plan.currentPublishedVersionId pointer invariant:
-- must belong to the same Plan and must be PUBLISHED.
CREATE OR REPLACE FUNCTION check_plan_current_published_version_pointer()
RETURNS TRIGGER AS $$
DECLARE
    ver_plan_id TEXT;
    ver_status "PlanVersionStatus";
BEGIN
    IF NEW."currentPublishedVersionId" IS NOT NULL THEN
        SELECT "planId", "status" INTO ver_plan_id, ver_status
        FROM "PlanVersion"
        WHERE id = NEW."currentPublishedVersionId";

        IF ver_plan_id IS NULL THEN
            RAISE EXCEPTION 'Invariant violation: PlanVersion % does not exist.', NEW."currentPublishedVersionId";
        END IF;

        IF ver_plan_id <> NEW.id THEN
            RAISE EXCEPTION 'Invariant violation: PlanVersion % belongs to Plan % but current Plan is %.', NEW."currentPublishedVersionId", ver_plan_id, NEW.id;
        END IF;

        IF ver_status <> 'PUBLISHED' THEN
            RAISE EXCEPTION 'Invariant violation: PlanVersion % status is % but must be PUBLISHED.', NEW."currentPublishedVersionId", ver_status;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_plan_current_published_version_pointer ON "Plan";

CREATE TRIGGER enforce_plan_current_published_version_pointer
BEFORE INSERT OR UPDATE ON "Plan"
FOR EACH ROW
EXECUTE FUNCTION check_plan_current_published_version_pointer();
