import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { PlanPublicationPolicyService } from './plan-publication-policy.service';
import { PlanQueryService, FormattedPlanDto, FormattedPlanVersionDto } from './plan-query.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanMetadataDto, UpdatePlanDraftDto, PublishPlanDto } from './dto/update-plan.dto';
import { PlanStatus, PlanVersionStatus } from '@prisma/client';
import { classifyPlanTransactionError } from './plan-transaction-error';

export interface PaginatedPlansResult {
  data: FormattedPlanDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class PlatformPlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly policyService: PlanPublicationPolicyService,
    private readonly queryService: PlanQueryService,
  ) {}

  async getAllPlans(
    status?: PlanStatus,
    visibility?: string,
    search?: string,
    page?: number,
    limit?: number,
  ): Promise<FormattedPlanDto[] | PaginatedPlansResult> {
    const where: any = {};
    if (status) where.status = status;
    if (visibility) where.visibility = visibility;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const isPaginated = page !== undefined || limit !== undefined;
    const pageNum = Math.max(1, page || 1);
    const limitNum = Math.min(100, Math.max(1, limit || 20));
    const skip = (pageNum - 1) * limitNum;

    const [plans, total] = await Promise.all([
      this.prisma.plan.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        ...(isPaginated ? { skip, take: limitNum } : {}),
        include: {
          currentPublishedVersion: {
            include: {
              pricing: true,
              limits: true,
              modules: { include: { module: true } },
              commercialRule: true,
            },
          },
          versions: {
            include: {
              pricing: true,
              limits: true,
              modules: { include: { module: true } },
              commercialRule: true,
            },
          },
        },
      }),
      this.prisma.plan.count({ where }),
    ]);

    const formattedData = plans.map((p) => this.queryService.formatPlan(p as any));

    if (isPaginated) {
      return {
        data: formattedData,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      };
    }

    return formattedData;
  }

  async getPlanById(planId: string): Promise<FormattedPlanDto> {
    const plan = await this.prisma.plan.findFirst({
      where: {
        OR: [{ id: planId }, { code: planId.toUpperCase() }],
      },
      include: {
        currentPublishedVersion: {
          include: {
            pricing: true,
            limits: true,
            modules: { include: { module: true } },
            commercialRule: true,
          },
        },
        versions: {
          orderBy: { version: 'desc' },
          include: {
            pricing: true,
            limits: true,
            modules: { include: { module: true } },
            commercialRule: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID or code '${planId}' was not found`);
    }

    return this.queryService.formatPlan(plan as any);
  }

  async createPlan(dto: CreatePlanDto, actorUserId?: string): Promise<FormattedPlanDto> {
    const normalizedCode = dto.code.trim().toUpperCase();

    const existing = await this.prisma.plan.findUnique({ where: { code: normalizedCode } });
    if (existing) {
      throw new ConflictException(`Plan with code '${normalizedCode}' already exists`);
    }

    // Resolve module IDs from codes and verify completeness
    const modules = await this.prisma.platformModule.findMany({
      where: { code: { in: dto.includedModuleCodes } },
    });
    if (modules.length !== dto.includedModuleCodes.length) {
      const foundCodes = modules.map((m) => m.code);
      const missing = dto.includedModuleCodes.filter((c) => !foundCodes.includes(c));
      throw new BadRequestException(`Module codes not found in platform catalog: ${missing.join(', ')}`);
    }

    const createdPlan = await this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.create({
        data: {
          code: normalizedCode,
          name: dto.name,
          description: dto.description,
          internalDescription: dto.internalDescription,
          visibility: dto.visibility,
          tier: dto.tier,
          badge: dto.badge,
          recommendedFor: dto.recommendedFor,
          displayOrder: dto.displayOrder,
          color: dto.color,
          status: PlanStatus.DRAFT,
        },
      });

      const version = await tx.planVersion.create({
        data: {
          planId: plan.id,
          version: 1,
          status: PlanVersionStatus.DRAFT,
        },
      });

      // Create pricing rows with persisted PricingModel
      for (const p of dto.pricing) {
        await tx.planPricing.create({
          data: {
            planVersionId: version.id,
            model: p.model as any,
            billingCycle: p.billingCycle,
            currency: p.currency,
            baseFee: p.baseFee ?? null,
            perSeatFee: p.perSeatFee ?? null,
            flatFee: p.flatFee ?? null,
            setupFee: p.setupFee ?? null,
            minimumCommitmentAmount: p.minimumCommitmentAmount ?? null,
            discountPercent: p.discountPercent ?? null,
            taxMode: p.taxMode,
            prorationPolicy: p.prorationPolicy,
          },
        });
      }

      // Create limits rows
      for (const l of dto.limits) {
        await tx.planLimit.create({
          data: {
            planVersionId: version.id,
            limitCode: l.limitCode,
            valueType: l.valueType as any,
            integerValue: l.integerValue ?? null,
            decimalValue: l.decimalValue ?? null,
            booleanValue: l.booleanValue ?? null,
            isUnlimited: l.isUnlimited,
            unit: l.unit ?? null,
          },
        });
      }

      // Create module rows
      for (const mod of modules) {
        await tx.planModule.create({
          data: {
            planVersionId: version.id,
            moduleId: mod.id,
          },
        });
      }

      // Create commercial rule row
      await tx.planCommercialRule.create({
        data: {
          planVersionId: version.id,
          schemaVersion: 1,
          rules: dto.commercialRules as any,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: 'PLAN_CREATED',
          entityType: 'Plan',
          entityId: plan.id,
          afterJson: { code: plan.code, name: plan.name },
        },
      });

      return plan;
    });

    return this.getPlanById(createdPlan.id);
  }

  async updatePlanMetadata(planId: string, dto: UpdatePlanMetadataDto, actorUserId?: string): Promise<FormattedPlanDto> {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) {
      throw new NotFoundException(`Plan '${planId}' not found`);
    }

    const updated = await this.prisma.plan.update({
      where: { id: planId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(dto.internalDescription !== undefined && { internalDescription: dto.internalDescription }),
        ...(dto.visibility && { visibility: dto.visibility }),
        ...(dto.tier !== undefined && { tier: dto.tier }),
        ...(dto.badge !== undefined && { badge: dto.badge }),
        ...(dto.recommendedFor !== undefined && { recommendedFor: dto.recommendedFor }),
        ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorUserId,
        action: 'PLAN_METADATA_UPDATED',
        entityType: 'Plan',
        entityId: planId,
        beforeJson: { name: plan.name, visibility: plan.visibility },
        afterJson: { name: updated.name, visibility: updated.visibility },
      },
    });

    return this.getPlanById(planId);
  }

  async getVersionHistory(planId: string): Promise<FormattedPlanVersionDto[]> {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException(`Plan '${planId}' not found`);

    const versions = await this.prisma.planVersion.findMany({
      where: { planId },
      orderBy: { version: 'desc' },
      include: {
        pricing: true,
        limits: true,
        modules: { include: { module: true } },
        commercialRule: true,
      },
    });

    return versions.map((v) => this.queryService.formatVersion(v as any, plan.currentPublishedVersionId));
  }

  async getVersionDetail(planId: string, versionParam: string): Promise<FormattedPlanVersionDto> {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException(`Plan '${planId}' not found`);

    const isNumeric = /^\d+$/.test(versionParam);
    const versionWhere = isNumeric
      ? { planId: plan.id, version: parseInt(versionParam, 10) }
      : { planId: plan.id, id: versionParam };

    const version = await this.prisma.planVersion.findFirst({
      where: versionWhere,
      include: {
        pricing: true,
        limits: true,
        modules: { include: { module: true } },
        commercialRule: true,
      },
    });

    if (!version) {
      throw new NotFoundException(`PlanVersion '${versionParam}' not found for Plan '${planId}'`);
    }

    return this.queryService.formatVersion(version as any, plan.currentPublishedVersionId);
  }

  async createNextDraft(planId: string, actorUserId?: string): Promise<FormattedPlanVersionDto> {
    let retries = 3;
    while (retries > 0) {
      try {
        const createdDraft = await this.prisma.$transaction(
          async (tx) => {
            // Lock Plan row to prevent race conditions during version allocation
            const lockedPlanRows: Array<{ id: string; status: PlanStatus; code: string; currentPublishedVersionId: string | null }> =
              await tx.$queryRaw`SELECT "id", "status", "code", "currentPublishedVersionId" FROM "Plan" WHERE "id" = ${planId} FOR UPDATE`;

            if (!lockedPlanRows || lockedPlanRows.length === 0) {
              throw new NotFoundException(`Plan '${planId}' not found`);
            }
            const planRow = lockedPlanRows[0];
            if (planRow.status === PlanStatus.ARCHIVED) {
              throw new ConflictException(`Cannot create draft for archived Plan '${planRow.code}'`);
            }

            // Check if an active DRAFT version already exists
            const existingDraft = await tx.planVersion.findFirst({
              where: { planId: planRow.id, status: PlanVersionStatus.DRAFT },
            });
            if (existingDraft) {
              throw new ConflictException(
                `Plan '${planRow.code}' already has an active DRAFT version (Version ${existingDraft.version}, ID: ${existingDraft.id})`
              );
            }

            // Fetch current highest version number
            const latestVersions = await tx.planVersion.findMany({
              where: { planId: planRow.id },
              orderBy: { version: 'desc' },
              take: 1,
              include: {
                pricing: true,
                limits: true,
                modules: { include: { module: true } },
                commercialRule: true,
              },
            });

            const nextVersionNumber = (latestVersions[0]?.version || 0) + 1;
            let sourceVersion = latestVersions[0];

            if (planRow.currentPublishedVersionId) {
              const currentPub = await tx.planVersion.findUnique({
                where: { id: planRow.currentPublishedVersionId },
                include: {
                  pricing: true,
                  limits: true,
                  modules: { include: { module: true } },
                  commercialRule: true,
                },
              });
              if (currentPub) sourceVersion = currentPub;
            }

            const newVersion = await tx.planVersion.create({
              data: {
                planId: planRow.id,
                version: nextVersionNumber,
                status: PlanVersionStatus.DRAFT,
              },
            });

            if (sourceVersion) {
              // Clone pricing with model
              for (const p of sourceVersion.pricing || []) {
                await tx.planPricing.create({
                  data: {
                    planVersionId: newVersion.id,
                    model: p.model,
                    billingCycle: p.billingCycle,
                    currency: p.currency,
                    baseFee: p.baseFee,
                    perSeatFee: p.perSeatFee,
                    flatFee: p.flatFee,
                    setupFee: p.setupFee,
                    minimumCommitmentAmount: p.minimumCommitmentAmount,
                    discountPercent: p.discountPercent,
                    taxMode: p.taxMode,
                    prorationPolicy: p.prorationPolicy,
                  },
                });
              }

              // Clone limits
              for (const l of sourceVersion.limits || []) {
                await tx.planLimit.create({
                  data: {
                    planVersionId: newVersion.id,
                    limitCode: l.limitCode,
                    valueType: l.valueType,
                    integerValue: l.integerValue,
                    decimalValue: l.decimalValue,
                    booleanValue: l.booleanValue,
                    isUnlimited: l.isUnlimited,
                    unit: l.unit,
                  },
                });
              }

              // Clone modules
              for (const m of sourceVersion.modules || []) {
                await tx.planModule.create({
                  data: {
                    planVersionId: newVersion.id,
                    moduleId: m.moduleId,
                  },
                });
              }

              // Clone commercial rule
              if (sourceVersion.commercialRule) {
                await tx.planCommercialRule.create({
                  data: {
                    planVersionId: newVersion.id,
                    schemaVersion: sourceVersion.commercialRule.schemaVersion,
                    rules: sourceVersion.commercialRule.rules as any,
                  },
                });
              }
            }

            await tx.auditLog.create({
              data: {
                actorUserId,
                action: 'PLAN_DRAFT_CREATED',
                entityType: 'PlanVersion',
                entityId: newVersion.id,
                afterJson: { planId: planRow.id, version: newVersion.version },
              },
            });

            return newVersion;
          },
          { isolationLevel: 'Serializable' },
        );

        const fullDraft = await this.prisma.planVersion.findUnique({
          where: { id: createdDraft.id },
          include: {
            pricing: true,
            limits: true,
            modules: { include: { module: true } },
            commercialRule: true,
            plan: true,
          },
        });

        return this.queryService.formatVersion(fullDraft as any, fullDraft?.plan.currentPublishedVersionId || null);
      } catch (err: unknown) {
        const failure = classifyPlanTransactionError(err);
        if (failure === 'RETRYABLE' && retries > 1) {
          retries--;
          await new Promise((res) => setTimeout(res, 50));
          continue;
        }
        if (
          failure !== 'OTHER' ||
          (typeof err === 'object' && err !== null && 'message' in err &&
            typeof err.message === 'string' && err.message.includes('already has an active DRAFT'))
        ) {
          throw new ConflictException(`Draft version allocation conflict for plan '${planId}'`);
        }
        throw err;
      }
    }
    throw new ConflictException(`Version allocation conflict for plan '${planId}'`);
  }

  async updateDraft(
    planId: string,
    versionId: string,
    dto: UpdatePlanDraftDto,
    actorUserId?: string,
  ): Promise<FormattedPlanVersionDto> {
    let retries = 3;
    while (retries > 0) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            // 1. Acquire FOR UPDATE row lock on PlanVersion FIRST inside transaction
            const lockedVersionRows: Array<{ id: string; planId: string; version: number; status: PlanVersionStatus }> =
              await tx.$queryRaw`SELECT "id", "planId", "version", "status" FROM "PlanVersion" WHERE "id" = ${versionId} AND "planId" = ${planId} FOR UPDATE`;

            if (!lockedVersionRows || lockedVersionRows.length === 0) {
              throw new NotFoundException(`PlanVersion '${versionId}' not found for plan '${planId}'`);
            }
            const version = lockedVersionRows[0];

            if (version.status === PlanVersionStatus.PUBLISHED) {
              throw new ConflictException(`PlanVersion '${version.version}' is PUBLISHED and strictly immutable.`);
            }

            // 2. Validate included module codes ATOMICALLY (Item 3 fix: reject unknown modules)
            if (dto.includedModuleCodes) {
              const modules = await tx.platformModule.findMany({
                where: { code: { in: dto.includedModuleCodes } },
              });
              if (modules.length !== dto.includedModuleCodes.length) {
                const foundCodes = modules.map((m) => m.code);
                const missing = dto.includedModuleCodes.filter((c) => !foundCodes.includes(c));
                throw new BadRequestException(`Module codes not found in platform catalog: ${missing.join(', ')}`);
              }
              await tx.planModule.deleteMany({ where: { planVersionId: version.id } });
              for (const m of modules) {
                await tx.planModule.create({
                  data: {
                    planVersionId: version.id,
                    moduleId: m.id,
                  },
                });
              }
            }

            // 3. Update pricing if provided
            if (dto.pricing) {
              await tx.planPricing.deleteMany({ where: { planVersionId: version.id } });
              for (const p of dto.pricing) {
                await tx.planPricing.create({
                  data: {
                    planVersionId: version.id,
                    model: p.model as any,
                    billingCycle: p.billingCycle,
                    currency: p.currency,
                    baseFee: p.baseFee ?? null,
                    perSeatFee: p.perSeatFee ?? null,
                    flatFee: p.flatFee ?? null,
                    setupFee: p.setupFee ?? null,
                    minimumCommitmentAmount: p.minimumCommitmentAmount ?? null,
                    discountPercent: p.discountPercent ?? null,
                    taxMode: p.taxMode,
                    prorationPolicy: p.prorationPolicy,
                  },
                });
              }
            }

            // 4. Update limits if provided
            if (dto.limits) {
              await tx.planLimit.deleteMany({ where: { planVersionId: version.id } });
              for (const l of dto.limits) {
                await tx.planLimit.create({
                  data: {
                    planVersionId: version.id,
                    limitCode: l.limitCode,
                    valueType: l.valueType as any,
                    integerValue: l.integerValue ?? null,
                    decimalValue: l.decimalValue ?? null,
                    booleanValue: l.booleanValue ?? null,
                    isUnlimited: l.isUnlimited,
                    unit: l.unit ?? null,
                  },
                });
              }
            }

            // 5. Update commercial rules if provided
            if (dto.commercialRules) {
              await tx.planCommercialRule.upsert({
                where: { planVersionId: version.id },
                create: {
                  planVersionId: version.id,
                  schemaVersion: 1,
                  rules: dto.commercialRules as any,
                },
                update: {
                  rules: dto.commercialRules as any,
                },
              });
            }

            await tx.auditLog.create({
              data: {
                actorUserId,
                action: 'PLAN_DRAFT_UPDATED',
                entityType: 'PlanVersion',
                entityId: version.id,
              },
            });

            const updated = await tx.planVersion.findUnique({
              where: { id: version.id },
              include: {
                pricing: true,
                limits: true,
                modules: { include: { module: true } },
                commercialRule: true,
                plan: true,
              },
            });

            return this.queryService.formatVersion(updated as any, updated?.plan.currentPublishedVersionId || null);
          },
          { isolationLevel: 'Serializable' },
        );
      } catch (err: unknown) {
        const failure = classifyPlanTransactionError(err);
        if (failure === 'RETRYABLE' && retries > 1) {
          retries--;
          await new Promise((res) => setTimeout(res, 50));
          continue;
        }
        if (failure !== 'OTHER') {
          throw new ConflictException(`Update conflict for plan '${planId}'`);
        }
        throw err;
      }
    }
    throw new ConflictException(`Update conflict for plan '${planId}'`);
  }

  async publishPlanVersion(
    planId: string,
    versionId: string,
    publishDto?: PublishPlanDto,
    actorUserId?: string,
  ): Promise<FormattedPlanDto> {
    let retries = 3;
    while (retries > 0) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            // 1. Acquire FOR UPDATE row lock on Plan inside transaction FIRST
            const lockedPlanRows: Array<{ id: string; status: PlanStatus; code: string; currentPublishedVersionId: string | null }> =
              await tx.$queryRaw`SELECT "id", "status", "code", "currentPublishedVersionId" FROM "Plan" WHERE "id" = ${planId} FOR UPDATE`;

            if (!lockedPlanRows || lockedPlanRows.length === 0) {
              throw new NotFoundException(`Plan '${planId}' not found`);
            }
            const plan = lockedPlanRows[0];

            if (plan.status === PlanStatus.ARCHIVED) {
              throw new ConflictException(`Cannot publish version for archived Plan '${plan.code}'`);
            }

            // 2. Acquire FOR UPDATE row lock on PlanVersion inside transaction FIRST
            const lockedVersionRows: Array<{ id: string; planId: string; version: number; status: PlanVersionStatus }> =
              await tx.$queryRaw`SELECT "id", "planId", "version", "status" FROM "PlanVersion" WHERE "id" = ${versionId} AND "planId" = ${planId} FOR UPDATE`;

            if (!lockedVersionRows || lockedVersionRows.length === 0) {
              throw new NotFoundException(`PlanVersion '${versionId}' not found for plan '${planId}'`);
            }
            const versionRow = lockedVersionRows[0];

            if (versionRow.status === PlanVersionStatus.PUBLISHED) {
              throw new ConflictException(`PlanVersion '${versionRow.version}' is already PUBLISHED.`);
            }

            // 3. Read the locked version children INSIDE the locking transaction
            const version = await tx.planVersion.findUnique({
              where: { id: versionId },
              include: {
                pricing: true,
                limits: true,
                modules: { include: { module: true } },
                commercialRule: true,
              },
            });

            if (!version) {
              throw new NotFoundException(`PlanVersion '${versionId}' not found for plan '${planId}'`);
            }

            // 4. Format DTOs and validate INSIDE the locking transaction on the current locked snapshot
            const pricingDtos = this.queryService.formatPricing(version.pricing).map((p) => ({
              model: p.model as any,
              billingCycle: p.billingCycle as any,
              currency: p.currency,
              baseFee: p.baseFee ? p.baseFee : undefined,
              perSeatFee: p.perSeatFee ? p.perSeatFee : undefined,
              flatFee: p.flatFee ? p.flatFee : undefined,
              setupFee: p.setupFee ? p.setupFee : undefined,
              minimumCommitmentAmount: p.minimumCommitmentAmount ? p.minimumCommitmentAmount : undefined,
              discountPercent: p.discountPercent ? p.discountPercent : undefined,
              taxMode: p.taxMode as any,
              prorationPolicy: p.prorationPolicy as any,
            }));

            const limitDtos = this.queryService.formatLimits(version.limits).map((l) => ({
              limitCode: l.limitCode,
              valueType: l.valueType as any,
              integerValue: l.integerValue ?? undefined,
              decimalValue: l.decimalValue ? l.decimalValue : undefined,
              booleanValue: l.booleanValue ?? undefined,
              isUnlimited: l.isUnlimited,
              unit: l.unit ?? undefined,
            }));

            const includedModuleCodes = version.modules.map((m) => m.module.code);
            const commercialRules = (version.commercialRule?.rules as any) || {};

            const validationResult = await this.policyService.validateForPublication(
              pricingDtos as any,
              limitDtos as any,
              includedModuleCodes,
              commercialRules,
              publishDto,
            );

            if (!validationResult.isValid) {
              throw new BadRequestException({
                message: 'Plan publication policy validation failed',
                errors: validationResult.errors,
                warnings: validationResult.warnings,
              });
            }

            // 5. Update status to PUBLISHED inside the transaction
            const now = new Date();

            await tx.planVersion.update({
              where: { id: version.id },
              data: {
                status: PlanVersionStatus.PUBLISHED,
                publishedAt: now,
                publishedByUserId: actorUserId || null,
              },
            });

            await tx.plan.update({
              where: { id: plan.id },
              data: {
                status: PlanStatus.ACTIVE,
                currentPublishedVersionId: version.id,
              },
            });

            await tx.auditLog.create({
              data: {
                actorUserId,
                action: 'PLAN_VERSION_PUBLISHED',
                entityType: 'PlanVersion',
                entityId: version.id,
                afterJson: { planId: plan.id, version: version.version, publishedAt: now },
              },
            });

            return this.queryService.formatPlan(
              (await tx.plan.findUnique({
                where: { id: plan.id },
                include: {
                  currentPublishedVersion: {
                    include: {
                      pricing: true,
                      limits: true,
                      modules: { include: { module: true } },
                      commercialRule: true,
                    },
                  },
                  versions: {
                    include: {
                      pricing: true,
                      limits: true,
                      modules: { include: { module: true } },
                      commercialRule: true,
                    },
                  },
                },
              })) as any,
            );
          },
          { isolationLevel: 'Serializable' },
        );
      } catch (err: unknown) {
        const failure = classifyPlanTransactionError(err);
        if (failure === 'RETRYABLE' && retries > 1) {
          retries--;
          await new Promise((res) => setTimeout(res, 50));
          continue;
        }
        if (failure !== 'OTHER') {
          throw new ConflictException(`Publication conflict for plan '${planId}'`);
        }
        throw err;
      }
    }
    throw new ConflictException(`Publication conflict for plan '${planId}'`);
  }

  async archivePlan(planId: string, actorUserId?: string): Promise<FormattedPlanDto> {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException(`Plan '${planId}' not found`);

    if (plan.status === PlanStatus.ARCHIVED) {
      throw new ConflictException(`Plan '${plan.code}' is already ARCHIVED.`);
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.plan.update({
        where: { id: planId },
        data: {
          status: PlanStatus.ARCHIVED,
          archivedAt: now,
        },
      });

      await tx.auditLog.create({
        data: {
          actorUserId,
          action: 'PLAN_ARCHIVED',
          entityType: 'Plan',
          entityId: planId,
          afterJson: { archivedAt: now },
        },
      });
    });

    return this.getPlanById(planId);
  }
}
