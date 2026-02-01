import { Inject, Injectable } from '@nestjs/common';
import { IUserRequest } from '../auth/interfaces/user.interface';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MatchmakingService {
  constructor(
    @Inject('MICROSERVICE_CLIENT') private readonly microserviceClient: ClientProxy,
  ){}
  async joinMatchmaking(user: IUserRequest){
    try {
      const response = await this.microserviceClient
        .send({cmd:'adding-in-matchmaking-queue'}, user)
        .toPromise();
      
      console.log('Microservice response:', response);//del
      return response;
    } catch (error) {
      console.error('Microservice error:', error);
      return error;
    }


  }
}
