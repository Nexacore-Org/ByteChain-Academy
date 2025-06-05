import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, Matches } from "class-validator"
import { UserRole } from "../../roles/roles.enum"

export class CreateNotificationPreferenceDto {
  @IsUUID()
  userId: string

  @IsEnum(UserRole)
  role: UserRole

  // Notification Categories
  @IsOptional()
  @IsBoolean()
  courseEnrollment?: boolean

  @IsOptional()
  @IsBoolean()
  courseCompletion?: boolean

  @IsOptional()
  @IsBoolean()
  lessonUpdates?: boolean

  @IsOptional()
  @IsBoolean()
  lessonCompletion?: boolean

  @IsOptional()
  @IsBoolean()
  quizResults?: boolean

  @IsOptional()
  @IsBoolean()
  quizReminders?: boolean

  @IsOptional()
  @IsBoolean()
  daoUpdates?: boolean

  @IsOptional()
  @IsBoolean()
  daoProposals?: boolean

  @IsOptional()
  @IsBoolean()
  daoVoting?: boolean

  @IsOptional()
  @IsBoolean()
  systemAnnouncements?: boolean

  @IsOptional()
  @IsBoolean()
  maintenance?: boolean

  @IsOptional()
  @IsBoolean()
  profileUpdates?: boolean

  @IsOptional()
  @IsBoolean()
  passwordChanges?: boolean

  // Delivery Channels
  @IsOptional()
  @IsBoolean()
  viaEmail?: boolean

  @IsOptional()
  @IsBoolean()
  viaInApp?: boolean

  @IsOptional()
  @IsBoolean()
  viaSms?: boolean

  @IsOptional()
  @IsBoolean()
  viaPush?: boolean

  // Timing Preferences
  @IsOptional()
  @IsBoolean()
  instantDelivery?: boolean

  @IsOptional()
  @IsBoolean()
  dailyDigest?: boolean

  @IsOptional()
  @IsBoolean()
  weeklyDigest?: boolean

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "quietHoursStart must be in HH:MM format",
  })
  quietHoursStart?: string

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "quietHoursEnd must be in HH:MM format",
  })
  quietHoursEnd?: string

  @IsOptional()
  @IsString()
  timezone?: string
}
