import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { MatchmakingService } from './matchmaking.service';
import type{ Request } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { IUserRequest } from '../auth/interfaces/user.interface';


@Controller('matchmaking')
export class MatchmakingController {
  constructor(private readonly matchmakingService: MatchmakingService) {}
//user: id, nickname, score
  @UseGuards(AuthGuard)
  @Post('join')
  async joinMatchmaking(@Req() req: Request){
    const user = req.user as IUserRequest;
    return await this.matchmakingService.joinMatchmaking(user);
  }

  @Post('leave')
  async leaveFromMatchmaking(){
    
  }

  // async surrenderInMatchmaking
}
