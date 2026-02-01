import { IsNotEmpty, IsString } from "class-validator";

export class verifyOtpResetPassword{
    @IsString()
    @IsNotEmpty()
    identifier: string

    @IsString()
    @IsNotEmpty()
    otp:string

    @IsString()
    @IsNotEmpty()
    otpName: string
}