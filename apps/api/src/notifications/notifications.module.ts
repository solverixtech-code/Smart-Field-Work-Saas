import { Module } from '@nestjs/common';
import { PersistenceModule } from '../persistence/persistence.module';
import { DeviceTokenService } from './device-token.service';
import { FcmPushService } from './fcm-push.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [PersistenceModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, FcmPushService, DeviceTokenService],
  exports: [NotificationsService, FcmPushService, DeviceTokenService],
})
export class NotificationsModule {}
