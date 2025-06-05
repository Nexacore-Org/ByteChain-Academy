import { Test, type TestingModule } from "@nestjs/testing"
import { type INestApplication, ValidationPipe } from "@nestjs/common"
import * as request from "supertest"
import { getRepositoryToken } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { NotificationPreferenceModule } from "./notification-preference.module"
import { NotificationPreference } from "./entities/notification-preference.entity"
import { UserRole } from "../roles/roles.enum"
import { RolesGuard } from "../roles/roles.guard"

describe("NotificationPreference (e2e)", () => {
  let app: INestApplication
  let repository: Repository<NotificationPreference>

  const mockUser = {
    id: "user-id",
    role: UserRole.STUDENT,
  }

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [NotificationPreferenceModule],
    })
      .overrideProvider(getRepositoryToken(NotificationPreference))
      .useValue({
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue([]),
        })),
      })
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))

    // Mock request user
    app.use((req, res, next) => {
      req.user = mockUser
      next()
    })

    repository = moduleFixture.get<Repository<NotificationPreference>>(getRepositoryToken(NotificationPreference))

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe("/notification-preferences (GET)", () => {
    it("should return user preferences", async () => {
      const mockPreference = {
        id: "pref-id",
        userId: mockUser.id,
        role: mockUser.role,
        lessonUpdates: true,
        viaEmail: true,
        viaInApp: true,
      }

      jest.spyOn(repository, "findOne").mockResolvedValue(mockPreference as any)

      return request(app.getHttpServer())
        .get("/notification-preferences")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("id", "pref-id")
          expect(res.body).toHaveProperty("lessonUpdates", true)
        })
    })

    it("should create default preferences if none exist", async () => {
      const defaultPreference = {
        id: "new-pref-id",
        userId: mockUser.id,
        role: mockUser.role,
        lessonUpdates: true,
        viaEmail: true,
        viaInApp: true,
      }

      jest.spyOn(repository, "findOne").mockResolvedValue(null)
      jest.spyOn(repository, "create").mockReturnValue(defaultPreference as any)
      jest.spyOn(repository, "save").mockResolvedValue(defaultPreference as any)

      return request(app.getHttpServer())
        .get("/notification-preferences")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("id", "new-pref-id")
        })
    })
  })

  describe("/notification-preferences (PUT)", () => {
    it("should update user preferences", async () => {
      const updateDto = {
        lessonUpdates: false,
        viaEmail: false,
      }

      const updatedPreference = {
        id: "pref-id",
        userId: mockUser.id,
        role: mockUser.role,
        lessonUpdates: false,
        viaEmail: false,
        viaInApp: true,
      }

      jest.spyOn(repository, "findOne").mockResolvedValue({
        id: "pref-id",
        userId: mockUser.id,
        role: mockUser.role,
        lessonUpdates: true,
        viaEmail: true,
        viaInApp: true,
      } as any)
      jest.spyOn(repository, "save").mockResolvedValue(updatedPreference as any)

      return request(app.getHttpServer())
        .put("/notification-preferences")
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("lessonUpdates", false)
          expect(res.body).toHaveProperty("viaEmail", false)
        })
    })

    it("should validate input data", async () => {
      const invalidDto = {
        quietHoursStart: "invalid-time",
        lessonUpdates: "not-a-boolean",
      }

      return request(app.getHttpServer()).put("/notification-preferences").send(invalidDto).expect(400)
    })
  })

  describe("/notification-preferences/reset (POST)", () => {
    it("should reset preferences to defaults", async () => {
      const defaultPreference = {
        id: "pref-id",
        userId: mockUser.id,
        role: mockUser.role,
        lessonUpdates: true,
        viaEmail: true,
        viaInApp: true,
        maintenance: false,
      }

      jest.spyOn(repository, "findOne").mockResolvedValue({
        id: "pref-id",
        userId: mockUser.id,
        role: mockUser.role,
        lessonUpdates: false,
        viaEmail: false,
      } as any)
      jest.spyOn(repository, "save").mockResolvedValue(defaultPreference as any)

      return request(app.getHttpServer())
        .post("/notification-preferences/reset")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("lessonUpdates", true)
          expect(res.body).toHaveProperty("viaEmail", true)
          expect(res.body).toHaveProperty("maintenance", false)
        })
    })
  })

  describe("/notification-preferences (DELETE)", () => {
    it("should delete user preferences", async () => {
      jest.spyOn(repository, "delete").mockResolvedValue({ affected: 1 } as any)

      return request(app.getHttpServer()).delete("/notification-preferences").expect(204)
    })

    it("should return 404 if preferences not found", async () => {
      jest.spyOn(repository, "delete").mockResolvedValue({ affected: 0 } as any)

      return request(app.getHttpServer()).delete("/notification-preferences").expect(404)
    })
  })
})
