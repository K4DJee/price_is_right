import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";

@Injectable()
export class RolesGuards implements CanActivate{
    canActivate(context: ExecutionContext): boolean{
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        if(!user){
            throw new UnauthorizedException("Пользователь не авторизован")
        }

       
        return true;
    }
}