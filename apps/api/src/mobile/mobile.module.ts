import { Module } from '@nestjs/common';
import { MobileController } from './mobile.controller';
import { RuntimeModule } from '../runtime/runtime.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PersistenceModule } from '../persistence/persistence.module';

@Module({
  imports: [RuntimeModule, NotificationsModule, PersistenceModule],
  controllers: [MobileController],
})
export class MobileModule {}
