import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentPrincipal } from '../common/decorators/current-principal.decorator';
import { RequirePermissions } from '../common/decorators/require-permissions.decorator';
import { TenantAuthorized } from '../common/decorators/tenant-authorized.decorator';
import { RequestPrincipal } from '../common/security/request-principal.interface';
import { DeviceTokenService } from './device-token.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import {
  RegisterDeviceTokenDto,
  UnregisterDeviceTokenDto,
} from './dto/register-device.dto';
import {
  CreateNotificationTemplateDto,
  UpdateNotificationTemplateDto,
} from './dto/template.dto';
import { SendTestPushDto } from './dto/test-push.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Tenant CRM Notifications')
@ApiBearerAuth()
@Controller('tenant/crm/notifications')
@TenantAuthorized()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {}

  @Get('overview')
  @RequirePermissions('crm.notifications.view')
  @ApiOperation({ summary: 'Get notification center metrics overview' })
  async getOverview(@CurrentPrincipal() p: RequestPrincipal) {
    return this.notificationsService.getOverviewMetrics(p.tenantId!);
  }

  @Get()
  @RequirePermissions('crm.notifications.view')
  @ApiOperation({ summary: 'List notification campaigns with filters' })
  async listCampaigns(
    @CurrentPrincipal() p: RequestPrincipal,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.listCampaigns(p.tenantId!, query);
  }

  @Post()
  @RequirePermissions('crm.notifications.send')
  @ApiOperation({ summary: 'Create and dispatch a new notification campaign' })
  async createNotification(
    @CurrentPrincipal() p: RequestPrincipal,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationsService.createNotification(
      p.tenantId!,
      p.userId,
      dto,
    );
  }

  @Post('test-push')
  @RequirePermissions('crm.notifications.send')
  @ApiOperation({ summary: 'Send test push notification to a device' })
  async sendTestPush(
    @CurrentPrincipal() p: RequestPrincipal,
    @Body() dto: SendTestPushDto,
  ) {
    return this.notificationsService.sendTestPush(p.tenantId!, p.userId, dto);
  }

  @Post('executive-alert')
  @RequirePermissions('crm.notifications.send')
  @ApiOperation({ summary: 'Broadcast urgent executive alert' })
  async sendExecutiveAlert(
    @CurrentPrincipal() p: RequestPrincipal,
    @Body()
    dto: {
      title: string;
      message: string;
      priority: 'HIGH' | 'URGENT';
      targetRoles?: string[];
      actionUrl?: string;
    },
  ) {
    return this.notificationsService.sendExecutiveAlert(
      p.tenantId!,
      p.userId,
      dto,
    );
  }

  @Get('push-tokens')
  @RequirePermissions('crm.notifications.view')
  @ApiOperation({ summary: 'Get active FCM push tokens and device list' })
  async getPushTokens(@CurrentPrincipal() p: RequestPrincipal) {
    return this.deviceTokenService.getPushTokensOverview(p.tenantId!);
  }

  @Post('devices/register')
  @ApiOperation({ summary: 'Register FCM device push token for executive' })
  async registerDevice(
    @CurrentPrincipal() p: RequestPrincipal,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    return this.deviceTokenService.registerToken(
      p.userId,
      p.membershipId,
      p.tenantId!,
      dto,
    );
  }

  @Post('devices/unregister')
  @HttpCode(200)
  @ApiOperation({ summary: 'Deactivate FCM push token upon logout' })
  async unregisterDevice(@CurrentPrincipal() p: RequestPrincipal, @Body() dto: UnregisterDeviceTokenDto) {
    return this.deviceTokenService.unregisterToken(dto.token, p.userId, p.tenantId!);
  }

  @Get('in-app')
  @ApiOperation({ summary: 'Get user in-app notification feed (bell dropdown)' })
  async getInAppFeed(@CurrentPrincipal() p: RequestPrincipal) {
    return this.notificationsService.getUserInAppNotifications(
      p.userId,
      p.tenantId!,
    );
  }

  @Patch('in-app/:logId/read')
  @ApiOperation({ summary: 'Mark specific in-app notification as read' })
  async markRead(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param('logId') logId: string,
  ) {
    return this.notificationsService.markNotificationAsRead(logId, p.userId);
  }

  @Patch('in-app/read-all')
  @ApiOperation({ summary: 'Mark all in-app notifications as read' })
  async markAllRead(@CurrentPrincipal() p: RequestPrincipal) {
    return this.notificationsService.markAllNotificationsAsRead(
      p.userId,
      p.tenantId!,
    );
  }

  // ----------------------------------------------------
  // TEMPLATES
  // ----------------------------------------------------

  @Get('templates')
  @RequirePermissions('crm.notifications.view')
  @ApiOperation({ summary: 'List notification templates' })
  async listTemplates(@CurrentPrincipal() p: RequestPrincipal) {
    return this.notificationsService.listTemplates(p.tenantId!);
  }

  @Post('templates')
  @RequirePermissions('crm.notifications.manage')
  @ApiOperation({ summary: 'Create notification template' })
  async createTemplate(
    @CurrentPrincipal() p: RequestPrincipal,
    @Body() dto: CreateNotificationTemplateDto,
  ) {
    return this.notificationsService.createTemplate(p.tenantId!, dto);
  }

  @Patch('templates/:id')
  @RequirePermissions('crm.notifications.manage')
  @ApiOperation({ summary: 'Update notification template' })
  async updateTemplate(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param('id') id: string,
    @Body() dto: UpdateNotificationTemplateDto,
  ) {
    return this.notificationsService.updateTemplate(p.tenantId!, id, dto);
  }

  @Delete('templates/:id')
  @HttpCode(204)
  @RequirePermissions('crm.notifications.manage')
  @ApiOperation({ summary: 'Soft delete / deactivate notification template' })
  async deleteTemplate(
    @CurrentPrincipal() p: RequestPrincipal,
    @Param('id') id: string,
  ) {
    return this.notificationsService.deleteTemplate(p.tenantId!, id);
  }
}
