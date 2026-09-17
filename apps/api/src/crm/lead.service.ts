import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { z } from "zod";
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
  businessName: v.businessName,
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
  estimatedValue: v.estimatedValue,
  expectedClosingDate: v.expectedClosingDate,
  nextFollowUpAt: v.nextFollowUpAt,
  nextActionNote: v.nextActionNote,
  requirementNote: v.requirementNote,
  disqualificationReason: v.disqualificationReason,
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
const iso = (value: Date | string | null | undefined) =>
  value ? new Date(value).toISOString() : null;
const csvCell = (value: unknown) => {
  const raw = value == null ? "" : String(value);
  const safe = /^[=+\-@]/.test(raw) ? "'" + raw : raw;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
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
    const followUpFilter: Prisma.LeadWhereInput =
      q.followUp === "pending"
        ? { nextFollowUpAt: { not: null, lte: new Date() } }
        : {};
    return {
      AND: [
        leadScope(p),
        hotFilter,
        followUpFilter,
        {
          status: q.status,
          priority: q.priority,
          sourceValueId: q.sourceValueId,
          ownerMembershipId: q.ownerMembershipId,
          assignedMembershipId: q.assignedMembershipId,
          accountId: q.accountId,
          disqualificationReason: q.disqualificationReason,
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
                  {
                    leadCode: {
                      contains: q.search,
                      mode: "insensitive" as const,
                    },
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
      estimatedValue:
        row.estimatedValue == null ? null : Number(row.estimatedValue),
      expectedClosingDate: iso(row.expectedClosingDate),
      nextFollowUpAt: iso(row.nextFollowUpAt),
      convertedAt: iso(row.convertedAt),
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
  private async leadCode(tx: Prisma.TransactionClient, tenantId: string) {
    const count = await tx.lead.count({ where: { tenantId } });
    for (let n = count + 1; n < count + 10000; n++) {
      const code = "LD-" + String(n).padStart(6, "0");
      const exists = await tx.lead.findUnique({
        where: { tenantId_leadCode: { tenantId, leadCode: code } },
        select: { id: true },
      });
      if (!exists) return code;
    }
    throw new UnprocessableEntityException("CRM_LEAD_CODE_EXHAUSTED");
  }
  private recordHistory(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    leadId: string,
    eventType: string,
    message: string,
    note?: string | null,
    metadata?: Prisma.InputJsonValue,
  ) {
    return tx.leadHistory.create({
      data: {
        tenantId: p.scope.tenantId,
        leadId,
        eventType,
        message,
        note,
        actorMembershipId: p.scope.membershipId,
        metadata,
      },
      select: { id: true },
    });
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
      const pendingFollowUps = await tx.lead.count({
        where: {
          AND: [where, { nextFollowUpAt: { not: null, lte: new Date() } }],
        },
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
        pendingFollowUps,
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
      const kind = v.kind ?? "BUSINESS";
      const row = await tx.lead.create({
        data: {
          ...data({
            ...v,
            kind,
            businessName:
              v.businessName ?? (kind === "BUSINESS" ? v.name : null),
          }),
          leadCode: await this.leadCode(tx, p.scope.tenantId),
          name: v.name,
          ownerMembershipId: owner,
          assignedMembershipId: v.assignedMembershipId,
          tenantId: p.scope.tenantId,
          createdByMembershipId: p.scope.membershipId,
          updatedByMembershipId: p.scope.membershipId,
        },
        select: leadSelect,
      });
      await this.recordHistory(tx, p, row.id, "created", "Lead created", null, {
        revisionAfter: 1,
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
      const changedFields = Object.keys(v).filter(
        (k) => k !== "expectedRevision",
      );
      const eventType =
        v.status === "QUALIFIED"
          ? "qualified"
          : v.status === "DISQUALIFIED"
            ? "disqualified"
            : v.status === "DUPLICATE"
              ? "duplicate_marked"
              : "updated";
      await this.recordHistory(tx, p, id, eventType, "Lead updated", null, {
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
        changedFields,
        lifecycleBefore: row.status,
        lifecycleAfter: v.status ?? row.status,
      });
      await this.repo.audit(tx, p, "lead.updated", "Lead", id, {
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
        changedFields,
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
      await this.recordHistory(
        tx,
        p,
        id,
        row.assignedMembershipId ? "reassigned" : "assigned",
        row.assignedMembershipId ? "Lead reassigned" : "Lead assigned",
        null,
        {
          revisionBefore: row.revision,
          revisionAfter: row.revision + 1,
          ownerBefore: row.ownerMembershipId,
          ownerAfter: v.ownerMembershipId ?? row.ownerMembershipId,
          assignedBefore: row.assignedMembershipId,
          assignedAfter:
            v.assignedMembershipId === undefined
              ? row.assignedMembershipId
              : v.assignedMembershipId,
        },
      );
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
      await this.recordHistory(tx, p, id, "deleted", "Lead deleted", null, {
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
      });
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
  async bulkAssign(actor: RequestPrincipal, body: unknown) {
    const v = dto.bulkAssignLead.parse(body);
    if (new Set(v.leadIds).size !== v.leadIds.length)
      throw new UnprocessableEntityException("CRM_LEAD_DUPLICATE_SELECTION");
    return this.repo.run(actor, true, async (tx, p) => {
      requireLead(p, "assign");
      if (v.assignedMembershipId)
        await this.repo.owner(tx, p, v.assignedMembershipId);
      const results: Array<{ id: string; revision: number }> = [];
      // Bulk assignment is atomic: every selected lead must be visible, mutable and valid.
      for (const leadId of v.leadIds) {
        const row = await this.row(tx, p, leadId, true);
        mutable(row);
        await this.change(tx, p, row, {
          assignedMembershipId: v.assignedMembershipId,
        });
        await this.recordHistory(
          tx,
          p,
          leadId,
          row.assignedMembershipId ? "reassigned" : "assigned",
          row.assignedMembershipId ? "Lead reassigned" : "Lead assigned",
          v.reason ?? null,
          {
            bulk: true,
            revisionBefore: row.revision,
            revisionAfter: row.revision + 1,
            assignedBefore: row.assignedMembershipId,
            assignedAfter: v.assignedMembershipId,
          },
        );
        await this.repo.audit(tx, p, "lead.assigned", "Lead", leadId, {
          revisionBefore: row.revision,
          revisionAfter: row.revision + 1,
          ownerBefore: row.ownerMembershipId,
          ownerAfter: row.ownerMembershipId,
          assignedBefore: row.assignedMembershipId,
          assignedAfter: v.assignedMembershipId,
        });
        results.push({ id: leadId, revision: row.revision + 1 });
      }
      return {
        mode: "atomic" as const,
        requested: v.leadIds.length,
        assigned: results.length,
        results,
      };
    });
  }
  private parseCsv(csv: string) {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      const next = csv[i + 1];
      if (char === '"' && quoted && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        row.push(cell.trim());
        cell = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") i++;
        row.push(cell.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
    if (rows.length < 2) throw new UnprocessableEntityException("CRM_CSV_EMPTY");
    if (rows.length - 1 > 250)
      throw new UnprocessableEntityException("CRM_CSV_ROW_LIMIT");
    const headers = rows[0].map((h) =>
      h.trim().toLowerCase().replace(/[\s_-]+/g, ""),
    );
    return rows.slice(1).map((values, index) => {
      const record = new Map<string, string>();
      headers.forEach((header, i) => record.set(header, values[i]?.trim() ?? ""));
      return { rowNumber: index + 2, record };
    });
  }
  private importInput(
    record: Map<string, string>,
    defaultSourceValueId?: string | null,
  ) {
    const rawKind = (record.get("leadtype") || record.get("kind") || "BUSINESS")
      .trim()
      .toUpperCase();
    const kind = rawKind === "INDIVIDUAL" ? "INDIVIDUAL" : "BUSINESS";
    const businessName = record.get("businessname") || record.get("company");
    const contactName = record.get("contactname") || record.get("contact");
    const priority = (
      record.get("priority") || "MEDIUM"
    ).toUpperCase() as dto.LeadInput["priority"];
    const expectedClosingDate = record.get("expectedclosingdate");
    const nextFollowUpAt = record.get("nextfollowupat");
    const estimatedValue = record.get("estimatedvalue");
    return {
      kind,
      name:
        kind === "INDIVIDUAL"
          ? contactName || businessName || "Imported lead"
          : businessName || contactName || "Imported lead",
      businessName: businessName || null,
      contactName: contactName || null,
      phone: record.get("phone") || null,
      email: record.get("email") || null,
      website: record.get("website") || null,
      city: record.get("city") || null,
      state: record.get("state") || null,
      postalCode: record.get("postalcode") || null,
      countryCode: record.get("countrycode") || null,
      priority,
      sourceValueId: record.get("sourcevalueid") || defaultSourceValueId || null,
      estimatedValue: estimatedValue ? Number(estimatedValue) : null,
      expectedClosingDate: expectedClosingDate
        ? new Date(expectedClosingDate)
        : null,
      nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null,
      nextActionNote: record.get("nextactionnote") || null,
      requirementNote: record.get("requirementnote") || null,
    };
  }
  private async importRows(
    tx: Prisma.TransactionClient,
    p: CrmPolicy,
    input: z.infer<typeof dto.importPreview>,
  ) {
    await this.repo.master(tx, p, input.defaultSourceValueId, "lead_source");
    const parsed = this.parseCsv(input.csv);
    const rows: Array<{
      rowNumber: number;
      status: "READY" | "DUPLICATE" | "REJECTED";
      errors: string[];
      data?: z.infer<typeof dto.createLead>;
    }> = [];
    for (const row of parsed) {
      const candidate = this.importInput(row.record, input.defaultSourceValueId);
      const parsedCandidate = dto.createLead.safeParse(candidate);
      if (!parsedCandidate.success) {
        rows.push({
          rowNumber: row.rowNumber,
          status: "REJECTED",
          errors: parsedCandidate.error.issues.map((i) => i.message),
        });
        continue;
      }
      const duplicate = await tx.lead.findFirst({
        where: {
          tenantId: p.scope.tenantId,
          deletedAt: null,
          OR: [
            ...(parsedCandidate.data.phone
              ? [{ phone: parsedCandidate.data.phone }]
              : []),
            ...(parsedCandidate.data.email
              ? [{ email: parsedCandidate.data.email }]
              : []),
          ],
        },
        select: { id: true },
      });
      if (duplicate) {
        rows.push({
          rowNumber: row.rowNumber,
          status:
            input.duplicatePolicy === "SKIP" ? "DUPLICATE" : "REJECTED",
          errors:
            input.duplicatePolicy === "SKIP"
              ? []
              : ["Duplicate phone or email"],
          data: parsedCandidate.data,
        });
        continue;
      }
      rows.push({
        rowNumber: row.rowNumber,
        status: "READY",
        errors: [],
        data: parsedCandidate.data,
      });
    }
    return rows;
  }
  async importPreview(actor: RequestPrincipal, body: unknown) {
    const input = dto.importPreview.parse(body);
    return this.repo.run(actor, false, async (tx, p) => {
      requireLead(p, "import");
      const rows = await this.importRows(tx, p, input);
      return {
        totalRows: rows.length,
        readyRows: rows.filter((r) => r.status === "READY").length,
        duplicateRows: rows.filter((r) => r.status === "DUPLICATE").length,
        rejectedRows: rows.filter((r) => r.status === "REJECTED").length,
        rows: rows.map(({ data: _data, ...row }) => row),
      };
    });
  }
  async import(actor: RequestPrincipal, body: unknown) {
    const input = dto.importLeads.parse(body);
    return this.repo.run(actor, true, async (tx, p) => {
      requireLead(p, "import");
      requireLead(p, "create");
      const rows = await this.importRows(tx, p, input);
      const created: string[] = [];
      for (const row of rows) {
        if (row.status !== "READY" || !row.data) continue;
        const owner = p.scope.membershipId;
        const leadData = {
          ...row.data,
          kind: row.data.kind ?? "BUSINESS",
          businessName:
            row.data.businessName ??
            ((row.data.kind ?? "BUSINESS") === "BUSINESS"
              ? row.data.name
              : null),
        };
        const createdRow = await tx.lead.create({
          data: {
            ...data(leadData),
            name: leadData.name,
            kind: leadData.kind,
            leadCode: await this.leadCode(tx, p.scope.tenantId),
            tenantId: p.scope.tenantId,
            ownerMembershipId: owner,
            createdByMembershipId: owner,
            updatedByMembershipId: owner,
          },
          select: leadSelect,
        });
        created.push(createdRow.id);
        await this.recordHistory(
          tx,
          p,
          createdRow.id,
          "created",
          "Lead imported",
          null,
          { rowNumber: row.rowNumber },
        );
        await this.repo.audit(tx, p, "lead.created", "Lead", createdRow.id, {
          revisionAfter: 1,
          ownerMembershipId: owner,
          assignedAfter: null,
          lifecycle: createdRow.status,
        });
      }
      return {
        totalRows: rows.length,
        created: created.length,
        skipped: rows.filter((r) => r.status === "DUPLICATE").length,
        rejected: rows.filter((r) => r.status === "REJECTED").length,
        createdIds: created,
        rows: rows.map(({ data: _data, ...row }) => row),
      };
    });
  }
  async exportCsv(actor: RequestPrincipal, query: unknown) {
    const q = dto.exportQuery.parse(query);
    return this.repo.run(actor, false, async (tx, p) => {
      requireLead(p, "export");
      const rows = await tx.lead.findMany({
        where: this.where(p, q),
        select: leadSelect,
        take: q.maxRows,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
      const projected = await this.project(tx, p, rows);
      const header = [
        "Lead Code",
        "Lead Type",
        "Business Name",
        "Contact Name",
        "Phone",
        "Email",
        "Priority",
        "Lifecycle",
        "Source",
        "Owner",
        "Assignee",
        "Estimated Value",
        "Expected Closing Date",
        "Next Follow-up At",
        "Next Action Note",
        "City",
        "State",
        "Created At",
      ];
      const body = projected.map((lead) =>
        [
          lead.leadCode,
          lead.kind,
          lead.businessName,
          lead.contactName,
          lead.phone,
          lead.email,
          lead.priority,
          lead.status,
          lead.source,
          lead.owner.displayName,
          lead.assignee?.displayName,
          lead.estimatedValue,
          lead.expectedClosingDate,
          lead.nextFollowUpAt,
          lead.nextActionNote,
          lead.city,
          lead.state,
          lead.createdAt,
        ].map(csvCell).join(","),
      );
      return [header.map(csvCell).join(","), ...body].join("\r\n") + "\r\n";
    });
  }
  async history(actor: RequestPrincipal, id: string) {
    crmId.parse(id);
    return this.repo.run(actor, false, async (tx, p) => {
      requireLead(p, "view");
      await this.row(tx, p, id);
      const items = await tx.leadHistory.findMany({
        where: { tenantId: p.scope.tenantId, leadId: id },
        select: {
          id: true,
          eventType: true,
          message: true,
          note: true,
          metadata: true,
          createdAt: true,
          actorMembership: {
            select: {
              id: true,
              designation: true,
              user: { select: { fullName: true, avatarUrl: true } },
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: 100,
      });
      return {
        items: items.map(({ actorMembership, ...item }) => ({
          ...item,
          createdAt: item.createdAt.toISOString(),
          actor: {
            id: actorMembership.id,
            displayName: actorMembership.user.fullName,
            avatarUrl: actorMembership.user.avatarUrl,
            role: actorMembership.designation,
          },
        })),
      };
    });
  }
  async note(actor: RequestPrincipal, id: string, body: unknown) {
    crmId.parse(id);
    const v = dto.createLeadNote.parse(body);
    return this.repo.run(actor, true, async (tx, p) => {
      requireLead(p, "update");
      await this.row(tx, p, id, true);
      const event = await tx.leadHistory.create({
        data: {
          tenantId: p.scope.tenantId,
          leadId: id,
          eventType: "note",
          message: "Note added",
          note: v.note,
          actorMembershipId: p.scope.membershipId,
        },
        select: { id: true, createdAt: true },
      });
      return { id: event.id, createdAt: event.createdAt.toISOString() };
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

      // Automatically create a Sales Pipeline Deal (Opportunity) for converted lead
      let dealId: string | null = null;
      const existingDeal = await tx.opportunity.findUnique({
        where: { leadId_tenantId: { leadId: id, tenantId: p.scope.tenantId } },
        select: { id: true },
      });
      if (!existingDeal) {
        const newStageMaster = await tx.masterValue.findFirst({
          where: {
            tenantId: p.scope.tenantId,
            definition: { code: "deal_stage" },
            code: "new",
          },
          select: { id: true },
        });
        const dealCount = await tx.opportunity.count({
          where: { tenantId: p.scope.tenantId },
        });
        const dealCode = `DEAL-${(dealCount + 1001).toString()}`;
        const dealTitle =
          v.deal?.title || row.businessName || row.name || row.contactName || "New Deal";
        const dealAmount = v.deal?.amount ?? row.estimatedValue ?? 0;

        const newDeal = await tx.opportunity.create({
          data: {
            tenantId: p.scope.tenantId,
            dealCode,
            title: dealTitle,
            amount: dealAmount,
            stage: "new",
            stageValueId: newStageMaster?.id ?? null,
            priority: row.priority ?? "MEDIUM",
            sourceValueId: row.sourceValueId,
            leadId: id,
            accountId,
            contactId,
            assignedMembershipId: row.assignedMembershipId,
            ownerMembershipId: row.ownerMembershipId || p.scope.membershipId,
            expectedClosingDate: row.expectedClosingDate,
            description: row.requirementNote || row.description,
          },
          select: { id: true },
        });
        dealId = newDeal.id;
      } else {
        dealId = existingDeal.id;
      }

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
      await this.recordHistory(tx, p, id, "converted", "Lead converted", null, {
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
        accountId,
        contactId,
        dealId,
        conversionCommandId: command.id,
      });
      await this.repo.audit(tx, p, "lead.converted", "Lead", id, {
        revisionBefore: row.revision,
        revisionAfter: row.revision + 1,
        accountId,
        contactId,
        dealId,
        conversionCommandId: command.id,
      });
      return {
        leadId: id,
        status: "CONVERTED" as const,
        revision: row.revision + 1,
        accountId,
        contactId,
        dealId,
        convertedAt,
      };
    });
  }
}
