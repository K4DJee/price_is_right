import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateMatchDto, FinalizeMatchDto } from './dto/match.dto';

@Injectable()
export class MatchesService {
  constructor(private readonly dbService: DatabaseService){}
  async createMatch(createMatchDto: CreateMatchDto){  
    console.log(createMatchDto);
    await this.dbService.match.create({
      data: {
        id: createMatchDto.id,
        winner: createMatchDto.winner || null,
        loser:  createMatchDto.loser || null,
        p1Answer: createMatchDto.p1Answer || null,
        p2Answer: createMatchDto.p2Answer || null,
        correctAnswer: createMatchDto.correctAnswer || null,
        users: createMatchDto.users
      }
    })
  }

  async finalizeMatch(finalizeMatchDto: FinalizeMatchDto){

    await this.dbService.match.update({
      data: {
        winner: finalizeMatchDto.winner || null,
        loser:  finalizeMatchDto.loser || null,
        p1Answer: finalizeMatchDto.p1Answer || null,
        p2Answer: finalizeMatchDto.p2Answer || null,
        correctAnswer: finalizeMatchDto.correctAnswer || null,
      },
      where:{
        id: finalizeMatchDto.id,
      }
    })
  }
}
