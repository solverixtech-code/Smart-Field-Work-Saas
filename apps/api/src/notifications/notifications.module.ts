import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { DeviceTokenService } from './device-token.service';
import { FcmPushService } from './fcm-push.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationSettingsService } from './notification-settings.service';
import { PlatformNotificationSettingsController } from './platform-notification-settings.controller';

@Module({
  imports: [PersistenceModule],
  controllers: [NotificationsController, PlatformNotificationSettingsController],
  providers: [NotificationsService, FcmPushService, DeviceTokenService, NotificationSettingsService],
  exports: [NotificationsService, FcmPushService, DeviceTokenService, NotificationSettingsService],
})
export class NotificationsModule {}
