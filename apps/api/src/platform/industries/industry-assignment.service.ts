import { auditEvents } from '../../audit/audit-event-writer';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { PrismaService } from '../../persistence/prisma.service';
import { SubscriptionTransactionService } from '../subscriptions/subscription-transaction.service';
import { payloadHash } from '../subscriptions/subscription-contract';
import {
  assignIndustry,
  industryId,
  industryMappings,
  industryPage,
  migrateIndustry,
} from './industry-contract';
import {
  IndustryService,
  templateSelect,
  versionSelect,
} from './industry.service';

const assignmentSelect = {
  id: true,
  tenantId: true,
  industryTemplateVersionId: true,
  revision: true,
  assignedAt: true,
  assignedByUserId: true,
  industryTemplateVersion: {
    select: { ...versionSelect, industryTemplate: { select: templateSelect } },
  },
} satisfies Prisma.TenantIndustryTemplateAssignmentSelect;

@Injectable()
export class IndustryAssignmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactions: SubscriptionTransactionService,
    private readonly industries: IndustryService,
  ) {}

  async read(tenantId: string) {
    industryId.parse(tenantId);
    // Deliberately resolve the exact pin, even if its template is now archived.
    return this.prisma.tenantIndustryTemplateAssignment.findUnique({
      where: { tenantId },
      select: assignmentSelect,
    });
  }

  async history(tenantId: string, input: unknown) {
    industryId.parse(tenantId);
    const { page, limit } = industryPage.omit({ search: true }).parse(input);
    const where = { tenantId };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.tenantIndustryTemplateChange.findMany({
        where,
        select: {
          id: true,
          tenantId: true,
          fromVersionId: true,
          toVersionId: true,
          revision: true,
          reason: true,
          actorUserId: true,
          requestId: true,
          createdAt: true,
        },
        orderBy: { revision: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tenantIndustryTemplateChange.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  assign(tenantId: string, input: unknown, actorUserId: string) {
    const command = assignIndustry.parse(input);
    industryId.parse(tenantId);
    return this.transactions.run(`industry-assignment:${tenantId}`, (tx) =>
      this.apply(tx, tenantId, command, actorUserId),
    );
  }

  migrate(tenantId: string, input: unknown, actorUserId: string) {
    const { expectedRevision, ...command } = migrateIndustry.parse(input);
    industryId.parse(tenantId);
    return this.transactions.run(`industry-assignment:${tenantId}`, (tx) =>
      this.apply(tx, tenantId, command, actorUserId, expectedRevision),
    );
  }

  private async eligibility(
    tx: Prisma.TransactionClient,
    tenantId: string,
    versionId: string,
    lock: boolean,
  ) {
    if (lock) {
      await this.transactions.lock(tx, `industry-assignment:${tenantId}`);
      await tx.$queryRaw`SELECT id FROM "Tenant" WHERE id = ${tenantId} FOR UPDATE`;
    }
    const tenant = await tx.tenant.findUnique({
      where: { id: tenantId },
      select: { industryCode: true },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');
    const target = await tx.industryTemplateVersion.findUnique({
      where: { id: versionId },
      select: { industryTemplateId: true },
    });
    if (!target) throw new NotFoundException('Industry version not found');
    const template = lock
      ? await this.industries.lockTemplate(tx, target.industryTemplateId)
      : await tx.industryTemplate.findUniqueOrThrow({
          where: { id: target.industryTemplateId },
          select: templateSelect,
        });
    const version = await tx.industryTemplateVersion.findUniqueOrThrow({
      where: { id: versionId },
      select: { status: true },
    });
    if (template.status !== 'ACTIVE' || version.status !== 'PUBLISHED')
      throw new ConflictException(
        'Assignment requires an active template and exact published version',
      );
    if (!tenant.industryCode || tenant.industryCode !== template.code)
      throw new BadRequestException(
        'Industry classification does not match target; reclassification is not supported',
      );
    return template;
  }

  private async apply(
    tx: Prisma.TransactionClient,
    tenantId: string,
    command: z.infer<typeof assignIndustry>,
    actorUserId: string,
    expectedRevision?: number,
  ) {
    const template = await this.eligibility(
      tx,
      tenantId,
      command.industryTemplateVersionId,
      true,
    );
    const old = await tx.tenantIndustryTemplateAssignment.findUnique({
      where: { tenantId },
      select: assignmentSelect,
    });
    if (expectedRevision === undefined && old)
      throw new ConflictException(
        'Tenant already has an Industry assignment; use explicit migration',
      );
    if (expectedRevision !== undefined) {
      if (!old)
        throw new ConflictException(
          'Tenant has no Industry assignment to migrate',
        );
      this.industries.revision(old.revision, expectedRevision);
      if (old.industryTemplateVersion.industryTemplateId !== template.id)
        throw new BadRequestException(
          'Only same-template migrations are supported',
        );
      if (old.industryTemplateVersionId === command.industryTemplateVersionId)
        throw new ConflictException('Tenant is already pinned to this version');
    }
    const data = {
      industryTemplateVersionId: command.industryTemplateVersionId,
      assignedByUserId: actorUserId,
      assignedAt: new Date(),
    };
    const next = old
      ? await tx.tenantIndustryTemplateAssignment.update({
          where: { tenantId },
          data: { ...data, revision: { increment: 1 } },
          select: assignmentSelect,
        })
      : await tx.tenantIndustryTemplateAssignment.create({
          data: { ...data, tenantId },
          select: assignmentSelect,
        });
    await tx.tenantIndustryTemplateChange.create({
      data: {
        tenantId,
        fromVersionId: old?.industryTemplateVersionId,
        toVersionId: next.industryTemplateVersionId,
        revision: next.revision,
        reason: command.reason,
        actorUserId,
        requestId: command.requestId,
      },
    });
    await auditEvents.write(tx, { action: 'industry.assignment.changed', scope: 'TENANT', tenantId, actorUserId,
      entityType: 'TenantIndustryTemplateAssignment', entityId: next.id,
      beforeJson: { versionId: old?.industryTemplateVersionId ?? null },
      afterJson: { versionId: next.industryTemplateVersionId, revision: next.revision }, metadata: { reason: command.reason } });
    return next;
  }

  async reconcile(input: unknown, actorUserId: string, approvedHash?: string) {
    const mappings = industryMappings.parse(input);
    const mappingHash = payloadHash(mappings);
    if (approvedHash !== undefined && approvedHash !== mappingHash)
      throw new BadRequestException(
        'Reviewed Industry mapping hash does not match',
      );
    const work = async (tx: Prisma.TransactionClient) => {
      // Canonical Tenant order avoids batch deadlocks. Revalidate every mapping before writes.
      const results: {
        tenantId: string;
        industryTemplateVersionId: string;
        status: 'ALREADY_MAPPED' | 'WOULD_ASSIGN' | 'ASSIGNED';
      }[] = [];
      for (const row of mappings) {
        await this.eligibility(
          tx,
          row.tenantId,
          row.industryTemplateVersionId,
          approvedHash !== undefined,
        );
        const old = await tx.tenantIndustryTemplateAssignment.findUnique({
          where: { tenantId: row.tenantId },
          select: { industryTemplateVersionId: true },
        });
        if (
          old &&
          old.industryTemplateVersionId !== row.industryTemplateVersionId
        )
          throw new ConflictException(
            'Conflicting existing Industry assignment; explicit migration required',
          );
        results.push({
          tenantId: row.tenantId,
          industryTemplateVersionId: row.industryTemplateVersionId,
          status: old ? 'ALREADY_MAPPED' : 'WOULD_ASSIGN',
        });
      }
      if (approvedHash !== undefined) {
        for (let index = 0; index < mappings.length; index++) {
          if (results[index].status === 'ALREADY_MAPPED') continue;
          await this.apply(
            tx,
            mappings[index].tenantId,
            mappings[index],
            actorUserId,
          );
          results[index].status = 'ASSIGNED';
        }
      }
      return {
        mappingHash,
        mode: approvedHash === undefined ? 'DRY_RUN' : 'APPLY',
        total: results.length,
        alreadyMapped: results.filter((r) => r.status === 'ALREADY_MAPPED')
          .length,
        results,
      };
    };
    if (approvedHash !== undefined)
      return this.transactions.run('industry-reconciliation', work);
    return this.prisma.$transaction(work, {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    });
  }
}
