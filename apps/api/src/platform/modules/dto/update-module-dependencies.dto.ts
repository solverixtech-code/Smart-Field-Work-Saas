import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateModuleDependenciesDto {
  @ApiProperty({
    type: [String],
    description: 'List of prerequisite module codes required by this module',
    example: ['core_crm', 'field_visits'],
  })
  @IsArray()
  @IsString({ each: true })
  dependencyCodes: string[];
}
