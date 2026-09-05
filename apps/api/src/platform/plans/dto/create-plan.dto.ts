import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LimitValueTypeEnum } from '../constants/limit-registry';
import {
  PlanVisibilityEnum,
  PricingModelEnum,
  BillingCycleEnum,
  TaxModeEnum,
  ProrationPolicyEnum,
  ExpiryAccessEnum,
  ChangeEffectiveTimingEnum,
} from '../constants/plan-enums';

export class PlanPricingInputDto {
  @IsEnum(PricingModelEnum)
  model!: PricingModelEnum;

  @IsEnum(BillingCycleEnum)
  billingCycle!: BillingCycleEnum;

  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a valid 3-letter ISO-4217 uppercase code' })
  currency!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  perSeatFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  flatFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  setupFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumCommitmentAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsEnum(TaxModeEnum)
  taxMode!: TaxModeEnum;

  @IsEnum(ProrationPolicyEnum)
  prorationPolicy!: ProrationPolicyEnum;
}

export class PlanLimitInputDto {
  @IsString()
  @IsNotEmpty()
  limitCode!: string;

  @IsEnum(LimitValueTypeEnum)
  valueType!: LimitValueTypeEnum;

  @IsOptional()
  @IsInt()
  @Min(0)
  integerValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  decimalValue?: number;

  @IsOptional()
  @IsBoolean()
  booleanValue?: boolean;

  @IsBoolean()
  isUnlimited!: boolean;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class PlanCommercialRuleInputDto {
  @IsBoolean()
  trialEnabled!: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  trialDurationDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  trialSeatLimit?: number;

  @IsString()
  trialModulePolicy!: string;

  @IsBoolean()
  autoConvertAfterTrial!: boolean;

  @IsBoolean()
  autoRenew!: boolean;

  @IsBoolean()
  allowUpgrade!: boolean;

  @IsBoolean()
  allowDowngrade!: boolean;

  @IsEnum(ChangeEffectiveTimingEnum)
  changeEffectiveTiming!: ChangeEffectiveTimingEnum;

  @IsString()
  minimumCommitmentMonths!: string;

  @IsBoolean()
  availableForNewTenants!: boolean;

  @IsBoolean()
  availableForExistingTenants!: boolean;

  @IsBoolean()
  cancellationAllowed!: boolean;

  @IsInt()
  @Min(0)
  @Max(365)
  gracePeriodDays!: number;

  @IsEnum(ExpiryAccessEnum)
  accessAfterExpiry!: ExpiryAccessEnum;
}

export class CreatePlanDto {
  @IsString()
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message: 'Plan code must start with a letter and contain uppercase alphanumeric characters and underscores',
  })
  code!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsString()
  internalDescription?: string;

  @IsEnum(PlanVisibilityEnum)
  visibility!: PlanVisibilityEnum;

  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  recommendedFor?: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex code' })
  color?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanPricingInputDto)
  pricing!: PlanPricingInputDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanLimitInputDto)
  limits!: PlanLimitInputDto[];

  @IsArray()
  @IsString({ each: true })
  includedModuleCodes!: string[];

  @ValidateNested()
  @Type(() => PlanCommercialRuleInputDto)
  commercialRules!: PlanCommercialRuleInputDto;
}
