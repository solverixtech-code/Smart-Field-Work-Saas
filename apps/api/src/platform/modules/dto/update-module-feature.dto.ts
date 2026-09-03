import { IsString, IsOptional, IsEnum, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ModuleFeatureStatus } from '@prisma/client';

export class UpdateModuleFeatureDto {
  @ApiPropertyOptional({
    description: 'Presentation feature name',
    example: 'Lead Management & Workflows',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Presentation feature description',
    example: 'Lead capture, editing and assignment workflows.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: ModuleFeatureStatus,
    description: 'Feature lifecycle status (ACTIVE, BETA, DEPRECATED)',
  })
  @IsOptional()
  @IsEnum(ModuleFeatureStatus)
  status?: ModuleFeatureStatus;

  @ApiPropertyOptional({
    description: 'Sort display order index',
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
}
