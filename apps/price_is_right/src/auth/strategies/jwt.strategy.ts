import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { DatabaseService } from "../../database/database.service";
import { jwtConstants } from "../constants";
import { PassportStrategy } from "@nestjs/passport";
import { IJwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly dbService: DatabaseService){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtConstants.secret 
        });
    }

    async validate(payload: IJwtPayload) {
        const user = await this.dbService.user.findUnique({
            where: {id:payload.sub},
            select:{
                id: true,
                email: true,
                nickname: true,
            }
        });
    
        if(!user){
            throw new UnauthorizedException('Пользователь не найден');
        }

        return {
            id: user.id,
            email: user.email,
            nickname: true,
        }

    }

}