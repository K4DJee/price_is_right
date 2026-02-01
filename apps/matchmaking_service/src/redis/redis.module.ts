import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';

const redisClient = createClient({
  // url:'redis://localhost:6379' or redis://redis:6379
  url:process.env.REDIS_URL
});

redisClient.on('error', (err)=>{
  console.error('Redis Client Error: ', err);
});

redisClient.connect();


@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useValue: redisClient
    },
    RedisService,
  ],
  exports:[
    'REDIS_CLIENT', RedisService
  ]
})
export class RedisModule {}
