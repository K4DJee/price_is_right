import { Inject, Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { addingInMatchmakingQueue } from '../dto/adding-in-matchmaking-queue.dto';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { AnswerData, MatchData } from '../interfaces/match.interface';

@Injectable()
export class RedisService {
    constructor(
        @Inject('REDIS_CLIENT') private redis: ReturnType<typeof createClient>,
    ){}
    //otp logic
    generateOtp(): string{
        return Math.floor(100000 + Math.random() * 90000).toString();
    }

    async saveOtp(identifier: string, otpName: string, otp: string, ttlSeconds = 300): Promise<void>{
        const key = `${otpName}:${identifier}`;
        await this.redis.set(key, otp, {EX: ttlSeconds});//Сохранение OTP с автоматическим удалением, ttl - 5 мин
    }

    async verifyAndConsumeOtp(identifier: string, otpName: string,  otp: string): Promise<boolean>{
        const key = `${otpName}:${identifier}`;
        const storedOtp = await this.redis.get(key);

        if(storedOtp === otp){
            await this.redis.del(key);//Удаление otp
            return true;
        }

        return false;
    }

    async exists(identifier: string, otpName: string): Promise<boolean>{
        const key = `${otpName}:${identifier}`;
        return (await this.redis.exists(key)) === 1;
    }

    async saveResetToken(identifier: string, resetTokenName: string, resetToken: string, ttlSeconds = 900): Promise<void>{
        const key = `${resetTokenName}:${identifier}`;
        await this.redis.set(key, resetToken, {EX: ttlSeconds});
    }

    async verifyAndConsumeResetToken(identifier: string, resetTokenName: string, resetToken: string): Promise<boolean>{
        const key = `${resetTokenName}:${identifier}`;
        const storedResetToken = await this.redis.get(key);
        if(storedResetToken == resetToken){
            await this.redis.del(key);
            return true;
        }

        return false;
    }

    async deleteOtp(identifier: string, otpName: string){
        const key = `${otpName}:${identifier}`;
        await this.redis.del(key);
    }

    //matchmaking logic
    async addPlayerToQueue(userId: string){
        const result = await this.redis.eval(
            `
            -- пытаемся добавить пользователя в set
            local added = redis.call('SADD', 'matchmaking:players', ARGV[1])
    
            -- если пользователь уже есть, ничего не делаем
            if added == 0 then
                return 0
            end
    
            -- добавляем в очередь
            redis.call('LPUSH', 'matchmaking_queue', ARGV[1])
    
            -- ставим ttl (например, защита от залипших игроков)
            redis.call('SET', 'mm:player:' .. ARGV[1], '1', 'EX', 900)
    
            return 1
            `,
            {
                keys: [],
                arguments: [userId],
            }
        );
    
        return result === 1;
    }

    async popTwoPlayers():Promise<[string, string] | null>{
        return await this.redis.eval(
            `
            local p1 = redis.call('RPOP', 'matchmaking_queue')
            local p2 = redis.call('RPOP', 'matchmaking_queue')
    
            if p1 and p2 then
                redis.call('SREM', 'matchmaking:players', p1)
                redis.call('SREM', 'matchmaking:players', p2)
                return {p1, p2}
            end
    
            if p1 then
                redis.call('LPUSH', 'matchmaking_queue', p1)
            end
    
            return nil
            `,
            {
                keys: [],
                arguments: [],
            }
        ) as [string, string] | null;
    }

    async saveMatch(matchId: string, data: Record<string, string>){
        await this.redis.hSet(`match:${matchId}`, data);
        await this.redis.expire(`match:${matchId}`, 600);//10 minutes
    }

    async getMatchInfo(matchId: string): Promise<MatchData | null>{
        const hashData =  await this.redis.hGetAll(`match:${matchId}`);
        if (Object.keys(hashData).length === 0) {
            return null; //
        }

        return {
            matchId,
            p1: hashData.p1,
            p2: hashData.p2,
            questionText: hashData.questionText,
            correctAnswer: parseFloat(hashData.answer),
            status: hashData.status
        }
    }

    async savePlayerAnswer(matchId: string, answerData: AnswerData){
        await this.redis.hSet(`match:${matchId}:answer:${answerData.userId}`,
           {
            userId: answerData.userId,
            answer: answerData.answer,
            isCorrect: String(answerData.isCorrect),
           }        
        );
        await this.redis.expire(`match:${matchId}:answer:${answerData.userId}`, 600);
    }

    async checkOtherPlayerAnswered(matchId: string, otherPlayerId: string){
        return await this.redis.exists(`match:${matchId}:answer:${otherPlayerId}`)
    }

    async getPlayerAnswer(matchId: string, userId: string){
        const hashData =  await this.redis.hGetAll(`match:${matchId}:answer:${userId}`);

        return {
            userId,
            answer: parseInt(hashData.answer),
            isCorrect: Boolean(hashData.isCorrect)
        }
    }

    async deleteMatchInfo(matchId: string, p1: string, p2: string){
        await this.redis.del(`match:${matchId}`);
        await this.redis.del(`match:${matchId}:answer:${p1}`);
        await this.redis.del(`match:${matchId}:answer:${p2}`);
    }

        
}
