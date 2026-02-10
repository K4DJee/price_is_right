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
import { MatchmakingService } from './matchmaking.service';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { IJwtPayload } from './interfaces/user.interface';

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
    private readonly matchmakingService: MatchmakingService,
  ) {}

  @WebSocketServer()
  server!: Server;

  async handleConnection(client: Socket) {
    try {
      console.log('Клиент присоединился: ' + client.id);
      const authHeader = client.handshake.headers['authorization'];

      if (!authHeader || Array.isArray(authHeader)) {
        client.emit('error', {message:"Token absent"});
        setTimeout(()=>client.disconnect(true), 100);
        return;
      }

      const [, token] = authHeader.split(' ');

      if (!token) {
        client.emit('error', {message:"Invalid token"});
        setTimeout(()=>client.disconnect(true), 100);
        return;
      }

      const payload: IJwtPayload = this.jwtService.verify(token);

      const user = await this.matchmakingService.getUserFromDB(payload.sub);
      if (!user) {
        client.emit('error', {message:"User not found"});
        setTimeout(()=>client.disconnect(true), 100);
        return;
      }

      client.data.user = user;
      client.data.userId = payload.sub;
      (client as any).isAuthorized = true;
      client.emit('auth.success');
      client.join(`user:${payload.sub}`);
      console.log('Клиент присоединился: ' + client.id);
    } catch (error) {
        console.error('WebSocket connection error:', error);
        client.emit('error', {message:"User not found"});
        setTimeout(()=>client.disconnect(true), 100);
    }
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

  @SubscribeMessage('matchmaking.join')
  async handleMatchmakingJoin(@ConnectedSocket() client: Socket) {
    const user = client.data.user;
    console.log('user: ', user);
    await this.matchmakingService.addPlayer(user);
  }

  @OnEvent('match.started')
  async handleMatchStart(payload) {
    this.server
      .to([`user:${payload.p1}`, `user:${payload.p2}`])
      .emit('match.started', {
        matchId: payload.matchId,
        question: payload.question,
      });
  }

  @OnEvent('question.answered')
  async handleQuestionAnswered(payload) {
    console.log('question.answered');
    this.server
      .to([`user:${payload.player}`])
      .emit('question.answered', {
        matchId: payload.matchId,
        message: payload.message,
      });
  }

  @OnEvent('match.ended')
  async handleMatchEnded(payload) {
    this.server
      .to([`user:${payload.p1}`, `user:${payload.p2}`])
      .emit('match.ended', { matchId: payload.matchId, payload });

    const user1Socket = await this.getUserSocket(`user:${payload.p1}`);
    const user2Socket = await this.getUserSocket(`user:${payload.p2}`);

    if (user1Socket) user1Socket.disconnect(true);
    if (user2Socket) user2Socket.disconnect(true);
  }

  private async getUserSocket(userId: string): Promise<any> {
    const sockets = await this.server.in(userId).fetchSockets();
    return sockets[0];
  }
}
