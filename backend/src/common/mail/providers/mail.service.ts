import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { Student } from 'src/student/entities/student.entity';
import { Tutor } from 'src/tutor/entities/tutor.entity';

@Injectable()
export class MailService {
    constructor(
        /* 
         *inject mailerService
         */
        private readonly mailerServise: MailerService, 
    ) {}

    public async welcomeEmail(user: Student | Tutor): Promise<void> {
        await this.mailerServise.sendMail({
            to: user.email,
            from: `helpdesk <support@blog.come>`,
            subject: 'Welcome to your doom',
            template: './welcome',
            context: {
                name: user.firstName,
                email: user.email,
                loginUrl: 'http://localhost:3000'
            }
        })
        console.log('Test Email Success')
    }
}