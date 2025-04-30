import { Test, type TestingModule } from "@nestjs/testing"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { NotificationsService } from "./notifications.service"
import { Notification, NotificationChannel, NotificationStatus, NotificationType } from "./entities/notification.entity"
import { NotificationSenders } from "./senders/notification-senders"
import { UsersService } from "../users/users.service"
import { NotFoundException } from "@nestjs/common"

// Mock user for testing
const mockUser = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  name: "Test User",
}

// Mock notification for testing
const mockNotification = {
  id: "123e4567-e89b-12d3-a456-426614174001",
  title: "Test Notification",
  content: "This is a test notification",
  type: NotificationType.QUIZ_COMPLETED,
  channel: NotificationChannel.IN_APP,
  status: NotificationStatus.PENDING,
  referenceId: "123e4567-e89b-12d3-a456-426614174002",
  metadata: { test: "data" },
  recipient: mockUser,
  createdAt: new Date(),
  updatedAt: new Date(),
  readAt: null,
}

describe("NotificationsService", () => {
  let service: NotificationsService
  let repository: Repository<Notification>
  let notificationSenders: NotificationSenders
  let usersService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            create: jest.fn().mockReturnValue(mockNotification),
            save: jest.fn().mockResolvedValue(mockNotification),
            findOne: jest.fn().mockResolvedValue(mockNotification),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockNotification]),
            })),
            count: jest.fn().mockResolvedValue(5),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: NotificationSenders,
          useValue: {
            send: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile()

    service = module.get<NotificationsService>(NotificationsService)
    repository = module.get<Repository<Notification>>(getRepositoryToken(Notification))
    notificationSenders = module.get<NotificationSenders>(NotificationSenders)
    usersService = module.get<UsersService>(UsersService)
  })

  it("should be defined", () => {
    expect(service).toBeDefined()
  })

  describe("create", () => {
    it("should create a notification", async () => {
      const createNotificationDto = {
        title: "Test Notification",
        content: "This is a test notification",
        type: NotificationType.QUIZ_COMPLETED,
        recipientId: mockUser.id,
      }

      const result = await service.create(createNotificationDto)

      expect(usersService.findOne).toHaveBeenCalledWith(mockUser.id)
      expect(repository.create).toHaveBeenCalled()
      expect(repository.save).toHaveBeenCalled()
      expect(notificationSenders.send).toHaveBeenCalled()
      expect(result).toEqual(mockNotification)
    })

    it("should throw NotFoundException if user not found", async () => {
      jest.spyOn(usersService, "findOne").mockResolvedValueOnce(null)

      const createNotificationDto = {
        title: "Test Notification",
        content: "This is a test notification",
        type: NotificationType.QUIZ_COMPLETED,
        recipientId: "non-existent-id",
      }

      await expect(service.create(createNotificationDto)).rejects.toThrow(NotFoundException)
    })

    it("should handle send failure and update status", async () => {
      jest.spyOn(notificationSenders, "send").mockRejectedValueOnce(new Error("Send failed"))

      const failedNotification = {
        ...mockNotification,
        status: NotificationStatus.FAILED,
      }

      jest.spyOn(repository, "save").mockResolvedValueOnce(mockNotification).mockResolvedValueOnce(failedNotification)

      const createNotificationDto = {
        title: "Test Notification",
        content: "This is a test notification",
        type: NotificationType.QUIZ_COMPLETED,
        recipientId: mockUser.id,
      }

      const result = await service.create(createNotificationDto)

      expect(result.status).toBe(NotificationStatus.FAILED)
    })
  })

  describe("findAll", () => {
    it("should return an array of notifications", async () => {
      const result = await service.findAll()
      expect(result).toEqual([mockNotification])
    })

    it("should filter by userId if provided", async () => {
      const userId = mockUser.id
      const result = await service.findAll(userId)

      const queryBuilder = repository.createQueryBuilder()
      expect(queryBuilder.where).toHaveBeenCalledWith("recipient.id = :userId", { userId })
      expect(result).toEqual([mockNotification])
    })
  })

  describe("findOne", () => {
    it("should return a notification by id", async () => {
      const result = await service.findOne(mockNotification.id)
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockNotification.id },
        relations: ["recipient"],
      })
      expect(result).toEqual(mockNotification)
    })

    it("should throw NotFoundException if notification not found", async () => {
      jest.spyOn(repository, "findOne").mockResolvedValueOnce(null)

      await expect(service.findOne("non-existent-id")).rejects.toThrow(NotFoundException)
    })
  })

  describe("update", () => {
    it("should update a notification", async () => {
      const updateNotificationDto = {
        title: "Updated Title",
        status: NotificationStatus.READ,
      }

      const updatedNotification = {
        ...mockNotification,
        ...updateNotificationDto,
      }

      jest.spyOn(repository, "save").mockResolvedValueOnce(updatedNotification)

      const result = await service.update(mockNotification.id, updateNotificationDto)

      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining(updateNotificationDto))
      expect(result).toEqual(updatedNotification)
    })

    it("should update recipient if recipientId is provided", async () => {
      const newUserId = "123e4567-e89b-12d3-a456-426614174999"
      const newUser = { ...mockUser, id: newUserId }

      jest.spyOn(usersService, "findOne").mockResolvedValueOnce(newUser)

      const updateNotificationDto = {
        recipientId: newUserId,
      }

      await service.update(mockNotification.id, updateNotificationDto)

      expect(usersService.findOne).toHaveBeenCalledWith(newUserId)
    })

    it("should throw NotFoundException if new recipient not found", async () => {
      jest.spyOn(usersService, "findOne").mockResolvedValueOnce(null)

      const updateNotificationDto = {
        recipientId: "non-existent-id",
      }

      await expect(service.update(mockNotification.id, updateNotificationDto)).rejects.toThrow(NotFoundException)
    })
  })

  describe("markAsRead", () => {
    it("should mark a notification as read", async () => {
      const now = new Date()
      jest.spyOn(global, "Date").mockImplementationOnce(() => now as any)

      const readNotification = {
        ...mockNotification,
        status: NotificationStatus.READ,
        readAt: now,
      }

      jest.spyOn(repository, "save").mockResolvedValueOnce(readNotification)

      const result = await service.markAsRead(mockNotification.id)

      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: NotificationStatus.READ,
          readAt: now,
        }),
      )
      expect(result).toEqual(readNotification)
    })
  })

  describe("remove", () => {
    it("should remove a notification", async () => {
      await service.remove(mockNotification.id)

      expect(repository.remove).toHaveBeenCalledWith(mockNotification)
    })
  })

  describe("countUnread", () => {
    it("should return the count of unread notifications", async () => {
      const userId = mockUser.id
      const result = await service.countUnread(userId)

      expect(repository.count).toHaveBeenCalledWith({
        where: {
          recipient: { id: userId },
          status: NotificationStatus.SENT,
          readAt: null,
        },
      })
      expect(result).toBe(5)
    })
  })

  describe("createQuizCompletionNotification", () => {
    it("should create a quiz completion notification", async () => {
      jest.spyOn(service, "create").mockResolvedValueOnce(mockNotification)

      const userId = mockUser.id
      const quizId = "123e4567-e89b-12d3-a456-426614174002"
      const quizTitle = "Test Quiz"
      const score = 8
      const totalQuestions = 10

      const result = await service.createQuizCompletionNotification(userId, quizId, quizTitle, score, totalQuestions)

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.QUIZ_COMPLETED,
          recipientId: userId,
          referenceId: quizId,
        }),
      )
      expect(result).toEqual(mockNotification)
    })
  })

  describe("createDaoVoteNotification", () => {
    it("should create a DAO vote notification", async () => {
      jest.spyOn(service, "create").mockResolvedValueOnce(mockNotification)

      const userId = mockUser.id
      const proposalId = "123e4567-e89b-12d3-a456-426614174003"
      const proposalTitle = "Test Proposal"

      const result = await service.createDaoVoteNotification(userId, proposalId, proposalTitle)

      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: NotificationType.DAO_VOTE,
          recipientId: userId,
          referenceId: proposalId,
        }),
      )
      expect(result).toEqual(mockNotification)
    })
  })
})
