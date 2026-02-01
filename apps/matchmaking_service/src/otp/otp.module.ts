import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { EmailModule } from '../email/email.module';

@Module({
  imports:[
    EmailModule,
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          port: configService.get<number>('EMAIL_PORT'),
          secure: configService.get<boolean>('EMAIL_SECURE'),
          auth: {
            user: configService.get<string>('EMAIL_USER'),
            pass: configService.get<string>('EMAIL_PASSWORD'),
          },
          tls: {
            rejectUnauthorized: false, // для разработки, в проде лучше true
          },
        },
        
        defaults: {
          from: `"No Reply" <${configService.get<string>('EMAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService]
    }),
  ],
  providers: [OtpService],
  exports:[OtpService]
})
export class OtpModule {}
