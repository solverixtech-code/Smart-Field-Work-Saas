import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import {
  NotificationCategory,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from '../notifications.contract';

export class NotificationQueryDto {
  @ApiPropertyOptional({ description: 'Search term for title or body' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: NotificationStatus })
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @ApiPropertyOptional({ enum: NotificationCategory })
  @IsEnum(NotificationCategory)
  @IsOptional()
  category?: NotificationCategory;

  @ApiPropertyOptional({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  @IsOptional()
  channel?: NotificationChannel;

  @ApiPropertyOptional({ enum: NotificationPriority })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
  @IsNumberString()
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ description: 'Page size', default: 20 })
  @IsNumberString()
  @IsOptional()
  limit?: string;
}
