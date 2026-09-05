import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../persistence/prisma.service';
import { PlatformModulesService } from '../modules/platform-modules.service';
import {
  CreatePlanDto,
  PlanPricingInputDto,
  PlanLimitInputDto,
  PlanCommercialRuleInputDto,
} from './dto/create-plan.dto';
import { PublishPlanDto } from './dto/update-plan.dto';
import { PLAN_LIMIT_REGISTRY } from './constants/limit-registry';
import { PlatformModuleStatus } from '@prisma/client';

export interface PublicationValidationResult {
  isValid: boolean;
  errors: Array<{ code: string; message: string }>;
  warnings: Array<{ code: string; message: string }>;
}

@Injectable()
export class PlanPublicationPolicyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly modulesService: PlatformModulesService,
  ) {}

  async validateForPublication(
    pricing: PlanPricingInputDto[],
    limits: PlanLimitInputDto[],
    includedModuleCodes: string[],
    commercialRules: PlanCommercialRuleInputDto,
    publishDto?: PublishPlanDto,
  ): Promise<PublicationValidationResult> {
    const errors: Array<{ code: string; message: string }> = [];
    const warnings: Array<{ code: string; message: string }> = [];

    // 1. Pricing validation
    if (!pricing || pricing.length === 0) {
      errors.push({
        code: 'PLAN_PRICING_INVALID',
        message: 'At least one billing cycle pricing entry is required.',
      });
    } else {
      for (const p of pricing) {
        if (p.model === 'PER_USER' && (p.perSeatFee === undefined || p.perSeatFee === null)) {
          errors.push({
            code: 'PLAN_PRICING_INVALID',
            message: `PER_USER pricing model requires perSeatFee for billing cycle ${p.billingCycle}`,
          });
        }
        if (p.model === 'BASE_PLUS_PER_USER') {
          if (p.baseFee === undefined || p.baseFee === null || p.perSeatFee === undefined || p.perSeatFee === null) {
            errors.push({
              code: 'PLAN_PRICING_INVALID',
              message: `BASE_PLUS_PER_USER model requires baseFee and perSeatFee for billing cycle ${p.billingCycle}`,
            });
          }
        }
        if (p.model === 'FLAT' && (p.flatFee === undefined || p.flatFee === null)) {
          errors.push({
            code: 'PLAN_PRICING_INVALID',
            message: `FLAT pricing model requires flatFee for billing cycle ${p.billingCycle}`,
          });
        }
      }
    }

    // 2. Limits validation
    const minSeatsLimit = limits.find((l) => l.limitCode === 'minimum_seats');
    const defaultSeatsLimit = limits.find((l) => l.limitCode === 'default_seat_limit');
    const maxSeatsLimit = limits.find((l) => l.limitCode === 'maximum_seats');

    const minSeats = minSeatsLimit?.integerValue ?? 1;
    const defaultSeats = defaultSeatsLimit?.integerValue ?? minSeats;
    const maxSeats = maxSeatsLimit?.isUnlimited ? Infinity : (maxSeatsLimit?.integerValue ?? defaultSeats);

    if (minSeats < 1) {
      errors.push({
        code: 'PLAN_LIMIT_INVALID',
        message: 'minimum_seats must be at least 1',
      });
    }

    if (defaultSeats < minSeats) {
      errors.push({
        code: 'PLAN_LIMIT_INVALID',
        message: `default_seat_limit (${defaultSeats}) cannot be less than minimum_seats (${minSeats})`,
      });
    }

    if (maxSeats < defaultSeats) {
      errors.push({
        code: 'PLAN_LIMIT_INVALID',
        message: `maximum_seats (${maxSeats}) cannot be less than default_seat_limit (${defaultSeats})`,
      });
    }

    // Validate limit codes against limit registry
    for (const l of limits) {
      if (!PLAN_LIMIT_REGISTRY[l.limitCode]) {
        errors.push({
          code: 'PLAN_LIMIT_UNKNOWN',
          message: `Unknown limit code '${l.limitCode}' is not in limit registry`,
        });
      }
    }

    // 3. Module validation & dependency closure
    const canonicalCatalog = await this.modulesService.getCanonicalCatalog();

    // Check system required modules
    const systemRequiredModules = canonicalCatalog.filter((m) => m.requiredBySystem);
    for (const reqModule of systemRequiredModules) {
      if (!includedModuleCodes.includes(reqModule.code)) {
        errors.push({
          code: 'PLAN_REQUIRED_MODULE_MISSING',
          message: `System-required module '${reqModule.code}' (${reqModule.name}) must be included in published plan`,
        });
      }
    }

    // Check module codes existence, lifecycle, and dependency closure
    for (const code of includedModuleCodes) {
      // Obsolete alias check
      if (code === 'attendance_plus' || code === 'payroll_engine') {
        errors.push({
          code: 'PLAN_MODULE_ALIAS_PROHIBITED',
          message: `Obsolete module alias '${code}' is prohibited. Use canonical code.`,
        });
        continue;
      }

      const registeredModule = canonicalCatalog.find((m) => m.code === code);
      if (!registeredModule) {
        errors.push({
          code: 'PLAN_MODULE_UNKNOWN',
          message: `Module code '${code}' does not exist in canonical platform catalog`,
        });
        continue;
      }

      // Check status
      if (registeredModule.status === PlatformModuleStatus.DEPRECATED || registeredModule.status === PlatformModuleStatus.ARCHIVED) {
        errors.push({
          code: 'PLAN_MODULE_LIFECYCLE_INVALID',
          message: `Module '${code}' has lifecycle status '${registeredModule.status}' and cannot be published in new plans`,
        });
      } else if (registeredModule.status === PlatformModuleStatus.BETA) {
        if (!publishDto?.allowBetaModules) {
          warnings.push({
            code: 'PLAN_MODULE_BETA_INCLUDED',
            message: `Module '${code}' is currently in BETA. Explicit acknowledgement is required.`,
          });
        }
      }

      // Dependency closure check
      if (registeredModule.dependencies && registeredModule.dependencies.length > 0) {
        for (const dep of registeredModule.dependencies) {
          if (!includedModuleCodes.includes(dep.dependsOnModuleCode)) {
            errors.push({
              code: 'PLAN_MODULE_DEPENDENCY_MISSING',
              message: `Module '${code}' requires dependency '${dep.dependsOnModuleCode}', which is not included in the plan`,
            });
          }
        }
      }
    }

    // 4. Commercial rules validation
    if (commercialRules.trialEnabled) {
      if (!commercialRules.trialDurationDays || commercialRules.trialDurationDays < 1) {
        errors.push({
          code: 'PLAN_COMMERCIAL_RULE_INVALID',
          message: 'trialDurationDays must be at least 1 when trial is enabled',
        });
      }
    }

    if (commercialRules.gracePeriodDays < 0 || commercialRules.gracePeriodDays > 365) {
      errors.push({
        code: 'PLAN_COMMERCIAL_RULE_INVALID',
        message: 'gracePeriodDays must be between 0 and 365',
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
