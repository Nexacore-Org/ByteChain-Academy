import { Injectable, NotFoundException } from "@nestjs/common"
import { Repository } from "typeorm"
import { NotificationPreference } from "../entities/notification-preference.entity"
import { CreateNotificationPreferenceDto } from "../dto/create-notification-preference.dto"
import { UserRole } from "src/roles/roles.enum"
import { UpdateNotificationPreferenceDto } from "../dto/update-notification-preference.dto"
import { NotificationType } from "src/notification/enums/notification.enums"
import { InjectRepository } from "@nestjs/typeorm"

@Injectable()
export class NotificationPreferenceService {
  constructor(
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
  ) {}

  /**
   * Create notification preferences for a user
   */
  async create(createDto: CreateNotificationPreferenceDto): Promise<NotificationPreference> {
    const preference = this.preferenceRepository.create(createDto)
    return await this.preferenceRepository.save(preference)
  }

  /**
   * Get user's notification preferences
   */
  async findByUser(userId: string, role: UserRole): Promise<NotificationPreference> {
    let preference = await this.preferenceRepository.findOne({
      where: { userId, role },
    })

    // Create default preferences if none exist
    if (!preference) {
      preference = await this.create({ userId, role })
    }

    return preference
  }

  /**
   * Update user's notification preferences
   */
  async update(
    userId: string,
    role: UserRole,
    updateDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreference> {
    const preference = await this.findByUser(userId, role)

    Object.assign(preference, updateDto)
    return await this.preferenceRepository.save(preference)
  }

  /**
   * Delete user's notification preferences
   */
  async remove(userId: string, role: UserRole): Promise<void> {
    const result = await this.preferenceRepository.delete({ userId, role })
    if (result.affected === 0) {
      throw new NotFoundException("Notification preferences not found")
    }
  }

  /**
   * Check if user wants to receive a specific type of notification via a specific channel
   */
  async shouldReceiveNotification(
    userId: string,
    role: UserRole,
    notificationType: NotificationType,
    channel: "email" | "inApp" | "sms" | "push" = "inApp",
  ): Promise<boolean> {
    const preferences = await this.findByUser(userId, role)

    // Check if the channel is enabled
    const channelEnabled = this.isChannelEnabled(preferences, channel)
    if (!channelEnabled) {
      return false
    }

    // Check if the notification type is enabled
    return this.isNotificationTypeEnabled(preferences, notificationType)
  }

  /**
   * Check if a delivery channel is enabled
   */
  private isChannelEnabled(preferences: NotificationPreference, channel: "email" | "inApp" | "sms" | "push"): boolean {
    switch (channel) {
      case "email":
        return preferences.viaEmail
      case "inApp":
        return preferences.viaInApp
      case "sms":
        return preferences.viaSms
      case "push":
        return preferences.viaPush
      default:
        return false
    }
  }

  /**
   * Check if a notification type is enabled
   */
  private isNotificationTypeEnabled(preferences: NotificationPreference, notificationType: NotificationType): boolean {
    switch (notificationType) {
      case NotificationType.COURSE_ENROLLMENT:
        return preferences.courseEnrollment
      case NotificationType.COURSE_COMPLETION:
        return preferences.courseCompletion
      case NotificationType.NEW_LESSON:
        return preferences.lessonUpdates
      case NotificationType.LESSON_COMPLETION:
        return preferences.lessonCompletion
      case NotificationType.QUIZ_RESULT:
        return preferences.quizResults
      case NotificationType.QUIZ_REMINDER:
        return preferences.quizReminders
      case NotificationType.DAO_UPDATE:
        return preferences.daoUpdates
      case NotificationType.DAO_PROPOSAL:
        return preferences.daoProposals
      case NotificationType.DAO_VOTING:
        return preferences.daoVoting
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return preferences.systemAnnouncements
      case NotificationType.MAINTENANCE:
        return preferences.maintenance
      case NotificationType.PROFILE_UPDATE:
        return preferences.profileUpdates
      case NotificationType.PASSWORD_CHANGE:
        return preferences.passwordChanges
      default:
        return true // Default to allowing unknown notification types
    }
  }

  /**
   * Check if user is in quiet hours
   */
  async isInQuietHours(userId: string, role: UserRole): Promise<boolean> {
    const preferences = await this.findByUser(userId, role)

    if (!preferences.quietHoursStart || !preferences.quietHoursEnd) {
      return false
    }

    const now = new Date()
    const userTimezone = preferences.timezone || "UTC"

    // Convert current time to user's timezone
    const userTime = new Intl.DateTimeFormat("en-US", {
      timeZone: userTimezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    }).format(now)

    const currentTime = userTime.replace(":", "")
    const quietStart = preferences.quietHoursStart.replace(":", "")
    const quietEnd = preferences.quietHoursEnd.replace(":", "")

    // Handle cases where quiet hours span midnight
    if (quietStart <= quietEnd) {
      return currentTime >= quietStart && currentTime <= quietEnd
    } else {
      return currentTime >= quietStart || currentTime <= quietEnd
    }
  }

  /**
   * Get users who want to receive a specific notification type
   */
  async getUsersForNotification(
    notificationType: NotificationType,
    channel: "email" | "inApp" | "sms" | "push" = "inApp",
    role?: UserRole,
  ): Promise<NotificationPreference[]> {
    const queryBuilder = this.preferenceRepository.createQueryBuilder("pref")

    // Add role filter if specified
    if (role) {
      queryBuilder.where("pref.role = :role", { role })
    }

    // Add channel filter
    switch (channel) {
      case "email":
        queryBuilder.andWhere("pref.viaEmail = true")
        break
      case "inApp":
        queryBuilder.andWhere("pref.viaInApp = true")
        break
      case "sms":
        queryBuilder.andWhere("pref.viaSms = true")
        break
      case "push":
        queryBuilder.andWhere("pref.viaPush = true")
        break
    }

    // Add notification type filter
    const typeColumn = this.getNotificationTypeColumn(notificationType)
    if (typeColumn) {
      queryBuilder.andWhere(`pref.${typeColumn} = true`)
    }

    return await queryBuilder.getMany()
  }

  /**
   * Map notification type to database column
   */
  private getNotificationTypeColumn(notificationType: NotificationType): string | null {
    const mapping: Record<NotificationType, string> = {
      [NotificationType.COURSE_ENROLLMENT]: "courseEnrollment",
      [NotificationType.COURSE_COMPLETION]: "courseCompletion",
      [NotificationType.NEW_LESSON]: "lessonUpdates",
      [NotificationType.LESSON_COMPLETION]: "lessonCompletion",
      [NotificationType.QUIZ_RESULT]: "quizResults",
      [NotificationType.QUIZ_REMINDER]: "quizReminders",
      [NotificationType.DAO_UPDATE]: "daoUpdates",
      [NotificationType.DAO_PROPOSAL]: "daoProposals",
      [NotificationType.DAO_VOTING]: "daoVoting",
      [NotificationType.SYSTEM_ANNOUNCEMENT]: "systemAnnouncements",
      [NotificationType.MAINTENANCE]: "maintenance",
      [NotificationType.PROFILE_UPDATE]: "profileUpdates",
      [NotificationType.PASSWORD_CHANGE]: "passwordChanges",
    }

    return mapping[notificationType] || null
  }

  /**
   * Reset preferences to default values
   */
  async resetToDefaults(userId: string, role: UserRole): Promise<NotificationPreference> {
    const preference = await this.findByUser(userId, role)

    // Reset to default values
    Object.assign(preference, {
      courseEnrollment: true,
      courseCompletion: true,
      lessonUpdates: true,
      lessonCompletion: true,
      quizResults: true,
      quizReminders: true,
      daoUpdates: true,
      daoProposals: true,
      daoVoting: true,
      systemAnnouncements: true,
      maintenance: false,
      profileUpdates: true,
      passwordChanges: true,
      viaEmail: true,
      viaInApp: true,
      viaSms: false,
      viaPush: false,
      instantDelivery: true,
      dailyDigest: false,
      weeklyDigest: false,
      quietHoursStart: null,
      quietHoursEnd: null,
      timezone: "UTC",
    })

    return await this.preferenceRepository.save(preference)
  }
}
