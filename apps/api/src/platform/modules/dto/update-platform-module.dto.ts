import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  IsInt,
  IsArray,
} from 'class-validator';
import { PlatformModuleCategory, PlatformModuleStatus } from '@prisma/client';

export class UpdatePlatformModuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PlatformModuleCategory)
  category?: PlatformModuleCategory;

  @IsOptional()
  @IsEnum(PlatformModuleStatus)
  status?: PlatformModuleStatus;

  @IsOptional()
  @IsBoolean()
  isAddon?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyPrice?: number;

  @IsOptional()
  @IsBoolean()
  requiredBySystem?: boolean;

  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencyCodes?: string[];
}
