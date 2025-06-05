import { IsOptional, IsEnum } from "class-validator"
import { UserRole } from "../../roles/roles.enum"

export class QueryNotificationPreferenceDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}
