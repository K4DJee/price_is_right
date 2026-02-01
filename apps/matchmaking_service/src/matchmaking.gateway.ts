import { JwtService } from '@nestjs/jwt';
import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
      },
      transports: ['websocket', 'polling'],
})
export class MatchmakingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(private readonly jwtService: JwtService){}

    @WebSocketServer()
    server: Server

    handleConnection(client: Socket) {
        console.log("Клиент присоединился: " + client.id);
        console.log("Время подключения: " + Date.now());
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
        client.data.userId = payload.sub
        client.join(`user:${payload.sub}`);
        console.log("Клиент присоединился: " + client.id);
    }
    
    handleDisconnect(client: Socket) {
    console.log("Клиент отключился: " + client.id);
    }

    @SubscribeMessage('answer.submit')
    async checkAnswer(){
        //Вызов submitAnswerMatchmaking
    }

    


    


}