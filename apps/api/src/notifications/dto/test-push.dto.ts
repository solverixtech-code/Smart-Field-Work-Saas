import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SendTestPushDto {
  @ApiPropertyOptional({
    description: 'Target FCM push token (if sending directly to a token)',
    example: 'dK3b8s9...xL7p',
  })
  @IsString()
  @IsOptional()
  fcmToken?: string;

  @ApiPropertyOptional({
    description: 'Target tenant membership ID (if sending to an executive in current workspace)',
    example: 'cm...123',
  })
  @IsString()
  @IsOptional()
  targetMembershipId?: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Test Push: Visiblo Field Work App',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Notification body message',
    example: 'FCM Push tokens are live and delivering successfully to your device!',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    description: 'Deep link route or URL',
    example: '/executive/dashboard',
  })
  @IsString()
  @IsOptional()
  actionUrl?: string;
}
