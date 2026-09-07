-- Migration: 20260907120000_m5_2_trigger_hardening
-- Description: Hardens PlanVersion immutability triggers to block identity field mutations during publication transition and return OLD on draft deletion.

CREATE OR REPLACE FUNCTION prevent_published_plan_version_modification()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF OLD.status = 'PUBLISHED' OR OLD."publishedAt" IS NOT NULL THEN
            RAISE EXCEPTION 'Immutable error: Published PlanVersion % cannot be deleted.', OLD.id;
        END IF;
        RETURN OLD;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Block any modification of a version that is already published
        IF OLD.status = 'PUBLISHED' OR OLD."publishedAt" IS NOT NULL THEN
            RAISE EXCEPTION 'Immutable error: Published PlanVersion % cannot be updated.', OLD.id;
        END IF;

        -- Allow publishing transition: DRAFT -> PUBLISHED while ensuring identity fields (id, planId, version) remain strictly locked
        IF OLD.status = 'DRAFT' AND NEW.status = 'PUBLISHED' THEN
            IF NEW.id <> OLD.id OR NEW."planId" <> OLD."planId" OR NEW.version <> OLD.version THEN
                RAISE EXCEPTION 'Immutable error: Cannot alter core identity fields (id, planId, version) during publication of PlanVersion %.', OLD.id;
            END IF;
            RETURN NEW;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
