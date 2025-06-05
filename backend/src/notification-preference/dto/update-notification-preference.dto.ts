import { PartialType, OmitType } from "@nestjs/mapped-types"
import { CreateNotificationPreferenceDto } from "./create-notification-preference.dto"

export class UpdateNotificationPreferenceDto extends PartialType(
  OmitType(CreateNotificationPreferenceDto, ["userId", "role"] as const),
) {}
