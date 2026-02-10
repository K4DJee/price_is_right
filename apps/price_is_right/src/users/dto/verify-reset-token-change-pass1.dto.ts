import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class VerifyResetTokenChangePass1Dto{
    @ApiProperty({description: "Электронная почта пользователя", example:"example@gmail.com"})
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({description: "Токен, предназначенный для смены пароля, либо почты", example:"2e4e0707-1c09-42a4-8e17-08b2203283af"})
    @IsString()
    @IsNotEmpty()
    resetToken: string

    @ApiProperty({description: "Новый пароль пользователя", example:"312312sdDSA_21312sada"})
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword: string
}