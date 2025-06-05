import { Test, TestingModule } from "@nestjs/testing"
import { NotificationPreferenceController } from "./notification-preference.controller"
import { NotificationPreferenceService } from "../providers/notification-preference.service"
import { UserRole } from "src/roles/roles.enum"
import { UpdateNotificationPreferenceDto } from "../dto/update-notification-preference.dto"

describe("NotificationPreferenceController", () => {
  let controller: NotificationPreferenceController
  let service: NotificationPreferenceService

  const mockUser = {
    id: "user-id",
    role: UserRole.STUDENT,
  }

  const mockPreference = {
    id: "pref-id",
    userId: "user-id",
    role: UserRole.STUDENT,
    lessonUpdates: true,
    viaEmail: true,
    viaInApp: true,
  }

  const mockNotificationPreferenceService = {
    findByUser: jest.fn().mockResolvedValue(mockPreference),
    update: jest.fn().mockResolvedValue(mockPreference),
    resetToDefaults: jest.fn().mockResolvedValue(mockPreference),
    remove: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationPreferenceController],
      providers: [
        {
          provide: NotificationPreferenceService,
          useValue: mockNotificationPreferenceService,
        },
      ],
    }).compile()

    controller = module.get<NotificationPreferenceController>(NotificationPreferenceController)
    service = module.get<NotificationPreferenceService>(NotificationPreferenceService)
  })

  it("should be defined", () => {
    expect(controller).toBeDefined()
  })

  describe("getPreferences", () => {
    it("should return user preferences", async () => {
      const req = { user: mockUser } as any

      const result = await controller.getPreferences(req)

      expect(service.findByUser).toHaveBeenCalledWith(mockUser.id, mockUser.role)
      expect(result).toEqual(mockPreference)
    })
  })

  describe("updatePreferences", () => {
    it("should update user preferences", async () => {
      const req = { user: mockUser } as any
      const updateDto: UpdateNotificationPreferenceDto = {
        lessonUpdates: false,
        viaEmail: false,
      }

      const result = await controller.updatePreferences(req, updateDto)

      expect(service.update).toHaveBeenCalledWith(mockUser.id, mockUser.role, updateDto)
      expect(result).toEqual(mockPreference)
    })
  })

  describe("resetPreferences", () => {
    it("should reset preferences to defaults", async () => {
      const req = { user: mockUser } as any

      const result = await controller.resetPreferences(req)

      expect(service.resetToDefaults).toHaveBeenCalledWith(mockUser.id, mockUser.role)
      expect(result).toEqual(mockPreference)
    })
  })

  describe("deletePreferences", () => {
    it("should delete user preferences", async () => {
      const req = { user: mockUser } as any

      await controller.deletePreferences(req)

      expect(service.remove).toHaveBeenCalledWith(mockUser.id, mockUser.role)
    })
  })
})
