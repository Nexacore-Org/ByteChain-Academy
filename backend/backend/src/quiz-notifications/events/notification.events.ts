import { Injectable } from "@nestjs/common"
import { OnEvent } from "@nestjs/event-emitter"
import type { NotificationsService } from "../notifications.service"

@Injectable()
export class NotificationEvents {
  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent("quiz.completed")
  async handleQuizCompletedEvent(payload: {
    userId: string
    quizId: string
    quizTitle: string
    score: number
    totalQuestions: number
  }) {
    await this.notificationsService.createQuizCompletionNotification(
      payload.userId,
      payload.quizId,
      payload.quizTitle,
      payload.score,
      payload.totalQuestions,
    )
  }

  @OnEvent("dao.new_proposal")
  async handleDaoNewProposalEvent(payload: {
    userId: string
    proposalId: string
    proposalTitle: string
  }) {
    await this.notificationsService.createDaoVoteNotification(payload.userId, payload.proposalId, payload.proposalTitle)
  }
}
