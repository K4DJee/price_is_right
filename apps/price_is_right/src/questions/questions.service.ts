import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class QuestionsService {
  constructor(
    private readonly dbService: DatabaseService
  ){}
  async getRandomQuestion(){
    const question = await this.dbService.$queryRaw<{id: number; text: string; correctAnswer: number}>`
      SELECT id, text, "correctAnswer" FROM questions
      ORDER BY RANDOM()
      LIMIT 1;
    `;

    return question[0];
  }
}
