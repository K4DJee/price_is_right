import { Module } from '@nestjs/common';
import { MatchmakingServiceController } from './matchmaking_service.controller';
import { MatchmakingServiceService } from './matchmaking_service.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { OtpModule } from './otp/otp.module';
import path from 'path';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { JwtModule } from '@nestjs/jwt';
import { MatchmakingGateway } from './matchmaking.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [path.resolve(__dirname, '..', '..', '..', '.env')],
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: 'CORE_SERVICE',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.NATS,
          options: {
            servers: [configService.getOrThrow<string>('NATS_SERVER_URL')],
          },
        }),
        inject: [ConfigService],
      },
    ]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<number>('ACCESS_TOKEN_EXPIRY'),
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    EmailModule,
    OtpModule,
  ],
  controllers: [MatchmakingServiceController],
  providers: [MatchmakingServiceService, MatchmakingGateway],
})
export class MatchmakingServiceModule {}
