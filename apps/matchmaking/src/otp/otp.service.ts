import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { generateOtpASITEmail } from './dto/generate-otp-a-s-i-t-email.dto';
import { VerifyOtpResetToken } from './dto/verify-otp-reset-token.dto';
import { VerifyResetToken } from './dto/verify-reset-token.dto';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OtpService {
  constructor(
    private readonly redisService: RedisService,
    private readonly emailService: EmailService
  ){}
  async generateOtpAndSendItToEmail(dto: generateOtpASITEmail){
    try{
      const isExists = await this.redisService.exists(dto.identifier, dto.otpName);
      if(isExists){
        throw new ConflictException("Код уже был выслан вам на почту. Дождитесь окончания срока действия кода.");
      }
  
      const otp = this.redisService.generateOtp();
      this.redisService.saveOtp(dto.identifier, dto.otpName, otp);
      console.log(`generateOtpASITEmail log - ${dto}`);
      const isSent = await this.emailService.sendMessageToEmail({
        to:dto.to, message: `${otp} - ${dto.message}`,
        username: dto.username, subject: dto.subject
      })
      if(!isSent){
        await this.redisService.deleteOtp(dto.identifier, dto.otpName);
        throw new InternalServerErrorException("Произошла ошибка отправки кода на почту");
      }
      return {
        message: "Одноразовый код был успешно отправлен на почту"
      }
   }
   catch(error){
    console.error('💥 Critical error in generateOtpAndSendItToEmail:', {
      message: error.message,
    });
    return {
      message: error.message
    }
   }
  }
  
    async verifyOtpAndGenResetToken(dto:VerifyOtpResetToken){
      try{
        const isValid = await this.redisService.verifyAndConsumeOtp(dto.identifier, dto.otpName, dto.otp);
        if(!isValid){
          console.log("Неправильный otp");
          throw new BadRequestException("Вы ввели неправильный одноразовый код, попробуйте ещё раз");
        }
  
        const resetToken : string = uuidv4();
        await this.redisService.saveResetToken(dto.identifier, dto.resetTokenName, resetToken);
        return {
          message: `Вы ввели правильный одноразовый код. Вы можете сменить ${dto.otpName == "passwordOtp" ? "пароль" : "email"} в течение 15 минут`,
          resetToken: resetToken
        }
      }
      catch(error){
        return {
          message:error.message
        }
      }
    }
  
    async verifyResetToken(dto:VerifyResetToken): Promise<boolean>{
      try{
        const isValid = await this.redisService.verifyAndConsumeResetToken(dto.identifier, dto.resetTokenName, dto.resetToken);
        if(!isValid){
          throw new BadRequestException("Ошибка. Неправильный resetToken");
        }
  
        return true;
      }
      catch(error){
        return false;
      }
    }
}
