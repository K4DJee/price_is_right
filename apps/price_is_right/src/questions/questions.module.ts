import { Module } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports:[
    DatabaseModule,
    ClientsModule.registerAsync([
      {
        name: 'MICROSERVICE_CLIENT',
        useFactory: (configService: ConfigService)=>({
          transport: Transport.NATS,
          options:{
            servers: [
              configService.getOrThrow<string>('NATS_SERVER_URL')
            ]
          }
        }),
        inject: [ConfigService]
      }
    ])
  ],
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
