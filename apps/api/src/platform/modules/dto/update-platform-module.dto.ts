import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsInt,
  IsArray,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlatformModuleCategory, PlatformModuleStatus } from '@prisma/client';

export class UpdatePlatformModuleDto {
  @ApiPropertyOptional({
    description: 'Updated presentation display title',
    example: 'Core CRM & Lead Management',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated presentation description',
    example: 'Lead capture, pipeline stages, lead assignment, territory routing & account management.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: PlatformModuleCategory,
    description: 'Module classification category',
  })
  @IsOptional()
  @IsEnum(PlatformModuleCategory)
  category?: PlatformModuleCategory;

  @ApiPropertyOptional({
    enum: PlatformModuleStatus,
    description: 'Lifecycle status (ACTIVE, BETA, DEPRECATED)',
  })
  @IsOptional()
  @IsEnum(PlatformModuleStatus)
  status?: PlatformModuleStatus;

  @ApiPropertyOptional({
    description: 'Whether module is required by system',
  })
  @IsOptional()
  @IsBoolean()
  requiredBySystem?: boolean;

  @ApiPropertyOptional({
    description: 'Display order index',
  })
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Internal admin operational notes',
  })
  @IsOptional()
  @IsString()
  internalNotes?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of prerequisite module codes',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencyCodes?: string[];
}
