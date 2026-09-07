import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../persistence/prisma.service';
import { SubscriptionTransactionService } from '../subscriptions/subscription-transaction.service';
import { payloadHash } from '../subscriptions/subscription-contract';
import { industryCode } from './industry-contract';
import { IndustryService } from './industry.service';

const aliases: Readonly<Record<string, string>> = {
  attendance_plus: 'attendance',
  payroll_engine: 'payroll',
};
export const industryCandidateSchema = z
  .object({
    id: z.string().regex(/^ind_[a-z0-9_]+$/),
    code: industryCode,
    label: z.string().trim().min(1).max(200),
    category: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(2000),
    defaultModules: z
      .array(z.string().trim())
      .max(100)
      .transform((codes) => codes.map((code) => aliases[code] ?? code).sort())
      .refine(
        (codes) => new Set(codes).size === codes.length,
        'Duplicate canonical Module recommendation',
      ),
  })
  .strict();
export const industryCandidatesSchema = z
  .array(industryCandidateSchema)
  .min(1)
  .max(100)
  .refine(
    (rows) =>
      new Set(rows.map((row) => row.code)).size === rows.length &&
      new Set(rows.map((row) => row.id)).size === rows.length,
    'Duplicate Industry code or source ID',
  )
  .transform((rows) => rows.sort((a, b) => a.code.localeCompare(b.code)));

@Injectable()
export class IndustryImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly transactions: SubscriptionTransactionService,
    private readonly industries: IndustryService,
  ) {}

  async run(input: unknown, actorUserId: string, approvedHash?: string) {
    const rows = industryCandidatesSchema.parse(input);
    const sourceHash = payloadHash(rows);
    if (approvedHash !== undefined && approvedHash !== sourceHash)
      throw new BadRequestException(
        'Reviewed Industry candidate hash does not match',
      );
    const work = async (tx: Prisma.TransactionClient) => {
      const results: {
        code: string;
        status: 'ALREADY_IMPORTED' | 'WOULD_IMPORT_DRAFT' | 'IMPORTED_DRAFT';
      }[] = [];
      for (const row of rows) {
        if (approvedHash !== undefined)
          await this.transactions.lock(tx, `industry-code:${row.code}`);
        const modules = await this.industries.modules(tx, row.defaultModules);
        const classification = await tx.industryClassification.findUnique({
          where: { code: row.code },
          select: { isActive: true },
        });
        if (!classification?.isActive)
          throw new BadRequestException(
            `Unknown or inactive Industry classification: ${row.code}`,
          );
        const existing = await tx.industryTemplate.findUnique({
          where: { code: row.code },
          select: { id: true },
        });
        const rowHash = payloadHash(row);
        if (existing) {
          const imported = await tx.industryTemplateVersion.findFirst({
            where: {
              industryTemplateId: existing.id,
              sourceFixtureId: row.id,
              sourceHash: rowHash,
            },
            select: { id: true },
          });
          if (!imported)
            throw new ConflictException(
              `Industry ${row.code} exists with different provenance; review manually`,
            );
          results.push({ code: row.code, status: 'ALREADY_IMPORTED' });
          continue;
        }
        if (approvedHash !== undefined) {
          const template = await tx.industryTemplate.create({
            data: {
              code: row.code,
              name: row.label,
              category: row.category,
              description: row.description,
            },
            select: { id: true },
          });
          await tx.industryTemplateVersion.create({
            data: {
              industryTemplateId: template.id,
              version: 1,
              terminology: {},
              masterDefaults: [],
              sourceFixtureId: row.id,
              sourceHash: rowHash,
              recommendations: {
                create: modules.map((module) => ({ moduleId: module.id })),
              },
            },
          });
          await this.industries.audit(
            tx,
            template.id,
            actorUserId,
            'INDUSTRY_CANDIDATE_IMPORTED',
            null,
            { sourceHash: rowHash, sourceFixtureId: row.id, status: 'DRAFT' },
          );
        }
        results.push({
          code: row.code,
          status:
            approvedHash === undefined
              ? 'WOULD_IMPORT_DRAFT'
              : 'IMPORTED_DRAFT',
        });
      }
      return {
        sourceHash,
        mode: approvedHash === undefined ? 'DRY_RUN' : 'APPLY',
        total: rows.length,
        results,
      };
    };
    if (approvedHash !== undefined)
      return this.transactions.run('industry-candidate-import', work);
    return this.prisma.$transaction(work, {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
    });
  }
}
