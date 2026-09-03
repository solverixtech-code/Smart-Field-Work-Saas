import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlatformModuleStatus } from '@prisma/client';

export class UpdatePlatformModuleDto {
  @ApiPropertyOptional({
    enum: PlatformModuleStatus,
    description: 'Operational lifecycle status (ACTIVE, BETA, DEPRECATED)',
    example: PlatformModuleStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PlatformModuleStatus)
  status?: PlatformModuleStatus;

  @ApiPropertyOptional({
    description: 'Internal admin operational notes',
    example: 'Verified for enterprise deployment.',
  })
  @IsOptional()
  @IsString()
  internalNotes?: string;
}
