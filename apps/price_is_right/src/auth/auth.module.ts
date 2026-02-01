import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {PassportModule } from '@nestjs/passport';
import { AuthGuard } from './guards/auth.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './strategies/jwt.strategy';
import { DatabaseModule } from '../database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleOAuthGuard } from './guards/google-oauth-guard.guard';
import { ConfigService } from '@nestjs/config';

const natsServers = process.env.NATS_SERVER_URL 
  ? [process.env.NATS_SERVER_URL] 
  : ['nats://localhost:4222'];//nats://localhost:4222

@Module({
  imports: [
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService)=>({
        secret: configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: configService.getOrThrow<number>('ACCESS_TOKEN_EXPIRY'),
        },
      }),
      inject: [ConfigService]
    }),
    // ClientsModule.register([
    //   {
    //     name: 'MICROSERVICE_CLIENT',
    //     transport: Transport.TCP,
    //     options:{
    //       host:'localhost',
    //       port: 4000
    //     }
    //   }
    // ])
    ClientsModule.register([
      {
        name: 'MICROSERVICE_CLIENT',
        transport: Transport.NATS,
        options:{
          servers:natsServers
        }
      }
    ])
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    AuthGuard,
    GoogleStrategy,
    GoogleOAuthGuard
  ],
  exports:[
    AuthService,
    JwtStrategy,
    PassportModule,
    AuthGuard,
    JwtModule
  ]
})
export class AuthModule {}
