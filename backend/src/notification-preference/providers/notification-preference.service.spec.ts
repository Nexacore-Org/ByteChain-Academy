import { Test, TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { NotFoundException } from "@nestjs/common"
import { NotificationPreferenceService } from "./notification-preference.service"
import { NotificationPreference } from "../entities/notification-preference.entity"
import { UserRole } from "src/roles/roles.enum"
import { NotificationType } from "src/notification/enums/notification.enums"

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>

const createMockRepository = <T = any>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
})

describe("NotificationPreferenceService", () => {
  let service: NotificationPreferenceService
  let repository: MockRepository<NotificationPreference>

  const mockPreference: NotificationPreference = {
    id: "test-id",
    userId: "user-id",
    role: UserRole.STUDENT,
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
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPreferenceService,
        {
          provide: getRepositoryToken(NotificationPreference),
          useValue: createMockRepository(),
        },
      ],
    }).compile()

    service = module.get<NotificationPreferenceService>(NotificationPreferenceService)
    repository = module.get<MockRepository<NotificationPreference>>(getRepositoryToken(NotificationPreference))
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create notification preferences", async () => {
      const createDto = {
        userId: "user-id",
        role: UserRole.STUDENT,
        lessonUpdates: true,
        viaEmail: true,
      }

      repository.create.mockReturnValue(mockPreference)
      repository.save.mockResolvedValue(mockPreference)

      const result = await service.create(createDto)

      expect(repository.create).toHaveBeenCalledWith(createDto)
      expect(repository.save).toHaveBeenCalledWith(mockPreference)
      expect(result).toEqual(mockPreference)
    })
  })

  describe("findByUser", () => {
    it("should return existing preferences", async () => {
      repository.findOne.mockResolvedValue(mockPreference)

      const result = await service.findByUser("user-id", UserRole.STUDENT)

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { userId: "user-id", role: UserRole.STUDENT },
      })
      expect(result).toEqual(mockPreference)
    })

    it("should create default preferences if none exist", async () => {
      repository.findOne.mockResolvedValue(null)
      repository.create.mockReturnValue(mockPreference)
      repository.save.mockResolvedValue(mockPreference)

      const result = await service.findByUser("user-id", UserRole.STUDENT)

      expect(repository.create).toHaveBeenCalledWith({
        userId: "user-id",
        role: UserRole.STUDENT,
      })
      expect(result).toEqual(mockPreference)
    })
  })

  describe("update", () => {
    it("should update preferences", async () => {
      const updateDto = { lessonUpdates: false, viaEmail: false }
      const updatedPreference = { ...mockPreference, ...updateDto }

      repository.findOne.mockResolvedValue(mockPreference)
      repository.save.mockResolvedValue(updatedPreference)

      const result = await service.update("user-id", UserRole.STUDENT, updateDto)

      expect(repository.save).toHaveBeenCalledWith(updatedPreference)
      expect(result).toEqual(updatedPreference)
    })
  })

  describe("remove", () => {
    it("should delete preferences", async () => {
      repository.delete.mockResolvedValue({ affected: 1 })

      await service.remove("user-id", UserRole.STUDENT)

      expect(repository.delete).toHaveBeenCalledWith({
        userId: "user-id",
        role: UserRole.STUDENT,
      })
    })

    it("should throw NotFoundException if preferences not found", async () => {
      repository.delete.mockResolvedValue({ affected: 0 })

      await expect(service.remove("user-id", UserRole.STUDENT)).rejects.toThrow(NotFoundException)
    })
  })

  describe("shouldReceiveNotification", () => {
    beforeEach(() => {
      repository.findOne.mockResolvedValue(mockPreference)
    })

    it("should return true for enabled notification type and channel", async () => {
      const result = await service.shouldReceiveNotification(
        "user-id",
        UserRole.STUDENT,
        NotificationType.LESSON_COMPLETION,
        "inApp",
      )

      expect(result).toBe(true)
    })

    it("should return false for disabled channel", async () => {
      const result = await service.shouldReceiveNotification(
        "user-id",
        UserRole.STUDENT,
        NotificationType.LESSON_COMPLETION,
        "sms",
      )

      expect(result).toBe(false)
    })

    it("should return false for disabled notification type", async () => {
      const disabledPreference = {
        ...mockPreference,
        lessonCompletion: false,
      }
      repository.findOne.mockResolvedValue(disabledPreference)

      const result = await service.shouldReceiveNotification(
        "user-id",
        UserRole.STUDENT,
        NotificationType.LESSON_COMPLETION,
        "inApp",
      )

      expect(result).toBe(false)
    })
  })

  describe("isInQuietHours", () => {
    it("should return false when no quiet hours set", async () => {
      repository.findOne.mockResolvedValue(mockPreference)

      const result = await service.isInQuietHours("user-id", UserRole.STUDENT)

      expect(result).toBe(false)
    })

    it("should check quiet hours correctly", async () => {
      const quietPreference = {
        ...mockPreference,
        quietHoursStart: "22:00",
        quietHoursEnd: "08:00",
        timezone: "UTC",
      }
      repository.findOne.mockResolvedValue(quietPreference)

      // Mock current time to be within quiet hours
      jest.spyOn(Intl.DateTimeFormat.prototype, "format").mockReturnValue("23:30")

      const result = await service.isInQuietHours("user-id", UserRole.STUDENT)

      expect(result).toBe(true)
    })
  })

  describe("resetToDefaults", () => {
    it("should reset preferences to default values", async () => {
      repository.findOne.mockResolvedValue(mockPreference)
      repository.save.mockResolvedValue(mockPreference)

      const result = await service.resetToDefaults("user-id", UserRole.STUDENT)

      expect(repository.save).toHaveBeenCalled()
      expect(result).toEqual(mockPreference)
    })
  })
})
