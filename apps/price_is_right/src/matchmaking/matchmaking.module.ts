import { Injectable, Module } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import { MatchmakingController } from './matchmaking.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../auth/guards/auth.guard';

@Module({
  imports:[
    ClientsModule.registerAsync([
      {
        name: 'MICROSERVICE_CLIENT',
        useFactory: (configService: ConfigService)=>({
          transport: Transport.NATS,
          options:{
            servers: [configService.get<string>('NATS_SERVER_URL')!]
          }
        }),
        inject: [ConfigService],
      }
    ]),
    DatabaseModule,
    JwtModule
  ],
  controllers: [MatchmakingController],
  providers: [MatchmakingService, AuthGuard],
})
export class MatchmakingModule {}
