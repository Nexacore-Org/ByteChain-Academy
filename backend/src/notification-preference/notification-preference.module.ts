import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { NotificationPreference } from "./entities/notification-preference.entity"
import { NotificationPreferenceController } from "./controllers/notification-preference.controller"
import { NotificationPreferenceService } from "./providers/notification-preference.service"

@Module({
  imports: [TypeOrmModule.forFeature([NotificationPreference])],
  controllers: [NotificationPreferenceController],
  providers: [NotificationPreferenceService],
  exports: [NotificationPreferenceService],
})
export class NotificationPreferenceModule {}
