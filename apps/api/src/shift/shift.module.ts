import { Module } from '@nestjs/common';
import { ShiftService } from './shift.service';
import { ShiftController } from './shift.controller';
import { PersistenceModule } from '../persistence/persistence.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PersistenceModule, AuthModule],
  controllers: [ShiftController],
  providers: [ShiftService],
  exports: [ShiftService],
})
export class ShiftModule {}
