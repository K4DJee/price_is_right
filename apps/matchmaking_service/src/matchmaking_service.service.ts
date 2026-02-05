import { Inject, Injectable } from '@nestjs/common';
import { addingInMatchmakingQueue } from './dto/adding-in-matchmaking-queue.dto';
import { RedisService } from './redis/redis.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';
import { IQuestion } from './interfaces/question.interface';
import { AnswerData, MatchData, MatchDataToDB, MatchResult } from './interfaces/match.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MatchmakingServiceService {
    constructor(
      private readonly redisService: RedisService,
      // private readonly gateway: MatchmakingGateway,
      private eventEmitter: EventEmitter2,
      @Inject('CORE_SERVICE') private readonly coreClient: ClientProxy
    ){}


  async getRandomQuestion(){
    const question = await firstValueFrom(
      this.coreClient.send('random_question', {}),
    );
    return question as IQuestion;
  }

  async createMatchInDB(match: MatchDataToDB){
    await firstValueFrom(
      this.coreClient.send('create_match', match),
    );
  }

  determineWinnerAndLoser(p1Answer: AnswerData, p2Answer: AnswerData): {winner: string, loser: string}{
    let winner: string, loser: string;
    if(p1Answer.isCorrect){
      winner = p1Answer.userId
      loser = p2Answer.userId
    }
    else if(!p1Answer.isCorrect && !p2Answer.isCorrect ){
      loser = `${p1Answer.userId} and ${p2Answer.userId}`;
      winner = "no one";
    }
    else{
      winner = p1Answer.userId
      loser = p2Answer.userId
    }
    
    return {
      winner, loser
    }
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
      answer: String(question.correctAnswer),
      status: 'waiting_answers'
    });
    
    const MatchDataToDB: MatchDataToDB = {
      id: matchId,
      users: [p1,p2]
    }

    //Сохранение в бд, отправка запроса на coreClient
    await this.createMatchInDB(MatchDataToDB);

    const match = {
      matchId,
      p1, p2,
      question
    }
    
    this.eventEmitter.emit('match.started', match);
    // this.gateway.server
    //   .to([`user:${p1}`, `user:${p2}`])
    //   .emit('match.start', {matchId, question})
  }

  //submitAnswer
  async submitAnswer(matchId: string, userId: string, answer: number){
    const match: any = await this.redisService.getMatchInfo(matchId);
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
      isCorrect: answer != parseInt(match.correctAnswer) ? false : true,
    }

    console.log(parseInt(match.correctAnswer));

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
      // this.gateway.server
      // .to([`user:${match.p1}`])
      // .emit('question.answered', {matchId, message:"You answered the question first."});
      return;
    }

    return await this.finalizeMatch(match.matchId);

  }

  //finalizeMatch
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

    // let winner, loser;
    const players = this.determineWinnerAndLoser(p1Answer, p2Answer);
    
    //запрос к бд

    const matchResult: MatchResult = {
      p1: match.p1,
      p2: match.p2,
      matchId,
      winner: players.winner,
      loser: players.loser,
      p1Answer:p1Answer.answer,
      p2Answer:p2Answer.answer,
      correctAnswer:parseInt(match.correctAnswer),
      message: `Результат матча: winner:${players.winner}, loser:${players.loser}, p1Answer:${p1Answer.answer}, p2Answer:${p2Answer.answer}, correctAnswer: ${match.correctAnswer}`
    }


    this.eventEmitter.emit('match.ended', matchResult);

    //удаление из redis
    await this.redisService.deleteMatchInfo(matchId, matchResult.p1, matchResult.p2);
    return;
  }

}
