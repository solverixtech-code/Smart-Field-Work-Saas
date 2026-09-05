import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  Matches,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PlanVisibilityEnum } from '../constants/plan-enums';
import {
  PlanPricingInputDto,
  PlanLimitInputDto,
  PlanCommercialRuleInputDto,
} from './create-plan.dto';

export class UpdatePlanMetadataDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  internalDescription?: string;

  @IsOptional()
  @IsEnum(PlanVisibilityEnum)
  visibility?: PlanVisibilityEnum;

  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  recommendedFor?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex code' })
  color?: string;
}

export class UpdatePlanDraftDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanPricingInputDto)
  pricing?: PlanPricingInputDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlanLimitInputDto)
  limits?: PlanLimitInputDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedModuleCodes?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PlanCommercialRuleInputDto)
  commercialRules?: PlanCommercialRuleInputDto;
}

export class PublishPlanDto {
  @IsOptional()
  @IsBoolean()
  allowBetaModules?: boolean;

  @IsOptional()
  @IsString()
  publishNotes?: string;
}
