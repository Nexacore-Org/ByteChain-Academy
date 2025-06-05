import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Unique } from "typeorm"
import { UserRole } from "../../roles/roles.enum"

@Entity("notification_preferences")
@Unique(["userId", "role"])
@Index(["userId", "role"])
export class NotificationPreference {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column("uuid")
  @Index()
  userId: string

  @Column({
    type: "enum",
    enum: UserRole,
  })
  role: UserRole

  // Notification Categories
  @Column({ default: true })
  courseEnrollment: boolean

  @Column({ default: true })
  courseCompletion: boolean

  @Column({ default: true })
  lessonUpdates: boolean

  @Column({ default: true })
  lessonCompletion: boolean

  @Column({ default: true })
  quizResults: boolean

  @Column({ default: true })
  quizReminders: boolean

  @Column({ default: true })
  daoUpdates: boolean

  @Column({ default: true })
  daoProposals: boolean

  @Column({ default: true })
  daoVoting: boolean

  @Column({ default: true })
  systemAnnouncements: boolean

  @Column({ default: false })
  maintenance: boolean

  @Column({ default: true })
  profileUpdates: boolean

  @Column({ default: true })
  passwordChanges: boolean

  // Delivery Channels
  @Column({ default: true })
  viaEmail: boolean

  @Column({ default: true })
  viaInApp: boolean

  @Column({ default: false })
  viaSms: boolean

  @Column({ default: false })
  viaPush: boolean

  // Timing Preferences
  @Column({ default: true })
  instantDelivery: boolean

  @Column({ default: false })
  dailyDigest: boolean

  @Column({ default: false })
  weeklyDigest: boolean

  @Column({ type: "time", nullable: true })
  quietHoursStart: string // Format: HH:MM

  @Column({ type: "time", nullable: true })
  quietHoursEnd: string // Format: HH:MM

  @Column({ default: "UTC" })
  timezone: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
