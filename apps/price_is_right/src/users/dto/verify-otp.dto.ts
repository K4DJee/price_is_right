import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class VerifyOtpDto{
    @ApiProperty({description: "Электронная почта пользователя", example:"example@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({description: "Одноразовый код", example:"231412"})
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    otp: string
}