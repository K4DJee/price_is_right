import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class generateOtpASITEmail{
    @IsString()
    identifier: string

    @IsEmail()
    @IsNotEmpty()
    to: string

    @IsString()
    @IsNotEmpty()
    message: string

    @IsString()
    @IsNotEmpty()
    username: string

    @IsString()
    @IsNotEmpty()
    subject: string

    @IsString()
    @IsNotEmpty()
    otpName: string
}