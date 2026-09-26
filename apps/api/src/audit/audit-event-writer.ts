import { Prisma } from "@prisma/client";
import { redact, REDACTION_VERSION } from "../observability/redaction";
import { requestContext } from "../observability/request-context";

const catalog = {
  CRM: [
    "lead.created",
    "lead.updated",
    "lead.deleted",
    "lead.assigned",
    "lead.converted",
    "account.created",
    "account.updated",
    "account.deleted",
    "account.owner.changed",
    "account.primary_contact.changed",
    "contact.created",
    "contact.updated",
    "contact.deleted",
    "contact.owner.changed",
    "opportunity.created",
    "opportunity.updated",
    "opportunity.stage_changed",
    "opportunity.deleted",
    "team.created",
    "team.updated",
    "team.leader.changed",
    "team.members.assigned",
    "team.member.removed",
    "territory.created",
    "territory.updated",
    "territory.deleted",
    "territory.member.assigned",
    "territory.member.unassigned",
    "territory.business.assigned",
    "territory.business.unassigned",
    "territory.target.updated",
    "visit.scheduled",
  ],
  AUTH: [
    "LOGIN_FAILURE",
    "LOGIN_SUCCESS",
    "OTP_FAILURE",
    "OTP_REQUESTED",
    "MEMBERSHIP_SELECTED",
    "LOGOUT",
    "FORGOT_PASSWORD_IGNORED",
    "FORGOT_PASSWORD_REQUESTED",
    "PASSWORD_RESET",
    "CHANGE_PASSWORD_FAILURE",
    "PASSWORD_CHANGED",
    "PROFILE_UPDATED",
    "AVATAR_UPLOADED",
    "SESSION_REVOKED",
    "ALL_OTHER_SESSIONS_REVOKED",
  ],
  CATALOG: [
    "MODULE_UPDATED",
    "MODULE_ARCHIVED",
    "MODULE_RESTORED",
    "FEATURE_METADATA_UPDATED",
    "FEATURE_DEPRECATED",
    "PLATFORM_CATALOG_SYNCHRONIZED",
  ],
  PLAN: [
    "PLAN_CREATED",
    "PLAN_METADATA_UPDATED",
    "PLAN_DRAFT_CREATED",
    "PLAN_DRAFT_UPDATED",
    "PLAN_VERSION_PUBLISHED",
    "PLAN_ARCHIVED",
  ],
  INDUSTRY: [
    "INDUSTRY_CREATED",
    "INDUSTRY_METADATA_UPDATED",
    "INDUSTRY_DRAFT_CREATED",
    "INDUSTRY_DRAFT_UPDATED",
    "INDUSTRY_PUBLISHED",
    "INDUSTRY_ARCHIVED",
    "INDUSTRY_CANDIDATE_IMPORTED",
    "industry.assignment.changed",
  ],
  MASTER: [
    "master.definition.update",
    "master.value.create",
    "master.value.update",
    "master.override.set",
    "master.override.remove",
    "master.seed.apply",
    "master.legacy.reconcile",
  ],
  SUBSCRIPTION: ["subscription.created", "subscription.changed"],
  PROVISIONING: ["tenant.provisioned", "tenant.invitation.accepted"],
  RBAC: [
    "rbac.platform.grant",
    "rbac.platform.revoke",
    "rbac.tenant.grant",
    "rbac.tenant.revoke",
    "rbac.tenant.role.create",
    "rbac.tenant.role.update",
    "rbac.tenant.role.duplicate",
    "rbac.tenant.permissions.update",
    "rbac.platform.assignment",
    "rbac.membership.changed",
  ],
  MEDIA: [
    "media.upload.intent",
    "media.upload.completed",
    "media.upload.failed",
    "media.delete.requested",
    "media.deleted",
  ],
  JOB: ["job.manual.retry"],
  NOTIFICATION: ["notification.settings.changed"],
} as const;
const eventCategories = new Map<string, string>();
for (const [category, events] of Object.entries(catalog))
  for (const event of events) eventCategories.set(event, category);
export interface AuditEventInput {
  readonly action: string;
  readonly scope: "TENANT" | "PLATFORM" | "SYSTEM";
  readonly tenantId?: string | null;
  readonly actorUserId?: string | null;
  readonly tenantMembershipId?: string | null;
  readonly entityType?: string | null;
  readonly entityId?: string | null;
  readonly outcome?: "SUCCESS" | "FAILURE" | "DENIED";
  readonly beforeJson?: unknown;
  readonly afterJson?: unknown;
  readonly metadata?: unknown;
  readonly ip?: string | null;
  readonly userAgent?: string | null;
  readonly sessionId?: string | null;
}

/** Stateless central writer. The caller supplies its transaction, never an independent commit. */
export class AuditEventWriter {
  async write(
    db: Pick<Prisma.TransactionClient, "auditLog">,
    input: AuditEventInput,
  ) {
    const category = eventCategories.get(input.action);
    if (!category) throw new Error("AUDIT_UNREGISTERED_EVENT");
    if ((input.scope === "TENANT") !== Boolean(input.tenantId))
      throw new Error("AUDIT_SCOPE_MISMATCH");
    const context = requestContext.current();
    // Frozen services pass a trusted command actor, not request-body data. Ambient
    // diagnostic context must not override an independent command's authority.
    const actorUserId = input.actorUserId ?? context?.actorUserId ?? null;
    const membership =
      input.tenantMembershipId ??
      (input.tenantId &&
      input.tenantId === context?.tenantId &&
      actorUserId === context.actorUserId
        ? context.membershipId
        : null);
    // Enforce the same aggregate byte/node bound across all three payload fields.
    redact({
      beforeJson: input.beforeJson,
      afterJson: input.afterJson,
      metadata: input.metadata,
    });
    const json = (value: unknown) => {
      const safe = redact(value);
      return safe === null ? Prisma.JsonNull : safe;
    };
    return db.auditLog.create({
      data: {
        schemaVersion: 2,
        redactionVersion: REDACTION_VERSION,
        scope: input.scope,
        createdAt: new Date(),
        action: input.action,
        eventCode: input.action,
        category,
        outcome:
          input.outcome ??
          (input.action.endsWith("_FAILURE") ? "FAILURE" : "SUCCESS"),
        actorUserId,
        actorType: actorUserId
          ? "USER"
          : category === "AUTH"
            ? "ANONYMOUS"
            : "SYSTEM",
        tenantId: input.tenantId ?? null,
        tenantMembershipId: membership,
        entityType: input.entityType,
        entityId: input.entityId,
        requestId: context?.requestId,
        correlationId: context?.correlationId,
        originRequestId: context?.originRequestId,
        beforeJson: json(input.beforeJson),
        afterJson: json(input.afterJson),
        metadata: json(input.metadata),
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        sessionId: input.sessionId ?? null,
      },
      select: { id: true },
    });
  }
}
export const auditEvents = new AuditEventWriter();
