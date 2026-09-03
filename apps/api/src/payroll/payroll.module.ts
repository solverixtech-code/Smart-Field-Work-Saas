import { Module } from '@nestjs/common';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { PersistenceModule } from '../persistence/persistence.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PersistenceModule, AuthModule],
  controllers: [PayrollController],
  providers: [PayrollService],
  exports: [PayrollService],
})
export class PayrollModule {}
