import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { RequestPrincipal } from "../common/security/request-principal.interface";
import { payloadHash } from "../platform/subscriptions/subscription-contract";
import { crmId, revisionCommand, ownerQuery } from "./crm-contract";
import { CrmRepository, crmConflict } from "./crm.repository";
import { CrmService } from "./crm.service";
import { CrmPolicy } from "./crm-policy";
import { leadScope, requireLead } from "./lead-policy";
import { leadSelect, LeadRow, conversionSelect } from "./lead-select";

import * as dto from "./lead-contract";

const data = (v: Partial<dto.LeadInput>) => ({
  kind: v.kind,
  name: v.name,
  contactName: v.contactName,
  phone: v.phone,
  email: v.email,
  website: v.website,
  addressLine1: v.addressLine1,
  addressLine2: v.addressLine2,
  city: v.city,
  state: v.state,
  postalCode: v.postalCode,
  countryCode: v.countryCode,
  description: v.description,
  sourceValueId: v.sourceValueId,
  priority: v.priority,
  accountId: v.accountId,
  contactId: v.contactId,
});
const page = <T>(
  items: T[],
  total: number,
  q: { page: number; limit: number },
) => ({
  items,
  total,
  page: q.page,
  limit: q.limit,
  totalPages: Math.ceil(total / q.limit),
});
const mutable = (row: LeadRow) => {
  if (!["OPEN", "QUALIFIED"].includes(row.status))
    crmConflict("CRM_LEAD_CLOSED");
};
const revision = (row: LeadRow, expected: number) => {
  if (row.revision !== expected) crmConflict("CRM_STALE_REVISION");
};

@Injectable()
export class LeadService {
  constructor(
    private readonly repo: CrmRepository,
    private readonly crm: CrmService,
  ) {}
  private async row(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    id: string,
    lock = false,
  ) {
    if (lock)
      await tx.$queryRaw`SELECT id FROM "Lead" WHERE id=${id} AND "tenantId"=${p.scope.tenantId} FOR UPDATE`;
    const row = await tx.lead.findFirst({
      where: { AND: [leadScope(p), { id }] },
      select: leadSelect,
    });
    if (!row) throw new NotFoundException("CRM_LEAD_NOT_FOUND");
    return row;
  }
  private where(p: CrmPolicy, q: dto.LeadQuery): Prisma.LeadWhereInput {
    const normalized = q.search?.replace(/[\s()-]/g, "");
    const hotFilter: Prisma.LeadWhereInput = q.hot
      ? { priority: { in: ["HIGH", "URGENT"] } }
      : {};
    return {
      AND: [
        leadScope(p),
        hotFilter,
        {
          status: q.status,
          priority: q.priority,
          sourceValueId: q.sourceValueId,
          ownerMembershipId: q.ownerMembershipId,
          assignedMembershipId: q.assignedMembershipId,
          accountId: q.accountId,
        },
        ...(q.unassigned
          ? [
              {
                assignedMembershipId:
                  q.unassigned === "true" ? null : { not: null },
              },
            ]
          : []),
        ...(q.search
          ? [
              {
                OR: [
                  {
                    name: { contains: q.search, mode: "insensitive" as const },
                  },
                  {
                    contactName: {
                      contains: q.search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    email: { contains: q.search, mode: "insensitive" as const },
                  },
                  ...(normalized ? [{ phone: { contains: normalized } }] : []),
                  ...(crmId.safeParse(q.search).success
                    ? [{ id: q.search }]
                    : []),
                ],
              },
            ]
          : []),
      ],
    };
  }
  private async project(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    rows: LeadRow[],
  ) {
    const sources = await this.repo.masters.referencesInTransaction(
      tx,
      p.scope.tenantId,
      rows.flatMap((r) => (r.sourceValueId ? [r.sourceValueId] : [])),
    );
    return rows.map(({ ownerMembership, assignedMembership, ...row }) => ({
      ...row,
      source: row.sourceValueId
        ? (sources.get(row.sourceValueId)?.name ?? null)
        : null,
      owner: {
        id: ownerMembership.id,
        displayName: ownerMembership.user.fullName,
      },
      assignee: assignedMembership
        ? {
            id: assignedMembership.id,
            displayName: assignedMembership.user.fullName,
          }
        : null,
    }));
  }
  async list(actor: RequestPrincipal, query: unknown) {
    const q = dto.leadQuery.parse(query);
    return this.repo.run(actor, false, async (tx, p) => {
      requireLead(p, "view");
      const where = this.where(p, q);
      const total = await tx.lead.count({ where });
      const rows = await tx.lead.findMany({
        where,
        select: leadSelect,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: [{ [q.sortBy]: q.sortDirection }, { id: q.sortDirection }],
      });
      return page(await this.project(tx, p, rows), total, q);
    });
  }
  async counts(actor: RequestPrincipal, query: unknown) {
    const q = dto.leadQuery.parse(query);
    return this.repo.run(actor, false, async (tx, p) => {
      requireLead(p, "view");
      const where = this.where(p, q);
      const lifecycle = await tx.lead.groupBy({
        by: ["status"],
        where,
        _count: { id: true },
      });
      const priorities = await tx.lead.groupBy({
        by: ["priority"],
        where,
        _count: { id: true },
      });
      const unassigned = await tx.lead.count({
        where: { AND: [where, { assignedMembershipId: null }] },
      });
      const sources = await tx.lead.groupBy({
        by: ["sourceValueId"],
        where,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 8,
      });
      const labels = await this.repo.masters.referencesInTransaction(
        tx,
        p.scope.tenantId,
        sources.flatMap((r) => (r.sourceValueId ? [r.sourceValueId] : [])),
      );
      return {
        total: lifecycle.reduce((n, r) => n + r._count.id, 0),
        unassigned,
        lifecycle: lifecycle.map((r) => ({
          status: r.status,
          count: r._count.id,
        })),
        priorities: priorities.map((r) => ({
          priority: r.priority,
          count: r._count.id,
        })),
        sources: sources.map((r) => ({
          id: r.sourceValueId,
          name: r.sourceValueId
            ? (labels.get(r.sourceValueId)?.name ?? "Source unavailable")
            : "No source",
          count: r._count.id,
        })),
      };
    });
  }
  async get(actor: RequestPrincipal, id: string) {
    crmId.parse(id);
    return this.repo.run(actor, false, async (tx, p) => {
      requireLead(p, "view");
      return (await this.project(tx, p, [await this.row(tx, p, id)]))[0];
    });
  }
  private async links(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    accountId: string | null,
    contactId: string | null,
  ) {
    if (accountId) {
      p.require("crm.businesses.view");
      const account = await this.repo.account(tx, p, accountId, true);
      if (account.status !== "ACTIVE")
        throw new UnprocessableEntityException("CRM_ACCOUNT_INACTIVE");
    }
    if (contactId) {
      p.require("crm.contacts.view");
      const contact = await this.repo.contact(tx, p, contactId, true);
      if (contact.status !== "ACTIVE")
        throw new UnprocessableEntityException("CRM_CONTACT_INACTIVE");
      if (contact.accountId !== accountId)
        throw new UnprocessableEntityException("CRM_LEAD_LINK_MISMATCH");
    }
  }
  async create(actor: RequestPrincipal, body: unknown) {
    const v = dto.createLead.parse(body);
    return this.repo.run(actor, true, async (tx, p) => {
      requireLead(p, "create");
      const owner = v.ownerMembershipId ?? p.scope.membershipId;
      if (owner !== p.scope.membershipId || v.assignedMembershipId)
        requireLead(p, "assign");
      if (
        !p.has("crm.leads.access.tenant") &&
        !(p.has("crm.leads.access.own") && owner === p.scope.membershipId) &&
        !(
          p.has("crm.leads.access.assigned") &&
          v.assignedMembershipId === p.scope.membershipId
        )
      )
        throw new ForbiddenException("CRM_SCOPE_REQUIRED");
      await this.repo.owner(tx, p, owner);
      if (v.assignedMembershipId)
        await this.repo.owner(tx, p, v.assignedMembershipId);
      await this.repo.master(tx, p, v.sourceValueId, "lead_source");
      await this.links(tx, p, v.accountId ?? null, v.contactId ?? null);
      const row = await tx.lead.create({
        data: {
          ...data(v),
          name: v.name,
          ownerMembershipId: owner,
          assignedMembershipId: v.assignedMembershipId,
          tenantId: p.scope.tenantId,
          createdByMembershipId: p.scope.membershipId,
          updatedByMembershipId: p.scope.membershipId,
        },
        select: leadSelect,
      });
      await this.repo.audit(tx, p, "lead.created", "Lead", row.id, {
        revisionAfter: 1,
        ownerMembershipId: owner,
        assignedAfter: row.assignedMembershipId,
        lifecycle: row.status,
      });
      return (await this.project(tx, p, [row]))[0];
    });
  }
  private async change(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    row: LeadRow,
    values: Prisma.LeadUncheckedUpdateManyInput,
  ) {
    const changed = await tx.lead.updateMany({
      where: { AND: [leadScope(p), { id: row.id, revision: row.revision }] },
      data: {
        ...values,
        revision: { increment: 1 },
        updatedByMembershipId: p.scope.membershipId,
      },
    });
    if (changed.count !== 1) crmConflict("CRM_STALE_REVISION");
  }
  async update(actor: RequestPrincipal, id: string, body: unknown) {
    crmId.parse(id);
    const v = dto.updateLead.parse(body);
    return this.repo.run(actor, true, async (tx, p) => {
      requireLead(p, "update");
      const row = await this.row(tx, p, id, true);
      revision(row, v.expectedRevision);
      mutable(row);
      if (
        v.status &&
        v.status !== row.status &&
        !(row.status === "OPEN" && v.status === "QUALIFIED") &&
        !["DISQUALIFIED", "DUPLICATE"].includes(v.status)
      )
        crmConflict("CRM_LEAD_TRANSITION_INVALID");
      if (v.accountId !== undefined || v.contactId !== undefined)
        await this.links(
          tx,
          p,
          v.accountId === undefined ? row.accountId : v.accountId,
          v.contactId === undefined ? row.contactId : v.contactId,
        );
      if (v.sourceValueId !== undefined)
        await this.repo.master(tx, p, v.sourceValueId, "lead_source");
      await this.change(tx, p, row, { ...data(v), status: v.status });
      await this.repo.audit(tx, p, "lead.updated", "Lead", id, {
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
        changedFields: Object.keys(v).filter((k) => k !== "expectedRevision"),
        lifecycle: v.status ?? row.status,
      });
      return (await this.project(tx, p, [await this.row(tx, p, id)]))[0];
    });
  }
  async assign(actor: RequestPrincipal, id: string, body: unknown) {
    crmId.parse(id);
    const v = dto.assignLead.parse(body);
    return this.repo.run(actor, true, async (tx, p) => {
      requireLead(p, "assign");
      const row = await this.row(tx, p, id, true);
      revision(row, v.expectedRevision);
      mutable(row);
      if (v.ownerMembershipId)
        await this.repo.owner(tx, p, v.ownerMembershipId);
      if (v.assignedMembershipId)
        await this.repo.owner(tx, p, v.assignedMembershipId);
      await this.change(tx, p, row, {
        ownerMembershipId: v.ownerMembershipId,
        assignedMembershipId: v.assignedMembershipId,
      });
      await this.repo.audit(tx, p, "lead.assigned", "Lead", id, {
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
        ownerBefore: row.ownerMembershipId,
        ownerAfter: v.ownerMembershipId ?? row.ownerMembershipId,
        assignedBefore: row.assignedMembershipId,
        assignedAfter:
          v.assignedMembershipId === undefined
            ? row.assignedMembershipId
            : v.assignedMembershipId,
      });
      // A transfer may intentionally remove the caller's visibility; return a command receipt.
      return { id, revision: row.revision + 1 };
    });
  }
  async remove(actor: RequestPrincipal, id: string, body: unknown) {
    crmId.parse(id);
    const v = revisionCommand.parse(body);
    return this.repo.run(actor, true, async (tx, p) => {
      requireLead(p, "delete");
      const row = await this.row(tx, p, id, true);
      revision(row, v.expectedRevision);
      if (row.status === "CONVERTED") crmConflict("CRM_LEAD_IMMUTABLE");
      await this.change(tx, p, row, { deletedAt: new Date() });
      await this.repo.audit(tx, p, "lead.deleted", "Lead", id, {
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
      });
    });
  }
  async owners(actor: RequestPrincipal, query: unknown) {
    const q = ownerQuery.parse(query);
    return this.repo.run(actor, false, async (tx, p) => {
      requireLead(p, "assign");
      const where: Prisma.TenantMembershipWhereInput = {
        tenantId: p.scope.tenantId,
        status: "ACTIVE",
        user: {
          status: "ACTIVE",
          ...(q.search
            ? { fullName: { contains: q.search, mode: "insensitive" } }
            : {}),
        },
      };
      const total = await tx.tenantMembership.count({ where });
      const rows = await tx.tenantMembership.findMany({
        where,
        select: {
          id: true,
          designation: true,
          user: { select: { fullName: true, avatarUrl: true } },
        },
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: [{ user: { fullName: "asc" } }, { id: "asc" }],
      });
      return page(
        rows.map((r) => ({
          id: r.id,
          displayName: r.user.fullName,
          avatarUrl: r.user.avatarUrl,
          role: r.designation,
        })),
        total,
        q,
      );
    });
  }
  private targetPermissions(p: CrmPolicy, v: dto.ConversionCommand) {
    if (
      v.account?.mode === "create" &&
      v.account.data.ownerMembershipId &&
      v.account.data.ownerMembershipId !== p.scope.membershipId
    )
      p.require("crm.businesses.assign");
    for (const [choice, resource] of [
      [v.account, "businesses"],
      [v.contact, "contacts"],
    ] as const)
      if (choice) {
        p.require(`crm.${resource}.view`);
        p.requireScope(resource);
        if (choice.mode === "create") p.require(`crm.${resource}.create`);
      }
    if (v.contact?.mode === "create" && v.account) {
      p.require("crm.businesses.update");
      p.requireScope("businesses");
    }
  }
  async convert(actor: RequestPrincipal, id: string, body: unknown) {
    crmId.parse(id);
    const v = dto.conversionCommand.parse(body);
    const hash = payloadHash(v);
    return this.repo.run(actor, true, async (tx, p) => {
      requireLead(p, "convert");
      const row = await this.row(tx, p, id, true);
      this.targetPermissions(p, v);
      const stored = await tx.leadConversionCommand.findUnique({
        where: { leadId_tenantId: { leadId: id, tenantId: p.scope.tenantId } },
        select: conversionSelect,
      });
      if (stored) {
        if (
          stored.idempotencyKey !== v.idempotencyKey ||
          stored.payloadHash !== hash
        )
          crmConflict("CRM_CONVERSION_CONFLICT");
        await this.links(tx, p, stored.accountId, stored.contactId);
        return {
          leadId: id,
          status: "CONVERTED" as const,
          revision: stored.resultRevision,
          accountId: stored.accountId,
          contactId: stored.contactId,
          convertedAt: stored.createdAt,
        };
      }
      revision(row, v.expectedRevision);
      if (row.status !== "QUALIFIED") crmConflict("CRM_LEAD_MUST_BE_QUALIFIED");
      if (
        (row.kind === "BUSINESS" && !v.account) ||
        (row.kind === "INDIVIDUAL" && (v.account || !v.contact))
      )
        throw new UnprocessableEntityException(
          "CRM_CONVERSION_TARGET_REQUIRED",
        );
      const accountId =
        v.account?.mode === "link"
          ? v.account.id
          : v.account?.mode === "create"
            ? (await this.crm.createAccountInTransaction(tx, p, v.account.data))
                .id
            : null;
      // Validate an existing Account before creating its Contact.
      if (accountId) await this.links(tx, p, accountId, null);
      const contactId =
        v.contact?.mode === "link"
          ? v.contact.id
          : v.contact?.mode === "create"
            ? (
                await this.crm.createContactInTransaction(tx, p, {
                  ...v.contact.data,
                  accountId,
                })
              ).id
            : null;
      await this.links(tx, p, accountId, contactId);
      const convertedAt = new Date();
      await this.change(tx, p, row, {
        status: "CONVERTED",
        convertedAccountId: accountId,
        convertedContactId: contactId,
        convertedAt,
        convertedByMembershipId: p.scope.membershipId,
      });
      const command = await tx.leadConversionCommand.create({
        data: {
          tenantId: p.scope.tenantId,
          leadId: id,
          idempotencyKey: v.idempotencyKey,
          payloadHash: hash,
          resultRevision: row.revision + 1,
          accountId,
          contactId,
          actorMembershipId: p.scope.membershipId,
          createdAt: convertedAt,
          updatedAt: convertedAt,
        },
        select: { id: true },
      });
      await this.repo.audit(tx, p, "lead.converted", "Lead", id, {
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
        accountId,
        contactId,
        conversionCommandId: command.id,
      });
      return {
        leadId: id,
        status: "CONVERTED" as const,
        revision: row.revision + 1,
        accountId,
        contactId,
        convertedAt,
      };
    });
  }
}
