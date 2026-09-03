import {
  IsString,
  IsNotEmpty,
  Matches,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ModuleFeatureStatus } from '@prisma/client';

export class CreateModuleFeatureDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z][a-z0-9_]*$/, {
    message: 'Feature code must be lowercase snake_case starting with a letter',
  })
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsEnum(ModuleFeatureStatus)
  status?: ModuleFeatureStatus = ModuleFeatureStatus.ACTIVE;

  @IsOptional()
  @IsBoolean()
  platformSupport?: boolean = true;

  @IsOptional()
  @IsInt()
  displayOrder?: number = 0;
}
