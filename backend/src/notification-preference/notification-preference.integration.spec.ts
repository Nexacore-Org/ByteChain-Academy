import { Test, type TestingModule } from "@nestjs/testing"
import { NotificationService } from "../notification/notification.service"
import { getRepositoryToken } from "@nestjs/typeorm"
import { NotificationPreference } from "./entities/notification-preference.entity"
import { Notification } from "../notification/entities/notification.entity"
import { UserRole } from "../roles/roles.enum"
import { NotificationType } from "../notification/enums/notification.enums"
import { NotificationPreferenceService } from "./providers/notification-preference.service"

describe("NotificationPreference Integration", () => {
  let notificationPreferenceService: NotificationPreferenceService
  let notificationService: NotificationService

  const mockPreferenceRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  }

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPreferenceService,
        NotificationService,
        {
          provide: getRepositoryToken(NotificationPreference),
          useValue: mockPreferenceRepository,
        },
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
      ],
    }).compile()

    notificationPreferenceService = module.get<NotificationPreferenceService>(NotificationPreferenceService)
    notificationService = module.get<NotificationService>(NotificationService)
  })

  it("should filter notifications based on user preferences", async () => {
    const userId = "user-id"
    const role = UserRole.STUDENT

    // Mock user preferences - lesson updates disabled
    const mockPreference = {
      id: "pref-id",
      userId,
      role,
      lessonUpdates: false, // Disabled
      viaInApp: true,
      viaEmail: true,
    }

    mockPreferenceRepository.findOne.mockResolvedValue(mockPreference)

    // Test that notification is not sent when preference is disabled
    const shouldReceive = await notificationPreferenceService.shouldReceiveNotification(
      userId,
      role,
      NotificationType.NEW_LESSON,
      "inApp",
    )

    expect(shouldReceive).toBe(false)
  })

  it("should respect channel preferences", async () => {
    const userId = "user-id"
    const role = UserRole.STUDENT

    // Mock user preferences - email disabled, in-app enabled
    const mockPreference = {
      id: "pref-id",
      userId,
      role,
      lessonUpdates: true,
      viaInApp: true,
      viaEmail: false, // Email disabled
    }

    mockPreferenceRepository.findOne.mockResolvedValue(mockPreference)

    // Should receive in-app notification
    const shouldReceiveInApp = await notificationPreferenceService.shouldReceiveNotification(
      userId,
      role,
      NotificationType.NEW_LESSON,
      "inApp",
    )

    // Should not receive email notification
    const shouldReceiveEmail = await notificationPreferenceService.shouldReceiveNotification(
      userId,
      role,
      NotificationType.NEW_LESSON,
      "email",
    )

    expect(shouldReceiveInApp).toBe(true)
    expect(shouldReceiveEmail).toBe(false)
  })

  it("should handle quiet hours correctly", async () => {
    const userId = "user-id"
    const role = UserRole.STUDENT

    // Mock user preferences with quiet hours
    const mockPreference = {
      id: "pref-id",
      userId,
      role,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      timezone: "UTC",
    }

    mockPreferenceRepository.findOne.mockResolvedValue(mockPreference)

    // Mock current time to be within quiet hours (23:30)
    jest.spyOn(Intl.DateTimeFormat.prototype, "format").mockReturnValue("23:30")

    const isInQuietHours = await notificationPreferenceService.isInQuietHours(userId, role)

    expect(isInQuietHours).toBe(true)
  })

  it("should create default preferences for new users", async () => {
    const userId = "new-user-id"
    const role = UserRole.STUDENT

    // Mock no existing preferences
    mockPreferenceRepository.findOne.mockResolvedValue(null)

    // Mock creation of default preferences
    const defaultPreference = {
      id: "new-pref-id",
      userId,
      role,
      lessonUpdates: true,
      viaInApp: true,
      viaEmail: true,
    }

    mockPreferenceRepository.create.mockReturnValue(defaultPreference)
    mockPreferenceRepository.save.mockResolvedValue(defaultPreference)

    const result = await notificationPreferenceService.findByUser(userId, role)

    expect(mockPreferenceRepository.create).toHaveBeenCalledWith({
      userId,
      role,
    })
    expect(result).toEqual(defaultPreference)
  })
})
