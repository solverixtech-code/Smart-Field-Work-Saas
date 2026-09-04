import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';

export class MobilePunchSwaggerDto {
  @ApiProperty({
    description: 'GPS latitude coordinate (-90 to 90)',
    example: 19.076,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'GPS longitude coordinate (-180 to 180)',
    example: 72.8777,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;

  @ApiPropertyOptional({
    description: 'Human readable location name',
    example: 'Andheri East Office, Mumbai',
  })
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional({
    description: 'Selfie or site verification photo URL',
    example: 'https://storage.visibloai.com/photos/punch_123.jpg',
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Unique mobile hardware device ID',
    example: 'dev_iphone_15_pro',
  })
  @IsOptional()
  @IsString()
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'Mobile device model string',
    example: 'iPhone 15 Pro Max',
  })
  @IsOptional()
  @IsString()
  deviceModel?: string;

  @ApiPropertyOptional({
    description: 'Remarks or note for punch in/out',
    example: 'Client meeting check-in',
  })
  @IsOptional()
  @IsString()
  remarks?: string;
}
