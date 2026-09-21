import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { PrismaService } from "../persistence/prisma.service";
import {
  cursorPage,
  cursorWindow,
  cursorWindowSchema,
} from "../common/query/cursor-window";

const querySchema = cursorWindowSchema
  .extend({
    tenantId: z.string().uuid().optional(),
    type: z.enum(["media.delete-object", "followup.push"]).optional(),
    status: z.enum(["PENDING", "RUNNING", "SUCCEEDED", "DEAD"]).optional(),
    correlationId: z.string().max(100).optional(),
  })
  .strict();
const summary = {
  id: true,
  type: true,
  tenantId: true,
  status: true,
  createdAt: true,
  availableAt: true,
  attemptCount: true,
  maxAttempts: true,
  revision: true,
  correlationId: true,
  lastErrorCode: true,
  completedAt: true,
  deadAt: true,
} satisfies Prisma.BackgroundJobSelect;
@Injectable()
export class JobQueryService {
  constructor(private readonly prisma: PrismaService) {}
  async list(raw: unknown) {
    const { from, to, cursor, limit, ...filters } = querySchema.parse(raw);
    const window = cursorWindow({ from, to, cursor, limit });
    const items = await this.prisma.backgroundJob.findMany({
      where: { ...filters, ...window.where },
      select: summary,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
    });
    return { ...cursorPage(items, limit), from: window.start, to: window.end };
  }
  async detail(id: string) {
    z.string().uuid().parse(id);
    const row = await this.prisma.backgroundJob.findUnique({
      where: { id },
      select: {
        ...summary,
        originRequestId: true,
        actorUserId: true,
        membershipId: true,
        attempts: {
          select: {
            id: true,
            number: true,
            status: true,
            errorCode: true,
            startedAt: true,
            finishedAt: true,
          },
          orderBy: { number: "desc" },
          take: 50,
        },
      },
    });
    if (!row) throw new NotFoundException("Job not found");
    return {
      ...row,
      olderAttemptsOmitted: row.attemptCount > row.attempts.length,
    };
  }
}
