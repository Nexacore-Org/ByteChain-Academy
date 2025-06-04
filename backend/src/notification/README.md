# Notification Module

A comprehensive notification system for handling real-time and persistent notifications across different user roles (Student, Tutor, Admin).

## Features

- **Multi-role Support**: Handles notifications for Students, Tutors, and Admins
- **Type-based Notifications**: Predefined notification types for different platform events
- **Real-time Ready**: Architecture supports future WebSocket/SSE integration
- **Bulk Operations**: Send notifications to multiple recipients
- **Filtering & Pagination**: Advanced querying capabilities
- **Role-based Access Control**: Proper authentication and authorization
- **Extensible**: Easy to add new notification types and features

## API Endpoints

### User Endpoints (Authenticated)

- `GET /notification` - Get current user's notifications
- `GET /notification/unread-count` - Get unread notification count
- `PATCH /notification/:id/read` - Mark notification as read
- `PATCH /notification/mark-all-read` - Mark all notifications as read
- `DELETE /notification/:id` - Delete a notification

### Admin/Tutor Endpoints

- `POST /notification/send` - Send a notification (Admin/Tutor only)
- `POST /notification/send/bulk` - Send bulk notifications (Admin only)
- `GET /notification/admin/all` - Get all notifications (Admin only)
- `DELETE /notification/admin/:id` - Delete any notification (Admin only)

## Notification Types

- `COURSE_ENROLLMENT` - Course enrollment notifications
- `COURSE_COMPLETION` - Course completion notifications
- `NEW_LESSON` - New lesson notifications
- `LESSON_COMPLETION` - Lesson completion notifications
- `QUIZ_RESULT` - Quiz result notifications
- `QUIZ_REMINDER` - Quiz reminder notifications
- `DAO_UPDATE` - DAO update notifications
- `DAO_PROPOSAL` - DAO proposal notifications
- `DAO_VOTING` - DAO voting notifications
- `SYSTEM_ANNOUNCEMENT` - System announcements
- `MAINTENANCE` - Maintenance notifications
- `PROFILE_UPDATE` - Profile update notifications
- `PASSWORD_CHANGE` - Password change notifications

## Usage Examples

### Triggering Notifications from Other Services

\`\`\`typescript
// Inject NotificationService in your service
constructor(private notificationService: NotificationService) {}

// Trigger a quiz result notification
await this.notificationService.triggerNotification(
studentId,
UserRole.STUDENT,
NotificationType.QUIZ_RESULT,
`You scored 85% on the JavaScript Basics quiz!`,
{ quizName: 'JavaScript Basics', score: 85, passed: true }
);
\`\`\`

### Using Notification Hooks

\`\`\`typescript
// Inject NotificationHooks in your service
constructor(private notificationHooks: NotificationHooks) {}

// Trigger course enrollment notification
await this.notificationHooks.onCourseEnrollment(studentId, courseName);

// Trigger quiz result notification
await this.notificationHooks.onQuizResult(studentId, quizName, score, passed);
\`\`\`

## Database Schema

The notification entity includes:

- `id` - Unique identifier
- `recipientId` - ID of the notification recipient
- `recipientRole` - Role of the recipient (STUDENT, TUTOR, ADMIN)
- `type` - Type of notification
- `message` - Notification message
- `isRead` - Read status
- `metadata` - Additional data (JSON)
- `senderId` - ID of the sender (optional)
- `senderRole` - Role of the sender (optional)
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

## Testing

Run the tests:

\`\`\`bash
npm run test src/modules/notification
\`\`\`

## Future Enhancements

- WebSocket integration for real-time notifications
- Email notification service integration
- Push notification support
- Notification templates
- Scheduled notifications
- Notification preferences per user
