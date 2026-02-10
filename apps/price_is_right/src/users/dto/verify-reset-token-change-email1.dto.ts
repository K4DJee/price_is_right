import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class VerifyResetTokenChangeEmail1Dto{
    @ApiProperty({description: "Электронная почта пользователя", example:"example@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({description: "Токен, предназначенный для смены пароля, либо почты", example:"2e4e0707-1c09-42a4-8e17-08b2203283af"})
    @IsString()
    @IsNotEmpty()
    resetToken: string

    @ApiProperty({description: "Новая электронная почта пользователя", example:"newexample@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    newEmail: string
}