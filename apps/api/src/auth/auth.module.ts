import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { StorageService } from '../common/services/storage.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PlatformTenantsModule } from '../platform/tenants/platform-tenants.module';

@Module({
  imports: [
    PlatformTenantsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, SmsService, StorageService, JwtAuthGuard],
  exports: [AuthService, JwtAuthGuard, JwtModule, StorageService],
})
export class AuthModule {}
