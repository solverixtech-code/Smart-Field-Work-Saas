import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MobilePunchSwaggerDto {
  @ApiProperty({
    description: 'GPS latitude coordinate (-90 to 90)',
    example: 19.076,
  })
  latitude: number;

  @ApiProperty({
    description: 'GPS longitude coordinate (-180 to 180)',
    example: 72.8777,
  })
  longitude: number;

  @ApiPropertyOptional({
    description: 'Human readable location name',
    example: 'Andheri East Office, Mumbai',
  })
  locationName?: string;

  @ApiPropertyOptional({
    description: 'Selfie or site verification photo URL',
    example: 'https://storage.visibloai.com/photos/punch_123.jpg',
  })
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Unique mobile hardware device ID',
    example: 'dev_iphone_15_pro',
  })
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'Mobile device model string',
    example: 'iPhone 15 Pro Max',
  })
  deviceModel?: string;

  @ApiPropertyOptional({
    description: 'Remarks or note for punch in/out',
    example: 'Client meeting check-in',
  })
  remarks?: string;
}
