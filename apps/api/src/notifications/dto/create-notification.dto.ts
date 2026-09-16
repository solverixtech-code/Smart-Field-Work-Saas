import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  AudienceType,
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
} from '../notifications.contract';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Notification title',
    example: 'Urgent: Shift Route Update in West Delhi Zone',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Notification body markdown or text',
    example: 'Please check your newly assigned route in Dwarka Sector 12 before 2:00 PM.',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    enum: NotificationChannel,
    isArray: true,
    description: 'Delivery channels to send this notification through',
    example: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
  })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @ApiProperty({
    enum: NotificationCategory,
    description: 'Category classification',
    example: NotificationCategory.ANNOUNCEMENT,
  })
  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @ApiPropertyOptional({
    enum: NotificationPriority,
    description: 'Delivery priority',
    default: NotificationPriority.NORMAL,
    example: NotificationPriority.HIGH,
  })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @ApiProperty({
    enum: AudienceType,
    description: 'Target audience scope',
    example: AudienceType.ALL_EXECUTIVES,
  })
  @IsEnum(AudienceType)
  audienceType: AudienceType;

  @ApiPropertyOptional({
    description: 'Role identifiers when audienceType = BY_ROLE',
    example: ['field_executive', 'team_leader'],
  })
  @IsArray()
  @IsOptional()
  targetRoles?: string[];

  @ApiPropertyOptional({
    description: 'Territory identifiers or names when audienceType = BY_TERRITORY',
    example: ['West Delhi', 'Noida Phase 2'],
  })
  @IsArray()
  @IsOptional()
  targetTerritories?: string[];

  @ApiPropertyOptional({
    description: 'Specific membership IDs when audienceType = SPECIFIC_EXECUTIVES',
    example: ['cm...1', 'cm...2'],
  })
  @IsArray()
  @IsOptional()
  targetMembershipIds?: string[];

  @ApiPropertyOptional({
    description: 'Optional ISO scheduled datetime (null = send immediately)',
    example: '2026-09-17T09:00:00Z',
  })
  @IsString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({
    description: 'Deep link URL or in-app route to open on tap',
    example: '/executive/routes/active',
  })
  @IsString()
  @IsOptional()
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Optional arbitrary JSON data payload for mobile push clients',
  })
  @IsOptional()
  dataPayload?: Record<string, any>;
}
