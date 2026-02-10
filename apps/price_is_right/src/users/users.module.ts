import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';
import { UsersMicroserviceController } from './users.miscroservice.controller';

@Module({
  imports:[
    DatabaseModule
  ],
  controllers:[UsersMicroserviceController],
  providers: [UsersService],
})
export class UsersModule {}
