import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../persistence/prisma.service";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { EffectivePermissionService } from "../common/security/effective-permission.service";
import { readEffectiveModules } from "../platform/modules/effective-modules";
import { EffectiveMasterService } from "../platform/masters/effective-master.service";
import { auditEvents } from "../audit/audit-event-writer";
import { CrmPolicy } from "./crm-policy";
import {
  accountSelect,
  contactSelect,
  AccountRow,
  ContactRow,
} from "./crm-select";

interface CrmAuditMetadata {
  lifecycle?: string;
  assignedBefore?: string | null;
  assignedAfter?: string | null;
  conversionCommandId?: string;
  contactId?: string | null;
  revisionBefore?: number;
  revisionAfter?: number;
  changedFields?: string[];
  status?: "ACTIVE" | "INACTIVE" | "BLOCKED";
  accountId?: string | null;
  ownerMembershipId?: string | null;
  ownerBefore?: string | null;
  ownerAfter?: string;
  primaryContactId?: string;
  primaryBefore?: string | null;
  primaryAfter?: string | null;
}
type CrmAuditAction =
  | "account.created"
  | "account.updated"
  | "account.deleted"
  | "account.owner.changed"
  | "account.primary_contact.changed"
  | "contact.created"
  | "contact.updated"
  | "contact.deleted"
  | "contact.owner.changed"
  | "lead.created"
  | "lead.updated"
  | "lead.deleted"
  | "lead.assigned"
  | "lead.converted";

export const crmConflict = (code: string): never => {
  throw new ConflictException({
    statusCode: 409,
    error: "Conflict",
    message: code,
    code,
  });
};
@Injectable()
export class CrmRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly permissions: EffectivePermissionService,
    readonly masters: EffectiveMasterService,
  ) {}
  async run<T>(
    principal: RequestPrincipal,
    write: boolean,
    work: (tx: Prisma.TransactionClient, policy: CrmPolicy) => Promise<T>,
  ): Promise<T> {
    const trusted = new CrmPolicy(principal);
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          // Lock membership and tenant against concurrent suspension while a write is authorized.
          if (write) {
            await tx.$queryRaw`SELECT m8_lock_tenant(${trusted.scope.tenantId})::text`;
            await tx.$queryRaw`SELECT id FROM "TenantMembership" WHERE id=${trusted.scope.membershipId} AND "tenantId"=${trusted.scope.tenantId} FOR SHARE`;
            // The M8 tenant lock must precede membership locks and Master definition locks.
            await tx.$queryRaw`SELECT id FROM "MasterDefinition" WHERE code IN ('business_type','lead_source','contact_role') ORDER BY id FOR SHARE`;
          }
          const membership = await tx.tenantMembership.findFirst({
            where: {
              id: trusted.scope.membershipId,
              tenantId: trusted.scope.tenantId,
              userId: principal.userId,
              status: "ACTIVE",
              tenant: { status: "ACTIVE" },
            },
            select: { id: true },
          });
          if (!membership)
            throw new ForbiddenException("CRM_MEMBERSHIP_REQUIRED");
          const tenantPermissions =
            await this.permissions.resolveTenantPermissions(
              trusted.scope.tenantId,
              trusted.scope.membershipId,
              tx,
            );
          const policy = new CrmPolicy({ ...principal, tenantPermissions });
          const effective = await readEffectiveModules(
            tx,
            policy.scope.tenantId,
            () => new Date(),
            write,
          );
          if (!effective.modules.some((m) => m.code === "core_crm"))
            throw new ForbiddenException("CRM_MODULE_REQUIRED");
          return work(tx, policy);
        },
        {
          isolationLevel: write
            ? Prisma.TransactionIsolationLevel.ReadCommitted
            : Prisma.TransactionIsolationLevel.RepeatableRead,
          maxWait: 10000,
          timeout: 20000,
        },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError ||
        error instanceof Prisma.PrismaClientUnknownRequestError
      ) {
        const match = [
          "CRM_MASTER_REFERENCE_INVALID",
          "CRM_TENANT_IMMUTABLE",
          "CRM_DELETED_IMMUTABLE",
          "CRM_ACCOUNT_HAS_CONTACTS",
          "CRM_CONTACT_LINK_IMMUTABLE",
          "CRM_PRIMARY_CONTACT_REQUIRED_CHANGE",
          "CRM_ACCOUNT_DELETED",
          "CRM_SOFT_DELETE_ONLY",
          "CRM_LEAD_IMMUTABLE",
          "CRM_LEAD_TRANSITION_INVALID",
          "CRM_LEAD_LINK_MISMATCH",
          "CRM_CONVERSION_IMMUTABLE",
          "CRM_CONVERSION_INCONSISTENT",
          "CRM_TARGET_HAS_LEADS",
        ].find((code) => error.message.includes(code));
        if (match) crmConflict(match);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (
            ["P2034", "P2028"].includes(error.code) ||
            (error.code === "P2010" &&
              ["40P01", "40001"].includes(String(error.meta?.code)))
          )
            throw new ServiceUnavailableException("CRM_CONCURRENT_OPERATION");
          if (["P2002", "P2004"].includes(error.code))
            crmConflict("CRM_INTEGRITY_CONFLICT");
          if (["P2003", "P2025"].includes(error.code))
            throw new NotFoundException("CRM_REFERENCE_NOT_FOUND");
        }
        throw new InternalServerErrorException("CRM_OPERATION_FAILED");
      }
      throw error;
    }
  }
  async account(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    id: string,
    lock = false,
  ) {
    if (lock)
      await tx.$queryRaw`SELECT id FROM "Account" WHERE id=${id} AND "tenantId"=${p.scope.tenantId} FOR UPDATE`;
    const row = await tx.account.findFirst({
      where: { AND: [p.accounts(), { id }] },
      select: accountSelect,
    });
    if (!row) throw new NotFoundException("CRM_ACCOUNT_NOT_FOUND");
    return row;
  }
  async contact(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    id: string,
    lock = false,
  ) {
    const visible = await tx.contact.findFirst({
      where: { AND: [p.contacts(), { id }] },
      select: { id: true, accountId: true },
    });
    if (!visible) throw new NotFoundException("CRM_CONTACT_NOT_FOUND");
    if (lock) {
      if (visible.accountId) await this.account(tx, p, visible.accountId, true);
      await tx.$queryRaw`SELECT id FROM "Contact" WHERE id=${id} AND "tenantId"=${p.scope.tenantId} FOR UPDATE`;
    }
    const row = await tx.contact.findFirst({
      where: { AND: [p.contacts(), { id }] },
      select: contactSelect,
    });
    if (!row) throw new NotFoundException("CRM_CONTACT_NOT_FOUND");
    return row;
  }
  async owner(tx: Prisma.TransactionClient, p: CrmPolicy, id: string) {
    await tx.$queryRaw`SELECT id FROM "TenantMembership" WHERE id=${id} AND "tenantId"=${p.scope.tenantId} FOR SHARE`;
    const member = await tx.tenantMembership.findFirst({
      where: { id, tenantId: p.scope.tenantId },
      select: { status: true, user: { select: { status: true } } },
    });
    if (!member) throw new NotFoundException("CRM_OWNER_NOT_FOUND");
    if (member.status !== "ACTIVE" || member.user.status !== "ACTIVE")
      throw new UnprocessableEntityException("CRM_OWNER_INACTIVE");
  }
  async master(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    id: string | null | undefined,
    code: string,
  ) {
    if (id == null) return;
    const value = (
      await this.masters.referencesInTransaction(tx, p.scope.tenantId, [id])
    ).get(id);
    if (!value) throw new NotFoundException("CRM_MASTER_NOT_FOUND");
    if (value.definitionCode !== code || !value.selectable)
      throw new UnprocessableEntityException("CRM_MASTER_NOT_SELECTABLE");
  }
  audit(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    action: CrmAuditAction,
    entityType: "Account" | "Contact" | "Lead",
    id: string,
    metadata: CrmAuditMetadata,
  ) {
    return auditEvents.write(tx, {
      action,
      scope: "TENANT",
      tenantId: p.scope.tenantId,
      actorUserId: p.scope.userId,
      tenantMembershipId: p.scope.membershipId,
      entityType,
      entityId: id,
      metadata,
    });
  }
  async contactsDto(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    rows: ContactRow[],
  ) {
    const values = await this.masters.referencesInTransaction(
      tx,
      p.scope.tenantId,
      rows.flatMap((r) => (r.roleValueId ? [r.roleValueId] : [])),
    );
    return rows.map(({ ownerMembership, name, phone, email, ...row }) => ({
      ...row,
      ...(p.canSeeContacts() &&
      (row.accountId !== null ||
        p.has("crm.contacts.access.tenant") ||
        row.ownerMembershipId === p.scope.membershipId)
        ? { name, phone, email }
        : {}),
      owner: ownerMembership
        ? { id: ownerMembership.id, displayName: ownerMembership.user.fullName }
        : null,
      role: row.roleValueId
        ? (values.get(row.roleValueId)?.name ?? null)
        : null,
    }));
  }
  async accountsDto(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    rows: AccountRow[],
  ) {
    const contacts = p.canSeeContacts()
      ? await tx.contact.findMany({
          where: {
            AND: [
              p.contacts(),
              { accountId: { in: rows.map((r) => r.id) }, isPrimary: true },
            ],
          },
          select: contactSelect,
          take: rows.length,
        })
      : [];
    const dtos = await this.contactsDto(tx, p, contacts);
    const primaries = new Map(dtos.map((c) => [c.accountId, c]));
    const ids = rows.flatMap((r) =>
      [r.businessTypeValueId, r.sourceValueId].filter(
        (id): id is string => id !== null,
      ),
    );
    const values = await this.masters.referencesInTransaction(
      tx,
      p.scope.tenantId,
      ids,
    );
    return rows.map(({ ownerMembership, ...row }) => ({
      ...row,
      owner: {
        id: ownerMembership.id,
        displayName: ownerMembership.user.fullName,
      },
      businessType: row.businessTypeValueId
        ? (values.get(row.businessTypeValueId)?.name ?? null)
        : null,
      source: row.sourceValueId
        ? (values.get(row.sourceValueId)?.name ?? null)
        : null,
      ...(p.canSeeContacts()
        ? { primaryContact: primaries.get(row.id) ?? null }
        : {}),
    }));
  }
}
