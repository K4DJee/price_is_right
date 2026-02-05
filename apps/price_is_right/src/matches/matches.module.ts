import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesMicroserviceController } from './matches.miscroservice.controller';
import { MatchesController } from './matches.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports:[
    DatabaseModule
  ],
  controllers: [MatchesController, MatchesMicroserviceController],
  providers: [MatchesService],
})
export class MatchesModule {}
