import { NestFactory } from '@nestjs/core';
import { MatchmakingServiceModule } from './matchmaking_service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import path, { resolve } from 'path';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config({ path: resolve(__dirname, '..', '..', '..', '.env') });

  const natsServers = process.env.NATS_SERVER_URL 
  ? [process.env.NATS_SERVER_URL] 
  : ['nats://nats:4222'];//nats://localhost:4222

  const app = await NestFactory.create(MatchmakingServiceModule);

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: natsServers
      },
    },
  );

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
