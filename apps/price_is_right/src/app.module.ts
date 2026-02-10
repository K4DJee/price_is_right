import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { MatchmakingModule } from './matchmaking/matchmaking.module';
import { QuestionsModule } from './questions/questions.module';
import { MatchesModule } from './matches/matches.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    UsersModule,
    MatchesModule,
    AuthModule,
    DatabaseModule,
    MatchmakingModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, //60 seconds
          limit: 10,
        },
      ],
    }),
    MatchmakingModule,
    QuestionsModule,
    MatchesModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
