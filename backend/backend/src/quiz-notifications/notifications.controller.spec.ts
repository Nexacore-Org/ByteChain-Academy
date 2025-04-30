import { Test, type TestingModule } from "@nestjs/testing"
import { NotificationsController } from "./notifications.controller"
import { NotificationsService } from "./notifications.service"
import {
  type Notification,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from "./entities/notification.entity"
import type { CreateNotificationDto } from "./dto/create-notification.dto"
import type { UpdateNotificationDto } from "./dto/update-notification.dto"
import { NotificationResponseDto } from "./dto/notification-response.dto"

// Mock user for testing
const mockUser = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  name: "Test User",
}

// Mock notification for testing
const mockNotification: Notification = {
  id: "123e4567-e89b-12d3-a456-426614174001",
  title: "Test Notification",
  content: "This is a test notification",
  type: NotificationType.QUIZ_COMPLETED,
  channel: NotificationChannel.IN_APP,
  status: NotificationStatus.PENDING,
  referenceId: "123e4567-e89b-12d3-a456-426614174002",
  metadata: { test: "data" },
  recipient: mockUser as any,
  createdAt: new Date(),
  updatedAt: new Date(),
  readAt: null,
}

describe("NotificationsController", () => {
  let controller: NotificationsController
  let service: NotificationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockNotification),
            findAll: jest.fn().mockResolvedValue([mockNotification]),
            findOne: jest.fn().mockResolvedValue(mockNotification),
            update: jest.fn().mockResolvedValue(mockNotification),
            markAsRead: jest.fn().mockResolvedValue(mockNotification),
            remove: jest.fn().mockResolvedValue(undefined),
            countUnread: jest.fn().mockResolvedValue(5),
          },
        },
      ],
    }).compile()

    controller = module.get<NotificationsController>(NotificationsController)
    service = module.get<NotificationsService>(NotificationsService)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("create", () => {
    it("should create a notification", async () => {
      const createNotificationDto: CreateNotificationDto = {
        title: "Test Notification",
        content: "This is a test notification",
        type: NotificationType.QUIZ_COMPLETED,
        recipientId: mockUser.id,
      }

      const result = await controller.create(createNotificationDto)

      expect(service.create).toHaveBeenCalledWith(createNotificationDto)
      expect(result).toBeInstanceOf(NotificationResponseDto)
      expect(result.id).toBe(mockNotification.id)
    })
  })

  describe("findAll", () => {
    it("should return an array of notifications", async () => {
      const result = await controller.findAll()

      expect(service.findAll).toHaveBeenCalled()
      expect(result).toHaveLength(1)
      expect(result[0]).toBeInstanceOf(NotificationResponseDto)
    })

    it("should filter by userId if provided", async () => {
      const userId = mockUser.id
      const result = await controller.findAll(userId)

      expect(service.findAll).toHaveBeenCalledWith(userId)
      expect(result).toHaveLength(1)
    })
  })

  describe("findMyNotifications", () => {
    it("should return current user notifications", async () => {
      const userId = mockUser.id
      const result = await controller.findMyNotifications(userId)

      expect(service.findAll).toHaveBeenCalledWith(userId)
      expect(result).toHaveLength(1)
      expect(result[0]).toBeInstanceOf(NotificationResponseDto)
    })
  })

  describe("countUnread", () => {
    it("should return count of unread notifications", async () => {
      const userId = mockUser.id
      const result = await controller.countUnread(userId)

      expect(service.countUnread).toHaveBeenCalledWith(userId)
      expect(result).toEqual({ count: 5 })
    })
  })

  describe("findOne", () => {
    it("should return a notification by id", async () => {
      const result = await controller.findOne(mockNotification.id)

      expect(service.findOne).toHaveBeenCalledWith(mockNotification.id)
      expect(result).toBeInstanceOf(NotificationResponseDto)
      expect(result.id).toBe(mockNotification.id)
    })
  })

  describe("update", () => {
    it("should update a notification", async () => {
      const updateNotificationDto: UpdateNotificationDto = {
        title: "Updated Title",
      }

      const result = await controller.update(mockNotification.id, updateNotificationDto)

      expect(service.update).toHaveBeenCalledWith(mockNotification.id, updateNotificationDto)
      expect(result).toBeInstanceOf(NotificationResponseDto)
    })
  })

  describe("markAsRead", () => {
    it("should mark a notification as read", async () => {
      const result = await controller.markAsRead(mockNotification.id)

      expect(service.markAsRead).toHaveBeenCalledWith(mockNotification.id)
      expect(result).toBeInstanceOf(NotificationResponseDto)
    })
  })

  describe("remove", () => {
    it("should remove a notification", async () => {
      await controller.remove(mockNotification.id)

      expect(service.remove).toHaveBeenCalledWith(mockNotification.id)
    })
  })
})
