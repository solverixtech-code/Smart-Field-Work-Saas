import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ModuleFeatureStatus } from '@prisma/client';

export class UpdateModuleFeatureDto {
  @ApiPropertyOptional({
    enum: ModuleFeatureStatus,
    description: 'Feature lifecycle status (ACTIVE, BETA, DEPRECATED)',
  })
  @IsOptional()
  @IsEnum(ModuleFeatureStatus)
  status?: ModuleFeatureStatus;

  @ApiPropertyOptional({
    description: 'Internal admin operational notes',
  })
  @IsOptional()
  @IsString()
  internalNotes?: string;
}
