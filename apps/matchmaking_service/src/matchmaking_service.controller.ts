import { Controller, Get } from '@nestjs/common';
import { MatchmakingServiceService } from './matchmaking_service.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { addingInMatchmakingQueue } from './dto/adding-in-matchmaking-queue.dto';
import { OtpService } from './otp/otp.service';
import { generateOtpASITEmail } from './otp/dto/generate-otp-a-s-i-t-email.dto';
import { VerifyOtpResetToken } from './otp/dto/verify-otp-reset-token.dto';
import { VerifyResetToken } from './otp/dto/verify-reset-token.dto';

@Controller()
export class MatchmakingServiceController {
  constructor(
    private readonly matchmakingServiceService: MatchmakingServiceService,
    private readonly otpService: OtpService
  ) {}

  @MessagePattern({cmd:'adding-in-matchmaking-queue'})
  async handleAddingInMatchmakingQueue(@Payload() dto:addingInMatchmakingQueue) {
    return await this.matchmakingServiceService.addPlayer(dto);
  }

  @MessagePattern({cmd:'generate-otp'})
  async handleGenerateOtpAndSendItToEmail(@Payload() dto:generateOtpASITEmail) {
    return await this.otpService.generateOtpAndSendItToEmail(dto);
  }

  @MessagePattern({cmd: 'verify-otp'})
  async verifyOtp(@Payload() dto:VerifyOtpResetToken){
    return await this.otpService.verifyOtpAndGenResetToken(dto);
  }

  @MessagePattern({cmd: 'verify-reset-token'})
  async verifyResetToken(@Payload() dto: VerifyResetToken){
      return await this.otpService.verifyResetToken(dto);
  }
}
