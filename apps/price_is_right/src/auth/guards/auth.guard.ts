import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { jwtConstants } from "../constants";
import { DatabaseService } from "../../database/database.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly dbService: DatabaseService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ){}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest() as Request;
        const authHeader =  request.headers['authorization'];

        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException("Вы должны быть авторизованы");
        }

        const token = authHeader.substring(7);//Убираем Bearer 
        //Верификация access token
        try{
          
        
      const veryfyPayload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET'),
        ignoreExpiration: false
      });

      const user = await this.dbService.user.findUnique({
        where:{id: veryfyPayload.sub},
        select:{
          id: true,
          googleId: true,
          nickname: true,
          email:true,
          score: true,
          updatedAt: true,
          createdAt: true,
        }
      });

      if(!user){
        throw new UnauthorizedException("Пользователь не найден");
      }

        request['user'] = user;
        return true;
    }
    catch(error){
      if(error.name === 'JsonWebTokenError'){
        throw new UnauthorizedException("Невалидный токен");
      }
      else if(error.name === "TokenExpiredError"){
        throw new UnauthorizedException("Срок действия токена истёк");
      }
      else if(error instanceof UnauthorizedException){
        throw error;
      }

      throw new UnauthorizedException("Ошибка авторизации");
    }
    }
}