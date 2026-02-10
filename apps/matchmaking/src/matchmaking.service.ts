import { Inject, Injectable } from '@nestjs/common';
import { addingInMatchmakingQueue } from './dto/adding-in-matchmaking-queue.dto';
import { RedisService } from './redis/redis.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';
import { IQuestion } from './interfaces/question.interface';
import { AnswerData, MatchData, MatchDataToDB, MatchResult } from './interfaces/match.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserFromDB } from './interfaces/user.interface';

@Injectable()
export class MatchmakingService {
    constructor(
      private readonly redisService: RedisService,
      private eventEmitter: EventEmitter2,
      @Inject('CORE_SERVICE') private readonly coreClient: ClientProxy
    ){}


  async getRandomQuestion(): Promise<IQuestion>{
    const question = await firstValueFrom(
      this.coreClient.send('random_question', {}),
    );
    return question as IQuestion;
  }

  async createMatchInDB(match: MatchDataToDB): Promise<void>{
    await firstValueFrom(
      this.coreClient.send('create_match', match),
    );
  }

  async finalizeMatchInDB(match: MatchDataToDB): Promise<void>{
    await firstValueFrom(
      this.coreClient.send('finalize_match', match),
    );
  }

  async getUserFromDB(id: string): Promise<UserFromDB | null>{
    return await firstValueFrom(
      this.coreClient.send('get_user', id),
    );
  }

  determineWinnerAndLoser(p1: AnswerData, p2: AnswerData, correctAnswer: number): {winner: string, loser: string}{
    const diff1 = Math.abs(p1.answer - correctAnswer);
    const diff2 = Math.abs(p2.answer - correctAnswer);

    if(diff1 < diff2 || diff1 === diff2 && p1.answer < correctAnswer){
      return {winner:p1.userId, loser:p2.userId};
    }
    if(diff1 > diff2 || diff1 === diff2 && p2.answer < correctAnswer){
      return {winner:p2.userId, loser:p1.userId};
    }

    return {winner: "no one", loser:`${p1.userId} and ${p2.userId}`}
  }

  async addPlayer(dto: addingInMatchmakingQueue){
    console.log("dto",dto);
    await this.redisService.addPlayerToQueue(dto.id);
     this.tryCreateMatch();
  }

  async tryCreateMatch(){
    while(true){
      const players = await this.redisService.popTwoPlayers();
      if(!players) break;
      console.log(players);

      await this.createMatch(players[0], players[1]);

      
    }
  }

  async createMatch(p1: string, p2: string){
    const question = await this.getRandomQuestion();
    const matchId = randomUUID();

    if(p1 === p2){
      throw Error("Ошибка: один и тот же пользователь");
    }

    await this.redisService.saveMatch(matchId, {
      p1,
      p2,
      questionText: question.text,
      answer: String(question.correctAnswer),
      status: 'waiting_answers'
    });
    
    const MatchDataToDB: MatchDataToDB = {
      id: matchId,
      users: [p1,p2]
    }

    await this.createMatchInDB(MatchDataToDB);

    const match = {
      matchId,
      p1, p2,
      question
    }
    
    this.eventEmitter.emit('match.started', match);
  }

  async submitAnswer(matchId: string, userId: string, answer: number){
    const match = await this.redisService.getMatchInfo(matchId);
    if(!match){
      throw new Error('Match not found');
    }
    console.log("submitAnswer");
    console.log(match.p1, match.p2);
    console.log(`userId:${userId}, matchId:${matchId}, answer:${answer}`)
    if (userId !== match.p1 && userId !== match.p2) {
      throw new Error('User is not a participant');
    }
 
    const answerData: AnswerData = {
      userId,
      answer,
      isCorrect: answer != match.correctAnswer ? false : true,
    }

    console.log(match.correctAnswer);

    console.log("User answerData: ", answerData);

    await this.redisService.savePlayerAnswer(match.matchId, answerData);

    const otherPlayerId = match.p1 === userId ? match.p2 : match.p1;
    const otherPlayerAnswered = await this.redisService.checkOtherPlayerAnswered(match.matchId, otherPlayerId);
    
    if(!otherPlayerAnswered){
      const matchResult = {
        player: userId,
        matchId,
        userId,
        answer,
        message:"Waiting for opponent..."
      }
      this.eventEmitter.emit('question.answered', matchResult)
      return;
    }

    return await this.finalizeMatch(match.matchId);

  }

  async finalizeMatch(matchId: string){
    const match: MatchData | null = await this.redisService.getMatchInfo(matchId);
    if(!match){
      throw new Error('Match not found');
    }
    console.log("finalizeMatch, finded match: ", match);
    const [p1Answer, p2Answer] = await Promise.all([
      this.redisService.getPlayerAnswer(matchId, match.p1),
      this.redisService.getPlayerAnswer(matchId, match.p2)
    ]);

    const players = this.determineWinnerAndLoser(p1Answer, p2Answer, match.correctAnswer);
    
    const finalizeMatch : MatchDataToDB = {
      id: matchId,
      p1Answer:p1Answer.answer,
      p2Answer:p2Answer.answer,     
      users: [match.p1, match.p2],
      winner: players.winner,
      loser: players.loser,  
      correctAnswer: match.correctAnswer,
    }

    await this.finalizeMatchInDB(finalizeMatch);

    const matchResult: MatchResult = {
      p1: match.p1,
      p2: match.p2,
      matchId,
      winner: players.winner,
      loser: players.loser,
      p1Answer:p1Answer.answer,
      p2Answer:p2Answer.answer,
      correctAnswer:match.correctAnswer,
      message: `Результат матча: winner:${players.winner}, loser:${players.loser}, p1Answer:${p1Answer.answer}, p2Answer:${p2Answer.answer}, correctAnswer: ${match.correctAnswer}`
    }


    this.eventEmitter.emit('match.ended', matchResult);

    await this.redisService.deleteMatchInfo(matchId, matchResult.p1, matchResult.p2);
    return;
  }

}
