import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { Request } from 'express';
import { equal } from 'assert';
import { FindUserByEmailDto } from './dto/find-user-by-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { VerifyResetTokenChangePass1Dto } from './dto/verify-reset-token-change-pass1.dto';
import { VerifyResetTokenChangeEmail1Dto } from './dto/verify-reset-token-change-email1.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GoogleOAuthGuard } from './guards/google-oauth-guard.guard';
import { IUserRequest } from './interfaces/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({summary: "Регистрация пользователя", description: "Регистрирует пользователя в БД"})
  @Post('/register')
  async register(@Body() dto:RegisterDto){
    return await this.authService.register(dto);
  }

  @ApiOperation({summary: "Вход в аккаунт", description: "Пользователь заходит в свой аккаунт"})
  @Post('/login')
  async login(@Body() dto:LoginDto){
    return await this.authService.login(dto);
  }

  @UseGuards(GoogleOAuthGuard)
  @Get('/google')
  async googleAuth(){
    
  }

  @UseGuards(GoogleOAuthGuard)
  @Get('/google/callback')
  async googleAuthCallback(@Req() req:Request){
    const user = req.user as any;
    return this.authService.validateOAuthLogin(user);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({summary: "Получение данных пользователя", description: "Получение данных пользователя, которые могут быть отображены в клиентской части"})
  @UseGuards(AuthGuard)
  @Get('/user-data')
  async userData(@Req() req: Request){
    const user = req.user as IUserRequest;
    return {
      message: "Данные пользователя",
      user: user
    };
  }
  
  // @Post('/reset-password-stage-0')
  // async resetPassword(@Req() req: Request){
  //   const user = req.user!;
  //   const dto = {
  //     identifier: user['id'], to: user['email'],
  //     message: "password reset code",
  //     username: user['firstName'],
  //     subject: "Reset password"
  //   }
  //   return await this.authService.generateOtp(dto);
  // }

  @ApiOperation({summary: "1 этап сброса пароля", description: "Генерация одноразового кода и отправка его на почту пользователя"})
  @Post('/reset-password-stage-1')
  async resetPasswordStage1(@Body() dto:FindUserByEmailDto){
    const user = await this.authService.findUserByEmail(dto);
    const otpDto = {
      identifier: user.id.toString(), to: user.email,
      message: "password reset code",
      username: user.nickname,
      subject: "Reset password",
      otpName: "passwordOtp"
    }
    return await this.authService.generateOtp(otpDto);
  }

  @ApiOperation({summary: "2 этап сброса пароля", description: "Верификация полученного одноразового кода, генерация resetToken'а"})
  @Post('/reset-password-stage-2')
  async resetPasswordStage2(@Body() dto:VerifyOtpDto){
    const user = await this.authService.findUserByEmail(dto);
    const verifyOtpDto = {
      identifier: user.id.toString(),
      otp: dto.otp,
      otpName: "passwordOtp"
    }

    return await this.authService.verifyOtpAndGenResetToken(verifyOtpDto);
  }

  @ApiOperation({summary: "3 этап сброса пароля", description: "Верификация полученного resetToken'а, изменение пароля пользователя"})
  @Post('/reset-password-stage-3')
  async resetPasswordStage3(@Body() dto: VerifyResetTokenChangePass1Dto){
   const user = await this.authService.findUserByEmail(dto);
   const verifyResetTokenChangePassDto = {
    identifier: user.id.toString(),
    resetToken: dto.resetToken,
    newPassword: dto.newPassword,
    resetTokenName: "passwordResetToken"
   }

   return await this.authService.verifyResetTokenAndChangeUserPassword(verifyResetTokenChangePassDto);
  }

  @ApiOperation({summary: "1 этап изменения почты", description: "Генерация одноразового кода и отправка его на почту пользователя"})
  @Post('/reset-email-stage-1')
  async resetEmailStage1(@Body() dto:FindUserByEmailDto){
    const user = await this.authService.findUserByEmail(dto);
    const otpDto = {
      identifier: user.id.toString(), to: user.email,
      message: "change email reset code",
      username: user.nickname,
      subject: "Change email",
      otpName: "emailOtp"

    }
    return await this.authService.generateOtp(otpDto);
  }

  @ApiOperation({summary: "2 этап изменения почты", description: "Верификация полученного одноразового кода, генерация resetToken'а"})
  @Post('/reset-email-stage-2')
  async resetEmailStage2(@Body() dto:VerifyOtpDto){
    const user = await this.authService.findUserByEmail(dto);
    const verifyOtpDto = {
      identifier: user.id.toString(),
      otp: dto.otp,
      otpName: "emailOtp"
    }

    return await this.authService.verifyOtpAndGenResetToken(verifyOtpDto);
  }

  @ApiOperation({summary: "3 этап изменения почты", description: "Верификация полученного resetToken'а, изменение почты пользователя"})
  @Post('/reset-email-stage-3')
  async resetEmailStage3(@Body() dto:VerifyResetTokenChangeEmail1Dto){
    const user = await this.authService.findUserByEmail(dto);
    const verifyResetTokenChangeEmailDto = {
      identifier: user.id.toString(),
      resetToken: dto.resetToken,
      newEmail: dto.newEmail,
      resetTokenName: "emailResetToken"
     }
  
     return await this.authService.verifyResetTokenAndChangeUserEmail(verifyResetTokenChangeEmailDto);
  }
    
}
