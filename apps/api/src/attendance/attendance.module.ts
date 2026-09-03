import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { PersistenceModule } from '../persistence/persistence.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PersistenceModule, AuthModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
