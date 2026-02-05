import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateMatchDto } from './dto/match.dto';

@Injectable()
export class MatchesService {
  constructor(private readonly dbService: DatabaseService){}
  async createMatch(createMatchDto: CreateMatchDto){  
    await this.dbService.match.create({
      data: {
        id: createMatchDto.id,
        winner: createMatchDto.winner || null,
        loser:  createMatchDto.loser || null,
        p1Answer: createMatchDto.p1Answer || null,
        p2Answer: createMatchDto.p2Answer || null,
        correctAnswer: createMatchDto.correctAnswer || null,
        users: createMatchDto.usersIds
      }
    })
  }

  async finalizeMatch(){
    
  }
}
