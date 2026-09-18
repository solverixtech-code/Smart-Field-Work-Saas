import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { DevicePlatform } from '../notifications.contract';

export class RegisterDeviceTokenDto {
  @ApiProperty({
    description: 'Firebase Cloud Messaging (FCM) device push registration token',
    example: 'dK3b8s9...xL7p',
  })
  @Transform(({ value, obj }) => value || obj?.pushToken || obj?.token)
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiPropertyOptional({
    description: 'Alias for FCM device push registration token sent by mobile clients',
  })
  @IsString()
  @IsOptional()
  pushToken?: string;

  @ApiPropertyOptional({
    enum: DevicePlatform,
    description: 'Operating system / platform of the client device (ANDROID, IOS, WEB)',
    example: DevicePlatform.ANDROID,
  })
  @Transform(({ value, obj }) => {
    const raw = value || obj?.osName || obj?.platform;
    if (typeof raw === 'string' && raw.trim()) {
      const upper = raw.trim().toUpperCase();
      if (upper.includes('ANDROID')) return DevicePlatform.ANDROID;
      if (upper.includes('IOS') || upper.includes('APPLE')) return DevicePlatform.IOS;
      if (upper.includes('WEB')) return DevicePlatform.WEB;
    }
    return DevicePlatform.ANDROID;
  })
  @IsEnum(DevicePlatform)
  @IsOptional()
  platform?: DevicePlatform = DevicePlatform.ANDROID;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deviceName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  model?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  osName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  osVersion?: string | number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  deviceModel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  appVersion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  buildNumber?: string | number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  locale?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  timezone?: string;
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
