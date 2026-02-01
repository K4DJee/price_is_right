import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class VerifyOtpResetToken{
    @IsString()
    @IsNotEmpty()
    identifier: string

    @IsString()
    @IsNotEmpty()
    otp: string
    
    @IsString()
    @IsNotEmpty()
    otpName: string

    @IsString()
    @IsNotEmpty()
    resetTokenName: string
}