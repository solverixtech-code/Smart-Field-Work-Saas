import { auditEvents } from '../../audit/audit-event-writer';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../persistence/prisma.service';
import { MODULE_REGISTRY } from '../modules/feature-registry';
import { SubscriptionTransactionService } from '../subscriptions/subscription-transaction.service';
import { jsonValue } from '../subscriptions/subscription-contract';
import {
  createIndustry,
  industryId,
  industryPage,
  industrySnapshot,
  publishIndustry,
  revisionCommand,
  updateIndustry,
  updateIndustryDraft,
} from './industry-contract';

export const templateSelect = {
  id: true,
  code: true,
  name: true,
  category: true,
  description: true,
  status: true,
  revision: true,
  currentPublishedVersionId: true,
  createdAt: true,
  updatedAt: true,
  archivedAt: true,
} satisfies Prisma.IndustryTemplateSelect;
export const versionSelect = {
  id: true,
  industryTemplateId: true,
  version: true,
  revision: true,
  status: true,
  schemaVersion: true,
  terminology: true,
  masterDefaults: true,
  sourceFixtureId: true,
  sourceHash: true,
  approvalReference: true,
  publishedAt: true,
  publishedByUserId: true,
  createdAt: true,
  updatedAt: true,
  recommendations: {
    select: { module: { select: { id: true, code: true } } },
    orderBy: { moduleId: 'asc' },
  },
} satisfies Prisma.IndustryTemplateVersionSelect;

@Injectable()
export class IndustryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactions: SubscriptionTransactionService,
  ) {}

  async list(input: unknown) {
    const { page, limit, search } = industryPage.parse(input);
    const where: Prisma.IndustryTemplateWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
    const [items, total] = await this.prisma.$transaction([
      this.prisma.industryTemplate.findMany({
        where,
        select: templateSelect,
        orderBy: { code: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.industryTemplate.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async detail(id: string) {
    const template = await this.prisma.industryTemplate.findUnique({
      where: { id: industryId.parse(id) },
      select: templateSelect,
    });
    if (!template) throw new NotFoundException('Industry template not found');
    return template;
  }

  async versions(id: string, input: unknown) {
    await this.detail(id);
    const { page, limit } = industryPage.omit({ search: true }).parse(input);
    const where = { industryTemplateId: id };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.industryTemplateVersion.findMany({
        where,
        select: versionSelect,
        orderBy: { version: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.industryTemplateVersion.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async version(id: string, versionId: string) {
    const version = await this.prisma.industryTemplateVersion.findFirst({
      where: {
        id: industryId.parse(versionId),
        industryTemplateId: industryId.parse(id),
      },
      select: versionSelect,
    });
    if (!version) throw new NotFoundException('Industry version not found');
    return version;
  }

  async create(input: unknown, actorUserId: string) {
    const data = createIndustry.parse(input);
    return this.transactions.run(`industry-code:${data.code}`, async (tx) => {
      const classification = await tx.industryClassification.findUnique({
        where: { code: data.code },
        select: { isActive: true },
      });
      if (!classification?.isActive)
        throw new BadRequestException(
          'An existing active Industry classification is required',
        );
      const template = await tx.industryTemplate.create({
        data,
        select: templateSelect,
      });
      await this.audit(
        tx,
        template.id,
        actorUserId,
        'INDUSTRY_CREATED',
        null,
        template,
      );
      return template;
    });
  }

  async lockTemplate(tx: Prisma.TransactionClient, id: string) {
    industryId.parse(id);
    await tx.$queryRaw`SELECT id FROM "IndustryTemplate" WHERE id = ${id} FOR UPDATE`;
    const template = await tx.industryTemplate.findUnique({
      where: { id },
      select: templateSelect,
    });
    if (!template) throw new NotFoundException('Industry template not found');
    if (template.status === 'ARCHIVED')
      throw new ConflictException('Industry template is archived');
    return template;
  }

  async update(id: string, input: unknown, actorUserId: string) {
    const { expectedRevision, reason, ...data } = updateIndustry.parse(input);
    return this.transactions.run(`industry:${id}`, async (tx) => {
      const old = await this.lockTemplate(tx, id);
      this.revision(old.revision, expectedRevision);
      const next = await tx.industryTemplate.update({
        where: { id },
        data: { ...data, revision: { increment: 1 } },
        select: templateSelect,
      });
      await this.audit(tx, id, actorUserId, 'INDUSTRY_METADATA_UPDATED', old, {
        ...next,
        reason,
      });
      return next;
    });
  }

  async createDraft(id: string, input: unknown, actorUserId: string) {
    const { expectedRevision, reason } = revisionCommand.parse(input);
    return this.transactions.run(`industry:${id}`, async (tx) => {
      const template = await this.lockTemplate(tx, id);
      this.revision(template.revision, expectedRevision);
      if (
        await tx.industryTemplateVersion.count({
          where: { industryTemplateId: id, status: 'DRAFT' },
        })
      )
        throw new ConflictException('Industry already has a draft');
      const last = await tx.industryTemplateVersion.findFirst({
        where: { industryTemplateId: id },
        orderBy: { version: 'desc' },
        select: versionSelect,
      });
      const created = await tx.industryTemplateVersion.create({
        data: {
          industryTemplateId: id,
          version: (last?.version ?? 0) + 1,
          terminology: jsonValue(last?.terminology ?? {}),
          masterDefaults: jsonValue(last?.masterDefaults ?? []),
          recommendations: {
            create:
              last?.recommendations.map((r) => ({ moduleId: r.module.id })) ??
              [],
          },
        },
        select: versionSelect,
      });
      await tx.industryTemplate.update({
        where: { id },
        data: { revision: { increment: 1 } },
      });
      await this.audit(tx, id, actorUserId, 'INDUSTRY_DRAFT_CREATED', null, {
        ...created,
        reason,
      });
      return created;
    });
  }

  async modules(tx: Prisma.TransactionClient, codes: readonly string[]) {
    const registered = new Set(
      MODULE_REGISTRY.filter(
        (m) => m.status === 'ACTIVE' || m.status === 'BETA',
      ).map((m) => m.code),
    );
    if (codes.some((code) => !registered.has(code)))
      throw new BadRequestException(
        'Unknown or unavailable registered Module recommendation',
      );
    const modules = await tx.platformModule.findMany({
      where: { code: { in: [...codes] }, status: { in: ['ACTIVE', 'BETA'] } },
      select: { id: true, code: true },
    });
    if (modules.length !== codes.length)
      throw new BadRequestException(
        'Module registry projections must be synchronized',
      );
    return modules;
  }

  async updateDraft(
    id: string,
    versionId: string,
    input: unknown,
    actorUserId: string,
  ) {
    const { expectedRevision, reason, recommendedModuleCodes, ...snapshot } =
      updateIndustryDraft.parse(input);
    return this.transactions.run(`industry:${id}`, async (tx) => {
      await this.lockTemplate(tx, id);
      const old = await this.lockDraft(tx, id, versionId, expectedRevision);
      const modules = await this.modules(tx, recommendedModuleCodes);
      await tx.industryTemplateModuleRecommendation.deleteMany({
        where: { industryTemplateVersionId: versionId },
      });
      const next = await tx.industryTemplateVersion.update({
        where: { id: versionId },
        data: {
          ...snapshot,
          masterDefaults: jsonValue(snapshot.masterDefaults),
          revision: { increment: 1 },
          recommendations: {
            create: modules.map((module) => ({ moduleId: module.id })),
          },
        },
        select: versionSelect,
      });
      await this.audit(tx, id, actorUserId, 'INDUSTRY_DRAFT_UPDATED', old, {
        ...next,
        reason,
      });
      return next;
    });
  }

  async publish(
    id: string,
    versionId: string,
    input: unknown,
    actorUserId: string,
  ) {
    const { expectedRevision, reason, approvalReference } =
      publishIndustry.parse(input);
    return this.transactions.run(`industry:${id}`, async (tx) => {
      const template = await this.lockTemplate(tx, id);
      const old = await this.lockDraft(tx, id, versionId, expectedRevision);
      const snapshot = industrySnapshot.parse({
        schemaVersion: old.schemaVersion,
        terminology: old.terminology,
        masterDefaults: old.masterDefaults,
        recommendedModuleCodes: old.recommendations.map((r) => r.module.code),
      });
      await this.modules(tx, snapshot.recommendedModuleCodes);
      const classification = await tx.industryClassification.findUniqueOrThrow({
        where: { code: template.code },
        select: { isActive: true },
      });
      if (!classification.isActive)
        throw new ConflictException('Industry classification is inactive');
      const next = await tx.industryTemplateVersion.update({
        where: { id: versionId },
        data: {
          status: 'PUBLISHED',
          publishedAt: new Date(),
          publishedByUserId: actorUserId,
          approvalReference,
          revision: { increment: 1 },
        },
        select: versionSelect,
      });
      await tx.industryTemplate.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          currentPublishedVersionId: versionId,
          revision: { increment: 1 },
        },
      });
      await this.audit(tx, id, actorUserId, 'INDUSTRY_PUBLISHED', old, {
        ...next,
        reason,
      });
      return next;
    });
  }

  async archive(id: string, input: unknown, actorUserId: string) {
    const { expectedRevision, reason } = revisionCommand.parse(input);
    return this.transactions.run(`industry:${id}`, async (tx) => {
      const old = await this.lockTemplate(tx, id);
      this.revision(old.revision, expectedRevision);
      const next = await tx.industryTemplate.update({
        where: { id },
        data: {
          status: 'ARCHIVED',
          archivedAt: new Date(),
          revision: { increment: 1 },
        },
        select: templateSelect,
      });
      await this.audit(tx, id, actorUserId, 'INDUSTRY_ARCHIVED', old, {
        ...next,
        reason,
      });
      return next;
    });
  }

  private async lockDraft(
    tx: Prisma.TransactionClient,
    id: string,
    versionId: string,
    revision: number,
  ) {
    industryId.parse(versionId);
    await tx.$queryRaw`SELECT id FROM "IndustryTemplateVersion" WHERE id = ${versionId} FOR UPDATE`;
    const version = await tx.industryTemplateVersion.findFirst({
      where: { id: versionId, industryTemplateId: id },
      select: versionSelect,
    });
    if (!version) throw new NotFoundException('Industry draft not found');
    if (version.status !== 'DRAFT')
      throw new ConflictException('Published Industry versions are immutable');
    this.revision(version.revision, revision);
    return version;
  }

  revision(actual: number, expected: number) {
    if (actual !== expected)
      throw new ConflictException(
        'Industry revision conflict; reload before retry',
      );
  }

  async audit(
    tx: Prisma.TransactionClient,
    entityId: string,
    actorUserId: string,
    action: string,
    before: unknown,
    after: unknown,
  ) {
    await auditEvents.write(tx, { scope: "PLATFORM", ...{
        actorUserId,
        action,
        entityType: 'IndustryTemplate',
        entityId,
        beforeJson: before === null ? null : jsonValue(before),
        afterJson: jsonValue(after),
      } });
  }
}
