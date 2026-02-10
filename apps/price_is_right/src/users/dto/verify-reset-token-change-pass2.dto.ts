import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, MinLength } from "class-validator"

export class VerifyResetTokenChangePass2Dto{
    @ApiProperty({description: "ID пользователя", example:"1"})
    @IsString()
    @IsNotEmpty()
    identifier: string

    @ApiProperty({description: "Токен, предназначенный для смены пароля, либо почты", example:"2e4e0707-1c09-42a4-8e17-08b2203283af"})
    @IsString()
    @IsNotEmpty()
    resetToken: string

    @ApiProperty({description: "Новый пароль пользователя", example:"312312sdDSA_21312sada"})
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    newPassword: string

    @ApiProperty({description: "Эта переменная может иметь только такие значения: passwordResetToken и emailResetToken", example:"emailResetToken"})
    @IsString()
    @IsNotEmpty()
    resetTokenName: string
}