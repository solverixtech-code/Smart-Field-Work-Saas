import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { validationSchemaForEnv } from './config/environment-variables';
import { PersistenceModule } from './persistence/persistence.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { ShiftModule } from './shift/shift.module';
import { AttendanceModule } from './attendance/attendance.module';
import { PayrollModule } from './payroll/payroll.module';
import { ApiThrottlerGuard } from './common/guards/api-throttler.guard';
import { RedisThrottlerStorage } from './common/throttling/redis-throttler.storage';
import { ThrottlingModule } from './common/throttling/throttling.module';

@Module({
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
    PersistenceModule,
    AuthModule,
    ShiftModule,
    AttendanceModule,
    PayrollModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ApiThrottlerGuard,
    },
  ],
})
export class AppModule {}
