import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { certificateTemplate } from './templates/certificate.template';
import { passwordResetTemplate } from './templates/password-reset.template';
import { streakReminderTemplate } from './templates/streak-reminder.template';
import { welcomeTemplate } from './templates/welcome.template';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType: string;
  }>;
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly smtpHost: string | undefined;
  private readonly smtpPort: number;
  private readonly smtpUser: string | undefined;
  private readonly smtpPass: string | undefined;
  private readonly fromName: string;
  private readonly fromEmail: string;
  private readonly transporter: Transporter | null;

  constructor(private readonly configService: ConfigService) {
    this.smtpHost = this.configService.get<string>('SMTP_HOST');
    this.smtpPort = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    this.smtpUser = this.configService.get<string>('SMTP_USER');
    this.smtpPass = this.configService.get<string>('SMTP_PASS');
    this.fromName =
      this.configService.get<string>('SMTP_FROM_NAME') ?? 'ByteChain Academy';
    this.fromEmail =
      this.configService.get<string>('SMTP_FROM_EMAIL') ??
      'noreply@bytechain.academy';

    if (!this.smtpHost) {
      this.transporter = null;
      this.logger.log(
        'SMTP_HOST is not configured. Emails will be logged instead of sent.',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpPort === 465,
      auth:
        this.smtpUser && this.smtpPass
          ? {
              user: this.smtpUser,
              pass: this.smtpPass,
            }
          : undefined,
    });
  }

  async sendWelcomeEmail(to: string, username: string): Promise<void> {
    const { subject, html } = welcomeTemplate(username);
    await this.sendEmail({ to, subject, html });
  }

  async sendPasswordResetEmail(
    to: string,
    resetToken: string,
    resetUrl: string,
  ): Promise<void> {
    const { subject, html } = passwordResetTemplate(resetUrl);
    const htmlWithToken = `${html}<p style="margin:16px 0 0;padding:0 24px 24px;font-size:12px;color:#6b7280;">Reset token: <code>${resetToken}</code></p>`;
    await this.sendEmail({ to, subject, html: htmlWithToken });
  }

  async sendCertificateEmail(
    to: string,
    username: string,
    courseName: string,
    certificateHash: string,
    pdfPath: string,
  ): Promise<void> {
    const { subject, html } = certificateTemplate(
      username,
      courseName,
      certificateHash,
    );
    await this.sendEmail({
      to,
      subject,
      html,
      attachments: [
        {
          filename: `ByteChain-Certificate-${courseName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`,
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  async sendStreakReminderEmail(
    to: string,
    username: string,
    streak: number,
  ): Promise<void> {
    const { subject, html } = streakReminderTemplate(username, streak);
    await this.sendEmail({ to, subject, html });
  }

  private async sendEmail({
    to,
    subject,
    html,
    attachments,
  }: EmailPayload): Promise<void> {
    if (!this.transporter) {
      const attachmentInfo = attachments
        ? attachments.map((a) => a.filename).join(', ')
        : 'none';
      this.logger.log(
        `Email fallback -> to: ${to}, subject: ${subject}, attachments: ${attachmentInfo}, html: ${html}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: `"${this.fromName}" <${this.fromEmail}>`,
      to,
      subject,
      html,
      attachments,
    });
  }
}
