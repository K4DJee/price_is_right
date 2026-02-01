import { Inject, Injectable } from '@nestjs/common';
import { addingInMatchmakingQueue } from './dto/adding-in-matchmaking-queue.dto';
import { RedisService } from './redis/redis.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';
import { MatchmakingGateway } from './matchmaking.gateway';
import { IQuestion } from './interfaces/question.interface';
import { AnswerData } from './interfaces/match.interface';

@Injectable()
export class MatchmakingServiceService {
    constructor(
      private readonly redisService: RedisService,
      private readonly gateway: MatchmakingGateway,
      @Inject('CORE_SERVICE') private readonly coreClient: ClientProxy
    ){}


  async getRandomQuestion(){
    const question = await firstValueFrom(
      this.coreClient.send('random_question', {}),
    );
    return question as IQuestion;
  }

  async addPlayer(dto: addingInMatchmakingQueue){
    await this.redisService.addPlayerToQueue(dto.id);
    await this.tryCreateMatch();
  }

  async tryCreateMatch(){
    while(true){
      const players = await this.redisService.popTwoPlayers();
      if(!players) break;

      await this.createMatch(players[0], players[1]);

      
    }
  }

  async createMatch(p1: string, p2: string){
    const question = await this.getRandomQuestion();
    const matchId = randomUUID();

    await this.redisService.saveMatch(matchId, {
      p1,
      p2,
      questionText: question.text,
      correctAnswer: String(question.correctAnswer),
      status: 'waiting_answers'
    });

    //Сохранение в бд, отправка запроса на coreClient

    

    this.gateway.server
      .to([`user:${p1}`, `user:${p2}`])
      .emit('match.start', {matchId, question})
  }

  //submitAnswer
  async submitAnswer(matchId: string, userId: string, answer: string): Promise<{
    result?: MatchResult
  }>{
    const match: any = this.redisService.getMatchInfo(matchId);
    if(!match){
      throw new Error('Match not found');
    }

    if (match.p1 !== userId || match.p2 !== userId) {
      throw new Error('User is not a participant');
    }

    if(answer != match.answer){
      console.log("Ответ неверный");
    }

    const answerData: AnswerData = {
      userId,
      answer,
      isCorrect: answer != match.answer ? false : true,
    }

    await this.redisService.savePlayerAnswer(match.matchId, answerData);

    const otherPlayerId = match.p1 === userId ? match.p1 : match.p2;
    const otherPlayerAnswered = this.redisService.checkOtherPlayerAnswered(match.matchId, otherPlayerId);
    
    if(!otherPlayerAnswered){
      const matchResult = await this.finalizeMatch(match.matchId);
    }


  }

  //finalizeMatch
  async finalizeMatch(matchId: string){
    
  }

}
