import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {MailerModule} from '@nestjs-modules/mailer'
import { MailService } from './providers/mail.service';
import { join } from 'path';
// import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejsAdapter'
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter'

@Global()
@Module({
  imports: [MailerModule.forRootAsync({
    inject: [ConfigService],
    useFactory: async(config: ConfigService) => ({
      transport: {
        host: config.get('appConfig.mailHost'),
        port: parseInt(config.get('appConfig.mailPort'), 10),
        secure: config.get('appConfig.mailSecure'),
        auth: {
          user: config.get('appConfig.smtpUsername'),
          pass: config.get('appConfig.smtpPassword')
        },
        debug: true,
      },
      defaults: {
        from: `My Blog<no-reply@nestjs-blog.com>`
      },
      template: {
        dir: join(__dirname, 'templete'),
      },
      adapter: new EjsAdapter({
        inlineCssEnabled: true
      }),
      options: {
        strict: false
      }
    })
  })],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
