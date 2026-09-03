import {
  IsString,
  IsNotEmpty,
  Matches,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
  IsOptional,
  IsInt,
  IsArray,
} from 'class-validator';
import { PlatformModuleCategory, PlatformModuleStatus } from '@prisma/client';

export class CreatePlatformModuleDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Module code must be lowercase snake_case starting with a letter',
  })
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(PlatformModuleCategory)
  category: PlatformModuleCategory;

  @IsOptional()
  @IsEnum(PlatformModuleStatus)
  status?: PlatformModuleStatus = PlatformModuleStatus.ACTIVE;

  @IsOptional()
  @IsBoolean()
  requiredBySystem?: boolean = false;

  @IsOptional()
  @IsInt()
  displayOrder?: number = 0;

  @IsOptional()
  @IsString()
  internalNotes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencyCodes?: string[];
}
