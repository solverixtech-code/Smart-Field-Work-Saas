import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PrismaService } from "../persistence/prisma.service";
import { redactDiagnostic } from "../observability/redaction";
import {
  cursorPage,
  cursorWindow,
  cursorWindowSchema,
} from "../common/query/cursor-window";

const querySchema = cursorWindowSchema
  .extend({
    tenantId: z.string().uuid().optional(),
    eventCode: z.string().min(1).max(100).optional(),
    category: z
      .enum([
        "AUTH",
        "RBAC",
        "CATALOG",
        "PLAN",
        "SUBSCRIPTION",
        "PROVISIONING",
        "INDUSTRY",
        "MASTER",
        "MEDIA",
        "JOB",
      ])
      .optional(),
    outcome: z.enum(["SUCCESS", "FAILURE", "DENIED"]).optional(),
    actorUserId: z.string().uuid().optional(),
    entityId: z.string().min(1).max(200).optional(),
    correlationId: z.string().max(100).optional(),
  })
  .strict();
const summary = {
  id: true,
  createdAt: true,
  schemaVersion: true,
  scope: true,
  eventCode: true,
  action: true,
  category: true,
  outcome: true,
  actorType: true,
  actorUserId: true,
  tenantId: true,
  entityType: true,
  entityId: true,
  correlationId: true,
} satisfies Prisma.AuditLogSelect;

@Injectable()
export class AuditQueryService {
  constructor(private readonly prisma: PrismaService) {}
  async list(raw: unknown) {
    const { from, to, cursor, limit, ...filters } = querySchema.parse(raw);
    const window = cursorWindow({ from, to, cursor, limit });
    const items = await this.prisma.auditLog.findMany({
      where: { ...filters, ...window.where },
      select: summary,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });
    return { ...cursorPage(items, limit), from: window.start, to: window.end };
  }
  async detail(id: string) {
    z.string().uuid().parse(id);
    const row = await this.prisma.auditLog.findUnique({
      where: { id },
      select: {
        ...summary,
        beforeJson: true,
        afterJson: true,
        metadata: true,
        requestId: true,
        originRequestId: true,
        tenantMembershipId: true,
        redactionVersion: true,
      },
    });
    if (!row) throw new NotFoundException("Audit event not found");
    return {
      ...row,
      beforeJson: redactDiagnostic(row.beforeJson),
      afterJson: redactDiagnostic(row.afterJson),
      metadata: redactDiagnostic(row.metadata),
    };
  }
}
