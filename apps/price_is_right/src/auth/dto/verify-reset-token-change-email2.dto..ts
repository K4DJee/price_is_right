import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class VerifyResetTokenChangeEmail2Dto{
    @ApiProperty({description: "ID пользователя", example:"1"})
    @IsString()
    @IsNotEmpty()
    identifier: string

    @ApiProperty({description: "Токен, предназначенный для смены пароля, либо почты", example:"2e4e0707-1c09-42a4-8e17-08b2203283af"})
    @IsString()
    @IsNotEmpty()
    resetToken: string

    @ApiProperty({description: "Новая электронная почта пользователя", example:"newexample@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    newEmail: string

    @ApiProperty({description: "Эта переменная может иметь только такие значения: passwordResetToken и emailResetToken", example:"emailResetToken"})
    @IsString()
    @IsNotEmpty()
    resetTokenName : string
}