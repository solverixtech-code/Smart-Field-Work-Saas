import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { StorageService } from '../common/services/storage.service';
import { AuthSecurityModule } from '../common/security/auth-security.module';
import { PlatformTenantsModule } from '../platform/tenants/platform-tenants.module';

@Module({
  imports: [AuthSecurityModule, PlatformTenantsModule],
  controllers: [AuthController],
  providers: [AuthService, EmailService, SmsService, StorageService],
  exports: [AuthService, StorageService],
})
export class AuthModule {}
