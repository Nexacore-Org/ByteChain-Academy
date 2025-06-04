import { Injectable } from '@nestjs/common';
import { NotificationType, UserRole } from '../enums/notification.enums';
import { NotificationService } from '../notification.service';

@Injectable()
export class NotificationHooks {
  constructor(private readonly notificationService: NotificationService) {}

  async onCourseEnrollment(studentId: string, courseName: string) {
    await this.notificationService.triggerNotification(
      studentId,
      UserRole.STUDENT,
      NotificationType.COURSE_ENROLLMENT,
      `You have successfully enrolled in ${courseName}`,
      { courseName },
    );
  }

  async onLessonCompletion(
    studentId: string,
    lessonName: string,
    courseName: string,
  ) {
    await this.notificationService.triggerNotification(
      studentId,
      UserRole.STUDENT,
      NotificationType.LESSON_COMPLETION,
      `Congratulations! You completed the lesson "${lessonName}" in ${courseName}`,
      { lessonName, courseName },
    );
  }

  async onQuizResult(
    studentId: string,
    quizName: string,
    score: number,
    passed: boolean,
  ) {
    const message = passed
      ? `Great job! You scored ${score}% on "${quizName}" and passed!`
      : `You scored ${score}% on "${quizName}". Keep practicing!`;

    await this.notificationService.triggerNotification(
      studentId,
      UserRole.STUDENT,
      NotificationType.QUIZ_RESULT,
      message,
      { quizName, score, passed },
    );
  }

  async onDAOProposal(recipientIds: string[], proposalTitle: string) {
    await this.notificationService.sendBulkNotifications({
      recipientIds,
      recipientRole: UserRole.ADMIN,
      type: NotificationType.DAO_PROPOSAL,
      message: `New DAO proposal: "${proposalTitle}" requires your attention`,
      metadata: { proposalTitle },
    });
  }

  async onNewLesson(tutorId: string, lessonName: string, courseName: string) {
    await this.notificationService.triggerNotification(
      tutorId,
      UserRole.TUTOR,
      NotificationType.NEW_LESSON,
      `New lesson "${lessonName}" has been added to ${courseName}`,
      { lessonName, courseName },
    );
  }

  onSystemAnnouncement(message: string, targetRole?: UserRole) {
    // This would typically get all users of a specific role
    // For now, this is a placeholder for the implementation
    console.log(
      `System announcement for ${targetRole || 'all users'}: ${message}`,
    );
  }
}
