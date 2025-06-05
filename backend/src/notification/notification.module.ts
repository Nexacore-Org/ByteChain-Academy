import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { NotificationController } from "./notification.controller"
import { NotificationService } from "./notification.service"
import { Notification } from "./entities/notification.entity"
import { NotificationPreferenceModule } from "../notification-preference/notification-preference.module"

@Module({
  imports: [TypeOrmModule.forFeature([Notification]), NotificationPreferenceModule],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
