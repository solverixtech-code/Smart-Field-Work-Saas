import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DevicePlatform } from '../notifications.contract';

export class RegisterDeviceTokenDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging (FCM) device push registration token',
    example: 'dK3b8s9...xL7p',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    enum: DevicePlatform,
    description: 'Operating system / platform of the client device',
    example: DevicePlatform.ANDROID,
  })
  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @ApiPropertyOptional({
    description: 'Device hardware model',
    example: 'Samsung Galaxy S23 Ultra',
  })
  @IsString()
  @IsOptional()
  deviceModel?: string;

  @ApiPropertyOptional({
    description: 'Field executive or web application build version',
    example: '2.4.0',
  })
  @IsString()
  @IsOptional()
  appVersion?: string;
}

export class UnregisterDeviceTokenDto {
  @ApiProperty({
    description: 'FCM push registration token to unregister/deactivate',
    example: 'dK3b8s9...xL7p',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
