import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MatchmakingServiceService } from './matchmaking_service.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class MatchmakingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly matchmakingService: MatchmakingServiceService,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log('Клиент присоединился: ' + client.id);
    console.log('Время подключения: ' + Date.now());
    const authHeader = client.handshake.headers['authorization'];

    if (!authHeader || Array.isArray(authHeader)) {
      client.disconnect();
      return;
    }

    const [, token] = authHeader.split(' ');

    if (!token) {
      client.disconnect();
      return;
    }

    const payload = this.jwtService.verify(token);
    client.data.userId = payload.sub;
    client.join(`user:${payload.sub}`);
    console.log('Клиент присоединился: ' + client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('Клиент отключился: ' + client.id);
  }

  @SubscribeMessage('answer.submit')
  async handleAnswerSubmit(
    @MessageBody() data: { matchId: string; answer: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const answer = Number(data.answer);
    console.log(`User ${userId} submitted answer:`, answer);
    await this.matchmakingService.submitAnswer(data.matchId, userId, answer);
  }

  @OnEvent("match.started")
  async handleMatchStart(payload) {
    this.server
  .to([`user:${payload.p1}`, `user:${payload.p2}`])
  .emit('match.started', {matchId: payload.matchId, question: payload.question})

  }

  @OnEvent("question.answered")  
  async handleQuestionAnswered(payload) {
    console.log("question.answered");
    this.server
    .to([`user:${payload.player}`])
    .emit('question.answered', {matchId: payload.matchId, message:payload.message});
  }

  @OnEvent("match.ended")
  async handleMatchEnded(payload) {
    this.server
    .to([`user:${payload.p1}`, `user:${payload.p2}`])
    .emit('match.ended', {matchId:payload.matchId, payload})
  }
}
