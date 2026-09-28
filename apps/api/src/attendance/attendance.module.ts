import { Module } from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { AttendanceController } from "./attendance.controller";
import { PersistenceModule } from "../persistence/persistence.module";
import { AuthModule } from "../auth/auth.module";
import { MediaModule } from "../media/media.module";

@Module({
  imports: [PersistenceModule, AuthModule, MediaModule],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
