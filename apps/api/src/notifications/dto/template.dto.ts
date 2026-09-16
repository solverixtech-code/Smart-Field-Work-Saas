import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
} from '../notifications.contract';

export class CreateNotificationTemplateDto {
  @ApiProperty({
    description: 'Template title name',
    example: 'Daily Attendance Reminder',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: NotificationCategory,
    description: 'Category of the template',
    example: NotificationCategory.SYSTEM_UPDATE,
  })
  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @ApiProperty({
    description: 'Title template with placeholders like {{executive_name}}',
    example: 'Reminder: Punch in today, {{executive_name}}',
  })
  @IsString()
  @IsNotEmpty()
  titleTemplate: string;

  @ApiProperty({
    description: 'Body template with placeholders like {{shift_time}}',
    example: 'Your shift begins at {{shift_time}}. Please complete geolocation check-in.',
  })
  @IsString()
  @IsNotEmpty()
  bodyTemplate: string;

  @ApiPropertyOptional({
    enum: NotificationChannel,
    isArray: true,
    example: [NotificationChannel.PUSH, NotificationChannel.IN_APP],
  })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @IsOptional()
  defaultChannels?: NotificationChannel[];

  @ApiPropertyOptional({
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
  })
  @IsEnum(NotificationPriority)
  @IsOptional()
  defaultPriority?: NotificationPriority;

  @ApiPropertyOptional({
    description: 'Available placeholder variables',
    example: ['executive_name', 'shift_time', 'territory_name'],
  })
  @IsArray()
  @IsOptional()
  placeholders?: string[];
}

export class UpdateNotificationTemplateDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: NotificationCategory })
  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titleTemplate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bodyTemplate?: string;

  @ApiPropertyOptional({ enum: NotificationChannel, isArray: true })
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  @IsOptional()
  defaultChannels?: NotificationChannel[];

  @ApiPropertyOptional({ enum: NotificationPriority })
  @IsEnum(NotificationPriority)
  @IsOptional()
  defaultPriority?: NotificationPriority;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  placeholders?: string[];

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
