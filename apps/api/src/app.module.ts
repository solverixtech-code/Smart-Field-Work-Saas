import { Module } from '@nestjs/common';
import { CrmModule } from './crm/crm.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { validationSchemaForEnv } from './config/environment-variables';
import { PersistenceModule } from './persistence/persistence.module';
import { RedisModule } from './redis/redis.module';
import { AuthSecurityModule } from './common/security/auth-security.module';
import { AuthModule } from './auth/auth.module';
import { ShiftModule } from './shift/shift.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollModule } from './payroll/payroll.module';
import { PlatformModulesModule } from './platform/modules/platform-modules.module';
import { PlatformTenantsModule } from './platform/tenants/platform-tenants.module';
import { PlatformPlansModule } from './platform/plans/platform-plans.module';
import { PlatformSubscriptionsModule } from './platform/subscriptions/platform-subscriptions.module';
import { PlatformIndustriesModule } from './platform/industries/platform-industries.module';
import { PlatformMastersModule } from './platform/masters/platform-masters.module';
import { RuntimeModule } from './runtime/runtime.module';
import { ApiThrottlerGuard } from './common/guards/api-throttler.guard';
import { ZodExceptionFilter } from './common/filters/zod-exception.filter';
import { RedisThrottlerStorage } from './common/throttling/redis-throttler.storage';
import { ThrottlingModule } from './common/throttling/throttling.module';
import { RepositoriesModule } from './repositories/repositories.module';

import { AppController } from './app.controller';
import { ObservabilityModule } from './observability/observability.module';
import { ReadinessModule } from './observability/readiness.module';
import { AuditModule } from './audit/audit.module';
import { MediaModule } from './media/media.module';
import { OperationsModule } from './jobs/operations.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: validationSchemaForEnv,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ThrottlingModule],
      inject: [ConfigService, RedisThrottlerStorage],
      useFactory: (
        configService: ConfigService,
        redisThrottlerStorage: RedisThrottlerStorage,
      ) => ({
        storage: redisThrottlerStorage,
        throttlers: [
          {
            name: 'default',
            ttl: configService.getOrThrow<number>('RATE_LIMIT_TTL_MS'),
            limit: configService.getOrThrow<number>('RATE_LIMIT_LIMIT'),
          },
        ],
      }),
    }),
    RedisModule,
    ThrottlingModule,
    AuthSecurityModule,
    PersistenceModule,
    RepositoriesModule,
    AuthModule,
    ShiftModule,
    AttendanceModule,
    PayrollModule,
    PlatformModulesModule,
    PlatformTenantsModule,
    PlatformPlansModule,
    PlatformSubscriptionsModule,
    PlatformIndustriesModule,
    PlatformMastersModule,
    RuntimeModule,
    ObservabilityModule,
    ReadinessModule,
    AuditModule,
    MediaModule,
    OperationsModule,
    CrmModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ZodExceptionFilter,
    },
  ],
})
export class AppModule {}
