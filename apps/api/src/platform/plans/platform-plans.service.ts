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
  ): Promise<FormattedPlanDto[]> {
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

    const plans = await this.prisma.plan.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
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
    });

    return plans.map((p) => this.queryService.formatPlan(p as any));
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

    // Resolve module IDs from codes
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

      // Create pricing rows
      for (const p of dto.pricing) {
        await tx.planPricing.create({
          data: {
            planVersionId: version.id,
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

  async createNextDraft(planId: string, actorUserId?: string): Promise<FormattedPlanVersionDto> {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          include: {
            pricing: true,
            limits: true,
            modules: { include: { module: true } },
            commercialRule: true,
          },
        },
        currentPublishedVersion: {
          include: {
            pricing: true,
            limits: true,
            modules: { include: { module: true } },
            commercialRule: true,
          },
        },
      },
    });

    if (!plan) throw new NotFoundException(`Plan '${planId}' not found`);
    if (plan.status === PlanStatus.ARCHIVED) {
      throw new ConflictException(`Cannot create draft for archived Plan '${plan.code}'`);
    }

    // Check if an active DRAFT already exists
    const existingDraft = plan.versions.find((v) => v.status === PlanVersionStatus.DRAFT);
    if (existingDraft) {
      throw new ConflictException(
        `Plan '${plan.code}' already has an active DRAFT version (Version ${existingDraft.version}, ID: ${existingDraft.id})`
      );
    }

    const nextVersionNumber = (plan.versions[0]?.version || 0) + 1;
    const sourceVersion = plan.currentPublishedVersion || plan.versions[0];

    const createdDraft = await this.prisma.$transaction(async (tx) => {
      const newVersion = await tx.planVersion.create({
        data: {
          planId: plan.id,
          version: nextVersionNumber,
          status: PlanVersionStatus.DRAFT,
        },
      });

      if (sourceVersion) {
        // Clone pricing
        for (const p of sourceVersion.pricing || []) {
          await tx.planPricing.create({
            data: {
              planVersionId: newVersion.id,
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
          afterJson: { planId: plan.id, version: newVersion.version },
        },
      });

      return newVersion;
    });

    const fullDraft = await this.prisma.planVersion.findUnique({
      where: { id: createdDraft.id },
      include: {
        pricing: true,
        limits: true,
        modules: { include: { module: true } },
        commercialRule: true,
      },
    });

    return this.queryService.formatVersion(fullDraft as any, plan.currentPublishedVersionId);
  }

  async updateDraft(
    planId: string,
    versionId: string,
    dto: UpdatePlanDraftDto,
    actorUserId?: string,
  ): Promise<FormattedPlanVersionDto> {
    const version = await this.prisma.planVersion.findFirst({
      where: { id: versionId, planId },
    });

    if (!version) {
      throw new NotFoundException(`PlanVersion '${versionId}' not found for plan '${planId}'`);
    }

    if (version.status === PlanVersionStatus.PUBLISHED) {
      throw new ConflictException(`PlanVersion '${version.version}' is PUBLISHED and strictly immutable.`);
    }

    await this.prisma.$transaction(async (tx) => {
      // Update pricing if provided
      if (dto.pricing) {
        await tx.planPricing.deleteMany({ where: { planVersionId: version.id } });
        for (const p of dto.pricing) {
          await tx.planPricing.create({
            data: {
              planVersionId: version.id,
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

      // Update limits if provided
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

      // Update modules if provided
      if (dto.includedModuleCodes) {
        const modules = await tx.platformModule.findMany({
          where: { code: { in: dto.includedModuleCodes } },
        });
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

      // Update commercial rules if provided
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
    });

    const updated = await this.prisma.planVersion.findUnique({
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
  }

  async publishPlanVersion(
    planId: string,
    versionId: string,
    publishDto?: PublishPlanDto,
    actorUserId?: string,
  ): Promise<FormattedPlanDto> {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException(`Plan '${planId}' not found`);

    if (plan.status === PlanStatus.ARCHIVED) {
      throw new ConflictException(`Cannot publish version for archived Plan '${plan.code}'`);
    }

    const version = await this.prisma.planVersion.findFirst({
      where: { id: versionId, planId },
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

    if (version.status === PlanVersionStatus.PUBLISHED) {
      throw new ConflictException(`PlanVersion '${version.version}' is already PUBLISHED.`);
    }

    // Run policy validation
    const pricingDtos = this.queryService.formatPricing(version.pricing).map((p) => ({
      model: p.model as any,
      billingCycle: p.billingCycle as any,
      currency: p.currency,
      baseFee: p.baseFee ? Number(p.baseFee) : undefined,
      perSeatFee: p.perSeatFee ? Number(p.perSeatFee) : undefined,
      flatFee: p.flatFee ? Number(p.flatFee) : undefined,
      setupFee: p.setupFee ? Number(p.setupFee) : undefined,
      minimumCommitmentAmount: p.minimumCommitmentAmount ? Number(p.minimumCommitmentAmount) : undefined,
      discountPercent: p.discountPercent ? Number(p.discountPercent) : undefined,
      taxMode: p.taxMode as any,
      prorationPolicy: p.prorationPolicy as any,
    }));

    const limitDtos = this.queryService.formatLimits(version.limits).map((l) => ({
      limitCode: l.limitCode,
      valueType: l.valueType as any,
      integerValue: l.integerValue ?? undefined,
      decimalValue: l.decimalValue ? Number(l.decimalValue) : undefined,
      booleanValue: l.booleanValue ?? undefined,
      isUnlimited: l.isUnlimited,
      unit: l.unit ?? undefined,
    }));

    const includedModuleCodes = version.modules.map((m) => m.module.code);
    const commercialRules = (version.commercialRule?.rules as any) || {};

    const validationResult = await this.policyService.validateForPublication(
      pricingDtos,
      limitDtos,
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

    // Execute atomic publication transaction
    await this.prisma.$transaction(async (tx) => {
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
    });

    return this.getPlanById(plan.id);
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
